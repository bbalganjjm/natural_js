declare class ND {
    static ds: {
        new(inst: any, isReg: any): {
            viewContext: JQuery<HTMLElement>;
            remove(): any;
            notify(row: any, key: any): any;
        };
        instance: (inst: any, isReg: any) => {
            viewContext: JQuery<HTMLElement>;
            remove(): any;
            notify(row: any, key: any): any;
        };
    };
    static formatter: {
        new(obj: any, rules: any): {
            options: {
                data: any;
                rules: any;
                isElement: boolean;
                createEvent: boolean;
                context: any;
                targetEle: NJS;
            };
            format(row: any): any[];
            unformat(row: any, key: any): any;
        };
        commas: (str: any) => any;
        /**
         * Resident registration number
         */
        rrn: (str: any, args: any) => any;
        /**
         * US Social Security Number
         */
        ssn: (str: any) => any;
        /**
         * Korean business registration number
         */
        kbrn: (str: any) => any;
        /**
         * Korean corporation number
         */
        kcn: (str: any) => any;
        upper: (str: any) => any;
        lower: (str: any) => any;
        capitalize: (str: any) => any;
        zipcode: (str: any) => any;
        phone: (str: any) => any;
        realnum: (str: any) => any;
        trimtoempty: (str: any) => string;
        trimtozero: (str: any) => string;
        trimtoval: (str: any, args: any) => any;
        date: (str: any, args: any, ele: any) => any;
        time: (str: any, args: any) => any;
        limit: (str: any, args: any, ele: any) => any;
        replace: (str: any, args: any, ele: any) => any;
        lpad: (str: any, args: any) => any;
        rpad: (str: any, args: any) => any;
        mask: (str: any, args: any) => any;
        generic: (str: any, args: any) => string | true;
        numeric: (str: any, args: any) => string | true;
    };
    static validator: {
        new(obj: any, rules: any): {
            options: {
                data: any;
                rules: any;
                isElement: boolean;
                createEvent: boolean;
                context: any;
                targetEle: any;
            };
            validate: (row: any) => any[];
        };
        required: (str: any) => boolean;
        alphabet: (str: any) => boolean;
        integer: (str: any) => boolean;
        korean: (str: any) => boolean;
        alphabet_integer: (str: any) => boolean;
        integer_korean: (str: any) => boolean;
        alphabet_korean: (str: any) => boolean;
        alphabet_integer_korean: (str: any) => boolean;
        dash_integer: (str: any) => boolean;
        commas_integer: (str: any) => boolean;
        number: (str: any) => boolean;
        email: (str: any) => boolean;
        url: (str: any) => boolean;
        zipcode: (str: any) => boolean;
        decimal: (str: any, args: any) => boolean;
        phone: (str: any, args: any) => boolean;
        rrn: (str: any) => boolean;
        /**
         * US Social Security Number
         */
        ssn: (str: any) => boolean;
        frn: (str: any) => boolean;
        frn_rrn: (str: any) => any;
        /**
         * Korean business registration number
         */
        kbrn: (str: any) => boolean;
        /**
         * Korean corporation number
         */
        kcn: (str: any) => boolean;
        date: (str: any) => boolean;
        time: (str: any) => boolean;
        accept: (str: any, args: any) => boolean;
        match: (str: any, args: any) => boolean;
        acceptfileext: (str: any, args: any) => boolean;
        notaccept: (str: any, args: any) => boolean;
        notmatch: (str: any, args: any) => boolean;
        notacceptfileext: (str: any, args: any) => boolean;
        equalTo: (str: any, args: any) => boolean;
        maxlength: (str: any, args: any) => boolean;
        minlength: (str: any, args: any) => boolean;
        rangelength: (str: any, args: any) => boolean;
        maxbyte: (str: any, args: any) => boolean;
        minbyte: (str: any, args: any) => boolean;
        rangebyte: (str: any, args: any) => boolean;
        maxvalue: (str: any, args: any) => boolean;
        minvalue: (str: any, args: any) => boolean;
        rangevalue: (str: any, args: any) => boolean;
        regexp: (str: any, args: any) => boolean;
    };
    static data: {
        filter: (arr: any, condition: any) => any;
        sortBy: (key: any, reverse: any) => (a: any, b: any) => number;
        sort: (arr: any, key: any, reverse: any) => any;
    };

    datafilter(condition: any): any;

    datasort(key: any, reverse: any): any;

    formatter(rules: any): {
        options: {
            data: any;
            rules: any;
            isElement: boolean;
            createEvent: boolean;
            context: any;
            targetEle: NJS;
        };
        format(row: any): any[];
        unformat(row: any, key: any): any;
    };

    validator(rules: any): {
        options: {
            data: any;
            rules: any;
            isElement: boolean;
            createEvent: boolean;
            context: any;
            targetEle: any;
        };
        validate: (row: any) => any[];
    };
}
