/**
 * Natural-JS Notify
 * Full implementation from natural.ui.shell.js lines 26-157
 */

import { error as createError } from '../../core/helpers/logger.js';
import { isEmptyObject, isWrappedSet } from '../../core/helpers/type-checker.js';
import { startsWith } from '../../core/utils/string.js';
import { maxZindex } from '../../core/utils/element.js';
import { whichTransitionEvent } from '../../core/utils/event.js';
import { get as getMessage } from '../../core/utils/message.js';
import { Context } from '../../architecture/context/context.js';

// Import N at runtime to avoid circular dependency
const N = () => window.N;

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
            container : N()("body"),
            context : null,
            displayTime : 7,
            alwaysOnTop : false,
            html : false,
            alwaysOnTopCalcTarget : "div, span, ul, p, nav, article, section, header, footer, aside",
        };

        try {
            jQuery.extend(this.options, Context.attr("ui.shell").notify);

            if(position) {
                if(isWrappedSet(position)) {
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
            throw createError("Notify", e);
        }

        if(!isEmptyObject(opts)) {
            jQuery.extend(this.options, opts);
        }

        Notify.wrapEle.call(this);

        this.options.context.instance("notify", this);

        return this;
    }

    static add(msg, url) {
        (new Notify()).add(msg, url);
    }

    static wrapEle() {
        const opts = this.options;
        if(opts.container.find(".notify__").length > 0) {
            opts.context = opts.container.find(".notify__");
        } else {
            opts.context = N()("<div></div>").addClass("notify__").css({
                "position" : "fixed"
            }).appendTo(opts.container);
        }
        if(opts.alwaysOnTop) {
            // get maximum "z-index" value
            opts.context.css("z-index", String(maxZindex(N()(opts.alwaysOnTopCalcTarget)) + 1));
        }
    }

    context(sel) {
        return sel !== undefined ? this.options.context.find(sel) : this.options.context;
    }

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

        const msgEle = N()(url !== undefined ? '<a href="#"></a>' : '<span></span>');
        msgEle[ opts.html ? "html" : "text" ](msg);

        if(url !== undefined) {
            msgEle.on("click.notify", function(e) {
                e.preventDefault();
                if(typeof url === "function") {
                    url.call(this);
                } else {
                    if(startsWith(url, "#")) {
                        location.hash = url;
                    } else {
                        location.href = url;
                    }
                }
            });
        }

        const msgBoxEle = N()("<div></div>", {
            "class" : "notify_msg__"
        }).css({
            "display": "none",
            "position" : "relative"
        }).append(msgEle).appendTo(opts.context).show().addClass("visible__");

        N()('<a href="#" class="notify_msg_close__" title="' + getMessage(opts.message, "close") + '"><span></span></a>')
            .appendTo(msgBoxEle).on("click.notify", function(e) {
            e.preventDefault();
            self.remove(msgBoxEle);
        });

        setTimeout(function() {
            self.remove(msgBoxEle);
        }, opts.displayTime * 1000);

        return this;
    }

    remove(msgBoxEle) {
        msgBoxEle.removeClass("visible__").addClass("hidden__");

        msgBoxEle.one(whichTransitionEvent(msgBoxEle), function(e){
            N()(this).remove();
        }).trigger("nothing");

        return this;
    }
}

export const notify = (position, opts) => new Notify(position, opts);
export default Notify;
