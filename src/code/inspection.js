/**
 * Natural-JS Code Inspection
 * Full implementation from natural.code.js lines 16-196
 */

import { error as createError, warn, log } from '../core/helpers/logger.js';
import { isEmpty, startsWith, trimToEmpty } from '../core/utils/string.js';
import { is as isBrowser } from '../core/utils/browser.js';
import { get as getMessage } from '../core/utils/message.js';
import { Context } from '../architecture/context/context.js';

// Import N at runtime to avoid circular dependency
const N = () => window.N;

export class Code {
    static severityLevels = Object.freeze({
        BLOCKER: ["Blocker", "darkred", createError],
        CRITICAL: ["Critical", "red", createError],
        MAJOR: ["Major", "orange", warn],
        MINOR: ["Minor", "black", log]
    });

    static inspection = class {
        static test(codes, rules) {
            if(codes.indexOf("<script") < 0) {
                return false;
            }
            const report = []

            if(!Context.attr("code") || (Context.attr("code") && !Context.attr("code").inspection)) {
                throw createError("Define Natural-CODE options and message resources in Context.attr(\"code\").inspection in the natural.config.js file.");
            }

            if(rules) {
                N()(rules).each(function() {
                    Code.inspection.rules[this](codes, Context.attr("code").inspection.excludes, report);
                });
            } else {
                for(const k in Code.inspection.rules) {
                    Code.inspection.rules[k](codes, Context.attr("code").inspection.excludes, report);
                }
            }

            return report;
        }

        static rules = {
            /**
             * Detect code that does not specify view in the context of jQuery Selector.
             */
            "NoContextSpecifiedInSelector" : function(codes, excludes, report) {
                const regex = /\/{2}.*|[N$]\((.*?)\)(.*)/gm;
                let match;
                while (match=regex.exec(codes)) {
                    let isExclude = false;
                    N()(excludes).each(function(i, str) {
                        if(match[0].indexOf(str) > -1) {
                            isExclude = true;
                            return false;
                        }
                    });

                    if(match.length > 2 && match[2] && match[2].replace(/ /g, "").indexOf("view)") > -1) {
                        isExclude = true;
                    }

                    if(startsWith(match[0], "//")) {
                        isExclude = true;
                    }

                    // selector excludes
                    const selector = trimToEmpty(match[1]).replace(/ /g, "");
                    if((/^["']/g).test(selector)) {
                        if(!isExclude) {
                            if((/[\(\)]|,view|,cont\.view|",|',|^"<|^'<|>"$|>'$|html|body/g).test(selector)) {
                                isExclude = true;
                            }

                            if(!(/,view|,cont.view/g).test(selector)
                                && (/"\+|'\+|\+"|\+'/g).test(selector)) {
                                isExclude = false;
                            }
                        }

                        // method excludes
                        if(!isExclude) {
                            const method = match[2];
                            if((/^\.cont\(|^\.comm\(|^\.select\(|^\.form\(|^\.list\(|^\.grid\(|^\.pagination\(|^\.tree\(|^\.instance\(/g).test(method)) {
                                isExclude = true;
                            }
                        }

                        if(!isExclude) {
                            let script = "";
                            try {
                                script = codes.substring(codes.indexOf("<script"), codes.indexOf("</script>"));
                            } catch(e) { warn(e) }
                            if(script.indexOf(match[0]) > -1) {
                                report.push({
                                    "level" : Code.severityLevels.CRITICAL[0],
                                    "message" : getMessage(Context.attr("code").inspection.message, "NoContextSpecifiedInSelector"),
                                    "line" : codes.substring(0, regex.lastIndex).split("\n").length,
                                    "code" : match[0],
                                });
                            }
                        }
                    }
                }
            },
            /**
             * Detects code using jQuery's val method instead of the val method of the Natural-UI component.
             */
            "UseTheComponentsValMethod" : function(codes, excludes, report) {
                const regex = /\/{2}.*|[N$]\((.*?)\)\.val\((.*?)\)(.*)/gm;
                let match;
                while (match=regex.exec(codes)) {
                    let isExclude = false;
                    N()(excludes).each(function(i, str) {
                        if(match[0].indexOf(str) > -1) {
                            isExclude = true;
                            return false;
                        }
                    });

                    if(!isExclude) {
                        const args = match[2];
                        if(isEmpty(args)) {
                            isExclude = true;
                        }
                    }

                    if(startsWith(match[0], "//")) {
                        isExclude = true;
                    }

                    if(!isExclude) {
                        let script = "";
                        try {
                            script = codes.substring(codes.indexOf("<script"), codes.indexOf("</script>"));
                        } catch(e) { warn(e) }
                        if(script.indexOf(match[0]) > -1) {
                            report.push({
                                "level" : Code.severityLevels.MAJOR[0],
                                "message" : getMessage(Context.attr("code").inspection.message, "UseTheComponentsValMethod"),
                                "line" : codes.substring(0, regex.lastIndex).split("\n").length,
                                "code" : match[0],
                            });
                        }
                    }
                }
            }
        };

        static report = {
            console : function(data, url) {
                if(!data) {
                    return false;
                }
                N()(data).each(function() {
                    const consoleLogger = Code.severityLevels[this.level.toUpperCase()][2];
                    if(Context.attr("code").inspection.abortOnError && (this.level === Code.severityLevels.BLOCKER[0] || this.level === Code.severityLevels.CRITICAL[0])) {
                        throw consoleLogger("[" + this.level + "] " + url + " - " + this.line + " : " + this.code + "\n" + this.message + "\n\n");
                    } else {
                        if(isBrowser("ie")) {
                            consoleLogger("[" + this.level + "] " + url + " - " + this.line + " : " + this.code, "\n" + this.message);
                        } else {
                            consoleLogger("%c[" + this.level + "] " + url + " - " + this.line + " : " + this.code, "color: " + Code.severityLevels[this.level.toUpperCase()][1] + "; font-weight: bold; line-height: 200%;",
                                "\n" + this.message);
                        }
                    }
                });
            }
        };
    }

    static addSourceURL(codes, sourceURL) {
        if(codes.indexOf("<script") < 0) {
            return codes;
        }

        let cutIndex = codes.lastIndexOf("\n</script>");
        if(cutIndex < 0) {
            cutIndex = codes.lastIndexOf("\t</script>");
        }
        if(cutIndex < 0) {
            cutIndex = codes.lastIndexOf(" </script>");
        }

        return [codes.slice(0, cutIndex), '\n//# sourceURL=' + sourceURL + "\n", codes.slice(cutIndex)].join("");
    }
}

export const inspection = Code.inspection;
export default Code;
