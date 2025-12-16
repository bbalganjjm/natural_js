/**
 * Natural-JS Architecture Fetch API
 * XHR-compatible wrapper over native Fetch API
 */

import { error as createError, warn } from '../../core/helpers/logger.js';

export class Fetch {
    static fetch(options) {
        // 1. Options validation
        if (!options.url) {
            throw createError("[N.fetch]options.url is required");
        }
        
        // 2. async: false warning
        if (options.async === false) {
            warn("[N.fetch]async: false is not supported. fetch is always asynchronous.");
        }
        
        // 3. Create AbortController
        const controller = new AbortController();
        const signal = controller.signal;
        
        // 4. Convert options
        const fetchOptions = Fetch._convertJQueryAjaxOptionsToFetch(options, signal);
        
        // 5. Merge custom fetchOptions if provided
        if (options.fetchOptions) {
            jQuery.extend(true, fetchOptions, options.fetchOptions);
        }
        
        // 6. Execute beforeSend
        if (options.beforeSend) {
            if (Fetch._executeBeforeSend(options, controller) === false) {
                return Fetch._createAbortedXhr();
            }
        }
        
        // 7. Execute fetch
        const promise = Fetch._executeFetch(options.url, fetchOptions, options);
        
        // 8. Return xhr-compatible object
        return Fetch._createXhrCompat(promise, controller, options);
    }

    /**
     * Convert jQuery.ajax options to fetch API options
     * @private
     */
    static _convertJQueryAjaxOptionsToFetch(options, signal) {
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
    }

    /**
     * Execute beforeSend callback
     * @private
     */
    static _executeBeforeSend(options, controller) {
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
    }

    /**
     * Create xhr-compatible object from fetch Response
     * @private
     */
    static _createXhrFromResponse(response) {
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
    }

    /**
     * Create xhr-compatible object from fetch error
     * @private
     */
    static _createXhrFromError(error) {
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
    }

    /**
     * Execute fetch and handle response/error
     * @private
     */
    static _executeFetch(url, fetchOptions, options) {
        return globalThis.fetch(url, fetchOptions)
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
                    const xhr = Fetch._createXhrFromResponse(result.response);
                    options.success(result.data, result.textStatus, xhr);
                }
                
                // 4. Execute complete callback
                if (options.complete) {
                    const xhr = Fetch._createXhrFromResponse(result.response);
                    options.complete(xhr, result.textStatus);
                }
                
                return result.data;
            })
            .catch(function(error) {
                // 5. Execute error callback
                if (options.error) {
                    const xhr = Fetch._createXhrFromError(error);
                    const textStatus = error.name === "AbortError" ? "abort" : "error";
                    options.error(xhr, textStatus, error);
                }
                
                // 6. Execute complete callback (even on error)
                if (options.complete) {
                    const xhr = Fetch._createXhrFromError(error);
                    const textStatus = error.name === "AbortError" ? "abort" : "error";
                    options.complete(xhr, textStatus);
                }
                
                throw error;
            });
    }

    /**
     * Create xhr-compatible object from fetch Promise
     * @private
     */
    static _createXhrCompat(promise, controller, options) {
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
    }

    /**
     * Create aborted xhr-compatible object
     * @private
     */
    static _createAbortedXhr() {
        const error = new Error("abort");
        error.name = "AbortError";
        const promise = Promise.reject(error);
        return Fetch._createXhrCompat(promise, { abort: function() {} }, {});
    }
}

export const fetch = Fetch.fetch.bind(Fetch);
export default Fetch;
