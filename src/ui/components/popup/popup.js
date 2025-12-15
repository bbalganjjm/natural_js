/**
 * Natural-JS UI Popup Component
 * Full version from original natural.ui.js lines 2264-2575
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

export class Popup {

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
                jQuery.extend(true, this.options, Context.attr("ui").popup);
            } catch (e) {
                throw createError("Popup", e);
            }

            if(opts !== undefined) {
                if(getType(opts) === "string") {
                    this.options.url = opts;
                }
            } else {
                if(arguments.length === 1 && isPlainObject(obj)) {
                    opts = obj;
                    obj = jQuery(window);
                }
            }

            // Wraps the global event options in NA.config and event options for this component.
            UIUtils.wrapHandler(opts, "popup", "onOk");
            UIUtils.wrapHandler(opts, "popup", "onCancel");
            UIUtils.wrapHandler(opts, "popup", "onBeforeShow");
            UIUtils.wrapHandler(opts, "popup", "onShow");
            UIUtils.wrapHandler(opts, "popup", "onBeforeHide");
            UIUtils.wrapHandler(opts, "popup", "onHide");
            UIUtils.wrapHandler(opts, "popup", "onBeforeRemove");
            UIUtils.wrapHandler(opts, "popup", "onRemove");
            UIUtils.wrapHandler(opts, "popup", "onOpen");
            UIUtils.wrapHandler(opts, "popup", "onClose");
            UIUtils.wrapHandler(opts, "popup", "onLoad");

            jQuery.extend(true, this.options, opts);

            // To prevent "maximum call stack size exceeded" error in jQuery's extend method when define the opener option.
            if(isOpenerHas) {
                opts.opener = opener;
                this.options.opener = opts.opener;
                opener = undefined;
            }

            // if title option value is undefined
            this.options.title = opts !== undefined ? StringUtils.trimToNull(opts.title) : null;

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

            this.alert = jQuery(window).alert(opts);
            this.alert.options.msgContext.addClass("popup_overlay__");
            this.alert.options.msgContents.addClass("popup__");

            if(opts.saveMemory) {
                this.alert.options.msg = null;
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
                opts.context = jQuery(page);

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

                self.alert = jQuery(window).alert(opts);

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
                    // set caller attribute in Controller in tab content, that is Popup instance
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
                        warn("[Popup.popOpen]The onOpen event handler(" + opts.onOpen + ") is not defined on the Controller(NA.cont) of the Popup.");
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

        remove() {
            this.alert.remove();
            return this;
        }

    }

    // Tab


export const popup = (data, options) => new Popup(data, options);
export default Popup;
