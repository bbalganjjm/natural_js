/**
 * Request class implementation for Natural-JS framework.
 * Manages request configuration, attributes, and query parameters.
 */

import { isBrowser, getWindow } from '@natural-js/core';
import type { RequestOptions, RequestAttributes, QueryParams } from './types';
import { DEFAULT_REQUEST_OPTIONS } from './types';

// Re-export types
export * from './types';

/**
 * Request class - manages request configuration and attributes.
 * Provides methods to get/set attributes, parse query parameters, and reload.
 */
export class Request {
  /** Request options/configuration */
  options: RequestOptions;

  /** Custom attributes storage */
  private attrObj: RequestAttributes;

  /** Reference to parent communicator */
  private communicator: unknown;

  constructor(communicator: unknown, opts: Partial<RequestOptions>) {
    // Initialize with defaults
    this.options = {
      ...DEFAULT_REQUEST_OPTIONS,
      url: '',
      referrer: isBrowser() ? getWindow()?.location.href : undefined,
      ...opts,
    } as RequestOptions;

    this.attrObj = {};
    this.communicator = communicator;

    // Process data serialization
    this.processData();
  }

  /**
   * Process and serialize request data.
   */
  private processData(): void {
    if (this.options.data === null || this.options.data === undefined) {
      return;
    }

    const data = this.options.data;

    // Handle object/array data
    if (typeof data === 'object') {
      try {
        this.options.data = JSON.stringify(data);
      } catch {
        this.options.data = null;
      }
    }

    // Handle GET parameters
    if (
      this.options.data !== null &&
      typeof this.options.data === 'string' &&
      this.options.method?.toUpperCase() === 'GET'
    ) {
      const firstChar = this.options.data.charAt(0);
      const lastChar = this.options.data.charAt(this.options.data.length - 1);

      // If data is JSON, encode it as 'q' parameter
      if ((firstChar === '{' && lastChar === '}') || (firstChar === '[' && lastChar === ']')) {
        this.options.data = 'q=' + encodeURI(this.options.data);
      }
    }
  }

  /**
   * Get or set request attribute.
   *
   * @param name - Attribute name (optional, returns all if not provided)
   * @param value - Attribute value (optional, gets if not provided)
   * @returns Attribute value, all attributes, or communicator for chaining
   *
   * @example
   * ```typescript
   * // Set attribute
   * request.attr('customKey', 'value');
   *
   * // Get attribute
   * const value = request.attr('customKey');
   *
   * // Get all attributes
   * const all = request.attr();
   * ```
   */
  attr(): RequestAttributes;
  attr(name: string): unknown;
  attr(name: string, value: unknown): unknown;
  attr(name?: string, value?: unknown): RequestAttributes | unknown {
    if (name === undefined) {
      return this.attrObj;
    }

    if (value === undefined) {
      return this.attrObj[name];
    }

    this.attrObj[name] = value;
    return this.communicator;
  }

  /**
   * Remove a request attribute.
   *
   * @param name - Attribute name to remove
   * @returns this for chaining
   */
  removeAttr(name: string): this {
    if (this.attrObj[name] !== undefined) {
      delete this.attrObj[name];
    }
    return this;
  }

  /**
   * Get query parameters from request URL.
   *
   * @param name - Parameter name (optional, returns all if not provided)
   * @returns Parameter value or all parameters
   *
   * @example
   * ```typescript
   * // URL: /api/users?page=1&limit=10
   * request.param('page'); // '1'
   * request.param(); // { page: '1', limit: '10' }
   * ```
   */
  param(): QueryParams;
  param(name: string): string | boolean | undefined;
  param(name?: string): QueryParams | string | boolean | undefined {
    const url = this.options.url;

    if (!url || url.indexOf('?') < 0) {
      return name === undefined ? {} : undefined;
    }

    const params: QueryParams = {};
    const queryString = url.split('?')[1];

    if (queryString) {
      const parts = queryString.split('&');
      for (const part of parts) {
        const [key, value] = part.split('=');
        if (key) {
          params[key] = value ? decodeURIComponent(value) : true;
        }
      }
    }

    if (name === undefined) {
      return params;
    }

    return params[name];
  }

  /**
   * Get request option value.
   *
   * @param key - Option key (optional, returns all if not provided)
   * @returns Option value or all options
   */
  get(): RequestOptions;
  get<K extends keyof RequestOptions>(key: K): RequestOptions[K];
  get<K extends keyof RequestOptions>(key?: K): RequestOptions | RequestOptions[K] {
    if (key !== undefined) {
      return this.options[key];
    }
    return this.options;
  }

  /**
   * Set request option value.
   *
   * @param key - Option key
   * @param value - Option value
   * @returns this for chaining
   */
  set<K extends keyof RequestOptions>(key: K, value: RequestOptions[K]): this {
    this.options[key] = value;
    return this;
  }

  /**
   * Reload the request (re-submit to the same URL).
   * Requires a communicator with submit capability.
   *
   * @param callback - Optional callback for the reload request
   * @returns this for chaining
   */
  async reload<T = unknown>(callback?: (data: T) => void): Promise<this> {
    const comm = this.communicator as {
      submit: <T>(callback?: (data: T) => void) => Promise<unknown>;
    };

    if (comm && typeof comm.submit === 'function') {
      await comm.submit<T>(callback);
    }

    return this;
  }

  /**
   * Get the communicator reference.
   */
  getCommunicator(): unknown {
    return this.communicator;
  }

  /**
   * Update communicator reference.
   */
  setCommunicator(communicator: unknown): this {
    this.communicator = communicator;
    return this;
  }

  /**
   * Clone this request with optional option overrides.
   */
  clone(overrides?: Partial<RequestOptions>): Request {
    return new Request(this.communicator, {
      ...this.options,
      ...overrides,
    });
  }

  /**
   * Get the full URL with query parameters.
   */
  getFullUrl(): string {
    let url = this.options.url;

    if (this.options.params) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(this.options.params)) {
        params.append(key, String(value));
      }
      const queryString = params.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    return url;
  }
}

/**
 * Create a new Request instance.
 */
export function createRequest(communicator: unknown, opts: Partial<RequestOptions>): Request {
  return new Request(communicator, opts);
}

export default Request;

