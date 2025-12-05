/**
 * Request type definitions for Natural-JS framework.
 */

import type { RequestConfig } from '../http/types';

/**
 * Request options extending HTTP config with communication-specific options.
 */
export interface RequestOptions extends RequestConfig {
  /** Target URL */
  url: string;

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

  /** Whether the data is an array (for serialization) */
  dataIsArray?: boolean;
}

/**
 * Default request options.
 */
export const DEFAULT_REQUEST_OPTIONS: Partial<RequestOptions> = {
  contentType: 'application/json; charset=utf-8',
  cache: false,
  method: 'POST',
  dataType: 'json',
  urlSync: true,
  browserHistory: true,
  append: false,
  target: null,
  dataIsArray: false,
};

/**
 * Request attributes storage.
 */
export type RequestAttributes = Record<string, unknown>;

/**
 * Query parameters type.
 */
export type QueryParams = Record<string, string | boolean>;

