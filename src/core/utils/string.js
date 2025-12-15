/**
 * Natural-JS String Utilities
 */

import { error as createError } from '../helpers/logger.js';

// Temporary placeholder for NA.context (will be injected from N.js)
let NAContext;

const getContext = () => {
    if (!NAContext) {
        NAContext = { attr: () => ({ charByteLength: 3 }) };
    }
    return NAContext;
};

export class StringUtils {
    static contains(context, str) {
        if (typeof context !== "string") {
            throw createError("[NC.string.contains]arguments[0] was not entered or is not of string type.");
        }
        return context.indexOf(str) > -1;
    }

    static endsWith(context, str) {
        if (typeof context !== "string") {
            throw createError("[NC.string.endsWith]arguments[0] was not entered or is not of string type.");
        }
        return context.indexOf(str, context.length - str.length) !== -1;
    }

    static startsWith(context, str) {
        if (typeof context !== "string") {
            throw createError("[NC.string.startsWith]arguments[0] was not entered or is not of string type.");
        }
        return context.indexOf(str) === 0;
    }

    static insertAt(context, idx, str) {
        return context.substring(0, idx) + str + context.substring(idx);
    }

    static removeWhitespace(str) {
        if (StringUtils.isEmpty(str)) {
            return str;
        }
        return str.replace(/\s/g, "");
    }

    static lpad(str, length, padStr) {
        while (str.length < length) {
            str = padStr + str;
        }
        return str;
    }

    static rpad(str, length, padStr) {
        while (str.length < length) {
            str = str + padStr;
        }
        return str;
    }

    static isEmpty(str) {
        return StringUtils.trimToEmpty(str).length === 0;
    }

    static byteLength(str, charByteLength) {
        if(charByteLength === undefined) {
            const ctx = getContext();
            charByteLength = ctx.attr("core").charByteLength !== undefined ? ctx.attr("core").charByteLength : 3;
        }
        return (function(s,b,i,c){
            for(b=i=0;c=s.charCodeAt(i++);b+=c>>11?charByteLength:c>>7?2:1){}
            return b;
        })(str);
    }

    static trimToEmpty(str) {
        return str !== undefined && str !== null ? String(str).trim() : "";
    }

    static nullToEmpty(str) {
        return str === null || str === undefined ? "" : str;
    }

    static trimToNull(str) {
        return StringUtils.trimToEmpty(str).length === 0 ? null : StringUtils.trimToEmpty(str);
    }

    static trimToUndefined(str) {
        return StringUtils.trimToEmpty(str).length === 0 ? undefined : StringUtils.trimToEmpty(str);
    }

    static trimToZero(str) {
        return StringUtils.trimToEmpty(str).length === 0 ? "0" : StringUtils.trimToEmpty(str);
    }

    static trimToVal(str, val) {
        return StringUtils.trimToEmpty(str).length === 0 ? val : StringUtils.trimToEmpty(str);
    }
}

// Export individual methods for convenience
export const { 
    contains, 
    endsWith, 
    startsWith, 
    insertAt, 
    removeWhitespace, 
    lpad, 
    rpad, 
    isEmpty, 
    byteLength, 
    trimToEmpty, 
    nullToEmpty, 
    trimToNull, 
    trimToUndefined, 
    trimToZero, 
    trimToVal 
} = StringUtils;

// Setter for context (to be called from N.js integration)
export const setContext = (ctx) => {
    NAContext = ctx;
};
