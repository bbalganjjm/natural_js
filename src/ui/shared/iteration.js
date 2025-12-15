/**
 * Natural-JS UI Iteration
 * Simplified version - full implementation in original natural.ui.js lines 67-272
 */

import { trimToEmpty, endsWith } from '../../core/utils/string.js';

export class Iteration {
    static render(i, limit, delay, lastIdx, callType) {
        const opts = this.options;
        const self = this;

        // Clone row element
        const tempRowEleClone = self.tempRowEle.clone(true, true);
        opts.context.append(tempRowEleClone);

        // For row data bind (Note: requires Form component)
        // Simplified - actual implementation uses N(opts.data[i]).form()
        
        if(opts.rowHandlerBeforeBind !== null) {
            opts.rowHandlerBeforeBind.call(self, i, tempRowEleClone, opts.data[i]);
        }

        // form.bind() would be called here

        if(opts.rowHandler !== null) {
            opts.rowHandler.call(self, i, tempRowEleClone, opts.data[i]);
        }

        i++;
        if(opts.height === 0 || opts.scrollPaging.size === 0) {
            lastIdx = opts.data.length - 1;
        } else {
            lastIdx = opts.scrollPaging.idx + (limit - 1);
        }

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
                        Iteration.render.call(self, i, limit, delay, lastIdx, callType);
                    }, delay);
                } else {
                    Iteration.render.call(self, i, limit, delay, lastIdx, callType);
                }
            }
        } else if(i === lastIdx + 1) {
            if(opts.onBind !== null && !endsWith(trimToEmpty(callType), ".update")) {
                opts.onBind.call(self, opts.context, opts.data, i === opts.scrollPaging.size || opts.data.length <= opts.scrollPaging.size, i === opts.data.length);
            }
            opts.scrollPaging.limit = opts.scrollPaging.size === 0 ? opts.data.length : opts.scrollPaging.size;

            opts.isBinding = false;
            opts.context.dequeue("bind");
        }
    }

    static select(compNm) {
        const opts = this.options;
        const self = this;

        const lineTag = compNm === "grid" ? "tbody" : "li";

        opts.context.addClass(compNm + "_select__");

        opts.context.on("click." + compNm, ">" + lineTag, function(e) {
            const thisEle = jQuery(this);
            let isSelected;

            if(thisEle.hasClass(compNm + "_selected__")) {
                opts.row = -1;
                isSelected = false;
            } else {
                opts.row = opts.context.find(">" + lineTag).index(thisEle);
                isSelected = true;
            }

            if(!opts.multiselect && !opts.unselect) {
                opts.row = opts.context.find(">" + lineTag).index(thisEle);
                isSelected = true;
            }

            if(isSelected) {
                if(!opts.multiselect) {
                    opts.context.find("> " + lineTag + ":eq(" + opts.beforeRow + ")").removeClass(compNm + "_selected__");
                }
                thisEle.addClass(compNm + "_selected__");
                opts.beforeRow = opts.row;
            } else {
                thisEle.removeClass(compNm + "_selected__");
            }

            if(opts.onSelect !== null) {
                opts.onSelect.call(self, opts.row, thisEle, opts.data, opts.beforeRow, e);
            }
        });
    }

    static checkAll(compNm) {
        const opts = this.options;
        const contextEle = this.contextEle;

        const checkAll = compNm === "grid" ? this.thead.find(opts.checkAll) : jQuery(opts.checkAll);
        const cellTag = compNm === "grid" ? "tbody > tr > td" : "li";
        
        checkAll.on("click." + compNm + ".checkAll", function() {
            if(!jQuery(this).prop("checked")) {
                contextEle.find(cellTag + " " + opts.checkAllTarget + ":checked").removeProp("checked");
            } else {
                contextEle.find(cellTag + " " + opts.checkAllTarget + ":not(':checked')").prop("checked", true);
            }
        });
    }

    static move(fromRow, toRow, compNm) {
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
            }
        }

        return this;
    }
}

export default Iteration;
