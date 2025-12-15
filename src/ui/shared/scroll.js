/**
 * Natural-JS UI Scroll
 * Simplified version - full implementation in original natural.ui.js lines 377-411
 */

export class Scroll {
    static paging(contextWrapEle, defSPSize, rowEleLength, rowTagName, bindOpt) {
        const opts = this.options;
        const self = this;

        contextWrapEle.on("scroll", function() {
            if(opts.scrollPaging.size > 0 && opts.isBinding === false) {
                const thisWrap = jQuery(this);
                if (Math.ceil(thisWrap.scrollTop()) >= opts.context.height() - thisWrap.height()) {
                    rowEleLength = opts.context.find(rowTagName).length;
                    
                    if (rowEleLength >= opts.scrollPaging.idx + defSPSize) {
                        if (rowEleLength > 0 && rowEleLength <= opts.data.length) {
                            opts.scrollPaging.idx += defSPSize;
                        }

                        if (opts.scrollPaging.idx + opts.scrollPaging.limit >= opts.data.length) {
                            opts.scrollPaging.limit = opts.data.length - opts.scrollPaging.idx;
                        } else {
                            opts.scrollPaging.limit = defSPSize;
                        }

                        if(opts.scrollPaging.idx < opts.data.length) {
                            self.bind(undefined, bindOpt);
                        } else if(opts.scrollPaging.idx === opts.data.length) {
                            opts.scrollPaging.limit = opts.scrollPaging.size === 0 ? opts.data.length : opts.scrollPaging.size;
                        }
                    }
                }
            }
        });
    }
}

export default Scroll;
