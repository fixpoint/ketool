import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)


type ConfigOptions = {
  baseurl?: string
  token?: string
}


export default class Config {
  baseurl?: string
  token?: string

  constructor(flags: ConfigOptions) {
    const config = require('config')

    this.baseurl = flags.baseurl || config.get('baseurl')
    this.token = flags.token || config.get('token')
  }
}
