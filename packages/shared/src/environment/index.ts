/**
 * Environment detection utilities for SSR compatibility.
 * These utilities help determine the runtime environment (server vs browser).
 */

/**
 * Check if the code is running on the server (Node.js environment).
 * @returns true if running on server, false otherwise
 */
export const isServer = (): boolean => typeof window === 'undefined';

/**
 * Check if the code is running in a browser environment.
 * @returns true if running in browser, false otherwise
 */
export const isBrowser = (): boolean => typeof window !== 'undefined';

/**
 * Safely get the document object.
 * Returns null in SSR environment.
 * @returns Document object or null
 */
export const getDocument = (): Document | null => {
  return isBrowser() ? document : null;
};

/**
 * Safely get the window object.
 * Returns null in SSR environment.
 * @returns Window object or null
 */
export const getWindow = (): Window | null => {
  return isBrowser() ? window : null;
};

/**
 * Safely get the navigator object.
 * Returns null in SSR environment.
 * @returns Navigator object or null
 */
export const getNavigator = (): Navigator | null => {
  return isBrowser() ? navigator : null;
};

/**
 * Safely get the location object.
 * Returns null in SSR environment.
 * @returns Location object or null
 */
export const getLocation = (): Location | null => {
  return isBrowser() ? location : null;
};

/**
 * Execute a callback only in browser environment.
 * Useful for wrapping browser-only code.
 * @param callback - Function to execute in browser
 * @returns Result of callback or undefined in SSR
 */
export const onBrowser = <T>(callback: () => T): T | undefined => {
  if (isBrowser()) {
    return callback();
  }
  return undefined;
};

/**
 * Execute a callback only in server environment.
 * Useful for wrapping server-only code.
 * @param callback - Function to execute on server
 * @returns Result of callback or undefined in browser
 */
export const onServer = <T>(callback: () => T): T | undefined => {
  if (isServer()) {
    return callback();
  }
  return undefined;
};

