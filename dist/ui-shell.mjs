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
  isPlainObject,
  isEmptyObject,
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

// src/architecture/communication/request.js
var Request = class {
  constructor(comm, options) {
    this.options = options || {};
    this.referrer = window.location.href;
    this.comm = comm;
  }
};

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
var notify = (...args) => new Notify2(...args);

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
var docs = (...args) => new Docs(...args);

export { Docs, Notify2 as Notify, docs, notify };
//# sourceMappingURL=ui-shell.mjs.map
//# sourceMappingURL=ui-shell.mjs.map