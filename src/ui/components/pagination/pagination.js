/**
 * Natural-JS UI Pagination Component
 * Full version from original natural.ui.js lines 7008-7332
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

export class Pagination {

        constructor(data, opts) {
            this.options = {
                data : getType(data) === "array" ? jQuery(data) : data,
                context : null,
                totalCount : 0,
                countPerPage : 10,
                countPerPageSet : 10,
                pageNo : 1,
                onChange : null,
                blockOnChangeWhenBind : false,
                currPageNavInfo : null
            };

            try {
                jQuery.extend(this.options, Context.attr("ui").pagination);
            } catch (e) {
                throw createError("Pagination", e);
            }

            if(this.options.data.length > 0) {
                this.options.totalCount = this.options.data.length;
            }

            if (isPlainObject(opts)) {
                // Wraps the global event options in NA.config and event options for this component.
                UIUtils.wrapHandler(opts, "pagination", "onChange");

                //convert data to wrapped set
                opts.data = getType(opts.data) === "array" ? jQuery(opts.data) : opts.data;

                jQuery.extend(this.options, opts);

                if(getType(this.options.context) === "string") {
                    this.options.context = jQuery(this.options.context);
                }
            } else {
                this.options.context = jQuery(opts);
            }

            // Initialize paging panel
            this.linkEles = Pagination.wrapEle.call(this);

            // set style class name to context element
            this.options.context.addClass("pagination__");

            // set this instance to context element
            this.options.context.instance("pagination", this);

            return this;
        };

        static wrapEle = function() {
            const opts = this.options;

            // pagination link element set
            const linkEles = {};

            const lefter = opts.context.find("ul:eq(0)").addClass("pagination_lefter__");

            linkEles.body = opts.context.find("ul:eq(1)").addClass("pagination_body__");
            linkEles.page = linkEles.body.find("li").addClass("pagination_page__");

            const righter = opts.context.find("ul:eq(2)").addClass("pagination_righter__");

            if(lefter.find("li").length === 2) {
                linkEles.first = lefter.find("li:eq(0)").addClass("pagination_first__ pagination_disable__");
                linkEles.prev = lefter.find("li:eq(1)").addClass("pagination_prev__ pagination_disable__");
            } else if(lefter.length === 1) {
                linkEles.prev = lefter.find("li:eq(0)").addClass("pagination_prev__ pagination_disable__");
            }
            if(righter.find("li").length === 2) {
                linkEles.next = righter.find("li:eq(0)").addClass("pagination_next__ pagination_disable__");
                linkEles.last = righter.find("li:eq(1)").addClass("pagination_last__ pagination_disable__");
            } else if(righter.length === 1) {
                linkEles.next = righter.find("li:eq(0)").addClass("pagination_next__ pagination_disable__");
            }

            opts.currPageNavInfo = Pagination.changePageSet(linkEles, opts);

            return linkEles;
        };

        static changePageSet = function(linkEles, opts, isRemake) {
            const pageCount = Math.ceil(opts.totalCount / opts.countPerPage);
            const pageSetCount = Math.ceil(pageCount / opts.countPerPageSet);
            let currSelPageSet = Math.ceil(opts.pageNo / opts.countPerPageSet);
            if (currSelPageSet > pageSetCount) { currSelPageSet = pageSetCount; }

            let startPage = (currSelPageSet - 1) * opts.countPerPageSet + 1;
            let endPage = startPage + opts.countPerPageSet - 1;

            if (startPage < 1) {
                startPage = 1;
            }
            if (endPage > pageCount) {
                endPage = pageCount;
            }
            if (endPage < 1) {
                endPage = 1;
            }

            if(isRemake === undefined || isRemake === false) {
                let pageClone;
                linkEles.body.empty();
                for(let i = startPage; i <= endPage; i++) {
                    pageClone = linkEles.page.clone(true, true);
                    pageClone.attr("data-pageno", String(i));
                    pageClone.find("a > span").text(String(i));
                    linkEles.body.append(pageClone);
                }
            }

            if(currSelPageSet > 0 && currSelPageSet > 1 && startPage >= currSelPageSet) {
                jQuery(linkEles.prev).removeClass("pagination_disable__");
            } else {
                jQuery(linkEles.prev).addClass("pagination_disable__");
            }
            if(linkEles.first !== undefined) {
                if(1 !== opts.pageNo) {
                    jQuery(linkEles.first).removeClass("pagination_disable__");
                } else {
                    jQuery(linkEles.first).addClass("pagination_disable__");
                }
            }

            if(pageSetCount > currSelPageSet) {
                jQuery(linkEles.next).removeClass("pagination_disable__");
            } else {
                jQuery(linkEles.next).addClass("pagination_disable__");
            }
            if(linkEles.last !== undefined) {
                if(pageCount > 0 && opts.pageNo !== pageCount) {
                    jQuery(linkEles.last).removeClass("pagination_disable__");
                } else {
                    jQuery(linkEles.last).addClass("pagination_disable__");
                }
            }

            const startRowIndex = (opts.pageNo - 1) * opts.countPerPage;
            let endRowIndex = (startRowIndex + opts.countPerPage) - 1;
            if(endRowIndex > opts.totalCount - 1) {
                endRowIndex = opts.totalCount - 1;
            }

            return opts.currPageNavInfo = {
                "pageNo" : opts.pageNo,
                "countPerPage" : opts.countPerPage,
                "countPerPageSet" : opts.countPerPageSet,
                "totalCount" : opts.totalCount,
                "pageCount" : pageCount,
                "pageSetCount" : pageSetCount,
                "currSelPageSet" : currSelPageSet,
                "startPage" : startPage,
                "endPage" : endPage,
                "startRowIndex" : startRowIndex,
                "startRowNum" : startRowIndex + 1,
                "endRowIndex" : endRowIndex,
                "endRowNum" : endRowIndex + 1
            };
        }

        data(selFlag) {
            if(selFlag === undefined) {
                return this.options.data.get();
            } else if(selFlag === false) {
                return this.options.data;
            }
        };

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        bind(data, totalCount) {
            const opts = this.options;
            const self = this;

            if(arguments.length > 0 && getType(arguments[0]) === "number") {
                // reset totalCount
                opts.totalCount = arguments[0];
            } else if(arguments.length > 0 && getType(arguments[0]) === "array") {
                // to rebind new data
                opts.data = getType(data) === "array" ? jQuery(data) : data;

                // reset totalCount
                if(totalCount !== undefined) {
                    opts.totalCount = totalCount;
                } else {
                    if(data != null) {
                        opts.totalCount = data.length;
                    }
                }
            }

            const linkEles = this.linkEles;
            opts.currPageNavInfo = Pagination.changePageSet(linkEles, opts);

            // first button event
            if(linkEles.first !== undefined) {
                linkEles.first.off("click.pagination");
                linkEles.first.on("click.pagination", function(e) {
                    e.preventDefault();
                    if(1 !== opts.pageNo) {
                        opts.pageNo = 1;
                        opts.currPageNavInfo = Pagination.changePageSet(linkEles, opts);
                        linkEles.body.find("li a:first").trigger("click.pagination");
                    }
                });
            }

            // previous button event
            linkEles.prev.off("click.pagination");
            linkEles.prev.on("click.pagination", function(e) {
                e.preventDefault();
                if(opts.currPageNavInfo.currSelPageSet > 1 && opts.currPageNavInfo.startPage >= opts.currPageNavInfo.currSelPageSet) {
                    opts.pageNo = opts.currPageNavInfo.startPage - opts.countPerPageSet;
                    opts.currPageNavInfo = Pagination.changePageSet(linkEles, opts);
                    linkEles.body.find("li a:first").trigger("click.pagination");
                }
            });

            // page number button event
            linkEles.body.off("click.pagination");
            linkEles.body.on("click.pagination", "li > a", function(e, isFirst) {
                e.preventDefault();

                opts.pageNo = Number(jQuery(this).parent().data("pageno"));
                opts.currPageNavInfo = Pagination.changePageSet(linkEles, opts, true);

                if(opts.onChange !== null) {
                    const selData = [];
                    if(opts.data.length > 0 && opts.data.length <= opts.totalCount) {
                        for(let i = opts.currPageNavInfo.startRowIndex; i <= opts.currPageNavInfo.endRowIndex; i++) {
                            if(opts.data[i] !== undefined) {
                                selData.push(opts.data[i]);
                            }
                        }
                    }
                    if(opts.blockOnChangeWhenBind === false || (opts.blockOnChangeWhenBind === true && isFirst !== true)) {
                        opts.onChange.call(self, opts.pageNo, jQuery(this), selData, opts.currPageNavInfo);
                    }
                }

                linkEles.body.find("li.pagination_active__").removeClass("pagination_active__");
                jQuery(this).parent().addClass("pagination_active__");
            }).find("li a:eq(" + String(opts.pageNo - opts.currPageNavInfo.startPage) +  ")").trigger("click.pagination", [true]);

            // next button event
            linkEles.next.off("click.pagination");
            linkEles.next.on("click.pagination", function(e) {
                e.preventDefault();
                if(opts.currPageNavInfo.pageSetCount > opts.currPageNavInfo.currSelPageSet) {
                    opts.pageNo = opts.currPageNavInfo.startPage + opts.countPerPageSet;
                    opts.currPageNavInfo = Pagination.changePageSet(linkEles, opts);
                    linkEles.body.find("li a:first").trigger("click.pagination");
                }
            });

            // last button event
            if(linkEles.last !== undefined) {
                linkEles.last.off("click.pagination");
                linkEles.last.on("click.pagination", function(e) {
                    e.preventDefault();
                    if(opts.pageNo !== opts.currPageNavInfo.pageCount) {
                        opts.pageNo = opts.currPageNavInfo.pageCount;
                        opts.currPageNavInfo = Pagination.changePageSet(linkEles, opts);
                        linkEles.body.find("li a:last").trigger("click.pagination");
                    }
                });
            }

            return this;
        };

        totalCount(totalCount) {
            const opts = this.options;
            if(totalCount !== undefined) {
                opts.totalCount = totalCount;
                return this;
            } else {
                return opts.totalCount;
            }
        };

        pageNo(pageNo) {
            const opts = this.options;
            if(pageNo !== undefined) {
                opts.pageNo = pageNo;
                return this;
            } else {
                return opts.pageNo;
            }
        };

        countPerPage(countPerPage) {
            if(countPerPage !== undefined) {
                const opts = this.options;
                opts.countPerPage = countPerPage;
                opts.pageNo = 1;
            } else {
                return this.options.countPerPage;
            }
            return this;
        };

        countPerPageSet(countPerPageSet) {
            if(countPerPageSet !== undefined) {
                const opts = this.options;
                opts.countPerPageSet = countPerPageSet;
                opts.pageNo = 1;
            } else {
                return this.options.countPerPageSet;
            }
            return this;
        };

        currPageNavInfo() {
            return this.options.currPageNavInfo;
        };

    }

    // Tree


export const pagination = (data, options) => new Pagination(data, options);
export default Pagination;
