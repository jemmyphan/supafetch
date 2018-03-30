declare interface InterceptorFunc {
  (options: object): object;
}
declare interface ResponseFunc {
  (response: SupaResult): SupaResult;
}
declare interface SupaResult {
  request: Request;
  response: Response;
  data: any;
}

declare class Supafetch {
  private baseURL: string;
  private headers: { [key: string]: string };
  private interceptors: { request: InterceptorFunc; responseSuccess: ResponseFunc; responseFail: ResponseFunc };

  constructor();
  setBaseUrl(value: string): void;
  setDefaultheaders(headers?: { [key: string]: string }): void;
  setRequestInterceptor(interceptor: InterceptorFunc): void;
  setResponseInterceptor(success: ResponseFunc, fail: ResponseFunc): void;
  _request(url: string, options?: RequestInit): Promise<SupaResult>;

  get(url: string, options: RequestInit): Promise<SupaResult>;
  post(url: string, options: RequestInit): Promise<SupaResult>;
  delete(url: string, options: RequestInit): Promise<SupaResult>;
  put(url: string, options: RequestInit): Promise<SupaResult>;
  patch(url: string, options: RequestInit): Promise<SupaResult>;
}

declare module 'supafetch' {
  const supafetch: Supafetch;
  export default supafetch;
}