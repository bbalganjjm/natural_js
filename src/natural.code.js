/*!
 * Natural-CODE v0.4.8
 *
 * Released under the LGPL v2.1 license
 * Date: 2019-02-28T18:00Z
 *
 * Copyright 2014 Goldman Kim(bbalganjjm@gmail.com)
 */
(function(window, $) {
    N.version["Natural-CODE"] = "0.4.8";

    (function(N) {

        var SeverityLevels = {
            BLOCKER: ["Blocker", "darkred", N.error],
            CRITICAL: ["Critical", "red", N.error],
            MAJOR: ["Major", "lightblue", N.warn],
            MINOR: ["Minor", "black", N.log]
        }

        var Code = N.code = {
            inspection : {
                test : function(codes, rules) {
                    if(codes.indexOf("<script") < 0) {
                        return false;
                    }
                    var report = []

                    if(!N.context.attr("code") || (N.context.attr("code") && !N.context.attr("code").inspection)) {
                        throw N.error("Define Natural-CODE options and message resources in N.context.attr(\"code\").inspection in the natural.config.js file.");
                    }

                    if(rules) {
                        N(rules).each(function() {
                            Code.inspection.rules[this](codes, N.context.attr("code").inspection.excludes, report);
                        });
                    } else {
                        for(var k in Code.inspection.rules) {
                            Code.inspection.rules[k](codes, N.context.attr("code").inspection.excludes, report);
                        }
                    }

                    return report;
                },
                rules : {
                    /**
                     * Detect code that does not specify view in the context of jQuery Selector.
                     */
                    "NoContextSpecifiedInSelector" : function(codes, excludes, report) {
                        var regex = /\/{2}.*|[N$]\((.*?)\)(.*)/gm;
                        var match;
                        while (match=regex.exec(codes)) {
                            var isExclude = false;
                            N(excludes).each(function(i, str) {
                                if(match[0].indexOf(str) > -1) {
                                    isExclude = true;
                                    return false;
                                }
                            });

                            if(match.length > 2 && match[2] && match[2].replace(/ /g, "").indexOf("view)") > -1) {
                                isExclude = true;
                            }

                            if(N.string.startsWith(match[0], "//")) {
                                isExclude = true;
                            }

                            // selector excludes
                            var selector = N.string.trimToEmpty(match[1]).replace(/ /g, "");
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
                                    var method = match[2];
                                    if((/^\.cont\(|^\.comm\(|^\.select\(|^\.form\(|^\.list\(|^\.grid\(|^\.pagination\(|^\.tree\(|^\.instance\(/g).test(method)) {
                                        isExclude = true;
                                    }
                                }

                                if(!isExclude) {
                                    var script = "";
                                    try {
                                        script = codes.substring(codes.indexOf("<script"), codes.indexOf("</script>"));
                                    } catch(e) { N.warn(e) };
                                    if(script.indexOf(match[0]) > -1) {
                                        report.push({
                                            "level" : SeverityLevels.CRITICAL[0],
                                            "message" : N.message.get(N.context.attr("code").inspection.message, "NoContextSpecifiedInSelector"),
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
                        var regex = /\/{2}.*|[N$]\((.*?)\)\.val\((.*?)\)(.*)/gm;
                        var match;
                        while (match=regex.exec(codes)) {
                            var isExclude = false;
                            N(excludes).each(function(i, str) {
                                if(match[0].indexOf(str) > -1) {
                                    isExclude = true;
                                    return false;
                                }
                            });

                            if(!isExclude) {
                                var args = match[2];
                                if(N.string.isEmpty(args)) {
                                    isExclude = true;
                                }
                            }

                            if(N.string.startsWith(match[0], "//")) {
                                isExclude = true;
                            }

                            if(!isExclude) {
                                var script = "";
                                try {
                                    script = codes.substring(codes.indexOf("<script"), codes.indexOf("</script>"));
                                } catch(e) { N.warn(e) };
                                if(script.indexOf(match[0]) > -1) {
                                    report.push({
                                        "level" : SeverityLevels.MAJOR[0],
                                        "message" : N.message.get(N.context.attr("code").inspection.message, "UseTheComponentsValMethod"),
                                        "line" : codes.substring(0, regex.lastIndex).split("\n").length,
                                        "code" : match[0],
                                    });
                                }
                            }
                        }
                    }
                },
                report : {
                    console : function(data, url) {
                        if(!data) {
                            return false;
                        }
                        N(data).each(function() {
                            var consoleLogger = SeverityLevels[this.level.toUpperCase()][2];
                            if(N.context.attr("code").inspection.abortOnError && (this.level === SeverityLevels.BLOCKER[0] || this.level === SeverityLevels.CRITICAL[0])) {
                                throw consoleLogger("[" + this.level + "] " + url + " - " + this.line + " : " + this.code + "\n" + this.message + "\n\n");
                            } else {
                                if(N.browser.is("ie")) {
                                    consoleLogger("[" + this.level + "] " + url + " - " + this.line + " : " + this.code, "\n" + this.message);
                                } else {
                                    consoleLogger("%c[" + this.level + "] " + url + " - " + this.line + " : " + this.code, "color: " + SeverityLevels[this.level.toUpperCase()][1] + "; font-weight: bold; line-height: 200%;",
                                            "\n" + this.message);
                                }
                            }
                        });
                    }
                }
            },
            addSourceURL : function(codes, sourceURL) {
                if(codes.indexOf("<script") < 0) {
                    return codes;
                }

                var cutIndex = codes.lastIndexOf("\n</script>");
                if(cutIndex < 0) {
                    cutIndex = codes.lastIndexOf("\t</script>");
                }
                if(cutIndex < 0) {
                    cutIndex = codes.lastIndexOf(" </script>");
                }

                return [codes.slice(0, cutIndex), '\n//# sourceURL=' + sourceURL + "\n", codes.slice(cutIndex)].join("");
            }
        };

    })(N);

})(window, jQuery);