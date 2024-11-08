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
    const destPath = path.resolve(cwd, flags.dest || '')
    const sources = await this._checkSources(argv as string[], path.resolve('.'), flags.recursive)
    let result = false
    if (argv.length > 1) {
      const destObj = await KeClient.get(this.conf, destPath)
      if (destObj === null || destObj.type_object !== DIRECTORY_TYPE) {
        // source が複数で destObj が存在しない場合はコピーできない
        this.error(`failed to put '${destPath}': no such object or directory`)
      }

      // destObj/ 配下にsources をコピー
      result = (await Promise.all(
        sources.map(async (src) => this.putObj(src, destObj, src.name, flags))
      )).every(Boolean)
    } else if (sources.length === 1) {  // argv.length === 1
      const source = sources[0]
      const destObj = await KeClient.get(this.conf, destPath)
      if (destObj && destObj.type_object === DIRECTORY_TYPE) {
        result = await this.putObj(source, destObj, source.name, flags)
      } else {
        // destObj が存在しないか、ディレクトリ以外の場合、親ディレクトリが存在するかチェック
        const {dir, name} = path.parse(destPath)
        const parentDir = await KeClient.get(this.conf, dir)
        if (parentDir === null || parentDir.type_object !== DIRECTORY_TYPE) {
          this.error(`failed to put '${destPath}': no such object or directory`)
        }

        result = await this.putObj(source, parentDir, name, flags)
      }
    }

    if (!result || sources.length !== argv.length) {
      this.exit(1)
    }
  }

  private async _checkSources(sources: string[], cwd: string, recursive: boolean): Promise<SourceDesc[]> {
    const results: SourceDesc[] = []
    await Promise.all(
      sources.map(async (src) => {
        const source = path.resolve(cwd, src)
        try {
          const stat = await fs.stat(source)
          const {ext, name} = path.parse(source)
          if (stat.isDirectory()) {
            if (recursive) {
              results.push({ext, name, path: source, type: 'dir'})
            } else {
              this.warn(`put: -r not specified; omitting directory '${source}'`)
            }
          } else if (stat.isFile()) {
            results.push({ext, name, path: source, type: 'file'})
          } else {
            this.warn(`put: invalid source '${source}': should be file or directory`)
          }
        } catch (error) {
          if (error instanceof Error) {
            this.warn(`put: cannot stat '${source}': ${error.message}`)
          }
        }
      })
    )

    return results
  }

  private async _createObj(source: SourceDesc, destDirObj: KeClient.ObjectResponse, name: string, verbose?: boolean) {
    const {fields, typeObject} = source.type === 'file' ? await this._loadSourceFile(source.path, source.ext) : {fields: {}, typeObject: DIRECTORY_TYPE}
    const result = await KeClient.create(this.conf, destDirObj.abspath, {fields, name, 'type_object': typeObject})
    if (verbose) {
      this.log(`created object (${result.type_object}): ${result.abspath}`)
    }

    return result
  }

  private async _loadSourceFile(srcPath: string, ext: string) {
    const dataFields = {
      contentType: mimeLookup(srcPath),
      ext: ext.replace(/^\.+/, ''),
    }
    const buf = await fs.readFile(srcPath)
    return isText(srcPath, buf) ? {
      fields: {...dataFields, text: buf.toString('utf8')},
      typeObject: TEXT_TYPE
    } : {
      fields: {...dataFields, data: buf.toString('base64')},
      typeObject: BIN_TYPE
    }
  }

  private async _updateObj(source: SourceDesc, destObj: KeClient.ObjectResponse, verbose?: boolean) {
    const {fields, typeObject} = source.type === 'dir' ? {fields: {}, typeObject: DIRECTORY_TYPE} : await this._loadSourceFile(source.path, source.ext)
    if (typeObject !== destObj.type_object) {
      this.warn(`put: cannot overwrite ${destObj.abspath}: type '${destObj.type_object}' mismatch`)
      return false
    }

    await KeClient.update(this.conf, destObj.abspath, {fields})
    if (verbose) {
      this.log(`updated object (${destObj.type_object}): ${destObj.abspath}`)
    }

    return true
  }

  private async putObj(source: SourceDesc, destDir: KeClient.ObjectResponse, name: string, options: PutOptions): Promise<boolean> {
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
    let result = true
    let destObj = await KeClient.get(this.conf, path.join(destDir.abspath, name))
    if (destObj === null) {
      destObj = await this._createObj(source, destDir, name, options.verbose)
    } else if (destObj && options.overwrite) {
      result = await this._updateObj(source, destObj, options.verbose)
    }

    if (options.recursive && destObj.type_object === DIRECTORY_TYPE) {
      // ファイル一覧を取得
      const dirs = await fs.readdir(source.path)
      const sources = await this._checkSources(dirs, source.path, true)

      return (await Promise.all(
        sources.map(async (src) => this.putObj(src, destObj, src.name, options))
      )).every(Boolean) && result
    }

    return result
  }
}
