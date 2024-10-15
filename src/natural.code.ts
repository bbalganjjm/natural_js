/*!
 * Natural-CODE v0.3.8
 *
 * Released under the LGPL v2.1 license
 * Date: 2019-02-28T18:00Z
 *
 * Copyright 2014 Goldman Kim(bbalganjjm@gmail.com)
 */

// FIXME Temporary code
let N: any;
if(N === undefined) {
    N = {};
}

N.version["Natural-CODE"] = "0.3.8";

const Code: any = N.code = {
    inspection: {
        test: function (codes: string, rules: string) {
            if (codes.indexOf("<script") < 0) {
                return false;
            }
            const report: object = []

            if (!N.context.attr("code") || (N.context.attr("code") && !N.context.attr("code").inspection)) {
                throw N.error("Define Natural-CODE options and message resources in N.context.attr(\"code\").inspection in the natural.config.js file.");
            }

            if (rules) {
                N(rules).each(function () {
                    Code.inspection.rules[this](codes, N.context.attr("code").inspection.excludes, report);
                });
            } else {
                for (const k in Code.inspection.rules) {
                    Code.inspection.rules[k](codes, N.context.attr("code").inspection.excludes, report);
                }
            }

            return report;
        },
        rules: {
            /**
             * Detect code that does not specify view in the context of jQuery Selector.
             */
            "NoContextSpecifiedInSelector": function (codes: string, excludes: string[], report: [{
                "level": string,
                "message": string,
                "line": number,
                "code": string,
            }]): void {
                const regex = /\/{2}.*|[N$]\((.*?)\)(.*)/gm;
                let match: RegExpExecArray;
                while (match = regex.exec(codes)) {
                    let isExclude: boolean = false;
                    excludes.forEach((exclude: string) => {
                        if (match[0].indexOf(exclude) > -1) {
                            isExclude = true;
                            return false;
                        }
                    });

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
                                script = codes.substring(codes.indexOf("<script"), codes.indexOf("</script>"));
                            } catch (e) {
                                N.warn(e)
                            }
                            if (script.indexOf(match[0]) > -1) {
                                report.push({
                                    "level": "ERROR",
                                    "message": N.message.get(N.context.attr("code").inspection.message, "NoContextSpecifiedInSelector"),
                                    "line": codes.substring(0, regex.lastIndex).split("\n").length,
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
            "UseTheComponentsValMethod": function (codes: string, excludes: string[], report: [{
                "level": string,
                "message": string,
                "line": number,
                "code": string,
            }]) {
                const regex = /\/{2}.*|[N$]\((.*?)\)\.val\((.*?)\)(.*)/gm;
                let match: RegExpExecArray;
                while (match = regex.exec(codes)) {
                    let isExclude: boolean = false;
                    N(excludes).forEach((exclude: string) => {
                        if (match[0].indexOf(exclude) > -1) {
                            isExclude = true;
                            return false;
                        }
                    });

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
                            script = codes.substring(codes.indexOf("<script"), codes.indexOf("</script>"));
                        } catch (e) {
                            N.warn(e)
                        }
                        if (script.indexOf(match[0]) > -1) {
                            report.push({
                                "level": "WARN",
                                "message": N.message.get(N.context.attr("code").inspection.message, "UseTheComponentsValMethod"),
                                "line": codes.substring(0, regex.lastIndex).split("\n").length,
                                "code": match[0],
                            });
                        }
                    }
                }
            }
        },
        report: {
            console: function (data: {
                "level": string,
                "message": string,
                "line": number,
                "code": string,
            }, url: string) {
                if (!data) {
                    return false;
                }
                let color: string = "black";
                N(data).each(function () {
                    if (N.context.attr("code").inspection.abortOnError && this.level === "ERROR") {
                        throw N.error("[" + this.level + "] " + url + " - " + this.line + " : " + this.code + "\n" + this.message + "\n\n");
                    } else {
                        if (N.browser.is("ie")) {
                            N[this.level.toLowerCase()]("[" + this.level + "] " + url + " - " + this.line + " : " + this.code, "\n" + this.message);
                        } else {
                            if (this.level === "ERROR") {
                                color = "red";
                            } else if (this.level === "WARN") {
                                color = "blue";
                            }

                            N[this.level.replace("ERROR", "WARN").toLowerCase()]("%c[" + this.level + "] " + url + " - " + this.line + " : " + this.code, "color: " + color + "; font-weight: bold; line-height: 200%;",
                                "\n" + this.message);
                        }
                    }
                });
            }
        }
    },
    addSourceURL: function (codes: string, sourceURL: string) {
        if (codes.indexOf("<script") < 0) {
            return codes;
        }

        let cutIndex = codes.lastIndexOf("\n</script>");
        if (cutIndex < 0) {
            cutIndex = codes.lastIndexOf("\t</script>");
        }
        if (cutIndex < 0) {
            cutIndex = codes.lastIndexOf(" </script>");
        }

        return [codes.slice(0, cutIndex), '\n//# sourceURL=' + sourceURL + "\n", codes.slice(cutIndex)].join("");
    }
};
