/**
 * Natural-JS Locale Management
 * Set and get locale value
 */

// Placeholder for Context (will be injected from N.js)
let ContextRef;

const getContext = () => ContextRef || { 
    attr: () => ({ 
        core: { 
            locale: "en_US" 
        } 
    }) 
};

/**
 * Set and get locale value
 * @param {string} [str] - Locale string (e.g., "ko_KR", "en_US", "ja_JP")
 * @returns {string|undefined} - Current locale if getting, undefined if setting
 * 
 * @example
 * // Get current locale
 * const currentLocale = N.locale(); // "en_US"
 * 
 * // Set locale
 * N.locale("ko_KR");
 */
export function locale(str) {
    const ctx = getContext();
    if (str === undefined) {
        return ctx.attr("core").locale;
    } else {
        ctx.attr("core").locale = str;
    }
}

// Setter for context (to be called from N.js integration)
export const setContext = (ctx) => {
    ContextRef = ctx;
};

