/**
 * Natural-JS Logger Utilities
 */

import { TypeChecker } from './type-checker.js';

export class Logger {
    /**
     * Displays debug logs on the console.
     */
    static debug = console && console.debug ? console.debug.bind(window.console) : function() {};

    /**
     * Displays general logs on the console.
     */
    static log = console && console.log ? console.log.bind(window.console) : function() {};

    /**
     * Displays info logs on the console.
     */
    static info = console && console.info ? console.info.bind(window.console) : function() {};

    /**
     * Displays warning logs on the console.
     */
    static warn = console && console.warn ? console.warn.bind(window.console) : function() {};

    /**
     * Displays error logs on the console and creates Error object
     */
    static error(msg, e) {
        if(TypeChecker.type(e) !== "error") {
            e = new Error(msg);

            if("captureStackTrace" in Error) {
                Error.captureStackTrace(e, Logger.error);
            }
        } else {
            e.message = (msg != null ? "[" + msg + "]" : "") + e.message;
        }
        return e;
    }
}

// Export individual methods for convenience
export const { debug, log, info, warn, error } = Logger;
