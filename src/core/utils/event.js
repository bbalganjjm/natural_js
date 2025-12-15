/**
 * Natural-JS Event Utilities
 */

import { StringUtils } from './string.js';

export class EventUtils {
    /**
     * This function was taken from "https://stackoverflow.com/a/13952775" and modified.
     */
    static isNumberRelatedKeys(e) {
        e = (e) ? e : window.event;
        let key;
        const charsKeys = [
            97, // a Ctrl + a Select All
            65, // A Ctrl + A Select All
            99, // c Ctrl + c Copy
            67, // C Ctrl + C Copy
            118, // v Ctrl + v paste
            86, // V Ctrl + V paste
            115, // s Ctrl + s save
            83, // S Ctrl + S save
            112, // p Ctrl + p print
            80 // P Ctrl + P print
        ];

        const specialKeys = [
            8, // backspace
            9, // tab
            27, // escape
            13, // enter
            35, // Home & shiftKey + #
            36, // End & shiftKey + $
            37, // left arrow & shiftKey + %
            39, // right arrow & '
            46, // delete & .
            45 // Ins & -
        ];

        key = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;

        // check if pressed key is not number
        if (key && !((key >= 48 && key <= 57) || (key >= 96 && key <= 105))) {

            // Allow: Ctrl + char for action save, print, copy,
            // ...etc
            if ((e.ctrlKey && charsKeys.indexOf(key) !== -1) ||
                // Fix Issue: f1 : f12 Or Ctrl + f1 : f12, in
                // Firefox browser
                (navigator.userAgent.indexOf("Firefox") !== -1 && ((e.ctrlKey && e.keyCode && e.keyCode > 0 && key >= 112 && key <= 123) || (e.keyCode && e.keyCode > 0 && key && key >= 112 && key <= 123)))) {
                return true
            }
            // Allow: Special Keys
            else if (specialKeys.indexOf(key) !== -1) {
                // Fix Issue: right arrow & Delete & ins in FireFox
                if (navigator.userAgent.indexOf("Firefox") !== -1 && (key === 39 || key === 45 || key === 46)) {
                    return e.keyCode !== undefined && e.keyCode > 0;
                }
                // DisAllow : "#" & "$" & "%"
                else return !(e.shiftKey && (key === 35 || key === 36 || key === 37));
            }
            else {
                return false;
            }
        } else {
            return true;
        }
    }

    /**
     * Prevent all events
     */
    static disable(e) {
        try {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();
        } catch(e) {}
        return false;
    }

    /**
     * This method is locked window scroll when scrolling in the ele(arg1)
     */
    static windowScrollLock(ele) {
        ele.on("mousewheel.ui DOMMouseScroll.ui", function(e) {
            const delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
            if (delta > 0 && jQuery(this).scrollTop() <= 0) return false;
            return !(delta < 0 && jQuery(this).scrollTop() >= this.scrollHeight - jQuery(this).height());
        });
    }

    /**
     * Detect the duration of animation or transition of css3
     */
    static getMaxDuration(ele, css) {
        if(!ele.css(css) || ele.css(css).startsWith("0")) {
            return 0;
        }
        return Math.max.apply(undefined, jQuery(ele.css(css).split(",")).map(function() {
            if(this.indexOf("ms") > -1) {
                return parseInt(StringUtils.trimToZero(this));
            } else {
                return parseFloat(StringUtils.trimToZero(this)) * 1000;
            }
        }).get());
    }

    /**
     * Detect the end event name of CSS animations
     * Reference from David Walsh: http://davidwalsh.name/css-animation-callback
     */
    static whichAnimationEvent(ele){
        let el;
        if(ele !== undefined && ele.length > 0) {
            if(EventUtils.getMaxDuration(ele, "animation-duration") === 0) {
                return "nothing";
            }
            el = ele.get(0);
        } else {
            el = document.createElement("fakeelement");
        }

        const animations = {
            "animation" : "animationend",
            "OAnimation" : "oAnimationEnd",
            "MSAnimation" : "MSAnimationEnd",
            "WebkitAnimation" : "webkitAnimationEnd"
        };
        for(const t in animations){
            if( animations.hasOwnProperty(t) && el.style[t] !== undefined ){
                return animations[t];
            }
        }

        return "nothing";
    }

    /**
     * Detect the end event name of CSS transitions
     * Reference from David Walsh: http://davidwalsh.name/css-animation-callback
     */
    static whichTransitionEvent(ele){
        if(ele !== undefined) {
            if(EventUtils.getMaxDuration(ele, "transition-duration") === 0) {
                return "nothing";
            }
        }

        const el = document.createElement("fakeelement");
        const transitions = {
            "transition" : "transitionend",
            "OTransition" : "oTransitionEnd",
            "MozTransition" : "transitionend",
            "WebkitTransition" : "webkitTransitionEnd"
        };
        for(const t in transitions){
            if( transitions.hasOwnProperty(t) && el.style[t] !== undefined ){
                return transitions[t];
            }
        }

        return "nothing";
    }
}

// Export individual methods
export const { isNumberRelatedKeys, disable, windowScrollLock, getMaxDuration, whichAnimationEvent, whichTransitionEvent } = EventUtils;
