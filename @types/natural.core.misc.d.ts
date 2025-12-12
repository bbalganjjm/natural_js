declare namespace NC {
    type Primitive = string | number | boolean | null;
    type JSONValue = Primitive | JSONObject | JSONValue[];
    interface JSONObject {
        [key: string]: JSONValue;
    }

    /**
     * Generic callback function that accepts unknown arguments and returns unknown value.
     * Use this for callbacks where the signature is not strictly defined.
     */
    type AnyCallback = (...args: unknown[]) => unknown;

    /**
     * Callback function that accepts unknown arguments and returns void.
     * Use this for event handlers and side-effect callbacks.
     */
    type VoidCallback = (...args: unknown[]) => void;

    /**
     * Represents element-like values that can be used as element references.
     * Includes NJS collections, native HTMLElement, and arrays of HTMLElement.
     */
    type ElementLike = NJS<HTMLElement[]> | HTMLElement | HTMLElement[];

    /**
     * Represents values that can be used as element selectors.
     * Includes CSS selector strings and element-like values.
     */
    type ElementSelector = string | ElementLike;

    /**
     * Generic type for component options that allows partial properties with additional unknown properties.
     * Use this as a base for component option interfaces to allow extensibility.
     * 
     * @template T - The base option interface type
     */
    type ComponentOptions<T> = Partial<T> & { [key: string]: unknown };

    /**
     * Represents an instance of the mask utility used for formatting values.
     */
    interface MaskInstance {
        /**
         * Sets a generic value for masking operations.
         * 
         * @param {string} _v - The value to be masked.
         * @param {boolean} _d - A flag indicating whether to delete the last character.
         * @return {string} The masked value.
         */
        setGeneric(_v: string, _d: boolean): string;

        /**
         * Sets a numeric value for masking based on the provided parameters.
         * 
         * @param {string} _v - The value to be masked.
         * @param {"round" | "ceil" | "floor"} _p - The processing mode.
         * @param {boolean} _d - A flag indicating whether to delete the last character.
         * @return {string} The masked value.
         */
        setNumeric(_v: string, _p: "round" | "ceil" | "floor", _d: boolean): string;
    }

    interface Date {
        obj: Date;
        format: string;
    }

    type EventObject = object[];
    interface EventsObject {
        [key: string]: EventObject;
    }

    interface RuleObj {
        id: {
            [key: string]: [string, ...NC.Primitive[]][];
        };
    }

    type Instance =
        | NA.Controller
        | NU.Alert
        | NU.Button
        | NU.Datepicker
        | NU.Popup
        | NU.Tab
        | NU.Select
        | NU.Form
        | NU.List
        | NU.Grid
        | NU.Pagination
        | NU.Tree
        | NUS.Notify
        | NUS.Documents;
    interface InstanceCallback {
        (this: NC.Instance, instanceName: string, instance: NC.Instance): void;
    }

    interface ValsCallback {
        (this: NJS<HTMLElement[]>, index: number, selEle: NJS<HTMLElement[]>): void;
    }

    /**
     * Enumeration representing types of web browsers.
     */
    /* eslint-disable-next-line @definitelytyped/no-const-enum */
    const enum BrowserType {
        OPERA = "opera",
        FIREFOX = "firefox",
        SAFARI = "safari",
        CHROME = "chrome",
        IE = "ie",
        IOS = "ios",
        ANDROID = "android",
    }

    /**
     * Represents a message resource object that stores localized strings organized
     * by language and message keys. This type is typically used for managing
     * translations or multilingual support in an application.
     *
     * The structure of the object is as follows:
     * - The first level keys represent message identifiers.
     * - The second level keys correspond to specific languages or locales.
     * - The values are the translated strings in the defined language or locale.
     *
     * Example:
     * ```
     * {
     *   "greeting": {
     *     "en_US": "Hello",
     *     "ko_KR": "안녕하세요"
     *   }
     * }
     * ```
     */
    interface MessageResourceObj {
        [key: string]: {
            [key: string]: string;
        };
    }

    /* eslint-disable-next-line @definitelytyped/no-const-enum */
    const enum ObjectType {
        NUMBER = "number",
        STRING = "string",
        ARRAY = "array",
        OBJECT = "object",
        FUNCTION = "function",
        DATE = "date",
    }

    type Selector =
        | string
        | Element
        | Array<Element>
        | JQuery<Element>
        | JQuery.Node
        | JQuery.PlainObject
        | ((this: Document, readyCallback: (this: Document) => void) => void)
        | NJS<Element>
        | JQuery;
}
