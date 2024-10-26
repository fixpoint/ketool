import {Args, Command, Flags} from '@oclif/core'
import path from 'node:path'

import * as KeClient from '../client.js'
import {checkCwd, checkInsecure} from '../common.js'
import Config from '../config.js'
import {DIRECTORY_TYPE} from '../const.js'
import {common as commonFlags} from '../flags.js'


type MkdirOptions = {
  parent?: boolean
  verbose?: boolean
}


export default class Mkdir extends Command {
  static override args = {
    directory: Args.string({
      description: 'path of the directory to be created',
      required: true,
    }),
  }

  static override description = 'Create the directories, if they do not already exist.'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    ...commonFlags,
    // flag with a value (-c, --cwd=VALUE)
    cwd: Flags.string({char: 'c', description: 'set current working directory to VALUE'}),
    parent: Flags.boolean({char: 'p', description: 'no error if existing, make parent directories as needed'}),
    verbose: Flags.boolean({char: 'v', description: 'print a message for each created directory'}),
  }

  static strict = false

  public async run(): Promise<void> {
    const {argv, flags} = await this.parse(Mkdir)
    const config = new Config(flags)
    checkInsecure(flags.insecure)
    const cwd = await checkCwd(config, flags.cwd)
    await Promise.all(
      argv.map((arg) => {
	const {base, dir} = path.parse(path.resolve(cwd, arg as string))
	return this.makeDir(config, dir, base, flags)
      })
    )
  }

  private async makeDir(config: Config, parentDir: string, name: string, options: MkdirOptions) {
    // parentDir の存在チェック
    let result = await KeClient.get(config, parentDir)
    if (result === null) {
      if (!options.parent) {
        throw new Error(`cannot create directory: parent directory '${parentDir}' is not found`)
      }

      const {base, dir} = path.parse(parentDir)
      result = await this.makeDir(config, dir, base, options)
    }

    if (result!.type_object !== DIRECTORY_TYPE) {
      throw new Error(`cannot create directory: parent directory '${parentDir}' is not directory`)
    }

    const data = {
      name,
      'type_object': DIRECTORY_TYPE,
    }
    result = await KeClient.create(config, parentDir, data)
    if (result && options.verbose) {
      this.log(`created directory: ${result.abspath}`)
    }

    return result
  }
}
