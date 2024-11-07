/*!
 * Natural-JS v1.0.0
 *
 * Released under the LGPL v2.1 license
 * Date: 2014-09-26T11:11Z
 *
 * Copyright 2014 Goldman Kim(bbalganjjm@gmail.com)
 */

import { jQuery } from "../lib/jquery-3.7.1.min";
import { NC } from "./natural.core";
import { NA } from "./natural.architecture";
import { ND } from "./natural.data";
import { NU } from "./natural.ui";
import { NUS } from "./natural.ui.shell";

class NaturalJS extends jQuery {

    /**
     * Initializes and returns a new N object based on jQuery objects with the provided selector and context argument values.
     */
    constructor(selector, context) {
        super();
        this.selector = NC.toSelector(selector);
    };

    static VERSION = Object.freeze({
        "Natural-JS" : "1.0.0",
        "Natural-CORE" : "1.0.0",
        "Natural-ARCHITECTURE" : "1.0.0",
        "Natural-DATA" : "1.0.0",
        "Natural-UI" : "1.0.0",
        "Natural-UI.Shell" : "1.0.0"
    });

    static get version() {
        return this.VERSION;
    };

}

function N(selector, context) {
    return new NaturalJS(selector, context);
}
Object.assign(N, NC, NA, ND, NU, NUS);
Object.assign(N.prototype, NC.prototype, NA.prototype, ND.prototype, NU.prototype, NUS.prototype);

window.N = N;

export { N }