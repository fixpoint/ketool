import {Args, Command, Flags} from '@oclif/core'
import path from 'node:path'

import * as KeClient from '../client.js'
import {checkCwd, checkInsecure} from '../common.js'
import Config from '../config.js'
import {DIRECTORY_TYPE} from '../const.js'
import {common as commonFlags} from '../flags.js'


type RmOptions = {
  force?: boolean
  recursive?: boolean
  verbose?: boolean
}


export default class Rm extends Command {
  static override args = {
    object: Args.string({
      description: 'path of the object to be removed',
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
    force: Flags.boolean({char: 'f', description: 'ignore nonexistent objects and arguments'}),
    recurcive: Flags.boolean({char: 'r', description: 'remove directories and their contents recursively'}),
    verbose: Flags.boolean({char: 'v', description: 'print a message for each removed directory'}),
  }

  static strict = false

  private conf!: Config

  public async run(): Promise<void> {
    const {argv, flags} = await this.parse(Rm)
    this.conf = new Config(flags)
    checkInsecure(flags.insecure)
    const cwd = await checkCwd(this.conf, flags.cwd)
    await Promise.all(
      argv.map((arg) => this.removeObject(path.resolve(cwd, arg as string), flags))
    )
  }

  private async removeObject(target: string, options: RmOptions) {
    if (!options.force) {
      const result = await KeClient.get(this.conf, target)
      if (result === null) {
	this.warn(`failed to remove: '${target}' is not found`)
	return
      }

      if (result.type_object === DIRECTORY_TYPE) {
	this.warn(`failed to remove: '${target}' is a directory`)
	return
      }
    }

    const removed = await KeClient.del(this.conf, target, options.force)
    if (options.verbose && removed) {
      this.log(`removed: ${target}`)
    }
  }
}
