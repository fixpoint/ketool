import {Args, Command, Flags} from '@oclif/core'
import {isText} from 'istextorbinary'
import {lookup as mimeLookup} from 'mime-types'
import fs from 'node:fs/promises'
import path from 'node:path'

import * as KeClient from '../client.js'
import {checkCwd, checkInsecure} from '../common.js'
import Config from '../config.js'
import {BIN_TYPE, DIRECTORY_TYPE, TEXT_TYPE} from '../const.js'
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
    const destPath = path.normalize(path.join(cwd, flags.dest || ''))
    const sources = await this._checkSources(argv as string[], path.resolve('.'))

    if (sources.length === 0) {
      return
    }

    const destObj = await KeClient.get(this.conf, destPath)
  
    if (argv.length === 1) {
      const source = sources[0]
      if (destObj === null) {
        // destObj が存在しない場合、親ディレクトリが存在するかチェック
        const {dir, name} = path.parse(destPath)
        const parentDir = await KeClient.get(this.conf, dir)
        if (parentDir === null || parentDir.type_object !== DIRECTORY_TYPE) {
          this.error(`failed to put '${destPath}': no such object or directory`)
        }

        await this.putObj(source, parentDir, name, flags)
      } else if (destObj.type_object === DIRECTORY_TYPE) {
        await this.putObj(source, destObj, source.name, flags)
      }
    } else {
      if (destObj === null || destObj.type_object !== DIRECTORY_TYPE) {
        // source が複数で destObj が存在しない場合はコピーできない
        this.error(`failed to put '${destPath}': no such object or directory`)
      }

      // destObj/ 配下にsources をコピー
      await Promise.all(
        sources.map((src) => this.putObj(src, destObj, src.name, flags))
      )
    }
  }

  private async _checkSources(sources: string[], cwd: string): Promise<SourceDesc[]> {
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

  private async _createObj(source: SourceDesc, destDirObj: KeClient.ObjectResponse, name: string, verbose?: boolean) {
    let fields = {}
    let typeObject = ''
    if (source.type === 'dir') {
      // ディレクトリを新規作成して、再帰的に処理を続ける
      typeObject = DIRECTORY_TYPE
    } else if (source.type === 'file') {
      // ソースの種類に応じてオブジェクトを新規作成する
      const dataFields = {
        'contentType': mimeLookup(source.path),
        'ext': source.ext.replace(/^\.+/, ''),
      }
      const buf = await fs.readFile(source.path)
      if (isText(source.path, buf)) {
        fields = {...dataFields, text: buf}
        typeObject = TEXT_TYPE
      } else {
        fields = {...dataFields, data: buf.toString('base64')}
        typeObject = BIN_TYPE
      }
    }

    const result = await KeClient.create(this.conf, destDirObj.abspath, {fields, name, 'type_object': typeObject})
    if (verbose) {
      this.log(`created object (${result.type_object}): ${result.abspath}`)
    }

    return result
  }

  private async _updateObj(source: SourceDesc, destObj: KeClient.ObjectResponse, verbose?: boolean) {
    const dataFields = {
      contentType: mimeLookup(source.path),
      ext: source.ext.replace(/^\.+/, '')
    }
    const buf = await fs.readFile(source.path)
    const istext = isText(source.path, buf)
    let data = {}
    if (istext && destObj.type_object === TEXT_TYPE) {
      data = {
        'fields': {...dataFields, text: buf},
      }
    } else if (!istext && destObj.type_object === BIN_TYPE) {
      data = {
        'fields': {...dataFields, data: buf.toString('base64')},
      }
    } else {
      this.log(`put: cannot overwrite ${destObj.abspath}: type '${destObj.type_object}' mismatch`)
      return
    }

    await KeClient.update(this.conf, destObj.abspath, data)
    if (verbose) {
      this.log(`updated object (${destObj.type_object}): ${destObj.abspath}`)
    }
  }

  private async putObj(source: SourceDesc, destDir: KeClient.ObjectResponse, name: string, options: PutOptions) {
    //
    // putObj:
    //    source からファイルやディレクトリを読み込み、dest 配下/に target オブジェクトとして配置する
    //
    // [parameters]
    //  - source: オブジェクトのデータソース
    //  - destDir: オブジェクトを配置する先のディレクトリオブジェクト
    //  - name: 新規作成時のオブジェクト名称
    //  - options: Putオプション
    //
    let destObj = await KeClient.get(this.conf, path.join(destDir.abspath, name))
    if (destObj === null) {
      destObj = await this._createObj(source, destDir, name, options.verbose)
    } else if (destObj && options.overwrite && source.type === 'file' && [BIN_TYPE, TEXT_TYPE].includes(destObj.type_object)) {
      await this._updateObj(source, destObj, options.verbose)
    } else if (destObj && options.overwrite && !(source.type === 'dir' && destObj.type_object === DIRECTORY_TYPE)) {
      // 配置先オブジェクトとデータソースの種類がミスマッチの場合
      this.log(`put: cannot overwrite ${destObj.abspath}: type '${destObj.type_object}' mismatch`)
      return
    }

    if (options.recursive && destObj.type_object === DIRECTORY_TYPE) {
      // ファイル一覧を取得
      const dirs = await fs.readdir(source.path)
      const sources = await this._checkSources(dirs, source.path)

      await Promise.all(
        sources.map((src) => this.putObj(src, destObj, src.name, options))
      )
    }
  }
}
