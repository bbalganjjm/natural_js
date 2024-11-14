/**
 * N() is a core method of Natural-JS. It returns a collection of matched elements found in the DOM based on the provided arguments or creates elements matching the given HTML string.
 *
 * N() extends the jQuery() function, thus it can be replaced with $() or jQuery(). However, local functions of the N object cannot be used within jQuery or $ objects.
 */
declare function N(selector: any, context?: any): NJS;

declare interface NJS extends JQuery, NC, NA, ND, NU, NUS {
    /**
     * Initializes and returns a new N object based on jQuery objects with the provided selector and context argument values.
     */
    new(selector: any, context?: any);

    version: {
        "Natural-JS": string;
        "Natural-CORE": string;
        "Natural-ARCHITECTURE": string;
        "Natural-DATA": string;
        "Natural-UI": string;
        "Natural-UI.Shell": string;
    };

    selector: string;
}

/**
 * N is a collection class that defines common functions for Natural-JS.
 */
declare namespace N {
    // === Natural-CORE

    const locale = NC.locale;
    const debug = NC.debug;
    const log = NC.log;
    const info = NC.info;
    const warn = NC.warn;
    const error = NC.error;
    const type = NC.type;
    const isString = NC.isString;
    const isNumeric = NC.isNumeric;
    const isPlainObject = NC.isPlainObject;
    const isArray = NC.isArray;
    const isArraylike = NC.isArraylike;
    const isWrappedSet = NC.isWrappedSet;
    const isElement = NC.isElement;
    const toSelector = NC.toSelector;
    const serialExecute = NC.serialExecute;
    const gc = NC.gc;
    const string = NC.string;
    const date = NC.date;
    const element = NC.element;
    const browser = NC.browser;
    const message = NC.message;
    const array = NC.array;
    const json = NC.json;
    const event = NC.event;
    const mask = NC.mask;


    // === Natural-ARCHITECTURE

    /**
     * Performs asynchronous HTTP (Ajax) requests in `N.comm`.
     *
     * @see {@link https://api.jquery.com/jquery.ajax/#jQuery-ajax-settings }
     */
    const ajax = NA.ajax;

    /**
     * N.comm is a library that supports Ajax communication with the server, such as requesting content or data from the server or passing parameters.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0203.html }
     */
    function comm(obj: N<object[]>, url: string | NA.Request.Options): Communicator {
        return new NA.comm(obj, url);
    }

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
    function cont(obj: N<HTMLElement>, contObj: NA.Controller.Object): NA.Controller.Object {
        return new NA.cont(obj, contObj);
    }

    /**
     * Context (N.context) is a space that guarantees data persistence within the life-cycle (until the page is loaded and redirected to another URL) of a Natural-JS-based application.
     *
     * Natural-JS's [configuration values](https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0102.html), framework common messages, etc. are stored in the N.context object.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0206.html }
     */
    const context = NA.context;

    /**
     * Config(natural.config.js) stores the operational environment settings, AOP settings, Communication Filter settings,
     * and global option values for UI components of Natural-JS.
     *
     * The settings are defined in the natural.config.js file and are saved as separate attribute values for each package in N.context.
     *  - N.context.attr("core"): Basic settings for the Natural-CORE package libraries.
     *  - N.context.attr("architecture"): Basic settings for the Natural-ARCHITECTURE package libraries.
     *  - N.context.attr("data"): Basic settings for the Natural-DATA package libraries.
     *  - N.context.attr("ui"): Basic settings for the Natural-UI package libraries.
     *  - N.context.attr("ui.shell"): Basic settings for the Natural-UI.Shell package libraries.
     *
     * The following two attributes are essential when applying Natural-JS:
     *
     * The following two attributes are essential when applying Natural-JS:
     *  1. N.context.attr("architecture").page.context: Specifies the container area (element) where the web application's content will be displayed as a jQuery selector string.
     *     > It is automatically entered when using the Documents(N.docs) component.
     *
     *     > If the web application is built as a SPA (Single Page Application), specify the element that loads the menu page. Otherwise, enter "body" or the element wrapping the entire content.
     *  2. N.context.attr("ui").alert.container: Specifies the area (element) where elements of the N.alert and N.popup components will be stored as a jQuery selector string.
     *     > It is automatically entered when using the Documents(N.docs) component.
     *
     *     > If the web application is built as a SPA (Single Page Application), specify the element that loads the menu page. Otherwise, enter "body" or the element wrapping the entire content.
     *
     * The order in which component options are applied is as follows:
     *  1. Option values specified when initializing the component.
     *  2. Option values specified in Config(natural.config.js).
     *  3. The component’s default option values.
     *     > If you set a global event option, the global event is executed first, followed by the event specified when initializing the component.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0102.html }
     */
    const config = NA.config;

    // === Natural-DATA

    /**
     * DataSync(N.ds) is a module in Natural-JS that handles two-way data binding.
     */
    const ds = ND.ds;
    /**
     * Formatter(N.formatter) is a library that formats an input data set (array of JSON objects) and returns the formatted data set.
     *  - Instead of using a ruleset, you can pass as an argument an element that wraps elements with formatting rules declared in the data-format attribute. This will display the formatted string in those elements. If the element is a text input element, it will display the original string of the data when the cursor focuses in (focusin event), and display the formatted string when the cursor focuses out (focusout event).
     *  - You can also format on a per-string basis, rather than using a dataset.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0301.html }
     */
    const formatter = ND.formatter;
    /**
     * Validator (N.validator) is a library that validates an input data set (array of JSON objects) and returns the result data set.
     *  - Instead of a ruleset, if you pass an element that wraps input elements with validation rules declared in the data-validate attribute, it will validate the value entered in the element when the cursor focusout occurs on the input element. If validation fails, an error message is displayed in the form of a tooltip near the input element.
     *  - Validation can also be performed on strings, not just datasets.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0302.html }
     */
    const validator = ND.validator;
    /**
     * The Natural-DATA library provides methods and functions for sorting, filtering, and refining data of type array[json object].
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0303.html }
     */
    const data = ND.data;

    // === Natural-UI

    /**
     * This class defines common functions that support the development of Natural-UI components.
     */
    const ui = NU.ui;
    /**
     * Alert(N.alert)은 window.alert이나 window.confirm 같은 메시지 대화 상자를 레이어 팝업 형태로 표현해 주는 UI 컴포넌트입니다.
     *
     * > Alert 대화 상자가 표시되지 않고 오류가 발생하면 Config(natural.config.js)의 N.context.attr("ui").alert.container 속성에 jQuery selector 문자열로 N.alert 관련 요소들이 저장될 요소를 지정해야 합니다.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0401.html }
     */
    const alert = NU.alert;
    /**
     * Button(N.button)은 context 옵션으로 지정된 "a, input[type=button], button" 요소를 사용하여 버튼을 만드는 UI 컴포넌트입니다.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0402.html }
     */
    const button = NU.button;
    /**
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0403.html }
     */
    const datepicker = NU.datepicker;
    /**
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0404.html }
     */
    const popup = NU.popup;
    /**
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0405.html }
     */
    const tab = NU.tab;
    /**
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0406.html }
     */
    const select = NU.select;
    /**
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0407.html }
     */
    const form = NU.form;
    /**
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0408.html }
     */
    const list = NU.list;
    /**
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0409.html }
     */
    const grid = NU.grid;
    /**
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0410.html }
     */
    const pagination = NU.pagination;
    /**
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0411.html }
     */
    const tree = NU.tree;

    // === Natural-UI.Shell

    /**
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0501.html }
     */
    const notify = function (position: any, opts?: any) {
        return new NUS.notify(position, opts);
    }
    /**
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0502.html }
     */
    notify.add = NUS.notify.add;
    /**
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0401.html }
     */
    const docs = NUS.docs;
}