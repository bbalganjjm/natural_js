/**
 * Natural-JS UI Form Component
 * Full version from original natural.ui.js lines 3352-4844
 */

import { error as createError, warn } from '../../../core/helpers/logger.js';
import { type as getType, isPlainObject, isString, isElement, isArray } from '../../../core/helpers/type-checker.js';
import { StringUtils } from '../../../core/utils/string.js';
import { ElementUtils } from '../../../core/utils/element.js';
import { DateUtils } from '../../../core/utils/date.js';
import { BrowserUtils } from '../../../core/utils/browser.js';
import { EventUtils } from '../../../core/utils/event.js';
import { Context } from '../../../architecture/context/context.js';
import { DataSync } from '../../../data/sync/data-sync.js';
import { Formatter } from '../../../data/formatter/formatter.js';
import { Validator } from '../../../data/validator/validator.js';
import { Iteration } from '../../shared/iteration.js';
import { UIUtils } from '../../shared/utils.js';
import { Scroll } from '../../shared/scroll.js';
import { Draggable } from '../../shared/draggable.js';
import { GC } from '../../../core/gc/garbage-collector.js';

export class Form {

        constructor(data, opts) {
            this.options = {
                data : getType(data) === "array" ? jQuery(data) : data,
                row : -1,
                context : null,
                validate : true,
                autoUnbind : false,
                state : null, // add, bind, revert, update
                html : false,
                addTop : true,
                fRules : null,
                vRules : null,
                extObj : null, // extObj : for List or Grid
                extRow : -1, // extRow : for List or Grid
                revert : false,
                cache : true,
                unbind : true,
                tpBind : false,
                onBeforeBindValue : null,
                onBindValue : null,
                onBeforeBind : null,
                onBind : null,
                InitialData : null // for unbind
            };

            try {
                jQuery.extend(this.options, Context.attr("ui").form);
            } catch (e) {
                throw createError("Form", e);
            }

            if (isPlainObject(opts)) {
                // Wraps the global event options in NA.config and event options for this component.
                UIUtils.wrapHandler(opts, "form", "onBeforeBindValue");
                UIUtils.wrapHandler(opts, "form", "onBindValue");
                UIUtils.wrapHandler(opts, "form", "onBeforeBind");
                UIUtils.wrapHandler(opts, "form", "onBind");

                //convert data to wrapped set
                opts.data = getType(opts.data) === "array" ? jQuery(opts.data) : opts.data;

                jQuery.extend(this.options, opts);
                if(getType(this.options.context) === "string") {
                    this.options.context = jQuery(this.options.context);
                }
                if(opts.row === undefined) {
                    this.options.row = 0;
                }
            } else {
                this.options.row = 0;
                this.options.context = jQuery(opts);
            }

            // for unbind
            if(this.options.unbind) {
                if(this.options.context !== null) {
                    this.options.InitialData = ElementUtils.toData(this.options.context.find("[id]").not(":button"));
                }
            }

            // set style class name to context element
            this.options.context.addClass("form__");

            if(this.options.revert) {
                this.options.revertData = jQuery.extend({}, this.options.data[this.options.row]);
            }

            // set this instance to context element
            this.options.context.instance("form", this);

            // register this to DataSync for realtime data synchronization
            if(this.options.extObj === null) {
                DataSync.instance(this, true);
            }

            return this;
        };

        data(selFlag) { // key name : argument1, argument2... argumentN
            const opts = this.options;
            if(selFlag !== undefined && selFlag === true) {
                const retData = [];
                // clone arguments
                const args = Array.prototype.slice.call(arguments, 0);
                if(arguments.length > 1) {
                    args[0] = opts.data[opts.row];
                    retData.push(NC.json.mapFromKeys.apply(NC.json, args));
                } else {
                    retData.push(opts.data[opts.row]);
                }
                return retData;
            } else if(selFlag !== undefined && selFlag === false) {
                return opts.data;
            } else {
                return opts.data.get();
            }
        };

        row(before) {
            return before !== undefined && before === "before" ? this.options.beforeRow : this.options.row;
        };

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        /**
         * arguments[2]... arguments[n] are the columns to be bound.
         */
        bindEvents = {
            /**
             * validate
             */
            validate : function(ele, opts, eleType, isTextInput) {
                if(ele.data("validate") !== undefined) {
                    if (eleType !== "hidden") {
                        jQuery().validator(opts.vRules !== null ? opts.vRules : ele);

                        if(isTextInput && NC.isEmptyObject(ele.events("focusout", "form.validate"))) {
                            ele[opts.tpBind ? "tpBind" : "on"]("focusout.form.validate", function() {
                                const currEle = jQuery(this);
                                if (!currEle.prop("disabled") && !currEle.prop("readonly") && opts.validate) {
                                    currEle.trigger("validate.validator");
                                }
                            });
                        }
                    }
                }
            },
            /**
             * dataSync
             */
            dataSync : function(ele, opts, vals, eleType) {
                const self = this;

                let eventName = "focusout";
                if(eleType === "select") {
                    eventName = "change";
                }

                if(NC.isEmptyObject(ele.events(eventName, "dataSync.form"))) {
                    ele[opts.tpBind ? "tpBind" : "on"](eventName + ".form.dataSync", function(e) {
                        const currEle = jQuery(this);
                        const currVal = currEle.val();

                        // for val method
                        if(vals !== opts.data[opts.row]) {
                            vals = opts.data[opts.row];
                        }

                        if ((vals[currEle.attr("id")] === null ? "" : vals[currEle.attr("id")]) !== currVal) {

                            if(eleType === "select") {
                                // remove validator's dregs
                                currEle.removeClass("validate_false__");
                                if(currEle.instance("alert") !== undefined) {
                                    currEle.instance("alert").remove();
                                    currEle.removeData("alert__");
                                }
                            }

                            if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || (opts.validate && !currEle.hasClass("validate_false__")))) {
                                // remove validator's dregs
                                currEle.removeClass("validate_false__");
                                if(currEle.instance("alert") !== undefined) {
                                    currEle.instance("alert").remove();
                                    currEle.removeData("alert__");
                                }

                                // update dataset value
                                vals[currEle.attr("id")] = currVal;

                                // change row status
                                if (vals.rowStatus !== "insert" && vals.rowStatus !== "delete") {
                                    vals.rowStatus = "update";
                                    // add data changed flag
                                    currEle.addClass("data_changed__");
                                    if(!opts.context.hasClass("row_data_changed__")) {
                                        opts.context.addClass("row_data_changed__");
                                    }
                                }

                                // notify data changed
                                DataSync.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, currEle.attr("id"));
                            }
                        }
                    });
                }
            },
            /**
             * Enter key event
             */
            enterKey : function(ele, opts) {
                if(NC.isEmptyObject(ele.events("keyup", "dataSync.form"))) {
                    ele[opts.tpBind ? "tpBind" : "on"]("keyup.form.dataSync", function(e) {
                        if ((e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode)) === 13) {
                            e.preventDefault();
                            jQuery(this).trigger("focusout.form.validate");
                            // notify data changed
                            jQuery(this).trigger("focusout.form.dataSync");
                        }
                    });
                }
            },
            /**
             * format
             */
            format : function(ele, opts, eleType, vals, key) {
                if(ele.data("format") !== undefined) {
                    if (eleType !== "password" && eleType !== "hidden" && eleType !== "file") {
                        jQuery(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);

                        const eventNames = ["focusin", "focusout"];
                        const formats = ["unformat", "format"];
                        let bindMethod = "on";

                        if(opts.tpBind) {
                            eventNames.reverse();
                            formats.reverse();
                            bindMethod = "tpBind";
                        }

                        if(NC.isEmptyObject(ele.events(eventNames[0], "form." + formats[0]))) {
                            ele[bindMethod](eventNames[0] + ".form." + formats[0], function() {
                                const currEle = jQuery(this);
                                if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || (opts.validate && !currEle.hasClass("validate_false__")))) {
                                    currEle.trigger(formats[0] + ".formatter");
                                }
                            });
                        }

                        if(NC.isEmptyObject(ele.events(eventNames[1], "form." + formats[1]))) {
                            ele[bindMethod](eventNames[1] + ".form." + formats[1], function() {
                                const currEle = jQuery(this);
                                if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || (opts.validate && !currEle.hasClass("validate_false__")))) {
                                    currEle.trigger(formats[1] + ".formatter");
                                }
                            });
                        }

                    }
                } else {
                    // put value
                    ele.val(vals[key] != null ? String(vals[key]) : "");
                }
            }
        };

        bind(row, data) {
            const opts = this.options;

            if(data === "add" || data === "bind" || data === "revert" || data === "update") {
                if(opts.autoUnbind) {
                    this.unbind();
                }
                opts.state = data;
                data = undefined;
            } else {
                opts.state = "bind";
            }

            if(row !== undefined) {
                opts.row = row;
            }
            if(data != null) {
                opts.data = getType(data) === "array" ? jQuery(data) : data;
                if(opts.revert) {
                    opts.revertData = jQuery.extend({}, data[row]);
                }
            }

            const self = this;
            let vals;
            if (!NC.isEmptyObject(opts.data) && !NC.isEmptyObject(vals = opts.data[opts.row])) {
                if(arguments.length < 3 && opts.onBeforeBind !== null && this.options.extObj === null) {
                    opts.onBeforeBind.call(self, opts.context, vals);
                }

                // add row data changed flag
                if (vals.rowStatus === "insert" || vals.rowStatus === "update") {
                    opts.context.addClass("row_data_changed__");
                } else {
                    opts.context.removeClass("row_data_changed__");
                }
                if (vals.rowStatus === "delete") {
                    opts.context.addClass("row_data_deleted__");
                } else {
                    opts.context.removeClass("row_data_deleted__");
                }
                let idContext, rcContext, eles, ele, val, tagName, type;

                const spltSepa = Context.attr("core").spltSepa;
                let cols;
                if(arguments.length > 2) {
                    cols = spltSepa + Array.prototype.slice.call(arguments, 2).join(spltSepa) + spltSepa;
                }

                if(opts.cache) {
                    if(this.idContext === undefined) {
                        idContext = self.idContext = opts.context.find("[id]:not(:radio, :checkbox)"); // normal elements
                    } else {
                        idContext = self.idContext;
                    }
                    if(this.rcContext === undefined) {
                        rcContext = self.rcContext = opts.context.find(":radio, :checkbox"); // radio and checkbox elements
                    } else {
                        rcContext = self.rcContext;
                    }
                } else {
                    idContext = opts.context.find("[id]:not(:radio, :checkbox)"); // normal elements
                    rcContext = opts.context.find(":radio, :checkbox"); // radio and checkbox elements
                }
                for ( const key in vals ) {
                    if(cols !== undefined && cols.indexOf(spltSepa + key + spltSepa) < 0) {
                        continue;
                    }

                    if(StringUtils.isEmpty(key)) {
                        warn('[Form.bind]Within the context, there is an element with an id attribute value of ""(blank).');
                        continue;
                    }
                    ele = idContext.filter("#" + key);

                    if(opts.onBeforeBindValue !== null) {
                        const filteredVal = opts.onBeforeBindValue.call(self, ele, vals[key], "bind");
                        if(filteredVal !== undefined) {
                            vals[key] = filteredVal;
                        }
                    }

                    if (ele.length > 0) {
                        // add data changed flag
                        if (vals.rowStatus === "update") {
                            ele.addClass("data_changed__");
                        } else {
                            ele.removeClass("data_changed__");
                        }

                        tagName = ele.get(0).tagName.toLowerCase();
                        type = StringUtils.trimToEmpty(ele.attr("type")).toLowerCase();
                        if (UIUtils.isTextInput(tagName, type)) {
                            if(opts.tpBind) {
                                self.bindEvents.format.call(self, ele, opts, type, vals, key);

                                self.bindEvents.enterKey.call(self, ele, opts);

                                self.bindEvents.dataSync.call(self, ele, opts, vals);

                                self.bindEvents.validate.call(self, ele, opts, type, true);
                            } else {
                                self.bindEvents.validate.call(self, ele, opts, type, true);

                                self.bindEvents.dataSync.call(self, ele, opts, vals);

                                self.bindEvents.enterKey.call(self, ele, opts);

                                self.bindEvents.format.call(self, ele, opts, type, vals, key);
                            }
                        } else if(tagName === "select") {
                            self.bindEvents.validate.call(self, ele, opts, type, false);

                            self.bindEvents.dataSync.call(self, ele, opts, vals, "select");

                            // select value
                            ele.vals(vals[key] != null ? String(vals[key]) : "");
                        } else if(tagName === "img") {
                            // put image path
                            ele.attr("src", vals[key] != null ? String(vals[key]) : "");
                        } else {
                            if(ele.data("format") !== undefined) {
                                jQuery(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);
                            } else {
                                val = vals[key] != null ? String(vals[key]) : "";
                                // put value
                                if(!opts.html) {
                                    ele.text(val);
                                } else {
                                    ele.html(val);
                                }
                            }
                        }
                    } else {
                        //radio, checkbox
                        eles = rcContext.filter("[name='" + key + "']");
                        if(eles.length === 0) {
                            eles = rcContext.filter("#" + key);
                        }
                        if(eles.length > 0) {
                            //validate
                            if(eles.filter(".select_template__").data("validate") !== undefined) {
                                // remove validator's dregs for rebind
                                ele.removeClass("validate_false__");
                                if(ele.instance("alert") !== undefined) {
                                    ele.instance("alert").remove();
                                    ele.removeData("alert__");
                                }

                                if (opts.validate) {
                                    jQuery().validator(opts.vRules !== null ? opts.vRules : eles.filter(".select_template__"));
                                }
                            }

                            //dataSync
                            eles.off("click.form.dataSync select.form.dataSync");
                            eles.on("click.form.dataSync select.form.dataSync", function(e) {
                                const currEle = jQuery(this);
                                let currEles = opts.context.find("[name='" + currEle.attr("name") + "']");
                                if(currEles.length === 0) {
                                    currEles = jQuery(this);
                                }
                                let currKey = currEle.attr("name");
                                if(currKey === undefined) {
                                    currKey = currEle.attr("id");
                                }
                                const currVals = currEles.vals();

                                // for val method
                                if(vals !== opts.data[opts.row]) {
                                    vals = opts.data[opts.row];
                                }

                                if ((vals[currKey] === null ? "" : vals[currKey]) !== currVals) {
                                    // update dataset value
                                    vals[currKey] = currVals;

                                    // change row status
                                    if (vals.rowStatus !== "insert" && vals.rowStatus !== "delete") {
                                        vals.rowStatus = "update";
                                        // add data changed flag
                                        currEles.addClass("data_changed__");
                                        if(!opts.context.hasClass("row_data_changed__")) {
                                            opts.context.addClass("row_data_changed__");
                                        }
                                    }

                                    // notify data changed
                                    if (!currEle.prop("disabled") && !currEle.prop("readonly")) {
                                        DataSync.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, currKey);
                                    }
                                }
                            });

                            // select value
                            eles.vals(vals[key] != null ? vals[key] : "");

                            // add data changed flag
                            if (vals.rowStatus === "update") {
                                eles.addClass("data_changed__");
                            } else {
                                eles.removeClass("data_changed__");
                            }
                        }
                    }

                    if(opts.onBindValue !== null) {
                        const filteredVal = opts.onBindValue.call(self, ele, vals[key], "bind");
                        if(filteredVal !== undefined) {
                            vals[key] = filteredVal;
                        }
                    }

                }

                if(arguments.length < 3 && opts.onBind !== null && this.options.extObj === null) {
                    opts.onBind.call(self, opts.context, vals);
                }
                // empty variables
                idContext = rcContext = eles = ele = val = tagName = type = undefined;
            }
            return this;
        };

        unbind(state) {
            const opts = this.options;

            if(opts.unbind && opts.InitialData !== null) {
                opts.context.removeClass("row_data_changed__");
                const vals = opts.InitialData;
                let idContext, rcContext, eles, ele, val, tagName, type;

                idContext = opts.context.find("[id]:not(:radio, :checkbox)"); // normal elements
                rcContext = opts.context.find(":radio, :checkbox"); // radio and checkbox elements
                for ( const key in vals ) {
                    ele = idContext.filter("#" + key);
                    if (ele.length > 0) {
                        ele.removeClass("data_changed__");
                        tagName = ele.get(0).tagName.toLowerCase();
                        type = StringUtils.trimToEmpty(ele.attr("type")).toLowerCase();
                        if (UIUtils.isTextInput(tagName, type)) {
                            // unbind events
                            ele.off("focusout.form.validate focusout.form.dataSync keyup.form.dataSync focusin.form.unformat focusout.form.format format.formatter unformat.formatter");
                            // remove validator's dregs for rebind
                            ele.removeClass("validate_false__");
                            if(ele.instance("alert") !== undefined) {
                                ele.instance("alert").remove();
                                ele.removeData("alert__");
                            }
                            // bind initial value
                            ele.val(vals[key] != null ? String(vals[key]) : "");
                        } else if(tagName === "select") {
                            // unbind events
                            ele.off("change.form.dataSync");
                            // remove validator's dregs for rebind
                            ele.removeClass("validate_false__");
                            if(ele.instance("alert") !== undefined) {
                                ele.instance("alert").remove();
                                ele.removeData("alert__");
                            }
                            // bind initial value
                            ele.vals(vals[key] != null ? String(vals[key]) : "");
                        } else if(tagName === "img") {
                            // bind initial value
                            if(vals[key] !== undefined) {
                                ele.attr("src", vals[key] != null ? String(vals[key]) : "");
                            }
                        } else {
                            // bind initial value
                            ele.text(vals[key] != null ? String(vals[key]) : "");
                        }
                    } else {
                        //radio, checkbox
                        eles = rcContext.filter("[name='" + key + "']");
                        if(eles.length === 0) {
                            eles = rcContext.filter("#" + key);
                        }

                        eles.removeClass("data_changed__");
                        if(eles.length > 0) {
                            // off events
                            eles.off("click.form.dataSync select.form.dataSync");
                            // remove validator's dregs for rebind
                            ele.removeClass("validate_false__");
                            if(ele.instance("alert") !== undefined) {
                                ele.instance("alert").remove();
                                ele.removeData("alert__");
                            }
                            // bind initial value
                            eles.vals(vals[key] != null ? vals[key] : "");
                        }
                    }
                }
                // empty variables
                idContext = rcContext = eles = ele = val = tagName = type = undefined;
            }
            return this;
        };

        add(data, row) {
            const opts = this.options;
            opts.state = "add";
            if(opts.autoUnbind) {
                this.unbind();
            }

            if (opts.data === null) {
                throw new Error("[Form.add]Data is null. you must input data");
            }

            const extractedData = ElementUtils.toData(opts.context.find(":input:not(:button)"));
            if(data != null) {
                if(NC.isNumeric(data)) {
                    row = data;
                    data = undefined;
                } else {
                    jQuery.extend(extractedData, data);
                }
            }
            extractedData.rowStatus = "insert";

            if(row > opts.data.length || row < 0) {
                row = undefined;
            }

            if(!opts.addTop) {
                if(row === undefined) {
                    opts.data.push(extractedData);
                    row = opts.data.length - 1;
                } else {
                    opts.data.splice(row, 0, extractedData);
                }
            } else {
                if(row === undefined) {
                    row = 0;
                }
                opts.data.splice(row, 0, extractedData);
            }
            opts.row = row;

            // row index of Grid's form is 0;
            if(opts.extObj !== null) {
                opts.data = jQuery(opts.data[opts.row]);
                opts.row = 0;

                // for scroll paging
                // just +1 is inappropriate on android 4.4.2 webkit
                const rowEleLength = opts.extObj.options.context.find(opts.extObj instanceof Grid ? ">tbody" : ">li").length;
                const pagingSize = opts.extObj.options.scrollPaging.size;
                const rest = rowEleLength % pagingSize;
                opts.extObj.options.scrollPaging.idx = (rowEleLength / pagingSize) * pagingSize - pagingSize + rest;

                // for rowHandlerBeforeBind of List and Grid
                if(opts.extObj.options.rowHandlerBeforeBind !== null) {
                    opts.extObj.options.rowHandlerBeforeBind.call(opts.extObj, opts.extRow, opts.context, opts.data[opts.row]);
                }
            }

            // Set revert data
            if(opts.revert) {
                opts.revertData = jQuery.extend({}, opts.data[opts.row]);
            }

            this.bind(opts.row, opts.state);

            DataSync.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);

            return this;
        };

        remove() {
            const opts = this.options;

            if (opts.data[opts.row].rowStatus === "insert") {
                opts.data.splice(opts.row, 1);
                opts.row = -1;
                DataSync.instance(opts.extObj !== null ? opts.extObj : this).notify();

                this.unbind();
            } else {
                opts.data[opts.row].rowStatus = "delete";
                opts.context.addClass("row_data_deleted__");
                DataSync.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);
            }

            return this;
        };

        revert() {
            const opts = this.options;
            if(!opts.revert) {
                throw createError("[Form.prototype.revert]Can not revert. Form's revert option value is false");
            }

            opts.state = "revert";

            for(const k in opts.data[opts.row]){
                delete opts.data[opts.row][k];
            }
            jQuery.extend(opts.data[opts.row], opts.data[opts.row], opts.revertData);
            opts.data[opts.row]._isRevert = true;

            this.bind(opts.row, opts.state);

            DataSync.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);
            if(opts.data[opts.row]._isRevert !== undefined) {
                try {
                    delete opts.data[opts.row]._isRevert
                } catch(e) {}
            }
            return this;
        };

        validate() {
            const opts = this.options;
            const eles = opts.context.find(":input:not(:radio, :checkbox), :radio.select_template__, :checkbox.select_template__");
            if(opts.validate) {
                eles.not(".validate_false__").trigger("unformat.formatter");
            } else {
                eles.trigger("unformat.formatter");
            }

            eles.trigger("validate.validator");
            eles.not(".validate_false__").trigger("format.formatter");

            return eles.filter(".validate_false__").length <= 0;
        };

        val(key, val, notify) {
            const opts = this.options;
            const vals = opts.data[opts.row];

            if(val === undefined) {
                return vals[key];
            }

            let eles, tagName, type;
            const self = this;
            let rdonyFg = false;
            let dsabdFg = false;
            let ele = opts.context.find("#" + key);

            if(opts.onBeforeBindValue !== null) {
                const filteredVal = opts.onBeforeBindValue.call(self, ele, vals[key], "val");
                if(filteredVal !== undefined) {
                    vals[key] = filteredVal;
                }
            }

            if (ele.length > 0) {
                tagName = ele.get(0).tagName.toLowerCase();
                type = StringUtils.trimToEmpty(ele.attr("type")).toLowerCase();

                ele = ele.not(":radio, :checkbox");
                if (ele.length > 0) {
                    // remove prevent event condition of input element
                    if(ele.prop("readonly")) {
                        ele.removeAttr("readonly");
                        rdonyFg = true;
                    }
                    if(ele.prop("disabled")) {
                        ele.removeAttr("disabled");
                        dsabdFg = true;
                    }

                    if (UIUtils.isTextInput(tagName, type)) {
                        // remove validator's dregs for rebind
                        ele.removeClass("validate_false__");
                        if(ele.instance("alert") !== undefined) {
                            ele.instance("alert").remove();
                            ele.removeData("alert__");
                        }

                        // rebind for sync and validate, format, etc. related events bind
                        if(ele.events("focusout", "dataSync.form") === undefined) {
                            vals[key] = null;
                            self.bind(undefined, undefined, key);
                        }

                        // put value
                        ele.val(val);

                        // validate
                        if(ele.data("validate") !== undefined) {
                            if (type !== "hidden") {
                                ele.trigger("focusout.form.validate");
                            }
                        }

                        if(notify !== false) {
                            // dataSync & add data changed flag
                            ele.trigger("focusout.form.dataSync");
                        } else {
                            // add data changed flag
                            ele.addClass("data_changed__");
                        }

                        // format
                        if(ele.data("format") !== undefined) {
                            if (type !== "hidden" && type !== "password") {
                                ele.trigger("focusin.form.unformat");
                                ele.trigger("focusout.form.format");
                            }
                        }
                    } else if(tagName === "select") {
                        // remove validator's dregs for rebind
                        ele.removeClass("validate_false__");
                        if(ele.instance("alert") !== undefined) {
                            ele.instance("alert").remove();
                            ele.removeData("alert__");
                        }

                        // rebind for data sync and validate, format, etc. related events bind
                        if(ele.events("change", "dataSync.form") === undefined) {
                            vals[key] = null;
                            self.bind(undefined, undefined, key);
                        }

                        // select value
                        ele.vals(val);

                        if(notify !== false) {
                            // dataSync & add data changed flag
                            ele.trigger("change.form.dataSync");
                        } else {
                            // add data changed flag
                            ele.addClass("data_changed__");
                        }
                    } else if(tagName === "img") {
                        // update dataset value
                        vals[key] = val;

                        // change row status
                        if (vals.rowStatus !== "insert" && vals.rowStatus !== "delete") {
                            vals.rowStatus = "update";
                            // add data changed flag
                            ele.addClass("data_changed__");
                        }

                        // put image path
                        ele.attr("src", val);

                        // notify data changed
                        if(notify !== false) {
                            DataSync.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, key);
                        }
                    } else {
                        // update dataset value
                        vals[key] = val;

                        // change row status
                        if (vals.rowStatus !== "insert" && vals.rowStatus !== "delete") {
                            vals.rowStatus = "update";
                            // add data changed flag
                            ele.addClass("data_changed__");
                        }

                        // put value
                        if(ele.data("format") !== undefined) {
                            jQuery(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);
                        } else {
                            if(!opts.html) {
                                ele.text(val === null ? "" : val);
                            } else {
                                ele.html(val);
                            }
                        }

                        // notify data changed
                        if(notify !== false) {
                            DataSync.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, key);
                        }
                    }

                    // reset prevent event condition of input element
                    if(rdonyFg) {
                        ele.prop("readonly", true);
                    }
                    if(dsabdFg) {
                        ele.prop("disabled", true);
                    }
                } else {
                    //radio, checkbox
                    eles = opts.context.find("[name='" + key + "']:radio, [name='" + key + "']:checkbox");
                    if(eles.length === 0) {
                        eles = opts.context.find("#" + key);
                    }

                    if(eles.length > 0) {
                        // remove validator's dregs for rebind
                        eles.removeClass("validate_false__");
                        eles.instance("alert", function() {
                            this.remove();
                        }).removeData("alert__");

                        // rebind for data sync and validate, format, etc. realted events bind
                        if(jQuery(eles.get(0)).events("select", "dataSync.form") === undefined) {
                            vals[jQuery(eles.get(0)).attr("id")] = null;
                            self.bind(undefined, undefined, key);
                        }

                        // select value
                        eles.vals(val);

                        if(notify !== false) {
                            // dataSync & add data changed flag
                            jQuery(eles.get(0)).trigger("select.form.dataSync");
                        } else {
                            // add data changed flag
                            jQuery(eles.get(0)).addClass("data_changed__");
                        }
                    }
                }

                // empty variables
                eles = ele = val = tagName = type = undefined;
            } else {
                // put value
                if(opts.data[opts.row][key] !== val) {
                    opts.data[opts.row][key] = val;

                    // change row status
                    if (opts.data[opts.row].rowStatus !== "insert" && opts.data[opts.row].rowStatus !== "delete") {
                        opts.data[opts.row].rowStatus = "update";
                    }

                    // dataSync
                    DataSync.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, key);
                }
            }

            // add data changed flag
            if(opts.data[opts.row].rowStatus !== "insert"
                && opts.data[opts.row].rowStatus !== "delete"
                && !opts.context.hasClass("row_data_changed__")) {
                opts.context.addClass("row_data_changed__");
            }

            if(opts.onBindValue !== null) {
                const filteredVal = opts.onBindValue.call(self, ele, vals[key], "val");
                if(filteredVal !== undefined) {
                    vals[key] = filteredVal;
                }
            }

            return this;
        };

        update(row, key) {
            const opts = this.options;

            opts.state = "update"

            if (key === undefined) {
                this.bind(row, opts.state);
            } else {
                if(row === this.row()) {
                    this.val(key, opts.data[row][key], false);
                    let changedEle = opts.context.find("#" + key + ":not(:radio, :checkbox)");
                    if(changedEle.length === 0) {
                        changedEle = opts.context.find("[name='" + key + "']").filter(":radio, :checkbox");
                    }
                    if(changedEle.length === 0) {
                        changedEle = opts.context.find("#" + key).filter(":radio, :checkbox");
                    }
                    ElementUtils.dataChanged(changedEle);
                }
            }
            return this;
        };

    }

    // List