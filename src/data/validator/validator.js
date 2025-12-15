/**
 * Natural-JS Validator
 * Simplified version - full implementation in original natural.data.js lines 644-1122
 */

import { error as createError } from '../../core/helpers/logger.js';
import { isPlainObject, isElement, isString } from '../../core/helpers/type-checker.js';
import { trimToEmpty } from '../../core/utils/string.js';
import { toRules } from '../../core/utils/element.js';

export class Validator {
    constructor(obj, rules) {
        this.options = {
            data : isPlainObject(obj) ? jQuery(obj) : obj,
            rules : rules,
            isElement : false,
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
                opts.rules = toRules(opts.targetEle, "validate");
            }
        }
    }

    validate(row) {
        const opts = this.options;
        const retArr = [];
        let retObj;

        if (row !== undefined) {
            if (row < opts.data.length && row >= 0) {
                opts.data = [ opts.data[row] ];
            } else {
                throw createError("[ND.validator.validate]Row index out of range");
            }
        }

        jQuery(opts.data).each(function(i, obj) {
            retObj = { passed: true, errors: {} };
            for (const k in opts.rules ) {
                const value = trimToEmpty(obj[k]);
                const rules = opts.rules[k];
                
                jQuery(rules).each(function() {
                    const ruleName = this[0];
                    const ruleParams = this.slice(1);
                    
                    // Basic validation rules
                    if (ruleName === "required" && !value) {
                        retObj.passed = false;
                        retObj.errors[k] = "Required field";
                    }
                });
            }
            retArr.push(retObj);
        });

        return retArr;
    }

    // Validation rules (static methods - simplified)
    static required(val) {
        return trimToEmpty(val) !== "";
    }

    static minlength(val, minLen) {
        return String(val).length >= minLen;
    }

    static maxlength(val, maxLen) {
        return String(val).length <= maxLen;
    }

    static email(val) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }

    static url(val) {
        try {
            new URL(val);
            return true;
        } catch {
            return false;
        }
    }

    static number(val) {
        return !isNaN(Number(val));
    }

    static integer(val) {
        return Number.isInteger(Number(val));
    }

    static positive(val) {
        return Number(val) > 0;
    }

    static negative(val) {
        return Number(val) < 0;
    }
}

export const validator = (obj, rules) => new Validator(obj, rules);
export default Validator;
