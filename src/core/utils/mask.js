/**
 * Natural-JS Mask Utilities
 * @reference Mask JavaScript API(http://www.pengoworks.com/workshop/js/mask/, dswitzer@pengoworks.com)
 */

export class Mask {
    constructor(m) {
        this.format = m;
        this.error = [];
        this.errorCodes = [];
        this.strippedValue = "";
        this.allowPartial = false;

        this.throwError = function(c, e, v) {
            this.error[this.error.length] = e;
            this.errorCodes[this.errorCodes.length] = c;
            if (typeof v == "string") {
                return v;
            }
            return true;
        };
    }

    setGeneric(_v, _d) {
        let v = _v, m = this.format;
        let r = "@#~", rt = [], nv = "", t, x, a = [], j = 0, rx = {
            "@" : "a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ\x20\s",
            "#" : "0-9\s",
            "~" : "0-9a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ\x20\s"
        };

        // strip out invalid characters
        v = v.replace(new RegExp("[^" + rx["~"] + "]", "gi"), "");
        if ((_d === true) && (v.length === this.strippedValue.length)) {
            v = v.substring(0, v.length - 1);
        }
        this.strippedValue = v;
        const b = [];
        for (let i = 0; i < m.length; i++) {
            // grab the current character
            x = m.charAt(i);
            // check to see if current character is a mask, escape commands are not a mask character
            t = (r.indexOf(x) > -1);
            // if the current character is an escape command, then grab the next character
            if (x === "!") {
                x = m.charAt(i++);
            }
            // build a regex to test against
            if ((t && !this.allowPartial) || (t && this.allowPartial && (rt.length < v.length))) {
                rt[rt.length] = "[" + rx[x] + "]";
            }
            // build mask definition table
            a[a.length] = {
                "chr" : x,
                "mask" : t
            };
        }

        let hasOneValidChar = false;
        // if the regex fails, return an error
        if (!this.allowPartial && !(new RegExp(rt.join(""))).test(v)) {
            return this.throwError(1, "The value \"" + _v + "\" must be in the format " + this.format + ".", _v);
        } else if ((this.allowPartial && (v.length > 0)) || !this.allowPartial) {
            for (let i = 0; i < a.length; i++) {
                if (a[i].mask) {
                    while (v.length > 0 && !(new RegExp(rt[j])).test(v.charAt(j))) {
                        v = (v.length === 1) ? "" : v.substring(1);
                    }
                    if (v.length > 0) {
                        nv += v.charAt(j);
                        hasOneValidChar = true;
                    }
                    j++;
                } else {
                    nv += a[i].chr;
                }
                if (this.allowPartial && (j > v.length)) {
                    break;
                }
            }
        }

        if (this.allowPartial && !hasOneValidChar) {
            nv = "";
        }
        if (this.allowPartial) {
            if (nv.length < a.length) {
                this.nextValidChar = rx[a[nv.length].chr];
            } else {
                this.nextValidChar = null;
            }
        }

        return nv;
    }

    setNumeric(_v, _p, _d) {
        let v = String(_v).replace(/[^\d.-]*/gi, ""), m = this.format;
        // make sure there's only one decimal point
        v = v.replace(/\./, "d").replace(/\./g, "").replace(/d/, ".");

        // check to see if an invalid mask operation has been entered
        if (!/^[\$]?((\$?[\+-]?([0#]{1,3},)?[0#]*(\.[0#]*)?)|([\+-]?\([\+-]?([0#]{1,3},)?[0#]*(\.[0#]*)?\)))$/.test(m)) {
            return this.throwError(1, "An invalid numeric user format was specified for the \nNumeric user format constructor.", _v);
        }

        if ((_d === true) && (v.length === this.strippedValue.length)) {
            v = v.substring(0, v.length - 1);
        }

        if (this.allowPartial && (v.replace(/[^0-9]/, "").length === 0)) {
            return v;
        }
        this.strippedValue = v;

        if (v.length === 0) {
            v = NaN;
        }
        const vn = Number(v);
        if (isNaN(vn)) {
            return this.throwError(2, "The value entered was not a number.", _v);
        }

        // if no mask, stop processing
        if (m.length === 0) {
            return v;
        }

        // get the value before the decimal point
        let vi = String(Math.abs(Number((v.indexOf(".") > -1) ? v.split(".")[0] : v)));
        // get the value after the decimal point
        let vd = (v.indexOf(".") > -1) ? v.split(".")[1] : "";
        const _vd = vd;

        const isNegative = (vn !== 0 && Math.abs(vn) * -1 === vn);

        // check for masking operations
        const show = {
            "$" : /^[\$]/.test(m),
            "(" : (isNegative && (m.indexOf("(") > -1)),
            "+" : ((m.indexOf("+") !== -1) && !isNegative)
        };
        show["-"] = (isNegative && (!show["("] || (m.indexOf("-") !== -1)));

        // replace all non-placeholders from the mask
        m = m.replace(/[^#0.,]*/gi, "");

        // make sure there are the correct number of decimal places
        // get number of digits after decimal point in mask
        const dm = (m.indexOf(".") > -1) ? m.split(".")[1] : "";
        if (dm.length === 0) {
            if (_p !== undefined && _p === "round") {
                vi = String(Math.round(Number(vi)));
            } else if (_p !== undefined && _p === "ceil") {
                vi = String(Math.ceil(Number(vi)));
            } else {
                vi = String(Math.floor(Number(vi)));
            }
            vd = "";
        } else {
            // find the last zero, which indicates the minimum number
            // of decimal places to show
            const md = dm.lastIndexOf("0") + 1;
            // if the number of decimal places is greater than the mask, then round off
            if (vd.length > dm.length) {
                // get the base part (dm.length digits) and the next digit for rounding
                const basePart = vd.substring(0, dm.length);
                const nextDigit = parseInt(vd.charAt(dm.length)) || 0;
                // default behavior is round, unless _p is explicitly set to "ceil" or "floor"
                const shouldRound = (_p === undefined || _p === "round");
                const shouldCeil = (_p === "ceil");
                const shouldFloor = (_p === "floor");
                
                if (shouldRound) {
                    // round based on next digit
                    if (nextDigit >= 5) {
                        // need to round up: add 1 to the last digit of basePart
                        let num = Number("0." + basePart) + Math.pow(10, -dm.length);
                        vd = num.toFixed(dm.length).split(".")[1];
                    } else {
                        vd = basePart;
                    }
                } else if (shouldCeil) {
                    // always round up if there's any remainder
                    if (nextDigit > 0 || basePart !== "0".repeat(dm.length)) {
                        let num = Number("0." + basePart) + Math.pow(10, -dm.length);
                        vd = num.toFixed(dm.length).split(".")[1];
                    } else {
                        vd = basePart;
                    }
                } else if (shouldFloor) {
                    // floor - just take the base part
                    vd = basePart;
                }
            } else {
                // otherwise, pad the string w/the required zeros
                while (vd.length < md) {
                    vd += "0";
                }
            }
        }

        /*
         * pad the int with any necessary zeros
         */
        // get number of digits before decimal point in mask
        let im = (m.indexOf(".") > -1) ? m.split(".")[0] : m;
        im = im.replace(/[^0#]+/gi, "");
        // find the first zero, which indicates the minimum length
        // that the value must be padded w/zeros
        let mv = im.indexOf("0") + 1;
        // if there is a zero found, make sure it's padded
        if (mv > 0) {
            mv = im.length - mv + 1;
            while (vi.length < mv) {
                vi = "0" + vi;
            }
        }

        // check to see if we need commas in the thousands placeholder
        if (/[#0]+,[#0]{3}/.test(m)) {
            // add the commas as the placeholder
            let x = [], i = 0, n = Number(vi);
            while (n > 999) {
                x[i] = "00" + String(n % 1000);
                x[i] = x[i].substring(x[i].length - 3);
                n = Math.floor(n / 1000);
                i++;
            }
            x[i] = String(n % 1000);
            vi = x.reverse().join(",");
        }

        // combine the new value together
        if ((vd.length > 0 && !this.allowPartial) || ((dm.length > 0) && this.allowPartial && (v.indexOf(".") > -1) && (_vd.length >= vd.length))) {
            v = vi + "." + vd;
        } else if ((dm.length > 0) && this.allowPartial && (v.indexOf(".") > -1) && (_vd.length < vd.length)) {
            v = vi + "." + _vd;
        } else {
            v = vi;
        }

        if (show.$) {
            v = this.format.replace(/(^[\$])(.+)/gi, "$") + v;
        }
        if (show["+"]) {
            v = "+" + v;
        }
        if (show["-"]) {
            v = "-" + v;
        }
        if (show["("]) {
            v = "(" + v + ")";
        }
        return v;
    }
}

// Export class
export default Mask;
