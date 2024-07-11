export class RestApiOptions {
    authToken?: string;
    baseUrl?: string;
    headers?: any;
    noAuthHeader?: boolean;
    errorHook?: (error: any) => Promise<any>;
    requestHook?: (options: RestApiOptionsRequest) => Promise<RestApiOptionsRequest>;
    responseHook?: (res: Response) => Promise<any>; //before transform, includes Response obj
    transformResponse?: (rawValue: any) => any;          //rawValue is the JSON result
    retry?: number;
}

export class RestApiOptionsRequest extends RestApiOptions {
    queryParams?: any;
    method: string;
    body: any;
    url: string;
}
