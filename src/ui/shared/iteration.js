/**
 * Natural-JS UI Iteration
 * Full implementation from natural.ui.js lines 67-272
 */

import { trimToEmpty, endsWith } from '../../core/utils/string.js';

// Import N at runtime to avoid circular dependency
const N = () => window.N;

export class Iteration {
    static render(i, limit, delay, lastIdx, callType) {
        const opts = this.options;
        const self = this;

        // clone li for create new row
        const tempRowEleClone = self.tempRowEle.clone(true, true);
        opts.context.append(tempRowEleClone);

        // for row data bind, use Form component
        const form = N()(opts.data[i]).form({
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
                N().grid.rowSpan.call(self, i, tempRowEleClone, opts.context.find("tbody:eq(" + (i-1) + ")"), opts.data[i], opts.data[i-1], String(this));
            });
        }

        i++;
        if(opts.height === 0 || opts.scrollPaging.size === 0 || (callType === "append" && opts.data.length > 0 && opts.data.length <= opts.scrollPaging.size)) {
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

        // set style class name to context element for select, multiselect options
        opts.context.addClass(compNm + "_select__");

        // bind tbody click event for select, multiselect options
        opts.context.on("click." + compNm, ">" + lineTag, function(e) {
            const thisEle = N()(this);
            let retFlag;
            let isSelected;

            if(!N()(e.target).is(opts.checkAllTarget) && !N()(e.target).is(opts.checkSingleTarget)) {
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
    }

    static checkAll(compNm) {
        const opts = this.options;
        const contextEle = this.contextEle;

        const checkAll = compNm === "grid" ? this.thead.find(opts.checkAll) : N()(opts.checkAll);
        const cellTag = compNm === "grid" ? "tbody > tr > td" : "li";
        checkAll.on("click." + compNm + ".checkAll", function() {
            if(!N()(this).prop("checked")) {
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
    }

    static checkSingle(compNm) {
        const opts = this.options;
        const contextEle = this.contextEle;

        const cellTag = compNm === "grid" ? "tbody > tr > td" : "li";
        contextEle.on("click.grid.checkSingleTarget", cellTag + " " + opts.checkSingleTarget, function() {
            contextEle.find(cellTag + " " + opts.checkSingleTarget).not(this).removeAttr("checked");
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
            } else {
                opts.currMoveToRow = toRow;
                opts.context.find(rowTag + ":eq(" + fromRow + ")").remove();
            }
        }

        return this;
    }

    static copy(fromRow, toRow, compNm) {
        if(fromRow !== toRow) {
            const opts = this.options;

            let insertPos;
            if(toRow > opts.data.length - 1) {
                insertPos = "after";
                toRow = opts.data.length - 1;
                opts.data.push(opts.data[fromRow]);
            } else {
                insertPos = "before";
                opts.data.splice(toRow, 0, opts.data[fromRow]);
            }

            const rowTag = compNm === "grid" ? "tbody" : "li";
            opts.context.find(rowTag + ":eq(" + toRow + ")")[insertPos](opts.context.find(rowTag + ":eq(" + fromRow + ")").clone(true, true));
        }

        return this;
    }
}

export default Iteration;
