/*!
 * Natural-JS v1.0.0
 *
 * Released under the LGPL v2.1 license
 * Date: 2014-09-26T11:11Z
 *
 * Copyright 2014 Goldman Kim(bbalganjjm@gmail.com)
 */

import { NC } from "./natural.core";
import { NA } from "./natural.architecture";
import { ND } from "./natural.data";
import { NU } from "./natural.ui";
import { NUS } from "./natural.ui.shell";

Object.assign(N, NC, NA, ND, NU, NUS);

[NC.prototype, NA.prototype, ND.prototype, NU.prototype, NUS.prototype].forEach(function(prototype) {
    Object.getOwnPropertyNames(prototype)
        .forEach(function(key) {
            if (key !== "constructor" && key !== "request") {
                jQuery.fn[key] = prototype[key];
            }
            if (key === "comm") {
                N[key] = function(obj, url) {
                    return new NA[key](obj, url);
                }
            } else if (key === "notify") {
                N[key] = function(position, opts) {
                    return new NUS[key](position, opts);
                }
                N[key].add = NUS[key].add;
            }
        });
});

export class NJS extends jQuery {

    /**
     * Initializes and returns a new N object based on jQuery objects with the provided selector and context argument values.
     */
    constructor(selector, context) {
        super(selector, context);
        this.selector = NC.toSelector(selector);
    };

    static version = {
        "Natural-JS" : "1.0.0",
        "Natural-CORE" : "1.0.0",
        "Natural-ARCHITECTURE" : "1.0.0",
        "Natural-DATA" : "1.0.0",
        "Natural-UI" : "1.0.0",
        "Natural-UI.Shell" : "1.0.0"
    };

}

export function N(selector, context) {
    return new NJS(selector, context);
}
