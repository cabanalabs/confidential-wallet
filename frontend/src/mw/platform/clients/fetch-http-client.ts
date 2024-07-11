

export class FetchHttpClient {

  constructor (private httpClient = getDefaultFetch()) {}

  async invoke(options: RestApiOptionsRequest): Promise<any> {
    return this.makeServiceRequest(this.buildRequest(options));
  }

  buildRequest(options: RestApiOptionsRequest) {
    const paramStr = options.queryParams && this.serialize(options.queryParams);

    if (paramStr) {
      options.url = `${options.url}?${paramStr}`;
    }

    const httpHeaders: any = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    //https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
    //NOTE: "credentials" is not supported if the CORS header 'Access-Control-Allow-Origin' is '*'
    // let credentials = options.credentials || 'same-origin';

    if (options.authToken && !options.noAuthHeader) {
      httpHeaders.Authorization = options.authToken;
      // credentials = 'include';
      // httpHeaders.with
    }

    if (options.headers) {
      Object.keys(options.headers).forEach((key) => {
        httpHeaders[key] = options.headers[key];
      });
    }

    if (options.body) {
      const contentType = httpHeaders['Content-Type'];
      if (contentType === 'application/x-www-form-urlencoded') {
        options.body = this.serialize(options.body);
      }
      else if (contentType === 'application/json') {
        options.body = JSON.stringify(options.body);
      }
    }

    return {
      url: options.url,
      body: options.body,
      headers: httpHeaders,
      method: options.method,
      // credentials,
      transformResponse: options.transformResponse,
      responseHook: options.responseHook,
      errorHook: options.errorHook
    };
  }

  makeServiceRequest(options: RestApiOptionsRequest) {
    return new Promise((resolve, reject) => {
      if (!this.httpClient) {
        throw new Error('httpClient has not been set yet')
      }
      //console.log('fetching', options);
      this.httpClient(options.url, options)
        .then( async (res) => {
          console.log('fetched', options.url, res.ok, res.status, 'hasResponseHook', !!options.responseHook, 'hasErrorHook', !!options.errorHook);
          if(!res.ok) {
            console.log('fetch.Not Ok', res.status, 'hasErrorHook', !!options.errorHook)
            if (options.errorHook) {
              options.errorHook(new FetchError(res))
              .then(result => resolve(result))
              .catch(err => reject(err))
              return;
            }
          }
          else if(options.responseHook) {
            resolve(options.responseHook(res));
            return;
          }
          const cType = res.headers.get('content-type');
          let result;
          console.log('fetched.cType', cType);
          if(cType && cType.includes('json')) {
            result = await res.json()
          }
          else {
            result = await res.text();

            if (result.toLowerCase() === 'true') result = true;
            else if (result.toLowerCase() === 'false') result = false;
            else if (!isNaN(Number(result))) result = parseFloat(result);
            //console.log('fetched.text', result);
          }

          if (res.ok) {

            if (options.transformResponse) {
              resolve(options.transformResponse(result));
            } else {
              //console.log('fetch.resolve', result)
              resolve(result);
            }

            return;
          }

          console.log('fetch.reject', result)
          reject(result);

        })
        .catch( err => {
          console.log('fetch.catch', err, 'hasErrorHook', !!options.errorHook)
          reject(err);
        }
      );
    });
  }


  // eslint-disable-next-line class-methods-use-this
  serialize(obj: any) {
    if (obj) {
      const keyMap = Object.keys(obj).map((key) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`;
      });

      return keyMap.join('&');
    }
    return '';
  }
}

class FetchError {

  readonly headers: Headers;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;

  constructor(res: Response) {
    // super(res.status + ' - ' + res.statusText);

    this.statusText = res.statusText;
    this.headers = res.headers;
    this.status = res.status;
    this.url = res.url;
  }

}

function getDefaultFetch(): typeof fetch {
  let defaultFetch;

  if (typeof window !== 'undefined') {
    // Browser context
    if (window.fetch) {
      defaultFetch = window.fetch.bind(window);
    } else {
      throw new Error(
          'Fetch implementation was not available. You appear to be in a browser context, but window.fetch was not present.',
      );
    }
    // @ts-ignore
  } else if (typeof global !== 'undefined') {
    // Node context
    // @ts-ignore
    if (global.fetch) {
      // @ts-ignore
      defaultFetch = global.fetch.bind(global);
    } else {
      throw new Error(
          'Fetch implementation was not available. You appear to be in a Node.js context, but global.fetch was not available.',
      );
    }
  } else if (typeof self !== 'undefined') {
    if (self.fetch) {
      defaultFetch = self.fetch.bind(self);
    }
  }

  if (defaultFetch) {
    return defaultFetch;
  }

  throw new Error(
      'Fetch implementation was not available. Please provide fetch to the FetchHttpClient constructor, or ensure it is available in the window or global context.',
  );
}

interface RestApiOptionsRequest {
  baseUrl?: string;
  headers?: any;
  noAuthHeader?: boolean;
  transformResponse?: (rawResponse: any) => any;
  retry?: number;
  errorHook?: (error: any) => Promise<any>;
  queryParams?: any;
  method: string;
  authToken?: string;
  credentials?: 'include' | 'omit' | 'same-origin';
  body: any;
  url: string;
  requestHook?: (options: RestApiOptionsRequest) => Promise<RestApiOptionsRequest>;
  responseHook?: (res: Response) => Promise<any>;
}
