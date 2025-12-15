'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
  type,
  isString,
  isNumeric,
  isPlainObject,
  isEmptyObject,
  isArray,
  isArraylike,
  isWrappedSet,
  isElement,
  toSelector
} = TypeChecker;

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

// src/core/helpers/serial-execute.js
var SerialExecute = class {
  /**
   * Run asynchronous execution sequentially
   * @param {...Function} functions - Functions to execute in sequence
   * @returns {Array} Array of jQuery Deferred objects
   */
  static execute() {
    const defers = [];
    jQuery(arguments).each(function(i, fn) {
      const defer = jQuery.Deferred();
      defers.push(defer);
      if (defers.length > 1) {
        defers[i - 1].done(function() {
          fn.apply(defers, jQuery.merge([defer], arguments));
        });
      } else {
        fn.apply(defers, [defer]);
      }
    });
    return defers;
  }
};
var serialExecute = SerialExecute.execute;

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
var getContext2 = () => ({ attr: () => ({ formatter: { date: {} } }) });
var DateUtils = class _DateUtils {
  /**
   * Calculate the difference between two dates
   */
  static diff(refDateStr, targetDateStr) {
    if (type(refDateStr) === "string") {
      refDateStr = this.strToDate(refDateStr).obj;
    }
    if (type(targetDateStr) === "string") {
      targetDateStr = this.strToDate(targetDateStr).obj;
    }
    return Math.ceil((targetDateStr - refDateStr) / 1e3 / 24 / 60 / 60);
  }
  /**
   * Return to re-place the date string for a given format.
   */
  static strToDateStrArr(str, format3, isString2) {
    const dateStrArr = [];
    let fixNum = 0;
    if (format3.length === 3 && str.length === 7 || format3.length === 2 && str.length === 5) {
      fixNum = -1;
    }
    if (StringUtils.startsWith(format3, "Ymd")) {
      dateStrArr.push(str.substring(0, 4 + fixNum));
      dateStrArr.push(str.substring(4 + fixNum, 6 + fixNum));
      dateStrArr.push(str.substring(6 + fixNum, 8 + fixNum));
    } else if (StringUtils.startsWith(format3, "mdY")) {
      dateStrArr.push(str.substring(4, 8 + fixNum));
      dateStrArr.push(str.substring(0, 2));
      dateStrArr.push(str.substring(2, 4));
    } else if (StringUtils.startsWith(format3, "dmY")) {
      dateStrArr.push(str.substring(4, 8 + fixNum));
      dateStrArr.push(str.substring(2, 4));
      dateStrArr.push(str.substring(0, 2));
    } else if (StringUtils.startsWith(format3, "Ym")) {
      dateStrArr.push(str.substring(0, 4 + fixNum));
      dateStrArr.push(str.substring(4 + fixNum, 6 + fixNum));
    } else if (StringUtils.startsWith(format3, "mY")) {
      dateStrArr.push(str.substring(2, 6 + fixNum));
      dateStrArr.push(str.substring(0, 2));
    } else {
      throw error('[NC.date.strToDateStrArr]"' + format3 + `" date format is not support. please change return value of NA.context.attr("data").formatter.date's functions`);
    }
    if (isString2 === void 0 || isString2 === false) {
      jQuery(dateStrArr).each(function(i) {
        dateStrArr[i] = parseInt(this);
      });
    }
    return dateStrArr;
  }
  /**
   * Convert a date string to a date object
   */
  static strToDate(str, format3) {
    str = StringUtils.trimToEmpty(str).replace(/[^0-9]/g, "");
    let dateInfo = null;
    let dateStrArr;
    const ctx = getContext2();
    if (str.length > 2 && str.length <= 4) {
      dateInfo = {
        obj: new Date(str, 1, 1, 0, 0, 0),
        format: "Y"
      };
    } else if (str.length === 6) {
      if (format3 === void 0) {
        format3 = ctx.attr("data").formatter.date.Ym();
      }
      dateStrArr = _DateUtils.strToDateStrArr(str, format3.replace(/[^Y|^m|^d]/g, ""));
      dateInfo = {
        obj: new Date(dateStrArr[0], dateStrArr[1] - 1, 1, 0, 0, 0),
        format: format3
      };
    } else if (str.length === 8) {
      if (format3 === void 0) {
        format3 = ctx.attr("data").formatter.date.Ymd();
      }
      dateStrArr = _DateUtils.strToDateStrArr(str, format3.replace(/[^Y|^m|^d]/g, ""));
      dateInfo = {
        obj: new Date(dateStrArr[0], dateStrArr[1] - 1, dateStrArr[2], 0, 0, 0),
        format: format3
      };
    } else if (str.length === 10) {
      if (format3 === void 0) {
        format3 = ctx.attr("data").formatter.date.YmdH();
      }
      dateStrArr = _DateUtils.strToDateStrArr(str, format3.replace(/[^Y|^m|^d]/g, ""));
      dateInfo = {
        obj: new Date(dateStrArr[0], dateStrArr[1] - 1, dateStrArr[2], Number(str.substring(8, 10)), 0, 0),
        format: format3
      };
    } else if (str.length === 12) {
      if (format3 === void 0) {
        format3 = ctx.attr("data").formatter.date.YmdHi();
      }
      dateStrArr = _DateUtils.strToDateStrArr(str, format3.replace(/[^Y|^m|^d]/g, ""));
      dateInfo = {
        obj: new Date(
          dateStrArr[0],
          dateStrArr[1] - 1,
          dateStrArr[2],
          Number(str.substring(8, 10)),
          Number(str.substring(10, 12)),
          0
        ),
        format: format3
      };
    } else if (str.length >= 14) {
      if (format3 === void 0) {
        format3 = ctx.attr("data").formatter.date.YmdHis();
      }
      dateStrArr = _DateUtils.strToDateStrArr(str, format3.replace(/[^Y|^m|^d]/g, ""));
      dateInfo = {
        obj: new Date(
          dateStrArr[0],
          dateStrArr[1] - 1,
          dateStrArr[2],
          Number(str.substring(8, 10)),
          Number(str.substring(10, 12)),
          Number(str.substring(12, 14))
        ),
        format: format3
      };
    }
    return dateInfo;
  }
  /**
   * Format the date string
   */
  static format(str, format3) {
    const dateInfo = _DateUtils.strToDate(str);
    return dateInfo !== null ? dateInfo.obj.formatDate(format3 !== void 0 ? format3 : dateInfo.format) : str;
  }
  /**
   * Convert date object to timestamp number
   */
  static dateToTs(dateObj) {
    let d = dateObj;
    if (d === void 0) {
      d = /* @__PURE__ */ new Date();
    }
    return Math.round(d.getTime() / 1e3);
  }
  /**
   * Convert timestamp number to date object
   */
  static tsToDate(tsNum) {
    if (tsNum === void 0) {
      return /* @__PURE__ */ new Date();
    } else {
      return new Date(tsNum);
    }
  }
  /**
   * Get a list of monthly date objects
   *
   * @param year
   * @param month
   * @return array[array[date]]
   */
  static dateList(year, month) {
    const weekArr = [];
    const prevDate = new Date(year, month - 1, 0);
    const currDate = new Date(year, month, 0);
    const nextDate = new Date(year, month + 1, 0);
    const lastDate = currDate.getDate();
    const prevLastDate = prevDate.getDate();
    const prevLastDay = prevDate.getDay();
    let daysOfWeek = [];
    if (prevLastDay !== 6) {
      for (let i = prevLastDate - prevLastDay; i <= prevLastDate; i++) {
        prevDate.setDate(i);
        daysOfWeek.push(new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate(), 0));
      }
    }
    for (let i = 1; i <= lastDate; i++) {
      currDate.setDate(i);
      daysOfWeek.push(new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 0));
      if (i > 0 && daysOfWeek.length === 7) {
        weekArr.push(daysOfWeek);
        daysOfWeek = [];
      }
    }
    weekArr.push(daysOfWeek);
    let daysOfLastWeek = weekArr[weekArr.length - 1];
    let lastDayOfCalendar;
    for (let i = 1, length = daysOfLastWeek.length; i <= 7 - length; i++) {
      nextDate.setDate(i);
      daysOfLastWeek.push(new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate(), 0));
      lastDayOfCalendar = i;
    }
    if (weekArr.length === 5) {
      daysOfLastWeek = [];
      for (let i = lastDayOfCalendar + 1; i <= lastDayOfCalendar + 7; i++) {
        nextDate.setDate(i);
        daysOfLastWeek.push(new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate(), 0));
      }
      weekArr.push(daysOfLastWeek);
    }
    return weekArr;
  }
};
var initDateFormatter = () => {
  Date.prototype.formatDate = function(input, time) {
    const daysLong = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthsLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const switches = {
      // switches object
      a: function() {
        return date.getHours() > 11 ? "pm" : "am";
      },
      A: function() {
        return this.a().toUpperCase();
      },
      B: function() {
        const off = (date.getTimezoneOffset() + 60) * 60;
        const theSeconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds() + off;
        let beat = Math.floor(theSeconds / 86.4);
        if (beat > 1e3)
          beat -= 1e3;
        if (beat < 0)
          beat += 1e3;
        if (String(beat).length === 1)
          beat = "00" + beat;
        if (String(beat).length === 2)
          beat = "0" + beat;
        return beat;
      },
      c: function() {
        return this.Y() + "-" + this.m() + "-" + this.d() + "T" + this.H() + ":" + this.i() + ":" + this.s() + this.P();
      },
      d: function() {
        const j = String(this.j());
        return j.length === 1 ? "0" + j : j;
      },
      D: function() {
        return daysShort[date.getDay()];
      },
      F: function() {
        return monthsLong[date.getMonth()];
      },
      g: function() {
        if (date.getHours() === 0) {
          return 12;
        } else {
          return date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
        }
      },
      G: function() {
        return date.getHours();
      },
      h: function() {
        const g = String(this.g());
        return g.length === 1 ? "0" + g : g;
      },
      H: function() {
        const G = String(this.G());
        return G.length === 1 ? "0" + G : G;
      },
      i: function() {
        const min = String(date.getMinutes());
        return min.length === 1 ? "0" + min : min;
      },
      I: function() {
        const noDST = /* @__PURE__ */ new Date("January 1 " + this.Y() + " 00:00:00");
        return noDST.getTimezoneOffset() === date.getTimezoneOffset() ? 0 : 1;
      },
      j: function() {
        return date.getDate();
      },
      l: function() {
        return daysLong[date.getDay()];
      },
      L: function() {
        const Y = this.Y();
        if (Y % 4 === 0 && Y % 100 !== 0 || Y % 4 === 0 && Y % 100 === 0 && Y % 400 === 0) {
          return 1;
        } else {
          return 0;
        }
      },
      m: function() {
        const n = String(this.n());
        return n.length === 1 ? "0" + n : n;
      },
      M: function() {
        return monthsShort[date.getMonth()];
      },
      n: function() {
        return date.getMonth() + 1;
      },
      N: function() {
        const w = this.w();
        return w === 0 ? 7 : w;
      },
      O: function() {
        const os = Math.abs(date.getTimezoneOffset());
        let h = String(Math.floor(os / 60));
        let m = String(os % 60);
        if (h.length === 1) h = "0" + h;
        if (m.length === 1) m = "0" + m;
        return date.getTimezoneOffset() < 0 ? "+" + h + m : "-" + h + m;
      },
      P: function() {
        const O = this.O();
        return O.substring(0, 3) + ":" + O.substring(3, 5);
      },
      r: function() {
        let r;
        r = this.D() + ", " + this.d() + " " + this.M() + " " + this.Y() + // 16 : 01 : 07 0200
        " " + this.H() + ":" + this.i() + ":" + this.s() + " " + this.O();
        return r;
      },
      s: function() {
        const sec = String(date.getSeconds());
        return sec.length === 1 ? "0" + sec : sec;
      },
      S: function() {
        switch (date.getDate()) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
          case 21:
            return "st";
          case 22:
            return "nd";
          case 23:
            return "rd";
          case 31:
            return "st";
          default:
            return "th";
        }
      },
      t: function() {
        const daysinmonths = [null, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (this.L() === 1 && this.n() === 2)
          return 29;
        return daysinmonths[this.n()];
      },
      U: function() {
        return Math.round(date.getTime() / 1e3);
      },
      w: function() {
        return date.getDay();
      },
      W: function() {
        const DoW = this.N();
        const DoY = this.z();
        const daysToNY = 364 + this.L() - DoY;
        if (daysToNY <= 2 && DoW <= 3 - daysToNY) {
          return 1;
        }
        if (DoY <= 2 && DoW >= 5) {
          return new Date(this.Y() - 1, 11, 31).formatDate("W");
        }
        let nyDoW = new Date(this.Y(), 0, 1).getDay();
        nyDoW = nyDoW !== 0 ? nyDoW - 1 : 6;
        if (nyDoW <= 3) {
          return 1 + Math.floor((DoY + nyDoW) / 7);
        } else {
          return 1 + Math.floor((DoY - (7 - nyDoW)) / 7);
        }
      },
      y: function() {
        const y = String(this.Y());
        return y.substring(y.length - 2, y.length);
      },
      Y: function() {
        let x;
        if (date.getFullYear) {
          const newDate = /* @__PURE__ */ new Date("January 1 2001 00:00:00 +0000");
          x = newDate.getFullYear();
          if (x === 2001) {
            return date.getFullYear();
          }
        }
        x = date.getYear();
        let y = x % 100;
        y += y < 38 ? 2e3 : 1900;
        return y;
      },
      z: function() {
        const s = "January 1 " + this.Y() + " 00:00:00 GMT" + this.O();
        const t = new Date(s);
        const diff2 = date.getTime() - t.getTime();
        return Math.floor(diff2 / 1e3 / 60 / 60 / 24);
      },
      Z: function() {
        return date.getTimezoneOffset() * -60;
      }
    };
    const date = time ? new Date(time) : this;
    const formatString = input.split("");
    let i = 0;
    while (i < formatString.length) {
      if (formatString[i] === "%") {
        formatString.splice(i, 1);
      } else {
        formatString[i] = switches[formatString[i]] !== void 0 ? switches[formatString[i]]() : formatString[i];
      }
      i++;
    }
    return formatString.join("");
  };
  Date.DATE_ATOM = "Y-m-d%TH:i:sP";
  Date.DATE_ISO8601 = "Y-m-d%TH:i:sO";
  Date.DATE_RFC2822 = "D, d M Y H:i:s O";
  Date.DATE_W3C = "Y-m-d%TH:i:sP";
};
var { diff, strToDateStrArr, strToDate, format, dateToTs, tsToDate, dateList } = DateUtils;

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
var { toOpts, toRules, toData, dataChanged, maxZindex } = ElementUtils;

// src/core/utils/browser.js
var BrowserUtils = class _BrowserUtils {
  /**
   * Set and get cookie
   *  - get : when value is undefined
   */
  static cookie(name, value, expiredays, domain) {
    if (value === void 0) {
      const getCookieVar = function(offset) {
        let endstr = document.cookie.indexOf(";", offset);
        if (endstr === -1) {
          endstr = document.cookie.length;
        }
        return decodeURIComponent(document.cookie.substring(offset, endstr));
      };
      const arg = name + "=";
      const alen = arg.length;
      const clen = document.cookie.length;
      let i = 0;
      while (i < clen) {
        const j = i + alen;
        if (document.cookie.substring(i, j) === arg) {
          return getCookieVar(j);
        }
        i = document.cookie.indexOf(" ", i) + 1;
        if (i === 0) {
          break;
        }
      }
    } else {
      let expires;
      if (expiredays !== void 0) {
        const today = /* @__PURE__ */ new Date();
        today.setDate(today.getDate() + expiredays);
        expires = "; expires=" + today.toGMTString();
      } else {
        expires = "";
      }
      let domain_;
      if (domain !== void 0) {
        domain_ = "; domain=" + domain;
      } else {
        domain_ = "";
      }
      document.cookie = name + "=" + decodeURIComponent(value) + "; path=/" + expires + domain_;
    }
  }
  /**
   * Remove cookie
   */
  static removeCookie(name, domain) {
    if (domain !== void 0) {
      document.cookie = name + "=; path=/; expires=" + /* @__PURE__ */ new Date(1) + "; domain=" + domain;
    } else {
      document.cookie = name + "=; path=/; expires=" + /* @__PURE__ */ new Date(1) + ";";
    }
  }
  /**
   * Get Microsoft Internet Explorer version
   *  - MSIE trident version has been applied
   */
  static msieVersion() {
    const ua = window.navigator.userAgent;
    let msie = ua.indexOf("MSIE ");
    if (msie < 0) {
      msie = ua.indexOf(".NET");
    }
    const trident = ua.match(/Trident\/(\d.\d)/i);
    if (msie < 0) {
      return 0;
    } else {
      if (trident === void 0) {
        return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
      } else {
        return parseInt(trident[1]) + 4;
      }
    }
  }
  /**
   * Check the connected browser
   */
  static is(name) {
    if ("opera" in window || navigator.userAgent.indexOf(" OPR/") >= 0) {
      return name === "opera";
    } else if ("InstallTrigger" in window) {
      return name === "firefox";
    } else if (name !== "ios" && navigator.userAgent.match(/^((?!chrome|android|crios|fxios).)*safari/i)) {
      return name === "safari";
    } else if ("chrome" in window && !("opera" in window || navigator.userAgent.indexOf(" OPR/") >= 0)) {
      return name === "chrome";
    } else if (_BrowserUtils.msieVersion() > 0) {
      return name === "ie";
    } else if (navigator.userAgent.match(/like Mac OS X/i)) {
      return name === "ios";
    } else if (navigator.userAgent.match(/android/i)) {
      return name === "android";
    }
    return false;
  }
  /**
   * Get context path from current window url
   */
  static contextPath() {
    const offset = location.href.indexOf(location.host) + location.host.length;
    return location.href.substring(offset, location.href.indexOf("/", offset + 1));
  }
  /**
   * Get scrollbars width for connected browser
   */
  static scrollbarWidth() {
    const div = jQuery('<div class="antiscroll-inner" style="width:50px;height:50px;overflow-y:scroll;position:absolute;top:-200px;left:-200px;"><div style="height:100px;width:100%"/></div>');
    jQuery("body").append(div);
    const w1 = jQuery(div).innerWidth();
    const w2 = jQuery("div", div).innerWidth();
    jQuery(div).remove();
    return w1 - w2;
  }
};
var { cookie, removeCookie, msieVersion, is, contextPath, scrollbarWidth } = BrowserUtils;
var getLocale = () => (() => "en_US");
var MessageUtils = class _MessageUtils {
  /**
   * Replace message variables for NC.message.get
   */
  static replaceMsgVars(msg, vars) {
    if (vars !== void 0) {
      for (let i = 0; i < vars.length; i++) {
        msg = msg.split("{" + String(i) + "}").join(vars[i]);
      }
    }
    return msg;
  }
  /**
   * Get message from message resource
   */
  static get(resource, key, vars) {
    const locale = getLocale()();
    const msg = resource[locale][key];
    return msg !== void 0 ? _MessageUtils.replaceMsgVars(msg, vars) : key;
  }
};
var { replaceMsgVars, get } = MessageUtils;

// src/core/utils/array.js
var ArrayUtils = class {
  /**
   * Remove duplicated value(object | etc.)
   */
  static deduplicate(arr, key) {
    const rtnArr = [];
    jQuery(arr).each(function(i, obj) {
      if (type(obj) === "object" && key !== void 0) {
        if (jQuery.inArray(obj[key], jQuery(rtnArr).map(function() {
          return this[key];
        }).get()) < 0) {
          rtnArr.push(obj);
        }
      } else {
        if (jQuery.inArray(obj, rtnArr) < 0) {
          rtnArr.push(obj);
        }
      }
    });
    return rtnArr;
  }
};
var { deduplicate } = ArrayUtils;
var getContext3 = () => ({ attr: () => ({ excludeMapFromKeys: void 0 }) });
var JSONUtils = class {
  static mapFromKeys(obj) {
    if (arguments.length > 1) {
      let args = Array.prototype.slice.call(arguments, 0);
      const ctx = getContext3();
      if (ctx.attr("core").excludeMapFromKeys !== void 0) {
        args = args.concat(ctx.attr("core").excludeMapFromKeys);
      }
      if (type(obj) === "array") {
        if (obj.length === 0) {
          return obj;
        }
        return jQuery(obj).map(function() {
          const retObj = {};
          for (let i = 1, length = args.length; i < length; i++) {
            if (args[i] !== void 0 && this[args[i]] !== void 0) {
              retObj[args[i]] = this[args[i]];
            }
          }
          return retObj;
        }).get();
      } else {
        const retObj = {};
        for (let i = 1, length = args.length; i < length; i++) {
          if (args[i] !== void 0 && obj[args[i]] !== void 0) {
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
      if (keySet.indexOf(this[key]) < 0) {
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
      if (sIndent === void 0) {
        sIndent = 4;
      }
      return JSON.stringify(oData, void 0, sIndent);
    } else {
      return null;
    }
  }
};
var { mapFromKeys, mergeJsonArray, format: format2 } = JSONUtils;

// src/core/utils/event.js
var EventUtils = class _EventUtils {
  /**
   * This function was taken from "https://stackoverflow.com/a/13952775" and modified.
   */
  static isNumberRelatedKeys(e) {
    e = e ? e : window.event;
    let key;
    const charsKeys = [
      97,
      // a Ctrl + a Select All
      65,
      // A Ctrl + A Select All
      99,
      // c Ctrl + c Copy
      67,
      // C Ctrl + C Copy
      118,
      // v Ctrl + v paste
      86,
      // V Ctrl + V paste
      115,
      // s Ctrl + s save
      83,
      // S Ctrl + S save
      112,
      // p Ctrl + p print
      80
      // P Ctrl + P print
    ];
    const specialKeys = [
      8,
      // backspace
      9,
      // tab
      27,
      // escape
      13,
      // enter
      35,
      // Home & shiftKey + #
      36,
      // End & shiftKey + $
      37,
      // left arrow & shiftKey + %
      39,
      // right arrow & '
      46,
      // delete & .
      45
      // Ins & -
    ];
    key = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
    if (key && !(key >= 48 && key <= 57 || key >= 96 && key <= 105)) {
      if (e.ctrlKey && charsKeys.indexOf(key) !== -1 || // Fix Issue: f1 : f12 Or Ctrl + f1 : f12, in
      // Firefox browser
      navigator.userAgent.indexOf("Firefox") !== -1 && (e.ctrlKey && e.keyCode && e.keyCode > 0 && key >= 112 && key <= 123 || e.keyCode && e.keyCode > 0 && key && key >= 112 && key <= 123)) {
        return true;
      } else if (specialKeys.indexOf(key) !== -1) {
        if (navigator.userAgent.indexOf("Firefox") !== -1 && (key === 39 || key === 45 || key === 46)) {
          return e.keyCode !== void 0 && e.keyCode > 0;
        } else return !(e.shiftKey && (key === 35 || key === 36 || key === 37));
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
  /**
   * Prevent all events
   */
  static disable(e) {
    try {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
    } catch (e2) {
    }
    return false;
  }
  /**
   * This method is locked window scroll when scrolling in the ele(arg1)
   */
  static windowScrollLock(ele) {
    ele.on("mousewheel.ui DOMMouseScroll.ui", function(e) {
      const delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
      if (delta > 0 && jQuery(this).scrollTop() <= 0) return false;
      return !(delta < 0 && jQuery(this).scrollTop() >= this.scrollHeight - jQuery(this).height());
    });
  }
  /**
   * Detect the duration of animation or transition of css3
   */
  static getMaxDuration(ele, css) {
    if (!ele.css(css) || ele.css(css).startsWith("0")) {
      return 0;
    }
    return Math.max.apply(void 0, jQuery(ele.css(css).split(",")).map(function() {
      if (this.indexOf("ms") > -1) {
        return parseInt(StringUtils.trimToZero(this));
      } else {
        return parseFloat(StringUtils.trimToZero(this)) * 1e3;
      }
    }).get());
  }
  /**
   * Detect the end event name of CSS animations
   * Reference from David Walsh: http://davidwalsh.name/css-animation-callback
   */
  static whichAnimationEvent(ele) {
    let el;
    if (ele !== void 0 && ele.length > 0) {
      if (_EventUtils.getMaxDuration(ele, "animation-duration") === 0) {
        return "nothing";
      }
      el = ele.get(0);
    } else {
      el = document.createElement("fakeelement");
    }
    const animations = {
      "animation": "animationend",
      "OAnimation": "oAnimationEnd",
      "MSAnimation": "MSAnimationEnd",
      "WebkitAnimation": "webkitAnimationEnd"
    };
    for (const t in animations) {
      if (animations.hasOwnProperty(t) && el.style[t] !== void 0) {
        return animations[t];
      }
    }
    return "nothing";
  }
  /**
   * Detect the end event name of CSS transitions
   * Reference from David Walsh: http://davidwalsh.name/css-animation-callback
   */
  static whichTransitionEvent(ele) {
    if (ele !== void 0) {
      if (_EventUtils.getMaxDuration(ele, "transition-duration") === 0) {
        return "nothing";
      }
    }
    const el = document.createElement("fakeelement");
    const transitions = {
      "transition": "transitionend",
      "OTransition": "oTransitionEnd",
      "MozTransition": "transitionend",
      "WebkitTransition": "webkitTransitionEnd"
    };
    for (const t in transitions) {
      if (transitions.hasOwnProperty(t) && el.style[t] !== void 0) {
        return transitions[t];
      }
    }
    return "nothing";
  }
};
var { isNumberRelatedKeys, disable, windowScrollLock, getMaxDuration, whichAnimationEvent, whichTransitionEvent } = EventUtils;

// src/core/utils/mask.js
var Mask = class {
  constructor(m) {
    this.format = m;
    this.error = [];
    this.errorCodes = [];
    this.strippedValue = "";
    this.allowPartial = false;
    this.throwError = function(c, e, v) {
      this.error[this.error.length] = e;
      this.errorCodes[this.errorCodes.length] = c;
      if (typeof v == "string") {
        return v;
      }
      return true;
    };
  }
  setGeneric(_v, _d) {
    let v = _v, m = this.format;
    let r = "@#~", rt = [], nv = "", t, x, a = [], j = 0, rx = {
      "@": "a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ s",
      "#": "0-9s",
      "~": "0-9a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ s"
    };
    v = v.replace(new RegExp("[^" + rx["~"] + "]", "gi"), "");
    if (_d === true && v.length === this.strippedValue.length) {
      v = v.substring(0, v.length - 1);
    }
    this.strippedValue = v;
    for (let i = 0; i < m.length; i++) {
      x = m.charAt(i);
      t = r.indexOf(x) > -1;
      if (x === "!") {
        x = m.charAt(i++);
      }
      if (t && !this.allowPartial || t && this.allowPartial && rt.length < v.length) {
        rt[rt.length] = "[" + rx[x] + "]";
      }
      a[a.length] = {
        "chr": x,
        "mask": t
      };
    }
    let hasOneValidChar = false;
    if (!this.allowPartial && !new RegExp(rt.join("")).test(v)) {
      return this.throwError(1, 'The value "' + _v + '" must be in the format ' + this.format + ".", _v);
    } else if (this.allowPartial && v.length > 0 || !this.allowPartial) {
      for (let i = 0; i < a.length; i++) {
        if (a[i].mask) {
          while (v.length > 0 && !new RegExp(rt[j]).test(v.charAt(j))) {
            v = v.length === 1 ? "" : v.substring(1);
          }
          if (v.length > 0) {
            nv += v.charAt(j);
            hasOneValidChar = true;
          }
          j++;
        } else {
          nv += a[i].chr;
        }
        if (this.allowPartial && j > v.length) {
          break;
        }
      }
    }
    if (this.allowPartial && !hasOneValidChar) {
      nv = "";
    }
    if (this.allowPartial) {
      if (nv.length < a.length) {
        this.nextValidChar = rx[a[nv.length].chr];
      } else {
        this.nextValidChar = null;
      }
    }
    return nv;
  }
  setNumeric(_v, _p, _d) {
    let v = String(_v).replace(/[^\d.-]*/gi, ""), m = this.format;
    v = v.replace(/\./, "d").replace(/\./g, "").replace(/d/, ".");
    if (!/^[\$]?((\$?[\+-]?([0#]{1,3},)?[0#]*(\.[0#]*)?)|([\+-]?\([\+-]?([0#]{1,3},)?[0#]*(\.[0#]*)?\)))$/.test(m)) {
      return this.throwError(1, "An invalid numeric user format was specified for the \nNumeric user format constructor.", _v);
    }
    if (_d === true && v.length === this.strippedValue.length) {
      v = v.substring(0, v.length - 1);
    }
    if (this.allowPartial && v.replace(/[^0-9]/, "").length === 0) {
      return v;
    }
    this.strippedValue = v;
    if (v.length === 0) {
      v = NaN;
    }
    const vn = Number(v);
    if (isNaN(vn)) {
      return this.throwError(2, "The value entered was not a number.", _v);
    }
    if (m.length === 0) {
      return v;
    }
    let vi = String(Math.abs(Number(v.indexOf(".") > -1 ? v.split(".")[0] : v)));
    let vd = v.indexOf(".") > -1 ? v.split(".")[1] : "";
    const _vd = vd;
    const isNegative = vn !== 0 && Math.abs(vn) * -1 === vn;
    const show = {
      "$": /^[\$]/.test(m),
      "(": isNegative && m.indexOf("(") > -1,
      "+": m.indexOf("+") !== -1 && !isNegative
    };
    show["-"] = isNegative && (!show["("] || m.indexOf("-") !== -1);
    m = m.replace(/[^#0.,]*/gi, "");
    const dm = m.indexOf(".") > -1 ? m.split(".")[1] : "";
    if (dm.length === 0) {
      if (_p !== void 0 && _p === "round") {
        vi = String(Math.round(Number(vi)));
      } else if (_p !== void 0 && _p === "ceil") {
        vi = String(Math.ceil(Number(vi)));
      } else {
        vi = String(Math.floor(Number(vi)));
      }
      vd = "";
    } else {
      const md = dm.lastIndexOf("0") + 1;
      if (vd.length > dm.length) {
        const basePart = vd.substring(0, dm.length);
        const nextDigit = parseInt(vd.charAt(dm.length)) || 0;
        const shouldRound = _p === void 0 || _p === "round";
        const shouldCeil = _p === "ceil";
        const shouldFloor = _p === "floor";
        if (shouldRound) {
          if (nextDigit >= 5) {
            let num = Number("0." + basePart) + Math.pow(10, -dm.length);
            vd = num.toFixed(dm.length).split(".")[1];
          } else {
            vd = basePart;
          }
        } else if (shouldCeil) {
          if (nextDigit > 0 || basePart !== "0".repeat(dm.length)) {
            let num = Number("0." + basePart) + Math.pow(10, -dm.length);
            vd = num.toFixed(dm.length).split(".")[1];
          } else {
            vd = basePart;
          }
        } else if (shouldFloor) {
          vd = basePart;
        }
      } else {
        while (vd.length < md) {
          vd += "0";
        }
      }
    }
    let im = m.indexOf(".") > -1 ? m.split(".")[0] : m;
    im = im.replace(/[^0#]+/gi, "");
    let mv = im.indexOf("0") + 1;
    if (mv > 0) {
      mv = im.length - mv + 1;
      while (vi.length < mv) {
        vi = "0" + vi;
      }
    }
    if (/[#0]+,[#0]{3}/.test(m)) {
      let x = [], i = 0, n = Number(vi);
      while (n > 999) {
        x[i] = "00" + String(n % 1e3);
        x[i] = x[i].substring(x[i].length - 3);
        n = Math.floor(n / 1e3);
        i++;
      }
      x[i] = String(n % 1e3);
      vi = x.reverse().join(",");
    }
    if (vd.length > 0 && !this.allowPartial || dm.length > 0 && this.allowPartial && v.indexOf(".") > -1 && _vd.length >= vd.length) {
      v = vi + "." + vd;
    } else if (dm.length > 0 && this.allowPartial && v.indexOf(".") > -1 && _vd.length < vd.length) {
      v = vi + "." + _vd;
    } else {
      v = vi;
    }
    if (show.$) {
      v = this.format.replace(/(^[\$])(.+)/gi, "$") + v;
    }
    if (show["+"]) {
      v = "+" + v;
    }
    if (show["-"]) {
      v = "-" + v;
    }
    if (show["("]) {
      v = "(" + v + ")";
    }
    return v;
  }
};
var getContext4 = () => ({
  attr: () => ({
    core: {
      sgChkdVal: "Y",
      sgUnChkdVal: "N",
      locale: "en_US"
    },
    architecture: {
      page: { context: document }
    }
  })
});
var jQueryExtensions = {
  /**
   * Remove element in array
   */
  remove_(idx, length) {
    if (idx !== void 0) {
      if (!isNumeric(idx)) {
        idx = this.toArray().indexOf(idx);
      }
      if (length === void 0) {
        length = 1;
      }
      this.splice(idx, length);
    }
    return this;
  },
  /**
   * Bind an event to top priority
   */
  tpBind() {
    const args = arguments;
    const self = this;
    return this.each(function() {
      if (jQuery._data(this, "events") !== void 0) {
        self.on.apply(self, args);
        jQuery(this).each(function() {
          const handlers = jQuery._data(this, "events")[args[0].split(".")[0]];
          const handler = handlers.pop();
          handlers.splice(0, 0, handler);
        });
      } else {
        self.on.apply(self, args);
      }
    });
  },
  /**
   * Get instance from context element of component or library
   */
  instance(name, instance) {
    if (arguments.length === 0) {
      return this.map(function() {
        return jQuery.map(jQuery(this).data(), function(v, i) {
          if (StringUtils.endsWith(i, "__")) {
            return v;
          }
        });
      });
    } else if (arguments.length === 1) {
      if (typeof name === "function") {
        return this.each(function() {
          return jQuery.each(jQuery(this).data(), function(i, v) {
            if (StringUtils.endsWith(i, "__")) {
              name.call(v, i.replace("__", ""), v);
            }
          });
        });
      } else {
        const insts = this.map(function() {
          return jQuery.map(jQuery(this).data(), function(v, i) {
            if (i === name + "__") {
              return v;
            }
          });
        });
        return insts.length <= 1 ? insts[0] : insts;
      }
    } else if (arguments.length === 2) {
      if (typeof instance === "function") {
        return this.each(function() {
          return jQuery.each(jQuery(this).data(), function(i, v) {
            if (name + "__" === i) {
              instance.call(v, i.replace("__", ""), v);
            }
          });
        });
      } else {
        this.data(name + "__", instance);
        return this;
      }
    }
  },
  /**
   * Get or set the value to (multiple)select input elements
   * if vals(arg[0]) argument is undefined, it works in get mode
   */
  vals(vals) {
    const ctx = getContext4();
    const tagName = this.get(0).tagName.toLowerCase();
    const type2 = StringUtils.trimToEmpty(this.attr("type")).toLowerCase();
    let selEle;
    let ele;
    if (vals !== void 0 && type(vals) !== "function") {
      if (tagName === "select") {
        if (StringUtils.trimToNull(vals) === null && !this.is("select[multiple='multiple']")) {
          if (this.length > 0) {
            this.get(0).selectedIndex = 0;
          }
        } else {
          this.val(vals);
        }
      } else if (type2 === "checkbox") {
        if (type(vals) === "string") {
          vals = [vals];
        }
        if (this.length > 1) {
          this.prop("checked", false);
          const self = this;
          N(vals).each(function() {
            self.filter("[value='" + String(this) + "']").prop("checked", true);
          });
        } else if (this.length === 1) {
          if (vals[0] !== ctx.attr("core").sgChkdVal && vals[0] !== ctx.attr("core").sgUnChkdVal) {
            vals[0] = ctx.attr("core").sgUnChkdVal;
          }
          if (ctx.attr("core").sgChkdVal === vals[0]) {
            this.prop("checked", true);
          } else if (ctx.attr("core").sgUnChkdVal === vals[0]) {
            this.prop("checked", false);
          } else {
            this.filter("[value='" + String(vals[0]) + "']").prop("checked", true);
          }
          this.val(vals[0]);
        }
      } else if (type2 === "radio") {
        this.each(function() {
          const thisEle = N(this);
          if (thisEle.attr("value") === String(vals)) {
            thisEle.prop("checked", true);
          } else {
            thisEle.prop("checked", false);
          }
        });
      }
      return this;
    } else {
      if (tagName === "select") {
        selEle = this.find("> option:selected");
        if (selEle.length > 1) {
          if (type(vals) !== "function") {
            return selEle.map(function() {
              return StringUtils.trimToEmpty(jQuery(this).val());
            }).toArray();
          } else {
            ele = this.find("> option");
            return selEle.each(function() {
              vals.call(this, ele.index(this), this);
            });
          }
        } else if (selEle.length === 1) {
          if (type(vals) !== "function") {
            if (selEle.attr("value") !== void 0) {
              return StringUtils.trimToEmpty(selEle.val());
            } else {
              return "";
            }
          } else {
            vals.call(selEle, this.find("> option:not(.select_default__)").index(selEle), selEle);
            return selEle;
          }
        } else if (selEle.length === 0 && this.is("[multiple]")) {
          return [];
        }
      } else if (type2 === "radio") {
        selEle = this.filter("[name='" + this.attr("name") + "']:checked");
        if (type(vals) !== "function") {
          return StringUtils.trimToEmpty(selEle.val());
        } else {
          vals.call(selEle, this.filter("[name='" + this.attr("name") + "']").index(selEle), selEle);
          return selEle;
        }
      } else if (type2 === "checkbox") {
        selEle = this.filter("[name='" + this.attr("name") + "']:checked");
        if (this.length > 1) {
          if (type(vals) !== "function") {
            const chkedVals = selEle.map(function() {
              return StringUtils.trimToEmpty(jQuery(this).val());
            }).toArray();
            return selEle.length === 1 ? StringUtils.trimToEmpty(jQuery(selEle).val()) : chkedVals.length === 0 ? [] : chkedVals;
          } else {
            ele = this.filter("[name='" + this.attr("name") + "']");
            return selEle.each(function() {
              vals.call(this, ele.index(this), this);
            });
          }
        } else if (this.length === 1) {
          if (selEle.length === 0) {
            selEle = this.filter("[id='" + this.attr("id") + "']");
          }
          if (type(vals) !== "function") {
            let val = StringUtils.trimToEmpty(selEle.val());
            if (val !== ctx.attr("core").sgChkdVal && val !== ctx.attr("core").sgUnChkdVal) {
              val = ctx.attr("core").sgUnChkdVal;
            }
            if (ctx.attr("core").sgChkdVal === val || ctx.attr("core").sgUnChkdVal === val || selEle.attr("value") === void 0) {
              if (selEle.prop("checked")) {
                val = ctx.attr("core").sgChkdVal;
                selEle.val(val);
                return val;
              } else if (!selEle.prop("checked")) {
                val = ctx.attr("core").sgUnChkdVal;
                selEle.val(val);
                return val;
              }
            } else {
              return val;
            }
          } else {
            vals.call(selEle, this.filter("[name='" + this.attr("name") + "']").index(selEle), selEle);
            return selEle;
          }
        }
      }
    }
    return "";
  },
  /**
   * Returns the event bound to the element.
   */
  events(eventName, namespace) {
    const ele = jQuery(this);
    if (ele.length > 0 && jQuery._data(ele.get(0), "events") !== void 0) {
      if (eventName !== void 0 && namespace !== void 0) {
        const e_ = jQuery(jQuery._data(ele.get(0), "events")[eventName]).filter(function() {
          return namespace === this.namespace;
        }).get();
        return isEmptyObject(e_) ? void 0 : e_;
      } else if (eventName !== void 0 && namespace === void 0) {
        return jQuery._data(ele.get(0), "events")[eventName];
      } else {
        return jQuery._data(ele.get(0), "events");
      }
    }
  }
};
function applyJQueryExtensions() {
  Object.keys(jQueryExtensions).forEach((key) => {
    jQuery.fn[key] = jQueryExtensions[key];
  });
}
var getContext5 = () => ({
  attr: () => ({
    architecture: {
      page: { context: document }
    }
  })
});
var GC = class {
  /**
   * Minimum collection
   */
  static minimum() {
    jQuery(window).off("resize.datepicker");
    jQuery(window).off("resize.alert");
    jQuery(document).off("click.datepicker");
    jQuery(document).off("keyup.alert");
    jQuery(document).off("click.grid.dataFilter");
    jQuery(document).off("click.grid.more touchstart.grid.more");
    return true;
  }
  /**
   * Full collection
   */
  static full() {
    jQuery(window).off("resize.datepicker");
    jQuery(window).off("resize.alert");
    jQuery(document).off("dragstart.alert selectstart.alert mousemove.alert touchmove.alert mouseup.alert touchend.alert");
    jQuery(document).off("click.datepicker");
    jQuery(document).off("keyup.alert");
    jQuery(document).off("dragstart.grid.vResize selectstart.grid.vResize mousemove.grid.vResize touchmove.grid.vResize mouseup.grid.vResize touchend.grid.vResize");
    jQuery(document).off("dragstart.grid.resize selectstart.grid.resize mousemove.grid.resize touchmove.grid.resize mouseup.grid.resize touchend.grid.resize");
    jQuery(document).off("click.grid.dataFilter");
    jQuery(document).off("click.grid.more touchstart.grid.more");
    return true;
  }
  /**
   * Removes garbage instances from observables of ND.ds
   */
  static ds() {
    const ctx = getContext5();
    if (jQuery(ctx.attr("architecture").page.context).find(">#data_sync_temp__").length > 0) {
      jQuery(ctx.attr("architecture").page.context).find(">#data_sync_temp__").instance("ds").obserable = jQuery.uniqueSort(jQuery(".grid__, .list__, .form__:not('.grid__>tbody, .list__>li'), .tree__", ctx.attr("architecture").page.context).instance());
    }
  }
};
var { minimum, full, ds } = GC;

// src/architecture/communication/fetch.js
var Fetch = class _Fetch {
  static fetch(options) {
    if (!options.url) {
      throw error("[NA.fetch]options.url is required");
    }
    if (options.async === false) {
      warn("[NA.fetch]async: false is not supported. fetch is always asynchronous.");
    }
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchOptions = _Fetch._convertJQueryAjaxOptionsToFetch(options, signal);
    if (options.fetchOptions) {
      jQuery.extend(true, fetchOptions, options.fetchOptions);
    }
    if (options.beforeSend) {
      if (_Fetch._executeBeforeSend(options, controller) === false) {
        return _Fetch._createAbortedXhr();
      }
    }
    const promise = _Fetch._executeFetch(options.url, fetchOptions, options);
    return _Fetch._createXhrCompat(promise, controller, options);
  }
  // Helper methods (simplified - full version in original file)
  static _convertJQueryAjaxOptionsToFetch(options, signal) {
    const fetchOptions = {
      method: options.type || "GET",
      headers: {},
      signal
    };
    if (options.contentType) {
      fetchOptions.headers["Content-Type"] = options.contentType;
    }
    if (options.data) {
      if (typeof options.data === "string") {
        fetchOptions.body = options.data;
      } else {
        fetchOptions.body = JSON.stringify(options.data);
      }
    }
    return fetchOptions;
  }
  static _executeBeforeSend(options, controller) {
    const xhr = { abort: () => controller.abort() };
    return options.beforeSend(xhr, options);
  }
  static _createAbortedXhr() {
    return {
      readyState: 0,
      status: 0,
      abort: () => {
      },
      then: () => Promise.reject(new Error("Request aborted"))
    };
  }
  static _executeFetch(url, fetchOptions, options) {
    return fetch(url, fetchOptions).then((response) => {
      if (!response.ok && options.error) {
        throw new Error(`HTTP ${response.status}`);
      }
      if (options.dataType === "json" || !options.dataType) {
        return response.json();
      } else {
        return response.text();
      }
    }).then((data) => {
      if (options.success) {
        options.success(data, "success", {});
      }
      return data;
    }).catch((error2) => {
      if (options.error) {
        options.error({}, "error", error2);
      }
      throw error2;
    });
  }
  static _createXhrCompat(promise, controller, options) {
    return {
      readyState: 4,
      status: 200,
      abort: () => controller.abort(),
      then: (resolve, reject) => promise.then(resolve, reject),
      catch: (callback) => promise.catch(callback),
      done: function(callback) {
        promise.then(callback);
        return this;
      },
      fail: function(callback) {
        promise.catch(callback);
        return this;
      }
    };
  }
};
var fetch = Fetch.fetch.bind(Fetch);

// src/architecture/communication/request.js
var Request = class {
  constructor(comm, options) {
    this.options = options || {};
    this.referrer = window.location.href;
    this.comm = comm;
  }
};

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

// src/architecture/communication/communicator.js
var CommunicatorConfig = {
  filterConfig: void 0
};
var _Communicator = class _Communicator {
  constructor(obj, url) {
    if (obj === void 0) {
      throw error("[N.comm]You must input arguments[0]");
    } else {
      if ((isPlainObject(obj) || isString(obj)) && url === void 0) {
        url = obj;
        obj = jQuery();
      }
    }
    if (isPlainObject(obj) || isArray(obj)) {
      obj = jQuery(obj);
    }
    if (CommunicatorConfig.filterConfig === void 0) {
      CommunicatorConfig.filterConfig = _Communicator.initFilterConfig();
    }
    obj.request = new Request(obj, isString(url) ? { "url": url } : url);
    obj.errorHandlers = [];
    ["submit", "error"].forEach((method) => {
      obj[method] = function(arg) {
        return _Communicator[method].call(obj, arg);
      };
    });
    return obj;
  }
  static initFilterConfig() {
    var _a2, _b;
    ((_b = (_a2 = Context.attr("architecture")) == null ? void 0 : _a2.comm) == null ? void 0 : _b.filters) || {};
    return {
      beforeInitFilters: [],
      afterInitFilters: [],
      beforeSendFilters: [],
      successFilters: [],
      errorFilters: [],
      completeFilters: []
    };
  }
  static resetFilterConfig() {
    CommunicatorConfig.filterConfig = _Communicator.initFilterConfig();
    return this;
  }
  static submit(callback) {
    const obj = this;
    if (isElement(obj)) {
      jQuery.extend(obj.request.options, {
        contentType: "text/html; charset=UTF-8",
        dataType: "html",
        type: "GET"
      });
      obj.request.options.target = obj;
    }
    jQuery.extend(obj.request.options, {
      success: function(data, textStatus, xhr) {
        if (isElement(obj)) {
          obj.html(data);
        }
        if (callback) {
          callback.call(obj, data);
        }
      },
      error: function(xhr, textStatus, errorThrown) {
        jQuery(obj.errorHandlers).each(function() {
          this.call(obj, xhr, textStatus, errorThrown);
        });
      }
    });
    _Communicator.xhr = Fetch.fetch(obj.request.options);
    return this;
  }
  static error(callback) {
    this.errorHandlers.push(callback);
    return this;
  }
};
__publicField(_Communicator, "xhr", null);
var Communicator = _Communicator;

// src/architecture/controller/controller.js
var Controller = class {
  constructor(obj, contObj) {
    if (obj === void 0 || contObj === void 0) {
      throw error("[N.cont]You must input arguments[0] and arguments[1]");
    }
    this.obj = obj;
    this.contObj = contObj;
    this.trInit();
    return obj;
  }
  trInit() {
    const contObj = this.contObj;
    const obj = this.obj;
    if (contObj.init) {
      contObj.init.call(obj, contObj);
    }
    return this;
  }
  static trInit(cont, request) {
    if (cont && cont.init) {
      cont.init.call(cont.view, cont, request);
    }
  }
};

// src/data/sync/data-sync.js
var DataSync = class _DataSync {
  constructor(inst, isReg) {
    var _a2, _b;
    const pageContext = jQuery(((_b = (_a2 = Context.attr("architecture")) == null ? void 0 : _a2.page) == null ? void 0 : _b.context) || "body");
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
DataFilter.filter.bind(DataFilter);
DataFilter.sort.bind(DataFilter);

// src/ui/shared/iteration.js
var Iteration = class _Iteration {
  static render(i, limit, delay, lastIdx, callType) {
    const opts = this.options;
    const self = this;
    const tempRowEleClone = self.tempRowEle.clone(true, true);
    opts.context.append(tempRowEleClone);
    if (opts.rowHandlerBeforeBind !== null) {
      opts.rowHandlerBeforeBind.call(self, i, tempRowEleClone, opts.data[i]);
    }
    if (opts.rowHandler !== null) {
      opts.rowHandler.call(self, i, tempRowEleClone, opts.data[i]);
    }
    i++;
    if (opts.height === 0 || opts.scrollPaging.size === 0) {
      lastIdx = opts.data.length - 1;
    } else {
      lastIdx = opts.scrollPaging.idx + (limit - 1);
    }
    if (i - 4 === lastIdx) {
      delay = 0;
    } else {
      delay = opts.createRowDelay;
    }
    if (i <= lastIdx) {
      if (opts.data.length > 0) {
        opts.isBinding = true;
        if (delay > 0) {
          setTimeout(function() {
            _Iteration.render.call(self, i, limit, delay, lastIdx, callType);
          }, delay);
        } else {
          _Iteration.render.call(self, i, limit, delay, lastIdx, callType);
        }
      }
    } else if (i === lastIdx + 1) {
      if (opts.onBind !== null && !endsWith(trimToEmpty(callType), ".update")) {
        opts.onBind.call(self, opts.context, opts.data, i === opts.scrollPaging.size || opts.data.length <= opts.scrollPaging.size, i === opts.data.length);
      }
      opts.scrollPaging.limit = opts.scrollPaging.size === 0 ? opts.data.length : opts.scrollPaging.size;
      opts.isBinding = false;
      opts.context.dequeue("bind");
    }
  }
  static select(compNm) {
    const opts = this.options;
    const self = this;
    const lineTag = compNm === "grid" ? "tbody" : "li";
    opts.context.addClass(compNm + "_select__");
    opts.context.on("click." + compNm, ">" + lineTag, function(e) {
      const thisEle = jQuery(this);
      let isSelected;
      if (thisEle.hasClass(compNm + "_selected__")) {
        opts.row = -1;
        isSelected = false;
      } else {
        opts.row = opts.context.find(">" + lineTag).index(thisEle);
        isSelected = true;
      }
      if (!opts.multiselect && !opts.unselect) {
        opts.row = opts.context.find(">" + lineTag).index(thisEle);
        isSelected = true;
      }
      if (isSelected) {
        if (!opts.multiselect) {
          opts.context.find("> " + lineTag + ":eq(" + opts.beforeRow + ")").removeClass(compNm + "_selected__");
        }
        thisEle.addClass(compNm + "_selected__");
        opts.beforeRow = opts.row;
      } else {
        thisEle.removeClass(compNm + "_selected__");
      }
      if (opts.onSelect !== null) {
        opts.onSelect.call(self, opts.row, thisEle, opts.data, opts.beforeRow, e);
      }
    });
  }
  static checkAll(compNm) {
    const opts = this.options;
    const contextEle = this.contextEle;
    const checkAll = compNm === "grid" ? this.thead.find(opts.checkAll) : jQuery(opts.checkAll);
    const cellTag = compNm === "grid" ? "tbody > tr > td" : "li";
    checkAll.on("click." + compNm + ".checkAll", function() {
      if (!jQuery(this).prop("checked")) {
        contextEle.find(cellTag + " " + opts.checkAllTarget + ":checked").removeProp("checked");
      } else {
        contextEle.find(cellTag + " " + opts.checkAllTarget + ":not(':checked')").prop("checked", true);
      }
    });
  }
  static move(fromRow, toRow, compNm) {
    if (fromRow !== toRow) {
      const opts = this.options;
      let insertPos;
      if (toRow > opts.data.length - 1) {
        insertPos = "after";
        toRow = opts.data.length - 1;
        opts.data.push(opts.data.splice(fromRow, 1)[0]);
      } else {
        insertPos = "before";
        opts.data.splice(fromRow < toRow ? toRow - 1 : toRow, 0, opts.data.splice(fromRow, 1)[0]);
      }
      const rowTag = compNm === "grid" ? "tbody" : "li";
      if (opts.context.find(rowTag + ":eq(" + toRow + ")").length > 0) {
        opts.context.find(rowTag + ":eq(" + toRow + ")")[insertPos](opts.context.find(rowTag + ":eq(" + fromRow + ")"));
      }
    }
    return this;
  }
};

// src/ui/shared/draggable.js
var Draggable = class {
  static events(eventNameSpace, startHandler, moveHandler, endHandler) {
    const selfEle = this;
    this.on("mousedown" + eventNameSpace + " touchstart" + eventNameSpace, function(e) {
      const se = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
      if (e.originalEvent.touches || (e.which || e.button) === 1) {
        let isContinue;
        if (startHandler !== void 0) {
          isContinue = startHandler.call(this, e, selfEle, se.pageX, se.pageY);
        }
        if (isContinue !== false) {
          jQuery(document).on("mousemove" + eventNameSpace + " touchmove" + eventNameSpace, function(e2) {
            jQuery(document).on("dragstart" + eventNameSpace + " selectstart" + eventNameSpace, function() {
              return false;
            });
            const me = e2.originalEvent.touches ? e2.originalEvent.touches[0] : e2;
            if (moveHandler !== void 0) {
              moveHandler.call(this, e2, selfEle, me.pageX, me.pageY);
            }
            if (!e2.originalEvent.touches) {
              e2.preventDefault();
            }
          });
          jQuery(document).on("mouseup" + eventNameSpace + " touchend" + eventNameSpace, function(e2) {
            jQuery(document).off("dragstart" + eventNameSpace + " selectstart" + eventNameSpace + " mousemove" + eventNameSpace + " touchmove" + eventNameSpace + " mouseup" + eventNameSpace + " touchend" + eventNameSpace);
            if (endHandler !== void 0) {
              endHandler.call(this, e2, selfEle);
            }
            if (!e2.originalEvent.touches) {
              e2.preventDefault();
            }
          });
        }
      }
      if (!e.originalEvent.touches) {
        e.preventDefault();
      }
    });
  }
  static moveX(x, min, max) {
    const ele = this;
    if (min !== void 0 && x < min) {
      x = min;
      return false;
    }
    if (max !== void 0 && x > max) {
      x = max;
      return false;
    }
    const propNm = ["-webkit-transform", "-ms-transform", "transform"];
    jQuery(propNm).each(function() {
      ele.css(this, "translateX(" + x + "px)");
    });
  }
  static moveY(y, min, max) {
    const ele = this;
    if (min !== void 0 && y < min) {
      y = min;
      return false;
    }
    if (max !== void 0 && y > max) {
      y = max;
      return false;
    }
    const propNm = ["-webkit-transform", "-ms-transform", "transform"];
    jQuery(propNm).each(function() {
      ele.css(this, "translateY(" + y + "px)");
    });
  }
};

// src/ui/shared/utils.js
var UIUtils = class {
  static wrapHandler(opts, compNm, eventNm) {
    const uiConfig = Context.attr("ui");
    if (uiConfig && uiConfig[compNm] && uiConfig[compNm][eventNm] && (opts && opts[eventNm])) {
      const localEventHandler = opts[eventNm];
      opts[eventNm] = function() {
        if (eventNm === "onBeforeBindValue") {
          const rVal = localEventHandler.apply(this, arguments);
          return uiConfig[compNm][eventNm].call(this, arguments[0], rVal);
        } else {
          const rVal = localEventHandler.apply(this, arguments);
          if (rVal === false) {
            return rVal;
          } else {
            return uiConfig[compNm][eventNm].apply(this, arguments);
          }
        }
      };
    }
  }
  static isTextInput(tagName, type2) {
    return tagName === "textarea" || type2 === "text" || type2 === "password" || type2 === "hidden" || type2 === "file" || type2 === "number" || type2 === "tel" || type2 === "email" || type2 === "search" || type2 === "color" || type2 === "range" || type2 === "url";
  }
};

// src/ui/shared/scroll.js
var Scroll = class {
  static paging(contextWrapEle, defSPSize, rowEleLength, rowTagName, bindOpt) {
    const opts = this.options;
    const self = this;
    contextWrapEle.on("scroll", function() {
      if (opts.scrollPaging.size > 0 && opts.isBinding === false) {
        const thisWrap = jQuery(this);
        if (Math.ceil(thisWrap.scrollTop()) >= opts.context.height() - thisWrap.height()) {
          rowEleLength = opts.context.find(rowTagName).length;
          if (rowEleLength >= opts.scrollPaging.idx + defSPSize) {
            if (rowEleLength > 0 && rowEleLength <= opts.data.length) {
              opts.scrollPaging.idx += defSPSize;
            }
            if (opts.scrollPaging.idx + opts.scrollPaging.limit >= opts.data.length) {
              opts.scrollPaging.limit = opts.data.length - opts.scrollPaging.idx;
            } else {
              opts.scrollPaging.limit = defSPSize;
            }
            if (opts.scrollPaging.idx < opts.data.length) {
              self.bind(void 0, bindOpt);
            } else if (opts.scrollPaging.idx === opts.data.length) {
              opts.scrollPaging.limit = opts.scrollPaging.size === 0 ? opts.data.length : opts.scrollPaging.size;
            }
          }
        }
      }
    });
  }
};

// src/ui/components/form/form.js
var Form = class {
  constructor(data, opts) {
    /**
     * arguments[2]... arguments[n] are the columns to be bound.
     */
    __publicField(this, "bindEvents", {
      /**
       * validate
       */
      validate: function(ele, opts, eleType, isTextInput) {
        if (ele.data("validate") !== void 0) {
          if (eleType !== "hidden") {
            jQuery().validator(opts.vRules !== null ? opts.vRules : ele);
            if (isTextInput && NC.isEmptyObject(ele.events("focusout", "form.validate"))) {
              ele[opts.tpBind ? "tpBind" : "on"]("focusout.form.validate", function() {
                const currEle = jQuery(this);
                if (!currEle.prop("disabled") && !currEle.prop("readonly") && opts.validate) {
                  currEle.trigger("validate.validator");
                }
              });
            }
          }
        }
      },
      /**
       * dataSync
       */
      dataSync: function(ele, opts, vals, eleType) {
        const self = this;
        let eventName = "focusout";
        if (eleType === "select") {
          eventName = "change";
        }
        if (NC.isEmptyObject(ele.events(eventName, "dataSync.form"))) {
          ele[opts.tpBind ? "tpBind" : "on"](eventName + ".form.dataSync", function(e) {
            const currEle = jQuery(this);
            const currVal = currEle.val();
            if (vals !== opts.data[opts.row]) {
              vals = opts.data[opts.row];
            }
            if ((vals[currEle.attr("id")] === null ? "" : vals[currEle.attr("id")]) !== currVal) {
              if (eleType === "select") {
                currEle.removeClass("validate_false__");
                if (currEle.instance("alert") !== void 0) {
                  currEle.instance("alert").remove();
                  currEle.removeData("alert__");
                }
              }
              if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || opts.validate && !currEle.hasClass("validate_false__"))) {
                currEle.removeClass("validate_false__");
                if (currEle.instance("alert") !== void 0) {
                  currEle.instance("alert").remove();
                  currEle.removeData("alert__");
                }
                vals[currEle.attr("id")] = currVal;
                if (vals.rowStatus !== "insert" && vals.rowStatus !== "delete") {
                  vals.rowStatus = "update";
                  currEle.addClass("data_changed__");
                  if (!opts.context.hasClass("row_data_changed__")) {
                    opts.context.addClass("row_data_changed__");
                  }
                }
                DataSync.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, currEle.attr("id"));
              }
            }
          });
        }
      },
      /**
       * Enter key event
       */
      enterKey: function(ele, opts) {
        if (NC.isEmptyObject(ele.events("keyup", "dataSync.form"))) {
          ele[opts.tpBind ? "tpBind" : "on"]("keyup.form.dataSync", function(e) {
            if ((e.keyCode ? e.keyCode : e.which ? e.which : e.charCode) === 13) {
              e.preventDefault();
              jQuery(this).trigger("focusout.form.validate");
              jQuery(this).trigger("focusout.form.dataSync");
            }
          });
        }
      },
      /**
       * format
       */
      format: function(ele, opts, eleType, vals, key) {
        if (ele.data("format") !== void 0) {
          if (eleType !== "password" && eleType !== "hidden" && eleType !== "file") {
            jQuery(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);
            const eventNames = ["focusin", "focusout"];
            const formats = ["unformat", "format"];
            let bindMethod = "on";
            if (opts.tpBind) {
              eventNames.reverse();
              formats.reverse();
              bindMethod = "tpBind";
            }
            if (NC.isEmptyObject(ele.events(eventNames[0], "form." + formats[0]))) {
              ele[bindMethod](eventNames[0] + ".form." + formats[0], function() {
                const currEle = jQuery(this);
                if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || opts.validate && !currEle.hasClass("validate_false__"))) {
                  currEle.trigger(formats[0] + ".formatter");
                }
              });
            }
            if (NC.isEmptyObject(ele.events(eventNames[1], "form." + formats[1]))) {
              ele[bindMethod](eventNames[1] + ".form." + formats[1], function() {
                const currEle = jQuery(this);
                if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || opts.validate && !currEle.hasClass("validate_false__"))) {
                  currEle.trigger(formats[1] + ".formatter");
                }
              });
            }
          }
        } else {
          ele.val(vals[key] != null ? String(vals[key]) : "");
        }
      }
    });
    this.options = {
      data: type(data) === "array" ? jQuery(data) : data,
      row: -1,
      context: null,
      validate: true,
      autoUnbind: false,
      state: null,
      // add, bind, revert, update
      html: false,
      addTop: true,
      fRules: null,
      vRules: null,
      extObj: null,
      // extObj : for List or Grid
      extRow: -1,
      // extRow : for List or Grid
      revert: false,
      cache: true,
      unbind: true,
      tpBind: false,
      onBeforeBindValue: null,
      onBindValue: null,
      onBeforeBind: null,
      onBind: null,
      InitialData: null
      // for unbind
    };
    try {
      jQuery.extend(this.options, Context.attr("ui").form);
    } catch (e) {
      throw error("Form", e);
    }
    if (isPlainObject(opts)) {
      UIUtils.wrapHandler(opts, "form", "onBeforeBindValue");
      UIUtils.wrapHandler(opts, "form", "onBindValue");
      UIUtils.wrapHandler(opts, "form", "onBeforeBind");
      UIUtils.wrapHandler(opts, "form", "onBind");
      opts.data = type(opts.data) === "array" ? jQuery(opts.data) : opts.data;
      jQuery.extend(this.options, opts);
      if (type(this.options.context) === "string") {
        this.options.context = jQuery(this.options.context);
      }
      if (opts.row === void 0) {
        this.options.row = 0;
      }
    } else {
      this.options.row = 0;
      this.options.context = jQuery(opts);
    }
    if (this.options.unbind) {
      if (this.options.context !== null) {
        this.options.InitialData = ElementUtils.toData(this.options.context.find("[id]").not(":button"));
      }
    }
    this.options.context.addClass("form__");
    if (this.options.revert) {
      this.options.revertData = jQuery.extend({}, this.options.data[this.options.row]);
    }
    this.options.context.instance("form", this);
    if (this.options.extObj === null) {
      DataSync.instance(this, true);
    }
    return this;
  }
  data(selFlag) {
    const opts = this.options;
    if (selFlag !== void 0 && selFlag === true) {
      const retData = [];
      const args = Array.prototype.slice.call(arguments, 0);
      if (arguments.length > 1) {
        args[0] = opts.data[opts.row];
        retData.push(NC.json.mapFromKeys.apply(NC.json, args));
      } else {
        retData.push(opts.data[opts.row]);
      }
      return retData;
    } else if (selFlag !== void 0 && selFlag === false) {
      return opts.data;
    } else {
      return opts.data.get();
    }
  }
  row(before) {
    return before !== void 0 && before === "before" ? this.options.beforeRow : this.options.row;
  }
  context(sel) {
    return sel !== void 0 ? this.options.context.find(sel) : this.options.context;
  }
  bind(row, data) {
    const opts = this.options;
    if (data === "add" || data === "bind" || data === "revert" || data === "update") {
      if (opts.autoUnbind) {
        this.unbind();
      }
      opts.state = data;
      data = void 0;
    } else {
      opts.state = "bind";
    }
    if (row !== void 0) {
      opts.row = row;
    }
    if (data != null) {
      opts.data = type(data) === "array" ? jQuery(data) : data;
      if (opts.revert) {
        opts.revertData = jQuery.extend({}, data[row]);
      }
    }
    const self = this;
    let vals;
    if (!NC.isEmptyObject(opts.data) && !NC.isEmptyObject(vals = opts.data[opts.row])) {
      if (arguments.length < 3 && opts.onBeforeBind !== null && this.options.extObj === null) {
        opts.onBeforeBind.call(self, opts.context, vals);
      }
      if (vals.rowStatus === "insert" || vals.rowStatus === "update") {
        opts.context.addClass("row_data_changed__");
      } else {
        opts.context.removeClass("row_data_changed__");
      }
      if (vals.rowStatus === "delete") {
        opts.context.addClass("row_data_deleted__");
      } else {
        opts.context.removeClass("row_data_deleted__");
      }
      let idContext, rcContext, eles, ele, val, tagName, type2;
      const spltSepa = Context.attr("core").spltSepa;
      let cols;
      if (arguments.length > 2) {
        cols = spltSepa + Array.prototype.slice.call(arguments, 2).join(spltSepa) + spltSepa;
      }
      if (opts.cache) {
        if (this.idContext === void 0) {
          idContext = self.idContext = opts.context.find("[id]:not(:radio, :checkbox)");
        } else {
          idContext = self.idContext;
        }
        if (this.rcContext === void 0) {
          rcContext = self.rcContext = opts.context.find(":radio, :checkbox");
        } else {
          rcContext = self.rcContext;
        }
      } else {
        idContext = opts.context.find("[id]:not(:radio, :checkbox)");
        rcContext = opts.context.find(":radio, :checkbox");
      }
      for (const key in vals) {
        if (cols !== void 0 && cols.indexOf(spltSepa + key + spltSepa) < 0) {
          continue;
        }
        if (StringUtils.isEmpty(key)) {
          warn('[Form.bind]Within the context, there is an element with an id attribute value of ""(blank).');
          continue;
        }
        ele = idContext.filter("#" + key);
        if (opts.onBeforeBindValue !== null) {
          const filteredVal = opts.onBeforeBindValue.call(self, ele, vals[key], "bind");
          if (filteredVal !== void 0) {
            vals[key] = filteredVal;
          }
        }
        if (ele.length > 0) {
          if (vals.rowStatus === "update") {
            ele.addClass("data_changed__");
          } else {
            ele.removeClass("data_changed__");
          }
          tagName = ele.get(0).tagName.toLowerCase();
          type2 = StringUtils.trimToEmpty(ele.attr("type")).toLowerCase();
          if (UIUtils.isTextInput(tagName, type2)) {
            if (opts.tpBind) {
              self.bindEvents.format.call(self, ele, opts, type2, vals, key);
              self.bindEvents.enterKey.call(self, ele, opts);
              self.bindEvents.dataSync.call(self, ele, opts, vals);
              self.bindEvents.validate.call(self, ele, opts, type2, true);
            } else {
              self.bindEvents.validate.call(self, ele, opts, type2, true);
              self.bindEvents.dataSync.call(self, ele, opts, vals);
              self.bindEvents.enterKey.call(self, ele, opts);
              self.bindEvents.format.call(self, ele, opts, type2, vals, key);
            }
          } else if (tagName === "select") {
            self.bindEvents.validate.call(self, ele, opts, type2, false);
            self.bindEvents.dataSync.call(self, ele, opts, vals, "select");
            ele.vals(vals[key] != null ? String(vals[key]) : "");
          } else if (tagName === "img") {
            ele.attr("src", vals[key] != null ? String(vals[key]) : "");
          } else {
            if (ele.data("format") !== void 0) {
              jQuery(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);
            } else {
              val = vals[key] != null ? String(vals[key]) : "";
              if (!opts.html) {
                ele.text(val);
              } else {
                ele.html(val);
              }
            }
          }
        } else {
          eles = rcContext.filter("[name='" + key + "']");
          if (eles.length === 0) {
            eles = rcContext.filter("#" + key);
          }
          if (eles.length > 0) {
            if (eles.filter(".select_template__").data("validate") !== void 0) {
              ele.removeClass("validate_false__");
              if (ele.instance("alert") !== void 0) {
                ele.instance("alert").remove();
                ele.removeData("alert__");
              }
              if (opts.validate) {
                jQuery().validator(opts.vRules !== null ? opts.vRules : eles.filter(".select_template__"));
              }
            }
            eles.off("click.form.dataSync select.form.dataSync");
            eles.on("click.form.dataSync select.form.dataSync", function(e) {
              const currEle = jQuery(this);
              let currEles = opts.context.find("[name='" + currEle.attr("name") + "']");
              if (currEles.length === 0) {
                currEles = jQuery(this);
              }
              let currKey = currEle.attr("name");
              if (currKey === void 0) {
                currKey = currEle.attr("id");
              }
              const currVals = currEles.vals();
              if (vals !== opts.data[opts.row]) {
                vals = opts.data[opts.row];
              }
              if ((vals[currKey] === null ? "" : vals[currKey]) !== currVals) {
                vals[currKey] = currVals;
                if (vals.rowStatus !== "insert" && vals.rowStatus !== "delete") {
                  vals.rowStatus = "update";
                  currEles.addClass("data_changed__");
                  if (!opts.context.hasClass("row_data_changed__")) {
                    opts.context.addClass("row_data_changed__");
                  }
                }
                if (!currEle.prop("disabled") && !currEle.prop("readonly")) {
                  DataSync.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, currKey);
                }
              }
            });
            eles.vals(vals[key] != null ? vals[key] : "");
            if (vals.rowStatus === "update") {
              eles.addClass("data_changed__");
            } else {
              eles.removeClass("data_changed__");
            }
          }
        }
        if (opts.onBindValue !== null) {
          const filteredVal = opts.onBindValue.call(self, ele, vals[key], "bind");
          if (filteredVal !== void 0) {
            vals[key] = filteredVal;
          }
        }
      }
      if (arguments.length < 3 && opts.onBind !== null && this.options.extObj === null) {
        opts.onBind.call(self, opts.context, vals);
      }
      idContext = rcContext = eles = ele = val = tagName = type2 = void 0;
    }
    return this;
  }
  unbind(state) {
    const opts = this.options;
    if (opts.unbind && opts.InitialData !== null) {
      opts.context.removeClass("row_data_changed__");
      const vals = opts.InitialData;
      let idContext, rcContext, eles, ele, tagName, type2;
      idContext = opts.context.find("[id]:not(:radio, :checkbox)");
      rcContext = opts.context.find(":radio, :checkbox");
      for (const key in vals) {
        ele = idContext.filter("#" + key);
        if (ele.length > 0) {
          ele.removeClass("data_changed__");
          tagName = ele.get(0).tagName.toLowerCase();
          type2 = StringUtils.trimToEmpty(ele.attr("type")).toLowerCase();
          if (UIUtils.isTextInput(tagName, type2)) {
            ele.off("focusout.form.validate focusout.form.dataSync keyup.form.dataSync focusin.form.unformat focusout.form.format format.formatter unformat.formatter");
            ele.removeClass("validate_false__");
            if (ele.instance("alert") !== void 0) {
              ele.instance("alert").remove();
              ele.removeData("alert__");
            }
            ele.val(vals[key] != null ? String(vals[key]) : "");
          } else if (tagName === "select") {
            ele.off("change.form.dataSync");
            ele.removeClass("validate_false__");
            if (ele.instance("alert") !== void 0) {
              ele.instance("alert").remove();
              ele.removeData("alert__");
            }
            ele.vals(vals[key] != null ? String(vals[key]) : "");
          } else if (tagName === "img") {
            if (vals[key] !== void 0) {
              ele.attr("src", vals[key] != null ? String(vals[key]) : "");
            }
          } else {
            ele.text(vals[key] != null ? String(vals[key]) : "");
          }
        } else {
          eles = rcContext.filter("[name='" + key + "']");
          if (eles.length === 0) {
            eles = rcContext.filter("#" + key);
          }
          eles.removeClass("data_changed__");
          if (eles.length > 0) {
            eles.off("click.form.dataSync select.form.dataSync");
            ele.removeClass("validate_false__");
            if (ele.instance("alert") !== void 0) {
              ele.instance("alert").remove();
              ele.removeData("alert__");
            }
            eles.vals(vals[key] != null ? vals[key] : "");
          }
        }
      }
      idContext = rcContext = eles = ele = tagName = type2 = void 0;
    }
    return this;
  }
  add(data, row) {
    const opts = this.options;
    opts.state = "add";
    if (opts.autoUnbind) {
      this.unbind();
    }
    if (opts.data === null) {
      throw new Error("[Form.add]Data is null. you must input data");
    }
    const extractedData = ElementUtils.toData(opts.context.find(":input:not(:button)"));
    if (data != null) {
      if (NC.isNumeric(data)) {
        row = data;
        data = void 0;
      } else {
        jQuery.extend(extractedData, data);
      }
    }
    extractedData.rowStatus = "insert";
    if (row > opts.data.length || row < 0) {
      row = void 0;
    }
    if (!opts.addTop) {
      if (row === void 0) {
        opts.data.push(extractedData);
        row = opts.data.length - 1;
      } else {
        opts.data.splice(row, 0, extractedData);
      }
    } else {
      if (row === void 0) {
        row = 0;
      }
      opts.data.splice(row, 0, extractedData);
    }
    opts.row = row;
    if (opts.extObj !== null) {
      opts.data = jQuery(opts.data[opts.row]);
      opts.row = 0;
      const rowEleLength = opts.extObj.options.context.find(opts.extObj instanceof Grid ? ">tbody" : ">li").length;
      const pagingSize = opts.extObj.options.scrollPaging.size;
      const rest = rowEleLength % pagingSize;
      opts.extObj.options.scrollPaging.idx = rowEleLength / pagingSize * pagingSize - pagingSize + rest;
      if (opts.extObj.options.rowHandlerBeforeBind !== null) {
        opts.extObj.options.rowHandlerBeforeBind.call(opts.extObj, opts.extRow, opts.context, opts.data[opts.row]);
      }
    }
    if (opts.revert) {
      opts.revertData = jQuery.extend({}, opts.data[opts.row]);
    }
    this.bind(opts.row, opts.state);
    DataSync.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);
    return this;
  }
  remove() {
    const opts = this.options;
    if (opts.data[opts.row].rowStatus === "insert") {
      opts.data.splice(opts.row, 1);
      opts.row = -1;
      DataSync.instance(opts.extObj !== null ? opts.extObj : this).notify();
      this.unbind();
    } else {
      opts.data[opts.row].rowStatus = "delete";
      opts.context.addClass("row_data_deleted__");
      DataSync.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);
    }
    return this;
  }
  revert() {
    const opts = this.options;
    if (!opts.revert) {
      throw error("[Form.prototype.revert]Can not revert. Form's revert option value is false");
    }
    opts.state = "revert";
    for (const k in opts.data[opts.row]) {
      delete opts.data[opts.row][k];
    }
    jQuery.extend(opts.data[opts.row], opts.data[opts.row], opts.revertData);
    opts.data[opts.row]._isRevert = true;
    this.bind(opts.row, opts.state);
    DataSync.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);
    if (opts.data[opts.row]._isRevert !== void 0) {
      try {
        delete opts.data[opts.row]._isRevert;
      } catch (e) {
      }
    }
    return this;
  }
  validate() {
    const opts = this.options;
    const eles = opts.context.find(":input:not(:radio, :checkbox), :radio.select_template__, :checkbox.select_template__");
    if (opts.validate) {
      eles.not(".validate_false__").trigger("unformat.formatter");
    } else {
      eles.trigger("unformat.formatter");
    }
    eles.trigger("validate.validator");
    eles.not(".validate_false__").trigger("format.formatter");
    return eles.filter(".validate_false__").length <= 0;
  }
  val(key, val, notify) {
    const opts = this.options;
    const vals = opts.data[opts.row];
    if (val === void 0) {
      return vals[key];
    }
    let eles, tagName, type2;
    const self = this;
    let rdonyFg = false;
    let dsabdFg = false;
    let ele = opts.context.find("#" + key);
    if (opts.onBeforeBindValue !== null) {
      const filteredVal = opts.onBeforeBindValue.call(self, ele, vals[key], "val");
      if (filteredVal !== void 0) {
        vals[key] = filteredVal;
      }
    }
    if (ele.length > 0) {
      tagName = ele.get(0).tagName.toLowerCase();
      type2 = StringUtils.trimToEmpty(ele.attr("type")).toLowerCase();
      ele = ele.not(":radio, :checkbox");
      if (ele.length > 0) {
        if (ele.prop("readonly")) {
          ele.removeAttr("readonly");
          rdonyFg = true;
        }
        if (ele.prop("disabled")) {
          ele.removeAttr("disabled");
          dsabdFg = true;
        }
        if (UIUtils.isTextInput(tagName, type2)) {
          ele.removeClass("validate_false__");
          if (ele.instance("alert") !== void 0) {
            ele.instance("alert").remove();
            ele.removeData("alert__");
          }
          if (ele.events("focusout", "dataSync.form") === void 0) {
            vals[key] = null;
            self.bind(void 0, void 0, key);
          }
          ele.val(val);
          if (ele.data("validate") !== void 0) {
            if (type2 !== "hidden") {
              ele.trigger("focusout.form.validate");
            }
          }
          if (notify !== false) {
            ele.trigger("focusout.form.dataSync");
          } else {
            ele.addClass("data_changed__");
          }
          if (ele.data("format") !== void 0) {
            if (type2 !== "hidden" && type2 !== "password") {
              ele.trigger("focusin.form.unformat");
              ele.trigger("focusout.form.format");
            }
          }
        } else if (tagName === "select") {
          ele.removeClass("validate_false__");
          if (ele.instance("alert") !== void 0) {
            ele.instance("alert").remove();
            ele.removeData("alert__");
          }
          if (ele.events("change", "dataSync.form") === void 0) {
            vals[key] = null;
            self.bind(void 0, void 0, key);
          }
          ele.vals(val);
          if (notify !== false) {
            ele.trigger("change.form.dataSync");
          } else {
            ele.addClass("data_changed__");
          }
        } else if (tagName === "img") {
          vals[key] = val;
          if (vals.rowStatus !== "insert" && vals.rowStatus !== "delete") {
            vals.rowStatus = "update";
            ele.addClass("data_changed__");
          }
          ele.attr("src", val);
          if (notify !== false) {
            DataSync.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, key);
          }
        } else {
          vals[key] = val;
          if (vals.rowStatus !== "insert" && vals.rowStatus !== "delete") {
            vals.rowStatus = "update";
            ele.addClass("data_changed__");
          }
          if (ele.data("format") !== void 0) {
            jQuery(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);
          } else {
            if (!opts.html) {
              ele.text(val === null ? "" : val);
            } else {
              ele.html(val);
            }
          }
          if (notify !== false) {
            DataSync.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, key);
          }
        }
        if (rdonyFg) {
          ele.prop("readonly", true);
        }
        if (dsabdFg) {
          ele.prop("disabled", true);
        }
      } else {
        eles = opts.context.find("[name='" + key + "']:radio, [name='" + key + "']:checkbox");
        if (eles.length === 0) {
          eles = opts.context.find("#" + key);
        }
        if (eles.length > 0) {
          eles.removeClass("validate_false__");
          eles.instance("alert", function() {
            this.remove();
          }).removeData("alert__");
          if (jQuery(eles.get(0)).events("select", "dataSync.form") === void 0) {
            vals[jQuery(eles.get(0)).attr("id")] = null;
            self.bind(void 0, void 0, key);
          }
          eles.vals(val);
          if (notify !== false) {
            jQuery(eles.get(0)).trigger("select.form.dataSync");
          } else {
            jQuery(eles.get(0)).addClass("data_changed__");
          }
        }
      }
      eles = ele = val = tagName = type2 = void 0;
    } else {
      if (opts.data[opts.row][key] !== val) {
        opts.data[opts.row][key] = val;
        if (opts.data[opts.row].rowStatus !== "insert" && opts.data[opts.row].rowStatus !== "delete") {
          opts.data[opts.row].rowStatus = "update";
        }
        DataSync.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, key);
      }
    }
    if (opts.data[opts.row].rowStatus !== "insert" && opts.data[opts.row].rowStatus !== "delete" && !opts.context.hasClass("row_data_changed__")) {
      opts.context.addClass("row_data_changed__");
    }
    if (opts.onBindValue !== null) {
      const filteredVal = opts.onBindValue.call(self, ele, vals[key], "val");
      if (filteredVal !== void 0) {
        vals[key] = filteredVal;
      }
    }
    return this;
  }
  update(row, key) {
    const opts = this.options;
    opts.state = "update";
    if (key === void 0) {
      this.bind(row, opts.state);
    } else {
      if (row === this.row()) {
        this.val(key, opts.data[row][key], false);
        let changedEle = opts.context.find("#" + key + ":not(:radio, :checkbox)");
        if (changedEle.length === 0) {
          changedEle = opts.context.find("[name='" + key + "']").filter(":radio, :checkbox");
        }
        if (changedEle.length === 0) {
          changedEle = opts.context.find("#" + key).filter(":radio, :checkbox");
        }
        ElementUtils.dataChanged(changedEle);
      }
    }
    return this;
  }
};

// src/ui/components/alert/alert.js
var _Alert = class _Alert {
  constructor(obj, msg, vars) {
    this.options = {
      obj,
      context: obj,
      container: null,
      msgContext: jQuery(),
      msgContents: null,
      msg,
      vars,
      html: false,
      top: void 0,
      left: void 0,
      width: 0,
      height: 0,
      isInput: false,
      isWindow: obj === window || obj.get(0) === window || obj.is("body"),
      title: obj === window || obj.get(0) === window || obj.get(0) === window.document || obj.is("body") ? void 0 : obj.attr("title"),
      button: true,
      okButtonOpts: null,
      cancelButtonOpts: null,
      closeMode: "remove",
      // closeMode : hide - keep element, remove - remove element
      modal: true,
      onOk: null,
      onCancel: null,
      onBeforeShow: null,
      onShow: null,
      onBeforeHide: null,
      onHide: null,
      onBeforeRemove: null,
      onRemove: null,
      overlayColor: null,
      overlayClose: true,
      escClose: true,
      "confirm": false,
      alwaysOnTop: false,
      alwaysOnTopCalcTarget: "div, span, ul, p, nav, article, section, header, footer, aside",
      dynPos: true,
      // dynamic positioning for massage context and message overlay
      windowScrollLock: true,
      draggable: false,
      draggableOverflowCorrection: true,
      draggableOverflowCorrectionAddValues: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      },
      saveMemory: false
    };
    try {
      this.options.container = Context.attr("architecture").page.context;
      jQuery.extend(true, this.options, Context.attr("ui").alert);
      if (isString(this.options.container)) {
        this.options.container = jQuery(this.options.container);
      }
    } catch (e) {
      throw error("Alert", e);
    }
    if (jQuery(this.options.container).length === 0) {
      throw error(`[Alert]Container element is missing. please specify the correct element selector that will contain the message dialog's element. it can be defined in the "Context.attr("ui").alert.container" property of "natural.config.js" file.`);
    }
    if (jQuery(obj).is(":input")) {
      this.options.isInput = true;
    }
    if (msg !== void 0 && isPlainObject(msg)) {
      UIUtils.wrapHandler(msg, "alert", "onOk");
      UIUtils.wrapHandler(msg, "alert", "onCancel");
      UIUtils.wrapHandler(msg, "alert", "onBeforeShow");
      UIUtils.wrapHandler(msg, "alert", "onShow");
      UIUtils.wrapHandler(msg, "alert", "onBeforeHide");
      UIUtils.wrapHandler(msg, "alert", "onHide");
      UIUtils.wrapHandler(msg, "alert", "onBeforeRemove");
      UIUtils.wrapHandler(msg, "alert", "onRemove");
      UIUtils.wrapHandler(msg, "alert", "okButtonOpts");
      UIUtils.wrapHandler(msg, "alert", "cancelButtonOpts");
      jQuery.extend(true, this.options, msg);
      if (isString(this.options.container)) {
        this.options.container = jQuery(this.options.container);
      }
      if (msg.hasOwnProperty("title")) {
        this.options.title = msg.title;
      }
    }
    if (this.options.isWindow) {
      this.options.context = jQuery("body");
    }
    if (!this.options.isInput) {
      _Alert.wrapEle.call(this);
      this.options.msgContents.instance("alert", this);
      if (this.options.saveMemory) {
        this.options.msg = null;
        this.options.vars = null;
      }
    } else {
      _Alert.wrapInputEle.call(this);
      this.options.context.instance("alert", this);
    }
    return this;
  }
  context(sel) {
    return sel !== void 0 ? this.options.context.find(sel) : this.options.context;
  }
  show() {
    const opts = this.options;
    const self = this;
    if (opts.onBeforeShow !== null) {
      opts.onBeforeShow.call(self, opts.msgContext, opts.msgContents);
    }
    jQuery(".docs__>.docs_tab_context__").css("z-index", "0");
    if (!opts.isInput) {
      if (opts.dynPos && !opts.isWindow) {
        _Alert.resetOffSetEle(opts);
        opts.time = setInterval(function() {
          if (opts.context.is(":visible")) {
            _Alert.resetOffSetEle(opts);
          }
        }, 500);
      } else {
        opts.resizeHandler = function() {
          _Alert.resetOffSetEle(opts);
        };
        jQuery(window).off("resize.alert", opts.resizeHandler).on("resize.alert", opts.resizeHandler).trigger("resize.alert");
      }
      if (!opts.isWindow) {
        opts.msgContext.closest(".msg_box__").css("position", "relative");
      }
      if (opts.button === true) {
        opts.msgContents.find(".buttonBox__ .confirm__").get(0).focus();
      }
      opts.msgContents.removeClass("hidden__").addClass("visible__");
      opts.msgContents.one(EventUtils.whichTransitionEvent(opts.msgContents), function() {
        if (opts.onShow !== null) {
          opts.onShow.call(self, opts.msgContext, opts.msgContents);
        }
      }).trigger("nothing");
    } else {
      if (!NC.isEmptyObject(opts.msg)) {
        opts.msgContext.parent().css({
          "white-space": "normal"
        });
        opts.msgContents.show();
        opts.iTime = setTimeout(function() {
          opts.msgContext.parent().css({
            "white-space": ""
          });
          self[opts.closeMode]();
        }, opts.input.displayTimeout);
        opts.msgContents.removeClass("hidden__").addClass("visible__");
      }
    }
    if (opts.escClose) {
      opts.keyupHandler = function(e) {
        if ((e.keyCode ? e.keyCode : e.which ? e.which : e.charCode) === 27) {
          if (opts.onCancel !== null) {
            if (opts.onCancel.call(self, opts.msgContext, opts.msgContents) !== 0) {
              self[opts.closeMode]();
            }
          } else {
            self[opts.closeMode]();
          }
        }
      };
      jQuery(document).off("keyup.alert", opts.keyupHandler).on("keyup.alert", opts.keyupHandler);
    }
    return this;
  }
  hide() {
    const opts = this.options;
    if (opts.onBeforeHide !== null) {
      opts.onBeforeHide.call(this, opts.msgContext, opts.msgContents);
    }
    jQuery(".docs__>.docs_tab_context__").css("z-index", "");
    if (!opts.isInput) {
      if (!opts.isWindow) {
        opts.msgContext.closest(".msg_box__").css("position", "");
      }
      opts.msgContext.hide();
      opts.msgContents.removeClass("visible__").addClass("hidden__");
      opts.msgContents.one(EventUtils.whichTransitionEvent(opts.msgContents), function() {
        opts.msgContents.hide();
        if (opts.onHide !== null) {
          opts.onHide.call(this, opts.msgContext, opts.msgContents);
        }
      }).trigger("nothing");
    } else {
      opts.msgContents.removeClass("visible__").addClass("hidden__");
      opts.msgContents.one(EventUtils.whichTransitionEvent(opts.msgContents), function() {
        clearTimeout(opts.iTime);
        opts.msgContents.remove();
        if (opts.onHide !== null) {
          opts.onHide.call(this, opts.msgContext, opts.msgContents);
        }
      }).trigger("nothing");
    }
    jQuery(window).off("resize.alert", opts.resizeHandler);
    if (opts.escClose) {
      jQuery(document).off("keyup.alert", opts.keyupHandler);
    }
    return this;
  }
  remove() {
    const opts = this.options;
    if (opts.onBeforeRemove !== null) {
      opts.onBeforeRemove.call(this, opts.msgContext, opts.msgContents);
    }
    jQuery(".docs__>.docs_tab_context__").css("z-index", "");
    if (!opts.isInput) {
      clearInterval(opts.time);
      if (!opts.isWindow) {
        opts.msgContext.closest(".msg_box__").css("position", "");
      }
      opts.msgContext.remove();
      opts.msgContents.removeClass("visible__").addClass("hidden__");
      opts.msgContents.one(EventUtils.whichTransitionEvent(opts.msgContents), function() {
        opts.msgContents.remove();
        if (opts.msgContents.hasClass("popup__")) {
          GC.ds();
        }
        if (opts.onRemove !== null) {
          opts.onRemove.call(this, opts.msgContext, opts.msgContents);
        }
      }).trigger("nothing");
    } else {
      opts.msgContents.removeClass("visible__").addClass("hidden__");
      opts.msgContents.one(EventUtils.whichTransitionEvent(opts.msgContents), function() {
        clearTimeout(opts.iTime);
        opts.msgContents.remove();
        if (opts.onRemove !== null) {
          opts.onRemove.call(this, opts.msgContext, opts.msgContents);
        }
      }).trigger("nothing");
    }
    jQuery(window).off("resize.alert", opts.resizeHandler);
    if (opts.escClose) {
      jQuery(document).off("keyup.alert", opts.keyupHandler);
    }
    return this;
  }
};
__publicField(_Alert, "wrapEle", function() {
  const opts = this.options;
  const blockOverlayCss = {
    "display": "none",
    "position": opts.isWindow ? "fixed" : "absolute",
    "cursor": "not-allowed",
    "padding": 0
  };
  if (!opts.isWindow) {
    blockOverlayCss["border-radius"] = opts.context.css("border-radius") !== "0px" ? opts.context.css("border-radius") : "0px";
  }
  let maxZindex2 = 0;
  if (opts.alwaysOnTop) {
    maxZindex2 = ElementUtils.maxZindex(jQuery(opts.alwaysOnTopCalcTarget));
    blockOverlayCss["z-index"] = String(maxZindex2 + 1);
  }
  if (opts.overlayColor !== null) {
    blockOverlayCss["background-color"] = opts.overlayColor;
  }
  opts.msgContext = opts[opts.isWindow ? "container" : "context"][opts.isWindow ? "append" : "after"](jQuery('<div class="block_overlay__" onselectstart="return false;"></div>').css(blockOverlayCss))[opts.isWindow ? "find" : "siblings"](".block_overlay__:" + (opts.isWindow ? "last" : "first"));
  opts.msgContext.addClass("alert_overlay__");
  if (opts.vars !== void 0) {
    opts.msg = NC.message.replaceMsgVars(opts.msg, opts.vars);
  }
  const blockOverlayMsgCss = {
    "display": "none",
    "position": opts.isWindow ? "fixed" : "absolute"
  };
  if (opts.alwaysOnTop) {
    blockOverlayMsgCss["z-index"] = String(maxZindex2 + 2);
  }
  let titleBox = "";
  if (opts.title !== void 0) {
    titleBox = '<div class="msg_title_box__"><span class="msg_title__">' + opts.title + '</span><a href="#" class="msg_title_close_btn__"><span class="msg_title_close__" title="' + NC.message.get(opts.message, "close") + '"></span></a></div>';
  }
  let buttonBox = "";
  if (opts.button) {
    buttonBox = '<div class="buttonBox__"><button class="confirm__">' + NC.message.get(opts.message, "confirm") + '</button><button class="cancel__">' + NC.message.get(opts.message, "cancel") + "</button></div>";
  }
  opts.msgContents = opts.msgContext.after(
    jQuery('<div class="block_overlay_msg__">' + titleBox + '<div class="msg_box__"></div>' + buttonBox + "</div>").css(blockOverlayMsgCss)
  ).next(".block_overlay_msg__:last");
  opts.msgContents.addClass("alert__ hidden__");
  const self = this;
  opts.msgContents.find(".msg_title_box__ .msg_title_close_btn__").on("click.alert touchend.alert", function(e) {
    e.preventDefault();
    if (opts.onCancel !== null) {
      if (opts.onCancel.call(self, opts.msgContext, opts.msgContents) !== 0) {
        self[opts.closeMode]();
      }
    } else {
      self[opts.closeMode]();
    }
  });
  opts.msgContents.find(".msg_box__")[opts.html ? "html" : "text"](opts.msg);
  if (typeof opts.width === "function" || opts.width > 0) {
    if (typeof opts.width === "function") {
      opts.msgContents.find(".msg_box__").width(opts.width.call(self, opts.msgContext, opts.msgContents));
    } else {
      opts.msgContents.find(".msg_box__").width(opts.width);
    }
  }
  if (typeof opts.height === "function" || opts.height > 0) {
    if (typeof opts.width === "function") {
      opts.msgContents.find(".msg_box__").height(opts.height.call(self, opts.msgContext, opts.msgContents)).css("overflow-y", "auto");
    } else {
      opts.msgContents.find(".msg_box__").height(opts.height).css("overflow-y", "auto");
    }
  }
  if (opts.modal && opts.windowScrollLock) {
    EventUtils.windowScrollLock(opts.msgContext);
  }
  opts.msgContents.find(".buttonBox__ .confirm__").button(opts.okButtonOpts);
  opts.msgContents.find(".buttonBox__ .confirm__").on("click.alert", function(e) {
    e.preventDefault();
    if (opts.onOk !== null) {
      if (opts.onOk.call(self, opts.msgContext, opts.msgContents) !== 0) {
        self[opts.closeMode]();
      }
    } else {
      self[opts.closeMode]();
    }
  });
  if (!opts.modal) {
    opts.msgContext.remove();
  } else {
    if (opts.overlayClose) {
      opts.msgContext.on("click.alert", function() {
        if (opts.onCancel !== null) {
          if (opts.onCancel.call(self, opts.msgContext, opts.msgContents) !== 0) {
            self[opts.closeMode]();
          }
        } else {
          self[opts.closeMode]();
        }
      });
    }
  }
  if (opts.confirm) {
    opts.msgContents.find(".buttonBox__ .cancel__").button(opts.cancelButtonOpts);
    opts.msgContents.find(".buttonBox__ .cancel__").on("click.alert", function(e) {
      e.preventDefault();
      if (opts.onCancel !== null) {
        if (opts.onCancel.call(self, opts.msgContext, opts.msgContents) !== 0) {
          self[opts.closeMode]();
        }
      } else {
        self[opts.closeMode]();
      }
    });
  } else {
    opts.msgContents.find(".cancel__").remove();
  }
  if (opts.draggable) {
    let pressed;
    let moved;
    let startX;
    let startY;
    opts.msgContents.addClass("draggable__").find(".msg_title_box__").on("mousedown.alert touchstart.alert", function(e) {
      let dte;
      if (e.originalEvent.touches) {
        e.preventDefault();
        e.stopPropagation();
        dte = e.originalEvent.touches[0];
      }
      opts.msgContents.css("margin");
      if (!jQuery(dte !== void 0 ? dte.target : e.target).is(".msg_title_close__") && (e.originalEvent.touches || (e.which || e.button) === 1)) {
        pressed = true;
        opts.msgContents.data("isMoved", true);
        startX = (dte !== void 0 ? dte.pageX : e.pageX) - opts.msgContents.offset().left;
        startY = (dte !== void 0 ? dte.pageY : e.pageY) - opts.msgContents.offset().top;
        jQuery(window.document).on("dragstart.alert selectstart.alert", function() {
          return false;
        });
        moved = true;
        jQuery(window.document).on("mousemove.alert touchmove.alert", function() {
          let mte;
          if (e.originalEvent.touches) {
            e.stopPropagation();
            mte = e.originalEvent.touches[0];
          }
          if (pressed) {
            opts.msgContents.offset({
              top: (mte !== void 0 ? mte.pageY : e.pageY) - startY,
              left: (mte !== void 0 ? mte.pageX : e.pageX) - startX
            });
          }
          if (moved) {
            opts.msgContents.fadeTo(200, "0.4");
            moved = false;
          }
        });
        const documentWidth = jQuery(window.document).width();
        jQuery(window.document).on("mouseup.alert touchend.alert", function() {
          pressed = false;
          if (opts.draggableOverflowCorrection) {
            const offset = {};
            const windowHeight = window.innerHeight ? window.innerHeight : jQuery(window).height();
            const windowScrollTop = jQuery(window).scrollTop();
            const msgContentsOffsetTop = opts.msgContents.offset().top;
            const msgContentsOuterHeight = opts.msgContents.outerHeight();
            if (msgContentsOffsetTop - windowScrollTop < 0) {
              offset.top = (opts.isWindow ? 0 : msgContentsOffsetTop + (windowScrollTop - msgContentsOffsetTop)) + opts.draggableOverflowCorrectionAddValues.top;
              offset.top -= parseFloat(opts.msgContents.css("margin-top"));
            } else if (msgContentsOffsetTop + msgContentsOuterHeight > windowScrollTop + windowHeight) {
              offset.top = (opts.isWindow ? windowHeight - msgContentsOuterHeight : windowScrollTop + windowHeight - msgContentsOuterHeight) + opts.draggableOverflowCorrectionAddValues.bottom;
              offset.top -= parseFloat(opts.msgContents.css("margin-top"));
            }
            if (offset.top < 0) {
              offset.top = opts.draggableOverflowCorrectionAddValues.top;
              if (opts.msgContents.css("position") === "fixed") {
                offset.top -= parseFloat(opts.msgContents.css("margin-top"));
              }
            }
            if (opts.msgContents.offset().left < 0) {
              offset.left = opts.draggableOverflowCorrectionAddValues.left;
            } else if (opts.msgContents.offset().left + opts.msgContents.outerWidth() > documentWidth) {
              offset.left = documentWidth - opts.msgContents.outerWidth() + opts.draggableOverflowCorrectionAddValues.right;
            }
            if (!NC.isEmptyObject(offset)) {
              opts.msgContents.animate(offset, 200);
            }
          }
          opts.msgContents.fadeTo(100, "1.0");
          jQuery(window.document).off("dragstart.alert selectstart.alert mousemove.alert touchmove.alert mouseup.alert touchend.alert");
        });
      }
    });
  }
});
__publicField(_Alert, "resetOffSetEle", function(opts) {
  opts.context.position();
  if (opts.context.is(":visible")) {
    const windowHeight = jQuery(window).height();
    const windowWidth = jQuery(window).width();
    const msgContentsHeight = opts.msgContents.height();
    const msgContentsWidth = opts.msgContents.width();
    const msgContextCss = {
      "height": opts.isWindow ? window.innerHeight ? window.innerHeight : windowHeight : opts.context.outerHeight() + "px",
      "width": opts.isWindow ? windowWidth : opts.context.outerWidth() + "px"
    };
    let marginLeft = 0;
    if (opts.isWindow) {
      msgContextCss.top = "0";
      msgContextCss.left = "0";
    } else {
      msgContextCss["margin-top"] = "-" + (parseFloat(msgContextCss.height) + parseFloat(opts.context.css("margin-bottom"))) + "px";
      marginLeft = parseFloat(opts.context.css("margin-left"));
      msgContextCss.left = String(opts.context.position().left + marginLeft) + "px";
    }
    opts.msgContext.css(msgContextCss).hide().show();
    if (opts.msgContents.data("isMoved") !== true) {
      const msgContentsCss = {};
      if (opts.isWindow) {
        if (opts.top !== void 0) {
          msgContentsCss.position = "absolute";
          msgContentsCss.top = String(opts.top) + "px";
        } else {
          msgContentsCss.top = "0";
          msgContentsCss["margin-top"] = String(Math.floor(opts.msgContext.height() / 2 - msgContentsHeight / 2) - 1) + "px";
        }
      } else {
        if (opts.top !== void 0) {
          msgContentsCss.position = "absolute";
          msgContentsCss.top = String(opts.top) + "px";
        } else {
          msgContentsCss["margin-top"] = "-" + String(Math.floor(opts.msgContext.height() / 2 + msgContentsHeight / 2 + parseFloat(opts.context.css("margin-bottom"))) + 1) + "px";
        }
      }
      if (opts.left !== void 0) {
        msgContentsCss.left = String(opts.left) + "px";
      } else {
        opts.msgContents.width(msgContentsWidth);
        msgContentsCss.left = String(Math.floor(opts.context.position().left + marginLeft + (opts.msgContext.width() / 2 - msgContentsWidth / 2)) - 1) + "px";
      }
      if (msgContentsHeight > windowHeight) {
        msgContentsCss["margin-top"] = String(jQuery(window).scrollTop()) + "px";
        msgContentsCss.position = "absolute";
      }
      if (msgContentsWidth > windowWidth) {
        msgContentsCss["left"] = "0";
        msgContentsCss.position = "absolute";
      }
      if (opts.isWindow && windowHeight > msgContentsHeight && windowWidth > msgContentsWidth) {
        msgContentsCss.position = "fixed";
      }
      opts.msgContents.css(msgContentsCss);
    }
    opts.msgContents.show();
  } else {
    opts.msgContext.hide();
    opts.msgContents.hide();
  }
});
__publicField(_Alert, "wrapInputEle", function() {
  const opts = this.options;
  let isRemoved = false;
  if (opts.context.instance("alert") !== void 0) {
    opts.context.instance("alert").remove();
    isRemoved = true;
  }
  if (opts.msg.length > 0) {
    opts.msgContext = opts.context;
    opts.msgContents = opts.msgContext.next(".msg__");
    let isBeforeShow = false;
    if (opts.msgContents.length === 0 || isRemoved) {
      const limitWidth = opts.msgContext.offset().left + opts.msgContext.outerWidth() + 150;
      if (limitWidth > (window.innerWidth ? window.innerWidth : jQuery(window).width())) {
        opts.msgContents = opts.msgContext.before('<span class="msg__ alert_before_show__" style="display: none;"><ul class="msg_line_box__"></ul></span>').prev(".msg__");
        opts.msgContents.removeClass("orgin_left__").addClass("orgin_right__");
        isBeforeShow = true;
      } else {
        opts.msgContents = opts.msgContext.after('<span class="msg__ alert_after_show__" style="display: none;"><ul class="msg_line_box__"></ul></span>').next(".msg__");
        opts.msgContents.removeClass("orgin_right__").addClass("orgin_left__");
        isBeforeShow = false;
      }
      opts.msgContents.addClass("alert__ alert_tooltip__ hidden__");
      opts.msgContents.append('<a href="#" class="msg_close__" title="' + NC.message.get(opts.message, "close") + '"></a>');
    }
    if (opts.alwaysOnTop) {
      opts.msgContents.css("z-index", ElementUtils.maxZindex(opts.container.find(opts.alwaysOnTopCalcTarget)) + 1);
    }
    const self = this;
    opts.msgContents.find(".msg_close__").on("click", function(e) {
      e.preventDefault();
      self.remove();
    });
    const ul_ = opts.msgContents.find(".msg_line_box__").empty();
    if (isArray(opts.msg)) {
      opts.msgContents.find(".msg_line_box__").empty();
      jQuery(opts.msg).each(function(i, msg_) {
        if (opts.vars !== void 0) {
          opts.msg[i] = NC.message.replaceMsgVars(msg_, opts.vars);
        }
        ul_.append("<li>" + opts.msg[i] + "</li>");
      });
    } else {
      if (opts.vars !== void 0) {
        opts.msg = NC.message.replaceMsgVars(opts.msg, opts.vars);
      }
      ul_.append("<li>" + opts.msg + "</li>");
    }
    if (isBeforeShow) {
      opts.msgContents.css("margin-left", "-" + String(opts.msgContents.outerWidth()) + "px");
    }
  } else {
    this.remove();
  }
});
var Alert = _Alert;

// src/ui/components/button/button.js
var _Button = class _Button {
  constructor(obj, opts) {
    this.options = {
      context: obj,
      size: "none",
      // none, smaller, small, medium, large, big
      color: "none",
      // none, primary, primary_container, secondary, secondary_container, tertiary, tertiary_container
      type: "none",
      // none, filled, outlined, elevated
      disable: false,
      onBeforeCreate: null,
      onCreate: null
    };
    try {
      jQuery.extend(this.options, Context.attr("ui").button);
    } catch (e) {
      throw error("Button", e);
    }
    jQuery.extend(this.options, ElementUtils.toOpts(this.options.context));
    if (opts !== void 0) {
      UIUtils.wrapHandler(opts, "button", "onBeforeCreate");
      UIUtils.wrapHandler(opts, "button", "onCreate");
      jQuery.extend(this.options, opts);
    }
    this.options.context.addClass("button__");
    if (this.options.onBeforeCreate) {
      this.options.onBeforeCreate.call(this, this.options.context, this.options);
    }
    _Button.wrapEle.call(this);
    this.options.context.instance("button", this);
    if (this.options.onCreate) {
      this.options.onCreate.call(this, this.options.context, this.options);
    }
    return this;
  }
  context(sel) {
    return sel !== void 0 ? this.options.context.find(sel) : this.options.context;
  }
  disable() {
    const context = this.options.context;
    if (context.is("a")) {
      context.off("click.button");
      context.tpBind("click.button", EventUtils.disable);
    } else {
      context.prop("disabled", true);
    }
    context.addClass("btn_disabled__");
    return this;
  }
  enable() {
    const context = this.options.context;
    if (context.is("a")) {
      context.off("click", EventUtils.disable);
    } else {
      context.prop("disabled", false);
    }
    context.removeClass("btn_disabled__");
    return this;
  }
};
__publicField(_Button, "wrapEle", function() {
  const opts = this.options;
  if (opts.disable) {
    this.disable();
  } else {
    this.enable();
  }
  if (opts.context.is("a")) {
    opts.context.attr("onselectstart", "return false;");
  }
  if (opts.context.is("a") || opts.context.is("button") || opts.context.is("input[type='button']")) {
    opts.context.removeClass("btn_common__ btn_smaller__ btn_small__ btn_medium__ btn_large__ btn_big__ btn_primary__ btn_primary_container__ btn_secondary__ btn_secondary_container__ btn_tertiary__ btn_tertiary_container__ btn_filled__ btn_outlined__ btn_elevated__");
    if (opts.size !== "none") {
      opts.context.addClass("btn_common__");
      opts.context.addClass("btn_" + opts.size + "__");
    }
    if (opts.color !== "none") {
      opts.context.addClass("btn_" + opts.color + "__ ");
    }
    if (opts.type !== "none") {
      opts.context.addClass("btn_" + opts.type + "__");
    }
  }
});
var Button = _Button;

// src/ui/components/popup/popup.js
var _Popup = class _Popup {
  constructor(obj, opts) {
    this.options = {
      context: obj,
      url: null,
      title: null,
      button: true,
      modal: true,
      top: void 0,
      left: void 0,
      height: 0,
      width: 0,
      opener: null,
      closeMode: "hide",
      alwaysOnTop: false,
      "confirm": true,
      overlayClose: true,
      escClose: true,
      onOk: null,
      onCancel: null,
      onBeforeShow: null,
      onShow: null,
      onBeforeHide: null,
      onHide: null,
      onBeforeRemove: null,
      onRemove: null,
      onOpen: null,
      onOpenData: null,
      onClose: null,
      onCloseData: null,
      onLoad: null,
      preload: false,
      dynPos: true,
      windowScrollLock: true,
      draggable: false,
      draggableOverflowCorrection: true,
      draggableOverflowCorrectionAddValues: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      },
      saveMemory: false
    };
    let isOpenerHas = false;
    if (opts && opts.opener) {
      opts.opener;
      opts.opener = void 0;
      isOpenerHas = true;
    }
    try {
      jQuery.extend(true, this.options, Context.attr("ui").popup);
    } catch (e) {
      throw error("Popup", e);
    }
    if (opts !== void 0) {
      if (type(opts) === "string") {
        this.options.url = opts;
      }
    } else {
      if (arguments.length === 1 && isPlainObject(obj)) {
        opts = obj;
        obj = jQuery(window);
      }
    }
    UIUtils.wrapHandler(opts, "popup", "onOk");
    UIUtils.wrapHandler(opts, "popup", "onCancel");
    UIUtils.wrapHandler(opts, "popup", "onBeforeShow");
    UIUtils.wrapHandler(opts, "popup", "onShow");
    UIUtils.wrapHandler(opts, "popup", "onBeforeHide");
    UIUtils.wrapHandler(opts, "popup", "onHide");
    UIUtils.wrapHandler(opts, "popup", "onBeforeRemove");
    UIUtils.wrapHandler(opts, "popup", "onRemove");
    UIUtils.wrapHandler(opts, "popup", "onOpen");
    UIUtils.wrapHandler(opts, "popup", "onClose");
    UIUtils.wrapHandler(opts, "popup", "onLoad");
    jQuery.extend(true, this.options, opts);
    if (isOpenerHas) {
      opts.opener = opener;
      this.options.opener = opts.opener;
      opener = void 0;
    }
    this.options.title = opts !== void 0 ? StringUtils.trimToNull(opts.title) : null;
    if (this.options.url !== null || this.options.preload && this.options.closeMode === "remove") {
      if (this.options.preload) {
        _Popup.loadContent.call(this, function(cont, context) {
          this.options.context = context;
          this.options.context.instance("popup", this);
          this.options.isLoaded = true;
        });
      }
    } else {
      _Popup.wrapEle.call(this);
      this.options.context.instance("popup", this);
    }
    return this;
  }
  context(sel) {
    return sel !== void 0 ? this.options.context.find(sel) : this.options.context;
  }
  open(onOpenData) {
    const opts = this.options;
    const self = this;
    if (onOpenData === void 0 && opts.onOpenData !== null) {
      onOpenData = opts.onOpenData;
    }
    if (this.options.url !== null && (!opts.preload && !opts.isLoaded || !opts.isLoaded)) {
      opts.isLoaded = false;
      _Popup.loadContent.call(this, function(cont, context) {
        opts.context = context;
        opts.context.instance("popup", this);
        _Popup.popOpen.call(self, onOpenData, cont);
        if (opts.closeMode !== "remove") {
          opts.isLoaded = true;
        }
      });
    } else {
      _Popup.popOpen.call(this, onOpenData);
      if (opts.preload && opts.closeMode === "remove") {
        opts.isLoaded = false;
      }
    }
    return this;
  }
  close(onCloseData) {
    const opts = this.options;
    if (onCloseData === void 0 && opts.onCloseData !== null) {
      onCloseData = opts.onCloseData;
    }
    if (opts.onClose !== null) {
      opts.onClose.call(this, onCloseData);
    }
    this.alert[opts.closeMode]();
    return this;
  }
  remove() {
    this.alert.remove();
    return this;
  }
};
__publicField(_Popup, "wrapEle", function() {
  const opts = this.options;
  opts.context.hide();
  opts.html = true;
  opts.msg = opts.context;
  if (opts.title === null) {
    opts.title = opts.context.attr("title");
  }
  if (opts.title !== null) {
    opts.context.removeAttr("title");
  }
  this.alert = jQuery(window).alert(opts);
  this.alert.options.msgContext.addClass("popup_overlay__");
  this.alert.options.msgContents.addClass("popup__");
  if (opts.saveMemory) {
    this.alert.options.msg = null;
  }
});
__publicField(_Popup, "loadContent", function(callback) {
  const opts = this.options;
  const self = this;
  new NA.comm({
    url: opts.url,
    contentType: "text/html; charset=UTF-8",
    dataType: "html",
    type: "GET"
  }).submit(function(page) {
    opts.context = jQuery(page);
    if (opts.title === null) {
      opts.title = opts.context.filter(":not('style, script'):last").attr("title");
      if (opts.title !== null) {
        opts.context.filter(":not('style, script'):last").removeAttr("title");
      }
    }
    opts.html = true;
    opts.msg = opts.context;
    if (opts.onRemove != null) {
      const orgFn = opts.onRemove;
      opts.onRemove = function() {
        opts.context = null;
        return orgFn.apply(this, arguments);
      };
    } else {
      opts.onRemove = function() {
        opts.context = null;
      };
    }
    let opener2;
    if (opts.opener) {
      opener2 = opts.opener;
      opts.opener = void 0;
    }
    self.alert = jQuery(window).alert(opts);
    if (opener2) {
      opts.opener = opener2;
      opener2 = void 0;
    }
    self.alert.options.msgContext.addClass("popup_overlay__");
    self.alert.options.msgContents.addClass("popup__");
    if (opts.saveMemory) {
      self.alert.options.msg = null;
    }
    this.request.options.target = opts.context.parent();
    const cont = opts.context.filter(".view_context__:last").instance("cont");
    if (cont !== void 0) {
      cont.caller = self;
      if (opts.opener != null) {
        cont.opener = opts.opener;
      }
      NA.cont.trInit.call(this, cont, this.request);
      callback.call(self, cont, opts.context);
    } else {
      callback.call(self, cont, opts.context);
    }
    if (opts.onLoad !== null) {
      opts.onLoad.call(this, cont);
    }
  });
});
__publicField(_Popup, "popOpen", function(onOpenData, cont) {
  const opts = this.options;
  const self = this;
  if (opts.url === null) {
    opts.context.show();
  }
  self.alert.show();
  const onOpenProcFn__ = function() {
    if (opts.onOpen !== null) {
      opts.onOpenData = onOpenData !== void 0 ? onOpenData : null;
      if (opts.context.filter(".view_context__:last").instance("cont")[opts.onOpen] !== void 0) {
        opts.context.filter(".view_context__:last").instance("cont")[opts.onOpen](onOpenData);
      } else {
        warn("[Popup.popOpen]The onOpen event handler(" + opts.onOpen + ") is not defined on the Controller(NA.cont) of the Popup.");
      }
    }
  };
  onOpenProcFn__();
});
var Popup = _Popup;

// src/ui/components/tab/tab.js
var _Tab = class _Tab {
  constructor(obj, opts) {
    this.options = {
      context: obj.length > 0 ? obj : null,
      links: obj.length > 0 ? obj.find(">ul>li") : null,
      tabOpts: [],
      // tabOpts : [{ url: undefined, active: false, preload: false, onOpen: undefined, disable : false, stateless : false }]
      randomSel: false,
      opener: null,
      onActive: null,
      onLoad: null,
      blockOnActiveWhenCreate: false,
      contents: obj.length > 0 ? obj.find(">div") : null,
      tabScroll: false,
      tabScrollCorrection: {
        tabContainerWidthCorrectionPx: 0,
        tabContainerWidthReCalcDelayTime: 0
      }
    };
    let isOpenerHas = false;
    if (opts && opts.opener) {
      opts.opener;
      opts.opener = void 0;
      isOpenerHas = true;
    }
    try {
      jQuery.extend(true, this.options, Context.attr("ui").tab);
    } catch (e) {
      throw error("Tab", e);
    }
    if (isPlainObject(obj)) {
      UIUtils.wrapHandler(opts, "tab", "onActive");
      UIUtils.wrapHandler(opts, "tab", "onLoad");
      jQuery.extend(true, this.options, obj);
      this.options.context = jQuery(obj.context);
    }
    this.options.links = this.options.context.find(">ul>li");
    this.options.contents = this.options.context.find(">div");
    const self = this;
    let opt;
    if (this.options.tabOpts.length === 0) {
      this.options.links.each(function(i) {
        const thisEle = jQuery(this);
        opt = ElementUtils.toOpts(thisEle);
        if (opt === void 0) {
          opt = {};
        }
        opt.target = thisEle.find("a").attr("href");
        self.options.tabOpts.push(opt);
      });
    }
    jQuery.extend(this.options, opts);
    if (isOpenerHas) {
      opts.opener = opener;
      this.options.opener = opts.opener;
      opener = void 0;
    }
    this.options.context.addClass("tab__");
    _Tab.wrapEle.call(this);
    this.options.context.instance("tab", this);
  }
  context(sel) {
    return sel !== void 0 ? this.options.context.find(sel) : this.options.context;
  }
  open(idx, onOpenData, isFirst) {
    const opts = this.options;
    if (idx !== void 0) {
      if (opts.beforeOpenIdx !== idx) {
        opts.context.queue("open", function() {
          if (onOpenData !== void 0) {
            jQuery(opts.links.get(idx)).trigger("click.tab", [onOpenData, isFirst]);
          } else {
            jQuery(opts.links.get(idx)).trigger("click.tab", [void 0, isFirst]);
          }
        });
        clearTimeout(opts.openTime);
        opts.openTime = setTimeout(function() {
          opts.context.dequeue("open");
        }, 0);
      }
      opts.beforeOpenIdx = idx;
      if (opts.tabScroll) {
        const tabContainerEle = opts.context.find(">ul");
        if (tabContainerEle.outerWidth() > opts.context.innerWidth()) {
          let marginLeft = parseInt(tabContainerEle.css("margin-left")) - jQuery(opts.links.get(idx)).position().left + (opts.context.innerWidth() / 2 - jQuery(opts.links.get(idx)).outerWidth() / 2);
          const prevBtnEle = opts.context.find(">.tab_scroll_prev__");
          const nextBtnEle = opts.context.find(">.tab_scroll_next__");
          if (marginLeft > opts.context.find(">.tab_scroll_prev__").outerWidth()) {
            marginLeft = prevBtnEle.length > 0 ? prevBtnEle.outerWidth() : 0;
            nextBtnEle.removeClass("disabled__");
            prevBtnEle.addClass("disabled__");
          } else if (opts.context.innerWidth() > tabContainerEle.outerWidth() + marginLeft) {
            marginLeft = -(tabContainerEle.outerWidth() - opts.context.innerWidth() + (nextBtnEle.length > 0 ? nextBtnEle.outerWidth() : 0) - 1);
            prevBtnEle.removeClass("disabled__");
            nextBtnEle.addClass("disabled__");
          } else {
            prevBtnEle.removeClass("disabled__");
            nextBtnEle.removeClass("disabled__");
          }
          tabContainerEle.removeClass("effect__").addClass("effect__").css("margin-left", marginLeft + "px");
        }
      }
    } else {
      if (opts.links.index(opts.links.filter(".tab_active__")) === opts.beforeOpenIdx) {
        return {
          index: opts.links.index(opts.links.filter(".tab_active__")),
          tab: opts.links.filter(".tab_active__"),
          content: opts.context.find("> div.tab_content_active__"),
          cont: opts.context.find("> div.tab_content_active__ > .view_context__").instance("cont")
        };
      } else {
        return {
          index: opts.beforeOpenIdx,
          tab: "Tab content has not yet been loaded.",
          content: "Tab content has not yet been loaded.",
          cont: "Tab content has not yet been loaded."
        };
      }
    }
    return this;
  }
  disable(idx) {
    if (idx !== void 0) {
      jQuery(this.options.links.get(idx)).off("click.tab.disable").off("touchstart.tab.disable").off("touchend.tab.disable").tpBind("click.tab.disable", EventUtils.disable).tpBind("touchstart.tab.disable", EventUtils.disable).tpBind("touchend.tab.disable", EventUtils.disable).addClass("tab_disabled__");
    }
    return this;
  }
  enable(idx) {
    if (idx !== void 0) {
      jQuery(this.options.links.get(idx)).off("click", EventUtils.disable).off("touchstart", EventUtils.disable).off("touchend", EventUtils.disable).removeClass("tab_disabled__");
    }
    return this;
  }
  cont(idx) {
    const opts = this.options;
    let cont;
    if (idx !== void 0) {
      cont = opts.context.find("> div:eq(" + String(idx) + ") > .view_context__").instance("cont");
    } else {
      cont = opts.context.find("> .tab_content_active__ > .view_context__").instance("cont");
    }
    if (cont === void 0) {
      warn("Tab content has not been loaded yet or Controller(NA.cont) object is missing.");
    }
    return cont;
  }
};
__publicField(_Tab, "wrapEle", function() {
  const opts = this.options;
  opts.contents.hide();
  const self = this;
  let defSelIdx;
  jQuery(opts.tabOpts).each(function(i) {
    if (this.disable) {
      self.disable(i);
    } else {
      self.enable(i);
    }
    if (this.active === true) {
      defSelIdx = i;
    } else {
      if (opts.randomSel) {
        defSelIdx = Math.floor(Math.random() * opts.links.length);
      } else {
        if (i === 0) {
          defSelIdx = i;
        }
      }
    }
    if (this.preload) {
      if (this.url !== void 0) {
        _Tab.loadContent.call(self, this.url, i, function(cont, selContentEle_) {
          if (opts.onLoad !== null) {
            opts.onLoad.call(self, i, opts.links.eq(i), selContentEle_, cont);
          }
        });
      }
    }
  });
  let marginLeft;
  opts.links.on("mousedown.tab" + (BrowserUtils.scrollbarWidth() > 0 ? "touchstart.tab" : ""), function(e) {
    e.preventDefault();
    marginLeft = parseInt(opts.context.find(">ul").css("margin-left"));
  });
  opts.links.on("click.tab" + (BrowserUtils.scrollbarWidth() > 0 ? "touchend.tab" : ""), function(e, onOpenData, isFirst) {
    e.preventDefault();
    if (marginLeft !== void 0 && Math.abs(parseInt(opts.context.find(">ul").css("margin-left")) - marginLeft) > 15 && isFirst !== true) {
      marginLeft = void 0;
      return false;
    }
    marginLeft = void 0;
    if (!jQuery(this).hasClass("tab_active__")) {
      const selTabEle = jQuery(this);
      const selTabIdx = opts.beforeOpenIdx = opts.links.index(this);
      const selDeclarativeOpts = opts.tabOpts[selTabIdx];
      const selContentEle = opts.contents.eq(selTabIdx);
      opts.links.filter(".tab_active__").removeClass("tab_active__");
      selTabEle.addClass("tab_active__");
      const onActiveProcFn__ = function() {
        if (opts.onActive !== null) {
          if (opts.blockOnActiveWhenCreate === false || opts.blockOnActiveWhenCreate === true && isFirst !== true) {
            opts.onActive.call(self, selTabIdx, selTabEle, selContentEle, opts.links, opts.contents);
          }
        }
      };
      const onOpenProcFn__ = function() {
        if (selDeclarativeOpts.onOpen !== void 0) {
          const cont = selContentEle.children(".view_context__:last").instance("cont");
          if (cont[selDeclarativeOpts.onOpen] !== void 0) {
            cont[selDeclarativeOpts.onOpen](onOpenData);
          } else {
            warn("[Tab.wrapEle]The onOpen event handler(" + selDeclarativeOpts.onOpen + ") is not defined on the Controller(NA.cont) of the tab(Tab)'s contents.");
          }
        }
      };
      const visibleDefer = jQuery.Deferred();
      const loadDefer = jQuery.Deferred();
      jQuery.when(visibleDefer, loadDefer).done(function() {
        opts.context.dequeue("open");
      });
      const beforeActivatedContent = opts.contents.filter(".tab_content_active__");
      if (beforeActivatedContent.length > 0) {
        let isRelative = false;
        if (opts.context.css("position") !== "relative") {
          opts.context.css("position", "relative");
          isRelative = true;
        }
        beforeActivatedContent.removeClass("tab_content_active__ visible__").one(EventUtils.whichTransitionEvent(beforeActivatedContent), function(e2) {
          jQuery(this).hide();
          if (isRelative) {
            opts.context.css("position", "");
          }
          visibleDefer.resolve();
        }).addClass("hidden__").trigger("nothing");
      } else {
        visibleDefer.resolve();
      }
      if (!selDeclarativeOpts.preload && selDeclarativeOpts.url !== void 0 && !selContentEle.data("loaded") || selDeclarativeOpts.stateless) {
        selContentEle.show(0, function() {
          selContentEle.addClass("visible__");
        }).removeClass("hidden__");
        _Tab.loadContent.call(self, selDeclarativeOpts.url, selTabIdx, function(cont, selContentEle_) {
          selContentEle_.addClass("tab_content_active__");
          if (opts.onLoad !== null) {
            opts.onLoad.call(self, selTabIdx, selTabEle, selContentEle_, cont);
          }
          onActiveProcFn__();
          onOpenProcFn__();
          selContentEle_.data("loaded", true);
          loadDefer.resolve();
        }, isFirst);
      } else {
        selContentEle.addClass("tab_content_active__");
        onActiveProcFn__();
        onOpenProcFn__();
        selContentEle.show(0, function() {
          selContentEle.addClass("visible__");
          loadDefer.resolve();
        }).removeClass("hidden__");
      }
    }
  });
  if (opts.tabScroll) {
    _Tab.wrapScroll.call(this);
  }
  this.open(defSelIdx, void 0, true);
});
__publicField(_Tab, "wrapScroll", function() {
  const opts = this.options;
  const eventNameSpace = ".tab.scroll";
  const tabContainerEle = opts.context.find(">ul").addClass("effect__");
  const scrollBtnEles = opts.context.find(">a").hide();
  let prevBtnEle;
  let nextBtnEle;
  const liMarginRight = parseInt(StringUtils.trimToZero(tabContainerEle.find(">li:first").css("margin-right")));
  let lastDistance = liMarginRight;
  let prevBtnEleOuterWidth = 0;
  let nextBtnEleOuterWidth = 0;
  let tabNativeScroll;
  if (scrollBtnEles.length > 1) {
    opts.context.css("position", "relative");
    scrollBtnEles.css({
      "position": "absolute",
      "top": 0
    });
    prevBtnEle = scrollBtnEles.eq(0).addClass("tab_scroll_prev__").css("left", 0).on("click" + eventNameSpace, function(e) {
      e.preventDefault();
      if (BrowserUtils.scrollbarWidth() > 0) {
        tabContainerEle.addClass("effect__");
        lastDistance = prevBtnEleOuterWidth + liMarginRight;
        tabContainerEle.css("margin-left", lastDistance + "px");
        nextBtnEle.removeClass("disabled__");
        prevBtnEle.addClass("disabled__");
      } else {
        tabNativeScroll.animate({
          scrollLeft: 0
        }, 300, "swing");
      }
    });
    prevBtnEleOuterWidth = prevBtnEle.outerWidth();
    nextBtnEle = scrollBtnEles.eq(1).addClass("tab_scroll_next__").css("right", 0).on("click" + eventNameSpace, function(e) {
      e.preventDefault();
      if (BrowserUtils.scrollbarWidth() > 0) {
        tabContainerEle.addClass("effect__");
        lastDistance = opts.context.outerWidth() - tabContainerEle.width() - nextBtnEleOuterWidth + liMarginRight;
        tabContainerEle.css("margin-left", lastDistance + "px");
        prevBtnEle.removeClass("disabled__");
        nextBtnEle.addClass("disabled__");
      } else {
        tabNativeScroll.animate({
          scrollLeft: tabContainerEle.outerWidth()
        }, 300, "swing");
      }
    });
    nextBtnEleOuterWidth = nextBtnEle.outerWidth();
    lastDistance = prevBtnEleOuterWidth + liMarginRight;
  }
  jQuery(window).on("resize" + eventNameSpace, function() {
    if (!tabContainerEle.is(":visible")) {
      return false;
    }
    let ulWidth = 0;
    opts.links.each(function() {
      ulWidth += jQuery(this).outerWidth() + parseInt(StringUtils.trimToZero(jQuery(this).css("margin-left"))) + parseInt(StringUtils.trimToZero(jQuery(this).css("margin-right")));
    });
    ulWidth += opts.tabScrollCorrection.tabContainerWidthCorrectionPx;
    if (ulWidth > 0 && ulWidth > opts.context.width() + liMarginRight) {
      if (BrowserUtils.scrollbarWidth() > 0) {
        opts.context.css("overflow", "hidden");
        if (tabContainerEle.parent().hasClass("tab_native_scroll__")) {
          tabContainerEle.unwrap();
        }
        if (scrollBtnEles.length > 1 && prevBtnEleOuterWidth > 0 && nextBtnEleOuterWidth > 0) {
          tabContainerEle.css("margin-left", prevBtnEleOuterWidth + liMarginRight + "px");
          prevBtnEle.addClass("disabled__");
          scrollBtnEles.show();
        }
      } else {
        if (!tabContainerEle.parent().hasClass("tab_native_scroll__")) {
          tabNativeScroll = tabContainerEle.wrap('<div class="tab_native_scroll__"></div>').parent();
          if (prevBtnEleOuterWidth > 0) {
            tabNativeScroll.css("margin-left", prevBtnEleOuterWidth + liMarginRight);
          }
          if (nextBtnEleOuterWidth > 0) {
            tabNativeScroll.css("margin-right", nextBtnEleOuterWidth - liMarginRight);
          }
        }
        if (scrollBtnEles.length > 1) {
          scrollBtnEles.show();
        }
      }
      tabContainerEle.addClass("tab_scroll__").width(ulWidth);
    } else {
      if (scrollBtnEles.length > 1 && prevBtnEleOuterWidth > 0 && nextBtnEleOuterWidth > 0) {
        scrollBtnEles.hide();
        tabContainerEle.css("margin-left", "");
        prevBtnEle.removeClass("disabled__");
      }
      if (BrowserUtils.scrollbarWidth() > 0) {
        opts.context.css("overflow", "");
      }
      if (tabContainerEle.parent().hasClass("tab_native_scroll__")) {
        tabContainerEle.unwrap();
      }
      tabContainerEle.css("width", "");
    }
  }).trigger("resize" + eventNameSpace);
  if (opts.tabScrollCorrection.tabContainerWidthReCalcDelayTime > 0) {
    setTimeout(function() {
      jQuery(window).trigger("resize" + eventNameSpace);
    }, opts.tabScrollCorrection.tabContainerWidthReCalcDelayTime);
  }
  if (BrowserUtils.scrollbarWidth() > 0) {
    let sPageX;
    let prevDefGap = 0;
    let nextDefGap = 0;
    let isMoved = false;
    if (scrollBtnEles.length > 1) {
      prevDefGap = prevBtnEleOuterWidth;
      nextDefGap = nextBtnEleOuterWidth;
    }
    Draggable.events.call(tabContainerEle, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) {
      tabContainerEle_.removeClass("effect__");
      if (tabContainerEle_.outerWidth() <= opts.context.innerWidth()) {
        return false;
      }
      sPageX = pageX - lastDistance;
    }, function(e, tabContainerEle_, pageX, pageY) {
      const distance = (sPageX - pageX) * -1;
      if (distance > prevDefGap || opts.context.outerWidth() >= tabContainerEle_.width() + nextDefGap + distance) {
        return false;
      } else {
        lastDistance = distance + liMarginRight;
        tabContainerEle_.css("margin-left", distance + "px");
        isMoved = true;
      }
    }, function(e, tabContainerEle_) {
      if (isMoved) {
        if (lastDistance + (scrollBtnEles.length > 1 ? 0 : 30) >= 0 && lastDistance <= prevDefGap) {
          if (scrollBtnEles.length > 1) {
            lastDistance = prevDefGap;
            if (prevBtnEleOuterWidth > 0 && nextBtnEleOuterWidth > 0) {
              lastDistance += liMarginRight;
            }
            nextBtnEle.removeClass("disabled__");
            prevBtnEle.addClass("disabled__");
          } else {
            lastDistance = 0;
            if (prevBtnEleOuterWidth > 0 && nextBtnEleOuterWidth > 0) {
              lastDistance += liMarginRight;
            }
          }
          tabContainerEle_.addClass("effect__").css("margin-left", lastDistance + "px");
          isMoved = false;
        } else if (nextDefGap + (scrollBtnEles.length > 1 ? 0 : 30) >= tabContainerEle_.width() - (opts.context.outerWidth() + lastDistance * -1)) {
          lastDistance = (tabContainerEle_.width() - opts.context.outerWidth() - 1) * -1;
          if (scrollBtnEles.length > 1) {
            lastDistance -= nextDefGap;
            prevBtnEle.removeClass("disabled__");
            nextBtnEle.addClass("disabled__");
          }
          tabContainerEle_.addClass("effect__").css("margin-left", lastDistance + "px");
          isMoved = false;
        } else {
          scrollBtnEles.removeClass("disabled__");
        }
      }
    });
  }
});
__publicField(_Tab, "loadContent", function(url, targetIdx, callback, isFirst) {
  const opts = this.options;
  const self = this;
  const selContentEle = opts.contents.eq(targetIdx);
  new NA.comm({
    url,
    contentType: "text/html; charset=UTF-8",
    dataType: "html",
    type: "GET",
    urlSync: !isFirst,
    target: selContentEle
  }).submit(function(page) {
    const cont = selContentEle.html(page).children(".view_context__:last").instance("cont");
    if (cont !== void 0) {
      cont.caller = self;
      if (opts.opener != null) {
        cont.opener = opts.opener;
      }
      NA.cont.trInit.call(this, cont, this.request);
      callback.call(this, cont, selContentEle);
    } else {
      callback.call(this, cont, selContentEle);
    }
    opts.links.eq(targetIdx);
  });
});
var Tab = _Tab;

// src/ui/components/datepicker/datepicker.js
var _Datepicker = class _Datepicker {
  constructor(obj, opts) {
    this.options = {
      context: obj,
      contents: jQuery('<div class="datepicker__"></div>'),
      monthonly: false,
      focusin: true,
      yearsPanelPosition: "left",
      monthsPanelPosition: "left",
      minYear: 200,
      maxYear: 200,
      yearChangeInput: false,
      monthChangeInput: false,
      touchMonthChange: false,
      scrollMonthChange: false,
      minDate: null,
      maxDate: null,
      holiday: {
        "repeat": null,
        "once": null
      },
      onChangeYear: null,
      onChangeMonth: null,
      onSelect: null,
      onBeforeShow: null,
      onShow: null,
      onBeforeHide: null,
      onHide: null
    };
    try {
      jQuery.extend(this.options, Context.attr("ui").datepicker);
      if (opts && opts.monthonly === true && Context.attr("ui").datepicker.monthonlyOpts) {
        jQuery.extend(this.options, Context.attr("ui").datepicker.monthonlyOpts);
      }
    } catch (e) {
      throw error("Datepicker", e);
    }
    if (opts !== void 0) {
      UIUtils.wrapHandler(opts, "datepicker", "onChangeYear");
      UIUtils.wrapHandler(opts, "datepicker", "onChangeMonth");
      UIUtils.wrapHandler(opts, "datepicker", "onSelect");
      UIUtils.wrapHandler(opts, "datepicker", "onBeforeShow");
      UIUtils.wrapHandler(opts, "datepicker", "onShow");
      UIUtils.wrapHandler(opts, "datepicker", "onBeforeHide");
      UIUtils.wrapHandler(opts, "datepicker", "onHide");
      jQuery.extend(this.options, opts);
    }
    if (this.options.yearsPanelPosition === "top" && this.options.monthsPanelPosition === "top" && this.options.monthonly === true) {
      warn('[Datepicker]This option combination({ yearsPanelPosition : "top", monthsPanelPosition : "top", monthonly : true }) is not suppored.');
      this.options.yearsPanelPosition = "left";
      this.options.monthsPanelPosition = "left";
    }
    this.options.context.addClass("datepicker__");
    _Datepicker.wrapEle.call(this);
    this.options.context.instance("datepicker", this);
    return this;
  }
  context(sel) {
    return sel !== void 0 ? this.options.context.find(sel) : this.options.context;
  }
  show() {
    const opts = this.options;
    const contextParentWrapEle = opts.context.closest("label,span");
    if (contextParentWrapEle.length === 0 && opts.context.next(".datepicker_contents__").length === 0 || contextParentWrapEle.length > 0 && contextParentWrapEle.next(".datepicker_contents__").length === 0) {
      jQuery(jQuery(".datepicker__").instance("datepicker")).each(function() {
        if (this.options.contents.hasClass("visible__")) {
          this.hide();
        }
      });
      _Datepicker.createContents.call(this);
    }
    let dateStr;
    if (!StringUtils.isEmpty(opts.context.val())) {
      dateStr = opts.context.val().replace(/[^0-9]/g, "");
    } else {
      dateStr = !opts.monthonly ? (/* @__PURE__ */ new Date()).formatDate("Ymd") : (/* @__PURE__ */ new Date()).formatDate("Ym");
    }
    _Datepicker.selectItems(
      opts,
      dateStr,
      (!opts.monthonly ? Context.attr("data").formatter.date.Ymd() : Context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, ""),
      opts.contents.find(".datepicker_years_panel__"),
      opts.contents.find(".datepicker_months_panel__"),
      opts.contents.find(".datepicker_days_panel__")
    );
    if (opts.onBeforeShow !== null) {
      const result = opts.onBeforeShow.call(this, opts.context, opts.contents);
      if (result !== void 0 && result === false) {
        return this;
      }
    }
    opts.context.trigger("onBeforeShow", [opts.context, opts.contents]);
    const formEle = opts.contents.closest(".form__");
    if (formEle.length > 0 && formEle.css("position") !== "relative") {
      this.formEleOrgPosition = formEle.css("position").replace("static", "");
      formEle.css("position", "relative");
    }
    const baseEle = opts.contextWrapper ? opts.contextWrapper : opts.context;
    jQuery(window).on("resize.datepicker", function() {
      let formPaddingLeft = 0;
      baseEle.parentsUntil(formEle.parent()).each(function(i, ele) {
        formPaddingLeft += parseInt(jQuery(ele).css("padding-left")) + parseInt(jQuery(ele).css("margin-left"));
      });
      let formPaddingRight = 0;
      baseEle.parentsUntil(formEle.parent()).each(function(i, ele) {
        formPaddingRight += parseInt(jQuery(ele).css("padding-right")) + parseInt(jQuery(ele).css("margin-right"));
      });
      let leftOfs = baseEle.position().left;
      const tdEle = baseEle.closest("td");
      if (tdEle.length > 0) {
        tdEle.css("display", "contents");
        leftOfs = baseEle.position().left + formPaddingLeft;
        tdEle.css("display", "");
      }
      let limitWidth;
      if (formEle.length > 0 && formEle.innerWidth() > opts.contents.outerWidth()) {
        limitWidth = formEle.offset().left + parseInt(formEle.css("padding-left")) + formEle.width();
      } else {
        limitWidth = window.innerWidth ? window.innerWidth : jQuery(window).width();
      }
      if (baseEle.offset().left + opts.contents.width() > limitWidth) {
        opts.contents.css("left", leftOfs + baseEle.outerWidth() - opts.contents.width() + "px");
        opts.contents.removeClass("orgin_left__").addClass("orgin_right__");
      } else {
        opts.contents.css("left", leftOfs + "px");
        opts.contents.removeClass("orgin_right__").addClass("orgin_left__");
      }
    }).trigger("resize.datepicker");
    const self = this;
    opts.contents.show(10, function() {
      jQuery(this).removeClass("hidden__").addClass("visible__");
      jQuery(this).one(EventUtils.whichTransitionEvent(opts.contents), function(e) {
        jQuery(document).off("click.datepicker").on("click.datepicker", function(e2) {
          opts.context.get(0).blur();
          self.hide();
        });
        if (opts.onShow !== null) {
          opts.onShow.call(self, opts.context, opts.contents);
        }
        opts.context.trigger("onShow", [opts.context, opts.contents]);
      }).trigger("nothing");
    });
    return this;
  }
  hide() {
    const opts = this.options;
    if (opts.contents.hasClass("visible__")) {
      const self = this;
      if (opts.onBeforeHide !== null) {
        const result = opts.onBeforeHide.call(this, opts.context, opts.contents, arguments.length > 0 ? arguments[0] : void 0);
        if (result !== void 0 && result === false) {
          return this;
        }
      }
      opts.context.trigger("onBeforeHide", [opts.context, opts.contents, arguments.length > 0 ? arguments[0] : void 0]);
      jQuery(window).off("resize.datepicker");
      jQuery(document).off("click.datepicker");
      opts.context.off("blur.datepicker");
      opts.contents.removeClass("visible__").addClass("hidden__");
      opts.contents.one(EventUtils.whichTransitionEvent(opts.contents), function(e) {
        if (self.formEleOrgPosition !== void 0) {
          jQuery(this).closest(".form__").css("position", self.formEleOrgPosition);
        }
        jQuery(this).remove();
        if (opts.onHide !== null) {
          opts.onHide.call(self, opts.context);
        }
        opts.context.trigger("onHide", [opts.context]);
      }).trigger("nothing");
    }
    return this;
  }
};
__publicField(_Datepicker, "checkMinMaxDate", function() {
  const opts = this.options;
  const value = opts.context.val();
  if (value.length === 4) {
    if (opts.minDate != null && opts.minDate.length >= 4) {
      if (Number(value) < Number(opts.minDate.substring(0, 4))) {
        opts.context.val(opts.minDate.substring(0, 4)).trigger("keyup.datepicker", [true]);
        opts.context.alert(NC.message.get(opts.message, "minDate", [opts.minDate])).show();
        return false;
      }
    }
    if (opts.maxDate != null && opts.maxDate.length >= 4) {
      if (Number(value) > Number(opts.maxDate.substring(0, 4))) {
        opts.context.val(opts.maxDate.substring(0, 4)).trigger("keyup.datepicker", [true]);
        opts.context.alert(NC.message.get(opts.message, "maxDate", [opts.maxDate])).show();
        return false;
      }
    }
  } else if (value.length === 6) {
    if (opts.minDate != null && opts.minDate.length >= 6) {
      if (Number(value) < Number(opts.minDate.substring(0, 6))) {
        opts.context.val(opts.minDate.substring(0, 6)).trigger("keyup.datepicker", [true]);
        opts.context.alert(NC.message.get(opts.message, "minDate", [opts.minDate])).show();
        return false;
      }
    }
    if (opts.maxDate != null && opts.maxDate.length >= 6) {
      if (Number(value) > Number(opts.maxDate.substring(0, 6))) {
        opts.context.val(opts.maxDate.substring(0, 6)).trigger("keyup.datepicker", [true]);
        opts.context.alert(NC.message.get(opts.message, "maxDate", [opts.maxDate])).show();
        return false;
      }
    }
  } else if (value.length === 8) {
    if (opts.minDate != null && opts.minDate.length === 8) {
      if (Number(value) < Number(opts.minDate)) {
        opts.context.val(opts.minDate).trigger("keyup.datepicker", [true]);
        opts.context.alert(NC.message.get(opts.message, "minDate", [opts.minDate])).show();
        return false;
      }
    }
    if (opts.maxDate != null && opts.maxDate.length === 8) {
      if (Number(value) > Number(opts.maxDate)) {
        opts.context.val(opts.maxDate).trigger("keyup.datepicker", [true]);
        opts.context.alert(NC.message.get(opts.message, "maxDate", [opts.maxDate])).show();
        return false;
      }
    }
  }
  return true;
});
__publicField(_Datepicker, "wrapEle", function() {
  const opts = this.options;
  const self = this;
  if (opts.focusin && !opts.context.prop("readonly") && !opts.context.prop("disabled")) {
    opts.context.off("focusin.datepicker").on("focusin.datepicker", function() {
      self.show();
    });
  }
  opts.context.off("keydown.datepicker").on("keydown.datepicker", function(e) {
    const keyCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
    if (!EventUtils.isNumberRelatedKeys(e) || opts.context.val().length > 8) {
      e.preventDefault();
      return false;
    } else if (keyCode === 13 || keyCode === 9) {
      opts.context.get(0).blur();
      self.hide();
    }
  }).off("keyup.datepicker").on("keyup.datepicker", function(e, isPassCheckMinMaxDate) {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
    const value = opts.context.val();
    const keyCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
    const format3 = (!opts.monthonly ? Context.attr("data").formatter.date.Ymd() : Context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, "");
    if (value.length > 2 && value.length % 2 === 0 && keyCode !== 35 && keyCode !== 36 && keyCode !== 37 && keyCode !== 39 && keyCode !== 9 && keyCode !== 27) {
      const dateStrArr = DateUtils.strToDateStrArr(value, format3);
      const dateStrStrArr = DateUtils.strToDateStrArr(value, format3, true);
      if (dateStrStrArr[0].length === 4 && dateStrArr[0] < 100) {
        opts.context.alert(NC.message.get(opts.message, "yearNaN")).show();
        opts.context.val(value.replace(dateStrStrArr[0], ""));
        return false;
      } else if (dateStrStrArr[1].length === 2 && (dateStrArr[1] < 1 || dateStrArr[1] > 12)) {
        opts.context.alert(NC.message.get(opts.message, "monthNaN")).show();
        opts.context.val(value.replace(dateStrStrArr[1], ""));
        return false;
      } else if (!opts.monthonly && dateStrStrArr[2].length === 2 && (dateStrArr[2] < 1 || dateStrArr[2] > parseInt(opts.gEndDate))) {
        opts.context.alert(NC.message.get(opts.message, "dayNaN", [String(parseInt(opts.gEndDate))])).show();
        opts.context.val(value.replace(dateStrStrArr[2], ""));
        return false;
      }
      if (!isPassCheckMinMaxDate && !_Datepicker.checkMinMaxDate.call(self)) {
        return false;
      }
      const yearsPanel = opts.contents.find(".datepicker_years_panel__");
      const monthsPanel = opts.contents.find(".datepicker_months_panel__");
      const daysPanel = opts.contents.find(".datepicker_days_panel__");
      if (format3.length === 3 && format3.indexOf("md") > -1 || format3.length === 2) {
        _Datepicker.selectItems(opts, value, format3, yearsPanel, monthsPanel, daysPanel);
      } else {
        if (!opts.monthonly) {
          if (value.length === 8) {
            _Datepicker.selectItems(opts, value, format3, yearsPanel, monthsPanel, daysPanel);
          }
        } else {
          if (value.length === 6) {
            _Datepicker.selectItems(opts, value, format3, yearsPanel, monthsPanel, daysPanel);
          }
        }
      }
    }
    if (keyCode === 27) {
      e.preventDefault();
      self.hide();
    }
  }).off("focusout.datepicker").on("focusout.datepicker", function(e) {
    if (!opts.context.prop("readonly") && !opts.context.prop("disable")) {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
    }
  });
});
__publicField(_Datepicker, "createContents", function() {
  const opts = this.options;
  const self = this;
  const d = /* @__PURE__ */ new Date();
  opts.currYear = parseInt(d.formatDate("Y"));
  const format3 = (!opts.monthonly ? Context.attr("data").formatter.date.Ymd() : Context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, "");
  opts.contents = jQuery('<div class="datepicker_contents__"></div>').on("click.datepicker", function(e) {
    e.stopPropagation();
  }).addClass("hidden__").addClass("years_panel_position_" + opts.yearsPanelPosition + "__").addClass("months_panel_position_" + opts.monthsPanelPosition + "__");
  opts.context.off("click.datepicker").on("click.datepicker", function(e) {
    e.stopPropagation();
  });
  if (opts.monthonly) {
    opts.context.attr("maxlength", "6");
    opts.contents.addClass("datepicker_monthonly__");
  } else {
    opts.context.attr("maxlength", "8");
  }
  opts.contents.css({
    display: "none",
    position: "absolute"
  });
  const yearsPanel = jQuery('<div class="datepicker_years_panel__"></div>');
  let topMonthsPanel, topMonthItem, monthsPanel;
  let days, daysPanel, dayItem;
  if (opts.yearsPanelPosition === "left") {
    const yearItem = jQuery("<div></div>");
    let yearItemClone;
    yearsPanel.append(yearItem.clone(true).addClass("datepicker_year_title__").text(NC.message.get(opts.message, "year")));
    let i;
    for (i = opts.currYear - 2; i <= opts.currYear + 2; i++) {
      yearItemClone = yearItem.clone(true).addClass("datepicker_year_item__");
      if (i === opts.currYear) {
        yearItemClone.addClass("datepicker_curr_year__");
        yearItemClone.addClass("datepicker_year_selected__");
      }
      yearsPanel.append(yearItemClone.text(StringUtils.lpad(String(i), 4, "0")));
    }
    yearsPanel.on("click.datepicker", ".datepicker_year_item__", function(e, isForceUpdate) {
      e.preventDefault();
      const selectedYearItemEle = yearsPanel.find(".datepicker_year_item__.datepicker_year_selected__").removeClass("datepicker_year_selected__");
      jQuery(this).addClass("datepicker_year_selected__");
      const selYearStr = jQuery(this).text();
      if (selYearStr !== selectedYearItemEle.text() || isForceUpdate) {
        if (opts.yearChangeInput) {
          let dateVal = opts.context.val().replace(/\D/g, "");
          if (dateVal.length <= 4) {
            opts.context.val(StringUtils.lpad(selYearStr, 4, "0"));
          } else {
            let selDate;
            let dateFormat;
            if (dateVal.length === 6) {
              dateFormat = Context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");
            } else if (dateVal.length === 8) {
              dateFormat = Context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");
            }
            if (dateFormat !== void 0) {
              selDate = DateUtils.strToDate(dateVal, dateFormat);
              let tempFormat = "";
              jQuery(dateFormat.split("")).each(function(i2, formatChar) {
                tempFormat += formatChar + "-";
              });
              dateVal = selDate.obj.formatDate(tempFormat).replace(selDate.obj.formatDate("Y"), selYearStr).replace(/-/g, "");
              opts.context.val(dateVal);
            }
          }
          if (!_Datepicker.checkMinMaxDate.call(self)) {
            return false;
          }
        }
        if (!opts.monthonly) {
          monthsPanel.find(".datepicker_month_item__.datepicker_month_selected__").trigger("click.datepicker");
        }
        if (opts.onChangeYear !== null) {
          opts.onChangeYear.call(self, opts.context, selYearStr, e);
        }
        opts.context.trigger("onChangeYear", [opts.context, selYearStr, e]);
      }
    });
    const yearPaging = jQuery('<div class="datepicker_year_paging__"><a href="#" class="datepicker_year_prev__" title="' + NC.message.get(opts.message, "prev") + '"><span>&lt;</span></a><a href="#" class="datepicker_year_next__" title="' + NC.message.get(opts.message, "next") + '"><span>&gt;</span></a></div>');
    yearPaging.find(".datepicker_year_prev__").on("click.datepicker", function(e) {
      e.preventDefault();
      _Datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), opts.currYear, -5);
      yearsPanel.find(".datepicker_year_selected__").trigger("click.datepicker", [true]);
    });
    yearPaging.find(".datepicker_year_next__").on("click.datepicker", function(e) {
      e.preventDefault();
      _Datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), opts.currYear, 5);
      yearsPanel.find(".datepicker_year_selected__").trigger("click.datepicker", [true]);
    });
    yearsPanel.append(yearPaging);
  } else if (opts.yearsPanelPosition === "top") {
    jQuery('<div class="datepicker_year_paging__"><a href="#" class="datepicker_year_prev__" title="' + NC.message.get(opts.message, "prev") + '"><span>&lt;</span></a></div>').appendTo(yearsPanel).find("> .datepicker_year_prev__").on("click.datepicker", function(e, isPrevYearBtn) {
      e.preventDefault();
      let selectedYear = parseInt(yearItem.val());
      if (selectedYear > opts.currYear - opts.minYear) {
        yearItem.val(StringUtils.lpad(String(selectedYear - 1), 4, "0")).trigger("change.datepicker", isPrevYearBtn ? [isPrevYearBtn] : void 0);
      } else {
        yearItem.empty();
        selectedYear--;
        let startYear = selectedYear - opts.minYear;
        let endYear = selectedYear + opts.maxYear;
        if (startYear < 100) {
          startYear = 100;
          endYear = startYear + opts.maxYear;
        }
        for (let i = startYear; i <= endYear; i++) {
          let selected = "";
          if (i === selectedYear) {
            opts.currYear = selectedYear;
            selected = 'selected="selected"';
          }
          yearItem.append('<option value="' + StringUtils.lpad(String(i), 4, "0") + '" ' + selected + ">" + StringUtils.lpad(String(i), 4, "0") + "</option>");
        }
        yearItem.trigger("change.datepicker", isPrevYearBtn ? [isPrevYearBtn] : void 0);
      }
    });
    const yearItem = jQuery('<select class="datepicker_year_item__"><select>');
    for (let i = opts.currYear - opts.minYear; i <= opts.currYear + opts.maxYear; i++) {
      yearItem.append('<option value="' + StringUtils.lpad(String(i), 4, "0") + '"' + (i === opts.currYear ? 'selected="selected"' : "") + ">" + StringUtils.lpad(String(i), 4, "0") + "</option>");
    }
    yearItem.addClass("datepicker_year_item__ datepicker_year_selected__").on("change.datepicker", function(e, isPrevNextYearBtn) {
      const selYearStr = jQuery(this).val();
      if (opts.yearChangeInput) {
        let dateVal = opts.context.val().replace(/\D/g, "");
        if (dateVal.length <= 4) {
          opts.context.val(selYearStr);
        } else {
          let selDate;
          let dateFormat;
          if (dateVal.length === 6) {
            dateFormat = Context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");
          } else if (dateVal.length === 8) {
            dateFormat = Context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");
          }
          if (dateFormat !== void 0) {
            selDate = DateUtils.strToDate(dateVal, dateFormat);
            let tempFormat = "";
            jQuery(dateFormat.split("")).each(function(i, formatChar) {
              tempFormat += formatChar + "-";
            });
            dateVal = selDate.obj.formatDate(tempFormat).replace(selDate.obj.formatDate("Y"), selYearStr).replace(/-/g, "");
            opts.context.val(dateVal);
          }
        }
        if (!isPrevNextYearBtn) {
          if (!_Datepicker.checkMinMaxDate.call(self)) {
            return false;
          }
        }
      }
      if (topMonthItem !== void 0) {
        topMonthItem.trigger("change.datepicker");
      }
      if (opts.onChangeYear !== null) {
        opts.onChangeYear.call(self, opts.context, selYearStr, e);
      }
      opts.context.trigger("onChangeYear", [opts.context, selYearStr, e]);
    }).appendTo(yearsPanel);
    jQuery('<div class="datepicker_year_paging__"><a href="#" class="datepicker_year_next__" title="' + NC.message.get(opts.message, "next") + '"><span>&gt;</span></a></div>').appendTo(yearsPanel).find("> .datepicker_year_next__").on("click.datepicker", function(e, isNextYearBtn) {
      e.preventDefault();
      let selectedYear = parseInt(yearItem.val());
      if (selectedYear < opts.currYear + opts.maxYear && opts.currYear + opts.maxYear > opts.minYear + opts.maxYear) {
        yearItem.val(StringUtils.lpad(String(selectedYear + 1), 4, "0")).trigger("change.datepicker", isNextYearBtn ? [isNextYearBtn] : void 0);
      } else {
        yearItem.empty();
        selectedYear++;
        const startYear = selectedYear - opts.minYear;
        const endYear = selectedYear + opts.maxYear;
        for (let i = startYear; i <= endYear; i++) {
          let selected = "";
          if (i === selectedYear) {
            opts.currYear = selectedYear;
            selected = 'selected="selected"';
          }
          yearItem.append('<option value="' + StringUtils.lpad(String(i), 4, "0") + '" ' + selected + ">" + StringUtils.lpad(String(i), 4, "0") + "</option>");
        }
        yearItem.trigger("change.datepicker", isNextYearBtn ? [isNextYearBtn] : void 0);
      }
    });
  }
  opts.contents.append(yearsPanel);
  monthsPanel = jQuery('<div class="datepicker_months_panel__"></div>');
  if (!opts.monthonly) {
    days = NC.message.get(opts.message, "days").split(",");
    daysPanel = jQuery('<div class="datepicker_days_panel__"></div>');
    dayItem = jQuery("<div></div>");
  }
  if (opts.monthsPanelPosition === "top") {
    monthsPanel.hide();
    topMonthsPanel = jQuery('<div class="datepicker_top_months_panel__"></div>');
    topMonthItem = jQuery("<select><select>");
    for (let i = 1; i <= 12; i++) {
      topMonthItem.append('<option value="' + String(i) + '"' + (i === parseInt(d.formatDate("m")) ? 'selected="selected"' : "") + ">" + StringUtils.lpad(String(i), 2, "0") + "</option>");
    }
    const prevMonthBtn = jQuery('<div class="datepicker_month_paging__"><a href="#" class="datepicker_month_prev__" title="' + NC.message.get(opts.message, "prev") + '"><span>&lt;</span></a></div>').appendTo(topMonthsPanel).find("> .datepicker_month_prev__").on("click.datepicker", function(e) {
      e.preventDefault();
      let prevMonth = String(parseInt(topMonthItem.val()) - 1);
      if (prevMonth < 1) {
        const yearPrevBtnEle = yearsPanel.find(".datepicker_year_prev__");
        if (opts.yearsPanelPosition === "left") {
          const yearStr = String(Number(yearsPanel.find(".datepicker_year_selected__").text()) - 1);
          yearsPanel.find(".datepicker_year_item__").removeClass("datepicker_year_selected__");
          if (yearsPanel.find(".datepicker_year_item__:contains('" + StringUtils.lpad(String(yearStr), 4, "0") + "')").length === 0) {
            _Datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), yearStr, -4, true);
          }
          yearsPanel.find(".datepicker_year_item__:contains('" + StringUtils.lpad(String(yearStr), 4, "0") + "')").trigger("click");
        } else if (opts.yearsPanelPosition === "top") {
          yearPrevBtnEle.trigger("click.datepicker", [true]);
        }
        prevMonth = 12;
      }
      topMonthItem.val(prevMonth);
      monthsPanel.find(".datepicker_month_item__:contains(" + prevMonth + "):eq(0)").trigger("click.datepicker");
    });
    topMonthItem.addClass("datepicker_month_item__ datepicker_month_selected__").on("change.datepicker", function() {
      monthsPanel.find(".datepicker_month_item__:contains(" + jQuery(this).val() + "):eq(0)").trigger("click.datepicker");
    }).appendTo(topMonthsPanel);
    const nextMonthBtn = jQuery('<div class="datepicker_month_paging__"><a href="#" class="datepicker_month_next__" title="' + NC.message.get(opts.message, "next") + '"><span>&gt;</span></a></div>').appendTo(topMonthsPanel).find("> .datepicker_month_next__").on("click.datepicker", function(e) {
      e.preventDefault();
      let nextMonth = String(parseInt(topMonthItem.val()) + 1);
      if (nextMonth > 12) {
        const yearNextBtnEle = yearsPanel.find(".datepicker_year_next__");
        if (opts.yearsPanelPosition === "left") {
          const yearStr = String(Number(yearsPanel.find(".datepicker_year_selected__").text()) + 1);
          yearsPanel.find(".datepicker_year_item__").removeClass("datepicker_year_selected__");
          if (yearsPanel.find(".datepicker_year_item__:contains('" + StringUtils.lpad(String(yearStr), 4, "0") + "')").length === 0) {
            _Datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), yearStr, 0, true);
          }
          yearsPanel.find(".datepicker_year_item__:contains('" + StringUtils.lpad(String(yearStr), 4, "0") + "')").trigger("click");
        } else if (opts.yearsPanelPosition === "top") {
          yearNextBtnEle.trigger("click.datepicker", [true]);
        }
        nextMonth = 1;
      }
      topMonthItem.val(nextMonth);
      monthsPanel.find(".datepicker_month_item__:contains(" + nextMonth + "):eq(0)").trigger("click.datepicker");
    });
    if (opts.yearsPanelPosition === "left" && opts.monthsPanelPosition === "top") {
      opts.contents.prepend(topMonthsPanel);
    } else {
      opts.contents.append(topMonthsPanel);
    }
    if (opts.scrollMonthChange) {
      opts.contents.on("mousewheel DOMMouseScroll", function(e) {
        e.preventDefault();
        if (e.originalEvent.wheelDelta > 0) {
          nextMonthBtn.trigger("click.datepicker");
        } else {
          prevMonthBtn.trigger("click.datepicker");
        }
      });
    }
    if (opts.touchMonthChange) {
      let startX;
      let lastX;
      opts.contents.on("touchstart", function(e) {
        startX = e.originalEvent.touches[0].pageX;
      }).on("touchmove", function(e) {
        e.preventDefault();
        lastX = e.originalEvent.touches[0].pageX;
      }).on("touchend", function(e) {
        const deltaX = startX - lastX;
        if (Math.abs(deltaX) > 30) {
          if (deltaX < 0) {
            nextMonthBtn.trigger("click.datepicker");
          } else {
            prevMonthBtn.trigger("click.datepicker");
          }
        }
        startX = void 0;
        lastX = void 0;
      });
    }
  }
  const monthItem = jQuery("<div></div>");
  monthsPanel.append(monthItem.clone().addClass("datepicker_month_title__").text(NC.message.get(opts.message, "month")));
  for (let i = 1; i <= 12; i++) {
    monthsPanel.append(monthItem.clone(true).addClass("datepicker_month_item__").text(String(i)));
    if (monthsPanel.find(".datepicker_month_selected__").length === 0) {
      monthsPanel.find(".datepicker_month_item__:contains(" + String(parseInt(d.formatDate("m"))) + "):eq(0)").addClass("datepicker_month_selected__");
    }
  }
  opts.contents.append(monthsPanel);
  monthsPanel.on("click.datepicker", ".datepicker_month_item__", function(e, ke) {
    e.preventDefault();
    const selectedMonthItemEle = monthsPanel.find(".datepicker_month_item__.datepicker_month_selected__").removeClass("datepicker_month_selected__");
    jQuery(this).addClass("datepicker_month_selected__");
    const selYearStr = yearsPanel.find(".datepicker_year_selected__")[opts.yearsPanelPosition === "left" ? "text" : "val"]();
    const selMonthStr = jQuery(this).text();
    if (selMonthStr !== selectedMonthItemEle.text()) {
      if (opts.monthChangeInput) {
        let dateVal = opts.context.val().replace(/\D/g, "");
        if (dateVal.length >= 4) {
          let selDate;
          let dateFormat2;
          if (dateVal.length === 4) {
            dateFormat2 = "Ym";
            dateVal = dateVal + StringUtils.lpad(selMonthStr, 2, "0");
          } else if (dateVal.length === 6) {
            dateFormat2 = Context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");
          } else if (dateVal.length === 8) {
            dateFormat2 = Context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");
          }
          if (dateFormat2 !== void 0) {
            selDate = DateUtils.strToDate(dateVal, dateFormat2);
            let tempFormat = "";
            jQuery(dateFormat2.split("")).each(function(i, formatChar) {
              tempFormat += formatChar + "-";
            });
            const endDateCls = DateUtils.strToDate(StringUtils.lpad(selDate.obj.formatDate("Y"), 4, "0") + StringUtils.lpad(String(Number(selMonthStr) + 1), 2, "0") + "00", "Ymd");
            const endDate = endDateCls.obj.getDate();
            dateVal = selDate.obj.formatDate(tempFormat).replace(selDate.obj.formatDate("Y"), StringUtils.lpad(selDate.obj.formatDate("Y"), 4, "0")).replace(selDate.obj.formatDate("m") + "-", StringUtils.lpad(selMonthStr, 2, "0") + "-");
            if (Number(selDate.obj.formatDate("d")) > endDate) {
              dateVal = dateVal.replace(selDate.obj.formatDate("d") + "-", StringUtils.lpad(endDate, 2, "0") + "-");
            } else if (Number(opts.lastSelectedDay) === endDate) {
              dateVal = dateVal.replace(selDate.obj.formatDate("d") + "-", StringUtils.lpad(opts.lastSelectedDay, 2, "0") + "-");
            }
            dateVal = dateVal.replace(/-/g, "");
            opts.context.val(dateVal);
          }
          if (!_Datepicker.checkMinMaxDate.call(self)) {
            return false;
          }
        }
      }
      if (opts.onChangeMonth !== null) {
        opts.onChangeMonth.call(self, opts.context, selMonthStr, selYearStr, e);
      }
      opts.context.trigger("onChangeMonth", [opts.context, selMonthStr, selYearStr, e]);
    }
    let dateFormat;
    if (opts.monthonly) {
      const selDate = DateUtils.strToDate(StringUtils.lpad(selYearStr, 4, "0") + StringUtils.lpad(jQuery(this).text(), 2, "0"), "Ym");
      selDate.format = Context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");
      let onSelectContinue;
      if (opts.onSelect !== null) {
        onSelectContinue = opts.onSelect.call(self, opts.context, selDate, opts.monthonly);
      }
      if (onSelectContinue === void 0 || onSelectContinue === true) {
        dateFormat = selDate.format.replace(/[^Y|^m|^d]/g, "");
        const yearVal = selDate.obj.formatDate("Y");
        let dateVal = selDate.obj.formatDate(dateFormat);
        if (yearVal.length === 3) {
          let tempFormat = "";
          jQuery(dateFormat.split("")).each(function(i, formatChar) {
            tempFormat += formatChar + "-";
          });
          dateVal = selDate.obj.formatDate(tempFormat).replace(yearVal, "0" + yearVal).replace(/-/g, "");
        }
        opts.context.val(dateVal);
      }
      opts.context.trigger("onSelect", [opts.context, selDate, opts.monthonly]);
      self.hide(ke);
    } else {
      daysPanel.find(".datepicker_day_selected__").text();
      daysPanel.empty();
      const endDateCls = DateUtils.strToDate(StringUtils.lpad(selYearStr, 4, "0") + StringUtils.lpad(String(parseInt(jQuery(this).text()) + 1), 2, "0") + "00", "Ymd");
      const endDate = endDateCls.obj.getDate();
      opts.gEndDate = endDate;
      if (format3 !== "Ymd") {
        opts.gEndDate = 31;
      }
      endDateCls.obj.setDate(1);
      const startDay = endDateCls.obj.getDay();
      let j;
      for (j = 0; j < days.length; j++) {
        daysPanel.append(dayItem.clone().addClass("datepicker_day_title__").text(days[j]));
      }
      const prevEndDateCls = DateUtils.strToDate(StringUtils.lpad(selYearStr, 4, "0") + StringUtils.lpad(jQuery(this).text(), 2, "0") + "00", "Ymd");
      const prevEndDate = prevEndDateCls.obj.getDate();
      let day;
      let dayItemT;
      for (j = 1 - startDay; j <= 42 - startDay; j++) {
        day = String(j);
        dayItemT = dayItem.clone(true);
        if (j <= 0) {
          dayItemT.addClass("datepicker_prev_day_item__");
          day = String(prevEndDate + j);
          dayItemT.data("year", prevEndDateCls.obj.getFullYear()).data("month", prevEndDateCls.obj.getMonth() + 1).data("day", day);
        } else if (j > endDate) {
          dayItemT.addClass("datepicker_next_day_item__");
          day = String(j - endDate);
          dayItemT.data("year", endDateCls.obj.getMonth() + 1 === 12 ? endDateCls.obj.getFullYear() + 1 : endDateCls.obj.getFullYear()).data("month", endDateCls.obj.getMonth() + 2 === 13 ? 1 : endDateCls.obj.getMonth() + 2).data("day", day);
        } else {
          dayItemT.addClass("datepicker_day_item__");
          dayItemT.data("year", endDateCls.obj.getFullYear()).data("month", endDateCls.obj.getMonth() + 1).data("day", day);
        }
        const date = StringUtils.lpad(String(dayItemT.data("year")), 4, "0") + StringUtils.lpad(String(dayItemT.data("month")), 2, "0") + StringUtils.lpad(String(dayItemT.data("day")), 2, "0");
        if (opts.minDate && Number(date) < Number(opts.minDate)) {
          dayItemT.addClass("datepicker_min_date__");
          dayItemT.tpBind("click", EventUtils.disable);
        } else if (opts.maxDate && Number(date) > Number(opts.maxDate)) {
          dayItemT.addClass("datepicker_max_date__");
          dayItemT.tpBind("click", EventUtils.disable);
        }
        const repeatDate = date.substring(4, 8);
        const holidayValues = [];
        if (opts.holiday.repeat && opts.holiday.repeat[repeatDate]) {
          const repeatValue = opts.holiday.repeat[repeatDate];
          if (type(repeatValue) === "array") {
            holidayValues.push(repeatValue.join(", "));
          } else {
            holidayValues.push(repeatValue);
          }
        }
        if (opts.holiday.once && opts.holiday.once[date]) {
          const onceValue = opts.holiday.once[date];
          if (type(onceValue) === "array") {
            holidayValues.push(onceValue.join(", "));
          } else {
            holidayValues.push(onceValue);
          }
        }
        if (!NC.isEmptyObject(holidayValues)) {
          dayItemT.addClass("datepicker_holiday__").attr("title", holidayValues.join(", "));
        }
        daysPanel.append(dayItemT.text(day));
      }
      daysPanel.find(".datepicker_prev_day_item__, .datepicker_day_item__, .datepicker_next_day_item__").each(function(i, ele) {
        setTimeout(function() {
          jQuery(ele).addClass("visible__");
        }, i * 10);
      });
      const dateVal = opts.context.val().replace(/\D/g, "");
      if (!StringUtils.isEmpty(dateVal) && dateVal.length === 8) {
        const selDate = DateUtils.strToDate(dateVal, dateFormat = Context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, ""));
        daysPanel.find(".datepicker_day_item__:contains(" + String(Number(selDate.obj.formatDate("d"))) + "):eq(0)").addClass("datepicker_day_selected__");
        if (!opts.monthChangeInput && Number(opts.lastSelectedDay) > endDate) {
          daysPanel.find(".datepicker_day_item__:contains(" + String(endDate) + "):eq(0)").addClass("datepicker_day_selected__");
        }
      } else {
        daysPanel.find(".datepicker_day_item__:contains(" + String(Number(d.formatDate("d"))) + "):eq(0)").addClass("datepicker_day_selected__");
      }
    }
  });
  if (!opts.monthonly) {
    opts.contents.append(daysPanel);
    daysPanel.on("click.datepicker", ".datepicker_day_item__, .datepicker_prev_day_item__, .datepicker_next_day_item__", function(e, ke) {
      e.preventDefault();
      const thisEle = jQuery(this);
      daysPanel.find(".datepicker_prev_day_item__.datepicker_day_selected__, .datepicker_day_item__.datepicker_day_selected__, .datepicker_next_day_item__.datepicker_day_selected__").removeClass("datepicker_day_selected__");
      thisEle.addClass("datepicker_day_selected__");
      const selDate = DateUtils.strToDate(StringUtils.lpad(String(thisEle.data("year")), 4, "0") + StringUtils.lpad(String(thisEle.data("month")), 2, "0") + StringUtils.lpad(String(thisEle.data("day")), 2, "0"), "Ymd");
      opts.lastSelectedDay = thisEle.text();
      selDate.format = Context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");
      let onSelectContinue;
      if (opts.onSelect !== null) {
        onSelectContinue = opts.onSelect.call(self, opts.context, selDate, opts.monthonly);
      }
      if (onSelectContinue === void 0 || onSelectContinue === true) {
        let dateFormat = selDate.format.replace(/[^Y|^m|^d]/g, "");
        const yearVal = selDate.obj.formatDate("Y");
        let dateVal = selDate.obj.formatDate(dateFormat);
        if (yearVal.length === 3) {
          let tempFormat = "";
          jQuery(dateFormat.split("")).each(function(i, formatChar) {
            tempFormat += formatChar + "-";
          });
          dateVal = selDate.obj.formatDate(tempFormat).replace(yearVal, "0" + yearVal).replace(/-/g, "");
        }
        opts.context.val(dateVal);
      }
      opts.context.trigger("onSelect", [opts.context, selDate, opts.monthonly]);
      self.hide(ke);
    });
  }
  const contextParentWrapEle = opts.context.closest("label,span");
  if (contextParentWrapEle.length > 0) {
    opts.contextWrapper = contextParentWrapEle.after(opts.contents);
  } else {
    opts.context.after(opts.contents);
  }
  return opts.contents;
});
__publicField(_Datepicker, "yearPaging", function(yearItems, currYear, addCnt, absolute) {
  yearItems.removeClass("datepicker_curr_year__");
  let thisEle;
  let yearNum;
  yearItems.each(function(i) {
    thisEle = jQuery(this);
    if (absolute !== void 0 && absolute === true) {
      yearNum = parseInt(currYear) + i;
    } else {
      yearNum = parseInt(thisEle.text());
    }
    if (yearNum <= 100 - addCnt) {
      thisEle.text(StringUtils.lpad(String(100 + i), 4, "0"));
    } else {
      thisEle.text(StringUtils.lpad(String(yearNum + addCnt), 4, "0"));
    }
    if (thisEle.text() === String(currYear)) {
      thisEle.addClass("datepicker_curr_year__");
    }
  });
});
__publicField(_Datepicker, "selectItems", function(opts, value, format3, yearsPanel, monthsPanel, daysPanel) {
  if (value.length > 2 && value.length % 2 !== 0) {
    value = (/* @__PURE__ */ new Date()).formatDate(format3);
  }
  const dateStrArr = DateUtils.strToDateStrArr(value, format3);
  const dateStrStrArr = DateUtils.strToDateStrArr(value, format3, true);
  if (!isNaN(dateStrStrArr[0]) && dateStrStrArr[0].length === 4) {
    if (opts.yearsPanelPosition === "left") {
      yearsPanel.find(".datepicker_year_item__").removeClass("datepicker_year_selected__");
      _Datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), dateStrArr[0], -2, true);
      yearsPanel.find(".datepicker_year_item__:contains('" + StringUtils.lpad(String(dateStrArr[0]), 4, "0") + "')").trigger("click");
    } else if (opts.yearsPanelPosition === "top") {
      const yearItem = yearsPanel.find(".datepicker_year_item__");
      if (yearItem.val() !== StringUtils.lpad(String(dateStrArr[0]), 4, "0")) {
        yearItem.val(StringUtils.lpad(String(dateStrArr[0]), 4, "0"));
        if (StringUtils.isEmpty(yearItem.val())) {
          yearItem.empty();
          let startYear = dateStrArr[0] - opts.minYear;
          let endYear = dateStrArr[0] + opts.maxYear;
          if (startYear < 100) {
            startYear = 100;
            endYear = startYear + opts.maxYear;
          }
          for (let i = startYear; i <= endYear; i++) {
            let selected = "";
            if (i === dateStrArr[0]) {
              opts.currYear = dateStrArr[0];
              selected = 'selected="selected"';
            }
            yearItem.append('<option value="' + StringUtils.lpad(String(i), 4, "0") + '" ' + selected + ">" + StringUtils.lpad(String(i), 4, "0") + "</option>");
          }
        }
        if (!StringUtils.isEmpty(opts.context.val())) {
          yearItem.trigger("change.datepicker");
        }
      }
    }
  }
  if (!isNaN(dateStrStrArr[1]) && dateStrStrArr[1].length === 2) {
    monthsPanel.find(".datepicker_month_item__").removeClass("datepicker_month_selected__");
    if (!opts.monthonly) {
      monthsPanel.find(".datepicker_month_item__:contains(" + String(dateStrArr[1]) + "):eq(0)").trigger("click.datepicker");
    } else {
      monthsPanel.find(".datepicker_month_item__:contains(" + String(dateStrArr[1]) + "):eq(0)").addClass("datepicker_month_selected__");
    }
    if (opts.monthsPanelPosition === "top") {
      opts.contents.find(".datepicker_top_months_panel__ .datepicker_month_item__").val(String(dateStrArr[1]));
    }
  }
  if (!isNaN(dateStrStrArr[2]) && dateStrStrArr[2].length === 2) {
    daysPanel.find(".datepicker_prev_day_item__, .datepicker_day_item__, .datepicker_next_day_item__").removeClass("datepicker_day_selected__");
    daysPanel.find(".datepicker_day_item__:contains(" + String(dateStrArr[2]) + "):eq(0)").addClass("datepicker_day_selected__");
  }
});
var Datepicker = _Datepicker;

// src/ui/components/select/select.js
var _Select = class _Select {
  constructor(data, opts) {
    this.options = {
      data: type(data) === "array" ? jQuery(data) : data,
      context: null,
      key: null,
      val: null,
      append: true,
      direction: "h",
      // direction : h(orizontal), v(ertical)
      type: 0,
      // type : 1: select, 2: select[multiple='multiple'], 3: radio, 4: checkbox
      template: null
    };
    try {
      jQuery.extend(this.options, Context.attr("ui").select);
    } catch (e) {
      throw error("Select", e);
    }
    jQuery.extend(this.options, ElementUtils.toOpts(this.options.context));
    if (isPlainObject(opts)) {
      jQuery.extend(this.options, opts);
      if (type(this.options.data) === "array") {
        this.options.data = jQuery(opts.data);
      }
      this.options.context = jQuery(opts.context);
    } else {
      this.options.context = jQuery(opts);
    }
    this.options.template = this.options.context;
    _Select.wrapEle.call(this);
    this.options.context.addClass("select__");
    this.options.context.instance("select", this);
    return this;
  }
  data(selFlag) {
    const opts = this.options;
    if (selFlag !== void 0 && selFlag === true) {
      const selectEles = opts.type === 1 || opts.type === 2 ? opts.context.find("option") : opts.context.closest(".select_input_container__").children("label");
      const defSelCnt = selectEles.filter(".select_default__").length;
      let idxs = this.index();
      if (type(idxs) !== "array") {
        idxs = [idxs];
      }
      return jQuery(idxs).map(function() {
        if (this - defSelCnt > -1) {
          return opts.data.get(this - defSelCnt);
        }
      }).get();
    } else if (selFlag !== void 0 && selFlag === false) {
      return opts.data;
    } else {
      return opts.data.get();
    }
  }
  context(sel) {
    return sel !== void 0 ? this.options.context.find(sel) : this.options.context;
  }
  bind(data) {
    const opts = this.options;
    if (data != null) {
      opts.data = type(data) === "array" ? jQuery(data) : data;
    }
    if (opts.type === 1 || opts.type === 2) {
      const defaultSelectEle = opts.template.find(".select_default__").clone(true);
      opts.context.addClass("select_template__").empty();
      if (opts.append) {
        opts.context.append(defaultSelectEle);
      }
      opts.data.each(function(i, rowData) {
        opts.context.append("<option value='" + (rowData[opts.val] === null ? "" : rowData[opts.val]) + "'>" + rowData[opts.key] + "</option>");
      });
    } else if (opts.type === 3 || opts.type === 4) {
      if (opts.context.filter(".select_template__").length === 0) {
        const id = opts.context.attr("id");
        let container = jQuery('<form class="select_input_container__" style="display: inline;" />');
        if (opts.direction === "h") {
          container.addClass("select_input_horizontal__");
        } else if (opts.direction === "v") {
          container.addClass("select_input_vertical__");
        }
        let labelEle;
        let labelTextEle;
        opts.data.each(function(i, rowData) {
          labelEle = jQuery('<label class="select_input_label__ ' + id + "_" + String(i) + '__"></label>');
          labelTextEle = jQuery("<span>" + rowData[opts.key] + "</span>");
          if (i === 0) {
            opts.template.attr("name", id).attr("value", rowData[opts.val]).addClass("select_input__ select_template__").wrap(labelEle).parent().append(labelTextEle).wrap(container);
            container = opts.template.closest(".select_input_container__");
          } else {
            labelEle.append(opts.template.clone(true).attr("name", id).attr("value", rowData[opts.val]).removeAttr("id").removeClass("select_template__"));
            labelEle.append(labelTextEle);
            container.append(labelEle);
          }
        });
        labelEle = void 0;
        labelTextEle = void 0;
      }
    }
    return this;
  }
  index(idx) {
    const opts = this.options;
    const selectSiblingEles = opts.type === 1 || opts.type === 2 ? opts.context.find("option") : opts.context.closest(".select_input_container__").children("label");
    const selectEles = opts.type === 1 || opts.type === 2 ? opts.context : selectSiblingEles.find(":radio, :checkbox");
    if (idx === void 0) {
      const rslt = selectEles.vals();
      const spltSepa = Context.attr("core").spltSepa;
      const rsltStr = spltSepa + (type(rslt) === "array" ? rslt.join(spltSepa) : String(rslt)) + spltSepa;
      const rsltArr = [];
      (opts.type === 1 || opts.type === 2 ? selectSiblingEles : selectEles).each(function(i) {
        if (rsltStr.indexOf(spltSepa + this.value + spltSepa) > -1) {
          rsltArr.push(i);
        }
      });
      return rsltArr.length > 0 ? rsltArr.length === 1 ? rsltArr[0] : rsltArr : -1;
    }
    const vals = [];
    jQuery(type(idx) === "number" ? [idx] : idx).each(function() {
      vals.push((opts.type === 1 || opts.type === 2 ? selectSiblingEles : selectEles).get(this).value);
    });
    selectEles.vals(vals);
    return this;
  }
  val(val) {
    const opts = this.options;
    if (!NC.isEmptyObject(opts.data)) {
      const rtnVal = jQuery(opts.type === 3 || opts.type === 4 ? this.options.context.closest(".select_input_container__").find(":input") : this.options.context).vals(val);
      if (val === void 0) {
        return rtnVal;
      }
    } else {
      warn("[Select.prototype.val]There is no data bound to the Select component.");
    }
    return this;
  }
  remove(val) {
    const opts = this.options;
    if (val !== void 0) {
      const selectEles = opts.type === 1 || opts.type === 2 ? opts.context.find("option") : opts.context.closest(".select_input_container__").children("label");
      const selOptEle = opts.type === 1 || opts.type === 2 ? selectEles.filter("[value='" + val + "']") : selectEles.find("input[value='" + val + "']").parent("label");
      const idx = selOptEle.index();
      const defSelCnt = selectEles.filter(".select_default__").length;
      selOptEle.remove();
      if (idx - defSelCnt > -1) {
        opts.data.splice(idx - defSelCnt, 1);
      }
    }
    return this;
  }
  reset(selFlag) {
    const opts = this.options;
    if (opts.type === 1 || opts.type === 2) {
      if (selFlag !== void 0 && selFlag === true) {
        opts.context.get(0).selectedIndex = 0;
      } else {
        opts.context.val(opts.context.prop("defaultSelected"));
      }
    } else if (opts.type === 3 || opts.type === 4) {
      opts.context.prop("checked", false);
    }
    return this;
  }
};
__publicField(_Select, "wrapEle", function() {
  const opts = this.options;
  if (opts.context.is("select") && opts.context.attr("multiple") !== "multiple") {
    this.options.context.find("option").addClass("select_default__");
    opts.type = 1;
  } else if (opts.context.is("select") && opts.context.attr("multiple") === "multiple") {
    this.options.context.find("option").addClass("select_default__");
    opts.type = 2;
  } else if (opts.context.is("input:radio")) {
    opts.type = 3;
  } else if (opts.context.is("input:checkbox")) {
    opts.type = 4;
  }
});
var Select = _Select;

// src/ui/components/pagination/pagination.js
var _Pagination = class _Pagination {
  constructor(data, opts) {
    this.options = {
      data: type(data) === "array" ? jQuery(data) : data,
      context: null,
      totalCount: 0,
      countPerPage: 10,
      countPerPageSet: 10,
      pageNo: 1,
      onChange: null,
      blockOnChangeWhenBind: false,
      currPageNavInfo: null
    };
    try {
      jQuery.extend(this.options, Context.attr("ui").pagination);
    } catch (e) {
      throw error("Pagination", e);
    }
    if (this.options.data.length > 0) {
      this.options.totalCount = this.options.data.length;
    }
    if (isPlainObject(opts)) {
      UIUtils.wrapHandler(opts, "pagination", "onChange");
      opts.data = type(opts.data) === "array" ? jQuery(opts.data) : opts.data;
      jQuery.extend(this.options, opts);
      if (type(this.options.context) === "string") {
        this.options.context = jQuery(this.options.context);
      }
    } else {
      this.options.context = jQuery(opts);
    }
    this.linkEles = _Pagination.wrapEle.call(this);
    this.options.context.addClass("pagination__");
    this.options.context.instance("pagination", this);
    return this;
  }
  data(selFlag) {
    if (selFlag === void 0) {
      return this.options.data.get();
    } else if (selFlag === false) {
      return this.options.data;
    }
  }
  context(sel) {
    return sel !== void 0 ? this.options.context.find(sel) : this.options.context;
  }
  bind(data, totalCount) {
    const opts = this.options;
    const self = this;
    if (arguments.length > 0 && type(arguments[0]) === "number") {
      opts.totalCount = arguments[0];
    } else if (arguments.length > 0 && type(arguments[0]) === "array") {
      opts.data = type(data) === "array" ? jQuery(data) : data;
      if (totalCount !== void 0) {
        opts.totalCount = totalCount;
      } else {
        if (data != null) {
          opts.totalCount = data.length;
        }
      }
    }
    const linkEles = this.linkEles;
    opts.currPageNavInfo = _Pagination.changePageSet(linkEles, opts);
    if (linkEles.first !== void 0) {
      linkEles.first.off("click.pagination");
      linkEles.first.on("click.pagination", function(e) {
        e.preventDefault();
        if (1 !== opts.pageNo) {
          opts.pageNo = 1;
          opts.currPageNavInfo = _Pagination.changePageSet(linkEles, opts);
          linkEles.body.find("li a:first").trigger("click.pagination");
        }
      });
    }
    linkEles.prev.off("click.pagination");
    linkEles.prev.on("click.pagination", function(e) {
      e.preventDefault();
      if (opts.currPageNavInfo.currSelPageSet > 1 && opts.currPageNavInfo.startPage >= opts.currPageNavInfo.currSelPageSet) {
        opts.pageNo = opts.currPageNavInfo.startPage - opts.countPerPageSet;
        opts.currPageNavInfo = _Pagination.changePageSet(linkEles, opts);
        linkEles.body.find("li a:first").trigger("click.pagination");
      }
    });
    linkEles.body.off("click.pagination");
    linkEles.body.on("click.pagination", "li > a", function(e, isFirst) {
      e.preventDefault();
      opts.pageNo = Number(jQuery(this).parent().data("pageno"));
      opts.currPageNavInfo = _Pagination.changePageSet(linkEles, opts, true);
      if (opts.onChange !== null) {
        const selData = [];
        if (opts.data.length > 0 && opts.data.length <= opts.totalCount) {
          for (let i = opts.currPageNavInfo.startRowIndex; i <= opts.currPageNavInfo.endRowIndex; i++) {
            if (opts.data[i] !== void 0) {
              selData.push(opts.data[i]);
            }
          }
        }
        if (opts.blockOnChangeWhenBind === false || opts.blockOnChangeWhenBind === true && isFirst !== true) {
          opts.onChange.call(self, opts.pageNo, jQuery(this), selData, opts.currPageNavInfo);
        }
      }
      linkEles.body.find("li.pagination_active__").removeClass("pagination_active__");
      jQuery(this).parent().addClass("pagination_active__");
    }).find("li a:eq(" + String(opts.pageNo - opts.currPageNavInfo.startPage) + ")").trigger("click.pagination", [true]);
    linkEles.next.off("click.pagination");
    linkEles.next.on("click.pagination", function(e) {
      e.preventDefault();
      if (opts.currPageNavInfo.pageSetCount > opts.currPageNavInfo.currSelPageSet) {
        opts.pageNo = opts.currPageNavInfo.startPage + opts.countPerPageSet;
        opts.currPageNavInfo = _Pagination.changePageSet(linkEles, opts);
        linkEles.body.find("li a:first").trigger("click.pagination");
      }
    });
    if (linkEles.last !== void 0) {
      linkEles.last.off("click.pagination");
      linkEles.last.on("click.pagination", function(e) {
        e.preventDefault();
        if (opts.pageNo !== opts.currPageNavInfo.pageCount) {
          opts.pageNo = opts.currPageNavInfo.pageCount;
          opts.currPageNavInfo = _Pagination.changePageSet(linkEles, opts);
          linkEles.body.find("li a:last").trigger("click.pagination");
        }
      });
    }
    return this;
  }
  totalCount(totalCount) {
    const opts = this.options;
    if (totalCount !== void 0) {
      opts.totalCount = totalCount;
      return this;
    } else {
      return opts.totalCount;
    }
  }
  pageNo(pageNo) {
    const opts = this.options;
    if (pageNo !== void 0) {
      opts.pageNo = pageNo;
      return this;
    } else {
      return opts.pageNo;
    }
  }
  countPerPage(countPerPage) {
    if (countPerPage !== void 0) {
      const opts = this.options;
      opts.countPerPage = countPerPage;
      opts.pageNo = 1;
    } else {
      return this.options.countPerPage;
    }
    return this;
  }
  countPerPageSet(countPerPageSet) {
    if (countPerPageSet !== void 0) {
      const opts = this.options;
      opts.countPerPageSet = countPerPageSet;
      opts.pageNo = 1;
    } else {
      return this.options.countPerPageSet;
    }
    return this;
  }
  currPageNavInfo() {
    return this.options.currPageNavInfo;
  }
};
__publicField(_Pagination, "wrapEle", function() {
  const opts = this.options;
  const linkEles = {};
  const lefter = opts.context.find("ul:eq(0)").addClass("pagination_lefter__");
  linkEles.body = opts.context.find("ul:eq(1)").addClass("pagination_body__");
  linkEles.page = linkEles.body.find("li").addClass("pagination_page__");
  const righter = opts.context.find("ul:eq(2)").addClass("pagination_righter__");
  if (lefter.find("li").length === 2) {
    linkEles.first = lefter.find("li:eq(0)").addClass("pagination_first__ pagination_disable__");
    linkEles.prev = lefter.find("li:eq(1)").addClass("pagination_prev__ pagination_disable__");
  } else if (lefter.length === 1) {
    linkEles.prev = lefter.find("li:eq(0)").addClass("pagination_prev__ pagination_disable__");
  }
  if (righter.find("li").length === 2) {
    linkEles.next = righter.find("li:eq(0)").addClass("pagination_next__ pagination_disable__");
    linkEles.last = righter.find("li:eq(1)").addClass("pagination_last__ pagination_disable__");
  } else if (righter.length === 1) {
    linkEles.next = righter.find("li:eq(0)").addClass("pagination_next__ pagination_disable__");
  }
  opts.currPageNavInfo = _Pagination.changePageSet(linkEles, opts);
  return linkEles;
});
__publicField(_Pagination, "changePageSet", function(linkEles, opts, isRemake) {
  const pageCount = Math.ceil(opts.totalCount / opts.countPerPage);
  const pageSetCount = Math.ceil(pageCount / opts.countPerPageSet);
  let currSelPageSet = Math.ceil(opts.pageNo / opts.countPerPageSet);
  if (currSelPageSet > pageSetCount) {
    currSelPageSet = pageSetCount;
  }
  let startPage = (currSelPageSet - 1) * opts.countPerPageSet + 1;
  let endPage = startPage + opts.countPerPageSet - 1;
  if (startPage < 1) {
    startPage = 1;
  }
  if (endPage > pageCount) {
    endPage = pageCount;
  }
  if (endPage < 1) {
    endPage = 1;
  }
  if (isRemake === void 0 || isRemake === false) {
    let pageClone;
    linkEles.body.empty();
    for (let i = startPage; i <= endPage; i++) {
      pageClone = linkEles.page.clone(true, true);
      pageClone.attr("data-pageno", String(i));
      pageClone.find("a > span").text(String(i));
      linkEles.body.append(pageClone);
    }
  }
  if (currSelPageSet > 0 && currSelPageSet > 1 && startPage >= currSelPageSet) {
    jQuery(linkEles.prev).removeClass("pagination_disable__");
  } else {
    jQuery(linkEles.prev).addClass("pagination_disable__");
  }
  if (linkEles.first !== void 0) {
    if (1 !== opts.pageNo) {
      jQuery(linkEles.first).removeClass("pagination_disable__");
    } else {
      jQuery(linkEles.first).addClass("pagination_disable__");
    }
  }
  if (pageSetCount > currSelPageSet) {
    jQuery(linkEles.next).removeClass("pagination_disable__");
  } else {
    jQuery(linkEles.next).addClass("pagination_disable__");
  }
  if (linkEles.last !== void 0) {
    if (pageCount > 0 && opts.pageNo !== pageCount) {
      jQuery(linkEles.last).removeClass("pagination_disable__");
    } else {
      jQuery(linkEles.last).addClass("pagination_disable__");
    }
  }
  const startRowIndex = (opts.pageNo - 1) * opts.countPerPage;
  let endRowIndex = startRowIndex + opts.countPerPage - 1;
  if (endRowIndex > opts.totalCount - 1) {
    endRowIndex = opts.totalCount - 1;
  }
  return opts.currPageNavInfo = {
    "pageNo": opts.pageNo,
    "countPerPage": opts.countPerPage,
    "countPerPageSet": opts.countPerPageSet,
    "totalCount": opts.totalCount,
    "pageCount": pageCount,
    "pageSetCount": pageSetCount,
    "currSelPageSet": currSelPageSet,
    "startPage": startPage,
    "endPage": endPage,
    "startRowIndex": startRowIndex,
    "startRowNum": startRowIndex + 1,
    "endRowIndex": endRowIndex,
    "endRowNum": endRowIndex + 1
  };
});
var Pagination = _Pagination;

// src/ui/components/list/list.js
var _List = class _List {
  constructor(data, opts) {
    this.options = {
      data: type(data) === "array" ? jQuery(data) : data,
      row: -1,
      // selected row index
      beforeRow: -1,
      // before selected row index
      context: null,
      height: 0,
      validate: true,
      html: false,
      addTop: true,
      addSelect: false,
      vResizable: false,
      windowScrollLock: true,
      select: false,
      unselect: true,
      multiselect: false,
      checkAll: null,
      // selector
      checkAllTarget: null,
      // selector
      checkSingleTarget: null,
      hover: false,
      revert: false,
      createRowDelay: 1,
      scrollPaging: {
        idx: 0,
        size: 100
      },
      fRules: null,
      vRules: null,
      appendScroll: true,
      addScroll: true,
      selectScroll: true,
      checkScroll: true,
      validateScroll: true,
      cache: true,
      tpBind: false,
      rowHandlerBeforeBind: null,
      rowHandler: null,
      onBeforeSelect: null,
      onSelect: null,
      onBind: null
    };
    try {
      jQuery.extend(true, this.options, Context.attr("ui").list);
    } catch (e) {
      throw error("List", e);
    }
    if (isPlainObject(opts)) {
      UIUtils.wrapHandler(opts, "list", "onBeforeSelect");
      UIUtils.wrapHandler(opts, "list", "onSelect");
      UIUtils.wrapHandler(opts, "list", "onBind");
      opts.data = type(opts.data) === "array" ? jQuery(opts.data) : opts.data;
      jQuery.extend(true, this.options, opts);
      this.options.scrollPaging.limit = this.options.scrollPaging.size;
      if (type(this.options.context) === "string") {
        this.options.context = jQuery(this.options.context);
      }
    } else {
      this.options.context = jQuery(opts);
    }
    if (!this.options.addTop) {
      this.options.scrollPaging.size = 0;
      this.options.createRowDelay = 0;
    }
    this.options.scrollPaging.defSize = this.options.scrollPaging.size;
    this.tempRowEle = this.options.context.find("> li").clone(true, true);
    this.options.context.addClass("list__");
    if (this.options.hover) {
      this.options.context.addClass("list_hover__");
    }
    if (this.options.select || this.options.multiselect) {
      Iteration.select.call(this, "list");
    }
    if (this.options.height > 0) {
      _List.createScroll.call(this);
    }
    this.contextEle = this.options.context;
    if (this.options.height > 0) {
      this.contextEle = this.options.context.closest("div.context_wrap__ > .list__");
    }
    if (this.options.checkAll !== null && this.options.checkAllTarget !== null) {
      Iteration.checkAll.call(this, "list");
    } else {
      if (this.options.checkSingleTarget !== null) {
        Iteration.checkSingle.call(this, "list");
      }
    }
    this.options.context.instance("list", this);
    DataSync.instance(this, true);
    return this;
  }
  data(rowStatus) {
    const opts = this.options;
    if (rowStatus === void 0) {
      return opts.data.get();
    } else if (rowStatus === false) {
      return opts.data;
    } else if (rowStatus === "modified") {
      return opts.data.datafilter(function(data) {
        return data.rowStatus !== void 0;
      }).get();
    } else if (rowStatus === "selected") {
      if (opts.select || opts.multiselect) {
        const retData = [];
        const args = Array.prototype.slice.call(arguments, 0);
        const rowEles = this.contextEle.find(">li.form__");
        rowEles.filter(".list_selected__").each(function() {
          jQuery(this);
          if (arguments.length > 1) {
            args[0] = opts.data[rowEles.index(this)];
            retData.push(NC.json.mapFromKeys.apply(NC.json, args));
          } else {
            retData.push(opts.data[rowEles.index(this)]);
          }
        });
        return retData;
      }
    } else if (rowStatus === "checked") {
      const retData = [];
      const args = Array.prototype.slice.call(arguments, 0);
      const rowEles = this.contextEle.find(">li.form__");
      rowEles.find(opts.checkAllTarget || opts.checkSingleTarget).filter(":checked").each(function() {
        const thisEle = jQuery(this);
        if (arguments.length > 1) {
          args[0] = opts.data[rowEles.index(thisEle.closest("li.form__"))];
          retData.push(NC.json.mapFromKeys.apply(NC.json, args));
        } else {
          retData.push(opts.data[rowEles.index(thisEle.closest("li.form__"))]);
        }
      });
      return retData;
    } else {
      if (arguments.length > 1) {
        const args = Array.prototype.slice.call(arguments, 0);
        return opts.data.datafilter(function(data) {
          return data.rowStatus === rowStatus;
        }).map(function() {
          args[0] = this;
          return NC.json.mapFromKeys.apply(NC.json, args);
        }).get();
      } else {
        return opts.data.datafilter(function(data) {
          return data.rowStatus === rowStatus;
        }).get();
      }
    }
  }
  context(sel) {
    return sel !== void 0 ? this.options.context.find(sel) : this.options.context;
  }
  contextBodyTemplate(sel) {
    return sel !== void 0 ? this.tempRowEle.find(sel) : this.tempRowEle;
  }
  select(row, isAppend) {
    const opts = this.options;
    if (!opts.select && !opts.multiselect) {
      warn('[List.select]The "select" or "multiselect" option is disabled. To use this method, set the value of the "select" or "multiselect" option to true.');
      return false;
    }
    if (row === void 0) {
      const rowEles = this.contextEle.find(">li.form__");
      return rowEles.filter(".list_selected__").map(function() {
        return rowEles.index(this);
      }).get();
    } else {
      if (type(row) !== "array") {
        row = [row];
      }
      const self = this;
      let selRowEle;
      if (!isAppend) {
        self.contextEle.find(">li.list_selected__").removeClass("list_selected__");
      }
      jQuery(row).each(function() {
        selRowEle = self.contextEle.find(">li" + (self.options.data.length > 0 ? ".form__" : "") + ":eq(" + String(this) + ")");
        if (selRowEle.hasClass("list_selected__")) {
          selRowEle.removeClass("list_selected__");
        }
        selRowEle.trigger("click.list");
      });
      if (opts.selectScroll) {
        let scrollTop = row[row.length - 1] * selRowEle.outerHeight() - opts.height / 2 + selRowEle.outerHeight() / 2;
        if (scrollTop < 0) {
          scrollTop = 0;
        }
        opts.context.parent(".context_wrap__").stop().animate({ "scrollTop": scrollTop }, 300, "swing");
      }
      return this;
    }
  }
  check(row, isAppend) {
    const opts = this.options;
    if (row === void 0) {
      const rowEles = this.contextEle.find(">li");
      return rowEles.find(opts.checkAllTarget || opts.checkSingleTarget).filter(":checked").map(function() {
        return rowEles.index(jQuery(this).closest("li.form__"));
      }).get();
    } else {
      if (type(row) !== "array") {
        row = [row];
      }
      const self = this;
      let checkboxEle;
      if (!isAppend) {
        self.contextEle.find(">li").find((opts.checkAllTarget || opts.checkSingleTarget) + ":checked").prop("checked", false);
      }
      jQuery(row).each(function() {
        checkboxEle = self.contextEle.find(">li").find(opts.checkAllTarget || opts.checkSingleTarget).eq(this);
        if (checkboxEle.is(":checked")) {
          checkboxEle.prop("checked", false);
        }
        checkboxEle.trigger("click.list");
      });
      if (opts.checkScroll) {
        const selRowEle = checkboxEle.closest("li.form__");
        let scrollTop = row[row.length - 1] * selRowEle.outerHeight() - opts.height / 2 + selRowEle.outerHeight() / 2;
        if (scrollTop < 0) {
          scrollTop = 0;
        }
        opts.context.parent(".context_wrap__").stop().animate({ "scrollTop": scrollTop }, 300, "swing");
      }
      return this;
    }
  }
  /**
   * callType arguments is call type about scrollPaging(internal) or data filter(internal) or data append(external)
   * callType : "append" | "list.bind" | "list.update"
   */
  bind(data, callType) {
    const opts = this.options;
    if (!opts.isBinding) {
      if (opts.data && data && callType === "append") {
        opts.scrollPaging.size = 0;
        opts.scrollPaging.idx = opts.data.length - 1;
        jQuery.merge(opts.data, data);
      } else {
        opts.scrollPaging.size = opts.scrollPaging.defSize;
        if (data) {
          opts.data = type(data) === "array" ? jQuery(data) : data;
        }
      }
      if (opts.checkAll !== null) {
        jQuery(opts.checkAll).prop("checked", false);
      }
      if (opts.data.length > 0 || callType === "append" && data && data.length > 0) {
        opts.context.find(">li").clearQueue().stop();
        if (callType !== "list.bind") {
          if (callType === "append" && data.length > 0) {
            opts.scrollPaging.idx = opts.data.length - data.length;
          } else {
            opts.scrollPaging.idx = 0;
          }
        }
        if (opts.scrollPaging.idx === 0) {
          if (callType === "append" && data.length > 0) {
            opts.context.find(">li.empty__").remove();
          } else {
            opts.context.find(">li").remove();
          }
        }
        const i = opts.scrollPaging.idx;
        let limit;
        if (opts.height === 0 || opts.scrollPaging.size === 0 || callType === "append" && data.length > 0 && data.length <= opts.scrollPaging.size) {
          limit = opts.data.length;
        } else {
          limit = Math.min(opts.scrollPaging.limit, opts.data.length);
        }
        const delay = opts.createRowDelay;
        let lastIdx;
        Iteration.render.call(this, i, limit, delay, lastIdx, callType);
        if (opts.appendScroll && callType === "append") {
          opts.context.parent(".context_wrap__").stop().animate({
            "scrollTop": opts.context.parent(".context_wrap__").prop("scrollHeight")
          }, 300, "swing");
        }
      } else {
        opts.context.find(">li").remove();
        opts.context.append('<li class="empty__">' + NC.message.get(opts.message, "empty") + "</li>");
        if (opts.onBind !== null && callType !== "list.update") {
          opts.onBind.call(this, opts.context, opts.data, true, true);
        }
      }
    } else {
      const self = this;
      const args = arguments;
      opts.context.queue("bind", function() {
        self.bind.apply(self, args);
      });
    }
    return this;
  }
  add(data, row) {
    const opts = this.options;
    if (opts.context.find(">li.empty__").length > 0) {
      opts.context.find(">li").remove();
    }
    const tempRowEleClone = this.tempRowEle.clone(true, true);
    if (NC.isNumeric(data)) {
      row = data;
      data = void 0;
    }
    if (row > opts.data.length || row < 0) {
      row = void 0;
    }
    if (row === void 0) {
      if (opts.addTop) {
        opts.context.prepend(tempRowEleClone);
      } else {
        opts.context.append(tempRowEleClone);
      }
    } else {
      let selRowEle = opts.context.find(">li:eq(" + row + ")");
      let scrollTop;
      if (row === 0) {
        opts.context.prepend(tempRowEleClone);
      } else if (row === opts.context.find(">li").length) {
        selRowEle = opts.context.find(">li:eq(" + (row - 1) + ")");
      } else {
        opts.context.find(">li:eq(" + row + ")").before(tempRowEleClone);
      }
      if (opts.addScroll) {
        scrollTop = row * selRowEle.outerHeight() - opts.height / 2 + selRowEle.outerHeight() / 2;
        if (scrollTop < 0) {
          scrollTop = 0;
        }
        opts.context.parent(".context_wrap__").stop().animate({ "scrollTop": scrollTop }, 300, "swing", function() {
          if (opts.addSelect) {
            jQuery(this).find(">ul>li:eq(" + row + ")").trigger("click.list");
          }
        });
      } else {
        if (opts.addSelect) {
          setTimeout(function() {
            opts.context.parent(".context_wrap__").find(">ul>li:eq(" + row + ")").trigger("click.list");
          }, 0);
        }
      }
    }
    const form = opts.data.form({
      context: tempRowEleClone,
      html: opts.html,
      validate: opts.validate,
      extObj: this,
      extRow: row === void 0 ? opts.addTop ? 0 : opts.data.length : row,
      addTop: opts.addTop,
      revert: opts.revert,
      tpBind: opts.tpBind
    });
    form.add(data, row);
    if (opts.rowHandler !== null) {
      opts.rowHandler.call(this, form.options.extRow, tempRowEleClone, form.data(true)[0]);
    }
    opts.context.find(">li").removeClass("list_selected__");
    if (row === void 0) {
      opts.context.parent(".context_wrap__").stop().animate({
        "scrollTop": opts.addTop ? 0 : opts.context.parent(".context_wrap__").prop("scrollHeight")
      }, 300, "swing", function() {
        if (opts.addSelect) {
          jQuery(this).find("> ul > li:" + (opts.addTop ? "first" : "last")).trigger("click.list");
        }
      });
    }
    return this;
  }
  remove(row) {
    const opts = this.options;
    if (row !== void 0) {
      if (type(row) !== "array") {
        row = [row];
      }
      jQuery(row.sort().reverse()).each(function(i, row2) {
        if (opts.data[this] === void 0) {
          throw error("[List.prototype.remove]Row index is out of range");
        }
        if (opts.data[this].rowStatus === "insert") {
          opts.data.splice(this, 1);
          opts.context.find(">li:eq(" + row2 + ")").remove();
          const rowEleLength = opts.context.find(">li").length;
          const pagingSize = opts.scrollPaging.size;
          const rest = rowEleLength % pagingSize;
          opts.scrollPaging.idx = rowEleLength / pagingSize * pagingSize - pagingSize + rest;
        } else {
          opts.data[this].rowStatus = "delete";
          opts.context.find(">li:eq(" + row2 + ")").addClass("row_data_deleted__");
        }
      });
    }
    DataSync.instance(this).notify();
    return this;
  }
  revert(row) {
    const opts = this.options;
    if (!opts.revert) {
      throw error("[Form.prototype.revert]Can not revert. Form's revert option value is false");
    }
    const self = this;
    if (row !== void 0) {
      if (type(row) !== "array") {
        row = [row];
      }
      jQuery(row).each(function() {
        const i = this;
        const context = opts.context.find(">li:eq(" + String(this) + ")");
        const form = context.instance("form");
        if (opts.rowHandlerBeforeBind !== null) {
          opts.rowHandlerBeforeBind.call(self, i, context, form.options.revertData);
        }
        form.revert();
        if (opts.rowHandler !== null) {
          opts.rowHandler.call(self, i, context, opts.data[i]);
        }
      });
    } else {
      opts.context.find("li").instance("form", function() {
        if (this.options !== void 0 && (this.options.data[0].rowStatus === "update" || this.options.data[0].rowStatus === "insert")) {
          const i = this.options.extRow;
          if (opts.rowHandlerBeforeBind !== null) {
            opts.rowHandlerBeforeBind.call(self, i, this.context(), this.options.revertData);
          }
          this.revert();
          if (opts.rowHandler !== null) {
            opts.rowHandler.call(self, i, this.context(), opts.data[i]);
          }
        }
      });
    }
    return this;
  }
  validate(row) {
    const opts = this.options;
    let valiRslt = true;
    if (row !== void 0) {
      valiRslt = opts.context.find(">li:eq(" + String(row) + ")").instance("form").validate();
    } else {
      let rowStatus;
      opts.context.find(">li").instance("form", function(i) {
        if (this.options !== void 0 && this.options.data.length > 0) {
          rowStatus = this.options.data[0].rowStatus;
          if (this.context(".validate_false__").length > 0 || rowStatus === "update" || rowStatus === "insert") {
            if (!this.validate()) {
              valiRslt = false;
            }
          }
        }
      });
    }
    if (!valiRslt && opts.validateScroll) {
      const valiLastTbody = opts.context.find(".validate_false__:last").closest("li.form__");
      opts.context.parent(".context_wrap__").stop().animate({
        "scrollTop": opts.context.parent(".context_wrap__").scrollTop() + valiLastTbody.position().top - opts.height + valiLastTbody.outerHeight() * 2
      }, 300, "swing");
    }
    return valiRslt;
  }
  val(row, key, val) {
    if (val === void 0) {
      return this.options.data[row][key];
    }
    const inst = this.options.context.find(">.form__:eq(" + String(row) + ")").instance("form");
    if (inst) {
      inst.val(key, val);
    } else {
      if (this.options.data[row]) {
        this.options.data[row][key] = val;
      } else {
        throw error("[List.prototype.val]There is no row data that is " + row + " index");
      }
    }
    return this;
  }
  move(fromRow, toRow) {
    Iteration.move.call(this, fromRow, toRow, "list");
    return this;
  }
  copy(fromRow, toRow) {
    Iteration.copy.call(this, fromRow, toRow, "list");
    return this;
  }
  update(row, key) {
    if (row !== void 0) {
      if (key !== void 0) {
        this.options.context.find(">li:eq(" + String(row) + ")").instance("form").update(0, key);
      } else if (this.options.data[row]._isRevert !== true && this.options.data[row].rowStatus === "insert") {
        if (this.options.data[row].rowStatus === "insert") {
          this.bind(void 0, "list.update");
        } else {
          this.add(this.options.data[row]);
        }
      } else {
        this.options.context.find(">li:eq(" + String(row) + ")").instance("form").update(0);
      }
    } else {
      this.bind(void 0, "list.update");
    }
    return this;
  }
};
__publicField(_List, "createScroll", function() {
  const opts = this.options;
  opts.context.css({
    "margin": "0"
  });
  const contextWrapEle = opts.context.wrap('<div class="context_wrap__"/>').parent().css({
    "height": String(opts.height) + "px",
    "overflow-y": "scroll",
    "margin-left": "-1px"
  });
  if (BrowserUtils.is("ie")) {
    contextWrapEle.css("overflow-x", "hidden");
  }
  if (opts.windowScrollLock) {
    EventUtils.windowScrollLock(contextWrapEle);
  }
  const self = this;
  const defSPSize = opts.scrollPaging.limit;
  let rowEleLength;
  Scroll.paging.call(self, contextWrapEle, defSPSize, rowEleLength, "> li", "list.bind");
  if (opts.vResizable) {
    _List.vResize.call(this, contextWrapEle);
  }
});
__publicField(_List, "vResize", function(contextWrapEle) {
  const vResizable = jQuery('<div class="v_resizable__"></div>').css({
    "text-align": "center",
    "cursor": "n-resize",
    "margin-bottom": contextWrapEle.css("margin-bottom")
  });
  contextWrapEle.css("margin-bottom", "0");
  let currHeight, contextWrapOffset;
  const eventNameSpace = ".list.vResize";
  Draggable.events.call(vResizable, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) {
    contextWrapOffset = contextWrapEle.offset();
  }, function(e, tabContainerEle_, pageX, pageY) {
    currHeight = pageY - contextWrapOffset.top + "px";
    contextWrapEle.css({
      "height": currHeight,
      "max-height": currHeight
    });
  });
  contextWrapEle.after(vResizable);
});
var List = _List;

// src/ui/components/grid/grid.js
var _Grid = class _Grid {
  constructor(data, opts) {
    this.options = {
      data: type(data) === "array" ? jQuery(data) : data,
      row: -1,
      // selected row index
      beforeRow: -1,
      // before selected row index
      context: null,
      height: 0,
      fixedcol: 0,
      more: false,
      // true or column names array
      validate: true,
      html: false,
      addTop: true,
      addSelect: false,
      filter: false,
      resizable: false,
      vResizable: false,
      sortable: false,
      windowScrollLock: true,
      select: false,
      unselect: true,
      multiselect: false,
      checkAll: null,
      // selector
      checkAllTarget: null,
      // selector
      checkSingleTarget: null,
      // selector
      hover: false,
      revert: false,
      createRowDelay: 1,
      scrollPaging: {
        idx: 0,
        size: 100
      },
      fRules: null,
      vRules: null,
      appendScroll: true,
      addScroll: true,
      selectScroll: true,
      checkScroll: true,
      validateScroll: true,
      cache: true,
      tpBind: false,
      pastiable: false,
      rowHandlerBeforeBind: null,
      rowHandler: null,
      onBeforeSelect: null,
      onSelect: null,
      onBind: null,
      misc: {
        resizableCorrectionWidth: 0,
        resizableLastCellCorrectionWidth: 0,
        resizeBarCorrectionLeft: 0,
        resizeBarCorrectionHeight: 0,
        fixedcolHeadMarginTop: 0,
        fixedcolHeadMarginLeft: 0,
        fixedcolHeadHeight: 0,
        fixedcolBodyMarginTop: 0,
        fixedcolBodyMarginLeft: 0,
        fixedcolBodyBindHeight: 0,
        fixedcolBodyAddHeight: 1,
        fixedcolRootContainer: null
        // for mobile browser, input selector string
      },
      currMoveToRow: -1
    };
    try {
      jQuery.extend(true, this.options, Context.attr("ui").grid);
    } catch (e) {
      throw error("Grid", e);
    }
    if (isPlainObject(opts)) {
      UIUtils.wrapHandler(opts, "grid", "onBeforeSelect");
      UIUtils.wrapHandler(opts, "grid", "onSelect");
      UIUtils.wrapHandler(opts, "grid", "onBind");
      opts.data = type(opts.data) === "array" ? jQuery(opts.data) : opts.data;
      jQuery.extend(true, this.options, opts);
      this.options.scrollPaging.limit = this.options.scrollPaging.size;
      if (type(this.options.context) === "string") {
        this.options.context = jQuery(this.options.context);
      }
    } else {
      this.options.context = jQuery(opts);
    }
    if (!this.options.addTop) {
      this.options.scrollPaging.size = 0;
      this.options.createRowDelay = 0;
    }
    this.options.scrollPaging.defSize = this.options.scrollPaging.size;
    this.tempRowEle = this.options.context.find("> tbody").clone(true, true);
    this.options.context.addClass("grid__");
    if (this.options.hover) {
      this.options.context.addClass("grid_hover__");
    }
    if (this.options.select || this.options.multiselect) {
      Iteration.select.call(this, "grid");
    }
    if (this.options.resizable) {
      _Grid.removeColgroup.call(this);
    }
    if (this.options.more) {
      _Grid.more.call(this);
    }
    if (this.options.height > 0) {
      _Grid.fixHeader.call(this);
    }
    this.tableMap = _Grid.tableMap.call(this);
    _Grid.setTheadCellInfo.call(this);
    if (this.options.height > 0) {
      this.thead = this.options.context.closest(".grid_wrap__").find(">.thead_wrap__>table>thead");
    } else {
      this.thead = this.options.context.find(">thead");
    }
    if (this.options.height === 0) {
      _Grid.fixColumn.call(this);
    }
    this.contextEle = this.options.context;
    if (this.options.height > 0) {
      this.contextEle = this.options.context.closest("div.tbody_wrap__ > .grid__");
    }
    this.rowSpanIds = this.thead.find("th:regexp(data:rowspan,true)").map(function() {
      return jQuery(this).data("id");
    });
    if (this.options.checkAll !== null && this.options.checkAllTarget !== null) {
      Iteration.checkAll.call(this, "grid");
    } else {
      if (this.options.checkSingleTarget !== null) {
        Iteration.checkSingle.call(this, "grid");
      }
    }
    if (this.options.sortable) {
      _Grid.sort.call(this);
    }
    if (this.options.resizable) {
      _Grid.resize.call(this);
    }
    if (this.options.filter || this.thead.find("> tr th[data-filter='true']").length > 0) {
      if (this.options.filter) {
        this.thead.find("> tr th").attr("data-filter", "true");
      }
      _Grid.dataFilter.call(this);
    }
    if (this.options.pastiable) {
      _Grid.paste.call(this);
    }
    this.options.context.instance("grid", this);
    DataSync.instance(this, true);
    return this;
  }
  data(rowStatus) {
    const opts = this.options;
    if (rowStatus === void 0) {
      return opts.data.get();
    } else if (rowStatus === false) {
      return opts.data;
    } else if (rowStatus === "modified") {
      return opts.data.datafilter(function(data) {
        return data.rowStatus !== void 0;
      }).get();
    } else if (rowStatus === "selected") {
      if (opts.select || opts.multiselect) {
        const retData = [];
        const args = Array.prototype.slice.call(arguments, 0);
        const rowEles = this.contextEle.find(">tbody.form__");
        rowEles.filter(".grid_selected__").each(function() {
          if (arguments.length > 1) {
            args[0] = opts.data[rowEles.index(this)];
            retData.push(NC.json.mapFromKeys.apply(NC.json, args));
          } else {
            retData.push(opts.data[rowEles.index(this)]);
          }
        });
        return retData;
      }
    } else if (rowStatus === "checked") {
      const retData = [];
      const args = Array.prototype.slice.call(arguments, 0);
      const rowEles = this.contextEle.find(">tbody.form__");
      rowEles.find(opts.checkAllTarget || opts.checkSingleTarget).filter(":checked").each(function() {
        const thisEle = jQuery(this);
        if (arguments.length > 1) {
          args[0] = opts.data[rowEles.index(thisEle.closest("tbody.form__"))];
          retData.push(NC.json.mapFromKeys.apply(NC.json, args));
        } else {
          retData.push(opts.data[rowEles.index(thisEle.closest("tbody.form__"))]);
        }
      });
      return retData;
    } else {
      if (arguments.length > 1) {
        const args = Array.prototype.slice.call(arguments, 0);
        return opts.data.datafilter(function(data) {
          return data.rowStatus === rowStatus;
        }).map(function() {
          args[0] = this;
          return NC.json.mapFromKeys.apply(NC.json, args);
        }).get();
      } else {
        return opts.data.datafilter(function(data) {
          return data.rowStatus === rowStatus;
        }).get();
      }
    }
  }
  context(sel) {
    return sel !== void 0 ? this.options.context.find(sel) : this.options.context;
  }
  contextHead(sel) {
    return sel !== void 0 ? this.thead.find(sel) : this.thead;
  }
  contextBodyTemplate(sel) {
    return sel !== void 0 ? this.tempRowEle.find(sel) : this.tempRowEle;
  }
  select(row, isAppend) {
    const opts = this.options;
    if (!opts.select && !opts.multiselect) {
      warn('[Grid.select]The "select" or "multiselect" option is disabled. To use this method, set the value of the "select" or "multiselect" option to true.');
      return false;
    }
    if (row === void 0) {
      const rowEles = this.contextEle.find(">tbody.form__");
      return rowEles.filter(".grid_selected__").map(function() {
        return rowEles.index(this);
      }).get();
    } else {
      if (type(row) !== "array") {
        row = [row];
      }
      const self = this;
      let selRowEle;
      if (!isAppend) {
        self.contextEle.find(">tbody.grid_selected__").removeClass("grid_selected__");
      }
      jQuery(row).each(function() {
        selRowEle = self.contextEle.find(">tbody" + (self.options.data.length > 0 ? ".form__" : "") + ":eq(" + String(this) + ")");
        if (selRowEle.hasClass("grid_selected__")) {
          selRowEle.removeClass("grid_selected__");
        }
        selRowEle.trigger("click.grid");
      });
      if (opts.selectScroll) {
        let scrollTop = row[row.length - 1] * selRowEle.outerHeight() - opts.height / 2 + selRowEle.outerHeight() / 2;
        if (scrollTop < 0) {
          scrollTop = 0;
        }
        opts.context.parent(".tbody_wrap__").stop().animate({ "scrollTop": scrollTop }, 300, "swing");
      }
      return this;
    }
  }
  check(row, isAppend) {
    const opts = this.options;
    if (row === void 0) {
      const rowEles = this.contextEle.find(">tbody.form__");
      return rowEles.find(opts.checkAllTarget || opts.checkSingleTarget).filter(":checked").map(function() {
        return rowEles.index(jQuery(this).closest("tbody.form__"));
      }).get();
    } else {
      if (type(row) !== "array") {
        row = [row];
      }
      const self = this;
      let checkboxEle;
      if (!isAppend) {
        self.contextEle.find(">tbody").find((opts.checkAllTarget || opts.checkSingleTarget) + ":checked").prop("checked", false);
      }
      jQuery(row).each(function() {
        checkboxEle = self.contextEle.find(">tbody").find(opts.checkAllTarget || opts.checkSingleTarget).eq(this);
        if (checkboxEle.is(":checked")) {
          checkboxEle.prop("checked", false);
        }
        checkboxEle.trigger("click.grid");
      });
      if (opts.checkScroll) {
        const selRowEle = checkboxEle.closest("tbody.form__");
        let scrollTop = row[row.length - 1] * selRowEle.outerHeight() - opts.height / 2 + selRowEle.outerHeight() / 2;
        if (scrollTop < 0) {
          scrollTop = 0;
        }
        opts.context.parent(".tbody_wrap__").stop().animate({ "scrollTop": scrollTop }, 300, "swing");
      }
      return this;
    }
  }
  /**
   * callType arguments is call type about scrollPaging(internal), data filter(internal), data append(external), DataSync's update.
   * callType : "append" | "grid.bind" | "grid.dataFilter" | "grid.sort" | "grid.update"
   */
  bind(data, callType) {
    const opts = this.options;
    if (opts.sortable && callType !== "grid.sort") {
      this.thead.find(".sortable__").remove();
    }
    if (!opts.isBinding) {
      if (opts.data && data && callType === "append") {
        opts.scrollPaging.size = 0;
        opts.scrollPaging.idx = opts.data.length - 1;
        jQuery.merge(opts.data, data);
      } else {
        opts.scrollPaging.size = opts.scrollPaging.defSize;
        if (data != null) {
          opts.data = type(data) === "array" ? jQuery(data) : data;
        }
      }
      if (opts.filter || this.thead.find("> tr th[data-filter='true']").length > 0) {
        if (callType !== "grid.dataFilter" && callType !== "grid.sort" || !(callType !== "grid.dataFilter" && callType !== "grid.sort") && callType === "grid.sort") {
          this.thead.find("th .data_filter_panel__").remove();
          if (callType !== "grid.dataFilter" && callType !== "grid.sort") {
            this.thead.find(".btn_data_filter__").removeClass("btn_data_filter_empty__ btn_data_filter_part__ btn_data_filter_full__").addClass("btn_data_filter_full__");
            if (opts.data.length > 0) {
              this.thead.find(".btn_data_filter__").removeClass("hidden__").addClass("visible__");
            } else {
              this.thead.find(".btn_data_filter__").removeClass("visible__").addClass("hidden__");
            }
          }
        }
      }
      if (opts.checkAll !== null) {
        this.thead.find(opts.checkAll).prop("checked", false);
      }
      if (opts.data.length > 0 || callType === "append" && data && data.length > 0) {
        opts.context.find(">tbody").clearQueue().stop();
        if (callType !== "grid.bind") {
          if (callType === "append" && data.length > 0) {
            opts.scrollPaging.idx = opts.data.length - data.length;
          } else {
            opts.scrollPaging.idx = 0;
          }
        }
        if (opts.scrollPaging.idx === 0) {
          if (callType === "append" && data.length > 0) {
            opts.context.find(">tbody>tr>td.empty__").parent().parent().remove();
          } else {
            opts.context.find(">tbody").remove();
          }
        }
        const i = opts.scrollPaging.idx;
        let limit;
        if (opts.height === 0 || opts.scrollPaging.size === 0 || callType === "append" && data.length > 0 && data.length <= opts.scrollPaging.size) {
          limit = opts.data.length;
        } else {
          limit = Math.min(opts.scrollPaging.limit, opts.data.length);
        }
        const delay = opts.createRowDelay;
        let lastIdx;
        Iteration.render.call(this, i, limit, delay, lastIdx, callType);
        if (opts.appendScroll && i > 0 && callType === "append") {
          opts.context.parent(".tbody_wrap__").stop().animate({
            "scrollTop": opts.context.parent(".tbody_wrap__").prop("scrollHeight")
          }, 300, "swing");
        }
      } else {
        opts.context.find(">tbody").remove();
        let colspan = 0;
        if (this.tableMap.colgroup[0] !== void 0 && this.tableMap.colgroup[0].length > 0) {
          colspan = jQuery(this.tableMap.colgroup[0]).not(":regexp(css:display, none), [hidden]").length;
        } else {
          jQuery(this.tableMap.tbody).each(function(i, eles) {
            const currLen = jQuery(eles).not(":regexp(css:display, none), [hidden]").length;
            if (colspan < currLen) {
              colspan = currLen;
            }
          });
        }
        const emptyEle = jQuery('<tbody><tr><td class="empty__" ' + (colspan > 0 ? "colspan=" + String(colspan) : "") + ">" + NC.message.get(opts.message, "empty") + "</td></tr></tbody>");
        opts.context.append(emptyEle);
        if (opts.fixedcol > 0) {
          setTimeout(function() {
            const emptyCellEle = emptyEle.find(".empty__");
            const emptyCellEleBLW = parseInt(StringUtils.trimToZero(emptyCellEle.css("border-left")));
            const emptyCellEleBRW = parseInt(StringUtils.trimToZero(emptyCellEle.css("border-right")));
            emptyCellEle.css({
              "position": "absolute",
              "left": 0,
              "padding-left": 0,
              "padding-right": 0,
              "width": opts.context.parent(".grid_wrap__").parent(".grid_container__").outerWidth() - emptyCellEleBLW - emptyCellEleBRW
            });
            emptyCellEle.parent("tr").css("height", emptyCellEle.outerHeight());
          }, 0);
        }
        if (opts.onBind !== null && callType !== "grid.update") {
          opts.onBind.call(this, opts.context, opts.data, true, true);
        }
      }
    } else {
      const self = this;
      const args = arguments;
      opts.context.queue("bind", function() {
        self.bind.apply(self, args);
      });
    }
    return this;
  }
  add(data, row) {
    const opts = this.options;
    if (opts.context.find("td.empty__").length > 0) {
      opts.context.find(">tbody").remove();
    }
    const tempRowEleClone = this.tempRowEle.clone(true, true);
    if (NC.isNumeric(data)) {
      row = data;
      data = void 0;
    }
    if (row > opts.data.length || row < 0) {
      row = void 0;
    }
    if (row === void 0) {
      if (opts.addTop) {
        opts.context.find(">thead").after(tempRowEleClone);
      } else {
        opts.context.append(tempRowEleClone);
      }
    } else {
      let selRowEle = opts.context.find(">tbody:eq(" + row + ")");
      let scrollTop;
      if (row === 0) {
        opts.context.find("thead").after(tempRowEleClone);
      } else if (row === opts.context.find(">tbody").length) {
        selRowEle = opts.context.find(">tbody:eq(" + (row - 1) + ")");
      } else {
        opts.context.find(">tbody:eq(" + row + ")").before(tempRowEleClone);
      }
      if (opts.addScroll) {
        scrollTop = row * selRowEle.outerHeight() - opts.height / 2 + selRowEle.outerHeight() / 2;
        if (scrollTop < 0) {
          scrollTop = 0;
        }
        opts.context.parent(".tbody_wrap__").stop().animate({ "scrollTop": scrollTop }, 300, "swing", function() {
          if (opts.addSelect) {
            jQuery(this).find(">table>tbody:eq(" + row + ")").trigger("click.grid");
          }
        });
      } else {
        if (opts.addSelect) {
          setTimeout(function() {
            opts.context.parent(".tbody_wrap__").find(">table>tbody:eq(" + row + ")").trigger("click.grid");
          }, 0);
        }
      }
    }
    const form = opts.data.form({
      context: tempRowEleClone,
      html: opts.html,
      validate: opts.validate,
      extObj: this,
      extRow: row === void 0 ? opts.addTop ? 0 : opts.data.length : row,
      addTop: opts.addTop,
      revert: opts.revert,
      tpBind: opts.tpBind
    });
    form.add(data, row);
    if (opts.rowHandler !== null) {
      opts.rowHandler.call(this, form.options.extRow, tempRowEleClone, form.data(true)[0]);
    }
    if (opts.fixedcol > 0) {
      tempRowEleClone.find(".grid_body_fixed__").outerHeight(tempRowEleClone.height() + opts.misc.fixedcolBodyAddHeight);
    }
    opts.context.find("> tbody").removeClass("grid_selected__");
    if (row === void 0) {
      opts.context.parent(".tbody_wrap__").stop().animate({
        "scrollTop": opts.addTop ? 0 : opts.context.parent(".tbody_wrap__").prop("scrollHeight")
      }, 300, "swing", function() {
        if (opts.addSelect) {
          jQuery(this).find("> table > tbody:" + (opts.addTop ? "first" : "last")).trigger("click.grid");
        }
      });
    }
    return this;
  }
  remove(row) {
    const opts = this.options;
    if (row !== void 0) {
      if (type(row) !== "array") {
        row = [row];
      }
      jQuery(row.sort().reverse()).each(function(i, row2) {
        if (opts.data[this] === void 0) {
          throw error("[Grid.prototype.remove]Row index is out of range");
        }
        if (opts.data[this].rowStatus === "insert") {
          opts.data.splice(this, 1);
          opts.context.find(">tbody:eq(" + row2 + ")").remove();
          const rowEleLength = opts.context.find(">tbody").length;
          const pagingSize = opts.scrollPaging.size;
          const rest = rowEleLength % pagingSize;
          opts.scrollPaging.idx = rowEleLength / pagingSize * pagingSize - pagingSize + rest;
        } else {
          opts.data[this].rowStatus = "delete";
          opts.context.find(">tbody:eq(" + row2 + ")").addClass("row_data_deleted__");
        }
      });
    }
    DataSync.instance(this).notify();
    return this;
  }
  revert(row) {
    const opts = this.options;
    if (!opts.revert) {
      throw error("[Form.prototype.revert]Can not revert. Form's revert option value is false");
    }
    const self = this;
    if (row !== void 0) {
      if (type(row) !== "array") {
        row = [row];
      }
      jQuery(row).each(function() {
        const i = this;
        const context = opts.context.find(">tbody:eq(" + String(this) + ")");
        const form = context.instance("form");
        if (opts.rowHandlerBeforeBind !== null) {
          opts.rowHandlerBeforeBind.call(self, i, context, form.options.revertData);
        }
        form.revert();
        if (opts.rowHandler !== null) {
          opts.rowHandler.call(self, i, context, opts.data[i]);
        }
      });
    } else {
      opts.context.find(">tbody").instance("form", function() {
        if (this.options !== void 0 && (this.options.data[0].rowStatus === "update" || this.options.data[0].rowStatus === "insert")) {
          const i = this.options.extRow;
          if (opts.rowHandlerBeforeBind !== null) {
            opts.rowHandlerBeforeBind.call(self, i, this.context(), this.options.revertData);
          }
          this.revert();
          if (opts.rowHandler !== null) {
            opts.rowHandler.call(self, i, this.context(), opts.data[i]);
          }
        }
      });
    }
    return this;
  }
  validate(row) {
    const opts = this.options;
    let valiRslt = true;
    if (row !== void 0) {
      valiRslt = opts.context.find(">tbody:eq(" + String(row) + ")").instance("form").validate();
    } else {
      let rowStatus;
      opts.context.find(">tbody").instance("form", function(i) {
        if (this.options !== void 0 && this.options.data.length > 0) {
          rowStatus = this.options.data[0].rowStatus;
          if (this.context(".validate_false__").length > 0 || rowStatus === "update" || rowStatus === "insert") {
            if (!this.validate()) {
              valiRslt = false;
            }
          }
        }
      });
    }
    if (!valiRslt && opts.validateScroll) {
      const valiLastTbody = opts.context.find(".validate_false__:last").closest("tbody.form__");
      opts.context.parent(".tbody_wrap__").stop().animate({
        "scrollTop": opts.context.parent(".tbody_wrap__").scrollTop() + valiLastTbody.position().top - opts.height + valiLastTbody.outerHeight() * 2
      }, 300, "swing");
    }
    return valiRslt;
  }
  val(row, key, val) {
    if (val === void 0) {
      return this.options.data[row][key];
    }
    const inst = this.options.context.find(">.form__:eq(" + String(row) + ")").instance("form");
    if (inst) {
      inst.val(key, val);
    } else {
      if (this.options.data[row]) {
        this.options.data[row][key] = val;
      } else {
        throw error("[Grid.prototype.val]There is no row data that is " + row + " index");
      }
    }
    return this;
  }
  move(fromRow, toRow) {
    Iteration.move.call(this, fromRow, toRow, "grid");
    return this;
  }
  copy(fromRow, toRow) {
    Iteration.copy.call(this, fromRow, toRow, "grid");
    return this;
  }
  show(colIdxs) {
    const opts = this.options;
    const self = this;
    if (colIdxs !== void 0) {
      if (type(colIdxs) !== "array") {
        colIdxs = [colIdxs];
      }
    }
    jQuery(colIdxs).each(function(i, v) {
      let context = opts.height > 0 ? opts.context.parent(".tbody_wrap__").parent(".grid_wrap__") : opts.context;
      context = context.add(self.tempRowEle);
      context.find(".col_" + v + "__").each(function(i2, ele) {
        const colEle = jQuery(ele);
        const colSpanCnt = parseInt(colEle.attr("colspan"));
        const orgColspan = colEle.data("colspan");
        if (colSpanCnt < orgColspan) {
          colEle.attr("colspan", colSpanCnt + 1);
        }
        colEle.css("display", "");
      });
    });
    const emptyEle = opts.context.find(">tbody>tr>.empty__");
    if (emptyEle.length > 0) {
      if (this.tableMap.colgroup[0] !== void 0 && this.tableMap.colgroup[0].length > 0) {
        emptyEle.attr("colspan", String(jQuery(this.tableMap.colgroup[0]).not(":regexp(css:display, none)").length));
      } else {
        jQuery(this.tableMap.tbody).each(function(i, eles) {
          const currLen = String(jQuery(eles).not(":regexp(css:display, none)").length);
          if (StringUtils.trimToZero(emptyEle.attr("colspan")) < currLen) {
            emptyEle.attr("colspan", currLen);
          }
        });
      }
    }
    return this;
  }
  hide(colIdxs) {
    const opts = this.options;
    const self = this;
    if (colIdxs !== void 0) {
      if (type(colIdxs) !== "array") {
        colIdxs = [colIdxs];
      }
    }
    jQuery(colIdxs).each(function() {
      let context = opts.height > 0 ? opts.context.parent(".tbody_wrap__").parent(".grid_wrap__") : opts.context;
      context = context.add(self.tempRowEle);
      context.find(".col_" + this + "__").each(function() {
        const colEle = jQuery(this);
        const colSpanCnt = parseInt(colEle.attr("colspan"));
        if (colSpanCnt > 0) {
          if (colEle.data("colspan") === void 0) {
            colEle.data("colspan", colSpanCnt);
          }
          colEle.attr("colspan", colSpanCnt - 1);
          if (colEle.attr("colspan") === "0") {
            colEle.css("display", "none");
          }
        } else {
          colEle.css("display", "none");
        }
      });
    });
    const emptyEle = opts.context.find(">tbody>tr>.empty__");
    if (emptyEle.length > 0) {
      if (this.tableMap.colgroup[0] !== void 0 && this.tableMap.colgroup[0].length > 0) {
        emptyEle.attr("colspan", String(jQuery(this.tableMap.colgroup[0]).not(":regexp(css:display, none)").length));
      } else {
        jQuery(this.tableMap.tbody).each(function(i, eles) {
          const currLen = String(jQuery(eles).not(":regexp(css:display, none)").length);
          if (StringUtils.trimToZero(emptyEle.attr("colspan")) < currLen) {
            emptyEle.attr("colspan", currLen);
          }
        });
      }
    }
    return this;
  }
  update(row, key) {
    if (row !== void 0) {
      if (key !== void 0) {
        this.options.context.find(">tbody:eq(" + String(row) + ")").instance("form").update(0, key);
      } else if (this.options.data[row]._isRevert !== true && this.options.data[row].rowStatus === "insert") {
        if (this.options.data[row].rowStatus === "insert") {
          this.bind(void 0, "grid.update");
        } else {
          this.add(this.options.data[row]);
        }
      } else {
        this.options.context.find(">tbody:eq(" + String(row) + ")").instance("form").update(0);
      }
    } else {
      this.bind(void 0, "grid.update");
    }
    return this;
  }
};
/**
 * Convert HTML Table To 2D Array
 * Reference from CHRIS WEST'S BLOG : http://cwestblog.com/2016/08/21/javascript-snippet-convert-html-table-to-2d-array/
 */
__publicField(_Grid, "tableCells", function(tbl, opt_cellValueGetter) {
  const rows = tbl.find(">tr");
  opt_cellValueGetter = opt_cellValueGetter || function(td) {
    return td.textContent || td.innerText;
  };
  const twoD = [];
  let rowCount = rows.length;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    twoD.push([]);
  }
  for (let rowIndex = 0, tr; rowIndex < rowCount; rowIndex++) {
    const tr2 = rows[rowIndex];
    for (let colIndex = 0, colCount = tr2.cells.length, offset = 0; colIndex < colCount; colIndex++) {
      const td = tr2.cells[colIndex]; opt_cellValueGetter(td, colIndex, rowIndex, tbl);
      while (twoD[rowIndex].hasOwnProperty(colIndex + offset)) {
        offset++;
      }
      for (let i = 0, colSpan = parseInt(td.colSpan, 10) || 1; i < colSpan; i++) {
        for (let j = 0, rowSpan = parseInt(td.rowSpan, 10) || 1; j < rowSpan; j++) {
          jQuery(td).addClass("col_" + (colIndex + offset + i) + "__");
          if (twoD[rowIndex + j] !== void 0) {
            twoD[rowIndex + j][colIndex + offset + i] = td;
          } else {
            warn("[Grid.tableCells]The rowspan property of table is defined incorrectly.");
          }
        }
      }
    }
  }
  return twoD;
});
__publicField(_Grid, "tableMap", function() {
  const opts = this.options;
  const colgroup = [];
  let thead;
  let tfoot;
  if (opts.context.find("> colgroup").length > 0) {
    colgroup.push(opts.context.find("> colgroup > col").each(function(i) {
      jQuery(this).addClass("col_" + String(i) + "__");
    }).get());
  }
  if (opts.height > 0) {
    if (opts.context.find("> colgroup").length > 0) {
      colgroup.unshift(opts.context.closest(".grid_wrap__").find(">.thead_wrap__>table>colgroup>col").each(function(i) {
        jQuery(this).addClass("col_" + String(i) + "__");
      }).get());
      colgroup.push(opts.context.closest(".grid_wrap__").find(">.tfoot_wrap__>table>colgroup>col").each(function(i) {
        jQuery(this).addClass("col_" + String(i) + "__");
      }).get());
    }
    thead = _Grid.tableCells(opts.context.closest(".grid_wrap__").find(">.thead_wrap__>table>thead"));
    thead = thead.concat(_Grid.tableCells(opts.context.closest(".grid_wrap__").find("> .tbody_wrap__>table>thead")));
    tfoot = _Grid.tableCells(opts.context.closest(".grid_wrap__").find(">.tfoot_wrap__>table>tfoot"));
  } else {
    thead = _Grid.tableCells(opts.context.find("> thead"));
    tfoot = _Grid.tableCells(opts.context.find("> tfoot"));
  }
  return {
    colgroup,
    thead,
    tbody: _Grid.tableCells(this.tempRowEle),
    tfoot
  };
});
__publicField(_Grid, "setTheadCellInfo", function() {
  this.options;
  const tableMap = this.tableMap;
  if (tableMap.thead.length === 0) {
    return;
  }
  let nextCnt = 0;
  jQuery(tableMap.tbody).each(function(i, cells) {
    jQuery(cells).each(function(j, cell) {
      if (tableMap.thead[i + nextCnt] === void 0 || tableMap.thead[i + nextCnt][j] === void 0) {
        return false;
      }
      let theadCell = jQuery(tableMap.thead[i + nextCnt][j]);
      const tbodyCell = jQuery(cell);
      if (nextCnt === 0 && tbodyCell.attr("colspan") !== theadCell.attr("colspan")) {
        theadCell = jQuery(tableMap.thead[i + 1][j]);
      }
      if (tbodyCell.attr("colspan") === theadCell.attr("colspan")) {
        let id = tbodyCell.attr("id");
        if (id === void 0) {
          id = tbodyCell.find("[id]").attr("id");
        }
        if (id !== void 0) {
          theadCell.data("id", id);
        }
      } else {
        nextCnt++;
        return true;
      }
    });
  });
});
__publicField(_Grid, "removeColgroup", function() {
  const opts = this.options;
  if (opts.context.find("colgroup").length > 0) {
    const theadMap = _Grid.tableCells(opts.context.find("> thead"));
    let tfootMap;
    if (opts.height > 0) {
      tfootMap = _Grid.tableCells(opts.context.find("> tfoot"));
    }
    opts.context.find("colgroup>col").each(function(i, colEle) {
      jQuery(theadMap).each(function(j, rowEles) {
        if (jQuery(rowEles[i]).attr("colspan") === void 0) {
          jQuery(rowEles[i]).css("width", colEle.style.width).removeAttr("scope");
        }
      });
      if (opts.height > 0) {
        jQuery(tfootMap).each(function(j, rowEles) {
          if (jQuery(rowEles[i]).attr("colspan") === void 0) {
            jQuery(rowEles[i]).css("width", colEle.style.width).removeAttr("scope");
          }
        });
      }
    }).parent().remove();
  }
});
__publicField(_Grid, "fixColumn", function() {
  const opts = this.options;
  const self = this;
  if (opts.fixedcol > 0) {
    opts.context.width("auto").css({
      "table-layout": "fixed",
      "width": self.thead.find("> tr > th").toArray().splice(opts.fixedcol).reduce(function(sum, ele) {
        return sum + parseInt(window.getComputedStyle(ele, null).getPropertyValue("width"));
      }, 0)
    });
    const gridWrap = opts.context.wrap(jQuery("<div/>", {
      "css": { "overflow-x": BrowserUtils.is("ios") ? "scroll" : "auto" },
      "class": "grid_wrap__"
    })).parent("div");
    const gridContainer = gridWrap.wrap(jQuery("<div/>", {
      "class": "grid_container__"
    })).parent("div");
    if (opts.misc.fixedcolRootContainer === null) {
      gridContainer.css("position", "relative");
    } else {
      opts.context.closest(opts.misc.fixedcolRootContainer).css("position", "relative");
    }
    const theadTrHeight = self.thead.find("> tr").height();
    self.thead.find("> tr").height(theadTrHeight);
    let cellLeft = 0;
    let leftMargin = 0;
    for (let i = 0; i < opts.fixedcol; i++) {
      let targetTheadCellEle;
      let targetTbodyCellEle;
      targetTheadCellEle = jQuery(self.tableMap.thead).map(function() {
        return this[i];
      }).addClass("grid_head_fixed__");
      targetTbodyCellEle = jQuery(self.tableMap.tbody).map(function() {
        return this[i];
      }).addClass("grid_body_fixed__");
      const cellWidth = targetTheadCellEle.outerWidth();
      const borderLeftWidth = parseInt(targetTheadCellEle.css("border-left-width"));
      const theadBorderTopWidth = parseInt(targetTheadCellEle.css("border-top-width"));
      leftMargin += cellWidth - borderLeftWidth + opts.misc.fixedcolHeadMarginLeft;
      targetTheadCellEle.css({
        "position": "absolute",
        "margin-top": -theadBorderTopWidth + opts.misc.fixedcolHeadMarginTop + "px",
        "box-sizing": "border-box",
        "width": cellWidth + "px",
        "height": theadTrHeight + theadBorderTopWidth + opts.misc.fixedcolHeadHeight + "px"
      });
      targetTbodyCellEle.css({
        "position": "absolute",
        "margin-top": opts.misc.fixedcolBodyMarginTop + "px",
        "box-sizing": "border-box",
        "width": cellWidth + "px"
      });
      if (targetTheadCellEle.prev().length > 0) {
        cellLeft += targetTheadCellEle.prev().outerWidth() - borderLeftWidth + opts.misc.fixedcolBodyMarginLeft;
      }
      targetTheadCellEle.css({
        "left": cellLeft + "px"
      });
      targetTbodyCellEle.css({
        "left": cellLeft + "px"
      });
      if (self.tableMap.colgroup.length > 0) {
        jQuery(self.tableMap.colgroup).each(function() {
          if (i === 0) {
            jQuery(this[i]).width(0);
          } else {
            jQuery(this[i]).hide();
          }
        });
      }
    }
    gridWrap.css("margin-left", leftMargin);
  }
});
__publicField(_Grid, "fixHeader", function() {
  const opts = this.options;
  opts.context.css({
    "table-layout": "fixed",
    "margin": "0"
  });
  const sampleCell = opts.context.find(">tbody td:eq(0)");
  let borderLeftWidth = sampleCell.css("border-left-width");
  if (parseInt(borderLeftWidth) < 1) {
    borderLeftWidth = "1px";
  }
  const borderLeft = borderLeftWidth + " " + sampleCell.css("border-left-style") + " " + sampleCell.css("border-left-color");
  let borderBottomWidth = sampleCell.css("border-bottom-width");
  if (parseInt(borderBottomWidth) < 1) {
    borderBottomWidth = "1px";
  }
  const borderBottom = borderBottomWidth + " " + sampleCell.css("border-bottom-style") + " " + sampleCell.css("border-bottom-color");
  const gridWrap = opts.context.wrap('<div class="grid_wrap__"/>').parent();
  gridWrap.css({
    "border-left": borderLeft
  });
  const scrollbarWidth2 = BrowserUtils.scrollbarWidth();
  if (gridWrap.width() > 0 && opts.context.width() > gridWrap.width()) {
    gridWrap.width(opts.context.width() + scrollbarWidth2);
  }
  const contextClone = opts.context.clone(true, true);
  const theadClone = opts.context.find("> thead").clone();
  contextClone.find(">thead").remove();
  contextClone.find(">tbody").remove();
  contextClone.find(">tfoot").remove();
  contextClone.append(opts.context.find("> thead"));
  const theadWrap = contextClone.wrap('<div class="thead_wrap__"/>').parent().css({
    "padding-right": scrollbarWidth2 + "px",
    "margin-left": "-1px"
  });
  gridWrap.prepend(theadWrap);
  opts.context.append(theadClone);
  opts.context.find("> thead th").empty().css({
    "height": "0",
    "padding-top": "0",
    "padding-bottom": "0",
    "border-top": "none",
    "border-bottom": "none"
  });
  opts.context.find("> tbody td").css({
    "border-top": "none"
  });
  this.tempRowEle.find("td").css({
    "border-top": "none"
  });
  const contextWrapEle = opts.context.wrap('<div class="tbody_wrap__"/>').parent().css({
    "height": String(opts.height) + "px",
    "overflow-y": "scroll",
    "overflow-x": "hidden",
    "margin-left": "-1px"
  });
  if (opts.context.find("> tfoot").length === 0) {
    contextWrapEle.css("border-bottom", borderBottom);
  }
  if (opts.windowScrollLock) {
    EventUtils.windowScrollLock(contextWrapEle);
  }
  const self = this;
  const defSPSize = opts.scrollPaging.limit;
  let rowEleLength;
  Scroll.paging.call(self, contextWrapEle, defSPSize, rowEleLength, "> tbody", "grid.bind");
  let tfootWrap;
  if (opts.context.find("> tfoot").length > 0) {
    const contextClone2 = opts.context.clone(true, true);
    contextClone2.find(">thead").remove();
    contextClone2.find(">tbody").remove();
    contextClone2.find(">tfoot").remove();
    contextClone2.append(opts.context.find("> tfoot"));
    tfootWrap = contextClone2.wrap('<div class="tfoot_wrap__"/>').parent().css({
      "padding-right": scrollbarWidth2 + "px",
      "margin-left": "-1px"
    });
    gridWrap.append(tfootWrap);
  }
  if (opts.vResizable) {
    _Grid.vResize.call(this, gridWrap, contextWrapEle, tfootWrap);
  }
});
__publicField(_Grid, "vResize", function(gridWrap, contextWrapEle, tfootWrap) {
  let pressed = false;
  const vResizable = jQuery('<div class="v_resizable__"></div>').css({
    "text-align": "center",
    "cursor": "n-resize",
    "margin-bottom": gridWrap.css("margin-bottom")
  });
  gridWrap.css("margin-bottom", "0");
  let currHeight, contextWrapOffset, tfootHeight = 0;
  let eventNameSpace = ".grid.vResize";
  Draggable.events.call(vResizable, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) {
    if (tfootWrap !== void 0) {
      tfootHeight = tfootWrap.height();
    }
    contextWrapOffset = contextWrapEle.offset();
  }, function(e, tabContainerEle_, pageX, pageY) {
    currHeight = pageY - contextWrapOffset.top - tfootHeight + "px";
    contextWrapEle.css({
      "height": currHeight,
      "max-height": currHeight
    });
  });
  vResizable.on("mousedown.grid.vResize touchstart.grid.vResize", function(e) {
    if (e.originalEvent.touches) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (e.originalEvent.touches || (e.which || e.button) === 1) {
      jQuery(document).on("dragstart.grid.vResize selectstart.grid.vResize", function() {
        return false;
      });
      pressed = true;
      jQuery(window.document).on("mousemove.grid.vResize touchmove.grid.vResize", function(e2) {
        let mte;
        if (e2.originalEvent.touches) {
          e2.stopPropagation();
          mte = e2.originalEvent.touches[0];
        }
        if (pressed) {
          currHeight = (mte !== void 0 ? mte.pageY : e2.pageY) - contextWrapOffset.top - tfootHeight + "px";
          contextWrapEle.css({
            "height": currHeight,
            "max-height": currHeight
          });
        }
      });
      jQuery(window.document).on("mouseup.grid.vResize touchend.grid.vResize", function(e2) {
        jQuery(document).off("dragstart.grid.vResize selectstart.grid.vResize mousemove.grid.vResize touchmove.grid.vResize mouseup.grid.vResize touchend.grid.vResize");
        pressed = false;
      });
    }
  });
  gridWrap.after(vResizable);
});
__publicField(_Grid, "more", function() {
  const opts = this.options;
  const self = this;
  if (opts.more === true) {
    opts.more = self.tempRowEle.find("[id]").map(function() {
      return jQuery(this).attr("id");
    }).get();
  }
  if (opts.context.find("> colgroup").length > 0) {
    opts.context.find("> colgroup").append('<col class="grid_more_colgroup_col__">');
  }
  let theadCol;
  const theadRowCnt = _Grid.tableCells(opts.context.find(">thead")).length;
  if (theadRowCnt > 0) {
    theadCol = jQuery("<th></th>").addClass("grid_more_thead_col__");
    if (theadRowCnt > 1) {
      theadCol.attr("rowspan", String(theadRowCnt));
    }
  }
  const colShowHideBtn = jQuery('<a href="#" title="' + NC.message.get(opts.message, "showHide") + '"><span></span></a>').addClass("grid_col_show_hide_btn__").appendTo(theadCol);
  if (theadCol !== void 0) {
    opts.context.find(">thead > tr:first").append(theadCol);
  }
  let tbodyCol;
  const tbodyRowCnt = _Grid.tableCells(this.tempRowEle).length;
  if (tbodyRowCnt > 0) {
    tbodyCol = jQuery("<td></td>").addClass("grid_more_tbody_col__");
    if (tbodyRowCnt > 1) {
      tbodyCol.attr("rowspan", String(tbodyRowCnt));
    }
  }
  jQuery('<a href="#" title="' + NC.message.get(opts.message, "more") + '"><span></span></a>').addClass("grid_more_btn__").appendTo(tbodyCol);
  if (tbodyCol !== void 0) {
    self.tempRowEle.find("> tr:first").append(tbodyCol);
  }
  let tfootCol;
  const tfootRowCnt = _Grid.tableCells(opts.context.find(">tfoot")).length;
  if (tfootRowCnt > 0) {
    tfootCol = jQuery("<td></td>").addClass("grid_more_tfoot_col__");
    if (tfootRowCnt > 1) {
      tfootCol.attr("rowspan", String(tfootRowCnt));
    }
  }
  if (tfootCol !== void 0) {
    opts.context.find(">tfoot > tr:first").append(tfootCol);
  }
  const excludeThClasses = ".btn_data_filter_full__, .data_filter_panel__, .btn_data_filter__, .resize_bar__, .sortable__";
  const panel = jQuery('<div class="grid_more_panel__ hidden__"><div class="grid_more_checkall_box__"><label><input type="checkbox">' + NC.message.get(opts.message, "selectAll") + '<span class="grid_more_total_cnt__"></span></label></div><ul class="grid_more_col_list__"></ul></div>');
  colShowHideBtn.after(panel);
  let gridMoreColList;
  panel.find(".grid_more_checkall_box__ :checkbox").on("click.grid.more", function() {
    const thisEle = jQuery(this);
    if (thisEle.is(":checked")) {
      gridMoreColList.find("input[name='hideshow']:not(':checked')").trigger("click");
    } else {
      gridMoreColList.find("input[name='hideshow']:checked").trigger("click");
    }
  });
  const calibDialogItems = function(currPanel) {
    if (gridMoreColList.find("input[name='hideshow']").length === gridMoreColList.find("input[name='hideshow']:checked").length) {
      currPanel.find(".grid_more_checkall_box__ :checkbox").prop("checked", true);
    } else {
      currPanel.find(".grid_more_checkall_box__ :checkbox").prop("checked", false);
    }
  };
  colShowHideBtn.on("click.grid.more", function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const thisBtn = jQuery(this);
    const panel2 = thisBtn.next(".grid_more_panel__ ");
    if (self.tableMap.thead.length > 0 && gridMoreColList === void 0) {
      gridMoreColList = panel2.find(".grid_more_col_list__");
      gridMoreColList.on("click.grid.more", "input[name='hideshow']", function() {
        const thisEle = jQuery(this);
        if (!thisEle.is(":checked")) {
          self.hide(parseInt(thisEle.val()));
        } else {
          self.show(parseInt(thisEle.val()));
        }
        calibDialogItems(panel2);
      });
      jQuery(self.tableMap.thead[0]).each(function(i) {
        const thisEleClone = jQuery(this).clone();
        if (!thisEleClone.hasClass("grid_more_thead_col__")) {
          thisEleClone.find(excludeThClasses).remove();
          jQuery('<li class="grid_more_cols__" title="' + String(i + 1) + '"><label><input name="hideshow" type="checkbox" checked="checked" value="' + String(i) + '">' + String(i + 1) + " " + NC.message.get(opts.message, "column") + "</label></li>").appendTo(gridMoreColList);
        }
      });
      calibDialogItems(panel2);
    }
    jQuery(document).off("click.grid.more");
    jQuery(document).on("click.grid.more", function(e2) {
      if (jQuery(e2.target).parents(".grid_more_panel__, .grid_col_show_hide_btn__").length === 0 && !jQuery(e2.target).hasClass("grid_col_show_hide_btn__")) {
        panel2.removeClass("visible__").addClass("hidden__");
        panel2.one(EventUtils.whichTransitionEvent(panel2), function() {
          panel2.hide();
          jQuery(document).off("click.grid.more touchstart.grid.more");
        }).trigger("nothing");
      }
    });
    panel2.show(0, function() {
      jQuery(this).removeClass("hidden__").addClass("visible__");
    });
  });
  opts.context.on("click.grid.more", ".grid_more_tbody_col__ .grid_more_btn__", function(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    let rowIdx = opts.context.find(">tbody").index(jQuery(this).closest("tbody.form__"));
    const morePopupContects = jQuery("<div></div>").addClass("grid_more_popup_contents__");
    const moreContents = jQuery("<div></div>").addClass("grid_more_contents__").appendTo(morePopupContects).css({
      "overflow-y": "auto",
      "max-height": jQuery(window).height() - 200 + "px"
    });
    const table = jQuery("<table></table>").appendTo(moreContents);
    const tbody = jQuery("<tbody></tbody>").appendTo(table);
    jQuery(opts.more).each(function() {
      const tr = jQuery("<tr></tr>").appendTo(tbody);
      const filteredThClone = self.thead.find(">tr > th:regexp(data:id, " + this + ")").clone();
      filteredThClone.find(excludeThClasses).remove();
      filteredThClone.removeAttr("rowspan").removeAttr("colspan");
      jQuery("<th></th>", {
        text: filteredThClone.text()
      }).appendTo(tr);
      const td = opts.context.find(">tbody:eq(" + rowIdx + ") #" + this);
      if (td.is("td")) {
        td.clone().removeAttr("rowspan").removeAttr("colspan").removeAttr("class").removeAttr("style").appendTo(tr);
      } else {
        if (td.hasClass("datepicker__")) {
          td.next(".datepicker_contents__").remove();
        }
        const tdClone = td.closest("td").clone();
        tdClone.find(".datepicker__").removeClass("datepicker__");
        tdClone.removeAttr("rowspan").removeAttr("colspan").removeAttr("class").removeAttr("style").appendTo(tr);
      }
    });
    const form = opts.data.form(moreContents).unbind().bind(rowIdx);
    const btnBox = jQuery('<div class="btn_box__"></div>').appendTo(morePopupContects);
    const prevBtn = jQuery('<a href="#" class="prev_btn__">' + NC.message.get(opts.message, "prev") + "</a>").on("click.grid.more", function(e2) {
      e2.preventDefault();
      if (rowIdx > 0 && form.validate()) {
        rowIdx -= 1;
        form.bind(rowIdx);
        page.text(String(rowIdx + 1));
      }
    }).appendTo(btnBox);
    prevBtn.button({
      type: "outlined",
      size: "medium"
    });
    const page = jQuery('<span class="page__">' + String(rowIdx + 1) + "</span>").appendTo(btnBox);
    const nextBtn = jQuery('<a href="#" class="next_btn__">' + NC.message.get(opts.message, "next") + "</a>").on("click.grid.more", function(e2) {
      e2.preventDefault();
      if (rowIdx + 1 < form.data().length && form.validate()) {
        rowIdx += 1;
        form.bind(rowIdx);
        page.text(String(rowIdx + 1));
      }
    }).appendTo(btnBox);
    nextBtn.button({
      type: "outlined",
      size: "medium"
    });
    morePopupContects.popup({
      title: NC.message.get(opts.message, "more"),
      closeMode: "remove",
      button: false,
      draggable: true,
      alwaysOnTop: true,
      onCancel: function() {
        if (!form.validate()) {
          return 0;
        }
      }
    }).open();
  });
});
__publicField(_Grid, "resize", function() {
  const self = this;
  let resizeBar, resizeBarHeight, cellEle, currCellEle, currNextCellEle, targetCellEle, targetNextCellEle, targetTfootCellEle, targetNextTfootCellEle, currResizeBarEle, defWidth, nextDefWidth, currWidth, nextCurrWidth, startOffsetX, minPx, maxPx, defPx, movedPx;
  const opts = this.options;
  const theadCells = this.thead.find("> tr th:not(.grid_head_fixed__)");
  let isPressed = false;
  BrowserUtils.scrollbarWidth();
  if (BrowserUtils.is("safari")) {
    theadCells.css("padding-left", "0");
    theadCells.css("padding-right", "0");
  }
  if (opts.context.css("table-layout") !== "fixed") {
    opts.context.css("table-layout", "fixed");
  }
  const resizeBarWidth = 5;
  const resizeBarCorrectionHeight = BrowserUtils.is("ie") ? -2 : 0;
  let context;
  if (opts.height > 0) {
    context = opts.context.closest(".grid_wrap__");
  } else {
    context = opts.context;
  }
  this.thead.on("mouseover.grid.resize touchstart.grid.resize", function() {
    resizeBarHeight = (opts.height > 0 ? self.contextEle.closest(".grid_wrap__").height() - 3 : self.contextEle.height() + resizeBarCorrectionHeight) + 1 + opts.misc.resizeBarCorrectionHeight;
    let lastResizeBar = theadCells.each(function() {
      const cellEle2 = jQuery(this);
      cellEle2.find("> .resize_bar__").css({
        "top": cellEle2.position().top + 1,
        "left": cellEle2.position().left + cellEle2.outerWidth() - resizeBarWidth / 2 + opts.misc.resizeBarCorrectionLeft + "px"
      });
    }).last().find("> .resize_bar__");
    lastResizeBar.css({
      "left": parseInt(lastResizeBar.css("left")) - resizeBarWidth / 2
    });
    lastResizeBar = void 0;
  });
  let isFirstTimeLastClick = true;
  theadCells.each(function() {
    cellEle = jQuery(this);
    resizeBar = jQuery('<div class="resize_bar__"></div>').css({
      "padding": "0px",
      "position": "absolute",
      "width": resizeBarWidth + "px",
      "height": String(cellEle.outerHeight()) + "px",
      "opacity": "0"
    }).appendTo(cellEle);
    resizeBar.on("mousedown.grid.resize touchstart.grid.resize", function(e) {
      let dte;
      if (e.originalEvent.touches) {
        dte = e.originalEvent.touches[0];
      }
      if (e.originalEvent.touches || (e.which || e.button) === 1) {
        jQuery(this).css({
          "opacity": ""
        }).animate({
          "height": resizeBarHeight + "px"
        }, 150);
        startOffsetX = dte !== void 0 ? dte.pageX : e.pageX;
        currResizeBarEle = jQuery(this);
        currCellEle = currResizeBarEle.parent("th");
        currNextCellEle = currCellEle.next();
        let isLast = false;
        if (currNextCellEle.length === 0) {
          currNextCellEle = context;
          isLast = true;
        }
        if (opts.height > 0) {
          targetCellEle = opts.context.find("thead th:eq(" + theadCells.index(currCellEle) + ")");
          targetNextCellEle = targetCellEle.next();
          if (opts.height > 0 && opts.context.parent().parent(".grid_wrap__").find("tfoot").length > 0) {
            targetTfootCellEle = opts.context.parent().parent(".grid_wrap__").find("tfoot > tr > td:eq(" + theadCells.index(currCellEle) + ")");
            targetNextTfootCellEle = targetTfootCellEle.next();
          }
        }
        if (isFirstTimeLastClick && isLast) {
          let thisWidth;
          theadCells.each(function(i) {
            thisWidth = jQuery(this).width();
            jQuery(this).width(thisWidth + (opts.height > 0 ? opts.misc.resizableLastCellCorrectionWidth : 0) + opts.misc.resizableCorrectionWidth).removeAttr("width");
            if (targetCellEle !== void 0) {
              opts.context.find("thead th:eq(" + theadCells.index(this) + ")").width(thisWidth + (opts.height > 0 ? opts.misc.resizableLastCellCorrectionWidth : 0) + opts.misc.resizableCorrectionWidth).removeAttr("width");
            }
            if (opts.height > 0 && targetTfootCellEle !== void 0) {
              opts.context.parent().parent(".grid_wrap__").find("tfoot > tr > td:eq(" + theadCells.index(this) + ")").width(thisWidth + (opts.height > 0 ? opts.misc.resizableLastCellCorrectionWidth : 0) + opts.misc.resizableCorrectionWidth).removeAttr("width");
            }
          });
          isFirstTimeLastClick = false;
          thisWidth = void 0;
        }
        currCellEle.data("sortLock", true);
        defWidth = Math.floor(currCellEle.outerWidth()) + opts.misc.resizableCorrectionWidth;
        nextDefWidth = !isLast ? Math.floor(currNextCellEle.outerWidth()) + opts.misc.resizableCorrectionWidth : Math.floor(context.width());
        jQuery(document).on("dragstart.grid.resize selectstart.grid.resize", function() {
          return false;
        });
        isPressed = true;
        minPx = !isLast ? Math.floor(currNextCellEle.offset().left) : Math.floor(currCellEle.offset().left) + Math.floor(currCellEle.outerWidth());
        maxPx = minPx + (!isLast ? Math.floor(currNextCellEle.outerWidth()) : 7680);
        movedPx = defPx = Math.floor(currResizeBarEle.parent("th").offset().left);
        jQuery(window.document).on("mousemove.grid.resize touchmove.grid.resize", function(e2) {
          let mte;
          if (e2.originalEvent.touches) {
            e2.stopPropagation();
            mte = e2.originalEvent.touches[0];
          }
          if (isPressed) {
            const mPageX = mte !== void 0 ? mte.pageX : e2.pageX;
            if (defPx < mPageX && maxPx > mPageX) {
              movedPx = mPageX - startOffsetX;
              currWidth = defWidth + movedPx;
              nextCurrWidth = !isLast ? nextDefWidth - movedPx : nextDefWidth + movedPx;
              if (currWidth > 0 && nextCurrWidth > 0) {
                currCellEle.css("width", currWidth + "px");
                currNextCellEle.css("width", nextCurrWidth + "px");
                if (targetCellEle !== void 0) {
                  targetCellEle.css("width", currWidth + "px");
                  targetNextCellEle.css("width", nextCurrWidth + "px");
                }
                if (targetTfootCellEle !== void 0) {
                  targetTfootCellEle.css("width", currWidth + "px");
                  targetNextTfootCellEle.css("width", nextCurrWidth + "px");
                }
              }
              currCellEle.find(".resize_bar__").offset({
                "left": minPx - resizeBarWidth / 2 + movedPx + opts.misc.resizeBarCorrectionLeft
              });
            }
          }
        });
        let currResizeBar2 = jQuery(this);
        jQuery(window.document).on("mouseup.grid.resize touchend.grid.resize", function(e2) {
          currResizeBar2.animate({
            "height": String(theadCells.filter(":eq(0)").outerHeight()) + "px"
          }, 200, function() {
            jQuery(this).css({
              "opacity": "0"
            });
            currResizeBar2 = void 0;
          });
          jQuery(document).off("dragstart.grid.resize selectstart.grid.resize mousemove.grid.resize touchmove.grid.resize mouseup.grid.resize touchend.grid.resize");
          isPressed = false;
        });
      }
    });
  });
  resizeBar = resizeBarHeight = cellEle = currCellEle = currNextCellEle = targetCellEle = targetNextCellEle = targetTfootCellEle = targetNextTfootCellEle = currResizeBarEle = defWidth = nextDefWidth = currWidth = nextCurrWidth = startOffsetX = minPx = maxPx = defPx = movedPx = void 0;
});
__publicField(_Grid, "sort", function() {
  const opts = this.options;
  const thead = this.thead;
  const theadCells = thead.find(">tr>th:not(.grid_more_thead_col__)");
  theadCells.css("cursor", "pointer");
  const self = this;
  theadCells.filter(function(i, cell) {
    return jQuery(cell).data("id") !== void 0;
  }).on("click.grid.sort", function(e) {
    const currEle = jQuery(this);
    if (currEle.data("sortLock")) {
      currEle.data("sortLock", false);
      return false;
    }
    if (opts.data.length > 0) {
      if (StringUtils.trimToNull(jQuery(this).text()) !== null && jQuery(this).find(opts.checkAll).length === 0) {
        let isAsc = false;
        if (currEle.find(".sortable__").hasClass("asc__")) {
          isAsc = true;
        }
        if (isAsc) {
          self.bind(jQuery(opts.data).datasort(jQuery(this).data("id"), true), "grid.sort");
          theadCells.find(".sortable__").remove();
          currEle.append('<span class="sortable__ desc__">' + opts.sortableItem.asc + "</span>");
        } else {
          self.bind(jQuery(opts.data).datasort(jQuery(this).data("id")), "grid.sort");
          theadCells.find(".sortable__").remove();
          currEle.append('<span class="sortable__ asc__">' + opts.sortableItem.desc + "</span>");
        }
      }
    }
  });
});
__publicField(_Grid, "dataFilter", function() {
  const opts = this.options;
  const thead = this.thead;
  const theadCells = thead.find("> tr th").filter(function(i, cell) {
    return jQuery(cell).data("id") !== void 0;
  });
  const self = this;
  let clonedData;
  let filterKeys;
  let filteredKeys;
  let bfrSelId;
  const changeBtnIcon = function(th, kind) {
    th.find(".btn_data_filter__").removeClass("btn_data_filter_empty__ btn_data_filter_part__ btn_data_filter_full__").addClass("btn_data_filter_" + kind + "__");
  };
  jQuery('<a href="#" class="btn_data_filter__" title="' + NC.message.get(opts.message, "dFilter") + '"><span>' + NC.message.get(opts.message, "dFilter") + "</span><a>").addClass("btn_data_filter_full__").on("click.grid.dataFilter", function(e) {
    e.preventDefault();
    e.stopPropagation();
    const thisEle = jQuery(this);
    const visiblePanel = thead.find(".data_filter_panel__.visible__");
    if (visiblePanel.length > 0) {
      visiblePanel.removeClass("visible__").addClass("hidden__");
      const eventNm = EventUtils.whichTransitionEvent(visiblePanel);
      visiblePanel.off(eventNm).one(eventNm, function(e2) {
        if (!thisEle.hasClass("btn_data_filter__")) {
          jQuery(this).hide();
        }
      }).trigger("nothing");
    }
    const theadCell = jQuery(this).closest("th");
    let panel;
    let searchBox;
    let filterListBox;
    const id = theadCell.data("id");
    let dataFilterProgress;
    if (theadCell.find(".data_filter_panel__").length > 0) {
      panel = theadCell.find(".data_filter_panel__").hide().removeClass("visible__").addClass("hidden__");
      dataFilterProgress = theadCell.find(".data_filter_progress__");
      searchBox = panel.find(".data_filter_search__");
      panel.find(".data_filter_checkall_box__ .data_filter_total_cnt__").text("(" + opts.data.length + ")");
      filterListBox = panel.find(".data_filter_list__");
      if (bfrSelId !== id) {
        filterKeys = {};
        jQuery.each(clonedData, function(i, v) {
          if (filterKeys[id + "_" + v[id]] === void 0) {
            filterKeys[id + "_" + v[id]] = [i];
          } else {
            filterKeys[id + "_" + v[id]].push(i);
          }
        });
      }
      filteredKeys = {};
      jQuery.each(opts.data, function(i, v) {
        if (filteredKeys[id + "_" + v[id]] === void 0) {
          filteredKeys[id + "_" + v[id]] = [i];
        } else {
          filteredKeys[id + "_" + v[id]].push(i);
        }
      });
    } else {
      if (theadCells.find(".data_filter_panel__").length === 0) {
        clonedData = opts.data.get().slice(0);
      }
      panel = jQuery('<div style="text-align: left;" class="data_filter_panel__ hidden__"><div class="data_filter_search__"><input class="data_filter_search_word__" type="text"><a class="data_filter_search_btn__" href="#" title="' + NC.message.get(opts.message, "search") + '"><span>' + NC.message.get(opts.message, "search") + '</span></a></div><div class="data_filter_checkall_box__"><label><input type="checkbox" checked="checked"><span class="data_filter_select_all__">' + NC.message.get(opts.message, "selectAll") + '</span><span class="data_filter_total_cnt__">(' + opts.data.length + ')</span></label></div><ul class="data_filter_list__"></ul></div>').css("z-index", 1).hide().appendTo(theadCell).on("click.grid.dataFilter, mouseover.grid.dataFilter", function(e2) {
        e2.stopPropagation();
      });
      dataFilterProgress = jQuery('<div class="data_filter_progress__"></div>').css({
        "z-index": 2,
        "opacity": 0.3
      }).appendTo(panel);
      searchBox = panel.find(".data_filter_search__");
      panel.find(".data_filter_search_btn__").on("click.grid.dataFilter", function(e2) {
        e2.preventDefault();
        const searchWord = panel.find(".data_filter_search_word__").val();
        if (StringUtils.trimToNull(searchWord) !== null) {
          const retChkbxs = filterListBox.find("li:contains('" + searchWord + "')").show().find(":checkbox").prop("checked", true);
          filterListBox.find("li:not(:contains('" + searchWord + "'))").hide().find(":checkbox").prop("checked", false).last().trigger("do.grid.dataFilter");
          retChkbxs.each(function() {
            const chkboxEle = jQuery(this);
            chkboxEle.parent().children(".data_filter_cnt__").text("(" + String(chkboxEle.data("length")) + ")");
          });
        } else {
          filterListBox.find("li").show();
          filterListBox.find("li :checkbox").prop("checked", true).last().trigger("do.grid.dataFilter");
        }
      });
      panel.find(".data_filter_search_word__").on("keyup.grid.dataFilter", function(e2) {
        if ((e2.keyCode ? e2.keyCode : e2.which ? e2.which : e2.charCode) === 13) {
          panel.find(".data_filter_search_btn__").trigger("click");
        }
      });
      panel.find(".data_filter_checkall_box__ :checkbox").on("click.grid.dataFilter", function() {
        if (jQuery(this).is(":checked")) {
          let chkboxEle;
          panel.find(".data_filter_search_word__").val("");
          filterListBox.find("li").show();
          filterListBox.find("li :checkbox").prop("checked", true).each(function() {
            chkboxEle = jQuery(this);
            chkboxEle.parent().children(".data_filter_cnt__").text("(" + String(chkboxEle.data("length")) + ")");
          }).last().trigger("do.grid.dataFilter");
        } else {
          filterListBox.find("li .data_filter_checkbox__").prop("checked", false).last().trigger("do.grid.dataFilter");
          filterListBox.find("li .data_filter_cnt__").text("(0)");
        }
      });
      filterListBox = panel.find(".data_filter_list__").css({
        "max-height": opts.height - searchBox.outerHeight() - panel.find(".data_filter_checkall_box__").height() - 15
      });
      filterKeys = {};
      jQuery.each(clonedData, function(i, v) {
        if (filterKeys[id + "_" + v[id]] === void 0) {
          filterKeys[id + "_" + v[id]] = [i];
        } else {
          filterKeys[id + "_" + v[id]].push(i);
        }
      });
      if (!NC.isEmptyObject(filteredKeys) && clonedData.length !== opts.data.length) {
        filteredKeys = {};
        jQuery.each(opts.data, function(i, v) {
          if (filteredKeys[id + "_" + v[id]] === void 0) {
            filteredKeys[id + "_" + v[id]] = [i];
          } else {
            filteredKeys[id + "_" + v[id]].push(i);
          }
        });
      } else {
        filteredKeys = filterKeys;
      }
    }
    panel.show(0, function() {
      jQuery(this).removeClass("hidden__").addClass("visible__");
    });
    let itemSeq = 0;
    for (const k in filterKeys) {
      let filterItemEle;
      const length = filteredKeys[k] === void 0 ? 0 : filteredKeys[k].length;
      const prevFilterItemEle = filterListBox.find(".data_filter_item_" + String(itemSeq) + "__");
      if (prevFilterItemEle.length > 0) {
        filterItemEle = prevFilterItemEle;
        filterItemEle.find(".data_filter_cnt__").text("(" + String(length) + ")");
      } else {
        filterItemEle = jQuery('<li class="data_filter_item_' + String(itemSeq) + '__"><label><input type="checkbox" checked="checked" class="data_filter_checkbox__"><span class="data_filter_item_name__"></span><span class="data_filter_cnt__">(' + String(length) + ")</span></label></li>");
        filterItemEle.find(".data_filter_item_name__").text(k.replace(id + "_", ""));
        filterItemEle.find(".data_filter_checkbox__").data("rowIdxs", filterKeys[k]).data("length", length).on("click.grid.dataFilter, do.grid.dataFilter", function() {
          const thisEle2 = jQuery(this);
          if (thisEle2.is(":checked")) {
            thisEle2.parent().children(".data_filter_cnt__").text("(" + String(thisEle2.data("length")) + ")");
          } else {
            thisEle2.parent().children(".data_filter_cnt__").text("(0)");
          }
          let dataFilterListUnCheckedEles = theadCell.find(".data_filter_list__ li :checkbox:not(:checked)");
          if (dataFilterListUnCheckedEles.length > 0) {
            panel.find(".data_filter_checkall_box__ :checkbox").prop("checked", false);
            if (theadCell.find(".data_filter_list__ li :checkbox:checked").length > 0) {
              changeBtnIcon(theadCell, "part");
            } else {
              changeBtnIcon(theadCell, "empty");
            }
          } else {
            panel.find(".data_filter_checkall_box__ :checkbox").prop("checked", true);
            changeBtnIcon(theadCell, "full");
          }
          dataFilterListUnCheckedEles = theadCells.find(".data_filter_list__ li :checkbox:not(:checked)");
          let filterIdxs = [];
          dataFilterListUnCheckedEles.each(function() {
            jQuery.each(jQuery(this).data("rowIdxs"), function(i, v) {
              filterIdxs[v] = v;
            });
          });
          filterIdxs = jQuery.grep(filterIdxs, function(n) {
            return n === 0 || n;
          });
          dataFilterProgress.show().fadeTo(50, 0.5, function() {
            opts.scrollPaging.idx = 0;
            if (filterIdxs.length > 0 && filterIdxs.length !== clonedData.length) {
              const extrData = clonedData.slice(0);
              let bfrFilterIdx = -1;
              let addUnits = 0;
              let i;
              for (i = 0; i < filterIdxs.length; i++) {
                if (filterIdxs[i] - bfrFilterIdx === 1) {
                  addUnits++;
                } else {
                  extrData.splice(bfrFilterIdx - addUnits + 1 - (i - addUnits), addUnits);
                  addUnits = 1;
                }
                bfrFilterIdx = filterIdxs[i];
              }
              extrData.splice(bfrFilterIdx - addUnits + 1 - (i - addUnits), addUnits);
              self.bind(extrData, "grid.dataFilter");
            } else {
              if (filterIdxs.length > 0) {
                self.bind([], "grid.dataFilter");
              } else {
                self.bind(clonedData, "grid.dataFilter");
              }
            }
            theadCell.find(".data_filter_total_cnt__").text("(" + String(opts.data.length) + ")");
            setTimeout(function() {
              dataFilterProgress.hide();
            }, 0);
          });
        });
        filterListBox.append(filterItemEle);
      }
      if (length === 0) {
        filterItemEle.find(".data_filter_checkbox__").prop("checked", false);
      }
      itemSeq++;
    }
    jQuery(document).off("click.grid.dataFilter");
    jQuery(document).on("click.grid.dataFilter", function(e2) {
      if (jQuery(e2.target).closest(".data_filter_panel__, .btn_data_filter__").length === 0 && !jQuery(e2.target).hasClass("btn_data_filter__") && !jQuery(e2.target).hasClass("form__")) {
        const panel2 = thead.find(".data_filter_panel__.visible__");
        if (panel2.length > 0) {
          panel2.removeClass("visible__").addClass("hidden__");
          const eventNm = EventUtils.whichTransitionEvent(panel2);
          panel2.off(eventNm).one(eventNm, function(e3) {
            jQuery(this).hide();
            jQuery(document).off("click.grid.dataFilter");
          }).trigger("nothing");
        }
      }
    });
    bfrSelId = id;
  }).prependTo(theadCells.filter("[data-filter='true']:not(.grid_more_thead_col__)"));
});
__publicField(_Grid, "rowSpan", function(i, rowEle, bfRowEle, rowData, bfRowData, colId) {
  if (bfRowData !== void 0 && rowData[colId] === bfRowData[colId]) {
    const bfRowCell = bfRowEle.find("#" + colId).closest("td");
    let prevColId;
    const prevBfRowCell = bfRowCell.prev("td");
    if (prevBfRowCell.length > 0) {
      if (prevBfRowCell.attr("id")) {
        prevColId = prevBfRowCell.attr("id");
      } else {
        prevColId = prevBfRowCell.find("[id]").attr("id");
      }
    }
    if ((this.rowSpanIds.get().join("|") + "|").indexOf(prevColId) < 0 || bfRowCell.prev("td").hasClass("grid_rowspan__")) {
      const cell = rowEle.find("#" + colId).closest("td");
      let bfCellBgColor = bfRowCell.css("background-color");
      if (bfCellBgColor === "rgba(0, 0, 0, 0)" || bfCellBgColor === "transparent") {
        bfCellBgColor = bfRowCell.parent().css("background-color");
      }
      if (bfCellBgColor === "rgba(0, 0, 0, 0)" || bfCellBgColor === "transparent") {
        bfCellBgColor = bfRowCell.parent().parent().css("background-color");
      }
      bfRowCell.css("border-bottom-color", bfCellBgColor);
      bfRowCell.css("background-color", bfCellBgColor);
      cell.css("background-color", bfCellBgColor);
      bfRowCell.addClass("grid_rowspan__");
      const cldr = cell.children();
      if (cldr.length > 0) {
        cldr.hide();
      } else {
        cell.empty();
      }
    }
  }
});
__publicField(_Grid, "paste", function() {
  const self = this;
  self.tempRowEle.find("[id]").not(":input").attr("contenteditable", "true").on("keydown.grid.paste", function(e) {
    if (!e.ctrlKey) {
      e.target.blur();
      e.preventDefault();
      return false;
    }
  });
  self.context().on("paste", ".form__ [id]", function(e) {
    e.preventDefault();
    let content;
    if ("clipboardData" in window) {
      content = window.clipboardData.getData("Text");
      if (window.getSelection) {
        const selObj = window.getSelection();
        const selRange = selObj.getRangeAt(0);
        selRange.deleteContents();
        selRange.insertNode(document.createTextNode(content));
      }
    } else if (e.originalEvent.clipboardData) {
      content = (e.originalEvent || e).clipboardData.getData("text/plain");
    }
    if (!content && content.length) {
      return false;
    }
    const thisEle = jQuery(this);
    const currRowIndex = self.context(".form__").index(thisEle.closest(".form__"));
    const currCellIndex = self.context(".form__:eq(" + currRowIndex + ") [id]").index(thisEle);
    const rows = content.replace(/"((?:[^"]*(?:\r\n|\n\r|\n|\r))+[^"]+)"/mg, function(match, p1) {
      return p1.replace(/""/g, '"').replace(/\r\n|\n\r|\n|\r/g, " ");
    }).split(/\r\n|\n\r|\n|\r/g);
    const columns = self.tempRowEle.find("[id]").map(function() {
      return jQuery(this).attr("id");
    });
    for (let i = 0; i < rows.length; i++) {
      if (NC.isEmptyObject(rows[i])) continue;
      const data = rows[i].split("	");
      const rowEle = self.context(".form__:eq(" + String(currRowIndex + i) + ")");
      for (let j = 0; j < data.length; j++) {
        const colNm = columns.get(currCellIndex + j);
        const colEle = rowEle.find("#" + colNm);
        if (!colEle.prop("readonly") && !colEle.prop("disabled")) {
          self.val(currRowIndex + i, columns.get(currCellIndex + j), data[j]);
        }
      }
    }
  });
});
var Grid2 = _Grid;

// src/ui/components/tree/tree.js
var Tree = class {
  constructor(data, opts) {
    this.options = {
      data: type(data) === "array" ? jQuery(data) : data,
      context: null,
      key: null,
      val: null,
      level: null,
      // optional
      parent: null,
      folderSelectable: false,
      checkbox: false,
      onSelect: null,
      onCheck: null
    };
    try {
      jQuery.extend(this.options, Context.attr("ui").tree);
    } catch (e) {
      throw error("Tree", e);
    }
    if (isPlainObject(opts)) {
      UIUtils.wrapHandler(opts, "tree", "onSelect");
      UIUtils.wrapHandler(opts, "tree", "onCheck");
      opts.data = type(opts.data) === "array" ? jQuery(opts.data) : opts.data;
      jQuery.extend(this.options, opts);
      if (type(this.options.context) === "string") {
        this.options.context = jQuery(this.options.context);
      }
    } else {
      this.options.context = jQuery(opts);
    }
    this.options.context.addClass("tree__");
    this.options.context.instance("tree", this);
    DataSync.instance(this, true);
    return this;
  }
  data(selFlag) {
    if (selFlag === void 0) {
      return this.options.data.get();
    } else if (selFlag === false) {
      return this.options.data;
    } else if (selFlag === "selected") {
      const data = this.options.data;
      if (arguments.length > 1) {
        const args = Array.prototype.slice.call(arguments, 0);
        return this.options.context.find(".tree_active__").map(function() {
          args[0] = data[jQuery(this).closest("li").data("index")];
          return NC.json.mapFromKeys.apply(NC.json, args);
        }).get();
      } else {
        return this.options.context.find(".tree_active__").map(function() {
          return data[jQuery(this).closest("li").data("index")];
        }).get();
      }
    } else if (selFlag === "checked") {
      const data = this.options.data;
      if (arguments.length > 1) {
        const args = Array.prototype.slice.call(arguments, 0);
        return this.options.context.find(":checked").map(function() {
          args[0] = data[jQuery(this).closest("li").data("index")];
          return NC.json.mapFromKeys.apply(NC.json, args);
        }).get();
      } else {
        return this.options.context.find(":checked").map(function() {
          return data[jQuery(this).closest("li").data("index")];
        }).get();
      }
    } else if (selFlag === "checkedInLastNode") {
      const data = this.options.data;
      if (arguments.length > 1) {
        const args = Array.prototype.slice.call(arguments, 0);
        return this.options.context.find(".tree_last_node__ :checked").map(function() {
          args[0] = data[jQuery(this).closest("li").data("index")];
          return NC.json.mapFromKeys.apply(NC.json, args);
        }).get();
      } else {
        return this.options.context.find(".tree_last_node__ :checked").map(function() {
          return data[jQuery(this).closest("li").data("index")];
        }).get();
      }
    }
  }
  context(sel) {
    return sel !== void 0 ? this.options.context.find(sel) : this.options.context;
  }
  bind(data) {
    const opts = this.options;
    const self = this;
    if (data != null) {
      opts.data = type(data) === "array" ? jQuery(data) : data;
    }
    const rootNode = jQuery('<ul class="tree_level1_folder__"></ul>').appendTo(opts.context.empty());
    let isAleadyRoot = false;
    jQuery(opts.data).each(function(i, rowData) {
      if (rowData[opts.level] === 1 || !isAleadyRoot) {
        rootNode.append('<li data-index="' + i + '" class="tree_' + rowData[opts.val] + '__ tree_level1_node__ tree_close__"><span class="tree_icon__"></span>' + (opts.checkbox ? '<span class="tree_check__"><input type="checkbox" /></span>' : "") + '<a class="tree_key__" href="#"><span>' + rowData[opts.key] + '</span></a><ul id="' + rowData[opts.val] + '" class="tree_level' + (opts.level !== null ? String(Number(rowData[opts.level]) + 1) : "") + '_folder__"></ul></li>');
        isAleadyRoot = true;
      } else {
        rootNode.find("#" + rowData[opts.parent]).append('<li data-index="' + i + '" class="tree_' + rowData[opts.val] + "__ tree_level" + StringUtils.trimToEmpty(rowData[opts.level]) + '_node__ tree_close__"><span class="tree_icon__"></span>' + (opts.checkbox ? '<span class="tree_check__"><input type="checkbox" /></span>' : "") + '<a class="tree_key__" href="#"><span>' + rowData[opts.key] + '</span></a><ul id="' + rowData[opts.val] + '" class="tree_level' + (opts.level !== null ? String(Number(rowData[opts.level]) + 1) : "") + '_folder__"></ul></li>');
      }
    });
    const emptyUls = rootNode.find("ul:empty");
    emptyUls.parent().addClass("tree_last_node__");
    emptyUls.remove();
    if (opts.checkbox) {
      rootNode.on("click.tree", ".tree_check__ > :checkbox", function(e) {
        let checkFlag;
        const siblingNodesEle = jQuery(this).closest("li").parent().children("li");
        const parentNodesEle = jQuery(this).parents("li");
        const parentNodeEle = jQuery(this).closest("ul").parent();
        jQuery(this).removeClass("tree_auto_parents_select__");
        if (jQuery(this).is(":checked")) {
          jQuery(this).parent().siblings("ul").find(":not(:checked)").prop("checked", true);
          checkFlag = true;
        } else {
          jQuery(this).parent().siblings("ul").find(":checked").prop("checked", false);
          checkFlag = false;
        }
        const checkboxLength = siblingNodesEle.find(":checkbox").length;
        const checkedLength = siblingNodesEle.find(":checked").length;
        const parentNodeCheckboxEle = parentNodeEle.find("> span.tree_check__ > :checkbox");
        const parentNodesCheckedEle = parentNodesEle.not(":first").find("> span.tree_check__ > :checkbox");
        if (checkFlag) {
          if (checkedLength > 0) {
            if (checkedLength < checkboxLength) {
              parentNodesEle.find("> span.tree_check__ > :not(:checked)").prop("checked", true).addClass("tree_auto_parents_select__");
            } else if (checkedLength === checkboxLength) {
              parentNodeCheckboxEle.prop("checked", true).removeClass("tree_auto_parents_select__");
              parentNodeCheckboxEle.trigger("click.tree").trigger("click.tree");
            }
          }
        } else {
          if (checkedLength > 0 && checkedLength < checkboxLength) {
            parentNodesCheckedEle.addClass("tree_auto_parents_select__");
          } else if (checkedLength === 0) {
            parentNodesCheckedEle.prop("checked", false).removeClass("tree_auto_parents_select__");
            parentNodeCheckboxEle.trigger("click.tree").trigger("click.tree");
          }
        }
        if (opts.onCheck !== null && e.clientX > 0 && e.clientY > 0) {
          const closestLi = jQuery(this).closest("li");
          const checkedEle = jQuery(this).closest("ul").find(".tree_last_node__ :checked");
          opts.onCheck.call(
            self,
            closestLi.data("index"),
            closestLi,
            opts.data[closestLi.data("index")],
            checkedEle.map(function() {
              return jQuery(this).closest("li").data("index");
            }).get(),
            checkedEle,
            checkedEle.map(function() {
              return opts.data[jQuery(this).closest("li").data("index")];
            }).get(),
            checkFlag
          );
        }
      });
    }
    rootNode.on("click.tree", "li" + (!opts.folderSelectable ? ".tree_last_node__" : "") + " .tree_key__", function(e) {
      e.preventDefault();
      const parentLi = jQuery(this).parent("li");
      if (opts.onSelect !== null) {
        opts.onSelect.call(self, parentLi.data("index"), parentLi, opts.data[parentLi.data("index")]);
      }
      rootNode.find("li > a.tree_key__.tree_active__").removeClass("tree_active__");
      jQuery(this).addClass("tree_active__");
    });
    rootNode.on("click.tree", ".tree_icon__" + (!opts.folderSelectable ? ", li:not('.tree_last_node__') .tree_key__" : ""), function(e) {
      e.preventDefault();
      const parentLi = jQuery(this).parent("li");
      if (parentLi.find("> ul > li").length > 0) {
        if (parentLi.hasClass("tree_open__")) {
          parentLi.removeClass("tree_open__").addClass("tree_close__");
        } else {
          parentLi.removeClass("tree_close__").addClass("tree_open__");
        }
      }
    });
    if (opts.folderSelectable) {
      rootNode.on("click.tree", "li:not('.tree_last_node__') .tree_key__", function(e) {
        e.preventDefault();
      });
    }
    this.collapse(true);
    return this;
  }
  // val(row, key, val) {
  //     // TODO
  //     // notify
  //     return this;
  // };
  select(val) {
    const opts = this.options;
    if (val !== void 0) {
      opts.context.find(".tree_" + val + "__ > .tree_key__").trigger("click.tree");
      return this;
    } else {
      const activeNodeEle = opts.context.find(".tree_key__.tree_active__");
      if (opts.data.length > 0 && activeNodeEle.length > 0) {
        return opts.data[activeNodeEle.parent("li").data("index")][opts.val];
      }
    }
  }
  // check(vals) {
  //     // TODO
  //     return this;
  // };
  expand() {
    this.options.context.find("li.tree_close__:not(.tree_last_node__)").removeClass("tree_close__").addClass("tree_open__");
    return this;
  }
  collapse(isFirstNodeOpen) {
    this.options.context.find("li.tree_open__:not(.tree_last_node__)").removeClass("tree_open__").addClass("tree_close__");
    if (isFirstNodeOpen) {
      this.options.context.find("li.tree_close__:first").removeClass("tree_close__").addClass("tree_open__");
    }
    return this;
  }
  // update(row, key) {
  //     // TODO
  //     return this;
  // }
};

// src/ui-shell/notify/notify.js
var _Notify = class _Notify {
  constructor(position, opts) {
    if (!isEmptyObject(position) && opts === void 0) {
      return new _Notify(null, position);
    }
    this.options = {
      position: {
        top: 10,
        right: 10
      },
      container: jQuery("body"),
      context: null,
      displayTime: 7,
      alwaysOnTop: false,
      html: false,
      alwaysOnTopCalcTarget: "div, span, ul, p, nav, article, section, header, footer, aside"
    };
    try {
      jQuery.extend(this.options, Context.attr("ui.shell").notify);
      if (position) {
        if (NC.isWrappedSet(position)) {
          if (position.length > 0) {
            this.options.position = position.get(0);
          }
        } else {
          if (!isEmptyObject(position)) {
            this.options.position = position;
          }
        }
      }
    } catch (e) {
      error("Notify", e);
    }
    if (!isEmptyObject(opts)) {
      jQuery.extend(this.options, opts);
    }
    _Notify.wrapEle.call(this);
    this.options.context.instance("notify", this);
    return this;
  }
  context(sel) {
    return sel !== void 0 ? this.options.context.find(sel) : this.options.context;
  }
  add(msg, url) {
    const opts = this.options;
    const self = this;
    opts.context.css({
      top: "",
      right: "",
      bottom: "",
      left: ""
    });
    opts.context.css(opts.position);
    const msgEle = jQuery(url !== void 0 ? '<a href="#"></a>' : "<span></span>");
    msgEle[opts.html ? "html" : "text"](msg);
    if (url !== void 0) {
      msgEle.on("click.notify", function(e) {
        e.preventDefault();
        if (typeof url === "function") {
          url.call(this);
        } else {
          if (StringUtils.startsWith(url, "#")) {
            location.hash = url;
          } else {
            location.href = url;
          }
        }
      });
    }
    const msgBoxEle = jQuery("<div></div>", {
      "class": "notify_msg__"
    }).css({
      "display": "none",
      "position": "relative"
    }).append(msgEle).appendTo(opts.context).show().addClass("visible__");
    jQuery('<a href="#" class="notify_msg_close__" title="' + NC.message.get(opts.message, "close") + '"><span></span></a>').appendTo(msgBoxEle).on("click.notify", function(e) {
      e.preventDefault();
      self.remove(msgBoxEle);
    });
    setTimeout(function() {
      self.remove(msgBoxEle);
    }, opts.displayTime * 1e3);
    return this;
  }
  remove(msgBoxEle) {
    msgBoxEle.removeClass("visible__").addClass("hidden__");
    msgBoxEle.one(NC.event.whichTransitionEvent(msgBoxEle), function(e) {
      jQuery(this).remove();
    }).trigger("nothing");
    return this;
  }
};
__publicField(_Notify, "add", function(msg, url) {
  new _Notify().add(msg, url);
});
__publicField(_Notify, "wrapEle", function() {
  const opts = this.options;
  if (opts.container.find(".notify__").length > 0) {
    opts.context = opts.container.find(".notify__");
  } else {
    opts.context = jQuery("<div></div>").addClass("notify__").css({
      "position": "fixed"
    }).appendTo(opts.container);
  }
  if (opts.alwaysOnTop) {
    opts.context.css("z-index", String(ElementUtils.maxZindex(jQuery(opts.alwaysOnTopCalcTarget)) + 1));
  }
});
var Notify2 = _Notify;

// src/ui-shell/docs/docs.js
var _Docs = class _Docs {
  constructor(obj, opts) {
    this.options = {
      context: obj.length > 0 ? obj : null,
      multi: true,
      maxStateful: 0,
      // 0 is unlimit
      maxTabs: 0,
      // 0 is unlimit
      addLast: false,
      tabScroll: false,
      closeAllRedirectURL: null,
      tabScrollCorrection: {
        rightCorrectionPx: 0
      },
      msgContext: jQuery(window),
      entireLoadIndicator: false,
      entireLoadScreenBlock: false,
      entireLoadExcludeURLs: [],
      entireLoadRequestCnt: 0,
      entireLoadRequestMaxCnt: 0,
      onBeforeLoad: null,
      onLoad: null,
      onBeforeEntireLoad: null,
      onErrorEntireLoad: null,
      onEntireLoad: null,
      onBeforeActive: null,
      onActive: null,
      onBeforeInactive: null,
      onInactive: null,
      onBeforeRemoveState: null,
      onRemoveState: null,
      onBeforeRemove: null,
      onRemove: null,
      saveHistory: true,
      docs: {},
      alwaysOnTop: false,
      alwaysOnTopCalcTarget: "div, span, ul, p, nav, article, section, header, footer, aside",
      order: [],
      loadedDocId: null
    };
    try {
      jQuery.extend(true, this.options, Context.attr("ui.shell").docs);
    } catch (e) {
      error("Docs", e);
    }
    jQuery.extend(this.options, opts);
    const self = this;
    if (self.options.onBeforeEntireLoad !== null || self.options.onEntireLoad !== null || self.options.entireLoadIndicator || self.options.entireLoadScreenBlock) {
      const entireLoadExcludeURLs = "|" + this.options.entireLoadExcludeURLs.join("|") + "|";
      Context.attr("architecture").comm.filters.docsFilter__ = {
        "beforeSend": function(request, xhr, settings) {
          if (self.options.loadedDocId !== null) {
            if (self.options.entireLoadRequestCnt === 0) {
              if (self.options.onBeforeEntireLoad !== null) {
                self.options.onBeforeEntireLoad.call(self, self.options.loadedDocId);
              }
              _Docs.createLoadIndicator.call(self);
            }
            if (entireLoadExcludeURLs.indexOf(request.options.url) < 0) {
              self.options.entireLoadRequestCnt++;
              if (self.options.entireLoadIndicator) {
                self.options.entireLoadRequestMaxCnt++;
              }
            }
            this.errorHandlers.push(function(e, request2, xhr2, textStatus, callback) {
              if (self.options.onErrorEntireLoad !== null) {
                self.options.onErrorEntireLoad.call(self, e, request2, xhr2, textStatus, callback);
              }
              _Docs.errorLoadIndicator.call(self);
              self.options.entireLoadRequestCnt = 0;
              if (self.options.entireLoadIndicator) {
                self.options.entireLoadRequestMaxCnt = 0;
              }
            });
          }
        },
        "complete": function(request, xhr, textStatus) {
          if (self.options.loadedDocId !== null) {
            if (entireLoadExcludeURLs.indexOf(request.options.url) < 0) {
              self.options.entireLoadRequestCnt--;
              if (self.options.entireLoadIndicator) {
                _Docs.updateLoadIndicator.call(self);
              }
            }
            if (self.options.entireLoadRequestCnt <= 0) {
              if (self.options.onEntireLoad !== null) {
                self.options.onEntireLoad.call(self, self.options.loadedDocId, self.options.entireLoadRequestCnt, self.options.entireLoadRequestMaxCnt);
              }
              _Docs.removeLoadIndicator.call(self);
              self.options.entireLoadRequestMaxCnt = 0;
              self.options.entireLoadRequestCnt = 0;
            }
          }
        }
      };
      Communicator.resetFilterConfig();
    }
    this.request = new Communicator.request(this);
    _Docs.wrapEle.call(this);
    if (this.options.tabScroll) {
      _Docs.wrapScroll.call(this);
    }
    this.options.context.instance("docs", this);
    return this;
  }
  context(sel) {
    return sel !== void 0 ? this.options.context.find(sel) : this.options.context;
  }
  add(docId, docNm, docOpts) {
    const opts = this.options;
    const self = this;
    let beforeTabContents = opts.context.find("> .docs_contents__." + docId + "__");
    if (beforeTabContents.length > 0 && beforeTabContents.hasClass("remove__")) {
      opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId + "__").remove();
      beforeTabContents.find("*").off();
      beforeTabContents.remove();
      beforeTabContents = void 0;
    }
    if (opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId + "__").length === 0) {
      if (opts.maxTabs !== 0 && opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__").not(".remove__").length >= opts.maxTabs) {
        Notify({
          html: true
        }).add(NC.message.get(opts.message, "maxTabs", [String(opts.maxTabs)]));
        return this;
      }
      const defer = jQuery.Deferred().done(function(docId2, docNm2, docOpts2) {
        opts.docs[docId2] = {
          docId: docId2,
          docNm: docNm2,
          url: null,
          urlSync: true,
          onBeforeLoad: null,
          onLoad: null,
          onBeforeActive: null,
          onActive: null,
          onBeforeInactive: null,
          onInactive: null,
          onBeforeRemoveState: null,
          onRemoveState: null,
          onBeforeRemove: null,
          onRemove: null,
          stateless: false
        };
        jQuery.extend(opts.docs[docId2], docOpts2);
        const docsTabContext = opts.context.find("> .docs_tab_context__");
        if (opts.multi) {
          const tab = jQuery("<li/>", {
            "class": "docs_tab__ " + opts.docs[docId2].docId + "__ inactive__"
          }).data("docOpts", opts.docs[docId2]);
          jQuery("<a/>", {
            "href": "#",
            "class": "docs_tab_active_btn__",
            "title": NC.message.get(opts.message, "selDocument", [opts.docs[docId2].docNm])
          }).append(jQuery("<span></span>", {
            "text": opts.docs[docId2].docNm
          })).on("click.docs", function(e) {
            e.preventDefault();
            self.active(docId2, jQuery(this).closest(".docs_tab_list__").length > 0);
          }).appendTo(tab);
          jQuery("<a/>", {
            "href": "#",
            "class": "docs_tab_close_btn__",
            "title": NC.message.get(opts.message, "close")
          }).append("<span></span>").on("click.docs", function(e) {
            e.preventDefault();
            if (jQuery(this).closest(".docs_tab_list__").length === 0) {
              e.stopPropagation();
            }
            self.remove(docId2);
          }).appendTo(tab);
          if (opts.addLast) {
            tab.appendTo(docsTabContext.find("> .docs_tabs__"));
          } else {
            tab.prependTo(docsTabContext.find("> .docs_tabs__"));
          }
          _Docs.inactivateTab.call(self);
          _Docs.closeBtnControl.call(self);
        }
        _Docs.loadContent.call(self, opts.docs[docId2], function() {
          this.active(docId2, false, true);
        });
      });
      self.removeState(function() {
        defer.resolve(docId, docNm, docOpts);
      });
    } else {
      this.active(docId);
    }
    return this;
  }
  active(docId, isFromDocsTabList, isNotLoaded) {
    const opts = this.options;
    const self = this;
    if (opts.docs[docId] === void 0) {
      warn('[Docs]"' + docId + '" is invalid document id(docId)');
      return this;
    }
    if (opts.multi) {
      if (opts.docs[docId].stateless) {
        self.removeState(function() {
          _Docs.loadContent.call(this, opts.docs[docId], function() {
            opts.docs[docId].stateless = false;
            opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId + "__").removeClass("stateless__");
            self.active(docId, false, true);
          });
        });
      } else {
        _Docs.inactivateTab.call(this);
        _Docs.hideTabContents.call(this, docId);
        _Docs.activateTab.call(self, docId, isFromDocsTabList, isNotLoaded);
        _Docs.showTabContents.call(this, docId);
      }
      opts.order = jQuery(opts.order).filter(function(i, val) {
        return val !== docId;
      }).get();
      opts.order.unshift(docId);
      if (opts.order.length > opts.maxStateful) {
        opts.order.pop();
      }
      if (!opts.docs[docId].stateless && opts.onActive !== null) {
        opts.onActive.call(this, docId, isFromDocsTabList === void 0 ? false : isFromDocsTabList, isNotLoaded === void 0 ? false : isNotLoaded);
      }
      if (!opts.docs[docId].stateless && opts.docs[docId].onActive !== null) {
        opts.docs[docId].onActive.call(this, docId, isFromDocsTabList === void 0 ? false : isFromDocsTabList, isNotLoaded === void 0 ? false : isNotLoaded);
      }
    } else {
      _Docs.hideTabContents.call(this, docId);
      _Docs.showTabContents.call(this, docId);
    }
    return this;
  }
  removeState(docId, callback) {
    const opts = this.options;
    if (typeof docId === "function") {
      callback = docId;
      docId = void 0;
    }
    if (docId === void 0) {
      docId = opts.order[opts.order.length - 1];
    }
    if (opts.maxStateful !== 0 && opts.order.length >= opts.maxStateful) {
      const targetTabEle = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId + "__");
      const targetTabDocOpts = targetTabEle.data("docOpts");
      if (opts.onBeforeRemoveState !== null) {
        opts.onBeforeRemoveState.call(this, docId);
      }
      if (targetTabDocOpts.onBeforeRemoveState !== null) {
        targetTabDocOpts.onBeforeRemoveState.call(this, docId);
      }
      const self = this;
      Context.attr("ui").alert.container = opts.context.find("> .docs_contents__:visible");
      opts.msgContext.alert({
        html: true,
        confirm: true,
        msg: NC.message.get(opts.message, "maxStateful", [targetTabDocOpts.docNm, String(opts.maxStateful)]),
        onOk: function() {
          targetTabEle.addClass("stateless__");
          targetTabDocOpts.stateless = true;
          opts.context.find("> .docs_contents__." + docId + "__").remove();
          if (opts.onRemoveState !== null) {
            opts.onRemoveState.call(this, docId);
          }
          if (targetTabDocOpts.onRemoveState !== null) {
            targetTabDocOpts.onRemoveState.call(this, docId);
          }
          callback.call(self, docId);
        }
      }).show();
    } else {
      callback.call(this, docId);
    }
    return this;
  }
  remove(docId, unconditional) {
    const opts = this.options;
    if (opts.docs[docId] === void 0) {
      warn('[Docs]"' + docId + '" is invalid document id(docId)');
      return this;
    }
    const self = this;
    const targetTabEle = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId + "__");
    const targetTabDocOpts = targetTabEle.data("docOpts");
    if (opts.onBeforeRemove !== null) {
      opts.onBeforeRemove.call(this, docId);
    }
    if (targetTabDocOpts.onBeforeRemove !== null) {
      targetTabDocOpts.onBeforeRemove.call(this, docId);
    }
    const dataChangedInputEle = opts.context.find("> .docs_contents__." + docId + "__ .data_changed__");
    if (dataChangedInputEle.length === 0 || unconditional === true) {
      _Docs.remove.call(self, targetTabEle);
    } else {
      opts.msgContext.alert({
        msg: NC.message.get(opts.message, "closeConf", [opts.docs[docId].docNm]),
        confirm: true,
        onOk: function() {
          _Docs.remove.call(self, targetTabEle);
        },
        onCancel: function() {
          dataChangedInputEle.get(0).focus();
        }
      }).show();
    }
    return this;
  }
  doc(docId) {
    if (docId !== void 0) {
      return this.options.docs[docId];
    }
    return this.options.docs;
  }
  cont(docId) {
    return this.context(".docs_contents__." + docId + "__ > .view_context__").instance("cont");
  }
  reload(docId, callback) {
    const cont = this.cont(docId);
    if (!cont) {
      warn('[Docs]"' + docId + '" is invalid document id(docId)');
      return this;
    }
    const comm = cont.request.options.target.comm(cont.request.options.url);
    comm.request = cont.request;
    jQuery.extend(comm.request.attrObj, this.request.attrObj);
    this.request.attrObj = {};
    comm.submit(callback);
    return this;
  }
};
__publicField(_Docs, "createLoadIndicator", function() {
  const opts = this.options;
  let maxZindex2;
  if (opts.entireLoadScreenBlock) {
    maxZindex2 = ElementUtils.maxZindex(jQuery(opts.alwaysOnTopCalcTarget).not(".entire_load_screen_block__, .entire_load_indicator__")) + 1;
    let entireLoadScreenBlock = jQuery(".entire_load_screen_block__");
    if (entireLoadScreenBlock.length > 0) {
      entireLoadScreenBlock.removeClass("hidden__").show().css("z-index", String(maxZindex2));
    } else {
      const entireLoadScreenBlock2 = jQuery('<div class="entire_load_screen_block__"></div>').css("z-index", String(maxZindex2)).on("click", function(e) {
        e.stopPropagation();
      });
      entireLoadScreenBlock2.appendTo("body").on(NC.event.whichTransitionEvent(entireLoadScreenBlock2), function(e) {
        jQuery(this).hide().removeClass("hidden__");
      }).trigger("nothing");
    }
    entireLoadScreenBlock = void 0;
  }
  if (opts.entireLoadIndicator) {
    if (maxZindex2 === void 0) {
      maxZindex2 = ElementUtils.maxZindex(jQuery(opts.alwaysOnTopCalcTarget).not(".entire_load_screen_block__, .entire_load_indicator__")) + 1;
    } else {
      maxZindex2 += 1;
    }
    let entireLoadIndicator = opts.context.find("> .entire_load_indicator__");
    if (entireLoadIndicator.length > 0) {
      entireLoadIndicator.css("z-index", String(maxZindex2)).removeClass("hidden__").show();
      entireLoadIndicator.find("> .entire_load_indicator_bar__").css("left", "");
    } else {
      const entireLoadIndicator2 = jQuery('<div class="entire_load_indicator__"><div class="entire_load_indicator_bar__"></div></div>').on("click", function(e) {
        e.stopPropagation();
      }).css("z-index", String(maxZindex2));
      opts.context.find(".docs_tab_context__").after(entireLoadIndicator2);
    }
    entireLoadIndicator = void 0;
  }
  return this;
});
__publicField(_Docs, "updateLoadIndicator", function(entireLoadRequestCnt, entireLoadRequestMaxCnt) {
  const opts = this.options;
  opts.context.find("> .entire_load_indicator__ > .entire_load_indicator_bar__").css("left", "-" + (entireLoadRequestCnt ? entireLoadRequestCnt : opts.entireLoadRequestCnt) * 100 / (entireLoadRequestMaxCnt ? entireLoadRequestMaxCnt : opts.entireLoadRequestMaxCnt) + "%");
  return this;
});
__publicField(_Docs, "removeLoadIndicator", function() {
  const opts = this.options;
  if (opts.entireLoadIndicator) {
    const entireLoadIndicator = opts.context.find("> .entire_load_indicator__");
    entireLoadIndicator.addClass("hidden__").one(NC.event.whichTransitionEvent(entireLoadIndicator), function(e) {
      jQuery(this).hide();
    }).trigger("nothing");
    entireLoadIndicator.find("> .entire_load_indicator_bar__").css("left", "0");
  }
  if (opts.entireLoadScreenBlock) {
    jQuery(".entire_load_screen_block__").trigger("nothing");
  }
  return this;
});
__publicField(_Docs, "errorLoadIndicator", function() {
  const opts = this.options;
  if (opts.entireLoadIndicator) {
    const entireLoadIndicator = opts.context.find("> .entire_load_indicator__");
    entireLoadIndicator.one(NC.event.whichTransitionEvent(entireLoadIndicator), function(e) {
      jQuery(this).hide();
    }).trigger("nothing");
    opts.context.find("> .entire_load_indicator__ > .entire_load_indicator_bar__").css("left", "");
  }
  if (opts.entireLoadScreenBlock) {
    jQuery(".entire_load_screen_block__").trigger("nothing");
  }
  return this;
});
__publicField(_Docs, "wrapEle", function() {
  const opts = this.options;
  opts.context.addClass("docs__");
  if (BrowserUtils.is("ios")) {
    opts.context.addClass("ios__");
  }
  if (BrowserUtils.is("android")) {
    opts.context.addClass("android__");
  }
  if (opts.multi) {
    opts.context.addClass("multi__");
    const docsTabContext = jQuery("<nav></nav>", {
      "class": "docs_tab_context__"
    }).appendTo(opts.context);
    jQuery("<ul/>", {
      "class": "docs_tabs__"
    }).appendTo(docsTabContext);
    const docsTabUtils = jQuery("<ul/>", {
      "class": "docs_tab_utils__"
    }).appendTo(docsTabContext);
    const docsTabCloseAllItem = jQuery("<li/>", {
      "class": "docs_tab_close_all_item__"
    });
    const self = this;
    jQuery("<a/>", {
      "href": "#",
      "text": NC.message.get(opts.message, "closeAll"),
      "title": NC.message.get(opts.message, "closeAllTitle")
    }).on("click.docs", function(e) {
      e.preventDefault();
      if (opts.closeAllRedirectURL !== null) {
        opts.msgContext.alert({
          msg: NC.message.get(opts.message, "closeAllDQ"),
          confirm: true,
          onOk: function() {
            window.location.href = opts.closeAllRedirectURL;
          }
        }).show();
      } else {
        const activeTab = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__.active__");
        const activeSiblingTabs = activeTab.siblings();
        if (activeSiblingTabs.length > 0) {
          opts.msgContext.alert({
            msg: NC.message.get(opts.message, "closeAllQ"),
            confirm: true,
            onOk: function() {
              const docId = activeTab.data("docOpts").docId;
              activeSiblingTabs.remove();
              opts.context.find("> .docs_contents__." + docId + "__").siblings(".docs_contents__").remove();
              _Docs.closeBtnControl.call(self);
              _Docs.clearScrollPosition.call(self, 0);
            }
          }).show();
        }
      }
    }).appendTo(docsTabCloseAllItem);
    docsTabCloseAllItem.appendTo(docsTabUtils);
    const docsTabListItem = jQuery("<li/>", {
      "class": "docs_tab_list_item__"
    });
    const docsTabListBtn = jQuery("<a/>", {
      "href": "#",
      "text": NC.message.get(opts.message, "docList"),
      "title": NC.message.get(opts.message, "docListTitle")
    }).on("click.docs", function(e) {
      e.preventDefault();
      e.stopPropagation();
      docsTabListBtn.find(".docs_tab_list__").remove();
      const docsTabList = jQuery("<ul/>").addClass("docs_tab_list__ hidden__").hide();
      if (opts.alwaysOnTop) {
        docsTabList.css("z-index", String(ElementUtils.maxZindex(jQuery(opts.alwaysOnTopCalcTarget)) + 1));
      }
      if (!docsTabList.hasClass("visible__")) {
        docsTabList.empty().append(opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__:not('.remove__')").clone(true, true)).addClass("hidden__").appendTo(docsTabListBtn);
        setTimeout(function() {
          docsTabList.removeClass("hidden__").show().addClass("visible__");
        }, 0);
      }
      jQuery(document).on("click.docs", function(e2) {
        jQuery(document).off("click.docs");
        docsTabList.removeClass("visible__").addClass("hidden__");
        docsTabList.one(NC.event.whichTransitionEvent(docsTabList), function(e3) {
          jQuery(this).remove();
        }).trigger("nothing");
      });
      jQuery(document).on("touchstart.docs", function(e2) {
        jQuery(document).off("touchstart.docs");
        if (jQuery(e2.target).closest(".docs_tab_list__").length === 0) {
          docsTabList.removeClass("visible__").addClass("hidden__");
          docsTabList.one(NC.event.whichTransitionEvent(docsTabList), function(e3) {
            jQuery(this).remove();
          }).trigger("nothing");
        }
      });
    });
    docsTabListBtn.appendTo(docsTabListItem);
    docsTabListItem.appendTo(docsTabUtils);
  }
});
__publicField(_Docs, "wrapScroll", function() {
  const opts = this.options;
  const eventNameSpace = ".docs.scroll";
  const tabContext = opts.context.find(">nav");
  const tabContainerEle = tabContext.find(">ul.docs_tabs__");
  const tabUtilsEleWidth = tabContext.find(">ul.docs_tab_utils__").outerWidth() + opts.tabScrollCorrection.rightCorrectionPx;
  let lastDistance = 0;
  jQuery(window).on("resize" + eventNameSpace, function() {
    let ulWidth = 0;
    tabContainerEle.find(">li").each(function() {
      ulWidth += jQuery(this).outerWidth() + parseInt(StringUtils.trimToZero(jQuery(this).css("margin-left"))) + parseInt(StringUtils.trimToZero(jQuery(this).css("margin-right")));
    });
    if (ulWidth > 0 && ulWidth > tabContext.width() - tabUtilsEleWidth) {
      tabContainerEle.addClass("docs_scroll__").width(ulWidth);
    } else {
      tabContainerEle.css("width", "");
    }
  }).trigger("resize" + eventNameSpace);
  jQuery(window).trigger("resize" + eventNameSpace);
  let sPageX;
  const prevDefGap = 77;
  const nextDefGap = 77;
  let isMoved = false;
  NU.ui.draggable.events.call(tabContainerEle, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) {
    tabContainerEle_.removeClass("effect__");
    if (tabContainerEle_.outerWidth() <= tabContext.innerWidth() - tabUtilsEleWidth) {
      return false;
    }
    sPageX = pageX - parseInt(tabContainerEle_.css("margin-left"));
  }, function(e, tabContainerEle_, pageX, pageY) {
    const distance = (sPageX - pageX) * -1;
    if (distance > prevDefGap || tabContext.outerWidth() - tabUtilsEleWidth >= tabContainerEle_.width() + nextDefGap + distance) {
      return false;
    } else {
      lastDistance = distance;
      tabContainerEle_.css("margin-left", distance + "px");
      isMoved = true;
    }
  }, function(e, tabContainerEle_) {
    if (isMoved) {
      if (lastDistance >= 0 && lastDistance <= prevDefGap) {
        lastDistance = 0;
      } else if (nextDefGap >= tabContainerEle_.width() - (tabContext.outerWidth() - tabUtilsEleWidth + lastDistance * -1)) {
        lastDistance = (tabContainerEle_.width() - tabContext.outerWidth() - 1) * -1 - tabUtilsEleWidth;
      }
      tabContainerEle_.addClass("effect__").css("margin-left", lastDistance + "px");
      isMoved = false;
    }
  });
});
__publicField(_Docs, "clearScrollPosition", function(tabEle, isActive) {
  const opts = this.options;
  const tabContext = opts.context.find(">nav");
  const tabContainerEle = tabContext.find(">ul.docs_tabs__");
  let marginLeft;
  if (type(tabEle) === "number") {
    marginLeft = tabEle;
  } else {
    const tabUtilsEleWidth = tabContext.find(">ul.docs_tab_utils__").outerWidth() + opts.tabScrollCorrection.rightCorrectionPx;
    const tabContainerEleMarginLeft = parseInt(StringUtils.trimToZero(tabContainerEle.css("margin-left")));
    if (tabEle.position().left + tabEle.outerWidth() + tabContainerEleMarginLeft > tabContext.innerWidth() - tabUtilsEleWidth || tabContainerEleMarginLeft > 0 && tabContainerEle.outerWidth() > tabContext.innerWidth() - tabUtilsEleWidth) {
      marginLeft = (tabEle.position().left + 1 + tabEle.outerWidth() - tabContext.outerWidth() + tabUtilsEleWidth) * -1;
    } else if (tabEle.position().left < tabContainerEleMarginLeft * -1) {
      marginLeft = tabEle.position().left * -1;
    } else if (tabContainerEle.outerWidth() < tabContext.innerWidth() - tabUtilsEleWidth) {
      marginLeft = 0;
    } else if (tabContext.innerWidth() > tabContainerEle.outerWidth() - tabContainerEleMarginLeft * -1 - tabUtilsEleWidth && tabContainerEleMarginLeft < 0 && !isActive) {
      tabEle = tabContainerEle.find(".docs_tab__:last");
      marginLeft = (tabEle.position().left + 1 + tabEle.outerWidth() - tabContext.outerWidth() + tabUtilsEleWidth) * -1;
    }
  }
  if (marginLeft !== void 0) {
    tabContainerEle.addClass("effect__").css("margin-left", String(marginLeft) + "px");
  }
});
__publicField(_Docs, "loadContent", function(docOpts, callback) {
  const opts = this.options;
  opts.loadedDocId = docOpts.docId;
  if (!opts.multi) {
    const docsContents = opts.context.find("section.docs_contents__");
    if (docsContents.length > 0) {
      docsContents.one(NC.event.whichTransitionEvent(docsContents), function(e) {
        jQuery(this).remove();
      }).trigger("nothing");
    }
  }
  const target = jQuery("<section></section>", {
    "class": "docs_contents__ " + docOpts.docId + "__ hidden__"
  }).appendTo(opts.context);
  const self = this;
  if (opts.onBeforeLoad !== null) {
    opts.onBeforeLoad.call(this, docOpts.docId, target);
  }
  if (docOpts.onBeforeLoad !== null) {
    docOpts.onBeforeLoad.call(this, docOpts.docId, target);
  }
  const comm = new Communicator({
    url: docOpts.url,
    urlSync: docOpts.urlSync,
    contentType: "text/html; charset=UTF-8",
    dataType: "html",
    type: "GET",
    target
  });
  jQuery.extend(comm.request.attrObj, this.request.attrObj);
  this.request.attrObj = {};
  comm.submit(function(document2) {
    Context.attr("architecture").page.context = Context.attr("ui").alert.container = target;
    const cont = target.html(document2).children(".view_context__:last").instance("cont");
    if (cont !== void 0) {
      cont.caller = self;
      Controller.trInit.call(this, cont, this.request);
      cont.docOpts = docOpts;
    }
    if (callback !== void 0) {
      callback.call(self, target);
    }
    if (opts.onLoad !== null) {
      opts.onLoad.call(self, docOpts.docId);
    }
    if (docOpts.onLoad !== null) {
      docOpts.onLoad.call(self, docOpts.docId);
    }
  });
});
__publicField(_Docs, "closeBtnControl", function() {
  const opts = this.options;
  const tabs = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__:not('.remove__')");
  if (tabs.length === 1) {
    tabs.find("> .docs_tab_close_btn__").hide();
  } else {
    tabs.find("> .docs_tab_close_btn__:not(':visible')").show();
  }
});
__publicField(_Docs, "inactivateTab", function() {
  const opts = this.options;
  const currActiveTab = opts.context.find(".docs_tab_context__ > .docs_tabs__ > .docs_tab__.active__");
  const currActiveTabDocOpts = currActiveTab.data("docOpts");
  if (currActiveTabDocOpts && currActiveTab.length > 0) {
    if (opts.onBeforeInactive !== null) {
      opts.onBeforeInactive.call(this, currActiveTabDocOpts.docId);
    }
    if (currActiveTabDocOpts.onBeforeInactive !== null) {
      currActiveTabDocOpts.onBeforeInactive.call(this, currActiveTabDocOpts.docId);
    }
    currActiveTab.removeClass("active__").addClass("inactive__");
    if (opts.onInactive !== null) {
      opts.onInactive.call(this, currActiveTabDocOpts.docId);
    }
    if (currActiveTabDocOpts.onInactive !== null) {
      currActiveTabDocOpts.onInactive.call(this, currActiveTabDocOpts.docId);
    }
  }
});
__publicField(_Docs, "activateTab", function(docId_, isFromDocsTabList_, isNotLoaded_) {
  const opts = this.options;
  const tabToActivate = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__." + docId_ + "__");
  if (isFromDocsTabList_ && !opts.tabScroll) {
    tabToActivate.prependTo(tabToActivate.parent());
  }
  if (opts.tabScroll) {
    _Docs.clearScrollPosition.call(this, tabToActivate, true);
  }
  if (opts.onBeforeActive !== null) {
    opts.onBeforeActive.call(this, docId_, isFromDocsTabList_ === void 0 ? false : isFromDocsTabList_, isNotLoaded_ === void 0 ? false : isNotLoaded_);
  }
  if (opts.docs[docId_].onBeforeActive !== null) {
    opts.docs[docId_].onBeforeActive.call(this, docId_, isFromDocsTabList_ === void 0 ? false : isFromDocsTabList_, isNotLoaded_ === void 0 ? false : isNotLoaded_);
  }
  setTimeout(function() {
    tabToActivate.removeClass("inactive__").addClass("active__");
  }, 0);
});
__publicField(_Docs, "showTabContents", function(docId_) {
  const opts = this.options;
  const tabContents_ = opts.context.find("> .docs_contents__." + docId_ + "__");
  if (tabContents_.hasClass("visible__")) {
    return false;
  }
  Context.attr("architecture").page.context = Context.attr("ui").alert.container = tabContents_;
  tabContents_.show(0, function() {
    tabContents_.addClass("visible__").one(NC.event.whichTransitionEvent(tabContents_), function(e) {
      tabContents_.siblings(".docs_contents__.hidden__").hide();
    }).removeClass("hidden__");
  });
});
__publicField(_Docs, "hideTabContents", function(docId_) {
  const opts = this.options;
  const tabContents_ = opts.context.find("> .docs_contents__." + docId_ + "__");
  if (tabContents_.siblings(".docs_contents__.visible__").length > 0) {
    opts.context.css("position", "relative");
    tabContents_.siblings(".docs_contents__.visible__").removeClass("visible__").one(NC.event.whichTransitionEvent(tabContents_), function(e) {
      opts.context.css("position", "");
      if (jQuery(this).hasClass("hidden__")) {
        jQuery(this).hide();
      }
    }).addClass("hidden__").trigger("nothing");
  }
});
__publicField(_Docs, "remove", function(targetTabEle) {
  const opts = this.options;
  const targetTabDocOpts = targetTabEle.data("docOpts");
  const targetTabPrevEle = targetTabEle.prev();
  const targetTabNextEle = targetTabEle.next();
  const isActiveTargetTabEle = targetTabEle.hasClass("active__");
  if (isActiveTargetTabEle) {
    targetTabEle.addClass("remove__");
    let isRemoved = false;
    targetTabEle.one(NC.event.whichTransitionEvent(targetTabEle), function(e) {
      if (!isRemoved) {
        jQuery(this).remove();
        isRemoved = true;
      }
    }).trigger("nothing");
    setTimeout(function() {
      if (!isRemoved) {
        targetTabEle.remove();
        isRemoved = true;
      }
    }, NC.event.getMaxDuration(targetTabEle, "transition-duration"));
  } else {
    targetTabEle.remove();
  }
  let targetTabContents = opts.context.find("> .docs_contents__." + targetTabDocOpts.docId + "__");
  if (targetTabContents.hasClass("visible__")) {
    targetTabContents.addClass("remove__");
    targetTabContents.one(NC.event.whichTransitionEvent(targetTabContents), function(e) {
      jQuery(this).find("*").off();
      jQuery(this).remove();
      targetTabContents = void 0;
    }).trigger("nothing");
  } else {
    targetTabContents.find("*").off();
    targetTabContents.remove();
    targetTabContents = void 0;
  }
  _Docs.closeBtnControl.call(this);
  delete opts.docs[targetTabDocOpts.docId];
  opts.order = jQuery(opts.order).filter(function(i, val) {
    return val !== targetTabDocOpts.docId;
  }).get();
  if (opts.onRemove !== null) {
    opts.onRemove.call(this, targetTabDocOpts.docId);
  }
  if (targetTabDocOpts.onRemove !== null) {
    targetTabDocOpts.onRemove.call(this, targetTabDocOpts.docId);
  }
  if (isActiveTargetTabEle) {
    if (targetTabPrevEle.length > 0) {
      targetTabPrevEle.find(".docs_tab_active_btn__").trigger("click");
    } else {
      if (targetTabNextEle.length > 0) {
        targetTabNextEle.find(".docs_tab_active_btn__").trigger("click");
      }
    }
  } else {
    if (opts.tabScroll) {
      const activatedTab = opts.context.find("> .docs_tab_context__ > .docs_tabs__ > .docs_tab__.active__");
      if (activatedTab.length > 0) {
        _Docs.clearScrollPosition.call(this, activatedTab);
      }
    }
  }
});
var Docs = _Docs;

// src/code/inspection.js
var _Code = class _Code {
};
__publicField(_Code, "test", function(codes, rules) {
  if (codes.indexOf("<script") < 0) {
    return false;
  }
  const report = [];
  if (!Context.attr("code") || Context.attr("code") && !Context.attr("code").inspection) {
    throw error('Define Natural-CODE options and message resources in Context.attr("code").inspection in the natural.config.js file.');
  }
  if (rules) {
    jQuery(rules).each(function() {
      _Code.rules[this](codes, Context.attr("code").inspection.excludes, report);
    });
  } else {
    for (const k in _Code.rules) {
      _Code.rules[k](codes, Context.attr("code").inspection.excludes, report);
    }
  }
  return report;
});
__publicField(_Code, "rules", {
  /**
   * Detect code that does not specify view in the context of jQuery Selector.
   */
  "NoContextSpecifiedInSelector": function(codes, excludes, report) {
    const regex = /\/{2}.*|[N$]\((.*?)\)(.*)/gm;
    let match;
    while (match = regex.exec(codes)) {
      let isExclude = false;
      jQuery(excludes).each(function(i, str) {
        if (match[0].indexOf(str) > -1) {
          isExclude = true;
          return false;
        }
      });
      if (match.length > 2 && match[2] && match[2].replace(/ /g, "").indexOf("view)") > -1) {
        isExclude = true;
      }
      if (StringUtils.startsWith(match[0], "//")) {
        isExclude = true;
      }
      const selector = StringUtils.trimToEmpty(match[1]).replace(/ /g, "");
      if (/^["']/g.test(selector)) {
        if (!isExclude) {
          if (/[\(\)]|,view|,cont\.view|",|',|^"<|^'<|>"$|>'$|html|body/g.test(selector)) {
            isExclude = true;
          }
          if (!/,view|,cont.view/g.test(selector) && /"\+|'\+|\+"|\+'/g.test(selector)) {
            isExclude = false;
          }
        }
        if (!isExclude) {
          const method = match[2];
          if (/^\.cont\(|^\.comm\(|^\.select\(|^\.form\(|^\.list\(|^\.grid\(|^\.pagination\(|^\.tree\(|^\.instance\(/g.test(method)) {
            isExclude = true;
          }
        }
        if (!isExclude) {
          let script = "";
          try {
            script = codes.substring(codes.indexOf("<script"), codes.indexOf("<\/script>"));
          } catch (e) {
            warn(e);
          }
          if (script.indexOf(match[0]) > -1) {
            report.push({
              "level": NCD.severityLevels.CRITICAL[0],
              "message": NC.message.get(Context.attr("code").inspection.message, "NoContextSpecifiedInSelector"),
              "line": codes.substring(0, regex.lastIndex).split("\n").length,
              "code": match[0]
            });
          }
        }
      }
    }
  },
  /**
   * Detects code using jQuery's val method instead of the val method of the Natural-UI component.
   */
  "UseTheComponentsValMethod": function(codes, excludes, report) {
    const regex = /\/{2}.*|[N$]\((.*?)\)\.val\((.*?)\)(.*)/gm;
    let match;
    while (match = regex.exec(codes)) {
      let isExclude = false;
      jQuery(excludes).each(function(i, str) {
        if (match[0].indexOf(str) > -1) {
          isExclude = true;
          return false;
        }
      });
      if (!isExclude) {
        const args = match[2];
        if (StringUtils.isEmpty(args)) {
          isExclude = true;
        }
      }
      if (StringUtils.startsWith(match[0], "//")) {
        isExclude = true;
      }
      if (!isExclude) {
        let script = "";
        try {
          script = codes.substring(codes.indexOf("<script"), codes.indexOf("<\/script>"));
        } catch (e) {
          warn(e);
        }
        if (script.indexOf(match[0]) > -1) {
          report.push({
            "level": NCD.severityLevels.MAJOR[0],
            "message": NC.message.get(Context.attr("code").inspection.message, "UseTheComponentsValMethod"),
            "line": codes.substring(0, regex.lastIndex).split("\n").length,
            "code": match[0]
          });
        }
      }
    }
  }
});
__publicField(_Code, "report", {
  console: function(data, url) {
    if (!data) {
      return false;
    }
    jQuery(data).each(function() {
      const consoleLogger = NCD.severityLevels[this.level.toUpperCase()][2];
      if (Context.attr("code").inspection.abortOnError && (this.level === NCD.severityLevels.BLOCKER[0] || this.level === NCD.severityLevels.CRITICAL[0])) {
        throw consoleLogger("[" + this.level + "] " + url + " - " + this.line + " : " + this.code + "\n" + this.message + "\n\n");
      } else {
        if (BrowserUtils.is("ie")) {
          consoleLogger("[" + this.level + "] " + url + " - " + this.line + " : " + this.code, "\n" + this.message);
        } else {
          consoleLogger(
            "%c[" + this.level + "] " + url + " - " + this.line + " : " + this.code,
            "color: " + NCD.severityLevels[this.level.toUpperCase()][1] + "; font-weight: bold; line-height: 200%;",
            "\n" + this.message
          );
        }
      }
    });
  }
});
var Code = _Code;

// src/template/aop.js
var _Template = class _Template {
};
__publicField(_Template, "codes", function(cont, joinPoint) {
  const options = {
    codeUrl: null,
    codeKey: null
  };
  try {
    jQuery.extend(true, options, Context.attr("template").aop.codes);
  } catch (e) {
    throw error("Template.codes", e);
  }
  const codeList = [];
  const commList = [];
  const selectList = [];
  for (const prop in cont) {
    if (type(prop) === "string" && StringUtils.startsWith(prop, "p.select.")) {
      if (type(cont[prop]) === "array" && cont[prop].length > 0) {
        if (cont[prop].length > 2) {
          cont[prop] = {
            "comm": cont[prop][0],
            "key": cont[prop][1],
            "val": cont[prop][2],
            "filter": cont[prop][3]
          };
        } else {
          cont[prop] = {
            "code": cont[prop][0],
            "filter": cont[prop][1]
          };
        }
      }
      if (cont[prop].code) {
        codeList.push(prop.split(".")[2] + "|" + cont[prop].code);
      } else if (cont[prop].comm) {
        commList.push(prop.split(".")[2] + "|" + cont[prop].comm);
      } else {
        selectList.push(prop.split(".")[2] + "|select__");
      }
    }
  }
  if (selectList.length > 0) {
    jQuery(selectList).each(function(i, selectStr) {
      const selectInfoArr = selectStr.split("|");
      const opts = cont["p.select." + selectInfoArr[0]];
      if (opts.data) {
        cont["p.select." + selectInfoArr[0]] = jQuery("[id='" + selectInfoArr[0] + "']", cont.view).filter("select,input[type='checkbox'],input[type='radio']").map(function(i2, ele) {
          opts.context = ele;
          if (opts.filter) {
            opts.data = opts.filter(opts.data);
          }
          const select = jQuery().select(opts).bind();
          if (opts.selected) {
            select.val(opts.selected);
          }
          return select;
        }).get();
      } else {
        throw error(NC.message.get(Context.attr("template").message, "MSG-0001"));
      }
    });
  }
  if (codeList.length > 0 || commList.length > 0) {
    const xhrs = [];
    if (codeList.length > 0) {
      const codeParam = jQuery(codeList).map(function(i, codeInfo) {
        return codeInfo.split("|")[1];
      }).get();
      xhrs.push(jQuery({
        codes: codeParam != null && codeParam.length === 0 ? void 0 : codeParam
      }).comm({
        url: options.codeUrl
      }).submit(function(data) {
        jQuery(codeList).each(function(i, codeInfo) {
          const codeInfoArr = codeInfo.split("|");
          const opts = cont["p.select." + codeInfoArr[0]];
          cont["p.select." + codeInfoArr[0]] = jQuery("[id='" + codeInfoArr[0] + "']", cont.view).filter("select,input[type='checkbox'],input[type='radio']").map(function(i2, ele) {
            opts.context = ele;
            const selData = jQuery.grep(data, function(d) {
              return d[options.codeKey] === codeInfoArr[1];
            });
            const select = jQuery(opts.filter ? opts.filter(selData) : selData).select(opts).bind();
            if (opts.selected) {
              select.val(opts.selected);
            }
            return select;
          }).get();
        });
      }).error(function(e) {
        warn(e);
        throw error(NC.message.get(Context.attr("template").message, "MSG-0002"));
      }).request.obj.xhr);
    }
    jQuery(commList).each(function(i, commStr) {
      const codeInfoArr = commStr.split("|");
      if (!cont[codeInfoArr[1]]) {
        throw error(NC.message.get(Context.attr("template").message, "MSG-0003", [codeInfoArr[1]]));
      }
      xhrs.push(cont[codeInfoArr[1]]().submit(function(data) {
        const opts = cont["p.select." + codeInfoArr[0]];
        cont["p.select." + codeInfoArr[0]] = jQuery("[id='" + codeInfoArr[0] + "']", cont.view).filter("select,input[type='checkbox'],input[type='radio']").map(function(i2, ele) {
          opts.context = ele;
          const select = jQuery(opts.filter ? opts.filter(data) : data).select(opts).bind();
          if (opts.selected) {
            select.val(opts.selected);
          }
          return select;
        }).get();
      }).error(function(e) {
        warn(e);
        throw error(NC.message.get(Context.attr("template").message, "MSG-0004", [codeInfoArr[0]]));
      }).request.obj.xhr);
    });
    jQuery.when.apply($, xhrs).done(function() {
      _Template.template(cont, joinPoint);
    });
  } else {
    _Template.template(cont, joinPoint);
  }
});
__publicField(_Template, "template", function(cont, joinPoint) {
  const options = {
    onBeforeInitComponents: null,
    onInitComponents: null,
    onBeforeInitEvents: null,
    onInitEvents: null
  };
  try {
    jQuery.extend(true, options, Context.attr("template").aop.template);
  } catch (e) {
    throw error("Template.template", e);
  }
  if (options.onBeforeInitComponents) {
    options.onBeforeInitComponents.call(this, cont, joinPoint);
  }
  const compActionDefer = [];
  for (const prop in cont) {
    if (type(prop) === "string" && StringUtils.startsWith(prop, "p.")) {
      _Template.components(cont, prop, compActionDefer);
    }
  }
  if (options.onBeforeInitEvents) {
    options.onBeforeInitEvents.call(this, cont, joinPoint);
  }
  for (const prop in cont) {
    if (type(prop) === "string" && StringUtils.startsWith(prop, "e.")) {
      _Template.events(cont, prop);
    }
  }
  if (options.onInitEvents) {
    options.onInitEvents.call(this, cont, joinPoint);
  }
  if (compActionDefer.length > 0) {
    jQuery(compActionDefer).each(function() {
      this.resolve();
      if (options.onInitComponents) {
        options.onInitComponents.call(this, cont, joinPoint);
      }
    });
  }
  joinPoint.proceed();
  setTimeout(function() {
    if (cont.onOpenDefer) {
      cont.onOpenDefer.resolve();
    }
  }, 0);
});
__publicField(_Template, "components", function(cont, prop, compActionDefer) {
  const props = prop.split(".");
  if (props.length > 2) {
    const comp = "p." + props[1] + "." + props[2];
    let contextEle = jQuery("#" + props[2], cont.view);
    const opts = cont[comp];
    if (opts !== void 0 && opts.context !== void 0) {
      contextEle = jQuery(opts.context, cont.view);
    }
    if (props[1] === "popup" && props[2] === "file") {
      opts.url = "file/manager.view";
      opts.top = 20;
      opts.onOpen = "onOpen";
      opts.overlayClose = false;
      opts.escClose = false;
    }
    if (opts !== void 0 && (!(contextEle.length === 0 && opts.context === void 0) || !(contextEle.length === 0 && opts.url === void 0))) {
      opts.context = contextEle;
      if (props[1] === "button" || props[1] === "popup" || props[1] === "tab" || props[1] === "datepicker") {
        if (opts.url && props[1] === "popup" || props[1] === "tab") {
          if (opts.opener === void 0) {
            opts.opener = cont;
          }
        }
        cont[comp] = opts.context[props[1]](opts);
      } else {
        if (props[1] !== "select" && !opts.code) {
          cont[comp] = jQuery([])[props[1]](opts);
        }
      }
      if (opts.usage) {
        const usageOptions = {
          "search-box": {
            "defaultButton": ".btn-search",
            "events": []
          }
        };
        if (type(opts.usage) === "object") {
          jQuery.extend(true, usageOptions, opts.usage);
        }
        if (opts.usage === "search-box" || usageOptions["search-box"] !== void 0) {
          opts.context.addClass("search_box__");
          if (opts.action === void 0 || opts.action !== "add") {
            cont[comp].add();
          }
          const targets = [];
          const events = usageOptions["search-box"].events;
          if (events.length > 0) {
            jQuery(events).each(function() {
              targets.push(this.target);
              opts.context.find(this.target).on(this.event + "." + cont.view.data("pageid"), this.handler);
            });
          }
          opts.context.on("keyup." + cont.view.data("pageid"), ":input:not(" + targets.join(",") + ")", function(e) {
            const keyCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
            if (keyCode === 13) {
              cont.view.find(usageOptions["search-box"].defaultButton).trigger("click");
            }
          });
          if (BrowserUtils.is("ie")) {
            opts.context.on("keyup." + cont.view.data("pageid"), ":input", function(e) {
              const keyCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
              if (keyCode === 13) {
                this.blur();
              }
            });
          }
        }
      }
      if (opts.action) {
        compActionDefer.push(jQuery.Deferred().done(function() {
          if (type(opts.action) === "string") {
            cont[comp][opts.action]();
          } else if (type(opts.action) === "array" && opts.action.length > 1) {
            cont[comp][opts.action[0]].apply(cont[comp], opts.action.splice(1));
          }
        }));
      }
    } else {
      throw error(NC.message.get(Context.attr("template").message, "MSG-0005", [cont.view.data("pageid") + ":" + prop]));
    }
  } else {
    throw error(NC.message.get(Context.attr("template").message, "MSG-0005", [cont.view.data("pageid") + ":" + prop]));
  }
});
__publicField(_Template, "events", function(cont, prop) {
  const props = prop.split(".");
  if (props.length > 2) {
    let targetProp;
    let handler;
    const eventName = props[2];
    let idSelector = "";
    if (typeof cont[prop] === "function") {
      targetProp = props[1];
      handler = cont[prop];
      idSelector = "#";
    } else if (type(cont[prop]) === "object") {
      targetProp = cont[prop].target;
      handler = cont[prop].handler;
    } else {
      throw error(NC.message.get(Context.attr("template").message, "MSG-0006", [cont.view.data("pageid") + ":" + prop]));
    }
    let targetEle = jQuery(idSelector + targetProp, cont.view);
    if (targetEle.length > 0) {
      const listCompEle = targetEle.closest(".list__, .grid__");
      let compInst;
      if (listCompEle.length > 0 && targetEle.closest("header").length === 0) {
        if (listCompEle.hasClass("list__")) {
          compInst = listCompEle.instance("list");
        } else if (listCompEle.hasClass("grid__")) {
          compInst = listCompEle.instance("grid");
        }
        if (compInst) {
          targetEle = compInst.tempRowEle.find(idSelector + targetProp);
          if (targetEle.is(":radio, :checkbox") && jQuery("[name='" + targetProp + "']", compInst.tempRowEle).length > 1) {
            targetEle = jQuery("[name='" + targetProp + "']", compInst.tempRowEle);
          }
        }
      } else {
        if (targetEle.is(":radio, :checkbox") && jQuery("[name='" + targetProp + "']", cont.view).length > 1) {
          targetEle = jQuery("[name='" + targetProp + "']", cont.view);
        }
      }
      if (targetEle.is("a, button, input[type=button]")) {
        targetEle.button();
      } else {
        if (eventName && eventName.indexOf("click") > -1) {
          targetEle.css("cursor", "pointer");
        }
      }
      if (compInst) {
        let targetStr;
        if (targetEle.is(":radio") || targetEle.is(":checkbox") && targetEle.length > 1) {
          targetStr = ">.form__ [name='" + targetProp + "']:radio, >.form__ [name='" + targetProp + "']:checkbox";
        } else {
          targetStr = ">.form__ " + idSelector + targetProp;
        }
        cont[prop] = listCompEle.on(eventName + "." + cont.view.data("pageid"), targetStr, function() {
          const args = Array.apply(null, arguments);
          args.push(listCompEle.find(">.form__").index(jQuery(this).closest(".form__")));
          handler.apply(this, args);
        });
      } else {
        cont[prop] = targetEle.on(eventName + "." + cont.view.data("pageid"), handler);
      }
    }
  } else {
    throw error(NC.message.get(Context.attr("template").message, "MSG-0006", [cont.view.data("pageid") + ":" + prop]));
  }
});
var Template = _Template;

// src/N.js
applyJQueryExtensions();
initDateFormatter();
var _a;
var _NJS = class _NJS {
  constructor(selector, context) {
    const jqObj = jQuery(selector, context);
    Object.setPrototypeOf(jqObj, _NJS.prototype);
    jqObj.selector = toSelector(selector);
    return jqObj;
  }
  // Architecture Prototype Methods
  comm(url) {
    return new Communicator(this, url);
  }
  cont(contObj) {
    return new Controller(this, contObj);
  }
  request() {
    return this.get(0).request;
  }
  // Data Prototype Methods
  datafilter(condition) {
    return DataFilter.filter(this, condition);
  }
  datasort(key, reverse) {
    return DataFilter.sort(this, key, reverse);
  }
  formatter(rules) {
    return new Formatter(this, rules);
  }
  validator(rules) {
    return new Validator(this, rules);
  }
  // UI Component Prototype Methods
  alert(msg, vars) {
    return new Alert(this, msg, vars);
  }
  button(opts) {
    if (this.is("input[type='button'], button, a")) {
      return this.each(function() {
        return new Button(jQuery(this), opts);
      });
    }
  }
  datepicker(opts) {
    return new Datepicker(this, opts);
  }
  popup(opts) {
    return new Popup(this, opts);
  }
  tab(opts) {
    return new Tab(this, opts);
  }
  select(opts) {
    return new Select(this, opts);
  }
  form(opts) {
    return new Form(this, opts);
  }
  list(opts) {
    return new List(this, opts);
  }
  grid(opts) {
    return new Grid2(this, opts);
  }
  pagination(opts) {
    return new Pagination(this, opts);
  }
  tree(opts) {
    return new Tree(this, opts);
  }
};
// Static Properties - Version
__publicField(_NJS, "version", "2.0.0");
// Static Properties - Core Utils
__publicField(_NJS, "string", StringUtils);
__publicField(_NJS, "date", DateUtils);
__publicField(_NJS, "element", ElementUtils);
__publicField(_NJS, "browser", BrowserUtils);
__publicField(_NJS, "message", MessageUtils);
__publicField(_NJS, "array", ArrayUtils);
__publicField(_NJS, "json", JSONUtils);
__publicField(_NJS, "event", EventUtils);
__publicField(_NJS, "mask", Mask);
__publicField(_NJS, "gc", GC);
// Static Properties - Type Checking
__publicField(_NJS, "type", type);
__publicField(_NJS, "isString", isString);
__publicField(_NJS, "isNumeric", isNumeric);
__publicField(_NJS, "isPlainObject", isPlainObject);
__publicField(_NJS, "isEmptyObject", isEmptyObject);
__publicField(_NJS, "isArray", isArray);
__publicField(_NJS, "isArraylike", isArraylike);
__publicField(_NJS, "isWrappedSet", isWrappedSet);
__publicField(_NJS, "isElement", isElement);
__publicField(_NJS, "toSelector", toSelector);
// Static Properties - Logger
__publicField(_NJS, "debug", debug);
__publicField(_NJS, "log", log);
__publicField(_NJS, "info", info);
__publicField(_NJS, "warn", warn);
__publicField(_NJS, "error", error);
// Static Properties - Serial Execute
__publicField(_NJS, "serialExecute", serialExecute);
// Static Properties - Architecture
__publicField(_NJS, "fetch", Fetch.fetch.bind(Fetch));
__publicField(_NJS, "comm", (obj, url) => new Communicator(obj, url));
__publicField(_NJS, "cont", (obj, contObj) => new Controller(obj, contObj));
__publicField(_NJS, "context", Context);
// Static Properties - Data
__publicField(_NJS, "ds", DataSync);
__publicField(_NJS, "formatter", Formatter);
__publicField(_NJS, "validator", Validator);
__publicField(_NJS, "data", DataFilter);
// Static Properties - UI Shared
__publicField(_NJS, "ui", (_a = class {
}, __publicField(_a, "iteration", Iteration), __publicField(_a, "draggable", Draggable), __publicField(_a, "utils", UIUtils), __publicField(_a, "scroll", Scroll), _a));
// Static Properties - UI Components
__publicField(_NJS, "alert", Alert);
__publicField(_NJS, "button", Button);
__publicField(_NJS, "datepicker", Datepicker);
__publicField(_NJS, "popup", Popup);
__publicField(_NJS, "tab", Tab);
__publicField(_NJS, "select", Select);
__publicField(_NJS, "form", Form);
__publicField(_NJS, "list", List);
__publicField(_NJS, "grid", Grid2);
__publicField(_NJS, "pagination", Pagination);
__publicField(_NJS, "tree", Tree);
// Static Properties - UI-Shell
__publicField(_NJS, "notify", Notify2);
__publicField(_NJS, "docs", Docs);
// Static Properties - Code, Template
__publicField(_NJS, "code", Code);
__publicField(_NJS, "template", Template);
var NJS = _NJS;
Object.setPrototypeOf(NJS.prototype, jQuery.fn);
function N2(selector, context) {
  return new NJS(selector, context);
}
Object.keys(NJS).forEach((key) => {
  if (key !== "prototype" && key !== "length" && key !== "name") {
    N2[key] = NJS[key];
  }
});
if (typeof window !== "undefined") {
  window.N = N2;
}
var N_default = N2;

// src/index.js
var src_default = N_default;

exports.N = N_default;
exports.default = src_default;
//# sourceMappingURL=natural.js.map
//# sourceMappingURL=natural.js.map