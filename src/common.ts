import path from 'path'
import Config from './config.js'
import KeClient from './client.js'
import {DIRECTORY_TYPE} from './const.js'


export async function check_cwd(config: Config, cwd?: string): Promise<string> {
    if (cwd) {
      // cwd のパラメータチェック
      if (!path.isAbsolute(cwd)) {
        throw new Error(`cwd should be absolute path: ${cwd}`)
      }
      let result = await KeClient.get(config, cwd)
      if (result == null) {
	throw new Error(`cwd '${cwd}' does not exist`)
      }
      if (result!.type_object != DIRECTORY_TYPE) {
	throw new Error(`cwd '${cwd}' is not directory`)
      }
      return path.normalize(cwd)
    } else {
      return '/'
    }
}


export function check_insecure(insecure?: boolean): void {
  if (insecure) {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
  }
}
