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
     * Config(natural.config.js) 는 Natural-JS의 운영 환경 설정, AOP 설정, Communication Filter 설정, UI 컴포넌트의 전역 옵션 값 등을 저장하는 공간입니다.
     *
     * natural.config.js 파일에 정의되어 있으며 설정 값은 N.context에 각 패키지 별 속성 값으로 별도로 저장됩니다.
     *  - N.context.attr("core") : Natural-CORE 패키지 라이브러리들의 기본 설정 값.
     *  - N.context.attr("architecture") : Natural-ARCHITECTURE 패키지 라이브러리들의 기본 설정 값.
     *  - N.context.attr("data") : Natural-DATA 패키지 라이브러리들의 기본 설정 값.
     *  - N.context.attr("ui") : Natural-UI 패키지 라이브러리들의 기본 설정 값.
     *  - N.context.attr("ui.shell") : Natural-UI.Shell 패키지 라이브러리들의 기본 설정 값.
     *  - Natural-JS 적용 시 설정해야 할 필수 속성 값은 다음 두 가지입니다.
     *
     * Natural-JS 적용 시 설정해야 할 필수 속성 값은 다음 두 가지입니다.
     *  1. N.context.attr("architecture").page.context : 웹 애플리케이션의 컨텐츠가 표시되는 컨테이너 영역(요소)을 jQuery selector 문자열로 지정합니다.
     *     > Documents(N.docs) 컴포넌트를 사용하면 자동으로 입력됩니다.
     *
     *     > SPA(Single Page Application) 구조로 제작되는 웹 애플리케이션이라면 메뉴 페이지를 적제하는 요소를 지정하고 아니라면 "body" 나 전체 컨텐츠를 감싸고 있는 요소를 입력해 주세요.
     *  2. N.context.attr("ui").alert.container : N.alert, N.popup 컴포넌트의 요소들이 저장될 영역(요소)을 jQuery selector 문자열로 지정합니다.
     *     > Documents(N.docs) 컴포넌트를 사용하면 자동으로 입력됩니다.
     *
     *     > SPA(Single Page Application) 구조로 제작되는 웹 애플리케이션이라면 메뉴 페이지를 적제하는 요소를 지정하고 아니라면 "body" 나 전체 컨텐츠를 감싸고 있는 요소를 입력해 주세요.
     *
     * 컴포넌트 옵션이 적용되는 순서는 다음과 같습니다.
     *  1. 컴포넌트를 초기화할 때 지정한 옵션 값.
     *  2. Config(natural.config.js)에서 지정한 옵션 값.
     *  3. 컴포넌트의 기본 옵션 값.
     *     > 전역 이벤트 옵션을 설정하면 전역 이벤트가 먼저 실행된 다음 컴포넌트 초기화 시 지정한 이벤트가 실행됩니다.
     *
     * @see {@link https://bbalganjjm.github.io/natural_js/#html/naturaljs/refr/refr0102.html }
     */
    const config = NA.config;

    // === Natural-DATA

    const ds = ND.ds;
    const formatter = ND.formatter;
    const validator = ND.validator;
    const data = ND.data;

    // === Natural-UI

    const ui = NU.ui;
    const alert = NU.alert;
    const button = NU.button;
    const datepicker = NU.datepicker;
    const popup = NU.popup;
    const tab = NU.tab;
    const select = NU.select;
    const form = NU.form;
    const list = NU.list;
    const grid = NU.grid;
    const pagination = NU.pagination;
    const tree = NU.tree;

    // === Natural-UI.Shell

    const notify = function (position: any, opts?: any) {
        return new NUS.notify(position, opts);
    }
    notify.add = NUS.notify.add;
    const docs = NUS.docs;
}