/*!
 * Natural-CODE v0.3.8
 *
 * Released under the LGPL v2.1 license
 * Date: 2019-02-28T18:00Z
 *
 * Copyright 2019 Goldman Kim(bbalganjjm@gmail.com)
 */


N.version["Natural-CODE"] = "0.3.8";

class CodeUtils {
    static isExclude(excludes: string[], match: RegExpExecArray | null): boolean {
        return excludes.some((exclude: string) => {
            return match !== null && match[0].indexOf(exclude) > -1;
        });
    }
}

class Inspection {

    static test(orgCode: string, rules: string[]): boolean {
        if (orgCode.indexOf("<script") < 0) {
            return false;
        }
        const reports: Code.CodeInspectionResult[] = [];

        if (!N.context.attr("code") || (N.context.attr("code") && !N.context.attr("code").inspection)) {
            throw N.error("Define Natural-CODE options and message resources in N.context.attr(\"code\").inspection in the natural.config.js file.");
        }

        if (rules) {
            rules.forEach((rule: string) => {
                N.code.inspection.rules[rule](orgCode, N.context.attr("code").inspection.excludes, reports);
            });
        } else {
            for (const k in Code.inspection.rules) {
                N.code.inspection.rules[k](orgCode, N.context.attr("code").inspection.excludes, reports);
            }
        }

        return true;
    }

    static rules = {
        /**
         * Detect code that does not specify view in the context of jQuery Selector.
         */
        "NoContextSpecifiedInSelector": function (orgCode: string, excludes: string[], reports: Code.CodeInspectionResult[]): void {
            const regex = /\/{2}.*|[N$]\((.*?)\)(.*)/gm;
            let match: RegExpExecArray | null;
            while (match = regex.exec(orgCode)) {
                let isExclude: boolean = CodeUtils.isExclude(excludes, match);

                if (match.length > 2 && match[2] && match[2].replace(/ /g, "").indexOf("view)") > -1) {
                    isExclude = true;
                }

                if (N.string.startsWith(match[0], "//")) {
                    isExclude = true;
                }

                // selector excludes
                const selector = N.string.trimToEmpty(match[1]).replace(/ /g, "");
                if ((/^["']/g).test(selector)) {
                    if (!isExclude) {
                        if ((/[()]|,view|,cont\.view|",|',|^"<|^'<|>"$|>'$|html|body/g).test(selector)) {
                            isExclude = true;
                        }

                        if (!(/,view|,cont.view/g).test(selector)
                            && (/"\+|'\+|\+"|\+'/g).test(selector)) {
                            isExclude = false;
                        }
                    }

                    // method excludes
                    if (!isExclude) {
                        const method: string = match[2];
                        if ((/^\.cont\(|^\.comm\(|^\.select\(|^\.form\(|^\.list\(|^\.grid\(|^\.pagination\(|^\.tree\(|^\.instance\(/g).test(method)) {
                            isExclude = true;
                        }
                    }

                    if (!isExclude) {
                        let script: string = "";
                        try {
                            script = orgCode.substring(orgCode.indexOf("<script"), orgCode.indexOf("</script>"));
                        } catch (e) {
                            N.warn(e)
                        }
                        if (script.indexOf(match[0]) > -1) {
                            reports.push({
                                "level": "ERROR",
                                "message": N.message.get(N.context.attr("code").inspection.message, "NoContextSpecifiedInSelector"),
                                "line": orgCode.substring(0, regex.lastIndex).split("\n").length,
                                "code": match[0],
                            });
                        }
                    }
                }
            }
        },
        /**
         * Detects code using jQuery's val method instead of the val method of the Natural-UI component.
         */
        "UseTheComponentsValMethod": function (orgCode: string, excludes: string[], reports: Code.CodeInspectionResult[]) {
            const regex = /\/{2}.*|[N$]\((.*?)\)\.val\((.*?)\)(.*)/gm;
            let match: RegExpExecArray | null;
            while (match = regex.exec(orgCode)) {
                let isExclude: boolean = CodeUtils.isExclude(excludes, match);

                if (!isExclude) {
                    const args: string = match[2];
                    if (N.string.isEmpty(args)) {
                        isExclude = true;
                    }
                }

                if (N.string.startsWith(match[0], "//")) {
                    isExclude = true;
                }

                if (!isExclude) {
                    let script: string = "";
                    try {
                        script = orgCode.substring(orgCode.indexOf("<script"), orgCode.indexOf("</script>"));
                    } catch (e) {
                        N.warn(e)
                    }
                    if (script.indexOf(match[0]) > -1) {
                        reports.push({
                            "level": "WARN",
                            "message": N.message.get(N.context.attr("code").inspection.message, "UseTheComponentsValMethod"),
                            "line": orgCode.substring(0, regex.lastIndex).split("\n").length,
                            "code": match[0],
                        });
                    }
                }
            }
        }
    };

    static report = {
        console: (reports: [], url: string) => {
            let color: string = "black";

            reports.forEach((report: { level: string, message: string, line: number, code: string }) => {
                if (N.context.attr("code").inspection.abortOnError && report.level === "ERROR") {
                    throw N.error("[" + report.level + "] " + url + " - " + report.line + " : " + report.code + "\n" + report.message + "\n\n");
                } else {
                    if (N.browser.is("ie")) {
                        N[report.level.toLowerCase()]("[" + report.level + "] " + url + " - " + report.line + " : " + report.code, "\n" + report.message);
                    } else {
                        if (report.level === "ERROR") {
                            color = "red";
                        } else if (report.level === "WARN") {
                            color = "blue";
                        }

                        N[report.level.replace("ERROR", "WARN").toLowerCase()]("%c[" + report.level + "] " + url + " - " + report.line + " : " + report.code, "color: " + color + "; font-weight: bold; line-height: 200%;",
                            "\n" + report.message);
                    }
                }
            });

        }
    };
}

export class Code {
    static addSourceURL(orgCode: string, sourceURL: string): string {
        if (orgCode.indexOf("<script") < 0) {
            return orgCode;
        }

        let cutIndex = orgCode.lastIndexOf("\n</script>");
        if (cutIndex < 0) {
            cutIndex = orgCode.lastIndexOf("\t</script>");
        }
        if (cutIndex < 0) {
            cutIndex = orgCode.lastIndexOf(" </script>");
        }

        return [orgCode.slice(0, cutIndex), '\n//# sourceURL=' + sourceURL + "\n", orgCode.slice(cutIndex)].join("");
    }

    static inspection = Inspection;  // Assign the Inspection class directly
}
N.code = Code;