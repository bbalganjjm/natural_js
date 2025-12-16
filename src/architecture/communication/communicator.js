/**
 * Natural-JS Architecture Communicator Class
 * Communication/Ajax wrapper with filter support
 */

import { error as createError, warn } from '../../core/helpers/logger.js';
import { isPlainObject, isString, isElement, isArray, isWrappedSet } from '../../core/helpers/type-checker.js';
import { Request } from './request.js';
import { Fetch } from './fetch.js';
import { Context } from '../context/context.js';

// Config storage
const CommunicatorConfig = {
    filterConfig: undefined
};

export class Communicator {
    constructor(obj, url) {
        if (obj === undefined) {
            throw createError("[N.comm]You must input arguments[0]");
        } else {
            if ((isPlainObject(obj) || isString(obj)) && url === undefined) {
                url = obj;
                obj = jQuery();
            }
        }

        if(isPlainObject(obj) || isArray(obj)) {
            obj = jQuery(obj);
        }

        if(CommunicatorConfig.filterConfig === undefined) {
            CommunicatorConfig.filterConfig = Communicator.initFilterConfig();
        }

        let isFilterStopped = false;
        // beforeInit filters
        jQuery(CommunicatorConfig.filterConfig.beforeInitFilters).each(function() {
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

        obj.request = new Request(obj, isString(url) ? { "url" : url } : url);
        obj.errorHandlers = [];

        // Copy comm methods to obj
        jQuery(jQuery.map(Communicator, function(v, i){
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
    }

    static xhr = null;

    static initFilterConfig() {
        const beforeInitFilters = [];
        const afterInitFilters = [];
        const beforeSendFilters = [];
        const successFilters = [];
        const errorFilters = [];
        const completeFilters = [];
        
        try {
            const filters = Context.attr("architecture")?.comm?.filters || {};
            const orderedFilterKeys = [];
            const spltSepa = Context.attr("core")?.spltSepa || "|";

            // Index filters with order property first, then filters without order
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

            // Categorize filters by type
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
        } catch(e) {
            // Context not set up, return empty filters
        }

        return {
            "beforeInitFilters" : beforeInitFilters,
            "afterInitFilters" : afterInitFilters,
            "beforeSendFilters" : beforeSendFilters,
            "successFilters" : successFilters,
            "errorFilters" : errorFilters,
            "completeFilters" : completeFilters
        }
    }

    static resetFilterConfig() {
        CommunicatorConfig.filterConfig = Communicator.initFilterConfig();
        return this;
    }

    static submit(callback) {
        const obj = this;
        if (isElement(obj)) {
            jQuery.extend(obj.request.options, {
                contentType : "text/html; charset=UTF-8",
                dataType : "html",
                type : "GET"
            });
            obj.request.options.target = obj;
        }

        let isFilterStopped = false;
        // afterInit filters
        jQuery(CommunicatorConfig.filterConfig.afterInitFilters).each(function() {
            if(this(obj.request) instanceof Error){
                isFilterStopped = true;
                return false;
            }
        });
        if(isFilterStopped) return;

        jQuery.extend(obj.request.options, {
            beforeSend : function(xhr, settings) {
                let isFilterStopped = false;
                // beforeSend filters
                jQuery(CommunicatorConfig.filterConfig.beforeSendFilters).each(function(i, filter) {
                    if(filter.call(obj, obj.request, xhr, settings) instanceof Error){
                        isFilterStopped = true;
                        return false;
                    }
                });
                if(isFilterStopped) return false;
            },
            success : function(data, textStatus, xhr) {
                let isFilterStopped = false;
                // success filters
                jQuery(CommunicatorConfig.filterConfig.successFilters).each(function(i, filter) {
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
                if (!isElement(obj)) {
                    if (obj.request.options.urlSync && obj.request.options.referrer.replace(/!/g, "") !== window.location.href.replace(/!/g, "")) {
                        xhr.abort();
                        warn("[N.comm.submit.success(urlSync option)]The response was stopped because it was different from the URL at the time of the request and the URL at the time of the response.");
                        return false;
                    }
                } else {
                    // Import GC and Controller at runtime to avoid circular dependency
                    const gc = window.N?.gc;
                    const Controller = window.N?.cont;
                    const pageContext = Context.attr("architecture")?.page?.context;

                    if(gc && pageContext && obj.is(pageContext)) {
                        const gcMode = Context.attr("core")?.gcMode || "minimum";
                        gc[gcMode]();
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

                    if(gc && pageContext && !obj.is(pageContext)) {
                        // Remove garbage instances from ND.ds observables
                        gc.ds();
                    }

                    if(obj.request.options.replace){
                        if(obj.nextAll(".view_context__:first").length > 0){
                            cont = obj.nextAll(".view_context__:first").instance("cont");
                            if(cont !== undefined && Controller){
                                // Trigger "init" method
                                Controller.trInit.call(this, cont, obj.request);
                            }
                        }
                        obj.remove();
                    } else if(obj.children(".view_context__:last").length > 0) {
                        cont = obj.children(".view_context__:last").instance("cont");
                        if(cont !== undefined && Controller) {
                            // Trigger "init" method
                            Controller.trInit.call(this, cont, obj.request);
                        }
                    }
                }

                if (callback !== undefined) {
                    try {
                        if (!isElement(obj)) {
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
                        throw createError("N.comm.submit.success.callback(url:" + obj.request.options.url + ")", e);
                    }
                }
            },
            error : function(xhr, textStatus, e) {
                let isFilterStopped = false;
                // error filters
                jQuery(CommunicatorConfig.filterConfig.errorFilters).each(function(i, filter) {
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
                        throw createError("N.comm.submit.error(url:" + obj.request.options.url + ")", e);
                    }
                }
            },
            complete : function(xhr, textStatus) {
                let isFilterStopped = false;
                // complete filters
                jQuery(CommunicatorConfig.filterConfig.completeFilters).each(function(i, filter) {
                    if(filter.call(obj, obj.request, xhr, textStatus) instanceof Error){
                        isFilterStopped = true;
                        return false;
                    }
                });
            }
        });

        obj.xhr = Fetch.fetch(obj.request.options);
        if (!callback) {
            return obj.xhr;
        } else {
            return obj;
        }
    }

    static error(callback) {
        this.errorHandlers.push(callback);
        return this;
    }
}

export const comm = (obj, url) => new Communicator(obj, url);
export default Communicator;
