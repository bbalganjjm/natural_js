/**
 * Natural-JS Validator
 * Full implementation from natural.data.js lines 644-1122
 */

import { error as createError } from '../../core/helpers/logger.js';
import { isPlainObject, isElement, isString, type as getType } from '../../core/helpers/type-checker.js';
import { trimToEmpty, isEmpty, trimToNull, trimToZero, byteLength } from '../../core/utils/string.js';
import { toRules, toData } from '../../core/utils/element.js';
import { replaceMsgVars } from '../../core/utils/message.js';
import { locale } from '../../core/helpers/locale.js';
import { Context } from '../../architecture/context/context.js';

// Import N at runtime to avoid circular dependency
const N = () => window.N;

export class Validator {
    constructor(obj, rules) {
        this.options = {
            data : isPlainObject(obj) ? N()(obj) : obj,
            rules : rules,
            isElement : false,
            createEvent : true,
            context : null,
            targetEle : null
        };

        if (isElement(rules) || isString(rules)) {
            const opts = this.options;
            opts.isElement = true;
            opts.context = N()(rules);
            opts.targetEle = opts.context.is(":input") ? opts.context : opts.context.find(":input");
            opts.targetEle = opts.targetEle.map(function() {
                if(jQuery(this).data("validate") !== undefined) {
                    if(opts.createEvent) {
                        const thisEle = jQuery(this);
                        thisEle.off("validate.validator");
                        thisEle.on("validate.validator", function() {
                            N()().validator(N()(this)).validate();
                        });
                    }
                    return this;
                }
            });
            opts.rules = toRules(opts.targetEle, "validate");
        }

        this.options.data = obj.length > 0 ? obj : N()(toData(this.options.targetEle));
    }

    validate(row) {
        const opts = this.options;
        const retArr = [];
        let retObj;
        let retTempObj;
        let retTempArr;
        let data = opts.data.length > 0 ? opts.data : N()(toData(opts.targetEle));
        
        if (row !== undefined) {
            if (row < data.length && row >= 0) {
                data = [ data[row] ];
            } else {
                throw createError("[N.validator.validate]Row index out of range");
            }
        } else {
            if (opts.isElement) {
                row = 0;
                data = [ data[row] ];
            }
        }

        let args;
        let alert;
        let rule;
        jQuery(data).each(function(i, obj) {
            retObj = {};
            for (const k in opts.rules) {
                retTempArr = [];
                let pass = true;
                jQuery(opts.rules[k]).each(function() {
                    retTempObj = {};
                    retTempObj.rule = this.toString();
                    args = N()(this).remove_(0).toArray();
                    rule = trimToEmpty(this[0]).toLowerCase();
                    if (rule.indexOf("+") > -1) {
                        rule = rule.split("+").sort().toString().replace(/\,/g, "_");
                    }
                    try {
                        if (opts.rules[k].toString().indexOf("required") < 0 && rule !== "required" && isEmpty(String(obj[k]))) {
                            retTempObj.result = true;
                        } else {
                            retTempObj.result = Validator[rule](trimToEmpty(obj[k]), args);
                        }
                    } catch (e) {
                        if (e.toString().indexOf("is not a function") > -1) {
                            throw createError("N.validator.validate(\"" + this[0] + "\" is invalid format rule)");
                        } else {
                            throw createError("N.validator.validate", e);
                        }
                    }
                    retTempObj.msg = null;
                    if (!retTempObj.result) {
                        let valiMsg;
                        const messages = Context.attr("data")?.validator?.message;
                        if (!(valiMsg = messages?.[locale()]?.[rule])) {
                            valiMsg = messages?.[locale()]?.global || "Validation failed";
                        }
                        retTempObj.msg = replaceMsgVars(valiMsg, args);

                        pass = false;
                    }
                    retTempArr.push(retTempObj);
                });
                if (opts.isElement) {
                    let ele;
                    if(opts.targetEle.is("input:radio, input:checkbox")) {
                        ele = opts.targetEle.filter("[name='" + k + "'].select_template__");
                    } else {
                        ele = opts.targetEle.filter("#" + k);
                    }
                    if(!pass) {
                        ele.addClass("validate_false__");
                        if (N()().alert !== undefined) {
                            alert = N()(opts.targetEle !== null ? ele : undefined).alert(jQuery(retTempArr).map(function() {
                                if (this.msg !== undefined) {
                                    return this.msg;
                                }
                            }).get()).show();
                        } else {
                            throw createError("[N.validator.validate]You must import Natural-UI library");
                        }
                    } else {
                        ele.removeClass("validate_false__");
                        if (N()().alert !== undefined) {
                            const alertInst = ele.instance("alert");
                            if(alertInst !== undefined) {
                                alertInst.remove();
                            }
                        } else {
                            throw createError("[N.validator.validate]You must import Natural-UI library");
                        }
                    }
                }
                retObj[k] = retTempArr;
            }
            retArr.push(retObj);
            retObj = null;
        });
        return retArr;
    }

    // Validation rules (static methods)
    static required(str) {
        return !isEmpty(str);
    }

    static alphabet(str) {
        return new RegExp(/^[a-z\s]+$/i).test(str);
    }

    static integer(str) {
        return new RegExp(/^[+-]?\d+$/).test(str);
    }

    static korean(str) {
        return new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣\s]+$/).test(str);
    }

    static alphabet_integer(str) {
        return new RegExp(/^[a-z-?\d\s]+$/i).test(str);
    }

    static integer_korean(str) {
        return new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣-?\d\s]+$/).test(str);
    }

    static alphabet_korean(str) {
        return new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-z\s]+$/i).test(str);
    }

    static alphabet_integer_korean(str) {
        return new RegExp(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣a-z-?\d\s]+$/i).test(str);
    }

    static dash_integer(str) {
        return new RegExp(/^(\d|-)+$/).test(str);
    }

    static commas_integer(str) {
        return new RegExp(/^(\d|,)+$/).test(str);
    }

    static number(str) {
        return new RegExp(/^[+-]?(\d|,|\.)+$/).test(str);
    }

    static email(str) {
        return new RegExp(
            /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i)
            .test(str);
    }

    static url(str) {
        return new RegExp(
            /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i)
            .test(str);
    }

    static zipcode(str) {
        return new RegExp(/^\d{3}-\d{3}$/).test(str);
    }

    static decimal(str, args) {
        const length = (args !== undefined && args[0] !== undefined) ? args[0] : 10;
        return new RegExp(/^-?\d+$/).test(str) || new RegExp("^-?\\d*\\.\\d{0," + String(length) + "}$").test(str);
    }

    static phone(str, args) {
        if (args !== undefined && args[0] !== undefined) {
            if (args[0] === "true") {
                return new RegExp(/^\d{2,3}-\d{3,4}-\w+|"("")"$/).test(str);
            }
        }
        return new RegExp(/^\d{2,3}-\d{3,4}-\d{4}$/).test(str);
    }

    static rrn(str) {
        str = str.replace(/[^0-9*]/g, "");
        if (trimToEmpty(str).length !== 13) {
            str = null;
            return false;
        }

        const a1 = str.substring(0, 1);
        const a2 = str.substring(1, 2);
        const a3 = str.substring(2, 3);
        const a4 = str.substring(3, 4);
        const a5 = str.substring(4, 5);
        const a6 = str.substring(5, 6);
        let checkdigit = a1 * 2 + a2 * 3 + a3 * 4 + a4 * 5 + a5 * 6 + a6 * 7;

        const b1 = str.substring(6, 7);
        const b2 = str.substring(7, 8);
        const b3 = str.substring(8, 9);
        const b4 = str.substring(9, 10);
        const b5 = str.substring(10, 11);
        const b6 = str.substring(11, 12);
        const b7 = str.substring(12, 13);
        checkdigit = checkdigit + b1 * 8 + b2 * 9 + b3 * 2 + b4 * 3 + b5 * 4 + b6 * 5;

        checkdigit = checkdigit % 11;
        checkdigit = 11 - checkdigit;
        checkdigit = checkdigit % 10;

        return checkdigit === b7;
    }

    /**
     * US Social Security Number
     */
    static ssn(str) {
        return new RegExp(/\d{3}-\d{2}-\d{4}/).test(str);
    }

    static frn(str) {
        str = str.replace(/[^0-9*]/g, "");
        if (trimToEmpty(str).length !== 13) {
            str = null;
            return false;
        }
        let sum = 0;

        const checkValue = Number(str.substring(6, 7));
        if ([5, 6, 8].indexOf(checkValue) === -1) {
            return false;
        }
        if (Number(str.substring(7, 9)) % 2 !== 0) {
            return false;
        }
        for (let i = 0; i < 12; i++) {
            sum += Number(str.substring(i, i + 1)) * ((i % 8) + 2);
        }
        return (((11 - (sum % 11)) % 10 + 2) % 10) === Number(str.substring(12, 13));
    }

    static frn_rrn(str) {
        str = str.replace(/[^0-9*]/g, "");
        if (trimToEmpty(str).length !== 13) {
            str = null;
            return false;
        }
        if (Number(str.charAt(6)) >= 5 && Number(str.charAt(6)) <= 8) {
            return Validator.frn(str);
        } else {
            return Validator.rrn(str);
        }
    }

    /**
     * Korean business registration number
     */
    static kbrn(str) {
        const bizID = str.replace(/[^0-9*]/g, "");
        const checkID = [1, 3, 7, 1, 3, 7, 1, 3, 5, 1];
        let i, chkSum = 0, c2, remander;
        for (i = 0; i <= 7; i++) {
            chkSum += checkID[i] * bizID.charAt(i);
        }
        c2 = "0" + (checkID[8] * bizID.charAt(8));
        c2 = c2.substring(c2.length - 2, c2.length);

        chkSum += Math.floor(Number(c2.charAt(0))) + Math.floor(Number(c2.charAt(1)));

        remander = (10 - (chkSum % 10)) % 10;

        return Math.floor(Number(bizID.charAt(9))) === remander;
    }

    /**
     * Korean corporation number
     */
    static kcn(str) {
        const numStr = str.replace(/[^0-9*]/g, "");
        if (numStr.length !== 13) {
            return false;
        }
        const arr_regno = numStr.split("");
        const arr_wt = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
        let iSum_regno = 0;
        let iCheck_digit;

        for (let i = 0; i < 12; i++) {
            iSum_regno += parseInt(arr_regno[i]) * arr_wt[i];
        }

        iCheck_digit = 10 - (iSum_regno % 10);
        iCheck_digit = iCheck_digit % 10;

        return iCheck_digit === arr_regno[12];
    }

    static date(str) {
        // Check date format length
        const isDateFormat = function(d) {
            return trimToEmpty(d).length === 8;
        };

        // Check leap year
        const isLeaf = function(year) {
            let leaf = false;
            if (year % 4 === 0) {
                leaf = year % 100 !== 0;
                if (year % 400 === 0) {
                    leaf = true;
                }
            }
            return leaf;
        };

        const dateSepa = Context.attr("data")?.formatter?.date?.dateSepa || "-";
        const d = str.replace(new RegExp("\\" + dateSepa, "gi"), '');
        if (!isDateFormat(d)) {
            return false;
        }

        const month_day = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

        const year = d.substring(0, 4);
        const month = d.substring(4, 6);
        const day = d.substring(6, 8);

        if (day === 0) {
            return false;
        }

        let isValid = false;

        if (isLeaf(year)) {
            if (Number(month) === 2) {
                if (day <= month_day[month - 1] + 1) {
                    isValid = true;
                }
            } else {
                if (day <= month_day[month - 1]) {
                    isValid = true;
                }
            }
        } else {
            if (day <= month_day[month - 1]) {
                isValid = true;
            }
        }

        return isValid;
    }

    static time(str) {
        return new RegExp(/^([01]\d|2[0-3])([0-5]\d){0,2}$/).test(str.replace(/[^0-9]/g, ""));
    }

    static accept(str, args) {
        if (args === undefined || args[0] === undefined) {
            throw new Error("[N.validator.accept]You must input args[0](accept string)");
        }
        return (new RegExp("^(" + args[0] + ")$")).test(str);
    }

    static match(str, args) {
        if (args === undefined || args[0] === undefined) {
            throw new Error("[N.validator.match]You must input args[0](match string)");
        }
        return (new RegExp(args[0])).test(str);
    }

    static acceptfileext(str, args) {
        if (args === undefined || args[0] === undefined) {
            throw new Error("[N.validator.acceptFileExt]You must input args[0](file extention)");
        }
        return (new RegExp(".(" + args[0] + ")$", "i")).test(str);
    }

    static notaccept(str, args) {
        if (args === undefined || args[0] === undefined) {
            throw new Error("[N.validator.notAccept]You must input args[0](refused string)");
        }
        return !(new RegExp("^(" + args[0] + ")$")).test(str);
    }

    static notmatch(str, args) {
        if (args === undefined || args[0] === undefined) {
            throw new Error("[N.validator.notMatch]You must input args[0](unmatch String)");
        }
        return !(new RegExp(args[0])).test(str);
    }

    static notacceptfileext(str, args) {
        if (args === undefined || args[0] === undefined) {
            throw new Error("[N.validator.notAcceptFileExt]You must input args[0](file extention)");
        }
        return !(new RegExp(".(" + args[0] + ")$", "i")).test(str);
    }

    static equalTo(str, args) {
        if (args === undefined || args[0] === undefined) {
            throw new Error("[N.validator.equalTo]You must input args[0](selector string(:input))");
        }
        if (trimToNull(jQuery(args[0]).val()) === null) {
            return true;
        }
        return str === jQuery(args[0]).val();
    }

    static maxlength(str, args) {
        if (args === undefined || args[0] === undefined) {
            throw new Error("[N.validator.maxlength]You must input args[0](length)");
        }
        return trimToEmpty(str).length <= Number(trimToZero(args[0]));
    }

    static minlength(str, args) {
        if (args === undefined || args[0] === undefined) {
            throw new Error("[N.validator.minlength]You must input args[0](length)");
        }
        return Number(trimToZero(args[0])) <= trimToEmpty(str).length;
    }

    static rangelength(str, args) {
        if (args === undefined || args.length < 2) {
            throw new Error("[N.validator.rangelength]You must input args[0](minimum length) and args[1](maximum length");
        }
        return Number(trimToZero(args[0])) <= trimToEmpty(str).length &&
            trimToZero(str).length <= Number(trimToEmpty(args[1]));
    }

    static maxbyte(str, args) {
        if (args === undefined || args[0] === undefined) {
            throw new Error("[N.validator.maxbyte]You must input args[0](maximum byte)");
        }
        if(args[1] === undefined) {
            args[1] = Context.attr("core")?.charByteLength || 3;
        }
        return byteLength(trimToEmpty(str), args[1]) <= Number(trimToZero(args[0]));
    }

    static minbyte(str, args) {
        if (args === undefined || args[0] === undefined) {
            throw new Error("[N.validator.minbyte]You must input args[0](minimum byte)");
        }
        if(args[1] === undefined) {
            args[1] = Context.attr("core")?.charByteLength || 3;
        }
        return Number(trimToZero(args[0])) <= byteLength(trimToEmpty(str), args[1]);
    }

    static rangebyte(str, args) {
        if (args === undefined || args.length < 2) {
            throw new Error("[N.validator.rangebyte]You must input args[0](minimum byte) and args[1](maximum byte)");
        }
        if(args[2] === undefined) {
            args[2] = Context.attr("core")?.charByteLength || 3;
        }
        return Number(trimToZero(args[0])) <= byteLength(trimToEmpty(str), args[2]) &&
            byteLength(trimToEmpty(str), args[2]) <= Number(trimToZero(args[1]));
    }

    static maxvalue(str, args) {
        if (args === undefined || args[0] === undefined) {
            throw new Error("[N.validator.maxvalue]You must input args[0](maximum value)");
        }
        return Number(trimToZero(str)) <= Number(trimToZero(args[0]));
    }

    static minvalue(str, args) {
        if (args === undefined || args[0] === undefined) {
            throw new Error("[N.validator.minvalue]You must input args[0](minimum value)");
        }
        return Number(trimToZero(args[0])) <= Number(trimToZero(str));
    }

    static rangevalue(str, args) {
        if (args === undefined || args.length < 2) {
            throw new Error("[N.validator.rangevalue]You must input args[0](minimum value) and args[1](maximum value)");
        }
        return Number(trimToZero(args[0])) <= Number(trimToZero(str)) &&
            Number(trimToZero(str)) <= Number(trimToZero(args[1]));
    }

    static regexp(str, args) {
        if (args === undefined || args.length < 2) {
            throw new Error("[N.validator.regexp]You must input args[0](regular expression string) and args[1](flag)");
        }
        const trimmedFlag = trimToEmpty(args[1]);
        const regExp = trimmedFlag ? new RegExp(args[0], args[1]) : new RegExp(args[0]);
        return regExp.test(str);
    }
}

export const validator = (obj, rules) => new Validator(obj, rules);
export default Validator;
