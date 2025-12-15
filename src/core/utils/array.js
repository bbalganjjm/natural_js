/**
 * Natural-JS Array Utilities
 */

import { type as getType } from '../helpers/type-checker.js';

export class ArrayUtils {
    /**
     * Remove duplicated value(object | etc.)
     */
    static deduplicate(arr, key) {
        const rtnArr = [];
        jQuery(arr).each(function(i, obj) {
            if(getType(obj) === "object" && key !== undefined) {
                if(jQuery.inArray(obj[key], jQuery(rtnArr).map(function() {
                    return this[key];
                }).get()) < 0) {
                    rtnArr.push(obj);
                }
            } else {
                if(jQuery.inArray(obj, rtnArr) < 0) {
                    rtnArr.push(obj);
                }
            }
        });
        return rtnArr;
    }
}

// Export individual methods
export const { deduplicate } = ArrayUtils;
