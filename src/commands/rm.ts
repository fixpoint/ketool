import {Args, Command, Flags} from '@oclif/core'
import path from 'path'

import {common as common_flags} from '../flags.js'
import Config from '../config.js'
import KeClient from '../client.js'
import {check_cwd, check_insecure} from '../common.js'
import {DIRECTORY_TYPE} from '../const.js'


export default class Rm extends Command {
  static override args = {
    object: Args.string({
      description: 'path of the object to be removed',
      required: true,
    }),
  }
  static strict = false

  static override description = 'Remove the directories, if they are empty.'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    ...common_flags,
    // flag with a value (-c, --cwd=VALUE)
    cwd: Flags.string({char: 'c', description: 'set current working directory to VALUE'}),
    force: Flags.boolean({char: 'f', description: 'ignore nonexistent objects and arguments'}),
    recurcive: Flags.boolean({char: 'r', description: 'remove directories and their contents recursively'}),
    verbose: Flags.boolean({char: 'v', description: 'print a message for each removed directory'}),
  }

  public async run(): Promise<void> {
    const {argv, flags} = await this.parse(Rm)
    const config = new Config(flags)
    check_insecure(flags.insecure)
    let cwd = await check_cwd(config, flags.cwd)
    for (let i = 0; i < argv.length; i++) {
      const target = path.resolve(cwd, argv[i] as string)
      await this.remove_object(config, target, flags.force, flags.recursive, flags.verbose)
    }
  }

  private async remove_object(config: Config, target: string, force: boolean = false, recursive: boolean = false, verbose: boolean = false) {
    if (!force) {
      let result = await KeClient.get(config, target)
      if (result == null) {
	throw new Error(`failed to remove: '${target}' is not found`)
      }
      if (result.type_object == DIRECTORY_TYPE) {
	throw new Error(`failed to remove: '${target}' is a directory`)
      }
    }
    let removed = await KeClient.del(config, target, force)
    if (verbose && removed) {
      this.log(`removed: ${target}`)
    }
  }
}
