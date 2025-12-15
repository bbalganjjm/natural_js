/**
 * Natural-JS Code
 * Full version from natural.code.js lines 25-178
 */

import { error as createError, warn, log } from '../core/helpers/logger.js';
import { type as getType, isPlainObject, isString, isEmptyObject } from '../core/helpers/type-checker.js';
import { StringUtils } from '../core/utils/string.js';
import { ElementUtils } from '../core/utils/element.js';
import { BrowserUtils } from '../core/utils/browser.js';
import { Context } from '../architecture/context/context.js';
import { Controller } from '../architecture/controller/controller.js';
import { Communicator } from '../architecture/communication/communicator.js';
import { Formatter } from '../data/formatter/formatter.js';

export class Code {

        static test = function(codes, rules) {
            if(codes.indexOf("<script") < 0) {
                return false;
            }
            const report = []

            if(!Context.attr("code") || (Context.attr("code") && !Context.attr("code").inspection)) {
                throw createError("Define Natural-CODE options and message resources in Context.attr(\"code\").inspection in the natural.config.js file.");
            }

            if(rules) {
                jQuery(rules).each(function() {
                    Code.rules[this](codes, Context.attr("code").inspection.excludes, report);
                });
            } else {
                for(const k in Code.rules) {
                    Code.rules[k](codes, Context.attr("code").inspection.excludes, report);
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
                    jQuery(excludes).each(function(i, str) {
                        if(match[0].indexOf(str) > -1) {
                            isExclude = true;
                            return false;
                        }
                    });

                    if(match.length > 2 && match[2] && match[2].replace(/ /g, "").indexOf("view)") > -1) {
                        isExclude = true;
                    }

                    if(StringUtils.startsWith(match[0], "//")) {
                        isExclude = true;
                    }

                    // selector excludes
                    const selector = StringUtils.trimToEmpty(match[1]).replace(/ /g, "");
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
                                    "level" : NCD.severityLevels.CRITICAL[0],
                                    "message" : NC.message.get(Context.attr("code").inspection.message, "NoContextSpecifiedInSelector"),
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
                    jQuery(excludes).each(function(i, str) {
                        if(match[0].indexOf(str) > -1) {
                            isExclude = true;
                            return false;
                        }
                    });

                    if(!isExclude) {
                        const args = match[2];
                        if(StringUtils.isEmpty(args)) {
                            isExclude = true;
                        }
                    }

                    if(StringUtils.startsWith(match[0], "//")) {
                        isExclude = true;
                    }

                    if(!isExclude) {
                        let script = "";
                        try {
                            script = codes.substring(codes.indexOf("<script"), codes.indexOf("</script>"));
                        } catch(e) { warn(e) }
                        if(script.indexOf(match[0]) > -1) {
                            report.push({
                                "level" : NCD.severityLevels.MAJOR[0],
                                "message" : NC.message.get(Context.attr("code").inspection.message, "UseTheComponentsValMethod"),
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
                jQuery(data).each(function() {
                    const consoleLogger = NCD.severityLevels[this.level.toUpperCase()][2];
                    if(Context.attr("code").inspection.abortOnError && (this.level === NCD.severityLevels.BLOCKER[0] || this.level === NCD.severityLevels.CRITICAL[0])) {
                        throw consoleLogger("[" + this.level + "] " + url + " - " + this.line + " : " + this.code + "\n" + this.message + "\n\n");
                    } else {
                        if(BrowserUtils.is("ie")) {
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


export const inspection = (...args) => new Code(...args);
export default Code;
