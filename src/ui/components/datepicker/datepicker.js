/**
 * Natural-JS UI Datepicker Component
 * Full version from original natural.ui.js lines 1246-2263
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

export class Datepicker {

        constructor(obj, opts) {
            this.options = {
                context : obj,
                contents : N()('<div class="datepicker__"></div>'),
                monthonly : false,
                focusin : true,
                yearsPanelPosition : "left",
                monthsPanelPosition : "left",
                minYear : 200,
                maxYear : 200,
                yearChangeInput : false,
                monthChangeInput : false,
                touchMonthChange : false,
                scrollMonthChange : false,
                minDate : null,
                maxDate : null,
                holiday : {
                    "repeat" : null,
                    "once" : null
                },
                onChangeYear : null,
                onChangeMonth : null,
                onSelect : null,
                onBeforeShow : null,
                onShow : null,
                onBeforeHide : null,
                onHide : null
            };

            try {
                jQuery.extend(this.options, Context.attr("ui").datepicker);
                if(opts && opts.monthonly === true && Context.attr("ui").datepicker.monthonlyOpts) {
                    jQuery.extend(this.options, Context.attr("ui").datepicker.monthonlyOpts);
                }
            } catch (e) {
                throw createError("Datepicker", e);
            }

            if(opts !== undefined) {
                // Wraps the global event options in N().config and event options for this component.
                UIUtils.wrapHandler(opts, "datepicker", "onChangeYear");
                UIUtils.wrapHandler(opts, "datepicker", "onChangeMonth");
                UIUtils.wrapHandler(opts, "datepicker", "onSelect");
                UIUtils.wrapHandler(opts, "datepicker", "onBeforeShow");
                UIUtils.wrapHandler(opts, "datepicker", "onShow");
                UIUtils.wrapHandler(opts, "datepicker", "onBeforeHide");
                UIUtils.wrapHandler(opts, "datepicker", "onHide");

                jQuery.extend(this.options, opts);
            }

            if(this.options.yearsPanelPosition === "top" && this.options.monthsPanelPosition === "top" && this.options.monthonly === true) {
                warn('[Datepicker]This option combination({ yearsPanelPosition : "top", monthsPanelPosition : "top", monthonly : true }) is not suppored.');
                this.options.yearsPanelPosition = "left";
                this.options.monthsPanelPosition = "left";
            }

            // set style class name to context element
            this.options.context.addClass("datepicker__");

            // bind events
            Datepicker.wrapEle.call(this);

            // set this instance to context element
            this.options.context.instance("datepicker", this);

            return this;
        };

        static checkMinMaxDate = function() {
            const opts = this.options;
            const value = opts.context.val();

            if(value.length === 4) {
                if(opts.minDate != null && opts.minDate.length >= 4) {
                    if(Number(value) < Number(opts.minDate.substring(0, 4))) {
                        opts.context.val(opts.minDate.substring(0, 4)).trigger("keyup.datepicker", [true]);
                        opts.context.alert(N().message.get(opts.message, "minDate", [ opts.minDate ])).show();
                        return false;
                    }
                }
                if(opts.maxDate != null && opts.maxDate.length >= 4) {
                    if(Number(value) > Number(opts.maxDate.substring(0, 4))) {
                        opts.context.val(opts.maxDate.substring(0, 4)).trigger("keyup.datepicker", [true]);
                        opts.context.alert(N().message.get(opts.message, "maxDate", [ opts.maxDate ])).show();
                        return false;
                    }
                }
            } else if(value.length === 6) {
                if(opts.minDate != null && opts.minDate.length >= 6) {
                    if(Number(value) < Number(opts.minDate.substring(0, 6))) {
                        opts.context.val(opts.minDate.substring(0, 6)).trigger("keyup.datepicker", [true]);
                        opts.context.alert(N().message.get(opts.message, "minDate", [ opts.minDate ])).show();
                        return false;
                    }
                }
                if(opts.maxDate != null && opts.maxDate.length >= 6) {
                    if(Number(value) > Number(opts.maxDate.substring(0, 6))) {
                        opts.context.val(opts.maxDate.substring(0, 6)).trigger("keyup.datepicker", [true]);
                        opts.context.alert(N().message.get(opts.message, "maxDate", [ opts.maxDate ])).show();
                        return false;
                    }
                }
            } else if(value.length === 8) {
                if(opts.minDate != null && opts.minDate.length === 8) {
                    if(Number(value) < Number(opts.minDate)) {
                        opts.context.val(opts.minDate).trigger("keyup.datepicker", [true]);
                        opts.context.alert(N().message.get(opts.message, "minDate", [ opts.minDate ])).show();
                        return false;
                    }
                }
                if(opts.maxDate != null && opts.maxDate.length === 8) {
                    if(Number(value) > Number(opts.maxDate)) {
                        opts.context.val(opts.maxDate).trigger("keyup.datepicker", [true]);
                        opts.context.alert(N().message.get(opts.message, "maxDate", [ opts.maxDate ])).show();
                        return false;
                    }
                }
            }

            return true;
        };

        static wrapEle = function() {
            const opts = this.options;
            const self = this;

            // bind focusin event
            if(opts.focusin && !opts.context.prop("readonly") && !opts.context.prop("disabled")) {
                opts.context.off("focusin.datepicker").on("focusin.datepicker", function() {
                    self.show();
                });
            }

            // bind key events
            opts.context.off("keydown.datepicker").on("keydown.datepicker", function(e) {
                const keyCode = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);
                if(!EventUtils.isNumberRelatedKeys(e) || opts.context.val().length > 8) {
                    e.preventDefault();
                    return false;
                } else if (keyCode === 13 || keyCode === 9) { // When press the ENTER key
                    opts.context.get(0).blur();
                    self.hide();
                }
            }).off("keyup.datepicker").on("keyup.datepicker", function(e, isPassCheckMinMaxDate) {
                // Hangul does not apply e.preventDefault() of keydown event
                e.target.value = e.target.value.replace(/[^0-9]/g, "");

                const value = opts.context.val();
                const keyCode = e.keyCode ? e.keyCode : (e.which ? e.which : e.charCode);
                const format = (!opts.monthonly ? Context.attr("data").formatter.date.Ymd() : Context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, "");

                // when press the number keys
                if ((value.length > 2 && value.length%2 === 0) && keyCode !== 35 && keyCode !== 36 && keyCode !== 37 && keyCode !== 39 && keyCode !== 9 && keyCode !== 27) {
                    const dateStrArr = DateUtils.strToDateStrArr(value, format);
                    const dateStrStrArr = DateUtils.strToDateStrArr(value, format, true);

                    // validate input value
                    if(dateStrStrArr[0].length === 4 && dateStrArr[0] < 100) {
                        opts.context.alert(N().message.get(opts.message, "yearNaN")).show();
                        opts.context.val(value.replace(dateStrStrArr[0], ""));
                        return false;
                    } else if(dateStrStrArr[1].length === 2 && (dateStrArr[1] < 1 || dateStrArr[1] > 12)) {
                        opts.context.alert(N().message.get(opts.message, "monthNaN")).show();
                        opts.context.val(value.replace(dateStrStrArr[1], ""));
                        return false;
                    } else if(!opts.monthonly && dateStrStrArr[2].length === 2 && (dateStrArr[2] < 1 || dateStrArr[2] > parseInt(opts.gEndDate))) {
                        opts.context.alert(N().message.get(opts.message, "dayNaN", [String(parseInt(opts.gEndDate))])).show();
                        opts.context.val(value.replace(dateStrStrArr[2], ""));
                        return false;
                    }

                    // minDate, maxDate
                    if(!isPassCheckMinMaxDate && !Datepicker.checkMinMaxDate.call(self)) {
                        return false;
                    }

                    const yearsPanel = opts.contents.find(".datepicker_years_panel__");
                    const monthsPanel = opts.contents.find(".datepicker_months_panel__");
                    const daysPanel = opts.contents.find(".datepicker_days_panel__");

                    if((format.length === 3 && format.indexOf("md") > -1) || format.length === 2) {
                        Datepicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
                    } else {
                        if(!opts.monthonly) {
                            if(value.length === 8) {
                                Datepicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
                            }
                        } else {
                            if(value.length === 6) {
                                Datepicker.selectItems(opts, value, format, yearsPanel, monthsPanel, daysPanel);
                            }
                        }
                    }
                }

                if (keyCode === 27) { // When press the ESC key
                    e.preventDefault();
                    self.hide();
                }
            }).off("focusout.datepicker").on("focusout.datepicker", function(e) {
                // Hangul does not apply e.preventDefault() of keydown event
                if(!opts.context.prop("readonly") && !opts.context.prop("disable")) {
                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                }
            });
        };

        static createContents = function() {
            const opts = this.options;
            const self = this;

            const d = new Date();
            opts.currYear = parseInt(d.formatDate("Y"));
            const format = (!opts.monthonly ? Context.attr("data").formatter.date.Ymd() : Context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, "");

            opts.contents = N()('<div class="datepicker_contents__"></div>').on("click.datepicker", function(e) {
                e.stopPropagation();
            }).addClass("hidden__").addClass("years_panel_position_" + opts.yearsPanelPosition + "__")
                .addClass("months_panel_position_" + opts.monthsPanelPosition + "__");
            opts.context.off("click.datepicker").on("click.datepicker", function(e) {
                e.stopPropagation();
            });

            if(opts.monthonly) {
                opts.context.attr("maxlength", "6");
                opts.contents.addClass("datepicker_monthonly__");
            } else {
                opts.context.attr("maxlength", "8");
            }
            opts.contents.css({
                display: "none",
                position: "absolute"
            });

            const yearsPanel = N()('<div class="datepicker_years_panel__"></div>');
            let topMonthsPanel, topMonthItem, monthsPanel;
            let days, daysPanel, dayItem;

            if(opts.yearsPanelPosition === "left") {
                const yearItem = N()('<div></div>');
                // create year items
                let yearItemClone;
                yearsPanel.append(yearItem.clone(true).addClass("datepicker_year_title__").text(N().message.get(opts.message, "year")));
                // render year items
                let i;
                for(i=opts.currYear-2;i<=opts.currYear+2;i++) {
                    yearItemClone = yearItem.clone(true).addClass("datepicker_year_item__");
                    if(i === opts.currYear) {
                        yearItemClone.addClass("datepicker_curr_year__");
                        yearItemClone.addClass("datepicker_year_selected__");
                    }
                    yearsPanel.append(yearItemClone.text(StringUtils.lpad(String(i), 4, "0")));
                }

                // Binds click event to year items
                yearsPanel.on("click.datepicker", ".datepicker_year_item__", function(e, isForceUpdate) {
                    e.preventDefault();
                    const selectedYearItemEle = yearsPanel.find(".datepicker_year_item__.datepicker_year_selected__").removeClass("datepicker_year_selected__");
                    N()(this).addClass("datepicker_year_selected__");

                    const selYearStr = N()(this).text();
                    if(selYearStr !== selectedYearItemEle.text() || isForceUpdate) {
                        // immediately applys the changed year to the context element
                        if(opts.yearChangeInput) {
                            let dateVal = opts.context.val().replace(/\D/g,"");

                            if(dateVal.length <= 4) {
                                opts.context.val(StringUtils.lpad(selYearStr, 4, "0"));
                            } else {
                                let selDate;
                                let dateFormat;
                                if(dateVal.length === 6) {
                                    dateFormat = Context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");
                                } else if(dateVal.length === 8) {
                                    dateFormat = Context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");
                                }

                                if(dateFormat !== undefined) {
                                    selDate = DateUtils.strToDate(dateVal, dateFormat);

                                    let tempFormat = "";
                                    N()(dateFormat.split("")).each(function(i, formatChar) {
                                        tempFormat += formatChar + "-";
                                    });
                                    dateVal = selDate.obj.formatDate(tempFormat).replace(selDate.obj.formatDate("Y"), selYearStr).replace(/-/g, "");
                                    opts.context.val(dateVal);
                                }
                            }

                            // minDate, maxDate
                            if(!Datepicker.checkMinMaxDate.call(self)) {
                                return false;
                            }
                        }

                        if(!opts.monthonly) {
                            monthsPanel.find(".datepicker_month_item__.datepicker_month_selected__").trigger("click.datepicker");
                        }

                        if(opts.onChangeYear !== null) {
                            opts.onChangeYear.call(self, opts.context, selYearStr, e);
                        }
                        opts.context.trigger("onChangeYear", [opts.context, selYearStr, e]);
                    }
                });

                const yearPaging = N()('<div class="datepicker_year_paging__"><a href="#" class="datepicker_year_prev__" title="' + N().message.get(opts.message, "prev") + '"><span>&lt;</span></a><a href="#" class="datepicker_year_next__" title="' + N().message.get(opts.message, "next") + '"><span>&gt;</span></a></div>');
                yearPaging.find(".datepicker_year_prev__").on("click.datepicker", function(e) {
                    e.preventDefault();
                    Datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), opts.currYear, -5);
                    yearsPanel.find(".datepicker_year_selected__").trigger("click.datepicker", [true]);
                });
                yearPaging.find(".datepicker_year_next__").on("click.datepicker", function(e) {
                    e.preventDefault();
                    Datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), opts.currYear, 5);
                    yearsPanel.find(".datepicker_year_selected__").trigger("click.datepicker", [true]);
                });
                yearsPanel.append(yearPaging);
            } else if(opts.yearsPanelPosition === "top") {
                const prevYearBtn = N()('<div class="datepicker_year_paging__"><a href="#" class="datepicker_year_prev__" title="' + N().message.get(opts.message, "prev") + '"><span>&lt;</span></a></div>').appendTo(yearsPanel)
                    .find("> .datepicker_year_prev__").on("click.datepicker", function(e, isPrevYearBtn) {
                        e.preventDefault();
                        let selectedYear = parseInt(yearItem.val());
                        if(selectedYear > opts.currYear - opts.minYear) {
                            yearItem.val(StringUtils.lpad(String(selectedYear - 1), 4, "0")).trigger("change.datepicker", isPrevYearBtn ? [ isPrevYearBtn ] : undefined);
                        } else {
                            yearItem.empty();
                            selectedYear--;

                            let startYear = selectedYear - opts.minYear;
                            let endYear = selectedYear + opts.maxYear;
                            if(startYear < 100) {
                                startYear = 100;
                                endYear = startYear + opts.maxYear;
                            }
                            for(let i=startYear;i<=endYear;i++) {
                                let selected = "";
                                if(i === selectedYear) {
                                    opts.currYear = selectedYear;
                                    selected = 'selected="selected"';
                                }
                                yearItem.append('<option value="' + StringUtils.lpad(String(i), 4, "0") + '" ' + selected + '>' + StringUtils.lpad(String(i), 4, "0") +'</option>');
                            }
                            yearItem.trigger("change.datepicker", isPrevYearBtn ? [ isPrevYearBtn ] : undefined);
                        }
                    });

                const yearItem = N()('<select class="datepicker_year_item__"><select>')
                let yearStr;
                for(let i=opts.currYear-opts.minYear;i<=opts.currYear+opts.maxYear;i++) {
                    yearItem.append('<option value="' + StringUtils.lpad(String(i), 4, "0") +'"' + (i === opts.currYear ? 'selected="selected"' : "") + '>' + StringUtils.lpad(String(i), 4, "0") +'</option>');
                }
                yearItem.addClass("datepicker_year_item__ datepicker_year_selected__").on("change.datepicker", function(e, isPrevNextYearBtn) {
                    const selYearStr = N()(this).val();

                    // immediately applys the changed year to the context element
                    if(opts.yearChangeInput) {
                        let dateVal = opts.context.val().replace(/\D/g,"");

                        if(dateVal.length <= 4) {
                            opts.context.val(selYearStr);
                        } else {
                            let selDate;
                            let dateFormat;
                            if(dateVal.length === 6) {
                                dateFormat = Context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");
                            } else if(dateVal.length === 8) {
                                dateFormat = Context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");
                            }

                            if(dateFormat !== undefined) {
                                selDate = DateUtils.strToDate(dateVal, dateFormat);

                                let tempFormat = "";
                                N()(dateFormat.split("")).each(function(i, formatChar) {
                                    tempFormat += formatChar + "-";
                                });
                                dateVal = selDate.obj.formatDate(tempFormat).replace(selDate.obj.formatDate("Y"), selYearStr).replace(/-/g, "");
                                opts.context.val(dateVal);
                            }
                        }

                        // minDate, maxDate
                        if(!isPrevNextYearBtn) {
                            if(!Datepicker.checkMinMaxDate.call(self)) {
                                return false;
                            }
                        }
                    }

                    if(topMonthItem !== undefined) {
                        topMonthItem.trigger("change.datepicker");
                    }

                    if(opts.onChangeYear !== null) {
                        opts.onChangeYear.call(self, opts.context, selYearStr, e);
                    }
                    opts.context.trigger("onChangeYear", [opts.context, selYearStr, e]);

                }).appendTo(yearsPanel);

                const nextYearBtn = N()('<div class="datepicker_year_paging__"><a href="#" class="datepicker_year_next__" title="' + N().message.get(opts.message, "next") + '"><span>&gt;</span></a></div>').appendTo(yearsPanel)
                    .find("> .datepicker_year_next__").on("click.datepicker", function(e, isNextYearBtn) {
                        e.preventDefault();
                        let selectedYear = parseInt(yearItem.val());

                        if(selectedYear < opts.currYear + opts.maxYear && opts.currYear + opts.maxYear > opts.minYear + opts.maxYear) {
                            yearItem.val(StringUtils.lpad(String(selectedYear + 1), 4, "0")).trigger("change.datepicker", isNextYearBtn ? [ isNextYearBtn ] : undefined);
                        } else {
                            yearItem.empty();
                            selectedYear++;

                            const startYear = selectedYear - opts.minYear;
                            const endYear = selectedYear + opts.maxYear;

                            for(let i=startYear;i<=endYear;i++) {
                                let selected = "";
                                if(i === selectedYear) {
                                    opts.currYear = selectedYear;
                                    selected = 'selected="selected"';
                                }
                                yearItem.append('<option value="' + StringUtils.lpad(String(i), 4, "0") + '" ' + selected + '>' + StringUtils.lpad(String(i), 4, "0") +'</option>');
                            }
                            yearItem.trigger("change.datepicker", isNextYearBtn ? [ isNextYearBtn ] : undefined);
                        }
                    });
            }
            opts.contents.append(yearsPanel);

            // create month items
            monthsPanel = N()('<div class="datepicker_months_panel__"></div>');

            if(!opts.monthonly) {
                // creates the day items
                days = N().message.get(opts.message, "days").split(",");
                daysPanel = N()('<div class="datepicker_days_panel__"></div>');
                dayItem = N()('<div></div>');
            }

            if(opts.monthsPanelPosition === "top") {
                monthsPanel.hide();

                topMonthsPanel = N()('<div class="datepicker_top_months_panel__"></div>');
                topMonthItem = N()('<select><select>')
                for(let i=1;i<=12;i++) {
                    topMonthItem.append('<option value="' + String(i) +'"' + (i === parseInt(d.formatDate("m")) ? 'selected="selected"' : "") + '>' + StringUtils.lpad(String(i), 2, "0") +'</option>');
                }

                const prevMonthBtn = N()('<div class="datepicker_month_paging__"><a href="#" class="datepicker_month_prev__" title="' + N().message.get(opts.message, "prev") + '"><span>&lt;</span></a></div>').appendTo(topMonthsPanel)
                    .find("> .datepicker_month_prev__").on("click.datepicker", function(e) {
                        e.preventDefault();
                        let prevMonth = String(parseInt(topMonthItem.val()) - 1);
                        if(prevMonth < 1) {
                            const yearPrevBtnEle = yearsPanel.find(".datepicker_year_prev__");
                            if(opts.yearsPanelPosition === "left") {
                                const yearStr = String(Number(yearsPanel.find(".datepicker_year_selected__").text()) - 1);
                                yearsPanel.find(".datepicker_year_item__").removeClass("datepicker_year_selected__");
                                if(yearsPanel.find(".datepicker_year_item__:contains('" + StringUtils.lpad(String(yearStr), 4, "0") + "')").length === 0) {
                                    Datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), yearStr, -4, true);
                                }
                                yearsPanel.find(".datepicker_year_item__:contains('" + StringUtils.lpad(String(yearStr), 4, "0") + "')").trigger("click");
                            } else if(opts.yearsPanelPosition === "top") {
                                yearPrevBtnEle.trigger("click.datepicker", [ true ]);
                            }

                            prevMonth = 12;
                        }
                        topMonthItem.val(prevMonth);
                        monthsPanel.find(".datepicker_month_item__:contains(" + prevMonth + "):eq(0)").trigger("click.datepicker");
                    });

                topMonthItem.addClass("datepicker_month_item__ datepicker_month_selected__").on("change.datepicker", function() {
                    monthsPanel.find(".datepicker_month_item__:contains(" + N()(this).val() + "):eq(0)").trigger("click.datepicker");
                }).appendTo(topMonthsPanel);

                const nextMonthBtn = N()('<div class="datepicker_month_paging__"><a href="#" class="datepicker_month_next__" title="' + N().message.get(opts.message, "next") + '"><span>&gt;</span></a></div>').appendTo(topMonthsPanel)
                    .find("> .datepicker_month_next__").on("click.datepicker", function(e) {
                        e.preventDefault();
                        let nextMonth = String(parseInt(topMonthItem.val()) + 1);
                        if(nextMonth > 12) {
                            const yearNextBtnEle = yearsPanel.find(".datepicker_year_next__");
                            if(opts.yearsPanelPosition === "left") {
                                const yearStr = String(Number(yearsPanel.find(".datepicker_year_selected__").text()) + 1);
                                yearsPanel.find(".datepicker_year_item__").removeClass("datepicker_year_selected__");
                                if(yearsPanel.find(".datepicker_year_item__:contains('" + StringUtils.lpad(String(yearStr), 4, "0") + "')").length === 0) {
                                    Datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), yearStr, 0, true);
                                }
                                yearsPanel.find(".datepicker_year_item__:contains('" + StringUtils.lpad(String(yearStr), 4, "0") + "')").trigger("click");
                            } else if(opts.yearsPanelPosition === "top") {
                                yearNextBtnEle.trigger("click.datepicker", [ true ]);
                            }

                            nextMonth = 1;
                        }
                        topMonthItem.val(nextMonth);
                        monthsPanel.find(".datepicker_month_item__:contains(" + nextMonth + "):eq(0)").trigger("click.datepicker");
                    });

                if(opts.yearsPanelPosition === "left" && opts.monthsPanelPosition === "top") {
                    opts.contents.prepend(topMonthsPanel);
                } else {
                    opts.contents.append(topMonthsPanel);
                }

                if(opts.scrollMonthChange) {
                    opts.contents.on("mousewheel DOMMouseScroll", function(e) {
                        e.preventDefault();
                        if(e.originalEvent.wheelDelta > 0) {
                            nextMonthBtn.trigger("click.datepicker");
                        } else {
                            prevMonthBtn.trigger("click.datepicker");
                        }
                    });
                }

                if(opts.touchMonthChange) {
                    let startX;
                    let lastX;
                    opts.contents.on("touchstart", function(e) {
                        startX = e.originalEvent.touches[0].pageX;
                    }).on("touchmove", function(e) {
                        e.preventDefault();
                        lastX = e.originalEvent.touches[0].pageX;
                    }).on("touchend", function(e) {
                        const deltaX = startX - lastX;
                        if(Math.abs(deltaX) > 30) {
                            if(deltaX < 0) {
                                nextMonthBtn.trigger("click.datepicker");
                            } else {
                                prevMonthBtn.trigger("click.datepicker");
                            }
                        }

                        startX = undefined;
                        lastX = undefined;
                    });
                }
            }

            const monthItem = N()('<div></div>');
            monthsPanel.append(monthItem.clone().addClass("datepicker_month_title__").text(N().message.get(opts.message, "month")));
            // rendering the month items
            for(let i=1;i<=12;i++) {
                monthsPanel.append(monthItem.clone(true).addClass("datepicker_month_item__").text(String(i)));
                if(monthsPanel.find(".datepicker_month_selected__").length === 0) {
                    monthsPanel.find(".datepicker_month_item__:contains(" + String(parseInt(d.formatDate("m"))) + "):eq(0)").addClass("datepicker_month_selected__");
                }
            }
            opts.contents.append(monthsPanel);

            // Binds click event to month items
            monthsPanel.on("click.datepicker", ".datepicker_month_item__", function(e, ke) {
                e.preventDefault();

                const selectedMonthItemEle = monthsPanel.find(".datepicker_month_item__.datepicker_month_selected__").removeClass("datepicker_month_selected__");
                N()(this).addClass("datepicker_month_selected__");

                const selYearStr = yearsPanel.find(".datepicker_year_selected__")[opts.yearsPanelPosition === "left" ? "text" : "val"]();
                const selMonthStr = N()(this).text();
                if(selMonthStr !== selectedMonthItemEle.text()) {
                    // immediately applys the changed month to the context element
                    if(opts.monthChangeInput) {
                        let dateVal = opts.context.val().replace(/\D/g,"");

                        if(dateVal.length >= 4) {
                            let selDate;
                            let dateFormat;
                            if(dateVal.length === 4) {
                                dateFormat = "Ym";
                                dateVal = dateVal + StringUtils.lpad(selMonthStr, 2, "0");
                            } else if(dateVal.length === 6) {
                                dateFormat = Context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");
                            } else if(dateVal.length === 8) {
                                dateFormat = Context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");
                            }

                            if(dateFormat !== undefined) {
                                selDate = DateUtils.strToDate(dateVal, dateFormat);

                                let tempFormat = "";
                                N()(dateFormat.split("")).each(function(i, formatChar) {
                                    tempFormat += formatChar + "-";
                                });

                                const endDateCls = DateUtils.strToDate(StringUtils.lpad(selDate.obj.formatDate("Y"), 4, "0") +  StringUtils.lpad(String(Number(selMonthStr) + 1), 2, "0") + "00", "Ymd");
                                const endDate = endDateCls.obj.getDate();

                                dateVal = selDate.obj.formatDate(tempFormat)
                                    .replace(selDate.obj.formatDate("Y"), StringUtils.lpad(selDate.obj.formatDate("Y"), 4, "0"))
                                    .replace(selDate.obj.formatDate("m") + "-", StringUtils.lpad(selMonthStr, 2, "0") + "-");

                                if(Number(selDate.obj.formatDate("d")) > endDate) {
                                    dateVal = dateVal.replace(selDate.obj.formatDate("d") + "-", StringUtils.lpad(endDate, 2, "0") + "-");
                                } else if(Number(opts.lastSelectedDay) === endDate) {
                                    dateVal = dateVal.replace(selDate.obj.formatDate("d") + "-", StringUtils.lpad(opts.lastSelectedDay, 2, "0") + "-");
                                }
                                dateVal = dateVal.replace(/-/g, "");

                                opts.context.val(dateVal);
                            }

                            // minDate, maxDate
                            if(!Datepicker.checkMinMaxDate.call(self)) {
                                return false;
                            }
                        }
                    }

                    if(opts.onChangeMonth !== null) {
                        opts.onChangeMonth.call(self, opts.context, selMonthStr, selYearStr, e);
                    }
                    opts.context.trigger("onChangeMonth", [opts.context, selMonthStr, selYearStr, e]);
                }

                let dateFormat;
                if(opts.monthonly) {
                    const selDate = DateUtils.strToDate(StringUtils.lpad(selYearStr, 4, "0") + StringUtils.lpad(N()(this).text(), 2, "0"), "Ym");
                    // sets the date format by the global config.
                    selDate.format = Context.attr("data").formatter.date.Ym().replace(/[^Y|^m|^d]/g, "");

                    let onSelectContinue;
                    if(opts.onSelect !== null) {
                        onSelectContinue = opts.onSelect.call(self, opts.context, selDate, opts.monthonly);
                    }
                    if(onSelectContinue === undefined || onSelectContinue === true) {
                        dateFormat = selDate.format.replace(/[^Y|^m|^d]/g, "");
                        const yearVal = selDate.obj.formatDate("Y");
                        let dateVal = selDate.obj.formatDate(dateFormat);
                        if(yearVal.length === 3) {
                            let tempFormat = "";
                            N()(dateFormat.split("")).each(function(i, formatChar) {
                                tempFormat += formatChar + "-";
                            });
                            dateVal = selDate.obj.formatDate(tempFormat).replace(yearVal, "0" + yearVal).replace(/-/g, "");
                        }
                        opts.context.val(dateVal);
                    }
                    opts.context.trigger("onSelect", [opts.context, selDate, opts.monthonly]);

                    self.hide(ke);
                } else {
                    const selectedDay = daysPanel.find(".datepicker_day_selected__").text();
                    daysPanel.empty();
                    const endDateCls = DateUtils.strToDate(StringUtils.lpad(selYearStr, 4, "0") +  StringUtils.lpad(String(parseInt(N()(this).text())+1), 2, "0") + "00", "Ymd");
                    const endDate = endDateCls.obj.getDate();
                    opts.gEndDate = endDate;
                    if(format !== "Ymd") {
                        opts.gEndDate = 31;
                    }
                    endDateCls.obj.setDate(1);
                    const startDay = endDateCls.obj.getDay();
                    //render week
                    let j;
                    for(j=0;j<days.length;j++) {
                        daysPanel.append(dayItem.clone().addClass("datepicker_day_title__").text(days[j]));
                    }

                    const prevEndDateCls = DateUtils.strToDate(StringUtils.lpad(selYearStr, 4, "0") +  StringUtils.lpad(N()(this).text(), 2, "0") + "00", "Ymd");
                    const prevEndDate = prevEndDateCls.obj.getDate();
                    let day;
                    let dayItemT;
                    // rendering the day items
                    for(j=1-startDay;j<=42-startDay;j++) {
                        day = String(j);
                        dayItemT = dayItem.clone(true);
                        if(j<=0) {
                            dayItemT.addClass("datepicker_prev_day_item__");
                            day = String(prevEndDate + j);
                            dayItemT.data("year", prevEndDateCls.obj.getFullYear())
                                .data("month", prevEndDateCls.obj.getMonth() + 1)
                                .data("day", day);
                        } else if(j > endDate) {
                            dayItemT.addClass("datepicker_next_day_item__");
                            day = String(j-endDate);
                            dayItemT.data("year", endDateCls.obj.getMonth() + 1 === 12 ?  endDateCls.obj.getFullYear() + 1 : endDateCls.obj.getFullYear())
                                .data("month", endDateCls.obj.getMonth() + 2 === 13 ? 1 : endDateCls.obj.getMonth() + 2)
                                .data("day", day);
                        } else {
                            dayItemT.addClass("datepicker_day_item__");
                            dayItemT.data("year", endDateCls.obj.getFullYear())
                                .data("month", endDateCls.obj.getMonth() + 1)
                                .data("day", day);
                        }

                        const date = StringUtils.lpad(String(dayItemT.data("year")), 4, "0") +
                            StringUtils.lpad(String(dayItemT.data("month")), 2, "0") +
                            StringUtils.lpad(String(dayItemT.data("day")), 2, "0");

                        if(opts.minDate && Number(date) < Number(opts.minDate)) {
                            dayItemT.addClass("datepicker_min_date__");
                            dayItemT.tpBind("click", EventUtils.disable);
                        } else if(opts.maxDate && Number(date) > Number(opts.maxDate)) {
                            dayItemT.addClass("datepicker_max_date__");
                            dayItemT.tpBind("click", EventUtils.disable);
                        }

                        // holiday
                        const repeatDate = date.substring(4, 8);
                        const holidayValues = [];
                        if(opts.holiday.repeat && opts.holiday.repeat[repeatDate]) {
                            const repeatValue = opts.holiday.repeat[repeatDate];
                            if(getType(repeatValue) === "array") {
                                holidayValues.push(repeatValue.join(", "));
                            } else {
                                holidayValues.push(repeatValue);
                            }
                        }
                        if(opts.holiday.once && opts.holiday.once[date]) {
                            const onceValue = opts.holiday.once[date];
                            if(getType(onceValue) === "array") {
                                holidayValues.push(onceValue.join(", "));
                            } else {
                                holidayValues.push(onceValue);
                            }
                        }
                        if(!N().isEmptyObject(holidayValues)) {
                            dayItemT.addClass("datepicker_holiday__").attr("title", holidayValues.join(", "));
                        }

                        daysPanel.append(dayItemT.text(day));
                    }

                    daysPanel.find(".datepicker_prev_day_item__, .datepicker_day_item__, .datepicker_next_day_item__").each(function(i, ele) {
                        setTimeout(function() {
                            N()(ele).addClass("visible__");
                        }, i*10);
                    });

                    // automatic day selection
                    const dateVal = opts.context.val().replace(/\D/g,"");
                    if(!StringUtils.isEmpty(dateVal) && dateVal.length === 8) {
                        const selDate = DateUtils.strToDate(dateVal, dateFormat = Context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, ""));
                        daysPanel.find(".datepicker_day_item__:contains(" + String(Number(selDate.obj.formatDate("d"))) + "):eq(0)").addClass("datepicker_day_selected__");
                        if(!opts.monthChangeInput && Number(opts.lastSelectedDay) > endDate) {
                            daysPanel.find(".datepicker_day_item__:contains(" + String(endDate) + "):eq(0)").addClass("datepicker_day_selected__");
                        }
                    } else {
                        daysPanel.find(".datepicker_day_item__:contains(" + String(Number(d.formatDate("d"))) + "):eq(0)").addClass("datepicker_day_selected__");
                    }

                }
            });

            if(!opts.monthonly) {
                opts.contents.append(daysPanel);

                // Binds click event to day items
                daysPanel.on("click.datepicker", ".datepicker_day_item__, .datepicker_prev_day_item__, .datepicker_next_day_item__", function(e, ke) {
                    e.preventDefault();
                    const thisEle = N()(this);

                    daysPanel.find(".datepicker_prev_day_item__.datepicker_day_selected__, .datepicker_day_item__.datepicker_day_selected__, .datepicker_next_day_item__.datepicker_day_selected__").removeClass("datepicker_day_selected__");
                    thisEle.addClass("datepicker_day_selected__");
                    const selDate = DateUtils.strToDate(StringUtils.lpad(String(thisEle.data("year")), 4, "0") +
                        StringUtils.lpad(String(thisEle.data("month")), 2, "0") +
                        StringUtils.lpad(String(thisEle.data("day")), 2, "0"), "Ymd");

                    opts.lastSelectedDay = thisEle.text();

                    // sets the date format by the global config
                    selDate.format = Context.attr("data").formatter.date.Ymd().replace(/[^Y|^m|^d]/g, "");

                    let onSelectContinue;
                    if(opts.onSelect !== null) {
                        onSelectContinue = opts.onSelect.call(self, opts.context, selDate, opts.monthonly);
                    }
                    if(onSelectContinue === undefined || onSelectContinue === true) {
                        let dateFormat = selDate.format.replace(/[^Y|^m|^d]/g, "");
                        const yearVal = selDate.obj.formatDate("Y");
                        let dateVal = selDate.obj.formatDate(dateFormat);
                        if(yearVal.length === 3) {
                            let tempFormat = "";
                            N()(dateFormat.split("")).each(function(i, formatChar) {
                                tempFormat += formatChar + "-";
                            });
                            dateVal = selDate.obj.formatDate(tempFormat).replace(yearVal, "0" + yearVal).replace(/-/g, "");
                        }
                        opts.context.val(dateVal);
                    }
                    opts.context.trigger("onSelect", [opts.context, selDate, opts.monthonly]);
                    self.hide(ke);
                });
            }

            const contextParentWrapEle = opts.context.closest("label,span");
            // append datepicker panel after context
            if(contextParentWrapEle.length > 0) {
                opts.contextWrapper = contextParentWrapEle.after(opts.contents);
            } else {
                opts.context.after(opts.contents);
            }

            return opts.contents;
        };

        static yearPaging = function(yearItems, currYear, addCnt, absolute) {
            // Date Object's year value must be greater 2 digits
            yearItems.removeClass("datepicker_curr_year__");
            let thisEle;
            let yearNum;
            yearItems.each(function(i) {
                thisEle = N()(this);
                if(absolute !== undefined && absolute === true) {
                    yearNum = parseInt(currYear) + i;
                } else {
                    yearNum = parseInt(thisEle.text());
                }
                if(yearNum <= 100 - addCnt) {
                    thisEle.text(StringUtils.lpad(String(100 + i), 4, "0"));
                } else {
                    thisEle.text(StringUtils.lpad(String(yearNum + addCnt), 4, "0"));
                }
                if(thisEle.text() === String(currYear)) {
                    thisEle.addClass("datepicker_curr_year__");
                }
            });
        };

        static selectItems = function(opts, value, format, yearsPanel, monthsPanel, daysPanel) {
            if(value.length > 2 && value.length%2 !== 0) {
                value = (new Date()).formatDate(format);
            }

            const dateStrArr = DateUtils.strToDateStrArr(value, format);
            const dateStrStrArr = DateUtils.strToDateStrArr(value, format, true);

            // year item selection
            if(!isNaN(dateStrStrArr[0]) && dateStrStrArr[0].length === 4) {
                if(opts.yearsPanelPosition === "left") {
                    yearsPanel.find(".datepicker_year_item__").removeClass("datepicker_year_selected__");
                    Datepicker.yearPaging(yearsPanel.find(".datepicker_year_item__"), dateStrArr[0], -2, true);
                    yearsPanel.find(".datepicker_year_item__:contains('" + StringUtils.lpad(String(dateStrArr[0]), 4, "0") + "')").trigger("click");
                } else if(opts.yearsPanelPosition === "top") {
                    const yearItem = yearsPanel.find(".datepicker_year_item__");
                    if(yearItem.val() !== StringUtils.lpad(String(dateStrArr[0]), 4, "0")) {
                        yearItem.val(StringUtils.lpad(String(dateStrArr[0]), 4, "0"));
                        if(StringUtils.isEmpty(yearItem.val())) {
                            yearItem.empty();
                            let startYear = dateStrArr[0]-opts.minYear;
                            let endYear = dateStrArr[0]+opts.maxYear;
                            if(startYear < 100) {
                                startYear = 100;
                                endYear = startYear + opts.maxYear;
                            }
                            for(let i=startYear;i<=endYear;i++) {
                                let selected = "";
                                if(i === dateStrArr[0]) {
                                    opts.currYear = dateStrArr[0];
                                    selected = 'selected="selected"';
                                }
                                yearItem.append('<option value="' + StringUtils.lpad(String(i), 4, "0") +'" ' + selected + '>' + StringUtils.lpad(String(i), 4, "0") +'</option>');
                            }
                        }
                        if(!StringUtils.isEmpty(opts.context.val())) {
                            yearItem.trigger("change.datepicker");
                        }
                    }
                }
            }
            // month item selection
            if(!isNaN(dateStrStrArr[1]) && dateStrStrArr[1].length === 2) {
                monthsPanel.find(".datepicker_month_item__").removeClass("datepicker_month_selected__");
                if(!opts.monthonly) {
                    monthsPanel.find(".datepicker_month_item__:contains(" + String(dateStrArr[1]) + "):eq(0)").trigger("click.datepicker");
                } else {
                    monthsPanel.find(".datepicker_month_item__:contains(" + String(dateStrArr[1]) + "):eq(0)").addClass("datepicker_month_selected__");
                }
                if(opts.monthsPanelPosition === "top") {
                    opts.contents.find(".datepicker_top_months_panel__ .datepicker_month_item__").val(String(dateStrArr[1]));
                }
            }
            // day item selection
            if(!isNaN(dateStrStrArr[2]) && dateStrStrArr[2].length === 2) {
                daysPanel.find(".datepicker_prev_day_item__, .datepicker_day_item__, .datepicker_next_day_item__").removeClass("datepicker_day_selected__");
                daysPanel.find(".datepicker_day_item__:contains(" + String(dateStrArr[2]) + "):eq(0)").addClass("datepicker_day_selected__");
            }
        }

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        show() {
            const opts = this.options;

            const contextParentWrapEle = opts.context.closest("label,span");
            if((contextParentWrapEle.length === 0 && opts.context.next(".datepicker_contents__").length === 0)
                || (contextParentWrapEle.length > 0 && contextParentWrapEle.next(".datepicker_contents__").length === 0)) {
                N()(jQuery(".datepicker__").instance("datepicker")).each(function () {
                    if (this.options.contents.hasClass("visible__")) {
                        this.hide();
                    }
                });
                Datepicker.createContents.call(this);
            }

            // auto select datepicker items from before input value
            let dateStr;
            if(!StringUtils.isEmpty(opts.context.val())) {
                dateStr = opts.context.val().replace(/[^0-9]/g, "");
            } else {
                dateStr = !opts.monthonly ? (new Date()).formatDate("Ymd") : (new Date()).formatDate("Ym");
            }

            Datepicker.selectItems(opts,
                dateStr,
                (!opts.monthonly ? Context.attr("data").formatter.date.Ymd() : Context.attr("data").formatter.date.Ym()).replace(/[^Y|^m|^d]/g, ""),
                opts.contents.find(".datepicker_years_panel__"),
                opts.contents.find(".datepicker_months_panel__"),
                opts.contents.find(".datepicker_days_panel__"));

            if(opts.onBeforeShow !== null) {
                const result = opts.onBeforeShow.call(this, opts.context, opts.contents);
                if(result !== undefined && result === false) {
                    return this;
                }
            }
            opts.context.trigger("onBeforeShow", [opts.context, opts.contents]);

            // set datepicker position
            const formEle = opts.contents.closest(".form__");
            if(formEle.length > 0 && formEle.css("position") !== "relative") {
                this.formEleOrgPosition = formEle.css("position").replace("static", "");
                formEle.css("position", "relative");
            }
            const baseEle = opts.contextWrapper ? opts.contextWrapper : opts.context;
            N()(window).on("resize.datepicker", function() {
                let formPaddingLeft = 0;
                baseEle.parentsUntil(formEle.parent()).each(function(i, ele) {
                    formPaddingLeft += parseInt(N()(ele).css("padding-left")) + parseInt(jQuery(ele).css("margin-left"));
                });
                let formPaddingRight = 0;
                baseEle.parentsUntil(formEle.parent()).each(function(i, ele) {
                    formPaddingRight += parseInt(N()(ele).css("padding-right")) + parseInt(jQuery(ele).css("margin-right"));
                });
                let leftOfs = baseEle.position().left;
                const tdEle = baseEle.closest("td");
                if(tdEle.length > 0) {
                    tdEle.css("display", "contents");
                    leftOfs = baseEle.position().left + formPaddingLeft;
                    tdEle.css("display", "");
                }

                let limitWidth;
                if(formEle.length > 0 && formEle.innerWidth() > opts.contents.outerWidth()) {
                    limitWidth = formEle.offset().left + parseInt(formEle.css("padding-left")) + formEle.width();
                } else {
                    limitWidth = (window.innerWidth ? window.innerWidth : N()(window).width());
                }
                if(baseEle.offset().left + opts.contents.width() > limitWidth) {
                    opts.contents.css("left", (leftOfs + baseEle.outerWidth() - opts.contents.width()) + "px");
                    opts.contents.removeClass("orgin_left__").addClass("orgin_right__");
                } else {
                    opts.contents.css("left", leftOfs + "px");
                    opts.contents.removeClass("orgin_right__").addClass("orgin_left__");
                }
            }).trigger("resize.datepicker");

            const self = this;
            opts.contents.show(10, function() {
                N()(this).removeClass("hidden__").addClass("visible__");
                N()(this).one(EventUtils.whichTransitionEvent(opts.contents), function(e){
                    N()(document).off("click.datepicker").on("click.datepicker", function(e) {
                        opts.context.get(0).blur();
                        self.hide();
                    });

                    if(opts.onShow !== null) {
                        opts.onShow.call(self, opts.context, opts.contents);
                    }
                    opts.context.trigger("onShow", [opts.context, opts.contents]);
                }).trigger("nothing");
            });

            return this;
        };

        hide() {
            const opts = this.options;

            if(opts.contents.hasClass("visible__")) {
                const self = this;
                if(opts.onBeforeHide !== null) {
                    // arguments[0] - because of firefox, firefox does not have window.event object
                    const result = opts.onBeforeHide.call(this, opts.context, opts.contents, arguments.length > 0 ? arguments[0] : undefined);
                    if(result !== undefined && result === false) {
                        return this;
                    }
                }
                opts.context.trigger("onBeforeHide", [opts.context, opts.contents, arguments.length > 0 ? arguments[0] : undefined]);

                N()(window).off("resize.datepicker");
                N()(document).off("click.datepicker");
                opts.context.off("blur.datepicker");

                opts.contents.removeClass("visible__").addClass("hidden__");

                opts.contents.one(EventUtils.whichTransitionEvent(opts.contents), function(e){
                    if(self.formEleOrgPosition !== undefined) {
                        N()(this).closest(".form__").css("position", self.formEleOrgPosition);
                    }
                    N()(this).remove();
                    if(opts.onHide !== null) {
                        opts.onHide.call(self, opts.context);
                    }
                    opts.context.trigger("onHide", [opts.context]);
                }).trigger("nothing");
            }

            return this;
        };

    }

    // Popup


export const datepicker = (data, options) => new Datepicker(data, options);
export default Datepicker;
