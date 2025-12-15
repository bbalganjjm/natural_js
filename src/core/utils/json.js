/**
 * Natural-JS JSON Utilities
 */

import { type as getType, isString, isEmptyObject } from '../helpers/type-checker.js';

// Temporary placeholder for NA.context (will be injected from N.js)
let NAContext;

const getContext = () => NAContext || { attr: () => ({ excludeMapFromKeys: undefined }) };

export class JSONUtils {
    static mapFromKeys(obj) {
        if(arguments.length > 1) {
            let args = Array.prototype.slice.call(arguments, 0);
            const ctx = getContext();
            if(ctx.attr("core").excludeMapFromKeys !== undefined) {
                args = args.concat(ctx.attr("core").excludeMapFromKeys);
            }
            if(getType(obj) === "array") {
                if(obj.length === 0) {
                    return obj;
                }
                return jQuery(obj).map(function() {
                    const retObj = {};
                    for(let i=1,length=args.length;i<length;i++) {
                        if(args[i] !== undefined && this[args[i]] !== undefined) {
                            retObj[args[i]] = this[args[i]];
                        }
                    }
                    return retObj;
                }).get();
            } else {
                const retObj = {};
                for(let i=1,length=args.length;i<length;i++) {
                    if(args[i] !== undefined && obj[args[i]] !== undefined) {
                        retObj[args[i]] = obj[args[i]];
                    }
                }
                return retObj;
            }
        } else {
            return obj;
        }
    }

    /**
     * Merge JSON Array by key
     */
    static mergeJsonArray(arr1, arr2, key) {
        const keySet = jQuery(arr1).map(function() {
            return this[key];
        }).get().join(",");
        jQuery(arr2).each(function() {
            if(keySet.indexOf(this[key]) < 0) {
                arr1.push(this);
            }
        });
        return arr1;
    }

    /**
     * Return formated JSON String
     */
    static format(oData, sIndent) {
        if (!isEmptyObject(oData)) {
            if (isString(oData)) {
                oData = JSON.parse(oData);
            }
            if(sIndent === undefined) {
                sIndent = 4;
            }
            return JSON.stringify(oData, undefined, sIndent);
        } else {
            return null;
        }
    }
}

// Export individual methods
export const { mapFromKeys, mergeJsonArray, format } = JSONUtils;

// Setter for context
export const setContext = (ctx) => { NAContext = ctx; };
