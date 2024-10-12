import {Args, Command, Flags} from '@oclif/core'
import {common as common_flags} from '../flags.js'
import path from 'path'
import Config from '../config.js'
import KeClient from '../client.js'
import {DIRECTORY_TYPE} from '../const.js'


export default class Rmdir extends Command {
  static override args = {
    directory: Args.string({
      description: 'path of the directory to be removed',
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
    parent: Flags.boolean({char: 'p', description: 'remove DIRECTORY and its ancestors'}),
    verbose: Flags.boolean({char: 'v', description: 'print a message for each removed directory'}),
  }

  public async run(): Promise<void> {
    const {argv, flags} = await this.parse(Rmdir)
    let cwd = '/'
    if (flags.cwd) {
      // cwd のパラメータチェック
      if (!path.isAbsolute(flags.cwd)) {
     	throw new Error(`cwd should be absolute path: ${flags.cwd}`)
      }
      cwd = path.normalize(flags.cwd)
    }
    const config = new Config(flags)
    for (let i = 0; i < argv.length; i++) {
      let result = await this.remove_directory(config, cwd, argv[i] as string, flags.parent, flags.verbose)
    }
  }

  private async remove_directory(config: Config, cwd: string, target: string, parent: boolean = false, verbose: boolean = false) {
    const target_dir = path.resolve(cwd, target)
    let result = await KeClient.get(config, target_dir)
    if (result == null) {
      throw new Error(`failed to remove directory: '${target_dir}' is not found`)
    }
    if (result.type_object != DIRECTORY_TYPE) {
      throw new Error(`failed to remove directory: '${target_dir}' is not a directory`)      
    }
    // ディレクトリが空かどうかチェックする
    let results = await KeClient.get_all(config, `${target_dir}.children`)
    if (results!.count > 0) {
      throw new Error(`failed to remove directory: '${target_dir}' is not empty`)      
    }
    await KeClient.del(config, target_dir)
    if (verbose) {
      this.log(`removed directory: ${target_dir}`)
    }
    if (parent) {
      const {dir, base} = path.parse(target_dir)
      if (dir != cwd) {
	await this.remove_directory(config, cwd, dir, parent, verbose)
      }
    }
    return result
  }
}
