'use strict';

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

// src/core/utils/message.js
var NCLocale;
var getLocale = () => NCLocale || (() => "en_US");
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
var setLocaleFunction = (fn) => {
  NCLocale = fn;
};

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

exports.ArrayUtils = ArrayUtils;
exports.BrowserUtils = BrowserUtils;
exports.DateUtils = DateUtils;
exports.ElementUtils = ElementUtils;
exports.EventUtils = EventUtils;
exports.GC = GC;
exports.JSONUtils = JSONUtils;
exports.Logger = Logger;
exports.Mask = Mask;
exports.MessageUtils = MessageUtils;
exports.SerialExecute = SerialExecute;
exports.StringUtils = StringUtils;
exports.TypeChecker = TypeChecker;
exports.applyJQueryExtensions = applyJQueryExtensions;
exports.byteLength = byteLength;
exports.contains = contains;
exports.contextPath = contextPath;
exports.cookie = cookie;
exports.dataChanged = dataChanged;
exports.dateList = dateList;
exports.dateToTs = dateToTs;
exports.debug = debug;
exports.deduplicate = deduplicate;
exports.diff = diff;
exports.disable = disable;
exports.endsWith = endsWith;
exports.error = error;
exports.get = get;
exports.getMaxDuration = getMaxDuration;
exports.info = info;
exports.initDateFormatter = initDateFormatter;
exports.insertAt = insertAt;
exports.is = is;
exports.isArray = isArray;
exports.isArraylike = isArraylike;
exports.isElement = isElement;
exports.isEmpty = isEmpty;
exports.isEmptyObject = isEmptyObject;
exports.isNumberRelatedKeys = isNumberRelatedKeys;
exports.isNumeric = isNumeric;
exports.isPlainObject = isPlainObject;
exports.isString = isString;
exports.isWrappedSet = isWrappedSet;
exports.jQueryExtensions = jQueryExtensions;
exports.log = log;
exports.lpad = lpad;
exports.mapFromKeys = mapFromKeys;
exports.maxZindex = maxZindex;
exports.mergeJsonArray = mergeJsonArray;
exports.msieVersion = msieVersion;
exports.nullToEmpty = nullToEmpty;
exports.removeCookie = removeCookie;
exports.removeWhitespace = removeWhitespace;
exports.replaceMsgVars = replaceMsgVars;
exports.rpad = rpad;
exports.scrollbarWidth = scrollbarWidth;
exports.serialExecute = serialExecute;
exports.setLocaleFunction = setLocaleFunction;
exports.startsWith = startsWith;
exports.strToDate = strToDate;
exports.strToDateStrArr = strToDateStrArr;
exports.toData = toData;
exports.toOpts = toOpts;
exports.toRules = toRules;
exports.toSelector = toSelector;
exports.trimToEmpty = trimToEmpty;
exports.trimToNull = trimToNull;
exports.trimToUndefined = trimToUndefined;
exports.trimToVal = trimToVal;
exports.trimToZero = trimToZero;
exports.tsToDate = tsToDate;
exports.type = type;
exports.warn = warn;
exports.whichAnimationEvent = whichAnimationEvent;
exports.whichTransitionEvent = whichTransitionEvent;
exports.windowScrollLock = windowScrollLock;
//# sourceMappingURL=core.js.map
//# sourceMappingURL=core.js.map