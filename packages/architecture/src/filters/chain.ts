/**
 * Communication Filter Chain implementation for Natural-JS framework.
 * Manages filter registration, ordering, and execution.
 */

import type {
  FilterContext,
  FilterDefinition,
  FiltersConfig,
  CompiledFilterConfig,
  OrderedFilter,
  BeforeInitHandler,
  AfterInitHandler,
  BeforeSendHandler,
  SuccessHandler,
  ErrorHandler,
  CompleteHandler,
  FilterChainResult,
} from './types';
import type { RequestConfig, NaturalHttpResponse } from '../http/types';

/**
 * Default filter order when not specified.
 */
const DEFAULT_ORDER = 1000;

/**
 * Sort filters by order (lower first).
 */
function sortByOrder<T extends OrderedFilter>(filters: T[]): T[] {
  return [...filters].sort((a, b) => a.order - b.order);
}

/**
 * FilterChain class manages communication filters.
 * Provides methods to initialize, compile, and run filters at different stages.
 */
export class FilterChain {
  /** Compiled filter configuration */
  private config: CompiledFilterConfig;

  /** Raw filters configuration */
  private rawFilters: FiltersConfig;

  constructor(filters: FiltersConfig = {}) {
    this.rawFilters = filters;
    this.config = this.compileFilters(filters);
  }

  /**
   * Compile filters from configuration.
   * Sorts filters by order and groups by stage.
   */
  private compileFilters(filters: FiltersConfig): CompiledFilterConfig {
    const beforeInitFilters: OrderedFilter<BeforeInitHandler>[] = [];
    const afterInitFilters: OrderedFilter<AfterInitHandler>[] = [];
    const beforeSendFilters: OrderedFilter<BeforeSendHandler>[] = [];
    const successFilters: OrderedFilter<SuccessHandler>[] = [];
    const errorFilters: OrderedFilter<ErrorHandler>[] = [];
    const completeFilters: OrderedFilter<CompleteHandler>[] = [];

    // Collect ordered filter keys first
    const orderedKeys: { key: string; order: number }[] = [];
    const unorderedKeys: string[] = [];

    for (const key of Object.keys(filters)) {
      const filter = filters[key];
      if (filter && filter.order !== undefined) {
        orderedKeys.push({ key, order: filter.order });
      } else {
        unorderedKeys.push(key);
      }
    }

    // Sort ordered keys
    orderedKeys.sort((a, b) => a.order - b.order);

    // Process filters in order (ordered first, then unordered)
    const allKeys = [...orderedKeys.map((o) => o.key), ...unorderedKeys];

    for (const key of allKeys) {
      const filter = filters[key];
      if (!filter) continue;

      const order = filter.order ?? DEFAULT_ORDER;

      if (filter.beforeInit) {
        beforeInitFilters.push({ name: key, order, handler: filter.beforeInit });
      }
      if (filter.afterInit) {
        afterInitFilters.push({ name: key, order, handler: filter.afterInit });
      }
      if (filter.beforeSend) {
        beforeSendFilters.push({ name: key, order, handler: filter.beforeSend });
      }
      if (filter.success) {
        successFilters.push({ name: key, order, handler: filter.success });
      }
      if (filter.error) {
        errorFilters.push({ name: key, order, handler: filter.error });
      }
      if (filter.complete) {
        completeFilters.push({ name: key, order, handler: filter.complete });
      }
    }

    return {
      beforeInitFilters: sortByOrder(beforeInitFilters),
      afterInitFilters: sortByOrder(afterInitFilters),
      beforeSendFilters: sortByOrder(beforeSendFilters),
      successFilters: sortByOrder(successFilters),
      errorFilters: sortByOrder(errorFilters),
      completeFilters: sortByOrder(completeFilters),
    };
  }

  /**
   * Reinitialize filters with new configuration.
   */
  init(filters: FiltersConfig): this {
    this.rawFilters = filters;
    this.config = this.compileFilters(filters);
    return this;
  }

  /**
   * Add a filter at runtime.
   */
  addFilter(name: string, filter: FilterDefinition): this {
    this.rawFilters[name] = filter;
    this.config = this.compileFilters(this.rawFilters);
    return this;
  }

  /**
   * Remove a filter by name.
   */
  removeFilter(name: string): this {
    delete this.rawFilters[name];
    this.config = this.compileFilters(this.rawFilters);
    return this;
  }

  /**
   * Get compiled filter configuration.
   */
  getConfig(): CompiledFilterConfig {
    return this.config;
  }

  /**
   * Create a filter context.
   */
  createContext<T = unknown>(
    communicator: unknown,
    request: RequestConfig,
    response?: NaturalHttpResponse<T>,
    error?: Error
  ): FilterContext<T> {
    return {
      communicator,
      request,
      response,
      error,
      status: response?.status,
      statusText: response?.statusText,
      metadata: {},
    };
  }

  /**
   * Run beforeInit filters.
   * Can modify or replace the communicator.
   */
  async runBeforeInit<T = unknown>(context: FilterContext<T>): Promise<FilterChainResult<T>> {
    let currentCommunicator = context.communicator;

    for (const filter of this.config.beforeInitFilters) {
      try {
        const result = await filter.handler(context);

        if (result instanceof Error) {
          return {
            stopped: true,
            error: result,
            context: { ...context, communicator: currentCommunicator },
          };
        }

        if (result !== undefined) {
          currentCommunicator = result;
          context.communicator = currentCommunicator;
        }
      } catch (e) {
        return {
          stopped: true,
          error: e instanceof Error ? e : new Error(String(e)),
          context,
        };
      }
    }

    return {
      stopped: false,
      context: { ...context, communicator: currentCommunicator },
    };
  }

  /**
   * Run afterInit filters.
   */
  async runAfterInit<T = unknown>(context: FilterContext<T>): Promise<FilterChainResult<T>> {
    for (const filter of this.config.afterInitFilters) {
      try {
        const result = await filter.handler(context);

        if (result instanceof Error) {
          return { stopped: true, error: result, context };
        }
      } catch (e) {
        return {
          stopped: true,
          error: e instanceof Error ? e : new Error(String(e)),
          context,
        };
      }
    }

    return { stopped: false, context };
  }

  /**
   * Run beforeSend filters.
   */
  async runBeforeSend<T = unknown>(context: FilterContext<T>): Promise<FilterChainResult<T>> {
    for (const filter of this.config.beforeSendFilters) {
      try {
        const result = await filter.handler(context);

        if (result instanceof Error) {
          return { stopped: true, error: result, context };
        }
      } catch (e) {
        return {
          stopped: true,
          error: e instanceof Error ? e : new Error(String(e)),
          context,
        };
      }
    }

    return { stopped: false, context };
  }

  /**
   * Run success filters.
   * Can transform response data.
   */
  async runSuccess<T = unknown>(context: FilterContext<T>): Promise<FilterChainResult<T>> {
    let data = context.response?.data;

    for (const filter of this.config.successFilters) {
      try {
        const result = await filter.handler(context);

        if (result instanceof Error) {
          return { stopped: true, error: result, data: data as T, context };
        }

        if (result !== undefined) {
          data = result as T;
          // Update context response data
          if (context.response) {
            context.response = { ...context.response, data: data as T };
          }
        }
      } catch (e) {
        return {
          stopped: true,
          error: e instanceof Error ? e : new Error(String(e)),
          data: data as T,
          context,
        };
      }
    }

    return { stopped: false, data: data as T, context };
  }

  /**
   * Run error filters.
   */
  async runError<T = unknown>(context: FilterContext<T>): Promise<FilterChainResult<T>> {
    for (const filter of this.config.errorFilters) {
      try {
        const result = await filter.handler(context);

        if (result instanceof Error) {
          return { stopped: true, error: result, context };
        }
      } catch (e) {
        return {
          stopped: true,
          error: e instanceof Error ? e : new Error(String(e)),
          context,
        };
      }
    }

    return { stopped: false, context };
  }

  /**
   * Run complete filters.
   */
  async runComplete<T = unknown>(context: FilterContext<T>): Promise<FilterChainResult<T>> {
    for (const filter of this.config.completeFilters) {
      try {
        const result = await filter.handler(context);

        if (result instanceof Error) {
          return { stopped: true, error: result, context };
        }
      } catch (e) {
        return {
          stopped: true,
          error: e instanceof Error ? e : new Error(String(e)),
          context,
        };
      }
    }

    return { stopped: false, context };
  }

  /**
   * Get count of filters by stage.
   */
  getFilterCount(): Record<string, number> {
    return {
      beforeInit: this.config.beforeInitFilters.length,
      afterInit: this.config.afterInitFilters.length,
      beforeSend: this.config.beforeSendFilters.length,
      success: this.config.successFilters.length,
      error: this.config.errorFilters.length,
      complete: this.config.completeFilters.length,
    };
  }

  /**
   * Check if any filters are registered.
   */
  hasFilters(): boolean {
    const count = this.getFilterCount();
    return Object.values(count).some((c) => c > 0);
  }

  /**
   * Clear all filters.
   */
  clear(): this {
    this.rawFilters = {};
    this.config = this.compileFilters({});
    return this;
  }
}

/**
 * Global filter chain instance.
 */
let globalFilterChain: FilterChain | null = null;

/**
 * Get or create the global filter chain.
 */
export function getFilterChain(): FilterChain {
  if (!globalFilterChain) {
    globalFilterChain = new FilterChain();
  }
  return globalFilterChain;
}

/**
 * Initialize global filter chain with configuration.
 */
export function initFilterConfig(filters: FiltersConfig): FilterChain {
  globalFilterChain = new FilterChain(filters);
  return globalFilterChain;
}

/**
 * Create a new filter chain instance.
 */
export function createFilterChain(filters?: FiltersConfig): FilterChain {
  return new FilterChain(filters);
}

export default FilterChain;

