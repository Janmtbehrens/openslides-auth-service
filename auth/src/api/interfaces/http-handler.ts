export enum HttpProtocol {
    HTTPS = 'https',
    HTTP = 'http'
}

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    DELETE = 'DELETE'
}

export interface HttpHeaders {
    [key: string]: string;
}

export abstract class HttpHandler {
    public static readonly DEFAULT_HEADERS: HttpHeaders = {
        accept: 'application/json',
        'Content-Type': 'application/json'
    };

    public abstract get<T = any>(url: string, data?: any, headers?: HttpHeaders, responseType?: string): Promise<T>;
    public abstract post<T = any>(url: string, data?: any, headers?: HttpHeaders): Promise<T>;
    public abstract delete<T = any>(url: string, data?: any, headers?: HttpHeaders): Promise<T>;
}
