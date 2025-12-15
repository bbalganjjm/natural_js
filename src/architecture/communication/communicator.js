/**
 * Natural-JS Architecture Communicator Class
 * Communication/Ajax wrapper
 */

import { error as createError } from '../../core/helpers/logger.js';
import { isPlainObject, isString, isElement, isArray } from '../../core/helpers/type-checker.js';
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

        obj.request = new Request(obj, isString(url) ? { "url" : url } : url);
        obj.errorHandlers = [];

        // Copy comm methods to obj
        ['submit', 'error'].forEach(method => {
            obj[method] = function(arg) {
                return Communicator[method].call(obj, arg);
            };
        });

        return obj;
    }

    static xhr = null;

    static initFilterConfig() {
        const filters = Context.attr("architecture")?.comm?.filters || {};
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

        jQuery.extend(obj.request.options, {
            success : function(data, textStatus, xhr) {
                if (isElement(obj)) {
                    obj.html(data);
                }
                if (callback) {
                    callback.call(obj, data);
                }
            },
            error : function(xhr, textStatus, errorThrown) {
                jQuery(obj.errorHandlers).each(function() {
                    this.call(obj, xhr, textStatus, errorThrown);
                });
            }
        });

        Communicator.xhr = Fetch.fetch(obj.request.options);
        return this;
    }

    static error(callback) {
        this.errorHandlers.push(callback);
        return this;
    }
}

export const comm = (obj, url) => new Communicator(obj, url);
export default Communicator;
