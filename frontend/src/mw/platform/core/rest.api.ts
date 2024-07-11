import { RestConfig } from './rest.config.ts';
import { IHttpClient } from './i-http-client.ts';
import {RestApiOptions, RestApiOptionsRequest} from "./types.ts";

export class RestApi {

  private config = new RestConfig();

  constructor (baseUrl: string) {
    this.config.baseUrl(baseUrl);
  }

  private async httpRequest (url: string, method: string, data: any, options: RestApiOptions, queryParams: any) {

    url = this.resolveUrl(url, options);

    if (!method || !url) {
      throw new Error('You must configure at least the http method and url');
    }

    const client: IHttpClient = this.config.protocolClient();

    let invokeOptions: RestApiOptionsRequest = {
      authToken: this.config.authToken(),
      url,
      body: data,
      method,
      queryParams,
      errorHook: this.config.errorHook(),
      ...options
    }

    const requestHook = options?.requestHook || this.config.requestHook();

    if (requestHook) {
      invokeOptions = await requestHook(invokeOptions);
    }

    return client.invoke(invokeOptions);
  }

  configure (): RestConfig {
    return this.config;
  }

  resolveUrl (url, options) {

    const baseUrl = (options && options.baseUrl) || this.config.baseUrl();

    return this.config.combineUrl(baseUrl, url);
  }

  $post<T> (url: string, data?: any, options?: RestApiOptions, queryParams?: object): Promise<T> {
    return this.httpRequest(url, 'POST', data, options, queryParams);
  }

  $get<T> (url: string, queryParams?: object, options?: RestApiOptions): Promise<T> {
    return this.httpRequest(url, 'GET', null, options, queryParams);
  }

  $put<T> (url: string, data?: any, options?: RestApiOptions, queryParams?: object): Promise<T> {
    return this.httpRequest(url, 'PUT', data, options, queryParams);
  }

  $delete<T> (url: string, data?: any, options?: RestApiOptions, queryParams?: object): Promise<T> {
    return this.httpRequest(url, 'DELETE', data, options, queryParams);
  }
}




