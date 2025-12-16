/**
 * Natural-JS UI Grid Component
 * Full version from original natural.ui.js lines 4938-7007
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

export class Grid {

        constructor(data, opts) {
            this.options = {
                data : getType(data) === "array" ? N()(data) : data,
                row : -1, // selected row index
                beforeRow : -1, // before selected row index
                context : null,
                height : 0,
                fixedcol : 0,
                more : false, // true or column names array
                validate : true,
                html : false,
                addTop : true,
                addSelect : false,
                filter : false,
                resizable : false,
                vResizable : false,
                sortable : false,
                windowScrollLock : true,
                select : false,
                unselect : true,
                multiselect : false,
                checkAll : null, // selector
                checkAllTarget : null, // selector
                checkSingleTarget : null, // selector
                hover : false,
                revert : false,
                createRowDelay : 1,
                scrollPaging : {
                    idx : 0,
                    size : 100
                },
                fRules : null,
                vRules : null,
                appendScroll : true,
                addScroll : true,
                selectScroll : true,
                checkScroll : true,
                validateScroll : true,
                cache : true,
                tpBind : false,
                pastiable : false,
                rowHandlerBeforeBind : null,
                rowHandler : null,
                onBeforeSelect : null,
                onSelect : null,
                onBind : null,
                misc : {
                    resizableCorrectionWidth : 0,
                    resizableLastCellCorrectionWidth : 0,
                    resizeBarCorrectionLeft : 0,
                    resizeBarCorrectionHeight : 0,
                    fixedcolHeadMarginTop : 0,
                    fixedcolHeadMarginLeft : 0,
                    fixedcolHeadHeight : 0,
                    fixedcolBodyMarginTop : 0,
                    fixedcolBodyMarginLeft : 0,
                    fixedcolBodyBindHeight : 0,
                    fixedcolBodyAddHeight : 1,
                    fixedcolRootContainer : null // for mobile browser, input selector string
                },
                currMoveToRow : -1
            };

            try {
                jQuery.extend(true, this.options, Context.attr("ui").grid);
            } catch (e) {
                throw createError("Grid", e);
            }

            if (isPlainObject(opts)) {
                // Wraps the global event options in N().config and event options for this component.
                UIUtils.wrapHandler(opts, "grid", "onBeforeSelect");
                UIUtils.wrapHandler(opts, "grid", "onSelect");
                UIUtils.wrapHandler(opts, "grid", "onBind");

                //convert data to wrapped set
                opts.data = getType(opts.data) === "array" ? N()(opts.data) : opts.data;

                jQuery.extend(true, this.options, opts);

                //for scroll paging limit
                this.options.scrollPaging.limit = this.options.scrollPaging.size;

                if(getType(this.options.context) === "string") {
                    this.options.context = N()(this.options.context);
                }
            } else {
                this.options.context = N()(opts);
            }

            // If the value of the opts.scrollPaging.size value is greater than 0, the addTop option is unconditionally set to true.
            if(!this.options.addTop) {
                this.options.scrollPaging.size = 0;
                this.options.createRowDelay = 0;
            }

            // for bind "append"
            this.options.scrollPaging.defSize = this.options.scrollPaging.size;

            // set tbody template
            this.tempRowEle = this.options.context.find("> tbody").clone(true, true);

            // set style class name to context element
            this.options.context.addClass("grid__");
            // set style class name to context element for hover option
            if(this.options.hover) {
                this.options.context.addClass("grid_hover__");
            }

            // set selectable
            if(this.options.select || this.options.multiselect) {
                Iteration.select.call(this, "grid");
            }

            //remove colgroup when the resizable option is true
            if(this.options.resizable) {
                Grid.removeColgroup.call(this);
            }

            // view details
            if(this.options.more) {
                Grid.more.call(this);
            }

            // fixed header
            if(this.options.height > 0) {
                // fixed header
                Grid.fixHeader.call(this);
            }

            // create table cell element map
            this.tableMap = Grid.tableMap.call(this);

            // set tbody cell's id attribute into th cell in thead
            Grid.setTheadCellInfo.call(this);

            // set this.thead
            if (this.options.height > 0) {
                this.thead = this.options.context.closest(".grid_wrap__").find(">.thead_wrap__>table>thead");
            } else {
                this.thead = this.options.context.find(">thead");
            }

            // fixed column
            if(this.options.height === 0) {
                Grid.fixColumn.call(this);
            }

            // set context element
            this.contextEle = this.options.context;
            if(this.options.height > 0) {
                this.contextEle = this.options.context.closest("div.tbody_wrap__ > .grid__");
            }

            // set rowspan column info
            this.rowSpanIds = this.thead.find("th:regexp(data:rowspan,true)").map(function() {
                return N()(this).data("id");
            });

            // set function for check all checkbox in list
            if(this.options.checkAll !== null && this.options.checkAllTarget !== null) {
                Iteration.checkAll.call(this, "grid");
            } else {
                if(this.options.checkSingleTarget !== null) {
                    // set function for check single checkbox in list
                    Iteration.checkSingle.call(this, "grid");
                }
            }

            // sortable, v(ertical)Resizable
            if(this.options.sortable) {
                Grid.sort.call(this);
            }

            // resizable column width
            if(this.options.resizable) {
                Grid.resize.call(this);
            }

            // data filter
            if(this.options.filter || this.thead.find("> tr th[data-filter='true']").length > 0) {
                if(this.options.filter) {
                    this.thead.find("> tr th").attr("data-filter", "true");
                }
                Grid.dataFilter.call(this);
            }

            if(this.options.pastiable) {
                Grid.paste.call(this);
            }

            // set this instance to context element
            this.options.context.instance("grid", this);

            // register this to DataSync for realtime data synchronization
            DataSync.instance(this, true);

            return this;
        };

        /**
         * Convert HTML Table To 2D Array
         * Reference from CHRIS WEST'S BLOG : http://cwestblog.com/2016/08/21/javascript-snippet-convert-html-table-to-2d-array/
         */
        static tableCells = function(tbl, opt_cellValueGetter) {
            const rows = tbl.find(">tr");
            opt_cellValueGetter = opt_cellValueGetter || function(td) { return td.textContent || td.innerText; };
            const twoD = [];
            let rowCount = rows.length;
            for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
                twoD.push([]);
            }
            for (let rowIndex = 0, tr; rowIndex < rowCount; rowIndex++) {
                const tr = rows[rowIndex];
                for (let colIndex = 0, colCount = tr.cells.length, offset = 0; colIndex < colCount; colIndex++) {
                    const td = tr.cells[colIndex], text = opt_cellValueGetter(td, colIndex, rowIndex, tbl);
                    while (twoD[rowIndex].hasOwnProperty(colIndex + offset)) {
                        offset++;
                    }
                    for (let i = 0, colSpan = parseInt(td.colSpan, 10) || 1; i < colSpan; i++) {
                        for (let j = 0, rowSpan = parseInt(td.rowSpan, 10) || 1; j < rowSpan; j++) {
                            N()(td).addClass("col_" + (colIndex + offset + i) + "__");
                            if(twoD[rowIndex + j] !== undefined) {
                                twoD[rowIndex + j][colIndex + offset + i] = td;
                            } else {
                                warn("[Grid.tableCells]The rowspan property of table is defined incorrectly.");
                            }
                        }
                    }
                }
            }
            return twoD;
        };

        static tableMap = function() {
            const opts = this.options;

            const colgroup = [];
            let thead;
            let tfoot;

            if(opts.context.find("> colgroup").length > 0) {
                colgroup.push(opts.context.find("> colgroup > col").each(function(i) {
                    N()(this).addClass("col_" + String(i) + "__");
                }).get());
            }

            if(opts.height > 0) {
                if(opts.context.find("> colgroup").length > 0) {
                    colgroup.unshift(opts.context.closest(".grid_wrap__").find(">.thead_wrap__>table>colgroup>col").each(function(i) {
                        N()(this).addClass("col_" + String(i) + "__");
                    }).get());
                    colgroup.push(opts.context.closest(".grid_wrap__").find(">.tfoot_wrap__>table>colgroup>col").each(function(i) {
                        N()(this).addClass("col_" + String(i) + "__");
                    }).get());
                }
                thead = Grid.tableCells(opts.context.closest(".grid_wrap__").find(">.thead_wrap__>table>thead"));
                thead = thead.concat(Grid.tableCells(opts.context.closest(".grid_wrap__").find("> .tbody_wrap__>table>thead")));
                tfoot = Grid.tableCells(opts.context.closest(".grid_wrap__").find(">.tfoot_wrap__>table>tfoot"));
            } else {
                thead = Grid.tableCells(opts.context.find("> thead"));
                tfoot = Grid.tableCells(opts.context.find("> tfoot"));
            }

            return {
                colgroup : colgroup,
                thead : thead,
                tbody : Grid.tableCells(this.tempRowEle),
                tfoot : tfoot
            };
        };

        static setTheadCellInfo = function() {
            const opts = this.options;
            const tableMap = this.tableMap;
            if(tableMap.thead.length === 0) {
                return;
            }
            let nextCnt = 0;
            N()(tableMap.tbody).each(function(i, cells) {
                N()(cells).each(function(j, cell) {
                    if(tableMap.thead[i+nextCnt] === undefined || tableMap.thead[i+nextCnt][j] === undefined) {
                        return false;
                    }
                    let theadCell = N()(tableMap.thead[i+nextCnt][j]);
                    const tbodyCell = N()(cell);

                    if(nextCnt === 0 && tbodyCell.attr("colspan") !== theadCell.attr("colspan")) {
                        theadCell = N()(tableMap.thead[i+1][j]);
                    }

                    if(tbodyCell.attr("colspan") === theadCell.attr("colspan")) {
                        let id = tbodyCell.attr("id");
                        if(id === undefined) {
                            id = tbodyCell.find("[id]").attr("id");
                        }
                        if(id !== undefined) {
                            theadCell.data("id", id);
                        }
                    } else {
                        nextCnt++;
                        return true;
                    }
                });
            });
        };

        static removeColgroup = function() {
            const opts = this.options;
            if(opts.context.find("colgroup").length > 0) {
                const theadMap = Grid.tableCells(opts.context.find("> thead"));
                let tfootMap;
                if(opts.height > 0) {
                    tfootMap = Grid.tableCells(opts.context.find("> tfoot"));
                }

                opts.context.find("colgroup>col").each(function(i, colEle) {
                    N()(theadMap).each(function(j, rowEles) {
                        if(N()(rowEles[i]).attr("colspan") === undefined) {
                            N()(rowEles[i]).css("width", colEle.style.width).removeAttr("scope");
                        }
                    })

                    if(opts.height > 0) {
                        N()(tfootMap).each(function(j, rowEles) {
                            if(N()(rowEles[i]).attr("colspan") === undefined) {
                                N()(rowEles[i]).css("width", colEle.style.width).removeAttr("scope");
                            }
                        })
                    }
                }).parent().remove();
            }
        };

        static fixColumn = function() {
            const opts = this.options;
            const self = this;

            if(opts.fixedcol > 0) {
                opts.context.width("auto").css({
                    "table-layout" : "fixed",
                    "width" : self.thead.find("> tr > th").toArray().splice(opts.fixedcol).reduce(function(sum, ele) {
                        return sum + parseInt(window.getComputedStyle(ele,null).getPropertyValue("width"));
                    }, 0)
                });

                const gridWrap = opts.context.wrap(N()("<div/>", {
                    "css" : { "overflow-x" : (BrowserUtils.is("ios") ? "scroll" : "auto") },
                    "class" : "grid_wrap__"
                })).parent("div");

                const gridContainer = gridWrap.wrap(N()("<div/>", {
                    "class" : "grid_container__"
                })).parent("div");

                if(opts.misc.fixedcolRootContainer === null) {
                    gridContainer.css("position", "relative");
                } else {
                    opts.context.closest(opts.misc.fixedcolRootContainer).css("position", "relative");
                }

                const theadTrHeight = self.thead.find("> tr").height();
                self.thead.find("> tr").height(theadTrHeight);

                let cellLeft = 0;
                let leftMargin = 0;
                for(let i=0;i<opts.fixedcol;i++) {
                    let targetTheadCellEle;
                    let targetTbodyCellEle;

                    targetTheadCellEle = N()(self.tableMap.thead).map(function() {
                        return this[i];
                    }).addClass("grid_head_fixed__");
                    targetTbodyCellEle = N()(self.tableMap.tbody).map(function() {
                        return this[i];
                    }).addClass("grid_body_fixed__");

                    const cellWidth = targetTheadCellEle.outerWidth();
                    const borderLeftWidth = parseInt(targetTheadCellEle.css("border-left-width"));
                    const theadBorderTopWidth = parseInt(targetTheadCellEle.css("border-top-width"));
                    leftMargin += (cellWidth - borderLeftWidth + opts.misc.fixedcolHeadMarginLeft);

                    targetTheadCellEle.css({
                        "position" : "absolute",
                        "margin-top" : (-theadBorderTopWidth + opts.misc.fixedcolHeadMarginTop) + "px",
                        "box-sizing" : "border-box",
                        "width" : cellWidth + "px",
                        "height" : (theadTrHeight + theadBorderTopWidth + opts.misc.fixedcolHeadHeight) + "px"
                    });
                    targetTbodyCellEle.css({
                        "position" : "absolute",
                        "margin-top" : opts.misc.fixedcolBodyMarginTop + "px",
                        "box-sizing" : "border-box",
                        "width" : cellWidth + "px"
                    });

                    if(targetTheadCellEle.prev().length > 0) {
                        cellLeft += targetTheadCellEle.prev().outerWidth() - borderLeftWidth + opts.misc.fixedcolBodyMarginLeft;
                    }

                    targetTheadCellEle.css({
                        "left" : cellLeft + "px"
                    });
                    targetTbodyCellEle.css({
                        "left" : cellLeft + "px"
                    });

                    // remove colgroup's first col elements width
                    if(self.tableMap.colgroup.length > 0) {
                        N()(self.tableMap.colgroup).each(function() {
                            if(i === 0) {
                                N()(this[i]).width(0);
                            } else {
                                N()(this[i]).hide();
                            }
                        });
                    }
                }

                gridWrap.css("margin-left", leftMargin);
            }
        };

        static fixHeader = function() {
            const opts = this.options;

            opts.context.css({
                "table-layout" : "fixed",
                "margin" : "0"
            });

            const sampleCell = opts.context.find(">tbody td:eq(0)");
            let borderLeftWidth = sampleCell.css("border-left-width");
            if(parseInt(borderLeftWidth) < 1) {
                borderLeftWidth = "1px"; // for IE
            }
            const borderLeft = borderLeftWidth + " " + sampleCell.css("border-left-style") + " " + sampleCell.css("border-left-color");
            let borderBottomWidth = sampleCell.css("border-bottom-width");
            if(parseInt(borderBottomWidth) < 1) {
                borderBottomWidth = "1px"; // for IE
            }
            const borderBottom = borderBottomWidth + " " + sampleCell.css("border-bottom-style") + " " + sampleCell.css("border-bottom-color");

            // Root grid container
            const gridWrap = opts.context.wrap('<div class="grid_wrap__"/>').parent();
            gridWrap.css({
                "border-left" : borderLeft
            });

            const scrollbarWidth = BrowserUtils.scrollbarWidth();

            // When opts.context overflows gridWrap
            // if gridWrap.width() is 0, opts.context's display style is none or invisible element.
            if(gridWrap.width() > 0 && opts.context.width() > gridWrap.width()) {
                gridWrap.width(opts.context.width() + scrollbarWidth);
            }

            //Create grid header
            const contextClone = opts.context.clone(true, true);
            const theadClone = opts.context.find("> thead").clone();
            contextClone.find(">thead").remove();
            contextClone.find(">tbody").remove();
            contextClone.find(">tfoot").remove();
            contextClone.append(opts.context.find("> thead"));
            const theadWrap = contextClone.wrap('<div class="thead_wrap__"/>').parent().css({
                "padding-right" : scrollbarWidth + "px",
                "margin-left" : "-1px"
            });
            gridWrap.prepend(theadWrap);

            opts.context.append(theadClone);
            //Create grid body
            opts.context.find("> thead th").empty().css({
                "height" : "0",
                "padding-top" : "0",
                "padding-bottom" : "0",
                "border-top" : "none",
                "border-bottom" : "none"
            });
            opts.context.find("> tbody td").css({
                "border-top" : "none"
            });
            this.tempRowEle.find("td").css({
                "border-top" : "none"
            });
            const contextWrapEle = opts.context.wrap('<div class="tbody_wrap__"/>').parent().css({
                "height" : String(opts.height) + "px",
                "overflow-y" : "scroll",
                "overflow-x" : "hidden",
                "margin-left" : "-1px"
            });

            if(opts.context.find("> tfoot").length === 0) {
                contextWrapEle.css("border-bottom", borderBottom);
            }

            if(opts.windowScrollLock) {
                EventUtils.windowScrollLock(contextWrapEle);
            }

            // Scroll paging
            const self = this;
            const defSPSize = opts.scrollPaging.limit;
            let rowEleLength;
            Scroll.paging.call(self, contextWrapEle, defSPSize, rowEleLength, "> tbody", "grid.bind");

            // Create grid footer
            let tfootWrap;
            if(opts.context.find("> tfoot").length > 0) {
                const contextClone = opts.context.clone(true, true);
                contextClone.find(">thead").remove();
                contextClone.find(">tbody").remove();
                contextClone.find(">tfoot").remove();
                contextClone.append(opts.context.find("> tfoot"));
                tfootWrap = contextClone.wrap('<div class="tfoot_wrap__"/>').parent().css({
                    "padding-right" : scrollbarWidth + "px",
                    "margin-left" : "-1px"
                });
                gridWrap.append(tfootWrap);
            }

            // Vertical height resizing
            if(opts.vResizable) {
                Grid.vResize.call(this, gridWrap, contextWrapEle, tfootWrap);
            }
        };

        static vResize = function(gridWrap, contextWrapEle, tfootWrap) {
            let pressed = false;
            const vResizable = N()('<div class="v_resizable__"></div>').css({
                "text-align": "center",
                "cursor": "n-resize",
                "margin-bottom": gridWrap.css("margin-bottom")
            });
            gridWrap.css("margin-bottom", "0");

            let currHeight, contextWrapOffset, tfootHeight = 0;
            let eventNameSpace = ".grid.vResize";
            Draggable.events.call(vResizable, eventNameSpace, function(e, tabContainerEle_, pageX, pageY) { // start
                if(tfootWrap !== undefined) {
                    tfootHeight = tfootWrap.height();
                }
                contextWrapOffset = contextWrapEle.offset();
            }, function(e, tabContainerEle_, pageX, pageY) { // move
                currHeight = (pageY - contextWrapOffset.top - tfootHeight) + "px";
                contextWrapEle.css({
                    "height" : currHeight,
                    "max-height" : currHeight
                });
            });

            vResizable.on("mousedown.grid.vResize touchstart.grid.vResize", function(e) {
                if(e.originalEvent.touches) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                if(e.originalEvent.touches || (e.which || e.button) === 1) {

                    N()(document).on("dragstart.grid.vResize selectstart.grid.vResize", function() {
                        return false;
                    });
                    pressed = true;

                    N()(window.document).on("mousemove.grid.vResize touchmove.grid.vResize", function(e) {
                        let mte;
                        if(e.originalEvent.touches) {
                            e.stopPropagation();
                            mte = e.originalEvent.touches[0];
                        }
                        if(pressed) {
                            currHeight = ((mte !== undefined ? mte.pageY : e.pageY) - contextWrapOffset.top - tfootHeight) + "px";
                            contextWrapEle.css({
                                "height" : currHeight,
                                "max-height" : currHeight
                            });
                        }
                    });

                    N()(window.document).on("mouseup.grid.vResize touchend.grid.vResize", function(e) {
                        N()(document).off("dragstart.grid.vResize selectstart.grid.vResize mousemove.grid.vResize touchmove.grid.vResize mouseup.grid.vResize touchend.grid.vResize");
                        pressed = false;
                    });
                }
            });

            gridWrap.after(vResizable);
        };

        static more = function() {
            const opts = this.options;
            const self = this;

            if(opts.more === true) {
                opts.more = self.tempRowEle.find("[id]").map(function() {
                    return N()(this).attr("id");
                }).get();
            }


            // Append col element to colgroup
            if(opts.context.find("> colgroup").length > 0) {
                opts.context.find("> colgroup").append('<col class="grid_more_colgroup_col__">')
            }

            // Column for hide and show button.
            let theadCol;
            const theadRowCnt = Grid.tableCells(opts.context.find(">thead")).length;
            if(theadRowCnt > 0) {
                theadCol = N()('<th></th>').addClass("grid_more_thead_col__");
                if(theadRowCnt > 1) {
                    theadCol.attr("rowspan", String(theadRowCnt));
                }
            }
            // Hide and show button.
            const colShowHideBtn = N()('<a href="#" title="' + N().message.get(opts.message, "showHide") + '"><span></span></a>').addClass("grid_col_show_hide_btn__").appendTo(theadCol);
            // Append column to tr in thead
            if(theadCol !== undefined) {
                opts.context.find(">thead > tr:first").append(theadCol);
            }

            // Column for detail popup button.
            let tbodyCol;
            const tbodyRowCnt = Grid.tableCells(this.tempRowEle).length;
            if(tbodyRowCnt > 0) {
                tbodyCol = N()('<td></td>').addClass("grid_more_tbody_col__");
                if(tbodyRowCnt > 1) {
                    tbodyCol.attr("rowspan", String(tbodyRowCnt));
                }
            }
            // Detail popup button.
            const moreBtn = N()('<a href="#" title="' + N().message.get(opts.message, "more") + '"><span></span></a>').addClass("grid_more_btn__").appendTo(tbodyCol);
            // Append column to tr in tbody
            if(tbodyCol !== undefined) {
                self.tempRowEle.find("> tr:first").append(tbodyCol);
            }

            // Empty column in tfoot
            let tfootCol;
            const tfootRowCnt = Grid.tableCells(opts.context.find(">tfoot")).length;
            if(tfootRowCnt > 0) {
                tfootCol = N()('<td></td>').addClass("grid_more_tfoot_col__")
                if(tfootRowCnt > 1) {
                    tfootCol.attr("rowspan", String(tfootRowCnt));
                }
            }
            // Append column to tr in tfoot
            if(tfootCol !== undefined) {
                opts.context.find(">tfoot > tr:first").append(tfootCol);
            }

            const excludeThClasses = ".btn_data_filter_full__, .data_filter_panel__, .btn_data_filter__, .resize_bar__, .sortable__";

            // Hide and show panel
            const panel = N()('<div class="grid_more_panel__ hidden__">'
                +   '<div class="grid_more_checkall_box__"><label><input type="checkbox">' + N().message.get(opts.message, "selectAll") + '<span class="grid_more_total_cnt__"></span></label></div>'
                +   '<ul class="grid_more_col_list__"></ul>'
                + '</div>');
            colShowHideBtn.after(panel);

            let gridMoreColList;

            // Hide and show panel's checkbox click event
            panel.find(".grid_more_checkall_box__ :checkbox").on("click.grid.more", function() {
                const thisEle = N()(this);
                if(thisEle.is(":checked")) {
                    gridMoreColList.find("input[name='hideshow']:not(':checked')").trigger("click");
                } else {
                    gridMoreColList.find("input[name='hideshow']:checked").trigger("click");
                }
            });

            const calibDialogItems = function(currPanel) {
                if(gridMoreColList.find("input[name='hideshow']").length === gridMoreColList.find("input[name='hideshow']:checked").length) {
                    currPanel.find(".grid_more_checkall_box__ :checkbox").prop("checked", true);
                } else {
                    currPanel.find(".grid_more_checkall_box__ :checkbox").prop("checked", false);
                }
            };

            // Hide and show button event.
            colShowHideBtn.on("click.grid.more", function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                const thisBtn = N()(this);
                const panel = thisBtn.next(".grid_more_panel__ ");

                if(self.tableMap.thead.length > 0 && gridMoreColList === undefined) {
                    gridMoreColList = panel.find(".grid_more_col_list__");
                    gridMoreColList.on("click.grid.more", "input[name='hideshow']", function() {
                        const thisEle = N()(this);
                        if(!thisEle.is(":checked")) {
                            self.hide(parseInt(thisEle.val()));
                        } else {
                            self.show(parseInt(thisEle.val()));
                        }
                        calibDialogItems(panel);
                    });

                    N()(self.tableMap.thead[0]).each(function(i) {
                        const thisEleClone = N()(this).clone();
                        if(!thisEleClone.hasClass("grid_more_thead_col__")) {
                            thisEleClone.find(excludeThClasses).remove();
                            const cols = N()('<li class="grid_more_cols__" title="' + String(i+1) + '">'
                                + '<label><input name="hideshow" type="checkbox" checked="checked" value="' + String(i) + '">'
                                + String(i+1) + " " + N().message.get(opts.message, "column") + '</label></li>')
                                .appendTo(gridMoreColList);
                        }
                    });

                    calibDialogItems(panel);
                }

                N()(document).off("click.grid.more");
                N()(document).on("click.grid.more", function(e) {
                    if(N()(e.target).parents(".grid_more_panel__, .grid_col_show_hide_btn__").length === 0 && !jQuery(e.target).hasClass("grid_col_show_hide_btn__")) {
                        panel.removeClass("visible__").addClass("hidden__");
                        panel.one(EventUtils.whichTransitionEvent(panel), function(){
                            panel.hide();

                            // The touchstart event is not removed when using the one method
                            N()(document).off("click.grid.more touchstart.grid.more");
                        }).trigger("nothing");
                    }
                });

                panel.show(0, function() {
                    N()(this).removeClass("hidden__").addClass("visible__");
                });
            });

            // Detail popup button event.
            opts.context.on("click.grid.more", ".grid_more_tbody_col__ .grid_more_btn__", function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                let rowIdx = opts.context.find(">tbody").index(N()(this).closest("tbody.form__"));

                const morePopupContects = N()("<div></div>").addClass("grid_more_popup_contents__");
                const moreContents = N()("<div></div>").addClass("grid_more_contents__").appendTo(morePopupContects).css({
                    "overflow-y" : "auto",
                    "max-height" : (N()(window).height() - 200) + "px"
                });
                const table = N()("<table></table>").appendTo(moreContents);
                const tbody = N()("<tbody></tbody>").appendTo(table);
                N()(opts.more).each(function() {
                    const tr = N()("<tr></tr>").appendTo(tbody);
                    const filteredThClone = self.thead.find(">tr > th:regexp(data:id, " + this + ")").clone();
                    filteredThClone.find(excludeThClasses).remove();
                    filteredThClone.removeAttr("rowspan").removeAttr("colspan");
                    const th = N()("<th></th>", {
                        text : filteredThClone.text()
                    }).appendTo(tr);

                    const td = opts.context.find(">tbody:eq(" + rowIdx + ") #" + this);
                    if(td.is("td")) {
                        td.clone().removeAttr("rowspan").removeAttr("colspan").removeAttr("class").removeAttr("style").appendTo(tr);
                    } else {
                        if(td.hasClass("datepicker__")) {
                            td.next(".datepicker_contents__").remove();
                        }

                        const tdClone = td.closest("td").clone();
                        tdClone.find(".datepicker__").removeClass("datepicker__");

                        tdClone.removeAttr("rowspan").removeAttr("colspan").removeAttr("class").removeAttr("style").appendTo(tr);
                    }
                });

                const form = opts.data.form(moreContents).unbind().bind(rowIdx);

                const btnBox = N()('<div class="btn_box__"></div>').appendTo(morePopupContects);
                const prevBtn = N()('<a href="#" class="prev_btn__">' + N().message.get(opts.message, "prev") + '</a>').on("click.grid.more", function(e) {
                    e.preventDefault();

                    if(rowIdx > 0 && form.validate()) {
                        rowIdx -= 1;
                        form.bind(rowIdx);
                        page.text(String(rowIdx + 1));
                    }
                }).appendTo(btnBox);
                prevBtn.button({
                    type: "outlined",
                    size: "medium"
                });
                const page = N()('<span class="page__">' + String(rowIdx + 1) +'</span>').appendTo(btnBox);
                const nextBtn = N()('<a href="#" class="next_btn__">' + N().message.get(opts.message, "next") + '</a>').on("click.grid.more", function(e) {
                    e.preventDefault();

                    if(rowIdx + 1 < form.data().length && form.validate()) {
                        rowIdx += 1;
                        form.bind(rowIdx);
                        page.text(String(rowIdx + 1));
                    }
                }).appendTo(btnBox);
                nextBtn.button({
                    type: "outlined",
                    size: "medium"
                });

                morePopupContects.popup({
                    title : N().message.get(opts.message, "more"),
                    closeMode : "remove",
                    button : false,
                    draggable : true,
                    alwaysOnTop : true,
                    onCancel : function() {
                        if(!form.validate()) {
                            return 0;
                        }
                    }
                }).open();
            });
        };

        static resize = function() {
            const self = this;
            // TODO colgroup
            // const tableMap = this.tableMap;

            // if(tableMap.colgroup.length > 0) {
            /*
            Draggable.events.call(docsTabs, ".docs.scroll", function(e, ele, x, y) { // start

            }, function(e, ele, x, y) { // move
                Draggable.moveX.call(ele, x);
            }, function(e, ele) { //end

            });
            */
            // } else {
            let resizeBar, currResizeBar, resizeBarHeight, cellEle, currCellEle, currNextCellEle, targetCellEle, targetNextCellEle,
                targetTfootCellEle, targetNextTfootCellEle, currResizeBarEle,
                defWidth, nextDefWidth, currWidth, nextCurrWidth, startOffsetX,
                minPx, maxPx, defPx, movedPx;

            const opts = this.options;
            const theadCells = this.thead.find("> tr th:not(.grid_head_fixed__)");
            let isPressed = false;
            const scrollbarWidth = BrowserUtils.scrollbarWidth();

            if(BrowserUtils.is("safari")){
                theadCells.css("padding-left", "0");
                theadCells.css("padding-right", "0");
            }

            if(opts.context.css("table-layout") !== "fixed") {
                opts.context.css("table-layout", "fixed");
            }

            const resizeBarWidth = 5;
            const resizeBarCorrectionHeight = BrowserUtils.is("ie") ? -2 : 0;
            let context;
            if (opts.height > 0) {
                context = opts.context.closest(".grid_wrap__");
            } else {
                context = opts.context;
            }

            this.thead.on("mouseover.grid.resize touchstart.grid.resize", function() {
                resizeBarHeight = (opts.height > 0 ? self.contextEle.closest(".grid_wrap__").height() - 3 : self.contextEle.height() + resizeBarCorrectionHeight) + 1 + opts.misc.resizeBarCorrectionHeight;
                let lastResizeBar = theadCells.each(function() {
                    const cellEle = N()(this);
                    cellEle.find("> .resize_bar__").css({
                        "top" : cellEle.position().top + 1,
                        "left" : (cellEle.position().left + cellEle.outerWidth() - resizeBarWidth / 2 + opts.misc.resizeBarCorrectionLeft) + "px"
                    });
                }).last().find("> .resize_bar__");
                lastResizeBar.css({
                    "left" : parseInt(lastResizeBar.css("left")) - (resizeBarWidth / 2)
                })
                lastResizeBar = undefined;
            });

            let isFirstTimeLastClick = true;
            theadCells.each(function() {
                cellEle = N()(this);
                resizeBar = N()('<div class="resize_bar__"></div>').css({
                    "padding": "0px",
                    "position": "absolute",
                    "width": resizeBarWidth + "px",
                    "height": String(cellEle.outerHeight()) + "px",
                    "opacity": "0"
                }).appendTo(cellEle);

                resizeBar.on("mousedown.grid.resize touchstart.grid.resize", function(e) {
                    let dte;
                    if(e.originalEvent.touches) {
                        dte = e.originalEvent.touches[0];
                    }

                    if(e.originalEvent.touches || (e.which || e.button) === 1) {
                        N()(this).css({
                            "opacity": ""
                        }).animate({
                            "height" : resizeBarHeight + "px"
                        }, 150);

                        startOffsetX = dte !== undefined ? dte.pageX : e.pageX;
                        currResizeBarEle = N()(this);
                        currCellEle = currResizeBarEle.parent("th");
                        currNextCellEle = currCellEle.next();
                        let isLast = false;
                        if(currNextCellEle.length === 0) {
                            currNextCellEle = context;
                            isLast = true;
                        }

                        if(opts.height > 0) {
                            targetCellEle = opts.context.find("thead th:eq(" + theadCells.index(currCellEle) + ")");
                            targetNextCellEle = targetCellEle.next();
                            if(opts.height > 0 && opts.context.parent().parent(".grid_wrap__").find("tfoot").length > 0) {
                                targetTfootCellEle = opts.context.parent().parent(".grid_wrap__").find("tfoot > tr > td:eq(" + theadCells.index(currCellEle) + ")");
                                targetNextTfootCellEle = targetTfootCellEle.next();
                            }
                        }
                        // Convert flexible cell width to absolute cell width when the clicked resizeBar is last resizeBar
                        if(isFirstTimeLastClick && isLast) {
                            let thisWidth;
                            theadCells.each(function(i) {
                                thisWidth = N()(this).width();
                                N()(this).width(thisWidth + (opts.height > 0 ? opts.misc.resizableLastCellCorrectionWidth : 0) + opts.misc.resizableCorrectionWidth).removeAttr("width");

                                if(targetCellEle !== undefined) {
                                    opts.context.find("thead th:eq(" + theadCells.index(this) + ")").width(thisWidth + (opts.height > 0 ? opts.misc.resizableLastCellCorrectionWidth : 0) + opts.misc.resizableCorrectionWidth).removeAttr("width");
                                }
                                if(opts.height > 0 && targetTfootCellEle !== undefined) {
                                    opts.context.parent().parent(".grid_wrap__").find("tfoot > tr > td:eq(" + theadCells.index(this) + ")").width(thisWidth + (opts.height > 0 ? opts.misc.resizableLastCellCorrectionWidth : 0) + opts.misc.resizableCorrectionWidth).removeAttr("width");
                                }
                            });
                            isFirstTimeLastClick = false;
                            thisWidth = undefined;
                        }

                        // to block sort event
                        currCellEle.data("sortLock", true);

                        defWidth = Math.floor(currCellEle.outerWidth()) + opts.misc.resizableCorrectionWidth;
                        nextDefWidth = !isLast ? Math.floor(currNextCellEle.outerWidth()) + opts.misc.resizableCorrectionWidth : Math.floor(context.width());

                        N()(document).on("dragstart.grid.resize selectstart.grid.resize", function() {
                            return false;
                        });
                        isPressed = true;

                        minPx = !isLast ? Math.floor(currNextCellEle.offset().left) : Math.floor(currCellEle.offset().left) + Math.floor(currCellEle.outerWidth());
                        maxPx = minPx + (!isLast ? Math.floor(currNextCellEle.outerWidth()) : 7680);
                        movedPx = defPx = Math.floor(currResizeBarEle.parent("th").offset().left);
                        N()(window.document).on("mousemove.grid.resize touchmove.grid.resize", function(e) {
                            let mte;
                            if(e.originalEvent.touches) {
                                e.stopPropagation();
                                mte = e.originalEvent.touches[0];
                            }
                            if(isPressed) {
                                const mPageX = mte !== undefined ? mte.pageX : e.pageX;
                                if(defPx < mPageX && maxPx > mPageX) {
                                    movedPx = mPageX - startOffsetX;
                                    currWidth = defWidth + movedPx;
                                    nextCurrWidth = !isLast ? nextDefWidth - movedPx : nextDefWidth + movedPx;
                                    if(currWidth > 0 && nextCurrWidth > 0) {
                                        currCellEle.css("width", currWidth + "px");
                                        currNextCellEle.css("width", nextCurrWidth + "px");
                                        if(targetCellEle !== undefined) {
                                            targetCellEle.css("width", currWidth + "px");
                                            targetNextCellEle.css("width", nextCurrWidth + "px");
                                        }
                                        if(targetTfootCellEle !== undefined) {
                                            targetTfootCellEle.css("width", currWidth + "px");
                                            targetNextTfootCellEle.css("width", nextCurrWidth + "px");
                                        }
                                    }
                                    currCellEle.find(".resize_bar__").offset({
                                        "left" : minPx - resizeBarWidth/2 + movedPx + opts.misc.resizeBarCorrectionLeft
                                    });
                                }
                            }
                        });

                        let currResizeBar = N()(this);
                        N()(window.document).on("mouseup.grid.resize touchend.grid.resize", function(e) {
                            currResizeBar.animate({
                                "height" : String(theadCells.filter(":eq(0)").outerHeight()) + "px"
                            }, 200, function() {
                                N()(this).css({
                                    "opacity": "0"
                                });

                                currResizeBar = undefined;
                            });

                            N()(document).off("dragstart.grid.resize selectstart.grid.resize mousemove.grid.resize touchmove.grid.resize mouseup.grid.resize touchend.grid.resize");
                            isPressed = false;
                        });
                    }
                });
            });

            resizeBar = currResizeBar = resizeBarHeight = cellEle = currCellEle = currNextCellEle = targetCellEle = targetNextCellEle =
                targetTfootCellEle = targetNextTfootCellEle = currResizeBarEle =
                    defWidth = nextDefWidth = currWidth = nextCurrWidth = startOffsetX =
                        minPx = maxPx = defPx = movedPx = undefined;
            // }
        };

        static sort = function() {
            const opts = this.options;
            const thead = this.thead;

            const theadCells = thead.find(">tr>th:not(.grid_more_thead_col__)");
            theadCells.css("cursor", "pointer");
            const self = this;
            theadCells.filter(function(i, cell) {
                return N()(cell).data("id") !== undefined;
            }).on("click.grid.sort", function(e) {
                const currEle = N()(this);
                if(currEle.data("sortLock")) {
                    currEle.data("sortLock", false);
                    return false;
                }
                if (opts.data.length > 0) {
                    if(StringUtils.trimToNull(N()(this).text()) !== null && jQuery(this).find(opts.checkAll).length === 0) {
                        let isAsc = false;
                        if (currEle.find(".sortable__").hasClass("asc__")) {
                            isAsc = true;
                        }
                        if (isAsc) {
                            self.bind(N()(opts.data).datasort(jQuery(this).data("id"), true), "grid.sort");
                            theadCells.find(".sortable__").remove();
                            currEle.append('<span class="sortable__ desc__">' + opts.sortableItem.asc + '</span>');
                        } else {
                            self.bind(N()(opts.data).datasort(jQuery(this).data("id")), "grid.sort");
                            theadCells.find(".sortable__").remove();
                            currEle.append('<span class="sortable__ asc__">' + opts.sortableItem.desc + '</span>');
                        }
                    }
                }
            });
        };

        static dataFilter = function() {
            const opts = this.options;
            const thead = this.thead;
            const theadCells = thead.find("> tr th").filter(function(i, cell) {
                return N()(cell).data("id") !== undefined;
            });
            const self = this;

            let clonedData;

            let filterKeys;
            let filteredKeys;
            let bfrSelId;

            const changeBtnIcon = function(th, kind) {
                th.find(".btn_data_filter__")
                    .removeClass("btn_data_filter_empty__ btn_data_filter_part__ btn_data_filter_full__")
                    .addClass("btn_data_filter_" + kind + "__");
            };

            const btnEle = N()('<a href="#" class="btn_data_filter__" title="' + N().message.get(opts.message, "dFilter") + '"><span>' + N().message.get(opts.message, "dFilter") + '</span><a>')
                .addClass("btn_data_filter_full__")
                .on("click.grid.dataFilter", function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    const thisEle = N()(this);
                    const visiblePanel = thead.find(".data_filter_panel__.visible__");
                    if(visiblePanel.length > 0) {
                        visiblePanel.removeClass("visible__").addClass("hidden__");
                        const eventNm = EventUtils.whichTransitionEvent(visiblePanel);
                        visiblePanel.off(eventNm).one(eventNm, function(e){
                            if(!thisEle.hasClass("btn_data_filter__")) {
                                N()(this).hide();
                            }
                        }).trigger("nothing");
                    }

                    const theadCell = N()(this).closest("th");

                    let panel;
                    let searchBox;
                    let filterListBox;
                    const id = theadCell.data("id");
                    let dataFilterProgress;

                    if(theadCell.find(".data_filter_panel__").length > 0) {
                        panel = theadCell.find(".data_filter_panel__").hide().removeClass("visible__").addClass("hidden__");
                        dataFilterProgress = theadCell.find(".data_filter_progress__");
                        searchBox = panel.find(".data_filter_search__");
                        panel.find(".data_filter_checkall_box__ .data_filter_total_cnt__").text('(' + opts.data.length + ')');
                        filterListBox = panel.find(".data_filter_list__");

                        // Index filter keys
                        if(bfrSelId !== id) {
                            filterKeys = {};
                            jQuery.each(clonedData, function(i, v) {
                                if(filterKeys[id + "_" + v[id]] === undefined) {
                                    filterKeys[id + "_" + v[id]] = [i];
                                } else {
                                    filterKeys[id + "_" + v[id]].push(i);
                                }
                            });
                        }

                        // Index filter keys from filtered data
                        filteredKeys = {};
                        jQuery.each(opts.data, function(i, v) {
                            if(filteredKeys[id + "_" + v[id]] === undefined) {
                                filteredKeys[id + "_" + v[id]] = [i];
                            } else {
                                filteredKeys[id + "_" + v[id]].push(i);
                            }
                        });
                    } else {
                        if(theadCells.find(".data_filter_panel__").length === 0) {
                            clonedData = opts.data.get().slice(0);
                        }

                        panel = N()('<div style="text-align: left;" class="data_filter_panel__ hidden__">'
                            +   '<div class="data_filter_search__">'
                            +       '<input class="data_filter_search_word__" type="text">'
                            +       '<a class="data_filter_search_btn__" href="#" title="' + N().message.get(opts.message, "search") + '">'
                            +           '<span>' + N().message.get(opts.message, "search") + '</span>'
                            +       '</a>'
                            +   '</div>'
                            +   '<div class="data_filter_checkall_box__"><label><input type="checkbox" checked="checked"><span class="data_filter_select_all__">' + N().message.get(opts.message, "selectAll") + '</span><span class="data_filter_total_cnt__">(' + opts.data.length + ')</span></label></div>'
                            +   '<ul class="data_filter_list__"></ul>'
                            + '</div>')
                            .css("z-index", 1)
                            .hide()
                            .appendTo(theadCell).on("click.grid.dataFilter, mouseover.grid.dataFilter", function(e) {
                                e.stopPropagation();
                            });

                        dataFilterProgress = N()('<div class="data_filter_progress__"></div>')
                            .css({
                                "z-index" : 2,
                                "opacity" : 0.3
                            })
                            .appendTo(panel);

                        searchBox = panel.find(".data_filter_search__");

                        // search btn event
                        panel.find(".data_filter_search_btn__").on("click.grid.dataFilter", function(e) {
                            e.preventDefault();
                            const searchWord = panel.find(".data_filter_search_word__").val();
                            if(StringUtils.trimToNull(searchWord) !== null) {
                                const retChkbxs = filterListBox.find("li:contains('" + searchWord + "')").show().find(":checkbox").prop("checked", true);
                                filterListBox.find("li:not(:contains('" + searchWord + "'))").hide().find(":checkbox").prop("checked", false).last().trigger("do.grid.dataFilter");
                                retChkbxs.each(function() {
                                    const chkboxEle = N()(this);
                                    chkboxEle.parent().children(".data_filter_cnt__").text('(' + String(chkboxEle.data("length")) + ')')
                                });
                            } else {
                                filterListBox.find("li").show();
                                filterListBox.find("li :checkbox").prop("checked", true).last().trigger("do.grid.dataFilter");
                            }
                        });
                        panel.find(".data_filter_search_word__").on("keyup.grid.dataFilter", function(e) {
                            if ((e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode)) === 13) {
                                panel.find(".data_filter_search_btn__").trigger("click");
                            }
                        });

                        // select all checkbox event
                        panel.find(".data_filter_checkall_box__ :checkbox").on("click.grid.dataFilter", function() {
                            if(N()(this).is(":checked")) {
                                let chkboxEle;
                                panel.find(".data_filter_search_word__").val("");
                                filterListBox.find("li").show();
                                filterListBox.find("li :checkbox").prop("checked", true).each(function() {
                                    chkboxEle = N()(this);
                                    chkboxEle.parent().children(".data_filter_cnt__").text('(' + String(chkboxEle.data("length")) + ')')
                                }).last().trigger("do.grid.dataFilter");
                            } else {
                                filterListBox.find("li .data_filter_checkbox__").prop("checked", false).last().trigger("do.grid.dataFilter");
                                filterListBox.find("li .data_filter_cnt__").text("(0)");
                            }
                        });

                        filterListBox = panel.find(".data_filter_list__").css({
                            "max-height" : opts.height - searchBox.outerHeight() - panel.find(".data_filter_checkall_box__").height() - 15
                        });

                        // Index filter keys
                        filterKeys = {};
                        jQuery.each(clonedData, function(i, v) {
                            if(filterKeys[id + "_" + v[id]] === undefined) {
                                filterKeys[id + "_" + v[id]] = [i];
                            } else {
                                filterKeys[id + "_" + v[id]].push(i);
                            }
                        });

                        // Index filter keys from filtered data
                        if(!N().isEmptyObject(filteredKeys) && clonedData.length !== opts.data.length) {
                            filteredKeys = {};
                            jQuery.each(opts.data, function(i, v) {
                                if(filteredKeys[id + "_" + v[id]] === undefined) {
                                    filteredKeys[id + "_" + v[id]] = [i];
                                } else {
                                    filteredKeys[id + "_" + v[id]].push(i);
                                }
                            });
                        } else {
                            filteredKeys = filterKeys;
                        }
                    }

                    panel.show(0, function() {
                        N()(this).removeClass("hidden__").addClass("visible__");
                    });

                    let itemSeq = 0;
                    for(const k in filterKeys) {
                        let filterItemEle;
                        const length = filteredKeys[k] === undefined ? 0 : filteredKeys[k].length;

                        const prevFilterItemEle = filterListBox.find(".data_filter_item_" + String(itemSeq) + "__");
                        if(prevFilterItemEle.length > 0) {
                            filterItemEle = prevFilterItemEle;
                            filterItemEle.find(".data_filter_cnt__").text("(" + String(length) + ")");
                        } else {
                            filterItemEle = N()('<li class="data_filter_item_' + String(itemSeq) + '__">'
                                + '<label><input type="checkbox" checked="checked" class="data_filter_checkbox__">'
                                + '<span class="data_filter_item_name__"></span><span class="data_filter_cnt__">(' + String(length) + ')</span></label></li>');

                            filterItemEle.find(".data_filter_item_name__").text(k.replace(id + "_", ""));

                            filterItemEle.find(".data_filter_checkbox__")
                                .data("rowIdxs", filterKeys[k])
                                .data("length", length)
                                .on("click.grid.dataFilter, do.grid.dataFilter", function() {
                                    // Update the count of rows for each filter item
                                    const thisEle = N()(this);
                                    if(thisEle.is(":checked")) {
                                        thisEle.parent().children(".data_filter_cnt__").text("(" + String(thisEle.data("length")) + ")");
                                    } else {
                                        thisEle.parent().children(".data_filter_cnt__").text("(0)");
                                    }

                                    // dataFilterListUnCheckedEles is current thead's cell unchecked data filter list
                                    let dataFilterListUnCheckedEles = theadCell.find(".data_filter_list__ li :checkbox:not(:checked)");
                                    if(dataFilterListUnCheckedEles.length > 0) {
                                        panel.find(".data_filter_checkall_box__ :checkbox").prop("checked", false);
                                        if(theadCell.find(".data_filter_list__ li :checkbox:checked").length > 0) {
                                            changeBtnIcon(theadCell, "part");
                                        } else {
                                            changeBtnIcon(theadCell, "empty");
                                        }
                                    } else {
                                        panel.find(".data_filter_checkall_box__ :checkbox").prop("checked", true);
                                        changeBtnIcon(theadCell, "full");
                                    }

                                    // dataFilterListUnCheckedEles is all thead's cells unchecked data filter list
                                    dataFilterListUnCheckedEles = theadCells.find(".data_filter_list__ li :checkbox:not(:checked)");

                                    let filterIdxs = [];
                                    dataFilterListUnCheckedEles.each(function() {
                                        jQuery.each(N()(this).data("rowIdxs"), function(i, v) {
                                            filterIdxs[v] = v;
                                        });
                                    });

                                    filterIdxs = jQuery.grep(filterIdxs, function(n){ return n === 0 || n });

                                    dataFilterProgress.show().fadeTo(50, 0.5, function() {
                                        // init scrollPaging index
                                        opts.scrollPaging.idx = 0;

                                        if(filterIdxs.length > 0 && filterIdxs.length !== clonedData.length) {
                                            const extrData = clonedData.slice(0);
                                            let bfrFilterIdx = -1;
                                            let addUnits = 0;
                                            let i;
                                            for(i = 0; i < filterIdxs.length; i++){
                                                if(filterIdxs[i] - bfrFilterIdx === 1) {
                                                    addUnits++;
                                                } else {
                                                    extrData.splice((bfrFilterIdx - addUnits + 1) - (i - addUnits), addUnits);
                                                    addUnits = 1;
                                                }
                                                bfrFilterIdx = filterIdxs[i];
                                            }
                                            extrData.splice((bfrFilterIdx - addUnits + 1) - (i - addUnits), addUnits);

                                            self.bind(extrData, "grid.dataFilter");
                                        } else {
                                            if(filterIdxs.length > 0) {
                                                self.bind([], "grid.dataFilter");
                                            } else {
                                                self.bind(clonedData, "grid.dataFilter");
                                            }
                                        }

                                        // Update total count.
                                        theadCell.find(".data_filter_total_cnt__").text("(" + String(opts.data.length) + ")");

                                        // Prevent event propagation when browser is stoped.
                                        setTimeout(function() {
                                            dataFilterProgress.hide();
                                        }, 0);
                                    });
                                });

                            filterListBox.append(filterItemEle);
                        }

                        if(length === 0) {
                            filterItemEle.find(".data_filter_checkbox__").prop("checked", false);
                        }
                        itemSeq++;
                    }

                    N()(document).off("click.grid.dataFilter");
                    N()(document).on("click.grid.dataFilter", function(e) {
                        if(N()(e.target).closest(".data_filter_panel__, .btn_data_filter__").length === 0
                            && !N()(e.target).hasClass("btn_data_filter__")
                            && !N()(e.target).hasClass("form__")) {
                            const panel = thead.find(".data_filter_panel__.visible__");
                            if(panel.length > 0) {
                                panel.removeClass("visible__").addClass("hidden__");
                                const eventNm = EventUtils.whichTransitionEvent(panel);
                                panel.off(eventNm).one(eventNm, function(e){
                                    N()(this).hide();
                                    N()(document).off("click.grid.dataFilter");
                                }).trigger("nothing");
                            }
                        }
                    });

                    bfrSelId = id;
                }).prependTo(theadCells.filter("[data-filter='true']:not(.grid_more_thead_col__)"));
        };

        static rowSpan = function(i, rowEle, bfRowEle, rowData, bfRowData, colId) {
            if(bfRowData !== undefined && rowData[colId] === bfRowData[colId]) {
                const bfRowCell = bfRowEle.find("#" + colId).closest("td");
                let prevColId;
                const prevBfRowCell = bfRowCell.prev("td");
                if(prevBfRowCell.length > 0) {
                    if(prevBfRowCell.attr("id")) {
                        prevColId = prevBfRowCell.attr("id");
                    } else {
                        prevColId = prevBfRowCell.find("[id]").attr("id");
                    }
                }
                if((this.rowSpanIds.get().join("|") + "|").indexOf(prevColId) < 0 || bfRowCell.prev("td").hasClass("grid_rowspan__")) {
                    const cell = rowEle.find("#" + colId).closest("td");
                    let bfCellBgColor = bfRowCell.css("background-color");
                    if(bfCellBgColor === "rgba(0, 0, 0, 0)" || bfCellBgColor === "transparent") {
                        bfCellBgColor = bfRowCell.parent().css("background-color");
                    }
                    if(bfCellBgColor === "rgba(0, 0, 0, 0)" || bfCellBgColor === "transparent") {
                        bfCellBgColor = bfRowCell.parent().parent().css("background-color");
                    }

                    bfRowCell.css("border-bottom-color", bfCellBgColor);

                    bfRowCell.css("background-color", bfCellBgColor);
                    cell.css("background-color", bfCellBgColor);

                    bfRowCell.addClass("grid_rowspan__");

                    const cldr = cell.children();
                    if(cldr.length > 0) {
                        cldr.hide();
                    } else {
                        cell.empty();
                    }
                }
            }
        };

        static paste = function() {
            const self = this;
            self.tempRowEle.find("[id]").not(":input").attr("contenteditable", "true").on("keydown.grid.paste", function(e) {
                if(!e.ctrlKey) {
                    e.target.blur();
                    e.preventDefault();
                    return false;
                }
            });
            self.context().on("paste", ".form__ [id]", function(e) {
                e.preventDefault();

                let content;
                if ("clipboardData" in window) {
                    content = window.clipboardData.getData('Text');
                    if (window.getSelection) {
                        const selObj = window.getSelection();
                        const selRange = selObj.getRangeAt(0);
                        selRange.deleteContents();
                        selRange.insertNode(document.createTextNode(content));
                    }
                } else if (e.originalEvent.clipboardData) {
                    content = (e.originalEvent || e).clipboardData.getData('text/plain');
                }

                if (!content && content.length) {
                    return false;
                }

                const thisEle = N()(this);
                const currRowIndex = self.context(".form__").index(thisEle.closest(".form__"));
                const currCellIndex = self.context(".form__:eq(" + currRowIndex + ") [id]").index(thisEle);

                const rows = content.replace(/"((?:[^"]*(?:\r\n|\n\r|\n|\r))+[^"]+)"/mg, function (match, p1) {
                    return p1.replace(/""/g, '"').replace(/\r\n|\n\r|\n|\r/g, ' ');
                }).split(/\r\n|\n\r|\n|\r/g);
                const columns = self.tempRowEle.find("[id]").map(function() {
                    return N()(this).attr("id");
                });
                for (let i = 0; i < rows.length; i++) {
                    if(N().isEmptyObject(rows[i])) continue;

                    const data = rows[i].split('\t');
                    const rowEle = self.context(".form__:eq(" + String(currRowIndex + i) + ")");
                    for (let j = 0; j < data.length; j++) {
                        const colNm = columns.get(currCellIndex + j);
                        const colEle = rowEle.find("#" + colNm);
                        if(!colEle.prop("readonly") && !colEle.prop("disabled")) {
                            self.val(currRowIndex + i, columns.get(currCellIndex + j), data[j]);
                        }
                    }

                }
            });
        }

        data(rowStatus) { // key name : argument1, argument2... argumentN
            const opts = this.options;

            if(rowStatus === undefined) {
                return opts.data.get();
            } else if(rowStatus === false) {
                return opts.data;
            } else if(rowStatus === "modified") {
                return opts.data.datafilter(function(data) {
                    return data.rowStatus !== undefined;
                }).get();
            } else if(rowStatus === "selected") {
                if(opts.select || opts.multiselect) {
                    const retData = [];

                    // clone arguments
                    const args = Array.prototype.slice.call(arguments, 0);

                    const rowEles = this.contextEle.find(">tbody.form__");
                    rowEles.filter(".grid_selected__").each(function() {
                        if(arguments.length > 1) {
                            args[0] = opts.data[rowEles.index(this)];
                            retData.push(N().json.mapFromKeys.apply(N().json, args));
                        } else {
                            retData.push(opts.data[rowEles.index(this)]);
                        }
                    });
                    return retData;
                }
            } else if(rowStatus === "checked") {
                const retData = [];

                // clone arguments
                const args = Array.prototype.slice.call(arguments, 0);

                const rowEles = this.contextEle.find(">tbody.form__");
                rowEles.find(opts.checkAllTarget||opts.checkSingleTarget).filter(":checked").each(function() {
                    const thisEle = N()(this);
                    if(arguments.length > 1) {
                        args[0] = opts.data[rowEles.index(thisEle.closest("tbody.form__"))];
                        retData.push(N().json.mapFromKeys.apply(N().json, args));
                    } else {
                        retData.push(opts.data[rowEles.index(thisEle.closest("tbody.form__"))]);
                    }
                });
                return retData;
            } else {
                if(arguments.length > 1) {
                    const args = Array.prototype.slice.call(arguments, 0);

                    return opts.data.datafilter(function(data) {
                        return data.rowStatus === rowStatus;
                    }).map(function() {
                        args[0] = this;
                        return N().json.mapFromKeys.apply(N().json, args);
                    }).get();
                } else {
                    return opts.data.datafilter(function(data) {
                        return data.rowStatus === rowStatus;
                    }).get();
                }
            }
        };

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        contextHead(sel) {
            return sel !== undefined ? this.thead.find(sel) : this.thead;
        };

        contextBodyTemplate(sel) {
            return sel !== undefined ? this.tempRowEle.find(sel) : this.tempRowEle;
        };

        select(row, isAppend) {
            const opts = this.options;
            if(!opts.select && !opts.multiselect) {
                warn("[Grid.select]The \"select\" or \"multiselect\" option is disabled. To use this method, set the value of the \"select\" or \"multiselect\" option to true.");
                return false;
            }

            if(row === undefined) {
                const rowEles = this.contextEle.find(">tbody.form__");
                return rowEles.filter(".grid_selected__").map(function () {
                    return rowEles.index(this);
                }).get();
            } else {
                if(getType(row) !== "array") {
                    row = [row];
                }

                const self = this;
                let selRowEle;

                if(!isAppend) {
                    self.contextEle.find(">tbody.grid_selected__").removeClass("grid_selected__");
                }
                N()(row).each(function() {
                    selRowEle = self.contextEle.find(">tbody" + (self.options.data.length > 0 ? ".form__" : "") +":eq(" + String(this) + ")");
                    if(selRowEle.hasClass("grid_selected__")) {
                        selRowEle.removeClass("grid_selected__");
                    }
                    selRowEle.trigger("click.grid");
                });

                if(opts.selectScroll) {
                    let scrollTop = (row[row.length - 1] * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
                    if(scrollTop < 0) {
                        scrollTop = 0;
                    }
                    opts.context.parent(".tbody_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing');
                }

                return this;
            }
        };

        check(row, isAppend) {
            const opts = this.options;
            if(row === undefined) {
                const rowEles = this.contextEle.find(">tbody.form__");
                return rowEles.find(opts.checkAllTarget || opts.checkSingleTarget).filter(":checked").map(function () {
                    return rowEles.index(N()(this).closest("tbody.form__"));
                }).get();
            } else {
                if(getType(row) !== "array") {
                    row = [row];
                }

                const self = this;
                let checkboxEle;
                if(!isAppend) {
                    self.contextEle.find(">tbody").find((opts.checkAllTarget||opts.checkSingleTarget) + ":checked").prop("checked", false);
                }
                N()(row).each(function() {
                    checkboxEle = self.contextEle.find(">tbody").find(opts.checkAllTarget||opts.checkSingleTarget).eq(this);
                    if(checkboxEle.is(":checked")) {
                        checkboxEle.prop("checked", false);
                    }
                    checkboxEle.trigger("click.grid");
                });

                if(opts.checkScroll) {
                    const selRowEle = checkboxEle.closest("tbody.form__");
                    let scrollTop = (row[row.length - 1] * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
                    if(scrollTop < 0) {
                        scrollTop = 0;
                    }
                    opts.context.parent(".tbody_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing');
                }

                return this;
            }
        };

        /**
         * callType arguments is call type about scrollPaging(internal), data filter(internal), data append(external), DataSync's update.
         * callType : "append" | "grid.bind" | "grid.dataFilter" | "grid.sort" | "grid.update"
         */
        bind(data, callType) {
            const opts = this.options;
            // remove all sort status
            if(opts.sortable && callType !== "grid.sort") {
                this.thead.find(".sortable__").remove();
            }
            if(!opts.isBinding) {
                if(opts.data && data && callType === "append") {
                    opts.scrollPaging.size = 0;
                    // Merge data to binded data;
                    opts.scrollPaging.idx = opts.data.length - 1;
                    jQuery.merge(opts.data, data);
                } else {
                    opts.scrollPaging.size = opts.scrollPaging.defSize;
                    // rebind new data
                    if(data != null) {
                        opts.data = getType(data) === "array" ? N()(data) : data;
                    }
                }

                // remove all data filter status
                if(opts.filter || this.thead.find("> tr th[data-filter='true']").length > 0) {
                    // [callType === "grid.sort"]To keep your filter list even after sorting delete this codes.
                    if(callType !== "grid.dataFilter" && callType !== "grid.sort"
                        || (!(callType !== "grid.dataFilter" && callType !== "grid.sort") && callType === "grid.sort")) {
                        this.thead.find("th .data_filter_panel__").remove();

                        if(callType !== "grid.dataFilter" && callType !== "grid.sort") {
                            this.thead.find(".btn_data_filter__")
                                .removeClass("btn_data_filter_empty__ btn_data_filter_part__ btn_data_filter_full__")
                                .addClass("btn_data_filter_full__");

                            if(opts.data.length > 0) {
                                this.thead.find(".btn_data_filter__").removeClass("hidden__").addClass("visible__");
                            } else {
                                this.thead.find(".btn_data_filter__").removeClass("visible__").addClass("hidden__");
                            }
                        }
                    }
                }

                if(opts.checkAll !== null) {
                    this.thead.find(opts.checkAll).prop("checked", false);
                }
                if (opts.data.length > 0 || (callType === "append" && data && data.length > 0)) {
                    //clear tbody visual effect
                    opts.context.find(">tbody").clearQueue().stop();
                    if(callType !== "grid.bind") {
                        if(callType === "append" && data.length > 0) {
                            opts.scrollPaging.idx = opts.data.length - data.length;
                        } else {
                            opts.scrollPaging.idx = 0;
                        }
                    }

                    if(opts.scrollPaging.idx === 0) {
                        //remove tbodys in grid body area
                        if(callType === "append" && data.length > 0) {
                            opts.context.find(">tbody>tr>td.empty__").parent().parent().remove();
                        } else {
                            opts.context.find(">tbody").remove();
                        }
                    }

                    const i = opts.scrollPaging.idx;
                    let limit;
                    if(opts.height === 0 || opts.scrollPaging.size === 0 || (callType === "append" && data.length > 0 && data.length <= opts.scrollPaging.size)) {
                        limit = opts.data.length;
                    } else {
                        limit = Math.min(opts.scrollPaging.limit, opts.data.length);
                    }

                    const delay = opts.createRowDelay;
                    let lastIdx;

                    Iteration.render.call(this, i, limit, delay, lastIdx, callType);

                    if(opts.appendScroll && i > 0 && callType === "append") {
                        opts.context.parent(".tbody_wrap__").stop().animate({
                            "scrollTop" : opts.context.parent(".tbody_wrap__").prop("scrollHeight")
                        }, 300, 'swing');
                    }
                } else {
                    //remove tbodys in grid body area
                    opts.context.find(">tbody").remove();

                    let colspan = 0;
                    if(this.tableMap.colgroup[0] !== undefined && this.tableMap.colgroup[0].length > 0) {
                        colspan = N()(this.tableMap.colgroup[0]).not(":regexp(css:display, none), [hidden]").length;
                    } else {
                        N()(this.tableMap.tbody).each(function(i, eles) {
                            const currLen = N()(eles).not(":regexp(css:display, none), [hidden]").length;
                            if(colspan < currLen) {
                                colspan = currLen;
                            }
                        });
                    }

                    const emptyEle = N()('<tbody><tr><td class="empty__" ' + (colspan > 0 ? 'colspan=' + String(colspan) : '') + '>'
                        + N().message.get(opts.message, "empty") + '</td></tr></tbody>');

                    opts.context.append(emptyEle);

                    if(opts.fixedcol > 0) {
                        setTimeout(function() {
                            const emptyCellEle = emptyEle.find(".empty__");
                            const emptyCellEleBLW = parseInt(StringUtils.trimToZero(emptyCellEle.css("border-left")));
                            const emptyCellEleBRW = parseInt(StringUtils.trimToZero(emptyCellEle.css("border-right")));

                            emptyCellEle.css({
                                "position" : "absolute",
                                "left" : 0,
                                "padding-left" : 0,
                                "padding-right" : 0,
                                "width" : opts.context.parent(".grid_wrap__").parent(".grid_container__").outerWidth() - emptyCellEleBLW - emptyCellEleBRW
                            });
                            emptyCellEle.parent("tr").css("height", emptyCellEle.outerHeight());
                        }, 0);
                    }

                    if(opts.onBind !== null && callType !== "grid.update") {
                        opts.onBind.call(this, opts.context, opts.data, true, true);
                    }
                }
            } else {
                const self = this;
                const args = arguments;
                opts.context.queue("bind", function() {
                    self.bind.apply(self, args);
                });
            }
            return this;
        };

        add(data, row) {
            const opts = this.options;
            if (opts.context.find("td.empty__").length > 0) {
                opts.context.find(">tbody").remove();
            }
            const tempRowEleClone = this.tempRowEle.clone(true, true);

            if(N().isNumeric(data)) {
                row = data;
                data = undefined;
            }

            if(row > opts.data.length || row < 0) {
                row = undefined;
            }

            if(row === undefined) {
                if(opts.addTop) {
                    opts.context.find(">thead").after(tempRowEleClone);
                } else {
                    opts.context.append(tempRowEleClone);
                }
            } else {
                let selRowEle = opts.context.find(">tbody:eq(" + row + ")");
                let scrollTop;

                if(row === 0) {
                    opts.context.find("thead").after(tempRowEleClone);
                } else if(row === opts.context.find(">tbody").length) {
                    selRowEle = opts.context.find(">tbody:eq(" + (row - 1) + ")");
                } else {
                    opts.context.find(">tbody:eq(" + row + ")").before(tempRowEleClone);
                }

                if(opts.addScroll) {
                    scrollTop = (row * selRowEle.outerHeight()) - (opts.height / 2) + (selRowEle.outerHeight() / 2);
                    if(scrollTop < 0) {
                        scrollTop = 0;
                    }
                    opts.context.parent(".tbody_wrap__").stop().animate({ "scrollTop" : scrollTop }, 300, 'swing', function() {
                        if(opts.addSelect) {
                            N()(this).find(">table>tbody:eq(" + row + ")").trigger("click.grid");
                        }
                    });
                } else {
                    if(opts.addSelect) {
                        setTimeout(function() {
                            opts.context.parent(".tbody_wrap__").find(">table>tbody:eq(" + row + ")").trigger("click.grid");
                        }, 0);
                    }
                }
            }

            // for new row data bind, use Form
            const form = opts.data.form({
                context : tempRowEleClone,
                html: opts.html,
                validate : opts.validate,
                extObj : this,
                extRow : row === undefined ? (opts.addTop ? 0 : opts.data.length) : row,
                addTop : opts.addTop,
                revert : opts.revert,
                tpBind : opts.tpBind
            });

            form.add(data, row);

            if(opts.rowHandler !== null) {
                opts.rowHandler.call(this, form.options.extRow, tempRowEleClone, form.data(true)[0]);
            }

            if(opts.fixedcol > 0) {
                tempRowEleClone.find(".grid_body_fixed__").outerHeight(tempRowEleClone.height() + opts.misc.fixedcolBodyAddHeight);
            }

            // unselect rows
            opts.context.find("> tbody").removeClass("grid_selected__");

            // scroll to created row element
            if(row === undefined) {
                opts.context.parent(".tbody_wrap__").stop().animate({
                    "scrollTop" : (opts.addTop ? 0 : opts.context.parent(".tbody_wrap__").prop("scrollHeight"))
                }, 300, 'swing', function() {
                    if(opts.addSelect) {
                        N()(this).find("> table > tbody:" + (opts.addTop ? "first" : "last")).trigger("click.grid");
                    }
                });
            }

            return this;
        };

        remove(row) {
            const opts = this.options;
            if(row !== undefined) {
                if(getType(row) !== "array") {
                    row = [row];
                }
                N()(row.sort().reverse()).each(function(i, row) {
                    if (opts.data[this] === undefined) {
                        throw createError("[Grid.prototype.remove]Row index is out of range");
                    }
                    if (opts.data[this].rowStatus === "insert") {
                        opts.data.splice(this, 1);
                        opts.context.find(">tbody:eq(" + row + ")").remove();


                        // for scroll paging
                        // just +1 is inappropriate on android 4.4.2 webkit
                        const rowEleLength = opts.context.find(">tbody").length;
                        const pagingSize = opts.scrollPaging.size;
                        const rest = rowEleLength % pagingSize;
                        opts.scrollPaging.idx = (rowEleLength / pagingSize) * pagingSize - pagingSize + rest;
                    } else {
                        opts.data[this].rowStatus = "delete";
                        opts.context.find(">tbody:eq(" + row + ")").addClass("row_data_deleted__");
                    }
                });
            }

            DataSync.instance(this).notify();
            return this;
        };

        revert(row) {
            const opts = this.options;
            if(!opts.revert) {
                throw createError("[Form.prototype.revert]Can not revert. Form's revert option value is false");
            }

            const self = this;

            if(row !== undefined) {
                if(getType(row) !== "array") {
                    row = [row];
                }
                N()(row).each(function() {
                    const i = this;
                    const context = opts.context.find(">tbody:eq(" + String(this) + ")");
                    const form = context.instance("form");
                    if(opts.rowHandlerBeforeBind !== null) {
                        opts.rowHandlerBeforeBind.call(self, i, context, form.options.revertData);
                    }

                    form.revert();

                    if(opts.rowHandler !== null) {
                        opts.rowHandler.call(self, i, context, opts.data[i]);
                    }
                });
            } else {
                opts.context.find(">tbody").instance("form", function() {
                    if(this.options !== undefined && (this.options.data[0].rowStatus === "update" || this.options.data[0].rowStatus === "insert")) {
                        const i = this.options.extRow;
                        if(opts.rowHandlerBeforeBind !== null) {
                            opts.rowHandlerBeforeBind.call(self, i, this.context(), this.options.revertData);
                        }

                        this.revert();

                        if(opts.rowHandler !== null) {
                            opts.rowHandler.call(self, i, this.context(), opts.data[i]);
                        }
                    }
                });
            }
            return this;
        };

        validate(row) {
            const opts = this.options;
            let valiRslt = true;
            if(row !== undefined) {
                valiRslt = opts.context.find(">tbody:eq(" + String(row) + ")").instance("form").validate();
            } else {
                let rowStatus;
                opts.context.find(">tbody").instance("form", function(i) {
                    if(this.options !== undefined && this.options.data.length > 0) {
                        rowStatus = this.options.data[0].rowStatus;
                        // Select the rows that data was changed
                        if(this.context(".validate_false__").length > 0 || rowStatus === "update" || rowStatus === "insert") {
                            if(!this.validate()) {
                                valiRslt = false;
                            }
                        }
                    }
                });
            }

            if(!valiRslt && opts.validateScroll) {
                const valiLastTbody = opts.context.find(".validate_false__:last").closest("tbody.form__");
                opts.context.parent(".tbody_wrap__").stop().animate({
                    "scrollTop" : opts.context.parent(".tbody_wrap__").scrollTop() + valiLastTbody.position().top - opts.height + (valiLastTbody.outerHeight() * 2)
                }, 300, 'swing');
            }

            return valiRslt;
        };

        val(row, key, val) {
            if(val === undefined) {
                return this.options.data[row][key];
            }

            const inst = this.options.context.find(">.form__:eq(" + String(row) + ")").instance("form");
            if(inst) {
                inst.val(key, val);
            } else {
                if(this.options.data[row]) {
                    this.options.data[row][key] = val;
                } else {
                    throw createError("[Grid.prototype.val]There is no row data that is " + row + " index");
                }
            }
            return this;
        };

        move(fromRow, toRow) {
            Iteration.move.call(this, fromRow, toRow, "grid");

            return this;
        };

        copy(fromRow, toRow) {
            Iteration.copy.call(this, fromRow, toRow, "grid");

            return this;
        };

        show(colIdxs) {
            const opts = this.options;
            const self = this;
            if(colIdxs !== undefined) {
                if(getType(colIdxs) !== "array") {
                    colIdxs = [colIdxs];
                }
            }

            N()(colIdxs).each(function(i, v) {
                let context = opts.height > 0 ? opts.context.parent(".tbody_wrap__").parent(".grid_wrap__") : opts.context;
                context = context.add(self.tempRowEle);
                context.find(".col_" + v + "__").each(function(i, ele) {
                    const colEle = N()(ele);
                    const colSpanCnt = parseInt(colEle.attr("colspan"));
                    const orgColspan = colEle.data("colspan");
                    if(colSpanCnt < orgColspan) {
                        colEle.attr("colspan", colSpanCnt + 1);
                    }
                    colEle.css("display", "");
                });
            });

            const emptyEle = opts.context.find(">tbody>tr>.empty__");
            if(emptyEle.length > 0) {
                if(this.tableMap.colgroup[0] !== undefined && this.tableMap.colgroup[0].length > 0) {
                    emptyEle.attr("colspan", String(N()(this.tableMap.colgroup[0]).not(":regexp(css:display, none)").length));
                } else {
                    N()(this.tableMap.tbody).each(function(i, eles) {
                        const currLen = String(N()(eles).not(":regexp(css:display, none)").length);
                        if(StringUtils.trimToZero(emptyEle.attr("colspan")) < currLen) {
                            emptyEle.attr("colspan", currLen);
                        }
                    });
                }
            }

            return this;
        };

        hide(colIdxs) {
            const opts = this.options;
            const self = this;
            if(colIdxs !== undefined) {
                if(getType(colIdxs) !== "array") {
                    colIdxs = [colIdxs];
                }
            }

            N()(colIdxs).each(function() {
                let context = opts.height > 0 ? opts.context.parent(".tbody_wrap__").parent(".grid_wrap__") : opts.context;
                context = context.add(self.tempRowEle);
                context.find(".col_" + this + "__").each(function() {
                    const colEle = N()(this);
                    const colSpanCnt = parseInt(colEle.attr("colspan"));
                    if(colSpanCnt > 0) {
                        if(colEle.data("colspan") === undefined) {
                            colEle.data("colspan", colSpanCnt);
                        }
                        colEle.attr("colspan", colSpanCnt - 1);
                        if(colEle.attr("colspan") === "0") {
                            colEle.css("display", "none");
                        }
                    } else {
                        colEle.css("display", "none");
                    }
                });
            });

            const emptyEle = opts.context.find(">tbody>tr>.empty__");
            if(emptyEle.length > 0) {
                if(this.tableMap.colgroup[0] !== undefined && this.tableMap.colgroup[0].length > 0) {
                    emptyEle.attr("colspan", String(N()(this.tableMap.colgroup[0]).not(":regexp(css:display, none)").length));
                } else {
                    N()(this.tableMap.tbody).each(function(i, eles) {
                        const currLen = String(N()(eles).not(":regexp(css:display, none)").length);
                        if(StringUtils.trimToZero(emptyEle.attr("colspan")) < currLen) {
                            emptyEle.attr("colspan", currLen);
                        }
                    });
                }
            }

            return this;
        };

        update(row, key) {
            if(row !== undefined) {
                if(key !== undefined) {
                    this.options.context.find(">tbody:eq(" + String(row) + ")").instance("form").update(0, key);
                } else if(this.options.data[row]._isRevert !== true && this.options.data[row].rowStatus === "insert") {
                    if(this.options.data[row].rowStatus === "insert") {
                        this.bind(undefined, "grid.update");
                    } else {
                        this.add(this.options.data[row]);
                    }
                } else {
                    this.options.context.find(">tbody:eq(" + String(row) + ")").instance("form").update(0);
                }
            } else {
                this.bind(undefined, "grid.update");
            }
            return this;
        };

    }

    // Pagination


export const grid = (data, options) => new Grid(data, options);
export default Grid;
