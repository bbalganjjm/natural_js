/**
 * Natural-JS Type Checker Utilities
 */

export class TypeChecker {
    /**
     * Check object type
     */
    static type(obj) {
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }

    /**
     * Check whether arg[0] is a String type
     */
    static isString(obj) {
        return TypeChecker.type(obj) === "string";
    }

    /**
     * Check whether arg[0] is a numeric type
     */
    static isNumeric(obj) {
        return ( typeof obj === "number" || typeof obj === "string" ) &&
            !isNaN( obj - parseFloat( obj ) );
    }

    /**
     * Check whether arg[0] is a plain object type
     */
    static isPlainObject(obj) {
        return jQuery.isPlainObject(obj);
    }

    /**
     * Check whether object is empty
     */
    static isEmptyObject(obj) {
        return jQuery.isEmptyObject(obj);
    }

    /**
     * Check whether arg[0] is a Array type
     */
    static isArray(obj) {
        return Array.isArray(obj);
    }

    /**
     * Checks whether an object of a type similar(array or jquery object etc.) to an array
     */
    static isArraylike(obj) {
        if(typeof obj === "undefined" || obj.length === undefined) {
            return false;
        }
        const length = obj.length, type = TypeChecker.type(obj);
        if (type === "function"
            || type === "asyncfunction"
            || type === "string"
            || type === "number"
            || type === "date"
            || type === "boolean"
            || obj === obj.window){
            return false;
        }
        if (obj.nodeType === 1 && length) {
            return true;
        }
        return type === "array" || length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj;
    }

    /**
     * Check whether arg[0] is a jQuery Object type
     */
    static isWrappedSet(obj) {
        return !!(obj && TypeChecker.isArraylike(obj) && obj.jquery);
    }

    /**
     * Check whether arg[0] is an element type
     */
    static isElement(obj) {
        if(TypeChecker.isWrappedSet(obj)) {
            obj = obj.get(0);
        }
        return !!(obj && obj !== document && obj.getElementsByTagName);
    }

    /**
     * Convert element to selector string
     */
    static toSelector(el) {
        if (typeof el === "string") {
            return el;
        }
        if(TypeChecker.isWrappedSet(el)) {
            el = el.get(0);
        }
        if(TypeChecker.isElement(el)) {
            return el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.classList && el.classList.length > 0 ? "." : "") + (Array.from(el.classList)).join(".");
        } else if(TypeChecker.type(el) === "array") {
            if(el.length > 0) {
                let obj = el[el.length - 1];
                let type = TypeChecker.type(obj);
                if(type.startsWith("[")) {
                    type = type.replace(/[\[\]]/g, "");
                } else if(TypeChecker.type(obj) === "string") {
                    type = '"' + type + '"';
                }
                return "...[" + type + "](" + el.length + ")";
            } else {
                return "...[](0)";
            }
        } else {
            return String(el);
        }
    }
}

// Export individual methods for convenience
export const { 
    type, 
    isString, 
    isNumeric, 
    isPlainObject, 
    isEmptyObject, 
    isArray, 
    isArraylike, 
    isWrappedSet, 
    isElement, 
    toSelector 
} = TypeChecker;
