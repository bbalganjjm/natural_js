declare class N {
    private constructor();
    /**
     * Remove element in array
     */
    remove_(idx: any, length: any): any;
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
declare namespace N {
    /**
     * Set and get locale value
     */
    function locale(str: any): any;
    /**
     * Display the error log to console
     */
    function error(msg: any, e: any): any;
    /**
     * Check object type
     */
    function type(obj: any): any;
    /**
     * Check whether arg[0] is a String type
     */
    function isString(obj: any): boolean;
    /**
     * Check whether arg[0] is a numeric type
     */
    function isNumeric(obj: any): boolean;
    let isPlainObject: (obj: any) => boolean;
    /**
     * Check whether object is empty
     */
    function isEmptyObject(obj: any): boolean;
    let isArray: (arg: any) => arg is any[];
    /**
     * Checks whether an object of a type similar(array or jquery object etc.) to an array
     */
    function isArraylike(obj: any): boolean;
    /**
     * Check whether arg[0] is a jQuery Object type
     */
    function isWrappedSet(obj: any): boolean;
    /**
     * Check whether arg[0] is an element type
     */
    function isElement(obj: any): boolean;
    function toSelector(el: any): string;
    /**
     * Run asynchronous execution sequentially
     */
    function serialExecute(...args: any[]): any[];
    namespace gc {
        function minimum(): boolean;
        function full(): boolean;
        function ds(): void;
    }
    namespace string {
        function contains(context: any, str: any): boolean;
        function endsWith(context: any, str: any): boolean;
        function startsWith(context: any, str: any): boolean;
        function insertAt(context: any, idx: any, str: any): any;
        function removeWhitespace(str: any): any;
        function lpad(str: any, length: any, padStr: any): any;
        function rpad(str: any, length: any, padStr: any): any;
        function isEmpty(str: any): boolean;
        function byteLength(str: any, charByteLength: any): any;
        function trimToEmpty(str: any): string;
        function nullToEmpty(str: any): any;
        function trimToNull(str: any): any;
        function trimToUndefined(str: any): any;
        function trimToZero(str: any): any;
        function trimToVal(str: any, val: any): any;
    }
    namespace date {
        function diff(refDateStr: any, targetDateStr: any): number;
        function strToDateStrArr(str: any, format: any, isString: any): any[];
        function strToDate(str: any, format: any): {
            obj: Date;
            format: any;
        };
        function format(str: any, format: any): any;
        function dateToTs(dateObj: any): number;
        function tsToDate(tsNum: any): Date;
        function dateList(year: any, month: any): Date[][];
    }
    namespace element {
        function toOpts(ele: any): any;
        function toRules(ele: any, ruleset: any): {};
        function toData(eles: any): {};
        function dataChanged(ele: any): void;
        function maxZindex(ele: any): any;
    }
    namespace browser {
        function cookie(name: any, value: any, expiredays: any, domain: any): string;
        function removeCookie(name: any, domain: any): void;
        function msieVersion(): number;
        function is(name: any): boolean;
        function contextPath(): string;
        function scrollbarWidth(): number;
    }
    namespace message {
        function replaceMsgVars(msg: any, vars: any): any;
        function get(resource: any, key: any, vars: any): any;
    }
    namespace array {
        function deduplicate(arr: any, key: any): any[];
    }
    namespace json {
        export function mapFromKeys(obj: any, ...args: any[]): any;
        export function mergeJsonArray(arr1: any, arr2: any, key: any): any;
        export function format_1(oData: any, sIndent: any): string;
        export { format_1 as format };
    }
    namespace event {
        function isNumberRelatedKeys(e: any): boolean;
        function disable(e: any): boolean;
        function windowScrollLock(ele: any): void;
        function getMaxDuration(ele: any, css: any): any;
        function whichAnimationEvent(ele: any): any;
        function whichTransitionEvent(ele: any): any;
    }
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
