/**
 * Natural-JS Data Filter
 * Simplified version - full implementation in original natural.data.js lines 1124-1169
 */

export class DataFilter {
    static filter(data, condition) {
        if (!condition) return data;
        
        return jQuery(data).filter(function() {
            for (const key in condition) {
                if (this[key] !== condition[key]) {
                    return false;
                }
            }
            return true;
        }).toArray();
    }

    static sort(data, key, reverse) {
        const sorted = jQuery.extend(true, [], data);
        
        sorted.sort(function(a, b) {
            const aVal = a[key];
            const bVal = b[key];
            
            if (aVal < bVal) return reverse ? 1 : -1;
            if (aVal > bVal) return reverse ? -1 : 1;
            return 0;
        });
        
        return sorted;
    }
}

export const filter = DataFilter.filter.bind(DataFilter);
export const sort = DataFilter.sort.bind(DataFilter);
export default DataFilter;
