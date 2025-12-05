/**
 * Communicator class implementation for Natural-JS framework.
 * Provides N.comm() functionality with fetch-based HTTP client.
 */

import { isBrowser, getDocument } from '@natural-js/core';
import { NaturalHttpClient, createHttpClient } from '../http/client';
import { HttpError, type NaturalHttpResponse, type RequestConfig } from '../http/types';
import { getFilterChain } from '../filters/chain';
import type { FilterContext } from '../filters/types';
import { Request, type RequestOptions } from '../request';

/**
 * Communicator error handler callback type.
 */
export type CommunicatorErrorHandler = (
  error: Error,
  request: Request,
  response?: Response,
  statusText?: string
) => void;

/**
 * Success callback type.
 */
export type SuccessCallback<T = unknown> = (data: T, request: Request) => void;

/**
 * Communicator options.
 */
export interface CommunicatorOptions extends Partial<RequestOptions> {
  /** HTTP client instance to use */
  httpClient?: NaturalHttpClient;
}

/**
 * Communicator class - manages HTTP communication with filter support.
 * Equivalent to N.comm() in the original Natural-JS.
 *
 * @example
 * ```typescript
 * // Create communicator with URL
 * const comm = new Communicator('/api/users');
 *
 * // Create with data and URL
 * const comm = new Communicator({ name: 'John' }, '/api/users');
 *
 * // Submit request
 * const response = await comm.submit();
 * console.log(response.data);
 *
 * // With callback
 * comm.submit((data) => console.log(data));
 *
 * // Error handling
 * comm.error((err, request) => console.error(err));
 * ```
 */
export class Communicator<T = unknown> {
  /** Request object */
  request: Request;

  /** Error handlers */
  private errorHandlers: CommunicatorErrorHandler[];

  /** HTTP client instance */
  private httpClient: NaturalHttpClient;

  /** Target element (for HTML page loading) */
  private target: Element | null = null;

  /** Original data passed to constructor */
  private originalData: unknown;

  constructor(data: unknown, url?: string | Partial<RequestOptions>);
  constructor(url: string | Partial<RequestOptions>);
  constructor(dataOrUrl: unknown, urlOrOptions?: string | Partial<RequestOptions>) {
    this.errorHandlers = [];
    this.httpClient = createHttpClient();

    // Parse arguments
    let data: unknown = null;
    let options: Partial<RequestOptions> = {};

    if (typeof dataOrUrl === 'string') {
      // First argument is URL
      options.url = dataOrUrl;
    } else if (dataOrUrl !== null && dataOrUrl !== undefined) {
      if (typeof dataOrUrl === 'object' && 'url' in dataOrUrl) {
        // First argument is options object
        options = dataOrUrl as Partial<RequestOptions>;
      } else {
        // First argument is data
        data = dataOrUrl;
        this.originalData = data;

        if (typeof urlOrOptions === 'string') {
          options.url = urlOrOptions;
        } else if (urlOrOptions) {
          options = urlOrOptions;
        }
      }
    }

    if (typeof urlOrOptions === 'string' && !options.url) {
      options.url = urlOrOptions;
    } else if (typeof urlOrOptions === 'object' && urlOrOptions !== null) {
      options = { ...options, ...urlOrOptions };
    }

    // Set data if provided
    if (data !== null) {
      options.data = data;
    }

    // Create request object
    this.request = new Request(this, options);
  }

  /**
   * Submit the request.
   *
   * @param callback - Optional success callback
   * @returns Promise resolving to response or this for chaining
   */
  async submit<R = T>(callback?: SuccessCallback<R>): Promise<NaturalHttpResponse<R> | this> {
    const filterChain = getFilterChain();

    // Create filter context
    const context: FilterContext<R> = filterChain.createContext(
      this,
      this.request.options
    );

    // Run afterInit filters
    const afterInitResult = await filterChain.runAfterInit(context);
    if (afterInitResult.stopped) {
      return this;
    }

    // Determine if this is an HTML page request
    const isHtmlRequest = this.request.options.dataType === 'html';

    // Build request config
    const config: RequestConfig = {
      ...this.request.options,
      url: this.request.options.url,
    };

    // Run beforeSend filters
    const beforeSendResult = await filterChain.runBeforeSend(context);
    if (beforeSendResult.stopped) {
      return this;
    }

    try {
      // Make the HTTP request
      const response = await this.httpClient.request<R>(config);

      // Update context with response
      context.response = response;
      context.status = response.status;
      context.statusText = response.statusText;

      // Run success filters
      const successResult = await filterChain.runSuccess(context);
      if (successResult.stopped) {
        return this;
      }

      // Get potentially transformed data
      const data = (successResult.data ?? response.data) as R;

      // Handle HTML response (page loading)
      if (isHtmlRequest && isBrowser()) {
        await this.handleHtmlResponse(data as unknown as string);
      }

      // Call success callback if provided
      if (callback) {
        try {
          callback(data, this.request);
        } catch (e) {
          await this.handleError(e instanceof Error ? e : new Error(String(e)), response.response);
          throw e;
        }
      }

      // Run complete filters
      await filterChain.runComplete(context);

      if (callback) {
        return this;
      }

      return response;
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));

      // Update context with error
      context.error = error;
      if (e instanceof HttpError) {
        context.status = e.status;
        context.response = e.response as unknown as NaturalHttpResponse<R>;
      }

      // Run error filters
      const errorResult = await filterChain.runError(context);
      if (!errorResult.stopped) {
        await this.handleError(error, e instanceof HttpError ? e.response : undefined);
      }

      // Run complete filters
      await filterChain.runComplete(context);

      throw error;
    }
  }

  /**
   * Register an error handler.
   *
   * @param callback - Error handler callback
   * @returns this for chaining
   */
  error(callback: CommunicatorErrorHandler): this {
    this.errorHandlers.push(callback);
    return this;
  }

  /**
   * Handle error by calling registered error handlers.
   */
  private async handleError(error: Error, response?: Response): Promise<void> {
    if (this.errorHandlers.length > 0) {
      for (const handler of this.errorHandlers) {
        handler(error, this.request, response, response?.statusText);
      }
    }
  }

  /**
   * Handle HTML response by inserting into target element.
   */
  private async handleHtmlResponse(html: string): Promise<void> {
    const target = this.request.options.target ?? this.target;
    if (!target || !isBrowser()) return;

    const doc = getDocument();
    if (!doc) return;

    if (this.request.options.append) {
      // Append mode
      const temp = doc.createElement('div');
      temp.innerHTML = html;
      while (temp.firstChild) {
        target.appendChild(temp.firstChild);
      }
    } else {
      // Replace mode
      target.innerHTML = html;
    }

    // Trigger controller init if needed
    // This would be handled by the controller module
  }

  /**
   * Set target element for HTML responses.
   */
  setTarget(element: Element): this {
    this.target = element;
    this.request.options.target = element;
    return this;
  }

  /**
   * Get target element.
   */
  getTarget(): Element | null {
    return this.target ?? this.request.options.target ?? null;
  }

  /**
   * Set HTTP client instance.
   */
  setHttpClient(client: NaturalHttpClient): this {
    this.httpClient = client;
    return this;
  }

  /**
   * Get the original data passed to constructor.
   */
  getData(): unknown {
    return this.originalData;
  }

  /**
   * Update request data.
   */
  setData(data: unknown): this {
    this.originalData = data;
    this.request.options.data = data;
    return this;
  }

  /**
   * Get request URL.
   */
  getUrl(): string {
    return this.request.options.url;
  }

  /**
   * Set request URL.
   */
  setUrl(url: string): this {
    this.request.options.url = url;
    return this;
  }
}

/**
 * Create a new Communicator instance.
 * Equivalent to N.comm() function.
 *
 * @param dataOrUrl - Data object or URL string
 * @param urlOrOptions - URL string or options object
 * @returns New Communicator instance
 */
export function comm<T = unknown>(
  dataOrUrl: unknown,
  urlOrOptions?: string | Partial<RequestOptions>
): Communicator<T> {
  return new Communicator<T>(dataOrUrl, urlOrOptions);
}

export default Communicator;

