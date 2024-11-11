export class NA {
    static ajax: any;
    /**
     * Communicator
     *
     * Communicator class for handling AJAX requests with filtering mechanisms.
     * The class provides a structured way of initializing and making requests,
     * including the application of various filters at different stages of the request lifecycle.
     *
     * @class
     * @param {Object|String} obj - The options object or URL.
     * @param {String} [url] - The request URL, if `obj` is not a string.
     */
    static comm: {
        new (obj: any, url: any): {};
        xhr: any;
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
        request: {
            new (obj: any, opts: any): {
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
                /**
                 * get / set request attribute
                 */
                attr(name: any, obj_: any): any;
                /**
                 * remove request attribute
                 */
                removeAttr(name: any): any;
                /**
                 * get query parmas from request url
                 */
                param(name: any): any;
                get(key: any): any;
                /**
                 * Reload block page
                 */
                reload(callback: any): any;
            };
        };
    };
    static cont: {
        new (obj: any, contObj: any): {};
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
    static context: {
        new (): {};
        attrObj: {};
        attr: (name: any, obj_: any) => any;
    };
    static config: {
        new (): {};
        filterConfig: any;
    };
    comm(url: any): {};
    request(): any;
    cont(contObj: any): {};
}
