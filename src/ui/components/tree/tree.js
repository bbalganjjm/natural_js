/**
 * Natural-JS UI Tree Component
 * Full version from original natural.ui.js lines 7333-7603
 */

import { error as createError, warn } from '../../../core/helpers/logger.js';
import { type as getType, isPlainObject, isString } from '../../../core/helpers/type-checker.js';
import { StringUtils } from '../../../core/utils/string.js';
import { ElementUtils } from '../../../core/utils/element.js';
import { Context } from '../../../architecture/context/context.js';
import { DataSync } from '../../../data/sync/data-sync.js';
import { Formatter } from '../../../data/formatter/formatter.js';
import { Iteration } from '../../shared/iteration.js';
import { UIUtils } from '../../shared/utils.js';

export class Tree {

        constructor(data, opts) {
            this.options = {
                data : getType(data) === "array" ? jQuery(data) : data,
                context : null,
                key : null,
                val : null,
                level : null, // optional
                parent : null,
                folderSelectable : false,
                checkbox : false,
                onSelect : null,
                onCheck : null
            };

            try {
                jQuery.extend(this.options, Context.attr("ui").tree);
            } catch (e) {
                throw createError("Tree", e);
            }

            if (isPlainObject(opts)) {
                // Wraps the global event options in NA.config and event options for this component.
                UIUtils.wrapHandler(opts, "tree", "onSelect");
                UIUtils.wrapHandler(opts, "tree", "onCheck");

                //convert data to wrapped set
                opts.data = getType(opts.data) === "array" ? jQuery(opts.data) : opts.data;

                jQuery.extend(this.options, opts);

                if(getType(this.options.context) === "string") {
                    this.options.context = jQuery(this.options.context);
                }
            } else {
                this.options.context = jQuery(opts);
            }

            // set style class name to context element
            this.options.context.addClass("tree__");

            // set this instance to context element
            this.options.context.instance("tree", this);

            // register this to DataSync for realtime data synchronization
            DataSync.instance(this, true);

            return this;
        };

        data(selFlag) {
            if(selFlag === undefined) {
                return this.options.data.get();
            } else if(selFlag === false) {
                return this.options.data;
            } else if(selFlag === "selected") {
                const data = this.options.data;
                if(arguments.length > 1) {
                    // clone arguments
                    const args = Array.prototype.slice.call(arguments, 0);
                    return this.options.context.find(".tree_active__").map(function() {
                        args[0] = data[jQuery(this).closest("li").data("index")];
                        return NC.json.mapFromKeys.apply(NC.json, args);
                    }).get();
                } else {
                    return this.options.context.find(".tree_active__").map(function() {
                        return data[jQuery(this).closest("li").data("index")];
                    }).get();
                }
            } else if(selFlag === "checked") {
                const data = this.options.data;
                if(arguments.length > 1) {
                    // clone arguments
                    const args = Array.prototype.slice.call(arguments, 0);
                    return this.options.context.find(":checked").map(function() {
                        args[0] = data[jQuery(this).closest("li").data("index")];
                        return NC.json.mapFromKeys.apply(NC.json, args);
                    }).get();
                } else {
                    return this.options.context.find(":checked").map(function() {
                        return data[jQuery(this).closest("li").data("index")];
                    }).get();
                }
            } else if(selFlag === "checkedInLastNode") {
                const data = this.options.data;

                if(arguments.length > 1) {
                    const args = Array.prototype.slice.call(arguments, 0);
                    return this.options.context.find(".tree_last_node__ :checked").map(function() {
                        args[0] = data[jQuery(this).closest("li").data("index")];
                        return NC.json.mapFromKeys.apply(NC.json, args);
                    }).get();
                } else {
                    return this.options.context.find(".tree_last_node__ :checked").map(function() {
                        return data[jQuery(this).closest("li").data("index")];
                    }).get();
                }
            }
        };

        context(sel) {
            return sel !== undefined ? this.options.context.find(sel) : this.options.context;
        };

        bind(data) {
            const opts = this.options;
            const self = this;

            //to rebind new data
            if(data != null) {
                opts.data = getType(data) === "array" ? jQuery(data) : data;
            }

            const rootNode = jQuery('<ul class="tree_level1_folder__"></ul>').appendTo(opts.context.empty());
            let isAleadyRoot = false;
            jQuery(opts.data).each(function(i, rowData) {
                if(rowData[opts.level] === 1 || !isAleadyRoot) {
                    rootNode.append('<li data-index="' + i + '" class="tree_' + rowData[opts.val] + '__ tree_level1_node__ tree_close__"><span class="tree_icon__"></span>' + (opts.checkbox ? '<span class="tree_check__"><input type="checkbox" /></span>' : '') + '<a class="tree_key__" href="#"><span>' + rowData[opts.key] + '</span></a><ul id="' + rowData[opts.val] + '" class="tree_level' + (opts.level !== null ? String(Number(rowData[opts.level]) + 1) : '') + '_folder__"></ul></li>');
                    isAleadyRoot = true;
                } else {
                    rootNode.find("#" + rowData[opts.parent]).append('<li data-index="' + i + '" class="tree_' + rowData[opts.val] + '__ tree_level' + StringUtils.trimToEmpty(rowData[opts.level]) + '_node__ tree_close__"><span class="tree_icon__"></span>' + (opts.checkbox ? '<span class="tree_check__"><input type="checkbox" /></span>' : '') + '<a class="tree_key__" href="#"><span>' + rowData[opts.key] + '</span></a><ul id="' + rowData[opts.val] + '" class="tree_level' + (opts.level !== null ? String(Number(rowData[opts.level]) + 1) : '') + '_folder__"></ul></li>');
                }
            });

            // add class to elements with no have chiidren
            const emptyUls = rootNode.find("ul:empty");
            emptyUls.parent().addClass("tree_last_node__");
            emptyUls.remove();

            // checkbox click event bind
            if(opts.checkbox) {
                rootNode.on("click.tree", ".tree_check__ > :checkbox", function(e) {
                    let checkFlag;
                    const siblingNodesEle = jQuery(this).closest("li").parent().children("li");
                    const parentNodesEle = jQuery(this).parents("li");
                    const parentNodeEle = jQuery(this).closest("ul").parent();
                    jQuery(this).removeClass("tree_auto_parents_select__");
                    if(jQuery(this).is(":checked")) {
                        jQuery(this).parent().siblings("ul").find(":not(:checked)").prop("checked", true);
                        checkFlag = true;
                    } else {
                        jQuery(this).parent().siblings("ul").find(":checked").prop("checked", false);
                        checkFlag = false;
                    }

                    const checkboxLength = siblingNodesEle.find(":checkbox").length;
                    const checkedLength = siblingNodesEle.find(":checked").length;
                    const parentNodeCheckboxEle = parentNodeEle.find("> span.tree_check__ > :checkbox");
                    const parentNodesCheckedEle = parentNodesEle.not(":first").find("> span.tree_check__ > :checkbox");
                    if(checkFlag) {
                        if(checkedLength > 0) {
                            if(checkedLength < checkboxLength) {
                                parentNodesEle.find("> span.tree_check__ > :not(:checked)").prop("checked", true).addClass("tree_auto_parents_select__");
                            } else if(checkedLength === checkboxLength) {
                                parentNodeCheckboxEle.prop("checked", true).removeClass("tree_auto_parents_select__");
                                // apply click effect to parents nodes
                                // FIXME this code is temporary code
                                parentNodeCheckboxEle.trigger("click.tree").trigger("click.tree");
                            }
                        }
                    } else {
                        if(checkedLength > 0 && checkedLength < checkboxLength) {
                            parentNodesCheckedEle.addClass("tree_auto_parents_select__");
                        } else if(checkedLength === 0) {
                            parentNodesCheckedEle.prop("checked", false).removeClass("tree_auto_parents_select__");
                            // apply click effect to parents nodes
                            // FIXME this code is temporary code
                            parentNodeCheckboxEle.trigger("click.tree").trigger("click.tree");
                        }
                    }

                    // run onCheck event callback
                    // FIXME "e.clientX > 0 && e.clientY > 0" is temporary code
                    if(opts.onCheck !== null && e.clientX > 0 && e.clientY > 0) {
                        const closestLi = jQuery(this).closest("li");
                        const checkedEle = jQuery(this).closest("ul").find(".tree_last_node__ :checked");
                        opts.onCheck.call(self
                            , closestLi.data("index")
                            , closestLi
                            , opts.data[closestLi.data("index")]
                            , checkedEle.map(function() {
                                return jQuery(this).closest("li").data("index");
                            }).get()
                            , checkedEle
                            , checkedEle.map(function() {
                                return opts.data[jQuery(this).closest("li").data("index")];
                            }).get()
                            , checkFlag);
                    }
                });
            }

            // node name click event bind
            rootNode.on("click.tree", "li" + (!opts.folderSelectable ? ".tree_last_node__" : "") + " .tree_key__", function(e) {
                e.preventDefault();
                const parentLi = jQuery(this).parent("li");
                if(opts.onSelect !== null) {
                    opts.onSelect.call(self, parentLi.data("index"), parentLi, opts.data[parentLi.data("index")]);
                }
                rootNode.find("li > a.tree_key__.tree_active__").removeClass("tree_active__");
                jQuery(this).addClass("tree_active__");
            });

            // icon click event bind
            rootNode.on("click.tree", ".tree_icon__" + (!opts.folderSelectable ? ", li:not('.tree_last_node__') .tree_key__" : ""), function(e) {
                e.preventDefault();
                const parentLi = jQuery(this).parent("li");
                if(parentLi.find("> ul > li").length > 0) {
                    if(parentLi.hasClass("tree_open__")) {
                        parentLi.removeClass("tree_open__").addClass("tree_close__");
                    } else {
                        parentLi.removeClass("tree_close__").addClass("tree_open__");
                    }
                }
            });

            if(opts.folderSelectable) {
                rootNode.on("click.tree", "li:not('.tree_last_node__') .tree_key__", function(e) {
                    e.preventDefault();
                });
            }

            this.collapse(true);

            return this;
        };

        // val(row, key, val) {
        //     // TODO
        //     // notify
        //     return this;
        // };

        select(val) {
            const opts = this.options;
            if(val !== undefined) {
                opts.context.find(".tree_" + val + "__ > .tree_key__").trigger("click.tree");
                return this;
            } else {
                const activeNodeEle = opts.context.find(".tree_key__.tree_active__");
                if(opts.data.length > 0 && activeNodeEle.length > 0) {
                    return opts.data[activeNodeEle.parent("li").data("index")][opts.val];
                }
            }
        };

        // check(vals) {
        //     // TODO
        //     return this;
        // };

        expand() {
            this.options.context.find("li.tree_close__:not(.tree_last_node__)").removeClass("tree_close__").addClass("tree_open__");
            return this;
        };

        collapse(isFirstNodeOpen) {
            this.options.context.find("li.tree_open__:not(.tree_last_node__)").removeClass("tree_open__").addClass("tree_close__");
            if(isFirstNodeOpen) {
                this.options.context.find("li.tree_close__:first").removeClass("tree_close__").addClass("tree_open__");
            }
            return this;
        };

        // update(row, key) {
        //     // TODO
        //     return this;
        // }

    }


export const tree = (data, options) => new Tree(data, options);
export default Tree;
