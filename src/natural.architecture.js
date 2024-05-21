/*!
 * Natural-ARCHITECTURE v0.15.12
 *
 * Released under the LGPL v2.1 license
 * Date: 2014-09-26T11:11Z
 *  
 * Copyright 2023 KIM HWANG MAN(bbalganjjm@gmail.com)
 */
(function(window, $) {
    N.version["Natural-ARCHITECTURE"] = "0.15.12";

    $.fn.extend($.extend(N.prototype, {
        ajax : function(opts) {
            return N.ajax(opts);
        },
        comm : function(url) {
            return new N.comm(this, url);
        },
        request : function() {
            return this.get(0).request;
        },
        cont : function(callback) {
            return new N.cont(this, callback);
        }
    }));

    (function(N) {
        // Ajax
        var Ajax = N.ajax = $.ajax;

        var filterConfig;

        // Communicator
        var Communicator = N.comm = function(obj, url) {
            if (obj === undefined) {
                throw N.error("[N.comm]You must input arguments[0]");
            } else {
                if ((N.isPlainObject(obj) || N.isString(obj)) && url === undefined) {
                    url = obj;
                    obj = $();
                }
            }

            if(N.isPlainObject(obj) || N.isArray(obj)) {
                obj = $(obj);
            }
            
            if(filterConfig === undefined) {
                filterConfig = Communicator.initFilterConfig();
            }

            var isFilterStopped = false;
            // request filter
            $(filterConfig.beforeInitFilters).each(function(i) {
                var jo;
                if((jo = this(obj)) instanceof Error){
                    isFilterStopped = true;
                    return false;
                }
                if(jo !== undefined) {
                    obj = $(jo);
                }
            });
            if(isFilterStopped) return obj;

            obj.request = new Communicator.request(obj, N.isString(url) ? {
                "url" : url
            } : url);

            obj.errorHandlers = [];
            
            $($.map(Communicator, function(v, i){
                if(typeof Communicator[i] === "function") {
                    if(i !== "request") {
                        return i;
                    }
                }
            })).each(function(i, v) {
                obj[v] = function(arg0) {
                    return Communicator[v].call(obj, arg0);
                };
            });

            return obj;
        };

        $.extend(Communicator, {
            xhr : null,
            initFilterConfig : function() {
                var beforeInitFilters = [];
                var afterInitFilters = [];
                var beforeSendFilters = [];
                var successFilters = [];
                var errorFilters = [];
                var completeFilters = [];
                var filters = N.context.attr("architecture").comm.filters;
                var orderedFilterKeys = [];
                var spltSepa = N.context.attr("core").spltSepa;

                // Indexing to execute filters with the order property defined first and filters with no order property defined
                for (var key in filters) {
                    if(filters[key].order !== undefined) {
                        orderedFilterKeys.push(filters[key].order + spltSepa + key);
                    }
                }
                orderedFilterKeys.sort();
                for (var key in filters) {
                    if(filters[key].order === undefined) {
                        orderedFilterKeys.push(key);
                    }
                }

                $(orderedFilterKeys).each(function() {
                    var kArr = this.split(spltSepa);
                    var k = kArr.length > 1 ? kArr[1] : kArr[0];
                    for (var filterKey in filters[k]) {
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
            },
            resetFilterConfig : function() {
                filterConfig = Communicator.initFilterConfig();
                return this;
            },
            submit : function(callback) {
                var obj = this;
                if (N.isElement(obj)) {
                    $.extend(this.request.options, {
                        contentType : "text/html; charset=UTF-8",
                        dataType : "html",
                        type : "GET"
                    });
                    this.request.options.target = obj;
                }

                var isFilterStopped = false;
                // request filter
                $(filterConfig.afterInitFilters).each(function(i) {
                    if(this(obj.request) instanceof Error){
                        isFilterStopped = true;
                        return false;
                    }
                });
                if(isFilterStopped) return;

                $.extend(obj.request.options, {
                    beforeSend : function(xhr, settings) {
                        var isFilterStopped = false;
                        // request filter
                        $(filterConfig.beforeSendFilters).each(function(i, filter) {
                            if(filter.call(obj, obj.request, xhr, settings) instanceof Error){
                                isFilterStopped = true;
                                return false;
                            }
                        });
                        if(isFilterStopped) return false;
                    },
                    success : function(data, textStatus, xhr) {
                        var isFilterStopped = false;
                        // request filter
                        $(filterConfig.successFilters).each(function(i, filter) {
                            var fData = filter.call(obj, obj.request, data, textStatus, xhr);
                            if(fData instanceof Error){
                                isFilterStopped = true;
                                return false;
                            }
                            if(fData !== undefined) {
                                data = fData;
                            }
                            fData = undefined;
                        });
                        if(isFilterStopped) return false;

                        var cont;
                        if (!N.isElement(obj)) {
                            if (obj.request.options.urlSync && obj.request.options.referrer.replace(/!/g, "") != window.location.href.replace(/!/g, "")) {
                                xhr.abort();
                                N.warn("[Communicator.submit.success(urlSync option)]The response was stopped because it was different from the URL at the time of the request and the URL at the time of the response.");
                                return false;
                            }
                        } else {
                            if(obj.is(N.context.attr("architecture").page.context)) {
                                N.gc[N.context.attr("core").gcMode]();
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

                            if(!obj.is(N.context.attr("architecture").page.context)) {
                                // Removes garbage instances from obserables of N.ds
                                N.gc.ds();
                            }

                            if(obj.request.options.replace){
                                if(obj.nextAll(".view_context__:first").length > 0){
                                    cont = obj.nextAll(".view_context__:first").instance("cont");
                                    if(cont !== undefined){
                                        // triggering "init" method
                                        Controller.trInit.call(this, cont, obj.request);
                                    }
                                }
                                obj.remove();
                            } else if(obj.children(".view_context__:last").length > 0) {
                                cont = obj.children(".view_context__:last").instance("cont");
                                if(cont !== undefined) {
                                    // triggering "init" method
                                    Controller.trInit.call(this, cont, obj.request);
                                }
                            }
                        }

                        if (callback !== undefined) {
                            try {
                                if (!N.isElement(obj)) {
                                    callback.call(obj, data, obj.request);
                                } else {
                                    callback.call(obj, cont);
                                }
                                cont = undefined;
                            } catch (e) {
                                if(obj.errorHandlers.length > 0) {
                                    $(obj.errorHandlers).each(function(i, errorHandler) {
                                        errorHandler.call(obj, e, obj.request, xhr, textStatus, callback);
                                    });
                                }
                                throw N.error("N.comm.submit.success.callback(url:" + obj.request.options.url + ")", e);
                            }
                        }
                    },
                    error : function(xhr, textStatus, e) {
                        var isFilterStopped = false;
                        // request filter
                        $(filterConfig.errorFilters).each(function(i, filter) {
                            if(filter.call(obj, obj.request, xhr, textStatus, e) instanceof Error){
                                isFilterStopped = true;
                                return false;
                            }
                        });

                        if(!isFilterStopped){
                            if(obj.errorHandlers.length > 0) {
                                $(obj.errorHandlers).each(function(i, errorHandler) {
                                    errorHandler.call(obj, e, obj.request, xhr, textStatus);
                                });
                            }
                            throw N.error("N.comm.submit.error(url:" + obj.request.options.url + ")", e);
                        }
                    },
                    complete : function(xhr, textStatus) {
                        var isFilterStopped = false;
                        // request filter
                        $(filterConfig.completeFilters).each(function(i, filter) {
                            if(filter.call(obj, obj.request, xhr, textStatus) instanceof Error){
                                isFilterStopped = true;
                                return false;
                            }
                        });
                    }
                });
                this.xhr = N.ajax(obj.request.options);
                return obj;
            },
            fetch : function() { // TODO Change $.ajax to fetch function
                var obj = this;
                return new Promise((resolve, reject) => {
                    if (N.isElement(obj)) {
                        $.extend(this.request.options, {
                            contentType : "text/html; charset=UTF-8",
                            dataType : "html",
                            type : "GET"
                        });
                        this.request.options.target = obj;
                    }

                    var isFilterStopped = false;
                    // request filter
                    $(filterConfig.afterInitFilters).each(function(i) {
                        if(this(obj.request) instanceof Error){
                            isFilterStopped = true;
                            return false;
                        }
                    });
                    if(isFilterStopped) return;

                    $.extend(obj.request.options, {
                        beforeSend : function(xhr, settings) {
                            var isFilterStopped = false;
                            // request filter
                            $(filterConfig.beforeSendFilters).each(function(i, filter) {
                                if(filter.call(obj, obj.request, xhr, settings) instanceof Error){
                                    isFilterStopped = true;
                                    return false;
                                }
                            });
                            if(isFilterStopped) return false;
                        },
                        success : function(data, textStatus, xhr) {
                            var isFilterStopped = false;
                            // request filter
                            $(filterConfig.successFilters).each(function(i, filter) {
                                var fData = filter.call(obj, obj.request, data, textStatus, xhr);
                                if(fData instanceof Error){
                                    isFilterStopped = true;
                                    return false;
                                }
                                if(fData !== undefined) {
                                    data = fData;
                                }
                                fData = undefined;
                            });
                            if(isFilterStopped) return false;

                            var cont;
                            if (!N.isElement(obj)) {
                                if (obj.request.options.urlSync && obj.request.options.referrer.replace(/!/g, "") != window.location.href.replace(/!/g, "")) {
                                    xhr.abort();
                                    N.warn("[Communicator.submit.success(urlSync option)]The response was stopped because it was different from the URL at the time of the request and the URL at the time of the response.");
                                    return false;
                                }
                            } else {
                                if(obj.is(N.context.attr("architecture").page.context)) {
                                    N.gc[N.context.attr("core").gcMode]();
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

                                if(!obj.is(N.context.attr("architecture").page.context)) {
                                    // Removes garbage instances from obserables of N.ds
                                    N.gc.ds();
                                }

                                if(obj.request.options.replace){
                                    if(obj.nextAll(".view_context__:first").length > 0){
                                        cont = obj.nextAll(".view_context__:first").instance("cont");
                                        if(cont !== undefined){
                                            // triggering "init" method
                                            Controller.trInit.call(this, cont, obj.request);
                                        }
                                    }
                                    obj.remove();
                                } else if(obj.children(".view_context__:last").length > 0) {
                                    cont = obj.children(".view_context__:last").instance("cont");
                                    if(cont !== undefined) {
                                        // triggering "init" method
                                        Controller.trInit.call(this, cont, obj.request);
                                    }
                                }
                            }

                            try {
                                if (!N.isElement(obj)) {
                                    resolve.call(obj, data, obj.request);
                                } else {
                                    resolve.call(obj, cont);
                                }
                                cont = undefined;
                            } catch (e) {
                                if(obj.errorHandlers.length > 0) {
                                    $(obj.errorHandlers).each(function(i, errorHandler) {
                                        errorHandler.call(obj, e, obj.request, xhr, textStatus, callback);
                                    });
                                }
                                reject(e);
                            }
                        },
                        error : function(xhr, textStatus, e) {
                            var isFilterStopped = false;
                            // request filter
                            $(filterConfig.errorFilters).each(function(i, filter) {
                                if(filter.call(obj, obj.request, xhr, textStatus, e) instanceof Error){
                                    isFilterStopped = true;
                                    return false;
                                }
                            });

                            if(!isFilterStopped){
                                if(obj.errorHandlers.length > 0) {
                                    $(obj.errorHandlers).each(function(i, errorHandler) {
                                        errorHandler.call(obj, e, obj.request, xhr, textStatus);
                                    });
                                }
                                throw N.error("N.comm.submit.error(url:" + obj.request.options.url + ")", e);
                            }
                        },
                        complete : function(xhr, textStatus) {
                            var isFilterStopped = false;
                            // request filter
                            $(filterConfig.completeFilters).each(function(i, filter) {
                                if(filter.call(obj, obj.request, xhr, textStatus) instanceof Error){
                                    isFilterStopped = true;
                                    return false;
                                }
                            });
                        }
                    });
                    this.xhr = N.ajax(obj.request.options);
                    return obj;
                });
            },
            error : function(callback) {
                this.errorHandlers.push(callback);
                return this;
            }
        });

        Communicator.request = function(obj, opts) {
            this.options = {
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
                $.extend(this.options, N.context.attr("architecture").comm.request.options);
            } catch (e) {
            }
            $.extend(this.options, opts);

            this.attrObj = {};

            this.obj = obj;

            // set post parameters
            if(this.options.data === null) {
                if(N.isWrappedSet(obj)) {
                    if(!N.isElement(obj)) {
                        try {
                            this.options.data = this.options.dataIsArray ? obj.get() : obj.get(0);
                            if((this.options.dataIsArray && N.type(this.options.data) === "array") || N.type(this.options.data) === "object") {
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
                            if(N.type(this.options.data) === "object") {
                                this.options.data = JSON.stringify(obj);
                            }
                        } catch(e) {
                            this.options.data = null;
                        }
                    }
                }

                // set get parameters
                if(this.options.data != null && this.options.type.toUpperCase() === "GET") {
                    var firstChar = this.options.data.charAt(0);
                    var lastChar = this.options.data.charAt(this.options.data.length - 1);
                    if(firstChar === "{" && lastChar === "}" || firstChar === "[" && lastChar === "]") {
                        this.options.data = "q=" + encodeURI(this.options.data);
                    }
                }
            }
        };

        // Communicator.request local variable;
        $.fn.extend(Communicator.request.prototype, {
            /**
             * get request attribute
             */
            attr : function(name, obj_) {
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
                    // this.obj is defined at Communicator.request constructor;
                    return this.obj;
                }
            },
            /**
             * remove request attribute
             */
            removeAttr : function(name) {
                if(this.attrObj[name] !== undefined) {
                    delete this.attrObj[name];
                }
                return this;
            },
            /**
             * get query parmas from request url
             */
            param : function(name) {
                if (N.isEmptyObject(name)) {
                    if (this.options.url.indexOf("?") < 0) {
                        return {};
                    } else {
                        var params = {};
                        var parts = this.options.url.split("?")[1].split('&');
                        for (var i = 0; i < parts.length; i++) {
                            var nv = parts[i].split('=');
                            if (!nv[0])
                                continue;
                            params[nv[0]] = decodeURIComponent(nv[1]) || true;
                        }
                        return params;
                    }
                } else {
                    return this.param()[name];
                }
            },
            get : function(key) {
                if(key !== undefined) {
                    return this.options[key];
                } else {
                    return this.options;
                }
            },
            /**
             * Reload block page
             */
            reload : function(callback) {
                var comm = this.options.target.comm(this.options.url);
                comm.request = this;
                comm.submit(callback);
                return this;
            }
        });

        var Controller = N.cont = function(obj, callback) {
            if(obj.attr("id") !== undefined && N("[id='" + obj.attr("id") + "']").length > 1) {
                obj = N("#" + obj.attr("id") + ":not([data-pageid])");
            } else {
                var selector = obj.selector;
                if(obj.length > 1) {
                    obj = N(obj.selector + ":not([data-pageid])");
                    obj.selector = selector;
                }               
            }
            obj.attr("data-pageid", obj.attr("id") ? obj.attr("id") : obj.selector.replace(/\.|\#|\[|\]|\'|\:|\(|\)|\>| |\-/gi, ""));
            obj.addClass("view_context__");

            obj.instance("cont", callback);

            callback.view = obj;
            return callback;
        };

        $.extend(Controller, {
            /**
             * "init" method trigger
             */
            trInit : function(cont, request) {
                // set request attribute
                cont.request = request;

                // AOP processing
                Controller.aop.wrap.call(this, cont);

                // run Controller's "init" method
                if(cont.init !== undefined) {
                    cont.init(cont.view, request);
                }
            },
            /**
             * AOP processing module
             */
            aop : {
                pointcuts : {
                    "regexp" : {
                        "fn" : function(param, contFrag, fnChain){
                            var regexp = param instanceof RegExp ? param : new RegExp(param);
                            return regexp.test(fnChain);
                        }
                    }
                },
                wrap : function(cont) {
                    if (N.context.attr("architecture").cont &&
                        N.context.attr("architecture").cont.advisors &&
                        N.context.attr("architecture").cont.advisors.length > 0) {
                        var o = N.context.attr("architecture").cont;

                        $(o.advisors).each(function (idx, advisor) {
                            var pointcut;
                            if (!N.isPlainObject(advisor.pointcut)) {
                                advisor.pointcut = { "type": "regexp", "param": advisor.pointcut };
                                if(N.isString(advisor.pointcut.param)){
                                    advisor.pointcut.selector = advisor.pointcut.selector || advisor.pointcut.param.substring(0, advisor.pointcut.param.lastIndexOf(":"));
                                    advisor.pointcut.param = advisor.pointcut.param.substring(advisor.pointcut.param.lastIndexOf(":") + 1);
                                }
                            }

                            pointcut = o.pointcuts ? (o.pointcuts[advisor.pointcut.type] || Controller.aop.pointcuts[advisor.pointcut.type]) : Controller.aop.pointcuts[advisor.pointcut.type];

                            if(!pointcut){
                                throw N.error("[N.cont.aop.wrap]Unkown pointcut type : " + advisor.pointcut.type);
                            }

                            if(advisor.pointcut.selector && !cont.view.is(advisor.pointcut.selector)){
                                return;
                            }

                            var wrapFn = function(contFrag, fnPath){

                                for (var x in contFrag) {
                                    if (!contFrag.hasOwnProperty(x)) continue;

                                    if(typeof contFrag[x] === "function") {
                                        if (pointcut.fn(advisor.pointcut.param, contFrag, fnPath + x)) {
                                            var real = contFrag[x];

                                            contFrag[x] = (function (real, x) {
                                                var wrappedFn;

                                                switch(advisor.adviceType){
                                                    case "before":
                                                    wrappedFn = function(){
                                                        var args = [].slice.call(arguments);
                                                        advisor.fn.call(advisor, contFrag, fnPath + x, args);
                                                        return real.apply(contFrag, args);
                                                    };
                                                    break;
                                                    case "after":
                                                    wrappedFn = function(){
                                                        var args = [].slice.call(arguments);
                                                        var result = real.apply(contFrag, args);
                                                        advisor.fn.call(advisor, contFrag, fnPath + x, args, result);
                                                        return result;
                                                    };
                                                    break;
                                                    case "around":
                                                    wrappedFn = function(){
                                                        var args = [].slice.call(arguments);
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
                                                        var args = [].slice.call(arguments);
                                                        var result;
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
                                    } else if(N.isPlainObject(contFrag[x])) {
                                        wrapFn.call(this, contFrag[x], fnPath + x + ".");
                                    }
                                }
                            };
                            wrapFn.call(this, cont, "");
                        });
                    }
                }
            }
        });

        // Context Object
        N.context = {
            attrObj : {},
            attr : Communicator.request.prototype.attr
        };

    })(N);

})(window, jQuery);