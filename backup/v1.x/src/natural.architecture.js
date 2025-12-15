/*!
 * Natural-ARCHITECTURE v1.0.0
 *
 * Released under the LGPL v2.1 license
 * Date: 2014-09-26T11:11Z
 *  
 * Copyright 2014 Goldman Kim(bbalganjjm@gmail.com)
 */

import { N } from "./natural.js.js";
import { NC } from "./natural.core.js";

export class NA {

    comm(url) {
        return new NA.comm(this, url);
    };

    request() {
        return this.get(0).request;
    };

    cont(contObj) {
        return new NA.cont(this, contObj);
    };

    // Fetch
    static fetch = function(options) {
        // 1. Options validation
        if (!options.url) {
            throw NC.error("[NA.fetch]options.url is required");
        }
        
        // 2. async: false warning
        if (options.async === false) {
            NC.warn("[NA.fetch]async: false is not supported. fetch is always asynchronous.");
        }
        
        // 3. Create AbortController
        const controller = new AbortController();
        const signal = controller.signal;
        
        // 4. Convert options
        const fetchOptions = NA._convertJQueryAjaxOptionsToFetch(options, signal);
        
        // 5. Merge custom fetchOptions if provided
        if (options.fetchOptions) {
            jQuery.extend(true, fetchOptions, options.fetchOptions);
        }
        
        // 6. Execute beforeSend
        if (options.beforeSend) {
            if (NA._executeBeforeSend(options, controller) === false) {
                return NA._createAbortedXhr();
            }
        }
        
        // 7. Execute fetch
        const promise = NA._executeFetch(options.url, fetchOptions, options);
        
        // 8. Return xhr-compatible object
        return NA._createXhrCompat(promise, controller, options);
    };

    /**
     * Convert jQuery.ajax options to fetch API options
     * @private
     */
    static _convertJQueryAjaxOptionsToFetch = function(options, signal) {
        const fetchOptions = {
            method: options.type || "GET",
            headers: {},
            signal: signal
        };

        // Content-Type
        if (options.contentType) {
            fetchOptions.headers["Content-Type"] = options.contentType;
        }

        // Accept header based on dataType
        if (options.dataType) {
            if (options.dataType === "json") {
                fetchOptions.headers["Accept"] = "application/json";
            } else if (options.dataType === "html") {
                fetchOptions.headers["Accept"] = "text/html";
            } else if (options.dataType === "text") {
                fetchOptions.headers["Accept"] = "text/plain";
            }
        }

        // Cache control
        if (options.cache === false) {
            fetchOptions.headers["Cache-Control"] = "no-cache";
            fetchOptions.headers["Pragma"] = "no-cache";
        }

        // CORS mode
        if (options.crossDomain === true) {
            fetchOptions.mode = "cors";
        }

        // Request body (only for POST/PUT/PATCH)
        if (options.data && options.type && options.type.toUpperCase() !== "GET") {
            fetchOptions.body = options.data;
        }

        return fetchOptions;
    };

    /**
     * Execute beforeSend callback
     * @private
     */
    static _executeBeforeSend = function(options, controller) {
        if (!options.beforeSend) {
            return true;
        }

        const xhrStub = {
            abort: function() {
                controller.abort();
            },
            setRequestHeader: function() {
                // stub for compatibility
            }
        };

        const settings = options;
        return options.beforeSend(xhrStub, settings);
    };

    /**
     * Create xhr-compatible object from fetch Response
     * @private
     */
    static _createXhrFromResponse = function(response) {
        return {
            readyState: 4,
            status: response.status,
            statusText: response.statusText,
            responseText: "",
            responseJSON: null,
            getResponseHeader: function(name) {
                return response.headers.get(name);
            },
            getAllResponseHeaders: function() {
                let headers = "";
                response.headers.forEach(function(value, key) {
                    headers += key + ": " + value + "\r\n";
                });
                return headers;
            }
        };
    };

    /**
     * Create xhr-compatible object from fetch error
     * @private
     */
    static _createXhrFromError = function(error) {
        return {
            readyState: 4,
            status: error.status || 0,
            statusText: error.statusText || "error",
            responseText: "",
            responseJSON: null,
            getResponseHeader: function() {
                return null;
            },
            getAllResponseHeaders: function() {
                return "";
            }
        };
    };

    /**
     * Execute fetch and handle response/error
     * @private
     */
    static _executeFetch = function(url, fetchOptions, options) {
        return fetch(url, fetchOptions)
            .then(function(response) {
                // 1. HTTP error check
                if (!response.ok) {
                    const error = new Error("HTTP Error " + response.status);
                    error.response = response;
                    error.status = response.status;
                    error.statusText = response.statusText;
                    throw error;
                }
                
                // 2. Parse based on dataType
                if (options.dataType === "json") {
                    return response.json().then(function(data) {
                        return {
                            data: data,
                            textStatus: "success",
                            response: response
                        };
                    });
                } else if (options.dataType === "html" || options.dataType === "text") {
                    return response.text().then(function(data) {
                        return {
                            data: data,
                            textStatus: "success",
                            response: response
                        };
                    });
                } else {
                    // Default: text
                    return response.text().then(function(data) {
                        return {
                            data: data,
                            textStatus: "success",
                            response: response
                        };
                    });
                }
            })
            .then(function(result) {
                // 3. Execute success callback
                if (options.success) {
                    const xhr = NA._createXhrFromResponse(result.response);
                    options.success(result.data, result.textStatus, xhr);
                }
                
                // 4. Execute complete callback
                if (options.complete) {
                    const xhr = NA._createXhrFromResponse(result.response);
                    options.complete(xhr, result.textStatus);
                }
                
                return result.data;
            })
            .catch(function(error) {
                // 5. Execute error callback
                if (options.error) {
                    const xhr = NA._createXhrFromError(error);
                    const textStatus = error.name === "AbortError" ? "abort" : "error";
                    options.error(xhr, textStatus, error);
                }
                
                // 6. Execute complete callback (even on error)
                if (options.complete) {
                    const xhr = NA._createXhrFromError(error);
                    const textStatus = error.name === "AbortError" ? "abort" : "error";
                    options.complete(xhr, textStatus);
                }
                
                throw error;
            });
    };

    /**
     * Create xhr-compatible object from fetch Promise
     * @private
     */
    static _createXhrCompat = function(promise, controller, options) {
        const xhrCompat = {
            readyState: 4,
            status: 0,
            statusText: "",
            responseText: "",
            responseJSON: null,
            
            // Promise methods
            then: function(resolve, reject) {
                return promise.then(resolve, reject);
            },
            catch: function(callback) {
                return promise.catch(callback);
            },
            finally: function(callback) {
                return promise.finally ? promise.finally(callback) : promise.then(callback, callback);
            },
            
            // jQuery.Deferred methods
            done: function(callback) {
                promise.then(callback);
                return xhrCompat;
            },
            fail: function(callback) {
                promise.catch(callback);
                return xhrCompat;
            },
            always: function(callback) {
                if (promise.finally) {
                    promise.finally(callback);
                } else {
                    promise.then(callback, callback);
                }
                return xhrCompat;
            },
            
            // xhr methods
            abort: function() {
                controller.abort();
                return xhrCompat;
            },
            
            getResponseHeader: function(name) {
                return null;
            },
            getAllResponseHeaders: function() {
                return "";
            }
        };
        
        // Update properties after promise resolution
        promise.then(function(data) {
            xhrCompat.status = 200;
            xhrCompat.statusText = "OK";
            xhrCompat.responseJSON = data;
            if (typeof data === "string") {
                xhrCompat.responseText = data;
            } else {
                xhrCompat.responseText = JSON.stringify(data);
            }
        }).catch(function(error) {
            xhrCompat.status = error.status || 0;
            xhrCompat.statusText = error.statusText || "error";
        });
        
        return xhrCompat;
    };

    /**
     * Create aborted xhr-compatible object
     * @private
     */
    static _createAbortedXhr = function() {
        const error = new Error("abort");
        error.name = "AbortError";
        const promise = Promise.reject(error);
        return NA._createXhrCompat(promise, { abort: function() {} }, {});
    };

    static comm = class {

        constructor(obj, url) {
            if (obj === undefined) {
                throw NC.error("[NA.comm]You must input arguments[0]");
            } else {
                if ((NC.isPlainObject(obj) || NC.isString(obj)) && url === undefined) {
                    url = obj;
                    obj = jQuery();
                }
            }

            if(NC.isPlainObject(obj) || NC.isArray(obj)) {
                obj = jQuery(obj);
            }

            if(NA.config.filterConfig === undefined) {
                NA.config.filterConfig = NA.comm.initFilterConfig();
            }

            let isFilterStopped = false;
            // request filter
            jQuery(NA.config.filterConfig.beforeInitFilters).each(function() {
                let jo;
                if((jo = this(obj)) instanceof Error){
                    isFilterStopped = true;
                    return false;
                }
                if(jo !== undefined) {
                    obj = jQuery(jo);
                }
            });
            if(isFilterStopped) return obj;

            obj.request = new NA.comm.request(obj, NC.isString(url) ? {
                "url" : url
            } : url);

            obj.errorHandlers = [];

            jQuery(jQuery.map(NA.comm, function(v, i){
                if(typeof NA.comm[i] === "function") {
                    if(i !== "request") {
                        return i;
                    }
                }
            })).each(function(i, v) {
                obj[v] = function(arg0) {
                    return NA.comm[v].call(obj, arg0);
                };
            });

            return obj;
        };

        static xhr = null;

        static initFilterConfig = function() {
            const beforeInitFilters = [];
            const afterInitFilters = [];
            const beforeSendFilters = [];
            const successFilters = [];
            const errorFilters = [];
            const completeFilters = [];
            const filters = NA.context.attr("architecture").comm.filters;
            const orderedFilterKeys = [];
            const spltSepa = NA.context.attr("core").spltSepa;

            // Indexing to execute filters with the order property defined first and filters with no order property defined
            for (const key in filters) {
                if(filters[key].order !== undefined) {
                    orderedFilterKeys.push(filters[key].order + spltSepa + key);
                }
            }
            orderedFilterKeys.sort();
            for (const key in filters) {
                if(filters[key].order === undefined) {
                    orderedFilterKeys.push(key);
                }
            }

            jQuery(orderedFilterKeys).each(function() {
                const kArr = this.split(spltSepa);
                const k = kArr.length > 1 ? kArr[1] : kArr[0];
                for (const filterKey in filters[k]) {
                    if (filterKey === "beforeInit") {
                        beforeInitFilters.push(filters[k][filterKey]);
                    } else if (filterKey === "afterInit") {
                        afterInitFilters.push(filters[k][filterKey]);
                    } else if (filterKey === "beforeSend") {
                        beforeSendFilters.push(filters[k][filterKey]);
                    } else if (filterKey === "success") {
                        successFilters.push(filters[k][filterKey]);
                    } else if (filterKey === "error") {
                        errorFilters.push(filters[k][filterKey]);
                    } else if (filterKey === "complete") {
                        completeFilters.push(filters[k][filterKey]);
                    }
                }
            });

            return {
                "beforeInitFilters" : beforeInitFilters,
                "afterInitFilters" : afterInitFilters,
                "beforeSendFilters" : beforeSendFilters,
                "successFilters" : successFilters,
                "errorFilters" : errorFilters,
                "completeFilters" : completeFilters
            }
        };

        static resetFilterConfig = function() {
            NA.config.filterConfig = NA.comm.initFilterConfig();
            return this;
        };

        static submit = function(callback) {
            const obj = this;
            if (NC.isElement(obj)) {
                jQuery.extend(obj.request.options, {
                    contentType : "text/html; charset=UTF-8",
                    dataType : "html",
                    type : "GET"
                });
                obj.request.options.target = obj;
            }

            let isFilterStopped = false;
            // request filter
            jQuery(NA.config.filterConfig.afterInitFilters).each(function() {
                if(this(obj.request) instanceof Error){
                    isFilterStopped = true;
                    return false;
                }
            });
            if(isFilterStopped) return;

            jQuery.extend(obj.request.options, {
                beforeSend : function(xhr, settings) {
                    let isFilterStopped = false;
                    // request filter
                    jQuery(NA.config.filterConfig.beforeSendFilters).each(function(i, filter) {
                        if(filter.call(obj, obj.request, xhr, settings) instanceof Error){
                            isFilterStopped = true;
                            return false;
                        }
                    });
                    if(isFilterStopped) return false;
                },
                success : function(data, textStatus, xhr) {
                    let isFilterStopped = false;
                    // request filter
                    jQuery(NA.config.filterConfig.successFilters).each(function(i, filter) {
                        let fData = filter.call(obj, obj.request, data, textStatus, xhr);
                        if(fData instanceof Error){
                            isFilterStopped = true;
                            return false;
                        }
                        if(fData !== undefined) {
                            data = fData;
                        }
                    });
                    if(isFilterStopped) return false;

                    let cont;
                    if (!NC.isElement(obj)) {
                        if (obj.request.options.urlSync && obj.request.options.referrer.replace(/!/g, "") !== window.location.href.replace(/!/g, "")) {
                            xhr.abort();
                            NC.warn("[NA.comm.submit.success(urlSync option)]The response was stopped because it was different from the URL at the time of the request and the URL at the time of the response.");
                            return false;
                        }
                    } else {
                        if(obj.is(NA.context.attr("architecture").page.context)) {
                            NC.gc[NA.context.attr("core").gcMode]();
                        }
                        if (obj.request.options.append) {
                            obj.append(data);
                        } else if(obj.request.options.replace){
                            obj.attr("id", obj.attr("id") + "_pending_to_remove");
                            obj.css("display", "none");
                            obj.after(data);
                        } else {
                            obj.html(data);
                        }

                        if(!obj.is(NA.context.attr("architecture").page.context)) {
                            // Removes garbage instances from obserables of ND.ds
                            NC.gc.ds();
                        }

                        if(obj.request.options.replace){
                            if(obj.nextAll(".view_context__:first").length > 0){
                                cont = obj.nextAll(".view_context__:first").instance("cont");
                                if(cont !== undefined){
                                    // triggering "init" method
                                    NA.cont.trInit.call(this, cont, obj.request);
                                }
                            }
                            obj.remove();
                        } else if(obj.children(".view_context__:last").length > 0) {
                            cont = obj.children(".view_context__:last").instance("cont");
                            if(cont !== undefined) {
                                // triggering "init" method
                                NA.cont.trInit.call(this, cont, obj.request);
                            }
                        }
                    }

                    if (callback !== undefined) {
                        try {
                            if (!NC.isElement(obj)) {
                                callback.call(obj, data, obj.request);
                            } else {
                                callback.call(obj, cont);
                            }
                        } catch (e) {
                            if(obj.errorHandlers.length > 0) {
                                jQuery(obj.errorHandlers).each(function(i, errorHandler) {
                                    errorHandler.call(obj, xhr, textStatus, e, obj.request, callback);
                                });
                            }
                            throw NC.error("NA.comm.submit.success.callback(url:" + obj.request.options.url + ")", e);
                        }
                    }
                },
                error : function(xhr, textStatus, e) {
                    let isFilterStopped = false;
                    // request filter
                    jQuery(NA.config.filterConfig.errorFilters).each(function(i, filter) {
                        if(filter.call(obj, obj.request, xhr, textStatus, e) instanceof Error){
                            isFilterStopped = true;
                            return false;
                        }
                    });

                    if(!isFilterStopped){
                        if(obj.errorHandlers.length > 0) {
                            jQuery(obj.errorHandlers).each(function(i, errorHandler) {
                                errorHandler.call(obj, e, obj.request, xhr, textStatus);
                            });
                        } else {
                            throw NC.error("NA.comm.submit.error(url:" + obj.request.options.url + ")", e);
                        }
                    }
                },
                complete : function(xhr, textStatus) {
                    let isFilterStopped = false;
                    // request filter
                    jQuery(NA.config.filterConfig.completeFilters).each(function(i, filter) {
                        if(filter.call(obj, obj.request, xhr, textStatus) instanceof Error){
                            isFilterStopped = true;
                            return false;
                        }
                    });
                }
            });

            obj.xhr = NA.fetch(obj.request.options);
            if (!callback) {
                return obj.xhr;
            } else {
                return obj;
            }
        };

        static error = function(callback) {
            this.errorHandlers.push(callback);
            return this;
        };

        static request = class {

            constructor(obj, opts) {
                this.options = {
                    url: null,
                    referrer : window.location.href,
                    contentType : "application/json; charset=utf-8",
                    cache : false,
                    async : true,
                    type : "POST",
                    data : null,
                    dataIsArray : false,
                    dataType : "json",
                    urlSync : true,
                    crossDomain : false,
                    browserHistory : true, // TODO
                    append : false,
                    target : null
                };

                // global config
                try {
                    jQuery.extend(this.options, NA.context.attr("architecture").comm.request.options);
                } catch (e) {
                }
                jQuery.extend(this.options, opts);

                this.attrObj = {};

                this.obj = obj;

                // set post parameters
                if(this.options.data === null) {
                    if(NC.isWrappedSet(obj)) {
                        if(!NC.isElement(obj)) {
                            try {
                                this.options.data = this.options.dataIsArray ? obj.get() : obj.get(0);
                                if((this.options.dataIsArray && NC.type(this.options.data) === "array") || NC.type(this.options.data) === "object") {
                                    this.options.data = JSON.stringify(this.options.data);
                                }
                            } catch(e) {
                                this.options.data = null;
                            }
                        }
                    } else {
                        if(obj != null) {
                            try {
                                this.options.data = obj;
                                if(NC.type(this.options.data) === "object") {
                                    this.options.data = JSON.stringify(obj);
                                }
                            } catch(e) {
                                this.options.data = null;
                            }
                        }
                    }

                    // set get parameters
                    if(this.options.data != null && this.options.type.toUpperCase() === "GET") {
                        const firstChar = this.options.data.charAt(0);
                        const lastChar = this.options.data.charAt(this.options.data.length - 1);
                        if(firstChar === "{" && lastChar === "}" || firstChar === "[" && lastChar === "]") {
                            this.options.data = "q=" + encodeURI(this.options.data);
                        }
                    }
                }
            };

            /**
             * get / set request attribute
             */
            attr(name, obj) {
                if (name === undefined) {
                    return this.attrObj;
                }
                if (obj === undefined) {
                    return this.attrObj !== undefined && this.attrObj[name] !== undefined ? this.attrObj[name] : undefined;
                } else {
                    if (this.attrObj === undefined) {
                        this.attrObj = {};
                    }
                    this.attrObj[name] = obj;
                    // this.obj is defined at NA.comm.request constructor;
                    return this.obj;
                }
            };

            /**
             * remove request attribute
             */
            removeAttr(name) {
                if(this.attrObj[name] !== undefined) {
                    delete this.attrObj[name];
                }
                return this;
            };

            /**
             * get query parmas from request url
             */
            param(name) {
                if (NC.string.isEmpty(name)) {
                    if (this.options.url.indexOf("?") < 0) {
                        return {};
                    } else {
                        const params = {};
                        const parts = this.options.url.split("?")[1].split('&');
                        for (let i = 0; i < parts.length; i++) {
                            const nv = parts[i].split('=');
                            if (!nv[0])
                                continue;
                            params[nv[0]] = decodeURIComponent(nv[1]) || true;
                        }
                        return params;
                    }
                } else {
                    return this.param()[name];
                }
            };

            get(key) {
                if(key !== undefined) {
                    return this.options[key];
                } else {
                    return this.options;
                }
            };

            /**
             * Reload block page
             */
            reload(callback) {
                const comm = this.options.target.comm(this.options.url);
                comm.request = this;
                comm.submit(callback);
                return this;
            };

        };
    };

    // Controller
    static cont = class {

        constructor(obj, contObj) {
            if(obj.attr("id") !== undefined && N("[id='" + obj.attr("id") + "']").length > 1) {
                obj = N("#" + obj.attr("id") + ":not([data-pageid])");
            } else {
                const selector = obj.selector;
                if(obj.length > 1) {
                    obj = N(obj.selector + ":not([data-pageid])");
                    obj.selector = selector;
                }
            }
            obj.attr("data-pageid", obj.attr("id") ? obj.attr("id") : obj.selector.replace(/\.|\#|\[|\]|\'|\:|\(|\)|\>| |\-/gi, ""));
            obj.addClass("view_context__");

            obj.instance("cont", contObj);

            contObj.view = obj;
            return contObj;
        };

        /**
         * "init" method trigger
         */
        static trInit = function(cont, request) {
            // set request attribute
            cont.request = request;

            // AOP processing
            NA.cont.aop.wrap.call(this, cont);

            // run Controller's "init" method
            if(cont.init !== undefined) {
                cont.init(cont.view, request);
            }
        };

        /**
         * AOP processing module
         */
        static aop = {
            pointcuts : {
                "regexp" : {
                    "fn" : function(param, contFrag, fnChain){
                        const regexp = param instanceof RegExp ? param : new RegExp(param);
                        return regexp.test(fnChain);
                    }
                }
            },
            wrap : function(cont) {
                if (NA.context.attr("architecture").cont &&
                    NA.context.attr("architecture").cont.advisors &&
                    NA.context.attr("architecture").cont.advisors.length > 0) {
                    const o = NA.context.attr("architecture").cont;

                    jQuery(o.advisors).each(function (idx, advisor) {
                        let pointcut;
                        if (!NC.isPlainObject(advisor.pointcut)) {
                            advisor.pointcut = { "type": "regexp", "param": advisor.pointcut };
                            if(NC.isString(advisor.pointcut.param)){
                                advisor.pointcut.selector = advisor.pointcut.selector || advisor.pointcut.param.substring(0, advisor.pointcut.param.lastIndexOf(":"));
                                advisor.pointcut.param = advisor.pointcut.param.substring(advisor.pointcut.param.lastIndexOf(":") + 1);
                            }
                        }

                        pointcut = o.pointcuts ? (o.pointcuts[advisor.pointcut.type] || NA.cont.aop.pointcuts[advisor.pointcut.type]) : NA.cont.aop.pointcuts[advisor.pointcut.type];

                        if(!pointcut){
                            throw NC.error("[NA.cont.aop.wrap]Unkown pointcut type : " + advisor.pointcut.type);
                        }

                        if(advisor.pointcut.selector && !cont.view.is(advisor.pointcut.selector)){
                            return;
                        }

                        const wrapFn = function(contFrag, fnPath){

                            for (const x in contFrag) {
                                if (!contFrag.hasOwnProperty(x)) continue;

                                if(typeof contFrag[x] === "function") {
                                    if (pointcut.fn(advisor.pointcut.param, contFrag, fnPath + x)) {
                                        const real = contFrag[x];

                                        contFrag[x] = (function (real, x) {
                                            let wrappedFn;

                                            switch(advisor.adviceType){
                                                case "before":
                                                    wrappedFn = function(){
                                                        const args = [].slice.call(arguments);
                                                        advisor.fn.call(advisor, contFrag, fnPath + x, args);
                                                        return real.apply(contFrag, args);
                                                    };
                                                    break;
                                                case "after":
                                                    wrappedFn = function(){
                                                        const args = [].slice.call(arguments);
                                                        const result = real.apply(contFrag, args);
                                                        advisor.fn.call(advisor, contFrag, fnPath + x, args, result);
                                                        return result;
                                                    };
                                                    break;
                                                case "around":
                                                    wrappedFn = function(){
                                                        const args = [].slice.call(arguments);
                                                        return advisor.fn.call(advisor, contFrag, fnPath + x, args, {
                                                            "contFrag" : contFrag,
                                                            "args" : args,
                                                            "real" : real,
                                                            "proceed" : function(){
                                                                return this.real.apply(this.contFrag, this.args);
                                                            }
                                                        });
                                                    };
                                                    break;
                                                case "error":
                                                    wrappedFn = function(){
                                                        const args = [].slice.call(arguments);
                                                        let result;
                                                        try{
                                                            result = real.apply(contFrag, args);
                                                        } catch(e) {
                                                            if (advisor.adviceType === "error") {
                                                                result = advisor.fn.call(advisor, contFrag, fnPath + x, args, e);
                                                            } else {
                                                                throw e;
                                                            }
                                                        }
                                                        return result;
                                                    };
                                                    break;
                                            }
                                            return wrappedFn;
                                        })(real, x);
                                    }
                                } else if(NC.isPlainObject(contFrag[x])) {
                                    wrapFn.call(this, contFrag[x], fnPath + x + ".");
                                }
                            }
                        };
                        wrapFn.call(this, cont, "");
                    });
                }
            }
        };
    };

    // Context
    static context = class {
        static attrObj = {};

        static attr = function (name, obj) {
            if (name !== undefined) {
                if (obj !== undefined) {
                    NA.context.attrObj[name] = obj;
                } else {
                    return NA.context.attrObj[name];
                }
            }

            return this;
        };
    };

    // Config
    static config = class {
        static filterConfig;
    };

}
