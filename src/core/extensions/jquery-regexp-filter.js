/**
 * Natural-JS jQuery Regexp Filter Selector Extension
 * Extends jQuery selector with :regexp() pseudo-selector for regex-based element filtering
 * 
 * Usage examples:
 * - jQuery('div:regexp(class, ^prefix.*)')         // Match class attribute starting with "prefix"
 * - jQuery('input:regexp(data:validation, ^required)')  // Match data attribute
 * - jQuery('span:regexp(css:color, ^rgb)')         // Match CSS property
 */

const paramMatch = /^([^,]+),(.+)/;
const getterMap = {
    "default": function($el, attrName, propertyName) {
        return $el.attr(attrName) ? [ $el.attr(attrName) ] : [];
    },
    "data": function($el, attrName, propertyName) {
        return $el.data(propertyName) ? [ $el.data(propertyName) ] : [];
    },
    "class": function($el, attrName, propertyName) {
        return $el.attr('class') ? $el.attr('class').split(' ') : [];
    },
    "css": function($el, attrName, propertyName) {
        return $el.css(propertyName) ? [ $el.css(propertyName) ] : [];
    }
};

/**
 * Initialize jQuery regexp filter selector
 * This should be called during Natural-JS initialization
 */
export function initRegexpFilter() {
    if (!jQuery || !jQuery.expr || !jQuery.expr.createPseudo) {
        console.warn('[Natural-JS] jQuery or jQuery.expr.createPseudo is not available. Regexp filter not initialized.');
        return;
    }

    jQuery.expr.pseudos.regexp = jQuery.expr.createPseudo(function(meta) {
        if (!meta) return jQuery.noop;

        const params = meta.match(paramMatch);
        if (!params) return jQuery.noop;

        const attrNames = params[1].trim().split(':');
        const attrName = attrNames[0].trim();
        const propertyName = attrNames.length === 2 ? attrNames[1].trim() : '';
        const regexp = new RegExp(params[2].trim());
        const getter = getterMap[attrName] || getterMap['default'];

        return function(el) {
            const $el = jQuery(el);
            const values = getter($el, attrName, propertyName);
            for (let i = 0, len = values.length; i < len; i++) {
                if (regexp.test(values[i])) return true;
            }
            return false;
        };
    });
}

