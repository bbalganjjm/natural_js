/**
 * Communication Filter type definitions for Natural-JS framework.
 * Defines filter interfaces for request/response processing pipeline.
 */

import type { RequestConfig, NaturalHttpResponse } from '../http/types';

/**
 * Filter execution stages in the communication lifecycle.
 */
export type FilterStage =
  | 'beforeInit'
  | 'afterInit'
  | 'beforeSend'
  | 'success'
  | 'error'
  | 'complete';

/**
 * Filter context passed to filter handlers.
 */
export interface FilterContext<T = unknown> {
  /** The communicator instance */
  communicator: unknown;

  /** Request configuration */
  request: RequestConfig;

  /** Response data (available in success/error/complete stages) */
  response?: NaturalHttpResponse<T>;

  /** Error object (available in error stage) */
  error?: Error;

  /** HTTP status code (available in success/error/complete stages) */
  status?: number;

  /** HTTP status text (available in success/error/complete stages) */
  statusText?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * BeforeInit filter handler.
 * Called before request initialization.
 * Can modify or replace the communicator instance.
 *
 * @param context - Filter context with communicator
 * @returns Modified communicator, Error to stop chain, or undefined
 */
export type BeforeInitHandler<T = unknown> = (
  context: FilterContext<T>
) => unknown | Error | undefined | Promise<unknown | Error | undefined>;

/**
 * AfterInit filter handler.
 * Called after request initialization, before sending.
 * Can modify request configuration.
 *
 * @param context - Filter context with request
 * @returns Error to stop chain, or undefined
 */
export type AfterInitHandler<T = unknown> = (
  context: FilterContext<T>
) => Error | void | Promise<Error | void>;

/**
 * BeforeSend filter handler.
 * Called immediately before sending the request.
 *
 * @param context - Filter context with final request config
 * @returns Error to stop chain, or undefined
 */
export type BeforeSendHandler<T = unknown> = (
  context: FilterContext<T>
) => Error | void | Promise<Error | void>;

/**
 * Success filter handler.
 * Called on successful response.
 * Can transform response data.
 *
 * @param context - Filter context with response
 * @returns Transformed data, Error to stop chain, or undefined
 */
export type SuccessHandler<T = unknown, R = T> = (
  context: FilterContext<T>
) => R | Error | void | Promise<R | Error | void>;

/**
 * Error filter handler.
 * Called on error response.
 *
 * @param context - Filter context with error
 * @returns Error to stop chain, or undefined
 */
export type ErrorHandler<T = unknown> = (
  context: FilterContext<T>
) => Error | void | Promise<Error | void>;

/**
 * Complete filter handler.
 * Called after request completion (success or error).
 *
 * @param context - Filter context with final state
 * @returns Error to stop chain, or undefined
 */
export type CompleteHandler<T = unknown> = (
  context: FilterContext<T>
) => Error | void | Promise<Error | void>;

/**
 * Filter handler union type.
 */
export type FilterHandler<T = unknown> =
  | BeforeInitHandler<T>
  | AfterInitHandler<T>
  | BeforeSendHandler<T>
  | SuccessHandler<T>
  | ErrorHandler<T>
  | CompleteHandler<T>;

/**
 * Filter definition with optional execution order.
 */
export interface FilterDefinition<T = unknown> {
  /** Filter execution order (lower numbers execute first) */
  order?: number;

  /** BeforeInit filter handler */
  beforeInit?: BeforeInitHandler<T>;

  /** AfterInit filter handler */
  afterInit?: AfterInitHandler<T>;

  /** BeforeSend filter handler */
  beforeSend?: BeforeSendHandler<T>;

  /** Success filter handler */
  success?: SuccessHandler<T>;

  /** Error filter handler */
  error?: ErrorHandler<T>;

  /** Complete filter handler */
  complete?: CompleteHandler<T>;
}

/**
 * Named filters configuration.
 */
export type FiltersConfig = Record<string, FilterDefinition>;

/**
 * Internal filter entry with order.
 */
export interface OrderedFilter<H extends FilterHandler = FilterHandler> {
  /** Filter name */
  name: string;

  /** Execution order */
  order: number;

  /** Filter handler */
  handler: H;
}

/**
 * Compiled filter configuration.
 */
export interface CompiledFilterConfig {
  beforeInitFilters: OrderedFilter<BeforeInitHandler>[];
  afterInitFilters: OrderedFilter<AfterInitHandler>[];
  beforeSendFilters: OrderedFilter<BeforeSendHandler>[];
  successFilters: OrderedFilter<SuccessHandler>[];
  errorFilters: OrderedFilter<ErrorHandler>[];
  completeFilters: OrderedFilter<CompleteHandler>[];
}

/**
 * Filter chain result.
 */
export interface FilterChainResult<T = unknown> {
  /** Whether the chain was stopped */
  stopped: boolean;

  /** Error that stopped the chain */
  error?: Error;

  /** Transformed data (for success filters) */
  data?: T;

  /** Modified context */
  context: FilterContext<T>;
}

