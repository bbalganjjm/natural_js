/**
 * Natural-JS Element Utilities
 */

export class ElementUtils {
    /**
     * make options object from class attribute
     */
    static toOpts(ele) {
        return N(ele).data("opts");
    }

    /**
     * make rules object from input element
     */
    static toRules(ele, ruleset) {
        const retRules = {};
        let thisEle;
        let id;
        ele.each(function() {
            thisEle = jQuery(this);
            if(thisEle.is("input:radio, input:checkbox")) {
                id = thisEle.attr("name");
            } else {
                id = thisEle.attr("id");
            }
            retRules[id] = thisEle.data(ruleset);
        });
        return retRules;
    }

    /**
     * make data object from input element
     */
    static toData(eles) {
        const retData = {};
        let key, ele;
        let beforeCheckboxNRadios = jQuery();
        eles.each(function() {
            key = jQuery(this).attr("id");
            ele = jQuery(this);
            if(ele.is("input:radio") || ele.is("input:checkbox")) {
                if(beforeCheckboxNRadios.filter(ele).length === 0) {
                    if(ele.closest(".select_input_container__").length > 0) {
                        ele = ele.closest(".select_input_container__").find("input:" + ele.attr("type") + "[name='" + ele.attr("name") + "']");
                        beforeCheckboxNRadios = ele;
                    } else if(ele.parent("label").length > 0) {
                        ele = ele.parent().siblings("label").find("input:" + ele.attr("type") + "[name='" + ele.attr("name") + "']");
                        ele.push(this);
                        beforeCheckboxNRadios = ele;
                    } else {
                        ele = ele.siblings("input:" + ele.attr("type") + "[name='" + ele.attr("name") + "']");
                        ele.push(this);
                        beforeCheckboxNRadios = ele;
                    }

                    if(ele.length > 1) {
                        key = ele.attr("name");
                    } else if (ele.length === 1) {
                        key = ele.attr("id");
                        if(key === undefined) {
                            key = ele.attr("name");
                        }
                    }

                    if(key !== undefined) {
                        retData[key] = ele.vals();
                    }
                }
            } else {
                if(key !== undefined) {
                    if(!ele.is("select")) {
                        if(ele.is("img")) {
                            retData[key] = ele.attr("src");
                        } else {
                            if(!ele.is(":input")) {
                                retData[key] = ele.text();
                            } else {
                                retData[key] = ele.val();
                            }
                        }
                    } else {
                        retData[key] = ele.vals();
                    }
                }
            }
        });
        return retData;
    }

    /**
     * Data change effect for ND.ds
     */
    static dataChanged(ele) {
        ele.addClass("data_changed__");
        ele.fadeOut(150).fadeIn(300);
    }

    /**
     * Get the maximum z-index of all elements
     */
    static maxZindex(ele) {
        if (ele === undefined) {
            ele = jQuery("div, span, ul, p, nav, article, section");
        }
        return Math.max.apply(null, jQuery.map(ele, function(e) {
            const zIndex = parseInt(jQuery(e).css("z-index"));
            if (zIndex >= 2147483647) {
                jQuery(e).css("z-index", String(2147483647 - 999));
                jQuery(e).attr("fixed", "[Natural-JS]limited_z-index_value(-999)");
            }
            return zIndex || 0;
        }));
    }
}

// Export individual methods
export const { toOpts, toRules, toData, dataChanged, maxZindex } = ElementUtils;
