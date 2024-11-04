declare type Rules = {
    [key: string]: [string, ...Primitive][];
}[];

declare type FormatObject = {
    [key: string]: string;
}[];

declare type ValidateObject = {
    [key: string]: [{
        rule: string,
        result: boolean;
        msg: string | null;
    }];
}[]

declare type ConditionCallback = {
    (item: object): boolean;
}

declare namespace N {
    function formatter(data: NJSONObject, rules?: NHTMLElement | HTMLElement | string | Rules): this;
    function validator(data: NJSONObject, rules?: NHTMLElement | HTMLElement | string | Rules): this;
    function ds(inst: T, isReg?: boolean): T;
}
declare namespace N.formatter {
    function format(row?: number): FormatObject;
    function unformat(row: number, key: string): Primitive;
}
declare namespace N.validator {
    function validate(row?: number): ValidateObject;
}
declare namespace N.data {
    function filter(data: NJSONObject, condition: ConditionCallback | string): object[];
    function sort(data: NJSONObject, key: string, reverse?: boolean): object[];
}
declare namespace N.ds {
    function instance(inst: T, isReg?: boolean): DataSync;
}

declare interface N {
    datafilter(condition: ConditionCallback | string): object[];
    datasort(key: string, reverse?: boolean): object[];
    formatter(rules: NHTMLElement | HTMLElement | string | Rules): this;
    validator(rules: NHTMLElement | HTMLElement | string | Rules): this;
}

declare interface DataSync {
    remove(): this;
    notify(row: number, key: string): this;
}

declare namespace N.formatter {
    function commas(str: string): string;
    function rrn(str: string, args: Primitive[]): string;
    function ssn(str: string, args: Primitive[]): string;
    function kbrn(str: string,): string;
    function kcn(str: string,): string;
    function upper(str: string,): string;
    function lower(str: string,): string;
    function capitalize(str: string,): string;
    function zipcode(str: string,): string;
    function phone(str: string,): string;
    function realnum(str: string,): string;
    function trimtoempty(str: string,): string;
    function trimtozero(str: string,): string;
    function date(str: string, args: Primitive[], ele: NHTMLElement): string;
    function time(str: string, args: Primitive[]): string;
    function limit(str: string, args: Primitive[], ele: NHTMLElement): string;
    function replace(str: string, args: Primitive[], ele: NHTMLElement): string;
    function lpad(str: string, args: Primitive[]): string;
    function rpad(str: string, args: Primitive[]): string;
    function mask(str: string, args: Primitive[]): string;
    function generic(str: string, args: Primitive[]): string;
    function numeric(str: string, args: Primitive[]): string;
}

declare namespace N.validator {
    function required(str: string): boolean;
    function alphabet(str: string): boolean;
    function integer(str: string): boolean;
    function korean(str: string): boolean;
    function alphabet_integer(str: string): boolean;
    function integer_korean(str: string): boolean;
    function alphabet_korean(str: string): boolean;
    function alphabet_integer_korean(str: string): boolean;
    function dash_integer(str: string): boolean;
    function commas_integer(str: string): boolean;
    function number(str: string): boolean;
    function email(str: string): boolean;
    function url(str: string): boolean;
    function zipcode(str: string): boolean;
    function decimal(str: string, args: Primitive[]): boolean;
    function phone(str: string, args: Primitive[]): boolean;
    function rrn(str: string): boolean;
    function ssn(str: string): boolean;
    function frn(str: string): boolean;
    function frn_rrn(str: string): boolean;
    function kbrn(str: string): boolean;
    function kcn(str: string): boolean;
    function date(str: string): boolean;
    function time(str: string): boolean;
    function accept(str: string, args: Primitive[]): boolean;
    function match(str: string, args: Primitive[]): boolean;
    function acceptfileext(str: string, args: Primitive[]): boolean;
    function notaccept(str: string, args: Primitive[]): boolean;
    function notmatch(str: string, args: Primitive[]): boolean;
    function notacceptfileext(str: string, args: Primitive[]): boolean;
    function maxlength(str: string, args: Primitive[]): boolean;
    function minlength(str: string, args: Primitive[]): boolean;
    function rangelength(str: string, args: Primitive[]): boolean;
    function maxbyte(str: string, args: Primitive[]): boolean;
    function minbyte(str: string, args: Primitive[]): boolean;
    function rangebyte(str: string, args: Primitive[]): boolean;
    function maxvalue(str: string, args: Primitive[]): boolean;
    function minvalue(str: string, args: Primitive[]): boolean;
    function rangevalue(str: string, args: Primitive[]): boolean;
    function regexp(str: string, args: Primitive[]): boolean;
}