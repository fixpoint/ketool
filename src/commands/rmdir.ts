import {Args, Command, Flags} from '@oclif/core'
import path from 'node:path'

import * as KeClient from '../client.js'
import {checkCwd, checkInsecure} from '../common.js'
import Config from '../config.js'
import {DIRECTORY_TYPE} from '../const.js'
import {common as commonFlags} from '../flags.js'


type RmdirOptions = {
  parent?: boolean
  verbose?: boolean
}


export default class Rmdir extends Command {
  static override args = {
    directory: Args.string({
      description: 'path of the directory to be removed',
      required: true,
    }),
  }

  static override description = 'Remove the directories, if they are empty.'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    ...commonFlags,
    // flag with a value (-c, --cwd=VALUE)
    cwd: Flags.string({char: 'c', description: 'set current working directory to VALUE'}),
    parent: Flags.boolean({char: 'p', description: 'remove DIRECTORY and its ancestors'}),
    verbose: Flags.boolean({char: 'v', description: 'print a message for each removed directory'}),
  }

  static strict = false

  private conf!: Config

  public async run(): Promise<void> {
    const {argv, flags} = await this.parse(Rmdir)
    this.conf = new Config(flags)
    checkInsecure(flags.insecure)
    const cwd = await checkCwd(this.conf, flags.cwd)

    const results = await Promise.all(
      argv.map((arg) => this.removeDirectory(cwd, arg as string, flags))
    )
    if (results.includes(null)) {
      this.exit(1)
    }
  }

  private async removeDirectory(cwd: string, target: string, options: RmdirOptions) {
    const targetDir = path.resolve(cwd, target)
    const result = await KeClient.get(this.conf, targetDir)

    if (result === null) {
      this.warn(`failed to remove directory: '${targetDir}' is not found`)
      return null
    }

    if (result.type_object !== DIRECTORY_TYPE) {
      this.warn(`failed to remove directory: '${targetDir}' is not a directory`)
      return null
    }

    // ディレクトリが空かどうかチェックする
    const results = await KeClient.getChildren(this.conf, targetDir)
    if (results!.count > 0) {
      this.warn(`failed to remove directory: '${targetDir}' is not empty`)
      return null
    }

    await KeClient.del(this.conf, targetDir)
    if (options.verbose) {
      this.log(`removed directory: ${targetDir}`)
    }

    if (options.parent) {
      const {dir} = path.parse(targetDir)
      if (dir !== cwd) {
	await this.removeDirectory(cwd, dir, options)
      }
    }

    return result
  }
}
