declare class NA {
    static ajax: {
        (url: string, settings?: JQuery.AjaxSettings): JQuery.jqXHR;
        (settings?: JQuery.AjaxSettings): JQuery.jqXHR;
    };
    /**
     * Communicator
     *
     * Communicator class for handling AJAX requests with filtering mechanisms.
     * The class provides a structured way of initializing and making requests,
     * including the application of various filters at different stages of the request lifecycle.
     */
    static comm: Communicator;
    static cont: Controller;
    static context: {
        attrObj: {};
        attr: (name: any, obj_?: any) => any;
    };
    static config: {
        filterConfig: any;
    };

    comm(url: any): Communicator;

    request(): Request;

    cont(contObj: any): Controller;
}

declare class Communicator {
    constructor(obj: any, url: string);

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
    new(obj: any, opts: any): {
        options: {
            url: any;
            referrer: string;
            contentType: string;
            cache: boolean;
            async: boolean;
            type: string;
            data: any;
            dataIsArray: boolean;
            dataType: string;
            urlSync: boolean;
            crossDomain: boolean;
            browserHistory: boolean;
            append: boolean;
            target: any;
        };
        attrObj: {};
        obj: any;
    };

    /**
     * get / set request attribute
     */
    attr(name: any, obj_: any): Communicator;

    /**
     * remove request attribute
     */
    removeAttr(name: any): Communicator;

    /**
     * get query parmas from request url
     */
    param(name: any): any;

    get(key: any): any;

    /**
     * Reload block page
     */
    reload(callback: any): Communicator;
}

declare class Controller {
    constructor(obj: any, contObj: any);

    /**
     * "init" method trigger
     */
    trInit: (cont: any, request: any) => void;
    /**
     * AOP processing module
     */
    aop: {
        pointcuts: {
            regexp: {
                fn: (param: any, contFrag: any, fnChain: any) => boolean;
            };
        };
        wrap: (cont: any) => void;
    };
};