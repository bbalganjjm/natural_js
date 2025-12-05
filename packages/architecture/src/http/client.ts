/**
 * HTTP client implementation for Natural-JS framework.
 * Replaces jQuery.ajax with fetch API.
 * SSR compatible with conditional fetch usage.
 */

import { isBrowser, getWindow } from '@natural-js/core';
import {
  RequestConfig,
  NaturalHttpResponse,
  HttpError,
  NaturalHttpMethod,
  ResponseType,
  NormalizedRequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
  InterceptorManager,
  DEFAULT_CONFIG,
} from './types';

/**
 * Create an interceptor manager.
 */
function createInterceptorManager<T>(): InterceptorManager<T> {
  const interceptors: (T | null)[] = [];

  return {
    use(interceptor: T): number {
      interceptors.push(interceptor);
      return interceptors.length - 1;
    },
    eject(id: number): void {
      if (interceptors[id]) {
        interceptors[id] = null;
      }
    },
    clear(): void {
      interceptors.length = 0;
    },
    getAll(): T[] {
      return interceptors.filter((i): i is T => i !== null);
    },
  };
}

/**
 * Serialize data to URL-encoded string.
 */
function serializeParams(params: Record<string, string | number | boolean>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.join('&');
}

/**
 * Build URL with query parameters.
 */
function buildURL(baseURL: string, url: string, params?: Record<string, string | number | boolean>, cache?: boolean): string {
  // Combine base URL and URL
  let fullUrl = url;
  if (baseURL && !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('//')) {
    const base = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    const path = url.startsWith('/') ? url : `/${url}`;
    fullUrl = base + path;
  }

  // Add query parameters
  const queryParams: Record<string, string | number | boolean> = { ...params };

  // Add cache-busting parameter if cache is false
  if (cache === false) {
    queryParams['_'] = Date.now();
  }

  const queryString = serializeParams(queryParams);
  if (queryString) {
    const separator = fullUrl.includes('?') ? '&' : '?';
    fullUrl += separator + queryString;
  }

  return fullUrl;
}

/**
 * Serialize request body based on content type.
 */
function serializeBody(data: unknown, contentType: string | false | undefined): BodyInit | null {
  if (data === null || data === undefined) {
    return null;
  }

  // FormData - don't serialize
  if (data instanceof FormData) {
    return data;
  }

  // Blob or ArrayBuffer - don't serialize
  if (data instanceof Blob || data instanceof ArrayBuffer) {
    return data;
  }

  // String - return as-is
  if (typeof data === 'string') {
    return data;
  }

  // URL-encoded form data
  if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
    if (typeof data === 'object') {
      return serializeParams(data as Record<string, string | number | boolean>);
    }
    return String(data);
  }

  // JSON (default)
  if (contentType && contentType.includes('application/json')) {
    return JSON.stringify(data);
  }

  // Default to JSON for objects
  if (typeof data === 'object') {
    return JSON.stringify(data);
  }

  return String(data);
}

/**
 * Parse response based on data type.
 */
async function parseResponse(response: Response, dataType: ResponseType): Promise<unknown> {
  switch (dataType) {
    case 'json':
      const text = await response.text();
      if (!text || text.trim() === '') {
        return null;
      }
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    case 'text':
    case 'html':
      return response.text();
    case 'blob':
      return response.blob();
    case 'arraybuffer':
      return response.arrayBuffer();
    case 'formdata':
      return response.formData();
    default:
      return response.text();
  }
}

/**
 * Extract headers from Response object.
 */
function extractHeaders(response: Response): Record<string, string> {
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

/**
 * Normalize request configuration.
 */
function normalizeConfig(config: RequestConfig): NormalizedRequestConfig {
  const method: NaturalHttpMethod = config.method ?? config.type ?? 'GET';
  const headers: Record<string, string> = { ...config.headers };

  // Set Content-Type header
  if (config.contentType !== false && config.data !== undefined) {
    const contentType = typeof config.contentType === 'string'
      ? config.contentType
      : 'application/json; charset=utf-8';
    
    // Don't set Content-Type for FormData (browser will set it with boundary)
    if (!(config.data instanceof FormData)) {
      headers['Content-Type'] = contentType;
    }
  }

  // Prepare body
  let body: BodyInit | null = null;
  if (config.data !== undefined && method !== 'GET' && method !== 'HEAD') {
    body = serializeBody(config.data, config.contentType);
  }

  // Determine credentials mode
  let credentials: RequestCredentials | undefined;
  if (config.withCredentials) {
    credentials = 'include';
  } else if (config.crossDomain) {
    credentials = 'same-origin';
  }

  // Determine request mode
  let mode: RequestMode | undefined;
  if (config.crossDomain) {
    mode = 'cors';
  }

  // Determine cache mode
  let cache: RequestCache | undefined;
  if (config.cache === false) {
    cache = 'no-store';
  } else if (config.cache === true) {
    cache = 'default';
  }

  return {
    url: buildURL(config.baseURL ?? '', config.url ?? '', config.params, config.cache),
    method,
    headers,
    body,
    signal: config.signal,
    credentials,
    mode,
    cache,
  };
}

/**
 * Natural-JS HTTP Client class.
 * Provides a fetch-based HTTP client with jQuery.ajax compatibility.
 */
export class NaturalHttpClient {
  /** Default configuration */
  defaults: RequestConfig;

  /** Request interceptors */
  interceptors: {
    request: InterceptorManager<RequestInterceptor>;
    response: InterceptorManager<ResponseInterceptor>;
  };

  constructor(config: RequestConfig = {}) {
    this.defaults = { ...DEFAULT_CONFIG, ...config };
    this.interceptors = {
      request: createInterceptorManager<RequestInterceptor>(),
      response: createInterceptorManager<ResponseInterceptor>(),
    };
  }

  /**
   * Make an HTTP request.
   */
  async request<T = unknown>(config: RequestConfig): Promise<NaturalHttpResponse<T>> {
    // Merge with defaults
    let mergedConfig: RequestConfig = {
      ...this.defaults,
      ...config,
      headers: {
        ...this.defaults.headers,
        ...config.headers,
      },
    };

    // Apply request interceptors
    const requestInterceptors = this.interceptors.request.getAll();
    for (const interceptor of requestInterceptors) {
      mergedConfig = await interceptor(mergedConfig);
    }

    // Transform request data if needed
    if (mergedConfig.transformRequest && mergedConfig.data !== undefined) {
      mergedConfig.data = mergedConfig.transformRequest(
        mergedConfig.data,
        mergedConfig.headers ?? {}
      );
    }

    // Normalize config for fetch
    const normalizedConfig = normalizeConfig(mergedConfig);

    // Create abort controller for timeout
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let abortController: AbortController | undefined;

    if (mergedConfig.timeout && mergedConfig.timeout > 0) {
      abortController = new AbortController();
      normalizedConfig.signal = mergedConfig.signal
        ? mergedConfig.signal
        : abortController.signal;

      timeoutId = setTimeout(() => {
        abortController?.abort();
      }, mergedConfig.timeout);
    }

    try {
      // Get fetch function (support SSR with global fetch or node-fetch)
      const fetchFn = isBrowser() ? getWindow()?.fetch ?? fetch : fetch;

      // Make the request
      const response = await fetchFn(normalizedConfig.url, {
        method: normalizedConfig.method,
        headers: normalizedConfig.headers,
        body: normalizedConfig.body,
        signal: normalizedConfig.signal,
        credentials: normalizedConfig.credentials,
        mode: normalizedConfig.mode,
        cache: normalizedConfig.cache,
      });

      // Clear timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Check status
      const validateStatus = mergedConfig.validateStatus ?? DEFAULT_CONFIG.validateStatus!;
      if (!validateStatus(response.status)) {
        const errorData = await parseResponse(response, mergedConfig.dataType ?? 'text');
        const error = new HttpError({
          message: `Request failed with status ${response.status}`,
          code: `HTTP_${response.status}`,
          status: response.status,
          config: mergedConfig,
          response,
        });
        error.data = errorData;
        throw error;
      }

      // Parse response
      let data = await parseResponse(response, mergedConfig.dataType ?? 'json') as T;

      // Transform response data if needed
      if (mergedConfig.transformResponse) {
        data = mergedConfig.transformResponse(data) as T;
      }

      // Build response object
      let httpResponse: NaturalHttpResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: extractHeaders(response),
        config: mergedConfig,
        response,
      };

      // Apply response interceptors
      const responseInterceptors = this.interceptors.response.getAll();
      for (const interceptor of responseInterceptors) {
        httpResponse = (await interceptor(httpResponse)) as NaturalHttpResponse<T>;
      }

      return httpResponse;
    } catch (error) {
      // Clear timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Handle different error types
      if (error instanceof HttpError) {
        throw error;
      }

      // Check for abort error (DOMException or Error with name 'AbortError')
      const isAbortError =
        (error instanceof DOMException && error.name === 'AbortError') ||
        (error instanceof Error && error.name === 'AbortError');

      if (isAbortError) {
        throw new HttpError({
          message: mergedConfig.timeout ? 'Request timeout' : 'Request aborted',
          code: mergedConfig.timeout ? 'TIMEOUT' : 'ABORTED',
          config: mergedConfig,
          cause: error instanceof Error ? error : undefined,
        });
      }

      if (error instanceof Error) {
        // Network error
        throw new HttpError({
          message: error.message || 'Network error',
          code: 'NETWORK_ERROR',
          config: mergedConfig,
          cause: error,
        });
      }

      // Unknown error
      throw new HttpError({
        message: 'Unknown error',
        code: 'UNKNOWN',
        config: mergedConfig,
      });
    }
  }

  /**
   * Make a GET request.
   */
  get<T = unknown>(url: string, config?: RequestConfig): Promise<NaturalHttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  /**
   * Make a POST request.
   */
  post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<NaturalHttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data });
  }

  /**
   * Make a PUT request.
   */
  put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<NaturalHttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data });
  }

  /**
   * Make a DELETE request.
   */
  delete<T = unknown>(url: string, config?: RequestConfig): Promise<NaturalHttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  /**
   * Make a PATCH request.
   */
  patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<NaturalHttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data });
  }

  /**
   * Make a HEAD request.
   */
  head<T = unknown>(url: string, config?: RequestConfig): Promise<NaturalHttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'HEAD' });
  }

  /**
   * Make an OPTIONS request.
   */
  options<T = unknown>(url: string, config?: RequestConfig): Promise<NaturalHttpResponse<T>> {
    return this.request<T>({ ...config, url, method: 'OPTIONS' });
  }

  /**
   * Create a new instance with merged defaults.
   */
  create(config?: RequestConfig): NaturalHttpClient {
    return new NaturalHttpClient({
      ...this.defaults,
      ...config,
      headers: {
        ...this.defaults.headers,
        ...config?.headers,
      },
    });
  }
}

/**
 * Default HTTP client instance.
 */
export const http = new NaturalHttpClient();

/**
 * Create a new HTTP client instance.
 */
export function createHttpClient(config?: RequestConfig): NaturalHttpClient {
  return new NaturalHttpClient(config);
}

export default http;

