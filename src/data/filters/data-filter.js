/**
 * Natural-JS Data Filter
 * Full implementation from natural.data.js lines 1124-1169
 */

import { isWrappedSet, type } from '../../core/helpers/type-checker.js';

// Import N at runtime to avoid circular dependency
const N = () => window.N;

export class DataFilter {
    static filter(arr, condition) {
        if(typeof condition === "function") {
            return isWrappedSet(arr) ? N()(jQuery.grep(arr.toArray(), condition)) : jQuery.grep(arr, condition);
        } else if(type(condition) === "string") {
            condition = condition.replace(/ /g, "").replace(/\|\|/g, " || item.").replace(/\&\&/g, " && item.");
            const testFn = new Function("item", "return item." + condition);
            return isWrappedSet(arr) ? N()(jQuery.grep(arr.toArray(), function(item) {
                return testFn(item);
            })) : jQuery.grep(arr, function(item) {
                return testFn(item);
            });
        } else {
            return arr;
        }
    }

    static sortBy(key, reverse) {
        return function(a, b) {
            a = a[key];
            b = b[key];
            if (Number(a) && Number(b)) {
                a = Number(a);
                b = Number(b);
            }
            if (a < b) {
                return reverse * -1;
            }
            if (a > b) {
                return reverse * 1;
            }
            return 0;
        };
    }

    static sort(arr, key, reverse) {
        if(reverse) {
            reverse = -1;
        } else {
            reverse = 1;
        }
        return arr.sort(DataFilter.sortBy(key, reverse));
    }
}

export const filter = DataFilter.filter.bind(DataFilter);
export const sort = DataFilter.sort.bind(DataFilter);
export default DataFilter;
