/**
 * Natural-JS Resource Garbage Collector
 */

// Placeholder for NA.context (will be injected from N.js)
let NAContext;

const getContext = () => NAContext || { 
    attr: () => ({ 
        architecture: {
            page: { context: document }
        }
    }) 
};

export class GC {
    /**
     * Minimum collection
     */
    static minimum() {
        jQuery(window).off("resize.datepicker");
        jQuery(window).off("resize.alert");
        jQuery(document).off("click.datepicker");
        jQuery(document).off("keyup.alert");
        jQuery(document).off("click.grid.dataFilter");
        jQuery(document).off("click.grid.more touchstart.grid.more");
        return true;
    }

    /**
     * Full collection
     */
    static full() {
        jQuery(window).off("resize.datepicker");
        jQuery(window).off("resize.alert");
        jQuery(document).off("dragstart.alert selectstart.alert mousemove.alert touchmove.alert mouseup.alert touchend.alert");
        jQuery(document).off("click.datepicker");
        jQuery(document).off("keyup.alert");
        jQuery(document).off("dragstart.grid.vResize selectstart.grid.vResize mousemove.grid.vResize touchmove.grid.vResize mouseup.grid.vResize touchend.grid.vResize");
        jQuery(document).off("dragstart.grid.resize selectstart.grid.resize mousemove.grid.resize touchmove.grid.resize mouseup.grid.resize touchend.grid.resize");
        jQuery(document).off("click.grid.dataFilter");
        jQuery(document).off("click.grid.more touchstart.grid.more");
        return true;
    }

    /**
     * Removes garbage instances from observables of ND.ds
     */
    static ds() {
        const ctx = getContext();
        if(jQuery(ctx.attr("architecture").page.context).find(">#data_sync_temp__").length > 0) {
            jQuery(ctx.attr("architecture").page.context).find(">#data_sync_temp__").instance("ds").obserable
                = jQuery.uniqueSort(jQuery(".grid__, .list__, .form__:not('.grid__>tbody, .list__>li'), .tree__", ctx.attr("architecture").page.context).instance());
        }
    }
}

// Export individual methods
export const { minimum, full, ds } = GC;

// Setter for context (to be called from N.js integration)
export const setContext = (ctx) => {
    NAContext = ctx;
};
