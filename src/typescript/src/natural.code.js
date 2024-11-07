/*!
 * Natural-CODE v0.4.8
 *
 * Released under the LGPL v2.1 license
 * Date: 2019-02-28T18:00Z
 *
 * Copyright 2014 Goldman Kim(bbalganjjm@gmail.com)
 */

import { N } from "./natural-js";
import { NC } from "./natural.core";
import { NA } from "./natural.architecture";

N.version["Natural-CODE"] = "0.4.8";

export class NCD {

    static severityLevels = Object.freeze({
        BLOCKER: ["Blocker", "darkred", NC.error],
        CRITICAL: ["Critical", "red", NC.error],
        MAJOR: ["Major", "orange", NC.warn],
        MINOR: ["Minor", "black", NC.log]
    });

    static inspection = class {

        static test(codes, rules) {
            if(codes.indexOf("<script") < 0) {
                return false;
            }
            const report = []

            if(!NA.context.attr("code") || (NA.context.attr("code") && !NA.context.attr("code").inspection)) {
                throw NC.error("Define Natural-CODE options and message resources in NA.context.attr(\"code\").inspection in the natural.config.js file.");
            }

            if(rules) {
                N(rules).each(function() {
                    NCD.inspection.rules[this](codes, NA.context.attr("code").inspection.excludes, report);
                });
            } else {
                for(const k in NCD.inspection.rules) {
                    NCD.inspection.rules[k](codes, NA.context.attr("code").inspection.excludes, report);
                }
            }

            return report;
        };

        static rules = {
            /**
             * Detect code that does not specify view in the context of jQuery Selector.
             */
            "NoContextSpecifiedInSelector" : function(codes, excludes, report) {
                const regex = /\/{2}.*|[N$]\((.*?)\)(.*)/gm;
                let match;
                while (match=regex.exec(codes)) {
                    let isExclude = false;
                    N(excludes).each(function(i, str) {
                        if(match[0].indexOf(str) > -1) {
                            isExclude = true;
                            return false;
                        }
                    });

                    if(match.length > 2 && match[2] && match[2].replace(/ /g, "").indexOf("view)") > -1) {
                        isExclude = true;
                    }

                    if(NC.string.startsWith(match[0], "//")) {
                        isExclude = true;
                    }

                    // selector excludes
                    const selector = NC.string.trimToEmpty(match[1]).replace(/ /g, "");
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
                            } catch(e) { NC.warn(e) }
                            if(script.indexOf(match[0]) > -1) {
                                report.push({
                                    "level" : NCD.severityLevels.CRITICAL[0],
                                    "message" : NC.message.get(NA.context.attr("code").inspection.message, "NoContextSpecifiedInSelector"),
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
                    N(excludes).each(function(i, str) {
                        if(match[0].indexOf(str) > -1) {
                            isExclude = true;
                            return false;
                        }
                    });

                    if(!isExclude) {
                        const args = match[2];
                        if(NC.string.isEmpty(args)) {
                            isExclude = true;
                        }
                    }

                    if(NC.string.startsWith(match[0], "//")) {
                        isExclude = true;
                    }

                    if(!isExclude) {
                        let script = "";
                        try {
                            script = codes.substring(codes.indexOf("<script"), codes.indexOf("</script>"));
                        } catch(e) { NC.warn(e) }
                        if(script.indexOf(match[0]) > -1) {
                            report.push({
                                "level" : NCD.severityLevels.MAJOR[0],
                                "message" : NC.message.get(NA.context.attr("code").inspection.message, "UseTheComponentsValMethod"),
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
                N(data).each(function() {
                    const consoleLogger = NCD.severityLevels[this.level.toUpperCase()][2];
                    if(NA.context.attr("code").inspection.abortOnError && (this.level === NCD.severityLevels.BLOCKER[0] || this.level === NCD.severityLevels.CRITICAL[0])) {
                        throw consoleLogger("[" + this.level + "] " + url + " - " + this.line + " : " + this.code + "\n" + this.message + "\n\n");
                    } else {
                        if(NC.browser.is("ie")) {
                            consoleLogger("[" + this.level + "] " + url + " - " + this.line + " : " + this.code, "\n" + this.message);
                        } else {
                            consoleLogger("%c[" + this.level + "] " + url + " - " + this.line + " : " + this.code, "color: " + NCD.severityLevels[this.level.toUpperCase()][1] + "; font-weight: bold; line-height: 200%;",
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
    };

}