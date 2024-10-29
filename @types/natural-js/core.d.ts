declare namespace N {
    type NDate = {
        obj: Date,
        format: string
    }
    type NOrHTMLElement = N | HTMLElement;
    type RuleObj = {
        id: {
            ruleName: [[string, ...[]]]
        }
    }
    type DataObj = {
        id: string
    }

    function locale(str: string): string | undefined;
    function error(msg?: string, e?: Error): Error;
    function type(obj?: any): string;
    function isString(obj?: any): boolean;
    function isNumeric(obj?: any): string;
    function isPlainObject(obj?: any): boolean;
    function isEmptyObject(obj?: any): boolean;
    function isArray(obj?: any): boolean;
    function isArraylike(obj?: any): boolean;
    function isWrappedSet(obj?: any): boolean;
    function isElement(obj?: any): boolean;
    function toSelector(el?: N.NOrHTMLElement): string;
    function serialExecute(): JQuery.Deferred[];

    function debug(obj?: any): Console;
    function log(obj?: any): Console;
    function info(obj?: any): Console;
    function warn(obj?: any): Console;
}

declare namespace N.gc {
    function minimum (): true;
    function full (): true;
    function ds (): void;
}

declare namespace N.string {
    function contains(context: string, str: string): boolean;
    function endsWith(context: string, str: string): boolean;
    function startsWith(context: string, str: string): boolean;
    function insertAt(context: string, idx: number, str: string): string;
    function removeWhitespace(str: string): string;
    function lpad(str: string, length: number, padStr: string): string;
    function rpad(str: string, length: number, padStr: string): string;
    function isEmpty(str: string): boolean;
    function byteLength(str: string,  charByteLength: number): boolean;
    function trimToEmpty(str: string): string;
    function nullToEmpty(str: string | null | undefined): string;
    function trimToNull(str: string): string | null;
    function trimToUndefined(str: string): string | undefined;
    function trimToZero(str: string): string;
    function trimToVal(str: string, val: string): string;
}

declare namespace N.date {
    function diff(refDateStr: string, targetDateStr: string): number;
    function strToDateStrArr(str: string, format: string, isString?: boolean): string[] | number[];
    function strToDate(str: string, format: string): N.NDate | null;
    function format(str: string, format?: string): string;
    function dateToTs(dateObj?: Date): number;
    function tsToDate(tsNum?: number): Date;
    function dateList(year: number, month: number): [Data[]];
}

declare namespace N.element {
    function toOpts (ele: N.NOrHTMLElement): string;
    function toRules (ele: N, ruleset: string): N.RuleObj;
    function toData (eles: N): N.DataObj;
    function dataChanged (eles: N): void;
    function maxZindex (ele: N): number;
}

declare namespace N.browser {
    function cookie (name: string, value?: string, expiredays?: number, domain?: string): string | undefined;
    function removeCookie (name: string, domain?: string): void;
    function msieVersion (): number;
    function is (name: string): boolean;
    function contextPath (): string;
    function scrollbarWidth (): number;
}

declare namespace N.message {
    function replaceMsgVars (msg: string, vars?: string[]): string;
    function get (resource: object, msg: string, vars?: string[]): void;
}

declare namespace N.array {
    function deduplicate (arr: [], key?: string): [];
}

declare namespace N.json {
    function mapFromKeys (obj: object | object[]): object | object[];
    function mergeJsonArray (arr1: object[], arr2: object[], key: string): object[];
    function format (oData: object | object[] | string, sIndent: number): string | null;
}

declare namespace N.event {
    function isNumberRelatedKeys (e: Event): boolean;
    function disable (e: Event): false;
    function windowScrollLock (ele: N<HTMLElement>): void;
    function getMaxDuration (ele: N<HTMLElement>, css: string): number;
    function whichAnimationEvent (ele: N<HTMLElement>): string | "nothing";
    function whichTransitionEvent (ele: N<HTMLElement>): string | "nothing";
}

declare interface Date {
    formatDate(input: string, time?: number): string;
}

declare namespace N {
    const mask = Mask;
}
declare class Mask {
    setGeneric(_v: string, _d: boolean): string;
    setNumeric(_v: string, _p: string, _d: boolean): string;
}
