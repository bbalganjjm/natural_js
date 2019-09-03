/*!
 * Natural-CODE v0.1.4
 *
 * Released under the LGPL v2.1 license
 * Date: 2019-02-28T18:00Z
 *
 * Copyright 2014 KIM HWANG MAN(bbalganjjm@gmail.com)
 */
(function(window, $) {
	N.version["Natural-CODE"] = "0.1.4";

	(function(N) {

		var Code = N.code = {
			inspection : {
			    test : function(sourceCode, excludes, rules) {
	                var report = []
	                
	                if(rules) {
	                    N(rules).each(function() {
	                        Code.inspection.rules[this](sourceCode, excludes, report);	                        
	                    });
	                } else {
	                    for(var k in Code.inspection.rules) {
	                        Code.inspection.rules[k](sourceCode, excludes, report);
	                    }
	                }
	                
	                return report;
	            },
	            rules : {
	                /**
                     * jQuery Selector 에 view 를 context 로 지정하지 않은 코드 검출
                     */
	                "NoContextSpecifiedInSelector" : function(sourceCode, excludes, report) {
	                    var regex = /[N$]\((.*?)\)(.*)/gm;
	                    var match;
	                    while (match=regex.exec(sourceCode)) {
	                        var isExclude = false;
	                        N(excludes).each(function(i, str) {
	                            if(match[0].indexOf(str) > -1) {
	                                isExclude = true;
	                                return false;
	                            }
	                        });
	                        
	                        if(match.length > 2 && match[2].replace(/ /g, "").indexOf("view)") > -1) {
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
	                                    script = sourceCode.substring(sourceCode.indexOf("<script"), sourceCode.indexOf("</script>"));
	                                } catch(e) { N.warn(e) };
	                                if(script.indexOf(match[0]) > -1) {
	                                    report.push({
	                                        "level" : "WARN",
	                                        "message" : 'Controller 안에서 jQuery 로 요소를 선택할 때는 반드시 $ 나 N 함수의 두번째 인자(context)에 view 를 넣어 주거나 view 에서 find 해야 합니다. ' +
	                                                'view(context) 를 지정하지 않으면 다른 페이지에있는 요소까지 선택 되어 의도하지 않은 오류를 발생 시킬 수 있습니다. ' +
	                                                '\nex) N("selector", cont.view).hide();' +
	                                                '\n    cont.view.find("selector").hide();',
	                                        "line" : sourceCode.substring(0, regex.lastIndex).split("\n").length,
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
                    "UseTheComponentsValMethod" : function(sourceCode, excludes, report) {
                        var regex = /[N$]\((.*?)\)\.val\((.*?)\)(.*)/gm;
                        var match;
                        while (match=regex.exec(sourceCode)) {
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
                            
                            if(!isExclude) {
                                var script = "";
                                try {
                                    script = sourceCode.substring(sourceCode.indexOf("<script"), sourceCode.indexOf("</script>"));
                                } catch(e) { N.warn(e) };
                                if(script.indexOf(match[0]) > -1) {
                                    report.push({
                                        "level" : "INFO",
                                        "message" : 'jQuery 의 val 메서드를 사용하여 입력요소의 value 를 수정하면 컴포넌트에 바인드 되어 있는 데이터는 업데이트 되지 않습니다. ' +
                                                '데이터와 관련있는 HTML 컨트롤은 N.form 이나 N.grid, N.list 등의 컴포넌트에서 제공하는 val 메서드를 사용해야 합니다.' +
                                                '\nex) cont["p.form.id"].val("columnName", "value")' +
                                                '\n    cont["p.grid.id"].val(index, "columnName", "value")' +
                                                '\n    cont["p.list.id"].val(index, "columnName", "value")',
                                        "line" : sourceCode.substring(0, regex.lastIndex).split("\n").length,
                                        "code" : match[0],
                                    });
                                }
                            }
                        }
                    }
	            }
			},
			addSourceURL : function(sourceCode, sourceURL) {
			    var cutIndex = sourceCode.lastIndexOf("\n</script>");
                if(cutIndex < 0) {
                    cutIndex = sourceCode.lastIndexOf("\t</script>");
                }
                if(cutIndex < 0) {
                    cutIndex = sourceCode.lastIndexOf(" </script>");
                }

                return [sourceCode.slice(0, cutIndex), '\n//# sourceURL=' + sourceURL + "\n", sourceCode.slice(cutIndex)].join("");
            }
		};

	})(N);

})(window, jQuery);