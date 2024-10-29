import {Args, Command, Flags} from '@oclif/core'
import {lookup as mimeLookup} from 'mime-types'
import assert from 'node:assert'
import fs from 'node:fs/promises'
import path from 'node:path'

import * as KeClient from '../client.js'
import {checkCwd, checkInsecure} from '../common.js'
import Config from '../config.js'
import {DIRECTORY_TYPE, TEXT_TYPE} from '../const.js'
import {common as commonFlags} from '../flags.js'


type PutOptions = {
  overwrite?: boolean
  recursive?: boolean
  verbose?: boolean
}

type SourceDesc = {
  ext: string
  name: string
  path: string
  type: 'dir' | 'file'
}


export default class Put extends Command {
  static override args = {
    source: Args.string({description: 'source file or directory', required: true}),
  }

  static override description = 'put files or directories to Kompira server'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    ...commonFlags,
    // flag with a value (-c, --cwd=VALUE)
    cwd: Flags.string({char: 'c', description: 'set current working directory to VALUE'}),
    dest: Flags.string({char: 'd', description: 'specify destination object or directory (create if none exists)'}),
    overwrite: Flags.boolean({char: 'o', description: 'overwrite an existing object'}),
    recursive: Flags.boolean({char: 'r', description: 'put directories recursively'}),
    verbose: Flags.boolean({char: 'v', description: 'explain what is being down'}),
  }

  static strict = false

  private conf!: Config

  public async run(): Promise<void> {
    const {argv, flags} = await this.parse(Put)
    this.conf = new Config(flags)
    checkInsecure(flags.insecure)
    const cwd = await checkCwd(this.conf, flags.cwd)
    let dest = path.normalize(path.join(cwd, flags.dest || ''))
    const sources = await this.checkSources(argv as string[], path.resolve('.'))

    if (sources.length === 0) {
      return
    }

    let target: KeClient.ObjectResponse | null | string = await KeClient.get(this.conf, dest) 
  
    if (argv.length === 1) {
      const source = sources[0]
      if (!target) {
	({base: target, dir: dest} = path.parse(dest))
      } else if (target.type_object === DIRECTORY_TYPE) {
	target = await KeClient.get(this.conf, path.join(target.abspath, source.name)) || source.name
      } else {
	dest = path.dirname(dest)
      }

      await this.putObject(dest, source, target, flags)
    } else {
      if (target === null) {
	// target が存在しない場合はコピーできない
	throw new Error(`target '${dest}' is not found`)
      } else if (target!.type_object !== DIRECTORY_TYPE) {
	// コピー先がディレクトリ以外の場合はコピーできない
	throw new Error(`target '${dest}' is not a directory`)
      }

      // dest 配下にsources をコピー
      await Promise.all(
	sources.map(async (src) => {
	  const target = await KeClient.get(this.conf, path.join(dest, src.name)) || src.name
	  await this.putObject(dest, src, target, flags)
	})
      )
    }
  }

  private async checkSources(sources: string[], cwd: string): Promise<SourceDesc[]> {
    const srcDescs: SourceDesc[] = []
    await Promise.all(
      sources.map(async (src) => {
	const source = path.normalize(path.join(cwd, src))
	try {
	  const stat = await fs.stat(source)
	  const {ext, name} = path.parse(source)
	  if (stat.isDirectory()) {
	    srcDescs.push({ext, name, path: source, type: 'dir'})
	  } else if (stat.isFile()) {
	    srcDescs.push({ext, name, path: source, type: 'file'})
	  } else {
	    this.log(`put: invalid source '${source} type: should be file or directory`)
	  }
	} catch (error) {
	  if (error instanceof Error) {
	    this.log(`put: cannot stat '${source}': ${error.message}`)
	  } else {
	    this.log(`put: cannot stat '${source}': Unknown error`)
	  }
	}
      })
    )

    return srcDescs
  }

  private async putObject(dest: string, source: SourceDesc, target: KeClient.ObjectResponse | string, options: PutOptions) {
    let destDir = null

    if (target instanceof Object) {
      if (target.type_object === DIRECTORY_TYPE && source.type === 'dir') {
	destDir = target.abspath
      } else if (target.type_object === TEXT_TYPE && source.type === 'file') {
	if (options.overwrite) {
	  const text = await fs.readFile(source.path, { encoding: 'utf8' })
	  const data = {
	    'fields': {
	      'contentType': mimeLookup(source.path),
	      'ext': source.ext.replace(/^\.+/, ''),
	      text,
	    }
	  }
	  const result = await KeClient.update(this.conf, target.abspath, data)
	  if (options.verbose) {
	    this.log(`updated text: ${result.abspath}`)
	  }
	}
      } else {
	this.log(`put: cannot overwrite ${target.abspath}: type '${target.type_object}' mismatch`)
	return
      }
    } else if (source.type === 'dir') {
      const data = {
	'name': target as string,
	'type_object': DIRECTORY_TYPE,
      }
      const result = await KeClient.create(this.conf, dest, data)
      if (options.verbose) {
	this.log(`created directory: ${result.abspath}`)
      }

      destDir = result.abspath
    } else if (source.type === 'file') {
      const text = await fs.readFile(source.path, { encoding: 'utf8' })
      const data = {
	'fields': {
	  'contentType': mimeLookup(source.path),
	  'ext': source.ext.replace(/^\.+/, ''),
	  text,
	},
	'name': target as string,
	'type_object': TEXT_TYPE,
      }
      const result = await KeClient.create(this.conf, dest, data)
      if (options.verbose) {
	this.log(`created text: ${result.abspath}`)
      }
    } else {
      assert(false, `invalid source.type: ${source.type}`)
    }

    if (options.recursive && destDir) {
      // ファイル一覧を取得
      const dirs = await fs.readdir(source.path)
      const sources = await this.checkSources(dirs, source.path)

      await Promise.all(
	sources.map(async (src) => {
	  const target = await KeClient.get(this.conf, path.join(destDir, src.name)) || src.name
	  await this.putObject(destDir, src, target, options)
	})
      )
    }
  }
}
