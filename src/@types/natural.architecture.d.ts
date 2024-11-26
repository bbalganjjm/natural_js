declare class NA {

    static ajax: {
        (url: string, settings?: JQuery.AjaxSettings): JQuery.jqXHR;
        (settings?: JQuery.AjaxSettings): JQuery.jqXHR;
    };
    static comm: NA.Communicator;
    static cont: NA.Controller;
    static context: {
        attrObj: object;
        attr(name: string, obj?: any): obj[name];
        attr(name: string, obj: any): this;
    };
    static config: {
        filterConfig: NA.Config.FilterConfig;
    };

    /**
     * N.comm is a library that supports Ajax communication with the server, such as requesting content or data from the server or passing parameters.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0203.html }
     */
    comm(url: string | NA.Request.Options): NA.Communicator;

    request(): NA.Request;

    /**
     * N.cont executes the init function of the Controller object and returns the Controller object.
     *
     * > The Controller object is an object that controls the elements of the View and the data retrieved from the Communicator.
     *
     * N.cont should be declared immediately below the View area of the page, like this:
     *
     * ```
     * <article class="view">
     *     <p>View area</p>
     * </article>
     *
     * <script type="text/javascript">
     *     N(".view").cont({ //  Controller object
     *         init : function(view, request) {
     *         }
     *     });
     * </script>
     * ```
     *
     * If you load a page with the above structure using the N.popup, N.tab component or N.comm library, the init function of the Controller object is called when page loading is complete.
     *
     * > For Natural-ARCHITECTURE-based pages to function properly, they must be loaded with the N.comm library, N.popup, or N.tab components.
     *
     * > When selecting an element on a page, you must `find` on a view or specify view as the `context` argument (second argument) to a jQuery function.
     * > Otherwise, unintended elements from other block pages may be selected, resulting in unpredictable errors.
     * > For more information, please refer to the [Restrictions and Tips](https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0601.html) menu.
     *
     * > When `N(".view").cont()` is executed, a `pageid data attribute value` such as `data-pageid="view"` is created in the `.view` element specified by the selector.
     * > The `pageid` is `.(dot), #(sharp), [(left bracket), ](right bracket), '(single quote), :(colon), ((left bracket), ), )(right bracket), >(right arrow bracket), " "(space), -(hyphen)` characters are removed to create pageid, so the page identification value is defined not to include the special characters.
     * > For example, `N("page.view-01").cont()` creates a pageid of `pageview01` with the dot and hyphen removed.
     *
     * To control a specific page, such as a block page or tab content, you can obtain a Controller object as follows.
     * ```
     * var page01Cont = N("#page01").instance("cont");
     * page01Cont.gridInst.bind([]);
     * ```
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0201.html }
     */
    cont(ontObj: NA.Controller.Object): ontObj;
}

declare namespace NA {

    class Communicator {
        new(obj: NJS<NC.JSONObject[]>, url: string | NA.Request.Options);

        xhr: JQuery.jqXHR;
        initFilterConfig(): NA.Config.FilterConfig;
        resetFilterConfig(): NA.Communicator;
        submit(callback: NA.Request.SubmitCallback): JQuery.jqXHR | NA.Communicator;
        error(callback: NA.Request.ErrorCallback): NA.Communicator;

        /**
         * The `Communicator.request` object is a request information object created each time `N.comm` is executed.
         *
         * The options of the `N.comm()` function are stored in the `Communicator.request.options` object and are delivered as headers or parameters of the server request.
         *
         * When requesting an HTML page, the request object is passed as the second argument of the `init` function of the Controller object or as a member variable (`this.request`) of the Controller object. You can check the request information or retrieve the request parameter object using the provided request object.
         *
         * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0204.html }
         */
        request = new Request(obj, url);
    }

    interface Request {
        new(obj: NJS<NC.JSONObject[]>, opts: NA.Request.Options): {
            options: NA.Request.Options;
            attrObj: object;
            obj: NA.Communicator;
        };

        /**
         * Specifies parameters to pass to the page to be loaded or retrieves the passed data.
         *
         * If the `attr` method has two arguments, it works as a setter, and if it has one argument, it works as a getter.
         *
         * Sending data:
         * ```
         * N(".view").cont({
         *     init: function(view, request) {
         *         N("#section").comm("page.html")
         *             .request.attr("data1", { data: ["1", "2"] })
         *             .request.attr("data2", ["3", "4"])
         *                 .submit();
         *     }
         * });
         * ```
         *
         * Retrieving data from the loaded page:
         * ```
         * N(".view").cont({
         *     init: function(view, request) {
         *         var data1 = request.attr("data1"); // { data: ["1", "2"] }
         *         var data2 = request.attr("data2"); // ["3", "4"]
         *     }
         * });
         * ```
         *
         * @param {String} name - Parameter name
         * @param {any} obj - Parameter data
         *
         * @return {NA.Communicator} Returns the Communicator if both `name` and `obj` are specified, and returns the passed parameter value if only `name` is specified.
         */
        attr(name: string, obj?: any): obj[name];
        attr(name: string, obj: any): NA.Communicator;

        removeAttr(name: string): NA.Communicator;

        param(name: string): object | string;

        get(key: string): any | NA.Request.Options;

        reload(callback: any): NA.Communicator;
    }

    interface Controller {
        new(obj: NJS<HTMLElement[]>, contObj: NA.Controller.Object): contObj;

        trInit(cont: NA.Controller.Object, request: NA.Request): void;

        /**
         * Aspect-oriented programming(AOP) processing class.
         */
        aop: {
            pointcuts: {
                regexp: {
                    fn(param: RegExp | string, contFrag: NA.Controller.Object, fnChain: string): boolean;
                };
            };
            wrap(cont: NA.Controller.Object): void;
        };
    }

}
