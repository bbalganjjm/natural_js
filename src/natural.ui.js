/*!
 * Natural-UI v0.47.250
 *
 * Released under the LGPL v2.1 license
 * Date: 2014-09-26T11:11Z
 *
 * Copyright 2023 KIM HWANG MAN(bbalganjjm@gmail.com)
 */
(function(window, $) {
    N.version["Natural-UI"] = "0.47.250";

    $.fn.extend($.extend(N.prototype, {
        alert : function(msg, vars) {
            return new N.alert(this, msg, vars);
        },
        button : function(opts) {
            if(this.is("input[type='button'], button, a")) {
                return this.each(function() {
                    return new N.button(N(this), opts);
                });
            }
        },
        select : function(opts) {
            return new N.select(this, opts);
        },
        form : function(opts) {
            return new N.form(this, opts);
        },
        list : function(opts) {
            return new N.list(this, opts);
        },
        grid : function(opts) {
            return new N.grid(this, opts);
        },
        popup : function(opts) {
            return new N.popup(this, opts);
        },
        tab : function(opts) {
            return new N.tab(this, opts);
        },
        datepicker : function(opts) {
            return new N.datepicker(this, opts);
        },
        tree : function(opts) {
            return new N.tree(this, opts);
        },
        pagination : function(opts) {
            return new N.pagination(this, opts);
        }
    }));

    (function(N) {

        var UI = N.ui = {
            iteration : {
                render : function(i, limit, delay, lastIdx, callType) {
                    var opts = this.options;
                    var self = this;

                    // clone li for create new row
                    var tempRowEleClone = self.tempRowEle.clone(true, true);
                    opts.context.append(tempRowEleClone);

                    // for row data bind, use N.form
                    var form = N(opts.data[i]).form({
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
                            Grid.rowSpan.call(self, i, tempRowEleClone, opts.context.find("tbody:eq(" + (i-1) + ")"), opts.data[i], opts.data[i-1], String(this));
                        });
                    }

                    i++;
                    if(opts.height === 0 || opts.scrollPaging.size === 0 || (callType === "append" && data.length > 0 && data.length <= opts.scrollPaging.size)) {
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
                                    UI.iteration.render.call(self, i, limit, delay, lastIdx, callType);
                                }, delay);
                            } else {
                                UI.iteration.render.call(self, i, limit, delay, lastIdx, callType);
                            }
                        }
                    } else if(i === lastIdx + 1) {
                        if(opts.onBind !== null && !N.string.endsWith(N.string.trimToEmpty(callType), ".update")) {
                            opts.onBind.call(self, opts.context, opts.data, i === opts.scrollPaging.size || opts.data.length <= opts.scrollPaging.size, i === opts.data.length);
                        }
                        opts.scrollPaging.limit = opts.scrollPaging.size === 0 ? opts.data.length : opts.scrollPaging.size;

                        opts.isBinding = false;
                        opts.context.dequeue("bind");
                    }

                    tempRowEleClone = undefined;
                },
                select : function(compNm) {
                    var opts = this.options;
                    var self = this;

                    var lineTag = compNm === "grid" ? "tbody" : "li";

                    // set style class name to context element for select, multiselect options
                    opts.context.addClass(compNm + "_select__");

                    // bind tbody click event for select, multiselect options
                    opts.context.on("click." + compNm, ">" + lineTag, function(e) {
                        var thisEle = $(this);
                        var retFlag;
                        var isSelected;

                        if(!$(e.target).is(opts.checkAllTarget) && !$(e.target).is(opts.checkSingleTarget)) {
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
                    var opts = this.options;
                    var contextEle = this.contextEle;

                    var checkAll = compNm === "grid" ? this.thead.find(opts.checkAll) : $(opts.checkAll);
                    var cellTag = compNm === "grid" ? "tbody > tr > td" : "li";
                    checkAll.on("click." + compNm + ".checkAll", function() {
                        if(!$(this).prop("checked")) {
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
                    var opts = this.options;
                    var contextEle = this.contextEle;

                    var cellTag = compNm === "grid" ? "tbody > tr > td" : "li";
                    contextEle.on("click.grid.checkSingleTarget", cellTag + " " + opts.checkSingleTarget, function() {
                        contextEle.find(cellTag + " " + opts.checkSingleTarget).not(this).removeAttr("checked");
                    });
                },
                move : function(fromRow, toRow, compNm) {
                    if(fromRow !== toRow) {
                        var opts = this.options;

                        var insertPos;
                        if(toRow > opts.data.length - 1) {
                            insertPos = "after";
                            toRow = opts.data.length - 1;
                            opts.data.push(opts.data.splice(fromRow, 1)[0]);
                        } else {
                            insertPos = "before";
                            opts.data.splice(fromRow < toRow ? toRow - 1 : toRow, 0, opts.data.splice(fromRow, 1)[0]);
                        }

                        var rowTag = compNm === "grid" ? "tbody" : "li";
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
                        var opts = this.options;

                        var insertPos;
                        if(toRow > opts.data.length - 1) {
                            insertPos = "after";
                            toRow = opts.data.length - 1;
                            opts.data.push(opts.data[fromRow]);
                        } else {
                            insertPos = "before";
                            opts.data.splice(toRow, 0, opts.data[fromRow]);
                        }

                        var rowTag = compNm === "grid" ? "tbody" : "li";
                        opts.context.find(rowTag + ":eq(" + toRow + ")")[insertPos](opts.context.find(rowTag + ":eq(" + fromRow + ")").clone(true, true));
                    }

                    return this;
                }
            },
            draggable : {
                events : function(eventNameSpace, startHandler, moveHandler, endHandler) {
                    var selfEle = this;

                    this.on("mousedown" + eventNameSpace + " touchstart" + eventNameSpace, function(e) {
                        var se = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
                        if(e.originalEvent.touches || (e.which || e.button) === 1) {
                            var isContinue;
                            if(startHandler !== undefined) {
                                isContinue = startHandler.call(this, e, selfEle, se.pageX, se.pageY)
                            }

                            if(isContinue !== false) {
                                $(document).on("mousemove" + eventNameSpace + " touchmove" + eventNameSpace, function(e) {
                                    $(document).on("dragstart" + eventNameSpace + " selectstart" + eventNameSpace, function() {
                                        return false;
                                    });

                                    var me = e.originalEvent.touches ? e.originalEvent.touches[0] : e;

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

                                $(document).on("mouseup" + eventNameSpace + " touchend" + eventNameSpace, function(e) {
                                    $(document).off("dragstart" + eventNameSpace + " selectstart" + eventNameSpace + " mousemove" + eventNameSpace + " touchmove" + eventNameSpace + " mouseup" + eventNameSpace + " touchend" + eventNameSpace);

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
                    var ele = this;
                    if(min !== undefined && x < min) {
                        x = min;
                        return false;
                    }
                    if(max !== undefined && x > max) {
                        x = max;
                        return false;
                    }

                    var propNm = ["-webkit-transform", "-ms-transform", "transform"];
                    $(propNm).each(function() {
                        ele.css(this, "translateX(" + x + "px)");
                    });
                },
                /**
                 * This function is not working in less than IE 9
                 */
                moveY : function(y, min, max) {
                    var ele = this;
                    if(min !== undefined && y < min) {
                        y = min;
                        return false;
                    }
                    if(max !== undefined && y > max) {
                        y = max;
                        return false;
                    }

                    var propNm = ["-webkit-transform", "-ms-transform", "transform"];
                    $(propNm).each(function() {
                        ele.css(this, "translateY(" + y + "px)");
                    });
                }
            },
            scroll : {
                paging : function(contextWrapEle, defSPSize, rowEleLength, rowTagName, bindOpt) {
                    var opts = this.options;
                    var self = this;

                    contextWrapEle.on("scroll", function() {
                        if(opts.scrollPaging.size > 0 && opts.isBinding === false) {
                            var thisWrap = $(this);
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
            },
            utils : {
                /**
                 * Wraps component event options and global event options in N.config.
                 */
                wrapHandler : function(opts, compNm, eventNm) {
                    if(N.context.attr("ui")[compNm] && N.context.attr("ui")[compNm][eventNm] && (opts && opts[eventNm])) {
                        var localEventHandler = opts[eventNm];
                        opts[eventNm] = function() {
                            if(eventNm === "onBeforeBindValue") {
                                var rVal = localEventHandler.apply(this, arguments);
                                return N.context.attr("ui")[compNm][eventNm].call(this, arguments[0], rVal);
                            } else {
                                var rVal = localEventHandler.apply(this, arguments);
                                if(rVal === false) {
                                    return rVal;
                                } else {
                                    return N.context.attr("ui")[compNm][eventNm].apply(this, arguments);
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
            }
        };

        // Alert
        var Alert = N.alert = function(obj, msg, vars) {
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
                // 1. When N.context.attr("ui").alert.container value is undefined
                this.options.container = N.context.attr("architecture").page.context;
                // 2. If defined the N.context.attr("ui").alert.container value to N.config this.options.container value is defined from N.config's value
                $.extend(true, this.options, N.context.attr("ui").alert);

                if(N.isString(this.options.container)) {
                    this.options.container = N(this.options.container);
                }
            } catch (e) {
                throw N.error("N.alert", e);
            }

            if(N(this.options.container).length === 0) {
                throw N.error("[N.alert]Container element is missing. please specify the correct element selector that will contain the message dialog's element. it can be defined in the \"N.context.attr(\"ui\").alert.container\" property of \"natural.config.js\" file.");
            }

            if (N(obj).is(":input")) {
                this.options.isInput = true;
            }
            if(msg !== undefined && N.isPlainObject(msg)) {
                // Wraps the global event options in N.config and event options for this component.
                UI.utils.wrapHandler(msg, "alert", "onOk");
                UI.utils.wrapHandler(msg, "alert", "onCancel");
                UI.utils.wrapHandler(msg, "alert", "onBeforeShow");
                UI.utils.wrapHandler(msg, "alert", "onShow");
                UI.utils.wrapHandler(msg, "alert", "onBeforeHide");
                UI.utils.wrapHandler(msg, "alert", "onHide");
                UI.utils.wrapHandler(msg, "alert", "onBeforeRemove");
                UI.utils.wrapHandler(msg, "alert", "onRemove");

                $.extend(true, this.options, msg);
                if(N.isString(this.options.container)) {
                    this.options.container = N(this.options.container);
                }
                // when the title option value is undefined
                // $.extend method does not extend undefined value
                if(msg.hasOwnProperty("title")) {
                    this.options.title = msg.title;
                }
            }

            if(this.options.isWindow) {
                this.options.context = N("body");
            }

            if (!this.options.isInput) {
                Alert.wrapEle.call(this);

                // set this instance to msgContext element
                this.options.msgContents.instance("alert", this);

                if(this.options.saveMemory) {
                    this.options.msg = null;
                    this.options.vars = null;
                }
            } else {
                Alert.wrapInputEle.call(this);

                // set this instance to context element
                this.options.context.instance("alert", this);
            }

            return this;
        };

        $.extend(Alert, {
            wrapEle : function() {
                var opts = this.options;

                // set message overlay's default style
                var blockOverlayCss = {
                    "display" : "none",
                    "position" : opts.isWindow ? "fixed" : "absolute",
                    "cursor" : "not-allowed",
                    "padding" : 0
                };

                if(!opts.isWindow) {
                    blockOverlayCss["border-radius"] = opts.context.css("border-radius") !== "0px" ? opts.context.css("border-radius") : "0px";
                }

                var maxZindex = 0;
                if(opts.alwaysOnTop) {
                    // get maximum "z-index" value
                    maxZindex = N.element.maxZindex(N(opts.alwaysOnTopCalcTarget));
                    blockOverlayCss["z-index"] = String(maxZindex + 1);
                }

                if (opts.overlayColor !== null) {
                    blockOverlayCss["background-color"] = opts.overlayColor;
                }

                // create message overlay
                opts.msgContext = opts[opts.isWindow ? "container" : "context"][opts.isWindow ? "append" : "after"]($('<div class="block_overlay__" onselectstart="return false;"></div>')
                        .css(blockOverlayCss))[opts.isWindow ? "find" : "siblings"](".block_overlay__:" + (opts.isWindow ? "last" : "first"));

                // set style class name to msgContext element
                opts.msgContext.addClass("alert_overlay__");

                if (opts.vars !== undefined) {
                    opts.msg = N.message.replaceMsgVars(opts.msg, opts.vars);
                }

                // set message box's default style
                var blockOverlayMsgCss = {
                    "display" : "none",
                    "position" : opts.isWindow ? "fixed" : "absolute"
                };

                if(opts.alwaysOnTop) {
                    blockOverlayMsgCss["z-index"] = String(maxZindex + 2);
                }

                // create title bar element
                var titleBox = '';
                if(opts.title !== undefined) {
                    titleBox = '<div class="msg_title_box__"><span class="msg_title__">' + opts.title + '</span><a href="#" class="msg_title_close_btn__"><span class="msg_title_close__" title="' + N.message.get(opts.message, "close") + '"></span></a></div>';
                }

                // create button box elements
                var buttonBox = '';
                if(opts.button) {
                    buttonBox = '<div class="buttonBox__">' +
                        '<button class="confirm__">' + N.message.get(opts.message, "confirm") + '</button>' +
                        '<button class="cancel__">' + N.message.get(opts.message, "cancel") + '</button>' +
                        '</div>';
                }

                // create message box elements
                opts.msgContents = opts.msgContext.after(
                        $('<div class="block_overlay_msg__">' +
                                titleBox +
                                '<div class="msg_box__"></div>' +
                                buttonBox +
                                '</div>').css(blockOverlayMsgCss)).next(".block_overlay_msg__:last");

                // set style class name to msgContents element
                opts.msgContents.addClass("alert__ hidden__");

                // bind event to close(X) button
                var self = this;
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
                if(N.type(opts.width) === "function" || opts.width > 0) {
                    if(N.type(opts.width) === "function") {
                        opts.msgContents.find(".msg_box__").width(opts.width.call(self, opts.msgContext, opts.msgContents));
                    } else {
                        opts.msgContents.find(".msg_box__").width(opts.width);
                    }
                }

                // set height
                if(N.type(opts.height) === "function" || opts.height > 0) {
                    if(N.type(opts.width) === "function") {
                        opts.msgContents.find(".msg_box__").height(opts.height.call(self, opts.msgContext, opts.msgContents)).css("overflow-y", "auto");
                    } else {
                        opts.msgContents.find(".msg_box__").height(opts.height).css("overflow-y", "auto");
                    }
                }

                if(opts.modal && opts.windowScrollLock) {
                    N.event.windowScrollLock(opts.msgContext);
                }

                //set confirm button style and bind click event
                opts.msgContents.find(".buttonBox__ .confirm__").button(opts.global.okBtnStyle);
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
                    opts.msgContents.find(".buttonBox__ .cancel__").button(opts.global.cancelBtnStyle);
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
                    var pressed;
                    var moved;
                    var startX;
                    var startY;
                    var defMargin;
                    opts.msgContents.addClass("draggable__").find(".msg_title_box__").on("mousedown.alert touchstart.alert", function(e) {
                        var dte;
                        if(e.originalEvent.touches) {
                            e.preventDefault();
                            e.stopPropagation();
                            dte = e.originalEvent.touches[0];
                        }

                        defMargin = opts.msgContents.css("margin");

                        if(!$(dte !== undefined ? dte.target : e.target).is(".msg_title_close__") && (e.originalEvent.touches || (e.which || e.button) === 1)) {
                            pressed = true;
                            opts.msgContents.data("isMoved", true);

                            startX = (dte !== undefined ? dte.pageX : e.pageX)- opts.msgContents.offset().left;
                            startY = (dte !== undefined ? dte.pageY : e.pageY) - opts.msgContents.offset().top;

                            $(window.document).on("dragstart.alert selectstart.alert", function(e) {
                                return false;
                            });

                            moved = true;
                            $(window.document).on("mousemove.alert touchmove.alert", function(e) {
                                var mte;
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

                            var documentWidth = $(window.document).width();
                            $(window.document).on("mouseup.alert touchend.alert", function(e) {
                                pressed = false;
                                if(opts.draggableOverflowCorrection) {
                                    var offset = {};
                                    var windowHeight = window.innerHeight ? window.innerHeight : $(window).height();
                                    var windowScrollTop = $(window).scrollTop();
                                    var msgContentsOffsetTop = opts.msgContents.offset().top;
                                    var msgContentsOuterHeight = opts.msgContents.outerHeight();

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
                                        offset.top = 0 + opts.draggableOverflowCorrectionAddValues.top;
                                        if(opts.msgContents.css("position") === "fixed") {
                                            offset.top -= parseFloat(opts.msgContents.css("margin-top"));
                                        }
                                    }
                                    if(opts.msgContents.offset().left < 0) {
                                        offset.left = 0 + opts.draggableOverflowCorrectionAddValues.left;
                                    } else if(opts.msgContents.offset().left + opts.msgContents.outerWidth() > documentWidth) {
                                        offset.left = documentWidth - opts.msgContents.outerWidth() + opts.draggableOverflowCorrectionAddValues.right;
                                    }
                                    if(!N.isEmptyObject(offset)) {
                                        opts.msgContents.animate(offset, 200);
                                    }
                                }

                                opts.msgContents.fadeTo(100, "1.0");
                                $(window.document).off("dragstart.alert selectstart.alert mousemove.alert touchmove.alert mouseup.alert touchend.alert");
                            });
                        }
                    });
                }
            },
            resetOffSetEle : function(opts) {
                var position = opts.context.position();
                if(opts.context.is(":visible")) {
                    var windowHeight = $(window).height();
                    var windowWidth = $(window).width();
                    var msgContentsHeight = opts.msgContents.height();
                    var msgContentsWidth = opts.msgContents.width();

                    // reset message context(overlay) position
                    var msgContextCss = {
                        "height" : opts.isWindow ? (window.innerHeight ? window.innerHeight : windowHeight) : opts.context.outerHeight() + "px",
                        "width" : opts.isWindow ? windowWidth : opts.context.outerWidth() + "px"
                    }
                    var marginLeft = 0;
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
                        var msgContentsCss = {};
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
                            msgContentsCss["margin-top"] = String($(window).scrollTop()) + "px";
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
            },
            wrapInputEle : function() {
                var opts = this.options;

                var isRemoved = false;
                if(opts.context.instance("alert") !== undefined) {
                    opts.context.instance("alert").remove();
                    isRemoved = true;
                }

                if (opts.msg.length > 0) {
                    opts.msgContext = opts.context;
                    // for Material Design
                    if(opts.msgContext.data("md_textfield_inst")) {
                        opts.msgContext = opts.msgContext.closest(".mdc-text-field");
                    }

                    opts.msgContents = opts.msgContext.next(".msg__");
                    var isBeforeShow = false;
                    if (opts.msgContents.length === 0 || isRemoved) {
                        var limitWidth = opts.msgContext.offset().left + opts.msgContext.outerWidth() + 150;

                        if(limitWidth > (window.innerWidth ? window.innerWidth : $(window).width())) {
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

                        opts.msgContents.append('<a href="#" class="msg_close__" title="' + N.message.get(opts.message, "close") + '"></a>');
                    }
                    if(opts.alwaysOnTop) {
                        opts.msgContents.css("z-index", N.element.maxZindex(opts.container.find(opts.alwaysOnTopCalcTarget)) + 1);
                    }

                    var self = this;
                    opts.msgContents.find(".msg_close__").on("click", function(e) {
                        e.preventDefault();
                        self.remove();
                    });

                    var ul_ = opts.msgContents.find(".msg_line_box__").empty();
                    if (N.isArray(opts.msg)) {
                        opts.msgContents.find(".msg_line_box__").empty();
                        $(opts.msg).each(function(i, msg_) {
                            if (opts.vars !== undefined) {
                                opts.msg[i] = N.message.replaceMsgVars(msg_, opts.vars);
                            }
                            ul_.append('<li>' + opts.msg[i] + '</li>');
                        });
                    } else {
                        if (opts.vars !== undefined) {
                            opts.msg = N.message.replaceMsgVars(msg, opts.vars);
                        }
                        ul_.append('<li>' + opts.msg + '</li>');
                    }
                    if(isBeforeShow) {
                        opts.msgContents.css("margin-left", "-" + String(opts.msgContents.outerWidth()) + "px");
                    }
                } else {
                    this.remove();
                }
            }
        });

        $.extend(Alert.prototype, {
            "context" : function(sel) {
                return sel !== undefined ? this.options.context.find(sel) : this.options.context;
            },
            "show" : function() {
                var opts = this.options;
                var self = this;

                if (opts.onBeforeShow !== null) {
                    opts.onBeforeShow.call(self, opts.msgContext, opts.msgContents);
                }

                // for N.docs transition effect
                N(".docs__>.docs_tab_context__").css("z-index", "0");

                if (!opts.isInput) {
                    if(opts.dynPos && !opts.isWindow) {
                        Alert.resetOffSetEle(opts);
                        opts.time = setInterval(function() {
                            if(opts.context.is(":visible")) {
                                Alert.resetOffSetEle(opts);
                            }
                        }, 500);
                    } else {
                        opts.resizeHandler =  function() {
                            Alert.resetOffSetEle(opts);
                        };
                        $(window).off("resize.alert", opts.resizeHandler).on("resize.alert", opts.resizeHandler).trigger("resize.alert");
                    }

                    if(!opts.isWindow) {
                        opts.msgContext.closest(".msg_box__").css("position", "relative");
                    }

                    if(opts.button === true) {
                        opts.msgContents.find(".buttonBox__ .confirm__").get(0).focus();
                    }

                    opts.msgContents.removeClass("hidden__").addClass("visible__");

                    opts.msgContents.one(N.event.whichTransitionEvent(opts.msgContents), function(e){
                        if (opts.onShow !== null) {
                            opts.onShow.call(self, opts.msgContext, opts.msgContents);
                        }
                    }).trigger("nothing");
                } else {
                    if (!N.isEmptyObject(opts.msg)) {
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
                        if ((e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode)) == 27) {
                            if (opts.onCancel !== null) {
                                if(opts.onCancel.call(self, opts.msgContext, opts.msgContents) !== 0) {
                                    self[opts.closeMode]();
                                }
                            } else {
                                self[opts.closeMode]();
                            }
                        }
                    };
                    $(document).off("keyup.alert", opts.keyupHandler).on("keyup.alert", opts.keyupHandler);
                }

                return this;
            },
            "hide" : function() {
                var opts = this.options;

                if (opts.onBeforeHide !== null) {
                    opts.onBeforeHide.call(this, opts.msgContext, opts.msgContents);
                }

                // for N.docs transition effect
                N(".docs__>.docs_tab_context__").css("z-index", "");

                if (!opts.isInput) {
                    if(!opts.isWindow) {
                        opts.msgContext.closest(".msg_box__").css("position", "");
                    }
                    opts.msgContext.hide();

                    opts.msgContents.removeClass("visible__").addClass("hidden__");
                    opts.msgContents.one(N.event.whichTransitionEvent(opts.msgContents), function(e){
                        opts.msgContents.hide();

                        if (opts.onHide !== null) {
                            opts.onHide.call(this, opts.msgContext, opts.msgContents);
                        }
                    }).trigger("nothing");

                } else {
                    opts.msgContents.removeClass("visible__").addClass("hidden__");
                    opts.msgContents.one(N.event.whichTransitionEvent(opts.msgContents), function(e){
                        clearTimeout(opts.iTime);
                        opts.msgContents.remove();

                        if (opts.onHide !== null) {
                            opts.onHide.call(this, opts.msgContext, opts.msgContents);
                        }
                    }).trigger("nothing");
                }

                $(window).off("resize.alert", opts.resizeHandler);
                if(opts.escClose) {
                    $(document).off("keyup.alert", opts.keyupHandler);
                }

                return this;
            },
            "remove" : function() {
                var opts = this.options;

                if (opts.onBeforeRemove !== null) {
                    opts.onBeforeRemove.call(this, opts.msgContext, opts.msgContents);
                }

                // for N.docs transition effect
                N(".docs__>.docs_tab_context__").css("z-index", "");

                if (!opts.isInput) {
                    clearInterval(opts.time);
                    if(!opts.isWindow) {
                        opts.msgContext.closest(".msg_box__").css("position", "");
                    }
                    opts.msgContext.remove();

                    opts.msgContents.removeClass("visible__").addClass("hidden__");
                    opts.msgContents.one(N.event.whichTransitionEvent(opts.msgContents), function(e){
                        opts.msgContents.remove();

                        if(opts.msgContents.hasClass("popup__")) {
                            // Removes garbage instances from obserables of N.ds
                            N.gc.ds();
                        }

                        if (opts.onRemove !== null) {
                            opts.onRemove.call(this, opts.msgContext, opts.msgContents);
                        }
                    }).trigger("nothing");
                } else {
                    opts.msgContents.removeClass("visible__").addClass("hidden__");
                    opts.msgContents.one(N.event.whichTransitionEvent(opts.msgContents), function(e){
                        clearTimeout(opts.iTime);
                        opts.msgContents.remove();

                        if (opts.onRemove !== null) {
                            opts.onRemove.call(this, opts.msgContext, opts.msgContents);
                        }
                    }).trigger("nothing");
                }

                $(window).off("resize.alert", opts.resizeHandler);
                if(opts.escClose) {
                    $(document).off("keyup.alert", opts.keyupHandler);
                }
                return this;
            }
        });

        // Button
        var Button = N.button = function(obj, opts) {
            this.options = {
                context : obj,
                size : "medium", // size : smaller, small, medium, large, big
                color : "primary_container", // color : primary, primary_container, secondary, secondary_container, tertiary, tertiary_container
                fill : "filled", // type : filled, outlined
                iconClass : null,
                disable : false,
                customStyle : false
            };

            try {
                $.extend(this.options, N.context.attr("ui").button);
            } catch (e) {
                throw N.error("N.button", e);
            }
            $.extend(this.options, N.element.toOpts(this.options.context));
            if(opts !== undefined) {
                $.extend(this.options, opts);
            }

            // set style class name to context element
            this.options.context.addClass("button__");

            Button.wrapEle.call(this);

            // set this instance to context element
            this.options.context.instance("button", this);

            return this;
        };

        $.extend(Button, {
            context : function(sel) {
                return sel !== undefined ? this.options.context.find(sel) : this.options.context;
            },
            wrapEle : function() {
                var opts = this.options;

                if(opts.iconClass !== null) {
                    opts.context.prepend('<span class="' + opts.iconClass + '"></span>');
                }

                if(opts.disable) {
                    this.disable();
                } else {
                    this.enable();
                }

                if(opts.context.is("a")) {
                    opts.context.attr("onselectstart", "return false;");
                }
                if (opts.context.is("a") || opts.context.is("button") || opts.context.is("input[type='button']")) {
                    opts.context.removeClass("btn_common__ " +
                        "btn_primary__ btn_primary_container__ " +
                        "btn_secondary__ btn_secondary_container__ " +
                        "btn_tertiary__ btn_tertiary_container__ " +
                        "btn_filled__ btn_outlined__ " +
                        "btn_smaller__ btn_small__ btn_medium__ btn_large__ btn_big__");
                    opts.context.addClass("btn_common__ btn_" + opts.color + "__ btn_" + opts.size + "__ btn_" + opts.fill + "__");
                }
            }
        });

        $.extend(Button.prototype, {
            context : function(sel) {
                return sel !== undefined ? this.options.context.find(sel) : this.options.context;
            },
            disable : function() {
                var context = this.options.context;
                if (context.is("a")) {
                    context.off("click.button");
                    context.tpBind("click.button", N.event.disable);
                } else {
                    context.prop("disabled", true);
                }
                context.addClass("btn_disabled__");
                return this;
            },
            enable : function() {
                var context = this.options.context;
                if (context.is("a")) {
                    context.off("click", N.event.disable);
                } else {
                    context.prop("disabled", false);
                }
                context.removeClass("btn_disabled__");
                return this;
            }
        });

        // Datepicker
        var Datepicker = N.datepicker = function(obj, opts) {
            this.options = {
                context : obj,
                contents : $('<div class="datepicker__"></div>'),
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
                $.extend(this.options, N.context.attr("ui").datepicker);
                if(opts && opts.monthonly === true && N.context.attr("ui").datepicker.monthonlyOpts) {
                    $.extend(this.options, N.context.attr("ui").datepicker.monthonlyOpts);
                }
            } catch (e) {
                throw N.error("N.datepicker", e);
            }

            if(opts !== undefined) {
                // Wraps the global event options in N.config and event options for this component.
                UI.utils.wrapHandler(opts, "datepicker", "onChangeYear");
                UI.utils.wrapHandler(opts, "datepicker", "onChangeMonth");
                UI.utils.wrapHandler(opts, "datepicker", "onSelect");
                UI.utils.wrapHandler(opts, "datepicker", "onBeforeShow");
                UI.utils.wrapHandler(opts, "datepicker", "onShow");
                UI.utils.wrapHandler(opts, "datepicker", "onBeforeHide");
                UI.utils.wrapHandler(opts, "datepicker", "onHide");

                $.extend(this.options, opts);
            }

            if(this.options.yearsPanelPosition === "top" && this.options.monthsPanelPosition === "top" && this.options.monthonly === true) {
                N.warn('[N.datepicker]This option combination({ yearsPanelPosition : "top", monthsPanelPosition : "top", monthonly : true }) is not suppored.');
                this.options.yearsPanelPosition = "left";
                this.options.monthsPanelPosition = "left";
            }

            // set style class name to context element
            this.options.context.addClass("datepicker__");

            // bind events
            Datepicker.wrapEle.call(this);

            // set this instance to context element
            this.options.context.instance("datepicker", this);

            return this;
        };

        $.extend(Datepicker, {
            context : function() {
                return this.options.context;
            },
            checkMinMaxDate : function() {
                var opts = this.options;
                var value = opts.context.val();

                if(value.length === 4) {
                    if(opts.minDate != null && opts.minDate.length >= 4) {
                        if(Number(value) < Number(opts.minDate.substring(0, 4))) {
                            opts.context.val(opts.minDate.substring(0, 4)).trigger("keyup.datepicker", [true]);
                            opts.context.alert(N.message.get(opts.message, "minDate", [ opts.minDate ])).show();
                            return false;
                        }
                    }
                    if(opts.maxDate != null && opts.maxDate.length >= 4) {
                        if(Number(value) > Number(opts.maxDate.substring(0, 4))) {
                            opts.context.val(opts.maxDate.substring(0, 4)).trigger("keyup.datepicker", [true]);
                            opts.context.alert(N.message.get(opts.message, "maxDate", [ opts.maxDate ])).show();
                            return false;
                        }
                    }
                } else if(value.length === 6) {
                    if(opts.minDate != null && opts.minDate.length >= 6) {
                        if(Number(value) < Number(opts.minDate.substring(0, 6))) {
                            opts.context.val(opts.minDate.substring(0, 6)).trigger("keyup.datepicker", [true]);
                            opts.context.alert(N.message.get(opts.message, "minDate", [ opts.minDate ])).show();
                            return false;
                        }
                    }
                    if(opts.maxDate != null && opts.maxDate.length >= 6) {
                        if(Number(value) > Number(opts.maxDate.substring(0, 6))) {
                            opts.context.val(opts.maxDate.substring(0, 6)).trigger("keyup.datepicker", [true]);
                            opts.context.alert(N.message.get(opts.message, "maxDate", [ opts.maxDate ])).show();
                            return false;
                        }
                    }
                } else if(value.length === 8) {
                    if(opts.minDate != null && opts.minDate.length === 8) {
                        if(Number(value) < Number(opts.minDate)) {
                            opts.context.val(opts.minDate).trigger("keyup.datepicker", [true]);
                            opts.context.alert(N.message.get(opts.message, "minDate", [ opts.minDate ])).show();
                            return false;
                        }
                    }
                    if(opts.maxDate != null && opts.maxDate.length === 8) {
                        if(Number(value) > Number(opts.maxDate)) {
                            opts.context.val(opts.maxDate).trigger("keyup.datepicker", [true]);
                            opts.context.alert(N.message.get(opts.message, "maxDate", [ opts.maxDate ])).show();
                            return false;
                        }
                    }
                }

                return true;
            },
            wrapEle : function() {
                var opts = this.options;
                var self = this;

                // bind focusin event
                if(opts.focusin && !opts.context.prop("readonly") && !opts.context.prop("disabled")) {
                    opts.context.off("focusin.datepicker").on("focusin.datepicker", function() {
                        self.show();
                    });
                }

                // bind key events
                opts.context.off("keydown.datepicker").on("keydown.datepicker", function(e) {
                    var keyCode = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);
                    if(!N.event.isNumberRelatedKeys(e) || opts.context.val().length > 8) {
                        e.preventDefault();
                        return false;
                    } else if (keyCode == 13 || keyCode == 9) { // When press the ENTER key
                        opts.context.get(0).blur();
                        self.hide();
                    }
                }).off("keyup.datepicker").on("keyup.datepicker", function(e, isPassCheckMinMaxDate) {
                    // Hangul does not apply e.preventDefault() of keydown event
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");

                    var value = opts.context.val();
                    var keyCode = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);
                    var format = (!opts.monthonly ? N.context.attr("data").formatter.date.Ymd() : N.context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, "");

                    // when press the number keys
                    if ((value.length > 2 && value.length%2 === 0) && keyCode != 35 && keyCode != 36 && keyCode != 37 && keyCode != 39 && keyCode != 9 && keyCode != 27) {
                        var dateStrArr = N.date.strToDateStrArr(value, format);
                        var dateStrStrArr = N.date.strToDateStrArr(value, format, true);

                        // validate input value
                        if(dateStrStrArr[0].length === 4 && dateStrArr[0] < 100) {
                            opts.context.alert(N.message.get(opts.message, "yearNaN")).show();
                            opts.context.val(value.replace(dateStrStrArr[0], ""));
                            return false;
                        } else if(dateStrStrArr[1].length === 2 && (dateStrArr[1] < 1 || dateStrArr[1] > 12)) {
                            opts.context.alert(N.message.get(opts.message, "monthNaN")).show();
                            opts.context.val(value.replace(dateStrStrArr[1], ""));
                            return false;
                        } else if(!opts.monthonly && dateStrStrArr[2].length === 2 && (dateStrArr[2] < 1 || dateStrArr[2] > parseInt(opts.gEndDate))) {
                            opts.context.alert(N.message.get(opts.message, "dayNaN", [String(parseInt(opts.gEndDate))])).show();
                            opts.context.val(value.replace(dateStrStrArr[2], ""));
                            return false;
                        }

                        // minDate, maxDate
                        if(!isPassCheckMinMaxDate && !Datepicker.checkMinMaxDate.call(self)) {
                            return false;
                        }

                        var yearsPanel = opts.contents.find(".datepicker_years_panel__");
                        var monthsPanel = opts.contents.find(".datepicker_months_panel__");
                        var daysPanel = opts.contents.find(".datepicker_days_panel__");

                        if((format.length === 3 && format.indexOf("md") > -1) || format.length === 2) {
                            Datepicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
                        } else {
                            if(!opts.monthonly) {
                                if(value.length === 8) {
                                    Datepicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
                                }
                            } else {
                                if(value.length === 6) {
                                    Datepicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
                                }
                            }
                        }
                    }

                    if (keyCode == 27) { // When press the ESC key
                        e.preventDefault();
                        self.hide();
                    }
                }).off("focusout.datepicker").on("focusout.datepicker", function(e) {
                    // Hangul does not apply e.preventDefault() of keydown event
                    if(!opts.context.prop("readonly") && !opts.context.prop("disable")) {
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                    }
                });
            },
            createContents : function() {
                var opts = this.options;
                var self = this;

                var d = new Date();
                opts.currYear = parseInt(d.formatDate("Y"));
                var format = (!opts.monthonly ? N.context.attr("data").formatter.date.Ymd() : N.context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, "");

                opts.contents = $('<div class="datepicker_contents__"></div>').on("click.datepicker", function(e) {
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

                var yearsPanel = $('<div class="datepicker_years_panel__"></div>');
                var topMonthsPanel;
                var topMonthItem;
                var monthsPanel;

                if(opts.yearsPanelPosition === "left") {
                    var yearItem = $('<div></div>');
                    // create year items
                    var yearItemClone;
                    yearsPanel.append(yearItem.clone(true).addClass("datepicker_year_title__").text(N.message.get(opts.message, "year")));
                    // render year items
                    var i;
                    for(i=opts.currYear-2;i<=opts.currYear+2;i++) {
                        yearItemClone = yearItem.clone(true).addClass("datepicker_year_item__");
                        if(i === opts.currYear) {
                            yearItemClone.addClass("datepicker_curr_year__");
                            yearItemClone.addClass("datepicker_year_selected__");
                        }
                        yearsPanel.append(yearItemClone.text(N.string.lpad(String(i), 4, "0")));
                    }

                    // Binds click event to year items
                    yearsPanel.on("click.datepicker", ".datepicker_year_item__", function(e, isForceUpdate) {
                        e.preventDefault();
                        var selectedYearItemEle = yearsPanel.find(".datepicker_year_item__.datepicker_year_selected__").removeClass("datepicker_year_selected__");
                        $(this).addClass("datepicker_year_selected__");

                        var selYearStr = $(this).text();
                        if(selYearStr != selectedYearItemEle.text() || isForceUpdate) {
                            // immediately applys the changed year to the context element
                            if(opts.yearChangeInput) {
                                var dateVal = opts.context.val().replace(/[^\d]/g,"");

                                if(dateVal.length <= 4) {
                                    opts.context.val(N.string.lpad(selYearStr, 4, "0"));
                                } else {
                                    var selDate;
                                    var dateFormat;
                                    if(dateVal.length === 6) {
                                        dateFormat = N.context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");
                                    } else if(dateVal.length === 8) {
                                        dateFormat = N.context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");
                                    }

                                    if(dateFormat !== undefined) {
                                        selDate = N.date.strToDate(dateVal, dateFormat);

                                        var tempFormat = "";
                                        $(dateFormat.split("")).each(function(i, formatChar) {
                                            tempFormat += formatChar + "-";
                                        });
                                        dateVal = selDate.obj.formatDate(tempFormat).replace(selDate.obj.formatDate("Y"), selYearStr).replace(/\-/g, "");
                                        opts.context.val(dateVal);
                                    }
                                }

                                // minDate, maxDate
                                if(!Datepicker.checkMinMaxDate.call(self)) {
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

                    var yearPaging = $('<div class="datepicker_year_paging__"><a href="#" class="datepicker_year_prev__" title="' + N.message.get(opts.message, "prev") + '"><span>&lt;</span></a><a href="#" class="datepicker_year_next__" title="' + N.message.get(opts.message, "next") + '"><span>&gt;</span></a></div>');
                    yearPaging.find(".datepicker_year_prev__").on("click.datepicker", function(e) {
                        e.preventDefault();
                        Datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), opts.currYear, -5);
                        yearsPanel.find(".datepicker_year_selected__").trigger("click.datepicker", [true]);
                    });
                    yearPaging.find(".datepicker_year_next__").on("click.datepicker", function(e) {
                        e.preventDefault();
                        Datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), opts.currYear, 5);
                        yearsPanel.find(".datepicker_year_selected__").trigger("click.datepicker", [true]);
                    });
                    yearsPanel.append(yearPaging);
                } else if(opts.yearsPanelPosition === "top") {
                    var prevYearBtn = $('<div class="datepicker_year_paging__"><a href="#" class="datepicker_year_prev__" title="' + N.message.get(opts.message, "prev") + '"><span>&lt;</span></a></div>').appendTo(yearsPanel)
                        .find("> .datepicker_year_prev__").on("click.datepicker", function(e, isPrevYearBtn) {
                            e.preventDefault();
                            var selectedYear = parseInt(yearItem.val());
                            if(selectedYear > opts.currYear - opts.minYear) {
                                yearItem.val(N.string.lpad(String(selectedYear - 1), 4, "0")).trigger("change.datepicker", isPrevYearBtn ? [ isPrevYearBtn ] : undefined);
                            } else {
                                yearItem.empty();
                                selectedYear--;

                                var startYear = selectedYear - opts.minYear;
                                var endYear = selectedYear + opts.maxYear;
                                if(startYear < 100) {
                                    startYear = 100;
                                    endYear = startYear + opts.maxYear;
                                }
                                for(var i=startYear;i<=endYear;i++) {
                                    var selected = "";
                                    if(i === selectedYear) {
                                        opts.currYear = selectedYear;
                                        selected = 'selected="selected"';
                                    }
                                    yearItem.append('<option value="' + N.string.lpad(String(i), 4, "0") + '" ' + selected + '>' + N.string.lpad(String(i), 4, "0") +'</option>');
                                }
                                yearItem.trigger("change.datepicker", isPrevYearBtn ? [ isPrevYearBtn ] : undefined);
                            }
                        });

                    var yearItem = $('<select class="datepicker_year_item__"><select>')
                    var yearStr;
                    for(var i=opts.currYear-opts.minYear;i<=opts.currYear+opts.maxYear;i++) {
                        yearItem.append('<option value="' + N.string.lpad(String(i), 4, "0") +'"' + (i === opts.currYear ? 'selected="selected"' : "") + '>' + N.string.lpad(String(i), 4, "0") +'</option>');
                    }
                    yearItem.addClass("datepicker_year_item__ datepicker_year_selected__").on("change.datepicker", function(e, isPrevNextYearBtn) {
                        var selYearStr = $(this).val();

                        // immediately applys the changed year to the context element
                        if(opts.yearChangeInput) {
                            var dateVal = opts.context.val().replace(/[^\d]/g,"");

                            if(dateVal.length <= 4) {
                                opts.context.val(selYearStr);
                            } else {
                                var selDate;
                                var dateFormat;
                                if(dateVal.length === 6) {
                                    dateFormat = N.context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");
                                } else if(dateVal.length === 8) {
                                    dateFormat = N.context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");
                                }

                                if(dateFormat !== undefined) {
                                    selDate = N.date.strToDate(dateVal, dateFormat);

                                    var tempFormat = "";
                                    $(dateFormat.split("")).each(function(i, formatChar) {
                                        tempFormat += formatChar + "-";
                                    });
                                    dateVal = selDate.obj.formatDate(tempFormat).replace(selDate.obj.formatDate("Y"), selYearStr).replace(/\-/g, "");
                                    opts.context.val(dateVal);
                                }
                            }

                            // minDate, maxDate
                            if(!isPrevNextYearBtn) {
                                if(!Datepicker.checkMinMaxDate.call(self)) {
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

                    var nextYearBtn = $('<div class="datepicker_year_paging__"><a href="#" class="datepicker_year_next__" title="' + N.message.get(opts.message, "next") + '"><span>&gt;</span></a></div>').appendTo(yearsPanel)
                        .find("> .datepicker_year_next__").on("click.datepicker", function(e, isNextYearBtn) {
                            e.preventDefault();
                            var selectedYear = parseInt(yearItem.val());

                            if(selectedYear < opts.currYear + opts.maxYear && opts.currYear + opts.maxYear > opts.minYear + opts.maxYear) {
                                yearItem.val(N.string.lpad(String(selectedYear + 1), 4, "0")).trigger("change.datepicker", isNextYearBtn ? [ isNextYearBtn ] : undefined);
                            } else {
                                yearItem.empty();
                                selectedYear++;

                                var startYear = selectedYear - opts.minYear;
                                var endYear = selectedYear + opts.maxYear;

                                for(var i=startYear;i<=endYear;i++) {
                                    var selected = "";
                                    if(i === selectedYear) {
                                        opts.currYear = selectedYear;
                                        selected = 'selected="selected"';
                                    }
                                    yearItem.append('<option value="' + N.string.lpad(String(i), 4, "0") + '" ' + selected + '>' + N.string.lpad(String(i), 4, "0") +'</option>');
                                }
                                yearItem.trigger("change.datepicker", isNextYearBtn ? [ isNextYearBtn ] : undefined);
                            }
                        });
                }
                opts.contents.append(yearsPanel);

                // create month items
                monthsPanel = $('<div class="datepicker_months_panel__"></div>');

                if(opts.monthsPanelPosition === "top") {
                    monthsPanel.hide();

                    topMonthsPanel = $('<div class="datepicker_top_months_panel__"></div>');
                    topMonthItem = $('<select><select>')
                    for(var i=1;i<=12;i++) {
                        topMonthItem.append('<option value="' + String(i) +'"' + (i === parseInt(d.formatDate("m")) ? 'selected="selected"' : "") + '>' + N.string.lpad(String(i), 2, "0") +'</option>');
                    }

                    var prevMonthBtn = $('<div class="datepicker_month_paging__"><a href="#" class="datepicker_month_prev__" title="' + N.message.get(opts.message, "prev") + '"><span>&lt;</span></a></div>').appendTo(topMonthsPanel)
                    .find("> .datepicker_month_prev__").on("click.datepicker", function(e) {
                        e.preventDefault();
                        var prevMonth = String(parseInt(topMonthItem.val()) - 1);
                        if(prevMonth < 1) {
                            var yearPrevBtnEle = yearsPanel.find(".datepicker_year_prev__");
                            if(opts.yearsPanelPosition === "left") {
                                var yearStr = String(Number(yearsPanel.find(".datepicker_year_selected__").text()) - 1);
                                yearsPanel.find(".datepicker_year_item__").removeClass("datepicker_year_selected__");
                                if(yearsPanel.find(".datepicker_year_item__:contains('" + N.string.lpad(String(yearStr), 4, "0") + "')").length === 0) {
                                    Datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), yearStr, -4, true);
                                }
                                yearsPanel.find(".datepicker_year_item__:contains('" + N.string.lpad(String(yearStr), 4, "0") + "')").trigger("click");
                            } else if(opts.yearsPanelPosition === "top") {
                                yearPrevBtnEle.trigger("click.datepicker", [ true ]);
                            }

                            prevMonth = 12;
                        }
                        topMonthItem.val(prevMonth);
                        monthsPanel.find(".datepicker_month_item__:contains(" + prevMonth + "):eq(0)").trigger("click.datepicker");
                    });

                    topMonthItem.addClass("datepicker_month_item__ datepicker_month_selected__").on("change.datepicker", function() {
                        monthsPanel.find(".datepicker_month_item__:contains(" + $(this).val() + "):eq(0)").trigger("click.datepicker");
                    }).appendTo(topMonthsPanel);

                    var nextMonthBtn = $('<div class="datepicker_month_paging__"><a href="#" class="datepicker_month_next__" title="' + N.message.get(opts.message, "next") + '"><span>&gt;</span></a></div>').appendTo(topMonthsPanel)
                    .find("> .datepicker_month_next__").on("click.datepicker", function(e) {
                        e.preventDefault();
                        var nextMonth = String(parseInt(topMonthItem.val()) + 1);
                        if(nextMonth > 12) {
                            var yearNextBtnEle = yearsPanel.find(".datepicker_year_next__");
                            if(opts.yearsPanelPosition === "left") {
                                var yearStr = String(Number(yearsPanel.find(".datepicker_year_selected__").text()) + 1);
                                yearsPanel.find(".datepicker_year_item__").removeClass("datepicker_year_selected__");
                                if(yearsPanel.find(".datepicker_year_item__:contains('" + N.string.lpad(String(yearStr), 4, "0") + "')").length === 0) {
                                    Datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), yearStr, 0, true);
                                }
                                yearsPanel.find(".datepicker_year_item__:contains('" + N.string.lpad(String(yearStr), 4, "0") + "')").trigger("click");
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
                        var startX;
                        var lastX;
                        opts.contents.on("touchstart", function(e) {
                            startX = e.originalEvent.touches[0].pageX;
                        }).on("touchmove", function(e) {
                            e.preventDefault();
                            lastX = e.originalEvent.touches[0].pageX;
                        }).on("touchend", function(e) {
                            var deltaX = startX - lastX;
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

                var monthItem = $('<div></div>');
                monthsPanel.append(monthItem.clone().addClass("datepicker_month_title__").text(N.message.get(opts.message, "month")));
                // rendering the month items
                for(i=1;i<=12;i++) {
                    monthsPanel.append(monthItem.clone(true).addClass("datepicker_month_item__").text(String(i)));
                    if(monthsPanel.find(".datepicker_month_selected__").length === 0) {
                        monthsPanel.find(".datepicker_month_item__:contains(" + String(parseInt(d.formatDate("m"))) + "):eq(0)").addClass("datepicker_month_selected__");
                    }
                }
                opts.contents.append(monthsPanel);

                // Binds click event to month items
                monthsPanel.on("click.datepicker", ".datepicker_month_item__", function(e, ke) {
                    e.preventDefault();

                    var selectedMonthItemEle = monthsPanel.find(".datepicker_month_item__.datepicker_month_selected__").removeClass("datepicker_month_selected__");
                    $(this).addClass("datepicker_month_selected__");

                    var selYearStr = yearsPanel.find(".datepicker_year_selected__")[opts.yearsPanelPosition === "left" ? "text" : "val"]();
                    var selMonthStr = $(this).text();
                    if(selMonthStr != selectedMonthItemEle.text()) {
                        // immediately applys the changed month to the context element
                        if(opts.monthChangeInput) {
                            var dateVal = opts.context.val().replace(/[^\d]/g,"");

                            if(dateVal.length >= 4) {
                                var selDate;
                                var dateFormat;
                                if(dateVal.length === 4) {
                                    dateFormat = "Ym";
                                    dateVal = dateVal + N.string.lpad(selMonthStr, 2, "0");
                                } else if(dateVal.length === 6) {
                                    dateFormat = N.context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");
                                } else if(dateVal.length === 8) {
                                    dateFormat = N.context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");
                                }

                                if(dateFormat !== undefined) {
                                    selDate = N.date.strToDate(dateVal, dateFormat);

                                    var tempFormat = "";
                                    $(dateFormat.split("")).each(function(i, formatChar) {
                                        tempFormat += formatChar + "-";
                                    });

                                    var endDateCls = N.date.strToDate(N.string.lpad(selDate.obj.formatDate("Y"), 4, "0") +  N.string.lpad(String(Number(selMonthStr) + 1), 2, "0") + "00", "Ymd");
                                    var endDate = endDateCls.obj.getDate();

                                    dateVal = selDate.obj.formatDate(tempFormat)
                                        .replace(selDate.obj.formatDate("Y"), N.string.lpad(selDate.obj.formatDate("Y"), 4, "0"))
                                        .replace(selDate.obj.formatDate("m") + "-", N.string.lpad(selMonthStr, 2, "0") + "-");

                                    if(Number(selDate.obj.formatDate("d")) > endDate) {
                                        dateVal = dateVal.replace(selDate.obj.formatDate("d") + "-", N.string.lpad(endDate, 2, "0") + "-");
                                    } else if(Number(opts.lastSelectedDay) === endDate) {
                                        dateVal = dateVal.replace(selDate.obj.formatDate("d") + "-", N.string.lpad(opts.lastSelectedDay, 2, "0") + "-");
                                    }
                                    dateVal = dateVal.replace(/\-/g, "");

                                    opts.context.val(dateVal);
                                }

                                // minDate, maxDate
                                if(!Datepicker.checkMinMaxDate.call(self)) {
                                    return false;
                                }
                            }
                        }

                        if(opts.onChangeMonth !== null) {
                            opts.onChangeMonth.call(self, opts.context, selMonthStr, selYearStr, e);
                        }
                        opts.context.trigger("onChangeMonth", [opts.context, selMonthStr, selYearStr, e]);
                    }

                    if(opts.monthonly) {
                        var selDate = N.date.strToDate(N.string.lpad(selYearStr, 4, "0") + N.string.lpad($(this).text(), 2, "0"), "Ym");
                        // sets the date format by the global config.
                        selDate.format = N.context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");

                        var onSelectContinue;
                        if(opts.onSelect !== null) {
                            onSelectContinue = opts.onSelect.call(self, opts.context, selDate, opts.monthonly);
                        }
                        if(onSelectContinue === undefined || onSelectContinue === true) {
                            var dateFormat = selDate.format.replace(/[^Y|^m|^d]/g, "");
                            var yearVal = selDate.obj.formatDate("Y");
                            var dateVal = selDate.obj.formatDate(dateFormat);
                            if(yearVal.length === 3) {
                                var tempFormat = "";
                                $(dateFormat.split("")).each(function(i, formatChar) {
                                    tempFormat += formatChar + "-";
                                });
                                dateVal = selDate.obj.formatDate(tempFormat).replace(yearVal, "0" + yearVal).replace(/\-/g, "");
                            }
                            opts.context.val(dateVal);
                        }
                        opts.context.trigger("onSelect", [opts.context, selDate, opts.monthonly]);

                        self.hide(ke);
                    } else {
                        var selectedDay = daysPanel.find(".datepicker_day_selected__").text();
                        daysPanel.empty();
                        var endDateCls = N.date.strToDate(N.string.lpad(selYearStr, 4, "0") +  N.string.lpad(String(parseInt($(this).text())+1), 2, "0") + "00", "Ymd");
                        var endDate = endDateCls.obj.getDate();
                        opts.gEndDate = endDate;
                        if(format !== "Ymd") {
                            opts.gEndDate = 31;
                        }
                        endDateCls.obj.setDate(1);
                        var startDay = endDateCls.obj.getDay();
                        //render week
                        var j;
                        for(j=0;j<days.length;j++) {
                            daysPanel.append(dayItem.clone().addClass("datepicker_day_title__").text(days[j]));
                        }

                        var prevEndDateCls = N.date.strToDate(N.string.lpad(selYearStr, 4, "0") +  N.string.lpad($(this).text(), 2, "0") + "00", "Ymd");
                        var prevEndDate = prevEndDateCls.obj.getDate();
                        var day;
                        var dayItemT;
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
                                dayItemT.data("year", endDateCls.obj.getMonth() + 1 == 12 ?  endDateCls.obj.getFullYear() + 1 : endDateCls.obj.getFullYear())
                                    .data("month", endDateCls.obj.getMonth() + 2 == 13 ? 1 : endDateCls.obj.getMonth() + 2)
                                    .data("day", day);
                            } else {
                                dayItemT.addClass("datepicker_day_item__");
                                dayItemT.data("year", endDateCls.obj.getFullYear())
                                    .data("month", endDateCls.obj.getMonth() + 1)
                                    .data("day", day);
                            }

                            var date = N.string.lpad(String(dayItemT.data("year")), 4, "0") +
                                    N.string.lpad(String(dayItemT.data("month")), 2, "0") +
                                    N.string.lpad(String(dayItemT.data("day")), 2, "0");

                            if(opts.minDate && Number(date) < Number(opts.minDate)) {
                                dayItemT.addClass("datepicker_min_date__");
                                dayItemT.tpBind("click", N.event.disable);
                            } else if(opts.maxDate && Number(date) > Number(opts.maxDate)) {
                                dayItemT.addClass("datepicker_max_date__");
                                dayItemT.tpBind("click", N.event.disable);
                            }

                            // holiday
                            var repeatDate = date.substring(4, 8);
                            var holidayValues = [];
                            if(opts.holiday.repeat && opts.holiday.repeat[repeatDate]) {
                                var repeatValue = opts.holiday.repeat[repeatDate];
                                if(N.type(repeatValue) === "array") {
                                    holidayValues.push(repeatValue.join(", "));
                                } else {
                                    holidayValues.push(repeatValue);
                                }
                            }
                            if(opts.holiday.once && opts.holiday.once[date]) {
                                var onceValue = opts.holiday.once[date];
                                if(N.type(onceValue) === "array") {
                                    holidayValues.push(onceValue.join(", "));
                                } else {
                                    holidayValues.push(onceValue);
                                }
                            }
                            if(!N.isEmptyObject(holidayValues)) {
                                dayItemT.addClass("datepicker_holiday__").attr("title", holidayValues.join(", "));
                            }

                            daysPanel.append(dayItemT.text(day));
                        }

                        daysPanel.find(".datepicker_prev_day_item__, .datepicker_day_item__, .datepicker_next_day_item__").each(function(i, ele) {
                            setTimeout(function() {
                                $(ele).addClass("visible__");
                            }, i*10);
                        });

                        // automatic day selection
                        var dateVal = opts.context.val().replace(/[^\d]/g,"");
                        if(!N.string.isEmpty(dateVal) && dateVal.length === 8) {
                            var selDate = N.date.strToDate(dateVal, dateFormat = N.context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, ""));
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
                    // creates the day items
                    var days = N.message.get(opts.message, "days").split(",");
                    var daysPanel = $('<div class="datepicker_days_panel__"></div>');
                    var dayItem = $('<div></div>');

                    opts.contents.append(daysPanel);

                    // Binds click event to day items
                    daysPanel.on("click.datepicker", ".datepicker_day_item__, .datepicker_prev_day_item__, .datepicker_next_day_item__", function(e, ke) {
                        e.preventDefault();
                        var thisEle = $(this);

                        daysPanel.find(".datepicker_prev_day_item__.datepicker_day_selected__, .datepicker_day_item__.datepicker_day_selected__, .datepicker_next_day_item__.datepicker_day_selected__").removeClass("datepicker_day_selected__");
                        thisEle.addClass("datepicker_day_selected__");
                        var selDate = N.date.strToDate(N.string.lpad(String(thisEle.data("year")), 4, "0") +
                                N.string.lpad(String(thisEle.data("month")), 2, "0") +
                                N.string.lpad(String(thisEle.data("day")), 2, "0"), "Ymd");

                        opts.lastSelectedDay = thisEle.text();

                        // sets the date format by the global config
                        selDate.format = N.context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");

                        var onSelectContinue;
                        if(opts.onSelect !== null) {
                            onSelectContinue = opts.onSelect.call(self, opts.context, selDate, opts.monthonly);
                        }
                        if(onSelectContinue === undefined || onSelectContinue === true) {
                            var dateFormat = selDate.format.replace(/[^Y|^m|^d]/g, "");
                            var yearVal = selDate.obj.formatDate("Y");
                            var dateVal = selDate.obj.formatDate(dateFormat);
                            if(yearVal.length === 3) {
                                var tempFormat = "";
                                $(dateFormat.split("")).each(function(i, formatChar) {
                                    tempFormat += formatChar + "-";
                                });
                                dateVal = selDate.obj.formatDate(tempFormat).replace(yearVal, "0" + yearVal).replace(/\-/g, "");
                            }
                            opts.context.val(dateVal);
                        }
                        opts.context.trigger("onSelect", [opts.context, selDate, opts.monthonly]);
                        self.hide(ke);
                    });
                }

                var contextParentWrapEle = opts.context.closest("label,span");
                // append datepicker panel after context
                if(contextParentWrapEle.length > 0 && contextParentWrapEle.css("overflow").indexOf("hidden") > -1) {
                    opts.contextWrapper = contextParentWrapEle.after(opts.contents);
                } else {
                    opts.context.after(opts.contents);
                }

                return opts.contents;
            },
            yearPaging : function(yearItems, currYear, addCnt, absolute) {
                // Date Object's year value must be greater 2 digits
                yearItems.removeClass("datepicker_curr_year__");
                var thisEle;
                var yearNum;
                yearItems.each(function(i) {
                    thisEle = $(this);
                    if(absolute !== undefined && absolute === true) {
                        yearNum = parseInt(currYear) + i;
                    } else {
                        yearNum = parseInt(thisEle.text());
                    }
                    if(yearNum <= 100 - addCnt) {
                        thisEle.text(N.string.lpad(String(100 + i), 4, "0"));
                    } else {
                        thisEle.text(N.string.lpad(String(yearNum + addCnt), 4, "0"));
                    }
                    if(thisEle.text() === String(currYear)) {
                        thisEle.addClass("datepicker_curr_year__");
                    }
                });
            },
            selectItems : function(opts, value, format, yearsPanel, monthsPanel, daysPanel) {
                if(value.length > 2 && value.length%2 !== 0) {
                    value = (new Date()).formatDate(format);
                }

                var dateStrArr = N.date.strToDateStrArr(value, format);
                var dateStrStrArr = N.date.strToDateStrArr(value, format, true);

                // year item selection
                if(!isNaN(dateStrStrArr[0]) && dateStrStrArr[0].length === 4) {
                    if(opts.yearsPanelPosition === "left") {
                        yearsPanel.find(".datepicker_year_item__").removeClass("datepicker_year_selected__");
                        Datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), dateStrArr[0], -2, true);
                        yearsPanel.find(".datepicker_year_item__:contains('" + N.string.lpad(String(dateStrArr[0]), 4, "0") + "')").trigger("click");
                    } else if(opts.yearsPanelPosition === "top") {
                        var yearItem = yearsPanel.find(".datepicker_year_item__");
                        if(yearItem.val() != N.string.lpad(String(dateStrArr[0]), 4, "0")) {
                            yearItem.val(N.string.lpad(String(dateStrArr[0]), 4, "0"));
                            if(N.string.isEmpty(yearItem.val())) {
                                yearItem.empty();
                                var startYear = dateStrArr[0]-opts.minYear;
                                var endYear = dateStrArr[0]+opts.maxYear;
                                if(startYear < 100) {
                                    startYear = 100;
                                    endYear = startYear + opts.maxYear;
                                }
                                for(var i=startYear;i<=endYear;i++) {
                                    var selected = "";
                                    if(i === dateStrArr[0]) {
                                        opts.currYear = dateStrArr[0];
                                        selected = 'selected="selected"';
                                    }
                                    yearItem.append('<option value="' + N.string.lpad(String(i), 4, "0") +'" ' + selected + '>' + N.string.lpad(String(i), 4, "0") +'</option>');
                                }
                            }
                            if(!N.string.isEmpty(opts.context.val())) {
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
        });

        $.extend(Datepicker.prototype, {
            context : function(sel) {
                return sel !== undefined ? this.options.context.find(sel) : this.options.context;
            },
            show : function() {
                var opts = this.options;

                var contextParentWrapEle = opts.context.closest("label,span");
                if(opts.context.next(".datepicker_contents__.visible").length === 0
                    && (contextParentWrapEle.css("overflow").indexOf("hidden") > -1
                        && contextParentWrapEle.next(".datepicker_contents__").length === 0)) {
                    Datepicker.createContents.call(this);

                    // auto select datepicker items from before input value
                    var dateStr;
                    if(!N.string.isEmpty(opts.context.val())) {
                        dateStr = opts.context.val().replace(/[^0-9]/g, "");
                    } else {
                        dateStr = !opts.monthonly ? (new Date()).formatDate("Ymd") : (new Date()).formatDate("Ym");
                    }

                    Datepicker.selectItems(opts,
                            dateStr,
                            (!opts.monthonly ? N.context.attr("data").formatter.date.Ymd() : N.context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, ""),
                            opts.contents.find(".datepicker_years_panel__"),
                            opts.contents.find(".datepicker_months_panel__"),
                            opts.contents.find(".datepicker_days_panel__"));

                    if(opts.onBeforeShow !== null) {
                        var result = opts.onBeforeShow.call(this, opts.context, opts.contents);
                        if(result !== undefined && result === false) {
                            return this;
                        }
                    }
                    opts.context.trigger("onBeforeShow", [opts.context, opts.contents]);

                    // set datepicker position
                    var formEle = opts.contents.closest(".form__");
                    if(formEle.length > 0 && formEle.css("position") !== "relative") {
                        this.formEleOrgPosition = formEle.css("position").replace("static", "");
                        formEle.css("position", "relative");
                    }
                    var baseEle = opts.contextWrapper ? opts.contextWrapper : opts.context;
                    $(window).on("resize.datepicker", function() {
                        var formPaddingLeft = 0;
                        baseEle.parentsUntil(formEle.parent()).each(function(i, ele) {
                            formPaddingLeft += parseInt($(ele).css("padding-left")) + parseInt($(ele).css("margin-left"));
                        });
                        var formPaddingRight = 0;
                        baseEle.parentsUntil(formEle.parent()).each(function(i, ele) {
                            formPaddingRight += parseInt($(ele).css("padding-right")) + parseInt($(ele).css("margin-right"));
                        });
                        var leftOfs = baseEle.position().left;
                        var tdEle = baseEle.closest("td");
                        if(tdEle.length > 0) {
                            tdEle.css("display", "contents");
                            leftOfs = baseEle.position().left + formPaddingLeft;
                            tdEle.css("display", "");
                        }

                        var limitWidth;
                        if(formEle.length > 0 && formEle.innerWidth() > opts.contents.outerWidth()) {
                            limitWidth = formEle.offset().left + parseInt(formEle.css("padding-left")) + formEle.width();
                        } else {
                            limitWidth = (window.innerWidth ? window.innerWidth : $(window).width());
                        }
                        if(baseEle.offset().left + opts.contents.width() > limitWidth) {
                            opts.contents.css("left", (leftOfs + baseEle.outerWidth() - opts.contents.width()) + "px");
                            opts.contents.removeClass("orgin_left__").addClass("orgin_right__");
                        } else {
                            opts.contents.css("left", leftOfs + "px");
                            opts.contents.removeClass("orgin_right__").addClass("orgin_left__");
                        }
                    }).trigger("resize.datepicker");

                    var self = this;
                    opts.contents.show(10, function() {
                        $(this).removeClass("hidden__").addClass("visible__");
                        $(this).one(N.event.whichTransitionEvent(opts.contents), function(e){
                            $(document).off("click.datepicker").on("click.datepicker", function(e) {
                                opts.context.get(0).blur();
                                self.hide();
                            });

                            if(opts.onShow !== null) {
                                opts.onShow.call(self, opts.context, opts.contents);
                            }
                            opts.context.trigger("onShow", [opts.context, opts.contents]);
                        }).trigger("nothing");
                    });

                }

                return this;
            },
            hide : function() {
                var opts = this.options;

                if(opts.contents.hasClass("visible__")) {
                    var self = this;
                    if(opts.onBeforeHide !== null) {
                        // arguments[0] - because of firefox, firefox does not have window.event object
                        var result = opts.onBeforeHide.call(this, opts.context, opts.contents, arguments.length > 0 ? arguments[0] : undefined);
                        if(result !== undefined && result === false) {
                            return this;
                        }
                    }
                    opts.context.trigger("onBeforeHide", [opts.context, opts.contents, arguments.length > 0 ? arguments[0] : undefined]);

                    $(window).off("resize.datepicker");
                    $(document).off("click.datepicker");
                    opts.context.off("blur.datepicker");

                    opts.contents.removeClass("visible__").addClass("hidden__");

                    opts.contents.one(N.event.whichTransitionEvent(opts.contents), function(e){
                        if(self.formEleOrgPosition !== undefined) {
                            $(this).closest(".form__").css("position", self.formEleOrgPosition);
                        }
                        $(this).remove();
                        if(opts.onHide !== null) {
                            opts.onHide.call(self, opts.context);
                        }
                        opts.context.trigger("onHide", [opts.context]);
                    }).trigger("nothing");
                }

                return this;
            }
        });

        // Popup
        var Popup = N.popup = function(obj, opts) {
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
            var isOpenerHas = false;
            if(opts && opts.opener) {
                var opener = opts.opener;
                opts.opener = undefined;
                isOpenerHas = true;
            }

            try {
                $.extend(true, this.options, N.context.attr("ui").popup);
            } catch (e) {
                throw N.error("N.popup", e);
            }

            if(opts !== undefined) {
                if(N.type(opts) === "string") {
                    this.options.url = opts;
                }
            } else {
                if(arguments.length === 1 && N.isPlainObject(obj)) {
                    opts = obj;
                    obj = N(window);
                }
            }

            // Wraps the global event options in N.config and event options for this component.
            UI.utils.wrapHandler(opts, "popup", "onOk");
            UI.utils.wrapHandler(opts, "popup", "onCancel");
            UI.utils.wrapHandler(opts, "popup", "onBeforeShow");
            UI.utils.wrapHandler(opts, "popup", "onShow");
            UI.utils.wrapHandler(opts, "popup", "onBeforeHide");
            UI.utils.wrapHandler(opts, "popup", "onHide");
            UI.utils.wrapHandler(opts, "popup", "onBeforeRemove");
            UI.utils.wrapHandler(opts, "popup", "onRemove");
            UI.utils.wrapHandler(opts, "popup", "onOpen");
            UI.utils.wrapHandler(opts, "popup", "onClose");
            UI.utils.wrapHandler(opts, "popup", "onLoad");

            $.extend(true, this.options, opts);

            // To prevent "maximum call stack size exceeded" error in jQuery's extend method when define the opener option.
            if(isOpenerHas) {
                opts.opener = opener;
                this.options.opener = opts.opener;
                opener = undefined;
            }

            // if title option value is undefined
            this.options.title = opts !== undefined ? N.string.trimToNull(opts.title) : null;

            if(this.options.url !== null || (this.options.preload && this.options.closeMode === "remove")) {
                if(this.options.preload) {
                    Popup.loadContent.call(this, function(cont, context) {
                        // this callback function is for async page load
                        this.options.context = context;

                        // set this instance to context element
                        this.options.context.instance("popup", this);

                        this.options.isLoaded = true;
                    });
                }
            } else {
                Popup.wrapEle.call(this);

                // set this instance to context element
                this.options.context.instance("popup", this);
            }

            return this;
        };

        $.extend(Popup, {
            wrapEle : function() {
                var opts = this.options;
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

                this.alert = N(window).alert(opts);
                this.alert.options.msgContext.addClass("popup_overlay__");
                this.alert.options.msgContents.addClass("popup__");

                if(opts.saveMemory) {
                    this.alert.options.msg = null;
                }
            },
            loadContent : function(callback) {
                var opts = this.options;
                var self = this;

                N.comm({
                    url : opts.url,
                    contentType : "text/html; charset=UTF-8",
                    dataType : "html",
                    type : "GET"
                }).submit(function(page) {
                    // set loaded page instance to options.context
                    opts.context = $(page);

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
                        var orgFn = opts.onRemove;
                        opts.onRemove = function() {
                            opts.context = null;
                            return orgFn.apply(this, arguments);
                        }
                    } else {
                        opts.onRemove = function() {
                            opts.context = null;
                        };
                    }

                    var opener;
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

                    var cont = opts.context.filter(".view_context__:last").instance("cont");

                    // set popup instance to popup's Controller
                    if(cont !== undefined) {
                        // set caller attribute in Controller in tab content, that is Popup instance
                        cont.caller = self;

                        // set opener to popup's Controller
                        if(opts.opener != null) {
                            cont.opener = opts.opener;
                        }

                        // triggering "init" method
                        N.cont.trInit.call(this, cont, this.request);

                        callback.call(self, cont, opts.context);
                    } else {
                        callback.call(self, cont, opts.context);
                    }

                    // execute the "onLoad" event handler.
                    if(opts.onLoad !== null) {
                        opts.onLoad.call(this, cont);
                    }
                });
            },
            popOpen : function(onOpenData, cont) {
                var opts = this.options;
                var self = this;

                if(opts.url === null) {
                    opts.context.show();
                }
                self.alert.show();

                var onOpenProcFn__ = function() {
                    // execute "onOpen" event
                    if(opts.onOpen !== null) {
                        opts.onOpenData = onOpenData !== undefined ? onOpenData : null;
                        if(opts.context.filter(".view_context__:last").instance("cont")[opts.onOpen] !== undefined) {
                            opts.context.filter(".view_context__:last").instance("cont")[opts.onOpen](onOpenData);
                        } else {
                            N.warn("[N.popup.popOpen]The onOpen event handler(" + opts.onOpen + ") is not defined on the Controller(N.cont) of the Popup.");
                        }
                    }
                };

                onOpenProcFn__();
            }
        });

        $.extend(Popup.prototype, {
            context : function(sel) {
                return sel !== undefined ? this.options.context.find(sel) : this.options.context;
            },
            open : function(onOpenData) {
                var opts = this.options;
                var self = this;

                if(onOpenData === undefined && opts.onOpenData !== null) {
                    onOpenData = opts.onOpenData;
                }

                if(this.options.url !== null && ((!opts.preload && !opts.isLoaded) || !opts.isLoaded)) {
                    opts.isLoaded = false;
                    Popup.loadContent.call(this, function(cont, context) {
                        // this callback function is for async page load
                        opts.context = context;
                        opts.context.instance("popup", this);

                        Popup.popOpen.call(self, onOpenData, cont);

                        if(opts.closeMode !== "remove") {
                            opts.isLoaded = true;
                        }
                    });
                } else {
                    Popup.popOpen.call(this, onOpenData);
                    if(opts.preload && opts.closeMode === "remove") {
                        opts.isLoaded = false;
                    }
                }
                return this;
            },
            close : function(onCloseData) {
                var opts = this.options;

                if(onCloseData === undefined && opts.onCloseData !== null) {
                    onCloseData = opts.onCloseData;
                }

                // execute the "onClose" event handler.
                if(opts.onClose !== null) {
                    opts.onClose.call(this, onCloseData);
                }

                this.alert[opts.closeMode]();

                return this;
            },
            changeEvent : function(name, callback) {
                this.options[name] = callback;
                this.alert.options[name] = this.options[name];
            },
            remove : function() {
                this.alert.remove();
                return this;
            }
        });

        // Tab
        var Tab = N.tab = function(obj, opts) {
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
            var isOpenerHas = false;
            if(opts && opts.opener) {
                var opener = opts.opener;
                opts.opener = undefined;
                isOpenerHas = true;
            }

            try {
                $.extend(true, this.options, N.context.attr("ui").tab);
            } catch (e) {
                throw N.error("N.tab", e);
            }

            if (N.isPlainObject(obj)) {
                // Wraps the global event options in N.config and event options for this component.
                UI.utils.wrapHandler(opts, "tab", "onActive");
                UI.utils.wrapHandler(opts, "tab", "onLoad");

                $.extend(true, this.options, obj);
                this.options.context = N(obj.context);
            }
            this.options.links = this.options.context.find(">ul>li");
            this.options.contents = this.options.context.find(">div");

            var self = this;
            var opt;
            if(this.options.tabOpts.length === 0) {
                this.options.links.each(function(i) {
                    var thisEle = $(this);
                    opt = N.element.toOpts(thisEle);
                    if(opt === undefined) {
                        opt = {};
                    }
                    opt.target = thisEle.find("a").attr("href");
                    self.options.tabOpts.push(opt);
                });
            }

            $.extend(this.options, opts);

            // To prevent "maximum call stack size exceeded" error in jQuery's extend method when define the opener option.
            if(isOpenerHas) {
                opts.opener = opener;
                this.options.opener = opts.opener;
                opener = undefined;
            }

            // set style class name to context element
            this.options.context.addClass("tab__");

            Tab.wrapEle.call(this);

            // set this instance to context element
            this.options.context.instance("tab", this);
        };

        $.extend(Tab, {
            wrapEle : function() {
                var opts = this.options;
                // hide div contents
                opts.contents.hide();

                var self = this;

                var defSelIdx;
                $(opts.tabOpts).each(function(i) {
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
                            Tab.loadContent.call(self, this.url, i, function(cont, selContentEle_) {
                                // execute "onLoad" event
                                if(opts.onLoad !== null) {
                                    opts.onLoad.call(self, i, opts.links.eq(i), selContentEle_, cont);
                                }
                            });
                        }
                    }
                });

                var marginLeft;
                opts.links.on("mousedown.tab" + (N.browser.scrollbarWidth() > 0 ? "touchstart.tab" : ""), function(e) {
                    e.preventDefault();

                    marginLeft = parseInt(opts.context.find(">ul").css("margin-left"));
                });

                opts.links.on("click.tab" + (N.browser.scrollbarWidth() > 0 ? "touchend.tab" : ""), function(e, onOpenData, isFirst) {
                    e.preventDefault();

                    if(marginLeft !== undefined && Math.abs(parseInt(opts.context.find(">ul").css("margin-left")) - marginLeft) > 15 && isFirst !== true) {
                        marginLeft = undefined;
                        return false;
                    }
                    marginLeft = undefined;

                    if(!$(this).hasClass("tab_active__")) {
                        var selTabEle = $(this);
                        var selTabIdx = opts.beforeOpenIdx = opts.links.index(this);
                        var selDeclarativeOpts = opts.tabOpts[selTabIdx];
                        var selContentEle = opts.contents.eq(selTabIdx);

                        opts.links.filter(".tab_active__").removeClass("tab_active__");
                        selTabEle.addClass("tab_active__");

                        var onActiveProcFn__ = function() {
                            // execute "onActive" event
                            if(opts.onActive !== null) {
                                if(opts.blockOnActiveWhenCreate === false || (opts.blockOnActiveWhenCreate === true && isFirst !== true)) {
                                    opts.onActive.call(self, selTabIdx, selTabEle, selContentEle, opts.links, opts.contents);
                                }
                            }
                        }

                        var onOpenProcFn__ = function() {
                            // execute "onOpen"(declarative option) event
                            if(selDeclarativeOpts.onOpen !== undefined) {
                                var cont = selContentEle.children(".view_context__:last").instance("cont");
                                if(cont[selDeclarativeOpts.onOpen] !== undefined) {
                                    //thisDeclarativeOpts.onOpen
                                    cont[selDeclarativeOpts.onOpen](onOpenData);
                                } else {
                                    N.warn("[N.tab.wrapEle]The onOpen event handler(" + selDeclarativeOpts.onOpen + ") is not defined on the Controller(N.cont) of the tab(N.tab)'s contents.");
                                }
                            }
                        }

                        // Synchronize the animation and page load
                        var visibleDefer = $.Deferred();
                        var loadDefer = $.Deferred();
                        $.when(visibleDefer, loadDefer).done(function() {
                            opts.context.dequeue("open");
                        });

                        // hide tab contents
                        var beforeActivatedContent = opts.contents.filter(".tab_content_active__");
                        if(beforeActivatedContent.length > 0) {
                            var isRelative = false;
                            if(opts.context.css("position") !== "relative") {
                                opts.context.css("position", "relative");
                                isRelative = true;
                            }
                            beforeActivatedContent.removeClass("tab_content_active__ visible__").one(N.event.whichTransitionEvent(beforeActivatedContent), function(e){
                                $(this).hide();
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
                            Tab.loadContent.call(self, selDeclarativeOpts.url, selTabIdx, function(cont, selContentEle_) {
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
                    Tab.wrapScroll.call(this);
                }

                // select tab
                this.open(defSelIdx, undefined, true);
            },
            wrapScroll : function() {
                var opts = this.options;
                var eventNameSpace = ".tab.scroll";
                var tabContainerEle = opts.context.find(">ul").addClass("effect__");

                var scrollBtnEles = opts.context.find(">a").hide();
                var prevBtnEle;
                var nextBtnEle;
                var liMarginRight = parseInt(N.string.trimToZero(tabContainerEle.find(">li:first").css("margin-right")));
                var lastDistance = 0 + liMarginRight;
                var prevBtnEleOuterWidth = 0;
                var nextBtnEleOuterWidth = 0;
                var tabNativeScroll;

                if(scrollBtnEles.length > 1) {
                    opts.context.css("position", "relative");
                    scrollBtnEles.css({
                        "position" : "absolute",
                        "top" : 0
                    });

                    prevBtnEle = scrollBtnEles.eq(0).addClass("tab_scroll_prev__").css("left", 0).on("click" + eventNameSpace,  function(e) {
                        e.preventDefault();
                        if(N.browser.scrollbarWidth() > 0) {
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
                        if(N.browser.scrollbarWidth() > 0) {
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

                    var ulWidth = 0;
                    opts.links.each(function() {
                        ulWidth += ($(this).outerWidth() + parseInt(N.string.trimToZero($(this).css("margin-left"))) + parseInt(N.string.trimToZero($(this).css("margin-right"))));
                    });
                    ulWidth += opts.tabScrollCorrection.tabContainerWidthCorrectionPx;

                    if(ulWidth > 0 && ulWidth > opts.context.width() + liMarginRight) {
                        if(N.browser.scrollbarWidth() > 0) {
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

                        if(N.browser.scrollbarWidth() > 0) {
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

                if(N.browser.scrollbarWidth() > 0) {
                    var sPageX;
                    var prevDefGap = 0;
                    var nextDefGap = 0;
                    var isMoved = false;
                    if(scrollBtnEles.length > 1) {
                        prevDefGap = prevBtnEleOuterWidth;
                        nextDefGap = nextBtnEleOuterWidth;
                    }

                    UI.draggable.events.call(tabContainerEle, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) { // start
                        tabContainerEle_.removeClass("effect__");
                        if(tabContainerEle_.outerWidth() <= opts.context.innerWidth()) {
                            return false;
                        }
                        sPageX = pageX - lastDistance;
                    }, function(e, tabContainerEle_, pageX, pageY) { // move
                        var distance = (sPageX - pageX) * -1;
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
            },
            loadContent : function(url, targetIdx, callback, isFirst) {
                var opts = this.options;
                var self = this;
                var selContentEle = opts.contents.eq(targetIdx);

                N.comm({
                    url : url,
                    contentType : "text/html; charset=UTF-8",
                    dataType : "html",
                    type : "GET",
                    urlSync : !isFirst,
                    target : selContentEle
                }).submit(function(page) {
                    var cont = selContentEle.html(page).children(".view_context__:last").instance("cont");

                    // set tab instance to tab contents Controller
                    if(cont !== undefined) {
                        // set caller attribute in controller in tab content that is Tab instance
                        cont.caller = self;

                        // set opener to popup's Controller
                        if(opts.opener != null) {
                            cont.opener = opts.opener;
                        }

                        // triggering "init" method
                        N.cont.trInit.call(this, cont, this.request);

                        callback.call(this, cont, selContentEle);
                    } else {
                        callback.call(this, cont, selContentEle);
                    }

                    var activeTabEle = opts.links.eq(targetIdx);
                });
            }
        });

        $.extend(Tab.prototype, {
            context : function(sel) {
                return sel !== undefined ? this.options.context.find(sel) : this.options.context;
            },
            open : function(idx, onOpenData, isFirst) {
                var opts = this.options;
                if(idx !== undefined) {
                    if(opts.beforeOpenIdx !== idx) {
                        opts.context.queue("open", function() {
                            if(onOpenData !== undefined) {
                                $(opts.links.get(idx)).trigger("click.tab", [onOpenData, isFirst]);
                            } else {
                                $(opts.links.get(idx)).trigger("click.tab", [undefined, isFirst]);
                            }
                        });
                        clearTimeout(opts.openTime);
                        opts.openTime = setTimeout(function() {
                            opts.context.dequeue("open");
                        }, 0);
                    }
                    opts.beforeOpenIdx = idx;

                    if(opts.tabScroll) {
                        var tabContainerEle = opts.context.find(">ul");
                        if(tabContainerEle.outerWidth() > opts.context.innerWidth()) {
                            var marginLeft = parseInt(tabContainerEle.css("margin-left")) - $(opts.links.get(idx)).position().left + (opts.context.innerWidth() / 2 - $(opts.links.get(idx)).outerWidth() / 2);
                            var prevBtnEle = opts.context.find(">.tab_scroll_prev__");
                            var nextBtnEle = opts.context.find(">.tab_scroll_next__");

                            if(marginLeft > opts.context.find(">.tab_scroll_prev__").outerWidth()) {
                                marginLeft = prevBtnEle.length > 0 ? prevBtnEle.outerWidth() : 0;
                                nextBtnEle.removeClass("disabled__");
                                prevBtnEle.addClass("disabled__");
                            } else if(opts.context.innerWidth() > tabContainerEle.outerWidth() + marginLeft) {
                                marginLeft = -(tabContainerEle.outerWidth() - opts.context.innerWidth() + (nextBtnEle.length > 0 ? nextBtnEleOuterWidth : 0) - 1);
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
            },
            disable : function(idx) {
                if(idx !== undefined) {
                    $(this.options.links.get(idx))
                        .off("click.tab.disable")
                        .off("touchstart.tab.disable")
                        .off("touchend.tab.disable")
                        .tpBind("click.tab.disable", N.event.disable)
                        .tpBind("touchstart.tab.disable", N.event.disable)
                        .tpBind("touchend.tab.disable", N.event.disable)
                        .addClass("tab_disabled__");
                }
                return this;
            },
            enable : function(idx) {
                if(idx !== undefined) {
                    $(this.options.links.get(idx))
                        .off("click", N.event.disable)
                        .off("touchstart", N.event.disable)
                        .off("touchend", N.event.disable)
                        .removeClass("tab_disabled__");
                }
                return this;
            },
            cont : function(idx) {
                var opts = this.options;
                var cont;
                if(idx !== undefined) {
                    cont = opts.context.find("> div:eq(" + String(idx) + ") > .view_context__").instance("cont");
                } else {
                    cont = opts.context.find("> .tab_content_active__ > .view_context__").instance("cont");
                }

                if(cont === undefined) {
                    N.warn("Tab content has not been loaded yet or Controller(N.cont) object is missing.");
                }

                return cont;
            }
        });

        // Select
        var Select = N.select = function(data, opts) {
            this.options = {
                data : N.type(data) === "array" ? N(data) : data,
                context : null,
                key : null,
                val : null,
                append : true,
                direction : "h", // direction : h(orizontal), v(ertical)
                type : 0, // type : 1: select, 2: select[multiple='multiple'], 3: radio, 4: checkbox
                template : null
            };

            try {
                $.extend(this.options, N.context.attr("ui").select);
            } catch (e) {
                throw N.error("N.select", e);
            }
            $.extend(this.options, N.element.toOpts(this.options.context));

            if (N.isPlainObject(opts)) {
                $.extend(this.options, opts);
                if(N.type(this.options.data) === "array") {
                    this.options.data = N(opts.data);
                }
                this.options.context = N(opts.context);
            } else {
                this.options.context = N(opts);
            }
            this.options.template = this.options.context;

            Select.wrapEle.call(this);

            // set style class name to context element
            this.options.context.addClass("select__");

            // set this instance to context element
            this.options.context.instance("select", this);

            return this;
        };

        $.extend(Select, {
            wrapEle : function() {
                var opts = this.options;
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
            }
        });

        $.extend(Select.prototype, {
            data : function(selFlag) {
                var opts = this.options;
                if(selFlag !== undefined && selFlag === true) {
                    var selectEles = opts.type === 1 || opts.type === 2 ? opts.context.find("option") : opts.context.closest(".select_input_container__").children("label");
                    var defSelCnt = selectEles.filter(".select_default__").length;
                    var idxs = this.index();
                    if(N.type(idxs) !== "array") {
                        idxs = [idxs];
                    }
                    return $(idxs).map(function() {
                        if(this - defSelCnt > -1) {
                            return opts.data.get(this - defSelCnt);
                        }
                    }).get();
                } else if(selFlag !== undefined && selFlag === false) {
                    return opts.data;
                } else {
                    return opts.data.get();
                }
            },
            context : function(sel) {
                return sel !== undefined ? this.options.context.find(sel) : this.options.context;
            },
            bind : function(data) {
                var opts = this.options;

                //to rebind new data
                if(data != null) {
                    opts.data = N.type(data) === "array" ? N(data) : data;
                }

                if(opts.type === 1 || opts.type === 2) {
                    var defaultSelectEle = opts.template.find(".select_default__").clone(true);
                    opts.context.addClass("select_template__").empty();
                    if(opts.append) {
                        opts.context.append(defaultSelectEle);
                    }
                    opts.data.each(function(i, rowData) {
                        opts.context.append("<option value='" + (rowData[opts.val] === null ? "" : rowData[opts.val]) + "'>" + rowData[opts.key] + "</option>");
                    });
                } else if(opts.type === 3 || opts.type === 4) {
                    if(opts.context.filter(".select_template__").length === 0) {
                        var id = opts.context.attr("id")
                        var container = $('<form class="select_input_container__" style="display: inline;" />');
                        if (opts.direction === "h") {
                            container.addClass("select_input_horizontal__");
                        } else if (opts.direction === "v") {
                            container.addClass("select_input_vertical__");
                        }
                        var labelEle;
                        var labelTextEle
                        opts.data.each(function(i, rowData) {
                            labelEle = $('<label class="select_input_label__ ' + id + "_" + String(i) + '__"></label>');
                            labelTextEle = $('<span>' + rowData[opts.key] + '</span>');
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
            },
            index : function(idx) {
                var opts = this.options;
                var self = this;

                var selectSiblingEles = opts.type === 1 || opts.type === 2 ? opts.context.find("option") : opts.context.closest(".select_input_container__").children("label");
                var selectEles = opts.type === 1 || opts.type === 2 ? opts.context : selectSiblingEles.find(":radio, :checkbox");
                if(idx === undefined) {
                    var rslt = selectEles.vals();
                    var spltSepa = N.context.attr("core").spltSepa;
                    var rsltStr = spltSepa + (N.type(rslt) === "array" ? rslt.join(spltSepa) : String(rslt)) + spltSepa;
                    var rsltArr = [];
                    (opts.type === 1 || opts.type === 2 ? selectSiblingEles : selectEles).each(function(i) {
                        if(rsltStr.indexOf(spltSepa + this.value + spltSepa) > -1) {
                            rsltArr.push(i);
                        }
                    });
                    return rsltArr.length > 0 ? rsltArr.length === 1 ? rsltArr[0] : rsltArr : -1;
                }

                var vals = [];
                $(N.type(idx) === "number" ? [idx] : idx).each(function() {
                    vals.push((opts.type === 1 || opts.type === 2 ? selectSiblingEles : selectEles).get(this).value);
                });
                selectEles.vals(vals);

                return this;
            },
            val : function(val) {
                var opts = this.options;

                if(!N.isEmptyObject(opts.data)) {
                    var rtnVal = $(opts.type === 3 || opts.type === 4
                        ? this.options.context.closest(".select_input_container__").find(":input") : this.options.context).vals(val);
                    if(val === undefined) {
                        return rtnVal;
                    }
                } else {
                    N.warn("[N.select.prototype.val]There is no data bound to the N.select component.");
                }

                return this;
            },
            remove : function(val) {
                var opts = this.options;
                if(val !== undefined) {
                    var selectEles = opts.type === 1 || opts.type === 2 ? opts.context.find("option") : opts.context.closest(".select_input_container__").children("label");

                    var selOptEle = opts.type === 1 || opts.type === 2 ? selectEles.filter("[value='" + val + "']") : selectEles.find("input[value='" + val + "']").parent("label");
                    var idx = selOptEle.index();
                    var defSelCnt = selectEles.filter(".select_default__").length;

                    //remove element
                    selOptEle.remove();

                    // remove data
                    if(idx - defSelCnt > -1) {
                        opts.data.splice(idx - defSelCnt, 1);
                    }
                }
                return this;
            },
            reset : function(selFlag) {
                var opts = this.options;
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
            }
        });

        // Form
        var Form = N.form = function(data, opts) {
            this.options = {
                data : N.type(data) === "array" ? N(data) : data,
                row : -1,
                context : null,
                validate : true,
                autoUnbind : false,
                state : null, // add, bind, revert, update
                html : false,
                addTop : true,
                fRules : null,
                vRules : null,
                extObj : null, // extObj : for N.grid
                extRow : -1, // extRow : for N.grid
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
                $.extend(this.options, N.context.attr("ui").form);
            } catch (e) {
                throw N.error("N.form", e);
            }

            if (N.isPlainObject(opts)) {
                // Wraps the global event options in N.config and event options for this component.
                UI.utils.wrapHandler(opts, "form", "onBeforeBindValue");
                UI.utils.wrapHandler(opts, "form", "onBindValue");
                UI.utils.wrapHandler(opts, "form", "onBeforeBind");
                UI.utils.wrapHandler(opts, "form", "onBind");

                //convert data to wrapped set
                opts.data = N.type(opts.data) === "array" ? N(opts.data) : opts.data;

                $.extend(this.options, opts);
                if(N.type(this.options.context) === "string") {
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
                    this.options.InitialData = N.element.toData(this.options.context.find("[id]").not(":button"));
                }
            }

            // set style class name to context element
            this.options.context.addClass("form__");

            if(this.options.revert) {
                this.options.revertData = $.extend({}, this.options.data[this.options.row]);
            }

            // set this instance to context element
            this.options.context.instance("form", this);

            // register this to N.ds for realtime data synchronization
            if(this.options.extObj === null) {
                N.ds.instance(this, true);
            }

            return this;
        };

        $.extend(Form.prototype, {
            data : function(selFlag) { // key name : argument1, argument2... argumentN
                var opts = this.options;
                if(selFlag !== undefined && selFlag === true) {
                    var retData = [];
                    // clone arguments
                    var args = Array.prototype.slice.call(arguments, 0);
                    if(arguments.length > 1) {
                        args[0] = opts.data[opts.row];
                        retData.push(N.json.mapFromKeys.apply(N.json, args));
                    } else {
                        retData.push(opts.data[opts.row]);
                    }
                    return retData;
                } else if(selFlag !== undefined && selFlag === false) {
                        return opts.data;
                } else {
                    return opts.data.get();
                }
            },
            row : function(before) {
                return before !== undefined && before === "before" ? this.options.beforeRow : this.options.row;
            },
            context : function(sel) {
                return sel !== undefined ? this.options.context.find(sel) : this.options.context;
            },
            /**
             * arguments[2]... arguments[n] are the columns to be bound.
             */
            bindEvents : {
                /**
                 * validate
                 */
                validate : function(ele, opts, type, isTextInput) {
                    if(ele.data("validate") !== undefined) {
                        if (type !== "hidden") {
                            N().validator(opts.vRules !== null ? opts.vRules : ele);

                            if(isTextInput && N.isEmptyObject(ele.events("focusout", "form.validate"))) {
                                ele[opts.tpBind ? "tpBind" : "on"]("focusout.form.validate", function() {
                                    var currEle = $(this);
                                    if (!currEle.prop("disabled") && !currEle.prop("readonly") && opts.validate) {
                                        currEle.trigger("validate.validator");
                                    }

                                    currEle = undefined;
                                });
                            }
                        }
                    }
                },
                /**
                 * dataSync
                 */
                dataSync : function(ele, opts, vals, eleType) {
                    var self = this;

                    var eventName = "focusout";
                    if(eleType === "select") {
                        eventName = "change";
                    }

                    if(N.isEmptyObject(ele.events(eventName, "dataSync.form"))) {
                        ele[opts.tpBind ? "tpBind" : "on"](eventName + ".form.dataSync", function(e) {
                            var currEle = $(this);
                            var currVal = currEle.val();

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
                                    N.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, currEle.attr("id"));
                                }
                            }

                            currEle = currVal = undefined;
                        });
                    }

                    eventName = undefined;
                },
                /**
                 * Enter key event
                 */
                enterKey : function(ele, opts) {
                    if(N.isEmptyObject(ele.events("keyup", "dataSync.form"))) {
                         ele[opts.tpBind ? "tpBind" : "on"]("keyup.form.dataSync", function(e) {
                            if ((e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode)) == 13) {
                                e.preventDefault();
                                $(this).trigger("focusout.form.validate");
                                // notify data changed
                                $(this).trigger("focusout.form.dataSync");
                            }
                        });
                    }
                },
                /**
                 * format
                 */
                format : function(ele, opts, type, vals, key) {
                    if(ele.data("format") !== undefined) {
                        if (type !== "password" && type !== "hidden" && type !== "file") {
                            N(opts.data).formatter(opts.fRules !== null ? opts.fRules : ele).format(opts.row);

                            var eventNames = ["focusin", "focusout"];
                            var formats = ["unformat", "format"];
                            var bindMethod = "on";

                            if(opts.tpBind) {
                                eventNames.reverse();
                                formats.reverse();
                                bindMethod = "tpBind";
                            }

                            if(N.isEmptyObject(ele.events(eventNames[0], "form." + formats[0]))) {
                                ele[bindMethod](eventNames[0] + ".form." + formats[0], function() {
                                    var currEle = $(this);
                                    if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || (opts.validate && !currEle.hasClass("validate_false__")))) {
                                        currEle.trigger(formats[0] + ".formatter");
                                    }
                                    currEle = undefined;
                                });
                            }

                            if(N.isEmptyObject(ele.events(eventNames[1], "form." + formats[1]))) {
                                ele[bindMethod](eventNames[1] + ".form." + formats[1], function() {
                                    var currEle = $(this);
                                    if (!currEle.prop("disabled") && !currEle.prop("readonly") && (!opts.validate || (opts.validate && !currEle.hasClass("validate_false__")))) {
                                        currEle.trigger(formats[1] + ".formatter");
                                    }
                                    currEle = undefined;
                                });
                            }

                            eventNames = bindMethod = undefined;
                        }
                    } else {
                        // put value
                        ele.val(vals[key] != null ? String(vals[key]) : "");
                    }
                }
            },
            bind : function(row, data) {
                var opts = this.options;

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
                    opts.data = N.type(data) === "array" ? N(data) : data;
                    if(opts.revert) {
                        opts.revertData = $.extend({}, data[row]);
                    }
                }

                var self = this;
                var vals;
                if (!N.isEmptyObject(opts.data) && !N.isEmptyObject(vals = opts.data[opts.row])) {
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
                    var idContext, rcContext, eles, ele, val, tagName, type;

                    var spltSepa = N.context.attr("core").spltSepa;
                    var cols;
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
                    for ( var key in vals ) {
                        if(cols !== undefined && cols.indexOf(spltSepa + key + spltSepa) < 0) {
                            continue;
                        }

                        if(N.string.isEmpty(key)) {
                            N.warn('[N.form.bind]Within the context, there is an element with an id attribute value of ""(blank).');
                            continue;
                        }
                        ele = idContext.filter("#" + key);
                        // for Material Design
                        if(ele.length > 0 && !N.string.isEmpty(vals[key]) && ele.data("md_textfield_inst")) {
                            ele.data("md_textfield_inst").value = " ";
                        }

                        if(opts.onBeforeBindValue !== null) {
                            var filteredVal = opts.onBeforeBindValue.call(self, ele, vals[key], "bind");
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
                            type = N.string.trimToEmpty(ele.attr("type")).toLowerCase();
                            if (UI.utils.isTextInput(tagName, type)) {
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
                                    var currEle = $(this);
                                    var currEles = opts.context.find("[name='" + currEle.attr("name") + "']");
                                    if(currEles.length === 0) {
                                        currEles = $(this);
                                    }
                                    var currKey = currEle.attr("name");
                                    if(currKey === undefined) {
                                        currKey = currEle.attr("id");
                                    }
                                    var currVals = currEles.vals();

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
                                            N.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, currKey);
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
                            var filteredVal = opts.onBindValue.call(self, ele, vals[key], "bind");
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
            },
            unbind : function(state) {
                var opts = this.options;

                if(opts.unbind && opts.InitialData !== null) {
                    opts.context.removeClass("row_data_changed__");
                    var vals = opts.InitialData;
                    var idContext, rcContext, eles, ele, val, tagName, type;

                    idContext = opts.context.find("[id]:not(:radio, :checkbox)"); // normal elements
                    rcContext = opts.context.find(":radio, :checkbox"); // radio and checkbox elements
                    for ( var key in vals ) {
                        ele = idContext.filter("#" + key);
                        if (ele.length > 0) {
                            ele.removeClass("data_changed__");
                            tagName = ele.get(0).tagName.toLowerCase();
                            type = N.string.trimToEmpty(ele.attr("type")).toLowerCase();
                            if (UI.utils.isTextInput(tagName, type)) {
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
            },
            add : function(data, row) {
                var opts = this.options;
                opts.state = "add";
                if(opts.autoUnbind) {
                    this.unbind();
                }

                if (opts.data === null) {
                    throw new Error("[Form.add]Data is null. you must input data");
                }

                var extractedData = N.element.toData(opts.context.find(":input:not(:button)"));
                if(data != null) {
                    if(N.isNumeric(data)) {
                        row = data;
                        data = undefined;
                    } else {
                        $.extend(extractedData, data);
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

                // row index of N.grid's form is 0;
                if(opts.extObj !== null) {
                    opts.data = $(opts.data[opts.row]);
                    opts.row = 0;

                    // for scroll paging
                    // just +1 is inappropriate on android 4.4.2 webkit
                    var rowEleLength = opts.extObj.options.context.find(opts.extObj instanceof N.grid ? ">tbody" : ">li").length;
                    var pagingSize = opts.extObj.options.scrollPaging.size;
                    var rest = rowEleLength % pagingSize;
                    opts.extObj.options.scrollPaging.idx = parseInt(rowEleLength / pagingSize) * pagingSize - pagingSize + rest;

                    // for rowHandlerBeforeBind of N.list and N.grid
                    if(opts.extObj.options.rowHandlerBeforeBind !== null) {
                        opts.extObj.options.rowHandlerBeforeBind.call(opts.extObj, opts.extRow, opts.context, opts.data[opts.row]);
                    }
                }

                // Set revert data
                if(opts.revert) {
                    opts.revertData = $.extend({}, opts.data[opts.row]);
                }

                this.bind(opts.row, opts.state);

                N.ds.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);

                return this;
            },
            remove : function() {
                var opts = this.options;

                if (opts.data[opts.row].rowStatus === "insert") {
                    opts.data.splice(opts.row, 1);
                    opts.row = -1;
                    N.ds.instance(opts.extObj !== null ? opts.extObj : this).notify();

                    this.unbind();
                } else {
                    opts.data[opts.row].rowStatus = "delete";
                    opts.context.addClass("row_data_deleted__");
                    N.ds.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);
                }

                return this;
            },
            revert : function() {
                var opts = this.options;
                if(!opts.revert) {
                    throw N.error("[N.form.prototype.revert]Can not revert. N.form's revert option value is false");
                }

                opts.state = "revert";

                for(var k in opts.data[opts.row]){
                    delete opts.data[opts.row][k];
                }
                $.extend(opts.data[opts.row], opts.data[opts.row], opts.revertData);
                opts.data[opts.row]._isRevert = true;

                this.bind(opts.row, opts.state);

                N.ds.instance(opts.extObj !== null ? opts.extObj : this).notify(opts.extRow > -1 ? opts.extRow : opts.row);
                if(opts.data[opts.row]._isRevert !== undefined) {
                    try {
                        delete opts.data[opts.row]._isRevert
                    } catch(e) {}
                }
                return this;
            },
            validate : function() {
                var opts = this.options;
                var eles = opts.context.find(":input:not(:radio, :checkbox), :radio.select_template__, :checkbox.select_template__, .mdc-text-field"); // for Material Design
                if(opts.validate) {
                    eles.not(".validate_false__").trigger("unformat.formatter");
                } else {
                    eles.trigger("unformat.formatter");
                }

                eles.trigger("validate.validator");
                eles.not(".validate_false__").trigger("format.formatter");

                return eles.filter(".validate_false__").length <= 0;
            },
            val : function(key, val, notify) {
                var opts = this.options;
                var vals = opts.data[opts.row];

                if(val === undefined) {
                    return vals[key];
                }

                var eles, ele, val, tagName, type;
                var self = this;
                var rdonyFg = false;
                var dsabdFg = false;
                var ele = opts.context.find("#" + key);
                // for Material Design
                if(ele.length > 0 && !N.string.isEmpty(vals[key]) && ele.data("md_textfield_inst")) {
                    ele.data("md_textfield_inst").value = " ";
                }

                if(opts.onBeforeBindValue !== null) {
                    var filteredVal = opts.onBeforeBindValue.call(self, ele, vals[key], "val");
                    if(filteredVal !== undefined) {
                        vals[key] = filteredVal;
                    }
                }

                if (ele.length > 0) {
                    tagName = ele.get(0).tagName.toLowerCase();
                    type = N.string.trimToEmpty(ele.attr("type")).toLowerCase();

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

                        if (UI.utils.isTextInput(tagName, type)) {
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
                                N.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, key);
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
                                N.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, key);
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
                            var a = eles.instance("alert", function() {
                                this.remove()
                            }).removeData("alert__");

                            // rebind for data sync and validate, format, etc. realted events bind
                            if($(eles.get(0)).events("select", "dataSync.form") === undefined) {
                                vals[$(eles.get(0)).attr("id")] = null;
                                self.bind(undefined, undefined, key);
                            }

                            // select value
                            eles.vals(val);

                            if(notify !== false) {
                                // dataSync & add data changed flag
                                $(eles.get(0)).trigger("select.form.dataSync");
                            } else {
                                // add data changed flag
                                $(eles.get(0)).addClass("data_changed__");
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
                        N.ds.instance(opts.extObj !== null ? opts.extObj : self).notify(opts.extRow > -1 ? opts.extRow : opts.row, key);
                    }
                }

                // add data changed flag
                if(opts.data[opts.row].rowStatus !== "insert"
                    && opts.data[opts.row].rowStatus !== "delete"
                    && !opts.context.hasClass("row_data_changed__")) {
                    opts.context.addClass("row_data_changed__");
                }

                if(opts.onBindValue !== null) {
                    var filteredVal = opts.onBindValue.call(self, ele, vals[key], "val");
                    if(filteredVal !== undefined) {
                        vals[key] = filteredVal;
                    }
                }

                return this;
            },
            update : function(row, key) {
                var opts = this.options;

                opts.state = "update"

                if (key === undefined) {
                    this.bind(row, opts.state);
                } else {
                    if(row === this.row()) {
                        this.val(key, opts.data[row][key], false);
                        var changedEle = opts.context.find("#" + key + ":not(:radio, :checkbox)");
                        if(changedEle.length === 0) {
                            changedEle = opts.context.find("[name='" + key + "']").filter(":radio, :checkbox");
                        }
                        if(changedEle.length === 0) {
                            changedEle = opts.context.find("#" + key).filter(":radio, :checkbox");
                        }
                        N.element.dataChanged(changedEle);
                    }
                }
                return this;
            }
        });

        // List
        var List = N.list = function(data, opts) {
            this.options = {
                data : N.type(data) === "array" ? N(data) : data,
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
                selectWithCheck : false,
                unselect : true,
                multiselect : false,
                checkAll : null, // selector
                checkAllTarget : null, // selector
                checkSingleTarget : null,
                checkWidthSelect : false,
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
                $.extend(true, this.options, N.context.attr("ui").list);
            } catch (e) {
                throw N.error("N.list", e);
            }

            if (N.isPlainObject(opts)) {
                // Wraps the global event options in N.config and event options for this component.
                UI.utils.wrapHandler(opts, "list", "onBeforeSelect");
                UI.utils.wrapHandler(opts, "list", "onSelect");
                UI.utils.wrapHandler(opts, "list", "onBind");

                //convert data to wrapped set
                opts.data = N.type(opts.data) === "array" ? N(opts.data) : opts.data;

                $.extend(true, this.options, opts);

                //for scroll paging limit
                this.options.scrollPaging.limit = this.options.scrollPaging.size;

                if(N.type(this.options.context) === "string") {
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
                UI.iteration.select.call(this, "list");
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
                UI.iteration.checkAll.call(this, "list");
            } else {
                if(this.options.checkSingleTarget !== null) {
                    // set function for check single checkbox in list
                    UI.iteration.checkSingle.call(this, "list");
                }
            }

            // set this instance to context element
            this.options.context.instance("list", this);

            // register this to N.ds for realtime data synchronization
            N.ds.instance(this, true);

            return this;
        };

        $.extend(List, {
            createScroll : function() {
                var opts = this.options;

                opts.context.css({
                    "margin" : "0"
                });

                //Create list header
                var scrollbarWidth = N.browser.scrollbarWidth();

                //Create list body
                var contextWrapEle = opts.context.wrap('<div class="context_wrap__"/>').parent().css({
                    "height" : String(opts.height) + "px",
                    "overflow-y" : "scroll",
                    "margin-left" : "-1px"
                });

                // for IE
                if(N.browser.is("ie")) {
                    contextWrapEle.css("overflow-x", "hidden");
                }

                if(opts.windowScrollLock) {
                    N.event.windowScrollLock(contextWrapEle);
                }

                // Scroll paging
                var self = this;
                var defSPSize = opts.scrollPaging.limit;
                var rowEleLength;
                UI.scroll.paging.call(self, contextWrapEle, defSPSize, rowEleLength, "> li", "list.bind");

                // Vertical height resizing
                if(opts.vResizable) {
                    List.vResize.call(this, contextWrapEle);
                }
            },
            vResize : function(contextWrapEle) {
                var pressed = false;
                var vResizable = $('<div class="v_resizable__"></div>').css({
                    "text-align": "center",
                    "cursor": "n-resize",
                    "margin-bottom": contextWrapEle.css("margin-bottom")
                });
                contextWrapEle.css("margin-bottom", "0");

                var currHeight, contextWrapOffset;
                var eventNameSpace = ".list.vResize";
                UI.draggable.events.call(vResizable, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) { // start
                    contextWrapOffset = contextWrapEle.offset();
                }, function(e, tabContainerEle_, pageX, pageY) { // move
                    currHeight = (pageY - contextWrapOffset.top) + "px";
                    contextWrapEle.css({
                        "height" : currHeight,
                        "max-height" : currHeight
                    });
                });

                contextWrapEle.after(vResizable);
            }
        });

        $.extend(List.prototype, {
            data : function(rowStatus) { // key name : argument1, argument2... argumentN
                var opts = this.options;

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
                        var retData = [];

                        // clone arguments
                        var args = Array.prototype.slice.call(arguments, 0);

                        var rowEles = this.contextEle.find(">li.form__");
                        rowEles.filter(".list_selected__").each(function() {
                            var thisEle = $(this);
                            if(arguments.length > 1) {
                                args[0] = opts.data[rowEles.index(this)];
                                retData.push(N.json.mapFromKeys.apply(N.json, args));
                            } else {
                                retData.push(opts.data[rowEles.index(this)]);
                            }
                        });
                        return retData;
                    }
                } else if(rowStatus === "checked") {
                    var opts = opts;
                    var retData = [];

                    // clone arguments
                    var args = Array.prototype.slice.call(arguments, 0);

                    var rowEles = this.contextEle.find(">li.form__");
                    rowEles.find(opts.checkAllTarget||opts.checkSingleTarget).filter(":checked").each(function() {
                        var thisEle = $(this);
                        if(arguments.length > 1) {
                            args[0] = opts.data[rowEles.index(thisEle.closest("li.form__"))];
                            retData.push(N.json.mapFromKeys.apply(N.json, args));
                        } else {
                            retData.push(opts.data[rowEles.index(thisEle.closest("li.form__"))]);
                        }
                    });
                    return retData;
                } else {
                    if(arguments.length > 1) {
                        var args = Array.prototype.slice.call(arguments, 0);

                        return opts.data.datafilter(function(data) {
                            return data.rowStatus === rowStatus;
                        }).map(function() {
                            args[0] = this;
                            return N.json.mapFromKeys.apply(N.json, args);
                        }).get();
                    } else {
                        return opts.data.datafilter(function(data) {
                            return data.rowStatus === rowStatus;
                        }).get();
                    }
                }
            },
            context : function(sel) {
                return sel !== undefined ? this.options.context.find(sel) : this.options.context;
            },
            contextBodyTemplate : function(sel) {
                return sel !== undefined ? this.tempRowEle.find(sel) : this.tempRowEle;
            },
            select : function(row, isAppend) {
                var opts = this.options;
                if(!opts.select && !opts.multiselect) {
                    N.warn("[N.list.select]The \"select\" or \"multiselect\" option is disabled. To use this method, set the value of the \"select\" or \"multiselect\" option to true.");
                    return false;
                }
                if(row === undefined) {
                    var rowEles = this.contextEle.find(">li.form__");
                    var rtnArr = rowEles.filter(".list_selected__").map(function() {
                        return rowEles.index(this);
                    }).get();
                    return rtnArr;
                } else {
                    if(N.type(row) !== "array") {
                        row = [row];
                    }

                    var self = this;
                    var selRowEle;

                    if(!isAppend) {
                        self.contextEle.find(">li.list_selected__").removeClass("list_selected__");
                    }
                    $(row).each(function() {
                        selRowEle = self.contextEle.find(">li" + (self.options.data.length > 0 ? ".form__" : "") +":eq(" + String(this) + ")");
                        if(selRowEle.hasClass("list_selected__")) {
                            selRowEle.removeClass("list_selected__");
                        }
                        selRowEle.trigger("click.list");
                    });

                    if(opts.selectScroll) {
                        scrollTop = (row[row.length - 1] * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
                        if(scrollTop < 0) {
                            scrollTop = 0;
                        }
                        opts.context.parent(".context_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing');
                    }

                    return this;
                }
            },
            check : function(row, isAppend) {
                var opts = this.options;
                if(row === undefined) {
                    var rowEles = this.contextEle.find(">li");
                    return rowEles.find(opts.checkAllTarget || opts.checkSingleTarget).filter(":checked").map(function () {
                        return rowEles.index(N(this).closest("li.form__"));
                    }).get();
                } else {
                    if(N.type(row) !== "array") {
                        row = [row];
                    }

                    var self = this;
                    var checkboxEle;
                    if(!isAppend) {
                        self.contextEle.find(">li").find((opts.checkAllTarget||opts.checkSingleTarget) + ":checked").prop("checked", false);
                    }
                    $(row).each(function() {
                        checkboxEle = self.contextEle.find(">li").find(opts.checkAllTarget||opts.checkSingleTarget).eq(this);
                        if(checkboxEle.is(":checked")) {
                            checkboxEle.prop("checked", false);
                        }
                        checkboxEle.trigger("click.list");
                    });

                    if(opts.checkScroll) {
                        var selRowEle = checkboxEle.closest("li.form__");
                        scrollTop = (row[row.length - 1] * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
                        if(scrollTop < 0) {
                            scrollTop = 0;
                        }
                        opts.context.parent(".context_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing');
                    }

                    return this;
                }
            },
            /**
             * callType arguments is call type about scrollPaging(internal) or data filter(internal) or data append(external)
             * callType : "append", "list.bind"
             */
            bind : function(data, callType) {
                var opts = this.options;

                if(!opts.isBinding) {
                    if(opts.data && data && callType === "append") {
                        opts.scrollPaging.size = 0;
                        // Merge data to binded data;
                        opts.scrollPaging.idx = opts.data.length - 1;
                        $.merge(opts.data, data);
                    } else {
                        opts.scrollPaging.size = opts.scrollPaging.defSize;
                        // rebind new data
                        if(data) {
                            opts.data = N.type(data) === "array" ? N(data) : data;
                        }
                    }

                    if(opts.checkAll !== null) {
                        $(opts.checkAll).prop("checked", false);
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

                        var i = opts.scrollPaging.idx;
                        var limit;
                        if(opts.height === 0 || opts.scrollPaging.size === 0 || (callType === "append" && data.length > 0 && data.length <= opts.scrollPaging.size)) {
                            limit = opts.data.length;
                        } else {
                            limit = Math.min(opts.scrollPaging.limit, opts.data.length);
                        }

                        var delay = opts.createRowDelay;
                        var lastIdx;

                        UI.iteration.render.call(this, i, limit, delay, lastIdx, callType);

                        if(opts.appendScroll && callType === "append") {
                            opts.context.parent(".context_wrap__").stop().animate({
                                "scrollTop" : opts.context.parent(".context_wrap__").prop("scrollHeight")
                            }, 300, 'swing');
                        }
                    } else {
                        //remove lis in list body area
                        opts.context.find(">li").remove();
                        opts.context.append('<li class="empty__">' +
                                N.message.get(opts.message, "empty") + '</li>');

                        if(opts.onBind !== null && callType !== "list.update") {
                            opts.onBind.call(this, opts.context, opts.data, true, true);
                        }
                    }
                } else {
                    var self = this;
                    var args = arguments;
                    opts.context.queue("bind", function() {
                        self.bind.apply(self, args);
                    });
                }
                return this;
            },
            add : function(data, row) {
                var opts = this.options;
                if (opts.context.find(">li.empty__").length > 0) {
                    opts.context.find(">li").remove();
                }
                var tempRowEleClone = this.tempRowEle.clone(true, true);

                if(N.isNumeric(data)) {
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
                    var selRowEle = opts.context.find(">li:eq(" + row + ")");
                    var scrollTop;

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
                                $(this).find(">ul>li:eq(" + row + ")").trigger("click.list");
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

                // for new row data bind, use N.form
                var form = opts.data.form({
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
                            $(this).find("> ul > li:" + (opts.addTop ? "first" : "last")).trigger("click.list");
                        }
                    });
                }

                tempRowEleClone = undefined;

                return this;
            },
            remove : function(row) {
                var opts = this.options;
                if(row !== undefined) {
                    if(N.type(row) !== "array") {
                        row = [row];
                    }
                    $(row.sort().reverse()).each(function(i, row) {
                        if (opts.data[this] === undefined) {
                            throw N.error("[N.list.prototype.remove]Row index is out of range");
                        }
                        if (opts.data[this].rowStatus === "insert") {
                            opts.data.splice(this, 1);
                            opts.context.find(">li:eq(" + row + ")").remove();

                            // for scroll paging
                            // just +1 is inappropriate on android 4.4.2 webkit
                            var rowEleLength = opts.context.find(">li").length;
                            var pagingSize = opts.scrollPaging.size;
                            var rest = rowEleLength % pagingSize;
                            opts.scrollPaging.idx = parseInt(rowEleLength / pagingSize) * pagingSize - pagingSize + rest;
                        } else {
                            opts.data[this].rowStatus = "delete";
                            opts.context.find(">li:eq(" + row + ")").addClass("row_data_deleted__");
                        }
                    });
                }

                N.ds.instance(this).notify();
                return this;
            },
            revert : function(row) {
                var opts = this.options;
                if(!opts.revert) {
                    throw N.error("[N.form.prototype.revert]Can not revert. N.form's revert option value is false");
                }

                var self = this;

                if(row !== undefined) {
                    if(N.type(row) !== "array") {
                        row = [row];
                    }
                    $(row).each(function() {
                        var i = this;
                        var context = opts.context.find(">li:eq(" + String(this) + ")");
                        var form = context.instance("form");
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
                            var i = this.options.extRow;
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
            },
            validate : function(row) {
                var opts = this.options;
                var valiRslt = true;
                if(row !== undefined) {
                    valiRslt = opts.context.find(">li:eq(" + String(row) + ")").instance("form").validate();
                } else {
                    var rowStatus;
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
                    var valiLastTbody = opts.context.find(".validate_false__:last").closest("li.form__");
                    opts.context.parent(".context_wrap__").stop().animate({
                        "scrollTop" : opts.context.parent(".context_wrap__").scrollTop() + valiLastTbody.position().top - opts.height + (valiLastTbody.outerHeight() * 2)
                    }, 300, 'swing');
                }

                return valiRslt;
            },
            val : function(row, key, val) {
                if(val === undefined) {
                    return this.options.data[row][key];
                }
                var inst = this.options.context.find(">.form__:eq(" + String(row) + ")").instance("form");
                if(inst) {
                    inst.val(key, val);
                } else {
                    if(this.options.data[row]) {
                        this.options.data[row][key] = val;
                    } else {
                        throw N.error("[N.list.prototype.val]There is no row data that is " + row + " index");
                    }
                }
                return this;
            },
            move : function(fromRow, toRow) {
                UI.iteration.move.call(this, fromRow, toRow, "list");

                return this;
            },
            copy : function(fromRow, toRow) {
                UI.iteration.copy.call(this, fromRow, toRow, "list");

                return this;
            },
            update : function(row, key) {
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
            }
        });

        // Grid
        var Grid = N.grid = function(data, opts) {
            this.options = {
                data : N.type(data) === "array" ? N(data) : data,
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
                selectWithCheck : false,
                unselect : true,
                multiselect : false,
                checkAll : null, // selector
                checkAllTarget : null, // selector
                checkSingleTarget : null, // selector
                checkWidthSelect : false,
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
                $.extend(true, this.options, N.context.attr("ui").grid);
            } catch (e) {
                throw N.error("N.grid", e);
            }

            if (N.isPlainObject(opts)) {
                // Wraps the global event options in N.config and event options for this component.
                UI.utils.wrapHandler(opts, "grid", "onBeforeSelect");
                UI.utils.wrapHandler(opts, "grid", "onSelect");
                UI.utils.wrapHandler(opts, "grid", "onBind");

                //convert data to wrapped set
                opts.data = N.type(opts.data) === "array" ? N(opts.data) : opts.data;

                $.extend(true, this.options, opts);

                //for scroll paging limit
                this.options.scrollPaging.limit = this.options.scrollPaging.size;

                if(N.type(this.options.context) === "string") {
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
                UI.iteration.select.call(this, "grid");
            }

            //remove colgroup when the resizable option is true
            if(this.options.resizable) {
                Grid.removeColgroup.call(this);
            }

            // view details
            if(this.options.more) {
                Grid.more.call(this);
            }

            // fixed header
            if(this.options.height > 0) {
                // fixed header
                Grid.fixHeader.call(this);
            }

            // create table cell element map
            this.tableMap = Grid.tableMap.call(this);

            // set tbody cell's id attribute into th cell in thead
            Grid.setTheadCellInfo.call(this);

            // set this.thead
            if (this.options.height > 0) {
                this.thead = this.options.context.closest(".grid_wrap__").find(">.thead_wrap__>table>thead");
            } else {
                this.thead = this.options.context.find(">thead");
            }

            // fixed column
            if(this.options.height === 0) {
                Grid.fixColumn.call(this);
            }

            // set context element
            this.contextEle = this.options.context;
            if(this.options.height > 0) {
                this.contextEle = this.options.context.closest("div.tbody_wrap__ > .grid__");
            }

            // set rowspan column info
            this.rowSpanIds = this.thead.find("th:regexp(data:rowspan,true)").map(function() {
                return $(this).data("id");
            });

            // set function for check all checkbox in list
            if(this.options.checkAll !== null && this.options.checkAllTarget !== null) {
                UI.iteration.checkAll.call(this, "grid");
            } else {
                if(this.options.checkSingleTarget !== null) {
                    // set function for check single checkbox in list
                    UI.iteration.checkSingle.call(this, "grid");
                }
            }

            // sortable, v(ertical)Resizable
            if(this.options.sortable) {
                Grid.sort.call(this);
            }

            // resizable column width
            if(this.options.resizable) {
                Grid.resize.call(this);
            }

            // data filter
            if(this.options.filter || this.thead.find("> tr th[data-filter='true']").length > 0) {
                if(this.options.filter) {
                    this.thead.find("> tr th").attr("data-filter", "true");
                }
                Grid.dataFilter.call(this);
            }

            if(this.options.pastiable) {
                Grid.paste.call(this);
            }

            // set this instance to context element
            this.options.context.instance("grid", this);

            // register this to N.ds for realtime data synchronization
            N.ds.instance(this, true);

            return this;
        };

        $.extend(Grid, {
            /**
             * Convert HTML Table To 2D Array
             * Reference from CHRIS WEST'S BLOG : http://cwestblog.com/2016/08/21/javascript-snippet-convert-html-table-to-2d-array/
             */
            tableCells : function(tbl, opt_cellValueGetter) {
                var rows = tbl.find(">tr");
                opt_cellValueGetter = opt_cellValueGetter || function(td) { return td.textContent || td.innerText; };
                var twoD = [];
                for (var rowCount = rows.length, rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                    twoD.push([]);
                }
                for (var rowIndex = 0, tr; rowIndex < rowCount; rowIndex++) {
                    var tr = rows[rowIndex];
                    for (var colIndex = 0, colCount = tr.cells.length, offset = 0; colIndex < colCount; colIndex++) {
                        var td = tr.cells[colIndex], text = opt_cellValueGetter(td, colIndex, rowIndex, tbl);
                        while (twoD[rowIndex].hasOwnProperty(colIndex + offset)) {
                            offset++;
                        }
                        for (var i = 0, colSpan = parseInt(td.colSpan, 10) || 1; i < colSpan; i++) {
                            for (var j = 0, rowSpan = parseInt(td.rowSpan, 10) || 1; j < rowSpan; j++) {
                                $(td).addClass("col_" + (colIndex + offset + i) + "__");
                                if(twoD[rowIndex + j] !== undefined) {
                                    twoD[rowIndex + j][colIndex + offset + i] = td;
                                } else {
                                    N.warn("[N.grid.tableCells]The rowspan property of table is defined incorrectly.");
                                }
                            }
                        }
                    }
                }
                return twoD;
            },
            tableMap : function() {
                var opts = this.options;

                var colgroup = [];
                var thead;
                var tfoot;

                if(opts.context.find("> colgroup").length > 0) {
                    colgroup.push(opts.context.find("> colgroup > col").each(function(i) {
                        $(this).addClass("col_" + String(i) + "__");
                    }).get());
                }

                if(opts.height > 0) {
                    if(opts.context.find("> colgroup").length > 0) {
                        colgroup.unshift(opts.context.closest(".grid_wrap__").find(">.thead_wrap__>table>colgroup>col").each(function(i) {
                            $(this).addClass("col_" + String(i) + "__");
                        }).get());
                        colgroup.push(opts.context.closest(".grid_wrap__").find(">.tfoot_wrap__>table>colgroup>col").each(function(i) {
                            $(this).addClass("col_" + String(i) + "__");
                        }).get());
                    }
                    thead = Grid.tableCells(opts.context.closest(".grid_wrap__").find(">.thead_wrap__>table>thead"));
                    thead = thead.concat(Grid.tableCells(opts.context.closest(".grid_wrap__").find("> .tbody_wrap__>table>thead")));
                    tfoot = Grid.tableCells(opts.context.closest(".grid_wrap__").find(">.tfoot_wrap__>table>tfoot"));
                } else {
                    thead = Grid.tableCells(opts.context.find("> thead"));
                    tfoot = Grid.tableCells(opts.context.find("> tfoot"));
                }

                return {
                    colgroup : colgroup,
                    thead : thead,
                    tbody : Grid.tableCells(this.tempRowEle),
                    tfoot : tfoot
                };
            },
            setTheadCellInfo : function() {
                var opts = this.options;
                var tableMap = this.tableMap;
                if(tableMap.thead.length === 0) {
                    return;
                }
                var nextCnt = 0;
                $(tableMap.tbody).each(function(i, cells) {
                    $(cells).each(function(j, cell) {
                        if(tableMap.thead[i+nextCnt] === undefined || tableMap.thead[i+nextCnt][j] === undefined) {
                            return false;
                        }
                        var theadCell = $(tableMap.thead[i+nextCnt][j]);
                        var tbodyCell = $(cell);

                        if(nextCnt === 0 && tbodyCell.attr("colspan") !== theadCell.attr("colspan")) {
                            theadCell = $(tableMap.thead[i+1][j]);
                        }

                        if(tbodyCell.attr("colspan") === theadCell.attr("colspan")) {
                            var id = tbodyCell.attr("id");
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
            },
            removeColgroup : function() {
                var opts = this.options;
                if(opts.context.find("colgroup").length > 0) {
                    var theadMap = Grid.tableCells(opts.context.find("> thead"));
                    if(opts.height > 0) {
                        var tfootMap = Grid.tableCells(opts.context.find("> tfoot"));
                    }

                    opts.context.find("colgroup>col").each(function(i, colEle) {
                        $(theadMap).each(function(j, rowEles) {
                            if($(rowEles[i]).attr("colspan") === undefined) {
                                $(rowEles[i]).css("width", colEle.style.width).removeAttr("scope");
                            }
                        })

                        if(opts.height > 0) {
                            $(tfootMap).each(function(j, rowEles) {
                                if($(rowEles[i]).attr("colspan") === undefined) {
                                    $(rowEles[i]).css("width", colEle.style.width).removeAttr("scope");
                                }
                            })
                        }
                    }).parent().remove();
                }
            },
            fixColumn : function() {
                var opts = this.options;
                var self = this;

                if(opts.fixedcol > 0) {
                    opts.context.width("auto").css({
                        "table-layout" : "fixed",
                        "width" : self.thead.find("> tr > th").toArray().splice(opts.fixedcol).reduce(function(sum, ele) {
                            return sum + parseInt(window.getComputedStyle(ele,null).getPropertyValue("width"));
                        }, 0)
                    });

                    var gridWrap = opts.context.wrap($("<div/>", {
                        "css" : { "overflow-x" : (N.browser.is("ios") ? "scroll" : "auto") },
                        "class" : "grid_wrap__"
                    })).parent("div");

                    var gridContainer = gridWrap.wrap($("<div/>", {
                        "class" : "grid_container__"
                    })).parent("div");

                    if(opts.misc.fixedcolRootContainer === null) {
                        gridContainer.css("position", "relative");
                    } else {
                        opts.context.closest(opts.misc.fixedcolRootContainer).css("position", "relative");
                    }

                    var theadTrHeight = self.thead.find("> tr").height();
                    self.thead.find("> tr").height(theadTrHeight);

                    var cellLeft = 0;
                    var leftMargin = 0;
                    for(var i=0;i<opts.fixedcol;i++) {
                        var targetTheadCellEle;
                        var targetTbodyCellEle;

                        targetTheadCellEle = $(self.tableMap.thead).map(function() {
                            return this[i];
                        }).addClass("grid_head_fixed__");
                        targetTbodyCellEle = $(self.tableMap.tbody).map(function() {
                            return this[i];
                        }).addClass("grid_body_fixed__");

                        var cellWidth = targetTheadCellEle.outerWidth();
                        var borderLeftWidth = parseInt(targetTheadCellEle.css("border-left-width"));
                        var theadBorderTopWidth = parseInt(targetTheadCellEle.css("border-top-width"));
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
                            $(self.tableMap.colgroup).each(function() {
                                if(i === 0) {
                                    $(this[i]).width(0);
                                } else {
                                    $(this[i]).hide();
                                }
                            });
                        }
                    }

                    gridWrap.css("margin-left", leftMargin);
                }
            },
            fixHeader : function() {
                var opts = this.options;

                opts.context.css({
                    "table-layout" : "fixed",
                    "margin" : "0"
                });

                var sampleCell = opts.context.find(">tbody td:eq(0)");
                var borderLeftWidth = sampleCell.css("border-left-width");
                if(parseInt(borderLeftWidth) < 1) {
                    borderLeftWidth = "1px"; // for IE
                }
                var borderLeft = borderLeftWidth + " " + sampleCell.css("border-left-style") + " " + sampleCell.css("border-left-color");
                var borderBottomWidth = sampleCell.css("border-bottom-width");
                if(parseInt(borderBottomWidth) < 1) {
                    borderBottomWidth = "1px"; // for IE
                }
                var borderBottom = borderBottomWidth + " " + sampleCell.css("border-bottom-style") + " " + sampleCell.css("border-bottom-color");

                // Root grid container
                var gridWrap = opts.context.wrap('<div class="grid_wrap__"/>').parent();
                gridWrap.css({
                    "border-left" : borderLeft
                });

                var scrollbarWidth = N.browser.scrollbarWidth();

                // When opts.context overflows gridWrap
                // if gridWrap.width() is 0, opts.context's display style is none or invisible element.
                if(gridWrap.width() > 0 && opts.context.width() > gridWrap.width()) {
                    gridWrap.width(opts.context.width() + scrollbarWidth);
                }

                //Create grid header
                var contextClone = opts.context.clone(true, true);
                var theadClone = opts.context.find("> thead").clone();
                contextClone.find(">thead").remove();
                contextClone.find(">tbody").remove();
                contextClone.find(">tfoot").remove();
                contextClone.append(opts.context.find("> thead"));
                var theadWrap = contextClone.wrap('<div class="thead_wrap__"/>').parent().css({
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
                var contextWrapEle = opts.context.wrap('<div class="tbody_wrap__"/>').parent().css({
                    "height" : String(opts.height) + "px",
                    "overflow-y" : "scroll",
                    "overflow-x" : "hidden",
                    "margin-left" : "-1px"
                });

                if(opts.context.find("> tfoot").length === 0) {
                    contextWrapEle.css("border-bottom", borderBottom);
                }

                if(opts.windowScrollLock) {
                    N.event.windowScrollLock(contextWrapEle);
                }

                // Scroll paging
                var self = this;
                var defSPSize = opts.scrollPaging.limit;
                var rowEleLength;
                UI.scroll.paging.call(self, contextWrapEle, defSPSize, rowEleLength, "> tbody", "grid.bind");

                // Create grid footer
                var tfootWrap;
                if(opts.context.find("> tfoot").length > 0) {
                    var contextClone = opts.context.clone(true, true);
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
                    Grid.vResize.call(this, gridWrap, contextWrapEle, tfootWrap);
                }
            },
            vResize : function(gridWrap, contextWrapEle, tfootWrap) {
                var pressed = false;
                var vResizable = $('<div class="v_resizable__"></div>').css({
                    "text-align": "center",
                    "cursor": "n-resize",
                    "margin-bottom": gridWrap.css("margin-bottom")
                });
                gridWrap.css("margin-bottom", "0");

                var currHeight, contextWrapOffset, tfootHeight = 0;
                var eventNameSpace = ".grid.vResize";
                UI.draggable.events.call(vResizable, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) { // start
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


                        $(document).on("dragstart.grid.vResize selectstart.grid.vResize", function() {
                            return false;
                        });
                        pressed = true;

                        $(window.document).on("mousemove.grid.vResize touchmove.grid.vResize", function(e) {
                            var mte;
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

                        $(window.document).on("mouseup.grid.vResize touchend.grid.vResize", function(e) {
                            $(document).off("dragstart.grid.vResize selectstart.grid.vResize mousemove.grid.vResize touchmove.grid.vResize mouseup.grid.vResize touchend.grid.vResize");
                            pressed = false;
                        });
                    }
                });

                gridWrap.after(vResizable);
            },
            more : function() {
                var opts = this.options;
                var self = this;

                if(opts.more === true) {
                    opts.more = self.tempRowEle.find("[id]").map(function() {
                        return $(this).attr("id");
                    }).get();
                }


                // Append col element to colgroup
                if(opts.context.find("> colgroup").length > 0) {
                    opts.context.find("> colgroup").append('<col class="grid_more_colgroup_col__">')
                }

                // Column for hide and show button.
                var theadCol;
                var theadRowCnt = Grid.tableCells(opts.context.find(">thead")).length;
                if(theadRowCnt > 0) {
                    theadCol = $('<th></th>').addClass("grid_more_thead_col__");
                    if(theadRowCnt > 1) {
                        theadCol.attr("rowspan", String(theadRowCnt));
                    }
                }
                // Hide and show button.
                var colShowHideBtn = $('<a href="#" title="' + N.message.get(opts.message, "showHide") + '"><span></span></a>').addClass("grid_col_show_hide_btn__").appendTo(theadCol);
                // Append column to tr in thead
                if(theadCol !== undefined) {
                    opts.context.find(">thead > tr:first").append(theadCol);
                }

                // Column for detail popup button.
                var tbodyCol;
                var tbodyRowCnt = Grid.tableCells(this.tempRowEle).length;
                if(tbodyRowCnt > 0) {
                    tbodyCol = $('<td></td>').addClass("grid_more_tbody_col__");
                    if(tbodyRowCnt > 1) {
                        tbodyCol.attr("rowspan", String(tbodyRowCnt));
                    }
                }
                // Detail popup button.
                var detailBtn = $('<a href="#" title="' + N.message.get(opts.message, "more") + '"><span></span></a>').addClass("grid_more_btn__").appendTo(tbodyCol);
                // Append column to tr in tbody
                if(tbodyCol !== undefined) {
                    self.tempRowEle.find("> tr:first").append(tbodyCol);
                }

                // Empty column in tfoot
                var tfootCol;
                var tfootRowCnt = Grid.tableCells(opts.context.find(">tfoot")).length;
                if(tfootRowCnt > 0) {
                    tfootCol = $('<td></td>').addClass("grid_more_tfoot_col__")
                    if(tfootRowCnt > 1) {
                        tfootCol.attr("rowspan", String(tfootRowCnt));
                    }
                }
                // Append column to tr in tfoot
                if(tfootCol !== undefined) {
                    opts.context.find(">tfoot > tr:first").append(tfootCol);
                }

                var excludeThClasses = ".btn_data_filter_full__, .data_filter_panel__, .btn_data_filter__, .resize_bar__, .sortable__";

                // Hide and show panel
                var panel = $('<div class="grid_more_panel__ hidden__">'
                        +   '<div class="grid_more_checkall_box__"><label><input type="checkbox">' + N.message.get(opts.message, "selectAll") + '<span class="grid_more_total_cnt__"></span></label></div>'
                        +   '<ul class="grid_more_col_list__"></ul>'
                        + '</div>');
                colShowHideBtn.after(panel);

                var gridMoreColList;

                // Hide and show panel's checkbox click event
                panel.find(".grid_more_checkall_box__ :checkbox").on("click.grid.more", function() {
                    var thisEle = $(this);
                    if(thisEle.is(":checked")) {
                        gridMoreColList.find("input[name='hideshow']:not(':checked')").trigger("click");
                    } else {
                        gridMoreColList.find("input[name='hideshow']:checked").trigger("click");
                    }
                });
                panel.css("position", "absolute");

                var calibDialogItems = function(currColShowHideBtn, currPanel) {
                    currPanel.css({
                        "left" : (currColShowHideBtn.position().left - currPanel.outerWidth() + currColShowHideBtn.outerWidth()) + "px"
                    });
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

                    var thisBtn = $(this);
                    var panel = thisBtn.next(".grid_more_panel__ ");

                    if(self.tableMap.thead.length > 0 && gridMoreColList === undefined) {
                        gridMoreColList = panel.find(".grid_more_col_list__");
                        gridMoreColList.on("click.grid.more", "input[name='hideshow']", function() {
                            var thisEle = $(this);
                            if(!thisEle.is(":checked")) {
                                self.hide(parseInt(thisEle.val()));
                            } else {
                                self.show(parseInt(thisEle.val()));
                            }
                            calibDialogItems(thisBtn, panel);
                        });

                        $(self.tableMap.thead[0]).each(function(i) {
                            var thisEleClone = $(this).clone();
                            if(!thisEleClone.hasClass("grid_more_thead_col__")) {
                                thisEleClone.find(excludeThClasses).remove();
                                var cols = $('<li class="grid_more_cols__" title="' + String(i+1) + '">'
                                    + '<label><input name="hideshow" type="checkbox" checked="checked" value="' + String(i) + '">'
                                    + String(i+1) + " " + N.message.get(opts.message, "column") + '</label></li>')
                                    .appendTo(gridMoreColList);
                            }
                        });

                        calibDialogItems(thisBtn, panel);
                    }

                    $(document).off("click.grid.more");
                    $(document).on("click.grid.more", function(e) {
                        if($(e.target).parents(".grid_more_panel__, .grid_col_show_hide_btn__").length === 0 && !$(e.target).hasClass("grid_col_show_hide_btn__")) {
                            panel.removeClass("visible__").addClass("hidden__");
                            panel.one(N.event.whichTransitionEvent(panel), function(){
                                panel.hide();

                                // The touchstart event is not removed when using the one method
                                $(document).off("click.grid.more touchstart.grid.more");
                            }).trigger("nothing");
                        }
                    });

                    panel.show(0, function() {
                        $(this).removeClass("hidden__").addClass("visible__");
                    });
                });

                // Detail popup button event.
                opts.context.on("click.grid.more", ".grid_more_tbody_col__ .grid_more_btn__", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    var rowIdx = opts.context.find(">tbody").index($(this).closest("tbody.form__"));

                    var morePopupContects = $("<div></div>").addClass("grid_more_popup_contents__");
                    var moreContents = $("<div></div>").addClass("grid_more_contents__").appendTo(morePopupContects).css({
                        "overflow-y" : "auto",
                        "max-height" : ($(window).height() - 200) + "px"
                    });
                    var table = $("<table></table>").appendTo(moreContents);
                    var tbody = $("<tbody></tbody>").appendTo(table);
                    $(opts.more).each(function() {
                        var tr = $("<tr></tr>").appendTo(tbody);
                        var filteredThClone = self.thead.find(">tr > th:regexp(data:id, " + this + ")").clone();
                        filteredThClone.find(excludeThClasses).remove();
                        filteredThClone.removeAttr("rowspan").removeAttr("colspan");
                        var th = $("<th></th>", {
                            text : filteredThClone.text()
                        }).appendTo(tr);

                        var td = opts.context.find(">tbody:eq(" + rowIdx + ") #" + this);
                        if(td.is("td")) {
                            td.clone().removeAttr("rowspan").removeAttr("colspan").removeAttr("class").removeAttr("style").appendTo(tr);
                        } else {
                            if(td.hasClass("datepicker__")) {
                                td.next(".datepicker_contents__").remove();
                            }

                            var tdClone = td.closest("td").clone();
                            tdClone.find(".datepicker__").removeClass("datepicker__");

                            tdClone.removeAttr("rowspan").removeAttr("colspan").removeAttr("class").removeAttr("style").appendTo(tr);
                        }
                    });

                    var form = opts.data.form(moreContents).unbind().bind(rowIdx);

                    var btnBox = $('<div class="btn_box__"></div>').appendTo(morePopupContects);
                    var prevBtn = $('<a href="#" class="prev_btn__">' + N.message.get(opts.message, "prev") + '</a>').on("click.grid.more", function(e) {
                        e.preventDefault();

                        if(rowIdx > 0 && form.validate()) {
                            rowIdx -= 1;
                            form.bind(rowIdx);
                            page.text(String(rowIdx + 1));
                        }
                    }).appendTo(btnBox);
                    var page = $('<span class="page__">' + String(rowIdx + 1) +'</span>').appendTo(btnBox);
                    var nextBtn = $('<a href="#" class="next_btn__">' + N.message.get(opts.message, "next") + '</a>').on("click.grid.more", function(e) {
                        e.preventDefault();

                        if(rowIdx + 1 < form.data().length && form.validate()) {
                            rowIdx += 1;
                            form.bind(rowIdx);
                            page.text(String(rowIdx + 1));
                        }
                    }).appendTo(btnBox);

                    morePopupContects.popup({
                        title : N.message.get(opts.message, "more"),
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
            },
            resize : function() {
                var self = this;
// TODO colgroup
//              var tableMap = this.tableMap;

//              if(tableMap.colgroup.length > 0) {
                    /*
                    N.ui.draggable.events.call(docsTabs, ".docs.scroll", function(e, ele, x, y) { // start

                    }, function(e, ele, x, y) { // move
                        N.ui.draggable.moveX.call(ele, x);
                    }, function(e, ele) { //end

                    });
                    */
//              } else {
                    var resizeBar, currResizeBar, resizeBarHeight, cellEle, currCellEle, currNextCellEle, targetCellEle, targetNextCellEle,
                    targetTfootCellEle, targetNextTfootCellEle, currResizeBarEle,
                    defWidth, nextDefWidth, currWidth, nextCurrWidth, startOffsetX,
                    minPx, maxPx, defPx, movedPx;

                    var opts = this.options;
                    var theadCells = this.thead.find("> tr th:not(.grid_head_fixed__)");
                    var isPressed = false;
                    var scrollbarWidth = N.browser.scrollbarWidth();

                    if(N.browser.is("safari")){
                        theadCells.css("padding-left", "0");
                        theadCells.css("padding-right", "0");
                    }

                    if(opts.context.css("table-layout") !== "fixed") {
                        opts.context.css("table-layout", "fixed");
                    }

                    var resizeBarWidth = 5;
                    var resizeBarCorrectionHeight = N.browser.is("ie") ? -2 : 0;
                    var context;
                    if (opts.height > 0) {
                        context = opts.context.closest(".grid_wrap__");
                    } else {
                        context = opts.context;
                    }

                    this.thead.on("mouseover.grid.resize touchstart.grid.resize", function() {
                        resizeBarHeight = (opts.height > 0 ? self.contextEle.closest(".grid_wrap__").height() - 3 : self.contextEle.height() + resizeBarCorrectionHeight) + 1 + opts.misc.resizeBarCorrectionHeight;
                        var lastResizeBar = theadCells.each(function() {
                            var cellEle = $(this);
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

                    var isFirstTimeLastClick = true;
                    theadCells.each(function() {
                        cellEle = $(this);
                        resizeBar = $('<div class="resize_bar__"></div>').css({
                            "padding": "0px",
                            "position": "absolute",
                            "width": resizeBarWidth + "px",
                            "height": String(cellEle.outerHeight()) + "px",
                            "opacity": "0"
                        }).appendTo(cellEle);

                        resizeBar.on("mousedown.grid.resize touchstart.grid.resize", function(e) {
                            var dte;
                            if(e.originalEvent.touches) {
                                dte = e.originalEvent.touches[0];
                            }

                            if(e.originalEvent.touches || (e.which || e.button) === 1) {
                                $(this).css({
                                    "opacity": ""
                                }).animate({
                                    "height" : resizeBarHeight + "px"
                                }, 150);

                                startOffsetX = dte !== undefined ? dte.pageX : e.pageX;
                                currResizeBarEle = $(this);
                                currCellEle = currResizeBarEle.parent("th");
                                currNextCellEle = currCellEle.next();
                                var isLast = false;
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
                                    var thisWidth;
                                    theadCells.each(function(i) {
                                        thisWidth = $(this).width();
                                        $(this).width(thisWidth + (opts.height > 0 ? opts.misc.resizableLastCellCorrectionWidth : 0) + opts.misc.resizableCorrectionWidth).removeAttr("width");

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

                                $(document).on("dragstart.grid.resize selectstart.grid.resize", function() {
                                    return false;
                                });
                                isPressed = true;

                                minPx = !isLast ? Math.floor(currNextCellEle.offset().left) : Math.floor(currCellEle.offset().left) + Math.floor(currCellEle.outerWidth());
                                maxPx = minPx + (!isLast ? Math.floor(currNextCellEle.outerWidth()) : 7680);
                                movedPx = defPx = Math.floor(currResizeBarEle.parent("th").offset().left);
                                $(window.document).on("mousemove.grid.resize touchmove.grid.resize", function(e) {
                                    var mte;
                                    if(e.originalEvent.touches) {
                                        e.stopPropagation();
                                        mte = e.originalEvent.touches[0];
                                    }
                                    if(isPressed) {
                                        var mPageX = mte !== undefined ? mte.pageX : e.pageX;
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

                                var currResizeBar = $(this);
                                $(window.document).on("mouseup.grid.resize touchend.grid.resize", function(e) {
                                    currResizeBar.animate({
                                        "height" : String(theadCells.filter(":eq(0)").outerHeight()) + "px"
                                    }, 200, function() {
                                        $(this).css({
                                            "opacity": "0"
                                        });

                                        currResizeBar = undefined;
                                    });

                                    $(document).off("dragstart.grid.resize selectstart.grid.resize mousemove.grid.resize touchmove.grid.resize mouseup.grid.resize touchend.grid.resize");
                                    isPressed = false;
                                });
                            }
                        });
                    });

                    resizeBar = currResizeBar = resizeBarHeight = cellEle = currCellEle = currNextCellEle = targetCellEle = targetNextCellEle =
                    targetTfootCellEle = targetNextTfootCellEle = currResizeBarEle =
                    defWidth = nextDefWidth = currWidth = nextCurrWidth = startOffsetX =
                    minPx = maxPx = defPx = movedPx = undefined;
//              }
            },
            sort : function() {
                var opts = this.options;
                var thead = this.thead;

                var theadCells = thead.find(">tr>th:not(.grid_more_thead_col__)");
                theadCells.css("cursor", "pointer");
                var self = this;
                theadCells.filter(function(i, cell) {
                    return $(cell).data("id") !== undefined;
                }).on("click.grid.sort", function(e) {
                    var currEle = $(this);
                    if(currEle.data("sortLock")) {
                        currEle.data("sortLock", false);
                        return false;
                    }
                    if (opts.data.length > 0) {
                        if(N.string.trimToNull($(this).text()) !== null && $(this).find(opts.checkAll).length === 0) {
                            var isAsc = false;
                            if (currEle.find(".sortable__").hasClass("asc__")) {
                                isAsc = true;
                            }
                            if (isAsc) {
                                self.bind(N(opts.data).datasort($(this).data("id"), true), "grid.sort");
                                theadCells.find(".sortable__").remove();
                                currEle.append('<span class="sortable__ desc__">' + opts.sortableItem.asc + '</span>');
                            } else {
                                self.bind(N(opts.data).datasort($(this).data("id")), "grid.sort");
                                theadCells.find(".sortable__").remove();
                                currEle.append('<span class="sortable__ asc__">' + opts.sortableItem.desc + '</span>');
                            }
                        }
                    }
                });
            },
            dataFilter : function() {
                var opts = this.options;
                var thead = this.thead;
                var theadCells = thead.find("> tr th").filter(function(i, cell) {
                    return $(cell).data("id") !== undefined;
                });
                var self = this;

                var clonedData;

                var filterKeys;
                var filteredKeys;
                var bfrSelId;

                var changeBtnIcon = function(th, kind) {
                    th.find(".btn_data_filter__")
                    .removeClass("btn_data_filter_empty__ btn_data_filter_part__ btn_data_filter_full__")
                    .addClass("btn_data_filter_" + kind + "__");
                };

                var btnEle = $('<a href="#" class="btn_data_filter__" title="' + N.message.get(opts.message, "dFilter") + '"><span>' + N.message.get(opts.message, "dFilter") + '</span><a>')
                    .addClass("btn_data_filter_full__")
                    .on("click.grid.dataFilter", function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        var thisEle = $(this);
                        var visiblePanel = thead.find(".data_filter_panel__.visible__");
                        if(visiblePanel.length > 0) {
                            visiblePanel.removeClass("visible__").addClass("hidden__");
                            var eventNm = N.event.whichTransitionEvent(visiblePanel);
                            visiblePanel.unbind(eventNm);
                            visiblePanel.one(eventNm, function(e){
                                if(!thisEle.hasClass("btn_data_filter__")) {
                                    $(this).hide();
                                }
                            }).trigger("nothing");
                        }

                        var theadCell = $(this).closest("th");

                        var panel;
                        var searchBox;
                        var filterListBox;
                        var id = theadCell.data("id");
                        var dataFilterProgress;

                        if(theadCell.find(".data_filter_panel__").length > 0) {
                            panel = theadCell.find(".data_filter_panel__").hide().removeClass("visible__").addClass("hidden__");
                            dataFilterProgress = theadCell.find(".data_filter_progress__");
                            searchBox = panel.find(".data_filter_search__");
                            panel.find(".data_filter_checkall_box__ .data_filter_total_cnt__").text('(' + opts.data.length + ')');
                            filterListBox = panel.find(".data_filter_list__");

                            // Index filter keys
                            if(bfrSelId !== id) {
                                filterKeys = {};
                                $.each(clonedData, function(i, v) {
                                    if(filterKeys[id + "_" + v[id]] === undefined) {
                                        filterKeys[id + "_" + v[id]] = [i];
                                    } else {
                                        filterKeys[id + "_" + v[id]].push(i);
                                    }
                                });
                            }

                            // Index filter keys from filtered data
                            filteredKeys = {};
                            $.each(opts.data, function(i, v) {
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

                            panel = $('<div align="left" class="data_filter_panel__ hidden__">'
                                    +   '<div class="data_filter_search__">'
                                    +       '<input class="data_filter_search_word__" type="text">'
                                    +       '<a class="data_filter_search_btn__" href="#" title="' + N.message.get(opts.message, "search") + '">'
                                    +           '<span>' + N.message.get(opts.message, "search") + '</span>'
                                    +       '</a>'
                                    +   '</div>'
                                    +   '<div class="data_filter_checkall_box__"><label><input type="checkbox" checked="checked"><span class="data_filter_select_all__">' + N.message.get(opts.message, "selectAll") + '</span><span class="data_filter_total_cnt__">(' + opts.data.length + ')</span></label></div>'
                                    +   '<ul class="data_filter_list__"></ul>'
                                    + '</div>')
                            .css("z-index", 1)
                            .hide()
                            .appendTo(theadCell).on("click.grid.dataFilter, mouseover.grid.dataFilter", function(e) {
                                e.stopPropagation();
                            });

                            dataFilterProgress = $('<div class="data_filter_progress__"></div>')
                            .css({
                                "z-index" : 2,
                                "opacity" : 0.3
                            })
                            .appendTo(panel);

                            searchBox = panel.find(".data_filter_search__");

                            // search btn event
                            panel.find(".data_filter_search_btn__").on("click.grid.dataFilter", function(e) {
                                e.preventDefault();
                                var searchWord = panel.find(".data_filter_search_word__").val();
                                if(N.string.trimToNull(searchWord) !== null) {
                                    var retChkbxs = filterListBox.find("li:contains('" + searchWord + "')").show().find(":checkbox").prop("checked", true);
                                    filterListBox.find("li:not(:contains('" + searchWord + "'))").hide().find(":checkbox").prop("checked", false).last().trigger("do.grid.dataFilter");
                                    retChkbxs.each(function() {
                                        chkboxEle = $(this);
                                        chkboxEle.parent().children(".data_filter_cnt__").text('(' + String(chkboxEle.data("length")) + ')')
                                    });
                                } else {
                                    filterListBox.find("li").show();
                                    filterListBox.find("li :checkbox").prop("checked", true).last().trigger("do.grid.dataFilter");
                                }
                            });
                            panel.find(".data_filter_search_word__").on("keyup.grid.dataFilter", function(e) {
                                var keyCode = (e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode));
                                if (keyCode == 13) {
                                    panel.find(".data_filter_search_btn__").trigger("click");
                                }
                            });

                            // select all checkbox event
                            panel.find(".data_filter_checkall_box__ :checkbox").on("click.grid.dataFilter", function() {
                                if($(this).is(":checked")) {
                                    var chkboxEle;
                                    panel.find(".data_filter_search_word__").val("");
                                    filterListBox.find("li").show();
                                    filterListBox.find("li :checkbox").prop("checked", true).each(function() {
                                        chkboxEle = $(this);
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
                            $.each(clonedData, function(i, v) {
                                if(filterKeys[id + "_" + v[id]] === undefined) {
                                    filterKeys[id + "_" + v[id]] = [i];
                                } else {
                                    filterKeys[id + "_" + v[id]].push(i);
                                }
                            });

                            // Index filter keys from filtered data
                            if(!N.isEmptyObject(filteredKeys) && clonedData.length !== opts.data.length) {
                                filteredKeys = {};
                                $.each(opts.data, function(i, v) {
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

                        var itemSeq = 0;
                        for(var k in filterKeys) {
                            var filterItemEle;
                            var length = filteredKeys[k] === undefined ? 0 : filteredKeys[k].length;

                            var prevFilterItemEle = filterListBox.find(".data_filter_item_" + String(itemSeq) + "__");
                            if(prevFilterItemEle.length > 0) {
                                filterItemEle = prevFilterItemEle;
                                filterItemEle.find(".data_filter_cnt__").text("(" + String(length) + ")");
                            } else {
                                filterItemEle = $('<li class="data_filter_item_' + String(itemSeq) + '__">'
                                        + '<label><input type="checkbox" checked="checked" class="data_filter_checkbox__">'
                                        + '<span class="data_filter_item_name__"></span><span class="data_filter_cnt__">(' + String(length) + ')</span></label></li>');

                                filterItemEle.find(".data_filter_item_name__").text(k.replace(id + "_", ""));

                                filterItemEle.find(".data_filter_checkbox__")
                                .data("rowIdxs", filterKeys[k])
                                .data("length", length)
                                .on("click.grid.dataFilter, do.grid.dataFilter", function() {
                                    // Update the count of rows for each filter item
                                    var thisEle = $(this);
                                    if(thisEle.is(":checked")) {
                                        thisEle.parent().children(".data_filter_cnt__").text("(" + String(thisEle.data("length")) + ")");
                                    } else {
                                        thisEle.parent().children(".data_filter_cnt__").text("(0)");
                                    }

                                    // dataFilterListUnCheckedEles is current thead's cell unchecked data filter list
                                    var dataFilterListUnCheckedEles = theadCell.find(".data_filter_list__ li :checkbox:not(:checked)");
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

                                    var filterIdxs = [];
                                    dataFilterListUnCheckedEles.each(function() {
                                        $.each($(this).data("rowIdxs"), function(i, v) {
                                            filterIdxs[v] = v;
                                        });
                                    });

                                    filterIdxs = $.grep(filterIdxs, function(n){ return n == 0 || n });

                                    dataFilterProgress.show().fadeTo(50, 0.5, function() {
                                        // init scrollPaging index
                                        opts.scrollPaging.idx = 0;

                                        if(filterIdxs.length > 0 && filterIdxs.length !== clonedData.length) {
                                            var extrData = clonedData.slice(0);
                                            var bfrFilterIdx = -1;
                                            var addUnits = 0;
                                            for(var i = 0; i < filterIdxs.length; i++){
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

                        $(document).off("click.grid.dataFilter");
                        $(document).on("click.grid.dataFilter", function(e) {
                            if($(e.target).closest(".data_filter_panel__, .btn_data_filter__").length === 0
                                    && !$(e.target).hasClass("btn_data_filter__")
                                    && !$(e.target).hasClass("form__")) {
                                var panel = thead.find(".data_filter_panel__.visible__");
                                if(panel.length > 0) {
                                    panel.removeClass("visible__").addClass("hidden__");
                                    var eventNm = N.event.whichTransitionEvent(panel);
                                    panel.unbind(eventNm);
                                    panel.one(eventNm, function(e){
                                        $(this).hide();
                                        $(document).off("click.grid.dataFilter");
                                    }).trigger("nothing");
                                }
                            }
                        });

                        bfrSelId = id;
                    }).prependTo(theadCells.filter("[data-filter='true']:not(.grid_more_thead_col__)"));
            },
            rowSpan : function(i, rowEle, bfRowEle, rowData, bfRowData, colId) {
                var opts = this.options;
                if(bfRowData !== undefined && rowData[colId] === bfRowData[colId]) {
                    var bfRowCell = bfRowEle.find("#" + colId).closest("td");
                    var prevColId;
                    var prevBfRowCell = bfRowCell.prev("td");
                    if(prevBfRowCell.length > 0) {
                        if(prevBfRowCell.attr("id")) {
                            prevColId = prevBfRowCell.attr("id");
                        } else {
                            prevColId = prevBfRowCell.find("[id]").attr("id");
                        }
                    }
                    if((this.rowSpanIds.get().join("|") + "|").indexOf(prevColId) < 0 || bfRowCell.prev("td").hasClass("grid_rowspan__")) {
                        var cell = rowEle.find("#" + colId).closest("td");
                        var bfCellBgColor = bfRowCell.css("background-color");
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

                        var cldr = cell.children();
                        if(cldr.length > 0) {
                            cldr.hide();
                        } else {
                            cell.empty();
                        }
                    }
                }
            },
            paste : function() {
                var self = this;
                self.tempRowEle.find("[id]").not(":input").attr("contenteditable", "true").on("keydown.grid.paste", function(e) {
                    if(!e.ctrlKey) {
                        e.target.blur();
                        e.preventDefault();
                        return false;
                    }
                });
                self.context().on("paste", ".form__ [id]", function(e) {
                    e.preventDefault();

                    var content;
                    if (window.clipboardData) {
                        content = window.clipboardData.getData('Text');
                        if (window.getSelection) {
                            var selObj = window.getSelection();
                            var selRange = selObj.getRangeAt(0);
                            selRange.deleteContents();
                            selRange.insertNode(document.createTextNode(content));
                        }
                    } else if (e.originalEvent.clipboardData) {
                        content = (e.originalEvent || e).clipboardData.getData('text/plain');
                    }

                    if (!content && content.length) {
                        return false;
                    }

                    var thisEle = N(this);
                    var currRowIndex = self.context(".form__").index(thisEle.closest(".form__"));
                    var currCellIndex = self.context(".form__:eq(" + currRowIndex + ") [id]").index(thisEle);

                    var rows = content.replace(/"((?:[^"]*(?:\r\n|\n\r|\n|\r))+[^"]+)"/mg, function (match, p1) {
                        return p1.replace(/""/g, '"').replace(/\r\n|\n\r|\n|\r/g, ' ');
                    }).split(/\r\n|\n\r|\n|\r/g);
                    var columns = self.tempRowEle.find("[id]").map(function() {
                        return N(this).attr("id");
                    });
                    for (var i = 0; i < rows.length; i++) {
                        if(N.isEmptyObject(rows[i])) continue;

                        var data = rows[i].split('\t');
                        var rowEle = self.context(".form__:eq(" + String(currRowIndex + i) + ")");
                        for (var j = 0; j < data.length; j++) {
                            var colNm = columns.get(currCellIndex + j);
                            var colEle = rowEle.find("#" + colNm);
                            if(!colEle.prop("readonly") && !colEle.prop("disabled")) {
                                self.val(currRowIndex + i, columns.get(currCellIndex + j), data[j]);
                            }
                        }

                    }
                });
            }
        });

        $.extend(Grid.prototype, {
            data : function(rowStatus) { // key name : argument1, argument2... argumentN
                var opts = this.options;

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
                        var retData = [];

                        // clone arguments
                        var args = Array.prototype.slice.call(arguments, 0);

                        var rowEles = this.contextEle.find(">tbody.form__");
                        rowEles.filter(".grid_selected__").each(function() {
                            var thisEle = N(this);
                            if(arguments.length > 1) {
                                args[0] = opts.data[rowEles.index(this)];
                                retData.push(N.json.mapFromKeys.apply(N.json, args));
                            } else {
                                retData.push(opts.data[rowEles.index(this)]);
                            }
                        });
                        return retData;
                    }
                } else if(rowStatus === "checked") {
                    var opts = opts;
                    var retData = [];

                    // clone arguments
                    var args = Array.prototype.slice.call(arguments, 0);

                    var rowEles = this.contextEle.find(">tbody.form__");
                    rowEles.find(opts.checkAllTarget||opts.checkSingleTarget).filter(":checked").each(function() {
                        var thisEle = N(this);
                        if(arguments.length > 1) {
                            args[0] = opts.data[rowEles.index(thisEle.closest("tbody.form__"))];
                            retData.push(N.json.mapFromKeys.apply(N.json, args));
                        } else {
                            retData.push(opts.data[rowEles.index(thisEle.closest("tbody.form__"))]);
                        }
                    });
                    return retData;
                } else {
                    if(arguments.length > 1) {
                        var args = Array.prototype.slice.call(arguments, 0);

                        return opts.data.datafilter(function(data) {
                            return data.rowStatus === rowStatus;
                        }).map(function() {
                            args[0] = this;
                            return N.json.mapFromKeys.apply(N.json, args);
                        }).get();
                    } else {
                        return opts.data.datafilter(function(data) {
                            return data.rowStatus === rowStatus;
                        }).get();
                    }
                }
            },
            context : function(sel) {
                return sel !== undefined ? this.options.context.find(sel) : this.options.context;
            },
            contextHead : function(sel) {
                return sel !== undefined ? this.thead.find(sel) : this.thead;
            },
            contextBodyTemplate : function(sel) {
                return sel !== undefined ? this.tempRowEle.find(sel) : this.tempRowEle;
            },
            select : function(row, isAppend) {
                var opts = this.options;
                if(!opts.select && !opts.multiselect) {
                    N.warn("[N.grid.select]The \"select\" or \"multiselect\" option is disabled. To use this method, set the value of the \"select\" or \"multiselect\" option to true.");
                    return false;
                }

                if(row === undefined) {
                    var rowEles = this.contextEle.find(">tbody.form__");
                    return rowEles.filter(".grid_selected__").map(function () {
                        return rowEles.index(this);
                    }).get();
                } else {
                    if(N.type(row) !== "array") {
                        row = [row];
                    }

                    var self = this;
                    var selRowEle;

                    if(!isAppend) {
                        self.contextEle.find(">tbody.grid_selected__").removeClass("grid_selected__");
                    }
                    $(row).each(function() {
                        selRowEle = self.contextEle.find(">tbody" + (self.options.data.length > 0 ? ".form__" : "") +":eq(" + String(this) + ")");
                        if(selRowEle.hasClass("grid_selected__")) {
                            selRowEle.removeClass("grid_selected__");
                        }
                        selRowEle.trigger("click.grid");
                    });

                    if(opts.selectScroll) {
                        scrollTop = (row[row.length - 1] * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
                        if(scrollTop < 0) {
                            scrollTop = 0;
                        }
                        opts.context.parent(".tbody_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing');
                    }

                    return this;
                }
            },
            check : function(row, isAppend) {
                var opts = this.options;
                if(row === undefined) {
                    var rowEles = this.contextEle.find(">tbody.form__");
                    return rowEles.find(opts.checkAllTarget || opts.checkSingleTarget).filter(":checked").map(function () {
                        return rowEles.index(N(this).closest("tbody.form__"));
                    }).get();
                } else {
                    if(N.type(row) !== "array") {
                        row = [row];
                    }

                    var self = this;
                    var checkboxEle;
                    if(!isAppend) {
                        self.contextEle.find(">tbody").find((opts.checkAllTarget||opts.checkSingleTarget) + ":checked").prop("checked", false);
                    }
                    $(row).each(function() {
                        checkboxEle = self.contextEle.find(">tbody").find(opts.checkAllTarget||opts.checkSingleTarget).eq(this);
                        if(checkboxEle.is(":checked")) {
                            checkboxEle.prop("checked", false);
                        }
                        checkboxEle.trigger("click.grid");
                    });

                    if(opts.checkScroll) {
                        var selRowEle = checkboxEle.closest("tbody.form__");
                        scrollTop = (row[row.length - 1] * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
                        if(scrollTop < 0) {
                            scrollTop = 0;
                        }
                        opts.context.parent(".tbody_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing');
                    }

                    return this;
                }
            },
            /**
             * callType arguments is call type about scrollPaging(internal), data filter(internal), data append(external), DataSync's update.
             * callType : "append", "grid.bind", "grid.dataFilter", "grid.sort", "grid.update"
             */
            bind : function(data, callType) {
                var opts = this.options;
                // remove all sort status
                if(opts.sortable && callType !== "grid.sort") {
                    this.thead.find(".sortable__").remove();
                }
                if(!opts.isBinding) {
                    if(opts.data && data && callType === "append") {
                        opts.scrollPaging.size = 0;
                        // Merge data to binded data;
                        opts.scrollPaging.idx = opts.data.length - 1;
                        $.merge(opts.data, data);
                    } else {
                        opts.scrollPaging.size = opts.scrollPaging.defSize;
                        // rebind new data
                        if(data != null) {
                            opts.data = N.type(data) === "array" ? N(data) : data;
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

                    var tempRowEleClone;

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

                        var i = opts.scrollPaging.idx;
                        var limit;
                        if(opts.height === 0 || opts.scrollPaging.size === 0 || (callType === "append" && data.length > 0 && data.length <= opts.scrollPaging.size)) {
                            limit = opts.data.length;
                        } else {
                            limit = Math.min(opts.scrollPaging.limit, opts.data.length);
                        }

                        var self = this;
                        var delay = opts.createRowDelay;
                        var lastIdx;

                        UI.iteration.render.call(this, i, limit, delay, lastIdx, callType);

                        if(opts.appendScroll && i > 0 && callType === "append") {
                            opts.context.parent(".tbody_wrap__").stop().animate({
                                "scrollTop" : opts.context.parent(".tbody_wrap__").prop("scrollHeight")
                            }, 300, 'swing');
                        }
                    } else {
                        //remove tbodys in grid body area
                        opts.context.find(">tbody").remove();

                        var colspan = 0;
                        if(this.tableMap.colgroup[0] !== undefined && this.tableMap.colgroup[0].length > 0) {
                            colspan = $(this.tableMap.colgroup[0]).not(":regexp(css:display, none), [hidden]").length;
                        } else {
                            $(this.tableMap.tbody).each(function(i, eles) {
                                var currLen = $(eles).not(":regexp(css:display, none), [hidden]").length;
                                if(colspan < currLen) {
                                    colspan = currLen;
                                }
                            });
                        }

                        var emptyEle = $('<tbody><tr><td class="empty__" ' + (colspan > 0 ? 'colspan=' + String(colspan) : '') + '>'
                            + N.message.get(opts.message, "empty") + '</td></tr></tbody>');

                        opts.context.append(emptyEle);

                        if(opts.fixedcol > 0) {
                            setTimeout(function() {
                                var emptyCellEle = emptyEle.find(".empty__");
                                var emptyCellEleBLW = parseInt(N.string.trimToZero(emptyCellEle.css("border-left")));
                                var emptyCellEleBRW = parseInt(N.string.trimToZero(emptyCellEle.css("border-right")));

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
                    var self = this;
                    var args = arguments;
                    opts.context.queue("bind", function() {
                        self.bind.apply(self, args);
                    });
                }
                return this;
            },
            add : function(data, row) {
                var opts = this.options;
                if (opts.context.find("td.empty__").length > 0) {
                    opts.context.find(">tbody").remove();
                }
                var tempRowEleClone = this.tempRowEle.clone(true, true);

                if(N.isNumeric(data)) {
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
                    var selRowEle = opts.context.find(">tbody:eq(" + row + ")");
                    var scrollTop;

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
                                $(this).find(">table>tbody:eq(" + row + ")").trigger("click.grid");
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

                // for new row data bind, use N.form
                var form = opts.data.form({
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
                            $(this).find("> table > tbody:" + (opts.addTop ? "first" : "last")).trigger("click.grid");
                        }
                    });
                }

                tempRowEleClone = undefined;

                return this;
            },
            remove : function(row) {
                var opts = this.options;
                if(row !== undefined) {
                    if(N.type(row) !== "array") {
                        row = [row];
                    }
                    $(row.sort().reverse()).each(function(i, row) {
                        if (opts.data[this] === undefined) {
                            throw N.error("[N.grid.prototype.remove]Row index is out of range");
                        }
                        if (opts.data[this].rowStatus === "insert") {
                            opts.data.splice(this, 1);
                            opts.context.find(">tbody:eq(" + row + ")").remove();


                            // for scroll paging
                            // just +1 is inappropriate on android 4.4.2 webkit
                            var rowEleLength = opts.context.find(">tbody").length;
                            var pagingSize = opts.scrollPaging.size;
                            var rest = rowEleLength % pagingSize;
                            opts.scrollPaging.idx = parseInt(rowEleLength / pagingSize) * pagingSize - pagingSize + rest;
                        } else {
                            opts.data[this].rowStatus = "delete";
                            opts.context.find(">tbody:eq(" + row + ")").addClass("row_data_deleted__");
                        }
                    });
                }

                N.ds.instance(this).notify();
                return this;
            },
            revert : function(row) {
                var opts = this.options;
                if(!opts.revert) {
                    throw N.error("[N.form.prototype.revert]Can not revert. N.form's revert option value is false");
                }

                var self = this;

                if(row !== undefined) {
                    if(N.type(row) !== "array") {
                        row = [row];
                    }
                    $(row).each(function() {
                        var i = this;
                        var context = opts.context.find(">tbody:eq(" + String(this) + ")");
                        var form = context.instance("form");
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
                            var i = this.options.extRow;
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
            },
            validate : function(row) {
                var opts = this.options;
                var valiRslt = true;
                if(row !== undefined) {
                    valiRslt = opts.context.find(">tbody:eq(" + String(row) + ")").instance("form").validate();
                } else {
                    var rowStatus;
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
                    var valiLastTbody = opts.context.find(".validate_false__:last").closest("tbody.form__");
                    opts.context.parent(".tbody_wrap__").stop().animate({
                        "scrollTop" : opts.context.parent(".tbody_wrap__").scrollTop() + valiLastTbody.position().top - opts.height + (valiLastTbody.outerHeight() * 2)
                    }, 300, 'swing');
                }

                return valiRslt;
            },
            val : function(row, key, val) {
                if(val === undefined) {
                    return this.options.data[row][key];
                }

                var inst = this.options.context.find(">.form__:eq(" + String(row) + ")").instance("form");
                if(inst) {
                    inst.val(key, val);
                } else {
                    if(this.options.data[row]) {
                        this.options.data[row][key] = val;
                    } else {
                        throw N.error("[N.grid.prototype.val]There is no row data that is " + row + " index");
                    }
                }
                return this;
            },
            move : function(fromRow, toRow) {
                UI.iteration.move.call(this, fromRow, toRow, "grid");

                return this;
            },
            copy : function(fromRow, toRow) {
                UI.iteration.copy.call(this, fromRow, toRow, "grid");

                return this;
            },
            show : function(colIdxs) {
                var opts = this.options;
                var self = this;
                if(colIdxs !== undefined) {
                    if(N.type(colIdxs) !== "array") {
                        colIdxs = [colIdxs];
                    }
                }

                $(colIdxs).each(function(i, v) {
                    var context = opts.height > 0 ? opts.context.parent(".tbody_wrap__").parent(".grid_wrap__") : opts.context;
                    context = context.add(self.tempRowEle);
                    context.find(".col_" + v + "__").each(function(i, ele) {
                        var colEle = $(ele);
                        var colSpanCnt = parseInt(colEle.attr("colspan"));
                        var orgColspan = colEle.data("colspan");
                        if(colSpanCnt < orgColspan) {
                            colEle.attr("colspan", colSpanCnt + 1);
                        }
                        colEle.css("display", "");
                    });
                });

                var emptyEle = opts.context.find(">tbody>tr>.empty__");
                if(emptyEle.length > 0) {
                    if(this.tableMap.colgroup[0] !== undefined && this.tableMap.colgroup[0].length > 0) {
                        emptyEle.attr("colspan", String($(this.tableMap.colgroup[0]).not(":regexp(css:display, none)").length));
                    } else {
                        $(this.tableMap.tbody).each(function(i, eles) {
                            var currLen = String($(eles).not(":regexp(css:display, none)").length);
                            if(N.string.trimToZero(emptyEle.attr("colspan")) < currLen) {
                                emptyEle.attr("colspan", currLen);
                            }
                        });
                    }
                }

                return this;
            },
            hide : function(colIdxs) {
                var opts = this.options;
                var self = this;
                if(colIdxs !== undefined) {
                    if(N.type(colIdxs) !== "array") {
                        colIdxs = [colIdxs];
                    }
                }

                $(colIdxs).each(function() {
                    var context = opts.height > 0 ? opts.context.parent(".tbody_wrap__").parent(".grid_wrap__") : opts.context;
                    context = context.add(self.tempRowEle);
                    context.find(".col_" + this + "__").each(function() {
                        var colEle = $(this);
                        var colSpanCnt = parseInt(colEle.attr("colspan"));
                        if(colSpanCnt > 0) {
                            if(colEle.data("colspan") === undefined) {
                                colEle.data("colspan", colSpanCnt);
                            }
                            colEle.attr("colspan", colSpanCnt - 1);
                            if(colEle.attr("colspan") == "0") {
                                colEle.css("display", "none");
                            }
                        } else {
                            colEle.css("display", "none");
                        }
                    });
                });

                var emptyEle = opts.context.find(">tbody>tr>.empty__");
                if(emptyEle.length > 0) {
                    if(this.tableMap.colgroup[0] !== undefined && this.tableMap.colgroup[0].length > 0) {
                        emptyEle.attr("colspan", String($(this.tableMap.colgroup[0]).not(":regexp(css:display, none)").length));
                    } else {
                        $(this.tableMap.tbody).each(function(i, eles) {
                            var currLen = String($(eles).not(":regexp(css:display, none)").length);
                            if(N.string.trimToZero(emptyEle.attr("colspan")) < currLen) {
                                emptyEle.attr("colspan", currLen);
                            }
                        });
                    }
                }

                return this;
            },
            update : function(row, key) {
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
            }
        });

        // Pagination
        var Pagination = N.pagination = function(data, opts) {
            this.options = {
                data : N.type(data) === "array" ? N(data) : data,
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
                $.extend(this.options, N.context.attr("ui").pagination);
            } catch (e) {
                throw N.error("N.pagination", e);
            }

            if(this.options.data.length > 0) {
                this.options.totalCount = this.options.data.length;
            }

            if (N.isPlainObject(opts)) {
                // Wraps the global event options in N.config and event options for this component.
                UI.utils.wrapHandler(opts, "pagination", "onChange");

                //convert data to wrapped set
                opts.data = N.type(opts.data) === "array" ? N(opts.data) : opts.data;

                $.extend(this.options, opts);

                if(N.type(this.options.context) === "string") {
                    this.options.context = N(this.options.context);
                }
            } else {
                this.options.context = N(opts);
            }

            // Initialize paging panel
            this.linkEles = Pagination.wrapEle.call(this);

            // set style class name to context element
            this.options.context.addClass("pagination__");

            // set this instance to context element
            this.options.context.instance("pagination", this);

            return this;
        };

        $.extend(Pagination, {
            wrapEle : function() {
                var opts = this.options;

                // pagination link element set
                var linkEles = {};

                var lefter = opts.context.find("ul:eq(0)").addClass("pagination_lefter__");

                linkEles.body = opts.context.find("ul:eq(1)").addClass("pagination_body__");
                linkEles.page = linkEles.body.find("li").addClass("pagination_page__");

                var righter = opts.context.find("ul:eq(2)").addClass("pagination_righter__");

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

                opts.currPageNavInfo = Pagination.changePageSet(linkEles, opts);

                return linkEles;
            },
            changePageSet : function(linkEles, opts, isRemake) {
                var pageCount = Math.ceil(opts.totalCount / opts.countPerPage);
                var pageSetCount = Math.ceil(pageCount / opts.countPerPageSet);
                var currSelPageSet = Math.ceil(opts.pageNo / opts.countPerPageSet);
                if (currSelPageSet > pageSetCount) { currSelPageSet = pageSetCount; }

                var startPage = (currSelPageSet - 1) * opts.countPerPageSet + 1;
                var endPage = startPage + opts.countPerPageSet - 1;

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
                    var pageClone;
                    linkEles.body.empty();
                    for(var i = startPage; i <= endPage; i++) {
                        pageClone = linkEles.page.clone(true, true);
                        pageClone.attr("data-pageno", String(i));
                        pageClone.find("a > span").text(String(i));
                        linkEles.body.append(pageClone);
                    }
                }

                if(currSelPageSet > 0 && currSelPageSet > 1 && startPage >= currSelPageSet) {
                    $(linkEles.prev).removeClass("pagination_disable__");
                } else {
                    $(linkEles.prev).addClass("pagination_disable__");
                }
                if(linkEles.first !== undefined) {
                    if(1 !== opts.pageNo) {
                        $(linkEles.first).removeClass("pagination_disable__");
                    } else {
                        $(linkEles.first).addClass("pagination_disable__");
                    }
                }

                if(pageSetCount > currSelPageSet) {
                    $(linkEles.next).removeClass("pagination_disable__");
                } else {
                    $(linkEles.next).addClass("pagination_disable__");
                }
                if(linkEles.last !== undefined) {
                    if(pageCount > 0 && opts.pageNo !== pageCount) {
                        $(linkEles.last).removeClass("pagination_disable__");
                    } else {
                        $(linkEles.last).addClass("pagination_disable__");
                    }
                }

                var startRowIndex = (opts.pageNo - 1) * opts.countPerPage;
                var endRowIndex = (startRowIndex + opts.countPerPage) - 1;
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
        });

        $.extend(Pagination.prototype, {
            data : function(selFlag) {
                if(selFlag === undefined) {
                    return this.options.data.get();
                } else if(selFlag === false) {
                    return this.options.data;
                }
            },
            context : function(sel) {
                return sel !== undefined ? this.options.context.find(sel) : this.options.context;
            },
            bind : function(data, totalCount) {
                var opts = this.options;
                var self = this;

                if(arguments.length > 0 && N.type(arguments[0]) === "number") {
                    // reset totalCount
                    opts.totalCount = arguments[0];
                } else if(arguments.length > 0 && N.type(arguments[0]) === "array") {
                    // to rebind new data
                    opts.data = N.type(data) === "array" ? N(data) : data;

                    // reset totalCount
                    if(totalCount !== undefined) {
                        opts.totalCount = totalCount;
                    } else {
                        if(data != null) {
                            opts.totalCount = data.length;
                        }
                    }
                }

                var linkEles = this.linkEles;
                opts.currPageNavInfo = Pagination.changePageSet(linkEles, opts);

                // first button event
                if(linkEles.first !== undefined) {
                    linkEles.first.off("click.pagination");
                    linkEles.first.on("click.pagination", function(e) {
                        e.preventDefault();
                        if(1 !== opts.pageNo) {
                            opts.pageNo = 1;
                            opts.currPageNavInfo = Pagination.changePageSet(linkEles, opts);
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
                        opts.currPageNavInfo = Pagination.changePageSet(linkEles, opts);
                        linkEles.body.find("li a:first").trigger("click.pagination");
                    }
                });

                // page number button event
                linkEles.body.off("click.pagination");
                linkEles.body.on("click.pagination", "li > a", function(e, isFirst) {
                    e.preventDefault();

                    opts.pageNo = Number($(this).parent().data("pageno"));
                    opts.currPageNavInfo = Pagination.changePageSet(linkEles, opts, true);

                    if(opts.onChange !== null) {
                        var selData = [];
                        if(opts.data.length > 0 && opts.data.length <= opts.totalCount) {
                            for(var i = opts.currPageNavInfo.startRowIndex; i <= opts.currPageNavInfo.endRowIndex; i++) {
                                if(opts.data[i] !== undefined) {
                                    selData.push(opts.data[i]);
                                }
                            }
                        }
                        if(opts.blockOnChangeWhenBind === false || (opts.blockOnChangeWhenBind === true && isFirst !== true)) {
                            opts.onChange.call(self, opts.pageNo, this, selData, opts.currPageNavInfo);
                        }
                    }

                    linkEles.body.find("li.pagination_active__").removeClass("pagination_active__");
                    $(this).parent().addClass("pagination_active__");
                }).find("li a:eq(" + String(opts.pageNo - opts.currPageNavInfo.startPage) +  ")").trigger("click.pagination", [true]);

                // next button event
                linkEles.next.off("click.pagination");
                linkEles.next.on("click.pagination", function(e) {
                    e.preventDefault();
                    if(opts.currPageNavInfo.pageSetCount > opts.currPageNavInfo.currSelPageSet) {
                        opts.pageNo = opts.currPageNavInfo.startPage + opts.countPerPageSet;
                        opts.currPageNavInfo = Pagination.changePageSet(linkEles, opts);
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
                            opts.currPageNavInfo = Pagination.changePageSet(linkEles, opts);
                            linkEles.body.find("li a:last").trigger("click.pagination");
                        }
                    });
                }

                return this;
            },
            totalCount : function(totalCount) {
                var opts = this.options;
                if(totalCount !== undefined) {
                    opts.totalCount = totalCount;
                    return this;
                } else {
                    return opts.totalCount;
                }
            },
            pageNo : function(pageNo) {
                var opts = this.options;
                if(pageNo !== undefined) {
                    opts.pageNo = pageNo;
                    return this;
                } else {
                    return opts.pageNo;
                }
            },
            countPerPage : function(countPerPage) {
                if(countPerPage !== undefined) {
                    var opts = this.options;
                    opts.countPerPage = countPerPage;
                    opts.pageNo = 1;
                } else {
                    return this.options.countPerPage;
                }
                return this;
            },
            countPerPageSet : function(countPerPageSet) {
                if(countPerPageSet !== undefined) {
                    var opts = this.options;
                    opts.countPerPageSet = countPerPageSet;
                    opts.pageNo = 1;
                } else {
                    return this.options.countPerPageSet;
                }
                return this;
            },
            currPageNavInfo : function() {
                return this.options.currPageNavInfo;
            }
        });

        // Tree
        var Tree = N.tree = function(data, opts) {
            this.options = {
                data : N.type(data) === "array" ? N(data) : data,
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
                $.extend(this.options, N.context.attr("ui").tree);
            } catch (e) {
                throw N.error("N.tree", e);
            }

            if (N.isPlainObject(opts)) {
                // Wraps the global event options in N.config and event options for this component.
                UI.utils.wrapHandler(opts, "tree", "onSelect");
                UI.utils.wrapHandler(opts, "tree", "onCheck");

                //convert data to wrapped set
                opts.data = N.type(opts.data) === "array" ? N(opts.data) : opts.data;

                $.extend(this.options, opts);

                if(N.type(this.options.context) === "string") {
                    this.options.context = N(this.options.context);
                }
            } else {
                this.options.context = N(opts);
            }

            // set style class name to context element
            this.options.context.addClass("tree__");

            // set this instance to context element
            this.options.context.instance("tree", this);

            // register this to N.ds for realtime data synchronization
            N.ds.instance(this, true);

            return this;
        };

        $.extend(Tree.prototype, {
            data : function(selFlag) {
                if(selFlag === undefined) {
                    return this.options.data.get();
                } else if(selFlag === false) {
                    return this.options.data;
                } else if(selFlag === "selected") {
                    var data = this.options.data;
                    if(arguments.length > 1) {
                        // clone arguments
                        var args = Array.prototype.slice.call(arguments, 0);
                        return this.options.context.find(".tree_active__").map(function() {
                            args[0] = data[N(this).closest("li").data("index")];
                            return N.json.mapFromKeys.apply(N.json, args);
                        }).get();
                    } else {
                        return this.options.context.find(".tree_active__").map(function() {
                            return data[N(this).closest("li").data("index")];
                        }).get();
                    }
                } else if(selFlag === "checked") {
                    var data = this.options.data;
                    if(arguments.length > 1) {
                        // clone arguments
                        var args = Array.prototype.slice.call(arguments, 0);
                        return this.options.context.find(":checked").map(function() {
                            args[0] = data[N(this).closest("li").data("index")];
                            return N.json.mapFromKeys.apply(N.json, args);
                        }).get();
                    } else {
                        return this.options.context.find(":checked").map(function() {
                            return data[N(this).closest("li").data("index")];
                        }).get();
                    }
                } else if(selFlag === "checkedInLastNode") {
                    var data = this.options.data;

                    if(arguments.length > 1) {
                        var args = Array.prototype.slice.call(arguments, 0);
                        return this.options.context.find(".tree_last_node__ :checked").map(function() {
                            args[0] = data[N(this).closest("li").data("index")];
                            return N.json.mapFromKeys.apply(N.json, args);
                        }).get();
                    } else {
                        return this.options.context.find(".tree_last_node__ :checked").map(function() {
                            return data[N(this).closest("li").data("index")];
                        }).get();
                    }
                }
            },
            context : function(sel) {
                return sel !== undefined ? this.options.context.find(sel) : this.options.context;
            },
            bind : function(data) {
                var opts = this.options;
                var self = this;

                //to rebind new data
                if(data != null) {
                    opts.data = N.type(data) === "array" ? N(data) : data;
                }

                var rootNode = N('<ul class="tree_level1_folder__"></ul>').appendTo(opts.context.empty());
                var isAleadyRoot = false;
                N(opts.data).each(function(i, rowData) {
                    if(rowData[opts.level] === 1 || !isAleadyRoot) {
                        rootNode.append('<li data-index="' + i + '" class="tree_' + rowData[opts.val] + '__ tree_level1_node__ tree_close__"><span class="tree_icon__"></span>' + (opts.checkbox ? '<span class="tree_check__"><input type="checkbox" /></span>' : '') + '<a class="tree_key__" href="#"><span>' + rowData[opts.key] + '</span></a><ul id="' + rowData[opts.val] + '" class="tree_level' + (opts.level !== null ? String(Number(rowData[opts.level]) + 1) : '') + '_folder__"></ul></li>');
                        isAleadyRoot = true;
                    } else {
                        rootNode.find("#" + rowData[opts.parent]).append('<li data-index="' + i + '" class="tree_' + rowData[opts.val] + '__ tree_level' + N.string.trimToEmpty(rowData[opts.level]) + '_node__ tree_close__"><span class="tree_icon__"></span>' + (opts.checkbox ? '<span class="tree_check__"><input type="checkbox" /></span>' : '') + '<a class="tree_key__" href="#"><span>' + rowData[opts.key] + '</span></a><ul id="' + rowData[opts.val] + '" class="tree_level' + (opts.level !== null ? String(Number(rowData[opts.level]) + 1) : '') + '_folder__"></ul></li>');
                    }
                });

                // add class to elements with no have chiidren
                var emptyUls = rootNode.find("ul:empty");
                emptyUls.parent().addClass("tree_last_node__");
                emptyUls.remove();

                // checkbox click event bind
                if(opts.checkbox) {
                    rootNode.on("click.tree", ".tree_check__ > :checkbox", function(e) {
                        var checkFlag;
                        var siblingNodesEle = N(this).closest("li").parent().children("li");
                        var parentNodesEle = N(this).parents("li");
                        var parentNodeEle = N(this).closest("ul").parent();
                        N(this).removeClass("tree_auto_parents_select__");
                        if(N(this).is(":checked")) {
                            N(this).parent().siblings("ul").find(":not(:checked)").prop("checked", true);
                            checkFlag = true;
                        } else {
                            N(this).parent().siblings("ul").find(":checked").prop("checked", false);
                            checkFlag = false;
                        }

                        var checkboxLength = siblingNodesEle.find(":checkbox").length;
                        var checkedLength = siblingNodesEle.find(":checked").length;
                        var parentNodeCheckboxEle = parentNodeEle.find("> span.tree_check__ > :checkbox");
                        var parentNodesCheckedEle = parentNodesEle.not(":first").find("> span.tree_check__ > :checkbox");
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
                            var closestLi = N(this).closest("li");
                            var checkedEle = N(this).closest("ul").find(".tree_last_node__ :checked");
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
                    var parentLi = N(this).parent("li");
                    if(opts.onSelect !== null) {
                        opts.onSelect.call(self, parentLi.data("index"), parentLi, opts.data[parentLi.data("index")]);
                    }
                    rootNode.find("li > a.tree_key__.tree_active__").removeClass("tree_active__");
                    N(this).addClass("tree_active__");
                });

                // icon click event bind
                rootNode.on("click.tree", ".tree_icon__" + (!opts.folderSelectable ? ", li:not('.tree_last_node__') .tree_key__" : ""), function(e) {
                    e.preventDefault();
                    var parentLi = N(this).parent("li");
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

                this.closeAll(true);

                return this;
            },
            val : function(row, key, val) {
                // TODO
                // notify
                return this;
            },
            select : function(val) {
                var opts = this.options;
                if(val !== undefined) {
                    opts.context.find(".tree_" + val + "__ > .tree_key__").trigger("click.tree");
                    return this;
                } else {
                    var activeNodeEle = opts.context.find(".tree_key__.tree_active__");
                    if(opts.data.length > 0 && activeNodeEle.length > 0) {
                        return opts.data[activeNodeEle.parent("li").data("index")][opts.val];
                    }
                }
            },
            check : function(vals) {
                // TODO
                return this;
            },
            openAll : function() {
                this.options.context.find("li.tree_close__:not(.tree_last_node__)").removeClass("tree_close__").addClass("tree_open__");
                return this;
            },
            closeAll : function(isFirstNodeOpen) {
                this.options.context.find("li.tree_open__:not(.tree_last_node__)").removeClass("tree_open__").addClass("tree_close__");
                if(isFirstNodeOpen) {
                    this.options.context.find("li.tree_close__:first").removeClass("tree_close__").addClass("tree_open__");
                }
                return this;
            },
            update : function(row, key) {
                // TODO
                return this;
            }
        });

    })(N);

})(window, jQuery);