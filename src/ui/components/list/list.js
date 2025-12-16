/**
 * Natural-JS UI List Component
 * Full version from original natural.ui.js lines 4276-4937
 */

import { error as createError } from '../../../core/helpers/logger.js';
import { type as getType, isNumeric } from '../../../core/helpers/type-checker.js';
import { Context } from '../../../architecture/context/context.js';
import { DataSync } from '../../../data/sync/data-sync.js';
import { Formatter } from '../../../data/formatter/formatter.js';
import { Validator } from '../../../data/validator/validator.js';
import { JSONUtils } from '../../../core/utils/json.js';
import { MessageUtils } from '../../../core/utils/message.js';
import { Iteration } from '../../shared/iteration.js';
import { UIUtils } from '../../shared/utils.js';
import { Scroll } from '../../shared/scroll.js';
import { GC } from '../../../core/gc/garbage-collector.js';

// Import N at runtime to avoid circular dependency
const N = () => window.N;

export class List {

        constructor(data, opts) {
            this.options = {
                data : getType(data) === "array" ? N()(data) : data,
                row : -1, // selected row index
                beforeRow : -1, // before selected row index
                context : null,
                height : 0,
                validate : true,
                html : false,
                addTop : true,
                addSelect : false,
                vResizable : false,
                windowScrollLock : true,
                select : false,
                unselect : true,
                multiselect : false,
                checkAll : null, // selector
                checkAllTarget : null, // selector
                checkSingleTarget : null,
                hover : false,
                revert : false,
                createRowDelay : 1,
                scrollPaging : {
                    idx : 0,
                    size : 100
                },
                fRules : null,
                vRules : null,
                appendScroll : true,
                addScroll : true,
                selectScroll : true,
                checkScroll : true,
                validateScroll : true,
                cache : true,
                tpBind : false,
                rowHandlerBeforeBind : null,
                rowHandler : null,
                onBeforeSelect : null,
                onSelect : null,
                onBind : null
            };

            try {
                jQuery.extend(true, this.options, Context.attr("ui").list);
            } catch (e) {
                throw createError("List", e);
            }

            if (isPlainObject(opts)) {
                // Wraps the global event options in Context and event options for this component.
                UIUtils.wrapHandler(opts, "list", "onBeforeSelect");
                UIUtils.wrapHandler(opts, "list", "onSelect");
                UIUtils.wrapHandler(opts, "list", "onBind");

                //convert data to wrapped set
                opts.data = getType(opts.data) === "array" ? N()(opts.data) : opts.data;

                jQuery.extend(true, this.options, opts);

                //for scroll paging limit
                this.options.scrollPaging.limit = this.options.scrollPaging.size;

                if(getType(this.options.context) === "string") {
                    this.options.context = N()(this.options.context);
                }
            } else {
                this.options.context = N()(opts);
            }

            // If the addTop option is set to false, the setting values ​​of scrollPaging.size and createRowDelay options are forced to 0.
            if(!this.options.addTop) {
                this.options.scrollPaging.size = 0;
                this.options.createRowDelay = 0;
            }

            // for bind "append"
            this.options.scrollPaging.defSize = this.options.scrollPaging.size;

            // set li template
            this.tempRowEle = this.options.context.find("> li").clone(true, true);

            // set style class name to context element
            this.options.context.addClass("list__");
            // set style class name to context element for hover option
            if(this.options.hover) {
                this.options.context.addClass("list_hover__");
            }
            if(this.options.select || this.options.multiselect) {
                Iteration.select.call(this, "list");
            }

            // Create scroll
            if(this.options.height > 0) {
                List.createScroll.call(this);
            }

            this.contextEle = this.options.context;
            if(this.options.height > 0) {
                this.contextEle = this.options.context.closest("div.context_wrap__ > .list__");
            }

            // set function for check all checkbox in list
            if(this.options.checkAll !== null && this.options.checkAllTarget !== null) {
                Iteration.checkAll.call(this, "list");
            } else {
                if(this.options.checkSingleTarget !== null) {
                    // set function for check single checkbox in list
                    Iteration.checkSingle.call(this, "list");
                }
            }

            // set this instance to context element
            this.options.context.instance("list", this);

            // register this to DataSync for realtime data synchronization
            DataSync.instance(this, true);

            return this;
        };

        static createScroll = function() {
            const opts = this.options;

            opts.context.css({
                "margin" : "0"
            });

            //Create list body
            const contextWrapEle = opts.context.wrap('<div class="context_wrap__"/>').parent().css({
                "height" : String(opts.height) + "px",
                "overflow-y" : "scroll",
                "margin-left" : "-1px"
            });

            // for IE
            if(BrowserUtils.is("ie")) {
                contextWrapEle.css("overflow-x", "hidden");
            }

            if(opts.windowScrollLock) {
                EventUtils.windowScrollLock(contextWrapEle);
            }

            // Scroll paging
            const self = this;
            const defSPSize = opts.scrollPaging.limit;
            let rowEleLength;
            Scroll.paging.call(self, contextWrapEle, defSPSize, rowEleLength, "> li", "list.bind");

            // Vertical height resizing
            if(opts.vResizable) {
                List.vResize.call(this, contextWrapEle);
            }
        };

        static vResize = function(contextWrapEle) {
            const pressed = false;
            const vResizable = N()('<div class="v_resizable__"></div>').css({
                "text-align": "center",
                "cursor": "n-resize",
                "margin-bottom": contextWrapEle.css("margin-bottom")
            });
            contextWrapEle.css("margin-bottom", "0");

            let currHeight, contextWrapOffset;
            const eventNameSpace = ".list.vResize";
            Draggable.events.call(vResizable, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) { // start
                contextWrapOffset = contextWrapEle.offset();
            }, function(e, tabContainerEle_, pageX, pageY) { // move
                currHeight = (pageY - contextWrapOffset.top) + "px";
                contextWrapEle.css({
                    "height" : currHeight,
                    "max-height" : currHeight
                });
            });

            contextWrapEle.after(vResizable);
        };

        data(rowStatus) { // key name : argument1, argument2... argumentN
            const opts = this.options;

            if(rowStatus === undefined) {
                return opts.data.get();
            } else if(rowStatus === false) {
                return opts.data;
            } else if(rowStatus === "modified") {
                return opts.data.datafilter(function(data) {
                    return data.rowStatus !== undefined;
                }).get();
            } else if(rowStatus === "selected") {
                if(opts.select || opts.multiselect) {
                    const retData = [];

                    // clone arguments
                    const args = Array.prototype.slice.call(arguments, 0);

                    const rowEles = this.contextEle.find(">li.form__");
                    rowEles.filter(".list_selected__").each(function() {
                        const thisEle = N()(this);
                        if(arguments.length > 1) {
                            args[0] = opts.data[rowEles.index(this)];
                            retData.push(JSONUtils.mapFromKeys.apply(JSONUtils, args));
                        } else {
                            retData.push(opts.data[rowEles.index(this)]);
                        }
                    });
                    return retData;
                }
            } else if(rowStatus === "checked") {
                const retData = [];

                // clone arguments
                const args = Array.prototype.slice.call(arguments, 0);

                const rowEles = this.contextEle.find(">li.form__");
                rowEles.find(opts.checkAllTarget||opts.checkSingleTarget).filter(":checked").each(function() {
                    const thisEle = N()(this);
                    if(arguments.length > 1) {
                        args[0] = opts.data[rowEles.index(thisEle.closest("li.form__"))];
                        retData.push(JSONUtils.mapFromKeys.apply(JSONUtils, args));
                    } else {
                        retData.push(opts.data[rowEles.index(thisEle.closest("li.form__"))]);
                    }
                });
                return retData;
            } else {
                if(arguments.length > 1) {
                    const args = Array.prototype.slice.call(arguments, 0);

                    return opts.data.datafilter(function(data) {
                        return data.rowStatus === rowStatus;
                    }).map(function() {
                        args[0] = this;
                        return JSONUtils.mapFromKeys.apply(JSONUtils, args);
                    }).get();
                } else {
                    return opts.data.datafilter(function(data) {
                        return data.rowStatus === rowStatus;
                    }).get();
                }
            }
        };

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        contextBodyTemplate(sel) {
            return sel !== undefined ? this.tempRowEle.find(sel) : this.tempRowEle;
        };

        select(row, isAppend) {
            const opts = this.options;
            if(!opts.select && !opts.multiselect) {
                warn("[List.select]The \"select\" or \"multiselect\" option is disabled. To use this method, set the value of the \"select\" or \"multiselect\" option to true.");
                return false;
            }
            if(row === undefined) {
                const rowEles = this.contextEle.find(">li.form__");
                return rowEles.filter(".list_selected__").map(function () {
                    return rowEles.index(this);
                }).get();
            } else {
                if(getType(row) !== "array") {
                    row = [row];
                }

                const self = this;
                let selRowEle;

                if(!isAppend) {
                    self.contextEle.find(">li.list_selected__").removeClass("list_selected__");
                }
                N()(row).each(function() {
                    selRowEle = self.contextEle.find(">li" + (self.options.data.length > 0 ? ".form__" : "") +":eq(" + String(this) + ")");
                    if(selRowEle.hasClass("list_selected__")) {
                        selRowEle.removeClass("list_selected__");
                    }
                    selRowEle.trigger("click.list");
                });

                if(opts.selectScroll) {
                    let scrollTop = (row[row.length - 1] * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
                    if(scrollTop < 0) {
                        scrollTop = 0;
                    }
                    opts.context.parent(".context_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing');
                }

                return this;
            }
        };

        check(row, isAppend) {
            const opts = this.options;
            if(row === undefined) {
                const rowEles = this.contextEle.find(">li");
                return rowEles.find(opts.checkAllTarget || opts.checkSingleTarget).filter(":checked").map(function () {
                    return rowEles.index(N()(this).closest("li.form__"));
                }).get();
            } else {
                if(getType(row) !== "array") {
                    row = [row];
                }

                const self = this;
                let checkboxEle;
                if(!isAppend) {
                    self.contextEle.find(">li").find((opts.checkAllTarget||opts.checkSingleTarget) + ":checked").prop("checked", false);
                }
                N()(row).each(function() {
                    checkboxEle = self.contextEle.find(">li").find(opts.checkAllTarget||opts.checkSingleTarget).eq(this);
                    if(checkboxEle.is(":checked")) {
                        checkboxEle.prop("checked", false);
                    }
                    checkboxEle.trigger("click.list");
                });

                if(opts.checkScroll) {
                    const selRowEle = checkboxEle.closest("li.form__");
                    let scrollTop = (row[row.length - 1] * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
                    if(scrollTop < 0) {
                        scrollTop = 0;
                    }
                    opts.context.parent(".context_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing');
                }

                return this;
            }
        };

        /**
         * callType arguments is call type about scrollPaging(internal) or data filter(internal) or data append(external)
         * callType : "append" | "list.bind" | "list.update"
         */
        bind(data, callType) {
            const opts = this.options;

            if(!opts.isBinding) {
                if(opts.data && data && callType === "append") {
                    opts.scrollPaging.size = 0;
                    // Merge data to binded data;
                    opts.scrollPaging.idx = opts.data.length - 1;
                    jQuery.merge(opts.data, data);
                } else {
                    opts.scrollPaging.size = opts.scrollPaging.defSize;
                    // rebind new data
                    if(data) {
                        opts.data = getType(data) === "array" ? N()(data) : data;
                    }
                }

                if(opts.checkAll !== null) {
                    N()(opts.checkAll).prop("checked", false);
                }
                if (opts.data.length > 0 || (callType === "append" && data && data.length > 0)) {
                    //clear li visual effect
                    opts.context.find(">li").clearQueue().stop();

                    if(callType !== "list.bind") {
                        if(callType === "append" && data.length > 0) {
                            opts.scrollPaging.idx = opts.data.length - data.length;
                        } else {
                            opts.scrollPaging.idx = 0;
                        }
                    }

                    if(opts.scrollPaging.idx === 0) {
                        //remove lis in list body area
                        if(callType === "append" && data.length > 0) {
                            opts.context.find(">li.empty__").remove();
                        } else {
                            opts.context.find(">li").remove();
                        }
                    }

                    const i = opts.scrollPaging.idx;
                    let limit;
                    if(opts.height === 0 || opts.scrollPaging.size === 0 || (callType === "append" && data.length > 0 && data.length <= opts.scrollPaging.size)) {
                        limit = opts.data.length;
                    } else {
                        limit = Math.min(opts.scrollPaging.limit, opts.data.length);
                    }

                    const delay = opts.createRowDelay;
                    let lastIdx;

                    Iteration.render.call(this, i, limit, delay, lastIdx, callType);

                    if(opts.appendScroll && callType === "append") {
                        opts.context.parent(".context_wrap__").stop().animate({
                            "scrollTop" : opts.context.parent(".context_wrap__").prop("scrollHeight")
                        }, 300, 'swing');
                    }
                } else {
                    //remove lis in list body area
                    opts.context.find(">li").remove();
                    opts.context.append('<li class="empty__">' +
                        MessageUtils.get(opts.message, "empty") + '</li>');

                    if(opts.onBind !== null && callType !== "list.update") {
                        opts.onBind.call(this, opts.context, opts.data, true, true);
                    }
                }
            } else {
                const self = this;
                const args = arguments;
                opts.context.queue("bind", function() {
                    self.bind.apply(self, args);
                });
            }
            return this;
        };

        add(data, row) {
            const opts = this.options;
            if (opts.context.find(">li.empty__").length > 0) {
                opts.context.find(">li").remove();
            }
            const tempRowEleClone = this.tempRowEle.clone(true, true);

            if(isNumeric(data)) {
                row = data;
                data = undefined;
            }

            if(row > opts.data.length || row < 0) {
                row = undefined;
            }

            if(row === undefined) {
                if(opts.addTop) {
                    opts.context.prepend(tempRowEleClone);
                } else {
                    opts.context.append(tempRowEleClone);
                }
            } else {
                let selRowEle = opts.context.find(">li:eq(" + row + ")");
                let scrollTop;

                if(row === 0) {
                    opts.context.prepend(tempRowEleClone);
                } else if(row === opts.context.find(">li").length) {
                    selRowEle = opts.context.find(">li:eq(" + (row - 1) + ")");
                } else {
                    opts.context.find(">li:eq(" + row + ")").before(tempRowEleClone);
                }

                if(opts.addScroll) {
                    scrollTop = (row * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
                    if(scrollTop < 0) {
                        scrollTop = 0;
                    }
                    opts.context.parent(".context_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing', function() {
                        if(opts.addSelect) {
                            N()(this).find(">ul>li:eq(" + row + ")").trigger("click.list");
                        }
                    });
                } else {
                    if(opts.addSelect) {
                        setTimeout(function() {
                            opts.context.parent(".context_wrap__").find(">ul>li:eq(" + row + ")").trigger("click.list");
                        }, 0);
                    }
                }
            }

            // for new row data bind, use Form
            const form = opts.data.form({
                context : tempRowEleClone,
                html: opts.html,
                validate : opts.validate,
                extObj : this,
                extRow : row === undefined ? (opts.addTop ? 0 : opts.data.length) : row,
                addTop : opts.addTop,
                revert : opts.revert,
                tpBind : opts.tpBind
            })

            form.add(data, row);

            if(opts.rowHandler !== null) {
                opts.rowHandler.call(this, form.options.extRow, tempRowEleClone, form.data(true)[0]);
            }

            // unselect rows
            opts.context.find(">li").removeClass("list_selected__");

            // scroll to created row element
            if(row === undefined) {
                opts.context.parent(".context_wrap__").stop().animate({
                    "scrollTop" : (opts.addTop ? 0 : opts.context.parent(".context_wrap__").prop("scrollHeight"))
                }, 300, 'swing', function() {
                    if(opts.addSelect) {
                        N()(this).find("> ul > li:" + (opts.addTop ? "first" : "last")).trigger("click.list");
                    }
                });
            }

            return this;
        };

        remove(row) {
            const opts = this.options;
            if(row !== undefined) {
                if(getType(row) !== "array") {
                    row = [row];
                }
                N()(row.sort().reverse()).each(function(i, row) {
                    if (opts.data[this] === undefined) {
                        throw createError("[List.prototype.remove]Row index is out of range");
                    }
                    if (opts.data[this].rowStatus === "insert") {
                        opts.data.splice(this, 1);
                        opts.context.find(">li:eq(" + row + ")").remove();

                        // for scroll paging
                        // just +1 is inappropriate on android 4.4.2 webkit
                        const rowEleLength = opts.context.find(">li").length;
                        const pagingSize = opts.scrollPaging.size;
                        const rest = rowEleLength % pagingSize;
                        opts.scrollPaging.idx = (rowEleLength / pagingSize) * pagingSize - pagingSize + rest;
                    } else {
                        opts.data[this].rowStatus = "delete";
                        opts.context.find(">li:eq(" + row + ")").addClass("row_data_deleted__");
                    }
                });
            }

            DataSync.instance(this).notify();
            return this;
        };

        revert(row) {
            const opts = this.options;
            if(!opts.revert) {
                throw createError("[Form.prototype.revert]Can not revert. Form's revert option value is false");
            }

            const self = this;

            if(row !== undefined) {
                if(getType(row) !== "array") {
                    row = [row];
                }
                N()(row).each(function() {
                    const i = this;
                    const context = opts.context.find(">li:eq(" + String(this) + ")");
                    const form = context.instance("form");
                    if(opts.rowHandlerBeforeBind !== null) {
                        opts.rowHandlerBeforeBind.call(self, i, context, form.options.revertData);
                    }

                    form.revert();

                    if(opts.rowHandler !== null) {
                        opts.rowHandler.call(self, i, context, opts.data[i]);
                    }
                });
            } else {
                opts.context.find("li").instance("form", function() {
                    if(this.options !== undefined && (this.options.data[0].rowStatus === "update" || this.options.data[0].rowStatus === "insert")) {
                        const i = this.options.extRow;
                        if(opts.rowHandlerBeforeBind !== null) {
                            opts.rowHandlerBeforeBind.call(self, i, this.context(), this.options.revertData);
                        }

                        this.revert();

                        if(opts.rowHandler !== null) {
                            opts.rowHandler.call(self, i, this.context(), opts.data[i]);
                        }
                    }
                });
            }
            return this;
        };

        validate(row) {
            const opts = this.options;
            let valiRslt = true;
            if(row !== undefined) {
                valiRslt = opts.context.find(">li:eq(" + String(row) + ")").instance("form").validate();
            } else {
                let rowStatus;
                opts.context.find(">li").instance("form", function(i) {
                    if(this.options !== undefined && this.options.data.length > 0) {
                        rowStatus = this.options.data[0].rowStatus;
                        // Select the rows that data was changed
                        if(this.context(".validate_false__").length > 0 || rowStatus === "update" || rowStatus === "insert") {
                            if(!this.validate()) {
                                valiRslt = false;
                            }
                        }
                    }
                });
            }

            if(!valiRslt && opts.validateScroll) {
                const valiLastTbody = opts.context.find(".validate_false__:last").closest("li.form__");
                opts.context.parent(".context_wrap__").stop().animate({
                    "scrollTop" : opts.context.parent(".context_wrap__").scrollTop() + valiLastTbody.position().top - opts.height + (valiLastTbody.outerHeight() * 2)
                }, 300, 'swing');
            }

            return valiRslt;
        };

        val(row, key, val) {
            if(val === undefined) {
                return this.options.data[row][key];
            }
            const inst = this.options.context.find(">.form__:eq(" + String(row) + ")").instance("form");
            if(inst) {
                inst.val(key, val);
            } else {
                if(this.options.data[row]) {
                    this.options.data[row][key] = val;
                } else {
                    throw createError("[List.prototype.val]There is no row data that is " + row + " index");
                }
            }
            return this;
        };

        move(fromRow, toRow) {
            Iteration.move.call(this, fromRow, toRow, "list");

            return this;
        };

        copy(fromRow, toRow) {
            Iteration.copy.call(this, fromRow, toRow, "list");

            return this;
        };

        update(row, key) {
            if(row !== undefined) {
                if(key !== undefined) {
                    this.options.context.find(">li:eq(" + String(row) + ")").instance("form").update(0, key);
                } else if(this.options.data[row]._isRevert !== true && this.options.data[row].rowStatus === "insert") {
                    if(this.options.data[row].rowStatus === "insert") {
                        this.bind(undefined, "list.update");
                    } else {
                        this.add(this.options.data[row]);
                    }
                } else {
                    this.options.context.find(">li:eq(" + String(row) + ")").instance("form").update(0);
                }
            } else {
                this.bind(undefined, "list.update");
            }
            return this;
        };

    }

    // Grid


export const list = (data, options) => new List(data, options);
export default List;
