declare class ND {

    formatter(rules?: NJS | HTMLElement | ND.FormatRuleObject | string): Formatter;

    validator(rules?: NJS | HTMLElement | ND.ValidationRuleObject | string): Validator;

    datafilter(condition: ND.ConditionCallback | string): object[];

    datasort(key: string, reverse?: boolean): object[];

    static ds: {
        instance(inst: T, isReg?: boolean): DataSync;
    };

    static formatter: {
        new(data: NJS, rules?: NJS | HTMLElement | ND.FormatRuleObject | string): Formatter;
        commas(str: string): string;
        /**
         * Resident registration number
         */
        rrn(str: string, args: NC.Primitive[]): string;
        /**
         * US Social Security Number
         */
        ssn(str: string): string;
        /**
         * Korean business registration number
         */
        kbrn(str: string): string;
        /**
         * Korean corporation number
         */
        kcn(str: string): string;
        upper(str: string): string;
        lower(str: string): string;
        capitalize(str: string): string;
        zipcode(str: string): string;
        phone(str: string): string;
        realnum(str: string): string;
        trimtoempty(str: string): string;
        trimtozero(str: string): string;
        trimtoval(str: string, args: NC.Primitive[]): string;
        date(str: string, args: NC.Primitive[], ele: NJS): string;
        time(str: string, args: NC.Primitive[]): string;
        limit(str: string, args: NC.Primitive[], ele: NJS): string;
        replace(str: string, args: NC.Primitive[], ele: NJS): string;
        lpad(str: string, args: NC.Primitive[]): string;
        rpad(str: string, args: NC.Primitive[]): string;
        mask(str: string, args: NC.Primitive[]): string;
        generic(str: string, args: NC.Primitive[]): string | true;
        numeric(str: string, args: NC.Primitive[]): string | true;
    };
    static validator: {
        new(data: NJS, rules?: NJS | HTMLElement | ND.ValidationRuleObject | string): Validator;
        required(str: string): boolean;
        alphabet(str: string): boolean;
        integer(str: string): boolean;
        korean(str: string): boolean;
        alphabet_integer(str: string): boolean;
        integer_korean(str: string): boolean;
        alphabet_korean(str: string): boolean;
        alphabet_integer_korean(str: string): boolean;
        dash_integer(str: string): boolean;
        commas_integer(str: string): boolean;
        number(str: string): boolean;
        email(str: string): boolean;
        url(str: string): boolean;
        zipcode(str: string): boolean;
        decimal(str: string, args: NC.Primitive[]): boolean;
        phone(str: string, args: NC.Primitive[]): boolean;
        rrn(str: string): boolean;
        /**
         * US Social Security Number
         */
        ssn(str: string): boolean;
        frn(str: string): boolean;
        frn_rrn(str: string): boolean;
        /**
         * Korean business registration number
         */
        kbrn(str: string): boolean;
        /**
         * Korean corporation number
         */
        kcn(str: string): boolean;
        date(str: string): boolean;
        time(str: string): boolean;
        accept(str: string, args: NC.Primitive[]): boolean;
        match(str: string, args: NC.Primitive[]): boolean;
        acceptfileext(str: string, args: NC.Primitive[]): boolean;
        notaccept(str: string, args: NC.Primitive[]): boolean;
        notmatch(str: string, args: NC.Primitive[]): boolean;
        notacceptfileext(str: string, args: NC.Primitive[]): boolean;
        equalTo(str: string, args: NC.Primitive[]): boolean;
        maxlength(str: string, args: NC.Primitive[]): boolean;
        minlength(str: string, args: NC.Primitive[]): boolean;
        rangelength(str: string, args: NC.Primitive[]): boolean;
        maxbyte(str: string, args: NC.Primitive[]): boolean;
        minbyte(str: string, args: NC.Primitive[]): boolean;
        rangebyte(str: string, args: NC.Primitive[]): boolean;
        maxvalue(str: string, args: NC.Primitive[]): boolean;
        minvalue(str: string, args: NC.Primitive[]): boolean;
        rangevalue(str: string, args: NC.Primitive[]): boolean;
        regexp(str: string, args: NC.Primitive[]): boolean;
    };
    static data: {
        filter(arr: NJS, condition: ConditionCallback | string): object[];
        sortBy(key: string, reverse: 1 | -1): (a: number, b: number) => 1 | -1 | 0;
        sort(arr: NJS, key: string, reverse?: boolean): object[];
    };

}

declare interface Formatter {
    format(row: number): ND.FormatObject;
    unformat(row: number, key: string): NC.Primitive;
}

declare interface Validator {
    validate(row: number): ND.ValidateObject;
}

declare interface DataSync {
    viewContext: NJS;
    remove(): DataSync;
    notify(row: number, key: string): DataSync;
}