/**
 * Message utilities for Natural-JS framework.
 * Functions for internationalization and message handling.
 * SSR compatible - no browser-specific APIs.
 */

/**
 * Message resource type for a single locale.
 */
export type LocaleMessages = Record<string, string>;

/**
 * Message resource type with multiple locales.
 * Re-uses the MessageResource type from shared if available.
 */
export type I18nResource = Record<string, LocaleMessages>;

/**
 * Default locale for message retrieval.
 */
let defaultLocale = 'en_US';

/**
 * Set the default locale.
 * @param locale - Locale string (e.g., 'ko_KR', 'en_US')
 */
export function setDefaultLocale(locale: string): void {
  defaultLocale = locale;
}

/**
 * Get the current default locale.
 * @returns Current default locale
 */
export function getDefaultLocale(): string {
  return defaultLocale;
}

/**
 * Replace message variables with provided values.
 * Variables in the message are denoted by {0}, {1}, {2}, etc.
 *
 * @param msg - Message string with placeholders
 * @param vars - Array of values to replace placeholders
 * @returns Message with replaced variables
 *
 * @example
 * ```typescript
 * replaceMsgVars('Hello, {0}!', ['World']); // 'Hello, World!'
 * replaceMsgVars('{0} + {1} = {2}', ['1', '2', '3']); // '1 + 2 = 3'
 * ```
 */
export function replaceMsgVars(msg: string, vars?: string[]): string {
  if (vars === undefined || vars.length === 0) {
    return msg;
  }

  let result = msg;
  for (let i = 0; i < vars.length; i++) {
    result = result.split(`{${i}}`).join(vars[i] ?? '');
  }
  return result;
}

/**
 * Get a message from a message resource.
 *
 * @param resource - Message resource object
 * @param key - Message key
 * @param vars - Optional array of values to replace placeholders
 * @param locale - Optional locale override (uses default if not provided)
 * @returns Message string or key if not found
 *
 * @example
 * ```typescript
 * const messages = {
 *   en_US: { greeting: 'Hello, {0}!' },
 *   ko_KR: { greeting: '안녕하세요, {0}님!' }
 * };
 *
 * get(messages, 'greeting', ['John']); // 'Hello, John!'
 * get(messages, 'greeting', ['철수'], 'ko_KR'); // '안녕하세요, 철수님!'
 * get(messages, 'unknown'); // 'unknown'
 * ```
 */
export function get(
  resource: I18nResource,
  key: string,
  vars?: string[],
  locale?: string
): string {
  const loc = locale ?? defaultLocale;
  const localeMessages = resource[loc];

  if (!localeMessages) {
    return key;
  }

  const msg = localeMessages[key];
  return msg !== undefined ? replaceMsgVars(msg, vars) : key;
}

/**
 * Check if a message exists in the resource.
 *
 * @param resource - Message resource object
 * @param key - Message key
 * @param locale - Optional locale override
 * @returns True if message exists
 */
export function has(resource: I18nResource, key: string, locale?: string): boolean {
  const loc = locale ?? defaultLocale;
  const localeMessages = resource[loc];
  return localeMessages !== undefined && localeMessages[key] !== undefined;
}

/**
 * Get all available locales from a message resource.
 *
 * @param resource - Message resource object
 * @returns Array of locale strings
 */
export function getLocales(resource: I18nResource): string[] {
  return Object.keys(resource);
}

/**
 * Create a message getter bound to a specific resource.
 *
 * @param resource - Message resource object
 * @returns Bound get function
 *
 * @example
 * ```typescript
 * const messages = { en_US: { hello: 'Hello!' } };
 * const t = createMessageGetter(messages);
 * t('hello'); // 'Hello!'
 * ```
 */
export function createMessageGetter(
  resource: I18nResource
): (key: string, vars?: string[], locale?: string) => string {
  return (key: string, vars?: string[], locale?: string) => get(resource, key, vars, locale);
}

/**
 * Message utilities namespace object.
 */
export const message = {
  setDefaultLocale,
  getDefaultLocale,
  replaceMsgVars,
  get,
  has,
  getLocales,
  createMessageGetter,
} as const;

export default message;

