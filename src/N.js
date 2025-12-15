/**
 * Natural-JS v2.0.0
 * Main Entry Point - N Class
 */

// Core Helpers
import * as TypeChecker from './core/helpers/type-checker.js';
import * as Logger from './core/helpers/logger.js';
import * as SerialExecute from './core/helpers/serial-execute.js';

// Core Utils
import * as StringUtils from './core/utils/string.js';
import * as DateUtils from './core/utils/date.js';
import * as ElementUtils from './core/utils/element.js';
import * as BrowserUtils from './core/utils/browser.js';
import * as MessageUtils from './core/utils/message.js';
import * as ArrayUtils from './core/utils/array.js';
import * as JSONUtils from './core/utils/json.js';
import * as EventUtils from './core/utils/event.js';
import { Mask } from './core/utils/mask.js';

// Core Extensions & GC
import { applyJQueryExtensions } from './core/extensions/jquery-extensions.js';
import { GC } from './core/gc/garbage-collector.js';
import { initDateFormatter } from './core/utils/date.js';

// Architecture
import { Fetch, fetch as fetchAPI } from './architecture/communication/fetch.js';
import { Communicator } from './architecture/communication/communicator.js';
import { Controller } from './architecture/controller/controller.js';
import { Context } from './architecture/context/context.js';

// Data
import { DataSync } from './data/sync/data-sync.js';
import { Formatter } from './data/formatter/formatter.js';
import { Validator } from './data/validator/validator.js';
import { DataFilter } from './data/filters/data-filter.js';

// UI Shared
import { Iteration } from './ui/shared/iteration.js';
import { Draggable } from './ui/shared/draggable.js';
import { UIUtils } from './ui/shared/utils.js';
import { Scroll } from './ui/shared/scroll.js';

// UI Components
import { Form } from './ui/components/form/form.js';
import { Alert } from './ui/components/alert/alert.js';
import { Button } from './ui/components/button/button.js';
import { Popup } from './ui/components/popup/popup.js';
import { Tab } from './ui/components/tab/tab.js';
import { Datepicker } from './ui/components/datepicker/datepicker.js';
import { Select } from './ui/components/select/select.js';
import { Pagination } from './ui/components/pagination/pagination.js';
import { List } from './ui/components/list/list.js';
import { Grid } from './ui/components/grid/grid.js';
import { Tree } from './ui/components/tree/tree.js';

// Apply global extensions
applyJQueryExtensions();
initDateFormatter();

/**
 * NJS Class - extends jQuery
 */
export class NJS {
    constructor(selector, context) {
        // Call jQuery constructor
        const jqObj = jQuery(selector, context);
        
        // Copy jQuery properties to this instance
        Object.setPrototypeOf(jqObj, NJS.prototype);
        
        // Set selector property
        jqObj.selector = TypeChecker.toSelector(selector);
        
        return jqObj;
    }
    
    // Architecture Prototype Methods
    comm(url) {
        return new Communicator(this, url);
    }
    
    cont(contObj) {
        return new Controller(this, contObj);
    }
    
    request() {
        return this.get(0).request;
    }
    
    // Data Prototype Methods
    datafilter(condition) {
        return DataFilter.filter(this, condition);
    }
    
    datasort(key, reverse) {
        return DataFilter.sort(this, key, reverse);
    }
    
    formatter(rules) {
        return new Formatter(this, rules);
    }
    
    validator(rules) {
        return new Validator(this, rules);
    }
    
    // UI Component Prototype Methods
    alert(msg, vars) {
        return new Alert(this, msg, vars);
    }
    
    button(opts) {
        if(this.is("input[type='button'], button, a")) {
            return this.each(function() {
                return new Button(jQuery(this), opts);
            });
        }
    }
    
    datepicker(opts) {
        return new Datepicker(this, opts);
    }
    
    popup(opts) {
        return new Popup(this, opts);
    }
    
    tab(opts) {
        return new Tab(this, opts);
    }
    
    select(opts) {
        return new Select(this, opts);
    }
    
    form(opts) {
        return new Form(this, opts);
    }
    
    list(opts) {
        return new List(this, opts);
    }
    
    grid(opts) {
        return new Grid(this, opts);
    }
    
    pagination(opts) {
        return new Pagination(this, opts);
    }
    
    tree(opts) {
        return new Tree(this, opts);
    }
    
    // Static Properties - Version
    static version = "2.0.0";
    
    // Static Properties - Core Utils
    static string = StringUtils.StringUtils;
    static date = DateUtils.DateUtils;
    static element = ElementUtils.ElementUtils;
    static browser = BrowserUtils.BrowserUtils;
    static message = MessageUtils.MessageUtils;
    static array = ArrayUtils.ArrayUtils;
    static json = JSONUtils.JSONUtils;
    static event = EventUtils.EventUtils;
    static mask = Mask;
    static gc = GC;
    
    // Static Properties - Type Checking
    static type = TypeChecker.type;
    static isString = TypeChecker.isString;
    static isNumeric = TypeChecker.isNumeric;
    static isPlainObject = TypeChecker.isPlainObject;
    static isEmptyObject = TypeChecker.isEmptyObject;
    static isArray = TypeChecker.isArray;
    static isArraylike = TypeChecker.isArraylike;
    static isWrappedSet = TypeChecker.isWrappedSet;
    static isElement = TypeChecker.isElement;
    static toSelector = TypeChecker.toSelector;
    
    // Static Properties - Logger
    static debug = Logger.debug;
    static log = Logger.log;
    static info = Logger.info;
    static warn = Logger.warn;
    static error = Logger.error;
    
    // Static Properties - Serial Execute
    static serialExecute = SerialExecute.serialExecute;
    
    // Static Properties - Architecture
    static fetch = Fetch.fetch.bind(Fetch);
    static comm = (obj, url) => new Communicator(obj, url);
    static cont = (obj, contObj) => new Controller(obj, contObj);
    static context = Context;
    
    // Static Properties - Data
    static ds = DataSync;
    static formatter = Formatter;
    static validator = Validator;
    static data = DataFilter;
    
    // Static Properties - UI Shared
    static ui = class {
        static iteration = Iteration;
        static draggable = Draggable;
        static utils = UIUtils;
        static scroll = Scroll;
    };
    
    // Static Properties - UI Components
    static alert = Alert;
    static button = Button;
    static datepicker = Datepicker;
    static popup = Popup;
    static tab = Tab;
    static select = Select;
    static form = Form;
    static list = List;
    static grid = Grid;
    static pagination = Pagination;
    static tree = Tree;
}

// Set prototype chain: NJS -> jQuery.fn
Object.setPrototypeOf(NJS.prototype, jQuery.fn);

/**
 * N Function - Factory for NJS instances
 */
export function N(selector, context) {
    return new NJS(selector, context);
}

// Copy static properties from NJS to N function
Object.keys(NJS).forEach(key => {
    if (key !== 'prototype' && key !== 'length' && key !== 'name') {
        N[key] = NJS[key];
    }
});

// Global export
if (typeof window !== 'undefined') {
    window.N = N;
}

export default N;
