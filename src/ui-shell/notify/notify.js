/**
 * Natural-JS Notify
 * Full version from natural.ui.shell.js lines 26-157
 */

import { error as createError, warn, log } from '../../core/helpers/logger.js';
import { type as getType, isPlainObject, isString, isEmptyObject } from '../../core/helpers/type-checker.js';
import { StringUtils } from '../../core/utils/string.js';
import { ElementUtils } from '../../core/utils/element.js';
import { BrowserUtils } from '../../core/utils/browser.js';
import { Context } from '../../architecture/context/context.js';
import { Controller } from '../../architecture/controller/controller.js';
import { Communicator } from '../../architecture/communication/communicator.js';
import { Formatter } from '../../data/formatter/formatter.js';
import { Alert } from '../../ui/components/alert/alert.js';
import { Popup } from '../../ui/components/popup/popup.js';
import { Tab } from '../../ui/components/tab/tab.js';

export class Notify {
        constructor(position, opts) {
            if(!isEmptyObject(position) && opts === undefined) {
                return new Notify(null, position);
            }

            this.options = {
                position : {
                    top : 10,
                    right : 10
                },
                container : jQuery("body"),
                context : null,
                displayTime : 7,
                alwaysOnTop : false,
                html : false,
                alwaysOnTopCalcTarget : "div, span, ul, p, nav, article, section, header, footer, aside",
            };

            try {
                jQuery.extend(this.options, Context.attr("ui.shell").notify);

                if(position) {
                    if(NC.isWrappedSet(position)) {
                        if(position.length > 0) {
                            this.options.position = position.get(0);
                        }
                    } else {
                        if(!isEmptyObject(position)) {
                            this.options.position = position;
                        }
                    }
                }
            } catch (e) {
                createError("Notify", e);
            }

            if(!isEmptyObject(opts)) {
                jQuery.extend(this.options, opts);
            }

            Notify.wrapEle.call(this);

            this.options.context.instance("notify", this);

            return this;
        };

        static add = function(msg, url) {
            (new Notify()).add(msg, url);
        };

        static wrapEle = function() {
            const opts = this.options;
            if(opts.container.find(".notify__").length > 0) {
                opts.context = opts.container.find(".notify__");
            } else {
                opts.context = jQuery("<div></div>").addClass("notify__").css({
                    "position" : "fixed"
                }).appendTo(opts.container);
            }
            if(opts.alwaysOnTop) {
                // get maximum "z-index" value
                opts.context.css("z-index", String(ElementUtils.maxZindex(jQuery(opts.alwaysOnTopCalcTarget)) + 1));
            }
        };

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        add(msg, url) {
            const opts = this.options;
            const self = this;

            opts.context.css({
                top : "",
                right : "",
                bottom : "",
                left : ""
            });
            opts.context.css(opts.position);

            const msgEle = jQuery(url !== undefined ? '<a href="#"></a>' : '<span></span>');
            msgEle[ opts.html ? "html" : "text" ](msg);

            if(url !== undefined) {
                msgEle.on("click.notify", function(e) {
                    e.preventDefault();
                    if(typeof url === "function") {
                        url.call(this);
                    } else {
                        if(StringUtils.startsWith(url, "#")) {
                            location.hash = url;
                        } else {
                            location.href = url;
                        }
                    }
                });
            }

            const msgBoxEle = jQuery("<div></div>", {
                "class" : "notify_msg__"
            }).css({
                "display": "none",
                "position" : "relative"
            }).append(msgEle).appendTo(opts.context).show().addClass("visible__");

            jQuery('<a href="#" class="notify_msg_close__" title="' + NC.message.get(opts.message, "close") + '"><span></span></a>')
                .appendTo(msgBoxEle).on("click.notify", function(e) {
                e.preventDefault();
                self.remove(msgBoxEle);
            });

            setTimeout(function() {
                self.remove(msgBoxEle);
            }, opts.displayTime * 1000);

            return this;
        };

        remove(msgBoxEle) {
            msgBoxEle.removeClass("visible__").addClass("hidden__");

            msgBoxEle.one(NC.event.whichTransitionEvent(msgBoxEle), function(e){
                jQuery(this).remove();
            }).trigger("nothing");

            return this;
        };

    }


export const notify = (...args) => new Notify(...args);
export default Notify;
