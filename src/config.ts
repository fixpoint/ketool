import { createRequire } from 'module'
const require = createRequire(import.meta.url)


export default class Config {
  baseurl?: string
  token?: string

  constructor(flags: any) {
    const config = require('config')

    this.baseurl = flags.baseurl || config.get('baseurl')
    this.token = flags.username || config.get('token')
  }
}
