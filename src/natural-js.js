/*!
 * Natural-JS v1.0.0
 *
 * Released under the LGPL v2.1 license
 * Date: 2014-09-26T11:11Z
 *
 * Copyright 2014 Goldman Kim(bbalganjjm@gmail.com)
 */

function N(selector, context) {
    return new NJS(selector, context);
}

Object.assign(N, NC, NA, ND, NU, NUS);
// Object.assign(jQuery.fn, NC.prototype, NA.prototype, ND.prototype, NU.prototype, NUS.prototype);

jQuery.fn.remove_ = NC.prototype.remove_;
jQuery.fn.tpBind = NC.prototype.tpBind;
jQuery.fn.instance = NC.prototype.instance;
jQuery.fn.vals = NC.prototype.vals;
jQuery.fn.events = NC.prototype.events;

jQuery.fn.comm = NA.prototype.comm;
N.comm = function(obj, url) {
    return new NA.comm(obj, url);
}
jQuery.fn.cont = NA.prototype.cont;

jQuery.fn.datafilter = ND.prototype.datafilter;
jQuery.fn.datasort = ND.prototype.datasort;
jQuery.fn.formatter = ND.prototype.formatter;
jQuery.fn.validator = ND.prototype.validator;

jQuery.fn.alert = NU.prototype.alert;
jQuery.fn.button = NU.prototype.button;
jQuery.fn.datepicker = NU.prototype.datepicker;
jQuery.fn.popup = NU.prototype.popup;
jQuery.fn.tab = NU.prototype.tab;
jQuery.fn.select = NU.prototype.select;
jQuery.fn.form = NU.prototype.form;
jQuery.fn.list = NU.prototype.list;
jQuery.fn.grid = NU.prototype.grid;
jQuery.fn.pagination = NU.prototype.pagination;
jQuery.fn.tree = NU.prototype.tree;

jQuery.fn.notify = NUS.prototype.notify;
N.notify = function(position, opts) {
    return new NUS.notify(position, opts);
}
N.notify.add = NUS.notify.add;
jQuery.fn.docs = NUS.prototype.docs;

// jQuery.fn.extend(NC.prototype);
// jQuery.fn.extend(NA.prototype);

class NJS extends jQuery {

    /**
     * Initializes and returns a new N object based on jQuery objects with the provided selector and context argument values.
     */
    constructor(selector, context) {
        super(selector, context);
        this.selector = NC.toSelector(selector);
    };

    static version = {
        "Natural-JS" : "1.0.0",
        "Natural-CORE" : "1.0.0",
        "Natural-ARCHITECTURE" : "1.0.0",
        "Natural-DATA" : "1.0.0",
        "Natural-UI" : "1.0.0",
        "Natural-UI.Shell" : "1.0.0"
    };

}






