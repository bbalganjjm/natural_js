declare function N(selector: any, context?: any): NJS.prototype;
declare class NJS extends JQuery, NC, NA, ND, NU, NUS {
    static version: {
        "Natural-JS": string;
        "Natural-CORE": string;
        "Natural-ARCHITECTURE": string;
        "Natural-DATA": string;
        "Natural-UI": string;
        "Natural-UI.Shell": string;
    };
    /**
     * Initializes and returns a new N object based on jQuery objects with the provided selector and context argument values.
     */
    constructor(selector: any, context?: any);
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
    const ajax = ND.ajax;
    const comm = ND.comm;
    const cont = ND.cont;
    const context = ND.context;
    const config = ND.config;

    // Natural-DATA
    const ds = ND.ds;
    const formatter = ND.formatter;
    const validator = ND.validator;
    const data = ND.data;

    // Natural-UI
    const ui = ND.ui;
    const alert = ND.alert;
    const button = ND.button;
    const datepicker = ND.datepicker;
    const popup = ND.popup;
    const tab = ND.tab;
    const select = ND.select;
    const form = ND.form;
    const list = ND.list;
    const grid = ND.grid;
    const pagination = ND.pagination;
    const tree = ND.tree;

    // Natural-UI.Shell
    const notify = ND.notify;
    const docs = ND.docs;
}