import qs from 'qs'

class Supafetch {
  constructor() {
    this.default = {
      baseUrl: '',
      headers: {
        'Content-Type': 'application/json',
      },
      interceptors: {
        request: (options) => options,
        responseSuccess: (response) => response,
        responseFail: (response) => response,
      },
    }
  }

  setBaseUrl(value) {
    this.default.baseUrl = value
  }

  setDefaultHeaders(headers = {}) {
    this.default.headers = headers
  }

  setRequestInterceptor(requestInterceptor) {
    this.default.interceptors.request = requestInterceptor
  }

  setResponseInterceptor(responseSuccessInterceptor = this.default.interceptors.responseSuccess, responseFailInterceptor = this.default.interceptors.responseFailInterceptor) {
    this.default.interceptors.responseSuccess = responseSuccessInterceptor
    this.default.interceptors.responseFail = responseFailInterceptor
  }

  _request(mUrl, mOptions = {}) {
    const url = this.default.baseUrl +
      (mUrl[0] !== '/' && !!this.default.baseUrl ? `/${mUrl}` : mUrl) +
      (mOptions.params ? `?${qs.stringify(mOptions.params)}` : '')

    let options = this.default.interceptors.request({
      ...mOptions,
      headers: {
        ...this.default.headers,
        ...mOptions.headers,
      },
    })

    if (options.data) {
      switch (options.headers['Content-Type']) {
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

    options.headers = new Headers(options.headers)

    let request = new Request(url, options)
    let response
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
          let result = {
            request,
            response,
            data: isJson ? JSON.parse(value) : value,
          }
          resolve(this.default.interceptors.responseSuccess(result))
        })
        .catch((err) => {
          err.request = request
          err.response = response
          reject(this.default.interceptors.responseFail(err))
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
