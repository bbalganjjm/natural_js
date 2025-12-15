/**
 * Natural-JS UI Button Component
 * Full version from original natural.ui.js lines 1137-1245
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

export class Button {
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
                jQuery.extend(this.options, Context.attr("ui").button);
            } catch (e) {
                throw createError("Button", e);
            }
            jQuery.extend(this.options, ElementUtils.toOpts(this.options.context));

            if(opts !== undefined) {
                // Wraps the global event options in NA.config and event options for this component.
                UIUtils.wrapHandler(opts, "button", "onBeforeCreate");
                UIUtils.wrapHandler(opts, "button", "onCreate");

                jQuery.extend(this.options, opts);
            }

            // set style class name to context element
            this.options.context.addClass("button__");

            if (this.options.onBeforeCreate) {
                this.options.onBeforeCreate.call(this, this.options.context, this.options);
            }

            Button.wrapEle.call(this);

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
                context.tpBind("click.button", EventUtils.disable);
            } else {
                context.prop("disabled", true);
            }
            context.addClass("btn_disabled__");
            return this;
        };

        enable() {
            const context = this.options.context;
            if (context.is("a")) {
                context.off("click", EventUtils.disable);
            } else {
                context.prop("disabled", false);
            }
            context.removeClass("btn_disabled__");
            return this;
        };

    }



export const button = (data, options) => new Button(data, options);
export default Button;
