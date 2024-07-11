import {IHttpClient} from './core/i-http-client.ts';
import {IStorageClient} from "./core/i-storage-client.ts";

class PlatformDi {

  //======================
  //   = HTTP Client =
  //======================
  private httpClient: IHttpClient;
  private httpClientBaseUrl = '';
  private httpClientAuthToken = '';
  private storage: IStorageClient;

  // Register the platform implementation for http service requests
  registerHttpClient (client: IHttpClient, baseUrl?: string) {
    this.httpClient = client;
    this.httpClientBaseUrl = baseUrl || '';
  }

  getHttpClient (): IHttpClient {
    return this.httpClient;
  }

  getHttpClientBaseUrl () {
    return this.httpClientBaseUrl;
  }

  getHttpClientAuthToken () {
    return this.httpClientAuthToken;
  }

  setHttpClientAuthToken(authToken: string) {
    this.httpClientAuthToken = authToken;
  }

  // createRestApi(baseUrl = '') {
  //   console.log('createRestApi', this.httpClientBaseUrl, baseUrl)
  //   return new RestApi(this.httpClientBaseUrl + baseUrl);
  // }

  getStorage(): IStorageClient {
    return this.storage;
  }

  registerStorage(storage: IStorageClient) {
    this.storage = storage;
  }
}

export const platformDi = new PlatformDi();

