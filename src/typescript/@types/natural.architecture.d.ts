declare class N {
    private constructor();
    ajax(opts: any): JQuery.jqXHR<any>;
    comm(url: any): any;
    request(): any;
    cont(contObj: any): any;
}
declare namespace N {
    namespace comm {
        function constructor(obj: any, url: any): any;
        let xhr: any;
        function initFilterConfig(): {
            beforeInitFilters: any[];
            afterInitFilters: any[];
            beforeSendFilters: any[];
            successFilters: any[];
            errorFilters: any[];
            completeFilters: any[];
        };
        function resetFilterConfig(): {
            request: {};
        };
        function submit(callback: any): JQuery.jqXHR<any> | this;
        function error(callback: any): {
            request: {};
        };
        class request {
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
        }
        namespace request {
            function constructor(obj: any, opts: any): void;
        }
    }
    namespace cont {
        function constructor(obj: any, contObj: any): any;
        /**
         * "init" method trigger
         */
        function trInit(cont: any, request: any): void;
        namespace aop {
            namespace pointcuts {
                namespace regexp {
                    function fn(param: any, contFrag: any, fnChain: any): boolean;
                }
            }
            function wrap(cont: any): void;
        }
    }
    namespace context {
        let attrObj: {};
        let attr: any;
    }
    namespace config {
        let filterConfig: any;
    }
}
