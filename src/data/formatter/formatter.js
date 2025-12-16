/**
 * Natural-JS Formatter
 * Full implementation from natural.data.js lines 103-641
 */

import { error as createError, warn } from '../../core/helpers/logger.js';
import { isPlainObject, isElement, isString, type } from '../../core/helpers/type-checker.js';
import { trimToEmpty, isEmpty, lpad, rpad, byteLength } from '../../core/utils/string.js';
import { toRules, toData } from '../../core/utils/element.js';
import { format as formatDate } from '../../core/utils/date.js';
import { Mask } from '../../core/utils/mask.js';
import { Context } from '../../architecture/context/context.js';

// Import N at runtime to avoid circular dependency
const N = () => window.N;

export class Formatter {
    constructor(obj, rules) {
        this.options = {
            data : isPlainObject(obj) ? N()(obj) : obj,
            rules : rules,
            isElement : false,
            createEvent : true,
            context : null,
            targetEle : N()()
        };

        if (isElement(rules) || isString(rules)) {
            const opts = this.options;
            opts.isElement = true;
            opts.context = N()(rules);
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
        const self = this;
        const retArr = [];
        let retObj;
        let tempValue;
        let ele;
        
        if (row !== undefined) {
            if (row < opts.data.length && row >= 0) {
                opts.data = [ opts.data[row] ];
            } else {
                throw createError("[N.formatter.format]Row index out of range");
            }
        } else {
            if (opts.isElement) {
                row = 0;
                opts.data = [ opts.data[row] ];
            }
        }
        
        jQuery(opts.data).each(function(i, obj) {
            retObj = {};
            for (const k in opts.rules) {
                tempValue = trimToEmpty(obj[k]);

                if (opts.isElement) {
                    ele = opts.targetEle.filter("#" + k);

                    if(ele.length > 0) {
                        if(ele.data("format") !== undefined) {
                            // Replace with the latest rule
                            opts.rules[k] = ele.data("format");
                        }
                    } else {
                        ele = undefined;
                    }
                }

                jQuery(opts.rules[k]).each(function() {
                    try {
                        tempValue = Formatter[trimToEmpty(this[0]).toLowerCase()](tempValue, N()(this).remove_(0).toArray(), ele);
                    } catch (e) {
                        if (e.toString().indexOf("is not a function") > -1) {
                            throw createError("N.formatter.format(\"" + this[0] + "\" is invalid format rule)", e);
                        } else {
                            throw createError("N.formatter.format", e);
                        }
                    }
                });
                
                retObj[k] = tempValue;
                if (opts.isElement) {
                    ele = opts.targetEle.filter("#" + k);
                    if (ele.is("[type='text'], [type='tel'], textarea")) {
                        ele.val(tempValue);
                        if(opts.createEvent) {
                            ele.off("format.formatter unformat.formatter");
                            ele.on("format.formatter", function() {
                                ele = opts.context.filter("#" + jQuery(this).attr("id"));
                                if(ele.length === 0) {
                                    ele = opts.context.find("#" + jQuery(this).attr("id"));
                                }

                                const fmdVals = self.format();
                                if(fmdVals.length === 1) {
                                    row = 0;
                                }

                                jQuery(this).val(fmdVals[row][jQuery(this).attr("id")]);
                            }).on("unformat.formatter", function() {
                                if(opts.data.length === 1) {
                                    row = 0;
                                }

                                jQuery(this).val(self.unformat(row, jQuery(this).attr("id")));
                            });
                        }
                    } else {
                        if(!ele.is(":input")) {
                            ele.text(tempValue);
                        }
                    }
                }
                tempValue = null;
            }
            retArr.push(retObj);
            retObj = null;
        });
        return retArr;
    }

    unformat(row, key) {
        return this.options.data[row][key];
    }

    // Static formatting methods
    static commas(str) {
        if (isEmpty(str)) {
            return str;
        }
        str = str.replace(/,/g, "");
        const reg = /(^[+-]?\d+)(\d{3})/;
        str += '';
        while (reg.test(str)) {
            str = str.replace(reg, '$1' + ',' + '$2');
        }
        return str;
    }

    /**
     * Resident registration number
     */
    static rrn(str, args) {
        if (isEmpty(str)) {
            return str;
        }
        str = str.replace(/[^0-9*]/g, "");
        if (str.length === 13) {
            let strToPad = "*";
            if (args !== undefined && args[1] !== undefined) {
                strToPad = args[1];
            }
            if (args !== undefined && args[0] !== undefined) {
                str = rpad(str.substring(0, 13 - Number(args[0])), 13, strToPad);
                str = str.substring(0, 6) + "-" + str.substring(6, 13);
            } else {
                str = str.substring(0, 6) + "-" + str.substring(6, 13);
            }
        }
        return str;
    }

    /**
     * US Social Security Number
     */
    static ssn(str) {
        if (str.length === 9) {
            str = str.replace(/[^0-9*]/g, "");
            return str.substring(0, 3) + "-" + str.substring(3, 5) + "-" + str.substring(5, 9);
        }
        return str;
    }

    /**
     * Korean business registration number
     */
    static kbrn(str) {
        if (trimToEmpty(str).length < 5) {
            return str;
        }
        str = str.replace(/[^0-9*]/g, "");
        if (str.length > 10) {
            str = str.substring(0, 10);
        }
        return str.substring(0, 3) + "-" + str.substring(3, 5) + "-" + str.substring(5, 10);
    }

    /**
     * Korean corporation number
     */
    static kcn(str) {
        return Formatter.rrn(str);
    }

    static upper(str) {
        if (isEmpty(str)) {
            return str;
        }
        return str.toUpperCase();
    }

    static lower(str) {
        if (isEmpty(str)) {
            return str;
        }
        return str.toLowerCase();
    }

    static capitalize(str) {
        if (isEmpty(str)) {
            return str;
        }
        let result = str.substring(0, 1).toUpperCase();
        if (str.length > 1) {
            result = result + str.substring(1);
        }
        return result;
    }

    static zipcode(str) {
        if (isEmpty(str)) {
            return str;
        }
        str = str.replace(/[^0-9*]/g, "");
        return str.substring(0, 3) + "-" + str.substring(3, 6);
    }

    static phone(str) {
        if (isEmpty(str)) {
            return str;
        }
        str = str.replace(/[^0-9*]/g, "");
        return str.replace(/(^02.{0}|^01.{1}|[0-9*]{3})([0-9*]+)([0-9*]{4})/, "$1-$2-$3");
    }

    static realnum(str) {
        try {
            str = String(parseFloat(str));
        } catch (e) {
            return str;
        }
        return str === "NaN" ? str.replace("NaN", "") : str;
    }

    static trimtoempty(str) {
        return trimToEmpty(str);
    }

    static trimtozero(str) {
        const trimmed = trimToEmpty(str);
        return trimmed === "" ? "0" : trimmed;
    }

    static trimtoval(str, args) {
        if (args === undefined || args[0] === undefined) {
            throw createError("[N.formatter.trimtoval]You must input args[0](default value)");
        }
        const trimmed = trimToEmpty(str);
        return trimmed === "" ? args[0] : trimmed;
    }

    static date(str, args, ele) {
        if(args === undefined) {
            return str;
        }
        str = str.replace(/[^0-9]/g, "");

        // Use datepicker, monthpicker
        if(N().datepicker !== undefined) {
            if(args[1] !== undefined && (args[1] === "date" || args[1] === "month") && ele !== undefined && !ele.hasClass("datepicker__") && ele.is("input")) {
                const isMonth = args[1] === "month";
                let dateVal;
                let formInst;
                let colId;

                const options = {
                    monthonly : isMonth
                };

                if(args[2] !== undefined) {
                    jQuery.extend(options, args[2]);
                }
                const datepicker = ele.datepicker(options);
                const opts = datepicker.options;

                const orgOnBeforeShow = opts.onBeforeShow;
                opts.onBeforeShow = function(context, contents) {
                    context.trigger("unformat");

                    if(orgOnBeforeShow !== null) {
                        return orgOnBeforeShow.apply(this, arguments);
                    }
                };

                const orgOnSelect = opts.onSelect;
                opts.onSelect = function(context, date, monthonly) {
                    dateVal = date.obj.formatDate(monthonly ? "Ym" : "Ymd");

                    context.parents(".form__").each(function() {
                        formInst = jQuery(this).instance("form");
                        if(formInst !== undefined) {
                            return false;
                        }
                    });

                    colId = context.attr("id");
                    if(formInst !== undefined && dateVal !== formInst.val(colId)) {
                        formInst.val(colId, dateVal);
                    }

                    if(orgOnSelect !== null) {
                        return orgOnSelect.apply(this, arguments);
                    }
                };

                const orgOnBeforeHide = opts.onBeforeHide;
                opts.onBeforeHide = function(context, contents) {
                    context.val(context.val().replace(/[^0-9]/g, ""));
                    context.trigger("focusout.dataSync.form").trigger("focusout.form.format");

                    if(orgOnBeforeHide !== null) {
                        return orgOnBeforeHide.apply(this, arguments);
                    }
                };

                const orgOnHide = opts.onHide;
                opts.onHide = function(context, contents) {
                    if(orgOnHide !== null) {
                        return orgOnHide.apply(this, arguments);
                    }
                };

                if(opts.yearChangeInput) {
                    const orgOnChangeYear = opts.onChangeYear;
                    opts.onChangeYear = function() {
                        opts.context.trigger("focusout.dataSync.form");
                        if(orgOnChangeYear !== null) {
                            return orgOnChangeYear.apply(this, arguments);
                        }
                    };
                }

                if(opts.monthChangeInput) {
                    const orgOnChangeMonth = opts.onChangeMonth;
                    opts.onChangeMonth = function() {
                        opts.context.trigger("focusout.dataSync.form");
                        if(orgOnChangeMonth !== null) {
                            return orgOnChangeMonth.apply(this, arguments);
                        }
                    };
                }
            }
        } else {
            warn("if you use date or month option, you must import Natural-UI library");
        }

        if (args[0] !== undefined) {
            const formats = Context.attr("data")?.formatter?.date;
            let val;

            if(type(args[0]) === "number") {
                if (args[0] === 4) {
                    val = formatDate(str, "Y");
                } else if (args[0] === 6) {
                    val = formatDate(str, formats?.Ym() || "Y-m");
                } else if (args[0] === 8) {
                    val = formatDate(str, formats?.Ymd() || "Y-m-d");
                } else if (args[0] === 10) {
                    val = formatDate(str, formats?.YmdH() || "Y-m-d H");
                } else if (args[0] === 12) {
                    val = formatDate(str, formats?.YmdHi() || "Y-m-d H:i");
                } else if (args[0] === 14) {
                    val = formatDate(str, formats?.YmdHis() || "Y-m-d H:i:s");
                } else {
                    val = formatDate(str, formats?.Ymd() || "Y-m-d");
                }
            } else {
                val = formatDate(str, args[0]);
            }

            return Number(str) > 0 ? val : "";
        }
    }

    static time(str, args) {
        str = str.replace(/[^0-9]/g, "");
        if (trimToEmpty(str) > 6) {
            str = rpad(str, 6, "0");
        } else {
            str = str.substring(0, 6);
        }
        
        const timeSepa = Context.attr("data")?.formatter?.date?.timeSepa || ":";
        
        if (args !== undefined && args[0] !== undefined && Number(args[0]) === 2) {
            str = str.substring(0, 2);
        } else if (args !== undefined && args[0] !== undefined && Number(args[0]) === 4) {
            str = str.substring(0, 2) + timeSepa + str.substring(2, 4);
        } else if (args !== undefined && args[0] !== undefined && Number(args[0]) === 6) {
            str = str.substring(0, 2) + timeSepa + str.substring(2, 4) + timeSepa + str.substring(4, 6);
        } else {
            str = str.substring(0, 2) + timeSepa + str.substring(2, 4);
        }

        return str;
    }

    static limit(str, args, ele) {
        if (args === undefined || args[0] === undefined) {
            throw createError("[N.formatter.limit]You must input args[0](cut length)");
        }
        if(str.substring(str.length - args[1].length, str.length) !== args[1]) {
            if (ele !== undefined) {
                ele.attr("title", str);
            }
            let l = 0;
            for (let i = 0; i < str.length; i++) {
                l += (str.charCodeAt(i) > 128) ? 2 : 1;
                if (l > args[0]) {
                    if (args[1] !== undefined) {
                        return trimToEmpty(str.substring(0, i)) + args[1];
                    } else {
                        return str.substring(0, i);
                    }
                }
            }
        }
        return str;
    }

    static replace(str, args, ele) {
        if (args === undefined || args.length < 2) {
            throw createError("[N.formatter.replace]You must input args[0](target string) and args[1](replace string)");
        }
        const replaceStr = str.split(String(args[0])).join(String(args[1]));
        if (typeof args[2] != "undefined" && String(args[2]) === "true") {
            this.vo[ele.attr("name")] = replaceStr;
        }
        return replaceStr;
    }

    static lpad(str, args) {
        if (args === undefined || args.length < 2) {
            throw createError("[N.formatter.lpad]You must input args[0](fill length) and args[1](replace string)");
        }
        return lpad(str, Number(args[0]), args[1]);
    }

    static rpad(str, args) {
        if (args === undefined || args.length < 2) {
            throw createError("[N.formatter.rpad]You must input args[0](fill length) and args[1](replace string)");
        }
        return rpad(str, Number(args[0]), args[1]);
    }

    static mask(str, args) {
        if (args === undefined || args.length < 1) {
            throw createError("[N.formatter.mask]You must input args[0](masking rule)");
        }
        let replaceStr = "*";
        if(args.length === 2 && !isEmpty(args[1])) {
            replaceStr = args[1];
        }

        if(args[0] === "phone") {
            let rtnStr;
            str = trimToEmpty(str);
            rtnStr = Formatter.phone(str);
            const frontNum = rtnStr.substring(0, rtnStr.indexOf("-")+1);
            const rearNum = rtnStr.substring(rtnStr.lastIndexOf("-"), rtnStr.length);
            const middleNum = rtnStr.replace(frontNum, "").replace(rearNum, "");
            return frontNum + middleNum.replace(/\d/g, replaceStr) + rearNum;
        } else if(args[0] === "email") {
            str = trimToEmpty(str);
            // Import Validator at runtime
            const Validator = window.N?.validator;
            if(Validator && Validator.email(str)) {
                let rplcStr = "";
                for(let i=0;i<3;i++) {
                    rplcStr += replaceStr;
                }
                return str.replace(/@.*/, "").replace(/.{1,3}$/, rplcStr) + str.replace(/.*@/, "@");
            }
        } else if(args[0] === "address") {
            str = trimToEmpty(str);
            const firstCheckChars = "_경기_강원_충북_충남_전북_전남_경북_경남_제주_";
            const secondCheckChars = "_도_시_군_구_";
            const thirdCheckChars = "_읍_면_동_리_로_길_가_";

            const addrFrags = str.split(" ");
            let maskedAddr = "";
            let addrFrag;
            let firstChar;
            let lastChar;
            jQuery(addrFrags).each(function() {
                addrFrag = trimToEmpty(this);
                firstChar = addrFrag.substring(0, 1);
                lastChar = addrFrag.substring(addrFrag.length - 1, addrFrag.length);
                if(firstCheckChars.indexOf("_" + addrFrag + "_") < 0 && secondCheckChars.indexOf("_" + lastChar + "_") < 0) {
                    let rplcStr = "";
                    if(thirdCheckChars.indexOf("_" + lastChar + "_") > -1 && (new RegExp(/[^0-9*]/)).test(firstChar)) {
                        for(let i=0;i<addrFrag.length-1;i++) {
                            rplcStr += replaceStr;
                        }
                        addrFrag = rplcStr + lastChar;
                    } else {
                        for(let i=0;i<addrFrag.length;i++) {
                            rplcStr += replaceStr;
                        }
                        addrFrag = rplcStr;
                    }
                }
                maskedAddr += addrFrag + " ";
            });
            return trimToEmpty(maskedAddr);
        } else if(args[0] === "name") {
            str = trimToEmpty(str);

            // if str is alphabet and number and dot(.)
            if((new RegExp(/^[a-z-?\d\s\.]+$/i)).test(str)) {
                return jQuery(str.split("")).map(function(i){
                    if((i > 2 && i < 10) && this !== " ") {
                        return replaceStr;
                    } else {
                        return this;
                    }
                }).get().join("");
            }

            // if str is Hangul
            const firstCheckChars = "_남궁_제갈_선우_독고_황보_강전_동방_망절_사공_서문_소봉_장곡_";
            let frontIdx = 1;
            if(str.length > 1 && firstCheckChars.indexOf("_" + str.substring(0, 2) + "_") > -1) {
                frontIdx = 2;
            }

            return str.substring(0, frontIdx) + replaceStr + str.substring(frontIdx + 1, str.length);
        } else if(args[0] === "rrn") {
            str = trimToEmpty(str);
            let rplcStr = "";
            for(let i=0;i<7;i++) {
                rplcStr += replaceStr;
            }
            return Formatter.rrn(str.replace(/.{1,7}$/, rplcStr));
        }

        return str;
    }

    static generic(str, args) {
        if (args === undefined || args[0] === undefined) {
            throw createError("[N.formatter.generic]You must input args[0](user format rule)");
        }
        const mask = new Mask(args[0]);
        return mask.setGeneric(String(str));
    }

    static numeric(str, args) {
        if (args === undefined || args[0] === undefined) {
            throw createError("[N.formatter.numeric]You must input args[0](user format rule)");
        }
        const mask = new Mask(args[0]);
        return mask.setNumeric(String(str), args[1]);
    }
}

export const formatter = (obj, rules) => new Formatter(obj, rules);
export default Formatter;
