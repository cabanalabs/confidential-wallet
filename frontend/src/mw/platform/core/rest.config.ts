
import { platformDi } from '../platform-di.ts';
import {IHttpClient} from './i-http-client.ts';
import {RestApiOptionsRequest} from "./types.ts";

export class RestConfig {

  private serviceBaseUrl: any;
  private serviceAuthToken: any;
  private serviceProtocolClient: any;
  private requestHookCallback: ((options: RestApiOptionsRequest) => Promise<RestApiOptionsRequest>) | undefined;
  private errorHookCallback: ((error: any) => Promise<any>) | undefined;

  baseUrl (val?: string) {

    if (val === undefined) {
      const globalBaseUrl = platformDi.getHttpClientBaseUrl() || '';
      const serviceBaseUrl = this.serviceBaseUrl || '';
      console.log('baseUrl', globalBaseUrl, serviceBaseUrl);
      return this.combineUrl(globalBaseUrl, serviceBaseUrl);
    }

    this.serviceBaseUrl = val;

    return this;
  }

  combineUrl (baseUrl, url) {

    if (baseUrl) {

      if (baseUrl[baseUrl.length - 1] === '/') baseUrl = baseUrl.slice(0, -1);
      if (url[0] === '/') url = url.slice(1);

      return baseUrl + '/' + url;
    }

    return url;
  }

  authToken (val?: string) {

    if (val === undefined) {
      if (this.serviceAuthToken === '') return '';
      return this.serviceAuthToken || platformDi.getHttpClientAuthToken();
    }

    this.serviceAuthToken = val;

    return this;
  }

  protocolClient (val?: IHttpClient) {

    if (!val) {
      return this.serviceProtocolClient || platformDi.getHttpClient();
    }

    this.serviceProtocolClient = val;

    return this;
  }

  errorHook (callback?: (error: any) => Promise<any>): any{

    if (!callback) {
      return this.errorHookCallback;
    }

    this.errorHookCallback = callback;

    return this;
  }

  requestHook (callback?: (options: RestApiOptionsRequest) => Promise<RestApiOptionsRequest>): any {

    if (!callback) {
      return this.requestHookCallback;
    }

    this.requestHookCallback = callback;

    return this;
  }
}
