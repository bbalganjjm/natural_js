/**
 * Natural-JS Serial Execute Utility
 */

export class SerialExecute {
    /**
     * Run asynchronous execution sequentially
     * @param {...Function} functions - Functions to execute in sequence
     * @returns {Array} Array of jQuery Deferred objects
     */
    static execute() {
        const defers = [];
        jQuery(arguments).each(function(i, fn){
            const defer = jQuery.Deferred();
            defers.push(defer);
            if(defers.length > 1) {
                defers[i-1].done(function() {
                    fn.apply(defers, jQuery.merge([defer], arguments));
                });
            } else {
                fn.apply(defers, [defer]);
            }
        });
        return defers;
    }
}

// Export as serialExecute (backward compatibility with NC.serialExecute)
export const serialExecute = SerialExecute.execute;
