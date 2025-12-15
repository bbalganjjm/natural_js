/**
 * Natural-JS jQuery Prototype Extensions
 */

import { isNumeric, type as getType, isEmptyObject } from '../helpers/type-checker.js';
import { StringUtils } from '../utils/string.js';

// Placeholder for NA.context (will be injected from N.js)
let NAContext;

const getContext = () => NAContext || { 
    attr: () => ({ 
        core: { 
            sgChkdVal: "Y", 
            sgUnChkdVal: "N",
            locale: "en_US"
        },
        architecture: {
            page: { context: document }
        }
    }) 
};

/**
 * jQuery prototype extensions
 */
export const jQueryExtensions = {
    /**
     * Remove element in array
     */
    remove_(idx, length) {
        if (idx !== undefined) {
            if (!isNumeric(idx)) {
                idx = this.toArray().indexOf(idx);
            }
            if (length === undefined) {
                length = 1;
            }
            this.splice(idx, length);
        }
        return this;
    },

    /**
     * Bind an event to top priority
     */
    tpBind() {
        const args = arguments;
        const self = this;
        return this.each(function() {
            if(jQuery._data(this, "events") !== undefined) {
                self.on.apply(self, args);
                jQuery(this).each(function() {
                    const handlers = jQuery._data(this, "events")[args[0].split(".")[0]];
                    const handler = handlers.pop();
                    handlers.splice(0, 0, handler);
                });
            } else {
                self.on.apply(self, args);
            }
        });
    },

    /**
     * Get instance from context element of component or library
     */
    instance(name, instance) {
        if(arguments.length === 0) {
            return this.map(function() {
                return jQuery.map(jQuery(this).data(), function(v, i) {
                    if(StringUtils.endsWith(i, "__")) {
                        return v;
                    }
                });
            });
        } else if(arguments.length === 1) {
            if(typeof name === "function") {
                return this.each(function() {
                    return jQuery.each(jQuery(this).data(), function(i, v) {
                        if(StringUtils.endsWith(i, "__")) {
                            name.call(v, i.replace("__", ""), v);
                        }
                    });
                });
            } else {
                const insts = this.map(function() {
                    return jQuery.map(jQuery(this).data(), function(v, i) {
                        if(i === name + "__") {
                            return v;
                        }
                    });
                });
                return insts.length <= 1 ? insts[0] : insts;
            }
        } else if(arguments.length === 2) {
            if(typeof instance === "function") {
                return this.each(function() {
                    return jQuery.each(jQuery(this).data(), function(i, v) {
                        if(name + "__" === i) {
                            instance.call(v, i.replace("__", ""), v);
                        }
                    });
                });
            } else {
                //set instance
                this.data(name + "__", instance);
                return this;
            }
        }
    },

    /**
     * Get or set the value to (multiple)select input elements
     * if vals(arg[0]) argument is undefined, it works in get mode
     */
    vals(vals) {
        const ctx = getContext();
        const tagName = this.get(0).tagName.toLowerCase();
        const type = StringUtils.trimToEmpty(this.attr("type")).toLowerCase();
        let selEle;
        let ele;
        if(vals !== undefined && getType(vals) !== "function") {
            if (tagName === "select") {
                if(StringUtils.trimToNull(vals) === null && !this.is("select[multiple='multiple']")) {
                    if(this.length > 0) {
                        this.get(0).selectedIndex = 0;
                    }
                } else {
                    this.val(vals);
                }
            } else if (type === "checkbox") {
                if(getType(vals) === "string") {
                    vals = [ vals ];
                }
                if(this.length > 1) {
                    this.prop("checked", false);
                    const self = this;
                    N(vals).each(function() {
                        self.filter("[value='" + String(this) + "']").prop("checked", true);
                    });
                } else if(this.length === 1) {
                    if(vals[0] !== ctx.attr("core").sgChkdVal && vals[0] !== ctx.attr("core").sgUnChkdVal) {
                        vals[0] = ctx.attr("core").sgUnChkdVal;
                    }
                    if(ctx.attr("core").sgChkdVal === vals[0]) {
                        this.prop("checked", true);
                    } else if (ctx.attr("core").sgUnChkdVal === vals[0]) {
                        this.prop("checked", false);
                    } else {
                        this.filter("[value='" + String(vals[0]) + "']").prop("checked", true);
                    }
                    this.val(vals[0]);
                }
            } else if (type === "radio") {
                this.each(function() {
                    const thisEle = N(this);
                    if(thisEle.attr("value") === String(vals)) {
                        thisEle.prop("checked", true);
                    } else {
                        thisEle.prop("checked", false);
                    }
                });
            }
            return this;
        } else {
            if (tagName === "select") {
                selEle = this.find("> option:selected");
                if(selEle.length > 1) {
                    if(getType(vals) !== "function") {
                        return selEle.map(function() {
                            return StringUtils.trimToEmpty(jQuery(this).val());
                        }).toArray();
                    } else {
                        ele = this.find("> option");
                        return selEle.each(function() {
                            vals.call(this, ele.index(this), this);
                        });
                    }
                } else if(selEle.length === 1) {
                    if(getType(vals) !== "function") {
                        if(selEle.attr("value") !== undefined) {
                            return StringUtils.trimToEmpty(selEle.val());
                        } else {
                            return "";
                        }
                    } else {
                        vals.call(selEle, this.find("> option:not(.select_default__)").index(selEle), selEle);
                        return selEle;
                    }
                } else if(selEle.length === 0 && this.is("[multiple]")) {
                    return [];
                }
            } else if (type === "radio") {
                selEle = this.filter("[name='" + this.attr("name") + "']:checked");
                if(getType(vals) !== "function") {
                    return StringUtils.trimToEmpty(selEle.val());
                } else {
                    vals.call(selEle, this.filter("[name='" + this.attr("name") + "']").index(selEle), selEle);
                    return selEle;
                }
            } else if (type === "checkbox") {
                selEle = this.filter("[name='" + this.attr("name") + "']:checked");
                if(this.length > 1) {
                    if(getType(vals) !== "function") {
                        const chkedVals = selEle.map(function() {
                            return StringUtils.trimToEmpty(jQuery(this).val());
                        }).toArray();
                        return selEle.length === 1 ? StringUtils.trimToEmpty(jQuery(selEle).val()) : chkedVals.length === 0 ? [] : chkedVals;
                    } else {
                        ele = this.filter("[name='" + this.attr("name") + "']");
                        return selEle.each(function() {
                            vals.call(this, ele.index(this), this);
                        });
                    }
                } else if( this.length === 1) {
                    if(selEle.length === 0) {
                        selEle = this.filter("[id='" + this.attr("id") + "']");
                    }
                    if(getType(vals) !== "function") {
                        let val = StringUtils.trimToEmpty(selEle.val());
                        if(val !== ctx.attr("core").sgChkdVal && val !== ctx.attr("core").sgUnChkdVal) {
                            val = ctx.attr("core").sgUnChkdVal;
                        }
                        if(ctx.attr("core").sgChkdVal === val || ctx.attr("core").sgUnChkdVal === val || selEle.attr("value") === undefined) {
                            if(selEle.prop("checked")) {
                                val = ctx.attr("core").sgChkdVal;
                                selEle.val(val);
                                return val;
                            } else if (!selEle.prop("checked")) {
                                val = ctx.attr("core").sgUnChkdVal;
                                selEle.val(val);
                                return val;
                            }
                        } else {
                            return val;
                        }
                    } else {
                        vals.call(selEle, this.filter("[name='" + this.attr("name") + "']").index(selEle), selEle);
                        return selEle;
                    }
                }
            }
        }
        return "";
    },

    /**
     * Returns the event bound to the element.
     */
    events(eventName, namespace) {
        const ele = jQuery(this);
        if(ele.length > 0 && jQuery._data(ele.get(0), "events") !== undefined) {
            if(eventName !== undefined && namespace !== undefined) {
                const e_ = jQuery(jQuery._data(ele.get(0), "events")[eventName]).filter(function() {
                    return namespace === this.namespace;
                }).get();
                return isEmptyObject(e_) ? undefined : e_;
            } else if(eventName !== undefined && namespace === undefined) {
                return jQuery._data(ele.get(0), "events")[eventName];
            } else {
                return jQuery._data(ele.get(0), "events");
            }
        }
    }
};

/**
 * Apply jQuery extensions to jQuery.fn
 * This should be called when initializing Natural-JS
 */
export function applyJQueryExtensions() {
    Object.keys(jQueryExtensions).forEach(key => {
        jQuery.fn[key] = jQueryExtensions[key];
    });
}

// Setter for context (to be called from N.js integration)
export const setContext = (ctx) => {
    NAContext = ctx;
};
