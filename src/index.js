import qs from 'qs'

class Supafetch {
  constructor() {
    this.default = {
      baseUrl: '',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  }

  setBaseUrl(value) {
    this.default.baseUrl = value
  }

  setDefaultHeaders(headers = {}) {
    this.default.headers = headers
  }

  _request(mUrl, mOptions = {}) {
    const url = this.default.baseUrl +
      (mUrl[0] !== '/' && !!this.default.baseUrl ? `/${mUrl}` : mUrl) +
      (mOptions.params ? `?${qs.stringify(mOptions.params)}` : '')

    let headers = {
      ...this.default.headers,
      ...mOptions.headers,
    }

    let options = {
      ...mOptions,
      headers: new Headers(headers),
    }

    if (options.data) {
      switch (headers['Content-Type']) {
        case 'application/json':
          options.body = JSON.stringify(options.data)
          break
        case 'application/x-www-form-urlencoded':
          options.body = qs.stringify(options.data)
          break
        case 'multipart/form-data':
          options.body = Object.keys(options.data).reduce((form, key) => {
            form.append(key, options.data[key])
            return form
          }, new FormData())
          break
        default:
          options.body = JSON.stringify(options.data)
      }
    }

    // todo: unset custom options

    let result = {}
    let request = new Request(url, options)
    let response
    // request interceptor
    return new Promise((resolve, reject) => {
      fetch(request)
        .then((resp) => {
          response = resp
          return response.text()
        })
        .then((value) => {
          const contentType = response.headers.get('content-type')
          const isJson = contentType && contentType.indexOf('application/json') !== -1
          if (!response.ok) {
            let error = new Error(response.statusText || `Request failed with status code ${response.status}`)
            error.data = value
            if (isJson) {
              error.data = JSON.parse(value)
            }
            throw error
          }
          result.request = request
          result.response = response
          result.data = isJson ? JSON.parse(value) : value
          // here interceptor
          resolve(result)
        })
        .catch((err) => {
          err.request = request
          err.response = response
          // here error interceptor
          reject(err)
        })
    })
  }

  get(url, options) {
    return this._request(url, { ...options, method: 'GET'})
  }

  post(url, options) {
    return this._request(url, { ...options, method: 'POST'})
  }

  delete(url, options) {
    return this._request(url, { ...options, method: 'DELETE'})
  }

  put(url, options) {
    return this._request(url, { ...options, method: 'PUT'})
  }

  patch(url, options) {
    return this._request(url, { ...options, method: 'PATCH'})
  }
}

export default new Supafetch()
