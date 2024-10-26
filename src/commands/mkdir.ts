import {Args, Command, Flags} from '@oclif/core'
import path from 'path'

import {common as common_flags} from '../flags.js'
import Config from '../config.js'
import KeClient from '../client.js'
import {check_cwd, check_insecure} from '../common.js'
import {DIRECTORY_TYPE} from '../const.js'


export default class Mkdir extends Command {
  static override args = {
    directory: Args.string({
      description: 'path of the directory to be created',
      required: true,
    }),
  }
  static strict = false

  static override description = 'Create the directories, if they do not already exist.'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    ...common_flags,
    // flag with a value (-c, --cwd=VALUE)
    cwd: Flags.string({char: 'c', description: 'set current working directory to VALUE'}),
    parent: Flags.boolean({char: 'p', description: 'no error if existing, make parent directories as needed'}),
    verbose: Flags.boolean({char: 'v', description: 'print a message for each created directory'}),
  }

  public async run(): Promise<void> {
    const {argv, flags} = await this.parse(Mkdir)
    const config = new Config(flags)
    check_insecure(flags.insecure)
    let cwd = await check_cwd(config, flags.cwd)
    for (let i = 0; i < argv.length; i++) {
      const {dir, base} = path.parse(path.resolve(cwd, argv[i] as string))
      await this.make_directory(config, dir, base, flags.parent, flags.verbose)
    }
  }
  private async make_directory(config: Config, parent_dir: string, name: string, parent: boolean = false, verbose: boolean = false) {
    // parent_dir の存在チェック
    let result = await KeClient.get(config, parent_dir)
    if (result == null) {
      if (!parent) {
        throw new Error(`cannot create directory: parent directory '${parent_dir}' is not found`)
      }
      const {dir, base} = path.parse(parent_dir)
      result = await this.make_directory(config, dir, base, parent, verbose)
    }
    if (result!.type_object != DIRECTORY_TYPE) {
      throw new Error(`cannot create directory: parent directory '${parent_dir}' is not directory`)
    }
    let data = {
      'type_object': DIRECTORY_TYPE,
      'name': name
    }
    result = await KeClient.create(config, parent_dir, data)
    if (result && verbose) {
      this.log(`created directory: ${result.abspath}`)
    }
    return result
  }
}
