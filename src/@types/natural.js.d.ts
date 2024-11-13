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
    // Natural-CORE
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

    // Natural-ARCHITECTURE
    const ajax = NA.ajax;

    function comm(obj: NJS, url: string | NA.Request.Options): NA.comm {
        return new NA.comm(obj, url);
    }

    function cont(obj: any, url: any): NA.cont {
        return new NA.cont(obj, url);
    }

    const context = NA.context;
    const config = NA.config;

    // Natural-DATA
    const ds = ND.ds;
    const formatter = ND.formatter;
    const validator = ND.validator;
    const data = ND.data;

    // Natural-UI
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

    // Natural-UI.Shell
    const notify = function (position: any, opts?: any) {
        return new NUS.notify(position, opts);
    }
    notify.add = NUS.notify.add;
    const docs = NUS.docs;
}