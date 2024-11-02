import {Args, Command, Flags} from '@oclif/core'
import path from 'node:path'

import * as KeClient from '../client.js'
import {checkCwd, checkInsecure} from '../common.js'
import Config from '../config.js'
import {DIRECTORY_TYPE, TABLE_TYPE} from '../const.js'
import {common as commonFlags} from '../flags.js'


export default class Ls extends Command {
  static override args = {
    object: Args.string({description: 'file to read'}),
  }

  static override description = 'list information about the OBJECTs.'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    ...commonFlags,
    // flag with a value (-c, --cwd=VALUE)
    cwd: Flags.string({char: 'c', description: 'set current working directory to VALUE'}),
    long: Flags.boolean({char: 'l', description: 'use a long listing format'}),
  }

  static strict = false

  private conf!: Config

  public async run(): Promise<void> {
    const {argv, flags} = await this.parse(Ls)
    this.conf = new Config(flags)
    checkInsecure(flags.insecure)
    const cwd = await checkCwd(this.conf, flags.cwd)

    if (argv.length === 0) {
      argv.push('.')
    }

    const withHeader = argv.length > 1
    const results = await Promise.all(
      argv.map((arg) => this.listObj(path.resolve(cwd, arg as string), withHeader, flags.long))
    )
    if (results.includes(false)) {
      this.exit(1)
    }
  }

  private _printObj(target: KeClient.ObjectResponse, indent: string, longFormat?: boolean) {
    if (!target.abspath) {
      return
    }

    const {name} = path.parse(target.abspath)
    if (longFormat) {
      this.log(`${indent}${target.owner} ${target.updated} ${name}:${target.type_object}`)
    } else {
      this.log(`${indent}${name}`)
    }
  }

  private async listObj(targetPath: string, withHeader: boolean, longFormat?: boolean) {
    const target = await KeClient.get(this.conf, targetPath)
    if (target === null) {
      this.warn(`failed to get '${targetPath}': no such object or directory`)
      return false
    }

    if ([DIRECTORY_TYPE, TABLE_TYPE].includes(target.type_object)) {
      const resp = await KeClient.getChildren(this.conf, targetPath)
      let indent = ''
      if (withHeader) {
        this.log(`${target.abspath}:`)
        indent = '  '
      }

      for (const child of resp!.results) {
        this._printObj(child, indent, longFormat)
      }
    } else {
      this._printObj(target, '', longFormat)
    }

    return true
  }
}
