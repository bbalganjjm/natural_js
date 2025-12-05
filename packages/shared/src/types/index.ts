/**
 * Common type definitions for Natural-JS framework.
 */

// ============================================================================
// Primitive Types
// ============================================================================

/**
 * Primitive value types.
 */
export type Primitive = string | number | boolean | null;

/**
 * JSON-compatible value types.
 */
export type JSONValue = Primitive | undefined | JSONObject | JSONValue[];

/**
 * JSON-compatible object type.
 * Represents any object that can be serialized to JSON.
 */
export interface JSONObject {
  [key: string]: JSONValue;
}

// ============================================================================
// Selector Types
// ============================================================================

/**
 * Selector type - can be a string selector, Element, or array of Elements.
 */
export type Selector = string | Element | Element[] | NodeList | null;

/**
 * Extended selector including NaturalElement (to be defined later).
 */
export type ExtendedSelector = Selector | { elements: Element[] };

// ============================================================================
// Function Types
// ============================================================================

/**
 * Event handler type.
 */
export type EventHandler<E extends Event = Event> = (event: E) => void;

/**
 * Callback function type with optional return value.
 */
export type Callback<T = void, R = void> = (arg: T) => R;

/**
 * Async callback function type.
 */
export type AsyncCallback<T = void, R = void> = (arg: T) => Promise<R>;

/**
 * Void callback function type.
 */
export type VoidCallback = () => void;

/**
 * Error callback function type.
 */
export type ErrorCallback = (error: Error) => void;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Optional type helper - makes all properties optional recursively.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Required type helper - makes all properties required recursively.
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Readonly type helper - makes all properties readonly recursively.
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Nullable type helper.
 */
export type Nullable<T> = T | null;

/**
 * Maybe type helper - value can be null or undefined.
 */
export type Maybe<T> = T | null | undefined;

/**
 * NonNullable recursive type helper.
 */
export type DeepNonNullable<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

// ============================================================================
// Object Type Detection
// ============================================================================

/**
 * Object type constant values returned by type detection utilities.
 */
export type ObjectType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'function'
  | 'undefined'
  | 'null'
  | 'date'
  | 'regexp'
  | 'element'
  | 'nodelist'
  | 'naturalElement'
  | 'symbol'
  | 'bigint'
  | 'map'
  | 'set'
  | 'weakmap'
  | 'weakset'
  | 'promise'
  | 'error';

// ============================================================================
// Browser Detection
// ============================================================================

/**
 * Browser type names for browser detection utilities.
 */
export type BrowserType =
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'edge'
  | 'opera'
  | 'ie'
  | 'ios'
  | 'android'
  | 'unknown';

// ============================================================================
// Internationalization
// ============================================================================

/**
 * Locale string format (e.g., 'en_US', 'ko_KR').
 */
export type Locale = string;

/**
 * Supported locales in Natural-JS.
 */
export type SupportedLocale = 'en_US' | 'ko_KR';

/**
 * Message resource object type for internationalization.
 * Structure: { locale: { key: message } }
 *
 * @example
 * ```typescript
 * const messages: MessageResource = {
 *   'en_US': { 'greeting': 'Hello' },
 *   'ko_KR': { 'greeting': '안녕하세요' }
 * };
 * ```
 */
export interface MessageResource {
  [locale: string]: {
    [key: string]: string;
  };
}

// ============================================================================
// Formatting & Validation
// ============================================================================

/**
 * Rule definition for formatter/validator.
 */
export interface RuleDefinition {
  name: string;
  args?: unknown[];
}

/**
 * Rule object structure for element-based rules.
 */
export interface RuleObject {
  id: {
    [key: string]: [string, ...Primitive[]][];
  };
}

/**
 * Validation result type.
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validation error type.
 */
export interface ValidationError {
  field: string;
  rule: string;
  message: string;
  value?: unknown;
}

/**
 * Format result type.
 */
export interface FormatResult {
  formatted: string;
  original: string;
}

// ============================================================================
// Mask Utility
// ============================================================================

/**
 * Mask processing mode for numeric values.
 */
export type MaskProcessingMode = 'round' | 'ceil' | 'floor';

/**
 * Mask instance interface for formatting values.
 */
export interface MaskInstance {
  /**
   * Sets a generic value for masking operations.
   *
   * @param value - The value to be masked
   * @param deleteLastChar - Whether to delete the last character
   * @returns The masked value
   */
  setGeneric(value: string, deleteLastChar: boolean): string;

  /**
   * Sets a numeric value for masking based on the provided parameters.
   *
   * @param value - The value to be masked
   * @param processingMode - The processing mode (round, ceil, floor)
   * @param deleteLastChar - Whether to delete the last character
   * @returns The masked value
   */
  setNumeric(value: string, processingMode: MaskProcessingMode, deleteLastChar: boolean): string;
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Date info object returned by date parsing utilities.
 */
export interface DateInfo {
  obj: Date;
  format: string;
}

/**
 * Date format options.
 */
export interface DateFormatOptions {
  dateSepa?: string;
  timeSepa?: string;
}

// ============================================================================
// Event System
// ============================================================================

/**
 * Event object type.
 */
export type EventObject = object[];

/**
 * Events object containing multiple event handlers.
 */
export interface EventsObject {
  [eventName: string]: EventObject;
}

/**
 * Event names used in Natural-JS.
 */
export type NaturalEventName =
  | 'click'
  | 'dblclick'
  | 'mousedown'
  | 'mouseup'
  | 'mouseover'
  | 'mouseout'
  | 'mouseenter'
  | 'mouseleave'
  | 'mousemove'
  | 'keydown'
  | 'keyup'
  | 'keypress'
  | 'focus'
  | 'blur'
  | 'focusin'
  | 'focusout'
  | 'change'
  | 'input'
  | 'submit'
  | 'scroll'
  | 'resize'
  | 'load'
  | 'unload'
  | 'error'
  | 'touchstart'
  | 'touchend'
  | 'touchmove'
  | 'touchcancel'
  | 'wheel'
  | 'contextmenu'
  | 'drag'
  | 'dragstart'
  | 'dragend'
  | 'dragenter'
  | 'dragleave'
  | 'dragover'
  | 'drop';

// ============================================================================
// Component System
// ============================================================================

/**
 * Base component options interface.
 */
export interface ComponentOptions {
  context?: Element | null;
  [key: string]: unknown;
}

/**
 * Component lifecycle callbacks.
 */
export interface ComponentLifecycle {
  onInit?: VoidCallback;
  onDestroy?: VoidCallback;
  onUpdate?: VoidCallback;
}

/**
 * Component instance base interface.
 */
export interface ComponentInstance {
  context: () => Element | null;
  destroy?: () => void;
}

// ============================================================================
// HTTP Request Types
// ============================================================================

/**
 * HTTP method types.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * HTTP request options.
 */
export interface HttpRequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  cache?: boolean;
}

/**
 * HTTP response type.
 */
export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

// ============================================================================
// Data Binding
// ============================================================================

/**
 * Data row status for tracking changes.
 */
export type RowStatus = 'insert' | 'update' | 'delete' | 'normal';

/**
 * Data row with status tracking.
 */
export interface DataRow extends JSONObject {
  rowStatus?: RowStatus;
}

/**
 * Data change event.
 */
export interface DataChangeEvent {
  type: 'insert' | 'update' | 'delete' | 'bind';
  rowIndex?: number;
  columnName?: string;
  oldValue?: unknown;
  newValue?: unknown;
}
