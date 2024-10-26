import {Args, Command, Flags} from '@oclif/core'
import fs from 'fs/promises'
import path from 'path'
import mime from 'mime-types'
import assert from 'assert'

import {common as common_flags} from '../flags.js'
import Config from '../config.js'
import KeClient from '../client.js'
import {check_cwd, check_insecure} from '../common.js'
import {DIRECTORY_TYPE, TEXT_TYPE} from '../const.js'


type PutOptions = {
  recursive?: boolean
  overwrite?: boolean
  verbose?: boolean
}

type SourceDesc = {
  type: 'dir' | 'file'
  path: string
  name: string
  ext: string
}

type Resp = KeClient.ObjectResponse

export default class Put extends Command {
  static override args = {
    source: Args.string({description: 'source file or directory', required: true}),
  }
  static strict = false

  static override description = 'put files or directories to Kompira server'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    ...common_flags,
    dest: Flags.string({char: 'd', description: 'specify destination object or directory (create if none exists)'}),
    // flag with a value (-c, --cwd=VALUE)
    cwd: Flags.string({char: 'c', description: 'set current working directory to VALUE'}),
    recursive: Flags.boolean({char: 'r', description: 'put directories recursively'}),
    overwrite: Flags.boolean({char: 'o', description: 'overwrite an existing object'}),
    verbose: Flags.boolean({char: 'v', description: 'explain what is being down'}),
  }

  public async run(): Promise<void> {
    const {argv, flags} = await this.parse(Put)
    const config = new Config(flags)
  
    check_insecure(flags.insecure)
    let cwd = await check_cwd(config, flags.cwd)
    let dest = path.normalize(path.join(cwd, flags.dest || ''))
    let sources = await this.check_sources(argv as string[], path.resolve('.'))
    let target: KeClient.ObjectResponse | string | null = await KeClient.get(config, dest)
  
    if (argv.length == 1) {
      let source = sources[0]
      if (!target) {
	({dir: dest, base: target} = path.parse(dest))
      } else if (target.type_object == DIRECTORY_TYPE) {
	target = await KeClient.get(config, path.join(target.abspath, source.name)) || source.name
      } else {
	dest = path.dirname(dest)
      }
      await this.do_put(config, dest, source, target, flags)
    } else {
      if (target == null) {
	// target が存在しない場合はコピーできない
	throw Error(`target '${dest}' is not found`)
      } else if (target!.type_object != DIRECTORY_TYPE) {
	// コピー先がディレクトリ以外の場合はコピーできない
	throw Error(`target '${dest}' is not a directory`)
      }
      // dest 配下にsources をコピー
      for (const source of sources) {
	await this.do_put(config, dest, source, source.name, flags)
      }
    }
  }

  private async check_sources(sources: string[], cwd: string): Promise<SourceDesc[]> {
    let source_descs: SourceDesc[] = []
    for (let source of sources) {
      source = path.normalize(path.join(cwd, source))
      try {
	const stat = await fs.stat(source)
	const {name, ext} = path.parse(source)
	if (stat.isDirectory()) {
	  source_descs.push({type: 'dir', path: source, name: name, ext: ext})
	} else if (stat.isFile()) {
	  source_descs.push({type: 'file', path: source, name: name, ext: ext})
	} else {
	  this.log(`put: invalid source '${source} type: should be file or directory`)
	}
      } catch (err) {
	if (err instanceof Error) {
	  this.log(`put: cannot stat '${source}': ${err.message}`)
	} else {
	  this.log(`put: cannot stat '${source}': Unknown error`)
	}
      }
    }
    return source_descs
  }

  private async do_put(config: Config, dest: string, source: SourceDesc, target: KeClient.ObjectResponse | string, options: PutOptions) {
    let dest_dir = null
    if (target instanceof Object) {
      if (target.type_object == DIRECTORY_TYPE && source.type == 'dir') {
	dest_dir = target.abspath
      } else if (target.type_object == TEXT_TYPE && source.type == 'file') {
	if (options.overwrite) {
	  let text = await fs.readFile(source.path, { encoding: 'utf8' })
	  let data = {
	    'fields': {
	      'text': text,
	      'ext': source.ext.replace(/^\.+/, ''),
	      'contentType': mime.lookup(source.path)
	    }
	  }
	  let result = await KeClient.update(config, target.abspath, data)
	  if (options.verbose) {
	    this.log(`updated text: ${result.abspath}`)
	  }
	}
      } else {
	this.log(`put: cannot overwrite ${target.abspath}: type '${target.type_object}' mismatch`)
	return
      }
    } else if (source.type == 'dir') {
      let data = {
	'type_object': DIRECTORY_TYPE,
	'name': target as string,
      }
      let result = await KeClient.create(config, dest, data)
      if (options.verbose) {
	this.log(`created directory: ${result.abspath}`)
      }
      dest_dir = result.abspath
    } else if (source.type == 'file') {
      let text = await fs.readFile(source.path, { encoding: 'utf8' })
      let data = {
	'type_object': TEXT_TYPE,
	'name': target as string,
	'fields': {
	  'text': text,
	  'ext': source.ext.replace(/^\.+/, ''),
	  'contentType': mime.lookup(source.path)
	}
      }
      let result = await KeClient.create(config, dest, data)
      if (options.verbose) {
	this.log(`created text: ${result.abspath}`)
      }
    } else {
      assert(false, `invalid source.type: ${source.type}`)
    }

    if (options.recursive && dest_dir) {
      // ファイル一覧を取得
      let dirs = await fs.readdir(source.path)
      let sources = await this.check_sources(dirs, source.path)
      for (const source of sources) {
	target = await KeClient.get(config, path.join(dest_dir, source.name)) || source.name
	await this.do_put(config, dest_dir, source, target, options)
      }
    }
  }
}
