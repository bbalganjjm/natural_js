import JSONObject = NC.JSONObject;

/**
 * N() is a core method of Natural-JS. It returns a collection of matched elements found in the DOM based on the provided arguments or creates elements matching the given HTML string.
 *
 * N() extends the jQuery() function, thus it can be replaced with $() or jQuery(). However, local functions of the N object cannot be used within jQuery or $ objects.
 */
declare function N(selector?: JQuery.Selector
    | JQuery.TypeOrArray<Element>
    | JQuery.htmlString
    | JQuery
    | JQuery.Node
    | JQuery.PlainObject, context?: Element | Document | JQuery | JQuery.Selector): NJS<T>;

type OmitJQuery = Omit<JQuery, "select">;
declare interface NJS<T> extends OmitJQuery, NC, NA, ND, NU, NUS {

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

    import JSONObject = NC.JSONObject;
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
    function comm(obj: NJS<NC.JSONObject[]>, url: string | NA.Request.Options): NA.Communicator {
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
    const cont = NA.cont;

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
    const formatter = ND.formatter;
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
     * Alert (N.alert) is a UI component that displays message dialog boxes such as window.alert or window.confirm in a layer popup form.
     *
     * > If the Alert dialog box is not displayed, and an error occurs, you need to specify the element where N.alert related elements will be stored with a jQuery selector string in the N.context.attr("ui").alert.container property of the Config (natural.config.js).
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0401.html }
     */
    const alert = NU.alert;
    /**
     * Button (N.button) is a UI component that creates buttons using the "a, input[type=button], button" elements specified by the context option.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0402.html }
     */
    const button = NU.button;
    /**
     * Datepicker (N.datepicker) is a UI component that displays a calendar popup on the text input element specified by the context option, allowing you to select and input dates or months.
     *
     *  - You can easily use the Datepicker by declaring the "date" rule in the data-format attribute of the text input element and linking it with data-related components. Refer to the ["date", 4|6|8|10|12|14, "month"|"date"] rules in the [Declarative Options] tab of the Form, List, Grid menu, and the [Format Rule List] tab of the Formatter menu.
     *
     * > For descriptions of declarative options, refer to the declarative options section of the [API Documentation Guide](https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0001.html) menu.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0403.html }
     */
    const datepicker = NU.datepicker;
    /**
     * Popup (N.popup) is a UI component that creates a layer popup using the internal element specified by the context option or the page specified by the url option.
     *
     *  - When a popup is created with the page specified by the url option, the generated popup's Controller object will have caller (the N.popup instance that called it) and opener (the parent page's Controller object that called it, passed as an option during popup creation) properties. You can use the opener to control the parent page or use the caller to close itself or send data to the parent Controller.
     *
     * > If the Popup dialog box is not displayed, and an error occurs, you need to specify the top-level HTML element where N.alert related HTML elements will be stored using a jQuery selector string in the N.context.attr("ui").alert.container property of the [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0102.html).
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0404.html }
     */
    const popup = NU.popup;
    /**
     * Tab(N.tab) is a UI component that creates a tab page view using a context option specified element composed of div>ul>li tags.
     *
     * If a page specified with the url option is created as a popup, the Controller object of the created popup will have properties caller (the N.popup instance that called it) and opener (the parent page Controller object that called it, which must be passed as an option when creating the popup). You can use opener to control the parent page or use caller to close itself and send data to the parent Controller.
     * By calling the cont method on an instance of N.tab, you can get the Controller objects of each tab page. For more details on the cont method, please refer to the [Function] tab.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0405.html }
     */
    const tab = NU.tab;
    /**
     * Select(N.select) is a UI component that binds data to select, input[type=checkbox], input[type=radio] elements to create selection elements and extend the functionality of those controls.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0406.html }
     */
    const select = NU.select;
    /**
     * Form(N.form) is a UI component that binds or creates single row data on an element (block elements like div, table) specified with the context option.
     *  - N.form integrates with components of the Natural-DATA package to simplify the data formatting and input data validation processes. For more details, please refer to the [Declarative Option] tab.
     *  - Data is bound when the property name (column name) of the bound data object matches the id attribute value of the element. Data formatting and validation are activated when data is bound to an element.
     *  - If elements within the context elements of N.form are specified again as context for N.form or other data-related components (e.g., N.grid, N.list), errors may occur or data synchronization issues may arise. Ensure that context elements for N.form are specified without duplication or that column data is split to avoid data redundancy. For how to separate context elements or data, please refer to the example > Multi Form Binding menu source code.
     *    > After adding to a form element created with add() and then calling bind(), or calling bind() after add() or bind() after bind(), the data synchronization logic for the form's input elements may have issues. In this case, be sure to execute the unbind method in between.
     *    > ```
     *    > var formInst = N([]).form().add();
     *    > formInst.unbind().bind(0, [{ "col01" : "abcd" }])
     *    > ```
     *  - When the value of an input element is changed or the val method is used to change data, the rowStatus property is created, with "insert" for input, "update" for modification, and "delete" for deletion.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0407.html }
     */
    const form = NU.form;
    /**
     * List(N.list) is a UI component that creates a data list in a single column format using ul>li elements specified with the context option.
     *
     *  - N.list integrates with components of the Natural-DATA package to simplify the data formatting and input data validation processes. For more details, please refer to the [Declarative Option] tab.
     *  - Data is bound when the property name (column name) of the bound data object matches the id attribute value of the element. Data formatting and validation are activated when data is bound to an element.
     *  - When changing the value of an input element or the val method is used to change data, the rowStatus property is created, with "insert" for input, "update" for modification, and "delete" for deletion.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0408.html }
     */
    const list = NU.list;
    /**
     * Grid(N.grid) is a UI component that creates a data list in a multi-column format using table elements specified with the context option.
     *  - N.grid integrates with components of the Natural-DATA package to simplify the data formatting and input data validation processes. For more details, please refer to the [Declarative Option] tab.
     *  - Data is bound when the property name (column name) of the bound data object matches the id attribute value of the element. Data formatting and validation are activated when data is bound to an element.
     *  - Provides two types of grids: fixed header and list type.
     *  - When changing the value of an input element or the val method is used to change data, the rowStatus property is created. The rowStatus value is "insert" for input, "update" for modification, and "delete" for deletion.
     *  - Provides many functions for handling list data, such as pasting Excel data, data filtering/sorting, etc. For more details on the provided functions, please refer to the option tab and function tab.
     * > The width of the table element to be made into a grid must be specified, whether it is a fixed length (px) or a variable length (%).
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0409.html }
     */
    const grid = NU.grid;
    /**
     * Pagination(N.pagination) is a UI component that creates paging indexes for list data or overall row counts.
     *  - The structure of the N.pagination context element consists of a div>ul>li>a hierarchy.
     *  - The N.pagination component can generate parameters for SQL paging or paginate full list data of type array[json object].
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0410.html }
     */
    const pagination = NU.pagination;

    /**
     * Tree(N.tree) is a UI component that creates tree elements from hierarchical data.
     *  - A checkbox can be added to the nodes for group selection.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0411.html }
     */
    const tree = NU.tree;

// === Natural-UI.Shell
    /**
     * Notify(N.notify) is a UI component that displays global notifications at a specified position without requiring user confirmation.
     * > The Alert(N.alert) is used for handling messages within the content area, while N.notify handles messages site-wide. Thus, N.alert component elements are created within each View element, and N.notify is created in the document.body element.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0501.html }
     */
    const notify = function (position: NUS.Options.NotifyPosition, opts?: NUS.Options.Notify) {
        return new NUS.notify(position, opts);
    }

    /**
     * Creates a message notification.
     */
    notify.add = NUS.notify.add;

    /**
     * Documents(N.docs) is a page container that displays menu pages based on Natural-JS in either MDI (Multi Document Interface) or SDI (Single Document Interface) structures.
     *  - Options such as the maximum number of pages and the maximum number of state-maintained pages can be specified. It can also display a loading indicator for the requests and responses of N.comm.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0502.html }
     */
    const docs = NUS.docs;

    /**
     * Natural-CODE
     */
    const code = NCD;

    /**
     * Natural-TEMPLATE
     */
    const template = NT;
}