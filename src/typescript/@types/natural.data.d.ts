declare class N {
    private constructor();
    datafilter(condition: any): any;
    datasort(key: any, reverse: any): any;
    formatter(rules: any): any;
    validator(rules: any): any;
}
declare namespace N {
    namespace data {
        function filter(arr: any, condition: any): any;
        function sortBy(key: any, reverse: any): (a: any, b: any) => number;
        function sort(arr: any, key: any, reverse: any): any;
    }
    class ds {
        remove(): any;
        notify(row: any, key: any): any;
    }
    namespace ds {
        function constructor(inst: any, isReg: any): any;
        function instance(inst: any, isReg: any): any;
    }
    class formatter {
        format(row: any): any[];
        unformat(row: any, key: any): any;
    }
    namespace formatter {
        function constructor(obj: any, rules: any): void;
        function commas(str: any): any;
        /**
         * Resident registration number
         */
        function rrn(str: any, args: any): any;
        /**
         * US Social Security Number
         */
        function ssn(str: any): any;
        /**
         * Korean business registration number
         */
        function kbrn(str: any): any;
        /**
         * Korean corporation number
         */
        function kcn(str: any): any;
        function upper(str: any): any;
        function lower(str: any): any;
        function capitalize(str: any): any;
        function zipcode(str: any): any;
        function phone(str: any): any;
        function realnum(str: any): any;
        function trimtoempty(str: any): any;
        function trimtozero(str: any): any;
        function trimtoval(str: any, args: any): any;
        function date(str: any, args: any, ele: any): any;
        function time(str: any, args: any): any;
        function limit(str: any, args: any, ele: any): any;
        function replace(str: any, args: any, ele: any): any;
        function lpad(str: any, args: any): any;
        function rpad(str: any, args: any): any;
        function mask(str: any, args: any): any;
        function generic(str: any, args: any): any;
        function numeric(str: any, args: any): any;
    }
    class validator {
        validate(row: any): any[];
    }
    namespace validator {
        function constructor(obj: any, rules: any): void;
        function required(str: any): boolean;
        function alphabet(str: any): boolean;
        function integer(str: any): boolean;
        function korean(str: any): boolean;
        function alphabet_integer(str: any): boolean;
        function integer_korean(str: any): boolean;
        function alphabet_korean(str: any): boolean;
        function alphabet_integer_korean(str: any): boolean;
        function dash_integer(str: any): boolean;
        function commas_integer(str: any): boolean;
        function number(str: any): boolean;
        function email(str: any): boolean;
        function url(str: any): boolean;
        function zipcode(str: any): boolean;
        function decimal(str: any, args: any): boolean;
        function phone(str: any, args: any): boolean;
        function rrn(str: any): boolean;
        /**
         * US Social Security Number
         */
        function ssn(str: any): boolean;
        function frn(str: any): boolean;
        function frn_rrn(str: any): any;
        /**
         * Korean business registration number
         */
        function kbrn(str: any): boolean;
        /**
         * Korean corporation number
         */
        function kcn(str: any): boolean;
        function date(str: any): boolean;
        function time(str: any): boolean;
        function accept(str: any, args: any): boolean;
        function match(str: any, args: any): boolean;
        function acceptfileext(str: any, args: any): boolean;
        function notaccept(str: any, args: any): boolean;
        function notmatch(str: any, args: any): boolean;
        function notacceptfileext(str: any, args: any): boolean;
        function equalTo(str: any, args: any): boolean;
        function maxlength(str: any, args: any): boolean;
        function minlength(str: any, args: any): boolean;
        function rangelength(str: any, args: any): boolean;
        function maxbyte(str: any, args: any): boolean;
        function minbyte(str: any, args: any): boolean;
        function rangebyte(str: any, args: any): boolean;
        function maxvalue(str: any, args: any): boolean;
        function minvalue(str: any, args: any): boolean;
        function rangevalue(str: any, args: any): boolean;
        function regexp(str: any, args: any): boolean;
    }
}
