/**
 * HTTP client type definitions for Natural-JS framework.
 * Replaces jQuery.ajax configuration with fetch-based types.
 */

/**
 * HTTP methods supported by the client.
 */
export type NaturalHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * Response data types supported by the client.
 */
export type ResponseType = 'json' | 'text' | 'html' | 'blob' | 'arraybuffer' | 'formdata';

/**
 * Content types for request body.
 */
export type ContentType =
  | 'application/json'
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'text/plain'
  | 'text/html'
  | string;

/**
 * Request configuration options.
 * Maps jQuery.ajax options to fetch API configuration.
 */
export interface RequestConfig {
  /** Request URL */
  url?: string;

  /** HTTP method (default: 'GET') */
  method?: NaturalHttpMethod;

  /** Legacy alias for method (jQuery compatibility) */
  type?: NaturalHttpMethod;

  /** Request headers */
  headers?: Record<string, string>;

  /** Request body data */
  data?: unknown;

  /** Query parameters */
  params?: Record<string, string | number | boolean>;

  /** Content type header (default: 'application/json; charset=utf-8') */
  contentType?: ContentType | false;

  /** Expected response data type (default: 'json') */
  dataType?: ResponseType;

  /** Request timeout in milliseconds */
  timeout?: number;

  /** Enable/disable caching (adds cache-busting param if false) */
  cache?: boolean;

  /** Enable/disable async mode (always true in fetch, for compatibility) */
  async?: boolean;

  /** Enable CORS credentials */
  withCredentials?: boolean;

  /** Cross-domain request flag */
  crossDomain?: boolean;

  /** AbortController signal for cancellation */
  signal?: AbortSignal;

  /** Base URL to prepend to relative URLs */
  baseURL?: string;

  /** Whether the data is an array (for serialization) */
  dataIsArray?: boolean;

  /** URL referrer for tracking */
  referrer?: string;

  /** Enable URL synchronization check */
  urlSync?: boolean;

  /** Enable browser history tracking */
  browserHistory?: boolean;

  /** Append mode for HTML responses */
  append?: boolean;

  /** Target element for HTML responses */
  target?: Element | null;

  /** Response type (maps to dataType) */
  responseType?: ResponseType;

  /** Transform request data before sending */
  transformRequest?: (data: unknown, headers: Record<string, string>) => unknown;

  /** Transform response data after receiving */
  transformResponse?: (data: unknown) => unknown;

  /** Validate response status */
  validateStatus?: (status: number) => boolean;
}

/**
 * Normalized internal request configuration.
 */
export interface NormalizedRequestConfig {
  url: string;
  method: NaturalHttpMethod;
  headers: Record<string, string>;
  body?: BodyInit | null;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  cache?: RequestCache;
}

/**
 * HTTP response wrapper.
 */
export interface NaturalHttpResponse<T = unknown> {
  /** Response data */
  data: T;

  /** HTTP status code */
  status: number;

  /** HTTP status text */
  statusText: string;

  /** Response headers */
  headers: Record<string, string>;

  /** Original request configuration */
  config: RequestConfig;

  /** Original Response object */
  response: Response;
}

/**
 * HTTP error class with extended information.
 */
export interface HttpErrorInfo {
  /** Error message */
  message: string;

  /** Error code (custom or HTTP status) */
  code: string;

  /** HTTP status code (if available) */
  status?: number;

  /** Request configuration that caused the error */
  config: RequestConfig;

  /** Response object (if available) */
  response?: Response;

  /** Original error (if wrapped) */
  cause?: Error;
}

/**
 * Request interceptor function type.
 */
export type RequestInterceptor = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;

/**
 * Response interceptor function type.
 */
export type ResponseInterceptor<T = unknown> = (
  response: NaturalHttpResponse<T>
) => NaturalHttpResponse<T> | Promise<NaturalHttpResponse<T>>;

/**
 * Error interceptor function type.
 */
export type ErrorInterceptor = (error: HttpError) => HttpError | Promise<HttpError>;

/**
 * Interceptor manager for request/response processing.
 */
export interface InterceptorManager<T> {
  /** Add an interceptor */
  use: (interceptor: T) => number;

  /** Remove an interceptor by ID */
  eject: (id: number) => void;

  /** Clear all interceptors */
  clear: () => void;

  /** Get all interceptors */
  getAll: () => T[];
}

/**
 * HTTP client instance interface.
 */
export interface HttpClientInstance {
  /** Make a request with config */
  request: <T = unknown>(config: RequestConfig) => Promise<NaturalHttpResponse<T>>;

  /** Make a GET request */
  get: <T = unknown>(url: string, config?: RequestConfig) => Promise<NaturalHttpResponse<T>>;

  /** Make a POST request */
  post: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) => Promise<NaturalHttpResponse<T>>;

  /** Make a PUT request */
  put: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) => Promise<NaturalHttpResponse<T>>;

  /** Make a DELETE request */
  delete: <T = unknown>(url: string, config?: RequestConfig) => Promise<NaturalHttpResponse<T>>;

  /** Make a PATCH request */
  patch: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) => Promise<NaturalHttpResponse<T>>;

  /** Make a HEAD request */
  head: <T = unknown>(url: string, config?: RequestConfig) => Promise<NaturalHttpResponse<T>>;

  /** Make an OPTIONS request */
  options: <T = unknown>(url: string, config?: RequestConfig) => Promise<NaturalHttpResponse<T>>;

  /** Default configuration */
  defaults: RequestConfig;

  /** Request interceptors */
  interceptors: {
    request: InterceptorManager<RequestInterceptor>;
    response: InterceptorManager<ResponseInterceptor>;
  };
}

/**
 * HTTP error class.
 */
export class HttpError extends Error {
  /** Error code */
  code: string;

  /** HTTP status code */
  status?: number;

  /** Request configuration */
  config: RequestConfig;

  /** Response object */
  response?: Response;

  /** Response data */
  data?: unknown;

  /** Original error cause */
  originalError?: Error;

  constructor(info: HttpErrorInfo) {
    super(info.message);
    this.name = 'HttpError';
    this.code = info.code;
    this.status = info.status;
    this.config = info.config;
    this.response = info.response;
    this.originalError = info.cause;

    // Set prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  /**
   * Check if this is a network error.
   */
  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR';
  }

  /**
   * Check if this is a timeout error.
   */
  isTimeout(): boolean {
    return this.code === 'TIMEOUT';
  }

  /**
   * Check if this is an abort error.
   */
  isAborted(): boolean {
    return this.code === 'ABORTED';
  }

  /**
   * Convert to plain object.
   */
  toJSON(): HttpErrorInfo {
    return {
      message: this.message,
      code: this.code,
      status: this.status,
      config: this.config,
    };
  }
}

/**
 * Default request configuration.
 */
export const DEFAULT_CONFIG: RequestConfig = {
  method: 'GET',
  headers: {},
  timeout: 0,
  cache: false,
  async: true,
  withCredentials: false,
  crossDomain: false,
  contentType: 'application/json; charset=utf-8',
  dataType: 'json',
  urlSync: true,
  browserHistory: true,
  append: false,
  target: null,
  validateStatus: (status: number) => status >= 200 && status < 300,
};

