import * as rm from 'typed-rest-client/RestClient.js'

import Config from './config.js'


export type ObjectResponse = {
  abspath: string
  created: string
  description: string
  display_name: string
  extra_properties: {
    [key: string]: object
  }
  fields: {
    [key: string]: object
  }
  group_permissions: {
    [key: string]: object
  }
  id: number
  owner: string
  parent_object: string
  type_object: string
  updated: string
  user_permissions: {
    [key: string]: object
  }
}

export type ObjectsResponse = {
  count: number,
  results: [ObjectResponse]
}

function requestOpts(token?: string): rm.IRequestOptions {
  return {
    'additionalHeaders': {
      'Authorization': `Token ${token}`
    }
  }
}

export async function get(config: Config, path: string): Promise<ObjectResponse | null> {
  const rest: rm.RestClient = new rm.RestClient('ke-client', config.baseurl)
  const resp: rm.IRestResponse<ObjectResponse> = await rest.get<ObjectResponse>(path, requestOpts(config.token))
  if (resp.statusCode === 404) {
    return null
  }

  if (resp.statusCode !== 200) {
    throw new Error(`StatusCode: ${resp.statusCode}`)
  }

  return resp.result
}

export async function getChildren(config: Config, dirPath: string): Promise<ObjectsResponse | null> {
  const rest: rm.RestClient = new rm.RestClient('ke-client', config.baseurl)
  const resp: rm.IRestResponse<ObjectsResponse> = await rest.get<ObjectsResponse>(`${dirPath}.children`, requestOpts(config.token))
  if (resp.statusCode === 404) {
    return null
  }

  if (resp.statusCode !== 200) {
    throw new Error(`StatusCode: ${resp.statusCode}`)
  }

  return resp.result
}

export async function create(config: Config, path: string, data: object): Promise<ObjectResponse> {
  const rest: rm.RestClient = new rm.RestClient('ke-client', config.baseurl)
  const resp: rm.IRestResponse<ObjectResponse> = await rest.create<ObjectResponse>(path, data, requestOpts(config.token))
  if (resp.statusCode !== 201) {
    throw new Error(`StatusCode: ${resp.statusCode}`)
  }

  return resp.result as ObjectResponse
}

export async function update(config: Config, path: string, data: object): Promise<ObjectResponse> {
  const rest: rm.RestClient = new rm.RestClient('ke-client', config.baseurl)
  const resp: rm.IRestResponse<ObjectResponse> = await rest.update<ObjectResponse>(path, data, requestOpts(config.token))
  if (resp.statusCode !== 200) {
    throw new Error(`StatusCode: ${resp.statusCode}`)
  }

  return resp.result as ObjectResponse
}

export async function replace(config: Config, path: string, data: object): Promise<ObjectResponse> {
  const rest: rm.RestClient = new rm.RestClient('ke-client', config.baseurl)
  const resp: rm.IRestResponse<ObjectResponse> = await rest.replace<ObjectResponse>(path, data, requestOpts(config.token))
  if (resp.statusCode !== 200) {
    throw new Error(`StatusCode: ${resp.statusCode}`)
  }

  return resp.result as ObjectResponse
}

export async function del(config: Config, path: string, force: boolean = false): Promise<boolean> {
  const rest: rm.RestClient = new rm.RestClient('ke-client', config.baseurl)
  const resp: rm.IRestResponse<ObjectResponse> = await rest.del<ObjectResponse>(path, requestOpts(config.token))
  if (force && resp.statusCode === 404) {
    return false
  }

  if (resp.statusCode !== 204) {
    throw new Error(`StatusCode: ${resp.statusCode}`)
  }

  return true
}
