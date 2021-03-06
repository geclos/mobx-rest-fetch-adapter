/* global Headers */
// @flow
import qs from 'qs'
import deepExtend from 'deep-extend'

type OptionsRequest = {
  abort: () => void,
  promise: Promise<*>
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
type Options = {
  method: Method,
  headers?: ?{ [key: string]: string },
  onProgress?: (num: number) => mixed,
  data?: ?{ [key: string]: mixed }
}

export function checkStatus (response: any): any {
  return response.json().then(json => {
    return response.ok ? json : Promise.reject(json)
  })
}

function ajax (url: string, options: Options): OptionsRequest {
  if (options.method === 'GET' && options.data) {
    url = `${url}?${qs.stringify(options.data)}`
    delete options.data
  }

  if (typeof fetch === 'undefined') {
    var { fetch, Headers } = require('fetch-ponyfill')()
  }

  const { headers, data, ...otherOptions } = options

  const headersObject = new Headers(
    Object.assign(
      {},
      {
        'Content-Type': 'application/json'
      },
      headers
    )
  )

  const xhr = fetch(url, {
    ...otherOptions,
    headers: headersObject,
    body: data ? JSON.stringify(data) : null
  })

  const promise = new Promise((resolve, reject) => {
    xhr.then(checkStatus).then(resolve, error => {
      const ret = error ? error.errors : {}

      return reject(ret || {})
    })
  })

  const abort = () => {} // noop, fetch is not cancelable

  return { abort, promise }
}

export default {
  apiPath: '',
  commonOptions: {},

  get (path: string, data: ?{}, options?: {} = {}): OptionsRequest {
    return ajax(
      `${this.apiPath}${path}`,
      deepExtend({}, { method: 'GET' }, this.commonOptions, options, { data })
    )
  },

  post (path: string, data: ?{}, options?: {} = {}): OptionsRequest {
    return ajax(
      `${this.apiPath}${path}`,
      deepExtend({}, { method: 'POST' }, this.commonOptions, options, { data })
    )
  },

  put (path: string, data: ?{}, options?: {} = {}): OptionsRequest {
    return ajax(
      `${this.apiPath}${path}`,
      deepExtend({}, { method: 'PUT' }, this.commonOptions, options, { data })
    )
  },

  del (path: string, options?: {} = {}): OptionsRequest {
    return ajax(
      `${this.apiPath}${path}`,
      deepExtend({}, { method: 'DELETE' }, this.commonOptions, options)
    )
  }
}
