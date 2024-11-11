/*!
 * Natural-ARCHITECTURE v1.0.0
 *
 * Released under the LGPL v2.1 license
 * Date: 2014-09-26T11:11Z
 *  
 * Copyright 2014 Goldman Kim(bbalganjjm@gmail.com)
 */

import { N } from "./natural.js";
import { NC } from "./natural.core";

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

    // Ajax
    static ajax = jQuery.ajax;

    /**
     * Communicator
     *
     * Communicator class for handling AJAX requests with filtering mechanisms.
     * The class provides a structured way of initializing and making requests,
     * including the application of various filters at different stages of the request lifecycle.
     *
     * @class
     * @param {Object|String} obj - The options object or URL.
     * @param {String} [url] - The request URL, if `obj` is not a string.
     */
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

            NA.comm.xhr = NA.ajax(obj.request.options);
            if (!callback) {
                return NA.comm.xhr;
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
            attr(name, obj_) {
                if (name === undefined) {
                    return this.attrObj;
                }
                if (obj_ === undefined) {
                    return this.attrObj !== undefined && this.attrObj[name] !== undefined ? this.attrObj[name] : undefined;
                } else {
                    if (this.attrObj === undefined) {
                        this.attrObj = {};
                    }
                    this.attrObj[name] = obj_;
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
        static attr = NA.comm.request.prototype.attr
    };

    // Config
    static config = class {
        static filterConfig;
    };

}
