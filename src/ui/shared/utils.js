/**
 * Natural-JS UI Utils
 * Simplified version - full implementation in original natural.ui.js lines 413-447
 */

import { Context } from '../../architecture/context/context.js';

export class UIUtils {
    static wrapHandler(opts, compNm, eventNm) {
        const uiConfig = Context.attr("ui");
        if(uiConfig && uiConfig[compNm] && uiConfig[compNm][eventNm] && (opts && opts[eventNm])) {
            const localEventHandler = opts[eventNm];
            opts[eventNm] = function() {
                if(eventNm === "onBeforeBindValue") {
                    const rVal = localEventHandler.apply(this, arguments);
                    return uiConfig[compNm][eventNm].call(this, arguments[0], rVal);
                } else {
                    const rVal = localEventHandler.apply(this, arguments);
                    if(rVal === false) {
                        return rVal;
                    } else {
                        return uiConfig[compNm][eventNm].apply(this, arguments);
                    }
                }
            }
        }
    }

    static isTextInput(tagName, type) {
        return tagName === "textarea" || type === "text" || type === "password" || type === "hidden" || type === "file"
            || type === "number" || type === "tel" || type === "email" || type === "search" || type === "color"
            || type === "range"
            || type === "url";
    }
}

export default UIUtils;
