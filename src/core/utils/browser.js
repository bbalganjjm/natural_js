/**
 * Natural-JS Browser Utilities
 */

let NCBrowserInstance;

export class BrowserUtils {
    /**
     * Set and get cookie
     *  - get : when value is undefined
     */
    static cookie(name, value, expiredays, domain) {
        if (value === undefined) {
            const getCookieVar = function(offset) {
                let endstr = document.cookie.indexOf(";", offset);
                if (endstr === -1) {
                    endstr = document.cookie.length;
                }
                return decodeURIComponent(document.cookie.substring(offset, endstr));
            };

            const arg = name + "=";
            const alen = arg.length;
            const clen = document.cookie.length;
            let i = 0;
            while (i < clen) {
                const j = i + alen;
                if (document.cookie.substring(i, j) === arg) {
                    return getCookieVar(j);
                }
                i = document.cookie.indexOf(" ", i) + 1;
                if (i === 0) {
                    break;
                }
            }
        } else {
            let expires;
            if (expiredays !== undefined) {
                const today = new Date();
                today.setDate(today.getDate() + expiredays);
                expires = "; expires=" + today.toGMTString();
            } else {
                expires = "";
            }
            let domain_;
            if (domain !== undefined) {
                domain_ = "; domain=" + domain;
            } else {
                domain_ = "";
            }
            document.cookie = name + "=" + decodeURIComponent(value) + "; path=/" + expires + domain_;
        }
    }

    /**
     * Remove cookie
     */
    static removeCookie(name, domain) {
        if (domain !== undefined) {
            document.cookie = name + "=; path=/; expires=" + (new Date(1)) + "; domain=" + domain;
        } else {
            document.cookie = name + "=; path=/; expires=" + (new Date(1)) + ";";
        }
    }

    /**
     * Get Microsoft Internet Explorer version
     *  - MSIE trident version has been applied
     */
    static msieVersion() {
        const ua = window.navigator.userAgent;
        let msie = ua.indexOf("MSIE ");
        // for IE11
        if(msie < 0) {
            msie = ua.indexOf(".NET");
        }
        const trident = ua.match(/Trident\/(\d.\d)/i);
        if (msie < 0) {
            return 0;
        } else {
            if (trident === undefined) {
                return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
            } else {
                return parseInt(trident[1]) + 4.0;
            }
        }
    }

    /**
     * Check the connected browser
     */
    static is(name) {
        if("opera" in window || navigator.userAgent.indexOf(' OPR/') >= 0) {
            return name === "opera";
        } else if("InstallTrigger" in window) {
            return name === "firefox";
        } else if(name !== "ios" && navigator.userAgent.match(/^((?!chrome|android|crios|fxios).)*safari/i)) {
            return name === "safari";
        } else if("chrome" in window && !("opera" in window || navigator.userAgent.indexOf(' OPR/') >= 0)) {
            return name === "chrome";
        } else if(BrowserUtils.msieVersion() > 0) {
            return name === "ie";
        } else if(navigator.userAgent.match(/like Mac OS X/i)) {
            return name === "ios";
        } else if(navigator.userAgent.match(/android/i)) {
            return name === "android";
        }
        return false;
    }

    /**
     * Get context path from current window url
     */
    static contextPath(){
        const offset = location.href.indexOf(location.host) + location.host.length;
        return location.href.substring(offset, location.href.indexOf('/', offset + 1));
    }

    /**
     * Get scrollbars width for connected browser
     */
    static scrollbarWidth() {
        const div = jQuery('<div class="antiscroll-inner" style="width:50px;height:50px;overflow-y:scroll;' +
            'position:absolute;top:-200px;left:-200px;"><div style="height:100px;width:100%"/>' +
            '</div>');

        jQuery("body").append(div);
        const w1 = jQuery(div).innerWidth();
        const w2 = jQuery("div", div).innerWidth();
        jQuery(div).remove();

        return w1 - w2;
    }
}

// Export individual methods
export const { cookie, removeCookie, msieVersion, is, contextPath, scrollbarWidth } = BrowserUtils;
