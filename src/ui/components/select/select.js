/**
 * Natural-JS UI Select Component
 * Full version from original natural.ui.js lines 3139-4275
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

export class Select {

        constructor(data, opts) {
            this.options = {
                data : getType(data) === "array" ? jQuery(data) : data,
                context : null,
                key : null,
                val : null,
                append : true,
                direction : "h", // direction : h(orizontal), v(ertical)
                type : 0, // type : 1: select, 2: select[multiple='multiple'], 3: radio, 4: checkbox
                template : null
            };

            try {
                jQuery.extend(this.options, Context.attr("ui").select);
            } catch (e) {
                throw createError("Select", e);
            }
            jQuery.extend(this.options, ElementUtils.toOpts(this.options.context));

            if (isPlainObject(opts)) {
                jQuery.extend(this.options, opts);
                if(getType(this.options.data) === "array") {
                    this.options.data = jQuery(opts.data);
                }
                this.options.context = jQuery(opts.context);
            } else {
                this.options.context = jQuery(opts);
            }
            this.options.template = this.options.context;

            Select.wrapEle.call(this);

            // set style class name to context element
            this.options.context.addClass("select__");

            // set this instance to context element
            this.options.context.instance("select", this);

            return this;
        };

        static wrapEle = function() {
            const opts = this.options;
            if (opts.context.is("select") && opts.context.attr("multiple") !== "multiple") {
                this.options.context.find("option").addClass("select_default__");
                opts.type = 1;
            } else if (opts.context.is("select") && opts.context.attr("multiple") === "multiple") {
                this.options.context.find("option").addClass("select_default__");
                opts.type = 2;
            } else if (opts.context.is("input:radio")) {
                opts.type = 3;
            } else if (opts.context.is("input:checkbox")) {
                opts.type = 4;
            }
        };

        data(selFlag) {
            const opts = this.options;
            if(selFlag !== undefined && selFlag === true) {
                const selectEles = opts.type === 1 || opts.type === 2 ? opts.context.find("option") : opts.context.closest(".select_input_container__").children("label");
                const defSelCnt = selectEles.filter(".select_default__").length;
                let idxs = this.index();
                if(getType(idxs) !== "array") {
                    idxs = [idxs];
                }
                return jQuery(idxs).map(function() {
                    if(this - defSelCnt > -1) {
                        return opts.data.get(this - defSelCnt);
                    }
                }).get();
            } else if(selFlag !== undefined && selFlag === false) {
                return opts.data;
            } else {
                return opts.data.get();
            }
        };

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        bind(data) {
            const opts = this.options;

            //to rebind new data
            if(data != null) {
                opts.data = getType(data) === "array" ? jQuery(data) : data;
            }

            if(opts.type === 1 || opts.type === 2) {
                const defaultSelectEle = opts.template.find(".select_default__").clone(true);
                opts.context.addClass("select_template__").empty();
                if(opts.append) {
                    opts.context.append(defaultSelectEle);
                }
                opts.data.each(function(i, rowData) {
                    opts.context.append("<option value='" + (rowData[opts.val] === null ? "" : rowData[opts.val]) + "'>" + rowData[opts.key] + "</option>");
                });
            } else if(opts.type === 3 || opts.type === 4) {
                if(opts.context.filter(".select_template__").length === 0) {
                    const id = opts.context.attr("id")
                    let container = jQuery('<form class="select_input_container__" style="display: inline;" />');
                    if (opts.direction === "h") {
                        container.addClass("select_input_horizontal__");
                    } else if (opts.direction === "v") {
                        container.addClass("select_input_vertical__");
                    }
                    let labelEle;
                    let labelTextEle
                    opts.data.each(function(i, rowData) {
                        labelEle = jQuery('<label class="select_input_label__ ' + id + "_" + String(i) + '__"></label>');
                        labelTextEle = jQuery('<span>' + rowData[opts.key] + '</span>');
                        if(i === 0) {
                            opts.template.attr("name", id).attr("value", rowData[opts.val]).addClass("select_input__ select_template__")
                                .wrap(labelEle)
                                .parent().append(labelTextEle).wrap(container);
                            container = opts.template.closest(".select_input_container__");
                        } else {
                            labelEle.append(opts.template.clone(true).attr("name", id).attr("value", rowData[opts.val]).removeAttr("id").removeClass("select_template__"));
                            labelEle.append(labelTextEle);
                            container.append(labelEle);
                        }
                    });
                    labelEle = undefined;
                    labelTextEle = undefined;
                }
            }
            return this;
        };

        index(idx) {
            const opts = this.options;
            const self = this;

            const selectSiblingEles = opts.type === 1 || opts.type === 2 ? opts.context.find("option") : opts.context.closest(".select_input_container__").children("label");
            const selectEles = opts.type === 1 || opts.type === 2 ? opts.context : selectSiblingEles.find(":radio, :checkbox");
            if(idx === undefined) {
                const rslt = selectEles.vals();
                const spltSepa = Context.attr("core").spltSepa;
                const rsltStr = spltSepa + (getType(rslt) === "array" ? rslt.join(spltSepa) : String(rslt)) + spltSepa;
                const rsltArr = [];
                (opts.type === 1 || opts.type === 2 ? selectSiblingEles : selectEles).each(function(i) {
                    if(rsltStr.indexOf(spltSepa + this.value + spltSepa) > -1) {
                        rsltArr.push(i);
                    }
                });
                return rsltArr.length > 0 ? rsltArr.length === 1 ? rsltArr[0] : rsltArr : -1;
            }

            const vals = [];
            jQuery(getType(idx) === "number" ? [idx] : idx).each(function() {
                vals.push((opts.type === 1 || opts.type === 2 ? selectSiblingEles : selectEles).get(this).value);
            });
            selectEles.vals(vals);

            return this;
        };

        val(val) {
            const opts = this.options;

            if(!NC.isEmptyObject(opts.data)) {
                const rtnVal = jQuery(opts.type === 3 || opts.type === 4
                    ? this.options.context.closest(".select_input_container__").find(":input") : this.options.context).vals(val);
                if(val === undefined) {
                    return rtnVal;
                }
            } else {
                warn("[Select.prototype.val]There is no data bound to the Select component.");
            }

            return this;
        };

        remove(val) {
            const opts = this.options;
            if(val !== undefined) {
                const selectEles = opts.type === 1 || opts.type === 2 ? opts.context.find("option") : opts.context.closest(".select_input_container__").children("label");

                const selOptEle = opts.type === 1 || opts.type === 2 ? selectEles.filter("[value='" + val + "']") : selectEles.find("input[value='" + val + "']").parent("label");
                const idx = selOptEle.index();
                const defSelCnt = selectEles.filter(".select_default__").length;

                //remove element
                selOptEle.remove();

                // remove data
                if(idx - defSelCnt > -1) {
                    opts.data.splice(idx - defSelCnt, 1);
                }
            }
            return this;
        };

        reset(selFlag) {
            const opts = this.options;
            if(opts.type === 1 || opts.type === 2) {
                if(selFlag !== undefined && selFlag === true) {
                    opts.context.get(0).selectedIndex = 0;
                } else {
                    opts.context.val(opts.context.prop("defaultSelected"));
                }
            } else if(opts.type === 3 || opts.type === 4) {
                opts.context.prop("checked", false);
            }
            return this;
        };

    }

    // Form

    // List


export const select = (data, options) => new Select(data, options);
export default Select;
