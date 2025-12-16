/**
 * Natural-JS UI Alert Component
 * Full version from original natural.ui.js lines 452-1136
 */

import { error as createError } from '../../../core/helpers/logger.js';
import { isEmptyObject } from '../../../core/helpers/type-checker.js';
import { ElementUtils } from '../../../core/utils/element.js';
import { BrowserUtils } from '../../../core/utils/browser.js';
import { EventUtils } from '../../../core/utils/event.js';
import { MessageUtils } from '../../../core/utils/message.js';
import { Context } from '../../../architecture/context/context.js';
import { UIUtils } from '../../shared/utils.js';
import { Draggable } from '../../shared/draggable.js';

// Import N at runtime to avoid circular dependency
const N = () => window.N;

export class Alert {
        constructor(obj, msg, vars) {
            this.options = {
                obj : obj,
                context : obj,
                container : null,
                msgContext : N()(),
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
                // 1. When Context.attr("ui").alert.container value is undefined
                this.options.container = Context.attr("architecture").page.context;
                // 2. If defined the Context.attr("ui").alert.container value this.options.container value is defined from Context's value
                jQuery.extend(true, this.options, Context.attr("ui").alert);

                if(isString(this.options.container)) {
                    this.options.container = N()(this.options.container);
                }
            } catch (e) {
                throw createError("Alert", e);
            }

            if(N()(this.options.container).length === 0) {
                throw createError("[Alert]Container element is missing. please specify the correct element selector that will contain the message dialog's element. it can be defined in the \"Context.attr(\"ui\").alert.container\" property of \"natural.config.js\" file.");
            }

            if (N()(obj).is(":input")) {
                this.options.isInput = true;
            }
            if(msg !== undefined && isPlainObject(msg)) {
                // Wraps the global event options in Context and event options for this component.
                UIUtils.wrapHandler(msg, "alert", "onOk");
                UIUtils.wrapHandler(msg, "alert", "onCancel");
                UIUtils.wrapHandler(msg, "alert", "onBeforeShow");
                UIUtils.wrapHandler(msg, "alert", "onShow");
                UIUtils.wrapHandler(msg, "alert", "onBeforeHide");
                UIUtils.wrapHandler(msg, "alert", "onHide");
                UIUtils.wrapHandler(msg, "alert", "onBeforeRemove");
                UIUtils.wrapHandler(msg, "alert", "onRemove");
                UIUtils.wrapHandler(msg, "alert", "okButtonOpts");
                UIUtils.wrapHandler(msg, "alert", "cancelButtonOpts");

                jQuery.extend(true, this.options, msg);
                if(isString(this.options.container)) {
                    this.options.container = N()(this.options.container);
                }
                // when the title option value is undefined
                // jQuery.extend method does not extend undefined value
                if(msg.hasOwnProperty("title")) {
                    this.options.title = msg.title;
                }
            }

            if(this.options.isWindow) {
                this.options.context = N()("body");
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
                maxZindex = ElementUtils.maxZindex(N()(opts.alwaysOnTopCalcTarget));
                blockOverlayCss["z-index"] = String(maxZindex + 1);
            }

            if (opts.overlayColor !== null) {
                blockOverlayCss["background-color"] = opts.overlayColor;
            }

            // create message overlay
            opts.msgContext = opts[opts.isWindow ? "container" : "context"][opts.isWindow ? "append" : "after"](N()('<div class="block_overlay__" onselectstart="return false;"></div>')
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
                titleBox = '<div class="msg_title_box__"><span class="msg_title__">' + opts.title + '</span><a href="#" class="msg_title_close_btn__"><span class="msg_title_close__" title="' + MessageUtils.get(opts.message, "close") + '"></span></a></div>';
            }

            // create button box elements
            let buttonBox = '';
            if(opts.button) {
                buttonBox = '<div class="buttonBox__">' +
                    '<button class="confirm__">' + MessageUtils.get(opts.message, "confirm") + '</button>' +
                    '<button class="cancel__">' + MessageUtils.get(opts.message, "cancel") + '</button>' +
                    '</div>';
            }

            // create message box elements
            opts.msgContents = opts.msgContext.after(
                N()('<div class="block_overlay_msg__">' +
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
                EventUtils.windowScrollLock(opts.msgContext);
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

                    if(!N()(dte !== undefined ? dte.target : e.target).is(".msg_title_close__") && (e.originalEvent.touches || (e.which || e.button) === 1)) {
                        pressed = true;
                        opts.msgContents.data("isMoved", true);

                        startX = (dte !== undefined ? dte.pageX : e.pageX)- opts.msgContents.offset().left;
                        startY = (dte !== undefined ? dte.pageY : e.pageY) - opts.msgContents.offset().top;

                        N()(window.document).on("dragstart.alert selectstart.alert", function() {
                            return false;
                        });

                        moved = true;
                        N()(window.document).on("mousemove.alert touchmove.alert", function() {
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

                        const documentWidth = N()(window.document).width();
                        N()(window.document).on("mouseup.alert touchend.alert", function() {
                            pressed = false;
                            if(opts.draggableOverflowCorrection) {
                                const offset = {};
                                const windowHeight = window.innerHeight ? window.innerHeight : N()(window).height();
                                const windowScrollTop = N()(window).scrollTop();
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
                                if(!isEmptyObject(offset)) {
                                    opts.msgContents.animate(offset, 200);
                                }
                            }

                            opts.msgContents.fadeTo(100, "1.0");
                            N()(window.document).off("dragstart.alert selectstart.alert mousemove.alert touchmove.alert mouseup.alert touchend.alert");
                        });
                    }
                });
            }
        };

        static resetOffSetEle = function(opts) {
            const position = opts.context.position();
            if(opts.context.is(":visible")) {
                const windowHeight = N()(window).height();
                const windowWidth = N()(window).width();
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
                        msgContentsCss["margin-top"] = String(N()(window).scrollTop()) + "px";
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

                    if(limitWidth > (window.innerWidth ? window.innerWidth : N()(window).width())) {
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

                    opts.msgContents.append('<a href="#" class="msg_close__" title="' + MessageUtils.get(opts.message, "close") + '"></a>');
                }
                if(opts.alwaysOnTop) {
                    opts.msgContents.css("z-index", ElementUtils.maxZindex(opts.container.find(opts.alwaysOnTopCalcTarget)) + 1);
                }

                const self = this;
                opts.msgContents.find(".msg_close__").on("click", function(e) {
                    e.preventDefault();
                    self.remove();
                });

                const ul_ = opts.msgContents.find(".msg_line_box__").empty();
                if (isArray(opts.msg)) {
                    opts.msgContents.find(".msg_line_box__").empty();
                    N()(opts.msg).each(function(i, msg_) {
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
            N()(".docs__>.docs_tab_context__").css("z-index", "0");

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
                    N()(window).off("resize.alert", opts.resizeHandler).on("resize.alert", opts.resizeHandler).trigger("resize.alert");
                }

                if(!opts.isWindow) {
                    opts.msgContext.closest(".msg_box__").css("position", "relative");
                }

                if(opts.button === true) {
                    opts.msgContents.find(".buttonBox__ .confirm__").get(0).focus();
                }

                opts.msgContents.removeClass("hidden__").addClass("visible__");

                opts.msgContents.one(EventUtils.whichTransitionEvent(opts.msgContents), function(){
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
                N()(document).off("keyup.alert", opts.keyupHandler).on("keyup.alert", opts.keyupHandler);
            }

            return this;
        };

        hide() {
            const opts = this.options;

            if (opts.onBeforeHide !== null) {
                opts.onBeforeHide.call(this, opts.msgContext, opts.msgContents);
            }

            // for NUS.docs transition effect
            N()(".docs__>.docs_tab_context__").css("z-index", "");

            if (!opts.isInput) {
                if(!opts.isWindow) {
                    opts.msgContext.closest(".msg_box__").css("position", "");
                }
                opts.msgContext.hide();

                opts.msgContents.removeClass("visible__").addClass("hidden__");
                opts.msgContents.one(EventUtils.whichTransitionEvent(opts.msgContents), function(){
                    opts.msgContents.hide();

                    if (opts.onHide !== null) {
                        opts.onHide.call(this, opts.msgContext, opts.msgContents);
                    }
                }).trigger("nothing");

            } else {
                opts.msgContents.removeClass("visible__").addClass("hidden__");
                opts.msgContents.one(EventUtils.whichTransitionEvent(opts.msgContents), function(){
                    clearTimeout(opts.iTime);
                    opts.msgContents.remove();

                    if (opts.onHide !== null) {
                        opts.onHide.call(this, opts.msgContext, opts.msgContents);
                    }
                }).trigger("nothing");
            }

            N()(window).off("resize.alert", opts.resizeHandler);
            if(opts.escClose) {
                N()(document).off("keyup.alert", opts.keyupHandler);
            }

            return this;
        };

        remove() {
            const opts = this.options;

            if (opts.onBeforeRemove !== null) {
                opts.onBeforeRemove.call(this, opts.msgContext, opts.msgContents);
            }

            // for NUS.docs transition effect
            N()(".docs__>.docs_tab_context__").css("z-index", "");

            if (!opts.isInput) {
                clearInterval(opts.time);
                if(!opts.isWindow) {
                    opts.msgContext.closest(".msg_box__").css("position", "");
                }
                opts.msgContext.remove();

                opts.msgContents.removeClass("visible__").addClass("hidden__");
                opts.msgContents.one(EventUtils.whichTransitionEvent(opts.msgContents), function(){
                    opts.msgContents.remove();

                    if(opts.msgContents.hasClass("popup__")) {
                        // Removes garbage instances from obserables of DataSync
                        GC.ds();
                    }

                    if (opts.onRemove !== null) {
                        opts.onRemove.call(this, opts.msgContext, opts.msgContents);
                    }
                }).trigger("nothing");
            } else {
                opts.msgContents.removeClass("visible__").addClass("hidden__");
                opts.msgContents.one(EventUtils.whichTransitionEvent(opts.msgContents), function(){
                    clearTimeout(opts.iTime);
                    opts.msgContents.remove();

                    if (opts.onRemove !== null) {
                        opts.onRemove.call(this, opts.msgContext, opts.msgContents);
                    }
                }).trigger("nothing");
            }

            N()(window).off("resize.alert", opts.resizeHandler);
            if(opts.escClose) {
                N()(document).off("keyup.alert", opts.keyupHandler);
            }
            return this;
        };
    }

    // Button


export const alert = (data, options) => new Alert(data, options);
export default Alert;
