# Supafetch
Simple fetch wrapper inspired by axios


----------


  - [Installing](#installing)
  - [API](#api)
  - [Example Usage](#example-usage)
- [Background](#background)


  ----------


## Installing

  1. Install some polyfills if you're supporting old browser, skip this if you aren't. ( Note: node and some modern browsers support fetch and promise natively )
  ```
  yarn add es6-promise whatwg-fetch
  ```
  2. Install supafetch
  ```
  yarn add supafetch
  ```

## API
  ```js
  import supafetch from 'supafetch'
  ```

#### Core
  ```js
  supafetch.get(url, options) /* GET */
  supafetch.post(url, options) /* POST */
  supafetch.delete(url, options) /* DELETE */
  supafetch.put(url, options) /* PUT */
  supafetch.patch(url, options) /* PATCH */
  ```
  options is some configuration that u can use when request ( you can use all of [fetch's](https://github.com/github/fetch) options as well.
  ```js
  options = {
    headers: {
      'Accept': 'application/json',
      // Content-Type that will effect request body's transformation.
      /*  1. 'application/json' [default]
          2. 'multipart/form-data'
          3. 'application/x-www-form-urlencoded'
      */
      'Content-Type': 'multipart/form-data',
    },

    // Params for query string
    params: {
      page: 1,
      limit: 15,
    },

    // Request body that will be transformed
    data: {
      email: 'username@example.org',
      password: 'secret',
    }

  // ... see github's fetch
  }
  ```




#### Set base URL
  ```js
  supafetch.setBaseUrl('https://example.org/api')
  ```
#### To set default header, you can use
  ```js
  supafetch.setDefaultHeaders({
    'Authorization': 'Bearer somerandomtoken',
  })
  ```
#### Interceptors
```js
  supafetch.setResponseInterceptor(
    (successResponse) => {
    // do something with res
      someFunctionThatModify(successResponse)
      return successResponse
    },
    (failedResponse) => failedResponse
    )

  supafetch.setRequestInterceptor(
    config => someFunctionThatModify(config)
  )
  // you still have to return request's config or response even though you don't modify it.
  ```



## Example Usage
  ```js
  import supafetch from 'supafetch'
  import humps from 'humps'

  supafetch.setBaseUrl('https://example.org/api')
  supafetch.setDefaultHeaders({
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  })

  supafetch.setResponseInterceptor(
    res => humps.camelizeKeys(res),
    err => {
      if (err.response && err.response.status === 401 {
        doLogout()
      }
      return err
    }
  )

  supafetch.setRequestInterceptor((config) => {
    config.params = config.params || {}
    config.params.locale = 'en'
    return config
  })

  supafetch.post('post/create', {
    data: {
      content: "lorem ipsum",
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  })
    .then(resp => {
      // your logic
    })
    .catch(err => {alert(err)})

  supafetch.get('posts', {
      params: {
      page: 2,
      limit: 15,
    }
  })
    .then(resp => {
      // your logic
    })
    .catch(err => {alert(err)})

  ```

## Background

  Because axios doesn't support http caching out of the box, so we decided to write a simple wrapper on top of fetch which resembles axios' api.
