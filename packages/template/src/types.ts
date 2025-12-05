/**
 * @natural-js/template types
 */

import type { NaturalElement } from '@natural-js/shared';

/**
 * JoinPoint interface for AOP processing
 */
export interface TemplateJoinPoint {
  /** Proceed with the original method */
  proceed: () => void;
  /** Controller instance */
  target?: Record<string, unknown>;
  /** Method name */
  method?: string;
  /** Arguments passed to the method */
  args?: unknown[];
}

// Alias for backwards compatibility
export type JoinPoint = TemplateJoinPoint;

/**
 * Controller instance with view property
 */
export interface TemplateControllerInstance {
  /** The view element */
  view: NaturalElement;
  /** Deferred for onOpen callback */
  onOpenDefer?: {
    resolve: () => void;
    reject?: (reason?: unknown) => void;
  };
  [key: string]: unknown;
}

// Alias for backwards compatibility
export type ControllerInstance = TemplateControllerInstance;

/**
 * Select component options
 */
export interface TemplateSelectOptions {
  /** Context element */
  context?: HTMLElement | NaturalElement;
  /** Code key for common codes */
  code?: string;
  /** Communicator method name */
  comm?: string;
  /** Key column name */
  key?: string;
  /** Value column name */
  val?: string;
  /** Data array */
  data?: unknown[];
  /** Data filter function */
  filter?: (data: unknown[]) => unknown[];
  /** Pre-selected value */
  selected?: string | number;
}

// Alias for backwards compatibility
export type SelectOptions = TemplateSelectOptions;

/**
 * Component options with common properties
 */
export interface ComponentOptions {
  /** Context element or selector */
  context?: HTMLElement | NaturalElement | string;
  /** URL for popup/tab content */
  url?: string;
  /** Opener controller reference */
  opener?: ControllerInstance;
  /** Usage mode */
  usage?: string | UsageOptions;
  /** Action to perform after initialization */
  action?: string | [string, ...unknown[]];
  /** Code key for select */
  code?: string;
}

/**
 * Usage options for search-box
 */
export interface UsageOptions {
  'search-box'?: {
    defaultButton?: string;
    events?: Array<{
      target: string;
      event: string;
      handler: (event: Event) => void;
    }>;
  };
}

/**
 * Event binding options
 */
export interface EventOptions {
  /** Target selector */
  target?: string;
  /** Event handler */
  handler?: (event: Event, ...args: unknown[]) => void;
}

/**
 * Template AOP options from config
 */
export interface TemplateAopOptions {
  /** Callback before components initialization */
  onBeforeInitComponents?: (cont: ControllerInstance, joinPoint: JoinPoint) => void;
  /** Callback after components initialization */
  onInitComponents?: (cont: ControllerInstance, joinPoint: JoinPoint) => void;
  /** Callback before events initialization */
  onBeforeInitEvents?: (cont: ControllerInstance, joinPoint: JoinPoint) => void;
  /** Callback after events initialization */
  onInitEvents?: (cont: ControllerInstance, joinPoint: JoinPoint) => void;
}

/**
 * Codes AOP options from config
 */
export interface CodesAopOptions {
  /** URL for common codes API */
  codeUrl?: string;
  /** Key column name in code response */
  codeKey?: string;
}

/**
 * Deferred-like interface for component actions
 */
export interface Deferred {
  resolve: () => void;
  reject?: (reason?: unknown) => void;
}
