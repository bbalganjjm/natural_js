/*! Natural-JS v2.0.0 | LGPL-2.1 | (c) Goldman Kim */
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/core/helpers/type-checker.js
var TypeChecker = class _TypeChecker {
  /**
   * Check object type
   */
  static type(obj) {
    return {}.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  }
  /**
   * Check whether arg[0] is a String type
   */
  static isString(obj) {
    return _TypeChecker.type(obj) === "string";
  }
  /**
   * Check whether arg[0] is a numeric type
   */
  static isNumeric(obj) {
    return (typeof obj === "number" || typeof obj === "string") && !isNaN(obj - parseFloat(obj));
  }
  /**
   * Check whether arg[0] is a plain object type
   */
  static isPlainObject(obj) {
    return jQuery.isPlainObject(obj);
  }
  /**
   * Check whether object is empty
   */
  static isEmptyObject(obj) {
    return jQuery.isEmptyObject(obj);
  }
  /**
   * Check whether arg[0] is a Array type
   */
  static isArray(obj) {
    return Array.isArray(obj);
  }
  /**
   * Checks whether an object of a type similar(array or jquery object etc.) to an array
   */
  static isArraylike(obj) {
    if (typeof obj === "undefined" || obj.length === void 0) {
      return false;
    }
    const length = obj.length, type2 = _TypeChecker.type(obj);
    if (type2 === "function" || type2 === "asyncfunction" || type2 === "string" || type2 === "number" || type2 === "date" || type2 === "boolean" || obj === obj.window) {
      return false;
    }
    if (obj.nodeType === 1 && length) {
      return true;
    }
    return type2 === "array" || length === 0 || typeof length === "number" && length > 0 && length - 1 in obj;
  }
  /**
   * Check whether arg[0] is a jQuery Object type
   */
  static isWrappedSet(obj) {
    return !!(obj && _TypeChecker.isArraylike(obj) && obj.jquery);
  }
  /**
   * Check whether arg[0] is an element type
   */
  static isElement(obj) {
    if (_TypeChecker.isWrappedSet(obj)) {
      obj = obj.get(0);
    }
    return !!(obj && obj !== document && obj.getElementsByTagName);
  }
  /**
   * Convert element to selector string
   */
  static toSelector(el) {
    if (typeof el === "string") {
      return el;
    }
    if (_TypeChecker.isWrappedSet(el)) {
      el = el.get(0);
    }
    if (_TypeChecker.isElement(el)) {
      return el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.classList && el.classList.length > 0 ? "." : "") + Array.from(el.classList).join(".");
    } else if (_TypeChecker.type(el) === "array") {
      if (el.length > 0) {
        let obj = el[el.length - 1];
        let type2 = _TypeChecker.type(obj);
        if (type2.startsWith("[")) {
          type2 = type2.replace(/[\[\]]/g, "");
        } else if (_TypeChecker.type(obj) === "string") {
          type2 = '"' + type2 + '"';
        }
        return "...[" + type2 + "](" + el.length + ")";
      } else {
        return "...[](0)";
      }
    } else {
      return String(el);
    }
  }
};
var {
  isString,
  isPlainObject,
  isElement} = TypeChecker;

// src/core/helpers/logger.js
var _Logger = class _Logger {
  /**
   * Displays error logs on the console and creates Error object
   */
  static error(msg, e) {
    if (TypeChecker.type(e) !== "error") {
      e = new Error(msg);
      if ("captureStackTrace" in Error) {
        Error.captureStackTrace(e, _Logger.error);
      }
    } else {
      e.message = (msg != null ? "[" + msg + "]" : "") + e.message;
    }
    return e;
  }
};
/**
 * Displays debug logs on the console.
 */
__publicField(_Logger, "debug", console && console.debug ? console.debug.bind(window.console) : function() {
});
/**
 * Displays general logs on the console.
 */
__publicField(_Logger, "log", console && console.log ? console.log.bind(window.console) : function() {
});
/**
 * Displays info logs on the console.
 */
__publicField(_Logger, "info", console && console.info ? console.info.bind(window.console) : function() {
});
/**
 * Displays warning logs on the console.
 */
__publicField(_Logger, "warn", console && console.warn ? console.warn.bind(window.console) : function() {
});
var Logger = _Logger;
var { debug, log, info, warn, error } = Logger;

// src/architecture/context/context.js
var _Context = class _Context {
  static attr(name, obj) {
    if (name !== void 0) {
      if (obj !== void 0) {
        _Context.attrObj[name] = obj;
      } else {
        return _Context.attrObj[name];
      }
    }
    return this;
  }
};
__publicField(_Context, "attrObj", {});
var Context = _Context;

// src/data/sync/data-sync.js
var DataSync = class _DataSync {
  constructor(inst, isReg) {
    var _a, _b;
    const pageContext = jQuery(((_b = (_a = Context.attr("architecture")) == null ? void 0 : _a.page) == null ? void 0 : _b.context) || "body");
    if (pageContext.length === 0) {
      warn("[ND.ds]Context element is missing.");
    }
    let dataSyncTemp = pageContext.find("var#data_sync_temp__");
    if (dataSyncTemp.length === 0) {
      dataSyncTemp = pageContext.append('<var id="data_sync_temp__"></var>').find("var#data_sync_temp__");
    }
    this.viewContext = dataSyncTemp;
    let siglInst = this.viewContext.instance("ds");
    if (siglInst !== void 0) {
      siglInst.inst = inst;
      if (isReg !== void 0 && isReg === true) {
        siglInst.observable.push(inst);
      }
    } else {
      siglInst = this;
      siglInst.inst = inst;
      siglInst.observable = [];
      siglInst.observable.push(inst);
      this.viewContext.instance("ds", siglInst);
    }
    return siglInst;
  }
  static instance(inst, isReg) {
    return new _DataSync(inst, isReg);
  }
  remove() {
    const inst = this.inst;
    const observable = this.observable;
    if (inst && observable) {
      for (let i = 0; i < observable.length; i++) {
        if (observable[i] === inst) {
          observable.splice(i, 1);
        }
      }
    }
    return this;
  }
  notify(row, key) {
    const inst = this.inst;
    const observable = this.observable;
    if (inst && observable) {
      for (let i = 0; i < observable.length; i++) {
        if (inst !== observable[i] && inst.options.data === observable[i].options.data) {
          observable[i].update(row, key);
        }
      }
    }
    return this;
  }
};
var ds = DataSync;

// src/core/utils/string.js
var NAContext;
var getContext = () => {
  if (!NAContext) {
    NAContext = { attr: () => ({ charByteLength: 3 }) };
  }
  return NAContext;
};
var StringUtils = class _StringUtils {
  static contains(context, str) {
    if (typeof context !== "string") {
      throw error("[NC.string.contains]arguments[0] was not entered or is not of string type.");
    }
    return context.indexOf(str) > -1;
  }
  static endsWith(context, str) {
    if (typeof context !== "string") {
      throw error("[NC.string.endsWith]arguments[0] was not entered or is not of string type.");
    }
    return context.indexOf(str, context.length - str.length) !== -1;
  }
  static startsWith(context, str) {
    if (typeof context !== "string") {
      throw error("[NC.string.startsWith]arguments[0] was not entered or is not of string type.");
    }
    return context.indexOf(str) === 0;
  }
  static insertAt(context, idx, str) {
    return context.substring(0, idx) + str + context.substring(idx);
  }
  static removeWhitespace(str) {
    if (_StringUtils.isEmpty(str)) {
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
    return _StringUtils.trimToEmpty(str).length === 0;
  }
  static byteLength(str, charByteLength) {
    if (charByteLength === void 0) {
      const ctx = getContext();
      charByteLength = ctx.attr("core").charByteLength !== void 0 ? ctx.attr("core").charByteLength : 3;
    }
    return (function(s, b, i, c) {
      for (b = i = 0; c = s.charCodeAt(i++); b += c >> 11 ? charByteLength : c >> 7 ? 2 : 1) {
      }
      return b;
    })(str);
  }
  static trimToEmpty(str) {
    return str !== void 0 && str !== null ? String(str).trim() : "";
  }
  static nullToEmpty(str) {
    return str === null || str === void 0 ? "" : str;
  }
  static trimToNull(str) {
    return _StringUtils.trimToEmpty(str).length === 0 ? null : _StringUtils.trimToEmpty(str);
  }
  static trimToUndefined(str) {
    return _StringUtils.trimToEmpty(str).length === 0 ? void 0 : _StringUtils.trimToEmpty(str);
  }
  static trimToZero(str) {
    return _StringUtils.trimToEmpty(str).length === 0 ? "0" : _StringUtils.trimToEmpty(str);
  }
  static trimToVal(str, val) {
    return _StringUtils.trimToEmpty(str).length === 0 ? val : _StringUtils.trimToEmpty(str);
  }
};
var {
  trimToEmpty} = StringUtils;

// src/core/utils/element.js
var ElementUtils = class {
  /**
   * make options object from class attribute
   */
  static toOpts(ele) {
    return N(ele).data("opts");
  }
  /**
   * make rules object from input element
   */
  static toRules(ele, ruleset) {
    const retRules = {};
    let thisEle;
    let id;
    ele.each(function() {
      thisEle = jQuery(this);
      if (thisEle.is("input:radio, input:checkbox")) {
        id = thisEle.attr("name");
      } else {
        id = thisEle.attr("id");
      }
      retRules[id] = thisEle.data(ruleset);
    });
    return retRules;
  }
  /**
   * make data object from input element
   */
  static toData(eles) {
    const retData = {};
    let key, ele;
    let beforeCheckboxNRadios = jQuery();
    eles.each(function() {
      key = jQuery(this).attr("id");
      ele = jQuery(this);
      if (ele.is("input:radio") || ele.is("input:checkbox")) {
        if (beforeCheckboxNRadios.filter(ele).length === 0) {
          if (ele.closest(".select_input_container__").length > 0) {
            ele = ele.closest(".select_input_container__").find("input:" + ele.attr("type") + "[name='" + ele.attr("name") + "']");
            beforeCheckboxNRadios = ele;
          } else if (ele.parent("label").length > 0) {
            ele = ele.parent().siblings("label").find("input:" + ele.attr("type") + "[name='" + ele.attr("name") + "']");
            ele.push(this);
            beforeCheckboxNRadios = ele;
          } else {
            ele = ele.siblings("input:" + ele.attr("type") + "[name='" + ele.attr("name") + "']");
            ele.push(this);
            beforeCheckboxNRadios = ele;
          }
          if (ele.length > 1) {
            key = ele.attr("name");
          } else if (ele.length === 1) {
            key = ele.attr("id");
            if (key === void 0) {
              key = ele.attr("name");
            }
          }
          if (key !== void 0) {
            retData[key] = ele.vals();
          }
        }
      } else {
        if (key !== void 0) {
          if (!ele.is("select")) {
            if (ele.is("img")) {
              retData[key] = ele.attr("src");
            } else {
              if (!ele.is(":input")) {
                retData[key] = ele.text();
              } else {
                retData[key] = ele.val();
              }
            }
          } else {
            retData[key] = ele.vals();
          }
        }
      }
    });
    return retData;
  }
  /**
   * Data change effect for ND.ds
   */
  static dataChanged(ele) {
    ele.addClass("data_changed__");
    ele.fadeOut(150).fadeIn(300);
  }
  /**
   * Get the maximum z-index of all elements
   */
  static maxZindex(ele) {
    if (ele === void 0) {
      ele = jQuery("div, span, ul, p, nav, article, section");
    }
    return Math.max.apply(null, jQuery.map(ele, function(e) {
      const zIndex = parseInt(jQuery(e).css("z-index"));
      if (zIndex >= 2147483647) {
        jQuery(e).css("z-index", String(2147483647 - 999));
        jQuery(e).attr("fixed", "[Natural-JS]limited_z-index_value(-999)");
      }
      return zIndex || 0;
    }));
  }
};
var { toRules} = ElementUtils;

// src/data/formatter/formatter.js
var Formatter = class {
  constructor(obj, rules) {
    this.options = {
      data: isPlainObject(obj) ? jQuery(obj) : obj,
      rules,
      isElement: false,
      createEvent: true,
      context: null,
      targetEle: jQuery()
    };
    if (isElement(rules) || isString(rules)) {
      const opts = this.options;
      opts.isElement = true;
      opts.context = jQuery(rules);
      if (obj.length > 0) {
        if (obj[0][opts.context.attr("id")] !== void 0) {
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
    if (row !== void 0) {
      if (row < opts.data.length && row >= 0) {
        opts.data = [opts.data[row]];
      } else {
        throw error("[ND.formatter.format]Row index out of range");
      }
    }
    jQuery(opts.data).each(function(i, obj) {
      retObj = {};
      for (const k in opts.rules) {
        let tempValue = trimToEmpty(obj[k]);
        retObj[k] = tempValue;
      }
      retArr.push(retObj);
    });
    return retArr;
  }
  unformat(row) {
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
};
var formatter = (obj, rules) => new Formatter(obj, rules);

// src/data/validator/validator.js
var Validator = class {
  constructor(obj, rules) {
    this.options = {
      data: isPlainObject(obj) ? jQuery(obj) : obj,
      rules,
      isElement: false,
      context: null,
      targetEle: jQuery()
    };
    if (isElement(rules) || isString(rules)) {
      const opts = this.options;
      opts.isElement = true;
      opts.context = jQuery(rules);
      if (obj.length > 0) {
        if (obj[0][opts.context.attr("id")] !== void 0) {
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
    if (row !== void 0) {
      if (row < opts.data.length && row >= 0) {
        opts.data = [opts.data[row]];
      } else {
        throw error("[ND.validator.validate]Row index out of range");
      }
    }
    jQuery(opts.data).each(function(i, obj) {
      retObj = { passed: true, errors: {} };
      for (const k in opts.rules) {
        const value = trimToEmpty(obj[k]);
        const rules = opts.rules[k];
        jQuery(rules).each(function() {
          const ruleName = this[0];
          this.slice(1);
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
    } catch (e) {
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
};
var validator = (obj, rules) => new Validator(obj, rules);

// src/data/filters/data-filter.js
var DataFilter = class {
  static filter(data, condition) {
    if (!condition) return data;
    return jQuery(data).filter(function() {
      for (const key in condition) {
        if (this[key] !== condition[key]) {
          return false;
        }
      }
      return true;
    }).toArray();
  }
  static sort(data, key, reverse) {
    const sorted = jQuery.extend(true, [], data);
    sorted.sort(function(a, b) {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return reverse ? 1 : -1;
      if (aVal > bVal) return reverse ? -1 : 1;
      return 0;
    });
    return sorted;
  }
};
var filter = DataFilter.filter.bind(DataFilter);
var sort = DataFilter.sort.bind(DataFilter);

export { DataFilter, DataSync, Formatter, Validator, ds, filter, formatter, sort, validator };
//# sourceMappingURL=data.mjs.map
//# sourceMappingURL=data.mjs.map