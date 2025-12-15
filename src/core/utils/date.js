/**
 * Natural-JS Date Utilities
 * Includes formatDate implementation from formatdate.js
 * Original formatdate.js: http://www.svendtofte.com/javascript/javascript-date-string-formatting/
 */

import { type as getType } from '../helpers/type-checker.js';
import { error as createError } from '../helpers/logger.js';
import { StringUtils } from './string.js';

// Temporary placeholder for NA.context (will be injected from N.js)
let NAContext;

const getContext = () => NAContext || { attr: () => ({ formatter: { date: {} } }) };

export class DateUtils {
    /**
     * Calculate the difference between two dates
     */
    static diff(refDateStr, targetDateStr) {
        if (getType(refDateStr) === "string") {
            refDateStr = this.strToDate(refDateStr).obj;
        }
        if (getType(targetDateStr) === "string") {
            targetDateStr = this.strToDate(targetDateStr).obj;
        }
        return Math.ceil((targetDateStr - refDateStr) / 1000 / 24 / 60 / 60);
    }

    /**
     * Return to re-place the date string for a given format.
     */
    static strToDateStrArr(str, format, isString) {
        const dateStrArr = [];
        let fixNum = 0;
        if(format.length === 3 && str.length === 7 || format.length === 2 && str.length === 5) {
            fixNum = -1;
        }
        if(StringUtils.startsWith(format, "Ymd")) {
            dateStrArr.push(str.substring(0, 4 + fixNum)); //year
            dateStrArr.push(str.substring(4 + fixNum, 6 + fixNum)); //month
            dateStrArr.push(str.substring(6 + fixNum, 8 + fixNum)); //day
        } else if(StringUtils.startsWith(format, "mdY")) {
            dateStrArr.push(str.substring(4, 8 + fixNum)); //year
            dateStrArr.push(str.substring(0, 2)); //month
            dateStrArr.push(str.substring(2, 4)); //day
        } else if(StringUtils.startsWith(format, "dmY")) {
            dateStrArr.push(str.substring(4, 8 + fixNum)); //year
            dateStrArr.push(str.substring(2, 4)); //month
            dateStrArr.push(str.substring(0, 2)); //day
        } else if(StringUtils.startsWith(format, "Ym")) {
            dateStrArr.push(str.substring(0, 4 + fixNum)); //year
            dateStrArr.push(str.substring(4 + fixNum, 6 + fixNum)); //month
        } else if(StringUtils.startsWith(format, "mY")) {
            dateStrArr.push(str.substring(2, 6 + fixNum)); //year
            dateStrArr.push(str.substring(0, 2)); //month
        } else {
            throw createError("[NC.date.strToDateStrArr]\"" + format + "\" date format is not support. please change return value of NA.context.attr(\"data\").formatter.date's functions");
        }
        if(isString === undefined || isString === false) {
            jQuery(dateStrArr).each(function(i) {
                dateStrArr[i] = parseInt(this);
            });
        }
        return dateStrArr;
    }

    /**
     * Convert a date string to a date object
     */
    static strToDate(str, format) {
        str = StringUtils.trimToEmpty(str).replace(/[^0-9]/g, "");
        let dateInfo = null;
        let dateStrArr;
        const ctx = getContext();
        
        if (str.length > 2 && str.length <= 4) {
            dateInfo = {
                obj : new Date(str, 1, 1, 0, 0, 0),
                format : "Y"
            };
        } else if (str.length === 6) {
            if(format === undefined) {
                format = ctx.attr("data").formatter.date.Ym();
            }
            dateStrArr = DateUtils.strToDateStrArr(str, format.replace(/[^Y|^m|^d]/g, ""));
            dateInfo = {
                obj : new Date(dateStrArr[0], dateStrArr[1]-1, 1, 0, 0, 0),
                format : format
            };
        } else if (str.length === 8) {
            if(format === undefined) {
                format = ctx.attr("data").formatter.date.Ymd();
            }
            dateStrArr = DateUtils.strToDateStrArr(str, format.replace(/[^Y|^m|^d]/g, ""));
            dateInfo = {
                obj : new Date(dateStrArr[0], dateStrArr[1]-1, dateStrArr[2], 0, 0, 0),
                format : format
            };
        } else if (str.length === 10) {
            if(format === undefined) {
                format = ctx.attr("data").formatter.date.YmdH();
            }
            dateStrArr = DateUtils.strToDateStrArr(str, format.replace(/[^Y|^m|^d]/g, ""));
            dateInfo = {
                obj : new Date(dateStrArr[0], dateStrArr[1]-1, dateStrArr[2], Number(str.substring(8, 10)), 0, 0),
                format : format
            };
        } else if (str.length === 12) {
            if(format === undefined) {
                format = ctx.attr("data").formatter.date.YmdHi();
            }
            dateStrArr = DateUtils.strToDateStrArr(str, format.replace(/[^Y|^m|^d]/g, ""));
            dateInfo = {
                obj : new Date(dateStrArr[0], dateStrArr[1]-1, dateStrArr[2], Number(str.substring(8, 10)), Number(str.substring(10, 12)),
                    0),
                format : format
            };
        } else if (str.length >= 14) {
            if(format === undefined) {
                format = ctx.attr("data").formatter.date.YmdHis();
            }
            dateStrArr = DateUtils.strToDateStrArr(str, format.replace(/[^Y|^m|^d]/g, ""));
            dateInfo = {
                obj : new Date(dateStrArr[0], dateStrArr[1]-1, dateStrArr[2], Number(str.substring(8, 10)), Number(str.substring(10, 12)),
                    Number(str.substring(12, 14))),
                format : format
            };
        }
        return dateInfo;
    }

    /**
     * Format the date string
     */
    static format(str, format) {
        const dateInfo = DateUtils.strToDate(str);
        return dateInfo !== null ? dateInfo.obj.formatDate(format !== undefined ? format : dateInfo.format) : str;
    }

    /**
     * Convert date object to timestamp number
     */
    static dateToTs(dateObj) {
        let d = dateObj;
        if (d === undefined) {
            d = new Date();
        }
        return Math.round(d.getTime() / 1000);
    }

    /**
     * Convert timestamp number to date object
     */
    static tsToDate(tsNum) {
        if (tsNum === undefined) {
            return new Date();
        } else {
            return new Date(tsNum);
        }
    }

    /**
     * Get a list of monthly date objects
     *
     * @param year
     * @param month
     * @return array[array[date]]
     */
    static dateList(year, month) {
        const weekArr = [];
        const prevDate = new Date(year, month-1, 0);
        const currDate = new Date(year, month, 0);
        const nextDate = new Date(year, month+1, 0);

        const lastDate = currDate.getDate();
        const prevLastDate = prevDate.getDate();
        const prevLastDay = prevDate.getDay();
        let daysOfWeek = [];

        if(prevLastDay !== 6) {
            for(let i=prevLastDate-prevLastDay;i<=prevLastDate;i++) {
                prevDate.setDate(i);
                daysOfWeek.push(new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate(), 0));
            }
        }

        for(let i=1;i<=lastDate;i++) {
            currDate.setDate(i);
            daysOfWeek.push(new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate(), 0));
            if(i > 0 && daysOfWeek.length === 7) {
                weekArr.push(daysOfWeek);
                daysOfWeek = [];
            }
        }

        weekArr.push(daysOfWeek);

        let daysOfLastWeek = weekArr[weekArr.length-1];
        let lastDayOfCalendar;
        for(let i=1, length=daysOfLastWeek.length;i<=7-length;i++) {
            nextDate.setDate(i);
            daysOfLastWeek.push(new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate(), 0));
            lastDayOfCalendar = i;
        }
        if(weekArr.length === 5) {
            daysOfLastWeek = [];
            for(let i=lastDayOfCalendar+1;i<=lastDayOfCalendar+7;i++) {
                nextDate.setDate(i);
                daysOfLastWeek.push(new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate(), 0));
            }
            weekArr.push(daysOfLastWeek);
        }

        return weekArr;
    }
}

/**
 * Date.prototype.formatDate
 * Implementation from formatdate.js
 * http://www.svendtofte.com/javascript/javascript-date-string-formatting/
 */
export const initDateFormatter = () => {
    Date.prototype.formatDate = function(input, time) {
        const daysLong = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
        const daysShort = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
        const monthsShort = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        const monthsLong = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

        const switches = { // switches object
            a : function() {
                // Lowercase Ante meridiem and Post meridiem
                return date.getHours() > 11 ? "pm" : "am";
            },
            A : function() {
                // Uppercase Ante meridiem and Post meridiem
                return (this.a().toUpperCase());
            },
            B : function() {
                // Swatch internet time. code simply grabbed from ppk,
                // since I was feeling lazy:
                // http://www.xs4all.nl/~ppk/js/beat.html
                const off = (date.getTimezoneOffset() + 60) * 60;
                const theSeconds = (date.getHours() * 3600) + (date.getMinutes() * 60) + date.getSeconds() + off;
                let beat = Math.floor(theSeconds / 86.4);
                if (beat > 1000)
                    beat -= 1000;
                if (beat < 0)
                    beat += 1000;
                if ((String(beat)).length === 1)
                    beat = "00" + beat;
                if ((String(beat)).length === 2)
                    beat = "0" + beat;
                return beat;
            },
            c : function() {
                // ISO 8601 date (e.g.: "2004-02-12T15:19:21+00:00"), as per
                // http://www.cl.cam.ac.uk/~mgk25/iso-time.html
                return (this.Y() + "-" + this.m() + "-" + this.d() + "T" + this.H() + ":" + this.i() + ":" + this.s() + this.P());
            },
            d : function() {
                // Day of the month, 2 digits with leading zeros
                const j = String(this.j());
                return (j.length === 1 ? "0" + j : j);
            },
            D : function() {
                // A textual representation of a day, three letters
                return daysShort[date.getDay()];
            },
            F : function() {
                // A full textual representation of a month
                return monthsLong[date.getMonth()];
            },
            g : function() {
                // 12-hour format of an hour without leading zeros, 1 through 12!
                if (date.getHours() === 0) {
                    return 12;
                } else {
                    return date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
                }
            },
            G : function() {
                // 24-hour format of an hour without leading zeros
                return date.getHours();
            },
            h : function() {
                // 12-hour format of an hour with leading zeros
                const g = String(this.g());
                return (g.length === 1 ? "0" + g : g);
            },
            H : function() {
                // 24-hour format of an hour with leading zeros
                const G = String(this.G());
                return (G.length === 1 ? "0" + G : G);
            },
            i : function() {
                // Minutes with leading zeros
                const min = String(date.getMinutes());
                return (min.length === 1 ? "0" + min : min);
            },
            I : function() {
                // Whether or not the date is in daylight saving time (DST)
                // note that this has no bearing in actual DST mechanics,
                // and is just a pure guess. buyer beware.
                const noDST = new Date("January 1 " + this.Y() + " 00:00:00");
                return (noDST.getTimezoneOffset() === date.getTimezoneOffset() ? 0 : 1);
            },
            j : function() {
                // Day of the month without leading zeros
                return date.getDate();
            },
            l : function() {
                // A full textual representation of the day of the week
                return daysLong[date.getDay()];
            },
            L : function() {
                // leap year or not. 1 if leap year, 0 if not.
                // the logic should match iso's 8601 standard.
                // http://www.uic.edu/depts/accc/software/isodates/leapyear.html
                const Y = this.Y();
                if ((Y % 4 === 0 && Y % 100 !== 0) || (Y % 4 === 0 && Y % 100 === 0 && Y % 400 === 0)) {
                    return 1;
                } else {
                    return 0;
                }
            },
            m : function() {
                // Numeric representation of a month, with leading zeros
                const n = String(this.n());
                return (n.length === 1 ? "0" + n : n);
            },
            M : function() {
                // A short textual representation of a month, three letters
                return monthsShort[date.getMonth()];
            },
            n : function() {
                // Numeric representation of a month, without leading zeros
                return date.getMonth() + 1;
            },
            N : function() {
                // ISO-8601 numeric representation of the day of the week
                const w = this.w();
                return (w === 0 ? 7 : w);
            },
            O : function() {
                // Difference to Greenwich time (GMT) in hours
                const os = Math.abs(date.getTimezoneOffset());
                let h = String(Math.floor(os / 60));
                let m = String(os % 60);
                if(h.length === 1) h = "0" + h;
                if(m.length === 1) m = "0" + m;
                return date.getTimezoneOffset() < 0 ? "+" + h + m : "-" + h + m;
            },
            P : function() {
                // Difference to GMT, with colon between hours and minutes
                const O = this.O();
                return (O.substring(0, 3) + ":" + O.substring(3, 5));
            },
            r : function() {
                // RFC 822 formatted date
                let r; // result
                // Thu , 21 Dec 2000
                r = this.D() + ", " + this.d() + " " + this.M() + " " + this.Y() +
                    // 16 : 01 : 07 0200
                    " " + this.H() + ":" + this.i() + ":" + this.s() + " " + this.O();
                return r;
            },
            s : function() {
                // Seconds, with leading zeros
                const sec = String(date.getSeconds());
                return (sec.length === 1 ? "0" + sec : sec);
            },
            S : function() {
                // English ordinal suffix for the day of the month, 2 characters
                switch (date.getDate()) {
                    case 1:
                        return ("st");
                    case 2:
                        return ("nd");
                    case 3:
                        return ("rd");
                    case 21:
                        return ("st");
                    case 22:
                        return ("nd");
                    case 23:
                        return ("rd");
                    case 31:
                        return ("st");
                    default:
                        return ("th");
                }
            },
            t : function() {
                // thanks to Matt Bannon for some much needed code-fixes here!
                const daysinmonths = [ null, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
                if (this.L() === 1 && this.n() === 2)
                    return 29; // ~leap day
                return daysinmonths[this.n()];
            },
            U : function() {
                // Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)
                return Math.round(date.getTime() / 1000);
            },
            w : function() {
                // Numeric representation of the day of the week
                return date.getDay();
            },
            W : function() {
                // Weeknumber, as per ISO specification:
                // http://www.cl.cam.ac.uk/~mgk25/iso-time.html

                const DoW = this.N();
                const DoY = this.z();

                // If the day is 3 days before New Year's Eve and is Thursday or earlier,
                // it's week 1 of next year.
                const daysToNY = 364 + this.L() - DoY;
                if (daysToNY <= 2 && DoW <= (3 - daysToNY)) {
                    return 1;
                }

                // If the day is within 3 days after New Year's Eve and is Friday or later,
                // it belongs to the old year.
                if (DoY <= 2 && DoW >= 5) {
                    return new Date(this.Y() - 1, 11, 31).formatDate("W");
                }

                let nyDoW = new Date(this.Y(), 0, 1).getDay();
                nyDoW = nyDoW !== 0 ? nyDoW - 1 : 6;

                if (nyDoW <= 3) { // First day of the year is a Thursday or earlier
                    return (1 + Math.floor((DoY + nyDoW) / 7));
                } else { // First day of the year is a Friday or later
                    return (1 + Math.floor((DoY - (7 - nyDoW)) / 7));
                }
            },
            y : function() {
                // A two-digit representation of a year
                const y = String(this.Y());
                return y.substring(y.length - 2, y.length);
            },
            Y : function() {
                // A full numeric representation of a year, 4 digits

                // we first check, if getFullYear is supported. if it
                // is, we just use that. ppks code is nice, but wont
                // work with dates outside 1900-2038, or something like that
                let x;
                if (date.getFullYear) {
                    const newDate = new Date("January 1 2001 00:00:00 +0000");
                    x = newDate.getFullYear();
                    if (x === 2001) {
                        // i trust the method now
                        return date.getFullYear();
                    }
                }
                // else, do this:
                // codes thanks to ppk:
                // http://www.xs4all.nl/~ppk/js/introdate.html
                x = date.getYear();
                let y = x % 100;
                y += (y < 38) ? 2000 : 1900;
                return y;
            },
            z : function() {
                // The day of the year, zero indexed! 0 through 366
                const s = "January 1 " + this.Y() + " 00:00:00 GMT" + this.O();
                const t = new Date(s);
                const diff = date.getTime() - t.getTime();
                return Math.floor(diff / 1000 / 60 / 60 / 24);
            },
            Z : function() {
                // Timezone offset in seconds
                return (date.getTimezoneOffset() * -60);
            }
        };

        const date = time ? new Date(time) : this;

        const formatString = input.split("");
        let i = 0;
        while (i < formatString.length) {
            if (formatString[i] === "%") {
                // this is our way of allowing users to escape stuff
                formatString.splice(i, 1);
            } else {
                formatString[i] = switches[formatString[i]] !== undefined ? switches[formatString[i]]() : formatString[i];
            }
            i++;
        }
        return formatString.join("");
    };

    // Some (not all) predefined format strings from PHP 5.1.1, which
    // offer standard date representations.
    // See: http://www.php.net/manual/en/ref.datetime.php#datetime.constants

    // Atom "2005-08-15T15:52:01+00:00"
    Date.DATE_ATOM = "Y-m-d%TH:i:sP";
    // ISO-8601 "2005-08-15T15:52:01+0000"
    Date.DATE_ISO8601 = "Y-m-d%TH:i:sO";
    // RFC 2822 "Mon, 15 Aug 2005 15:52:01 +0000"
    Date.DATE_RFC2822 = "D, d M Y H:i:s O";
    // W3C "2005-08-15 15:52:01+00:00"
    Date.DATE_W3C = "Y-m-d%TH:i:sP";
};

// Export individual methods
export const { diff, strToDateStrArr, strToDate, format, dateToTs, tsToDate, dateList } = DateUtils;

// Setter for context (to be called from N.js integration)
export const setContext = (ctx) => { NAContext = ctx; };
