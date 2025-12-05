/**
 * Context class implementation for Natural-JS framework.
 * Provides global configuration storage, equivalent to N.context.
 */

// Import configuration types from core
import type {
  NaturalConfig,
  CoreConfig,
  ArchitectureConfig,
  DataConfig,
  UIConfig,
} from '@natural-js/core';

/**
 * Advisor configuration for AOP (simplified for Context).
 * Full definition in controller/types.ts
 */
export interface ContextAdvisor {
  /** Pointcut definition */
  pointcut: string | ContextPointcutDefinition;

  /** Advice type */
  adviceType: 'before' | 'after' | 'around' | 'error';

  /** Advice function */
  fn: (
    controller: unknown,
    fnPath: string,
    args: unknown[],
    resultOrJoinPoint?: unknown
  ) => unknown;
}

/**
 * Pointcut definition object (simplified for Context).
 * Full definition in controller/types.ts
 */
export interface ContextPointcutDefinition {
  /** Pointcut type (e.g., 'regexp') */
  type: string;

  /** Pointcut parameter (e.g., regex pattern) */
  param: string | RegExp;

  /** View selector to filter controllers */
  selector?: string;
}

/**
 * Pointcut matcher function (simplified for Context).
 * Full definition in controller/types.ts
 */
export interface ContextPointcutMatcher {
  fn: (param: string | RegExp, controller: unknown, fnPath: string) => boolean;
}

/**
 * Context attributes storage type.
 */
export type ContextAttributes = Record<string, unknown>;

/**
 * Context class - global configuration storage for Natural-JS.
 * Equivalent to N.context in the original framework.
 *
 * @example
 * ```typescript
 * // Set configuration
 * context.attr('architecture', { comm: { filters: {} } });
 *
 * // Get configuration
 * const archConfig = context.attr('architecture');
 *
 * // Typed access
 * const coreConfig = context.attr<CoreConfig>('core');
 * ```
 */
export class Context {
  /** Storage for context attributes */
  private attrObj: ContextAttributes;

  constructor(initialConfig?: NaturalConfig) {
    this.attrObj = initialConfig ? { ...initialConfig } : {};
  }

  /**
   * Get or set context attribute.
   *
   * @param name - Attribute name
   * @param value - Attribute value (optional, gets if not provided)
   * @returns Attribute value, or this for chaining when setting
   *
   * @example
   * ```typescript
   * // Set
   * context.attr('core', { spltSepa: '\u241e' });
   *
   * // Get
   * const core = context.attr('core');
   * ```
   */
  attr(): ContextAttributes;
  attr<T = unknown>(name: string): T | undefined;
  attr<T = unknown>(name: string, value: T): this;
  attr<T = unknown>(name?: string, value?: T): ContextAttributes | T | undefined | this {
    if (name === undefined) {
      return this.attrObj;
    }

    if (value !== undefined) {
      this.attrObj[name] = value;
      return this;
    }

    return this.attrObj[name] as T | undefined;
  }

  /**
   * Remove a context attribute.
   */
  removeAttr(name: string): this {
    delete this.attrObj[name];
    return this;
  }

  /**
   * Check if context has an attribute.
   */
  hasAttr(name: string): boolean {
    return name in this.attrObj;
  }

  /**
   * Get core configuration.
   */
  getCore(): CoreConfig | undefined {
    return this.attr<CoreConfig>('core');
  }

  /**
   * Get architecture configuration.
   */
  getArchitecture(): ArchitectureConfig | undefined {
    return this.attr<ArchitectureConfig>('architecture');
  }

  /**
   * Get data configuration.
   */
  getData(): DataConfig | undefined {
    return this.attr<DataConfig>('data');
  }

  /**
   * Get UI configuration.
   */
  getUI(): UIConfig | undefined {
    return this.attr<UIConfig>('ui');
  }

  /**
   * Merge configuration into existing configuration.
   */
  merge(config: NaturalConfig): this {
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'object' && value !== null) {
        const existing = this.attrObj[key];
        if (existing && typeof existing === 'object') {
          this.attrObj[key] = { ...existing, ...value };
        } else {
          this.attrObj[key] = value;
        }
      } else {
        this.attrObj[key] = value;
      }
    }
    return this;
  }

  /**
   * Clear all context attributes.
   */
  clear(): this {
    this.attrObj = {};
    return this;
  }
}

/**
 * Global context instance.
 */
let globalContext: Context | null = null;

/**
 * Get the global context instance.
 */
export function getContext(): Context {
  if (!globalContext) {
    globalContext = new Context();
  }
  return globalContext;
}

/**
 * Initialize global context with configuration.
 */
export function initContext(config?: NaturalConfig): Context {
  globalContext = new Context(config);
  return globalContext;
}

/**
 * Create a new context instance.
 */
export function createContext(config?: NaturalConfig): Context {
  return new Context(config);
}

export default Context;
