/**
 * Natural-JS UI Draggable
 * Simplified version - full implementation in original natural.ui.js lines 274-375
 */

export class Draggable {
    static events(eventNameSpace, startHandler, moveHandler, endHandler) {
        const selfEle = this;

        this.on("mousedown" + eventNameSpace + " touchstart" + eventNameSpace, function(e) {
            const se = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
            if(e.originalEvent.touches || (e.which || e.button) === 1) {
                let isContinue;
                if(startHandler !== undefined) {
                    isContinue = startHandler.call(this, e, selfEle, se.pageX, se.pageY)
                }

                if(isContinue !== false) {
                    jQuery(document).on("mousemove" + eventNameSpace + " touchmove" + eventNameSpace, function(e) {
                        jQuery(document).on("dragstart" + eventNameSpace + " selectstart" + eventNameSpace, function() {
                            return false;
                        });

                        const me = e.originalEvent.touches ? e.originalEvent.touches[0] : e;

                        if(moveHandler !== undefined) {
                            moveHandler.call(this, e, selfEle, me.pageX, me.pageY);
                        }

                        if(!e.originalEvent.touches) {
                            e.preventDefault();
                        }
                    });

                    jQuery(document).on("mouseup" + eventNameSpace + " touchend" + eventNameSpace, function(e) {
                        jQuery(document).off("dragstart" + eventNameSpace + " selectstart" + eventNameSpace + " mousemove" + eventNameSpace + " touchmove" + eventNameSpace + " mouseup" + eventNameSpace + " touchend" + eventNameSpace);

                        if(endHandler !== undefined) {
                            endHandler.call(this, e, selfEle)
                        }

                        if(!e.originalEvent.touches) {
                            e.preventDefault();
                        }
                    });
                }
            }

            if(!e.originalEvent.touches) {
                e.preventDefault();
            }
        });
    }

    static moveX(x, min, max) {
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
        jQuery(propNm).each(function() {
            ele.css(this, "translateX(" + x + "px)");
        });
    }

    static moveY(y, min, max) {
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
        jQuery(propNm).each(function() {
            ele.css(this, "translateY(" + y + "px)");
        });
    }
}

export default Draggable;
