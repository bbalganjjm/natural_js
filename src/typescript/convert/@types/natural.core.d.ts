/*!
 * Natural-CORE v1.0.0
 *
 * Released under the LGPL v2.1 license
 * Date: 2014-09-26T11:11Z
 *
 * Copyright 2014 Goldman Kim(bbalganjjm@gmail.com)
 *
 * Includes formatdate.js & Mask JavaScript API
 * formatdate.js : http://www.svendtofte.com/javascript/javascript-date-string-formatting/
 * Mask JavaScript API : http://www.pengoworks.com/workshop/js/mask/, dswitzer@pengoworks.com
 */
export class N {
    static _version: Readonly<{
        "Natural-CORE": "1.0.0";
    }>;
    static get version(): Readonly<{
        "Natural-CORE": "1.0.0";
    }>;
    /**
     * Set and get locale value
     */
    static locale(str: any): any;
    /**
     * Display the error log to console
     */
    static error(msg: any, e: any): any;
    /**
     * Check object type
     */
    static type(obj: any): any;
    /**
     * Check whether arg[0] is a String type
     */
    static isString(obj: any): boolean;
    /**
     * Check whether arg[0] is a numeric type
     */
    static isNumeric(obj: any): boolean;
    /**
     * Check whether arg[0] is a plain object type
     */
    static isPlainObject: (obj: any) => boolean;
    /**
     * Check whether object is empty
     */
    static isEmptyObject(obj: any): boolean;
    /**
     * Check whether arg[0] is a Array type
     */
    static isArray: (arg: any) => arg is any[];
    /**
     * Checks whether an object of a type similar(array or jquery object etc.) to an array
     */
    static sArraylike(obj: any): boolean;
    /**
     * Check whether arg[0] is a jQuery Object type
     */
    static isWrappedSet(obj: any): boolean;
    /**
     * Check whether arg[0] is an element type
     */
    static isElement(obj: any): boolean;
    static toSelector(el: any): string;
    /**
     * Run asynchronous execution sequentially
     */
    static serialExecute(...args: any[]): any[];
    /**
     * Natural-JS resource garbage collector
     */
    static gc: {
        /**
         * Minimum collection
         */
        minimum: () => boolean;
        /**
         * Full collection
         */
        full: () => boolean;
        /**
         * Removes garbage instances from observables of N.ds
         */
        ds: () => void;
    };
    /**
     * N.string package
     */
    static string: {
        contains: (context: any, str: any) => boolean;
        endsWith: (context: any, str: any) => boolean;
        startsWith: (context: any, str: any) => boolean;
        insertAt: (context: any, idx: any, str: any) => any;
        removeWhitespace: (str: any) => any;
        lpad: (str: any, length: any, padStr: any) => any;
        rpad: (str: any, length: any, padStr: any) => any;
        isEmpty: (str: any) => boolean;
        byteLength: (str: any, charByteLength: any) => any;
        trimToEmpty: (str: any) => string;
        nullToEmpty: (str: any) => any;
        trimToNull: (str: any) => string;
        trimToUndefined: (str: any) => string;
        trimToZero: (str: any) => string;
        trimToVal: (str: any, val: any) => any;
    };
    /**
     * N.date package
     */
    static date: {
        /**
         * Calculate the difference between two dates
         */
        diff: (refDateStr: any, targetDateStr: any) => number;
        /**
         * Return to re-place the date string for a given format.
         */
        strToDateStrArr: (str: any, format: any, isString: any) => any[];
        /**
         * Convert a date string to a date object
         */
        strToDate: (str: any, format: any) => {
            obj: Date;
            format: any;
        };
        /**
         * Format the date string
         */
        format: (str: any, format: any) => any;
        /**
         * Convert date object to timestamp number
         */
        dateToTs: (dateObj: any) => number;
        /**
         * Convert timestamp number to date object
         */
        tsToDate: (tsNum: any) => Date;
        /**
         * Get a list of monthly date objects
         *
         * @param year
         * @param month
         * @return array[array[date]]
         */
        dateList: (year: any, month: any) => Date[][];
    };
    /**
     * N.element package
     */
    static element: {
        /**
         * make options object from class attribute
         */
        toOpts: (ele: any) => any;
        /**
         * make rules object from input element
         */
        toRules: (ele: any, ruleset: any) => {};
        /**
         * make data object from input element
         */
        toData: (eles: any) => {};
        /**
         * Data change effect for N.ds
         */
        dataChanged: (ele: any) => void;
        /**
         * Get the maximum z-index of all elements
         */
        maxZindex: (ele: any) => any;
    };
    /**
     * N.browser package
     */
    static browser: {
        /**
         * Set and get cookie
         *  - get : when value is undefined
         */
        cookie: (name: any, value: any, expiredays: any, domain: any) => string;
        /**
         * Remove cookie
         */
        removeCookie: (name: any, domain: any) => void;
        /**
         * Get Microsoft Internet Explorer version
         *  - MSIE trident version has been applied
         */
        msieVersion: () => number;
        /**
         * Check the connected browser
         */
        is: (name: any) => boolean;
        /**
         * Get context path from current window url
         */
        contextPath: () => string;
        /**
         * Get scrollbars width for connected browser
         */
        scrollbarWidth: () => number;
    };
    /**
     * N.message package
     */
    static message: {
        /**
         * Replace message variables for N.message.get
         */
        replaceMsgVars: (msg: any, vars: any) => any;
        /**
         * Get message from message resource
         */
        get: (resource: any, key: any, vars: any) => any;
    };
    /**
     * N.array package
     */
    static array: {
        /**
         * Remove duplicated value(object | etc.)
         */
        deduplicate: (arr: any, key: any) => any[];
    };
    /**
     * N.json package
     */
    static json: {
        mapFromKeys: (obj: any, ...args: any[]) => any;
        /**
         * Merge JSON Array by key
         */
        mergeJsonArray: (arr1: any, arr2: any, key: any) => any;
        /**
         * Return formated JSON String
         */
        format: (oData: any, sIndent: any) => string;
    };
    static event: {
        /**
         * This function was taken from "https://stackoverflow.com/a/13952775" and modified.
         */
        isNumberRelatedKeys: (e: any) => boolean;
        /**
         * Prevent all events
         */
        disable: (e: any) => boolean;
        /**
         * This method is locked window scroll when scrolling in the ele(arg1)
         */
        windowScrollLock: (ele: any) => void;
        /**
         * Detect the duration of animation or transition of css3
         */
        getMaxDuration: (ele: any, css: any) => any;
        /**
         * Detect the end event name of CSS animations
         * Reference from David Walsh: http://davidwalsh.name/css-animation-callback
         */
        whichAnimationEvent: (ele: any) => any;
        /**
         * Detect the end event name of CSS transitions
         * Reference from David Walsh: http://davidwalsh.name/css-animation-callback
         */
        whichTransitionEvent: (ele: any) => any;
    };
    constructor(selector: any, context: any);
    /**
     * Remove element in array
     */
    remove_(idx: any, length: any): this;
    /**
     * Bind an event to top priority
     */
    tpBind(...args: any[]): any;
    /**
     * Get instance from context element of component or library
     */
    instance(name: any, instance: any, ...args: any[]): any;
    /**
     * Get or set the value to (multiple)select input elements
     * if vals(arg[0]) argument is undefined, it works in get mode
     */
    vals(vals: any): any;
    /**
     * Returns the event bound to the element.
     */
    events(eventName: any, namespace: any): any;
}
export namespace N {
    let defers: any[];
    namespace mask {
        function constructor(m: any): void;
        function setGeneric(_v: any, _d: any): any;
        function setNumeric(_v: any, _p: any, _d: any): any;
    }
    let debug: any;
    let log: any;
    let info: any;
    let warn: any;
}
declare var Date: DateConstructor;
interface Date {
    toString(): string;
    toDateString(): string;
    toTimeString(): string;
    toLocaleString(): string;
    toLocaleString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string;
    toLocaleDateString(): string;
    toLocaleDateString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string;
    toLocaleTimeString(): string;
    toLocaleTimeString(locales?: string | string[], options?: Intl.DateTimeFormatOptions): string;
    valueOf(): number;
    getTime(): number;
    getFullYear(): number;
    getUTCFullYear(): number;
    getMonth(): number;
    getUTCMonth(): number;
    getDate(): number;
    getUTCDate(): number;
    getDay(): number;
    getUTCDay(): number;
    getHours(): number;
    getUTCHours(): number;
    getMinutes(): number;
    getUTCMinutes(): number;
    getSeconds(): number;
    getUTCSeconds(): number;
    getMilliseconds(): number;
    getUTCMilliseconds(): number;
    getTimezoneOffset(): number;
    setTime(time: number): number;
    setMilliseconds(ms: number): number;
    setUTCMilliseconds(ms: number): number;
    setSeconds(sec: number, ms?: number): number;
    setUTCSeconds(sec: number, ms?: number): number;
    setMinutes(min: number, sec?: number, ms?: number): number;
    setUTCMinutes(min: number, sec?: number, ms?: number): number;
    setHours(hours: number, min?: number, sec?: number, ms?: number): number;
    setUTCHours(hours: number, min?: number, sec?: number, ms?: number): number;
    setDate(date: number): number;
    setUTCDate(date: number): number;
    setMonth(month: number, date?: number): number;
    setUTCMonth(month: number, date?: number): number;
    setFullYear(year: number, month?: number, date?: number): number;
    setUTCFullYear(year: number, month?: number, date?: number): number;
    toUTCString(): string;
    toISOString(): string;
    toJSON(key?: any): string;
    [Symbol.toPrimitive](hint: "default"): string;
    [Symbol.toPrimitive](hint: "string"): string;
    [Symbol.toPrimitive](hint: "number"): number;
    [Symbol.toPrimitive](hint: string): string | number;
}
export {};
