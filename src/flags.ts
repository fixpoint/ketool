import {Flags} from '@oclif/core'


export const common = {
  baseurl: Flags.string({char: 'u', description: 'base URL of the Kompira Enterprise server'}),
  insecure: Flags.boolean({char: 'k', description: 'allow insecure SSL connection'}),
  token: Flags.string({char: 't', description: 'API access token of the Kompira Enterprise server'}),
}
