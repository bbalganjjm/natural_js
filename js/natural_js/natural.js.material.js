const nmd3 = {
    button: {
        onBeforeCreate: function (context, opts) {
            if (context.data("nmd")) {
                const nmdOpts = context.data("nmd");
                if (!nmdOpts.tag) {
                    return false;
                }
                let startTag = '<' + nmdOpts.tag;
                for (const attrNm in nmdOpts) {
                    if (attrNm !== "tag" && attrNm !== "icon") {
                        startTag += nmdOpts[attrNm] ? ' ' + attrNm + '="' + N.string.trimToEmpty(nmdOpts[attrNm]) + '"' : '';
                    }
                }
                startTag += '>';
                const endTag = '</' + nmdOpts.tag + '>';
                context.html(startTag + context.text() + nmdOpts.icon + endTag);
            }
        },
        onCreate: function (context, opts) {

        }
    }
}