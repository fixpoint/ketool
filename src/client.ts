import * as rm from 'typed-rest-client/RestClient.js'
import Config from './config.js'


export namespace KeClient {
  export type ObjectResponse = {
    id: number
    abspath: string
    owner: string
    display_name: string
    description: string
    type_object: string
    parent_object: string
    created: string
    updated: string
    fields: {
      [key: string]: any
    }
    extra_properties: {
      [key: string]: any
    }
    user_permissions: {
      [key: string]: any
    }
    group_permissions: {
      [key: string]: any
    }
  }
  export type ObjectsResponse = {
    count: number,
    results: [ObjectResponse]
  }

  function request_options(token?: string): rm.IRequestOptions {
    return {
      'additionalHeaders': {
	'Authorization': `Token ${token}`
      }
    }
  }

  export async function get(config: Config, path: string): Promise<ObjectResponse | null> {
    let rest: rm.RestClient = new rm.RestClient('ke-client', config.baseurl)
    let resp: rm.IRestResponse<ObjectResponse> = await rest.get<ObjectResponse>(path, request_options(config.token))
    if (resp.statusCode == 404) {
      return null
    } else if (resp.statusCode != 200) {
      throw new Error(`StatusCode: ${resp.statusCode}`)
    }
    return resp.result
  }

  export async function get_all(config: Config, path: string): Promise<ObjectsResponse | null> {
    let rest: rm.RestClient = new rm.RestClient('ke-client', config.baseurl)
    let resp: rm.IRestResponse<ObjectsResponse> = await rest.get<ObjectsResponse>(path, request_options(config.token))
    if (resp.statusCode == 404) {
      return null
    } else if (resp.statusCode != 200) {
      throw new Error(`StatusCode: ${resp.statusCode}`)
    }
    return resp.result
  }

  export async function create(config: Config, path: string, name: string, data: any): Promise<ObjectResponse | null> {
    let rest: rm.RestClient = new rm.RestClient('ke-client', config.baseurl)
    let resp: rm.IRestResponse<ObjectResponse> = await rest.create<ObjectResponse>(path, data, request_options(config.token))
    if (resp.statusCode != 201) {
      throw new Error(`StatusCode: ${resp.statusCode}`)
    }
    return resp.result
  }

  export async function del(config: Config, path: string, force: boolean = false): Promise<boolean> {
    let rest: rm.RestClient = new rm.RestClient('ke-client', config.baseurl)
    let resp: rm.IRestResponse<ObjectResponse> = await rest.del<ObjectResponse>(path, request_options(config.token))
    if (force && resp.statusCode == 404) {
      return false
    } else if (resp.statusCode != 204) {
      throw new Error(`StatusCode: ${resp.statusCode}`)
    }
    return true
  }
}

export default KeClient
