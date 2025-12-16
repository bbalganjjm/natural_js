/**
 * Natural-JS Architecture Request Class
 * Holds request options and provides utility methods
 */

import { type, isWrappedSet } from '../../core/helpers/type-checker.js';
import { isEmpty } from '../../core/utils/string.js';
import { Context } from '../context/context.js';

export class Request {
    constructor(obj, opts) {
        // Default options
        this.options = {
            url: null,
            referrer: window.location.href,
            contentType: "application/json; charset=utf-8",
            cache: false,
            async: true,
            type: "POST",
            data: null,
            dataIsArray: false,
            dataType: "json",
            urlSync: true,
            crossDomain: false,
            browserHistory: true,
            append: false,
            target: null
        };

        // Merge global config options
        try {
            jQuery.extend(this.options, Context.attr("architecture")?.comm?.request?.options || {});
        } catch (e) {
            // Ignore if architecture context not set up
        }
        
        // Merge provided options
        jQuery.extend(this.options, opts);

        this.attrObj = {};
        this.obj = obj;

        // Auto-set post data from obj
        if(this.options.data === null) {
            if(isWrappedSet(obj)) {
                if(obj.jquery && obj.length > 0 && obj[0].nodeType) {
                    // obj is a DOM element (isElement returns true)
                    // Do not auto-set data
                } else {
                    try {
                        this.options.data = this.options.dataIsArray ? obj.get() : obj.get(0);
                        if((this.options.dataIsArray && type(this.options.data) === "array") || type(this.options.data) === "object") {
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
                        if(type(this.options.data) === "object") {
                            this.options.data = JSON.stringify(obj);
                        }
                    } catch(e) {
                        this.options.data = null;
                    }
                }
            }

            // Convert to GET parameters
            if(this.options.data != null && this.options.type.toUpperCase() === "GET") {
                const firstChar = this.options.data.charAt(0);
                const lastChar = this.options.data.charAt(this.options.data.length - 1);
                if(firstChar === "{" && lastChar === "}" || firstChar === "[" && lastChar === "]") {
                    this.options.data = "q=" + encodeURI(this.options.data);
                }
            }
        }
    }

    /**
     * Get/set request attribute
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
            return this.obj;
        }
    }

    /**
     * Remove request attribute
     */
    removeAttr(name) {
        if(this.attrObj[name] !== undefined) {
            delete this.attrObj[name];
        }
        return this;
    }

    /**
     * Get query params from request URL
     */
    param(name) {
        if (isEmpty(name)) {
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
    }

    /**
     * Get request option value
     */
    get(key) {
        if(key !== undefined) {
            return this.options[key];
        } else {
            return this.options;
        }
    }

    /**
     * Reload block page
     */
    reload(callback) {
        const comm = this.options.target.comm(this.options.url);
        comm.request = this;
        comm.submit(callback);
        return this;
    }
}

export default Request;
