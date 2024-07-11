import { RestApiOptionsRequest } from './types.ts';

export interface IHttpClient {

  invoke (options: RestApiOptionsRequest): Promise<any>;
}
