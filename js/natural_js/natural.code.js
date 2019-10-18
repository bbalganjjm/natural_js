/*!
 * Natural-CODE v0.2.5
 *
 * Released under the LGPL v2.1 license
 * Date: 2019-02-28T18:00Z
 *
 * Copyright 2014 KIM HWANG MAN(bbalganjjm@gmail.com)
 */
(function(window, $) {
    N.version["Natural-CODE"] = "0.2.5";

    (function(N) {

        var Code = N.code = {
            inspection : {
                test : function(codes, rules) {
                    if(codes.indexOf("<script") < 0) {
                        return false;
                    }
                    var report = []
                    
                    if(rules) {
                        N(rules).each(function() {
                            Code.inspection.rules[this](codes, N.context.attr("code").excludes, report);                          
                        });
                    } else {
                        for(var k in Code.inspection.rules) {
                            Code.inspection.rules[k](codes, N.context.attr("code").excludes, report);
                        }
                    }
                    
                    return report;
                },
                rules : {
                    /**
                     * jQuery Selector 에 view 를 context 로 지정하지 않은 코드 검출
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
                            var selector = N.string.trim(match[1]).replace(/ /g, "");
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
                                            "level" : "WARN",
                                            "message" : N.message.get(N.context.attr("code").message, "NoContextSpecifiedInSelector"),
                                            "line" : codes.substring(0, regex.lastIndex).split("\n").length,
                                            "code" : match[0],
                                        });
                                    }
                                }
                            }
                        }
                    },
                    /**
                     * Natural-UI 컴포넌트의 val을 사용하지 않고 jQuery val 을 사용한 코드 검출
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
                                        "level" : "INFO",
                                        "message" : N.message.get(N.context.attr("code").message, "UseTheComponentsValMethod"),
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
                        var color = "black";
                        N(data).each(function() {
                            if(this.level === "ERROR") {
                                color = "red";
                            } else if(this.level === "WARN") {
                                color = "blue";
                            }
                            N[this.level.toLowerCase()]("%c[" + this.level + "] " + url + " - " + this.line + " : " + this.code, "color: " + color + "; font-weight: bold; line-height: 200%;",
                                    "\n" + this.message);
                        });
                    }
                }
            },
            addSourceURL : function(codes, sourceURL) {
                if(codes.indexOf("<script") < 0) {
                    return false;
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