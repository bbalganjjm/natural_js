"use strict";
/*!
 * Natural-CODE v0.3.8
 *
 * Released under the LGPL v2.1 license
 * Date: 2019-02-28T18:00Z
 *
 * Copyright 2019 Goldman Kim(bbalganjjm@gmail.com)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Code = void 0;
var CodeUtils = /** @class */ (function () {
    function CodeUtils() {
    }
    CodeUtils.isExclude = function (excludes, match) {
        return excludes.some(function (exclude) {
            return match !== null && match[0].indexOf(exclude) > -1;
        });
    };
    return CodeUtils;
}());
var Inspection = /** @class */ (function () {
    function Inspection() {
    }
    Inspection.test = function (orgCode, rules) {
        if (orgCode.indexOf("<script") < 0) {
            return false;
        }
        var reports = [];
        if (!N.context.attr("code") || (N.context.attr("code") && !N.context.attr("code").inspection)) {
            throw N.error("Define Natural-CODE options and message resources in N.context.attr(\"code\").inspection in the natural.config.js file.");
        }
        if (rules) {
            rules.forEach(function (rule) {
                N.code.inspection.rules[rule](orgCode, N.context.attr("code").inspection.excludes, reports);
            });
        }
        else {
            for (var k in Code.inspection.rules) {
                N.code.inspection.rules[k](orgCode, N.context.attr("code").inspection.excludes, reports);
            }
        }
        return true;
    };
    Inspection.rules = {
        /**
         * Detect code that does not specify view in the context of jQuery Selector.
         */
        "NoContextSpecifiedInSelector": function (orgCode, excludes, reports) {
            var regex = /\/{2}.*|[N$]\((.*?)\)(.*)/gm;
            var match;
            while (match = regex.exec(orgCode)) {
                var isExclude = CodeUtils.isExclude(excludes, match);
                if (match.length > 2 && match[2] && match[2].replace(/ /g, "").indexOf("view)") > -1) {
                    isExclude = true;
                }
                if (N.string.startsWith(match[0], "//")) {
                    isExclude = true;
                }
                // selector excludes
                var selector = N.string.trimToEmpty(match[1]).replace(/ /g, "");
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
                        var method = match[2];
                        if ((/^\.cont\(|^\.comm\(|^\.select\(|^\.form\(|^\.list\(|^\.grid\(|^\.pagination\(|^\.tree\(|^\.instance\(/g).test(method)) {
                            isExclude = true;
                        }
                    }
                    if (!isExclude) {
                        var script = "";
                        try {
                            script = orgCode.substring(orgCode.indexOf("<script"), orgCode.indexOf("</script>"));
                        }
                        catch (e) {
                            N.warn(e);
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
        "UseTheComponentsValMethod": function (orgCode, excludes, reports) {
            var regex = /\/{2}.*|[N$]\((.*?)\)\.val\((.*?)\)(.*)/gm;
            var match;
            while (match = regex.exec(orgCode)) {
                var isExclude = CodeUtils.isExclude(excludes, match);
                if (!isExclude) {
                    var args = match[2];
                    if (N.string.isEmpty(args)) {
                        isExclude = true;
                    }
                }
                if (N.string.startsWith(match[0], "//")) {
                    isExclude = true;
                }
                if (!isExclude) {
                    var script = "";
                    try {
                        script = orgCode.substring(orgCode.indexOf("<script"), orgCode.indexOf("</script>"));
                    }
                    catch (e) {
                        N.warn(e);
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
    Inspection.report = {
        console: function (reports, url) {
            var color = "black";
            reports.forEach(function (report) {
                if (N.context.attr("code").inspection.abortOnError && report.level === "ERROR") {
                    throw N.error("[" + report.level + "] " + url + " - " + report.line + " : " + report.code + "\n" + report.message + "\n\n");
                }
                else {
                    if (N.browser.is("ie")) {
                        N[report.level.toLowerCase()]("[" + report.level + "] " + url + " - " + report.line + " : " + report.code, "\n" + report.message);
                    }
                    else {
                        if (report.level === "ERROR") {
                            color = "red";
                        }
                        else if (report.level === "WARN") {
                            color = "blue";
                        }
                        N[report.level.replace("ERROR", "WARN").toLowerCase()]("%c[" + report.level + "] " + url + " - " + report.line + " : " + report.code, "color: " + color + "; font-weight: bold; line-height: 200%;", "\n" + report.message);
                    }
                }
            });
        }
    };
    return Inspection;
}());
var Code = /** @class */ (function () {
    function Code() {
    }
    Code.addSourceURL = function (orgCode, sourceURL) {
        if (orgCode.indexOf("<script") < 0) {
            return orgCode;
        }
        var cutIndex = orgCode.lastIndexOf("\n</script>");
        if (cutIndex < 0) {
            cutIndex = orgCode.lastIndexOf("\t</script>");
        }
        if (cutIndex < 0) {
            cutIndex = orgCode.lastIndexOf(" </script>");
        }
        return [orgCode.slice(0, cutIndex), '\n//# sourceURL=' + sourceURL + "\n", orgCode.slice(cutIndex)].join("");
    };
    Code.inspection = Inspection; // Assign the Inspection class directly
    return Code;
}());
exports.Code = Code;
N.code = Code;
N.version["Natural-CODE"] = "0.3.8";
