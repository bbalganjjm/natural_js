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
  isString,
  isPlainObject,
  isArray,
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
  constructor(comm2, options) {
    this.options = options || {};
    this.referrer = window.location.href;
    this.comm = comm2;
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
    var _a, _b;
    ((_b = (_a = Context.attr("architecture")) == null ? void 0 : _a.comm) == null ? void 0 : _b.filters) || {};
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
var comm = (obj, url) => new Communicator(obj, url);

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
  static trInit(cont2, request) {
    if (cont2 && cont2.init) {
      cont2.init.call(cont2.view, cont2, request);
    }
  }
};
var cont = (obj, contObj) => new Controller(obj, contObj);

exports.Communicator = Communicator;
exports.Context = Context;
exports.Controller = Controller;
exports.Fetch = Fetch;
exports.Request = Request;
exports.comm = comm;
exports.cont = cont;
exports.fetch = fetch;
//# sourceMappingURL=architecture.js.map
//# sourceMappingURL=architecture.js.map