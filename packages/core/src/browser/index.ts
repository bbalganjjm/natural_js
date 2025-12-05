/**
 * Browser utilities for Natural-JS framework.
 * Functions for browser detection, cookies, and other browser-specific operations.
 * SSR compatible - returns safe defaults in server environment.
 */

import { isBrowser, getDocument, getWindow, getNavigator, getLocation } from '@natural-js/shared';

/**
 * Browser type for detection.
 */
export type BrowserName = 'chrome' | 'firefox' | 'safari' | 'opera' | 'ie' | 'edge' | 'ios' | 'android' | 'mobile';

// ============================================================================
// Cookie Management
// ============================================================================

/**
 * Get a cookie value by name.
 *
 * @param name - Cookie name
 * @returns Cookie value or undefined if not found
 *
 * @example
 * ```typescript
 * const value = getCookie('session');
 * ```
 */
export function getCookie(name: string): string | undefined {
  if (!isBrowser()) return undefined;

  const doc = getDocument();
  if (!doc) return undefined;

  const cookies = doc.cookie;
  const arg = name + '=';
  const alen = arg.length;
  const clen = cookies.length;
  let i = 0;

  while (i < clen) {
    const j = i + alen;
    if (cookies.substring(i, j) === arg) {
      let endstr = cookies.indexOf(';', j);
      if (endstr === -1) {
        endstr = clen;
      }
      return decodeURIComponent(cookies.substring(j, endstr));
    }
    i = cookies.indexOf(' ', i) + 1;
    if (i === 0) {
      break;
    }
  }

  return undefined;
}

/**
 * Set a cookie value.
 *
 * @param name - Cookie name
 * @param value - Cookie value
 * @param expireDays - Number of days until expiration (optional)
 * @param domain - Cookie domain (optional)
 * @param path - Cookie path (default: '/')
 * @param secure - Whether cookie should be secure (optional)
 * @param sameSite - SameSite attribute (optional)
 *
 * @example
 * ```typescript
 * setCookie('session', 'abc123', 7); // Expires in 7 days
 * setCookie('prefs', 'dark', 30, '.example.com');
 * ```
 */
export function setCookie(
  name: string,
  value: string,
  expireDays?: number,
  domain?: string,
  path: string = '/',
  secure?: boolean,
  sameSite?: 'Strict' | 'Lax' | 'None'
): void {
  if (!isBrowser()) return;

  const doc = getDocument();
  if (!doc) return;

  let cookieStr = `${name}=${encodeURIComponent(value)}; path=${path}`;

  if (expireDays !== undefined) {
    const today = new Date();
    today.setDate(today.getDate() + expireDays);
    cookieStr += `; expires=${today.toUTCString()}`;
  }

  if (domain !== undefined) {
    cookieStr += `; domain=${domain}`;
  }

  if (secure) {
    cookieStr += '; secure';
  }

  if (sameSite) {
    cookieStr += `; samesite=${sameSite}`;
  }

  doc.cookie = cookieStr;
}

/**
 * Get or set a cookie (legacy API compatibility).
 *
 * @param name - Cookie name
 * @param value - Cookie value (if setting)
 * @param expireDays - Expiration days (if setting)
 * @param domain - Domain (if setting)
 * @returns Cookie value when getting, undefined when setting
 *
 * @example
 * ```typescript
 * // Get cookie
 * const value = cookie('session');
 *
 * // Set cookie
 * cookie('session', 'abc123', 7);
 * ```
 */
export function cookie(
  name: string,
  value?: string,
  expireDays?: number,
  domain?: string
): string | undefined {
  if (value === undefined) {
    return getCookie(name);
  } else {
    setCookie(name, value, expireDays, domain);
    return undefined;
  }
}

/**
 * Remove a cookie.
 *
 * @param name - Cookie name to remove
 * @param domain - Cookie domain (optional)
 * @param path - Cookie path (default: '/')
 *
 * @example
 * ```typescript
 * removeCookie('session');
 * removeCookie('prefs', '.example.com');
 * ```
 */
export function removeCookie(name: string, domain?: string, path: string = '/'): void {
  if (!isBrowser()) return;

  const doc = getDocument();
  if (!doc) return;

  let cookieStr = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

  if (domain !== undefined) {
    cookieStr += `; domain=${domain}`;
  }

  doc.cookie = cookieStr;
}

// ============================================================================
// Browser Detection
// ============================================================================

/**
 * Get Microsoft Internet Explorer version.
 * Returns 0 for non-IE browsers.
 *
 * @returns IE version number or 0
 *
 * @example
 * ```typescript
 * const ieVer = msieVersion();
 * if (ieVer > 0 && ieVer < 11) {
 *   console.log('Old IE detected');
 * }
 * ```
 */
export function msieVersion(): number {
  if (!isBrowser()) return 0;

  const nav = getNavigator();
  if (!nav) return 0;

  const ua = nav.userAgent;
  let msie = ua.indexOf('MSIE ');

  // For IE11
  if (msie < 0) {
    msie = ua.indexOf('.NET');
  }

  const trident = ua.match(/Trident\/(\d.\d)/i);

  if (msie < 0) {
    return 0;
  } else {
    if (trident === null || trident === undefined) {
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    } else {
      return parseFloat(trident[1] ?? '0') + 4.0;
    }
  }
}

/**
 * Check if the current browser matches the specified browser name.
 *
 * @param name - Browser name to check
 * @returns True if the browser matches
 *
 * @example
 * ```typescript
 * if (is('chrome')) {
 *   console.log('Using Chrome');
 * }
 * if (is('mobile')) {
 *   console.log('Mobile device');
 * }
 * ```
 */
export function is(name: BrowserName): boolean {
  if (!isBrowser()) return false;

  const win = getWindow();
  const nav = getNavigator();
  if (!win || !nav) return false;

  const ua = nav.userAgent;

  // Opera
  if ('opera' in win || ua.indexOf(' OPR/') >= 0) {
    return name === 'opera';
  }

  // Firefox
  if ('InstallTrigger' in win) {
    return name === 'firefox';
  }

  // Safari (but not iOS Safari)
  if (name !== 'ios' && /^((?!chrome|android|crios|fxios).)*safari/i.test(ua)) {
    return name === 'safari';
  }

  // Edge (Chromium-based)
  if (ua.indexOf('Edg/') >= 0) {
    return name === 'edge';
  }

  // Chrome
  if ('chrome' in win && !('opera' in win || ua.indexOf(' OPR/') >= 0) && ua.indexOf('Edg/') < 0) {
    return name === 'chrome';
  }

  // IE
  if (msieVersion() > 0) {
    return name === 'ie';
  }

  // iOS
  if (/like Mac OS X/i.test(ua)) {
    return name === 'ios';
  }

  // Android
  if (/android/i.test(ua)) {
    return name === 'android';
  }

  // Mobile (generic)
  if (name === 'mobile') {
    return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  }

  return false;
}

/**
 * Get the context path from the current URL.
 *
 * @returns Context path string
 *
 * @example
 * ```typescript
 * // URL: http://example.com/app/page.html
 * contextPath(); // '/app'
 * ```
 */
export function contextPath(): string {
  if (!isBrowser()) return '';

  const loc = getLocation();
  if (!loc) return '';

  const href = loc.href;
  const host = loc.host;
  const offset = href.indexOf(host) + host.length;
  const nextSlash = href.indexOf('/', offset + 1);

  return nextSlash > -1 ? href.substring(offset, nextSlash) : '';
}

/**
 * Get the scrollbar width for the current browser.
 *
 * @returns Scrollbar width in pixels
 *
 * @example
 * ```typescript
 * const width = scrollbarWidth();
 * console.log(`Scrollbar is ${width}px wide`);
 * ```
 */
export function scrollbarWidth(): number {
  if (!isBrowser()) return 0;

  const doc = getDocument();
  if (!doc) return 0;

  // Create outer div
  const outer = doc.createElement('div');
  outer.style.cssText = 'width:50px;height:50px;overflow-y:scroll;position:absolute;top:-200px;left:-200px;';

  // Create inner div
  const inner = doc.createElement('div');
  inner.style.cssText = 'height:100px;width:100%;';
  outer.appendChild(inner);

  doc.body.appendChild(outer);

  const w1 = outer.clientWidth;
  const w2 = inner.clientWidth;

  doc.body.removeChild(outer);

  return w1 - w2;
}

/**
 * Check if the device has touch support.
 *
 * @returns True if touch is supported
 */
export function isTouchDevice(): boolean {
  if (!isBrowser()) return false;

  const win = getWindow();
  const nav = getNavigator();
  const doc = getDocument();
  if (!win || !nav || !doc) return false;

  return (
    'ontouchstart' in win ||
    nav.maxTouchPoints > 0 ||
    (nav as unknown as { msMaxTouchPoints: number }).msMaxTouchPoints > 0
  );
}

/**
 * Get the current viewport dimensions.
 *
 * @returns Object with width and height
 */
export function viewport(): { width: number; height: number } {
  if (!isBrowser()) return { width: 0, height: 0 };

  const win = getWindow();
  const doc = getDocument();
  if (!win || !doc) return { width: 0, height: 0 };

  return {
    width: win.innerWidth || doc.documentElement.clientWidth || doc.body.clientWidth,
    height: win.innerHeight || doc.documentElement.clientHeight || doc.body.clientHeight,
  };
}

/**
 * Check if the page is embedded in an iframe.
 *
 * @returns True if in iframe
 */
export function isInIframe(): boolean {
  if (!isBrowser()) return false;

  const win = getWindow();
  if (!win) return false;

  try {
    return win.self !== win.top;
  } catch {
    return true;
  }
}

/**
 * Browser utilities namespace object.
 */
export const browser = {
  getCookie,
  setCookie,
  cookie,
  removeCookie,
  msieVersion,
  is,
  contextPath,
  scrollbarWidth,
  isTouchDevice,
  viewport,
  isInIframe,
} as const;

export default browser;

