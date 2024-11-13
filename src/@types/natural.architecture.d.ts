declare class NA {
    static ajax: {
        (url: string, settings?: JQuery.AjaxSettings): JQuery.jqXHR;
        (settings?: JQuery.AjaxSettings): JQuery.jqXHR;
    };
    static comm: Communicator;
    static cont: Controller;
    static context: {
        attrObj: {};
        attr: (name: any, obj_?: any) => any;
    };
    static config: {
        filterConfig: any;
    };

    comm(url: string | NA.Request.Options): Communicator;

    request(): Request;

    cont(ontObj: NA.Controller.Object): Controller;
}

declare class Communicator {
    constructor(obj: N<object[]>, url: string | NA.Request.Options);

    xhr: JQuery.jqXHR;
    initFilterConfig: () => {
        beforeInitFilters: any[];
        afterInitFilters: any[];
        beforeSendFilters: any[];
        successFilters: any[];
        errorFilters: any[];
        completeFilters: any[];
    };
    resetFilterConfig: () => any;
    submit: (callback: any) => any;
    error: (callback: any) => any;
    request = new Request;
}

declare interface Request {
    new(obj: NJS, opts: NA.Request.Options): {
        options: NA.Request.Options;
        attrObj: {};
        obj: any;
    };

    attr(name: any, obj_: any): Communicator;

    removeAttr(name: any): Communicator;

    param(name: any): any;

    get(key: any): any;

    reload(callback: any): Communicator;
}

declare class Controller {
    constructor(obj: N<HTMLElement>, contObj: NA.Controller.Object): NA.Controller.Object;

    trInit: (cont: any, request: any) => void;
    aop: {
        pointcuts: {
            regexp: {
                fn: (param: any, contFrag: any, fnChain: any) => boolean;
            };
        };
        wrap: (cont: any) => void;
    };
};