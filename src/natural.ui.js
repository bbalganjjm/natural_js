/*!
 * Natural-UI v1.0.0
 *
 * Released under the LGPL v2.1 license
 * Date: 2014-09-26T11:11Z
 *
 * Copyright 2014 Goldman Kim(bbalganjjm@gmail.com)
 */

import { N } from "./natural.js.js";
import { NC } from "./natural.core.js";
import { NA } from "./natural.architecture.js";
import { ND } from "./natural.data.js";

export class NU {

    alert(msg, vars) {
        return new NU.alert(this, msg, vars);
    };

    button(opts) {
        if(this.is("input[type='button'], button, a")) {
            return this.each(function() {
                return new NU.button(N(this), opts);
            });
        }
    };

    datepicker(opts) {
        return new NU.datepicker(this, opts);
    };

    popup(opts) {
        return new NU.popup(this, opts);
    };

    tab(opts) {
        return new NU.tab(this, opts);
    };

    select(opts) {
        return new NU.select(this, opts);
    };

    form(opts) {
        return new NU.form(this, opts);
    };

    list(opts) {
        return new NU.list(this, opts);
    };
    grid(opts) {
        return new NU.grid(this, opts);
    };

    pagination(opts) {
        return new NU.pagination(this, opts);
    };

    tree(opts) {
        return new NU.tree(this, opts);
    };

    // UI
    static ui = class {

        static iteration = {
            render : function(i, limit, delay, lastIdx, callType) {
                const opts = this.options;
                const self = this;

                // clone li for create new row
                const tempRowEleClone = self.tempRowEle.clone(true, true);
                opts.context.append(tempRowEleClone);

                // for row data bind, use NU.form
                const form = N(opts.data[i]).form({
                    context : tempRowEleClone,
                    html: opts.html,
                    validate : opts.validate,
                    extObj : self,
                    extRow : i,
                    revert : opts.revert,
                    unbind : false,
                    cache : opts.cache
                });

                if(opts.rowHandlerBeforeBind !== null) {
                    opts.rowHandlerBeforeBind.call(self, i, tempRowEleClone, opts.data[i]);
                }

                form.bind();

                if(opts.rowHandler !== null) {
                    opts.rowHandler.call(self, i, tempRowEleClone, opts.data[i]);
                }

                if(opts.fixedcol > 0) {
                    tempRowEleClone.find(".grid_body_fixed__").outerHeight(tempRowEleClone.height() + opts.misc.fixedcolBodyBindHeight);
                }

                if(self.rowSpanIds !== undefined) {
                    self.rowSpanIds.each(function() {
                        NU.grid.rowSpan.call(self, i, tempRowEleClone, opts.context.find("tbody:eq(" + (i-1) + ")"), opts.data[i], opts.data[i-1], String(this));
                    });
                }

                i++;
                if(opts.height === 0 || opts.scrollPaging.size === 0 || (callType === "append" && opts.data.length > 0 && opts.data.length <= opts.scrollPaging.size)) {
                    lastIdx = opts.data.length - 1;
                } else {
                    lastIdx = opts.scrollPaging.idx + (limit - 1);
                }

                // -4(5) is visualization rendering buffer;
                if(i-4 === lastIdx) {
                    delay = 0;
                } else {
                    delay = opts.createRowDelay;
                }

                if(i <= lastIdx) {
                    if (opts.data.length > 0) {
                        opts.isBinding = true;
                        if(delay > 0) {
                            setTimeout(function() {
                                NU.ui.iteration.render.call(self, i, limit, delay, lastIdx, callType);
                            }, delay);
                        } else {
                            NU.ui.iteration.render.call(self, i, limit, delay, lastIdx, callType);
                        }
                    }
                } else if(i === lastIdx + 1) {
                    if(opts.onBind !== null && !NC.string.endsWith(NC.string.trimToEmpty(callType), ".update")) {
                        opts.onBind.call(self, opts.context, opts.data, i === opts.scrollPaging.size || opts.data.length <= opts.scrollPaging.size, i === opts.data.length);
                    }
                    opts.scrollPaging.limit = opts.scrollPaging.size === 0 ? opts.data.length : opts.scrollPaging.size;

                    opts.isBinding = false;
                    opts.context.dequeue("bind");
                }
            },
            select : function(compNm) {
                const opts = this.options;
                const self = this;

                const lineTag = compNm === "grid" ? "tbody" : "li";

                // set style class name to context element for select, multiselect options
                opts.context.addClass(compNm + "_select__");

                // bind tbody click event for select, multiselect options
                opts.context.on("click." + compNm, ">" + lineTag, function(e) {
                    const thisEle = N(this);
                    let retFlag;
                    let isSelected;

                    if(!N(e.target).is(opts.checkAllTarget) && !N(e.target).is(opts.checkSingleTarget)) {
                        // save the selected row index
                        if(thisEle.hasClass(compNm + "_selected__")) {
                            opts.row = -1;
                            isSelected = false;
                        } else {
                            opts.row = opts.context.find(">" + lineTag).index(thisEle);
                            isSelected = true;
                        }

                        // apply unselect option
                        if(!opts.multiselect && !opts.unselect) {
                            opts.row = opts.context.find(">" + lineTag).index(thisEle);
                            isSelected = true;
                        }

                        if(opts.onBeforeSelect !== null) {
                            retFlag = opts.onBeforeSelect.call(self, opts.row, thisEle, opts.data, opts.beforeRow, e);
                        }

                        if(retFlag === undefined || retFlag === true) {
                            if(isSelected) {
                                if(!opts.multiselect) {
                                    opts.context.find("> " + lineTag + ":eq(" + opts.beforeRow + ")").removeClass(compNm + "_selected__");
                                }
                                thisEle.addClass(compNm + "_selected__");
                                opts.beforeRow = opts.row;
                            } else {
                                thisEle.removeClass(compNm + "_selected__");
                            }
                        }

                        if(opts.onSelect !== null) {
                            opts.onSelect.call(self, opts.row, thisEle, opts.data, opts.beforeRow, e);
                        }
                    }
                });
            },
            checkAll : function(compNm) {
                const opts = this.options;
                const contextEle = this.contextEle;

                const checkAll = compNm === "grid" ? this.thead.find(opts.checkAll) : N(opts.checkAll);
                const cellTag = compNm === "grid" ? "tbody > tr > td" : "li";
                checkAll.on("click." + compNm + ".checkAll", function() {
                    if(!N(this).prop("checked")) {
                        contextEle.find(cellTag + " " + opts.checkAllTarget + ":checked").removeProp("checked");
                    } else {
                        contextEle.find(cellTag + " " + opts.checkAllTarget + ":not(':checked')").prop("checked", true);
                    }
                });
                contextEle.on("click." + compNm + ".checkAllTarget", cellTag + " " + opts.checkAllTarget, function() {
                    if(contextEle.find(cellTag + " " + opts.checkAllTarget).length
                        === contextEle.find(cellTag + " " + opts.checkAllTarget + ":checked").length) {
                        checkAll.prop("checked", true);
                    } else {
                        checkAll.removeProp("checked");
                    }
                });
            },
            checkSingle : function(compNm) {
                const opts = this.options;
                const contextEle = this.contextEle;

                const cellTag = compNm === "grid" ? "tbody > tr > td" : "li";
                contextEle.on("click.grid.checkSingleTarget", cellTag + " " + opts.checkSingleTarget, function() {
                    contextEle.find(cellTag + " " + opts.checkSingleTarget).not(this).removeAttr("checked");
                });
            },
            move : function(fromRow, toRow, compNm) {
                if(fromRow !== toRow) {
                    const opts = this.options;

                    let insertPos;
                    if(toRow > opts.data.length - 1) {
                        insertPos = "after";
                        toRow = opts.data.length - 1;
                        opts.data.push(opts.data.splice(fromRow, 1)[0]);
                    } else {
                        insertPos = "before";
                        opts.data.splice(fromRow < toRow ? toRow - 1 : toRow, 0, opts.data.splice(fromRow, 1)[0]);
                    }

                    const rowTag = compNm === "grid" ? "tbody" : "li";
                    if(opts.context.find(rowTag + ":eq(" + toRow + ")").length > 0) {
                        opts.context.find(rowTag + ":eq(" + toRow + ")")[insertPos](opts.context.find(rowTag + ":eq(" + fromRow + ")"));
                    } else {
                        opts.currMoveToRow = toRow;
                        opts.context.find(rowTag + ":eq(" + fromRow + ")").remove();
                    }
                }

                return this;
            },
            copy : function(fromRow, toRow, compNm) {
                if(fromRow !== toRow) {
                    const opts = this.options;

                    let insertPos;
                    if(toRow > opts.data.length - 1) {
                        insertPos = "after";
                        toRow = opts.data.length - 1;
                        opts.data.push(opts.data[fromRow]);
                    } else {
                        insertPos = "before";
                        opts.data.splice(toRow, 0, opts.data[fromRow]);
                    }

                    const rowTag = compNm === "grid" ? "tbody" : "li";
                    opts.context.find(rowTag + ":eq(" + toRow + ")")[insertPos](opts.context.find(rowTag + ":eq(" + fromRow + ")").clone(true, true));
                }

                return this;
            }
        };

        static draggable = {
            events : function(eventNameSpace, startHandler, moveHandler, endHandler) {
                const selfEle = this;

                this.on("mousedown" + eventNameSpace + " touchstart" + eventNameSpace, function(e) {
                    const se = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
                    if(e.originalEvent.touches || (e.which || e.button) === 1) {
                        let isContinue;
                        if(startHandler !== undefined) {
                            isContinue = startHandler.call(this, e, selfEle, se.pageX, se.pageY)
                        }

                        if(isContinue !== false) {
                            N(document).on("mousemove" + eventNameSpace + " touchmove" + eventNameSpace, function(e) {
                                N(document).on("dragstart" + eventNameSpace + " selectstart" + eventNameSpace, function() {
                                    return false;
                                });

                                const me = e.originalEvent.touches ? e.originalEvent.touches[0] : e;

                                if(moveHandler !== undefined) {
                                    moveHandler.call(this, e, selfEle, me.pageX, me.pageY);
                                }

                                if(!e.originalEvent.touches) {
                                    e.preventDefault();
                                }
                                e.stopImmediatePropagation();
                                e.stopPropagation();
                                if(!e.originalEvent.touches) {
                                    return false;
                                }
                            });

                            N(document).on("mouseup" + eventNameSpace + " touchend" + eventNameSpace, function(e) {
                                N(document).off("dragstart" + eventNameSpace + " selectstart" + eventNameSpace + " mousemove" + eventNameSpace + " touchmove" + eventNameSpace + " mouseup" + eventNameSpace + " touchend" + eventNameSpace);

                                if(endHandler !== undefined) {
                                    endHandler.call(this, e, selfEle)
                                }

                                if(!e.originalEvent.touches) {
                                    e.preventDefault();
                                }
                                e.stopImmediatePropagation();
                                e.stopPropagation();
                                if(!e.originalEvent.touches) {
                                    return false;
                                }
                            });
                        }
                    }

                    if(!e.originalEvent.touches) {
                        e.preventDefault();
                    }
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    if(!e.originalEvent.touches) {
                        return false;
                    }
                });
            },
            /**
             * This function is not working in less than IE 9
             */
            moveX : function(x, min, max) {
                const ele = this;
                if(min !== undefined && x < min) {
                    x = min;
                    return false;
                }
                if(max !== undefined && x > max) {
                    x = max;
                    return false;
                }

                const propNm = ["-webkit-transform", "-ms-transform", "transform"];
                N(propNm).each(function() {
                    ele.css(this, "translateX(" + x + "px)");
                });
            },
            /**
             * This function is not working in less than IE 9
             */
            moveY : function(y, min, max) {
                const ele = this;
                if(min !== undefined && y < min) {
                    y = min;
                    return false;
                }
                if(max !== undefined && y > max) {
                    y = max;
                    return false;
                }

                const propNm = ["-webkit-transform", "-ms-transform", "transform"];
                N(propNm).each(function() {
                    ele.css(this, "translateY(" + y + "px)");
                });
            }
        };

        static scroll = {
            paging : function(contextWrapEle, defSPSize, rowEleLength, rowTagName, bindOpt) {
                const opts = this.options;
                const self = this;

                contextWrapEle.on("scroll", function() {
                    if(opts.scrollPaging.size > 0 && opts.isBinding === false) {
                        const thisWrap = N(this);
                        if (Math.ceil(thisWrap.scrollTop()) >= opts.context.height() - thisWrap.height()) {
                            rowEleLength = opts.context.find(rowTagName).length;
                            if(opts.currMoveToRow > -1 && rowEleLength < opts.currMoveToRow) {
                                defSPSize -= 1;
                            }
                            if (rowEleLength >= opts.scrollPaging.idx + defSPSize) {
                                if (rowEleLength > 0 && rowEleLength <= opts.data.length) {
                                    opts.scrollPaging.idx += defSPSize;
                                }

                                if (opts.scrollPaging.idx + opts.scrollPaging.limit >= opts.data.length) {
                                    opts.scrollPaging.limit = opts.data.length - opts.scrollPaging.idx;
                                } else {
                                    opts.scrollPaging.limit = defSPSize;
                                }

                                if(opts.scrollPaging.idx < opts.data.length) {
                                    self.bind(undefined, bindOpt);
                                } else if(opts.scrollPaging.idx === opts.data.length) {
                                    opts.scrollPaging.limit = opts.scrollPaging.size === 0 ? opts.data.length : opts.scrollPaging.size;
                                }
                            }
                        }
                    }
                });
            }
        };

        static utils = {
            /**
             * Wraps component event options and global event options in NA.config.
             */
            wrapHandler : function(opts, compNm, eventNm) {
                if(NA.context.attr("ui")[compNm] && NA.context.attr("ui")[compNm][eventNm] && (opts && opts[eventNm])) {
                    const localEventHandler = opts[eventNm];
                    opts[eventNm] = function() {
                        if(eventNm === "onBeforeBindValue") {
                            const rVal = localEventHandler.apply(this, arguments);
                            return NA.context.attr("ui")[compNm][eventNm].call(this, arguments[0], rVal);
                        } else {
                            const rVal = localEventHandler.apply(this, arguments);
                            if(rVal === false) {
                                return rVal;
                            } else {
                                return NA.context.attr("ui")[compNm][eventNm].apply(this, arguments);
                            }
                        }
                    }
                }
            },
            /**
             * Determines whether this is a text input field.
             */
            isTextInput : function(tagName, type) {
                return tagName === "textarea" || type === "text" || type === "password" || type === "hidden" || type === "file"
                    // Support HTML5 Form's input types
                    || type === "number" || type === "tel" || type === "email" || type === "search" || type === "color"
                    // The date type does not support formatting, so it does not support it.
                    // || type === "date" || type === "datetime-local" || type === "month" || type === "time" || type === "week"
                    || type === "range"
                    || type === "url";
            }
        };

    };

    // Alert
    static alert = class {
        constructor(obj, msg, vars) {
            this.options = {
                obj : obj,
                context : obj,
                container : null,
                msgContext : N(),
                msgContents : null,
                msg : msg,
                vars : vars,
                html : false,
                top : undefined,
                left : undefined,
                width : 0,
                height : 0,
                isInput : false,
                isWindow : obj === window || obj.get(0) === window || obj.is("body"),
                title : obj === window || obj.get(0) === window || obj.get(0) === window.document || obj.is("body") ? undefined : obj.attr("title"),
                button : true,
                okButtonOpts : null,
                cancelButtonOpts : null,
                closeMode : "remove", // closeMode : hide - keep element, remove - remove element
                modal : true,
                onOk : null,
                onCancel : null,
                onBeforeShow : null,
                onShow : null,
                onBeforeHide : null,
                onHide : null,
                onBeforeRemove : null,
                onRemove : null,
                overlayColor : null,
                overlayClose : true,
                escClose : true,
                "confirm" : false,
                alwaysOnTop : false,
                alwaysOnTopCalcTarget : "div, span, ul, p, nav, article, section, header, footer, aside",
                dynPos : true, // dynamic positioning for massage context and message overlay
                windowScrollLock : true,
                draggable : false,
                draggableOverflowCorrection : true,
                draggableOverflowCorrectionAddValues : {
                    top : 0,
                    bottom : 0,
                    left : 0,
                    right : 0
                },
                saveMemory : false
            };

            try {
                // 1. When NA.context.attr("ui").alert.container value is undefined
                this.options.container = NA.context.attr("architecture").page.context;
                // 2. If defined the NA.context.attr("ui").alert.container value to NA.config this.options.container value is defined from NA.config's value
                jQuery.extend(true, this.options, NA.context.attr("ui").alert);

                if(NC.isString(this.options.container)) {
                    this.options.container = N(this.options.container);
                }
            } catch (e) {
                throw NC.error("NU.alert", e);
            }

            if(N(this.options.container).length === 0) {
                throw NC.error("[NU.alert]Container element is missing. please specify the correct element selector that will contain the message dialog's element. it can be defined in the \"NA.context.attr(\"ui\").alert.container\" property of \"natural.config.js\" file.");
            }

            if (N(obj).is(":input")) {
                this.options.isInput = true;
            }
            if(msg !== undefined && NC.isPlainObject(msg)) {
                // Wraps the global event options in NA.config and event options for this component.
                NU.ui.utils.wrapHandler(msg, "alert", "onOk");
                NU.ui.utils.wrapHandler(msg, "alert", "onCancel");
                NU.ui.utils.wrapHandler(msg, "alert", "onBeforeShow");
                NU.ui.utils.wrapHandler(msg, "alert", "onShow");
                NU.ui.utils.wrapHandler(msg, "alert", "onBeforeHide");
                NU.ui.utils.wrapHandler(msg, "alert", "onHide");
                NU.ui.utils.wrapHandler(msg, "alert", "onBeforeRemove");
                NU.ui.utils.wrapHandler(msg, "alert", "onRemove");
                NU.ui.utils.wrapHandler(msg, "alert", "okButtonOpts");
                NU.ui.utils.wrapHandler(msg, "alert", "cancelButtonOpts");

                jQuery.extend(true, this.options, msg);
                if(NC.isString(this.options.container)) {
                    this.options.container = N(this.options.container);
                }
                // when the title option value is undefined
                // jQuery.extend method does not extend undefined value
                if(msg.hasOwnProperty("title")) {
                    this.options.title = msg.title;
                }
            }

            if(this.options.isWindow) {
                this.options.context = N("body");
            }

            if (!this.options.isInput) {
                NU.alert.wrapEle.call(this);

                // set this instance to msgContext element
                this.options.msgContents.instance("alert", this);

                if(this.options.saveMemory) {
                    this.options.msg = null;
                    this.options.vars = null;
                }
            } else {
                NU.alert.wrapInputEle.call(this);

                // set this instance to context element
                this.options.context.instance("alert", this);
            }

            return this;
        };

        static wrapEle = function() {
            const opts = this.options;

            // set message overlay's default style
            const blockOverlayCss = {
                "display" : "none",
                "position" : opts.isWindow ? "fixed" : "absolute",
                "cursor" : "not-allowed",
                "padding" : 0
            };

            if(!opts.isWindow) {
                blockOverlayCss["border-radius"] = opts.context.css("border-radius") !== "0px" ? opts.context.css("border-radius") : "0px";
            }

            let maxZindex = 0;
            if(opts.alwaysOnTop) {
                // get maximum "z-index" value
                maxZindex = NC.element.maxZindex(N(opts.alwaysOnTopCalcTarget));
                blockOverlayCss["z-index"] = String(maxZindex + 1);
            }

            if (opts.overlayColor !== null) {
                blockOverlayCss["background-color"] = opts.overlayColor;
            }

            // create message overlay
            opts.msgContext = opts[opts.isWindow ? "container" : "context"][opts.isWindow ? "append" : "after"](N('<div class="block_overlay__" onselectstart="return false;"></div>')
                .css(blockOverlayCss))[opts.isWindow ? "find" : "siblings"](".block_overlay__:" + (opts.isWindow ? "last" : "first"));

            // set style class name to msgContext element
            opts.msgContext.addClass("alert_overlay__");

            if (opts.vars !== undefined) {
                opts.msg = NC.message.replaceMsgVars(opts.msg, opts.vars);
            }

            // set message box's default style
            const blockOverlayMsgCss = {
                "display" : "none",
                "position" : opts.isWindow ? "fixed" : "absolute"
            };

            if(opts.alwaysOnTop) {
                blockOverlayMsgCss["z-index"] = String(maxZindex + 2);
            }

            // create title bar element
            let titleBox = '';
            if(opts.title !== undefined) {
                titleBox = '<div class="msg_title_box__"><span class="msg_title__">' + opts.title + '</span><a href="#" class="msg_title_close_btn__"><span class="msg_title_close__" title="' + NC.message.get(opts.message, "close") + '"></span></a></div>';
            }

            // create button box elements
            let buttonBox = '';
            if(opts.button) {
                buttonBox = '<div class="buttonBox__">' +
                    '<button class="confirm__">' + NC.message.get(opts.message, "confirm") + '</button>' +
                    '<button class="cancel__">' + NC.message.get(opts.message, "cancel") + '</button>' +
                    '</div>';
            }

            // create message box elements
            opts.msgContents = opts.msgContext.after(
                N('<div class="block_overlay_msg__">' +
                    titleBox +
                    '<div class="msg_box__"></div>' +
                    buttonBox +
                    '</div>').css(blockOverlayMsgCss)).next(".block_overlay_msg__:last");

            // set style class name to msgContents element
            opts.msgContents.addClass("alert__ hidden__");

            // bind event to close(X) button
            const self = this;
            opts.msgContents.find(".msg_title_box__ .msg_title_close_btn__").on("click.alert touchend.alert", function(e) {
                e.preventDefault();
                if (opts.onCancel !== null) {
                    if(opts.onCancel.call(self, opts.msgContext, opts.msgContents) !== 0) {
                        self[opts.closeMode]();
                    }
                } else {
                    self[opts.closeMode]();
                }
            });

            // set message
            opts.msgContents.find(".msg_box__")[ opts.html ? "html" : "text" ](opts.msg);

            // set width
            if(typeof opts.width === "function" || opts.width > 0) {
                if(typeof opts.width === "function") {
                    opts.msgContents.find(".msg_box__").width(opts.width.call(self, opts.msgContext, opts.msgContents));
                } else {
                    opts.msgContents.find(".msg_box__").width(opts.width);
                }
            }

            // set height
            if(typeof opts.height === "function" || opts.height > 0) {
                if(typeof opts.width === "function") {
                    opts.msgContents.find(".msg_box__").height(opts.height.call(self, opts.msgContext, opts.msgContents)).css("overflow-y", "auto");
                } else {
                    opts.msgContents.find(".msg_box__").height(opts.height).css("overflow-y", "auto");
                }
            }

            if(opts.modal && opts.windowScrollLock) {
                NC.event.windowScrollLock(opts.msgContext);
            }

            //set confirm button style and bind click event
            opts.msgContents.find(".buttonBox__ .confirm__").button(opts.okButtonOpts);
            opts.msgContents.find(".buttonBox__ .confirm__").on("click.alert", function(e) {
                e.preventDefault();
                if (opts.onOk !== null) {
                    if(opts.onOk.call(self, opts.msgContext, opts.msgContents) !== 0) {
                        self[opts.closeMode]();
                    }
                } else {
                    self[opts.closeMode]();
                }
            });

            // remove modal overlay layer when opts.modal value is false
            if(!opts.modal) {
                opts.msgContext.remove();
            } else {
                if(opts.overlayClose) {
                    opts.msgContext.on("click.alert", function() {
                        if (opts.onCancel !== null) {
                            if(opts.onCancel.call(self, opts.msgContext, opts.msgContents) !== 0) {
                                self[opts.closeMode]();
                            }
                        } else {
                            self[opts.closeMode]();
                        }
                    });
                }
            }

            // set cancel button style and bind click event
            if(opts.confirm) {
                opts.msgContents.find(".buttonBox__ .cancel__").button(opts.cancelButtonOpts);
                opts.msgContents.find(".buttonBox__ .cancel__").on("click.alert", function(e) {
                    e.preventDefault();
                    if (opts.onCancel !== null) {
                        if(opts.onCancel.call(self, opts.msgContext, opts.msgContents) !== 0) {
                            self[opts.closeMode]();
                        }
                    } else {
                        self[opts.closeMode]();
                    }
                });
            } else {
                opts.msgContents.find(".cancel__").remove();
            }

            if(opts.draggable) {
                let pressed;
                let moved;
                let startX;
                let startY;
                let defMargin;
                opts.msgContents.addClass("draggable__").find(".msg_title_box__").on("mousedown.alert touchstart.alert", function(e) {
                    let dte;
                    if(e.originalEvent.touches) {
                        e.preventDefault();
                        e.stopPropagation();
                        dte = e.originalEvent.touches[0];
                    }

                    defMargin = opts.msgContents.css("margin");

                    if(!N(dte !== undefined ? dte.target : e.target).is(".msg_title_close__") && (e.originalEvent.touches || (e.which || e.button) === 1)) {
                        pressed = true;
                        opts.msgContents.data("isMoved", true);

                        startX = (dte !== undefined ? dte.pageX : e.pageX)- opts.msgContents.offset().left;
                        startY = (dte !== undefined ? dte.pageY : e.pageY) - opts.msgContents.offset().top;

                        N(window.document).on("dragstart.alert selectstart.alert", function() {
                            return false;
                        });

                        moved = true;
                        N(window.document).on("mousemove.alert touchmove.alert", function() {
                            let mte;
                            if(e.originalEvent.touches) {
                                e.stopPropagation();
                                mte = e.originalEvent.touches[0];
                            }
                            if(pressed) {
                                opts.msgContents.offset({
                                    top :  (mte !== undefined ? mte.pageY : e.pageY) - startY,
                                    left : (mte !== undefined ? mte.pageX : e.pageX) - startX
                                });
                            }

                            if(moved) {
                                opts.msgContents.fadeTo(200, "0.4");
                                moved = false;
                            }
                        });

                        const documentWidth = N(window.document).width();
                        N(window.document).on("mouseup.alert touchend.alert", function() {
                            pressed = false;
                            if(opts.draggableOverflowCorrection) {
                                const offset = {};
                                const windowHeight = window.innerHeight ? window.innerHeight : N(window).height();
                                const windowScrollTop = N(window).scrollTop();
                                const msgContentsOffsetTop = opts.msgContents.offset().top;
                                const msgContentsOuterHeight = opts.msgContents.outerHeight();

                                if(msgContentsOffsetTop - windowScrollTop < 0) {
                                    offset.top = (opts.isWindow ? 0
                                        : msgContentsOffsetTop + (windowScrollTop - msgContentsOffsetTop)) + opts.draggableOverflowCorrectionAddValues.top;
                                    offset.top -= parseFloat(opts.msgContents.css("margin-top"));
                                } else if(msgContentsOffsetTop + msgContentsOuterHeight > windowScrollTop + windowHeight) {
                                    offset.top = (opts.isWindow ? windowHeight - msgContentsOuterHeight
                                        : windowScrollTop + windowHeight - msgContentsOuterHeight) + opts.draggableOverflowCorrectionAddValues.bottom;
                                    offset.top -= parseFloat(opts.msgContents.css("margin-top"));
                                }
                                if(offset.top < 0) {
                                    offset.top = opts.draggableOverflowCorrectionAddValues.top;
                                    if(opts.msgContents.css("position") === "fixed") {
                                        offset.top -= parseFloat(opts.msgContents.css("margin-top"));
                                    }
                                }
                                if(opts.msgContents.offset().left < 0) {
                                    offset.left = opts.draggableOverflowCorrectionAddValues.left;
                                } else if(opts.msgContents.offset().left + opts.msgContents.outerWidth() > documentWidth) {
                                    offset.left = documentWidth - opts.msgContents.outerWidth() + opts.draggableOverflowCorrectionAddValues.right;
                                }
                                if(!NC.isEmptyObject(offset)) {
                                    opts.msgContents.animate(offset, 200);
                                }
                            }

                            opts.msgContents.fadeTo(100, "1.0");
                            N(window.document).off("dragstart.alert selectstart.alert mousemove.alert touchmove.alert mouseup.alert touchend.alert");
                        });
                    }
                });
            }
        };

        static resetOffSetEle = function(opts) {
            const position = opts.context.position();
            if(opts.context.is(":visible")) {
                const windowHeight = N(window).height();
                const windowWidth = N(window).width();
                const msgContentsHeight = opts.msgContents.height();
                const msgContentsWidth = opts.msgContents.width();

                // reset message context(overlay) position
                const msgContextCss = {
                    "height" : opts.isWindow ? (window.innerHeight ? window.innerHeight : windowHeight) : opts.context.outerHeight() + "px",
                    "width" : opts.isWindow ? windowWidth : opts.context.outerWidth() + "px"
                }
                let marginLeft = 0;
                if(opts.isWindow) {
                    msgContextCss.top = "0";
                    msgContextCss.left = "0";
                } else {
                    msgContextCss["margin-top"] = "-" + (parseFloat(msgContextCss.height) + parseFloat(opts.context.css("margin-bottom"))) + "px";
                    marginLeft = parseFloat(opts.context.css("margin-left"));
                    msgContextCss.left = String(opts.context.position().left + marginLeft) + "px";
                }
                opts.msgContext.css(msgContextCss).hide().show();

                if(opts.msgContents.data("isMoved") !== true) {
                    // reset message contents position
                    const msgContentsCss = {};
                    if(opts.isWindow) {
                        if(opts.top !== undefined) {
                            msgContentsCss.position = "absolute";
                            msgContentsCss.top = String(opts.top) + "px";
                        } else {
                            msgContentsCss.top = "0";
                            msgContentsCss["margin-top"] = String(Math.floor(opts.msgContext.height() / 2 - msgContentsHeight / 2) - 1) + "px";
                        }
                    } else {
                        if(opts.top !== undefined) {
                            msgContentsCss.position = "absolute";
                            msgContentsCss.top = String(opts.top) + "px";
                        } else {
                            msgContentsCss["margin-top"] = "-" + String(Math.floor(opts.msgContext.height() / 2 + msgContentsHeight / 2 + parseFloat(opts.context.css("margin-bottom"))) + 1) + "px";
                        }
                    }

                    if(opts.left !== undefined) {
                        msgContentsCss.left = String(opts.left) + "px";
                    } else {
                        opts.msgContents.width(msgContentsWidth);
                        msgContentsCss.left = String(Math.floor(opts.context.position().left + marginLeft + (opts.msgContext.width() / 2 - msgContentsWidth / 2)) - 1) + "px";
                    }

                    if(msgContentsHeight > windowHeight) {
                        msgContentsCss["margin-top"] = String(N(window).scrollTop()) + "px";
                        msgContentsCss.position = "absolute";
                    }
                    if(msgContentsWidth > windowWidth) {
                        msgContentsCss["left"] = "0";
                        msgContentsCss.position = "absolute";
                    }

                    if(opts.isWindow && windowHeight > msgContentsHeight && windowWidth > msgContentsWidth) {
                        msgContentsCss.position = "fixed";
                    }

                    opts.msgContents.css(msgContentsCss);
                }

                opts.msgContents.show();
            } else {
                // for non-active tab
                opts.msgContext.hide();
                opts.msgContents.hide();
            }
        };

        static wrapInputEle = function() {
            const opts = this.options;

            let isRemoved = false;
            if(opts.context.instance("alert") !== undefined) {
                opts.context.instance("alert").remove();
                isRemoved = true;
            }

            if (opts.msg.length > 0) {
                opts.msgContext = opts.context;

                opts.msgContents = opts.msgContext.next(".msg__");
                let isBeforeShow = false;
                if (opts.msgContents.length === 0 || isRemoved) {
                    const limitWidth = opts.msgContext.offset().left + opts.msgContext.outerWidth() + 150;

                    if(limitWidth > (window.innerWidth ? window.innerWidth : N(window).width())) {
                        opts.msgContents = opts.msgContext.before('<span class="msg__ alert_before_show__" style="display: none;"><ul class="msg_line_box__"></ul></span>').prev(".msg__");
                        opts.msgContents.removeClass("orgin_left__").addClass("orgin_right__");
                        isBeforeShow = true;
                    } else {
                        opts.msgContents = opts.msgContext.after('<span class="msg__ alert_after_show__" style="display: none;"><ul class="msg_line_box__"></ul></span>').next(".msg__");
                        opts.msgContents.removeClass("orgin_right__").addClass("orgin_left__");
                        isBeforeShow = false;
                    }

                    // set style class to msgContents element
                    opts.msgContents.addClass("alert__ alert_tooltip__ hidden__");

                    opts.msgContents.append('<a href="#" class="msg_close__" title="' + NC.message.get(opts.message, "close") + '"></a>');
                }
                if(opts.alwaysOnTop) {
                    opts.msgContents.css("z-index", NC.element.maxZindex(opts.container.find(opts.alwaysOnTopCalcTarget)) + 1);
                }

                const self = this;
                opts.msgContents.find(".msg_close__").on("click", function(e) {
                    e.preventDefault();
                    self.remove();
                });

                const ul_ = opts.msgContents.find(".msg_line_box__").empty();
                if (NC.isArray(opts.msg)) {
                    opts.msgContents.find(".msg_line_box__").empty();
                    N(opts.msg).each(function(i, msg_) {
                        if (opts.vars !== undefined) {
                            opts.msg[i] = NC.message.replaceMsgVars(msg_, opts.vars);
                        }
                        ul_.append('<li>' + opts.msg[i] + '</li>');
                    });
                } else {
                    if (opts.vars !== undefined) {
                        opts.msg = NC.message.replaceMsgVars(opts.msg, opts.vars);
                    }
                    ul_.append('<li>' + opts.msg + '</li>');
                }
                if(isBeforeShow) {
                    opts.msgContents.css("margin-left", "-" + String(opts.msgContents.outerWidth()) + "px");
                }
            } else {
                this.remove();
            }
        };

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        show() {
            const opts = this.options;
            const self = this;

            if (opts.onBeforeShow !== null) {
                opts.onBeforeShow.call(self, opts.msgContext, opts.msgContents);
            }

            // for NUS.docs transition effect
            N(".docs__>.docs_tab_context__").css("z-index", "0");

            if (!opts.isInput) {
                if(opts.dynPos && !opts.isWindow) {
                    NU.alert.resetOffSetEle(opts);
                    opts.time = setInterval(function() {
                        if(opts.context.is(":visible")) {
                            NU.alert.resetOffSetEle(opts);
                        }
                    }, 500);
                } else {
                    opts.resizeHandler =  function() {
                        NU.alert.resetOffSetEle(opts);
                    };
                    N(window).off("resize.alert", opts.resizeHandler).on("resize.alert", opts.resizeHandler).trigger("resize.alert");
                }

                if(!opts.isWindow) {
                    opts.msgContext.closest(".msg_box__").css("position", "relative");
                }

                if(opts.button === true) {
                    opts.msgContents.find(".buttonBox__ .confirm__").get(0).focus();
                }

                opts.msgContents.removeClass("hidden__").addClass("visible__");

                opts.msgContents.one(NC.event.whichTransitionEvent(opts.msgContents), function(){
                    if (opts.onShow !== null) {
                        opts.onShow.call(self, opts.msgContext, opts.msgContents);
                    }
                }).trigger("nothing");
            } else {
                if (!NC.isEmptyObject(opts.msg)) {
                    opts.msgContext.parent().css({
                        "white-space": "normal"
                    });

                    opts.msgContents.show();

                    opts.iTime = setTimeout(function() {
                        opts.msgContext.parent().css({
                            "white-space": ""
                        });
                        self[opts.closeMode]();
                    }, opts.input.displayTimeout);

                    opts.msgContents.removeClass("hidden__").addClass("visible__");
                }
            }

            // if press the "ESC" key, alert dialog will be removed
            if(opts.escClose) {
                opts.keyupHandler = function(e) {
                    if ((e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode)) === 27) {
                        if (opts.onCancel !== null) {
                            if(opts.onCancel.call(self, opts.msgContext, opts.msgContents) !== 0) {
                                self[opts.closeMode]();
                            }
                        } else {
                            self[opts.closeMode]();
                        }
                    }
                };
                N(document).off("keyup.alert", opts.keyupHandler).on("keyup.alert", opts.keyupHandler);
            }

            return this;
        };

        hide() {
            const opts = this.options;

            if (opts.onBeforeHide !== null) {
                opts.onBeforeHide.call(this, opts.msgContext, opts.msgContents);
            }

            // for NUS.docs transition effect
            N(".docs__>.docs_tab_context__").css("z-index", "");

            if (!opts.isInput) {
                if(!opts.isWindow) {
                    opts.msgContext.closest(".msg_box__").css("position", "");
                }
                opts.msgContext.hide();

                opts.msgContents.removeClass("visible__").addClass("hidden__");
                opts.msgContents.one(NC.event.whichTransitionEvent(opts.msgContents), function(){
                    opts.msgContents.hide();

                    if (opts.onHide !== null) {
                        opts.onHide.call(this, opts.msgContext, opts.msgContents);
                    }
                }).trigger("nothing");

            } else {
                opts.msgContents.removeClass("visible__").addClass("hidden__");
                opts.msgContents.one(NC.event.whichTransitionEvent(opts.msgContents), function(){
                    clearTimeout(opts.iTime);
                    opts.msgContents.remove();

                    if (opts.onHide !== null) {
                        opts.onHide.call(this, opts.msgContext, opts.msgContents);
                    }
                }).trigger("nothing");
            }

            N(window).off("resize.alert", opts.resizeHandler);
            if(opts.escClose) {
                N(document).off("keyup.alert", opts.keyupHandler);
            }

            return this;
        };

        remove() {
            const opts = this.options;

            if (opts.onBeforeRemove !== null) {
                opts.onBeforeRemove.call(this, opts.msgContext, opts.msgContents);
            }

            // for NUS.docs transition effect
            N(".docs__>.docs_tab_context__").css("z-index", "");

            if (!opts.isInput) {
                clearInterval(opts.time);
                if(!opts.isWindow) {
                    opts.msgContext.closest(".msg_box__").css("position", "");
                }
                opts.msgContext.remove();

                opts.msgContents.removeClass("visible__").addClass("hidden__");
                opts.msgContents.one(NC.event.whichTransitionEvent(opts.msgContents), function(){
                    opts.msgContents.remove();

                    if(opts.msgContents.hasClass("popup__")) {
                        // Removes garbage instances from obserables of ND.ds
                        NC.gc.ds();
                    }

                    if (opts.onRemove !== null) {
                        opts.onRemove.call(this, opts.msgContext, opts.msgContents);
                    }
                }).trigger("nothing");
            } else {
                opts.msgContents.removeClass("visible__").addClass("hidden__");
                opts.msgContents.one(NC.event.whichTransitionEvent(opts.msgContents), function(){
                    clearTimeout(opts.iTime);
                    opts.msgContents.remove();

                    if (opts.onRemove !== null) {
                        opts.onRemove.call(this, opts.msgContext, opts.msgContents);
                    }
                }).trigger("nothing");
            }

            N(window).off("resize.alert", opts.resizeHandler);
            if(opts.escClose) {
                N(document).off("keyup.alert", opts.keyupHandler);
            }
            return this;
        };
    }

    // Button
    static button = class {
        constructor(obj, opts) {
            this.options = {
                context : obj,
                size : "none", // none, smaller, small, medium, large, big
                color : "none", // none, primary, primary_container, secondary, secondary_container, tertiary, tertiary_container
                type : "none", // none, filled, outlined, elevated
                disable : false,
                onBeforeCreate : null,
                onCreate : null
            };

            try {
                jQuery.extend(this.options, NA.context.attr("ui").button);
            } catch (e) {
                throw NC.error("NU.button", e);
            }
            jQuery.extend(this.options, NC.element.toOpts(this.options.context));

            if(opts !== undefined) {
                // Wraps the global event options in NA.config and event options for this component.
                NU.ui.utils.wrapHandler(opts, "button", "onBeforeCreate");
                NU.ui.utils.wrapHandler(opts, "button", "onCreate");

                jQuery.extend(this.options, opts);
            }

            // set style class name to context element
            this.options.context.addClass("button__");

            if (this.options.onBeforeCreate) {
                this.options.onBeforeCreate.call(this, this.options.context, this.options);
            }

            NU.button.wrapEle.call(this);

            // set this instance to context element
            this.options.context.instance("button", this);

            if (this.options.onCreate) {
                this.options.onCreate.call(this, this.options.context, this.options);
            }

            return this;
        };

        static wrapEle = function() {
            const opts = this.options;

            if(opts.disable) {
                this.disable();
            } else {
                this.enable();
            }

            if(opts.context.is("a")) {
                opts.context.attr("onselectstart", "return false;");
            }
            if (opts.context.is("a") || opts.context.is("button") || opts.context.is("input[type='button']")) {
                opts.context.removeClass("btn_common__ btn_smaller__ btn_small__ btn_medium__ btn_large__ btn_big__ " +
                    "btn_primary__ btn_primary_container__ " +
                    "btn_secondary__ btn_secondary_container__ " +
                    "btn_tertiary__ btn_tertiary_container__ " +
                    "btn_filled__ btn_outlined__ btn_elevated__");

                if (opts.size !== "none") {
                    opts.context.addClass("btn_common__");
                    opts.context.addClass("btn_" + opts.size + "__");
                }

                if (opts.color !== "none") {
                    opts.context.addClass("btn_" + opts.color + "__ ");
                }

                if (opts.type !== "none") {
                    opts.context.addClass("btn_" + opts.type + "__");
                }
            }
        }

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        disable() {
            const context = this.options.context;
            if (context.is("a")) {
                context.off("click.button");
                context.tpBind("click.button", NC.event.disable);
            } else {
                context.prop("disabled", true);
            }
            context.addClass("btn_disabled__");
            return this;
        };

        enable() {
            const context = this.options.context;
            if (context.is("a")) {
                context.off("click", NC.event.disable);
            } else {
                context.prop("disabled", false);
            }
            context.removeClass("btn_disabled__");
            return this;
        };

    }

    static datepicker = class {

        constructor(obj, opts) {
            this.options = {
                context : obj,
                contents : N('<div class="datepicker__"></div>'),
                monthonly : false,
                focusin : true,
                yearsPanelPosition : "left",
                monthsPanelPosition : "left",
                minYear : 200,
                maxYear : 200,
                yearChangeInput : false,
                monthChangeInput : false,
                touchMonthChange : false,
                scrollMonthChange : false,
                minDate : null,
                maxDate : null,
                holiday : {
                    "repeat" : null,
                    "once" : null
                },
                onChangeYear : null,
                onChangeMonth : null,
                onSelect : null,
                onBeforeShow : null,
                onShow : null,
                onBeforeHide : null,
                onHide : null
            };

            try {
                jQuery.extend(this.options, NA.context.attr("ui").datepicker);
                if(opts && opts.monthonly === true && NA.context.attr("ui").datepicker.monthonlyOpts) {
                    jQuery.extend(this.options, NA.context.attr("ui").datepicker.monthonlyOpts);
                }
            } catch (e) {
                throw NC.error("NU.datepicker", e);
            }

            if(opts !== undefined) {
                // Wraps the global event options in NA.config and event options for this component.
                NU.ui.utils.wrapHandler(opts, "datepicker", "onChangeYear");
                NU.ui.utils.wrapHandler(opts, "datepicker", "onChangeMonth");
                NU.ui.utils.wrapHandler(opts, "datepicker", "onSelect");
                NU.ui.utils.wrapHandler(opts, "datepicker", "onBeforeShow");
                NU.ui.utils.wrapHandler(opts, "datepicker", "onShow");
                NU.ui.utils.wrapHandler(opts, "datepicker", "onBeforeHide");
                NU.ui.utils.wrapHandler(opts, "datepicker", "onHide");

                jQuery.extend(this.options, opts);
            }

            if(this.options.yearsPanelPosition === "top" && this.options.monthsPanelPosition === "top" && this.options.monthonly === true) {
                NC.warn('[NU.datepicker]This option combination({ yearsPanelPosition : "top", monthsPanelPosition : "top", monthonly : true }) is not suppored.');
                this.options.yearsPanelPosition = "left";
                this.options.monthsPanelPosition = "left";
            }

            // set style class name to context element
            this.options.context.addClass("datepicker__");

            // bind events
            NU.datepicker.wrapEle.call(this);

            // set this instance to context element
            this.options.context.instance("datepicker", this);

            return this;
        };

        static context = function() {
            return this.options.context;
        };

        static checkMinMaxDate = function() {
            const opts = this.options;
            const value = opts.context.val();

            if(value.length === 4) {
                if(opts.minDate != null && opts.minDate.length >= 4) {
                    if(Number(value) < Number(opts.minDate.substring(0, 4))) {
                        opts.context.val(opts.minDate.substring(0, 4)).trigger("keyup.datepicker", [true]);
                        opts.context.alert(NC.message.get(opts.message, "minDate", [ opts.minDate ])).show();
                        return false;
                    }
                }
                if(opts.maxDate != null && opts.maxDate.length >= 4) {
                    if(Number(value) > Number(opts.maxDate.substring(0, 4))) {
                        opts.context.val(opts.maxDate.substring(0, 4)).trigger("keyup.datepicker", [true]);
                        opts.context.alert(NC.message.get(opts.message, "maxDate", [ opts.maxDate ])).show();
                        return false;
                    }
                }
            } else if(value.length === 6) {
                if(opts.minDate != null && opts.minDate.length >= 6) {
                    if(Number(value) < Number(opts.minDate.substring(0, 6))) {
                        opts.context.val(opts.minDate.substring(0, 6)).trigger("keyup.datepicker", [true]);
                        opts.context.alert(NC.message.get(opts.message, "minDate", [ opts.minDate ])).show();
                        return false;
                    }
                }
                if(opts.maxDate != null && opts.maxDate.length >= 6) {
                    if(Number(value) > Number(opts.maxDate.substring(0, 6))) {
                        opts.context.val(opts.maxDate.substring(0, 6)).trigger("keyup.datepicker", [true]);
                        opts.context.alert(NC.message.get(opts.message, "maxDate", [ opts.maxDate ])).show();
                        return false;
                    }
                }
            } else if(value.length === 8) {
                if(opts.minDate != null && opts.minDate.length === 8) {
                    if(Number(value) < Number(opts.minDate)) {
                        opts.context.val(opts.minDate).trigger("keyup.datepicker", [true]);
                        opts.context.alert(NC.message.get(opts.message, "minDate", [ opts.minDate ])).show();
                        return false;
                    }
                }
                if(opts.maxDate != null && opts.maxDate.length === 8) {
                    if(Number(value) > Number(opts.maxDate)) {
                        opts.context.val(opts.maxDate).trigger("keyup.datepicker", [true]);
                        opts.context.alert(NC.message.get(opts.message, "maxDate", [ opts.maxDate ])).show();
                        return false;
                    }
                }
            }

            return true;
        };

        static wrapEle = function() {
            const opts = this.options;
            const self = this;

            // bind focusin event
            if(opts.focusin && !opts.context.prop("readonly") && !opts.context.prop("disabled")) {
                opts.context.off("focusin.datepicker").on("focusin.datepicker", function() {
                    self.show();
                });
            }

            // bind key events
            opts.context.off("keydown.datepicker").on("keydown.datepicker", function(e) {
                const keyCode = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);
                if(!NC.event.isNumberRelatedKeys(e) || opts.context.val().length > 8) {
                    e.preventDefault();
                    return false;
                } else if (keyCode === 13 || keyCode === 9) { // When press the ENTER key
                    opts.context.get(0).blur();
                    self.hide();
                }
            }).off("keyup.datepicker").on("keyup.datepicker", function(e, isPassCheckMinMaxDate) {
                // Hangul does not apply e.preventDefault() of keydown event
                e.target.value = e.target.value.replace(/[^0-9]/g, "");

                const value = opts.context.val();
                const keyCode = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);
                const format = (!opts.monthonly ? NA.context.attr("data").formatter.date.Ymd() : NA.context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, "");

                // when press the number keys
                if ((value.length > 2 && value.length%2 === 0) && keyCode !== 35 && keyCode !== 36 && keyCode !== 37 && keyCode !== 39 && keyCode !== 9 && keyCode !== 27) {
                    const dateStrArr = NC.date.strToDateStrArr(value, format);
                    const dateStrStrArr = NC.date.strToDateStrArr(value, format, true);

                    // validate input value
                    if(dateStrStrArr[0].length === 4 && dateStrArr[0] < 100) {
                        opts.context.alert(NC.message.get(opts.message, "yearNaN")).show();
                        opts.context.val(value.replace(dateStrStrArr[0], ""));
                        return false;
                    } else if(dateStrStrArr[1].length === 2 && (dateStrArr[1] < 1 || dateStrArr[1] > 12)) {
                        opts.context.alert(NC.message.get(opts.message, "monthNaN")).show();
                        opts.context.val(value.replace(dateStrStrArr[1], ""));
                        return false;
                    } else if(!opts.monthonly && dateStrStrArr[2].length === 2 && (dateStrArr[2] < 1 || dateStrArr[2] > parseInt(opts.gEndDate))) {
                        opts.context.alert(NC.message.get(opts.message, "dayNaN", [String(parseInt(opts.gEndDate))])).show();
                        opts.context.val(value.replace(dateStrStrArr[2], ""));
                        return false;
                    }

                    // minDate, maxDate
                    if(!isPassCheckMinMaxDate && !NU.datepicker.checkMinMaxDate.call(self)) {
                        return false;
                    }

                    const yearsPanel = opts.contents.find(".datepicker_years_panel__");
                    const monthsPanel = opts.contents.find(".datepicker_months_panel__");
                    const daysPanel = opts.contents.find(".datepicker_days_panel__");

                    if((format.length === 3 && format.indexOf("md") > -1) || format.length === 2) {
                        NU.datepicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
                    } else {
                        if(!opts.monthonly) {
                            if(value.length === 8) {
                                NU.datepicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
                            }
                        } else {
                            if(value.length === 6) {
                                NU.datepicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
                            }
                        }
                    }
                }

                if (keyCode === 27) { // When press the ESC key
                    e.preventDefault();
                    self.hide();
                }
            }).off("focusout.datepicker").on("focusout.datepicker", function(e) {
                // Hangul does not apply e.preventDefault() of keydown event
                if(!opts.context.prop("readonly") && !opts.context.prop("disable")) {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }
            });
        };

        static createContents = function() {
            const opts = this.options;
            const self = this;

            const d = new Date();
            opts.currYear = parseInt(d.formatDate("Y"));
            const format = (!opts.monthonly ? NA.context.attr("data").formatter.date.Ymd() : NA.context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, "");

            opts.contents = N('<div class="datepicker_contents__"></div>').on("click.datepicker", function(e) {
                e.stopPropagation();
            }).addClass("hidden__").addClass("years_panel_position_" + opts.yearsPanelPosition + "__")
                .addClass("months_panel_position_" + opts.monthsPanelPosition + "__");
            opts.context.off("click.datepicker").on("click.datepicker", function(e) {
                e.stopPropagation();
            });

            if(opts.monthonly) {
                opts.context.attr("maxlength", "6");
                opts.contents.addClass("datepicker_monthonly__");
            } else {
                opts.context.attr("maxlength", "8");
            }
            opts.contents.css({
                display: "none",
                position: "absolute"
            });

            const yearsPanel = N('<div class="datepicker_years_panel__"></div>');
            let topMonthsPanel, topMonthItem, monthsPanel;
            let days, daysPanel, dayItem;

            if(opts.yearsPanelPosition === "left") {
                const yearItem = N('<div></div>');
                // create year items
                let yearItemClone;
                yearsPanel.append(yearItem.clone(true).addClass("datepicker_year_title__").text(NC.message.get(opts.message, "year")));
                // render year items
                let i;
                for(i=opts.currYear-2;i<=opts.currYear+2;i++) {
                    yearItemClone = yearItem.clone(true).addClass("datepicker_year_item__");
                    if(i === opts.currYear) {
                        yearItemClone.addClass("datepicker_curr_year__");
                        yearItemClone.addClass("datepicker_year_selected__");
                    }
                    yearsPanel.append(yearItemClone.text(NC.string.lpad(String(i), 4, "0")));
                }

                // Binds click event to year items
                yearsPanel.on("click.datepicker", ".datepicker_year_item__", function(e, isForceUpdate) {
                    e.preventDefault();
                    const selectedYearItemEle = yearsPanel.find(".datepicker_year_item__.datepicker_year_selected__").removeClass("datepicker_year_selected__");
                    N(this).addClass("datepicker_year_selected__");

                    const selYearStr = N(this).text();
                    if(selYearStr !== selectedYearItemEle.text() || isForceUpdate) {
                        // immediately applys the changed year to the context element
                        if(opts.yearChangeInput) {
                            let dateVal = opts.context.val().replace(/\D/g,"");

                            if(dateVal.length <= 4) {
                                opts.context.val(NC.string.lpad(selYearStr, 4, "0"));
                            } else {
                                let selDate;
                                let dateFormat;
                                if(dateVal.length === 6) {
                                    dateFormat = NA.context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");
                                } else if(dateVal.length === 8) {
                                    dateFormat = NA.context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");
                                }

                                if(dateFormat !== undefined) {
                                    selDate = NC.date.strToDate(dateVal, dateFormat);

                                    let tempFormat = "";
                                    N(dateFormat.split("")).each(function(i, formatChar) {
                                        tempFormat += formatChar + "-";
                                    });
                                    dateVal = selDate.obj.formatDate(tempFormat).replace(selDate.obj.formatDate("Y"), selYearStr).replace(/-/g, "");
                                    opts.context.val(dateVal);
                                }
                            }

                            // minDate, maxDate
                            if(!NU.datepicker.checkMinMaxDate.call(self)) {
                                return false;
                            }
                        }

                        if(!opts.monthonly) {
                            monthsPanel.find(".datepicker_month_item__.datepicker_month_selected__").trigger("click.datepicker");
                        }

                        if(opts.onChangeYear !== null) {
                            opts.onChangeYear.call(self, opts.context, selYearStr, e);
                        }
                        opts.context.trigger("onChangeYear", [opts.context, selYearStr, e]);
                    }
                });

                const yearPaging = N('<div class="datepicker_year_paging__"><a href="#" class="datepicker_year_prev__" title="' + NC.message.get(opts.message, "prev") + '"><span>&lt;</span></a><a href="#" class="datepicker_year_next__" title="' + NC.message.get(opts.message, "next") + '"><span>&gt;</span></a></div>');
                yearPaging.find(".datepicker_year_prev__").on("click.datepicker", function(e) {
                    e.preventDefault();
                    NU.datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), opts.currYear, -5);
                    yearsPanel.find(".datepicker_year_selected__").trigger("click.datepicker", [true]);
                });
                yearPaging.find(".datepicker_year_next__").on("click.datepicker", function(e) {
                    e.preventDefault();
                    NU.datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), opts.currYear, 5);
                    yearsPanel.find(".datepicker_year_selected__").trigger("click.datepicker", [true]);
                });
                yearsPanel.append(yearPaging);
            } else if(opts.yearsPanelPosition === "top") {
                const prevYearBtn = N('<div class="datepicker_year_paging__"><a href="#" class="datepicker_year_prev__" title="' + NC.message.get(opts.message, "prev") + '"><span>&lt;</span></a></div>').appendTo(yearsPanel)
                    .find("> .datepicker_year_prev__").on("click.datepicker", function(e, isPrevYearBtn) {
                        e.preventDefault();
                        let selectedYear = parseInt(yearItem.val());
                        if(selectedYear > opts.currYear - opts.minYear) {
                            yearItem.val(NC.string.lpad(String(selectedYear - 1), 4, "0")).trigger("change.datepicker", isPrevYearBtn ? [ isPrevYearBtn ] : undefined);
                        } else {
                            yearItem.empty();
                            selectedYear--;

                            let startYear = selectedYear - opts.minYear;
                            let endYear = selectedYear + opts.maxYear;
                            if(startYear < 100) {
                                startYear = 100;
                                endYear = startYear + opts.maxYear;
                            }
                            for(let i=startYear;i<=endYear;i++) {
                                let selected = "";
                                if(i === selectedYear) {
                                    opts.currYear = selectedYear;
                                    selected = 'selected="selected"';
                                }
                                yearItem.append('<option value="' + NC.string.lpad(String(i), 4, "0") + '" ' + selected + '>' + NC.string.lpad(String(i), 4, "0") +'</option>');
                            }
                            yearItem.trigger("change.datepicker", isPrevYearBtn ? [ isPrevYearBtn ] : undefined);
                        }
                    });

                const yearItem = N('<select class="datepicker_year_item__"><select>')
                let yearStr;
                for(let i=opts.currYear-opts.minYear;i<=opts.currYear+opts.maxYear;i++) {
                    yearItem.append('<option value="' + NC.string.lpad(String(i), 4, "0") +'"' + (i === opts.currYear ? 'selected="selected"' : "") + '>' + NC.string.lpad(String(i), 4, "0") +'</option>');
                }
                yearItem.addClass("datepicker_year_item__ datepicker_year_selected__").on("change.datepicker", function(e, isPrevNextYearBtn) {
                    const selYearStr = N(this).val();

                    // immediately applys the changed year to the context element
                    if(opts.yearChangeInput) {
                        let dateVal = opts.context.val().replace(/\D/g,"");

                        if(dateVal.length <= 4) {
                            opts.context.val(selYearStr);
                        } else {
                            let selDate;
                            let dateFormat;
                            if(dateVal.length === 6) {
                                dateFormat = NA.context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");
                            } else if(dateVal.length === 8) {
                                dateFormat = NA.context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");
                            }

                            if(dateFormat !== undefined) {
                                selDate = NC.date.strToDate(dateVal, dateFormat);

                                let tempFormat = "";
                                N(dateFormat.split("")).each(function(i, formatChar) {
                                    tempFormat += formatChar + "-";
                                });
                                dateVal = selDate.obj.formatDate(tempFormat).replace(selDate.obj.formatDate("Y"), selYearStr).replace(/-/g, "");
                                opts.context.val(dateVal);
                            }
                        }

                        // minDate, maxDate
                        if(!isPrevNextYearBtn) {
                            if(!NU.datepicker.checkMinMaxDate.call(self)) {
                                return false;
                            }
                        }
                    }

                    if(topMonthItem !== undefined) {
                        topMonthItem.trigger("change.datepicker");
                    }

                    if(opts.onChangeYear !== null) {
                        opts.onChangeYear.call(self, opts.context, selYearStr, e);
                    }
                    opts.context.trigger("onChangeYear", [opts.context, selYearStr, e]);

                }).appendTo(yearsPanel);

                const nextYearBtn = N('<div class="datepicker_year_paging__"><a href="#" class="datepicker_year_next__" title="' + NC.message.get(opts.message, "next") + '"><span>&gt;</span></a></div>').appendTo(yearsPanel)
                    .find("> .datepicker_year_next__").on("click.datepicker", function(e, isNextYearBtn) {
                        e.preventDefault();
                        let selectedYear = parseInt(yearItem.val());

                        if(selectedYear < opts.currYear + opts.maxYear && opts.currYear + opts.maxYear > opts.minYear + opts.maxYear) {
                            yearItem.val(NC.string.lpad(String(selectedYear + 1), 4, "0")).trigger("change.datepicker", isNextYearBtn ? [ isNextYearBtn ] : undefined);
                        } else {
                            yearItem.empty();
                            selectedYear++;

                            const startYear = selectedYear - opts.minYear;
                            const endYear = selectedYear + opts.maxYear;

                            for(let i=startYear;i<=endYear;i++) {
                                let selected = "";
                                if(i === selectedYear) {
                                    opts.currYear = selectedYear;
                                    selected = 'selected="selected"';
                                }
                                yearItem.append('<option value="' + NC.string.lpad(String(i), 4, "0") + '" ' + selected + '>' + NC.string.lpad(String(i), 4, "0") +'</option>');
                            }
                            yearItem.trigger("change.datepicker", isNextYearBtn ? [ isNextYearBtn ] : undefined);
                        }
                    });
            }
            opts.contents.append(yearsPanel);

            // create month items
            monthsPanel = N('<div class="datepicker_months_panel__"></div>');

            if(!opts.monthonly) {
                // creates the day items
                days = NC.message.get(opts.message, "days").split(",");
                daysPanel = N('<div class="datepicker_days_panel__"></div>');
                dayItem = N('<div></div>');
            }

            if(opts.monthsPanelPosition === "top") {
                monthsPanel.hide();

                topMonthsPanel = N('<div class="datepicker_top_months_panel__"></div>');
                topMonthItem = N('<select><select>')
                for(let i=1;i<=12;i++) {
                    topMonthItem.append('<option value="' + String(i) +'"' + (i === parseInt(d.formatDate("m")) ? 'selected="selected"' : "") + '>' + NC.string.lpad(String(i), 2, "0") +'</option>');
                }

                const prevMonthBtn = N('<div class="datepicker_month_paging__"><a href="#" class="datepicker_month_prev__" title="' + NC.message.get(opts.message, "prev") + '"><span>&lt;</span></a></div>').appendTo(topMonthsPanel)
                    .find("> .datepicker_month_prev__").on("click.datepicker", function(e) {
                        e.preventDefault();
                        let prevMonth = String(parseInt(topMonthItem.val()) - 1);
                        if(prevMonth < 1) {
                            const yearPrevBtnEle = yearsPanel.find(".datepicker_year_prev__");
                            if(opts.yearsPanelPosition === "left") {
                                const yearStr = String(Number(yearsPanel.find(".datepicker_year_selected__").text()) - 1);
                                yearsPanel.find(".datepicker_year_item__").removeClass("datepicker_year_selected__");
                                if(yearsPanel.find(".datepicker_year_item__:contains('" + NC.string.lpad(String(yearStr), 4, "0") + "')").length === 0) {
                                    NU.datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), yearStr, -4, true);
                                }
                                yearsPanel.find(".datepicker_year_item__:contains('" + NC.string.lpad(String(yearStr), 4, "0") + "')").trigger("click");
                            } else if(opts.yearsPanelPosition === "top") {
                                yearPrevBtnEle.trigger("click.datepicker", [ true ]);
                            }

                            prevMonth = 12;
                        }
                        topMonthItem.val(prevMonth);
                        monthsPanel.find(".datepicker_month_item__:contains(" + prevMonth + "):eq(0)").trigger("click.datepicker");
                    });

                topMonthItem.addClass("datepicker_month_item__ datepicker_month_selected__").on("change.datepicker", function() {
                    monthsPanel.find(".datepicker_month_item__:contains(" + N(this).val() + "):eq(0)").trigger("click.datepicker");
                }).appendTo(topMonthsPanel);

                const nextMonthBtn = N('<div class="datepicker_month_paging__"><a href="#" class="datepicker_month_next__" title="' + NC.message.get(opts.message, "next") + '"><span>&gt;</span></a></div>').appendTo(topMonthsPanel)
                    .find("> .datepicker_month_next__").on("click.datepicker", function(e) {
                        e.preventDefault();
                        let nextMonth = String(parseInt(topMonthItem.val()) + 1);
                        if(nextMonth > 12) {
                            const yearNextBtnEle = yearsPanel.find(".datepicker_year_next__");
                            if(opts.yearsPanelPosition === "left") {
                                const yearStr = String(Number(yearsPanel.find(".datepicker_year_selected__").text()) + 1);
                                yearsPanel.find(".datepicker_year_item__").removeClass("datepicker_year_selected__");
                                if(yearsPanel.find(".datepicker_year_item__:contains('" + NC.string.lpad(String(yearStr), 4, "0") + "')").length === 0) {
                                    NU.datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), yearStr, 0, true);
                                }
                                yearsPanel.find(".datepicker_year_item__:contains('" + NC.string.lpad(String(yearStr), 4, "0") + "')").trigger("click");
                            } else if(opts.yearsPanelPosition === "top") {
                                yearNextBtnEle.trigger("click.datepicker", [ true ]);
                            }

                            nextMonth = 1;
                        }
                        topMonthItem.val(nextMonth);
                        monthsPanel.find(".datepicker_month_item__:contains(" + nextMonth + "):eq(0)").trigger("click.datepicker");
                    });

                if(opts.yearsPanelPosition === "left" && opts.monthsPanelPosition === "top") {
                    opts.contents.prepend(topMonthsPanel);
                } else {
                    opts.contents.append(topMonthsPanel);
                }

                if(opts.scrollMonthChange) {
                    opts.contents.on("mousewheel DOMMouseScroll", function(e) {
                        e.preventDefault();
                        if(e.originalEvent.wheelDelta > 0) {
                            nextMonthBtn.trigger("click.datepicker");
                        } else {
                            prevMonthBtn.trigger("click.datepicker");
                        }
                    });
                }

                if(opts.touchMonthChange) {
                    let startX;
                    let lastX;
                    opts.contents.on("touchstart", function(e) {
                        startX = e.originalEvent.touches[0].pageX;
                    }).on("touchmove", function(e) {
                        e.preventDefault();
                        lastX = e.originalEvent.touches[0].pageX;
                    }).on("touchend", function(e) {
                        const deltaX = startX - lastX;
                        if(Math.abs(deltaX) > 30) {
                            if(deltaX < 0) {
                                nextMonthBtn.trigger("click.datepicker");
                            } else {
                                prevMonthBtn.trigger("click.datepicker");
                            }
                        }

                        startX = undefined;
                        lastX = undefined;
                    });
                }
            }

            const monthItem = N('<div></div>');
            monthsPanel.append(monthItem.clone().addClass("datepicker_month_title__").text(NC.message.get(opts.message, "month")));
            // rendering the month items
            for(let i=1;i<=12;i++) {
                monthsPanel.append(monthItem.clone(true).addClass("datepicker_month_item__").text(String(i)));
                if(monthsPanel.find(".datepicker_month_selected__").length === 0) {
                    monthsPanel.find(".datepicker_month_item__:contains(" + String(parseInt(d.formatDate("m"))) + "):eq(0)").addClass("datepicker_month_selected__");
                }
            }
            opts.contents.append(monthsPanel);

            // Binds click event to month items
            monthsPanel.on("click.datepicker", ".datepicker_month_item__", function(e, ke) {
                e.preventDefault();

                const selectedMonthItemEle = monthsPanel.find(".datepicker_month_item__.datepicker_month_selected__").removeClass("datepicker_month_selected__");
                N(this).addClass("datepicker_month_selected__");

                const selYearStr = yearsPanel.find(".datepicker_year_selected__")[opts.yearsPanelPosition === "left" ? "text" : "val"]();
                const selMonthStr = N(this).text();
                if(selMonthStr !== selectedMonthItemEle.text()) {
                    // immediately applys the changed month to the context element
                    if(opts.monthChangeInput) {
                        let dateVal = opts.context.val().replace(/\D/g,"");

                        if(dateVal.length >= 4) {
                            let selDate;
                            let dateFormat;
                            if(dateVal.length === 4) {
                                dateFormat = "Ym";
                                dateVal = dateVal + NC.string.lpad(selMonthStr, 2, "0");
                            } else if(dateVal.length === 6) {
                                dateFormat = NA.context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");
                            } else if(dateVal.length === 8) {
                                dateFormat = NA.context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");
                            }

                            if(dateFormat !== undefined) {
                                selDate = NC.date.strToDate(dateVal, dateFormat);

                                let tempFormat = "";
                                N(dateFormat.split("")).each(function(i, formatChar) {
                                    tempFormat += formatChar + "-";
                                });

                                const endDateCls = NC.date.strToDate(NC.string.lpad(selDate.obj.formatDate("Y"), 4, "0") +  NC.string.lpad(String(Number(selMonthStr) + 1), 2, "0") + "00", "Ymd");
                                const endDate = endDateCls.obj.getDate();

                                dateVal = selDate.obj.formatDate(tempFormat)
                                    .replace(selDate.obj.formatDate("Y"), NC.string.lpad(selDate.obj.formatDate("Y"), 4, "0"))
                                    .replace(selDate.obj.formatDate("m") + "-", NC.string.lpad(selMonthStr, 2, "0") + "-");

                                if(Number(selDate.obj.formatDate("d")) > endDate) {
                                    dateVal = dateVal.replace(selDate.obj.formatDate("d") + "-", NC.string.lpad(endDate, 2, "0") + "-");
                                } else if(Number(opts.lastSelectedDay) === endDate) {
                                    dateVal = dateVal.replace(selDate.obj.formatDate("d") + "-", NC.string.lpad(opts.lastSelectedDay, 2, "0") + "-");
                                }
                                dateVal = dateVal.replace(/-/g, "");

                                opts.context.val(dateVal);
                            }

                            // minDate, maxDate
                            if(!NU.datepicker.checkMinMaxDate.call(self)) {
                                return false;
                            }
                        }
                    }

                    if(opts.onChangeMonth !== null) {
                        opts.onChangeMonth.call(self, opts.context, selMonthStr, selYearStr, e);
                    }
                    opts.context.trigger("onChangeMonth", [opts.context, selMonthStr, selYearStr, e]);
                }

                let dateFormat;
                if(opts.monthonly) {
                    const selDate = NC.date.strToDate(NC.string.lpad(selYearStr, 4, "0") + NC.string.lpad(N(this).text(), 2, "0"), "Ym");
                    // sets the date format by the global config.
                    selDate.format = NA.context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");

                    let onSelectContinue;
                    if(opts.onSelect !== null) {
                        onSelectContinue = opts.onSelect.call(self, opts.context, selDate, opts.monthonly);
                    }
                    if(onSelectContinue === undefined || onSelectContinue === true) {
                        dateFormat = selDate.format.replace(/[^Y|^m|^d]/g, "");
                        const yearVal = selDate.obj.formatDate("Y");
                        let dateVal = selDate.obj.formatDate(dateFormat);
                        if(yearVal.length === 3) {
                            let tempFormat = "";
                            N(dateFormat.split("")).each(function(i, formatChar) {
                                tempFormat += formatChar + "-";
                            });
                            dateVal = selDate.obj.formatDate(tempFormat).replace(yearVal, "0" + yearVal).replace(/-/g, "");
                        }
                        opts.context.val(dateVal);
                    }
                    opts.context.trigger("onSelect", [opts.context, selDate, opts.monthonly]);

                    self.hide(ke);
                } else {
                    const selectedDay = daysPanel.find(".datepicker_day_selected__").text();
                    daysPanel.empty();
                    const endDateCls = NC.date.strToDate(NC.string.lpad(selYearStr, 4, "0") +  NC.string.lpad(String(parseInt(N(this).text())+1), 2, "0") + "00", "Ymd");
                    const endDate = endDateCls.obj.getDate();
                    opts.gEndDate = endDate;
                    if(format !== "Ymd") {
                        opts.gEndDate = 31;
                    }
                    endDateCls.obj.setDate(1);
                    const startDay = endDateCls.obj.getDay();
                    //render week
                    let j;
                    for(j=0;j<days.length;j++) {
                        daysPanel.append(dayItem.clone().addClass("datepicker_day_title__").text(days[j]));
                    }

                    const prevEndDateCls = NC.date.strToDate(NC.string.lpad(selYearStr, 4, "0") +  NC.string.lpad(N(this).text(), 2, "0") + "00", "Ymd");
                    const prevEndDate = prevEndDateCls.obj.getDate();
                    let day;
                    let dayItemT;
                    // rendering the day items
                    for(j=1-startDay;j<=42-startDay;j++) {
                        day = String(j);
                        dayItemT = dayItem.clone(true);
                        if(j<=0) {
                            dayItemT.addClass("datepicker_prev_day_item__");
                            day = String(prevEndDate + j);
                            dayItemT.data("year", prevEndDateCls.obj.getFullYear())
                                .data("month", prevEndDateCls.obj.getMonth() + 1)
                                .data("day", day);
                        } else if(j > endDate) {
                            dayItemT.addClass("datepicker_next_day_item__");
                            day = String(j-endDate);
                            dayItemT.data("year", endDateCls.obj.getMonth() + 1 === 12 ?  endDateCls.obj.getFullYear() + 1 : endDateCls.obj.getFullYear())
                                .data("month", endDateCls.obj.getMonth() + 2 === 13 ? 1 : endDateCls.obj.getMonth() + 2)
                                .data("day", day);
                        } else {
                            dayItemT.addClass("datepicker_day_item__");
                            dayItemT.data("year", endDateCls.obj.getFullYear())
                                .data("month", endDateCls.obj.getMonth() + 1)
                                .data("day", day);
                        }

                        const date = NC.string.lpad(String(dayItemT.data("year")), 4, "0") +
                            NC.string.lpad(String(dayItemT.data("month")), 2, "0") +
                            NC.string.lpad(String(dayItemT.data("day")), 2, "0");

                        if(opts.minDate && Number(date) < Number(opts.minDate)) {
                            dayItemT.addClass("datepicker_min_date__");
                            dayItemT.tpBind("click", NC.event.disable);
                        } else if(opts.maxDate && Number(date) > Number(opts.maxDate)) {
                            dayItemT.addClass("datepicker_max_date__");
                            dayItemT.tpBind("click", NC.event.disable);
                        }

                        // holiday
                        const repeatDate = date.substring(4, 8);
                        const holidayValues = [];
                        if(opts.holiday.repeat && opts.holiday.repeat[repeatDate]) {
                            const repeatValue = opts.holiday.repeat[repeatDate];
                            if(NC.type(repeatValue) === "array") {
                                holidayValues.push(repeatValue.join(", "));
                            } else {
                                holidayValues.push(repeatValue);
                            }
                        }
                        if(opts.holiday.once && opts.holiday.once[date]) {
                            const onceValue = opts.holiday.once[date];
                            if(NC.type(onceValue) === "array") {
                                holidayValues.push(onceValue.join(", "));
                            } else {
                                holidayValues.push(onceValue);
                            }
                        }
                        if(!NC.isEmptyObject(holidayValues)) {
                            dayItemT.addClass("datepicker_holiday__").attr("title", holidayValues.join(", "));
                        }

                        daysPanel.append(dayItemT.text(day));
                    }

                    daysPanel.find(".datepicker_prev_day_item__, .datepicker_day_item__, .datepicker_next_day_item__").each(function(i, ele) {
                        setTimeout(function() {
                            N(ele).addClass("visible__");
                        }, i*10);
                    });

                    // automatic day selection
                    const dateVal = opts.context.val().replace(/\D/g,"");
                    if(!NC.string.isEmpty(dateVal) && dateVal.length === 8) {
                        const selDate = NC.date.strToDate(dateVal, dateFormat = NA.context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, ""));
                        daysPanel.find(".datepicker_day_item__:contains(" + String(Number(selDate.obj.formatDate("d"))) + "):eq(0)").addClass("datepicker_day_selected__");
                        if(!opts.monthChangeInput && Number(opts.lastSelectedDay) > endDate) {
                            daysPanel.find(".datepicker_day_item__:contains(" + String(endDate) + "):eq(0)").addClass("datepicker_day_selected__");
                        }
                    } else {
                        daysPanel.find(".datepicker_day_item__:contains(" + String(Number(d.formatDate("d"))) + "):eq(0)").addClass("datepicker_day_selected__");
                    }

                }
            });

            if(!opts.monthonly) {
                opts.contents.append(daysPanel);

                // Binds click event to day items
                daysPanel.on("click.datepicker", ".datepicker_day_item__, .datepicker_prev_day_item__, .datepicker_next_day_item__", function(e, ke) {
                    e.preventDefault();
                    const thisEle = N(this);

                    daysPanel.find(".datepicker_prev_day_item__.datepicker_day_selected__, .datepicker_day_item__.datepicker_day_selected__, .datepicker_next_day_item__.datepicker_day_selected__").removeClass("datepicker_day_selected__");
                    thisEle.addClass("datepicker_day_selected__");
                    const selDate = NC.date.strToDate(NC.string.lpad(String(thisEle.data("year")), 4, "0") +
                        NC.string.lpad(String(thisEle.data("month")), 2, "0") +
                        NC.string.lpad(String(thisEle.data("day")), 2, "0"), "Ymd");

                    opts.lastSelectedDay = thisEle.text();

                    // sets the date format by the global config
                    selDate.format = NA.context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");

                    let onSelectContinue;
                    if(opts.onSelect !== null) {
                        onSelectContinue = opts.onSelect.call(self, opts.context, selDate, opts.monthonly);
                    }
                    if(onSelectContinue === undefined || onSelectContinue === true) {
                        let dateFormat = selDate.format.replace(/[^Y|^m|^d]/g, "");
                        const yearVal = selDate.obj.formatDate("Y");
                        let dateVal = selDate.obj.formatDate(dateFormat);
                        if(yearVal.length === 3) {
                            let tempFormat = "";
                            N(dateFormat.split("")).each(function(i, formatChar) {
                                tempFormat += formatChar + "-";
                            });
                            dateVal = selDate.obj.formatDate(tempFormat).replace(yearVal, "0" + yearVal).replace(/-/g, "");
                        }
                        opts.context.val(dateVal);
                    }
                    opts.context.trigger("onSelect", [opts.context, selDate, opts.monthonly]);
                    self.hide(ke);
                });
            }

            const contextParentWrapEle = opts.context.closest("label,span");
            // append datepicker panel after context
            if(contextParentWrapEle.length > 0) {
                opts.contextWrapper = contextParentWrapEle.after(opts.contents);
            } else {
                opts.context.after(opts.contents);
            }

            return opts.contents;
        };

        static yearPaging = function(yearItems, currYear, addCnt, absolute) {
            // Date Object's year value must be greater 2 digits
            yearItems.removeClass("datepicker_curr_year__");
            let thisEle;
            let yearNum;
            yearItems.each(function(i) {
                thisEle = N(this);
                if(absolute !== undefined && absolute === true) {
                    yearNum = parseInt(currYear) + i;
                } else {
                    yearNum = parseInt(thisEle.text());
                }
                if(yearNum <= 100 - addCnt) {
                    thisEle.text(NC.string.lpad(String(100 + i), 4, "0"));
                } else {
                    thisEle.text(NC.string.lpad(String(yearNum + addCnt), 4, "0"));
                }
                if(thisEle.text() === String(currYear)) {
                    thisEle.addClass("datepicker_curr_year__");
                }
            });
        };

        static selectItems = function(opts, value, format, yearsPanel, monthsPanel, daysPanel) {
            if(value.length > 2 && value.length%2 !== 0) {
                value = (new Date()).formatDate(format);
            }

            const dateStrArr = NC.date.strToDateStrArr(value, format);
            const dateStrStrArr = NC.date.strToDateStrArr(value, format, true);

            // year item selection
            if(!isNaN(dateStrStrArr[0]) && dateStrStrArr[0].length === 4) {
                if(opts.yearsPanelPosition === "left") {
                    yearsPanel.find(".datepicker_year_item__").removeClass("datepicker_year_selected__");
                    NU.datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), dateStrArr[0], -2, true);
                    yearsPanel.find(".datepicker_year_item__:contains('" + NC.string.lpad(String(dateStrArr[0]), 4, "0") + "')").trigger("click");
                } else if(opts.yearsPanelPosition === "top") {
                    const yearItem = yearsPanel.find(".datepicker_year_item__");
                    if(yearItem.val() !== NC.string.lpad(String(dateStrArr[0]), 4, "0")) {
                        yearItem.val(NC.string.lpad(String(dateStrArr[0]), 4, "0"));
                        if(NC.string.isEmpty(yearItem.val())) {
                            yearItem.empty();
                            let startYear = dateStrArr[0]-opts.minYear;
                            let endYear = dateStrArr[0]+opts.maxYear;
                            if(startYear < 100) {
                                startYear = 100;
                                endYear = startYear + opts.maxYear;
                            }
                            for(let i=startYear;i<=endYear;i++) {
                                let selected = "";
                                if(i === dateStrArr[0]) {
                                    opts.currYear = dateStrArr[0];
                                    selected = 'selected="selected"';
                                }
                                yearItem.append('<option value="' + NC.string.lpad(String(i), 4, "0") +'" ' + selected + '>' + NC.string.lpad(String(i), 4, "0") +'</option>');
                            }
                        }
                        if(!NC.string.isEmpty(opts.context.val())) {
                            yearItem.trigger("change.datepicker");
                        }
                    }
                }
            }
            // month item selection
            if(!isNaN(dateStrStrArr[1]) && dateStrStrArr[1].length === 2) {
                monthsPanel.find(".datepicker_month_item__").removeClass("datepicker_month_selected__");
                if(!opts.monthonly) {
                    monthsPanel.find(".datepicker_month_item__:contains(" + String(dateStrArr[1]) + "):eq(0)").trigger("click.datepicker");
                } else {
                    monthsPanel.find(".datepicker_month_item__:contains(" + String(dateStrArr[1]) + "):eq(0)").addClass("datepicker_month_selected__");
                }
                if(opts.monthsPanelPosition === "top") {
                    opts.contents.find(".datepicker_top_months_panel__ .datepicker_month_item__").val(String(dateStrArr[1]));
                }
            }
            // day item selection
            if(!isNaN(dateStrStrArr[2]) && dateStrStrArr[2].length === 2) {
                daysPanel.find(".datepicker_prev_day_item__, .datepicker_day_item__, .datepicker_next_day_item__").removeClass("datepicker_day_selected__");
                daysPanel.find(".datepicker_day_item__:contains(" + String(dateStrArr[2]) + "):eq(0)").addClass("datepicker_day_selected__");
            }
        }

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        show() {
            const opts = this.options;

            const contextParentWrapEle = opts.context.closest("label,span");
            if((contextParentWrapEle.length === 0 && opts.context.next(".datepicker_contents__").length === 0)
                || (contextParentWrapEle.length > 0 && contextParentWrapEle.next(".datepicker_contents__").length === 0)) {
                N(N(".datepicker__").instance("datepicker")).each(function () {
                    if (this.options.contents.hasClass("visible__")) {
                        this.hide();
                    }
                });
                NU.datepicker.createContents.call(this);
            }

            // auto select datepicker items from before input value
            let dateStr;
            if(!NC.string.isEmpty(opts.context.val())) {
                dateStr = opts.context.val().replace(/[^0-9]/g, "");
            } else {
                dateStr = !opts.monthonly ? (new Date()).formatDate("Ymd") : (new Date()).formatDate("Ym");
            }

            NU.datepicker.selectItems(opts,
                dateStr,
                (!opts.monthonly ? NA.context.attr("data").formatter.date.Ymd() : NA.context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, ""),
                opts.contents.find(".datepicker_years_panel__"),
                opts.contents.find(".datepicker_months_panel__"),
                opts.contents.find(".datepicker_days_panel__"));

            if(opts.onBeforeShow !== null) {
                const result = opts.onBeforeShow.call(this, opts.context, opts.contents);
                if(result !== undefined && result === false) {
                    return this;
                }
            }
            opts.context.trigger("onBeforeShow", [opts.context, opts.contents]);

            // set datepicker position
            const formEle = opts.contents.closest(".form__");
            if(formEle.length > 0 && formEle.css("position") !== "relative") {
                this.formEleOrgPosition = formEle.css("position").replace("static", "");
                formEle.css("position", "relative");
            }
            const baseEle = opts.contextWrapper ? opts.contextWrapper : opts.context;
            N(window).on("resize.datepicker", function() {
                let formPaddingLeft = 0;
                baseEle.parentsUntil(formEle.parent()).each(function(i, ele) {
                    formPaddingLeft += parseInt(N(ele).css("padding-left")) + parseInt(N(ele).css("margin-left"));
                });
                let formPaddingRight = 0;
                baseEle.parentsUntil(formEle.parent()).each(function(i, ele) {
                    formPaddingRight += parseInt(N(ele).css("padding-right")) + parseInt(N(ele).css("margin-right"));
                });
                let leftOfs = baseEle.position().left;
                const tdEle = baseEle.closest("td");
                if(tdEle.length > 0) {
                    tdEle.css("display", "contents");
                    leftOfs = baseEle.position().left + formPaddingLeft;
                    tdEle.css("display", "");
                }

                let limitWidth;
                if(formEle.length > 0 && formEle.innerWidth() > opts.contents.outerWidth()) {
                    limitWidth = formEle.offset().left + parseInt(formEle.css("padding-left")) + formEle.width();
                } else {
                    limitWidth = (window.innerWidth ? window.innerWidth : N(window).width());
                }
                if(baseEle.offset().left + opts.contents.width() > limitWidth) {
                    opts.contents.css("left", (leftOfs + baseEle.outerWidth() - opts.contents.width()) + "px");
                    opts.contents.removeClass("orgin_left__").addClass("orgin_right__");
                } else {
                    opts.contents.css("left", leftOfs + "px");
                    opts.contents.removeClass("orgin_right__").addClass("orgin_left__");
                }
            }).trigger("resize.datepicker");

            const self = this;
            opts.contents.show(10, function() {
                N(this).removeClass("hidden__").addClass("visible__");
                N(this).one(NC.event.whichTransitionEvent(opts.contents), function(e){
                    N(document).off("click.datepicker").on("click.datepicker", function(e) {
                        opts.context.get(0).blur();
                        self.hide();
                    });

                    if(opts.onShow !== null) {
                        opts.onShow.call(self, opts.context, opts.contents);
                    }
                    opts.context.trigger("onShow", [opts.context, opts.contents]);
                }).trigger("nothing");
            });

            return this;
        };

        hide() {
            const opts = this.options;

            if(opts.contents.hasClass("visible__")) {
                const self = this;
                if(opts.onBeforeHide !== null) {
                    // arguments[0] - because of firefox, firefox does not have window.event object
                    const result = opts.onBeforeHide.call(this, opts.context, opts.contents, arguments.length > 0 ? arguments[0] : undefined);
                    if(result !== undefined && result === false) {
                        return this;
                    }
                }
                opts.context.trigger("onBeforeHide", [opts.context, opts.contents, arguments.length > 0 ? arguments[0] : undefined]);

                N(window).off("resize.datepicker");
                N(document).off("click.datepicker");
                opts.context.off("blur.datepicker");

                opts.contents.removeClass("visible__").addClass("hidden__");

                opts.contents.one(NC.event.whichTransitionEvent(opts.contents), function(e){
                    if(self.formEleOrgPosition !== undefined) {
                        N(this).closest(".form__").css("position", self.formEleOrgPosition);
                    }
                    N(this).remove();
                    if(opts.onHide !== null) {
                        opts.onHide.call(self, opts.context);
                    }
                    opts.context.trigger("onHide", [opts.context]);
                }).trigger("nothing");
            }

            return this;
        };

    }

    // Popup
    static popup = class {

        constructor(obj, opts) {
            this.options = {
                context : obj,
                url : null,
                title : null,
                button : true,
                modal : true,
                top : undefined,
                left : undefined,
                height : 0,
                width : 0,
                opener : null,
                closeMode : "hide",
                alwaysOnTop : false,
                "confirm" : true,
                overlayClose : true,
                escClose : true,
                onOk : null,
                onCancel : null,
                onBeforeShow : null,
                onShow : null,
                onBeforeHide : null,
                onHide : null,
                onBeforeRemove : null,
                onRemove : null,
                onOpen : null,
                onOpenData : null,
                onClose : null,
                onCloseData : null,
                onLoad : null,
                preload : false,
                dynPos : true,
                windowScrollLock : true,
                draggable : false,
                draggableOverflowCorrection : true,
                draggableOverflowCorrectionAddValues : {
                    top : 0,
                    bottom : 0,
                    left : 0,
                    right : 0
                },
                saveMemory : false
            };

            // To prevent "maximum call stack size exceeded" error in jQuery's extend method when define the opener option.
            let isOpenerHas = false;
            if(opts && opts.opener) {
                const opener = opts.opener;
                opts.opener = undefined;
                isOpenerHas = true;
            }

            try {
                jQuery.extend(true, this.options, NA.context.attr("ui").popup);
            } catch (e) {
                throw NC.error("NU.popup", e);
            }

            if(opts !== undefined) {
                if(NC.type(opts) === "string") {
                    this.options.url = opts;
                }
            } else {
                if(arguments.length === 1 && NC.isPlainObject(obj)) {
                    opts = obj;
                    obj = N(window);
                }
            }

            // Wraps the global event options in NA.config and event options for this component.
            NU.ui.utils.wrapHandler(opts, "popup", "onOk");
            NU.ui.utils.wrapHandler(opts, "popup", "onCancel");
            NU.ui.utils.wrapHandler(opts, "popup", "onBeforeShow");
            NU.ui.utils.wrapHandler(opts, "popup", "onShow");
            NU.ui.utils.wrapHandler(opts, "popup", "onBeforeHide");
            NU.ui.utils.wrapHandler(opts, "popup", "onHide");
            NU.ui.utils.wrapHandler(opts, "popup", "onBeforeRemove");
            NU.ui.utils.wrapHandler(opts, "popup", "onRemove");
            NU.ui.utils.wrapHandler(opts, "popup", "onOpen");
            NU.ui.utils.wrapHandler(opts, "popup", "onClose");
            NU.ui.utils.wrapHandler(opts, "popup", "onLoad");

            jQuery.extend(true, this.options, opts);

            // To prevent "maximum call stack size exceeded" error in jQuery's extend method when define the opener option.
            if(isOpenerHas) {
                opts.opener = opener;
                this.options.opener = opts.opener;
                opener = undefined;
            }

            // if title option value is undefined
            this.options.title = opts !== undefined ? NC.string.trimToNull(opts.title) : null;

            if(this.options.url !== null || (this.options.preload && this.options.closeMode === "remove")) {
                if(this.options.preload) {
                    NU.popup.loadContent.call(this, function(cont, context) {
                        // this callback function is for async page load
                        this.options.context = context;

                        // set this instance to context element
                        this.options.context.instance("popup", this);

                        this.options.isLoaded = true;
                    });
                }
            } else {
                NU.popup.wrapEle.call(this);

                // set this instance to context element
                this.options.context.instance("popup", this);
            }

            return this;
        };

        static wrapEle = function() {
            const opts = this.options;
            opts.context.hide();

            // use alert
            // opts.context is alert message
            opts.html = true;
            opts.msg = opts.context;

            if(opts.title === null) {
                opts.title = opts.context.attr("title");
            }
            if(opts.title !== null) {
                opts.context.removeAttr("title");
            }

            NU.popup.alert = N(window).alert(opts);
            NU.popup.alert.options.msgContext.addClass("popup_overlay__");
            NU.popup.alert.options.msgContents.addClass("popup__");

            if(opts.saveMemory) {
                NU.popup.alert.options.msg = null;
            }
        };

        static loadContent = function(callback) {
            const opts = this.options;
            const self = this;

            new NA.comm({
                url : opts.url,
                contentType : "text/html; charset=UTF-8",
                dataType : "html",
                type : "GET"
            }).submit(function(page) {
                // set loaded page instance to options.context
                opts.context = N(page);

                // set title
                if(opts.title === null) {
                    opts.title = opts.context.filter(":not('style, script'):last").attr("title");
                    if(opts.title !== null) {
                        opts.context.filter(":not('style, script'):last").removeAttr("title");
                    }
                }

                // opts.context is alert message;
                opts.html = true;
                opts.msg = opts.context;
                if(opts.onRemove != null) {
                    const orgFn = opts.onRemove;
                    opts.onRemove = function() {
                        opts.context = null;
                        return orgFn.apply(this, arguments);
                    }
                } else {
                    opts.onRemove = function() {
                        opts.context = null;
                    };
                }

                let opener;
                if(opts.opener) {
                    opener = opts.opener;
                    opts.opener = undefined;
                }

                self.alert = N(window).alert(opts);

                if(opener) {
                    opts.opener = opener;
                    opener = undefined;
                }
                self.alert.options.msgContext.addClass("popup_overlay__");
                self.alert.options.msgContents.addClass("popup__");

                if(opts.saveMemory) {
                    self.alert.options.msg = null;
                }

                // set request target
                this.request.options.target = opts.context.parent();

                const cont = opts.context.filter(".view_context__:last").instance("cont");

                // set popup instance to popup's Controller
                if(cont !== undefined) {
                    // set caller attribute in Controller in tab content, that is NU.popup instance
                    cont.caller = self;

                    // set opener to popup's Controller
                    if(opts.opener != null) {
                        cont.opener = opts.opener;
                    }

                    // triggering "init" method
                    NA.cont.trInit.call(this, cont, this.request);

                    callback.call(self, cont, opts.context);
                } else {
                    callback.call(self, cont, opts.context);
                }

                // execute the "onLoad" event handler.
                if(opts.onLoad !== null) {
                    opts.onLoad.call(this, cont);
                }
            });

        };

        static popOpen = function(onOpenData, cont) {
            const opts = this.options;
            const self = this;

            if(opts.url === null) {
                opts.context.show();
            }
            self.alert.show();

            const onOpenProcFn__ = function() {
                // execute "onOpen" event
                if(opts.onOpen !== null) {
                    opts.onOpenData = onOpenData !== undefined ? onOpenData : null;
                    if(opts.context.filter(".view_context__:last").instance("cont")[opts.onOpen] !== undefined) {
                        opts.context.filter(".view_context__:last").instance("cont")[opts.onOpen](onOpenData);
                    } else {
                        NC.warn("[NU.popup.popOpen]The onOpen event handler(" + opts.onOpen + ") is not defined on the Controller(NA.cont) of the NU.popup.");
                    }
                }
            };

            onOpenProcFn__();
        };

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        open(onOpenData) {
            const opts = this.options;
            const self = this;

            if(onOpenData === undefined && opts.onOpenData !== null) {
                onOpenData = opts.onOpenData;
            }

            if(this.options.url !== null && ((!opts.preload && !opts.isLoaded) || !opts.isLoaded)) {
                opts.isLoaded = false;
                NU.popup.loadContent.call(this, function(cont, context) {
                    // this callback function is for async page load
                    opts.context = context;
                    opts.context.instance("popup", this);

                    NU.popup.popOpen.call(self, onOpenData, cont);

                    if(opts.closeMode !== "remove") {
                        opts.isLoaded = true;
                    }
                });
            } else {
                NU.popup.popOpen.call(this, onOpenData);
                if(opts.preload && opts.closeMode === "remove") {
                    opts.isLoaded = false;
                }
            }
            return this;
        };

        close(onCloseData) {
            const opts = this.options;

            if(onCloseData === undefined && opts.onCloseData !== null) {
                onCloseData = opts.onCloseData;
            }

            // execute the "onClose" event handler.
            if(opts.onClose !== null) {
                opts.onClose.call(this, onCloseData);
            }

            this.alert[opts.closeMode]();

            return this;
        };

        changeEvent(name, callback) {
            this.options[name] = callback;
            this.alert.options[name] = this.options[name];

            return this;
        };

        remove() {
            this.alert.remove();
            return this;
        }

    }

    // Tab
    static tab = class {

        constructor(obj, opts) {
            this.options = {
                context : obj.length > 0 ? obj : null,
                links : obj.length > 0 ? obj.find(">ul>li") : null,
                tabOpts : [], // tabOpts : [{ url: undefined, active: false, preload: false, onOpen: undefined, disable : false, stateless : false }]
                randomSel : false,
                opener : null,
                onActive : null,
                onLoad : null,
                blockOnActiveWhenCreate : false,
                contents : obj.length > 0 ? obj.find(">div") : null,
                tabScroll : false,
                tabScrollCorrection : {
                    tabContainerWidthCorrectionPx : 0,
                    tabContainerWidthReCalcDelayTime : 0
                }
            };

            // To prevent "maximum call stack size exceeded" error in jQuery's extend method when define the opener option.
            let isOpenerHas = false;
            if(opts && opts.opener) {
                const opener = opts.opener;
                opts.opener = undefined;
                isOpenerHas = true;
            }

            try {
                jQuery.extend(true, this.options, NA.context.attr("ui").tab);
            } catch (e) {
                throw NC.error("NU.tab", e);
            }

            if (NC.isPlainObject(obj)) {
                // Wraps the global event options in NA.config and event options for this component.
                NU.ui.utils.wrapHandler(opts, "tab", "onActive");
                NU.ui.utils.wrapHandler(opts, "tab", "onLoad");

                jQuery.extend(true, this.options, obj);
                this.options.context = N(obj.context);
            }
            this.options.links = this.options.context.find(">ul>li");
            this.options.contents = this.options.context.find(">div");

            const self = this;
            let opt;
            if(this.options.tabOpts.length === 0) {
                this.options.links.each(function(i) {
                    const thisEle = N(this);
                    opt = NC.element.toOpts(thisEle);
                    if(opt === undefined) {
                        opt = {};
                    }
                    opt.target = thisEle.find("a").attr("href");
                    self.options.tabOpts.push(opt);
                });
            }

            jQuery.extend(this.options, opts);

            // To prevent "maximum call stack size exceeded" error in jQuery's extend method when define the opener option.
            if(isOpenerHas) {
                opts.opener = opener;
                this.options.opener = opts.opener;
                opener = undefined;
            }

            // set style class name to context element
            this.options.context.addClass("tab__");

            NU.tab.wrapEle.call(this);

            // set this instance to context element
            this.options.context.instance("tab", this);
        };

        static wrapEle = function() {
            const opts = this.options;
            // hide div contents
            opts.contents.hide();

            const self = this;

            let defSelIdx;
            N(opts.tabOpts).each(function(i) {
                if(this.disable) {
                    self.disable(i);
                } else {
                    self.enable(i);
                }

                // set default select index
                if(this.active === true) {
                    // active option select
                    defSelIdx = i;
                } else {
                    if(opts.randomSel) {
                        // random select
                        defSelIdx = Math.floor(Math.random() * opts.links.length);
                    } else {
                        // default select
                        if(i === 0) {
                            defSelIdx = i;
                        }
                    }
                }

                if(this.preload) {
                    if(this.url !== undefined) {
                        NU.tab.loadContent.call(self, this.url, i, function(cont, selContentEle_) {
                            // execute "onLoad" event
                            if(opts.onLoad !== null) {
                                opts.onLoad.call(self, i, opts.links.eq(i), selContentEle_, cont);
                            }
                        });
                    }
                }
            });

            let marginLeft;
            opts.links.on("mousedown.tab" + (NC.browser.scrollbarWidth() > 0 ? "touchstart.tab" : ""), function(e) {
                e.preventDefault();

                marginLeft = parseInt(opts.context.find(">ul").css("margin-left"));
            });

            opts.links.on("click.tab" + (NC.browser.scrollbarWidth() > 0 ? "touchend.tab" : ""), function(e, onOpenData, isFirst) {
                e.preventDefault();

                if(marginLeft !== undefined && Math.abs(parseInt(opts.context.find(">ul").css("margin-left")) - marginLeft) > 15 && isFirst !== true) {
                    marginLeft = undefined;
                    return false;
                }
                marginLeft = undefined;

                if(!N(this).hasClass("tab_active__")) {
                    const selTabEle = N(this);
                    const selTabIdx = opts.beforeOpenIdx = opts.links.index(this);
                    const selDeclarativeOpts = opts.tabOpts[selTabIdx];
                    const selContentEle = opts.contents.eq(selTabIdx);

                    opts.links.filter(".tab_active__").removeClass("tab_active__");
                    selTabEle.addClass("tab_active__");

                    const onActiveProcFn__ = function() {
                        // execute "onActive" event
                        if(opts.onActive !== null) {
                            if(opts.blockOnActiveWhenCreate === false || (opts.blockOnActiveWhenCreate === true && isFirst !== true)) {
                                opts.onActive.call(self, selTabIdx, selTabEle, selContentEle, opts.links, opts.contents);
                            }
                        }
                    }

                    const onOpenProcFn__ = function() {
                        // execute "onOpen"(declarative option) event
                        if(selDeclarativeOpts.onOpen !== undefined) {
                            const cont = selContentEle.children(".view_context__:last").instance("cont");
                            if(cont[selDeclarativeOpts.onOpen] !== undefined) {
                                //thisDeclarativeOpts.onOpen
                                cont[selDeclarativeOpts.onOpen](onOpenData);
                            } else {
                                NC.warn("[NU.tab.wrapEle]The onOpen event handler(" + selDeclarativeOpts.onOpen + ") is not defined on the Controller(NA.cont) of the tab(NU.tab)'s contents.");
                            }
                        }
                    }

                    // Synchronize the animation and page load
                    const visibleDefer = jQuery.Deferred();
                    const loadDefer = jQuery.Deferred();
                    jQuery.when(visibleDefer, loadDefer).done(function() {
                        opts.context.dequeue("open");
                    });

                    // hide tab contents
                    const beforeActivatedContent = opts.contents.filter(".tab_content_active__");
                    if(beforeActivatedContent.length > 0) {
                        let isRelative = false;
                        if(opts.context.css("position") !== "relative") {
                            opts.context.css("position", "relative");
                            isRelative = true;
                        }
                        beforeActivatedContent.removeClass("tab_content_active__ visible__").one(NC.event.whichTransitionEvent(beforeActivatedContent), function(e){
                            N(this).hide();
                            if(isRelative) {
                                opts.context.css("position", "");
                            }
                            visibleDefer.resolve();
                        }).addClass("hidden__").trigger("nothing");
                    } else {
                        visibleDefer.resolve();
                    }

                    if(!selDeclarativeOpts.preload && selDeclarativeOpts.url !== undefined && !selContentEle.data("loaded") || selDeclarativeOpts.stateless) {
                        // show tab contents
                        selContentEle.show(0, function() {
                            selContentEle.addClass("visible__");
                        }).removeClass("hidden__");

                        // load content
                        NU.tab.loadContent.call(self, selDeclarativeOpts.url, selTabIdx, function(cont, selContentEle_) {
                            selContentEle_.addClass("tab_content_active__");

                            // execute "onLoad" event
                            if(opts.onLoad !== null) {
                                opts.onLoad.call(self, selTabIdx, selTabEle, selContentEle_, cont);
                            }

                            onActiveProcFn__();
                            onOpenProcFn__();

                            selContentEle_.data("loaded", true);
                            loadDefer.resolve();
                        }, isFirst);
                    } else {
                        selContentEle.addClass("tab_content_active__");

                        onActiveProcFn__();
                        onOpenProcFn__();

                        // show tab contents
                        selContentEle.show(0, function() {
                            selContentEle.addClass("visible__");

                            loadDefer.resolve();
                        }).removeClass("hidden__");
                    }
                }
            });

            if(opts.tabScroll) {
                NU.tab.wrapScroll.call(this);
            }

            // select tab
            this.open(defSelIdx, undefined, true);
        };

        static wrapScroll = function() {
            const opts = this.options;
            const eventNameSpace = ".tab.scroll";
            const tabContainerEle = opts.context.find(">ul").addClass("effect__");

            const scrollBtnEles = opts.context.find(">a").hide();
            let prevBtnEle;
            let nextBtnEle;
            const liMarginRight = parseInt(NC.string.trimToZero(tabContainerEle.find(">li:first").css("margin-right")));
            let lastDistance = liMarginRight;
            let prevBtnEleOuterWidth = 0;
            let nextBtnEleOuterWidth = 0;
            let tabNativeScroll;

            if(scrollBtnEles.length > 1) {
                opts.context.css("position", "relative");
                scrollBtnEles.css({
                    "position" : "absolute",
                    "top" : 0
                });

                prevBtnEle = scrollBtnEles.eq(0).addClass("tab_scroll_prev__").css("left", 0).on("click" + eventNameSpace,  function(e) {
                    e.preventDefault();
                    if(NC.browser.scrollbarWidth() > 0) {
                        tabContainerEle.addClass("effect__");
                        lastDistance = prevBtnEleOuterWidth + liMarginRight;
                        tabContainerEle.css("margin-left", lastDistance + "px");
                        nextBtnEle.removeClass("disabled__");
                        prevBtnEle.addClass("disabled__");
                    } else {
                        tabNativeScroll.animate({
                            scrollLeft: 0
                        }, 300, "swing");
                    }
                });
                prevBtnEleOuterWidth = prevBtnEle.outerWidth();

                nextBtnEle = scrollBtnEles.eq(1).addClass("tab_scroll_next__").css("right", 0).on("click" + eventNameSpace,  function(e) {
                    e.preventDefault();
                    if(NC.browser.scrollbarWidth() > 0) {
                        tabContainerEle.addClass("effect__");
                        lastDistance = opts.context.outerWidth() - tabContainerEle.width() - nextBtnEleOuterWidth + liMarginRight;
                        tabContainerEle.css("margin-left", lastDistance + "px");
                        prevBtnEle.removeClass("disabled__");
                        nextBtnEle.addClass("disabled__");
                    } else {
                        tabNativeScroll.animate({
                            scrollLeft: tabContainerEle.outerWidth()
                        }, 300, "swing");
                    }
                });
                nextBtnEleOuterWidth = nextBtnEle.outerWidth();

                lastDistance = prevBtnEleOuterWidth + liMarginRight;
            }

            N(window).on("resize" + eventNameSpace, function() {
                if(!tabContainerEle.is(":visible")) {
                    return false;
                }

                let ulWidth = 0;
                opts.links.each(function() {
                    ulWidth += (N(this).outerWidth() + parseInt(NC.string.trimToZero(N(this).css("margin-left"))) + parseInt(NC.string.trimToZero(N(this).css("margin-right"))));
                });
                ulWidth += opts.tabScrollCorrection.tabContainerWidthCorrectionPx;

                if(ulWidth > 0 && ulWidth > opts.context.width() + liMarginRight) {
                    if(NC.browser.scrollbarWidth() > 0) {
                        opts.context.css("overflow", "hidden");
                        if(tabContainerEle.parent().hasClass("tab_native_scroll__")) {
                            tabContainerEle.unwrap();
                        }
                        if(scrollBtnEles.length > 1 && prevBtnEleOuterWidth > 0 && nextBtnEleOuterWidth > 0) {
                            tabContainerEle.css("margin-left", (prevBtnEleOuterWidth + liMarginRight) + "px");
                            prevBtnEle.addClass("disabled__");
                            scrollBtnEles.show();
                        }
                    } else {
                        if(!tabContainerEle.parent().hasClass("tab_native_scroll__")) {
                            tabNativeScroll = tabContainerEle.wrap('<div class="tab_native_scroll__"></div>').parent();
                            if(prevBtnEleOuterWidth > 0) {
                                tabNativeScroll.css("margin-left", prevBtnEleOuterWidth + liMarginRight);
                            }
                            if(nextBtnEleOuterWidth > 0) {
                                tabNativeScroll.css("margin-right", nextBtnEleOuterWidth - liMarginRight);
                            }
                        }
                        if(scrollBtnEles.length > 1) {
                            scrollBtnEles.show();
                        }
                    }

                    tabContainerEle.addClass("tab_scroll__").width(ulWidth);
                } else {
                    if(scrollBtnEles.length > 1 && prevBtnEleOuterWidth > 0 && nextBtnEleOuterWidth > 0) {
                        scrollBtnEles.hide();
                        tabContainerEle.css("margin-left", "");
                        prevBtnEle.removeClass("disabled__");
                    }

                    if(NC.browser.scrollbarWidth() > 0) {
                        opts.context.css("overflow", "");
                    }

                    if(tabContainerEle.parent().hasClass("tab_native_scroll__")) {
                        tabContainerEle.unwrap();
                    }

                    tabContainerEle.css("width", "");
                }

            }).trigger("resize" + eventNameSpace);

            if(opts.tabScrollCorrection.tabContainerWidthReCalcDelayTime > 0) {
                setTimeout(function() {
                    N(window).trigger("resize" + eventNameSpace);
                }, opts.tabScrollCorrection.tabContainerWidthReCalcDelayTime);
            }

            if(NC.browser.scrollbarWidth() > 0) {
                let sPageX;
                let prevDefGap = 0;
                let nextDefGap = 0;
                let isMoved = false;
                if(scrollBtnEles.length > 1) {
                    prevDefGap = prevBtnEleOuterWidth;
                    nextDefGap = nextBtnEleOuterWidth;
                }

                NU.ui.draggable.events.call(tabContainerEle, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) { // start
                    tabContainerEle_.removeClass("effect__");
                    if(tabContainerEle_.outerWidth() <= opts.context.innerWidth()) {
                        return false;
                    }
                    sPageX = pageX - lastDistance;
                }, function(e, tabContainerEle_, pageX, pageY) { // move
                    const distance = (sPageX - pageX) * -1;
                    if(distance > prevDefGap || opts.context.outerWidth() >= tabContainerEle_.width() + nextDefGap + distance) {
                        return false;
                    } else {
                        lastDistance = distance + liMarginRight;
                        tabContainerEle_.css("margin-left", distance + "px");
                        isMoved = true;
                    }
                }, function(e, tabContainerEle_) { //end
                    if(isMoved) {
                        if(lastDistance + (scrollBtnEles.length > 1 ? 0 : 30) >= 0 && lastDistance <= prevDefGap) {
                            if(scrollBtnEles.length > 1) {
                                lastDistance = prevDefGap;
                                if(prevBtnEleOuterWidth > 0 && nextBtnEleOuterWidth > 0) {
                                    lastDistance += liMarginRight;
                                }
                                nextBtnEle.removeClass("disabled__");
                                prevBtnEle.addClass("disabled__");
                            } else {
                                lastDistance = 0;
                                if(prevBtnEleOuterWidth > 0 && nextBtnEleOuterWidth > 0) {
                                    lastDistance += liMarginRight;
                                }
                            }
                            tabContainerEle_.addClass("effect__").css("margin-left", lastDistance + "px");
                            isMoved = false;
                        } else if(nextDefGap + (scrollBtnEles.length > 1 ? 0 : 30) >= tabContainerEle_.width() - (opts.context.outerWidth() + lastDistance * -1)) {
                            lastDistance = (tabContainerEle_.width() - opts.context.outerWidth() - 1) * -1;
                            if(scrollBtnEles.length > 1) {
                                lastDistance -= nextDefGap;
                                prevBtnEle.removeClass("disabled__");
                                nextBtnEle.addClass("disabled__");
                            }
                            tabContainerEle_.addClass("effect__").css("margin-left", lastDistance + "px");
                            isMoved = false;
                        } else {
                            scrollBtnEles.removeClass("disabled__");
                        }
                    }
                });
            }
        };

        static loadContent = function(url, targetIdx, callback, isFirst) {
            const opts = this.options;
            const self = this;
            const selContentEle = opts.contents.eq(targetIdx);

            new NA.comm({
                url : url,
                contentType : "text/html; charset=UTF-8",
                dataType : "html",
                type : "GET",
                urlSync : !isFirst,
                target : selContentEle
            }).submit(function(page) {
                const cont = selContentEle.html(page).children(".view_context__:last").instance("cont");

                // set tab instance to tab contents Controller
                if(cont !== undefined) {
                    // set caller attribute in controller in tab content that is NU.tab instance
                    cont.caller = self;

                    // set opener to popup's Controller
                    if(opts.opener != null) {
                        cont.opener = opts.opener;
                    }

                    // triggering "init" method
                    NA.cont.trInit.call(this, cont, this.request);

                    callback.call(this, cont, selContentEle);
                } else {
                    callback.call(this, cont, selContentEle);
                }

                const activeTabEle = opts.links.eq(targetIdx);
            });
        };

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        open(idx, onOpenData, isFirst) {
            const opts = this.options;
            if(idx !== undefined) {
                if(opts.beforeOpenIdx !== idx) {
                    opts.context.queue("open", function() {
                        if(onOpenData !== undefined) {
                            N(opts.links.get(idx)).trigger("click.tab", [onOpenData, isFirst]);
                        } else {
                            N(opts.links.get(idx)).trigger("click.tab", [undefined, isFirst]);
                        }
                    });
                    clearTimeout(opts.openTime);
                    opts.openTime = setTimeout(function() {
                        opts.context.dequeue("open");
                    }, 0);
                }
                opts.beforeOpenIdx = idx;

                if(opts.tabScroll) {
                    const tabContainerEle = opts.context.find(">ul");
                    if(tabContainerEle.outerWidth() > opts.context.innerWidth()) {
                        let marginLeft = parseInt(tabContainerEle.css("margin-left")) - N(opts.links.get(idx)).position().left + (opts.context.innerWidth() / 2 - N(opts.links.get(idx)).outerWidth() / 2);
                        const prevBtnEle = opts.context.find(">.tab_scroll_prev__");
                        const nextBtnEle = opts.context.find(">.tab_scroll_next__");

                        if(marginLeft > opts.context.find(">.tab_scroll_prev__").outerWidth()) {
                            marginLeft = prevBtnEle.length > 0 ? prevBtnEle.outerWidth() : 0;
                            nextBtnEle.removeClass("disabled__");
                            prevBtnEle.addClass("disabled__");
                        } else if(opts.context.innerWidth() > tabContainerEle.outerWidth() + marginLeft) {
                            marginLeft = -(tabContainerEle.outerWidth() - opts.context.innerWidth() + (nextBtnEle.length > 0 ? nextBtnEle.outerWidth() : 0) - 1);
                            prevBtnEle.removeClass("disabled__");
                            nextBtnEle.addClass("disabled__");
                        } else {
                            prevBtnEle.removeClass("disabled__");
                            nextBtnEle.removeClass("disabled__");
                        }
                        tabContainerEle.removeClass("effect__").addClass("effect__").css("margin-left", marginLeft + "px");
                    }
                }
            } else {
                if(opts.links.index(opts.links.filter(".tab_active__")) === opts.beforeOpenIdx) {
                    return {
                        index : opts.links.index(opts.links.filter(".tab_active__")),
                        tab : opts.links.filter(".tab_active__"),
                        content : opts.context.find("> div.tab_content_active__"),
                        cont : opts.context.find("> div.tab_content_active__ > .view_context__").instance("cont")
                    }
                } else {
                    return {
                        index : opts.beforeOpenIdx,
                        tab : "Tab content has not yet been loaded.",
                        content : "Tab content has not yet been loaded.",
                        cont : "Tab content has not yet been loaded."
                    }
                }
            }
            return this;
        };

        disable(idx) {
            if(idx !== undefined) {
                N(this.options.links.get(idx))
                    .off("click.tab.disable")
                    .off("touchstart.tab.disable")
                    .off("touchend.tab.disable")
                    .tpBind("click.tab.disable", NC.event.disable)
                    .tpBind("touchstart.tab.disable", NC.event.disable)
                    .tpBind("touchend.tab.disable", NC.event.disable)
                    .addClass("tab_disabled__");
            }
            return this;
        };

        enable(idx) {
            if(idx !== undefined) {
                N(this.options.links.get(idx))
                    .off("click", NC.event.disable)
                    .off("touchstart", NC.event.disable)
                    .off("touchend", NC.event.disable)
                    .removeClass("tab_disabled__");
            }
            return this;
        };

        cont(idx) {
            const opts = this.options;
            let cont;
            if(idx !== undefined) {
                cont = opts.context.find("> div:eq(" + String(idx) + ") > .view_context__").instance("cont");
            } else {
                cont = opts.context.find("> .tab_content_active__ > .view_context__").instance("cont");
            }

            if(cont === undefined) {
                NC.warn("Tab content has not been loaded yet or Controller(NA.cont) object is missing.");
            }

            return cont;
        };

    }

    // Select
    static select = class {

        constructor(data, opts) {
            this.options = {
                data : NC.type(data) === "array" ? N(data) : data,
                context : null,
                key : null,
                val : null,
                append : true,
                direction : "h", // direction : h(orizontal), v(ertical)
                type : 0, // type : 1: select, 2: select[multiple='multiple'], 3: radio, 4: checkbox
                template : null
            };

            try {
                jQuery.extend(this.options, NA.context.attr("ui").select);
            } catch (e) {
                throw NC.error("NU.select", e);
            }
            jQuery.extend(this.options, NC.element.toOpts(this.options.context));

            if (NC.isPlainObject(opts)) {
                jQuery.extend(this.options, opts);
                if(NC.type(this.options.data) === "array") {
                    this.options.data = N(opts.data);
                }
                this.options.context = N(opts.context);
            } else {
                this.options.context = N(opts);
            }
            this.options.template = this.options.context;

            NU.select.wrapEle.call(this);

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
                if(NC.type(idxs) !== "array") {
                    idxs = [idxs];
                }
                return N(idxs).map(function() {
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
                opts.data = NC.type(data) === "array" ? N(data) : data;
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
                    let container = N('<form class="select_input_container__" style="display: inline;" />');
                    if (opts.direction === "h") {
                        container.addClass("select_input_horizontal__");
                    } else if (opts.direction === "v") {
                        container.addClass("select_input_vertical__");
                    }
                    let labelEle;
                    let labelTextEle
                    opts.data.each(function(i, rowData) {
                        labelEle = N('<label class="select_input_label__ ' + id + "_" + String(i) + '__"></label>');
                        labelTextEle = N('<span>' + rowData[opts.key] + '</span>');
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
                const spltSepa = NA.context.attr("core").spltSepa;
                const rsltStr = spltSepa + (NC.type(rslt) === "array" ? rslt.join(spltSepa) : String(rslt)) + spltSepa;
                const rsltArr = [];
                (opts.type === 1 || opts.type === 2 ? selectSiblingEles : selectEles).each(function(i) {
                    if(rsltStr.indexOf(spltSepa + this.value + spltSepa) > -1) {
                        rsltArr.push(i);
                    }
                });
                return rsltArr.length > 0 ? rsltArr.length === 1 ? rsltArr[0] : rsltArr : -1;
            }

            const vals = [];
            N(NC.type(idx) === "number" ? [idx] : idx).each(function() {
                vals.push((opts.type === 1 || opts.type === 2 ? selectSiblingEles : selectEles).get(this).value);
            });
            selectEles.vals(vals);

            return this;
        };

        val(val) {
            const opts = this.options;

            if(!NC.isEmptyObject(opts.data)) {
                const rtnVal = N(opts.type === 3 || opts.type === 4
                    ? this.options.context.closest(".select_input_container__").find(":input") : this.options.context).vals(val);
                if(val === undefined) {
                    return rtnVal;
                }
            } else {
                NC.warn("[NU.select.prototype.val]There is no data bound to the NU.select component.");
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
    static form = class {

        constructor(data, opts) {
            this.options = {
                data : NC.type(data) === "array" ? N(data) : data,
                row : -1,
                context : null,
                validate : true,
                autoUnbind : false,
                state : null, // add, bind, revert, update
                html : false,
                addTop : true,
                fRules : null,
                vRules : null,
                extObj : null, // extObj : for NU.list or NU.grid
                extRow : -1, // extRow : for NU.list or NU.grid
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
                jQuery.extend(this.options, NA.context.attr("ui").form);
            } catch (e) {
                throw NC.error("NU.form", e);
            }

            if (NC.isPlainObject(opts)) {
                // Wraps the global event options in NA.config and event options for this component.
                NU.ui.utils.wrapHandler(opts, "form", "onBeforeBindValue");
                NU.ui.utils.wrapHandler(opts, "form", "onBindValue");
                NU.ui.utils.wrapHandler(opts, "form", "onBeforeBind");
                NU.ui.utils.wrapHandler(opts, "form", "onBind");

                //convert data to wrapped set
                opts.data = NC.type(opts.data) === "array" ? N(opts.data) : opts.data;

                jQuery.extend(this.options, opts);
                if(NC.type(this.options.context) === "string") {
                    this.options.context = N(this.options.context);
                }
                if(opts.row === undefined) {
                    this.options.row = 0;
                }
            } else {
                this.options.row = 0;
                this.options.context = N(opts);
            }

            // for unbind
            if(this.options.unbind) {
                if(this.options.context !== null) {
                    this.options.InitialData = NC.element.toData(this.options.context.find("[id]").not(":button"));
                }
            }

            // set style class name to context element
            this.options.context.addClass("form__");

            if(this.options.revert) {
                this.options.revertData = jQuery.extend({}, this.options.data[this.options.row]);
            }

            // set this instance to context element
            this.options.context.instance("form", this);

            // register this to ND.ds for realtime data synchronization
            if(this.options.extObj === null) {
                ND.ds.instance(this, true);
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
                        N().validator(opts.vRules !== null ? opts.vRules : ele);

                        if(isTextInput && NC.isEmptyObject(ele.events("focusout", "form.validate"))) {
                            ele[opts.tpBind ? "tpBind" : "on"]("focusout.form.validate", function() {
                                const currEle = N(this);
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
                        const currEle = N(this);
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
                                ND.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, currEle.attr("id"));
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
                            N(this).trigger("focusout.form.validate");
                            // notify data changed
                            N(this).trigger("focusout.form.dataSync");
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
                        N(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);

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
                                const currEle = N(this);
                                if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || (opts.validate && !currEle.hasClass("validate_false__")))) {
                                    currEle.trigger(formats[0] + ".formatter");
                                }
                            });
                        }

                        if(NC.isEmptyObject(ele.events(eventNames[1], "form." + formats[1]))) {
                            ele[bindMethod](eventNames[1] + ".form." + formats[1], function() {
                                const currEle = N(this);
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
                opts.data = NC.type(data) === "array" ? N(data) : data;
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

                const spltSepa = NA.context.attr("core").spltSepa;
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

                    if(NC.string.isEmpty(key)) {
                        NC.warn('[NU.form.bind]Within the context, there is an element with an id attribute value of ""(blank).');
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
                        type = NC.string.trimToEmpty(ele.attr("type")).toLowerCase();
                        if (NU.ui.utils.isTextInput(tagName, type)) {
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
                                N(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);
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
                                    N().validator(opts.vRules !== null ? opts.vRules : eles.filter(".select_template__"));
                                }
                            }

                            //dataSync
                            eles.off("click.form.dataSync select.form.dataSync");
                            eles.on("click.form.dataSync select.form.dataSync", function(e) {
                                const currEle = N(this);
                                let currEles = opts.context.find("[name='" + currEle.attr("name") + "']");
                                if(currEles.length === 0) {
                                    currEles = N(this);
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
                                        ND.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, currKey);
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
                        type = NC.string.trimToEmpty(ele.attr("type")).toLowerCase();
                        if (NU.ui.utils.isTextInput(tagName, type)) {
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

            const extractedData = NC.element.toData(opts.context.find(":input:not(:button)"));
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

            // row index of NU.grid's form is 0;
            if(opts.extObj !== null) {
                opts.data = N(opts.data[opts.row]);
                opts.row = 0;

                // for scroll paging
                // just +1 is inappropriate on android 4.4.2 webkit
                const rowEleLength = opts.extObj.options.context.find(opts.extObj instanceof NU.grid ? ">tbody" : ">li").length;
                const pagingSize = opts.extObj.options.scrollPaging.size;
                const rest = rowEleLength % pagingSize;
                opts.extObj.options.scrollPaging.idx = (rowEleLength / pagingSize) * pagingSize - pagingSize + rest;

                // for rowHandlerBeforeBind of NU.list and NU.grid
                if(opts.extObj.options.rowHandlerBeforeBind !== null) {
                    opts.extObj.options.rowHandlerBeforeBind.call(opts.extObj, opts.extRow, opts.context, opts.data[opts.row]);
                }
            }

            // Set revert data
            if(opts.revert) {
                opts.revertData = jQuery.extend({}, opts.data[opts.row]);
            }

            this.bind(opts.row, opts.state);

            ND.ds.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);

            return this;
        };

        remove() {
            const opts = this.options;

            if (opts.data[opts.row].rowStatus === "insert") {
                opts.data.splice(opts.row, 1);
                opts.row = -1;
                ND.ds.instance(opts.extObj !== null ? opts.extObj : this).notify();

                this.unbind();
            } else {
                opts.data[opts.row].rowStatus = "delete";
                opts.context.addClass("row_data_deleted__");
                ND.ds.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);
            }

            return this;
        };

        revert() {
            const opts = this.options;
            if(!opts.revert) {
                throw NC.error("[NU.form.prototype.revert]Can not revert. NU.form's revert option value is false");
            }

            opts.state = "revert";

            for(const k in opts.data[opts.row]){
                delete opts.data[opts.row][k];
            }
            jQuery.extend(opts.data[opts.row], opts.data[opts.row], opts.revertData);
            opts.data[opts.row]._isRevert = true;

            this.bind(opts.row, opts.state);

            ND.ds.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);
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
                type = NC.string.trimToEmpty(ele.attr("type")).toLowerCase();

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

                    if (NU.ui.utils.isTextInput(tagName, type)) {
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
                            ND.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, key);
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
                            N(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);
                        } else {
                            if(!opts.html) {
                                ele.text(val === null ? "" : val);
                            } else {
                                ele.html(val);
                            }
                        }

                        // notify data changed
                        if(notify !== false) {
                            ND.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, key);
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
                        if(N(eles.get(0)).events("select", "dataSync.form") === undefined) {
                            vals[N(eles.get(0)).attr("id")] = null;
                            self.bind(undefined, undefined, key);
                        }

                        // select value
                        eles.vals(val);

                        if(notify !== false) {
                            // dataSync & add data changed flag
                            N(eles.get(0)).trigger("select.form.dataSync");
                        } else {
                            // add data changed flag
                            N(eles.get(0)).addClass("data_changed__");
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
                    ND.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, key);
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
                    NC.element.dataChanged(changedEle);
                }
            }
            return this;
        };

    }

    // List
    static list = class {

        constructor(data, opts) {
            this.options = {
                data : NC.type(data) === "array" ? N(data) : data,
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
                jQuery.extend(true, this.options, NA.context.attr("ui").list);
            } catch (e) {
                throw NC.error("NU.list", e);
            }

            if (NC.isPlainObject(opts)) {
                // Wraps the global event options in NA.config and event options for this component.
                NU.ui.utils.wrapHandler(opts, "list", "onBeforeSelect");
                NU.ui.utils.wrapHandler(opts, "list", "onSelect");
                NU.ui.utils.wrapHandler(opts, "list", "onBind");

                //convert data to wrapped set
                opts.data = NC.type(opts.data) === "array" ? N(opts.data) : opts.data;

                jQuery.extend(true, this.options, opts);

                //for scroll paging limit
                this.options.scrollPaging.limit = this.options.scrollPaging.size;

                if(NC.type(this.options.context) === "string") {
                    this.options.context = N(this.options.context);
                }
            } else {
                this.options.context = N(opts);
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
                NU.ui.iteration.select.call(this, "list");
            }

            // Create scroll
            if(this.options.height > 0) {
                NU.list.createScroll.call(this);
            }

            this.contextEle = this.options.context;
            if(this.options.height > 0) {
                this.contextEle = this.options.context.closest("div.context_wrap__ > .list__");
            }

            // set function for check all checkbox in list
            if(this.options.checkAll !== null && this.options.checkAllTarget !== null) {
                NU.ui.iteration.checkAll.call(this, "list");
            } else {
                if(this.options.checkSingleTarget !== null) {
                    // set function for check single checkbox in list
                    NU.ui.iteration.checkSingle.call(this, "list");
                }
            }

            // set this instance to context element
            this.options.context.instance("list", this);

            // register this to ND.ds for realtime data synchronization
            ND.ds.instance(this, true);

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
            if(NC.browser.is("ie")) {
                contextWrapEle.css("overflow-x", "hidden");
            }

            if(opts.windowScrollLock) {
                NC.event.windowScrollLock(contextWrapEle);
            }

            // Scroll paging
            const self = this;
            const defSPSize = opts.scrollPaging.limit;
            let rowEleLength;
            NU.ui.scroll.paging.call(self, contextWrapEle, defSPSize, rowEleLength, "> li", "list.bind");

            // Vertical height resizing
            if(opts.vResizable) {
                NU.list.vResize.call(this, contextWrapEle);
            }
        };

        static vResize = function(contextWrapEle) {
            const pressed = false;
            const vResizable = N('<div class="v_resizable__"></div>').css({
                "text-align": "center",
                "cursor": "n-resize",
                "margin-bottom": contextWrapEle.css("margin-bottom")
            });
            contextWrapEle.css("margin-bottom", "0");

            let currHeight, contextWrapOffset;
            const eventNameSpace = ".list.vResize";
            NU.ui.draggable.events.call(vResizable, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) { // start
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
                        const thisEle = N(this);
                        if(arguments.length > 1) {
                            args[0] = opts.data[rowEles.index(this)];
                            retData.push(NC.json.mapFromKeys.apply(NC.json, args));
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
                    const thisEle = N(this);
                    if(arguments.length > 1) {
                        args[0] = opts.data[rowEles.index(thisEle.closest("li.form__"))];
                        retData.push(NC.json.mapFromKeys.apply(NC.json, args));
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
                        return NC.json.mapFromKeys.apply(NC.json, args);
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
                NC.warn("[NU.list.select]The \"select\" or \"multiselect\" option is disabled. To use this method, set the value of the \"select\" or \"multiselect\" option to true.");
                return false;
            }
            if(row === undefined) {
                const rowEles = this.contextEle.find(">li.form__");
                return rowEles.filter(".list_selected__").map(function () {
                    return rowEles.index(this);
                }).get();
            } else {
                if(NC.type(row) !== "array") {
                    row = [row];
                }

                const self = this;
                let selRowEle;

                if(!isAppend) {
                    self.contextEle.find(">li.list_selected__").removeClass("list_selected__");
                }
                N(row).each(function() {
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
                    return rowEles.index(N(this).closest("li.form__"));
                }).get();
            } else {
                if(NC.type(row) !== "array") {
                    row = [row];
                }

                const self = this;
                let checkboxEle;
                if(!isAppend) {
                    self.contextEle.find(">li").find((opts.checkAllTarget||opts.checkSingleTarget) + ":checked").prop("checked", false);
                }
                N(row).each(function() {
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
                        opts.data = NC.type(data) === "array" ? N(data) : data;
                    }
                }

                if(opts.checkAll !== null) {
                    N(opts.checkAll).prop("checked", false);
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

                    NU.ui.iteration.render.call(this, i, limit, delay, lastIdx, callType);

                    if(opts.appendScroll && callType === "append") {
                        opts.context.parent(".context_wrap__").stop().animate({
                            "scrollTop" : opts.context.parent(".context_wrap__").prop("scrollHeight")
                        }, 300, 'swing');
                    }
                } else {
                    //remove lis in list body area
                    opts.context.find(">li").remove();
                    opts.context.append('<li class="empty__">' +
                        NC.message.get(opts.message, "empty") + '</li>');

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

            if(NC.isNumeric(data)) {
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
                            N(this).find(">ul>li:eq(" + row + ")").trigger("click.list");
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

            // for new row data bind, use NU.form
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
                        N(this).find("> ul > li:" + (opts.addTop ? "first" : "last")).trigger("click.list");
                    }
                });
            }

            return this;
        };

        remove(row) {
            const opts = this.options;
            if(row !== undefined) {
                if(NC.type(row) !== "array") {
                    row = [row];
                }
                N(row.sort().reverse()).each(function(i, row) {
                    if (opts.data[this] === undefined) {
                        throw NC.error("[NU.list.prototype.remove]Row index is out of range");
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

            ND.ds.instance(this).notify();
            return this;
        };

        revert(row) {
            const opts = this.options;
            if(!opts.revert) {
                throw NC.error("[NU.form.prototype.revert]Can not revert. NU.form's revert option value is false");
            }

            const self = this;

            if(row !== undefined) {
                if(NC.type(row) !== "array") {
                    row = [row];
                }
                N(row).each(function() {
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
                    throw NC.error("[NU.list.prototype.val]There is no row data that is " + row + " index");
                }
            }
            return this;
        };

        move(fromRow, toRow) {
            NU.ui.iteration.move.call(this, fromRow, toRow, "list");

            return this;
        };

        copy(fromRow, toRow) {
            NU.ui.iteration.copy.call(this, fromRow, toRow, "list");

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
    static grid = class {

        constructor(data, opts) {
            this.options = {
                data : NC.type(data) === "array" ? N(data) : data,
                row : -1, // selected row index
                beforeRow : -1, // before selected row index
                context : null,
                height : 0,
                fixedcol : 0,
                more : false, // true or column names array
                validate : true,
                html : false,
                addTop : true,
                addSelect : false,
                filter : false,
                resizable : false,
                vResizable : false,
                sortable : false,
                windowScrollLock : true,
                select : false,
                unselect : true,
                multiselect : false,
                checkAll : null, // selector
                checkAllTarget : null, // selector
                checkSingleTarget : null, // selector
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
                pastiable : false,
                rowHandlerBeforeBind : null,
                rowHandler : null,
                onBeforeSelect : null,
                onSelect : null,
                onBind : null,
                misc : {
                    resizableCorrectionWidth : 0,
                    resizableLastCellCorrectionWidth : 0,
                    resizeBarCorrectionLeft : 0,
                    resizeBarCorrectionHeight : 0,
                    fixedcolHeadMarginTop : 0,
                    fixedcolHeadMarginLeft : 0,
                    fixedcolHeadHeight : 0,
                    fixedcolBodyMarginTop : 0,
                    fixedcolBodyMarginLeft : 0,
                    fixedcolBodyBindHeight : 0,
                    fixedcolBodyAddHeight : 1,
                    fixedcolRootContainer : null // for mobile browser, input selector string
                },
                currMoveToRow : -1
            };

            try {
                jQuery.extend(true, this.options, NA.context.attr("ui").grid);
            } catch (e) {
                throw NC.error("NU.grid", e);
            }

            if (NC.isPlainObject(opts)) {
                // Wraps the global event options in NA.config and event options for this component.
                NU.ui.utils.wrapHandler(opts, "grid", "onBeforeSelect");
                NU.ui.utils.wrapHandler(opts, "grid", "onSelect");
                NU.ui.utils.wrapHandler(opts, "grid", "onBind");

                //convert data to wrapped set
                opts.data = NC.type(opts.data) === "array" ? N(opts.data) : opts.data;

                jQuery.extend(true, this.options, opts);

                //for scroll paging limit
                this.options.scrollPaging.limit = this.options.scrollPaging.size;

                if(NC.type(this.options.context) === "string") {
                    this.options.context = N(this.options.context);
                }
            } else {
                this.options.context = N(opts);
            }

            // If the value of the opts.scrollPaging.size value is greater than 0, the addTop option is unconditionally set to true.
            if(!this.options.addTop) {
                this.options.scrollPaging.size = 0;
                this.options.createRowDelay = 0;
            }

            // for bind "append"
            this.options.scrollPaging.defSize = this.options.scrollPaging.size;

            // set tbody template
            this.tempRowEle = this.options.context.find("> tbody").clone(true, true);

            // set style class name to context element
            this.options.context.addClass("grid__");
            // set style class name to context element for hover option
            if(this.options.hover) {
                this.options.context.addClass("grid_hover__");
            }

            // set selectable
            if(this.options.select || this.options.multiselect) {
                NU.ui.iteration.select.call(this, "grid");
            }

            //remove colgroup when the resizable option is true
            if(this.options.resizable) {
                NU.grid.removeColgroup.call(this);
            }

            // view details
            if(this.options.more) {
                NU.grid.more.call(this);
            }

            // fixed header
            if(this.options.height > 0) {
                // fixed header
                NU.grid.fixHeader.call(this);
            }

            // create table cell element map
            this.tableMap = NU.grid.tableMap.call(this);

            // set tbody cell's id attribute into th cell in thead
            NU.grid.setTheadCellInfo.call(this);

            // set this.thead
            if (this.options.height > 0) {
                this.thead = this.options.context.closest(".grid_wrap__").find(">.thead_wrap__>table>thead");
            } else {
                this.thead = this.options.context.find(">thead");
            }

            // fixed column
            if(this.options.height === 0) {
                NU.grid.fixColumn.call(this);
            }

            // set context element
            this.contextEle = this.options.context;
            if(this.options.height > 0) {
                this.contextEle = this.options.context.closest("div.tbody_wrap__ > .grid__");
            }

            // set rowspan column info
            this.rowSpanIds = this.thead.find("th:regexp(data:rowspan,true)").map(function() {
                return N(this).data("id");
            });

            // set function for check all checkbox in list
            if(this.options.checkAll !== null && this.options.checkAllTarget !== null) {
                NU.ui.iteration.checkAll.call(this, "grid");
            } else {
                if(this.options.checkSingleTarget !== null) {
                    // set function for check single checkbox in list
                    NU.ui.iteration.checkSingle.call(this, "grid");
                }
            }

            // sortable, v(ertical)Resizable
            if(this.options.sortable) {
                NU.grid.sort.call(this);
            }

            // resizable column width
            if(this.options.resizable) {
                NU.grid.resize.call(this);
            }

            // data filter
            if(this.options.filter || this.thead.find("> tr th[data-filter='true']").length > 0) {
                if(this.options.filter) {
                    this.thead.find("> tr th").attr("data-filter", "true");
                }
                NU.grid.dataFilter.call(this);
            }

            if(this.options.pastiable) {
                NU.grid.paste.call(this);
            }

            // set this instance to context element
            this.options.context.instance("grid", this);

            // register this to ND.ds for realtime data synchronization
            ND.ds.instance(this, true);

            return this;
        };

        /**
         * Convert HTML Table To 2D Array
         * Reference from CHRIS WEST'S BLOG : http://cwestblog.com/2016/08/21/javascript-snippet-convert-html-table-to-2d-array/
         */
        static tableCells = function(tbl, opt_cellValueGetter) {
            const rows = tbl.find(">tr");
            opt_cellValueGetter = opt_cellValueGetter || function(td) { return td.textContent || td.innerText; };
            const twoD = [];
            let rowCount = rows.length;
            for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                twoD.push([]);
            }
            for (let rowIndex = 0, tr; rowIndex < rowCount; rowIndex++) {
                const tr = rows[rowIndex];
                for (let colIndex = 0, colCount = tr.cells.length, offset = 0; colIndex < colCount; colIndex++) {
                    const td = tr.cells[colIndex], text = opt_cellValueGetter(td, colIndex, rowIndex, tbl);
                    while (twoD[rowIndex].hasOwnProperty(colIndex + offset)) {
                        offset++;
                    }
                    for (let i = 0, colSpan = parseInt(td.colSpan, 10) || 1; i < colSpan; i++) {
                        for (let j = 0, rowSpan = parseInt(td.rowSpan, 10) || 1; j < rowSpan; j++) {
                            N(td).addClass("col_" + (colIndex + offset + i) + "__");
                            if(twoD[rowIndex + j] !== undefined) {
                                twoD[rowIndex + j][colIndex + offset + i] = td;
                            } else {
                                NC.warn("[NU.grid.tableCells]The rowspan property of table is defined incorrectly.");
                            }
                        }
                    }
                }
            }
            return twoD;
        };

        static tableMap = function() {
            const opts = this.options;

            const colgroup = [];
            let thead;
            let tfoot;

            if(opts.context.find("> colgroup").length > 0) {
                colgroup.push(opts.context.find("> colgroup > col").each(function(i) {
                    N(this).addClass("col_" + String(i) + "__");
                }).get());
            }

            if(opts.height > 0) {
                if(opts.context.find("> colgroup").length > 0) {
                    colgroup.unshift(opts.context.closest(".grid_wrap__").find(">.thead_wrap__>table>colgroup>col").each(function(i) {
                        N(this).addClass("col_" + String(i) + "__");
                    }).get());
                    colgroup.push(opts.context.closest(".grid_wrap__").find(">.tfoot_wrap__>table>colgroup>col").each(function(i) {
                        N(this).addClass("col_" + String(i) + "__");
                    }).get());
                }
                thead = NU.grid.tableCells(opts.context.closest(".grid_wrap__").find(">.thead_wrap__>table>thead"));
                thead = thead.concat(NU.grid.tableCells(opts.context.closest(".grid_wrap__").find("> .tbody_wrap__>table>thead")));
                tfoot = NU.grid.tableCells(opts.context.closest(".grid_wrap__").find(">.tfoot_wrap__>table>tfoot"));
            } else {
                thead = NU.grid.tableCells(opts.context.find("> thead"));
                tfoot = NU.grid.tableCells(opts.context.find("> tfoot"));
            }

            return {
                colgroup : colgroup,
                thead : thead,
                tbody : NU.grid.tableCells(this.tempRowEle),
                tfoot : tfoot
            };
        };

        static setTheadCellInfo = function() {
            const opts = this.options;
            const tableMap = this.tableMap;
            if(tableMap.thead.length === 0) {
                return;
            }
            let nextCnt = 0;
            N(tableMap.tbody).each(function(i, cells) {
                N(cells).each(function(j, cell) {
                    if(tableMap.thead[i+nextCnt] === undefined || tableMap.thead[i+nextCnt][j] === undefined) {
                        return false;
                    }
                    let theadCell = N(tableMap.thead[i+nextCnt][j]);
                    const tbodyCell = N(cell);

                    if(nextCnt === 0 && tbodyCell.attr("colspan") !== theadCell.attr("colspan")) {
                        theadCell = N(tableMap.thead[i+1][j]);
                    }

                    if(tbodyCell.attr("colspan") === theadCell.attr("colspan")) {
                        let id = tbodyCell.attr("id");
                        if(id === undefined) {
                            id = tbodyCell.find("[id]").attr("id");
                        }
                        if(id !== undefined) {
                            theadCell.data("id", id);
                        }
                    } else {
                        nextCnt++;
                        return true;
                    }
                });
            });
        };

        static removeColgroup = function() {
            const opts = this.options;
            if(opts.context.find("colgroup").length > 0) {
                const theadMap = NU.grid.tableCells(opts.context.find("> thead"));
                let tfootMap;
                if(opts.height > 0) {
                    tfootMap = NU.grid.tableCells(opts.context.find("> tfoot"));
                }

                opts.context.find("colgroup>col").each(function(i, colEle) {
                    N(theadMap).each(function(j, rowEles) {
                        if(N(rowEles[i]).attr("colspan") === undefined) {
                            N(rowEles[i]).css("width", colEle.style.width).removeAttr("scope");
                        }
                    })

                    if(opts.height > 0) {
                        N(tfootMap).each(function(j, rowEles) {
                            if(N(rowEles[i]).attr("colspan") === undefined) {
                                N(rowEles[i]).css("width", colEle.style.width).removeAttr("scope");
                            }
                        })
                    }
                }).parent().remove();
            }
        };

        static fixColumn = function() {
            const opts = this.options;
            const self = this;

            if(opts.fixedcol > 0) {
                opts.context.width("auto").css({
                    "table-layout" : "fixed",
                    "width" : self.thead.find("> tr > th").toArray().splice(opts.fixedcol).reduce(function(sum, ele) {
                        return sum + parseInt(window.getComputedStyle(ele,null).getPropertyValue("width"));
                    }, 0)
                });

                const gridWrap = opts.context.wrap(N("<div/>", {
                    "css" : { "overflow-x" : (NC.browser.is("ios") ? "scroll" : "auto") },
                    "class" : "grid_wrap__"
                })).parent("div");

                const gridContainer = gridWrap.wrap(N("<div/>", {
                    "class" : "grid_container__"
                })).parent("div");

                if(opts.misc.fixedcolRootContainer === null) {
                    gridContainer.css("position", "relative");
                } else {
                    opts.context.closest(opts.misc.fixedcolRootContainer).css("position", "relative");
                }

                const theadTrHeight = self.thead.find("> tr").height();
                self.thead.find("> tr").height(theadTrHeight);

                let cellLeft = 0;
                let leftMargin = 0;
                for(let i=0;i<opts.fixedcol;i++) {
                    let targetTheadCellEle;
                    let targetTbodyCellEle;

                    targetTheadCellEle = N(self.tableMap.thead).map(function() {
                        return this[i];
                    }).addClass("grid_head_fixed__");
                    targetTbodyCellEle = N(self.tableMap.tbody).map(function() {
                        return this[i];
                    }).addClass("grid_body_fixed__");

                    const cellWidth = targetTheadCellEle.outerWidth();
                    const borderLeftWidth = parseInt(targetTheadCellEle.css("border-left-width"));
                    const theadBorderTopWidth = parseInt(targetTheadCellEle.css("border-top-width"));
                    leftMargin += (cellWidth - borderLeftWidth + opts.misc.fixedcolHeadMarginLeft);

                    targetTheadCellEle.css({
                        "position" : "absolute",
                        "margin-top" : (-theadBorderTopWidth + opts.misc.fixedcolHeadMarginTop) + "px",
                        "box-sizing" : "border-box",
                        "width" : cellWidth + "px",
                        "height" : (theadTrHeight + theadBorderTopWidth + opts.misc.fixedcolHeadHeight) + "px"
                    });
                    targetTbodyCellEle.css({
                        "position" : "absolute",
                        "margin-top" : opts.misc.fixedcolBodyMarginTop + "px",
                        "box-sizing" : "border-box",
                        "width" : cellWidth + "px"
                    });

                    if(targetTheadCellEle.prev().length > 0) {
                        cellLeft += targetTheadCellEle.prev().outerWidth() - borderLeftWidth + opts.misc.fixedcolBodyMarginLeft;
                    }

                    targetTheadCellEle.css({
                        "left" : cellLeft + "px"
                    });
                    targetTbodyCellEle.css({
                        "left" : cellLeft + "px"
                    });

                    // remove colgroup's first col elements width
                    if(self.tableMap.colgroup.length > 0) {
                        N(self.tableMap.colgroup).each(function() {
                            if(i === 0) {
                                N(this[i]).width(0);
                            } else {
                                N(this[i]).hide();
                            }
                        });
                    }
                }

                gridWrap.css("margin-left", leftMargin);
            }
        };

        static fixHeader = function() {
            const opts = this.options;

            opts.context.css({
                "table-layout" : "fixed",
                "margin" : "0"
            });

            const sampleCell = opts.context.find(">tbody td:eq(0)");
            let borderLeftWidth = sampleCell.css("border-left-width");
            if(parseInt(borderLeftWidth) < 1) {
                borderLeftWidth = "1px"; // for IE
            }
            const borderLeft = borderLeftWidth + " " + sampleCell.css("border-left-style") + " " + sampleCell.css("border-left-color");
            let borderBottomWidth = sampleCell.css("border-bottom-width");
            if(parseInt(borderBottomWidth) < 1) {
                borderBottomWidth = "1px"; // for IE
            }
            const borderBottom = borderBottomWidth + " " + sampleCell.css("border-bottom-style") + " " + sampleCell.css("border-bottom-color");

            // Root grid container
            const gridWrap = opts.context.wrap('<div class="grid_wrap__"/>').parent();
            gridWrap.css({
                "border-left" : borderLeft
            });

            const scrollbarWidth = NC.browser.scrollbarWidth();

            // When opts.context overflows gridWrap
            // if gridWrap.width() is 0, opts.context's display style is none or invisible element.
            if(gridWrap.width() > 0 && opts.context.width() > gridWrap.width()) {
                gridWrap.width(opts.context.width() + scrollbarWidth);
            }

            //Create grid header
            const contextClone = opts.context.clone(true, true);
            const theadClone = opts.context.find("> thead").clone();
            contextClone.find(">thead").remove();
            contextClone.find(">tbody").remove();
            contextClone.find(">tfoot").remove();
            contextClone.append(opts.context.find("> thead"));
            const theadWrap = contextClone.wrap('<div class="thead_wrap__"/>').parent().css({
                "padding-right" : scrollbarWidth + "px",
                "margin-left" : "-1px"
            });
            gridWrap.prepend(theadWrap);

            opts.context.append(theadClone);
            //Create grid body
            opts.context.find("> thead th").empty().css({
                "height" : "0",
                "padding-top" : "0",
                "padding-bottom" : "0",
                "border-top" : "none",
                "border-bottom" : "none"
            });
            opts.context.find("> tbody td").css({
                "border-top" : "none"
            });
            this.tempRowEle.find("td").css({
                "border-top" : "none"
            });
            const contextWrapEle = opts.context.wrap('<div class="tbody_wrap__"/>').parent().css({
                "height" : String(opts.height) + "px",
                "overflow-y" : "scroll",
                "overflow-x" : "hidden",
                "margin-left" : "-1px"
            });

            if(opts.context.find("> tfoot").length === 0) {
                contextWrapEle.css("border-bottom", borderBottom);
            }

            if(opts.windowScrollLock) {
                NC.event.windowScrollLock(contextWrapEle);
            }

            // Scroll paging
            const self = this;
            const defSPSize = opts.scrollPaging.limit;
            let rowEleLength;
            NU.ui.scroll.paging.call(self, contextWrapEle, defSPSize, rowEleLength, "> tbody", "grid.bind");

            // Create grid footer
            let tfootWrap;
            if(opts.context.find("> tfoot").length > 0) {
                const contextClone = opts.context.clone(true, true);
                contextClone.find(">thead").remove();
                contextClone.find(">tbody").remove();
                contextClone.find(">tfoot").remove();
                contextClone.append(opts.context.find("> tfoot"));
                tfootWrap = contextClone.wrap('<div class="tfoot_wrap__"/>').parent().css({
                    "padding-right" : scrollbarWidth + "px",
                    "margin-left" : "-1px"
                });
                gridWrap.append(tfootWrap);
            }

            // Vertical height resizing
            if(opts.vResizable) {
                NU.grid.vResize.call(this, gridWrap, contextWrapEle, tfootWrap);
            }
        };

        static vResize = function(gridWrap, contextWrapEle, tfootWrap) {
            let pressed = false;
            const vResizable = N('<div class="v_resizable__"></div>').css({
                "text-align": "center",
                "cursor": "n-resize",
                "margin-bottom": gridWrap.css("margin-bottom")
            });
            gridWrap.css("margin-bottom", "0");

            let currHeight, contextWrapOffset, tfootHeight = 0;
            let eventNameSpace = ".grid.vResize";
            NU.ui.draggable.events.call(vResizable, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) { // start
                if(tfootWrap !== undefined) {
                    tfootHeight = tfootWrap.height();
                }
                contextWrapOffset = contextWrapEle.offset();
            }, function(e, tabContainerEle_, pageX, pageY) { // move
                currHeight = (pageY - contextWrapOffset.top - tfootHeight) + "px";
                contextWrapEle.css({
                    "height" : currHeight,
                    "max-height" : currHeight
                });
            });

            vResizable.on("mousedown.grid.vResize touchstart.grid.vResize", function(e) {
                if(e.originalEvent.touches) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                if(e.originalEvent.touches || (e.which || e.button) === 1) {

                    N(document).on("dragstart.grid.vResize selectstart.grid.vResize", function() {
                        return false;
                    });
                    pressed = true;

                    N(window.document).on("mousemove.grid.vResize touchmove.grid.vResize", function(e) {
                        let mte;
                        if(e.originalEvent.touches) {
                            e.stopPropagation();
                            mte = e.originalEvent.touches[0];
                        }
                        if(pressed) {
                            currHeight = ((mte !== undefined ? mte.pageY : e.pageY) - contextWrapOffset.top - tfootHeight) + "px";
                            contextWrapEle.css({
                                "height" : currHeight,
                                "max-height" : currHeight
                            });
                        }
                    });

                    N(window.document).on("mouseup.grid.vResize touchend.grid.vResize", function(e) {
                        N(document).off("dragstart.grid.vResize selectstart.grid.vResize mousemove.grid.vResize touchmove.grid.vResize mouseup.grid.vResize touchend.grid.vResize");
                        pressed = false;
                    });
                }
            });

            gridWrap.after(vResizable);
        };

        static more = function() {
            const opts = this.options;
            const self = this;

            if(opts.more === true) {
                opts.more = self.tempRowEle.find("[id]").map(function() {
                    return N(this).attr("id");
                }).get();
            }


            // Append col element to colgroup
            if(opts.context.find("> colgroup").length > 0) {
                opts.context.find("> colgroup").append('<col class="grid_more_colgroup_col__">')
            }

            // Column for hide and show button.
            let theadCol;
            const theadRowCnt = NU.grid.tableCells(opts.context.find(">thead")).length;
            if(theadRowCnt > 0) {
                theadCol = N('<th></th>').addClass("grid_more_thead_col__");
                if(theadRowCnt > 1) {
                    theadCol.attr("rowspan", String(theadRowCnt));
                }
            }
            // Hide and show button.
            const colShowHideBtn = N('<a href="#" title="' + NC.message.get(opts.message, "showHide") + '"><span></span></a>').addClass("grid_col_show_hide_btn__").appendTo(theadCol);
            // Append column to tr in thead
            if(theadCol !== undefined) {
                opts.context.find(">thead > tr:first").append(theadCol);
            }

            // Column for detail popup button.
            let tbodyCol;
            const tbodyRowCnt = NU.grid.tableCells(this.tempRowEle).length;
            if(tbodyRowCnt > 0) {
                tbodyCol = N('<td></td>').addClass("grid_more_tbody_col__");
                if(tbodyRowCnt > 1) {
                    tbodyCol.attr("rowspan", String(tbodyRowCnt));
                }
            }
            // Detail popup button.
            const moreBtn = N('<a href="#" title="' + NC.message.get(opts.message, "more") + '"><span></span></a>').addClass("grid_more_btn__").appendTo(tbodyCol);
            // Append column to tr in tbody
            if(tbodyCol !== undefined) {
                self.tempRowEle.find("> tr:first").append(tbodyCol);
            }

            // Empty column in tfoot
            let tfootCol;
            const tfootRowCnt = NU.grid.tableCells(opts.context.find(">tfoot")).length;
            if(tfootRowCnt > 0) {
                tfootCol = N('<td></td>').addClass("grid_more_tfoot_col__")
                if(tfootRowCnt > 1) {
                    tfootCol.attr("rowspan", String(tfootRowCnt));
                }
            }
            // Append column to tr in tfoot
            if(tfootCol !== undefined) {
                opts.context.find(">tfoot > tr:first").append(tfootCol);
            }

            const excludeThClasses = ".btn_data_filter_full__, .data_filter_panel__, .btn_data_filter__, .resize_bar__, .sortable__";

            // Hide and show panel
            const panel = N('<div class="grid_more_panel__ hidden__">'
                +   '<div class="grid_more_checkall_box__"><label><input type="checkbox">' + NC.message.get(opts.message, "selectAll") + '<span class="grid_more_total_cnt__"></span></label></div>'
                +   '<ul class="grid_more_col_list__"></ul>'
                + '</div>');
            colShowHideBtn.after(panel);

            let gridMoreColList;

            // Hide and show panel's checkbox click event
            panel.find(".grid_more_checkall_box__ :checkbox").on("click.grid.more", function() {
                const thisEle = N(this);
                if(thisEle.is(":checked")) {
                    gridMoreColList.find("input[name='hideshow']:not(':checked')").trigger("click");
                } else {
                    gridMoreColList.find("input[name='hideshow']:checked").trigger("click");
                }
            });

            const calibDialogItems = function(currPanel) {
                if(gridMoreColList.find("input[name='hideshow']").length === gridMoreColList.find("input[name='hideshow']:checked").length) {
                    currPanel.find(".grid_more_checkall_box__ :checkbox").prop("checked", true);
                } else {
                    currPanel.find(".grid_more_checkall_box__ :checkbox").prop("checked", false);
                }
            };

            // Hide and show button event.
            colShowHideBtn.on("click.grid.more", function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                const thisBtn = N(this);
                const panel = thisBtn.next(".grid_more_panel__ ");

                if(self.tableMap.thead.length > 0 && gridMoreColList === undefined) {
                    gridMoreColList = panel.find(".grid_more_col_list__");
                    gridMoreColList.on("click.grid.more", "input[name='hideshow']", function() {
                        const thisEle = N(this);
                        if(!thisEle.is(":checked")) {
                            self.hide(parseInt(thisEle.val()));
                        } else {
                            self.show(parseInt(thisEle.val()));
                        }
                        calibDialogItems(panel);
                    });

                    N(self.tableMap.thead[0]).each(function(i) {
                        const thisEleClone = N(this).clone();
                        if(!thisEleClone.hasClass("grid_more_thead_col__")) {
                            thisEleClone.find(excludeThClasses).remove();
                            const cols = N('<li class="grid_more_cols__" title="' + String(i+1) + '">'
                                + '<label><input name="hideshow" type="checkbox" checked="checked" value="' + String(i) + '">'
                                + String(i+1) + " " + NC.message.get(opts.message, "column") + '</label></li>')
                                .appendTo(gridMoreColList);
                        }
                    });

                    calibDialogItems(panel);
                }

                N(document).off("click.grid.more");
                N(document).on("click.grid.more", function(e) {
                    if(N(e.target).parents(".grid_more_panel__, .grid_col_show_hide_btn__").length === 0 && !N(e.target).hasClass("grid_col_show_hide_btn__")) {
                        panel.removeClass("visible__").addClass("hidden__");
                        panel.one(NC.event.whichTransitionEvent(panel), function(){
                            panel.hide();

                            // The touchstart event is not removed when using the one method
                            N(document).off("click.grid.more touchstart.grid.more");
                        }).trigger("nothing");
                    }
                });

                panel.show(0, function() {
                    N(this).removeClass("hidden__").addClass("visible__");
                });
            });

            // Detail popup button event.
            opts.context.on("click.grid.more", ".grid_more_tbody_col__ .grid_more_btn__", function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                let rowIdx = opts.context.find(">tbody").index(N(this).closest("tbody.form__"));

                const morePopupContects = N("<div></div>").addClass("grid_more_popup_contents__");
                const moreContents = N("<div></div>").addClass("grid_more_contents__").appendTo(morePopupContects).css({
                    "overflow-y" : "auto",
                    "max-height" : (N(window).height() - 200) + "px"
                });
                const table = N("<table></table>").appendTo(moreContents);
                const tbody = N("<tbody></tbody>").appendTo(table);
                N(opts.more).each(function() {
                    const tr = N("<tr></tr>").appendTo(tbody);
                    const filteredThClone = self.thead.find(">tr > th:regexp(data:id, " + this + ")").clone();
                    filteredThClone.find(excludeThClasses).remove();
                    filteredThClone.removeAttr("rowspan").removeAttr("colspan");
                    const th = N("<th></th>", {
                        text : filteredThClone.text()
                    }).appendTo(tr);

                    const td = opts.context.find(">tbody:eq(" + rowIdx + ") #" + this);
                    if(td.is("td")) {
                        td.clone().removeAttr("rowspan").removeAttr("colspan").removeAttr("class").removeAttr("style").appendTo(tr);
                    } else {
                        if(td.hasClass("datepicker__")) {
                            td.next(".datepicker_contents__").remove();
                        }

                        const tdClone = td.closest("td").clone();
                        tdClone.find(".datepicker__").removeClass("datepicker__");

                        tdClone.removeAttr("rowspan").removeAttr("colspan").removeAttr("class").removeAttr("style").appendTo(tr);
                    }
                });

                const form = opts.data.form(moreContents).unbind().bind(rowIdx);

                const btnBox = N('<div class="btn_box__"></div>').appendTo(morePopupContects);
                const prevBtn = N('<a href="#" class="prev_btn__">' + NC.message.get(opts.message, "prev") + '</a>').on("click.grid.more", function(e) {
                    e.preventDefault();

                    if(rowIdx > 0 && form.validate()) {
                        rowIdx -= 1;
                        form.bind(rowIdx);
                        page.text(String(rowIdx + 1));
                    }
                }).appendTo(btnBox);
                prevBtn.button({
                    type: "outlined",
                    size: "medium"
                });
                const page = N('<span class="page__">' + String(rowIdx + 1) +'</span>').appendTo(btnBox);
                const nextBtn = N('<a href="#" class="next_btn__">' + NC.message.get(opts.message, "next") + '</a>').on("click.grid.more", function(e) {
                    e.preventDefault();

                    if(rowIdx + 1 < form.data().length && form.validate()) {
                        rowIdx += 1;
                        form.bind(rowIdx);
                        page.text(String(rowIdx + 1));
                    }
                }).appendTo(btnBox);
                nextBtn.button({
                    type: "outlined",
                    size: "medium"
                });

                morePopupContects.popup({
                    title : NC.message.get(opts.message, "more"),
                    closeMode : "remove",
                    button : false,
                    draggable : true,
                    alwaysOnTop : true,
                    onCancel : function() {
                        if(!form.validate()) {
                            return 0;
                        }
                    }
                }).open();
            });
        };

        static resize = function() {
            const self = this;
            // TODO colgroup
            // const tableMap = this.tableMap;

            // if(tableMap.colgroup.length > 0) {
            /*
            NU.ui.draggable.events.call(docsTabs, ".docs.scroll", function(e, ele, x, y) { // start

            }, function(e, ele, x, y) { // move
                NU.ui.draggable.moveX.call(ele, x);
            }, function(e, ele) { //end

            });
            */
            // } else {
            let resizeBar, currResizeBar, resizeBarHeight, cellEle, currCellEle, currNextCellEle, targetCellEle, targetNextCellEle,
                targetTfootCellEle, targetNextTfootCellEle, currResizeBarEle,
                defWidth, nextDefWidth, currWidth, nextCurrWidth, startOffsetX,
                minPx, maxPx, defPx, movedPx;

            const opts = this.options;
            const theadCells = this.thead.find("> tr th:not(.grid_head_fixed__)");
            let isPressed = false;
            const scrollbarWidth = NC.browser.scrollbarWidth();

            if(NC.browser.is("safari")){
                theadCells.css("padding-left", "0");
                theadCells.css("padding-right", "0");
            }

            if(opts.context.css("table-layout") !== "fixed") {
                opts.context.css("table-layout", "fixed");
            }

            const resizeBarWidth = 5;
            const resizeBarCorrectionHeight = NC.browser.is("ie") ? -2 : 0;
            let context;
            if (opts.height > 0) {
                context = opts.context.closest(".grid_wrap__");
            } else {
                context = opts.context;
            }

            this.thead.on("mouseover.grid.resize touchstart.grid.resize", function() {
                resizeBarHeight = (opts.height > 0 ? self.contextEle.closest(".grid_wrap__").height() - 3 : self.contextEle.height() + resizeBarCorrectionHeight) + 1 + opts.misc.resizeBarCorrectionHeight;
                let lastResizeBar = theadCells.each(function() {
                    const cellEle = N(this);
                    cellEle.find("> .resize_bar__").css({
                        "top" : cellEle.position().top + 1,
                        "left" : (cellEle.position().left + cellEle.outerWidth() - resizeBarWidth / 2 + opts.misc.resizeBarCorrectionLeft) + "px"
                    });
                }).last().find("> .resize_bar__");
                lastResizeBar.css({
                    "left" : parseInt(lastResizeBar.css("left")) - (resizeBarWidth / 2)
                })
                lastResizeBar = undefined;
            });

            let isFirstTimeLastClick = true;
            theadCells.each(function() {
                cellEle = N(this);
                resizeBar = N('<div class="resize_bar__"></div>').css({
                    "padding": "0px",
                    "position": "absolute",
                    "width": resizeBarWidth + "px",
                    "height": String(cellEle.outerHeight()) + "px",
                    "opacity": "0"
                }).appendTo(cellEle);

                resizeBar.on("mousedown.grid.resize touchstart.grid.resize", function(e) {
                    let dte;
                    if(e.originalEvent.touches) {
                        dte = e.originalEvent.touches[0];
                    }

                    if(e.originalEvent.touches || (e.which || e.button) === 1) {
                        N(this).css({
                            "opacity": ""
                        }).animate({
                            "height" : resizeBarHeight + "px"
                        }, 150);

                        startOffsetX = dte !== undefined ? dte.pageX : e.pageX;
                        currResizeBarEle = N(this);
                        currCellEle = currResizeBarEle.parent("th");
                        currNextCellEle = currCellEle.next();
                        let isLast = false;
                        if(currNextCellEle.length === 0) {
                            currNextCellEle = context;
                            isLast = true;
                        }

                        if(opts.height > 0) {
                            targetCellEle = opts.context.find("thead th:eq(" + theadCells.index(currCellEle) + ")");
                            targetNextCellEle = targetCellEle.next();
                            if(opts.height > 0 && opts.context.parent().parent(".grid_wrap__").find("tfoot").length > 0) {
                                targetTfootCellEle = opts.context.parent().parent(".grid_wrap__").find("tfoot > tr > td:eq(" + theadCells.index(currCellEle) + ")");
                                targetNextTfootCellEle = targetTfootCellEle.next();
                            }
                        }
                        // Convert flexible cell width to absolute cell width when the clicked resizeBar is last resizeBar
                        if(isFirstTimeLastClick && isLast) {
                            let thisWidth;
                            theadCells.each(function(i) {
                                thisWidth = N(this).width();
                                N(this).width(thisWidth + (opts.height > 0 ? opts.misc.resizableLastCellCorrectionWidth : 0) + opts.misc.resizableCorrectionWidth).removeAttr("width");

                                if(targetCellEle !== undefined) {
                                    opts.context.find("thead th:eq(" + theadCells.index(this) + ")").width(thisWidth + (opts.height > 0 ? opts.misc.resizableLastCellCorrectionWidth : 0) + opts.misc.resizableCorrectionWidth).removeAttr("width");
                                }
                                if(opts.height > 0 && targetTfootCellEle !== undefined) {
                                    opts.context.parent().parent(".grid_wrap__").find("tfoot > tr > td:eq(" + theadCells.index(this) + ")").width(thisWidth + (opts.height > 0 ? opts.misc.resizableLastCellCorrectionWidth : 0) + opts.misc.resizableCorrectionWidth).removeAttr("width");
                                }
                            });
                            isFirstTimeLastClick = false;
                            thisWidth = undefined;
                        }

                        // to block sort event
                        currCellEle.data("sortLock", true);

                        defWidth = Math.floor(currCellEle.outerWidth()) + opts.misc.resizableCorrectionWidth;
                        nextDefWidth = !isLast ? Math.floor(currNextCellEle.outerWidth()) + opts.misc.resizableCorrectionWidth : Math.floor(context.width());

                        N(document).on("dragstart.grid.resize selectstart.grid.resize", function() {
                            return false;
                        });
                        isPressed = true;

                        minPx = !isLast ? Math.floor(currNextCellEle.offset().left) : Math.floor(currCellEle.offset().left) + Math.floor(currCellEle.outerWidth());
                        maxPx = minPx + (!isLast ? Math.floor(currNextCellEle.outerWidth()) : 7680);
                        movedPx = defPx = Math.floor(currResizeBarEle.parent("th").offset().left);
                        N(window.document).on("mousemove.grid.resize touchmove.grid.resize", function(e) {
                            let mte;
                            if(e.originalEvent.touches) {
                                e.stopPropagation();
                                mte = e.originalEvent.touches[0];
                            }
                            if(isPressed) {
                                const mPageX = mte !== undefined ? mte.pageX : e.pageX;
                                if(defPx < mPageX && maxPx > mPageX) {
                                    movedPx = mPageX - startOffsetX;
                                    currWidth = defWidth + movedPx;
                                    nextCurrWidth = !isLast ? nextDefWidth - movedPx : nextDefWidth + movedPx;
                                    if(currWidth > 0 && nextCurrWidth > 0) {
                                        currCellEle.css("width", currWidth + "px");
                                        currNextCellEle.css("width", nextCurrWidth + "px");
                                        if(targetCellEle !== undefined) {
                                            targetCellEle.css("width", currWidth + "px");
                                            targetNextCellEle.css("width", nextCurrWidth + "px");
                                        }
                                        if(targetTfootCellEle !== undefined) {
                                            targetTfootCellEle.css("width", currWidth + "px");
                                            targetNextTfootCellEle.css("width", nextCurrWidth + "px");
                                        }
                                    }
                                    currCellEle.find(".resize_bar__").offset({
                                        "left" : minPx - resizeBarWidth/2 + movedPx + opts.misc.resizeBarCorrectionLeft
                                    });
                                }
                            }
                        });

                        let currResizeBar = N(this);
                        N(window.document).on("mouseup.grid.resize touchend.grid.resize", function(e) {
                            currResizeBar.animate({
                                "height" : String(theadCells.filter(":eq(0)").outerHeight()) + "px"
                            }, 200, function() {
                                N(this).css({
                                    "opacity": "0"
                                });

                                currResizeBar = undefined;
                            });

                            N(document).off("dragstart.grid.resize selectstart.grid.resize mousemove.grid.resize touchmove.grid.resize mouseup.grid.resize touchend.grid.resize");
                            isPressed = false;
                        });
                    }
                });
            });

            resizeBar = currResizeBar = resizeBarHeight = cellEle = currCellEle = currNextCellEle = targetCellEle = targetNextCellEle =
                targetTfootCellEle = targetNextTfootCellEle = currResizeBarEle =
                    defWidth = nextDefWidth = currWidth = nextCurrWidth = startOffsetX =
                        minPx = maxPx = defPx = movedPx = undefined;
            // }
        };

        static sort = function() {
            const opts = this.options;
            const thead = this.thead;

            const theadCells = thead.find(">tr>th:not(.grid_more_thead_col__)");
            theadCells.css("cursor", "pointer");
            const self = this;
            theadCells.filter(function(i, cell) {
                return N(cell).data("id") !== undefined;
            }).on("click.grid.sort", function(e) {
                const currEle = N(this);
                if(currEle.data("sortLock")) {
                    currEle.data("sortLock", false);
                    return false;
                }
                if (opts.data.length > 0) {
                    if(NC.string.trimToNull(N(this).text()) !== null && N(this).find(opts.checkAll).length === 0) {
                        let isAsc = false;
                        if (currEle.find(".sortable__").hasClass("asc__")) {
                            isAsc = true;
                        }
                        if (isAsc) {
                            self.bind(N(opts.data).datasort(N(this).data("id"), true), "grid.sort");
                            theadCells.find(".sortable__").remove();
                            currEle.append('<span class="sortable__ desc__">' + opts.sortableItem.asc + '</span>');
                        } else {
                            self.bind(N(opts.data).datasort(N(this).data("id")), "grid.sort");
                            theadCells.find(".sortable__").remove();
                            currEle.append('<span class="sortable__ asc__">' + opts.sortableItem.desc + '</span>');
                        }
                    }
                }
            });
        };

        static dataFilter = function() {
            const opts = this.options;
            const thead = this.thead;
            const theadCells = thead.find("> tr th").filter(function(i, cell) {
                return N(cell).data("id") !== undefined;
            });
            const self = this;

            let clonedData;

            let filterKeys;
            let filteredKeys;
            let bfrSelId;

            const changeBtnIcon = function(th, kind) {
                th.find(".btn_data_filter__")
                    .removeClass("btn_data_filter_empty__ btn_data_filter_part__ btn_data_filter_full__")
                    .addClass("btn_data_filter_" + kind + "__");
            };

            const btnEle = N('<a href="#" class="btn_data_filter__" title="' + NC.message.get(opts.message, "dFilter") + '"><span>' + NC.message.get(opts.message, "dFilter") + '</span><a>')
                .addClass("btn_data_filter_full__")
                .on("click.grid.dataFilter", function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    const thisEle = N(this);
                    const visiblePanel = thead.find(".data_filter_panel__.visible__");
                    if(visiblePanel.length > 0) {
                        visiblePanel.removeClass("visible__").addClass("hidden__");
                        const eventNm = NC.event.whichTransitionEvent(visiblePanel);
                        visiblePanel.off(eventNm).one(eventNm, function(e){
                            if(!thisEle.hasClass("btn_data_filter__")) {
                                N(this).hide();
                            }
                        }).trigger("nothing");
                    }

                    const theadCell = N(this).closest("th");

                    let panel;
                    let searchBox;
                    let filterListBox;
                    const id = theadCell.data("id");
                    let dataFilterProgress;

                    if(theadCell.find(".data_filter_panel__").length > 0) {
                        panel = theadCell.find(".data_filter_panel__").hide().removeClass("visible__").addClass("hidden__");
                        dataFilterProgress = theadCell.find(".data_filter_progress__");
                        searchBox = panel.find(".data_filter_search__");
                        panel.find(".data_filter_checkall_box__ .data_filter_total_cnt__").text('(' + opts.data.length + ')');
                        filterListBox = panel.find(".data_filter_list__");

                        // Index filter keys
                        if(bfrSelId !== id) {
                            filterKeys = {};
                            jQuery.each(clonedData, function(i, v) {
                                if(filterKeys[id + "_" + v[id]] === undefined) {
                                    filterKeys[id + "_" + v[id]] = [i];
                                } else {
                                    filterKeys[id + "_" + v[id]].push(i);
                                }
                            });
                        }

                        // Index filter keys from filtered data
                        filteredKeys = {};
                        jQuery.each(opts.data, function(i, v) {
                            if(filteredKeys[id + "_" + v[id]] === undefined) {
                                filteredKeys[id + "_" + v[id]] = [i];
                            } else {
                                filteredKeys[id + "_" + v[id]].push(i);
                            }
                        });
                    } else {
                        if(theadCells.find(".data_filter_panel__").length === 0) {
                            clonedData = opts.data.get().slice(0);
                        }

                        panel = N('<div style="text-align: left;" class="data_filter_panel__ hidden__">'
                            +   '<div class="data_filter_search__">'
                            +       '<input class="data_filter_search_word__" type="text">'
                            +       '<a class="data_filter_search_btn__" href="#" title="' + NC.message.get(opts.message, "search") + '">'
                            +           '<span>' + NC.message.get(opts.message, "search") + '</span>'
                            +       '</a>'
                            +   '</div>'
                            +   '<div class="data_filter_checkall_box__"><label><input type="checkbox" checked="checked"><span class="data_filter_select_all__">' + NC.message.get(opts.message, "selectAll") + '</span><span class="data_filter_total_cnt__">(' + opts.data.length + ')</span></label></div>'
                            +   '<ul class="data_filter_list__"></ul>'
                            + '</div>')
                            .css("z-index", 1)
                            .hide()
                            .appendTo(theadCell).on("click.grid.dataFilter, mouseover.grid.dataFilter", function(e) {
                                e.stopPropagation();
                            });

                        dataFilterProgress = N('<div class="data_filter_progress__"></div>')
                            .css({
                                "z-index" : 2,
                                "opacity" : 0.3
                            })
                            .appendTo(panel);

                        searchBox = panel.find(".data_filter_search__");

                        // search btn event
                        panel.find(".data_filter_search_btn__").on("click.grid.dataFilter", function(e) {
                            e.preventDefault();
                            const searchWord = panel.find(".data_filter_search_word__").val();
                            if(NC.string.trimToNull(searchWord) !== null) {
                                const retChkbxs = filterListBox.find("li:contains('" + searchWord + "')").show().find(":checkbox").prop("checked", true);
                                filterListBox.find("li:not(:contains('" + searchWord + "'))").hide().find(":checkbox").prop("checked", false).last().trigger("do.grid.dataFilter");
                                retChkbxs.each(function() {
                                    const chkboxEle = N(this);
                                    chkboxEle.parent().children(".data_filter_cnt__").text('(' + String(chkboxEle.data("length")) + ')')
                                });
                            } else {
                                filterListBox.find("li").show();
                                filterListBox.find("li :checkbox").prop("checked", true).last().trigger("do.grid.dataFilter");
                            }
                        });
                        panel.find(".data_filter_search_word__").on("keyup.grid.dataFilter", function(e) {
                            if ((e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode)) === 13) {
                                panel.find(".data_filter_search_btn__").trigger("click");
                            }
                        });

                        // select all checkbox event
                        panel.find(".data_filter_checkall_box__ :checkbox").on("click.grid.dataFilter", function() {
                            if(N(this).is(":checked")) {
                                let chkboxEle;
                                panel.find(".data_filter_search_word__").val("");
                                filterListBox.find("li").show();
                                filterListBox.find("li :checkbox").prop("checked", true).each(function() {
                                    chkboxEle = N(this);
                                    chkboxEle.parent().children(".data_filter_cnt__").text('(' + String(chkboxEle.data("length")) + ')')
                                }).last().trigger("do.grid.dataFilter");
                            } else {
                                filterListBox.find("li .data_filter_checkbox__").prop("checked", false).last().trigger("do.grid.dataFilter");
                                filterListBox.find("li .data_filter_cnt__").text("(0)");
                            }
                        });

                        filterListBox = panel.find(".data_filter_list__").css({
                            "max-height" : opts.height - searchBox.outerHeight() - panel.find(".data_filter_checkall_box__").height() - 15
                        });

                        // Index filter keys
                        filterKeys = {};
                        jQuery.each(clonedData, function(i, v) {
                            if(filterKeys[id + "_" + v[id]] === undefined) {
                                filterKeys[id + "_" + v[id]] = [i];
                            } else {
                                filterKeys[id + "_" + v[id]].push(i);
                            }
                        });

                        // Index filter keys from filtered data
                        if(!NC.isEmptyObject(filteredKeys) && clonedData.length !== opts.data.length) {
                            filteredKeys = {};
                            jQuery.each(opts.data, function(i, v) {
                                if(filteredKeys[id + "_" + v[id]] === undefined) {
                                    filteredKeys[id + "_" + v[id]] = [i];
                                } else {
                                    filteredKeys[id + "_" + v[id]].push(i);
                                }
                            });
                        } else {
                            filteredKeys = filterKeys;
                        }
                    }

                    panel.show(0, function() {
                        N(this).removeClass("hidden__").addClass("visible__");
                    });

                    let itemSeq = 0;
                    for(const k in filterKeys) {
                        let filterItemEle;
                        const length = filteredKeys[k] === undefined ? 0 : filteredKeys[k].length;

                        const prevFilterItemEle = filterListBox.find(".data_filter_item_" + String(itemSeq) + "__");
                        if(prevFilterItemEle.length > 0) {
                            filterItemEle = prevFilterItemEle;
                            filterItemEle.find(".data_filter_cnt__").text("(" + String(length) + ")");
                        } else {
                            filterItemEle = N('<li class="data_filter_item_' + String(itemSeq) + '__">'
                                + '<label><input type="checkbox" checked="checked" class="data_filter_checkbox__">'
                                + '<span class="data_filter_item_name__"></span><span class="data_filter_cnt__">(' + String(length) + ')</span></label></li>');

                            filterItemEle.find(".data_filter_item_name__").text(k.replace(id + "_", ""));

                            filterItemEle.find(".data_filter_checkbox__")
                                .data("rowIdxs", filterKeys[k])
                                .data("length", length)
                                .on("click.grid.dataFilter, do.grid.dataFilter", function() {
                                    // Update the count of rows for each filter item
                                    const thisEle = N(this);
                                    if(thisEle.is(":checked")) {
                                        thisEle.parent().children(".data_filter_cnt__").text("(" + String(thisEle.data("length")) + ")");
                                    } else {
                                        thisEle.parent().children(".data_filter_cnt__").text("(0)");
                                    }

                                    // dataFilterListUnCheckedEles is current thead's cell unchecked data filter list
                                    let dataFilterListUnCheckedEles = theadCell.find(".data_filter_list__ li :checkbox:not(:checked)");
                                    if(dataFilterListUnCheckedEles.length > 0) {
                                        panel.find(".data_filter_checkall_box__ :checkbox").prop("checked", false);
                                        if(theadCell.find(".data_filter_list__ li :checkbox:checked").length > 0) {
                                            changeBtnIcon(theadCell, "part");
                                        } else {
                                            changeBtnIcon(theadCell, "empty");
                                        }
                                    } else {
                                        panel.find(".data_filter_checkall_box__ :checkbox").prop("checked", true);
                                        changeBtnIcon(theadCell, "full");
                                    }

                                    // dataFilterListUnCheckedEles is all thead's cells unchecked data filter list
                                    dataFilterListUnCheckedEles = theadCells.find(".data_filter_list__ li :checkbox:not(:checked)");

                                    let filterIdxs = [];
                                    dataFilterListUnCheckedEles.each(function() {
                                        jQuery.each(N(this).data("rowIdxs"), function(i, v) {
                                            filterIdxs[v] = v;
                                        });
                                    });

                                    filterIdxs = jQuery.grep(filterIdxs, function(n){ return n === 0 || n });

                                    dataFilterProgress.show().fadeTo(50, 0.5, function() {
                                        // init scrollPaging index
                                        opts.scrollPaging.idx = 0;

                                        if(filterIdxs.length > 0 && filterIdxs.length !== clonedData.length) {
                                            const extrData = clonedData.slice(0);
                                            let bfrFilterIdx = -1;
                                            let addUnits = 0;
                                            let i;
                                            for(i = 0; i < filterIdxs.length; i++){
                                                if(filterIdxs[i] - bfrFilterIdx === 1) {
                                                    addUnits++;
                                                } else {
                                                    extrData.splice((bfrFilterIdx - addUnits + 1) - (i - addUnits), addUnits);
                                                    addUnits = 1;
                                                }
                                                bfrFilterIdx = filterIdxs[i];
                                            }
                                            extrData.splice((bfrFilterIdx - addUnits + 1) - (i - addUnits), addUnits);

                                            self.bind(extrData, "grid.dataFilter");
                                        } else {
                                            if(filterIdxs.length > 0) {
                                                self.bind([], "grid.dataFilter");
                                            } else {
                                                self.bind(clonedData, "grid.dataFilter");
                                            }
                                        }

                                        // Update total count.
                                        theadCell.find(".data_filter_total_cnt__").text("(" + String(opts.data.length) + ")");

                                        // Prevent event propagation when browser is stoped.
                                        setTimeout(function() {
                                            dataFilterProgress.hide();
                                        }, 0);
                                    });
                                });

                            filterListBox.append(filterItemEle);
                        }

                        if(length === 0) {
                            filterItemEle.find(".data_filter_checkbox__").prop("checked", false);
                        }
                        itemSeq++;
                    }

                    N(document).off("click.grid.dataFilter");
                    N(document).on("click.grid.dataFilter", function(e) {
                        if(N(e.target).closest(".data_filter_panel__, .btn_data_filter__").length === 0
                            && !N(e.target).hasClass("btn_data_filter__")
                            && !N(e.target).hasClass("form__")) {
                            const panel = thead.find(".data_filter_panel__.visible__");
                            if(panel.length > 0) {
                                panel.removeClass("visible__").addClass("hidden__");
                                const eventNm = NC.event.whichTransitionEvent(panel);
                                panel.off(eventNm).one(eventNm, function(e){
                                    N(this).hide();
                                    N(document).off("click.grid.dataFilter");
                                }).trigger("nothing");
                            }
                        }
                    });

                    bfrSelId = id;
                }).prependTo(theadCells.filter("[data-filter='true']:not(.grid_more_thead_col__)"));
        };

        static rowSpan = function(i, rowEle, bfRowEle, rowData, bfRowData, colId) {
            if(bfRowData !== undefined && rowData[colId] === bfRowData[colId]) {
                const bfRowCell = bfRowEle.find("#" + colId).closest("td");
                let prevColId;
                const prevBfRowCell = bfRowCell.prev("td");
                if(prevBfRowCell.length > 0) {
                    if(prevBfRowCell.attr("id")) {
                        prevColId = prevBfRowCell.attr("id");
                    } else {
                        prevColId = prevBfRowCell.find("[id]").attr("id");
                    }
                }
                if((this.rowSpanIds.get().join("|") + "|").indexOf(prevColId) < 0 || bfRowCell.prev("td").hasClass("grid_rowspan__")) {
                    const cell = rowEle.find("#" + colId).closest("td");
                    let bfCellBgColor = bfRowCell.css("background-color");
                    if(bfCellBgColor === "rgba(0, 0, 0, 0)" || bfCellBgColor === "transparent") {
                        bfCellBgColor = bfRowCell.parent().css("background-color");
                    }
                    if(bfCellBgColor === "rgba(0, 0, 0, 0)" || bfCellBgColor === "transparent") {
                        bfCellBgColor = bfRowCell.parent().parent().css("background-color");
                    }

                    bfRowCell.css("border-bottom-color", bfCellBgColor);

                    bfRowCell.css("background-color", bfCellBgColor);
                    cell.css("background-color", bfCellBgColor);

                    bfRowCell.addClass("grid_rowspan__");

                    const cldr = cell.children();
                    if(cldr.length > 0) {
                        cldr.hide();
                    } else {
                        cell.empty();
                    }
                }
            }
        };

        static paste = function() {
            const self = this;
            self.tempRowEle.find("[id]").not(":input").attr("contenteditable", "true").on("keydown.grid.paste", function(e) {
                if(!e.ctrlKey) {
                    e.target.blur();
                    e.preventDefault();
                    return false;
                }
            });
            self.context().on("paste", ".form__ [id]", function(e) {
                e.preventDefault();

                let content;
                if ("clipboardData" in window) {
                    content = window.clipboardData.getData('Text');
                    if (window.getSelection) {
                        const selObj = window.getSelection();
                        const selRange = selObj.getRangeAt(0);
                        selRange.deleteContents();
                        selRange.insertNode(document.createTextNode(content));
                    }
                } else if (e.originalEvent.clipboardData) {
                    content = (e.originalEvent || e).clipboardData.getData('text/plain');
                }

                if (!content && content.length) {
                    return false;
                }

                const thisEle = N(this);
                const currRowIndex = self.context(".form__").index(thisEle.closest(".form__"));
                const currCellIndex = self.context(".form__:eq(" + currRowIndex + ") [id]").index(thisEle);

                const rows = content.replace(/"((?:[^"]*(?:\r\n|\n\r|\n|\r))+[^"]+)"/mg, function (match, p1) {
                    return p1.replace(/""/g, '"').replace(/\r\n|\n\r|\n|\r/g, ' ');
                }).split(/\r\n|\n\r|\n|\r/g);
                const columns = self.tempRowEle.find("[id]").map(function() {
                    return N(this).attr("id");
                });
                for (let i = 0; i < rows.length; i++) {
                    if(NC.isEmptyObject(rows[i])) continue;

                    const data = rows[i].split('\t');
                    const rowEle = self.context(".form__:eq(" + String(currRowIndex + i) + ")");
                    for (let j = 0; j < data.length; j++) {
                        const colNm = columns.get(currCellIndex + j);
                        const colEle = rowEle.find("#" + colNm);
                        if(!colEle.prop("readonly") && !colEle.prop("disabled")) {
                            self.val(currRowIndex + i, columns.get(currCellIndex + j), data[j]);
                        }
                    }

                }
            });
        }

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

                    const rowEles = this.contextEle.find(">tbody.form__");
                    rowEles.filter(".grid_selected__").each(function() {
                        if(arguments.length > 1) {
                            args[0] = opts.data[rowEles.index(this)];
                            retData.push(NC.json.mapFromKeys.apply(NC.json, args));
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

                const rowEles = this.contextEle.find(">tbody.form__");
                rowEles.find(opts.checkAllTarget||opts.checkSingleTarget).filter(":checked").each(function() {
                    const thisEle = N(this);
                    if(arguments.length > 1) {
                        args[0] = opts.data[rowEles.index(thisEle.closest("tbody.form__"))];
                        retData.push(NC.json.mapFromKeys.apply(NC.json, args));
                    } else {
                        retData.push(opts.data[rowEles.index(thisEle.closest("tbody.form__"))]);
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
                        return NC.json.mapFromKeys.apply(NC.json, args);
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

        contextHead(sel) {
            return sel !== undefined ? this.thead.find(sel) : this.thead;
        };

        contextBodyTemplate(sel) {
            return sel !== undefined ? this.tempRowEle.find(sel) : this.tempRowEle;
        };

        select(row, isAppend) {
            const opts = this.options;
            if(!opts.select && !opts.multiselect) {
                NC.warn("[NU.grid.select]The \"select\" or \"multiselect\" option is disabled. To use this method, set the value of the \"select\" or \"multiselect\" option to true.");
                return false;
            }

            if(row === undefined) {
                const rowEles = this.contextEle.find(">tbody.form__");
                return rowEles.filter(".grid_selected__").map(function () {
                    return rowEles.index(this);
                }).get();
            } else {
                if(NC.type(row) !== "array") {
                    row = [row];
                }

                const self = this;
                let selRowEle;

                if(!isAppend) {
                    self.contextEle.find(">tbody.grid_selected__").removeClass("grid_selected__");
                }
                N(row).each(function() {
                    selRowEle = self.contextEle.find(">tbody" + (self.options.data.length > 0 ? ".form__" : "") +":eq(" + String(this) + ")");
                    if(selRowEle.hasClass("grid_selected__")) {
                        selRowEle.removeClass("grid_selected__");
                    }
                    selRowEle.trigger("click.grid");
                });

                if(opts.selectScroll) {
                    let scrollTop = (row[row.length - 1] * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
                    if(scrollTop < 0) {
                        scrollTop = 0;
                    }
                    opts.context.parent(".tbody_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing');
                }

                return this;
            }
        };

        check(row, isAppend) {
            const opts = this.options;
            if(row === undefined) {
                const rowEles = this.contextEle.find(">tbody.form__");
                return rowEles.find(opts.checkAllTarget || opts.checkSingleTarget).filter(":checked").map(function () {
                    return rowEles.index(N(this).closest("tbody.form__"));
                }).get();
            } else {
                if(NC.type(row) !== "array") {
                    row = [row];
                }

                const self = this;
                let checkboxEle;
                if(!isAppend) {
                    self.contextEle.find(">tbody").find((opts.checkAllTarget||opts.checkSingleTarget) + ":checked").prop("checked", false);
                }
                N(row).each(function() {
                    checkboxEle = self.contextEle.find(">tbody").find(opts.checkAllTarget||opts.checkSingleTarget).eq(this);
                    if(checkboxEle.is(":checked")) {
                        checkboxEle.prop("checked", false);
                    }
                    checkboxEle.trigger("click.grid");
                });

                if(opts.checkScroll) {
                    const selRowEle = checkboxEle.closest("tbody.form__");
                    let scrollTop = (row[row.length - 1] * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
                    if(scrollTop < 0) {
                        scrollTop = 0;
                    }
                    opts.context.parent(".tbody_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing');
                }

                return this;
            }
        };

        /**
         * callType arguments is call type about scrollPaging(internal), data filter(internal), data append(external), DataSync's update.
         * callType : "append" | "grid.bind" | "grid.dataFilter" | "grid.sort" | "grid.update"
         */
        bind(data, callType) {
            const opts = this.options;
            // remove all sort status
            if(opts.sortable && callType !== "grid.sort") {
                this.thead.find(".sortable__").remove();
            }
            if(!opts.isBinding) {
                if(opts.data && data && callType === "append") {
                    opts.scrollPaging.size = 0;
                    // Merge data to binded data;
                    opts.scrollPaging.idx = opts.data.length - 1;
                    jQuery.merge(opts.data, data);
                } else {
                    opts.scrollPaging.size = opts.scrollPaging.defSize;
                    // rebind new data
                    if(data != null) {
                        opts.data = NC.type(data) === "array" ? N(data) : data;
                    }
                }

                // remove all data filter status
                if(opts.filter || this.thead.find("> tr th[data-filter='true']").length > 0) {
                    // [callType === "grid.sort"]To keep your filter list even after sorting delete this codes.
                    if(callType !== "grid.dataFilter" && callType !== "grid.sort"
                        || (!(callType !== "grid.dataFilter" && callType !== "grid.sort") && callType === "grid.sort")) {
                        this.thead.find("th .data_filter_panel__").remove();

                        if(callType !== "grid.dataFilter" && callType !== "grid.sort") {
                            this.thead.find(".btn_data_filter__")
                                .removeClass("btn_data_filter_empty__ btn_data_filter_part__ btn_data_filter_full__")
                                .addClass("btn_data_filter_full__");

                            if(opts.data.length > 0) {
                                this.thead.find(".btn_data_filter__").removeClass("hidden__").addClass("visible__");
                            } else {
                                this.thead.find(".btn_data_filter__").removeClass("visible__").addClass("hidden__");
                            }
                        }
                    }
                }

                if(opts.checkAll !== null) {
                    this.thead.find(opts.checkAll).prop("checked", false);
                }
                if (opts.data.length > 0 || (callType === "append" && data && data.length > 0)) {
                    //clear tbody visual effect
                    opts.context.find(">tbody").clearQueue().stop();
                    if(callType !== "grid.bind") {
                        if(callType === "append" && data.length > 0) {
                            opts.scrollPaging.idx = opts.data.length - data.length;
                        } else {
                            opts.scrollPaging.idx = 0;
                        }
                    }

                    if(opts.scrollPaging.idx === 0) {
                        //remove tbodys in grid body area
                        if(callType === "append" && data.length > 0) {
                            opts.context.find(">tbody>tr>td.empty__").parent().parent().remove();
                        } else {
                            opts.context.find(">tbody").remove();
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

                    NU.ui.iteration.render.call(this, i, limit, delay, lastIdx, callType);

                    if(opts.appendScroll && i > 0 && callType === "append") {
                        opts.context.parent(".tbody_wrap__").stop().animate({
                            "scrollTop" : opts.context.parent(".tbody_wrap__").prop("scrollHeight")
                        }, 300, 'swing');
                    }
                } else {
                    //remove tbodys in grid body area
                    opts.context.find(">tbody").remove();

                    let colspan = 0;
                    if(this.tableMap.colgroup[0] !== undefined && this.tableMap.colgroup[0].length > 0) {
                        colspan = N(this.tableMap.colgroup[0]).not(":regexp(css:display, none), [hidden]").length;
                    } else {
                        N(this.tableMap.tbody).each(function(i, eles) {
                            const currLen = N(eles).not(":regexp(css:display, none), [hidden]").length;
                            if(colspan < currLen) {
                                colspan = currLen;
                            }
                        });
                    }

                    const emptyEle = N('<tbody><tr><td class="empty__" ' + (colspan > 0 ? 'colspan=' + String(colspan) : '') + '>'
                        + NC.message.get(opts.message, "empty") + '</td></tr></tbody>');

                    opts.context.append(emptyEle);

                    if(opts.fixedcol > 0) {
                        setTimeout(function() {
                            const emptyCellEle = emptyEle.find(".empty__");
                            const emptyCellEleBLW = parseInt(NC.string.trimToZero(emptyCellEle.css("border-left")));
                            const emptyCellEleBRW = parseInt(NC.string.trimToZero(emptyCellEle.css("border-right")));

                            emptyCellEle.css({
                                "position" : "absolute",
                                "left" : 0,
                                "padding-left" : 0,
                                "padding-right" : 0,
                                "width" : opts.context.parent(".grid_wrap__").parent(".grid_container__").outerWidth() - emptyCellEleBLW - emptyCellEleBRW
                            });
                            emptyCellEle.parent("tr").css("height", emptyCellEle.outerHeight());
                        }, 0);
                    }

                    if(opts.onBind !== null && callType !== "grid.update") {
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
            if (opts.context.find("td.empty__").length > 0) {
                opts.context.find(">tbody").remove();
            }
            const tempRowEleClone = this.tempRowEle.clone(true, true);

            if(NC.isNumeric(data)) {
                row = data;
                data = undefined;
            }

            if(row > opts.data.length || row < 0) {
                row = undefined;
            }

            if(row === undefined) {
                if(opts.addTop) {
                    opts.context.find(">thead").after(tempRowEleClone);
                } else {
                    opts.context.append(tempRowEleClone);
                }
            } else {
                let selRowEle = opts.context.find(">tbody:eq(" + row + ")");
                let scrollTop;

                if(row === 0) {
                    opts.context.find("thead").after(tempRowEleClone);
                } else if(row === opts.context.find(">tbody").length) {
                    selRowEle = opts.context.find(">tbody:eq(" + (row - 1) + ")");
                } else {
                    opts.context.find(">tbody:eq(" + row + ")").before(tempRowEleClone);
                }

                if(opts.addScroll) {
                    scrollTop = (row * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
                    if(scrollTop < 0) {
                        scrollTop = 0;
                    }
                    opts.context.parent(".tbody_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing', function() {
                        if(opts.addSelect) {
                            N(this).find(">table>tbody:eq(" + row + ")").trigger("click.grid");
                        }
                    });
                } else {
                    if(opts.addSelect) {
                        setTimeout(function() {
                            opts.context.parent(".tbody_wrap__").find(">table>tbody:eq(" + row + ")").trigger("click.grid");
                        }, 0);
                    }
                }
            }

            // for new row data bind, use NU.form
            const form = opts.data.form({
                context : tempRowEleClone,
                html: opts.html,
                validate : opts.validate,
                extObj : this,
                extRow : row === undefined ? (opts.addTop ? 0 : opts.data.length) : row,
                addTop : opts.addTop,
                revert : opts.revert,
                tpBind : opts.tpBind
            });

            form.add(data, row);

            if(opts.rowHandler !== null) {
                opts.rowHandler.call(this, form.options.extRow, tempRowEleClone, form.data(true)[0]);
            }

            if(opts.fixedcol > 0) {
                tempRowEleClone.find(".grid_body_fixed__").outerHeight(tempRowEleClone.height() + opts.misc.fixedcolBodyAddHeight);
            }

            // unselect rows
            opts.context.find("> tbody").removeClass("grid_selected__");

            // scroll to created row element
            if(row === undefined) {
                opts.context.parent(".tbody_wrap__").stop().animate({
                    "scrollTop" : (opts.addTop ? 0 : opts.context.parent(".tbody_wrap__").prop("scrollHeight"))
                }, 300, 'swing', function() {
                    if(opts.addSelect) {
                        N(this).find("> table > tbody:" + (opts.addTop ? "first" : "last")).trigger("click.grid");
                    }
                });
            }

            return this;
        };

        remove(row) {
            const opts = this.options;
            if(row !== undefined) {
                if(NC.type(row) !== "array") {
                    row = [row];
                }
                N(row.sort().reverse()).each(function(i, row) {
                    if (opts.data[this] === undefined) {
                        throw NC.error("[NU.grid.prototype.remove]Row index is out of range");
                    }
                    if (opts.data[this].rowStatus === "insert") {
                        opts.data.splice(this, 1);
                        opts.context.find(">tbody:eq(" + row + ")").remove();


                        // for scroll paging
                        // just +1 is inappropriate on android 4.4.2 webkit
                        const rowEleLength = opts.context.find(">tbody").length;
                        const pagingSize = opts.scrollPaging.size;
                        const rest = rowEleLength % pagingSize;
                        opts.scrollPaging.idx = (rowEleLength / pagingSize) * pagingSize - pagingSize + rest;
                    } else {
                        opts.data[this].rowStatus = "delete";
                        opts.context.find(">tbody:eq(" + row + ")").addClass("row_data_deleted__");
                    }
                });
            }

            ND.ds.instance(this).notify();
            return this;
        };

        revert(row) {
            const opts = this.options;
            if(!opts.revert) {
                throw NC.error("[NU.form.prototype.revert]Can not revert. NU.form's revert option value is false");
            }

            const self = this;

            if(row !== undefined) {
                if(NC.type(row) !== "array") {
                    row = [row];
                }
                N(row).each(function() {
                    const i = this;
                    const context = opts.context.find(">tbody:eq(" + String(this) + ")");
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
                opts.context.find(">tbody").instance("form", function() {
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
                valiRslt = opts.context.find(">tbody:eq(" + String(row) + ")").instance("form").validate();
            } else {
                let rowStatus;
                opts.context.find(">tbody").instance("form", function(i) {
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
                const valiLastTbody = opts.context.find(".validate_false__:last").closest("tbody.form__");
                opts.context.parent(".tbody_wrap__").stop().animate({
                    "scrollTop" : opts.context.parent(".tbody_wrap__").scrollTop() + valiLastTbody.position().top - opts.height + (valiLastTbody.outerHeight() * 2)
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
                    throw NC.error("[NU.grid.prototype.val]There is no row data that is " + row + " index");
                }
            }
            return this;
        };

        move(fromRow, toRow) {
            NU.ui.iteration.move.call(this, fromRow, toRow, "grid");

            return this;
        };

        copy(fromRow, toRow) {
            NU.ui.iteration.copy.call(this, fromRow, toRow, "grid");

            return this;
        };

        show(colIdxs) {
            const opts = this.options;
            const self = this;
            if(colIdxs !== undefined) {
                if(NC.type(colIdxs) !== "array") {
                    colIdxs = [colIdxs];
                }
            }

            N(colIdxs).each(function(i, v) {
                let context = opts.height > 0 ? opts.context.parent(".tbody_wrap__").parent(".grid_wrap__") : opts.context;
                context = context.add(self.tempRowEle);
                context.find(".col_" + v + "__").each(function(i, ele) {
                    const colEle = N(ele);
                    const colSpanCnt = parseInt(colEle.attr("colspan"));
                    const orgColspan = colEle.data("colspan");
                    if(colSpanCnt < orgColspan) {
                        colEle.attr("colspan", colSpanCnt + 1);
                    }
                    colEle.css("display", "");
                });
            });

            const emptyEle = opts.context.find(">tbody>tr>.empty__");
            if(emptyEle.length > 0) {
                if(this.tableMap.colgroup[0] !== undefined && this.tableMap.colgroup[0].length > 0) {
                    emptyEle.attr("colspan", String(N(this.tableMap.colgroup[0]).not(":regexp(css:display, none)").length));
                } else {
                    N(this.tableMap.tbody).each(function(i, eles) {
                        const currLen = String(N(eles).not(":regexp(css:display, none)").length);
                        if(NC.string.trimToZero(emptyEle.attr("colspan")) < currLen) {
                            emptyEle.attr("colspan", currLen);
                        }
                    });
                }
            }

            return this;
        };

        hide(colIdxs) {
            const opts = this.options;
            const self = this;
            if(colIdxs !== undefined) {
                if(NC.type(colIdxs) !== "array") {
                    colIdxs = [colIdxs];
                }
            }

            N(colIdxs).each(function() {
                let context = opts.height > 0 ? opts.context.parent(".tbody_wrap__").parent(".grid_wrap__") : opts.context;
                context = context.add(self.tempRowEle);
                context.find(".col_" + this + "__").each(function() {
                    const colEle = N(this);
                    const colSpanCnt = parseInt(colEle.attr("colspan"));
                    if(colSpanCnt > 0) {
                        if(colEle.data("colspan") === undefined) {
                            colEle.data("colspan", colSpanCnt);
                        }
                        colEle.attr("colspan", colSpanCnt - 1);
                        if(colEle.attr("colspan") === "0") {
                            colEle.css("display", "none");
                        }
                    } else {
                        colEle.css("display", "none");
                    }
                });
            });

            const emptyEle = opts.context.find(">tbody>tr>.empty__");
            if(emptyEle.length > 0) {
                if(this.tableMap.colgroup[0] !== undefined && this.tableMap.colgroup[0].length > 0) {
                    emptyEle.attr("colspan", String(N(this.tableMap.colgroup[0]).not(":regexp(css:display, none)").length));
                } else {
                    N(this.tableMap.tbody).each(function(i, eles) {
                        const currLen = String(N(eles).not(":regexp(css:display, none)").length);
                        if(NC.string.trimToZero(emptyEle.attr("colspan")) < currLen) {
                            emptyEle.attr("colspan", currLen);
                        }
                    });
                }
            }

            return this;
        };

        update(row, key) {
            if(row !== undefined) {
                if(key !== undefined) {
                    this.options.context.find(">tbody:eq(" + String(row) + ")").instance("form").update(0, key);
                } else if(this.options.data[row]._isRevert !== true && this.options.data[row].rowStatus === "insert") {
                    if(this.options.data[row].rowStatus === "insert") {
                        this.bind(undefined, "grid.update");
                    } else {
                        this.add(this.options.data[row]);
                    }
                } else {
                    this.options.context.find(">tbody:eq(" + String(row) + ")").instance("form").update(0);
                }
            } else {
                this.bind(undefined, "grid.update");
            }
            return this;
        };

    }

    // Pagination
    static pagination = class {

        constructor(data, opts) {
            this.options = {
                data : NC.type(data) === "array" ? N(data) : data,
                context : null,
                totalCount : 0,
                countPerPage : 10,
                countPerPageSet : 10,
                pageNo : 1,
                onChange : null,
                blockOnChangeWhenBind : false,
                currPageNavInfo : null
            };

            try {
                jQuery.extend(this.options, NA.context.attr("ui").pagination);
            } catch (e) {
                throw NC.error("NU.pagination", e);
            }

            if(this.options.data.length > 0) {
                this.options.totalCount = this.options.data.length;
            }

            if (NC.isPlainObject(opts)) {
                // Wraps the global event options in NA.config and event options for this component.
                NU.ui.utils.wrapHandler(opts, "pagination", "onChange");

                //convert data to wrapped set
                opts.data = NC.type(opts.data) === "array" ? N(opts.data) : opts.data;

                jQuery.extend(this.options, opts);

                if(NC.type(this.options.context) === "string") {
                    this.options.context = N(this.options.context);
                }
            } else {
                this.options.context = N(opts);
            }

            // Initialize paging panel
            this.linkEles = NU.pagination.wrapEle.call(this);

            // set style class name to context element
            this.options.context.addClass("pagination__");

            // set this instance to context element
            this.options.context.instance("pagination", this);

            return this;
        };

        static wrapEle = function() {
            const opts = this.options;

            // pagination link element set
            const linkEles = {};

            const lefter = opts.context.find("ul:eq(0)").addClass("pagination_lefter__");

            linkEles.body = opts.context.find("ul:eq(1)").addClass("pagination_body__");
            linkEles.page = linkEles.body.find("li").addClass("pagination_page__");

            const righter = opts.context.find("ul:eq(2)").addClass("pagination_righter__");

            if(lefter.find("li").length === 2) {
                linkEles.first = lefter.find("li:eq(0)").addClass("pagination_first__ pagination_disable__");
                linkEles.prev = lefter.find("li:eq(1)").addClass("pagination_prev__ pagination_disable__");
            } else if(lefter.length === 1) {
                linkEles.prev = lefter.find("li:eq(0)").addClass("pagination_prev__ pagination_disable__");
            }
            if(righter.find("li").length === 2) {
                linkEles.next = righter.find("li:eq(0)").addClass("pagination_next__ pagination_disable__");
                linkEles.last = righter.find("li:eq(1)").addClass("pagination_last__ pagination_disable__");
            } else if(righter.length === 1) {
                linkEles.next = righter.find("li:eq(0)").addClass("pagination_next__ pagination_disable__");
            }

            opts.currPageNavInfo = NU.pagination.changePageSet(linkEles, opts);

            return linkEles;
        };

        static changePageSet = function(linkEles, opts, isRemake) {
            const pageCount = Math.ceil(opts.totalCount / opts.countPerPage);
            const pageSetCount = Math.ceil(pageCount / opts.countPerPageSet);
            let currSelPageSet = Math.ceil(opts.pageNo / opts.countPerPageSet);
            if (currSelPageSet > pageSetCount) { currSelPageSet = pageSetCount; }

            let startPage = (currSelPageSet - 1) * opts.countPerPageSet + 1;
            let endPage = startPage + opts.countPerPageSet - 1;

            if (startPage < 1) {
                startPage = 1;
            }
            if (endPage > pageCount) {
                endPage = pageCount;
            }
            if (endPage < 1) {
                endPage = 1;
            }

            if(isRemake === undefined || isRemake === false) {
                let pageClone;
                linkEles.body.empty();
                for(let i = startPage; i <= endPage; i++) {
                    pageClone = linkEles.page.clone(true, true);
                    pageClone.attr("data-pageno", String(i));
                    pageClone.find("a > span").text(String(i));
                    linkEles.body.append(pageClone);
                }
            }

            if(currSelPageSet > 0 && currSelPageSet > 1 && startPage >= currSelPageSet) {
                N(linkEles.prev).removeClass("pagination_disable__");
            } else {
                N(linkEles.prev).addClass("pagination_disable__");
            }
            if(linkEles.first !== undefined) {
                if(1 !== opts.pageNo) {
                    N(linkEles.first).removeClass("pagination_disable__");
                } else {
                    N(linkEles.first).addClass("pagination_disable__");
                }
            }

            if(pageSetCount > currSelPageSet) {
                N(linkEles.next).removeClass("pagination_disable__");
            } else {
                N(linkEles.next).addClass("pagination_disable__");
            }
            if(linkEles.last !== undefined) {
                if(pageCount > 0 && opts.pageNo !== pageCount) {
                    N(linkEles.last).removeClass("pagination_disable__");
                } else {
                    N(linkEles.last).addClass("pagination_disable__");
                }
            }

            const startRowIndex = (opts.pageNo - 1) * opts.countPerPage;
            let endRowIndex = (startRowIndex + opts.countPerPage) - 1;
            if(endRowIndex > opts.totalCount - 1) {
                endRowIndex = opts.totalCount - 1;
            }

            return opts.currPageNavInfo = {
                "pageNo" : opts.pageNo,
                "countPerPage" : opts.countPerPage,
                "countPerPageSet" : opts.countPerPageSet,
                "totalCount" : opts.totalCount,
                "pageCount" : pageCount,
                "pageSetCount" : pageSetCount,
                "currSelPageSet" : currSelPageSet,
                "startPage" : startPage,
                "endPage" : endPage,
                "startRowIndex" : startRowIndex,
                "startRowNum" : startRowIndex + 1,
                "endRowIndex" : endRowIndex,
                "endRowNum" : endRowIndex + 1
            };
        }

        data(selFlag) {
            if(selFlag === undefined) {
                return this.options.data.get();
            } else if(selFlag === false) {
                return this.options.data;
            }
        };

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        bind(data, totalCount) {
            const opts = this.options;
            const self = this;

            if(arguments.length > 0 && NC.type(arguments[0]) === "number") {
                // reset totalCount
                opts.totalCount = arguments[0];
            } else if(arguments.length > 0 && NC.type(arguments[0]) === "array") {
                // to rebind new data
                opts.data = NC.type(data) === "array" ? N(data) : data;

                // reset totalCount
                if(totalCount !== undefined) {
                    opts.totalCount = totalCount;
                } else {
                    if(data != null) {
                        opts.totalCount = data.length;
                    }
                }
            }

            const linkEles = this.linkEles;
            opts.currPageNavInfo = NU.pagination.changePageSet(linkEles, opts);

            // first button event
            if(linkEles.first !== undefined) {
                linkEles.first.off("click.pagination");
                linkEles.first.on("click.pagination", function(e) {
                    e.preventDefault();
                    if(1 !== opts.pageNo) {
                        opts.pageNo = 1;
                        opts.currPageNavInfo = NU.pagination.changePageSet(linkEles, opts);
                        linkEles.body.find("li a:first").trigger("click.pagination");
                    }
                });
            }

            // previous button event
            linkEles.prev.off("click.pagination");
            linkEles.prev.on("click.pagination", function(e) {
                e.preventDefault();
                if(opts.currPageNavInfo.currSelPageSet > 1 && opts.currPageNavInfo.startPage >= opts.currPageNavInfo.currSelPageSet) {
                    opts.pageNo = opts.currPageNavInfo.startPage - opts.countPerPageSet;
                    opts.currPageNavInfo = NU.pagination.changePageSet(linkEles, opts);
                    linkEles.body.find("li a:first").trigger("click.pagination");
                }
            });

            // page number button event
            linkEles.body.off("click.pagination");
            linkEles.body.on("click.pagination", "li > a", function(e, isFirst) {
                e.preventDefault();

                opts.pageNo = Number(N(this).parent().data("pageno"));
                opts.currPageNavInfo = NU.pagination.changePageSet(linkEles, opts, true);

                if(opts.onChange !== null) {
                    const selData = [];
                    if(opts.data.length > 0 && opts.data.length <= opts.totalCount) {
                        for(let i = opts.currPageNavInfo.startRowIndex; i <= opts.currPageNavInfo.endRowIndex; i++) {
                            if(opts.data[i] !== undefined) {
                                selData.push(opts.data[i]);
                            }
                        }
                    }
                    if(opts.blockOnChangeWhenBind === false || (opts.blockOnChangeWhenBind === true && isFirst !== true)) {
                        opts.onChange.call(self, opts.pageNo, N(this), selData, opts.currPageNavInfo);
                    }
                }

                linkEles.body.find("li.pagination_active__").removeClass("pagination_active__");
                N(this).parent().addClass("pagination_active__");
            }).find("li a:eq(" + String(opts.pageNo - opts.currPageNavInfo.startPage) +  ")").trigger("click.pagination", [true]);

            // next button event
            linkEles.next.off("click.pagination");
            linkEles.next.on("click.pagination", function(e) {
                e.preventDefault();
                if(opts.currPageNavInfo.pageSetCount > opts.currPageNavInfo.currSelPageSet) {
                    opts.pageNo = opts.currPageNavInfo.startPage + opts.countPerPageSet;
                    opts.currPageNavInfo = NU.pagination.changePageSet(linkEles, opts);
                    linkEles.body.find("li a:first").trigger("click.pagination");
                }
            });

            // last button event
            if(linkEles.last !== undefined) {
                linkEles.last.off("click.pagination");
                linkEles.last.on("click.pagination", function(e) {
                    e.preventDefault();
                    if(opts.pageNo !== opts.currPageNavInfo.pageCount) {
                        opts.pageNo = opts.currPageNavInfo.pageCount;
                        opts.currPageNavInfo = NU.pagination.changePageSet(linkEles, opts);
                        linkEles.body.find("li a:last").trigger("click.pagination");
                    }
                });
            }

            return this;
        };

        totalCount(totalCount) {
            const opts = this.options;
            if(totalCount !== undefined) {
                opts.totalCount = totalCount;
                return this;
            } else {
                return opts.totalCount;
            }
        };

        pageNo(pageNo) {
            const opts = this.options;
            if(pageNo !== undefined) {
                opts.pageNo = pageNo;
                return this;
            } else {
                return opts.pageNo;
            }
        };

        countPerPage(countPerPage) {
            if(countPerPage !== undefined) {
                const opts = this.options;
                opts.countPerPage = countPerPage;
                opts.pageNo = 1;
            } else {
                return this.options.countPerPage;
            }
            return this;
        };

        countPerPageSet(countPerPageSet) {
            if(countPerPageSet !== undefined) {
                const opts = this.options;
                opts.countPerPageSet = countPerPageSet;
                opts.pageNo = 1;
            } else {
                return this.options.countPerPageSet;
            }
            return this;
        };

        currPageNavInfo() {
            return this.options.currPageNavInfo;
        };

    }

    // Tree
    static tree = class {

        constructor(data, opts) {
            this.options = {
                data : NC.type(data) === "array" ? N(data) : data,
                context : null,
                key : null,
                val : null,
                level : null, // optional
                parent : null,
                folderSelectable : false,
                checkbox : false,
                onSelect : null,
                onCheck : null
            };

            try {
                jQuery.extend(this.options, NA.context.attr("ui").tree);
            } catch (e) {
                throw NC.error("NU.tree", e);
            }

            if (NC.isPlainObject(opts)) {
                // Wraps the global event options in NA.config and event options for this component.
                NU.ui.utils.wrapHandler(opts, "tree", "onSelect");
                NU.ui.utils.wrapHandler(opts, "tree", "onCheck");

                //convert data to wrapped set
                opts.data = NC.type(opts.data) === "array" ? N(opts.data) : opts.data;

                jQuery.extend(this.options, opts);

                if(NC.type(this.options.context) === "string") {
                    this.options.context = N(this.options.context);
                }
            } else {
                this.options.context = N(opts);
            }

            // set style class name to context element
            this.options.context.addClass("tree__");

            // set this instance to context element
            this.options.context.instance("tree", this);

            // register this to ND.ds for realtime data synchronization
            ND.ds.instance(this, true);

            return this;
        };

        data(selFlag) {
            if(selFlag === undefined) {
                return this.options.data.get();
            } else if(selFlag === false) {
                return this.options.data;
            } else if(selFlag === "selected") {
                const data = this.options.data;
                if(arguments.length > 1) {
                    // clone arguments
                    const args = Array.prototype.slice.call(arguments, 0);
                    return this.options.context.find(".tree_active__").map(function() {
                        args[0] = data[N(this).closest("li").data("index")];
                        return NC.json.mapFromKeys.apply(NC.json, args);
                    }).get();
                } else {
                    return this.options.context.find(".tree_active__").map(function() {
                        return data[N(this).closest("li").data("index")];
                    }).get();
                }
            } else if(selFlag === "checked") {
                const data = this.options.data;
                if(arguments.length > 1) {
                    // clone arguments
                    const args = Array.prototype.slice.call(arguments, 0);
                    return this.options.context.find(":checked").map(function() {
                        args[0] = data[N(this).closest("li").data("index")];
                        return NC.json.mapFromKeys.apply(NC.json, args);
                    }).get();
                } else {
                    return this.options.context.find(":checked").map(function() {
                        return data[N(this).closest("li").data("index")];
                    }).get();
                }
            } else if(selFlag === "checkedInLastNode") {
                const data = this.options.data;

                if(arguments.length > 1) {
                    const args = Array.prototype.slice.call(arguments, 0);
                    return this.options.context.find(".tree_last_node__ :checked").map(function() {
                        args[0] = data[N(this).closest("li").data("index")];
                        return NC.json.mapFromKeys.apply(NC.json, args);
                    }).get();
                } else {
                    return this.options.context.find(".tree_last_node__ :checked").map(function() {
                        return data[N(this).closest("li").data("index")];
                    }).get();
                }
            }
        };

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        bind(data) {
            const opts = this.options;
            const self = this;

            //to rebind new data
            if(data != null) {
                opts.data = NC.type(data) === "array" ? N(data) : data;
            }

            const rootNode = N('<ul class="tree_level1_folder__"></ul>').appendTo(opts.context.empty());
            let isAleadyRoot = false;
            N(opts.data).each(function(i, rowData) {
                if(rowData[opts.level] === 1 || !isAleadyRoot) {
                    rootNode.append('<li data-index="' + i + '" class="tree_' + rowData[opts.val] + '__ tree_level1_node__ tree_close__"><span class="tree_icon__"></span>' + (opts.checkbox ? '<span class="tree_check__"><input type="checkbox" /></span>' : '') + '<a class="tree_key__" href="#"><span>' + rowData[opts.key] + '</span></a><ul id="' + rowData[opts.val] + '" class="tree_level' + (opts.level !== null ? String(Number(rowData[opts.level]) + 1) : '') + '_folder__"></ul></li>');
                    isAleadyRoot = true;
                } else {
                    rootNode.find("#" + rowData[opts.parent]).append('<li data-index="' + i + '" class="tree_' + rowData[opts.val] + '__ tree_level' + NC.string.trimToEmpty(rowData[opts.level]) + '_node__ tree_close__"><span class="tree_icon__"></span>' + (opts.checkbox ? '<span class="tree_check__"><input type="checkbox" /></span>' : '') + '<a class="tree_key__" href="#"><span>' + rowData[opts.key] + '</span></a><ul id="' + rowData[opts.val] + '" class="tree_level' + (opts.level !== null ? String(Number(rowData[opts.level]) + 1) : '') + '_folder__"></ul></li>');
                }
            });

            // add class to elements with no have chiidren
            const emptyUls = rootNode.find("ul:empty");
            emptyUls.parent().addClass("tree_last_node__");
            emptyUls.remove();

            // checkbox click event bind
            if(opts.checkbox) {
                rootNode.on("click.tree", ".tree_check__ > :checkbox", function(e) {
                    let checkFlag;
                    const siblingNodesEle = N(this).closest("li").parent().children("li");
                    const parentNodesEle = N(this).parents("li");
                    const parentNodeEle = N(this).closest("ul").parent();
                    N(this).removeClass("tree_auto_parents_select__");
                    if(N(this).is(":checked")) {
                        N(this).parent().siblings("ul").find(":not(:checked)").prop("checked", true);
                        checkFlag = true;
                    } else {
                        N(this).parent().siblings("ul").find(":checked").prop("checked", false);
                        checkFlag = false;
                    }

                    const checkboxLength = siblingNodesEle.find(":checkbox").length;
                    const checkedLength = siblingNodesEle.find(":checked").length;
                    const parentNodeCheckboxEle = parentNodeEle.find("> span.tree_check__ > :checkbox");
                    const parentNodesCheckedEle = parentNodesEle.not(":first").find("> span.tree_check__ > :checkbox");
                    if(checkFlag) {
                        if(checkedLength > 0) {
                            if(checkedLength < checkboxLength) {
                                parentNodesEle.find("> span.tree_check__ > :not(:checked)").prop("checked", true).addClass("tree_auto_parents_select__");
                            } else if(checkedLength === checkboxLength) {
                                parentNodeCheckboxEle.prop("checked", true).removeClass("tree_auto_parents_select__");
                                // apply click effect to parents nodes
                                // FIXME this code is temporary code
                                parentNodeCheckboxEle.trigger("click.tree").trigger("click.tree");
                            }
                        }
                    } else {
                        if(checkedLength > 0 && checkedLength < checkboxLength) {
                            parentNodesCheckedEle.addClass("tree_auto_parents_select__");
                        } else if(checkedLength === 0) {
                            parentNodesCheckedEle.prop("checked", false).removeClass("tree_auto_parents_select__");
                            // apply click effect to parents nodes
                            // FIXME this code is temporary code
                            parentNodeCheckboxEle.trigger("click.tree").trigger("click.tree");
                        }
                    }

                    // run onCheck event callback
                    // FIXME "e.clientX > 0 && e.clientY > 0" is temporary code
                    if(opts.onCheck !== null && e.clientX > 0 && e.clientY > 0) {
                        const closestLi = N(this).closest("li");
                        const checkedEle = N(this).closest("ul").find(".tree_last_node__ :checked");
                        opts.onCheck.call(self
                            , closestLi.data("index")
                            , closestLi
                            , opts.data[closestLi.data("index")]
                            , checkedEle.map(function() {
                                return N(this).closest("li").data("index");
                            }).get()
                            , checkedEle
                            , checkedEle.map(function() {
                                return opts.data[N(this).closest("li").data("index")];
                            }).get()
                            , checkFlag);
                    }
                });
            }

            // node name click event bind
            rootNode.on("click.tree", "li" + (!opts.folderSelectable ? ".tree_last_node__" : "") + " .tree_key__", function(e) {
                e.preventDefault();
                const parentLi = N(this).parent("li");
                if(opts.onSelect !== null) {
                    opts.onSelect.call(self, parentLi.data("index"), parentLi, opts.data[parentLi.data("index")]);
                }
                rootNode.find("li > a.tree_key__.tree_active__").removeClass("tree_active__");
                N(this).addClass("tree_active__");
            });

            // icon click event bind
            rootNode.on("click.tree", ".tree_icon__" + (!opts.folderSelectable ? ", li:not('.tree_last_node__') .tree_key__" : ""), function(e) {
                e.preventDefault();
                const parentLi = N(this).parent("li");
                if(parentLi.find("> ul > li").length > 0) {
                    if(parentLi.hasClass("tree_open__")) {
                        parentLi.removeClass("tree_open__").addClass("tree_close__");
                    } else {
                        parentLi.removeClass("tree_close__").addClass("tree_open__");
                    }
                }
            });

            if(opts.folderSelectable) {
                rootNode.on("click.tree", "li:not('.tree_last_node__') .tree_key__", function(e) {
                    e.preventDefault();
                });
            }

            this.collapse(true);

            return this;
        };

        // val(row, key, val) {
        //     // TODO
        //     // notify
        //     return this;
        // };

        select(val) {
            const opts = this.options;
            if(val !== undefined) {
                opts.context.find(".tree_" + val + "__ > .tree_key__").trigger("click.tree");
                return this;
            } else {
                const activeNodeEle = opts.context.find(".tree_key__.tree_active__");
                if(opts.data.length > 0 && activeNodeEle.length > 0) {
                    return opts.data[activeNodeEle.parent("li").data("index")][opts.val];
                }
            }
        };

        // check(vals) {
        //     // TODO
        //     return this;
        // };

        expand() {
            this.options.context.find("li.tree_close__:not(.tree_last_node__)").removeClass("tree_close__").addClass("tree_open__");
            return this;
        };

        collapse(isFirstNodeOpen) {
            this.options.context.find("li.tree_open__:not(.tree_last_node__)").removeClass("tree_open__").addClass("tree_close__");
            if(isFirstNodeOpen) {
                this.options.context.find("li.tree_close__:first").removeClass("tree_close__").addClass("tree_open__");
            }
            return this;
        };

        // update(row, key) {
        //     // TODO
        //     return this;
        // }

    }

}
