/**
 * Natural-JS Formatter
 * Simplified version - full implementation in original natural.data.js lines 103-641
 */

import { error as createError } from '../../core/helpers/logger.js';
import { isPlainObject, isElement, isString } from '../../core/helpers/type-checker.js';
import { trimToEmpty } from '../../core/utils/string.js';
import { toRules } from '../../core/utils/element.js';

export class Formatter {
    constructor(obj, rules) {
        this.options = {
            data : isPlainObject(obj) ? jQuery(obj) : obj,
            rules : rules,
            isElement : false,
            createEvent : true,
            context : null,
            targetEle : jQuery()
        };

        if (isElement(rules) || isString(rules)) {
            const opts = this.options;
            opts.isElement = true;
            opts.context = jQuery(rules);
            if (obj.length > 0) {
                if (obj[0][opts.context.attr("id")] !== undefined) {
                    opts.targetEle.push(opts.context.get(0));
                } else {
                    for (const k in obj[0]) {
                        if (opts.context.find("#" + k).length > 0) {
                            opts.targetEle.push(opts.context.find("#" + k).get(0));
                        }
                    }
                }
                opts.rules = toRules(opts.targetEle, "format");
            }
        }
    }

    format(row) {
        const opts = this.options;
        const retArr = [];
        let retObj;

        if (row !== undefined) {
            if (row < opts.data.length && row >= 0) {
                opts.data = [ opts.data[row] ];
            } else {
                throw createError("[ND.formatter.format]Row index out of range");
            }
        }

        jQuery(opts.data).each(function(i, obj) {
            retObj = {};
            for (const k in opts.rules ) {
                let tempValue = trimToEmpty(obj[k]);
                retObj[k] = tempValue;
            }
            retArr.push(retObj);
        });

        return retArr;
    }

    unformat(row) {
        // Simplified - reverse formatting
        return this.format(row);
    }

    // Formatter rules (static methods - simplified)
    static upper(val) {
        return String(val).toUpperCase();
    }

    static lower(val) {
        return String(val).toLowerCase();
    }

    static capitalize(val) {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }

    static trimToEmpty(val) {
        return trimToEmpty(val);
    }

    static trimToNull(val) {
        const trimmed = trimToEmpty(val);
        return trimmed === "" ? null : trimmed;
    }

    static trimToZero(val) {
        const trimmed = trimToEmpty(val);
        return trimmed === "" ? 0 : trimmed;
    }
}

export const formatter = (obj, rules) => new Formatter(obj, rules);
export default Formatter;
