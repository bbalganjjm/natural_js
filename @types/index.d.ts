/// <reference types="jquery" />

/**
 * Natural-JS v2.0.0 TypeScript Definitions
 * Unified namespace: N
 */

/**
 * The NC class is a CORE package of Natural-JS that provides various utilities and methods for collection manipulation, event binding, instance handling, value management, event retrieval, locale setting, etc.
 */
declare class NC {
    /**
     * Removes an element from the collection based on the provided index or identifier.
     *
     * @param {any} idx - The index or identifier of the element to be removed.
     * @param {number} length - The length of the collection from which the element is to be removed.
     * @return {this} The instance of the collection after the element has been removed.
     */
    remove_(idx: any, length: number): NC;
    /**
     * Binds an event handler that is executed with top priority to the specified event type of the selected element.
     *
     * @param {string} eventName - The name of the event to bind to.
     * @param {JQuery.EventHandler} eventHandler - The event handler function to execute when the event is triggered.
     * @return {this} The current object, for chainability.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010103.html
     */
    tpBind(eventName: string, eventHandler: JQuery.EventHandler<HTMLElement, any>): NC;
    /**
     * Returns or stores an instance of the component object or Controller object in the context element or View element of the UI component.
     * > Natural-JS stores the created object instances in the specified template (context or view) elements during the initialization of components or libraries to easily control block content such as tabs or popups.
     *
     * The method operates differently based on the number and type of arguments as follows:
     *   1. Returns all instances stored in the selected elements.
     *
     *      If only one instance is returned, the original instance object is returned. If there are two or more instances, they are stored and returned in an array. If no instances are found, `undefined` is returned.
     *      ```
     *      var all = N(".grid01", ".grid02").instance();
     *      ```
     *   2. Specifies all instances stored in the selected elements as arguments of the callback function.
     *      > The callback function is executed as many times as there are instances.
     *      ```
     *      var all = N(".grid01", ".grid02").instance(function(instanceId, instance) {
     *          // this: instance
     *          // instanceId: identifier of the stored instance
     *          // instance: stored instance
     *      });
     *      ```
     *   3. Returns all instances stored with the instanceId `name` in the selected elements.
     *
     *      If only one instance is returned, the original instance object is returned. If there are two or more instances, they are stored and returned in an array. If no instances are found, `undefined` is returned.
     *      ```
     *      var all = N(".grid01", ".grid02").instance("name");
     *      ```
     *   4. Returns all instances stored with the instanceId `name` in the selected elements as arguments of the callback function.
     *      > The callback function is executed as many times as there are instances.
     *      ```
     *      var all = N(".grid01", ".grid02").instance("name", function(instanceId, instance) {
     *          // this: instance
     *          // instanceId: identifier of the stored instance
     *          // instance: stored instance
     *      });
     *      ```
     *   5. Stores the instance with instanceId `name` in the selected elements.
     *      ```
     *      N(".grid01").instance("name", instance);
     *      ```
     *      > If the `instance` argument is a function type, it might not work correctly. Use object or string types for the `instance` argument instead.
     *
     * @param {string | N.InstanceCallback} name - The name of the instance.
     *
     * Predefined instance names are as follows:
     *
     *  - Controller object of N.cont: cont
     *  - Instance of N.alert: alert
     *    > Stored in the .block_overlay_msg__ element.
     *  - Instance of N.button: button
     *  - Instance of N.datepicker: datepicker
     *  - Instance of N.popup: popup
     *    > The Controller object of the loaded popup content is stored in the .block_overlay_msg__ > .msg_box__ > .view_context__ element.
     *  - Instance of N.tab: tab
     *    > The Controller object of the loaded tab content is stored in the .tab__ > .{tab content element id} > .view_context__ element.
     *  - Instance of N.select: select
     *  - Instance of N.form: form
     *  - Instance of N.list: list
     *  - Instance of N.grid: grid
     *  - Instance of N.pagination: pagination
     *  - Instance of N.tree: tree
     *  - Instance of N.notify: notify
     *  - Instance of N.docs: docs
     *    > Components whose instance storage locations are not specifically mentioned are stored in the context elements specified by the context option.
     * @param {NC.Instance} [instance] - The instance to store in the selected elements or a callback function to retrieve instances.
     * > The callback function returns the index (arguments[0]) and each instance (arguments[1]). The `this` context of the callback function refers to each instance.
     * @return {void | N<N.Instance[]> | N.Instance[] | N.Instance | NC} Returns undefined, an array of instances, a single instance, or the context itself.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010103.html
     */
    instance(
        name: string | N.InstanceCallback,
        instance?: N.Instance,
    ): undefined | N<N.Instance[]> | N.Instance[] | N.Instance | NC;
    /**
     * Gets or selects the selected values of elements such as select, select[multiple=multiple], input[type=radio], and input[type=checkbox].
     *
     * > In the case of checkbox, if there is only one option, it operates in a mode that decides whether it is Y/N or 1/0.
     *
     * > You can set whether the default value for single selection is Y/N, 1/0, or on/off with the variables N.context.attr("core").sgChkdVal("Checked Value") and N.context.attr("core").sgUnChkdVal("Unchecked Value") in natural.config.js.
     *
     * @param {string|string[]|NC.ValsCallback} [vals] - Optional parameter that can be either a string, an array of strings, or a callback function.
     *
     * When specifying a single value, specify the value as a string, and when selecting two or more options, specify the value as an array of strings.
     *
     * If a function is specified, the callback function is executed for each selected option element. The arguments for the callback function are as follows:
     *  - this: The selected option element
     *  - args[0]: The index of the selected option element
     *  - args[1]: The selected option element
     * @return {string|string[] | N<HTMLElement[]> | this} If the vals argument is not provided, the selected value is returned. If the vals argument is specified, the elements that match the specified value are selected.
     * If only one is selected, a value of type string is returned, and if two or more are selected, the values are returned in an array.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010103.html
     */
    vals(vals?: string | string[] | N.ValsCallback): string | string[] | N<HTMLElement[]> | NC;
    /**
     * Returns the events bound to the selected element.
     *
     * @param {string} eventName - The name of the event.
     * @param {string} [namespace] - The optional namespace for the event.
     * @return {NC.EventsObject | N.EventObject} If neither the eventType argument nor the namespace argument is provided, all events are returned; if the namespace is not provided, only the events corresponding to the specified eventType are returned.
     * If the namespace argument is provided, the events are returned as an array object, otherwise they are returned as a jQuery object. If no events are bound, undefined is returned.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010103.html
     */
    events(eventName: string, namespace?: string): N.EventsObject | N.EventObject;
    /**
     * Gets the default locale value configured in the framework.
     * > The default messages of the framework will be processed in multiple languages according to the configured locale value.
     *
     * > Pre-registered multilingual message sets include en_US, ko_KR, and can be modified in the `message` property of the [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html).
     *
     * > The default locale of the framework can be set to the value of the `N.context.attr("core").locale` property in [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html).
     *
     * @return {string} If the `str` argument is provided, it returns `undefined`. If not provided, it returns a locale string such as "en_US" or "ko_KR".
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static locale(): string;
    /**
     * Sets the default locale value to be configured in the framework.
     * > The default messages of the framework will be processed in multiple languages according to the configured locale value.
     *
     * > Pre-registered multilingual message sets include en_US, ko_KR, and can be modified in the `message` property of the [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html).
     *
     * > The default locale of the framework can be set to the value of the `N.context.attr("core").locale` property in [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html).
     *
     * @param {string} str - Enter a valid locale string such as "en_US" or "ko_KR".
     * @return {void} This method does not return any value.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static locale(str: string): void;
    /**
     * Logs the `debug` level messages to the console.
     *
     * @param {...unknown[]} obj - The items to log to the console. They can be of any type and multiple arguments can be passed.
     * @return {Console} Displays the contents of the provided item in the browser console.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010103.html
     */
    static debug(...obj: unknown[]): Console;
    /**
     * Logs the messages to the console.
     *
     * @param {...unknown[]} obj - The items to log to the console. They can be of any type and multiple arguments can be passed.
     * @return {Console} Displays the contents of the provided item in the browser console.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static log(...obj: unknown[]): Console;
    /**
     * Logs the `info` level messages to the console.
     *
     * @param {...unknown[]} obj - The items to log to the console. They can be of any type and multiple arguments can be passed.
     * @return {Console} Displays the contents of the provided item in the browser console.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static info(...obj: unknown[]): Console;
    /**
     * Logs the `warning` level messages to the console.
     *
     * @param {...unknown[]} obj - The items to log to the console. They can be of any type and multiple arguments can be passed.
     * @return {Console} Displays the contents of the provided item in the browser console.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static warn(...obj: unknown[]): Console;
    /**
     * Throws an error and logs the error message to the browser console.
     *
     * > The N.error function returns an ErrorThrown object, so to raise an error, you must declare the throw statement before the N.error function.
     *   ```
     *   throw N.error("An error has occurred.");
     *   ```
     *
     * @param {string} msg - The error message to be logged.
     * @param {Error} [e] - If an Error object is specified, the error is raised using the specified object.
     * @return {Error} Error object.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static error(msg: string, e?: Error): Error;
    /**
     * Identifies the type of an object.
     *
     * @param {unknown} obj - The object to identify the type of.
     * @return {NC.ObjectType | string} The identified type of the object, either as an N.ObjectType or a string.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static type(obj: unknown): N.ObjectType | string;
    /**
     * Determines if the provided object is a string.
     *
     * @param {unknown} obj - The object to check.
     * @return {boolean} true if the value is a string; otherwise, false.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static isString(obj: unknown): boolean;
    /**
     * Determines if the provided object is a numeric.
     *
     * @param {unknown} obj - The object to check.
     * @return {boolean} true if the value is a numeric; otherwise, false.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static isNumeric(obj: unknown): boolean;
    /**
     * Determines if a given object is a plain object.
     * A plain object is one that is created by the Object constructor or one with a prototype of null.
     *
     * @param {unknown} obj - The object to test.
     * @return {boolean} true if the object is a plain object, false otherwise.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static isPlainObject(obj: unknown): boolean;
    /**
     * Checks if the given object is empty (i.e., has no own enumerable properties).
     *
     * @param {unknown} obj - The object to check for emptiness.
     * @return {boolean} Returns true if the object is empty, false otherwise.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static isEmptyObject(obj: unknown): boolean;
    /**
     * Determines if the given object is an array.
     *
     * @param {unknown} obj - The object to be checked.
     * @return {boolean} true if the object is an array, otherwise false.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static isArray(obj: unknown): boolean;
    /**
     * Checks if the given object is array-like.
     * An object is considered array-like if it is not a function and has a `length` property that is a number.
     *
     * @param {unknown} obj - The object to check.
     * @return {boolean} - Returns `true` if the object is array-like, otherwise returns `false`.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static isArraylike(obj: unknown): boolean;
    /**
     * Checks if the given object is of type jQuery object.
     *
     * @param {unknown} obj - The object to check.
     * @return {boolean} true if the object is a jQuery object, otherwise false.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static isWrappedSet(obj: unknown): boolean;
    /**
     * Determines if the provided object is a DOM element.
     *
     * @param {unknown} obj - The object to check.
     * @return {boolean} true if the object is a DOM element, otherwise false.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static isElement(obj: unknown): boolean;
    /**
     * Converts a given element, array of elements, or any input to a CSS selector string.
     *
     * @param {N<HTMLElement[]> | HTMLElement | HTMLElement[] | any} el - The input element(s) or any value to convert.
     * @returns {string} The CSS selector string derived from the input.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static toSelector(el: N.Selector): string;
    /**
     * A function that takes a variable number of arguments and returns an array of
     * JQuery.Deferred objects, ensuring that the deferred tasks are executed in serial order.
     *
     * @param {...Function} args - The arguments to be passed to each deferred task.
     * @returns {JQuery.Deferred[]} An array of JQuery.Deferred objects representing the serialized execution of tasks.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010104.html
     */
    static serialExecute(...args: unknown[]): JQuery.Deferred<any>[];
    /**
     * Provides methods to perform different levels of garbage collection.
     */
    static gc: {
        /**
         * Minimum garbage collection
         *
         * @returns {true} If the operation is successful, it unconditionally returns true.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010105.html
         */
        minimum(): true;
        /**
         * Full garbage collection
         *
         * @returns {true} If the operation is successful, it unconditionally returns true.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010105.html
         */
        full(): true;
        /**
         * Remove garbage instances from observables in N.ds.
         *
         * @return {void} This method does not return any value.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010105.html
         */
        ds(): void;
    };
    /**
     * Provides utility functions for processing and manipulating strings.
     */
    static string: {
        /**
         * Checks if the given context string contains the specified substring.
         *
         * @param {string} context - The string in which to search for the substring.
         * @param {string} str - The substring to search for within the context string.
         * @return {boolean} - Returns true if the context string contains the specified substring, otherwise false.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010106.html
         */
        contains(context: string, str: string): boolean;

        /**
         * Checks if the given string context ends with the specified substring str.
         *
         * @param {string} context - The string to be checked.
         * @param {string} str - The substring to look for at the end of the context string.
         * @return {boolean} Returns true if the context string ends with the specified substring, otherwise false.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010106.html
         */
        endsWith(context: string, str: string): boolean;
        /**
         * Checks if the provided string starts with the given substring.
         *
         * @param {string} context - The full string to be checked.
         * @param {string} str - The substring to check for at the start of the full string.
         * @return {boolean} true if the full string starts with the substring, otherwise false.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010106.html
         */
        startsWith(context: string, str: string): boolean;
        /**
         * Inserts a given substring into a context string at a specified index.
         *
         * @param {string} context - The original string where the substring will be inserted.
         * @param {number} idx - The index at which to insert the substring.
         * @param {string} str - The substring to be inserted.
         * @return {string} - The resulting string after the insertion.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010106.html
         */
        insertAt(context: string, idx: number, str: string): string;
        /**
         * Removes all whitespace characters from the given string.
         *
         * @param {string} str - The string from which to remove whitespace.
         * @return {string} The string without any whitespace characters.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010106.html
         */
        removeWhitespace(str: string): string;
        /**
         * Pads the left side of a string with a specified character or string until the string reaches a given length.
         *
         * @param {string} str - The original string to be padded.
         * @param {number} length - The desired total length of the string after padding.
         * @param {string} padStr - The string to pad the original string with.
         * @return {string} - The padded string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010106.html
         */
        lpad(str: string, length: number, padStr: string): string;
        /**
         * Right pads a given string with a specified string up to a certain length.
         *
         * @param {string} str - The original string to be padded.
         * @param {number} length - The total length of the resulting string after padding.
         * @param {string} padStr - The string to pad with.
         * @return {string} The padded string of the specified length.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010106.html
         */
        rpad(str: string, length: number, padStr: string): string;
        /**
         * Checks if the provided string is empty.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} true if the string is empty, otherwise false.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010106.html
         */
        isEmpty(str: string): boolean;
        /**
         * Calculates the byte length of a string given a specific character byte length.
         *
         * @param {string} str - The input string for which to calculate the byte length.
         * @param {number} charByteLength - The default byte length of each individual character in the string.
         * @return {number} The total byte length of the string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010106.html
         */
        byteLength(str: string, charByteLength: number): number;
        /**
         * Trims the input string and returns an empty string if the input is null or undefined.
         *
         * @param str - The input string to be trimmed.
         * @return The trimmed string, or an empty string if the input is null or undefined.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010106.html
         */
        trimToEmpty(str: string): string;
        /**
         * Converts a null or undefined string to an empty string.
         * If the input string is neither null nor undefined, it will be returned as is.
         *
         * @param {string | null | undefined} str - The input string which can be null, undefined, or a string.
         * @return {string} The original string if it is not null/undefined, otherwise an empty string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010106.html
         */
        nullToEmpty(str: string | null | undefined): string;
        /**
         * Trims the input string and returns `null` if the resulting string is empty.
         *
         * @param {string} str - The input string to be trimmed.
         * @return {string | null} The trimmed string or null if the trimmed string is empty.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010106.html
         */
        trimToNull(str: string): string | null;
        /**
         * Trims the given string and returns `undefined` if the resulting string is empty.
         *
         * @param {string} str - The string to be trimmed.
         * @return {string | undefined} - The trimmed string or undefined if the trimmed string is empty.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010106.html
         */
        trimToUndefined(str: string): string | undefined;
        /**
         * Trims leading and trailing whitespace from the given string. If the resulting string is empty,
         * the method returns the string "0".
         *
         * @param {string} str - The string to be trimmed.
         * @return {string} - The trimmed string, or "0" if the resulting string is empty.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010106.html
         */
        trimToZero(str: string): string;
        /**
         * Trims a given string and replaces it with a provided default value if it is empty.
         *
         * @param {string} str - The string to be trimmed.
         * @param {string} val - The value to replace if the trimmed string is empty.
         * @return {string} The trimmed string, or the replacement value if empty.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010106.html
         */
        trimToVal(str: string, val: string): string;
    };
    /**
     * Provides various utilities for handling and manipulating dates.
     */
    static date: {
        /**
         * Calculates the difference in days between two dates given in string format.
         *
         * @param {string} refDateStr - The reference date as a string in the format YYYYMMDD.
         * @param {string} targetDateStr - The target date as a string in the format YYYYMMDD.
         * @return {number} The number of days between the reference date and the target date.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010108.html
         */
        diff(refDateStr: string, targetDateStr: string): number;
        /**
         * Converts a date string to an array of strings or numbers representing the date components.
         *
         * @param {string} str - The date string to be converted.
         * @param {string} format - The format of the date string (e.g. "YYYYMMDD").
         * @param {boolean} [isString] - Optional. If true, returns the components as strings; otherwise, returns them as numbers.
         * @return {string[] | number[]} An array of strings or numbers representing the date components.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010108.html
         */
        strToDateStrArr(str: string, format: string, isString?: boolean): string[] | number[];
        /**
         * Converts a string to a N.Date object based on the specified format.
         *
         * @param {string} str - The date and time string to be converted.
         *  - "19991231": "1999-12-31 00:00:00"
         *  - "1999123103": "1999-12-31 03:00:00"
         *  - "199912310348": "1999-12-31 03:48:00"
         *  - "19991231034856": "1999-12-31 03:48:56"
         * @param {string} format - The expected format of the date and time string.
         *  - Y: Year
         *  - m: Month
         *  - d: Day
         *  - H: Hour
         *  - i: Minute
         *  - s: Second
         *  - e.g., "19991231": "Ymd"
         *  - e.g., "3112": "dm"
         *  - e.g., "12311999": "mdY"
         *  - e.g., "19991231120159": "YmdHis"
         *
         * > If the format argument is not provided, it is automatically set depending on the length of the input date string as follows:
         * > - 4 digits: "Y"
         * > - 6 digits: "Y-m"
         * > - 8 digits: "Y-m-d"
         * > - 10 digits: "Y-m-d H"
         * > - 12 digits: "Y-m-d H:i"
         * > - 14 digits: "Y-m-d H:i:s"
         *
         * > Date and time separator characters such as dash (-) and colon (:) are defined by the [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html) N.context.attr("data").formatter.date object functions. You can change these separator characters by modifying the return string of these functions.
         *
         * @return {NC.Date | null} A N.Date object representing the date in the string, or null if the string does not match the format.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010108.html
         */
        strToDate(str: string, format: string): N.Date | null;
        /**
         * Formats a given date string into the specified format.
         *
         * @param {string} str - The date string to be formatted.
         * @param {string} [format] - An optional format string that determines the output format. If not provided, a default format will be used.
         *  - Y: Year
         *  - m: Month
         *  - d: Day
         *  - e.g., "19991231": "Ymd"
         *  - e.g., "3112": "dm"
         *  - e.g., "12311999": "mdY"
         * @return {string} The formatted date string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010108.html
         */
        format(str: string, format?: string): string; // Format the date string
        /**
         * Converts a Date object to a timestamp.
         *
         * @param {Date} [dateObj] - The Date object to convert. If no Date object is provided, the current date and time are used.
         * @return {number} The timestamp representation of the given date.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010108.html
         */
        dateToTs(dateObj?: Date): number;
        /**
         * Converts a Unix timestamp to a JavaScript Date object.
         *
         * @param {number} [tsNum] - The Unix timestamp to convert. If not provided, the current time will be used.
         * @return {Date} The JavaScript Date object representing the given timestamp.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010108.html
         */
        tsToDate(tsNum?: number): Date;
        /**
         * Generates a list of date objects for a specified year and month.
         *
         * @param {number} year - The year for which the date list is to be generated.
         * @param {number} month - The month for which the date list is to be generated.
         * @return {[NC.JSONObject[]]} An array containing date objects for each day of the specified month in the specified year.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010108.html
         */
        dateList(year: number, month: number): [Date, Date, Date, Date, Date, Date, Date][];
    };
    /**
     * Provides utility methods for working with HTML elements, including converting data attributes to options objects, creating JSON data objects, defining data change effects, and calculating maximum z-index.
     */
    static element: {
        /**
         * Converts the value stored in the `opts` data key of an HTML element to an options-like value.
         *
         * > Implementation: `return N(ele).data("opts");`
         *
         * Since jQuery's `.data()` returns `any`, this method returns `unknown` for type safety.
         * Use type guards or type assertions when using the returned value.
         *
         * @param {N<HTMLElement[]>} ele - HTML elements to be converted.
         * @return {unknown} Options-like value stored in `data("opts")`. Use type guards to narrow the type.
         *
         * @example
         * ```typescript
         * const opts = N.element.toOpts(N("#myElement"));
         * if (typeof opts === 'object' && opts !== null) {
         *     // Type-safe usage with type guard
         *     const typedOpts = opts as { width?: number };
         *     console.log(typedOpts.width);
         * }
         * ```
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010107.html
         */
        toOpts(ele: N<HTMLElement[]>): unknown;
        /**
         * Converts an array-like rule definition string from the `data-format` or `data-validate` attribute into a rule array object.
         *
         * @param {N<HTMLElement[]>} ele - HTML elements to be converted.
         * @param {"format" | "validate"} ruleset - The type of rules to be applied, either formatting or validation.
         * @return {NC.RuleObj} - The resulting rule object containing the applied rules.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010107.html
         */
        toRules(ele: N<HTMLElement[]>, ruleset: "format" | "validate"): N.RuleObj;
        /**
         * Creates a JSON data object using the id/value attributes of the specified input elements.
         *
         * > Used in the N.form's add method to create initial data.
         *
         * e.g. Convert the values of input elements inside the #box element to JSON data.
         * ```
         * var data = N.element.toData($("#box").find(":input"));
         * ```
         *
         * @param {N<HTMLElement[]>} eles - N object containing only input select elements.
         * @return {JSONObject} JSON data object with id and value pairs of the input elements.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010107.html
         */
        toData(eles: N<HTMLElement[]>): N.JSONObject;

        /**
         * Defines the visual effect applied to elements when data is synchronized by N.ds.
         *
         * @param {N<HTMLElement[]>} eles - HTML elements on which the change effect will be displayed.
         * @return {void} This method does not return a value.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010107.html
         */
        dataChanged(eles: N<HTMLElement[]>): void;
        /**
         * Calculates the maximum z-index value among a collection of HTML elements.
         *
         * @param {N<HTMLElement[]>} ele - A collection of HTML elements to evaluate.
         * @return {number} The highest z-index value found within the collection of elements.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010107.html
         */
        maxZindex(ele: N<HTMLElement[]>): number;
    };
    /**
     * Provides various utility functions and properties related to browser operation.
     */
    static browser: {
        /**
         * Sets or gets a cookie based on the provided parameters. When only the name is provided, it retrieves the cookie value.
         * When name and value are provided, it sets a cookie with the optional expiry days and domain.
         *
         * @param {string} name - The name of the cookie.
         * @param {string} [value] - The value to be assigned to the cookie. If not provided, the function will return the current value of the cookie.
         * @param {number} [expiredays] - The number of days until the cookie expires. Defaults to session cookie if not provided.
         * @param {string} [domain] - The domain where the cookie is accessible. Defaults to current domain if not provided.
         * @return {string | undefined} - The value of the cookie if only name is provided. Undefined if setting a cookie.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010109.html
         */
        cookie(name: string, value?: string, expiredays?: number, domain?: string): string | undefined;
        /**
         * Removes a cookie by its name and optional domain.
         *
         * @param {string} name - The name of the cookie to remove.
         * @param {string} [domain] - The domain from which the cookie is to be removed. If omitted, the current domain is assumed.
         * @return {void} This method does not return a value.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010109.html
         */
        removeCookie(name: string, domain?: string): void;
        /**
         * Retrieves the version of Microsoft Internet Explorer (IE).
         *
         * This function detects the version of IE being used by the client and returns
         * it as a number. If the browser is not Internet Explorer, it returns 0.
         *
         * @return {number} The version of Internet Explorer as a number, or 0 if the browser is not IE.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010109.html
         */
        msieVersion(): number;
        /**
         * Checks if the given browser name matches the current browser type.
         *
         * @param {"opera" | "firefox" | "safari" | "chrome" | "ie" | "ios" | "android"} name - The name of the browser type to check against.
         * @return {boolean} true if the given browser name matches the current browser type, otherwise false.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010109.html
         */
        is(name: N.BrowserType): boolean;
        /**
         * Retrieves the context path of the application.
         *
         * This function returns a string representing the context path,
         * which is typically the base path or root directory from which
         * the application is served. It is commonly used for constructing
         * URLs that are relative to the application's root.
         * - "opera": Opera Browser.
         * - "firefox": Mozilla Firefox Browser.
         * - "safari": Apple Safari Browser.
         * - "chrome": Google Chrome Browser.
         * - "ie": Microsoft Internet Explorer Browser.
         * - "android": Google Android OS
         * - "ios": Apple iOS
         *
         * @returns {string} The application context path.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010109.html
         */
        contextPath(): string;
        /**
         * Calculates and returns the width of the browser's scrollbar.
         *
         * This function creates a temporary DOM element, measures the difference
         * between its clientWidth and offsetWidth, and then removes the element.
         *
         * @returns {number} The width of the scrollbar in pixels.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010109.html
         */
        scrollbarWidth(): number;
    };
    /**
     * Provides various utilities for handling messages.
     */
    static message: {
        /**
         * Replaces variables in the given message string with corresponding values from the vars array.
         *
         * @param msg - The message string containing variables to be replaced. Variables are denoted by placeholders such as {0}, {1}, etc.
         * @param vars - An optional array of strings. Each entry in this array provides a replacement for the corresponding placeholder in the message string.
         * @return The message string with all placeholders replaced by their corresponding values from the vars array.
         */
        replaceMsgVars(msg: string, vars?: string[]): string;
        /**
         * Returns a message that matches the currently set locale from the input message resource.
         *
         * The framework's default locale is `N.context.attr("core")` value in [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html) This can be set as the value of the `locale` property.
         *
         * @param {NC.MessageResourceObj} resource - The message resource object that needs to be fetched.
         * Message resources must be created as object types and configure locale-specific message sets as follows.
         * ```
         * var message = {
         *     "ko_KR": {
         *         messageKey: "안녕 {0}."
         *     },
         *     "en_US": {
         *         messageKey: "Hello {0}."
         *     }
         * }
         *
         * var msg = N.message.get(message, "key", ["Natural-JS"]);
         *
         * // msg: "Hello Natural-JS."
         * ```
         * @param {string} key - This is the key of the message to retrieve from the message resource object.
         *                       The message string containing variables to be replaced. Variables are denoted by placeholders such as {0}, {1}, etc.
         * @param {string[]} [vars] - An optional array of strings. Each entry in this array provides a replacement for the corresponding placeholder in the message string.
         * @return {string} Message string, if there is no message string corresponding to key, the key value is returned as is.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010110.html
         */
        get(resource: N.MessageResourceObj, key: string, vars?: string[]): string;
    };
    /**
     * Array utilities for various array operations.
     */
    static array: {
        /**
         * Removes duplicate objects from an array based on a specified key.
         * If no key is provided, it removes duplicate primitive values.
         *
         * @param {JSONObject[] | N<JSONObject[]>} arr - The array from which duplicates are to be removed.
         * @param {string} [key] - Optional. The property name on which duplication check is based.
         * @return {JSONObject[]} A new array with duplicates removed.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010111.html
         */
        deduplicate(arr: N.JSONObject[] | N<N.JSONObject[]>, key?: string): N.JSONObject[];
    };
    /**
     * Provides utilities for processing JSON data.
     */
    static json: {
        /**
         * Creates a new object or array of objects containing only the specified keys from the input object(s).
         * 
         * @param {NC.JSONObject | N.JSONObject[]} obj - The object or array of objects to extract keys from.
         * @param {...string} keys - The keys to include in the resulting object(s).
         * @return {NC.JSONObject | N.JSONObject[]} A new object or array of objects containing only the specified keys.
         * 
         * @example
         * // Extract only the 'id' and 'name' properties from an object
         * const result = N.json.mapFromKeys({ id: 1, name: 'John', age: 30 }, 'id', 'name');
         * // result: { id: 1, name: 'John' }
         * 
         * @example
         * // Extract only the 'id' and 'name' properties from an array of objects
         * const result = N.json.mapFromKeys([
         *   { id: 1, name: 'John', age: 30 },
         *   { id: 2, name: 'Jane', age: 25 }
         * ], 'id', 'name');
         * // result: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
         */
        mapFromKeys(obj: N.JSONObject | N.JSONObject[], ...keys: string[]): N.JSONObject | N.JSONObject[];
        /**
         * Merges two JSON arrays based on a specified key.
         *
         * > - Merges the arr2 argument based on the arr1 argument and excludes duplicate elements.
         * > - If you specify the object's property name as the third argument, duplicate elements are excluded based on that property.
         * > - Even if the objects specified by the arr1 argument are merged, their memory references do not change.
         *
         * @param {JSONObject[] | N<JSONObject[]>} arr1 - The first JSON array to merge.
         * @param {JSONObject[] | N<JSONObject[]>} arr2 - The second JSON array to merge.
         * @param {string} key - The key used to identify and merge objects from the arrays.
         * @return {JSONObject[]} The merged JSON array containing objects from both arrays.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010112.html
         */
        mergeJsonArray(
            arr1: N.JSONObject[] | N<N.JSONObject[]>,
            arr2: N.JSONObject[] | N<N.JSONObject[]>,
            key: string,
        ): N.JSONObject[];
        /**
         * Formats the given data to a string representation with specified indentation.
         *
         * @param {object | object[] | string} oData - The data to be formatted. The data can be an object, array of objects, or json string.
         * @param {number} sIndent - The number of spaces to use for indentation.
         * @return {string | null} The formatted string or null if the data type is unsupported.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010112.html
         */
        format(oData: object | object[] | string, sIndent?: number): string | null;
    };
    /**
     * Provides utilities for processing event.
     */
    static event: {
        /**
         * Checks if the provided keyboard event is related to number input keys.
         * > This function was taken from "https://stackoverflow.com/a/13952775" and modified.
         *
         * @param e - The jQuery keyboard event to be checked.
         * @return A boolean value indicating whether the event is related to number input keys.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010113.html
         */
        isNumberRelatedKeys(e: JQuery.Event): boolean; //
        /**
         * Disables the current event handling, effectively preventing the default action and stopping the propagation of the event.
         *
         * @param {JQuery.Event} e - The jQuery event object associated with the event being handled.
         * @return {boolean} - Always returns false to indicate that the default action should not be executed.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0101.html&tab=html/naturaljs/refr/refr010113.html
         */
        disable(e: JQuery.Event): false;
        /**
         * Locks the window scrolling functionality to specific elements.
         *
         * @param {N<HTMLElement[]>} ele - HTML element that should lock window scrolling.
         * @return {void} This method does not return a value.
         */
        windowScrollLock(ele: N<HTMLElement[]>): void;
        /**
         * Retrieves the maximum duration of CSS animations or transitions applied to any of the given HTMLElements.
         *
         * @param {N<HTMLElement[]>} ele - A wrapped or unwrapped array of HTMLElements to analyze for CSS durations.
         * @param {string} css - The CSS property name (e.g., 'animation', 'transition') to inspect for durations.
         * @return {number} The maximum duration in milliseconds among all specified CSS properties on the provided elements.
         */
        getMaxDuration(ele: N<HTMLElement[]>, css: string): number;
        /**
         * Detects the end event name of a CSS animation.
         * > Referenced the code from [David Walsh](http://davidwalsh.name/css-animation-callback).
         *
         * @param {N<HTMLElement[]>} ele - The HTML elements to check for animation events.
         * @return {string | "nothing"} The name of the animation event, or "nothing" if no event is found.
         */
        whichAnimationEvent(ele: N<HTMLElement[]>): string | "nothing"; // Detect the end event name of CSS animations,
        /**
         * Detects the end event name of a CSS transition.
         * > Referenced the code from [David Walsh](http://davidwalsh.name/css-animation-callback).
         *
         * @param {N<HTMLElement[]>} ele - The HTML elements to check for transition events.
         * @return {string | "nothing"} The name of the animation event, or "nothing" if no event is found.
         */
        whichTransitionEvent(ele: N<HTMLElement[]>): string | "nothing";
    };
    /**
     * Used in N.formatter to process user formats.
     * 
     * @class
     * @see http://www.pengoworks.com/workshop/js/mask/ Mask JavaScript API(dswitzer@pengoworks.com)
     */
    static mask: {
        /**
         * Creates a new mask instance with the specified format.
         * 
         * @param {string} m - The mask format to apply.
         * @return {NC.MaskInstance} A new mask instance.
         */
        new(m: string): N.MaskInstance;
    };
}

/**
 * Extends the JavaScript Date object to provide additional utility functions for date manipulation and formatting.
 */
interface Date {
    /**
     * Returns a string created with the date of the Date object in the specified format.
     * > This is a function that extends to the Javascript Date object.
     *
     * > Referenced the library from [http://www.svendtofte.com/javascript/javascript-date-string-formatting/](http://www.svendtofte.com/javascript/javascript-date-string-formatting/) and [http://www.php.net/date](http://www.php.net/date).
     *
     * @param {string} input - Date format string.
     *  - Y: Year
     *  - m: Month
     *  - d: Day
     *  - H: Hour
     *  - i: Minute
     *  - s: Second
     *  - e.g., "1999-12-31": "Y-m-d"
     *  - e.g., "31/12": "d/m"
     *  - e.g., "12-31-1999": "m-d-Y"
     *  - e.g., "1999-12-31-12:01:59": "Y-m-d H:i:s"
     * @param {number} [time] - A Timestamp value that sets the default date for the Date object.
     * @return {string} The formatted date string.
     */
    formatDate(input: string, time?: number): string;
}


declare namespace N {
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
     * Includes N collections, native HTMLElement, and arrays of HTMLElement.
     */
    type ElementLike = N<HTMLElement[]> | HTMLElement | HTMLElement[];

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
        | N.Controller
        | N.Alert
        | N.Button
        | N.Datepicker
        | N.Popup
        | N.Tab
        | N.Select
        | N.Form
        | N.List
        | N.Grid
        | N.Pagination
        | N.Tree
        | N.Notify
        | N.Documents;
    interface InstanceCallback {
        (this: N.Instance, instanceName: string, instance: N.Instance): void;
    }

    interface ValsCallback {
        (this: N<HTMLElement[]>, index: number, selEle: N<HTMLElement[]>): void;
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
        | N<Element>
        | JQuery;
}


declare class NA {
    static fetch: {
        (options: N.Options.Fetch): N.XhrCompat;
    };
    static comm: N.Communicator;
    static cont: N.Controller;
    static context: N.Context;
    static config: N.Config;

    /**
     * N.comm is a library that supports Ajax communication with the server, such as requesting content or data from the server or passing parameters.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0203.html
     */
    comm(url: string | N.Options.Request): N.Communicator;
    /**
     * The Communicator.request is a request information object created each time N.comm is initialized.
     *
     * Options for the N.comm() function are saved in the Communicator.request.options object and are passed on as request headers or parameters to the server.
     *
     * When a page file is requested, it is passed as the second argument of the init function of the Controller object or as a member variable (this.request) of the Controller object. You can verify the request information or receive page parameters with the passed request object.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0204.html
     */
    request(): N.Request;
    /**
     * N.cont executes the init function of the Controller object and returns the Controller object.
     *
     * > The Controller object is an object that controls the elements of the View and the data retrieved from the Communicator.
     *
     * N.cont should be declared immediately below the View area of the page, like this:
     *
     * ```
     * <article class="view">
     *     <p>View area</p>
     * </article>
     *
     * <script type="text/javascript">
     *     N(".view").cont({ // Controller object
     *         init: function(view, request) {
     *         }
     *     });
     * </script>
     * ```
     *
     * If you load a page with the above structure using the N.popup, N.tab component or N.comm library, the init function of the Controller object is called when page loading is complete.
     *
     * > For Natural-ARCHITECTURE-based pages to function properly, they must be loaded with the N.comm library, N.popup, or N.tab components.
     *
     * > When selecting an element on a page, you must `find` on a view or specify view as the `context` argument (second argument) to a jQuery function.
     * Otherwise, unintended elements from other block pages may be selected, resulting in unpredictable errors.
     * For more information, please refer to the [Restrictions and Tips](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0601.html) menu.
     *
     * > When `N(".view").cont()` is executed, a `pageid data attribute value` such as `data-pageid="view"` is created in the `.view` element specified by the selector.
     * The `pageid` is `.(dot), #(sharp), [(left bracket), ](right bracket), '(single quote), :(colon), ((left bracket), ), )(right bracket), >(right arrow bracket), " "(space), -(hyphen)` characters are removed to create pageid, so the page identification value is defined not to include the special characters.
     * For example, `N("page.view-01").cont()` creates a pageid of `pageview01` with the dot and hyphen removed.
     *
     * To control a specific page, such as a block page or tab content, you can get a Controller object as follows.
     * ```
     * var page01Cont = N("#page01").instance("cont");
     * page01Cont.gridInst.bind([]);
     * ```
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0201.html
     */
    cont(contObj: N.Objects.Controller.Object): N.Objects.Controller.Object;
}

declare namespace N {
    class Communicator {
        constructor(obj: N<N.JSONObject[]> | string, url?: string | N.Options.Request);
        xhr: N.XhrCompat;
        initFilterConfig(): N.Objects.Config.FilterConfig;
        resetFilterConfig(): N.Communicator;
        /**
         * Registers a callback function to be executed when a successful response is received from the server.
         *
         * If the `callback` argument is not provided to the `submit` function, a Promise-compatible `xhr` object is returned, allowing the use of async/await syntax.
         *
         * ```
         * // JSON Data
         * const fn1 = async () => {
         *     const data = await N.comm("data.json").submit();
         * };
         *
         * // Catch exception
         * const fn2 = async () => {
         *     const data = await N.comm("data.json").submit().then((data) => {
         *         console.log(data);
         *     }).catch((e) => {
         *         console.error(e);
         *     });
         * };
         *
         * // HTML page
         * const fn3 = async () => {
         *     const data = await N("#page-container").comm("page.html").submit();
         *     console.log(data); // HTML Text
         * };
         * ```
         *
         * @param {NA.Callbacks.Communicator.Submit} callback - Define a callback function that handles the server's response when the request is successful.
         *
         * When requesting an HTML page, a Controller object of the loaded page is returned as the argument to the callback function. For other requests, a data object and the Communicator.request object are returned.
         * ```
         * // JSON Data
         * N.comm("data.json").submit(function(data, request) {
         *     N.log(data, request);
         * });
         *
         * // HTML page
         * N("#page-container").comm("page.html").submit(function(cont) {
         *     N.log(cont); // cont: Controller object
         * });
         * ```
         * @return {NA.Communicator} The jqXHR object or the Communicator instance depending on the submission context.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0203.html&tab=html/naturaljs/refr/refr020305.html
         */
        submit(callback: N.Callbacks.Communicator.Submit): N.Communicator;
        /**
         * Registers a callback function to be executed when a successful response is received from the server.
         *
         * If the `callback` argument is not provided to the `submit` function, a Promise-compatible `xhr` object is returned, allowing the use of async/await syntax.
         *
         * ```
         * // JSON Data
         * const fn1 = async () => {
         *     const data = await N.comm("data.json").submit();
         * };
         *
         * // Catch exception
         * const fn2 = async () => {
         *     const data = await N.comm("data.json").submit().then((data) => {
         *         console.log(data);
         *     }).catch((e) => {
         *         console.error(e);
         *     });
         * };
         *
         * // HTML page
         * const fn3 = async () => {
         *     const data = await N("#page-container").comm("page.html").submit();
         *     console.log(data); // HTML Text
         * };
         * ```
         *
         * @return {NA.XhrCompat} The xhr-compatible object or the Communicator instance depending on the submission context.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0203.html&tab=html/naturaljs/refr/refr020305.html
         */
        submit(): N.XhrCompat;
        /**
         * Registers a callback function that will be executed when an error response is received from the server after calling the submit function or when an error occurs in the callback function of the submit method.
         * > You can call the error method multiple times to register multiple callback functions.
         *
         * @param {NA.Callbacks.Communicator.Error} callback - Defines the callback function that handles errors when they occur.
         *
         * The `this` context of the callback function is the instance of the created N.comm, and it receives the following arguments:
         *  - xhr(arguments[2]): jQuery XMLHttpRequest
         *  - textStatus(arguments[3]): "success" (when an error occurs in the submit callback) or "error" (when an error occurs from the server)
         *  - e(arguments[0]): ErrorThrown
         *  - request(arguments[1]): Communicator.request
         *  - callback(arguments[4]): The callback function specified as an argument in the submit method when textStatus is "success".
         *
         * ```
         * N.comm("data.json").error(function(xhr, textStatus, e, request, callback) {
         *     // 2. First error handler for col01.length error
         * }).error(function(xhr, textStatus, e, request, callback) {
         *     // 3. Second error handler for col01.length error
         * }).submit(function(data, request) {
         *     var col01;
         *     col01.length; // 1. Generates an undefined related error
         * });
         * ```
         *
         * @return {NA.Communicator} Returns the `Communicator` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0203.html&tab=html/naturaljs/refr/refr020305.html
         */
        error(callback: N.Callbacks.Communicator.Error): N.Communicator;
        /**
         * The `Communicator.request` object is a request information object created each time `N.comm` is executed.
         *
         * The options of the `N.comm()` function are stored in the `Communicator.request.options` object and are delivered as headers or parameters of the server request.
         *
         * When requesting an HTML page, the request object is passed as the second argument of the `init` function of the Controller object or as a member variable (`this.request`) of the Controller object. You can check the request information or retrieve the request parameter object using the provided request object.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0204.html
         */
        request: N.Request;
    }

    class Request {
        constructor(obj: N<N.JSONObject[]>, opts: N.Options.Request);
        options: N.Options.Request;
        attrObj: object;
        obj: N.Communicator;
        /**
         * Get the parameters passed while calling this page.
         *
         * Retrieving data from the loaded page:
         * ```
         * N(".view").cont({
         *     init: function(view, request) {
         *         var data1 = request.attr("data1"); // { data: ["1", "2"] }
         *         var data2 = request.attr("data2"); // ["3", "4"]
         *     }
         * });
         * ```
         *
         * @param {String} name - Parameter name
         *
         * @return {unknown} Returns the passed parameter value.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0204.html&tab=html/naturaljs/refr/refr020403.html
         */
        attr(name: string): unknown;
        /**
         * Set the parameters to be passed to the page to be loaded.
         *
         * Sending data:
         * ```
         * N(".view").cont({
         *     init: function(view, request) {
         *         N("#section").comm("page.html")
         *             .request.attr("data1", { data: ["1", "2"] })
         *             .request.attr("data2", ["3", "4"])
         *                 .submit();
         *     }
         * });
         * ```
         *
         * @param {String} name - Parameter name
         * @param {unknown} obj - Parameter data
         *
         * @return {NA.Communicator} Returns the Communicator object.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0204.html&tab=html/naturaljs/refr/refr020403.html
         */
        attr(name: string, obj: unknown): N.Communicator;
        removeAttr(name: string): N.Communicator;
        /**
         * Extracts the GET parameter values from the browser's URL.
         *
         * @return {object} Returns all GET parameters as an object.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0204.html&tab=html/naturaljs/refr/refr020403.html
         */
        param(): object;
        /**
         * Extracts the value of a GET parameter from the URL in the browser.
         *
         * @param {string} name - The key of the parameter to be retrieved.
         * @return {string} The value of the parameter
         */
        param(name: string): string;
        /**
         * Retrieves the current request options.
         *
         * @return {NA.Options.Request} The options used for the request.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0204.html&tab=html/naturaljs/refr/refr020403.html
         */
        get(): N.Options.Request;
        /**
         * Retrieves for the value specified as a key in request options.
         *
         * @param {string} key - Property name of request options
         * @return {any} Value corresponding to the key value specified in request options
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0204.html&tab=html/naturaljs/refr/refr020403.html
         */
        get(key: string): any;
        /**
         * Reloads the block page loaded by the Communicator.
         * > If the attr method has not been called to set values before calling reload, the values in the request object before the reload are maintained even after reloading.
         *
         * > You can specify the Communicator.request data for the page being reloaded using the attr method.
         *
         * ```
         * request.attr("param", { param: 1 });
         * request.reload();
         * ```
         *
         * > The reload function does not support method chaining.
         *   ```
         *   request.attr("param", { param: 1 }).reload(); // This usage is invalid.
         *   ```
         *
         * @param {NA.Callbacks.Request.Reload} [callback] - An optional callback function that will be called upon the completion of the reload process.
         * ```
         * request.reload(function(html, request) {
         *     N.log(html, request);
         * });
         * ```
         * @return {NA.Communicator} Returns the Communicator instance to allow for method chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0204.html&tab=html/naturaljs/refr/refr020403.html
         */
        reload(callback?: N.Callbacks.Request.Reload): N.Communicator;
    }

    interface Controller {
        /**
         * Creates a new Controller instance.
         * 
         * @param {N<HTMLElement[]>} obj - The context element to which the Controller will be applied.
         * @param {NA.Objects.Controller.Object} contObj - The Controller object containing initialization and event handling logic.
         * @return {NA.Objects.Controller.Object} The initialized Controller object.
         */
        new(obj: N<HTMLElement[]>, contObj: N.Objects.Controller.Object): N.Objects.Controller.Object;

        /**
         * Initializes the Controller with transaction-related setup.
         * 
         * @param {NA.Objects.Controller.Object} cont - The Controller object to initialize.
         * @param {NA.Request} request - The Request object associated with the Controller.
         * @return {void} This method does not return a value.
         */
        trInit(cont: N.Objects.Controller.Object, request: N.Request): void;

        /**
         * Aspect-oriented programming(AOP) processing class.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0202.html
         */
        aop: {
            pointcuts: {
                regexp: {
                    /**
                     * Evaluates whether a function should be intercepted based on a regular expression pattern.
                     * 
                     * @param {RegExp | string} param - The pattern to match against function names.
                     * @param {NA.Objects.Controller.Object} contFrag - The Controller object fragment.
                     * @param {string} fnChain - The function chain to evaluate.
                     * @return {boolean} True if the function should be intercepted, false otherwise.
                     */
                    fn(param: RegExp | string, contFrag: N.Objects.Controller.Object, fnChain: string): boolean;
                };
            };

            /**
             * Wraps the Controller object with AOP functionality.
             * 
             * @param {NA.Objects.Controller.Object} cont - The Controller object to wrap.
             * @return {void} This method does not return a value.
             */
            wrap(cont: N.Objects.Controller.Object): void;
        };
    }

    interface Context {
        attrObj: object;
        /**
         * Get data stored in N.context.
         *
         * @param {string} name - data name.
         * @return {unknown} Stored data.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0206.html&tab=html/naturaljs/refr/refr020602.html
         */
        attr(name: string): unknown;
        /**
         * Set the data to be stored in N.context.
         *
         * @param {string} name - data name.
         * @param {unknown} obj - Data to store.
         * @return {this} The current object, for chainability.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0206.html&tab=html/naturaljs/refr/refr020602.html
         */
        attr(name: string, obj: unknown): N.Context;
    }

    interface Config {
        filterConfig: N.Objects.Config.FilterConfig;
    }

    /**
     * xhr-compatible object returned by N.fetch
     * Extends Promise and provides jQuery.Deferred methods and xhr methods
     */
    interface XhrCompat extends Promise<any> {
        readyState: number;
        status: number;
        statusText: string;
        responseText: string;
        responseJSON: any;
        
        // xhr methods
        abort(): N.XhrCompat;
        getResponseHeader(name: string): string | null;
        getAllResponseHeaders(): string;
        
        // jQuery.Deferred methods
        done(callback: (data: any) => void): N.XhrCompat;
        fail(callback: (error: any) => void): N.XhrCompat;
        always(callback: () => void): N.XhrCompat;
    }
}


declare namespace N {
    namespace Options {
        /**
         * Options interface for N.fetch with support for custom fetch options.
         * Extends Request interface and allows additional fetch-specific options.
         */
        interface Fetch extends Request {
            /**
             * Additional fetch API options that will be merged with converted jQuery.ajax options.
             * Allows fine-grained control over fetch behavior.
             * 
             * @example
             * ```
             * N.fetch({
             *     url: "/api/data",
             *     type: "POST",
             *     fetchOptions: {
             *         credentials: "include",
             *         redirect: "follow",
             *         mode: "cors"
             *     }
             * });
             * ```
             */
            fetchOptions?: RequestInit;
        }

        /**
         * Options interface extending the JQuery.Ajax.AjaxSettingsBase interface for making `N.comm.request` with additional settings.
         */
        interface Request extends Omit<JQuery.Ajax.AjaxSettingsBase<any>, "success" | "error" | "complete"> {
            /**
             * A string containing the URL to which the request is sent.
             */
            url: string;
            /**
             * When sending data to the server, use this content type. Default is "application/x-www-form-urlencoded; charset=UTF-8", which is fine for most cases. If you explicitly pass in a content-type to $.ajax(), then it is always sent to the server (even if no data is sent). As of jQuery 1.6 you can pass false to tell jQuery to not set any content type header. Note: The W3C XMLHttpRequest specification dictates that the charset is always UTF-8; specifying another charset will not force the browser to change the encoding. Note: For cross-domain requests, setting the content type to anything other than application/x-www-form-urlencoded, multipart/form-data, or text/plain will trigger the browser to send a preflight OPTIONS request to the server.
             */
            contentType?: string;
            /**
             * The MIME type of content that is used to submit the form to the server. Possible values are:
             *
             * "application/x-www-form-urlencoded": The initial default type.
             *
             * "multipart/form-data": The type that allows file `<input>` element(s) to upload file data.
             *
             * "text/plain": A type introduced in HTML5.
             */
            enctype?: Objects.Request.Enctype;
            /**
             * If set to false, it will force requested pages not to be cached by the browser. Note: Setting cache to false will only work correctly with HEAD and GET requests. It works by appending "_={timestamp}" to the GET parameters. The parameter is not needed for other types of requests, except in IE8 when a POST is made to a URL that has already been requested by a GET.
             */
            cache?: boolean;
            /**
             * By default, all requests are sent asynchronously (i.e. this is set to true by default). If you need synchronous requests, set this option to false. Cross-domain requests and dataType: "jsonp" requests do not support synchronous operation. Note that synchronous requests may temporarily lock the browser, disabling any actions while the request is active. As of jQuery 1.8, the use of async: false with jqXHR ($.Deferred) is deprecated; you must use the success/error/complete callback options instead of the corresponding methods of the jqXHR object such as jqXHR.done().
             *
             * @deprecated
             */
            async?: boolean;
            /**
             * An alias for method. You should use type if you're using versions of jQuery prior to 1.9.0.
             */
            type?: Objects.Request.HttpMethod;
            /**
             * Data to be sent to the server. It is converted to a query string, if not already a string. It's appended to the url for GET-requests. See processData option to prevent this automatic processing. Object must be Key/Value pairs. If value is an Array, jQuery serializes multiple values with same key based on the value of the traditional setting (described below).
             */
            data?: JQuery.PlainObject | string;
            /**
             * The type of data that you're expecting back from the server. If none is specified, jQuery will try to infer it based on the MIME type of the response (an XML MIME type will yield XML, in 1.4 JSON will yield a JavaScript object, in 1.4 script will execute the script, and anything else will be returned as a string). The available types (and the result passed as the first argument to your success callback) are:
             *
             * "xml": Returns an XML document that can be processed via jQuery.
             *
             * "html": Returns HTML as plain text; included script tags are evaluated when inserted in the DOM.
             *
             * "script": Evaluates the response as JavaScript and returns it as plain text. Disables caching by appending a query string parameter, _=[TIMESTAMP], to the URL unless the cache option is set to true. Note: This will turn POSTs into GETs for remote-domain requests.
             *
             * "json": Evaluates the response as JSON and returns a JavaScript object. Cross-domain "json" requests are converted to "jsonp" unless the request includes jsonp: false in its request options. The JSON data is parsed in a strict manner; any malformed JSON is rejected and a parse error is thrown. As of jQuery 1.9, an empty response is also rejected; the server should return a response of null or {} instead. (See json.org for more information on proper JSON formatting.)
             *
             * "jsonp": Loads in a JSON block using JSONP. Adds an extra "?callback=?" to the end of your URL to specify the callback. Disables caching by appending a query string parameter, "_=[TIMESTAMP]", to the URL unless the cache option is set to true.
             *
             * "text": A plain text string.
             *
             * multiple, space-separated values: As of jQuery 1.5, jQuery can convert a dataType from what it received in the Content-Type header to what you require. For example, if you want a text response to be treated as XML, use "text xml" for the dataType. You can also make a JSONP request, have it received as text, and interpreted by jQuery as XML: "jsonp text xml". Similarly, a shorthand string such as "jsonp xml" will first attempt to convert from jsonp to xml, and, failing that, convert from jsonp to text, and then from text to xml.
             */
            dataType?: Objects.Request.DataType;
            /**
             * If you wish to force a crossDomain request (such as JSONP) on the same domain, set the value of crossDomain to true. This allows, for example, server-side redirection to another domain.
             */
            crossDomain?: boolean;
            /**
             * The browser's `location.href` value when requested.
             */
            referrer?: string;
            /**
             * If set to `true`, the parameter object specified as an argument of the N function in `N().comm` can be specified as an array type.
             *
             * > When using Communicator with `N(params).comm(url).submit()`, if the object type of params is array and the dataIsArray option is set to false, only the first object of array is transmitted.
             * The cause of this problem is that if you call the get function after setting the argument of the jQuery function to `array(jQuery([{}]))` or `object($({}))`, both return `array([{}])`.
             * Even if it is inconvenient, when transmitting an array to the server, set dataIsArray to true or use an array in an object.
             *
             * > When `Communicator` is used with `N.comm(params, url).submit()`, even if the dataIsArray option is not set to true, params is not created as a jQuery object, so it is sent as an array type.
             *
             * > Applied after `Natural-ARCHITECTURE v0.8.1.4` version.
             */
            dataIsArray?: boolean;
            /**
             * If set to `false`, the response will not be blocked even if the location.href when making a request to the server and the location.href when receiving a response from the server are different.
             *
             * > If the server response is blocked for unknown reasons, test this option by setting it to false.
             */
            urlSync?: boolean;
            /**
             * If set to `true`, the loaded page will be appended to the element specified by the `target` option rather than overwritten.
             */
            append?: boolean;
            /**
             * Specifies the element into which to insert HTML content.
             *
             * > When Communicator is used with `N(".block").comm("page.html").submit()`, the `N("#block")` element object is specified as the target property value.
             */
            target?: N<HTMLElement[]>;
        }
    }

    namespace Callbacks {
        namespace Communicator {
            interface Submit {
                (
                    this: N.Communicator,
                    data?: N.JSONObject | N.JSONObject[] | N.Primitive | object | object[] | N.Controller,
                    request?: N.Request,
                ): void;
            }
            interface Error {
                (
                    this: N.Communicator,
                    xhr: JQuery.jqXHR,
                    textStatus: JQuery.Ajax.TextStatus,
                    e: Error,
                    request: N.Request,
                    submitCallback: Submit,
                ): void;
            }
        }

        namespace Controller {
            interface OnOpen {
                (this: N.Objects.Controller.Object, onOpenData?: any): void;
            }
        }

        namespace Request {
            interface Reload {
                (this: N.Communicator, html?: string | N.Controller, request?: N.Request): void;
            }
        }
    }

    namespace Objects {
        namespace Request {
            /**
             * Enum representing different encoding types for form submissions.
             *
             * The `Enctype` enum provides a set of constants that define the encoding type
             * used when submitting form data. This is used in the `enctype` attribute of HTML forms.
             *
             * Enctype.URLENCODED - Represents the MIME type `application/x-www-form-urlencoded`.
             * This is the default encoding type that is used by forms.
             *
             * Enctype.MULTIPART - Represents the MIME type `multipart/form-data`.
             * This encoding type is used when the form includes file uploads.
             *
             * Enctype.PLAIN - Represents the MIME type `text/plain`.
             * This encoding type sends data without any encoding for the key-value pairs.
             */
            /* eslint-disable-next-line @definitelytyped/no-const-enum */
            const enum Enctype {
                URLENCODED = "application/x-www-form-urlencoded",
                MULTIPART = "multipart/form-data",
                PLAIN = "text/plain",
            }

            /**
             * An enumeration for different types of data formats that can be used.
             */
            /* eslint-disable-next-line @definitelytyped/no-const-enum */
            const enum DataType {
                JSON = "json",
                XML = "xml",
                SCRIPT = "script",
                HTML = "html",
                TEXT = "text",
                JSONP = "jsonp",
            }

            /**
             * Enum for HTTP methods.
             *
             * This enum provides a collection of standard HTTP methods used in network communication.
             * Each key in the enum represents a type of request that can be made to a web server.
             *
             * - POST: Used to submit data to be processed to a specified resource.
             * - GET: Requests a representation of the specified resource.
             * - PUT: Replaces all current representations of the target resource with the request payload.
             * - DELETE: Deletes the specified resource.
             * - HEAD: Asks for a response identical to a GET request, but without the response body.
             * - OPTIONS: Used to describe the communication options for the target resource.
             * - TRACE: Performs a message loop-back test along the path to the target resource.
             * - CONNECT: Establishes a tunnel to the server identified by the target resource.
             * - PATCH: Used to apply partial modifications to a resource.
             */
            /* eslint-disable-next-line @definitelytyped/no-const-enum */
            const enum HttpMethod {
                POST = "POST",
                GET = "GET",
                PUT = "PUT",
                DELETE = "DELETE",
                HEAD = "HEAD",
                OPTIONS = "OPTIONS",
                TRACE = "TRACE",
                CONNECT = "CONNECT",
                PATCH = "PATCH",
            }
        }

        namespace Controller {
            interface InitFunction {
                (this: Object, view: N<HTMLElement[]>, request: N.Request): void;
            }

            interface BaseObject {
                /**
                 * The initializer function that is called to set up the initial state or configuration.
                 * This function is optional, and if provided, it should follow the signature defined by `InitFunction`.
                 */
                init?: InitFunction;
                /**
                 * View element.
                 *
                 * > Same as the first argument of the init function.
                 */
                view?: N<HTMLElement[]>;
                /**
                 * Instance of the Communicator.request object.
                 *
                 * > Same as the second argument of the init function.
                 */
                request?: N.Request;
                /**
                 * If the page is called by N.popup / N.tab / N.docs components, this is the instance of the calling component.
                 * With this instance, you can control the parent page.
                 */
                caller?: N.Popup | N.Tab | N.Documents;
                /**
                 * If the popup page is called by N.popup or N.tab components, this is the controller object instance of the parent page.
                 *
                 * With this instance, you can control the parent page.
                 *
                 * > The opener attribute should be specified with the Controller object of the parent page when creating an instance of N.popup or N.tab components.
                 */
                opener?: BaseObject & N.Objects.Controller.Object;
                /**
                 * This is a function implementation of the onOpen option specified as a string in pop-ups and tabs.
                 */
                onOpen?: Callbacks.Controller.OnOpen;
                /**
                 * Index signature to allow custom properties on the controller object.
                 * Use `unknown` for type safety - requires type guards or assertions when accessing custom properties.
                 */
                [key: string]: unknown;
            }

            type Object = BaseObject & (NT.Objects.Controller.InitialObject | {});
        }

        namespace Config {
            interface FilterConfig {
                beforeInitFilters: object[];
                afterInitFilters: object[];
                beforeSendFilters: object[];
                successFilters: object[];
                errorFilters: object[];
                completeFilters: object[];
            }
        }
    }
}


declare class ND {
    /**
     * Formatter(N.formatter) is a library that formats an input data set (array of JSON objects) and returns the formatted data set.
     * - Instead of using a ruleset, you can pass an element as an argument, where the element wraps elements with formatting rules declared in the data-format attribute. This will display the formatted string in those elements. If the element is a text input element, it will display the original string of the data when the cursor focuses in (focusin event), and display the formatted string when the cursor focuses out (focusout event).
     * - You can also format on a per-string basis rather than using a dataset.
     *
     * @param {N<HTMLElement[]> | HTMLElement | N.FormatRuleObject | string} [rules] - Specifies formatting rules.
     * The formatting rule can be specified in two types as follows:
     * - If you specify the rules as an object option:
     *   ```
     *   // { "columnPropertyName": [["ruleName", arguments[0], arguments[1]...]] }
     *   new N.formatter(data, {
     *       "numeric": [["trimtoempty"], ["numeric", "#,###.##0000"]],
     *       "generic": [["trimtoempty"], ["generic", "@@ABCD"]],
     *       "limit": [["trimtoempty"], ["limit", "13", "..."]],
     *       "etc": [["date", 12]]
     *   }).format();
     *   ```
     * - If you specify the rules by providing a jQuery object which includes elements with data-validate attributes:
     *   ```
     *   ...
     *   <div class="formatter-context">
     *       <!-- [ ["ruleName", "arguments[0]", "arguments[1]"], ... ] -->
     *      <input id="limit" type="text" data-format='[["trimtoempty"], ["limit", "13", "..." ]]' />
     *   </div>
     *   ...
     *
     *   <script type="text/javascript">
     *       N(".formatter").cont({
     *           init: function(view, request) {
     *               N.formatter(data, N(".formatter-context", view)).format();
     *           }
     *       });
     *   </script>
     *   ```
     * If you set formatting rules declaratively and want to change the formatting rules dynamically, you just need to reassign the value of the "format" data attribute for the corresponding input element as follows:
     * ```
     * N("#limit").data("format", [["trimtoempty"]])
     * ```
     *
     * @returns {ND.Formatter} A new N.format instance.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html
     */
    formatter(rules?: N<HTMLElement[]> | HTMLElement | N.FormatRuleObject | string): N.Formatter;
    /**
     * Validator (N.validator) is a library that validates an input data set (array of JSON objects) and returns the result data set.
     * - Instead of a ruleset, if you pass an element that wraps input elements with validation rules declared in the data-validate attribute, it will validate the value entered in the element when the cursor focusout occurs on the input element. If validation fails, an error message is displayed in the form of a tooltip near the input element.
     * - Validation can also be performed on strings, not just datasets.
     *
     * @param {N<HTMLElement[]>|HTMLElement|ND.ValidationRuleObject|string} [rules] - Specifies the validation rules.
     * You can specify the validation rules in two ways as follows:
     * - Specifying rules as object options:
     *    ```
     *    // { "columnName": [["ruleName", arguments[0], arguments[1] ... ] }
     *    N.validator(data, {
     *        "numeric": [["required"], ["integer+commas"]],
     *        "generic": [["required"], ["korean"]],
     *        "limit": [["required"], ["alphabet"]]
     *    }).validate();
     *    ```
     *
     * - Specifying rules by passing a jQuery object that wraps elements with data-validate attributes:
     *   ```
     *    ...
     *    <div class="validator-context">
     *        <!-- [ ["ruleName", "ruleArguments[0]", "ruleArguments[1]"], ... ] -->
     *        <input id="numeric" type="text" data-validate='[["required"], ["integer+commas"]]'/>
     *    </div>
     *    ...
     *
     *    <script type="text/javascript">
     *        N(".validator").cont({
     *            init: function(view, request) {
     *                N.validator(data, N(".validator-context", view)).validate();
     *            }
     *        });
     *    </script>
     *    ```
     *
     * To dynamically change the validation rules when specifying validation rules declaratively, reassign the validation rules to the "validate" data attribute of the input element as follows:
     *
     * ```
     * N("#numeric").data("validate", [["required"], ["integer"]])
     * ```
     *
     * @returns {ND.Validator} A new N.validate instance.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html
     */
    validator(rules?: N<HTMLElement[]> | HTMLElement | N.ValidationRuleObject | string): N.Validator;
    /**
     * Extracts data that matches the specified condition.
     *
     * @param {ND.ConditionCallback | string} condition - Specifies the filtering condition.
     *
     * If you specify a function, only the rows for which the function returns true are filtered.
     * ```
     * var fData = N.data.filter([
     *     { name: "John", age: 18 },
     *     { name: "Mike", age: 16 },
     *     { name: "Mike", age: 14 }
     * ], function(item) {
     *     return item.name === "Mike" && item.age === 16;
     * });
     *
     * console.log(fData); // [{ name: "Mike", age: 16 }]
     * ```
     *
     * If you specify a condition string, only the rows that match the condition are filtered.
     * ```
     * var fData = N.data.filter([
     *     { name: "John", age: 18 },
     *     { name: "Mike", age: 16 },
     *     { name: "Mike", age: 14 }
     * ], 'name === "Mike"');
     *
     * console.log(fData); // [{ name: "Mike", age: 16 }, { name: "Mike", age: 14 }]
     * ```
     * > Processing conditions with a function is faster than specifying them with a string.
     *
     * > Specifying conditions with a string does not support and(&&) or or(||) expressions and supports only a single condition expression.
     * @return {N<N.JSONObject[]>} A new JSON object array containing the elements that satisfy the provided condition.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0303.html&tab=html/naturaljs/refr/refr030302.html
     */
    datafilter(this: N<N.JSONObject[]>, condition: N.ConditionCallback | string): N<N.JSONObject[]>;
    /**
     * Sorts the data based on the specified "key" argument value.
     *
     * @param {string} key - The property name of the JSON object to be used as the sorting criteria
     * @param {string} [reverse] - If set to true, sorts in descending order.
     * @return {N<N.JSONObject[]>} A new JSON object array containing the sorted elements.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0303.html&tab=html/naturaljs/refr/refr030302.html
     */
    datasort(this: N<N.JSONObject[]>, key: string, reverse?: boolean): N<N.JSONObject[]>;
    /**
     * This class handles data synchronization logic for two-way data binding.
     */
    static ds: {
        instance(inst: N.Instance, isReg?: boolean): N.DataSync;
    };
    static formatter: {
        /**
         * Formatter(N.formatter) is a library that formats an input data set (array of JSON objects) and returns the formatted data set.
         * - Instead of using a ruleset, you can pass an element as an argument, where the element wraps elements with formatting rules declared in the data-format attribute. This will display the formatted string in those elements. If the element is a text input element, it will display the original string of the data when the cursor focuses in (focusin event), and display the formatted string when the cursor focuses out (focusout event).
         * - You can also format on a per-string basis rather than using a dataset.
         *
         * @param {N<N.JSONObject[]>} data - The data to be formatted.
         * @param {N<HTMLElement[]> | HTMLElement | N.FormatRuleObject | string} [rules] - Specifies formatting rules.
         * The formatting rule can be specified in two types as follows:
         * - If you specify the rules as an object option:
         *   ```
         *   // { "columnPropertyName": [["ruleName", arguments[0], arguments[1]...]] }
         *   new N.formatter(data, {
         *       "numeric": [["trimtoempty"], ["numeric", "#,###.##0000"]],
         *       "generic": [["trimtoempty"], ["generic", "@@ABCD"]],
         *       "limit": [["trimtoempty"], ["limit", "13", "..."]],
         *       "etc": [["date", 12]]
         *   }).format();
         *   ```
         * - If you specify the rules by providing a jQuery object which includes elements with data-validate attributes:
         *   ```
         *   ...
         *   <div class="formatter-context">
         *       <!-- [ ["ruleName", "arguments[0]", "arguments[1]"], ... ] -->
         *      <input id="limit" type="text" data-format='[["trimtoempty"], ["limit", "13", "..." ]]' />
         *   </div>
         *   ...
         *
         *   <script type="text/javascript">
         *       N(".formatter").cont({
         *           init: function(view, request) {
         *               N.formatter(data, N(".formatter-context", view)).format();
         *           }
         *       });
         *   </script>
         *   ```
         * If you set formatting rules declaratively and want to change the formatting rules dynamically, you just need to reassign the value of the "format" data attribute for the corresponding input element as follows:
         * ```
         * N("#limit").data("format", [["trimtoempty"]])
         * ```
         *
         * @returns {ND.Formatter} A new N.format instance.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html
         */
        new(
            data: N<N.JSONObject[]>,
            rules?: N<HTMLElement[]> | HTMLElement | N.FormatRuleObject | string,
        ): N.Formatter;
        /**
         * Adds commas(,) at thousand separators. It processes only the part before the decimal point, if present.
         *
         * @param {string} str - The string to be formatted.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        commas(str: string): string;
        /**
         * Converts to the South Korean resident registration number format.
         *
         * @param {string} str - The string to be formatted.
         * @param {[number, string]} args - Replaces the entered string with the specified character.
         * - args[0]: Length of string to replace
         * - args[1]: Character to replace
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        rrn(str: string, args: [number, string]): string;
        /**
         * Converts to the US Social Security number format.
         *
         * @param {string} str - The string to be formatted.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        ssn(str: string): string;
        /**
         * Converts to the South Korean business registration number format.
         *
         * @param {string} str - The string to be formatted.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        kbrn(str: string): string;
        /**
         * Converts to the South Korean corporate number format.
         *
         * @param {string} str - The string to be formatted.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        kcn(str: string): string;
        /**
         * Converts to uppercase.
         *
         * @param {string} str - The string to be formatted.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        upper(str: string): string;
        /**
         * Converts to lowercase.
         *
         * @param {string} str - The string to be formatted.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        lower(str: string): string;
        /**
         * Converts the first alphabetic character to uppercase.
         *
         * @param {string} str - The string to be formatted.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        capitalize(str: string): string;
        /**
         * Converts to the South Korean zip code format.
         *
         * @param {string} str - The string to be formatted.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        zipcode(str: string): string;
        /**
         * Converts to the South Korean phone number format.
         *
         * @param {string} str - The string to be formatted.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        phone(str: string): string;
        /**
         * Removes unnecessary zeros.
         *  - 0100.0 -> 100
         *  - 0100.10 -> 100.1
         *
         * @param {string} str - The string to be formatted.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        realnum(str: string): string;
        /**
         * Removes the first and last whitespace from a string. If the input string is null or undefined, it is converted to an empty string.
         *
         * @param {string} str - The string to be formatted.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        trimtoempty(str: string): string;
        /**
         * Removes the first and last whitespace from a string. If the input string is empty, null, or undefined, it is converted to 0.
         *
         * @param {string} str - The string to be formatted.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        trimtozero(str: string): string;
        /**
         * Removes the first and last whitespace from a string. If the input string is empty, null, or undefined, it is converted to valStr.
         *
         * @param {string} str - The string to be formatted.
         * @param {[string]} args - String to be replaced when the value is null or undefined
         *  - args[0]: String to replace
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        /* eslint-disable-next-line @definitelytyped/no-single-element-tuple-type */
        trimtoval(str: string, args: [string]): string;
        /**
         * Converts or formats a date string according to specified options and returns the formatted date string.
         *
         * The global date format can be set in the N.context.attr("data").formatter.date property of [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html&tab=html/naturaljs/refr/refr010204.html).
         *
         * @param {string} str - The string to be formatted.
         * @param {[number | string, "date" | "month", N.Options.Datepicker]} args - Specifies the date format and options for the Datepicker component applied to the element designated as the third argument of the function.
         *  - args[0]:: Specifies the date format in either a numeric or string format as follows:
         *    - number
         *      - 4: year
         *      - 6: year-month
         *      - 8: year-month-day
         *      - 10: year-month-day hour
         *      - 12: year-month-day hour:minute
         *      - 14: year-month-day hour:minute:second
         *    - string
         *      - Y: year (4 digits)
         *      - y: year (2 digits)
         *      - m: month
         *      - d: day
         *      - H: hour
         *      - i: minute
         *      - s: second
         *      ```
         *      "1999/12/31": "Y/m/d"
         *      "99/12/31": "y/m/d"
         *      "31/12": "d/m"
         *      "12/31/1999": "m/d/Y"
         *      "1999-12-31 12:01:59": "Y-m-d H:i:s"
         *      ```
         *  - args[1]:: If "date", a date picker is applied to the element specified as the third argument. If "month", a month picker is applied.
         *  - args[2]:: You can specify options to create the Datepicker for the element designated as the third argument of the function.
         * @param {N<HTMLElement[]>} [ele] - If this argument is specified, the N.datepicker component is automatically applied.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        date(
            str: string,
            args: [number | string, "date" | "month", N.Options.Datepicker],
            ele?: N<HTMLElement[]>,
        ): string;
        /**
         * Converts to a time format.
         *
         * @param {string} str - The string to be formatted.
         * @param {[number]} [args] - Specifies the time format.
         * number If you specify the length by type, it is converted as follows:
         *  - 2: hour
         *  - 4: hour:minute
         *  - 6: hour:minute:second
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        /* eslint-disable-next-line @definitelytyped/no-single-element-tuple-type */
        time(str: string, args?: [number]): string;
        /**
         * Cuts the string to a specified length.
         *
         * @param {string} str - The string to be formatted.
         * @param {[number, string]} args
         *  - args[0]: - String maximum length.
         *  - args[1]: - Character to be appended after cutting the string.
         * @param {N<HTMLElement[]>} ele - An element that will display the original, uncut string as the title attribute.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        limit(str: string, args: [number, string], ele: N<HTMLElement[]>): string;
        /**
         * Replaces a string with a specified string.
         *
         * @param {string} str - The string to be formatted.
         * @param {[number, string, boolean]} args
         *  - args[0]: - String to be replaced
         *  - args[1]: - String to replace
         *  - args[2]: - This is an argument used inside Formatter that is not generally used.
         * @param {N<HTMLElement[]>} [ele] - This is an argument used inside Formatter that is not generally used.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        replace(str: string, args: [string, number, boolean], ele?: N<HTMLElement[]>): string;
        /**
         * Fill with filler characters from the left to the specified length.
         *
         * @param {string} str - The string to be formatted.
         * @param {[number, string]} args
         *  - args[0]: - Length of string to be converted.
         *  - args[1]: - Filler character.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        lpad(str: string, args: [number, string]): string;
        /**
         * Fill with filler characters from the right to the specified length.
         *
         * @param {string} str - The string to be formatted.
         * @param {[number, string]} args
         *  - args[0]: - Length of string to be converted.
         *  - args[1]: - Filler character.
         * @return {string} The formatted string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        rpad(str: string, args: [number, string]): string;
        /**
         * Fill with filler characters from the right to the specified length.
         *
         * @param {string} str - The string to be masked.
         * @param {[ND.FormatMaskingRules, string]} args
         *  - args[0]: - Masking Type
         *    - "phone": Masks phone number.
         *    - "email": Masks email address.
         *    - "address": Masks address.
         *    - "name": Masks name.
         *    - "rrn": Masks South Korea's resident registration number.
         *  - args[1]: - Masking character.
         *              If not entered, it will be replaced with the "*" character.
         * @return {string} The masked string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        mask(str: string, args: [ND.FormatMaskingRules, string]): string;
        /**
         * Format the string using a user format.
         *
         * > The generic and numeric rules are developed based on the [Mask JavaScript API (v0.4b)](https://pengoworks.com/workshop/js/mask/) library.
         * > The date masking part has been removed, and functionality has been changed to add recognition for Korean characters and handling for values less than 0 (values after the decimal point), allowing * characters and space characters (existing * characters are converted to ~ characters).
         * > For detailed usage and examples, please refer to the link [here](https://pengoworks.com/workshop/js/mask/).
         *
         *  - #: Numbers, spaces
         *  - @: Korean characters (consonants/vowels), English letters, spaces
         *  - ~: Korean characters (consonants/vowels), English letters, numbers, spaces
         *
         * Example)
         * ```
         * mask: ~~~~'~-~~~
         * string: namesdan
         * result: name's-dan
         *
         * mask: (###) ###-####
         * string: 614-777-6094
         * result: (614) 777-6094
         *
         * mask: (###) ###-####
         * string: 6147776094
         * result: (614) 777-6094
         *
         * mask: (###) ###-####
         * string: 614.777.6094
         * result: (614) 777-6094
         *
         * mask: (###) ###-####
         * string: 6147a76094
         * result: 6147a76094
         *
         * mask: (###) #x*-####
         * string: 6147a76094
         * result: (614) 7a7-6094
         *
         * mask: ###.###.####
         * string: 614-777-6094
         * result: 614.777.6094
         *
         * mask: ###/###.####
         * string: 614-777-6094
         * result: 614/777.6094
         *
         * mask: phone !#: ###/###.####
         * string: 614-777-6094
         * result: phone !: 614/777.6094
         * ```
         * @param {string} str - The string to be masked.
         * @param {[string]} args
         *  - args[0]: - User format string
         * @return {string} The masked string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        /* eslint-disable-next-line @definitelytyped/no-single-element-tuple-type */
        generic(str: string, args: [string]): string;
        /**
         * Format a numeric string using a custom format.
         *
         * > The generic and numeric rules are developed based on the [Mask JavaScript API (v0.4b)](https://pengoworks.com/workshop/js/mask/) library.
         * > The date masking part has been removed, and functionality has been changed to add recognition for Korean characters and handling for values less than 0 (values after the decimal point), allowing * characters and space characters(existing * characters are converted to ~ characters).
         * > For detailed usage and examples, please refer to the link [here](https://pengoworks.com/workshop/js/mask/).
         *
         *  - #: Numbers, spaces
         *  - @: Korean characters (consonants/vowels), English letters, spaces
         *  - ~: Korean characters (consonants/vowels), English letters, numbers, spaces
         *
         * Example)
         * ```
         * mask: ~~~~'~-~~~
         * string: namesdan
         * result: name's-dan
         *
         * mask: (###) ###-####
         * string: 614-777-6094
         * result: (614) 777-6094
         *
         * mask: (###) ###-####
         * string: 6147776094
         * result: (614) 777-6094
         *
         * mask: (###) ###-####
         * string: 614.777.6094
         * result: (614) 777-6094
         *
         * mask: (###) ###-####
         * string: 6147a76094
         * result: 6147a76094
         *
         * mask: (###) #x*-####
         * string: 6147a76094
         * result: (614) 7a7-6094
         *
         * mask: ###.###.####
         * string: 614-777-6094
         * result: 614.777.6094
         *
         * mask: ###/###.####
         * string: 614-777-6094
         * result: 614/777.6094
         *
         * mask: phone !#: ###/###.####
         * string: 614-777-6094
         * result: phone !: 614/777.6094
         * ```
         * @param {string} str - The string to be masked.
         * @param {[string, "ceil" | "floor" | "round"]} args
         *  - args[0]: - User format string
         *  - args[1]: - Depending on the entered value, decimal points are processed as follows.
         *    - ceil: Unconditionally round up (decimal point processing possible)
         *    - floor: Unconditionally discard (decimal point processing possible)
         *    - round: Rounding (possible to handle decimal points)
         * @return {string} The masked string.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030106.html
         */
        numeric(str: string, args: [string, "ceil" | "floor" | "round"]): string;
    };

    static validator: {
        /**
         * Validator (N.validator) is a library that validates an input data set (array of JSON objects) and returns the result data set.
         * - Instead of a ruleset, if you pass an element that wraps input elements with validation rules declared in the data-validate attribute, it will validate the value entered in the element when the cursor focusout occurs on the input element. If validation fails, an error message is displayed in the form of a tooltip near the input element.
         * - Validation can also be performed on strings, not just datasets.
         *
         * @param {N<N.JSONObject[]>} data - The data to be validated.
         * @param {N<HTMLElement[]>|HTMLElement|ND.ValidationRuleObject|string} [rules] - Specifies the validation rules.
         * You can specify the validation rules in two ways as follows:
         * - Specifying rules as object options:
         *    ```
         *    // { "columnName": [["ruleName", arguments[0], arguments[1] ... ] }
         *    N.validator(data, {
         *        "numeric": [["required"], ["integer+commas"]],
         *        "generic": [["required"], ["korean"]],
         *        "limit": [["required"], ["alphabet"]]
         *    }).validate();
         *    ```
         *
         * - Specifying rules by passing a jQuery object that wraps elements with data-validate attributes:
         *   ```
         *    ...
         *    <div class="validator-context">
         *        <!-- [ ["ruleName", "ruleArguments[0]", "ruleArguments[1]"], ... ] -->
         *        <input id="numeric" type="text" data-validate='[["required"], ["integer+commas"]]'/>
         *    </div>
         *    ...
         *
         *    <script type="text/javascript">
         *        N(".validator").cont({
         *            init: function(view, request) {
         *                N.validator(data, N(".validator-context", view)).validate();
         *            }
         *        });
         *    </script>
         *    ```
         *
         * To dynamically change the validation rules when specifying validation rules declaratively, reassign the validation rules to the "validate" data attribute of the input element as follows:
         *
         * ```
         * N("#numeric").data("validate", [["required"], ["integer"]])
         * ```
         *
         * @returns {ND.Validator} A new N.validate instance.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html
         */
        new(
            data: N<N.JSONObject[]>,
            rules?: N<HTMLElement[]> | HTMLElement | N.ValidationRuleObject | string,
        ): N.Validator;
        /**
         * Checks required input.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        required(str: string): boolean;
        /**
         * Checks whether only English characters are entered.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        alphabet(str: string): boolean;
        /**
         * Checks whether only numbers (integers) are entered.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        integer(str: string): boolean;
        /**
         * Checks whether only Korean characters are entered.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        korean(str: string): boolean;
        /**
         * Checks whether only English characters and numbers (integers) are entered.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        alphabet_integer(str: string): boolean;
        /**
         * Checks whether only numbers (integers) and Korean characters are entered.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        integer_korean(str: string): boolean;
        /**
         * Checks whether only English and Korean characters are entered.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        alphabet_korean(str: string): boolean;
        /**
         * Checks whether only English characters, numbers (integers), and Korean characters are entered.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        alphabet_integer_korean(str: string): boolean;
        /**
         * Checks whether only numbers (integers) and dashes (-) are entered.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        dash_integer(str: string): boolean;
        /**
         * Checks whether only numbers (integers) and commas (,) are entered.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        commas_integer(str: string): boolean;
        /**
         * Checks whether only numbers (integers), commas (,), and dots (.) are entered.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        number(str: string): boolean;
        /**
         * Checks if it matches email address format.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        email(str: string): boolean;
        /**
         * Checks if it matches URL format.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        url(str: string): boolean;
        /**
         * Checks if it matches South Korea's postal code format.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        zipcode(str: string): boolean;
        /**
         * Checks whether the specified number of decimal places has been entered.
         *
         * @param {string} str - The string to be checked.
         * @param {[number]} args
         *  - args[0]: - Decimal point length.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        decimal(str: string, args: N.Primitive[]): boolean;
        /**
         * Checks if it matches the South Korea's phone number format.
         *
         * @param {string} str - The string to be checked.
         * @param {[boolean]} args
         *  - args[0]: - If true, true is returned even if only 1 of the last 4 digits of the phone number is entered.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        /* eslint-disable-next-line @definitelytyped/no-single-element-tuple-type */
        phone(str: string, args: [boolean]): boolean;
        /**
         * Checks if it matches the South Korea's resident registration number format.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        rrn(str: string): boolean;
        /**
         * Checks if it matches the U.S. Social Security number format.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        ssn(str: string): boolean;
        /**
         * Checks if it matches the South Korea's alien registration number format.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        frn(str: string): boolean;
        /**
         * Checks if it matches the South Korea's alien registration number or resident registration number format.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        frn_rrn(str: string): boolean;
        /**
         * Checks if it matches the South Korea's corporate number format.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        kbrn(str: string): boolean;
        /**
         * Checks if it matches the South Korea's business registration number format.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        kcn(str: string): boolean;
        /**
         * Checks if it matches the date format.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        date(str: string): boolean;
        /**
         * Checks if it matches the time format.
         *
         * @param {string} str - The string to be checked.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        time(str: string): boolean;
        /**
         * Checks whether the specified value has been entered.
         *
         * @param {string} str - The string to be checked.
         * @param {[string]} args
         *  - args[0]: String to compare.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        /* eslint-disable-next-line @definitelytyped/no-single-element-tuple-type */
        accept(str: string, args: [string]): boolean;
        /**
         * Checks whether an unspecified value has been entered.
         *
         * @param {string} str - The string to be checked.
         * @param {[string]} args
         *  - args[0]: String to compare.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        /* eslint-disable-next-line @definitelytyped/no-single-element-tuple-type */
        notaccept(str: string, args: [string]): boolean;
        /**
         * Checks whether the specified value is included.
         *
         * @param {string} str - The string to be checked.
         * @param {[string]} args
         *  - args[0]: String to compare.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        /* eslint-disable-next-line @definitelytyped/no-single-element-tuple-type */
        match(str: string, args: [string]): boolean;
        /**
         * Checks whether the specified value is not included.
         *
         * @param {string} str - The string to be checked.
         * @param {[string]} args
         *  - args[0]: String to compare.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        /* eslint-disable-next-line @definitelytyped/no-single-element-tuple-type */
        notmatch(str: string, args: [string]): boolean;
        /**
         * Checks whether the specified file extension has been entered.
         *
         * @param {string} str - The string to be checked.
         * @param {[string]} args
         *  - args[0]: String to compare.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        /* eslint-disable-next-line @definitelytyped/no-single-element-tuple-type */
        acceptfileext(str: string, args: [string]): boolean;
        /**
         * Checks whether an unspecified file extension has been entered.
         *
         * @param {string} str - The string to be checked.
         * @param {[string]} args
         *  - args[0]: String to compare.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        /* eslint-disable-next-line @definitelytyped/no-single-element-tuple-type */
        notacceptfileext(str: string, args: [string]): boolean;
        /**
         * Checks whether the value of the specified input element is equal to the value.
         *
         * @param {string} str - The string to be checked.
         * @param {[JQuery.Selector]} args
         *  - args[0]: jQuery selector string to select input element.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        /* eslint-disable-next-line @definitelytyped/no-single-element-tuple-type */
        equalTo(str: string, args: [JQuery.Selector]): boolean;
        /**
         * Checks whether the input string length is less than the specified length.
         *
         * @param {string} str - The string to be checked.
         * @param {[number]} args
         *  - args[0]: Maximum string length to allow.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        /* eslint-disable-next-line @definitelytyped/no-single-element-tuple-type */
        maxlength(str: string, args: [number]): boolean;
        /**
         * Checks whether the input string length is greater than the specified length.
         *
         * @param {string} str - The string to be checked.
         * @param {[number]} args
         *  - args[0]: Minimum string length to allow.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        /* eslint-disable-next-line @definitelytyped/no-single-element-tuple-type */
        minlength(str: string, args: [number]): boolean;
        /**
         * Checks whether the input string length is between the specified lengths.
         *
         * @param {string} str - The string to be checked.
         * @param {[number, number]} args
         *  - args[0]: Minimum string length to allow.
         *  - args[1]: Maximum string length to allow.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        rangelength(str: string, args: [number, number]): boolean;
        /**
         * Checks whether the byte length of input string is less than the specified length.
         *
         * @param {string} str - The string to be checked.
         * @param {[number, number]} args
         *  - args[0]: Maximum byte length to allow.
         *  - args[1]: This is the byte length of Hangul and Hangul special characters, excluding English characters, numbers, and basic special characters.
         *    > If not entered, the N.context.attr("core").charByteLength value from Config(natural.config.js) is applied.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        maxbyte(str: string, args: [number, number]): boolean;
        /**
         * Checks whether the byte length of input string is greater than the specified length.
         *
         * @param {string} str - The string to be checked.
         * @param {[number, number]} args
         *  - args[0]: Minimum byte length to allow.
         *  - args[1]: This is the byte length of Hangul and Hangul special characters, excluding English characters, numbers, and basic special characters.
         *    > If not entered, the N.context.attr("core").charByteLength value from Config(natural.config.js) is applied.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        minbyte(str: string, args: [number, number]): boolean;
        /**
         * Checks whether the byte length of input string is between the specified lengths.
         *
         * @param {string} str - The string to be checked.
         * @param {[number, number, number]} args
         *  - args[0]: Minimum byte length to allow.
         *  - args[1]: Maximum byte length to allow.
         *  - args[2]: This is the byte length of Hangul and Hangul special characters, excluding English characters, numbers, and basic special characters.
         *    > If not entered, the N.context.attr("core").charByteLength value from Config(natural.config.js) is applied.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        rangebyte(str: string, args: [number, number, number]): boolean;
        /**
         * Checks whether the input number value is less than the specified value.
         *
         * @param {string} str - The string to be checked.
         * @param {[number]} args
         *  - args[0]: Maximum number value to allow.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        maxvalue(str: string, args: [number, number]): boolean;
        /**
         * Checks whether the input number value is greater than the specified value.
         *
         * @param {string} str - The string to be checked.
         * @param {[number]} args
         *  - args[0]: Minimum number value to allow.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        minvalue(str: string, args: [number, number]): boolean;
        /**
         * Checks whether the input number value is between the specified values.
         *
         * @param {string} str - The string to be checked.
         * @param {[number, number]} args
         *  - args[0]: Minimum number value to allow.
         *  - args[1]: Maximum number value to allow.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        rangevalue(str: string, args: [number, number]): boolean;
        /**
         * Tests whether a string matches a given regular expression pattern.
         *
         * @param {string} str - The string to be tested against the regular expression.
         * @param {[string, string]} args
         *  - args[0]: Regular expression pattern.
         *  - args[1]: Flags used to define the search
         * behavior of the pattern.
         * @return {boolean} - Validation result.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030206.html
         */
        regexp(str: string, args: [string, string]): boolean;
    };
    static data: {
        /**
         * Extracts data that matches the specified condition.
         *
         * @param {N<N.JSONObject[]> | N.JSONObject[]} arr - The data to filter
         * @param {ND.ConditionCallback | string} condition - Specifies the filtering condition.
         *
         * If you specify a function, only the rows for which the function returns true are filtered.
         * ```
         * var fData = N.data.filter([
         *     { name: "John", age: 18 },
         *     { name: "Mike", age: 16 },
         *     { name: "Mike", age: 14 }
         * ], function(item) {
         *     return item.name === "Mike" && item.age === 16;
         * });
         *
         * console.log(fData); // [{ name: "Mike", age: 16 }]
         * ```
         *
         * If you specify a condition string, only the rows that match the condition are filtered.
         * ```
         * var fData = N.data.filter([
         *     { name: "John", age: 18 },
         *     { name: "Mike", age: 16 },
         *     { name: "Mike", age: 14 }
         * ], 'name === "Mike"');
         *
         * console.log(fData); // [{ name: "Mike", age: 16 }, { name: "Mike", age: 14 }]
         * ```
         * > Processing conditions with a function is faster than specifying them with a string.
         *
         * > Specifying conditions with a string does not support and(&&) or or(||) expressions and supports only a single condition expression.
         * @return {N<N.JSONObject[]>} A new JSON object array containing the elements that satisfy the provided condition.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0303.html&tab=html/naturaljs/refr/refr030302.html
         */
        filter(
            arr: N<N.JSONObject[]> | N.JSONObject[],
            condition: N.ConditionCallback | string,
        ): N<N.JSONObject[]> | N.JSONObject[];
        sortBy(key: string, reverse: 1 | -1): (a: number, b: number) => 1 | -1 | 0;
        /**
         * Sorts the data based on the specified "key" argument value.
         *
         * @param {N<N.JSONObject[]> | N.JSONObject[]} arr - Data to be sorted
         * @param {string} key - The property name of the JSON object to be used as the sorting criteria
         * @param {string} [reverse] - If set to true, sorts in descending order.
         * @return {N<N.JSONObject[]>} A new JSON object array containing the sorted elements.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0303.html&tab=html/naturaljs/refr/refr030302.html
         */
        sort(
            arr: N<N.JSONObject[]> | N.JSONObject[],
            key: string,
            reverse?: boolean,
        ): N<N.JSONObject[]> | N.JSONObject[];
    };
}

declare namespace N {
    interface Formatter {
        /**
         * Formats the data at the specified row according to the formatting rules.
         * 
         * @param {number} row - The row index to format.
         * @return {ND.FormatResultObject} An object containing the formatted values.
         */
        format(row: number): N.FormatResultObject;
        /**
         * Reverts a formatted value back to its original form.
         * 
         * @param {number} row - The row index containing the value to unformat.
         * @param {string} key - The property name of the value to unformat.
         * @return {NC.Primitive} The unformatted value.
         */
        unformat(row: number, key: string): N.Primitive;
    }

    interface Validator {
        /**
         * Validates the data at the specified row according to the validation rules.
         * 
         * @param {number} row - The row index to validate.
         * @return {ND.ValidateResultObject} An object containing the validation results.
         */
        validate(row: number): N.ValidateResultObject;
    }

    interface DataSync {
        viewContext: N<HTMLElement[]>;
        /**
         * Removes this DataSync instance from the data synchronization system.
         * 
         * @return {DataSync} The current DataSync instance for chaining.
         */
        remove(): DataSync;
        /**
         * Notifies all observers about a data change at the specified row and key.
         * 
         * @param {number} row - The row index where the data changed.
         * @param {string} key - The property name of the changed data.
         * @return {DataSync} The current DataSync instance for chaining.
         */
        notify(row: number, key: string): DataSync;
    }
}


declare namespace N {
    /* eslint-disable-next-line @definitelytyped/no-const-enum */
    const enum FormatRules {
        COMMAS = "commas",
        RRN = "rrn",
        SSN = "ssn",
        KBRN = "kbrn",
        KCN = "kcn",
        UPPER = "upper",
        LOWER = "lower",
        CAPITALIZE = "capitalize",
        ZIPCODE = "zipcode",
        PHONE = "phone",
        REALNUM = "realnum",
        TRIMTOEMPTY = "trimtoempty",
        TRIMTOZERO = "trimtozero",
        TRIMTOVAL = "trimtoval",
        DATE = "date",
        TIME = "time",
        LIMIT = "limit",
        REPLACE = "replace",
        LPAD = "lpad",
        RPAD = "rpad",
        MASK = "mask",
        GENERIC = "generic",
        NUMERIC = "numeric",
    }

    /* eslint-disable-next-line @definitelytyped/no-const-enum */
    const enum FormatMaskingRules {
        PHONE = "phone",
        EMAIL = "email",
        ADDRESS = "address",
        NAME = "name",
        RRN = "rrn",
    }

    /* eslint-disable-next-line @definitelytyped/no-const-enum */
    const enum ValidationRules {
        REQUIRED = "required",
        ALPHABET = "alphabet",
        INTEGER = "integer",
        KOREAN = "korean",
        ALPHABET_INTEGER = "alphabet_integer",
        INTEGER_KOREAN = "integer_korean",
        ALPHABET_KOREAN = "alphabet_korean",
        ALPHABET_INTEGER_KOREAN = "alphabet_integer_korean",
        DASH_INTEGER = "dash_integer",
        COMMAS_INTEGER = "commas_integer",
        NUMBER = "number",
        EMAIL = "email",
        URL = "url",
        ZIPCODE = "zipcode",
        DECIMAL = "decimal",
        PHONE = "phone",
        RRN = "rrn",
        SSN = "ssn",
        FRN = "frn",
        FRN_RRN = "frn_rrn",
        KBRN = "kbrn",
        KCN = "kcn",
        DATE = "date",
        TIME = "time",
        ACCEPT = "accept",
        MATCH = "match",
        ACCEPTFILEEXT = "acceptfileext",
        NOTACCEPT = "notaccept",
        NOTMATCH = "notmatch",
        NOTACCEPTFILEEXT = "notacceptfileext",
        EQUALTO = "equalTo",
        MAXLENGTH = "maxlength",
        MINLENGTH = "minlength",
        RANGELENGTH = "rangelength",
        MAXBYTE = "maxbyte",
        MINBYTE = "minbyte",
        RANGEBYTE = "rangebyte",
        MAXVALUE = "maxvalue",
        MINVALUE = "minvalue",
        RANGEVALUE = "rangevalue",
        REGEXP = "regexp",
    }

    interface FormatRuleObject {
        [key: string]: [FormatRules, ...NC.Primitive[]][];
    }

    interface ValidationRuleObject {
        [key: string]: [ValidationRules, ...NC.Primitive[]][];
    }

    interface FormatResultObject {
        [key: string]: string;
    }

    type ValidateResultObject = {
        [key: string]: {
            rule: string;
            result: boolean;
            msg: string | null;
        }[];
    }[];

    interface ConditionCallback {
        (item: object): boolean;
    }
}


declare class NU {
    /**
     * Create an object instance of Alert with the N() function.
     * ```
     * var alert = N(context).alert(opts|msg);
     * var alert = N(context).alert(opts|msg, vars);
     * ```
     *
     * @param {NU.Options.Alert | string} msg - Specifies an initialization option object for the component or a string representing the contents of the warning message.
     * @param {string[]} [vars] - This is an array of strings to replace the message variable with.
     * @returns {NU.Alert} An instance of an Alert object, configured according to the provided options.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040103.html
     */
    alert(this: N<HTMLElement[]>, msg: N.Options.Alert | string, vars?: string[]): N.Alert;
    /**
     * Creates an object instance of Button with the N() function.
     * ```
     * var button = N(context).button(opts);
     * ```
     *
     * @param {NU.Options.Button} [opts] - Specifies the initialization option object for the component.
     * @returns {NU.Button} An instance of a Button object, configured according to the provided options.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0402.html&tab=html/naturaljs/refr/refr040203.html
     */
    button(this: N<HTMLElement[]>, opts?: N.Options.Button): N.Button;
    /**
     * Creates an object instance of Datepicker with the N() function.
     * ```
     * var datepicker = N(context).datepicker(opts);
     * ```
     *
     * @param {NU.Options.Datepicker} [opts] - Specifies the initialization option object for the component.
     * @returns {NU.Datepicker} An instance of a Datepicker object, configured according to the provided options.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040303.html
     */
    datepicker(this: N<HTMLElement[]>, opts?: N.Options.Datepicker): N.Datepicker;
    /**
     * Creates an object instance of Popup with the N() function.
     * ```
     * var popup = N(context).popup(opts);
     * ```
     *
     * @param {NU.Options.Popup} [opts] - Specifies the initialization option object for the component.
     * @returns {NU.Popup} An instance of a Popup object, configured according to the provided options.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040403.html
     */
    popup(this: N<HTMLElement[]>, opts?: N.Options.Popup): N.Popup;
    /**
     * Creates an object instance of Tab with the N() function.
     * ```
     * var tab = N(context).tab(opts);
     * ```
     *
     * @param {NU.Options.Tab} [opts] - Specifies the initialization option object for the component.
     * @returns {NU.Tab} An instance of a Tab object, configured according to the provided options.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040503.html
     */
    tab(this: N<HTMLElement[]>, opts?: N.Options.Tab): N.Tab;
    /**
     * Creates a new Select instance.
     * ```
     * var select = N(data).select(opts);
     * var select = N(data).select(context);
     * ```
     *
     * @param {NU.Options.Select | N<HTMLElement[]>} [opts] - Component options or context element.
     * @returns {NU.Select} An instance of a Select object.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040603.html
     */
    select(this: N<N.JSONObject[]> | N.JSONObject[], opts?: N.Options.Select | N<HTMLElement[]>): N.Select;
    /**
     * Creates a new Form instance.
     * ```
     * var form = N(data).form(opts);
     * var form = N(data).form(context);
     * ```
     *
     * @param {NU.Options.Form | N<HTMLElement[]>} [opts] - Component options or context element.
     * @returns {NU.Form} An instance of a Form object.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040703.html
     */
    form(this: N<N.JSONObject[]> | N.JSONObject[], opts?: N.Options.Form | N<HTMLElement[]>): N.Form;
    /**
     * Creates a new List instance.
     * ```
     * var list = N(data).list(opts);
     * var list = N(data).list(context);
     * ```
     *
     * @param {NU.Options.List | N<HTMLElement[]>} [opts] - Component options or context element.
     * @returns {NU.List} An instance of a List object.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040803.html
     */
    list(this: N<N.JSONObject[]> | N.JSONObject[], opts?: N.Options.List | N<HTMLElement[]>): N.List;
    /**
     * Creates a new Grid instance.
     * ```
     * var grid = N(data).grid(opts);
     * var grid = N(data).grid(context);
     * ```
     *
     * @param {NU.Options.Grid | N<HTMLElement[]>} [opts] - Component options or context element.
     * @returns {NU.Grid} An instance of a Grid object.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040903.html
     */
    grid(this: N<N.JSONObject[]> | N.JSONObject[], opts?: N.Options.Grid | N<HTMLElement[]>): N.Grid;
    /**
     * Creates a new Pagination instance.
     * ```
     * var pagination = N(data).pagination(opts);
     * var pagination = N(data).pagination(context);
     * ```
     *
     * @param {NU.Options.Pagination | N<HTMLElement[]>} opts - Component options or context element.
     * @returns {NU.Pagination} An instance of a Pagination object.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041003.html
     */
    pagination(this: N<N.JSONObject[]> | N.JSONObject[], opts: N.Options.Pagination | N<HTMLElement[]>): N.Pagination;
    /**
     * Creates a new Tree instance.
     * ```
     * var tree = N(data).tree(opts);
     * var tree = N(data).tree(context);
     * ```
     *
     * @param {NU.Options.Tree | N<HTMLElement[]>} opts - Component options or context element.
     * @returns {NU.Tree} An instance of a Tree object.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041103.html
     */
    tree(this: N<N.JSONObject[]> | N.JSONObject[], opts: N.Options.Tree | N<HTMLElement[]>): N.Tree;

    static ui: {
        iteration: {
            render: (i: any, limit: any, delay: any, lastIdx: any, callType: any) => void;
            select: (compNm: any) => void;
            checkAll: (compNm: any) => void;
            checkSingle: (compNm: any) => void;
            move: (fromRow: any, toRow: any, compNm: any) => any;
            copy: (fromRow: any, toRow: any, compNm: any) => any;
        };
        draggable: {
            events: (eventNameSpace: any, startHandler: any, moveHandler: any, endHandler: any) => void;
            moveX: (x: any, min: any, max: any) => boolean;
            moveY: (y: any, min: any, max: any) => boolean;
        };
        scroll: {
            paging: (contextWrapEle: any, defSPSize: any, rowEleLength: any, rowTagName: any, bindOpt: any) => void;
        };
        utils: {
            wrapHandler: (opts: any, compNm: any, eventNm: any) => void;
            isTextInput: (tagName: any, type: any) => boolean;
        };
    };

    static alert: {
        /**
         * Creates an object instance of Alert.
         * ```
         * var alert = new N.alert(context, opts|msg);
         * var alert = new N.alert(context, opts|msg, vars);
         * ```
         *
         * @param {N<HTMLElement[]>} obj - Specifies the element on which Alert's modal overlay will be displayed.
         * @param {NU.Options.Alert | string} msg - Either an initialization option object that defines how the alert should behave, or a string representing the alert message content.
         * @param {string[]} [vars] - This is an array of strings to replace the message variable with.
         * @returns {NU.Alert} An instance of an Alert object, configured according to the provided parameters.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040103.html
         */
        new(obj: N<HTMLElement[]>, msg: N.Options.Alert | string, vars?: string[]): N.Alert;
        wrapEle(): void;
        resetOffSetEle(opts: N.Options.Alert): void;
        wrapInputEle(): void;
    };

    static button: {
        /**
         * Creates an object instance of Button.
         * ```
         * var button = new N.button(context, opts);
         * ```
         *
         * @param {N<HTMLElement[]>} obj - Specifies the context element to which the Button will be applied.
         * @param {NU.Options.Button} [opts] - Specifies the initialization option object for the component.
         * @returns {NU.Button} An instance of a Button object, configured according to the provided parameters.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0402.html&tab=html/naturaljs/refr/refr040203.html
         */
        new(obj: N<HTMLElement[]>, opts?: N.Options.Button): N.Button;
        wrapEle(): void;
    };

    static datepicker: {
        /**
         * Creates an object instance of Datepicker.
         * ```
         * var datepicker = new N.datepicker(context, opts);
         * ```
         *
         * @param {N<HTMLElement[]>} obj - Specifies the context element to which the Datepicker will be applied.
         * @param {NU.Options.Datepicker} [opts] - Specifies the initialization option object for the component.
         * @returns {NU.Datepicker} An instance of a Datepicker object, configured according to the provided parameters.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040303.html
         */
        new(obj: N<HTMLElement[]>, opts?: N.Options.Datepicker): N.Datepicker;
        checkMinMaxDate(): boolean;
        wrapEle(): void;
        createContents(): any;
        yearPaging(yearItems: N<HTMLElement[]>, currYear: number | string, addCnt: number, absolute?: boolean): void;
        selectItems(
            opts: N.Options.Datepicker,
            value: string,
            format: string,
            yearsPanel: N<HTMLElement[]>,
            monthsPanel: N<HTMLElement[]>,
            daysPanel: N<HTMLElement[]>,
        ): void;
    };

    static popup: {
        /**
         * Creates an object instance of Popup.
         * ```
         * var popup = new N.popup(context, opts);
         * ```
         *
         * @param {N<HTMLElement[]>} obj - Specifies the context element to which the Popup will be applied.
         * @param {NU.Options.Popup} [opts] - Specifies the initialization option object for the component.
         * @returns {NU.Popup} An instance of a Popup object, configured according to the provided parameters.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040403.html
         */
        new(obj: N<HTMLElement[]>, opts?: N.Options.Popup): N.Popup;
        wrapEle(): void;
        loadContent(callback: N.Callbacks.Popup.LoadContent): void;
        popOpen(onOpenData: any, cont: N.Objects.Controller.Object): void;
    };

    static tab: {
        /**
         * Creates an object instance of Tab.
         * ```
         * var tab = new N.tab(context, opts);
         * ```
         *
         * @param {N<HTMLElement[]>} obj - Specifies the context element to which the Tab will be applied.
         * @param {NU.Options.Tab} [opts] - Specifies the initialization option object for the component.
         * @returns {NU.Tab} An instance of a Tab object, configured according to the provided parameters.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040503.html
         */
        new(obj: N<HTMLElement[]>, opts?: N.Options.Tab): N.Tab;
        wrapEle(): void;
        wrapScroll(): void;
        loadContent(url: string, targetIdx: number, callback: N.Callbacks.Tab.LoadContent, isFirst: boolean): void;
    };

    static select: {
        /**
         * Creates a new Select instance.
         * ```
         * var select = new N.select(data, opts|context);
         * ```
         *
         * @param {N<N.JSONObject[]> | N.JSONObject[]} data - Specifies data to bind to the component.
         * @param {NU.Options.Select | N<HTMLElement[]} [opts] - Specifies the component's initialization options object or context element.
         * @returns {NU.Select} An instance of a Select object, configured according to the provided parameters.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040603.html
         */
        new(
            data: N<N.JSONObject[]> | N.JSONObject[],
            opts?: N.Options.Select | N<HTMLElement[]>,
        ): N.Select;
        wrapEle(): void;
    };

    static form: {
        /**
         * Creates a new Form instance.
         * ```
         * var form = new N.form(data, opts|context);
         * ```
         *
         * @param {N<N.JSONObject[]> | N.JSONObject[]} data - Specifies data to bind to the component.
         * @param {NU.Options.Form | N<HTMLElement[]} [opts] - Specifies the component's initialization options object or context element.
         * @returns {NU.Form} An instance of a Form object, configured according to the provided parameters.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040703.html
         */
        new(
            data: N<N.JSONObject[]> | N.JSONObject[],
            opts?: N.Options.Form | N<HTMLElement[]>,
        ): N.Form;
    };

    static list: {
        /**
         * Creates a new List instance.
         * ```
         * var list = new N.list(data, opts|context);
         * ```
         *
         * @param {N<N.JSONObject[]> | N.JSONObject[]} data - Specifies data to bind to the component.
         * @param {NU.Options.List | N<HTMLElement[]} [opts] - Specifies the component's initialization options object or context element.
         * @returns {NU.List} An instance of a List object, configured according to the provided parameters.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040803.html
         */
        new(
            data: N<N.JSONObject[]> | N.JSONObject[],
            opts?: N.Options.List | N<HTMLElement[]>,
        ): N.List;
        createScroll(): void;
        vResize(contextWrapEle: N<N.JSONObject[]>): void;
    };

    static grid: {
        /**
         * Creates a new Grid instance.
         * ```
         * var grid = new N.grid(data, opts|context);
         * ```
         *
         * @param {N<N.JSONObject[]> | N.JSONObject[]} data - Specifies data to bind to the component.
         * @param {NU.Options.Grid | N<HTMLElement[]} [opts] - Specifies the component's initialization options object or context element.
         * @returns {NU.Grid} An instance of a Grid object, configured according to the provided parameters.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040903.html
         */
        new(
            data: N<N.JSONObject[]> | N.JSONObject[],
            opts?: N.Options.Grid | N<HTMLElement[]>,
        ): N.Grid;
        tableCells(tbl: any, opt_cellValueGetter: any): any[][];
        tableMap(): N.Objects.Grid.TableMap;
        setTheadCellInfo(): void;
        removeColgroup(): void;
        fixColumn(): void;
        fixHeader(): void;
        vResize(gridWrap: N<HTMLElement[]>, contextWrapEle: N<HTMLElement[]>, tfootWrap: N<HTMLElement[]>): void;
        more(): void;
        resize(): void;
        sort(): void;
        dataFilter(): void;
        rowSpan(
            i: number,
            rowEle: N<HTMLElement[]>,
            bfRowEle: N<HTMLElement[]>,
            rowData: N.JSONObject,
            bfRowData: N.JSONObject,
            colId: string,
        ): void;
        paste(): void;
    };

    static pagination: {
        /**
         * Creates a new Pagination instance.
         * ```
         * var pagination = new N.pagination(data, opts|context);
         * ```
         *
         * @param {N<N.JSONObject[]> | N.JSONObject[]} data - Specifies data to bind to the component.
         * @param {NU.Options.Pagination | N<HTMLElement[]} [opts] - Specifies the component's initialization options object or context element.
         * @returns {NU.Pagination} An instance of a Pagination object, configured according to the provided parameters.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041003.html
         */
        new(
            data: N<N.JSONObject[]> | N.JSONObject[],
            opts?: N.Options.Pagination | N<HTMLElement[]>,
        ): N.Pagination;
        wrapEle: N.Objects.Pagination.LinkEles;
        changePageSet(
            linkEles: N.Objects.Pagination.LinkEles,
            opts: N.Options.Pagination,
            isRemake: boolean,
        ): N.Options.CurrPageNavInfo;
    };

    static tree: {
        /**
         * Creates a new Tree instance.
         * ```
         * var tree = new N.tree(data, opts|context);
         * ```
         *
         * @param {N<N.JSONObject[]> | N.JSONObject[]} data - Specifies data to bind to the component.
         * @param {NU.Options.Tree | N<HTMLElement[]} [opts] - Specifies the component's initialization options object or context element.
         * @returns {NU.Tree} An instance of a Tree object, configured according to the provided parameters.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041103.html
         */
        new(
            data: N<N.JSONObject[]> | N.JSONObject[],
            opts?: N.Options.Tree | N<HTMLElement[]>,
        ): N.Tree;
    };
}

declare namespace N {
    interface Alert {
        options: N.Options.Alert;
        /**
         * Returns the context element.
         *
         * @param {JQuery.Selector} [sel] - An optional jQuery selector to refine the context.
         * @return {N<HTMLElement[]>} Returns the context element, or the element matched within the context.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040105.html
         */
        context(sel?: JQuery.Selector): N<HTMLElement[]>;
        /**
         * Shows a message dialog box.
         *
         * @return {NU.Alert} Returns the `Alert` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040105.html
         */
        show(): N.Alert;
        /**
         * Hides the message dialog box.
         *
         * @return {NU.Alert} Returns the `Alert` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040105.html
         */
        hide(): N.Alert;
        /**
         * Removes all elements related to Alert.
         *
         * @return {NU.Alert} Returns the `Alert` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040105.html
         */
        remove(): N.Alert;
    }

    interface Button {
        options: N.Options.Button;
        /**
         * Returns the context element.
         *
         * @param {JQuery.Selector} [sel] - An optional jQuery selector to refine the context.
         * @return {N<HTMLElement[]>} Returns the context element, or the element matched within the context.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0402.html&tab=html/naturaljs/refr/refr040206.html
         */
        context(sel?: JQuery.Selector): N<HTMLElement[]>;
        /**
         * Disable the button.
         *
         * @return {NU.Button} Returns the `Button` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0402.html&tab=html/naturaljs/refr/refr040206.html
         */
        disable(): N.Button;
        /**
         * Enable the button.
         *
         * @return {NU.Button} Returns the `Button` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0402.html&tab=html/naturaljs/refr/refr040206.html
         */
        enable(): N.Button;
    }

    interface Datepicker {
        options: N.Options.Datepicker;
        /**
         * Returns the context element.
         *
         * @param {JQuery.Selector} [sel] - An optional jQuery selector to refine the context.
         * @return {N<HTMLElement[]>} Returns the context element, or the element matched within the context.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040306.html
         */
        context(sel?: JQuery.Selector): N<HTMLElement[]>;
        /**
         * Shows the Datepicker.
         *
         * @return {NU.Datepicker} Returns the `Datepicker` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040306.html
         */
        show(): N.Datepicker;
        /**
         * Hides the Datepicker.
         *
         * @return {NU.Datepicker} Returns the `Datepicker` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040306.html
         */
        hide(): N.Datepicker;
    }

    interface Popup {
        options: N.Options.Popup;
        /**
         * Returns the context element.
         *
         * @param {JQuery.Selector} [sel] - An optional jQuery selector to refine the context.
         * @return {N<HTMLElement[]>} Returns the context element, or the element matched within the context.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040405.html
         */
        context(sel?: JQuery.Selector): N<HTMLElement[]>;
        /**
         * Opens the Popup.
         *
         * @param {unknown} [onOpenData] - Optional data to be processed or used when the popup is opened.
         * > Pass onOpenData as the first argument to the onOpen function specified by the onOpen event option.
         * @return {NU.Popup} Returns the `Popup` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040405.html
         */
        open(onOpenData?: unknown): N.Popup;
        /**
         * Close the Popup.
         *
         * @param {unknown} [onCloseData] - Optional data to be processed or used when the popup is closed.
         * > Pass onCloseData as the first argument to the onClose function specified by the onClose event option.
         * @return {NU.Popup} Returns the `Popup` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040405.html
         */
        close(onCloseData?: unknown): N.Popup;
        /**
         * Removes all elements related to Popup.
         *
         * @return {NU.Popup} Returns the `Popup` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040405.html
         */
        remove(): N.Popup;
    }

    interface Tab {
        options: N.Options.Tab;
        /**
         * Returns the context element.
         *
         * @param {JQuery.Selector} [sel] - An optional jQuery selector to refine the context.
         * @return {N<HTMLElement[]>} Returns the context element, or the element matched within the context.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040506.html
         */
        context(sel?: JQuery.Selector): N<HTMLElement[]>;
        /**
         * Opens the specified tab.
         *
         * @param {number} idx - The index of the tab to open.
         * @param {unknown} [onOpenData] - Optional data to be processed or used when the tab is opened.
         * > Pass onOpenData as the first argument to the onOpen function specified by the onOpen event option.
         * @param {boolean} [isFirst] - This is an option used inside a component that is set to true when a tab is instantiated and the default active tab is automatically selected.
         * @return {NU.Tab} - Returns the `Tab` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040506.html
         */
        open(idx: number, onOpenData?: unknown, isFirst?: boolean): N.Tab;
        /**
         * Opens the specified tab.
         *
         * @param {number} [idx] - The index of the tab to open. If no arguments are specified, a status information object is returned.
         * @param {unknown} [onOpenData] - Optional data to be processed or used when the tab is opened.
         * > Pass onOpenData as the first argument to the onOpen function specified by the onOpen event option.
         * @param {boolean} [isFirst] - This is an option used inside a component that is set to true when a tab is instantiated and the default active tab is automatically selected.
         * @return {Object} If all arguments are not entered, the following tab status information is returned in object type.
         * @return {number} return.index - Index of the activated tab.
         * @return {N<HTMLElement[]>} return.tab - Activated tab navigation element.
         * @return {N<HTMLElement[]>} return.content - Activated tab content element.
         * @return {NA.Objects.Controller.Object} return.cont - Controller object of the activated tab content.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040506.html
         */
        open(idx?: number, onOpenData?: unknown, isFirst?: boolean): {
            index: number;
            tab: N<HTMLElement[]>;
            content: N<HTMLElement[]>;
            cont: N.Objects.Controller.Object;
        };
        /**
         * Disables the specified tab.
         *
         * @param {number} idx - The index of the tab to disable.
         * @return {NU.Tab} Returns the `Tab` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040506.html
         */
        disable(idx: number): N.Tab;
        /**
         * Enables the specified tab.
         *
         * @param {number} idx - The index of the tab to be enabled.
         * @return {NU.Tab} Returns the `Tab` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040506.html
         */
        enable(idx: number): N.Tab;
        /**
         * Returns the Controller object of the tab content.
         * > If the tab content is created internally or the preload option is false, undefined is returned because there is no Controller object.
         *
         * @param {number} [idx] - Specifies the tab index whose Controller object you want to retrieve. If omitted, the active Controller object is returned.
         * @return {NA.Objects.Controller.Object} The Controller object for the specified index.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040506.html
         */
        cont(idx?: number): N.Objects.Controller.Object;
    }

    interface Select {
        options: N.Options.Select;
        /**
         * Returns the latest data bound to the component.
         *
         * @param {true} selFlag - Depending on the argument values, it returns the following data:
         *  - undefined(If the selFlag option is not specified): Returns data of type `JSONObject[]`.
         *  - true: Extracts only the currently selected row data and returns it as `JSONObject[]` type.
         *  - false: Returns data of the original type of type `N<N.JSONObject[]>` bound to the component.
         *    > When binding data retrieved with the data method to another data-related component, you must set it to "false" to bind the original type of data to enable two-way data binding.
         * @return {JSONObject[]} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040605.html
         */
        data(selFlag: true): N.JSONObject[];
        /**
         * Returns the latest data bound to the component.
         *
         * @param {false} selFlag - Depending on the argument values, it returns the following data:
         *  - undefined(If the selFlag option is not specified): Returns data of type `JSONObject[]`.
         *  - true: Extracts only the currently selected row data and returns it as `JSONObject[]` type.
         *  - false: Returns data of the original type of type `N<N.JSONObject[]>` bound to the component.
         * @return {N<N.JSONObject[]>} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040605.html
         */
        data(selFlag: false): N<N.JSONObject[]>;
        /**
         * Returns the latest data bound to the component.
         *
         * @return {JSONObject[]} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040605.html
         */
        data(): N.JSONObject[];
        /**
         * Returns the context element.
         *
         * @param {JQuery.Selector} [sel] - An optional jQuery selector to refine the context.
         * @return {N<HTMLElement[]>} Returns the context element, or the element matched within the context.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040605.html
         */
        context(sel?: JQuery.Selector): N<HTMLElement[]>;
        /**
         * Binds data to the element specified by the context option.
         * > If the context element is a checkbox and is checked, the elements created when data is bound are also created in a checked state.
         *
         * > When data is bound to a radio or checkbox input element, the element set as context has an id attribute and a name attribute, and only the name attribute is added to the additionally created option element.
         * When binding an event to a created checkbox or radio, if you select an element with the id selector, the event is applied only to the first option element, so select the element with the name attribute.
         * ```
         * $("input[name='name']").on("click", function(e) { ... });
         * ```
         *
         * @param {N<N.JSONObject[]>} [data] - Specifies the data to bind.
         * @return {NU.Select} Returns the `Select` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040605.html
         */
        bind(data?: N<N.JSONObject[]> | N.JSONObject[]): N.Select;
        /**
         * Returns the index of the selected option.
         *
         * @return {number} Index of selected option
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040605.html
         */
        index(): number;
        /**
         * Select the option corresponding to the specified index.
         *
         * @param {number} idx - Index of the option to select
         * @return {NU.Select} Returns the `Select` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040605.html
         */
        index(idx: number): N.Select;
        /**
         * Returns the value of the selected option.
         *
         * @return {NC.Primitive | N.Primitive[]} Selected option value.
         */
        val(): N.Primitive | N.Primitive[];
        /**
         * Select the option corresponding to the specified value.
         *
         * @param {NC.Primitive | N.Primitive[]} [val] - Option value to select.
         * @return {NU.Select} Returns the `Select` instance for chaining.
         */
        val(val?: N.Primitive | N.Primitive[]): N.Select;
        /**
         * Removes option elements and row data objects equal to the value specified by the val argument..
         *
         * @param {NC.Primitive} val -
         * @return {NU.Select} Returns the `Select` instance for chaining.
         */
        remove(val: N.Primitive): N.Select;
        /**
         * Reset selection.
         *
         * @param {boolean} [selFlag] - For select elements, setting it to true will select nothing and setting it to false will select the default (first) option element.
         * @return {NU.Select} - Returns the `Select` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040605.html
         */
        reset(selFlag?: boolean): N.Select;
    }

    interface Form {
        options: N.Options.Form;
        /**
         * Returns the latest data bound to the component.
         *
         * @param {true} selFlag - Depending on the argument values, it returns the following data:
         *  - undefined(If the selFlag option is not specified): Returns data of type `JSONObject[]`.
         *  - true: Extracts only the currently selected row data and returns it as `JSONObject[]` type.
         *  - false: Returns data of the original type of type `N<N.JSONObject[]>` bound to the component.
         *    > When binding data retrieved with the data method to another data-related component, you must set it to "false" to bind the original type of data to enable two-way data binding.
         * @param {...string} cols - If you specify the property name of the data as an argument from the second argument to the nth argument of the data method, an object from which only the specified property value is extracted is returned.
         * ```
         * var formInst = N([]).form(".context")
         *     .bind(0, [{ col01: "", col02: "", col03: "", col04: "", col05: "", col06: "" }]);
         * formInst.data(true, "col01", "col02", "col03");
         *     // [{ col01: "", col02: "", col03: "" }]
         * ```
         * > This only works if you specify the first argument as true.
         * @return {JSONObject[]} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040706.html
         */
        data(selFlag: true, ...cols: string[]): N.JSONObject[];
        /**
         * Returns the latest data bound to the component.
         *
         * @param {true} selFlag - Depending on the argument values, it returns the following data:
         *  - undefined(If the selFlag option is not specified): Returns data of type `JSONObject[]`.
         *  - true: Extracts only the currently selected row data and returns it as `JSONObject[]` type.
         *  - false: Returns data of the original type of type `N<N.JSONObject[]>` bound to the component.
         *    > When binding data retrieved with the data method to another data-related component, you must set it to "false" to bind the original type of data to enable two-way data binding.
         * @return {JSONObject[]} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040706.html
         */
        data(selFlag: false): N<N.JSONObject[]>;
        /**
         * Returns the latest data bound to the component.
         *
         * @return {JSONObject[]} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040706.html
         */
        data(): N.JSONObject[];
        /**
         * Returns the index of the data bound to the Form from the bound data array.
         *
         * @param {string} [before] - If "before" is specified, the index of the data bound just before is returned.
         * @return {number} Row index.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040706.html
         */
        row(before?: "before"): number;
        /**
         * Returns the context element.
         *
         * @param {JQuery.Selector} [sel] - An optional jQuery selector to refine the context.
         * @return {N<HTMLElement[]>} Returns the context element, or the element matched within the context.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040706.html
         */
        context(sel?: JQuery.Selector): N<HTMLElement[]>;
        bindEvents: {
            validate(ele: N<HTMLElement[]>, opts: N.Options.Form, eleType: string, isTextInput: boolean): void;
            dataSync(ele: N<HTMLElement[]>, opts: N.Options.Form, vals: N.JSONObject, eleType: string): void;
            enterKey(ele: N<HTMLElement[]>, opts: N.Options.Form): void;
            format(ele: N<HTMLElement[]>, opts: N.Options.Form, eleType: string, key: string): void;
        };
        /**
         * Binds data to elements that have an id attribute value within the element specified by the context option.
         *
         * > If you change only the data and bind it again, N.form may not work properly.
         * When rebinding to a context element that has data bound to it, you must first run the unbind method and then run the bind method.
         *
         * @param {number} row - Specifies the row index of the data array to bind.
         * @param {N<N.JSONObject[]>} [data] - Specifies the data to bind.
         * @param {...string} [cols] - If you specify the property name of the data from the third to the nth argument of the bind method, only the elements whose property name and id attribute value match will be bound to the data.
         * ```
         * // Data to bind
         * var data = [{ col01: "", col02: "", col03: "", col04: "", col05: "", col06: "" }]
         * // Binds only to elements that have the id attribute values “col01”, “col02”, and “col03”.
         * formInstance.bind(0, data, "col01", "col02", "col03");
         * ```
         * ```
         * // After directly modifying the bound data, bind only to elements that have the id attribute values “col01”, “col02”, and “col03”.
         * var data = formInstance.data()[formInstance.row()]
         * data.col01 = "val";
         * data.col02 = "123";
         * data.col03 = "temp";
         * formInstance.bind(0, data, "col01", "col02", "col03");
         * ```
         * @return {NU.Form} Returns the `Form` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040706.html
         */
        bind(row: number, data?: N<N.JSONObject[]> | N.JSONObject[], ...cols: string[]): N.Form;
        /**
         * Add new row data.
         *
         * When creating row data, a data object is created with the id attribute name and value of the input elements in the context element.
         *
         * @param {number | N.JSONObject} [data] - If you specify a data object, the generated data and the specified data are merged and bound.
         * > If the data argument is of type number, it is specified as the row(args[1]) argument.
         * @param {number} [row] - If you specify the row index where new data will be added as the row argument, the row data will be added immediately before the specified row index.
         * @return {NU.Form} Returns the `Form` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040706.html
         */
        add(data?: number | N.JSONObject, row?: number): N.Form;
        /**
         * Removes the data object bound to the Form from the data array.
         * > If rowStatus is `insert`, remove the row data, otherwise change rowStatus to "delete".
         *
         * @return {NU.Form} Returns the `Form` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040706.html
         */
        remove(): N.Form;
        /**
         * Reverts to the state where the initial data was bound or the initial data state created when adding.
         *
         * @return {NU.Form} Returns the `Form` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040706.html
         */
        revert(): N.Form;
        /**
         * Returns validation results for all added/modified data.
         *
         * @return {boolean} Returns true if validation is successful, false if validation fails, and displays a failure message in a tooltip next to the corresponding input element.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040706.html
         */
        validate(): boolean;
        /**
         * Retrieves the property value of the data object bound to the component.
         *
         * @param {string} key - Property name of data object.
         * @return {NC.Primitive | N.Primitive[]} The value specified by the key argument.
         */
        val(key: string): N.Primitive | N.Primitive[];
        /**
         * Updates or adds property values of the data object bound to the component.
         *
         * @param {string} key - Property name of data object
         * @param {NC.Primitive | N.Primitive[]} [val] - Property value of data object
         * @param {boolean} [notify] - If set to false, data change notification will not be displayed to components referencing the same data.
         * @return {NU.Form} Returns the `Form` instance for chaining.
         */
        val(key: string, val: N.Primitive | N.Primitive[], notify?: boolean): N.Form;
        /**
         * Processes real-time data synchronization logic for two-way data binding between data components.
         *
         * @param {number} row - The index of the row to be updated.
         * @param {string} [key] - This is the column name of the row data to be updated.
         * @return {NU.Form} Returns the `Form` instance for chaining.
         */
        update(row: number, key?: string): N.Form;
    }

    interface List {
        options: N.Options.List;
        /**
         * The default row(li) element of a list. Create row elements by duplicating this element.
         */
        tempRowEle: N<HTMLElement[]>;
        /**
         * This is an element specified by the context option of the list component. An instance of the original context element is assigned to the processed element.
         */
        contextEle: N<HTMLElement[]>;
        /**
         * Returns the latest data bound to the component.
         *
         * @param {true} selFlag - Depending on the argument values, it returns the following data:
         *  - undefined(If the selFlag option is not specified): Returns data of type `JSONObject[]`.
         *  - false: Returns data of the original type of type `N<N.JSONObject[]>` bound to the component.
         *    > When binding data retrieved with the data method to another data-related component, you must set it to "false" to bind the original type of data to enable two-way data binding.
         *  - modified: Returns inserted, updated and deleted data as `JSONObject[]` type.
         *  - selected: When the select option or multiselect option is set, the selected data is returned as `JSONObject[]` type.
         *  - checked: When the checkAll option, checkAllTarget option, or checkOnlyTarget option is set, the checked data is returned as `JSONObject[]` type.
         *  - insert: Returns the inserted data as `JSONObject[]` type.
         *  - update: Returns the inserted data as `JSONObject[]` type.
         *  - delete: Returns the inserted data as `JSONObject[]` type.
         * @param {...string} cols - If you specify the property name of the data as an argument from the second argument to the nth argument of the data method, an object from which only the specified property value is extracted is returned.
         * ```
         * var listInst = N([]).list(".context")
         *     .bind([{ col01: "", col02: "", col03: "", col04: "", col05: "", col06: "" }]);
         * listInst.data("modified", "col01", "col02", "col03");
         *     // [{ col01: "", col02: "", col03: "" }]
         * ```
         * > This only works if the first argument is "modified", "selected", "checked", "insert", "update", or "delete".
         * @return {JSONObject[]} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        data(
            selFlag: "modified" | "selected" | "checked" | "insert" | "update" | "delete",
            ...cols: string[]
        ): N.JSONObject[];
        /**
         * Returns the latest data bound to the component.
         *
         * @param {true} selFlag - Depending on the argument values, it returns the following data:
         *  - undefined(If the selFlag option is not specified): Returns data of type `JSONObject[]`.
         *  - false: Returns data of the original type of type `N<N.JSONObject[]>` bound to the component.
         *    > When binding data retrieved with the data method to another data-related component, you must set it to "false" to bind the original type of data to enable two-way data binding.
         *  - modified: Returns inserted, updated and deleted data as `JSONObject[]` type.
         *  - selected: When the select option or multiselect option is set, the selected data is returned as `JSONObject[]` type.
         *  - checked: When the checkAll option, checkAllTarget option, or checkOnlyTarget option is set, the checked data is returned as `JSONObject[]` type.
         *  - insert: Returns the inserted data as `JSONObject[]` type.
         *  - update: Returns the inserted data as `JSONObject[]` type.
         *  - delete: Returns the inserted data as `JSONObject[]` type.
         * @return {JSONObject[]} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        data(selFlag: false): N<N.JSONObject[]>;
        /**
         * Returns the latest data bound to the component.
         *
         * @return {JSONObject[]} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        data(): N.JSONObject[];
        /**
         * Returns the context element.
         *
         * @param {JQuery.Selector} [sel] - An optional jQuery selector to refine the context.
         * @return {N<HTMLElement[]>} Returns the context element, or the element matched within the context.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        context(sel?: JQuery.Selector): N<HTMLElement[]>;
        /**
         * Returns the row element (li) of the element specified by the context option.
         *
         * If you modify the returned element and then run the bind function, rows will be created with the modified element.
         *
         * The contextBodyTemplate function allows you to modify row elements of N.list even after N.list has been initialized.
         *
         * @param {JQuery.Selector} [sel] - An optional jQuery selector to refine the context.
         * @return {N<HTMLElement[]>} The default tbody element of a table element or the element selected in the default tbody element of a table element is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        contextBodyTemplate(sel?: JQuery.Selector): N<HTMLElement[]>;
        /**
         * Returns the index of the selected row.
         * > To use the select method, the `select` or `multiselect` option must be set to true.
         *
         * @return {N<number[]>} Index of selected row
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        select(): number[];
        /**
         * Select a row.
         * > To use the select method, the `select` or `multiselect` option must be set to true.
         *
         * @param {number | number[]} row
         *  - number: Specifies the row index to select.
         *  - number[]: When selecting multiple items at once, specify the row index as an array.
         * @param {boolean} [isAppend] - If you do not enter it or enter false, all selected rows will be deselected and then selected again. If you enter true, the existing selected rows will be maintained and selected.
         * @return {NU.List} Returns the `List` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        select(row: number | number[], isAppend?: boolean): N.List;
        /**
         * Returns the index of the row where the checkbox elements specified by the `checkAllTarget` and `checkSingleTarget` options are checked.
         *
         * @return {N<number[]>} Index of checked row
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        check(): N<number[]>;
        /**
         * Checks the checkbox elements specified with the checkAllTarget` and `checkSingleTarget` options.
         *
         * @param {number | number[]} row
         *  - number: Specifies the row index to check.
         *  - number[]: When checking multiple items at once, specify the row index as an array.
         * @param {boolean} [isAppend] - If you do not enter it or enter false, all checked rows will be dechecked and then checked again. If you enter true, the existing checked rows will be maintained and checked.
         * @return {NU.List} Returns the `List` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        check(row: number | number[], isAppend?: boolean): N.List;
        /**
         * Binds data to elements with an id attribute value within the element specified by the context option and creates row elements equal to the length of data.
         *
         * @param {N<N.JSONObject[]>} [data] - Specifies the data to bind.
         * @param {"append" | "list.bind" | "list.update"} [callType]
         *  - append: Merges previously bound data and newly bound data and adds new row elements to previously created row elements.
         *  - list.bind: This is an option for processing status inside a component. Set opts.scrollPaging.idx to 0.
         *  - list.update: This is an option for processing status inside a component. This is a flag to branch the logic processed when called from the logic for two-way data binding(update function).
         * > When the "append" argument value is set, the scrollPaging.size option value is automatically set to 0, disabling the scroll paging feature.
         * @return {NU.List} Returns the `List` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        bind(data?: N<N.JSONObject[]> | N.JSONObject[], callType?: "append" | "list.bind" | "list.update"): N.List;
        /**
         * Add new row elements and data.
         *
         * When creating row data, a data object is created with the id attribute name and value of the input elements in the context element.
         *
         * @param {number | N.JSONObject} [data] - If you specify a data object, the generated data and the specified data are merged and bound.
         * > If the data argument is of type number, it is specified as the row(args[1]) argument.
         * @param {number} [row] - If you specify the row index where new data will be added as the row argument, the row data will be added immediately before the specified row index.
         * @return {NU.List} Returns the `List` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        add(data?: number | N.JSONObject, row?: number): N.List;
        /**
         * Removes the data object bound to the Form from the data array.
         * > If rowStatus is `insert`, remove the row data, otherwise change rowStatus to "delete".
         *
         * @param {number} [row] - Specifies the index of the row to remove.
         * @return {NU.List} Returns the `List` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        remove(row: number): N.List;
        /**
         * Reverts to the state where the initial data was bound or the initial data state created when adding.
         *
         * @param {number} [row] - Specifies the index of the row to remove. If not specified, reverts the entire row data.
         * @return {NU.List} Returns the `List` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        revert(row?: number): N.List;
        /**
         * Returns validation results for all added/modified data.
         *
         * @param {number} [row] - Specifies the index of the row to validation. If not specified, validates the entire row data.
         * @return {boolean} Returns true if validation is successful, false if validation fails, and displays a failure message in a tooltip next to the corresponding input element.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        validate(row?: number): boolean;
        /**
         * Retrieves the property value of the data object bound to the component.
         *
         * @param {number} row - The row index from which the value is to be retrieved.
         * @param {string} key - Property name of data object.
         * @return {NC.Primitive | N.Primitive[]} The value specified by the key argument.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        val(row: number, key: string): N.Primitive | N.Primitive[];
        /**
         * Updates or adds property values of the data object bound to the component.
         *
         * @param {number} row - The index of the row where the value is to be modified.
         * @param {string} key - Property name of data object
         * @param {NC.Primitive | N.Primitive[]} [val] - Property value of data object
         * @return {NU.List} Returns the `List` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        val(row: number, key: string, val: N.Primitive | N.Primitive[]): N.List;
        /**
         * Move element and row data from one location to another within a list.
         *
         * @param {number} fromRow - The index of the item to move from.
         * @param {number} toRow - The index of the new position for the item.
         * @return {NU.List} Returns the `List` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        move(fromRow: number, toRow: number): N.List;
        /**
         * Copy element and row data from one location to another within a list.
         *
         * @param {number} fromRow - The index of the item to copy from.
         * @param {number} toRow - The index of the new position for the item.
         * @return {NU.List} Returns the `List` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        copy(fromRow: number, toRow: number): N.List;
        /**
         * Processes real-time data synchronization logic for two-way data binding between data components.
         *
         * @param {number} row - The index of the row to be updated.
         * @param {string} [key] - This is the column name of the row data to be updated.
         * @return {NU.Form} Returns the `Form` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040806.html
         */
        update(row: number, key?: string): N.List;
    }

    interface Grid {
        options: N.Options.Grid;
        /**
         * The default row(tbody) element of a grid. Create row elements by duplicating this element.
         */
        tempRowEle: N<HTMLElement[]>;
        /**
         * It is a structured collection of elements that make up a table.
         */
        tableMap: N.Objects.Grid.TableMap;
        /**
         * These are thead elements of the table.
         */
        thead: N<HTMLElement[]>;
        /**
         * This is an element specified by the context option of the list component. An instance of the original context element is assigned to the processed element.
         */
        contextEle: N<HTMLElement[]>;
        /**
         * A collection of id values for elements for which the rowSpan property is defined.
         */
        rowSpanIds: N<string[]>;
        /**
         * Returns the latest data bound to the component.
         *
         * @param {true} selFlag - Depending on the argument values, it returns the following data:
         *  - undefined(If the selFlag option is not specified): Returns data of type `JSONObject[]`.
         *  - false: Returns data of the original type of type `N<N.JSONObject[]>` bound to the component.
         *    > When binding data retrieved with the data method to another data-related component, you must set it to "false" to bind the original type of data to enable two-way data binding.
         *  - modified: Returns inserted, updated and deleted data as `JSONObject[]` type.
         *  - selected: When the select option or multiselect option is set, the selected data is returned as `JSONObject[]` type.
         *  - checked: When the checkAll option, checkAllTarget option, or checkOnlyTarget option is set, the checked data is returned as `JSONObject[]` type.
         *  - insert: Returns the inserted data as `JSONObject[]` type.
         *  - update: Returns the inserted data as `JSONObject[]` type.
         *  - delete: Returns the inserted data as `JSONObject[]` type.
         * @param {...string} cols - If you specify the property name of the data as an argument from the second argument to the nth argument of the data method, an object from which only the specified property value is extracted is returned.
         * ```
         * var gridInst = N([]).grid(".context")
         *     .bind([{ col01: "", col02: "", col03: "", col04: "", col05: "", col06: "" }]);
         * gridInst.data("modified", "col01", "col02", "col03");
         *     // [{ col01: "", col02: "", col03: "" }]
         * ```
         * > This only works if the first argument is "modified", "selected", "checked", "insert", "update", or "delete".
         * @return {JSONObject[]} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        data(
            selFlag: "modified" | "selected" | "checked" | "insert" | "update" | "delete",
            ...cols: string[]
        ): N.JSONObject[];
        /**
         * Returns the latest data bound to the component.
         *
         * @param {true} selFlag - Depending on the argument values, it returns the following data:
         *  - undefined(If the selFlag option is not specified): Returns data of type `JSONObject[]`.
         *  - false: Returns data of the original type of type `N<N.JSONObject[]>` bound to the component.
         *    > When binding data retrieved with the data method to another data-related component, you must set it to "false" to bind the original type of data to enable two-way data binding.
         *  - modified: Returns inserted, updated and deleted data as `JSONObject[]` type.
         *  - selected: When the select option or multiselect option is set, the selected data is returned as `JSONObject[]` type.
         *  - checked: When the checkAll option, checkAllTarget option, or checkOnlyTarget option is set, the checked data is returned as `JSONObject[]` type.
         *  - insert: Returns the inserted data as `JSONObject[]` type.
         *  - update: Returns the inserted data as `JSONObject[]` type.
         *  - delete: Returns the inserted data as `JSONObject[]` type.
         * @return {JSONObject[]} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        data(selFlag: false): N<N.JSONObject[]>;
        /**
         * Returns the latest data bound to the component.
         *
         * @return {JSONObject[]} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        data(): N.JSONObject[];
        /**
         * Returns the context element.
         *
         * @param {JQuery.Selector} [sel] - An optional jQuery selector to refine the context.
         * @return {N<HTMLElement[]>} Returns the context element, or the element matched within the context.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        context(sel?: JQuery.Selector): N<HTMLElement[]>;
        /**
         * Returns the thead element of the table.
         *
         * @param {JQuery.Selector} [sel] - An optional jQuery selector to refine the context.
         * @return {N<HTMLElement[]>} The table's thead element or the element selected in the table's thead is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        contextHead(sel?: JQuery.Selector): N<HTMLElement[]>;
        /**
         * Returns the row element (tbody) of the element specified by the context option.
         *
         * If you modify the returned element and then run the bind function, rows will be created with the modified element.
         *
         * The contextBodyTemplate function allows you to modify row elements in N.grid even after N.grid has been initialized.
         *
         * @param {JQuery.Selector} [sel] - An optional jQuery selector to refine the context.
         * @return {N<HTMLElement[]>} The default tbody element of a table element or the element selected in the default tbody element of a table element is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        contextBodyTemplate(sel?: JQuery.Selector): N<HTMLElement[]>;
        /**
         * Returns the index of the selected row.
         * > To use the select method, the `select` or `multiselect` option must be set to true.
         *
         * @return {N<number[]>} Index of selected row
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        select(): number[];
        /**
         * Select a row.
         * > To use the select method, the `select` or `multiselect` option must be set to true.
         *
         * @param {number | number[]} row
         *  - number: Specifies the row index to select.
         *  - number[]: When selecting multiple items at once, specify the row index as an array.
         * @param {boolean} [isAppend] - If you do not enter it or enter false, all selected rows will be deselected and then selected again. If you enter true, the existing selected rows will be maintained and selected.
         * @return {NU.Grid} Returns the `Grid` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        select(row: number | number[], isAppend?: boolean): N.Grid;
        /**
         * Returns the index of the row where the checkbox elements specified by the `checkAllTarget` and `checkSingleTarget` options are checked.
         *
         * @return {N<number[]>} Index of checked row
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        check(): N<number[]>;
        /**
         * Checks the checkbox elements specified with the checkAllTarget` and `checkSingleTarget` options.
         *
         * @param {number | number[]} row
         *  - number: Specifies the row index to check.
         *  - number[]: When checking multiple items at once, specify the row index as an array.
         * @param {boolean} [isAppend] - If you do not enter it or enter false, all checked rows will be dechecked and then checked again. If you enter true, the existing checked rows will be maintained and checked.
         * @return {NU.Grid} Returns the `Grid` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        check(row: number | number[], isAppend?: boolean): N.Grid;
        /**
         * Binds data to elements with an id attribute value within the element specified by the context option and creates row elements equal to the length of data.
         *
         * @param {N<N.JSONObject[]>} [data] - Specifies the data to bind.
         * @param {"append" | "grid.bind" | "grid.update"} [callType]
         *  - append: Merges previously bound data and newly bound data and adds new row elements to previously created row elements.
         *  - grid.bind: This is an option for processing status inside a component. Set opts.scrollPaging.idx to 0.
         *  - grid.dataFilter: This is an option for processing status inside a component. This is a flag to branch the logic processed when called from the logic for the grid data filter function.
         *  - grid.sort: This is an option for processing status inside a component. This is a flag to branch the logic processed when called from the logic for the grid data sort function.
         *  - grid.update: This is an option for processing status inside a component. This is a flag to branch the logic processed when called from the logic for two-way data binding(update function).
         * > When the "append" argument value is set, the scrollPaging.size option value is automatically set to 0, disabling the scroll paging feature.
         * @return {NU.Grid} Returns the `Grid` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        bind(
            data?: N<N.JSONObject[]> | N.JSONObject[],
            callType?: "append" | "grid.bind" | "grid.dataFilter" | "grid.sort" | "grid.update",
        ): N.Grid;
        /**
         * Add new row elements and data.
         *
         * When creating row data, a data object is created with the id attribute name and value of the input elements in the context element.
         *
         * @param {number | N.JSONObject} [data] - If you specify a data object, the generated data and the specified data are merged and bound.
         * > If the data argument is of type number, it is specified as the row(args[1]) argument.
         * @param {number} [row] - If you specify the row index where new data will be added as the row argument, the row data will be added immediately before the specified row index.
         * @return {NU.Grid} Returns the `Grid` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        add(data?: number | N.JSONObject, row?: number): N.Grid;
        /**
         * Removes the data object bound to the Form from the data array.
         * > If rowStatus is `insert`, remove the row data, otherwise change rowStatus to "delete".
         *
         * @param {number} [row] - Specifies the index of the row to remove.
         * @return {NU.Grid} Returns the `Grid` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        remove(row: number): N.Grid;
        /**
         * Reverts to the state where the initial data was bound or the initial data state created when adding.
         *
         * @param {number} [row] - Specifies the index of the row to remove. If not specified, reverts the entire row data.
         * @return {NU.Grid} Returns the `Grid` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        revert(row?: number): N.Grid;
        /**
         * Returns validation results for all added/modified data.
         *
         * @param {number} [row] - Specifies the index of the row to validation. If not specified, validates the entire row data.
         * @return {boolean} Returns true if validation is successful, false if validation fails, and displays a failure message in a tooltip next to the corresponding input element.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        validate(row?: number): boolean;
        /**
         * Retrieves the property value of the data object bound to the component.
         *
         * @param {number} row - The row index from which the value is to be retrieved.
         * @param {string} key - Property name of data object.
         * @return {NC.Primitive | N.Primitive[]} The value specified by the key argument.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        val(row: number, key: string): N.Primitive | N.Primitive[];
        /**
         * Updates or adds property values of the data object bound to the component.
         *
         * @param {number} row - The index of the row where the value is to be modified.
         * @param {string} key - Property name of data object
         * @param {NC.Primitive | N.Primitive[]} [val] - Property value of data object
         * @return {NU.Grid} Returns the `Grid` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        val(row: number, key: string, val: N.Primitive | N.Primitive[]): N.Grid;
        /**
         * Move element and row data from one location to another within a list.
         *
         * @param {number} fromRow - The index of the item to move from.
         * @param {number} toRow - The index of the new position for the item.
         * @return {NU.Grid} Returns the `Grid` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        move(fromRow: number, toRow: number): N.Grid;
        /**
         * Copy element and row data from one location to another within a list.
         *
         * @param {number} fromRow - The index of the item to copy from.
         * @param {number} toRow - The index of the new position for the item.
         * @return {NU.Grid} Returns the `Grid` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        copy(fromRow: number, toRow: number): N.Grid;
        /**
         * Shows hidden columns again.
         *
         * @param {number} colIdxs - The indices of the columns to be shown.
         * @return {NU.Grid} - Returns the `Grid` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        show(colIdxs: number): N.Grid;
        /**
         * Hides the selected column.
         *
         * @param {number} colIdxs - The index of the column to be hidden.
         * @return {NU.Grid} Returns the `Grid` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        hide(colIdxs: number): N.Grid;
        /**
         * Processes real-time data synchronization logic for two-way data binding between data components.
         *
         * @param {number} row - The index of the row to be updated.
         * @param {string} [key] - This is the column name of the row data to be updated.
         * @return {NU.Form} Returns the `Grid` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040906.html
         */
        update(row: number, key?: string): N.Grid;
    }

    interface Pagination {
        options: N.Options.Pagination;
        linkEles: N.Objects.Pagination.LinkEles;
        /**
         * Returns the latest data bound to the component.
         *
         * @param {true} selFlag - Depending on the argument values, it returns the following data:
         *  - undefined(If the selFlag option is not specified): Returns data of type `JSONObject[]`.
         *  - false: Returns data of the original type of type `N<N.JSONObject[]>` bound to the component.
         *    > When binding data retrieved with the data method to another data-related component, you must set it to "false" to bind the original type of data to enable two-way data binding.
         * @return {JSONObject[]} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041006.html
         */
        data(selFlag: false): N<N.JSONObject[]>;
        /**
         * Returns the latest data bound to the component.
         *
         * @return {JSONObject[]} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041006.html
         */
        data(): N.JSONObject[];
        /**
         * Returns the context element.
         *
         * @param {JQuery.Selector} [sel] - An optional jQuery selector to refine the context.
         * @return {N<HTMLElement[]>} Returns the context element, or the element matched within the context.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041005.html
         */
        context(sel?: JQuery.Selector): N<HTMLElement[]>;
        /**
         * Creates a Pagination element by binding data to the element specified with the context option.
         *
         * @param {N<N.JSONObject[]> | number} [data] - Data to bind, or a number to set totalCount.
         * If the argument type is number, it is set to totalCount, and if the argument type is array type, it is set to data.
         * @param {number} [totalCount] - Specifies the total number of rows for pagination.
         * @return {NU.Pagination} Returns the `Pagination` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041005.html
         */
        bind(data?: N<N.JSONObject[]> | N.JSONObject[] | number, totalCount?: number): N.Pagination;
        /**
         * Returns the total count.
         *
         * @return {number} Total count of data to be displayed by pagination.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041005.html
         */
        totalCount(): number;
        /**
         * Specifies the Total count value.
         * > Since only the option value of N.pagination is changed, the bind method must be executed after executing this function for the changed value to be displayed in pagination.
         *
         * @param {number} totalCount - Total count of data to be displayed by pagination.
         * @return {NU.Pagination} Returns the `Pagination` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041005.html
         */
        totalCount(totalCount: number): N.Pagination;
        /**
         * Gets the currently selected page number.
         *
         * @return {number} Tpage number.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041005.html
         */
        pageNo(): number;
        /**
         * Sets the specified page number.
         * > Since only the option value of N.pagination is changed, the bind method must be executed after executing this function for the changed value to be displayed in pagination.
         *
         * @param {number} pageNo - page number.
         * @return {NU.Pagination} Returns the `Pagination` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041005.html
         */
        pageNo(pageNo: number): N.Pagination;
        /**
         * Gets the count per page value.
         *
         * @return {number} Count per page.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041005.html
         */
        countPerPage(): number;
        /**
         * Sets the specified count per page value.
         * > Since only the option value of N.pagination is changed, the bind method must be executed after executing this function for the changed value to be displayed in pagination.
         *
         * @param {number} countPerPage - Count per page.
         * @return {NU.Pagination} Returns the `Pagination` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041005.html
         */
        countPerPage(countPerPage: number): N.Pagination;
        /**
         * Gets the value of the count per page set.
         *
         * @return {number} Count per page set.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041005.html
         */
        countPerPageSet(): number;
        /**
         * Sets the specified count per page set.
         * > Since only the option value of N.pagination is changed, the bind method must be executed after executing this function for the changed value to be displayed in pagination.
         *
         * @param {number} countPerPageSet - count per page set.
         * @return {NU.Pagination} Returns the `Pagination` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041005.html
         */
        countPerPageSet(countPerPageSet: number): N.Pagination;
        /**
         * Returns a paging information object.
         *
         * @return {NU.Options.CurrPageNavInfo} currPageNavInfo object information.
         *  - pageNo: Current page number.
         *  - countPerPage: Row count per page.
         *  - countPerPageSet: Page count per page set.
         *  - currSelPageSet: Current page set number.
         *  - pageCount: Total page count.
         *  - pageSetCount: Total page set count.
         *  - totalCount: Total row count.
         *  - startPage: First page number in the current page set.
         *  - startRowIndex: First row index on the selected page.
         *  - startRowNum: First row number of the selected page.
         *  - endPage: Last page number in the current page set.
         *  - endRowIndex: Last row index on the selected page.
         *  - endRowNum: Last row number of the selected page.
         */
        currPageNavInfo(): N.Options.CurrPageNavInfo;
    }

    interface Tree {
        options: N.Options.Tree;
        /**
         * Returns the latest data bound to the component.
         *
         * @param {true} selFlag - Depending on the argument values, it returns the following data:
         *  - undefined(If the selFlag option is not specified): Returns data of type `JSONObject[]`.
         *  - false: Returns data of the original type of type `N<N.JSONObject[]>` bound to the component.
         *    > When binding data retrieved with the data method to another data-related component, you must set it to "false" to bind the original type of data to enable two-way data binding.
         *  - selected: Returns the data of the selected node as `JSONObject[]` type.
         *  - checked: Returns the data of the checked node as `JSONObject[]` type.
         *  - checkedInLastNode: Returns the data of the last node of all checked elements in `JSONObject[]` type.
         * @param {...string} cols - If you specify the property name of the data as an argument from the second argument to the nth argument of the data method, an object from which only the specified property value is extracted is returned.
         * ```
         * var treeInst = N([]).tree(".context")
         *     .bind([{ col01: "", col02: "", col03: "", col04: "", col05: "", col06: "" }]);
         * treeInst.data("checked", "col01", "col02", "col03");
         *     // [{ col01: "", col02: "", col03: "" }]
         * ```
         * > This only works if the first argument is "selected", "selected", "checked", or "checkedInLastNode".
         * @return {JSONObject[]} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041106.html
         */
        data(selFlag: "selected" | "checked" | "checkedInLastNode", ...cols: string[]): N.JSONObject[];
        /**
         * Returns the latest data bound to the component.
         *
         * @param {true} selFlag - Depending on the argument values, it returns the following data:
         *  - undefined(If the selFlag option is not specified): Returns data of type `JSONObject[]`.
         *  - false: Returns data of the original type of type `N<N.JSONObject[]>` bound to the component.
         *    > When binding data retrieved with the data method to another data-related component, you must set it to "false" to bind the original type of data to enable two-way data binding.
         *  - selected: Returns the data of the selected node as `JSONObject[]` type.
         *  - checked: Returns the data of the checked node as `JSONObject[]` type.
         *  - checkedInLastNode: Returns the data of the last node of all checked elements in `JSONObject[]` type.
         * ```
         * var treeInst = N([]).tree(".context")
         *     .bind([{ col01: "", col02: "", col03: "", col04: "", col05: "", col06: "" }]);
         * treeInst.data("checked", "col01", "col02", "col03");
         *     // [{ col01: "", col02: "", col03: "" }]
         * ```
         * > This only works if the first argument is "selected", "checked", or "checkedInLastNode".
         * @return {JSONObject[]} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041106.html
         */
        data(selFlag: false): N<N.JSONObject[]>;
        /**
         * Returns the latest data bound to the component.
         *
         * @return {JSONObject[]} The data currently bound to the component is returned.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041106.html
         */
        data(): N.JSONObject[];
        /**
         * Returns the context element.
         *
         * @param {JQuery.Selector} [sel] - An optional jQuery selector to refine the context.
         * @return {N<HTMLElement[]>} Returns the context element, or the element matched within the context.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041105.html
         */
        context(sel?: JQuery.Selector): N<HTMLElement[]>;
        /**
         * Creates a Tree within the element specified by the context option.
         *
         * @param {N<N.JSONObject[]>} [data] - Specifies the data to bind.
         * @return {NU.Tree} Returns the `Tree` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041105.html
         */
        bind(data?: N<N.JSONObject[]> | N.JSONObject[]): N.Tree;
        /**
         * Returns the selected node value.
         *
         * @return {NC.Primitive} Selected node value.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041105.html
         */
        select(): N.Primitive;
        /**
         * Select a node.
         *
         * @param {NC.Primitive} [val] - Specifies the node value to select.
         * @return {NU.Tree} Returns the `Tree` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041105.html
         */
        select(val?: N.Primitive): N.Tree;
        /**
         * Expand all tree nodes.
         *
         * @return {NU.Tree} Returns the `Tree` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041105.html
         */
        expand(): N.Tree;
        /**
         * Collapses all tree nodes.
         *
         * @param {boolean} isFirstNodeOpen - If set to true, all nodes except the first will be collapsed.
         * @return {NU.Tree} Returns the `Tree` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041105.html
         */
        collapse(isFirstNodeOpen?: boolean): N.Tree;
    }
}


declare namespace N {
    /* eslint-disable-next-line @definitelytyped/no-const-enum */
    const enum ButtonSize {
        NONE = "none",
        SMALLER = "smaller",
        SMALL = "small",
        MEDIUM = "medium",
        LARGE = "large",
        BIG = "big",
    }

    /* eslint-disable-next-line @definitelytyped/no-const-enum */
    const enum ButtonColor {
        NONE = "none",
        PRIMARY = "primary",
        PRIMARY_CONTAINER = "primary_container",
        SECONDARY = "secondary",
        SECONDARY_CONTAINER = "secondary_container",
        TERTIARY = "tertiary",
        TERTIARY_CONTAINER = "tertiary_container",
    }

    /* eslint-disable-next-line @definitelytyped/no-const-enum */
    const enum ButtonType {
        NONE = "none",
        FILLED = "filled",
        OUTLINED = "outlined",
        ELEVATED = "elevated",
    }

    namespace Options {
        interface Alert {
            /**
             * Specifies the area where the message dialog for Alert will be displayed.
             *
             * When the modal option is set to true, Alert's overlay element covers as much as the element specified by context.
             * > If you specify a window object, it will cover the entire screen, and if you enter a jquery selector or jQuery object, it will cover only the specified element.
             *
             * When you specify an input element(select, input, textarea, etc.), a message is displayed in a tooltip next to the input element.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            context?: Window | N<HTMLElement[]>;
            /**
             * Message content.
             *
             * > You can specify a message string, jQuery object, HTML string, or HTML element.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            msg: string | N<HTMLElement[]>;
            /**
             * Replaces the variable in the message with the entered value.
             * > Variables such as `{index}` declared in the message are replaced with the value corresponding to the index of the array set with the vars option.
             * ```
             * N(window).alert({
             *     msg: "{0} {1}-JS.",
             *     vars: ["Hello", "Natural"]
             * }).show();
             *
             * // Result message: "Hello Natural-JS"
             * ```
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            vars?: string[];
            /**
             * If set to true, the HTML in the message will be applied.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            html?: boolean;
            /**
             * Top position(px) of the message dialog.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            top?: number;
            /**
             * Left position(px) of the message dialog.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            left?: number;
            /**
             * Width of the message dialog.
             *  - number: When set to the number type, the entered number(px) is set as the width of the element.
             *  - N.EventHandlers.Alert.Width: When set to a function type, msgContext (element that covers the screen when the modal option is true) and msgContents (message content element) are passed as arguments, and the width of the element is set with the returned value.
             *    ```
             *    ...
             *    // Fill the width of the dialog to the screen
             *    width: function(msgContext, msgContents) {
             *        return $(window).width();
             *    },
             *    ...
             *    ```
             *
             * @default 0
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            width?: number | N.EventHandlers.Alert.Width;
            /**
             * Height of the content of the message dialog excluding the title area.
             *  - number: When set to the number type, the entered number (px) is set as the height of the element.
             *  - N.EventHandlers.Alert.Height: When set to a function, msgContext (the overlay element when modal is true) and msgContents (the message content element) are passed as arguments, and the element height is set to the returned value.
             *    ```
             *    ...
             *    // fill the height of the dialog to fill the screen
             *    height: function(msgContext, msgContents) {
             *        // Since msgContents are hidden when the message dialog is opened, we need to call the show() function and then get the height of the title area.
             *        return $(window).height() - msgContents.show().find(".msg_title_box__").height();
             *    },
             * ...
             * ```
             *
             * @default 0
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            height?: number | N.EventHandlers.Alert.Height;
            /**
             * Sets the title of the message dialog box. If not set, the title bar will not be created.
             * > It can also be set in the title attribute of the context HTML element.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            title?: string;
            /**
             * If set to false, elements related to the default button(OK/Cancel button) will not be created.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            button?: boolean;
            /**
             * Defines the options of the Button component applied to the confirmation button of the message dialog.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            okButtonOpts?: N.Options.Button | null;
            /**
             * Defines the options of the Button component applied to the cancel button of the message dialog.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            cancelButtonOpts?: N.Options.Button | null;
            /**
             * Set whether to hide or remove dialog box elements when the message dialog box is closed.
             *  - hide: Hides the message dialog element to maintain its previous state.
             *  - remove: Reset the state by removing the message dialog element.
             *
             * @default "remove"
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            closeMode?: "hide" | "remove";
            /**
             * If set to true, it creates an overlay element that covers the element specified by context, blocking all events except the content of the message dialog box.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            modal?: boolean;
            /**
             * If set to false, clicking on the msgContext (the element that covers the screen when the modal option is true) will not close the message dialog.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            overlayClose?: boolean;
            /**
             * Specifies the background color of msgContext(the element that covers the screen when the modal option is true).
             * It can be defined as the color property value of CSS.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            overlayColor?: "string" | null;
            /**
             * If set to false, pressing the ESC key will not close the message dialog.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            escClose?: boolean;
            /**
             * If set to true it will show OK/Cancel buttons, if set to false it will only show OK buttons.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            confirm?: boolean;
            /**
             * If set to true, the message dialog will always appear on top.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            alwaysOnTop?: boolean;
            /**
             * When applying the alwaysOnTop option, specify target elements for calculating the top z-index.
             * > Specified with jQuery selector syntax.
             *
             * > When Alert or Popup related elements are hidden by other elements, add a selector for the element that is being hidden.
             *
             * @default "div, span, ul, p, nav, article, section, header, footer, aside"
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            alwaysOnTopCalcTarget?: string;
            /**
             * If set to false, the block overlay will not be resized and the message dialog will be repositioned automatically when the browser resizes or the height of the parent content changes dynamically.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            dynPos?: boolean;
            /**
             * If set to true, disables window scrolling in the browser when scrolling with the mouse wheel over message dialog elements.
             *
             * Prevents the browser's default behavior of scrolling the browser window up or down the first or last time the message dialog element is scrolled.
             * > This only works when the modal option is set to true.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            windowScrollLock?: boolean;
            /**
             * If set to true, the message dialog can be dragged by the title bar.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            draggable?: boolean;
            /**
             * If set to false, the message dialog will not automatically be moved inward when dropped off-screen.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            draggableOverflowCorrection?: boolean;
            /**
             * Specifies where the message dialog box will move inward when dropped off the screen.
             * > If the message dialog box does not return completely inside and a scroll bar appears on the screen, correct the position of the message dialog box by increasing or decreasing it by 1.
             *
             * @default { top: 0, bottom: 0, left: 0, right: 0 }
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            draggableOverflowCorrectionAddValues?: {
                top?: number;
                bottom?: number;
                left?: number;
                right?: number;
            };
            /**
             * When set to true, saves memory usage by removing unnecessary reference elements.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            saveMemory?: boolean;
            /**
             * Defines an event handler that runs when the OK button is clicked.
             * ```
             * onOk: function(msgContext, msgContents) {
             *     // this: Alert instance
             *     // msgContext: Message overlay element
             *     // msgContents: Message dialog element
             * }
             * ```
             * > Returning 0 only executes the event handler and does not close the dialog box.
             *
             * > This works on the OK button that is created when the button option is set to true.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            onOk?: N.EventHandlers.Alert.OnOk | null;
            /**
             * Define an event handler that runs when the message dialog is closed by clicking the Cancel button, clicking the X button, clicking the message overlay element, or pressing the ESC key.
             * ```
             * onCancel: function(msgContext, msgContents) {
             *     // this: Alert instance
             *     // msgContext: Message overlay element
             *     // msgContents: Message dialog element
             * }
             * ```
             * > Returning 0 only executes the event handler and does not close the message dialog.
             *
             * > This works on the cancel button created when the button option is set to true.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            onCancel?: N.EventHandlers.Alert.OnCancel | null;
            /**
             * Defines an event handler that runs before the message dialog is displayed.
             * ```
             * onBeforeShow: function(msgContext, msgContents) {
             *     // this: Alert instance
             *     // msgContext: Message overlay element
             *     // msgContents: Message dialog element
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            onBeforeShow?: N.EventHandlers.Alert.OnBeforeShow | null;
            /**
             * Defines an event handler that runs after the message dialog is displayed.
             * ```
             * onShow: function(msgContext, msgContents) {
             *     // this: Alert instance
             *     // msgContext: Message overlay element
             *     // msgContents: Message dialog element
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            onShow?: N.EventHandlers.Alert.OnShow | null;
            /**
             * Defines an event handler that runs before the message dialog is hidden.
             * ```
             * onBeforeHide: function(msgContext, msgContents) {
             *     // this: Alert instance
             *     // msgContext: Message overlay element
             *     // msgContents: Message dialog element
             * }
             * ```
             * > If the closeMode option is set to hide, the onBeforeHide event will not fire.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            onBeforeHide?: N.EventHandlers.Alert.OnBeforeHide | null;
            /**
             * Defines an event handler that runs after the message dialog is hidden.
             * ```
             * onHide: function(msgContext, msgContents) {
             *     // this: Alert instance
             *     // msgContext: Message overlay element
             *     // msgContents: Message dialog element
             * }
             * ```
             * > If the closeMode option is set to hide, the onHide event will not fire.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            onHide?: N.EventHandlers.Alert.OnHide | null;
            /**
             * Defines an event handler that runs before the message dialog is removed.
             * ```
             * onBeforeRemove: function(msgContext, msgContents) {
             *     // this: Alert instance
             *     // msgContext: Message overlay element
             *     // msgContents: Message dialog element
             * }
             * ```
             * > If the closeMode option is set to hide, the onBeforeRemove event will not fire.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            onBeforeRemove?: N.EventHandlers.Alert.OnBeforeRemove | null;
            /**
             * Defines an event handler that runs after the message dialog is removed.
             * ```
             * onRemove: function(msgContext, msgContents) {
             *     // this: Alert instance
             *     // msgContext: Message overlay element
             *     // msgContents: Message dialog element
             * }
             * ```
             * > If the closeMode option is set to hide, the onRemove event will not fire.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0401.html&tab=html/naturaljs/refr/refr040104.html
             */
            onRemove?: N.EventHandlers.Alert.OnRemove | null;
            isInput?: boolean;
            isWindow?: boolean;
        }

        interface Button {
            /**
             * Specifies the context element to which the Button will be applied.
             *
             * Button's context element must be written with `a`, `button`, or `input[type=button]` tag.
             * > Buttons can select multiple elements at once and specify them as context.
             * ```
             * <a class="button-context" data-opts='{ "size": "big" }'>Button</a>
             * <input class="button-context" type="button" value="Button" data-opts='{ "color": "primary" }'>
             * <button class="button-context" data-opts='{ "color": "primary", "size": "large" }'>Button</button>
             * ```
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0402.html&tab=html/naturaljs/refr/refr040204.html
             */
            context?: N<HTMLElement[]>;
            /**
             * Set the size of the button.
             *
             * The size can be one of "none", "smaller", "small", "medium", "large", or "big".
             *
             * @default "none"
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0402.html&tab=html/naturaljs/refr/refr040204.html
             */
            size?: ButtonSize;
            /**
             * X
             * Sets the color of the button.
             *
             * The color can be one of the following: "none", "primary", "primary_container", "secondary", "secondary_container", "tertiary", "tertiary_container".
             *
             * Naming and default values for button colors are based on [Color roles in Material Design 3](https://m3.material.io/styles/color/roles).
             *
             * To change the style of the button, simply edit the class starting with "btn_" in the natural.ui.css file.
             * ```
             * a.btn_{color}__,input[type='button'].btn_{color}__,button.btn_{color}__ {
             *     color: var(--md-sys-color-on-tertiary);
             *     background-color: var(--md-sys-color-tertiary);
             *     border: 1px solid var(--md-sys-color-tertiary);
             * }
             * ```
             *
             * @default "none"
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0402.html&tab=html/naturaljs/refr/refr040204.html
             */
            color?: ButtonColor;
            /**
             * Configures whether the button should have a filled background or just an outline.
             *
             * The type can be one of "none", "filled", "outlined", or "elevated".
             *
             * The colors for "filled" and "outlined" types are determined by the `color` option. If the `color` option is set to "none", the button's background or outline will not be displayed.
             *
             * @default "none"
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0402.html&tab=html/naturaljs/refr/refr040204.html
             */
            type?: ButtonType;
            /**
             * If set to true, the button will be created in a disabled state.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0402.html&tab=html/naturaljs/refr/refr040204.html
             */
            disable?: boolean;
            /**
             * Defines the event handler that is executed before the button options are applied.
             *
             * > This can be used when utilizing an external button library, to add necessary HTML elements inside or outside the button element, or to edit the HTML elements for other purposes.
             * ```
             * onBeforeCreate: function(context, opts) {
             *     // this: Button instance
             *     // context: context element
             *     // opts: The options specified when the button is created
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0402.html&tab=html/naturaljs/refr/refr040204.html
             */
            onBeforeCreate?: N.EventHandlers.Button.OnBeforeCreate | null;
            /**
             * Defines the event handler that is executed after the button options are applied.
             *
             * > This can be used when utilizing an external button library, to define effect events for the button element or to process the button for other purposes.
             * ```
             * onCreate: function(context, opts) {
             *     // this: Button instance
             *     // context: context element
             *     // opts: The options specified when the button is created
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0402.html&tab=html/naturaljs/refr/refr040204.html
             */
            onCreate?: N.EventHandlers.Button.OnCreate | null;
        }

        interface Datepicker {
            /**
             * Specifies the input element to which the Datepicker will be applied.
             * ```
             * <input class="datepicker-context" type="text">
             * ```
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            context?: N<HTMLElement[]>;
            /**
             * Datepicker container element.
             *
             * @default N('<div class="datepicker__"></div>')
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            contents?: N<HTMLElement[]>;
            /**
             * If set to true, a Monthpicker will be displayed where only the year and month can be selected.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            monthonly?: boolean;
            /**
             * If set to false, the Datepicker will not be displayed when the cursor is focused on the input element.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            focusin?: boolean;
            /**
             * If set to top, the year selection element will be created at the top.
             *
             * @default "left"
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            yearsPanelPosition?: "left" | "top";
            /**
             * If set to top, the month selection element will be created at the top.
             *
             * @default "left"
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            monthsPanelPosition?: "left" | "top";
            /**
             * When the yearsPanelPosition option value is "top", sets the number of previous years that can be selected.
             *
             * @default 200
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            minYear?: number;
            /**
             * When the yearsPanelPosition option value is "top", sets the number of future years that can be selected.
             *
             * @default 200
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            maxYear?: number;
            /**
             * If set to true, when the year changes, the changed date will be reflected immediately in the input element.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            yearChangeInput?: boolean;
            /**
             * If set to true, when the month changes, the changed date will be immediately reflected in the input element.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            monthChangeInput?: boolean;
            /**
             * If set to true, the month will change when you touch and drag left or right.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            touchMonthChange?: boolean;
            /**
             * If set to true, the month will change when you scroll the mouse wheel.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            scrollMonthChange?: boolean;
            /**
             * If you select or enter a date earlier than the set date, input will be blocked.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            minDate?: string;
            /**
             * If you select or enter a date after the set date, input will be blocked.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            maxDate?: string;
            /**
             * If you configure the holiday option, the Datepicker will display holidays.
             *
             * Holidays can be configured using `repeat` and `once` objects as shown below:
             * ```
             * {
             *     "repeat": {
             *         "0619": "Holiday1",
             *         "0620": "Holiday3",
             *         "0621": ["Holiday6", "Holiday7"],
             *         "0622": ["Holiday9", "Holiday10"]
             *     },
             *     "once": {
             *         "20200619": "Holiday2",
             *         "20200620": ["Holiday4", "Holiday5"],
             *         "20200621": "Holiday8",
             *         "20200622": ["Holiday11", "Holiday12"]
             *     }
             * }
             * ```
             * The `repeat` object specifies holidays that recur every year by providing the month and date (without the year).
             * The `once` object specifies holidays that do not recur every year and requires the full date in `YYYYMMDD` format.
             *
             * If there are multiple holidays on the same date, you can specify multiple holiday names as an array.
             *
             * You can configure this in the `N.context.attr("ui").datepicker.holiday` property of the [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html&tab=html/naturaljs/refr/refr010205.html) so that it is applied to all Datepickers:
             * ```
             * N.comm("getHolidayList.json").submit(function(data) {
             *     var once = {};
             *     N(data).each(function() {
             *         once[this.holidayDate] = this.holidayName;
             *     });
             *     if (N.context.attr("ui").datepicker.holiday === undefined) {
             *         N.context.attr("ui").datepicker.holiday = {};
             *     }
             *     N.context.attr("ui").datepicker.holiday.once = once;
             * });
             * ```
             * > Elements marked as holidays will have an additional class attribute value of `datepicker_holiday__`.
             *
             * @default { "repeat": null, "once": null }
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            holiday?: {
                "repeat"?: {
                    [key: string]: string | string[];
                } | null;
                "once"?: {
                    [key: string]: string | string[];
                } | null;
            };
            /**
             * Defines an event handler that is executed when the year is changed.
             * ```
             * onChangeYear: function(context, year, e) {
             *     // this: Datepicker instance
             *     // context: context element
             *     // year: selected year
             *     // e: event object
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            onChangeYear?: N.EventHandlers.Datepicker.OnChangeYear | null;
            /**
             * Defines an event handler that is executed when the month is changed.
             * ```
             * onChangeMonth: function(context, month, year, e) {
             *     // this: Datepicker instance
             *     // context: context element
             *     // month: selected month
             *     // year: selected year
             *     // e: event object
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            onChangeMonth?: N.EventHandlers.Datepicker.OnChangeMonth | null;
            /**
             * Defines the event handler that is executed when a date or a month (if the `monthonly` option is set to true) is selected.
             * ```
             * onSelect: function(context, selDate, monthonly) {
             *     // this: Datepicker instance
             *     // context: context element
             *     // selDate: Selected date as a Date object
             *     //      selDate = {
             *     //          obj: Date object,
             *     //          format: Date format (Refer to Formatter > Format Rule List Tab > "Specify a date format rule as a string" for "date" rule)
             *     //      }
             *     //      selDate.obj.formatDate("Y-m-d") => "2024-09-26";
             *     // monthonly: value of the monthonly option
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            onSelect?: N.EventHandlers.Datepicker.OnSelect | null;
            /**
             * Defines the event handler that is executed before the date picker is displayed.
             * ```
             * onBeforeShow: function(context, contents) {
             *     // this: Datepicker instance
             *     // context: context element
             *     // contents: Datepicker panel element
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            onBeforeShow?: N.EventHandlers.Datepicker.OnBeforeShow | null;
            /**
             * Defines an event handler that runs after the datepicker is displayed.
             * ```
             * onShow: function(context, contents) {
             *     // this: Datepicker instance
             *     // context: context element
             *     // contents: Datepicker panel element
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            onShow?: N.EventHandlers.Datepicker.OnShow | null;
            /**
             * Defines an event handler that runs before the datepicker is closed.
             * ```
             * onBeforeHide: function(context, contents) {
             *     // this: Datepicker instance
             *     // context: context element
             *     // contents: Datepicker panel element
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            onBeforeHide?: N.EventHandlers.Datepicker.OnBeforeHide | null;
            /**
             * Defines an event handler that runs after the datepicker is closed (after the closing effect ends).
             * ```
             * onHide: function(context) {
             *     // this: Datepicker instance
             *     // context: context element
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0403.html&tab=html/naturaljs/refr/refr040304.html
             */
            onHide?: N.EventHandlers.Datepicker.OnHide | null;
        }

        interface Popup {
            /**
             * Specifies the Block element inside the page to create as a popup.
             *
             * > Since the element inside the page is turned into a popup, the `url` option must not be set.
             * ```
             * N("context").popup();
             * ```
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            context?: N<HTMLElement[]>;
            /**
             * Specifies the URL of the page to be displayed in a popup.
             *
             * > Once the popup page has finished loading, the `init` method of the popup page will be called.
             *
             * > Since a different page is being loaded to create the popup, the `context` option should not be specified.
             * ```
             * N().popup("url");
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            url?: string;
            /**
             * Sets the title of the popup. If not set, the title bar is not created.
             *
             * > If the `url` option is specified, the title can also be set using the `title` attribute of the `view` element from the loaded page.
             * When creating a popup by specifying a context, the title can be set using the `title` attribute of the context element.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            title?: string;
            /**
             * If set to false, it does not create basic button-related elements (OK/Cancel buttons).
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            button?: boolean;
            /**
             * If set to true, it creates an overlay element that covers the entire screen,
             * blocking all interactions except for the popup content.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            modal?: boolean;
            /**
             * The position(px) to the top of the popup.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            top?: number;
            /**
             * The position(px) to the left of the popup.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            left?: number;
            /**
             * Width of the popup.
             *  - number: When set to the number type, the entered number(px) is set as the width of the element.
             *  - N.EventHandlers.Popup.Width: When set to a function type, msgContext (element that covers the screen when the modal option is true) and msgContents (message content element) are passed as arguments, and the width of the element is set with the returned value.
             *    ```
             *    ...
             *    // Fill the width of the popup to the screen
             *    width: function(msgContext, msgContents) {
             *        return $(window).width();
             *    },
             *    ...
             *    ```
             *
             * @default 0
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            width?: N.EventHandlers.Popup.Width | number;
            /**
             * Height of the content of the popup excluding the title area.
             *  - number: When set to the number type, the entered number (px) is set as the height of the element.
             *  - N.EventHandlers.Popup.Height: When set to a function, msgContext (the overlay element when modal is true) and msgContents (the message content element) are passed as arguments, and the element height is set to the returned value.
             *    ```
             *    ...
             *    // fill the height of the popup to fill the screen
             *    height: function(msgContext, msgContents) {
             *        // Since msgContents are hidden when the popup is opened, we need to call the show() function and then get the height of the title area.
             *        return $(window).height() - msgContents.show().find(".msg_title_box__").height();
             *    },
             * ...
             * ```
             *
             * @default 0
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            height?: number | N.EventHandlers.Popup.Height;
            /**
             * An option for referencing the parent page's Controller object from the popup's Controller object.
             *
             * When you assign the Controller object of the page creating the popup to the opener option, it will be passed to the popup’s Controller object as its opener property.
             *
             * > This only works when you set the url option to create another page as popup content.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            opener?: N.Objects.Controller.Object | null;
            /**
             * Sets whether to hide or remove the popup element when the popup is closed.
             *  - hide: Hides the popup element and maintains the previous state.
             *  - remove: Removes the popup element to reset its state.
             *
             * @default "hide"
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            closeMode?: "hide" | "remove";
            /**
             * If set to true, the popup will always appear on top.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            alwaysOnTop?: boolean;
            /**
             * If set to false, the popup will not close when clicking the msgContext
             * (the element covering the screen when the modal option is true).
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            overlayClose?: boolean;
            /**
             * If set to false, the popup will not close when pressing the ESC key.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            escClose?: boolean;
            /**
             * Defines an event handler that runs when the OK button is clicked.
             * ```
             * onOk: function(msgContext, msgContents) {
             *     // this: Alert instance
             *     // msgContext: Message overlay element
             *     // msgContents: Message dialog element
             * }
             * ```
             * > Returning 0 only executes the event handler and does not close the dialog box.
             *
             * > This works on the OK button that is created when the button option is set to true.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            onOk?: N.EventHandlers.Popup.OnOk | null;
            /**
             * Define an event handler that runs when the message dialog is closed by clicking the Cancel button, clicking the X button, clicking the message overlay element, or pressing the ESC key.
             *
             * ```
             * onCancel: function(msgContext, msgContents) {
             *     // this: Alert instance
             *     // msgContext: Message overlay element
             *     // msgContents: Message dialog element
             * }
             * ```
             * > Returning 0 only executes the event handler and does not close the dialog box.
             *
             * > This works on the cancel button created when the button option is set to true.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            onCancel?: N.EventHandlers.Popup.OnCancel | null;
            /**
             * Define an event handler that fires before the pop-up is displayed.
             * ```
             * onBeforeShow: function(msgContext, msgContents) {
             *     // this: Alert instance
             *     // msgContext: Message overlay element
             *     // msgContents: Message dialog element
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            onBeforeShow?: N.EventHandlers.Popup.OnBeforeShow | null;
            /**
             * Define an event handler that fires after the pop-up is displayed.
             * ```
             * onShow: function(msgContext, msgContents) {
             *     // this: Alert instance
             *     // msgContext: Message overlay element
             *     // msgContents: Message dialog element
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            onShow?: N.EventHandlers.Popup.OnShow | null;
            /**
             * Define an event handler that fires before the popup is hidden.
             * ```
             * onBeforeHide: function(msgContext, msgContents) {
             *     // this: Alert instance
             *     // msgContext: Message overlay element
             *     // msgContents: Message dialog element
             * }
             * ```
             * > If the closeMode option is set to hide, the onBeforeHide event will not fire.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            onBeforeHide?: N.EventHandlers.Popup.OnBeforeHide | null;
            /**
             * Define an event handler that fires after the popup is hidden.
             * ```
             * onHide: function(msgContext, msgContents) {
             *     // this: Alert instance
             *     // msgContext: Message overlay element
             *     // msgContents: Message dialog element
             * }
             * ```
             * > If the closeMode option is set to hide, the onHide event will not fire.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            onHide?: N.EventHandlers.Popup.OnHide | null;
            /**
             * Define an event handler that fires before the popup is removed.
             * ```
             * onBeforeRemove: function(msgContext, msgContents) {
             *     // this: Alert instance
             *     // msgContext: Message overlay element
             *     // msgContents: Message dialog element
             * }
             * ```
             * > If the closeMode option is set to hide, the onBeforeRemove event will not fire.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            onBeforeRemove?: N.EventHandlers.Popup.OnBeforeRemove | null;
            /**
             * Define an event handler that fires after the popup is removed.
             * ```
             * onRemove: function(msgContext, msgContents) {
             *     // this: Alert instance
             *     // msgContext: Message overlay element
             *     // msgContents: Message dialog element
             * }
             * ```
             * > If the closeMode option is set to hide, the onRemove event will not fire.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            onRemove?: N.EventHandlers.Popup.OnRemove | null;
            /**
             * Defines an event handler that is executed every time the popup is opened.
             *
             * > The function name is defined as a string, and the actual event handler method must be implemented in the Controller object of the popup content using the specified function name.
             *
             * > The first argument of the `open` method is passed as the first argument (`onOpenData`) to the onOpen event handler function.
             *
             * > If the popup content is loaded for the first time, the `init` function of the Controller object is executed before the `onOpen` function.
             *
             * > This only works when you set the `url` option to load another page as popup content.
             *
             *  - Popup instance example:
             * ```
             * N(".popup").cont({
             *     ...
             *     init: function(view, request) {
             *         var popup = N().popup({
             *             url: "./popup.html",
             *             onOpen: "onOpenFn"
             *         });
             *
             *         popup.open([1, 2, 3]);
             *     }
             *     ...
             * });
             * ```
             *  - Popup's Controller object example:
             * ```
             * N(".popup").cont({
             *     ...
             *     onOpenFn: function(onOpenData) {
             *         console.log(onOpenData);
             *
             *         // [1, 2, 3]
             *     }
             *     ...
             * });
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            onOpen?: string | N.EventHandlers.Popup.OnOpen | null;
            /**
             * Sets the data of the parent page to pass as the first argument of the onOpen event handler function.
             *
             * The first argument value of the open method will be set to this value.
             *
             * > This only works when you set the `url` option to create another page as popup content.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            onOpenData?: any;
            /**
             * Defines an event handler that is executed whenever the popup is closed.
             * ```
             * onClose: function(onCloseData) {
             *     // this: Popup instance
             *     // onCloseData: The first argument passed to the caller's close function of the Controller object invoked from the popup.
             * }
             * ```
             * > When the popup content loading is complete, a `caller` property is created on the Controller object of the popup. The `caller` refers to the Popup instance of the parent page that created this popup.
             * To close its own popup, this popup can execute the command `this.caller.close(onCloseData);` from the Controller object. When this command is executed and the popup closes, the `onClose` event handler function receives the `onCloseData` as its first argument.
             *
             * > This only works when you set the `url` option to create another page as the popup content.
             *
             *  - Popup instance example
             * ```
             * N(".popup").cont({
             *    ...
             *    init: function(view, request) {
             *        var popup = N().popup({
             *            url: "./popup.html",
             *            onClose: function(onCloseData) {
             *                console.log(onCloseData);
             *
             *                // [1, 2, 3]
             *            }
             *        });
             *    }
             *    ...
             * });
             * ```
             *  - Controller object of the popup
             * ```
             * N(".popup").cont({
             *     ...
             *     events: function() {
             *         var caller = this.caller;
             *         N(".close", this.view).on("click", function(onCloseData) {
             *
             *             caller.close([1, 2, 3]);
             *
             *         });
             *     }
             *     ...
             * });
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            onClose?: N.EventHandlers.Popup.OnClose | null;
            /**
             * Sets the data of the popup page to be passed as the first argument of the onClose event handler.
             *
             * The value of the first argument of the `this.caller.close` method in the popup's Controller object is set to this value.
             *
             * > This only works when you set the `url` option to create another page as popup content.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            onCloseData?: any;
            /**
             * Defines the event handler that runs when the popup content has finished loading.
             *
             * ```
             * onLoad: function(cont) {
             *     // this: Popup instance
             *     // cont: The Controller object for the popup
             * }
             * ```
             * > This only works when you set the `url` option to create another page as popup content.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            onLoad?: N.EventHandlers.Popup.OnLoad | null;
            /**
             * If set to true, the popup's content is preloaded when the popup is initialized;
             * if set to false, the popup's content is loaded when the popup is opened for the first time.
             *
             * > This option works only when the `url` option is set to create popup content from another page.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            preload?: boolean;
            /**
             * If set to false, it does not automatically adjust the size of the block overlay and the position of the popup when resizing the browser window or when the parent's content height changes dynamically.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            dynPos?: boolean;
            /**
             * If set to true, it disables the browser's window scroll when scrolling with the mouse wheel over a popup element.
             *
             * This blocks the browser's default behavior of scrolling up or down when the popup element reaches its top or bottom scroll limit.
             *
             * > Only works when the modal option is set to true.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            windowScrollLock?: boolean;
            /**
             * Enables dragging the popup dialog box using the title bar when set to `true`.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            draggable?: boolean;
            /**
             * When set to `false`, the popup will not automatically move back inside the screen if dropped outside of it.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            draggableOverflowCorrection?: boolean;
            /**
             * Specifies where the popup will move inward when dropped off the screen.
             * > If the popup does not return completely inside and a scroll bar appears on the screen, correct the position of the popup by increasing or decreasing it by 1.
             *
             * @default { top: 0, bottom: 0, left: 0, right: 0 }
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            draggableOverflowCorrectionAddValues?: {
                top?: number;
                bottom?: number;
                left?: number;
                right?: number;
            };
            /**
             * When set to true, saves memory usage by removing unnecessary reference elements.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0404.html&tab=html/naturaljs/refr/refr040404.html
             */
            saveMemory?: boolean;
        }

        interface EachTab {
            /**
             * Specifies the URL of the page to be created as tab content.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040504.html
             */
            url?: string;
            /**
             * If set to true, the tab and its content will be selected by default after the tabs are initialized.
             *
             * > The `active` option should be set to true for only one tab to be displayed by default.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040504.html
             */
            active?: boolean;
            /**
             * If set to true, the page for the tab content will be preloaded during the tab initialization instead of loading it the first time the tab is selected.
             *
             * This is used when you need to reference elements or the Controller object of the tab content during initialization.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040504.html
             */
            preload?: boolean;
            /**
             * Specifies the name of the `onOpen` event handler function as a string that will be executed in the loaded content whenever a tab is opened.
             *  - The `onOpen` event handler function must be defined in the Controller object of the page being loaded with the specified name.
             *  - The first argument of the `onOpen` event handler function is the `onOpenData` specified as the second argument when calling the `open` function.
             *  - When tab content is loaded for the first time, the `init` function of the Controller object is executed, followed by the `onOpen` function.
             *  - If an `onActive` event is defined, the `onActive` function is executed first, followed by the `onOpen` function.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040504.html
             */
            onOpen?: string | N.EventHandlers.Tab.OnOpen;
            /**
             * When set to `true`, the specified tab is created in a disabled state.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040504.html
             */
            disable?: boolean;
            /**
             * When set to `true`, the status of tab content is not preserved, and the associated tab content is reloaded and initialized each time the tab is selected.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040504.html
             */
            stateless?: boolean;
        }
        interface Tab {
            /**
             * Specifies the context element where the Tab will be applied.
             *
             * The context element for the Tab must be written using the `div` tag,
             * containing `ul`, `li`, and additional `div` tags.
             *
             *  - Tab
             *    - The tab elements are created using the `li` tags inside a `ul` tag.
             *    - The `href` attribute of the tab link (`<a>` tag) should match the `id` attribute
             *      of the corresponding tab content (`<div>` tag).
             *  - Tab contents
             *    - Tab content elements must be created using `div` tags.
             *    - The number and order of `tab contents` (`div`) should match the tabs (`li`).
             *    - The `id` attribute of the tab contents (`div` tags) should match the `href` attribute of
             *      the tab links (`<a>` tags).
             *    - You can set a URL option in the tab options to load other pages, or you can directly
             *      write the content inside the tab content element (`div`).
             * ```
             * <div class="tab-context">
             *     <ul>
             *         <li><a href="#tab1">Tab1</a></li>
             *         <li data-opts='{ "url": "tab1.html" }'>
             *             <a href="#tab2">Tab2</a>
             *         </li>
             *         <li data-opts='{ "url": "tab2.html"}'>
             *             <a href="#tab3">Tab3</a>
             *         </li>
             *     </ul>
             *     <div id="tab1">Tab1</div>
             *     <div id="tab2"></div>
             *     <div id="tab3"></div>
             * </div>
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040504.html
             */
            context?: N<HTMLElement[]>;
            /**
             * A variable that only contains instances of tab link elements.
             *
             * @default null
             */
            links?: N<HTMLElement[]> | null;
            /**
             * A variable that only contains instances of tab content elements.
             *
             * @default null
             */
            contents?: N<HTMLElement[]> | null;
            /**
             * Instead of using the `data-opts` attribute of a tab element, you can specify the options for individual tabs as an array of objects.
             *
             * The options should be configured as objects according to the order and number of tabs.
             * ```
             * N("#tab").tab({
             *     tabOpts: [
             *         { width: "auto", url: "tab1.html", preload: false, active: false }, //Tab1
             *         { width: "auto", url: "tab2.html", preload: false, active: false }, //Tab2
             *         { width: "auto", url: "tab3.html", preload: false, active: false, onOpen: "onOpen" }  //Tab3
             *     ]
             * });
             * ```
             * You can also specify options via the `data-opts` attribute directly on the tab tags (`<li>` elements).
             *
             * For detailed explanations of individual options, please refer to the [declarative options](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040505.html) tab.
             *
             * @default []
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040504.html
             */
            tabOpts?: N.Options.EachTab[];
            /**
             * If set to `true`, the tab and tab content will be displayed randomly when the tab is initialized.
             * If set to `false`, the first tab will be displayed.
             *
             * > If the `active` option is set to `true` among the tab options, the `active` option will take precedence.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040504.html
             */
            randomSel?: boolean;
            /**
             * This option allows the Controller (N.cont) object of the parent page, where the Tab instance was created,
             * to be referenced from the Controller object in the tab content when the `url` option is set in the tab options to load another page.
             *
             * When creating a Tab instance, you can specify the Controller object in the `opener` option.
             * This will pass the Controller object of the parent page into the `opener` property of the tab content page's Controller object.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040504.html
             */
            opener?: N.Objects.Controller.Object | null;
            /**
             * Defines an event handler that is executed every time a tab is activated.
             *
             * ```
             * onActive: function(tabIdx, tabEle, contentEle, tabEles, contentEles) {
             *     // this: Tab instance
             *     // tabIdx: Index of the activated tab
             *     // tabEle: Element of the activated tab
             *     // contentEle: Element of the activated content
             *     // tabEles: All tab elements
             *     // contentEles: All content elements
             * }
             * ```
             * > When tab content is loaded for the first time, the `init` function of the Controller object is executed before the `onActive` function is executed.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040504.html
             */
            onActive?: N.EventHandlers.Tab.OnActive | null;
            /**
             * Defines an event handler that is executed when tab content loading is complete.
             *
             * ```
             * onLoad: function(tabIdx, tabEle, contentEle, cont) {
             *     // this: Tab instance
             *     // tabIdx: Index of the activated tab
             *     // tabEle: Element of the activated tab
             *     // contentEle: Element of the activated content
             *     // cont: Controller object of the loaded tab content
             * }
             * ```
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040504.html
             */
            onLoad?: N.EventHandlers.Tab.OnLoad | null;
            /**
             * If set to `true`, the `onActive` event is not triggered when the tab is created, and the default tab is selected.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040504.html
             */
            blockOnActiveWhenCreate?: boolean;
            /**
             * When set to true, tabs can be scrolled using mouse drag, touch, or the first/last buttons.
             *
             * To scroll tabs using the first/last buttons, you need to include `a` tags and `span` tags as the first and last child elements of the `ul` tag.
             * ```
             * <div>
             *     <a href="#"><span></span></a> <!-- First button -->
             *     <ul>
             *         <li><a href="#tab1">tab1</a></li>
             *         <li><a href="#tab2">tab2</a></li>
             *         <li><a href="#tab3">tab3</a></li>
             *     </ul>
             *     <a href="#"><span></span></a> <!-- Last button -->
             *     <div id="tab1">tab1</div>
             *     <div id="tab2">tab2</div>
             *     <div id="tab3">tab3</div>
             * </div>
             * ```
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040504.html
             */
            tabScroll?: boolean;
            /**
             * Due to styles (CSS) applied to tab elements, the last tab may be either cut off or have additional spacing. In such cases, you can adjust the following options in the `tabScrollCorrection` object to display the tabs correctly:
             *  - tabContainerWidthCorrectionPx: An option that allows you to increment or decrement by 1 to correct the tab appearance when the last tab is cut off or has extra spacing.
             *  - tabContainerWidthReCalcDelayTime: An option that allows you to re-adjust the tab appearance by incrementing or decrementing by 1 when the tabs are first displayed and are either cut off or have extra spacing.
             * ```
             * N("#tab").tab({
             *     tabScrollCorrection: {
             *         tabContainerWidthCorrectionPx: 1,
             *         tabContainerWidthReCalcDelayTime: 0
             *     }
             * });
             * ```
             * [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html&tab=html/naturaljs/refr/refr010205.html) If you set the `tabScrollCorrection` option in the N.context.attr("ui").tab property of the configuration, it will be applied to all Tab components.
             *
             * @default { tabContainerWidthCorrectionPx: 0, tabContainerWidthReCalcDelayTime: 0 }
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0405.html&tab=html/naturaljs/refr/refr040504.html
             */
            tabScrollCorrection?: {
                tabContainerWidthCorrectionPx?: number;
                tabContainerWidthReCalcDelayTime?: number;
            };
        }

        interface Select {
            /**
             * Specifies the data to bind to the Select element.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040604.html
             */
            data?: N<N.JSONObject[]>;
            /**
             * Specifies the context element where the Select will be applied.
             *
             * The context element for Select must be written as a `select` or input tags with `type=checkbox` or `type=radio`.
             * ```
             * <select class="select-context">
             *     <option value="">Select</option>
             * </select>
             * <select class="select-context" multiple="multiple"></select>
             * <input class="select-context" type="radio">
             * <input class="select-context" type="checkbox">
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040604.html
             */
            context?: N<HTMLElement[]>;
            /**
             * Specifies the property name of the data to be bound to the name attribute of the selected element.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040604.html
             */
            key?: string;
            /**
             * Specifies the property name of the data to be bound to the value attribute of the selected element.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040604.html
             */
            val?: string;
            /**
             * If set to `false`, clears the default options in the select element before binding the data.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040604.html
             */
            append?: boolean;
            /**
             * If the context is `input[type=checkbox]` or `input[type=radio]`, specifies the direction in which the selected elements are placed.
             *  - h: Horizontal
             *  - v: Vertical
             *
             * @default "h"
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040604.html
             */
            direction?: "h" | "v";
            /**
             * Select element type
             *  - 1: select
             *  - 2: select[multiple='multiple']
             *  - 3: radio
             *  - 4: checkbox
             *
             * @default 0
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040604.html
             */
            type?: 0 | 1 | 2 | 3 | 4;
            /**
             * This variable is assigned with the instance of the default template element when it's a radio or checkbox.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0406.html&tab=html/naturaljs/refr/refr040604.html
             */
            template?: N<HTMLElement[]> | null;
        }

        interface Form {
            /**
             * Specifies the data to bind to the Form.
             *
             * Although the Form represents a single data component, the bound data is of a JSON object array type.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            data?: N<N.JSONObject[]>;
            /**
             * Specifies the index value of the row from the list data indicated by the data option to bind to the form.
             *
             * The default value is -1, but if no value is entered, it will be set to 0, binding the first row of the list data to the form.
             *
             * @default -1
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            row?: number;
            /**
             * Specifies the context element to apply to the Form.
             *
             * The context element of the Form can be written as tags that represent regions such as table, div, section, etc.
             *
             * If the property name of the data matches the id attribute value of the element, the data is bound.
             *
             * > All data-related components of Natural-JS use the id attribute for fast binding speed, which is inevitable.
             * ```
             * <table class="form-context">
             *     <tr>
             *         <th><label for="name">name</label></th>
             *         <td><input id="name" type="text"></td>
             *     </tr>
             *     <tr>
             *         <th><label for="age">age</label></th>
             *         <td><input id="age" type="text"></td>
             *     </tr>
             *     <tr>
             *         <th><label for="email">email</label></th>
             *         <td><input id="email" type="text"></td>
             *     </tr>
             *     <tr>
             *         <th>registered</th>
             *         <td id="registered"></td>
             *     </tr>
             * </table>
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            context?: N<HTMLElement[]>;
            /**
             * When set to `false`, validation of input values is not performed when focus is lost from input elements.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            validate?: boolean;
            /**
             * When set to `true`, the `unbind` method is automatically called before rebinding the same form elements, allowing for the reuse of form elements.
             * > The context element of the form is not recreated, so the purpose of the `add` and `bind` methods should be clearly distinguished.
             * Even if the `unbind` method is called for form elements already bound with data, it cannot perfectly restore the previous state.
             * Use is not recommended unless absolutely necessary.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            autoUnbind?: boolean;
            /**
             * An internal variable used within the system.
             *
             * @default null
             */
            state?: "add" | "bind" | "revert" | "update" | N<N.JSONObject> | null;
            /**
             * When set to `true`, HTML of data is applied while binding to the form.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            html?: boolean;
            /**
             * When set to `true`, row data is added to the top of the data list when the `add` method is called.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            addTop?: boolean;
            /**
             * Specifies format rules as an object type rather than using the data-format attribute of the target element.
             *
             * > Refer to the `rules` parameter description of [Formatter Constructor](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030103.html) for constructing the option object.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            fRules?: N.FormatRuleObject | null;
            /**
             * Specifies validation rules as an object type rather than using the data-validate attribute of the target element.
             *
             * > Refer to the `rules` parameter description of [Validator Constructor](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030203.html) for constructing the option object.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            vRules?: N.ValidationRuleObject | null;
            /**
             * An internal variable used within the system.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            extObj?: N.List | N.Grid | null;
            /**
             * An internal variable used within the system.
             *
             * @default -1
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            extRow?: number;
            /**
             * When set to `true`, the revert functionality is enabled, and the revert method can be used.
             *
             * @default false
             */
            revert?: boolean;
            /**
             * If set to true, element searching is cached, slightly improving performance.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            cache?: boolean;
            /**
             * If set to true, the unbind feature is enabled, allowing the use of the unbind method.
             * > Enabling the unbind feature retains initially bound data in memory, which increases memory usage.
             *
             * > Since context elements in the form are not regenerated, add and bind methods must be distinctly used based on their purposes. Even when the unbind method is called on form elements with already bound data, it may not fully restore the previous state. Therefore, it is not recommended except in cases of necessity.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            unbind?: boolean;
            /**
             * If set to true, it prevents conflicts between events already bound to input elements and component-specific events such as format, validate, and dataSync before the component is initialized.
             *
             * > If format does not work correctly, or bound data is not handled as intended, or an unknown error occurs, consider setting this to true.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            tpBind?: boolean;
            /**
             * Defines an event handler that executes before data property values are bound to elements.
             *
             * > [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html&tab=html/naturaljs/refr/refr010205.html) can be set as a global option to apply to all components (Grid, List) that use Form.
             * If you use the onBeforeBindValue event, you can handle all the values and elements to be bound with Form, Grid, or List at once.
             *
             * > When the onBeforeBindValue event is set as a global event option in N.config, the result of the handler defined during component initialization is passed as the argument (val) of the global handler. Therefore, unlike other events, global event handlers cannot be interrupted in component events.
             * ```
             * onBeforeBindValue: function(ele, val, action) {
             *     // this: Form instance
             *     // ele: element to be bound
             *     // val: value to be bound
             *     // action: method name of the Form instance - "bind" | "val"
             *     return val; // The processed value must be returned.
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            onBeforeBindValue?: N.EventHandlers.Form.OnBeforeBindValue | null;
            /**
             * Defines an event handler that executes after data property values are bound to elements.
             *
             * > [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html&tab=html/naturaljs/refr/refr010205.html) can be set as a global option to apply to all components (Grid, List) that use Form.
             * The onBindValue event allows you to handle all the values and elements bound with Form, Grid, or List at once.
             * ```
             * onBindValue: function(ele, val, action) {
             *     // this: Form instance
             *     // ele: bound element
             *     // val: bound value
             *     // action: method name of the Form instance - "bind" | "val"
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            onBindValue?: N.EventHandlers.Form.OnBindValue | null;
            /**
             * Defines an event handler that executes before data property values are bound to elements.
             *
             * > [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html&tab=html/naturaljs/refr/refr010205.html) can be set as a global option to apply to all components (Grid, List) that use Form.
             * ```
             * onBeforeBind: function(context, rowData) {
             *     // this: Form instance
             *     // context: context element
             *     // rowData: data to be bound to the form
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            onBeforeBind?: N.EventHandlers.Form.OnBeforeBind | null;
            /**
             * Defines an event handler that executes after data is fully bound.
             *
             * > [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html&tab=html/naturaljs/refr/refr010205.html) can be set as a global option to apply to all components (Grid, List) that use Form.
             * ```
             * onBind: function(context, rowData) {
             *     // this: Form instance
             *     // context: context element
             *     // rowData: bound data
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            onBind?: N.EventHandlers.Form.OnBind | null;
            /**
             * Internal variable used within the class.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0407.html&tab=html/naturaljs/refr/refr040704.html
             */
            InitialData?: N<N.JSONObject>;
        }

        interface List {
            /**
             * Specifies the data to be bound to the List.
             *
             * The context elements of the List must be written with `ul` and `li` tags.
             *
             * If the property name of a row's data matches the id attribute value of an element, the data will be bound to that element.
             *
             * > All data-related components in Natural-JS unavoidably use id attributes for faster binding performance.
             * ```
             * <ul class="list-context">
             *     <li>
             *         <input id="name" type="text">
             *         <input id="age" type="text">
             *         <input id="email" type="text">
             *         <span id="registered"></span>
             *     </li>
             * </ul>
             * ```
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            data?: N<N.JSONObject[]>;
            /**
             * A variable used internally.
             *
             * @default -1
             */
            row?: number;
            /**
             * A variable used internally.
             *
             * @default -1
             */
            beforeRow?: number;
            /**
             * Specifies the context elements to which the List will be applied.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            context?: N<HTMLElement[]>;
            /**
             * Specifies the height of the list body.
             *
             * If the specified value is greater than 0, a scrollbar will appear within the list body, and its height will be fixed to the specified value. If set to 0, all data will be displayed in the list body.
             *
             * > When binding paginated data to a List combined with the Pagination component, setting this to `0` to display all the data at once is recommended.
             *
             * @default 0
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            height?: number;
            /**
             * If set to false, validation of the input value is not performed when the input element loses focus.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            validate?: boolean;
            /**
             * If set to true, HTML of the data is applied when binding the data.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            html?: boolean;
            /**
             * If set to true, a new row element and row data will be added to the beginning of the list when the `add` method is called.
             *
             * > If the `addTop` option is set to false, a data synchronization issue might occur, forcing the `scrollPaging.size` and `createRowDelay` option values to be set to 0. This may degrade data binding performance.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            addTop?: boolean;
            /**
             * If set to true, the row added by the `add` method will be automatically selected.
             *
             * > The `select` option must be set to true.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            addSelect?: boolean;
            /**
             * If set to true, the height of the list body can be adjusted with the mouse.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            vResizable?: boolean;
            /**
             * If set to true, window scrolling in the browser will be disabled when scrolling with a mouse wheel over the data list element.
             *
             * The browser's default behavior of scrolling up or down the window when reaching the start or end of the data list element will be prevented.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            windowScrollLock?: boolean;
            /**
             * If set to true, the `onSelect` event is triggered when a row is selected (single row selection),
             * and the class attribute of the row element (`tbody`) is toggled with the value `list_selected__`.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            select?: boolean;
            /**
             * If set to false, selecting an already selected row (with the `select` option set to true) will not deselect it.
             *
             * > The `unselect` option is not applied when the `multiselect` option is true.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            unselect?: boolean;
            /**
             * If set to true, the `onSelect` event is triggered when multiple rows are selected (multi-row selection),
             * and the class attribute of the row element (`tbody`) is toggled with the value `list_selected__`.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            multiselect?: boolean;
            /**
             * Specifies an `input[type=checkbox]` element used to select all checkboxes
             * targeted by the `checkAllTarget` option.
             *
             * > Unlike grids, this should not be specified as a jQuery selector string,
             *   but as an exact jQuery object type representing the specific element.
             *
             * > Only toggles the checkbox state without triggering a click event.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            checkAll?: JQuery.Selector;
            /**
             * Specifies an `input[type=checkbox]` element used for multi-row selection in the list.
             *
             * The specified element can be used with the `check` function to retrieve
             * or set the index of selected rows.
             *
             * > `checkSingleTarget` elements must be inside an `li` element.
             *
             * > Use jQuery selector syntax, where the selector context is automatically set to list row elements (`li`).
             *
             * > Only one of `checkAllTarget` and `checkSingleTarget` can be used.
             *
             * > Binding data via the `id` attribute on checkboxes may cause issues.
             *   Use this functionality only for retrieving the indexes of selected rows.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            checkAllTarget?: JQuery.Selector;
            /**
             * Specifies an `input[type=checkbox]` element used for single-row selection in the list.
             *
             * The specified element can be used with the `check` function to retrieve
             * or set the index of the selected row.
             *
             * > `checkSingleTarget` elements must be inside an `li` element.
             *
             * > Use jQuery selector syntax, where the selector context is automatically set to list row elements (`li`).
             *
             * > Only one of `checkAllTarget` and `checkSingleTarget` can be used.
             *
             * > Binding data via the `id` attribute on checkboxes may cause issues.
             *   Use this functionality only for retrieving the indexes of selected rows.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            checkSingleTarget?: JQuery.Selector;
            /**
             * When set to `true`, the "list_hover__" class attribute value is added to the row element when the mouse is over the row, and the added class attribute value is removed when the mouse is out.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            hover?: boolean;
            /**
             * When set to `true`, the revert feature is enabled, and the `revert` method can be used.
             *
             * > Enabling the revert feature stores the initially bound data in memory, which will increase memory usage.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            revert?: boolean;
            /**
             * When set to a value greater than 1, each row of the list is created separately when binding. At this time, the interval between the creation of the next row is set.
             *
             * > If set to 0, all rows are created at once, which can cause the browser to freeze during data binding.
             *
             * @default 1
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            createRowDelay?: number;
            /**
             * Specifies the number of rows to bind at once during scroll paging.
             *
             * The list has scroll paging enabled by default, and specifying 0 disables the scroll paging feature.
             *
             * The `size` option value should be specified as a nested property of the `scrollPaging` option object, like this:
             * ```
             * ...
             *     scrollPaging: {
             *         size: 50
             *     }
             * ...
             * ```
             * > If set too small, the scroll may not be created, leaving all the data displayed. Ensure to set an amount allowing rows to overflow the list body.
             *
             * > If set too high, the browser may experience a performance load when scroll paging is triggered. If the list contains input elements or images, set it below 100; otherwise, set it below 1000 for optimal performance.
             *
             * @default { idx: 0, size: 100 }
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            scrollPaging?: {
                idx?: number;
                size?: number;
            };
            /**
             * Specifies the format rules in an object type instead of the target element’s `data-format` attribute.
             *
             * > Refer to the description of the `rules` argument in the [Formatter Constructor](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030103.html) for how to construct the option object.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            fRules?: N.FormatRuleObject | null;
            /**
             * Specifies validation rules in an object type instead of the target element’s `data-validate` attribute.
             *
             * > Refer to the description of the `rules` argument in the [Validator Constructor](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030203.html) for how to construct the option object.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            vRules?: N.ValidationRuleObject | null;
            /**
             * When set to `false`, rows appended using the `bind` method's second argument with the "append" option do not automatically scroll into view.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            appendScroll?: boolean;
            /**
             * If set to false, added rows will not automatically scroll into view when the add method is called.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            addScroll?: boolean;
            /**
             * If set to false, the last selected row will not scroll into view when the select method is called.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            selectScroll?: boolean;
            /**
             * If set to false, the last checked row will not scroll into view when the check method is called.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            checkScroll?: boolean;
            /**
             * If set to false, the last row that failed validation will not scroll into view when the validate method is called.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            validateScroll?: boolean;
            /**
             * If set to true, caching is applied during element searching to slightly improve performance.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            cache?: boolean;
            /**
             * If set to true, it prevents conflicts between existing binding events (such as format, validate, and dataSync) and component events before initializing the component.
             *
             * > If format does not function correctly, bound data is not handled as intended, or unknown errors occur, consider setting this option to true.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            tpBind?: boolean;
            /**
             * Defines an event handler that is executed before data is bound to the row element created when bound or added.
             * ```
             * rowHandlerBeforeBind: function(rowIdx, rowEle, rowData) {
             *     // this: List instance
             *     // rowIdx: Index of the created row
             *     // rowEle: Created row element (li)
             *     // rowData: Data for the row to be created
             * }
             * ```
             * > The `rowHandlerBeforeBind` event handler is executed each time a row element is created.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            rowHandlerBeforeBind?: N.EventHandlers.List.RowHandlerBeforeBind | null;
            /**
             * Defines an event handler that is executed after data is bound to the row element created when bound or added.
             * ```
             * rowHandler: function(rowIdx, rowEle, rowData) {
             *     // this: List instance
             *     // rowIdx: Index of the created row
             *     // rowEle: Created row element (li)
             *     // rowData: Bound data of the created row
             * }
             * ```
             * > The `rowHandler` event handler is executed each time a row element is created.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            rowHandler?: N.EventHandlers.List.RowHandler | null;
            /**
             * Defines an event handler that is executed before a row is selected.
             * ```
             * onBeforeSelect: function(rowIdx, rowEle, rowData, beforeRowIdx, e) {
             *     // this: List instance
             *     // rowIdx: The index of the selected row
             *     // rowEle: The selected row element (li)
             *     // rowData: The data of the selected row
             *     // beforeRowIdx: The index of the row previously selected
             *     // e: The click event object
             * }
             * ```
             * > If false is returned in the onBeforeSelect event handler, the row will not be selected. In this case, the onSelect event will be executed under the same conditions as the onBeforeSelect event.
             *
             * > This is executed only if the `select` or `multiselect` option is set to true.
             *
             * > If the `unselect` option is set to false and selection is canceled, the `rowIdx` argument returns -1. If selected, it returns the index of the selected row.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            onBeforeSelect?: N.EventHandlers.List.OnBeforeSelect | null;
            /**
             * Defines an event handler that is executed after a row is selected.
             * ```
             * onSelect: function(rowIdx, rowEle, rowData, beforeRowIdx, e) {
             *     // this: List instance
             *     // rowIdx: Index of the selected row
             *     // rowEle: Element of the selected row (li)
             *     // rowData: Data of the selected row
             *     // beforeRowIdx: Index of the previously selected row
             *     // e: click event object
             * }
             * ```
             * > Executed only when the `select` or `multiselect` option is set to `true`.
             *
             * > When the `unselect` option is set to `false`, it returns `-1` in `rowIdx` when deselected and the index of the selected row when selected.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            onSelect?: N.EventHandlers.List.OnSelect | null;
            /**
             * Defines an event handler that is executed after the data is bound.
             * ```
             * onBind: function(context, data, isFirstPage, isLastPage) {
             *     // this: List instance
             *     // context: Context element
             *     // data: Bound data
             *     // isFirstPage: Whether it is the first page when scroll paging (returns true if not scroll-paging)
             *     // isLastPage: Whether it is the last page when scroll paging (returns true if not scroll-paging)
             * }
             * ```
             * > Executed whenever paged data is bound when scroll paging is enabled.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0408.html&tab=html/naturaljs/refr/refr040804.html
             */
            onBind?: N.EventHandlers.List.OnBind | null;
        }

        interface GridMisc {
            resizableCorrectionWidth?: number;
            resizableLastCellCorrectionWidth?: number;
            resizeBarCorrectionLeft?: number;
            resizeBarCorrectionHeight?: number;
            fixedcolHeadMarginTop?: number;
            fixedcolHeadMarginLeft?: number;
            fixedcolHeadHeight?: number;
            fixedcolBodyMarginTop?: number;
            fixedcolBodyMarginLeft?: number;
            fixedcolBodyBindHeight?: number;
            fixedcolBodyAddHeight?: number;
            fixedcolRootContainer?: JQuery.Selector | null;
        }

        interface Grid {
            /**
             * Specifies the data to be bound to the Grid.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            data?: N<N.JSONObject[]>;
            /**
             * This variable is used internally.
             *
             * @default -1
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            row?: number;
            /**
             * This variable is used internally.
             *
             * @default -1
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            beforeRow?: number;
            /**
             * Specifies the context element to which the Grid is applied.
             *
             * The context element for the Grid must always be written as a `table` tag.
             *
             *  - thead - Grid header
             *    - Creates column titles for the grid.
             *    - The cells in the `thead` must be written using the `th` tag.
             *    - If the header is not needed, you don't need to include it, but sortable or filter options that work on the header cannot be used.
             *    - Multiple `tr` tags can be written inside the `thead` tag.
             *  - tbody - Grid body
             *    - The top-level element representing rows is `tbody`, and it is replicated by the length of the list data.
             *    - Cells in the `tbody` are written with the `td` tag.
             *    - If a row's property name matches the value of an element's `id` attribute, data binding is applied.
             *      > All data-related components in Natural-JS inevitably use the id attribute for fast binding speed.
             *
             *      > To bind more than one column's data in a single cell (`td`), add more than one element into the cell and include the `id` attribute values. In this case, the `data-id` attribute value in the `thead`'s `th` must set the property name used for sorting/filtering, etc.
             *
             *    - You can create row groups by writing multiple `tr` tags inside the `tbody` tag.
             *  - tfoot - Grid footer
             *    - If the Grid footer is not needed, it does not need to be included.
             *    - Cells in the `tfoot` are written with the `td` tag.
             * ```
             * <table class="grid-context">
             *     <thead>
             *         <tr>
             *             <th>name</th>
             *             <th data-id="age">age</th>
             *             <th>email</th>
             *             <th>registered</th>
             *         </tr>
             *     </thead>
             *     <tbody>
             *         <tr>
             *             <td><input id="name" type="text"></td>
             *             <td>
             *                 <input id="age" type="text">
             *                 <span id="gender"><span>
             *             </td>
             *             <td><input id="email" type="text"></td>
             *             <td id="registered"></td>
             *         </tr>
             *     </tbody>
             * </table>
             * ```
             *
             * @default -1
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            context?: N<HTMLElement[]>;
            /**
             * Specifies the height of the grid body.
             *
             * If the value is greater than 0, the header is fixed, and a scrollbar will appear in the grid body, fixed at the specified height. If set to 0, the header will not be fixed, and all data will be displayed in the grid body.
             *
             * > When using the grid with a Pagination component to bind paginated data to the list, it is recommended to set this to 0 to display all data at once.
             *
             * @default 0
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            height?: number;
            /**
             * Specifies which columns are fixed, allowing other columns to scroll horizontally.
             *
             * If set to 0, no columns will be fixed. Setting a number greater than or equal to 1 will fix that many columns starting from the first column.
             *
             * > The header (thead) section is required, and the footer (tfoot) section must not be present.
             *
             * > This option will not work if the grid's header or body consists of more than two sets of rows or if the height option is greater than 0.
             *
             * > If the fixed cells are displayed abnormally, adjust the values of the options: misc.fixedcolHeadMarginTop, misc.fixedcolHeadMarginLeft, misc.fixedcolHeadHeight, misc.fixedcolBodyMarginTop, misc.fixedcolBodyMarginLeft, fixedcolBodyBindHeight, and fixedcolBodyAddHeight.
             *
             * @default 0
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            fixedcol?: number;
            /**
             * When set to true, activates the functionality to hide or show columns and automatically generates a detailed popup.
             *
             * A button for executing the above functionality is created after the last column of the grid.
             *
             * If set to true, all columns defined in the grid header will be shown in the detailed popup. If an array of column names is provided as an option, only the specified columns will be shown.
             *
             * > The column titles are extracted directly from the grid header's title text, so columns not defined in the grid header will not be displayed. To show columns not in the grid header within the detailed popup, add the columns to the grid, initialize it, and then use the hide method to hide the added columns in the grid while keeping them visible in the popup.
             *
             * > When used in conjunction with the fixedcol option, the column hiding/showing feature might not work correctly.
             *
             * > The column title information in the detailed popup is extracted based on the id values of the elements in the td inside the tbody. If there are two or more elements with id attributes inside a td or if the composition of elements in the grid header and body is too different, the extraction may not be accurate. In this case, declare the column name to be extracted in the data-id attribute of the th elements to ensure it works correctly.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            more?: boolean | string[];
            /**
             * If set to false, disables validation of input values when the input element loses focus.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            validate?: boolean;
            /**
             * If set to true, the data's HTML will be applied when binding data.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            html?: boolean;
            /**
             * If set to true, when the add method is called, the row element and row data are added to the beginning of the list.
             *
             * > When the addTop option is set to false, data synchronization issues can occur, so the settings for the scrollPaging.size and createRowDelay options are forced to 0.
             * This may reduce data binding performance.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            addTop?: boolean;
            /**
             * If set to true, the row added when the add method is called will be automatically selected.
             *
             * > The select option must be set to true.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            addSelect?: boolean;
            /**
             * When set to true, you can filter the data based on the selected column.
             *
             * > If the filter option is set to false, you can activate the filtering function for each column by declaring the attribute `data-filter="true"` in the `th` element.
             *
             * > The information for the filtered column is based on the value of the `id` of `td` elements in the `tbody` or elements within the `td`. However, if there are two or more elements with the `id` attribute inside a `td` in the `tbody` or if the structure of the grid header and body differs greatly, filtering may not work properly.
             * In this case, declare the column name to be filtered in the `data-id` attribute of the `th` element to make it work correctly.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            filter?: boolean;
            /**
             * When set to true, you can adjust the width of the column.
             *
             * > If you specify the width of cells using the `col` tag in the `colgroup`, and if the `resizable` option is true, the grid transfers the width value defined in the `col` tag to the `thead`'s `th` and removes the `colgroup` tag during initialization. Therefore, it is recommended to set column widths in the `thead`'s `th` instead of using the `col` tag when using the column resizing functionality.
             *
             * > The column resizing function may not work properly when there is a `colspan` attribute in a `th` in the `thead`.
             *
             * > If the grid's layout breaks while resizing columns, please adjust the values of the options `misc.resizableCorrectionWidth`, `misc.resizableLastCellCorrectionWidth`, `misc.resizeBarCorrectionLeft`, and `misc.resizeBarCorrectionHeight`.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            resizable?: boolean;
            /**
             * When set to true, you can adjust the height of the grid body.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            vResizable?: boolean;
            /**
             * When set to true, you can sort the data based on the selected column.
             *
             * > The information for the sorted column is based on the value of the `id` of `td` elements in the `tbody` or elements within the `td`. However, if there are two or more elements with the `id` attribute inside a `td` in the `tbody` or if the structure of the grid header and body differs greatly, sorting may not work properly.
             * In this case, declare the column name to be sorted in the `data-id` attribute of the `th` element to make it work correctly.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            sortable?: boolean;
            /**
             * If set to true, disables the browser's window scroll while scrolling with the mouse wheel over the data list element.
             *
             * Prevents the browser's default behavior of scrolling up or down the browser window when the data list element is scrolled to the top or bottom.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            windowScrollLock?: boolean;
            /**
             * If set to true, the onSelect event is triggered upon selecting a row (single-row selection),
             * and the class attribute of the row element (tbody) toggles a value prefixed with `grid_selected__`.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            select?: boolean;
            /**
             * If set to false, the selected row will not be deselected even if it is reselected while the select option is true.
             *
             * > The unselect option will not be applied if the multiselect option is true.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            unselect?: boolean;
            /**
             * If set to true, the onSelect event is triggered upon selecting a row (multi-row selection),
             * and the class attribute of the row element (tbody) toggles a value prefixed with `grid_selected__`.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            multiselect?: boolean;
            /**
             * Specifies the input[type=checkbox] element to select all checkboxes designated by the `checkAllTarget` option.
             *
             * > The specified element must be in the `thead` section.
             *
             * > It is specified using a jQuery selector, and the context of the selector is automatically set to the header element (`thead`) of the grid.
             *
             * > This option only checks the checkbox without triggering the click event.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            checkAll?: JQuery.Selector;
            /**
             * Specifies the input[type=checkbox] element for selecting multiple rows in the grid.
             *
             * The specified element can be used to get or select the indices of rows selected using the `check` function.
             *
             * > The `checkSingleTarget` element must reside within the `tbody` section.
             *
             * > It is specified using a jQuery selector, and the context of the selector is automatically set to the row element (`tbody`) of the grid.
             *
             * > Only one of the `checkAllTarget` or `checkSingleTarget` options can be used.
             *
             * > If an `id` attribute is set on the checkbox and bound to data, it might not work correctly. Please use it only for retrieving the indices of selected rows.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            checkAllTarget?: JQuery.Selector;
            /**
             * Specifies the input[type=checkbox] element for single row selection in the grid.
             *
             * The specified element can be used to get or select the indices of rows selected using the `check` function.
             *
             * > The `checkSingleTarget` element must reside within the `tbody` section.
             *
             * > It is specified using a jQuery selector, and the context of the selector is automatically set to the row element (`tbody`) of the grid.
             *
             * > Only one of the `checkAllTarget` or `checkSingleTarget` options can be used.
             *
             * > If an `id` attribute is set on the checkbox and bound to data, it might not work correctly. Please use it only for retrieving the indices of selected rows.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            checkSingleTarget?: JQuery.Selector;
            /**
             * When set to true, the "list_hover__" class attribute is added to the row element when the mouse hovers over it and is removed when the mouse moves out.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            hover?: boolean;
            /**
             * When set to true, the revert functionality is enabled, and the `revert` method can be used.
             *
             * > Enabling the revert functionality stores the initially bound data in memory, which increases memory usage.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            revert?: boolean;
            /**
             * If set to a value greater than or equal to 1, each row of the grid is created separately during binding.
             * At this point, you can configure the time interval until the next row is created.
             *
             * > If set to 0, all rows are created at once, which may cause the browser to freeze during data binding.
             *
             * @default 1
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            createRowDelay?: number;
            /**
             * Specifies the number of rows to bind at once during scroll paging.
             *
             * For header-fixed lists, the scroll paging functionality is enabled by default, and setting the value to 0 will disable scroll paging.
             *
             * The `size` option value should be specified as a subproperty of the `scrollPaging` option object as follows:
             * ```
             * ...
             *     scrollPaging: {
             *         size: 50
             *     }
             * ...
             * ```
             * > Setting it too small may result in no scroll bar being created, and data may not be fully displayed.
             * Ensure you specify a value large enough so that rows can exceed the grid body.
             *
             * > If set too high, it might strain the browser during scroll paging. If the grid contains input elements or images, it is recommended to set it to 100 or below; otherwise, 1000 or below is advisable.
             *
             * @default { idx: 0, size: 100 }
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            scrollPaging?: {
                idx?: number;
                size?: number;
            };
            /**
             * Specifies format rules as an object type instead of the `data-format` attribute of the target element.
             *
             * > Refer to the description of the `rules` parameter of the [Formatter constructor](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0301.html&tab=html/naturaljs/refr/refr030103.html) to write the option object.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            fRules?: N.FormatRuleObject | null;
            /**
             * Specifies validation rules as an object type instead of the `data-validate` attribute of the target element.
             *
             * > Refer to the description of the `rules` parameter of the [Validator constructor](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0302.html&tab=html/naturaljs/refr/refr030203.html) to write the option object.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            vRules?: N.ValidationRuleObject | null;
            /**
             * If set to false, the `bind` method won't automatically scroll to the appended row when the "append" option is specified as the second argument.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            appendScroll?: boolean;
            /**
             * If set to false, the `add` method won't scroll to the newly added row.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            addScroll?: boolean;
            /**
             * If set to false, the `select` method won't scroll to the last selected row.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            selectScroll?: boolean;
            /**
             * If set to false, the `check` method won't scroll to the last checked row.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            checkScroll?: boolean;
            /**
             * If set to false, the `validate` method won't scroll to the last row that failed validation.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            validateScroll?: boolean;
            /**
             * Improves performance slightly by caching the search for elements if set to true.
             *
             * @default true
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            cache?: boolean;
            /**
             * Prevents conflicts between events already bound to input elements and component events such as format, validate, and dataSync before the component is initialized, if set to true.
             *
             * > Please set it to true if the format does not work correctly, the bound data is not handled as intended, or unexpected errors occur.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            tpBind?: boolean;
            /**
             * Allows pasting (Ctrl + V) data copied from Excel into the grid if set to true.
             *
             * > In addition to data copied from Excel, you can also paste text that separates rows with the Enter key (\n) and columns with the Tab key (\t).
             *
             * > Based on the selected cell where the text input cursor is displayed, the values are pasted in order into elements that have an `id` attribute. If the element is not an input element but still has an `id` attribute, the cell value is updated.
             *
             * > Elements with readonly or disabled attributes do not accept any values.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            pastiable?: boolean;
            /**
             * Defines an event handler that is executed before data is bound to the row element created when bind or add is called.
             * ```
             * rowHandlerBeforeBind: function(rowIdx, rowEle, rowData) {
             *     // this: Grid instance
             *     // rowIdx: Index of the created row
             *     // rowEle: Created row element (li)
             *     // rowData: Data of the row to be created
             * }
             * ```
             * > The `rowHandlerBeforeBind` event handler is executed every time a row element is created.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            rowHandlerBeforeBind?: N.EventHandlers.Grid.RowHandlerBeforeBind | null;
            /**
             * Defines an event handler that is executed after data is bound to the row element created when bind or add is called.
             * ```
             * rowHandler: function(rowIdx, rowEle, rowData) {
             *     // this: Grid instance
             *     // rowIdx: Index of the created row
             *     // rowEle: Created row element (li)
             *     // rowData: Data of the created row
             * }
             * ```
             * > The `rowHandler` event handler is executed every time a row element is created.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            rowHandler?: N.EventHandlers.Grid.RowHandler | null;
            /**
             * Defines an event handler that is executed before a row is selected.
             * ```
             * onBeforeSelect: function(rowIdx, rowEle, rowData, beforeRowIdx, e) {
             *     // this: Grid instance
             *     // rowIdx: Index of the selected row
             *     // rowEle: Element (li) of the selected row
             *     // rowData: Data of the selected row
             *     // beforeRowIdx: Index of the row that was previously selected
             *     // e: Click event object
             * }
             * ```
             * > If the `onBeforeSelect` event handler returns `false`, the row selection is canceled. In this case, the `onSelect` event is executed under the same condition as the `onBeforeSelect` event.
             *
             * > Executes only when the `select` or `multiselect` option is set to `true`.
             *
             * > If the `unselect` option is set to `false`, the `rowIdx` argument returns `-1` when selection is canceled, and the index of the selected row when a row is selected.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            onBeforeSelect?: N.EventHandlers.Grid.OnBeforeSelect | null;
            /**
             * Defines an event handler that is executed after a row is selected.
             * ```
             * onSelect: function(rowIdx, rowEle, rowData, beforeRowIdx, e) {
             *     // this: Grid instance
             *     // rowIdx: Index of the selected row
             *     // rowEle: Element (li) of the selected row
             *     // rowData: Data of the selected row
             *     // beforeRowIdx: Index of the row that was previously selected
             *     // e: Click event object
             * }
             * ```
             * > Executes only when the `select` or `multiselect` option is set to `true`.
             *
             * > If the `unselect` option is set to `false`, the `rowIdx` argument returns `-1` when selection is canceled, and the index of the selected row when a row is selected.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            onSelect?: N.EventHandlers.Grid.OnSelect | null;
            /**
             * Defines an event handler that is executed after data binding is completed.
             * ```
             * onBind: function(context, data, isFirstPage, isLastPage) {
             *     // this: Grid instance
             *     // context: Context element
             *     // data: Bound data
             *     // isFirstPage: Whether it is the first page in scroll paging (returns `true` if scroll paging is not enabled)
             *     // isLastPage: Whether it is the last page in scroll paging (returns `true` if scroll paging is not enabled)
             * }
             * ```
             * > Executes whenever paginated data is bound if scroll paging is enabled.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            onBind?: N.EventHandlers.Grid.OnBind | null;
            /**
             * Miscellaneous constants.
             *
             * @default {
             *     resizableCorrectionWidth: 0,
             *     resizableLastCellCorrectionWidth: 0,
             *     resizeBarCorrectionLeft: 0,
             *     resizeBarCorrectionHeight: 0,
             *     fixedcolHeadMarginTop: 0,
             *     fixedcolHeadMarginLeft: 0,
             *     fixedcolHeadHeight: 0,
             *     fixedcolBodyMarginTop: 0,
             *     fixedcolBodyMarginLeft: 0,
             *     fixedcolBodyBindHeight: 0,
             *     fixedcolBodyAddHeight: 1,
             *     fixedcolRootContainer: null
             * }
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            misc?: N.Options.GridMisc;
            /**
             * Variables used internally.
             *
             * @default -1
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0409.html&tab=html/naturaljs/refr/refr040904.html
             */
            currMoveToRow?: number;
        }

        interface CurrPageNavInfo {
            /**
             * Current page number.
             *
             * @default 1
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            pageNo: number;
            /**
             * Row count per page.
             *
             * @default 10
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            countPerPage: number;
            /**
             * Page count per page set.
             *
             * @default 10
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            countPerPageSet: number;
            /**
             * Total row count.
             *
             * @default 0
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            totalCount: number;
            /**
             * Total page count.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            pageCount: number;
            /**
             * Total page set count.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            pageSetCount: number;
            /**
             * Current page set number.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            currSelPageSet: number;
            /**
             * First page number in the current page set.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            startPage: number;
            /**
             * Last page number in the current page set.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            endPage: number;
            /**
             * First row index on the selected page.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            startRowIndex: number;
            /**
             * First row number of the selected page.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            startRowNum: number;
            /**
             * Last row index on the selected page.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            endRowIndex: number;
            /**
             * Last row number of the selected page.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            endRowNum: number;
        }
        interface Pagination {
            /**
             * Specifies the data to be bound to the Pagination.
             *
             * > If the `data` option is specified, the `totalCount` value is automatically calculated and set. Therefore, you must not set the `totalCount` value to 0 or configure it manually.
             *
             * > In case of paging via the database, do not specify the `data` option. Instead, fetch and configure only the `totalCount` value from the server.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            data?: N<N.JSONObject[]>;
            /**
             * Specifies the context element to which Pagination will be applied.
             *
             * The context element for Pagination must use `div` tags containing `ul` and `li` tags.
             *
             *  - First page, Last page, Previous page, Next page:
             *    - Write `ul` tags with `li` tags containing `a` tags.
             *    - Separate `ul` tags for first/previous and last/next page elements.
             *    - If related tags for first and last page links are not written, the corresponding functionalities are disabled.
             *  - Page index:
             *    - Write `ul` tags with `li` tags containing `a` tags.
             * ```
             * <div class="pagination-context">
             *     <ul>
             *         <li><a href="#">first</a></li>
             *         <li><a href="#">prev</a></li>
             *     </ul>
             *     <ul>
             *         <li><a href="#"><span>1</span></a></li>
             *     </ul>
             *     <ul>
             *         <li><a href="#">next</a></li>
             *         <li><a href="#">last</a></li>
             *     </ul>
             * </div>
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            context?: N<HTMLElement[]>;
            /**
             * Total row count.
             *
             * > In case of paging via the database, do not specify the `data` option. Instead, fetch and configure only the `totalCount` value from the server.
             *
             * @default 0
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            totalCount?: number;
            /**
             * Row count per page.
             *
             * @default 10
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            countPerPage?: number;
            /**
             * Page count per page set.
             *
             * @default 10
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            countPerPageSet?: number;
            /**
             * Sets the initial page number to display after Pagination is initialized.
             *
             * @default 1
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            pageNo?: number;
            /**
             * Defines the event handler to execute when a page is switched.
             * ```
             * onChange: function(pageNo, selEle, selData, currPageNavInfo) {
             *     // this: Pagination instance
             *     // pageNo: Page number
             *     // selEle: Selected page navigation element
             *     // selData: Selected page's data list
             *     // currPageNavInfo: Current page navigation info
             * }
             * ```
             * `currPageNavInfo` Object Information:
             *  - pageNo: Current page number.
             *  - countPerPage: Row count per page.
             *  - countPerPageSet: Page count per page set.
             *  - currSelPageSet: Current page set number.
             *  - pageCount: Total page count.
             *  - pageSetCount: Total page set count.
             *  - totalCount: Total row count.
             *  - startPage: First page number in the current page set.
             *  - startRowIndex: First row index on the selected page.
             *  - startRowNum: First row number of the selected page.
             *  - endPage: Last page number in the current page set.
             *  - endRowIndex: Last row index on the selected page.
             *  - endRowNum: Last row number of the selected page.
             *
             * For database paging, fetch the `totalCount` value from the server first, then pass the `currPageNavInfo` argument of the `onChange` event handler to the server to fetch paged data.
             *
             * Bind the paged data to the Grid or List whenever the page changes in the `onChange` event.
             * ```
             * var grid = N(data).grid(".grid-context");
             *
             *     N.comm("getTotalCnt.json").submit(function(data){
             *         N(data).pagination({
             *             context: ".pagination-context",
             *             totalCount: data.totalCount,
             *             onChange: function(pageNo, selEle, selData, currPageNavInfo) {
             *                 N(currPageNavInfo).comm("getPagedDataList.json").submit(function(data){
             *                     grid.bind(selData);
             *                 });
             *             }
             *         }).bind();
             *     });
             * ```
             * > If `blockOnChangeWhenBind` is set to `true`, the event is executed only when the paging buttons are clicked.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            onChange?: N.EventHandlers.Pagination.OnChange | null;
            /**
             * When set to `true`, the `onChange` event is not executed when the bind method is called.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            blockOnChangeWhenBind?: boolean;
            /**
             * A variable assigned to hold the paging state information object.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0410.html&tab=html/naturaljs/refr/refr041004.html
             */
            currPageNavInfo?: N.Options.CurrPageNavInfo | null;
        }

        interface Tree {
            /**
             * Specifies the data to bind to the Tree.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041104.html
             */
            data?: N<N.JSONObject[]>;
            /**
             * Specifies the element to apply the Tree.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041104.html
             */
            context?: N<HTMLElement[]>;
            /**
             * Specifies the property name of the data to be displayed as the node name.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041104.html
             */
            key?: string;
            /**
             * Specifies the property name of the data to be set as the node value.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041104.html
             */
            val?: string;
            /**
             * Specifies the property name of the data to be set as the node level.
             *
             * > The level option is not mandatory, but specifying it enhances the Tree rendering speed.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041104.html
             */
            level?: string;
            /**
             * Specifies the property name of the data to be set as the parent node value.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041104.html
             */
            parent?: string;
            /**
             * When set to `true`, folder nodes can be selected.
             *
             * > If the option is `true`, users can click the [+] icon to expand the folder, and clicking on the node name will select it.
             * If the option is `false`, clicking on a folder node name will not select the folder but only expand it.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041104.html
             */
            folderSelectable?: boolean;
            /**
             * If set to true, checkboxes will be added before the node name.
             *
             * > When a checkbox is checked, all child nodes are also checked, and the `onCheck` event handler is executed.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041104.html
             */
            checkbox?: boolean;
            /**
             * Defines the event handler to be executed when a node is selected.
             * ```
             * onSelect: function(selNodeIndex, selNodeEle, selNodeData) {
             *     // this: Tree instance
             *     // selNodeIndex: The index of the selected node
             *     // selNodeEle: The element of the selected node
             *     // selNodeData: The row data of the selected node
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041104.html
             */
            onSelect?: N.EventHandlers.Tree.OnSelect | null;
            /**
             * Defines the event handler to be executed when a node is checked.
             *
             * ```
             * onCheck: function(selNodeIndex, selNodeEle, selNodeData
             *                     , checkedElesIndexes, checkedEles, checkedElesData
             *                     , checkFlag) {
             *     // this: Tree instance
             *     // selNodeIndex: The index of the selected node
             *     // selNodeEle: The element of the selected node
             *     // selNodeData: The row data of the selected node
             *     // checkedElesIndexes: The indexes of the checked nodes
             *     // selNodeEle: The elements of the checked nodes
             *     // selNodeData: The row data of the checked nodes
             *     // checkFlag: Whether the checkbox was checked
             * }
             * ```
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0411.html&tab=html/naturaljs/refr/refr041104.html
             */
            onCheck?: N.EventHandlers.Tree.OnCheck | null;
        }
    }

    namespace EventHandlers {
        namespace Alert {
            interface Width {
                (this: N.Alert, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): number;
            }
            interface Height {
                (this: N.Alert, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): number;
            }
            interface OnOk {
                (this: N.Alert, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): undefined | 0;
            }
            interface OnCancel {
                (this: N.Alert, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): undefined | 0;
            }
            interface OnBeforeShow {
                (this: N.Alert, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): void;
            }
            interface OnShow {
                (this: N.Alert, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): void;
            }
            interface OnBeforeHide {
                (this: N.Alert, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): void;
            }
            interface OnHide {
                (this: N.Alert, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): void;
            }
            interface OnBeforeRemove {
                (this: N.Alert, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): void;
            }
            interface OnRemove {
                (this: N.Alert, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): void;
            }
        }
        namespace Button {
            interface OnBeforeCreate {
                (this: N.Button, context: N<HTMLElement[]>, opts: N.Options.Button): void;
            }
            interface OnCreate {
                (this: N.Button, context: N<HTMLElement[]>, opts: N.Options.Button): void;
            }
        }
        namespace Datepicker {
            interface OnChangeYear {
                (this: N.Datepicker, context: N<HTMLElement[]>, selYearStr: string, e: JQuery.Event): void;
            }
            interface OnChangeMonth {
                (
                    this: N.Datepicker,
                    context: N<HTMLElement[]>,
                    selMonthStr: string,
                    selYearStr: string,
                    e: JQuery.Event,
                ): void;
            }
            interface OnSelect {
                (this: N.Datepicker, context: N<HTMLElement[]>, selDate: N.Date, monthonly: boolean): void;
            }
            interface OnBeforeShow {
                (this: N.Datepicker, context: N<HTMLElement[]>, contents: N<HTMLElement[]>): undefined | false;
            }
            interface OnShow {
                (this: N.Datepicker, context: N<HTMLElement[]>, contents: N<HTMLElement[]>): void;
            }
            interface OnBeforeHide {
                (this: N.Datepicker, context: N<HTMLElement[]>, contents: N<HTMLElement[]>): void;
            }
            interface OnHide {
                (this: N.Datepicker, context: N<HTMLElement[]>): void;
            }
        }
        namespace Popup {
            interface Width {
                (this: N.Popup, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): number;
            }
            interface Height {
                (this: N.Popup, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): number;
            }
            interface OnOk {
                (this: N.Popup, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): undefined | 0;
            }
            interface OnCancel {
                (this: N.Popup, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): undefined | 0;
            }
            interface OnBeforeShow {
                (this: N.Popup, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): void;
            }
            interface OnShow {
                (this: N.Popup, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): void;
            }
            interface OnBeforeHide {
                (this: N.Popup, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): void;
            }
            interface OnHide {
                (this: N.Popup, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): void;
            }
            interface OnBeforeRemove {
                (this: N.Popup, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): void;
            }
            interface OnRemove {
                (this: N.Popup, msgContext?: N<HTMLElement[]>, msgContents?: N<HTMLElement[]>): void;
            }
            interface OnOpen {
                (this: N.Objects.Controller.Object, onOpenData?: any): void;
            }
            interface OnClose {
                (this: N.Popup, onCloseData?: any): void;
            }
            interface OnLoad {
                (this: N.Popup, cont: N.Objects.Controller.Object): void;
            }
        }
        namespace Tab {
            interface OnOpen {
                (this: N.Objects.Controller.Object, onOpenData?: any): void;
            }
            interface OnActive {
                (
                    this: N.Tab,
                    selTabIdx: number,
                    selTabEle: N<HTMLElement[]>,
                    selContentEle: N<HTMLElement[]>,
                    links: N<HTMLElement[]>,
                    contents: N<HTMLElement[]>,
                ): void;
            }
            interface OnLoad {
                (
                    this: N.Tab,
                    selTabIdx: number,
                    selTabEle: N<HTMLElement[]>,
                    selContentEle: N<HTMLElement[]>,
                    cont: N.Objects.Controller.Object,
                ): void;
            }
        }
        namespace Form {
            interface OnBeforeBindValue {
                (
                    this: N.Form,
                    ele: N<HTMLElement[]>,
                    val: N.Primitive | N.Primitive[],
                    action: "bind" | "val",
                ): N.Primitive | N.Primitive[];
            }
            interface OnBindValue {
                (
                    this: N.Form,
                    ele: N<HTMLElement[]>,
                    val: N.Primitive | N.Primitive[],
                    action: "bind" | "val",
                ): void;
            }
            interface OnBeforeBind {
                (this: N.Form, context: N<HTMLElement[]>, vals: N.JSONObject): void;
            }
            interface OnBind {
                (this: N.Form, context: N<HTMLElement[]>, vals: N.JSONObject): void;
            }
        }
        namespace List {
            interface RowHandlerBeforeBind {
                (this: N.List, rowIdx: number, rowEle: N<HTMLElement[]>, rowData: N.JSONObject): void;
            }
            interface RowHandler {
                (this: N.List, rowIdx: number, rowEle: N<HTMLElement[]>, rowData: N.JSONObject): void;
            }
            interface OnBeforeSelect {
                (
                    this: N.List,
                    rowIdx: number,
                    rowEle: N<HTMLElement[]>,
                    rowData: N<N.JSONObject>,
                    beforeRowIdx: number,
                    e: JQuery.Event,
                ): undefined | false;
            }
            interface OnSelect {
                (
                    this: N.List,
                    rowIdx: number,
                    rowEle: N<HTMLElement[]>,
                    rowData: N<N.JSONObject[]>,
                    beforeRowIdx: number,
                    e: JQuery.Event,
                ): void;
            }
            interface OnBind {
                (
                    this: N.List,
                    context: N<HTMLElement[]>,
                    data: N<N.JSONObject>,
                    isFirstPage: boolean,
                    isLastPage: boolean,
                ): void;
            }
        }
        namespace Grid {
            interface RowHandlerBeforeBind {
                (this: N.Grid, rowIdx: number, rowEle: N<HTMLElement[]>, rowData: N.JSONObject): void;
            }
            interface RowHandler {
                (this: N.Grid, rowIdx: number, rowEle: N<HTMLElement[]>, rowData: N.JSONObject): void;
            }
            interface OnBeforeSelect {
                (
                    this: N.Grid,
                    rowIdx: number,
                    rowEle: N<HTMLElement[]>,
                    rowData: N<N.JSONObject>,
                    beforeRowIdx: number,
                    e: JQuery.Event,
                ): undefined | false;
            }
            interface OnSelect {
                (
                    this: N.Grid,
                    rowIdx: number,
                    rowEle: N<HTMLElement[]>,
                    rowData: N<N.JSONObject[]>,
                    beforeRowIdx: number,
                    e: JQuery.Event,
                ): void;
            }
            interface OnBind {
                (
                    this: N.Grid,
                    context: N<HTMLElement[]>,
                    data: N<N.JSONObject>,
                    isFirstPage: boolean,
                    isLastPage: boolean,
                ): void;
            }
        }
        namespace Pagination {
            interface OnChange {
                (
                    this: N.Pagination,
                    pageNo: number,
                    selEle: N<HTMLElement[]>,
                    selData: N.JSONObject[],
                    currPageNavInfo: N.Options.CurrPageNavInfo,
                ): void;
            }
        }
        namespace Tree {
            interface OnSelect {
                (this: N.Tree, selNodeIndex: number, selNodeEle: N<HTMLElement[]>, selNodeData: N.JSONObject): void;
            }
            interface OnCheck {
                (
                    this: N.Tree,
                    selNodeIndex: number,
                    selNodeEle: N<HTMLElement[]>,
                    selNodeData: N.JSONObject,
                    checkedElesIndexes: number[],
                    checkedEles: N<HTMLElement[]>,
                    checkedElesData: N.JSONObject[],
                    checkFlag: boolean,
                ): void;
            }
        }
    }

    namespace Callbacks {
        namespace Popup {
            interface LoadContent {
                (this: N.Popup, cont?: N.Objects.Controller.Object, context?: N<HTMLElement[]>): void;
            }
        }
        namespace Tab {
            interface LoadContent {
                (this: N.Tab, cont?: N.Objects.Controller.Object, context?: N<HTMLElement[]>): void;
            }
        }
    }

    namespace Objects {
        namespace Grid {
            interface TableMap {
                colgroup: HTMLElement[][];
                thead: HTMLTableCellElement[][];
                tbody: HTMLTableCellElement[][];
                tfoot: HTMLTableCellElement[][];
            }
        }

        namespace Pagination {
            interface LinkEles {
                body: HTMLElement[][];
                page: HTMLElement[][];
                first: HTMLElement[][];
                prev: HTMLElement[][];
                next: HTMLElement[][];
                last: HTMLElement[][];
            }
        }
    }
}


declare class NUS {
    /**
     * Create an object instance of Notify with the N() function.
     * ```
     * var notify = N(position).notify(opts);
     * ```
     *
     * @param {NUS.Options.Notify} [opts] - Specifies the initialization option object for the component.
     * @returns {NUS.Notify} An instance of a Notify object, configured according to the provided options.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0501.html&tab=html/naturaljs/refr/refr050103.html
     */
    notify(this: N<NUS.Options.NotifyPosition>, opts?: N.Options.Notify): N.Notify;
    /**
     * Create an object instance of Documents with the N() function.
     * ```
     * var docs = N(context).docs(opts);
     * ```
     *
     * @param {NUS.Options.Documents} [opts] - Specifies the initialization option object for the component.
     * @returns {NUS.Documents} An instance of a Documents object, configured according to the provided options.
     *
     * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050202.html
     */
    docs(this: N<HTMLElement[]>, opts?: N.Options.Documents): N.Documents;

    static notify: {
        /**
         * Creates a new Notify instance.
         * ```
         * var notify = new N.notify(position, opts);
         * ```
         *
     * @param {NUS.Options.NotifyPosition} position - Specifies where the message will appear.
         * > It can be specified with the left / right / top / bottom properties of the options object.
         * @param {NUS.Options.Notify} [opts] - Specifies the initialization option object for the component.
         * @returns {NUS.Notify} An instance of a Notify object, configured according to the provided options.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0501.html&tab=html/naturaljs/refr/refr050103.html
         */
        new(position: N.Options.NotifyPosition, opts?: N.Options.Notify): N.Notify;
        add(msg: string, url?: string): void;
        wrapEle(): void;
    };

    static docs: {
        /**
         * Creates a new Documents instance.
         * ```
         * var docs = new N.docs(context, opts);
         * ```
         *
         * @param {N<HTMLElement[]>} obj - The context element to which the Documents will be applied.
         * @param {NUS.Options.Documents} [opts] - Specifies the initialization option object for the component.
         * @returns {NUS.Documents} An instance of a Documents object, configured according to the provided options.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050202.html
         */
        new(obj: N<HTMLElement[]>, opts?: N.Options.Documents): N.Documents;
        createLoadIndicator(): N.Documents;
        updateLoadIndicator(entireLoadRequestCnt: number, entireLoadRequestMaxCnt: number): N.Documents;
        removeLoadIndicator(): N.Documents;
        errorLoadIndicator(): N.Documents;
        wrapEle(): void;
        wrapScroll(): void;
        clearScrollPosition(tabEle: number | N<HTMLElement[]>, isActive?: boolean): void;
        loadContent(docOpts: N.Options.DocOpts, callback: N.Callbacks.Documents.LoadContent): void;
        closeBtnControl(): void;
        inactivateTab(): void;
        activateTab(docId_: string, isFromDocsTabList_?: boolean, isNotLoaded_?: boolean): void;
        showTabContents(docId_: string): boolean | undefined;
        hideTabContents(docId_: string): void;
        remove(targetTabEle: N<HTMLElement[]>): void;
    };
}

declare namespace N {
    interface Notify {
        options: N.Options.Notify;
        /**
         * Returns the message container element.
         *
         * @param {JQuery.Selector} [sel] - An optional jQuery selector to refine the context.
         * @return {N<HTMLElement[]>} Returns the context element, or the element matched within the context.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0501.html&tab=html/naturaljs/refr/refr050105.html
         */
        context(sel?: JQuery.Selector): N<HTMLElement[]>;
        /**
         * Adds a notification message, optionally with a URL link.
         *
         * @param {string} msg - The notification message to be added.
         * @param {string} [url] - An optional URL associated with the notification.
         * @return {NUS.Notify} Returns the `Notify` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0501.html&tab=html/naturaljs/refr/refr050105.html
         */
        add(msg: string, url?: string): N.Notify;
        /**
         * Removes the specified message dialog element(s) from the DOM.
         *
         * @param {N<HTMLElement[]>} msgBoxEle - The element(s) representing the message box to be removed.
         * @return {NUS.Notify} Returns the `Notify` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0501.html&tab=html/naturaljs/refr/refr050105.html
         */
        remove(msgBoxEle: N<HTMLElement[]>): N.Notify;
    }

    interface Documents {
        options: N.Options.Documents;
        request: DocumentsRequest;
        /**
         * Returns the context element.
         *
         * @param {JQuery.Selector} [sel] - An optional jQuery selector to refine the context.
         * @return {N<HTMLElement[]>} Returns the context element, or the element matched within the context.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050205.html
         */
        context(sel?: JQuery.Selector): N<HTMLElement[]>;
        /**
         * Adds a new Documents tab content.
         *
         * @param {string} docId - The unique identifier for the document page to be added.
         * @param {string} docNm - The name of the document page to be added.
         * @param {NUS.Options.DocOpts} docOpts - Options that apply only to the page being added.
         * ```
         * var docOpts = {
         *     url: "url", // document URL
         *     urlSync: true, // The response will be blocked if location.href when requesting to the server and location.href when receiving a response from the server are different.
         *     docId: docId, // document id
         *     docNm: docNm, // document name
         *     onBeforeLoad: function(docId, target) {
         *         // onBeforeLoad event that applies only to the document being added.
         *
         *         // docId: document id
         *         // target: Element to put loaded content
         *
         *        var doc = this.doc(docId); // get document info
         *        var cont = this.cont(docId); // get document's Controller object
         *        var view = cont.view;
         *        var request = cont.request;
         *     },
         *     onLoad: function(docId) {
         *         // onLoad event that applies only to the document being added.
         *     },
         *     onBeforeActive: function(docId) {
         *         // onBeforeActive event that applies only to the document being added.
         *     },
         *     onActive: function(docId) {
         *         // onActive event that applies only to the document being added.
         *     },
         *     onBeforeInactive: function(docId) {
         *         // onBeforeInactive event that applies only to the document being added.
         *     },
         *     onInactive: function(docId) {
         *         // onInactive event that applies only to the document being added.
         *     },
         *     onBeforeRemoveState: function(docId) {
         *         // onBeforeRemoveState event that applies only to the document being added.
         *     },
         *     onRemoveState: function(docId) {
         *         // onRemoveState event that applies only to the document being added.
         *     },
         *     onBeforeRemove: function(docId) {
         *         // onBeforeRemove event that applies only to the document being added.
         *     },
         *     onRemove: function(docId) {
         *         // onRemove event that applies only to the document being added.
         *     },
         *     stateless: false // Whether to maintain the state of tab content
         * }
         * ```
         * > Events set here are executed after the global event is executed.
         * @return {NUS.Documents} Returns the `Documents` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050205.html
         */
        add(docId: string, docNm: string, docOpts: N.Options.DocOpts): N.Documents;
        /**
         * Activates the content of the specified tab.
         *
         * @param {string} docId - The unique identifier for the document to activate.
         * @param {boolean} [isFromDocsTabList] - Arguments used inside the component.
         * @param {boolean} [isNotLoaded] - Arguments used inside the component.
         * @return {NUS.Documents} Returns the `Documents` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050205.html
         */
        active(docId: string, isFromDocsTabList?: boolean, isNotLoaded?: boolean): N.Documents;
        /**
         * Removes the state of the specified tab content.
         *
         * @param {string | N.Callbacks.Documents.RemoveState} [docId] - Unique identifier of the document whose status should be removed. When you enter a function, it is processed as a callback argument value.
         * @param {NUS.Callbacks.Documents.RemoveState} [callback] - Specify a callback function to be executed when you click the OK button in the warning window that appears when the maximum number of state maintenance is exceeded.
         * @return {NUS.Documents} Returns the `Documents` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050205.html
         */
        removeState(
            docId?: string | N.Callbacks.Documents.RemoveState,
            callback?: N.Callbacks.Documents.RemoveState,
        ): N.Documents;
        /**
         * Removes the contents of the specified tab.
         *
         * @param {string} docId - The unique identifier of the document to be removed.
         * @param {boolean} [unconditional] - Specifies whether to immediately remove the page without prompting even if there is modified data.
         * @return {NUS.Documents} Returns the `Documents` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050205.html
         */
        remove(docId: string, unconditional?: boolean): N.Documents;
        /**
         * Retrieves option information set for all currently open tab contents.
         *
         * @return {NUS.Options.DocsObject}
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050205.html
         */
        doc(): N.Options.DocsObject;
        /**
         * Retrieves option information set for the specified tab content.
         *
         * @param {string} docId - The unique identifier of the document to retrieve option information.
         * @return {NUS.Options.DocOpts} Option information set for the specified tab content
         */
        doc(docId: string): N.Options.DocOpts;
        /**
         * Retrieves the controller object for the given document ID.
         *
         * @param {string} docId - The unique identifier of the document.
         * @return {NA.Objects.Controller.Object} The controller object associated with the document ID.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050205.html
         */
        cont(docId: string): N.Objects.Controller.Object;
        /**
         * Reloads a document content by its identifier and executes a callback function upon completion.
         * > If you do not specify a value with the `request.attr` function before executing the reload function, the value of the request object before reload will be maintained even after reloading.
         *
         * @param {string} docId - The unique identifier of the document to be reloaded.
         * @param {NUS.Callbacks.Documents.Reload} [callback] - The callback function to execute after the document is reloaded.
         * `page's HTML code string` and `Communicator.request` object are input as arguments to the callback function.
         * ```
         * docsInstance.reload("docId", function(html, request) {
         *     N.log(html, request);
         * });
         * ```
         * @return {NUS.Documents} Returns the `Documents` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050205.html
         */
        reload(docId: string, callback?: N.Callbacks.Documents.Reload): N.Documents;
    }

    interface DocumentsRequest extends Documents {
        /**
         * Set the parameters to be passed to the page to be loaded.
         *
         * @param {String} name - Parameter name
         * @param {any} [obj] - Parameter data
         *
         * @return {DocumentsRequest} Returns the `DocumentsRequest` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050204.html
         */
        attr(name: string, obj?: any): DocumentsRequest;
        removeAttr(name: string): DocumentsRequest;
        /**
         * Extracts the GET parameter values from the browser's URL.
         *
         * @return {object} Returns all GET parameters as an object.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050204.html
         */
        param(): object;
        /**
         * Extracts the value of a GET parameter from the URL in the browser.
         *
         * @param {string} name - The key of the parameter to be retrieved.
         * @return {string} The value of the parameter
         */
        param(name: string): string;
        /**
         * Retrieves the current request options.
         *
         * @return {DocumentsRequest} Returns the `DocumentsRequest` instance for chaining.
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050204.html
         */
        get(): DocumentsRequest;
        /**
         * Retrieves for the value specified as a key in request options.
         *
         * @param {string} key - Property name of request options
         * @return {any} Value corresponding to the key value specified in request options
         *
         * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050204.html
         */
        get(key: string): any;
    }
}


declare namespace N {
    namespace Options {
        interface NotifyPosition {
            left?: number;
            right?: number;
            top?: number;
            bottom?: number;
        }
        interface Notify {
            /**
             * Specifies where the message will appear.
             *
             * It can be specified with the left / right / top / bottom properties of the options object.
             *
             * @default { top: 10, right: 10 }
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0501.html&tab=html/naturaljs/refr/refr050104.html
             */
            position?: NotifyPosition;
            /**
             * Specifies a global message container that contains message elements.
             *
             * @default N("body")
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0501.html&tab=html/naturaljs/refr/refr050104.html
             */
            container?: N<HTMLElement[]>;
            /**
             * An instance of the element that displays the message is assigned.
             *
             * @default undefined
             */
            context?: N<HTMLElement[]>;
            /**
             * Sets how long (in seconds) the message will be displayed.
             *
             * @default 7
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0501.html&tab=html/naturaljs/refr/refr050104.html
             */
            displayTime?: number;
            /**
             * If set to true, the message dialog will always appear on top.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0501.html&tab=html/naturaljs/refr/refr050104.html
             */
            alwaysOnTop?: boolean;
            /**
             * If set to true, HTML in the message will be rendered.
             *
             * @default false
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0501.html&tab=html/naturaljs/refr/refr050104.html
             */
            html?: boolean;
            /**
             * When applying the alwaysOnTop option, specify target elements for calculating the top z-index.
             *
             * > Specified with jQuery selector syntax.
             *
             * > If N.notify-related elements are obscured by other elements, add a selector for the obscuring element.
             *
             * @default "div, span, ul, p, nav, article, section, header, footer, aside"
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0501.html&tab=html/naturaljs/refr/refr050104.html
             */
            alwaysOnTopCalcTarget?: string;
        }

        interface DocsObject {
            [key: string]: DocOpts;
        }
        /**
         * Options that can be set whenever tab content is added to the Documents component.
         *
         * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050205.html}
         */
        interface DocOpts {
            /**
             * Document ID.
             */
            docId?: string;
            /**
             * Document name.
             */
            docNm?: string;
            /**
             * Document URL.
             */
            url: string;
            /**
             * Specifies whether to block responses when the `location.href` when requesting to the server is different from the `location.href` when receiving the response from the server.
             *
             * @default true
             */
            urlSync?: boolean;
            /**
             * onBeforeLoad event that applies only to the document being added.
             *
             * @default null
             */
            onBeforeLoad?: EventHandlers.Documents.OnBeforeLoad | null;
            /**
             * onLoad event that applies only to the document being added.
             *
             * @default null
             */
            onLoad?: EventHandlers.Documents.OnLoad | null;
            /**
             * onBeforeActive event that applies only to the document being added.
             *
             * @default null
             */
            onBeforeActive?: EventHandlers.Documents.OnBeforeActive | null;
            /**
             * onActive event that applies only to the document being added.
             *
             * @default null
             */
            onActive?: EventHandlers.Documents.OnActive | null;
            /**
             * onBeforeInactive event that applies only to the document being added.
             *
             * @default null
             */
            onBeforeInactive?: EventHandlers.Documents.OnBeforeInactive | null;
            /**
             * onInactive event that applies only to the document being added.
             *
             * @default null
             */
            onInactive?: EventHandlers.Documents.OnInactive | null;
            /**
             * onBeforeRemoveState event that applies only to the document being added.
             *
             * @default null
             */
            onBeforeRemoveState?: EventHandlers.Documents.OnBeforeRemoveState | null;
            /**
             * onRemoveState event that applies only to the document being added.
             *
             * @default null
             */
            onRemoveState?: EventHandlers.Documents.OnRemoveState | null;
            /**
             * onBeforeRemove event that applies only to the document being added.
             *
             * @default null
             */
            onBeforeRemove?: EventHandlers.Documents.OnBeforeRemove | null;
            /**
             * onRemove event that applies only to the document being added.
             *
             * @default null
             */
            onRemove?: EventHandlers.Documents.OnRemove | null;
            /**
             * Whether to maintain the state of tab content
             *
             * @default false
             */
            stateless?: boolean;
        }
        interface Documents {
            /**
             * Specifies the element to apply N.docs to.
             *
             * @default undefined
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            context?: N<HTMLElement[]>;
            /**
             * If set to true, N.docs are created in the tab-based Multiple-Document Interface(MDI) format, and if set to false, N.docs are created in the general Single-Document Interface(SDI) format.
             *  - true: Displays tab and page content.
             *  - false: Shows only one page content and no tabs.
             *
             * @default true
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            multi?: boolean;
            /**
             * If the multi option is true, you can set the maximum number of persistent tab contents to prevent your web browser from slowing down each time additional tab content is opened.
             * > When opening new content, if the number of open tab contents exceeds the maximum number of state retentions, the state of the content of the first opened tab is removed, and clicking on the tab from which state retention has been removed will reload the content.
             *
             * > A value of 0 does not limit the maximum number of stateful content.
             *
             * @default 0
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            maxStateful?: number;
            /**
             * If the multi option is true, you can set a maximum number of tab contents to prevent your web browser from slowing down each time additional tab content is opened.
             *
             * > When opening new content, if the number of open tab contents exceeds the maximum number of tabs, no more tab contents can be opened. To open new content, you must close one of your existing tabs.
             *
             * > A value of 0 does not limit the maximum number of stateful content.
             *
             * @default 0
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            maxTabs?: number;
            /**
             * If set to true, new tabs will be added last when you call the add method.
             *
             * @default false
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            addLast?: boolean;
            /**
             * If set to true, tabs can be scrolled by mouse drag or touch.
             *
             * @default false
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            tabScroll?: boolean;
            /**
             * Styles(CSS) that affect the tab element may cause the last tab to be cut off or have a gap.
             * At this time, you can adjust the following option values using the properties of the tabScrollCorrection object to display it normally.
             *  - rightCorrectionPx: This is an option that allows you to correct the appearance of the tab by increasing or decreasing it by 1 when the last tab is cut off or a space is created.
             * ```
             * N("#docs").docs({
             *     tabScrollCorrection: {
             *         rightCorrectionPx: 1
             *     }
             * });
             * ```
             * > If you set the `tabScrollCorrection` option in the `N.context.attr("ui.shell").docs` property of [Config(natural.config.js)](https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0102.html&tab=html/naturaljs/refr/refr010206.html), it will be applied to the entire N.docs component.
             *
             * @default { rightCorrectionPx: 0 }
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            tabScrollCorrection?: {
                rightCorrectionPx?: number;
            };
            /**
             * When you click the "Close All" button, if the closeAllRedirectURL option value is null, all tabs except the active tab will be closed, and if you enter a url string, you will be redirected to that url.
             *
             * When developing an SPA (Single Page Application), it is recommended to specify the URL of the "home" page so the browser can clean up unused resources.
             *
             * @default null
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            closeAllRedirectURL?: string | null;
            msgContext?: N<Window[]>;
            /**
             * If set to true, a progress bar will be displayed until all Ajax requests executed when the page is loaded are completed.
             *
             * @default false
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            entireLoadIndicator?: boolean;
            /**
             * If set to true, prevents double submissions by blocking the screen until all Ajax requests triggered during page load have completed.
             *
             * @default false
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            entireLoadScreenBlock?: boolean;
            /**
             * URLs specified as entireLoadExcludeURLs in entireLoad-related events or options (entireLoadIndicator, entireLoadScreenBlock, etc.) are excluded from capture.
             * > Set this when you want to exclude Ajax calls that are loaded outside the N.docs context when the page is first loaded.
             *
             * @default []
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            entireLoadExcludeURLs?: string[];
            entireLoadRequestCnt?: number;
            entireLoadRequestMaxCnt?: number;
            /**
             * This event runs before content is loaded.
             * ```
             * onBeforeLoad: function(docId, target) {
             *     // docId: document id
             *     // target: Element to place loaded content
             *
             *     var doc = this.doc(docId); // Get document information
             * }
             * ```
             * > It will not be called again until the open page is closed.
             *
             * > Because it is executed before the page is loaded, the Controller object of the page loaded with the cont method cannot be obtained.
             *
             * @default null
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            onBeforeLoad?: EventHandlers.Documents.OnBeforeLoad | null;
            /**
             * This event runs after the page is loaded.
             * ```
             * onLoad: function(docId) {
             *     // docId: document id
             *
             *     var doc = this.doc(docId); // Get document information
             *     var cont = this.cont(docId); // Get the Controller object of the document
             *     var view = cont.view;
             *     var request = cont.request;
             * }
             * ```
             * > It will not be called again until the open page is closed.
             *
             * @default null
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            onLoad?: EventHandlers.Documents.OnLoad | null;
            /**
             * This is an event that is executed before any Ajax requests are captured when the page is loading.
             * ```
             * onBeforeEntireLoad: function(docId) {
             *     // docId: document id
             *
             *     var doc = this.doc(docId); // Retrieve document information
             * }
             * ```
             * > The event is executed once before the content is loaded, which means it is not possible to retrieve the Controller object of the page loaded using the `cont` method at this point.
             *
             * @default null
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html
             */
            onBeforeEntireLoad?: EventHandlers.Documents.OnBeforeEntireLoad | null;
            /**
             * Defines an event handler that is executed when an error occurs before page loading is complete and all Ajax requests are completed.
             * ```
             * onErrorEntireLoad: function(e, request, xhr, textStatus, callback) {
             *     // e(arguments[0]): ErrorThrown
             *     // request(arguments[1]): Communicator.request
             *     // xhr(arguments[2]): jQuery XMLHttpRequest
             *     // textStatus(arguments[3]): "success" (if the request succeeds) or "error" (if an error occurs in the submit callback during the request (on the server-side))
             *     // callback(arguments[4]): If the textStatus value is "success," this is the callback function specified as an argument for the submit method.
             * }
             * ```
             * > The event handler function of onErrorEntireLoad is the same as the `callback` parameter of the `N.comm.error` method.
             *
             * @default null
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            onErrorEntireLoad?: EventHandlers.Documents.OnErrorEntireLoad | null;
            /**
             * Defines an event handler that is executed after page loading is complete and all Ajax requests are completed.
             * ```
             * onEntireLoad: function(docId, entireLoadRequestCnt, entireLoadRequestMaxCnt) {
             *     // docId: document id
             *     // entireLoadRequestCnt: Number of completed requests
             *     // entireLoadRequestMaxCnt: Maximum number of requests that can be completed
             *
             *     var doc = this.doc(docId); // Get document information
             *     var cont = this.cont(docId); // Get the Controller object of the document
             *     var view = cont.view;
             *     var request = cont.request;
             * }
             * ```
             *
             * @default null
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            onEntireLoad?: EventHandlers.Documents.OnEntireLoad | null;
            /**
             * Defines an event handler that runs before the selected tab is activated.
             * ```
             * onBeforeActive: function(docId) {
             *     // docId: document id
             *
             *     var doc = this.doc(docId); // Get document information
             *     var cont = this.cont(docId); // Get the Controller object of the document
             *     var view = cont.view;
             *     var request = cont.request;
             * }
             * ```
             *
             * @default null
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            onBeforeActive?: EventHandlers.Documents.OnBeforeActive | null;
            /**
             * Defines an event handler that runs after the selected tab is activated.
             * ```
             * onActive: function(docId) {
             *     // docId: document id
             *
             *     var doc = this.doc(docId); // Get document information
             *     var cont = this.cont(docId); // Get the Controller object of the document
             *     var view = cont.view;
             *     var request = cont.request;
             * }
             * ```
             *
             * @default null
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            onActive?: EventHandlers.Documents.OnActive | null;
            /**
             * Defines an event handler that runs before the selected tab is disabled.
             * ```
             * onBeforeInactive: function(docId) {
             *     // docId: document id
             *
             *     var doc = this.doc(docId); // Get document information
             *     var cont = this.cont(docId); // Get the Controller object of the document
             *     var view = cont.view;
             *     var request = cont.request;
             * }
             * ```
             *
             * @default null
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            onBeforeInactive?: EventHandlers.Documents.OnBeforeInactive | null;
            /**
             * Defines an event handler that runs after the selected tab is disabled.
             * ```
             * onInactive: function(docId) {
             *     // docId: document id
             *
             *     var doc = this.doc(docId); // Get document information
             *     var cont = this.cont(docId); // Get the Controller object of the document
             *     var view = cont.view;
             *     var request = cont.request;
             * }
             * ```
             *
             * @default null
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            onInactive?: EventHandlers.Documents.OnInactive | null;
            /**
             * Defines an event handler that runs before the state of the selected tab is removed.
             * ```
             * onBeforeRemoveState: function(docId) {
             *     // docId: document id
             *
             *     var doc = this.doc(docId); // Get document information
             *     var cont = this.cont(docId); // Get the Controller object of the document
             *     var view = cont.view;
             *     var request = cont.request;
             * }
             * ```
             *
             * @default null
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            onBeforeRemoveState?: EventHandlers.Documents.OnBeforeRemoveState | null;
            /**
             * Defines an event handler that runs after the state of the selected tab is removed.
             * ```
             * onRemoveState: function(docId) {
             *     // docId: document id
             *
             *     var doc = this.doc(docId); // Get document information
             *     var cont = this.cont(docId); // Get the Controller object of the document
             *     var view = cont.view;
             *     var request = cont.request;
             * }
             * ```
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            onRemoveState?: EventHandlers.Documents.OnRemoveState | null;
            /**
             * Defines an event handler that runs before the selected tab is removed.
             * ```
             * onBeforeRemove: function(docId) {
             *     // docId: document id
             *
             *     var doc = this.doc(docId); // Get document information
             *     var cont = this.cont(docId); // Get the Controller object of the document
             *     var view = cont.view;
             *     var request = cont.request;
             * }
             * ```
             *
             * @default null
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            onBeforeRemove?: EventHandlers.Documents.OnBeforeRemove | null;
            /**
             * Defines an event handler that runs after the selected tab is removed.
             * ```
             * onRemove: function(docId) {
             *     // docId: document id
             *
             *     var doc = this.doc(docId); // Get document information
             *     var cont = this.cont(docId); // Get the Controller object of the document
             *     var view = cont.view;
             *     var request = cont.request;
             * }
             * ```
             *
             * @default null
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            onRemove?: EventHandlers.Documents.OnRemove | null;
            docs?: DocsObject;
            /**
             * If set to true, the menu list dialog will always appear at the top.
             *
             * @default false
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            alwaysOnTop?: boolean;
            /**
             * When applying the `alwaysOnTop` option, specify target elements for calculating the top z-index.
             * > Specified with jQuery selector syntax.
             *
             * > If N.docs-related elements are obscured by other elements, add a selector for the obscuring element.
             *
             * @default "div, span, ul, p, nav, article, section, header, footer, aside"
             *
             * @see {@link https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/refr/refr0502.html&tab=html/naturaljs/refr/refr050203.html}
             */
            alwaysOnTopCalcTarget?: string;
            order?: string[];
            loadedDocId?: string | null;
        }
    }

    namespace EventHandlers {
        namespace Documents {
            interface OnBeforeEntireLoad {
                (this: N.Documents, docId?: string): void;
            }
            interface OnErrorEntireLoad {
                (
                    this: N.Documents,
                    e: Error,
                    request: N.Request,
                    xhr: JQueryXHR,
                    textStatus: "success" | "error",
                    submitCallback: N.Callbacks.Communicator.Submit,
                ): void;
            }
            interface OnEntireLoad {
                (
                    this: N.Documents,
                    docId: string,
                    entireLoadRequestCnt: number,
                    entireLoadRequestMaxCnt: number,
                ): void;
            }
            interface OnBeforeLoad {
                (this: N.Documents, docId: string, target: N<HTMLElement[]>): void;
            }
            interface OnLoad {
                (this: N.Documents, docId: string): void;
            }
            interface OnBeforeActive {
                (this: N.Documents, docId: string, isFromDocsTabList: boolean, isNotLoaded: boolean): void;
            }
            interface OnActive {
                (this: N.Documents, docId: string, isFromDocsTabList: boolean, isNotLoaded: boolean): void;
            }
            interface OnBeforeInactive {
                (this: N.Documents, docId?: string): void;
            }
            interface OnInactive {
                (this: N.Documents, docId?: string): void;
            }
            interface OnBeforeRemoveState {
                (this: N.Documents, docId?: string): void;
            }
            interface OnRemoveState {
                (this: N.Documents, docId?: string): void;
            }
            interface OnBeforeRemove {
                (this: N.Documents, docId?: string): void;
            }
            interface OnRemove {
                (this: N.Documents, docId?: string): void;
            }
        }
    }

    namespace Callbacks {
        namespace Documents {
            interface RemoveState {
                (this: N.Documents, docId?: string): void;
            }
            interface LoadContent {
                (this: N.Documents): void;
            }
            interface Reload {
                (this: N.Communicator, html?: string, request?: N.Request): void;
            }
        }
    }
}


declare class NCD {
    static inspection: {
        test(codes: string, rules?: string[]): boolean | N.CodeInspectionResult[];
        rules: {
            NoContextSpecifiedInSelector(codes: string, excludes: string[], report: N.CodeInspectionResult[]): void;
            UseTheComponentsValMethod(codes: string, excludes: string[], report: N.CodeInspectionResult[]): void;
        };
        report: {
            console(data: N.CodeInspectionResult[], url: string): false | undefined;
        };
    };

    static addSourceURL(codes: string, sourceURL: string): string;
}


declare namespace N {
    /* eslint-disable-next-line @definitelytyped/no-const-enum */
    const enum SeverityLevels {
        BLOCKER = "Blocker",
        CRITICAL = "Critical",
        MAJOR = "Major",
        MINOR = "Minor",
    }

    interface CodeInspectionResult {
        level: SeverityLevels.BLOCKER | SeverityLevels.CRITICAL | SeverityLevels.MAJOR | SeverityLevels.MINOR;
        message: string;
        line: number;
        code: string;
    }
}


declare class NT {
    static readonly aop: {
        codes(cont: N.Objects.Controller.Object, joinPoint: unknown): void;
        template(cont: N.Objects.Controller.Object, joinPoint: unknown): void;
        components(cont: N.Objects.Controller.Object, prop: string, compActionDefer: JQuery.Deferred<any>[]): void;
        events(cont: N.Objects.Controller.Object, prop: string): void;
    };
}


declare namespace N {
    namespace Options {
        interface Extra {
            /**
             * After the component is initialized, the specified function is immediately executed.
             *  - string: Function name
             *  - ...any[]: Arguments of the function
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/template/documents/template-guide.html
             */
            action?: string | [string, ...any[]];
            /**
             * Form usage. If set to the string "search-box", the target area is rendered as a search box Form. For more detailed options, use an object.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/template/documents/template-guide.html
             */
            usage?: string | {
                "search-box": {
                    defaultButton?: JQuery.Selector;
                    events?: {
                        event: string;
                        target: JQuery.Selector;
                        handler: N.Objects.Controller.EventHandler;
                    }[];
                };
            };
        }
        /**
         * Represents a function type for filtering an array of JSON objects.
         *
         * @param {N<JSONObject[]>} data - Data to process.
         * @returns {N<JSONObject[]>} - Processed data.
         */
        interface SelectFilter {
            (data: N<N.JSONObject[]>): N<N.JSONObject[]>;
        }
        interface Select {
            /**
             * Common code classification code - Set the classification code value of the code list to bind.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/template/documents/template-guide.html
             */
            code?: string;
            /**
             * The Communicator to retrieve the list - Specify `c.{serviceName}` declared in the Controller object.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/template/documents/template-guide.html
             */
            comm?: string;
            /**
             * Data to bind - You can directly create and bind data like [{}, {}] through the `data` option without specifying the `comm` option.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/template/documents/template-guide.html
             */
            data?: N.JSONObject[];
            /**
             * Property name of the data bound to the label of the selection element - Set the property name to bind from the retrieved data object.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/template/documents/template-guide.html
             */
            key?: string;
            /**
             * Property name of the data bound to the value of the selection element - Set the property name to bind from the retrieved data object.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/template/documents/template-guide.html
             */
            val?: string;
            /**
             * Data filter - Filters the common code data before binding.
             *
             * ```
             * "filter": function (data) {
             *     // If you process data (original data) and return it, the processed data is bound.
             *     return N(N.array.deduplicate(data, "age")).datasort("age"); // Sort after removing duplicates.
             * }
             * ```
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/template/documents/template-guide.html
             */
            filter?: SelectFilter;
            /**
             * Default selected value - Set the value of the default selection when the component is initialized.
             *
             * @default undefined
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/template/documents/template-guide.html
             */
            selected?: string;
        }
    }

    namespace Objects {
        namespace Controller {
            /**
             * EventHandler is a type definition for a callback function used to handle events.
             *
             * @see https://bbalganjjm.github.io/natural_js/?page=html/naturaljs/template/documents/template-guide.html
             */
            interface EventHandler {
                (this: HTMLElement, e: JQuery.Event, ...args: any[]): void;
            }

            type InitialObject =
                & {
                    [K in `p.alert.${string}`]: (NT.Options.Extra & N.Options.Alert);
                }
                & {
                    [K in `p.button.${string}`]: (NT.Options.Extra & N.Options.Button);
                }
                & {
                    [K in `p.datepicker.${string}`]: (NT.Options.Extra & N.Options.Datepicker);
                }
                & {
                    [K in `p.popup.${string}`]: (NT.Options.Extra & N.Options.Popup);
                }
                & {
                    [K in `p.tab.${string}`]: (NT.Options.Extra & N.Options.Tab);
                }
                & {
                    [K in `p.select.${string}`]:
                        | [string, string?, string?, N.Options.SelectFilter?]
                        | N.Options.Select;
                }
                & {
                    [K in `p.form.${string}`]: (NT.Options.Extra & N.Options.Form);
                }
                & {
                    [K in `p.list.${string}`]: (NT.Options.Extra & N.Options.List);
                }
                & {
                    [K in `p.grid.${string}`]: (NT.Options.Extra & N.Options.Grid);
                }
                & {
                    [K in `p.pagination.${string}`]: (NT.Options.Extra & N.Options.Pagination);
                }
                & {
                    [K in `p.tree.${string}`]: (NT.Options.Extra & N.Options.Tree);
                }
                & {
                    [K in `c.${string}`]: (...args: any[]) => N.Communicator;
                }
                & {
                    [K in `e.${string}`]: EventHandler | {
                        target: JQuery.Selector;
                        handler: EventHandler;
                    };
                };

            type Object =
                & N.Objects.Controller.BaseObject
                & InitialObject
                & {
                    [K in `p.alert.${string}`]: N.Alert;
                }
                & {
                    [K in `p.button.${string}`]: N.Button;
                }
                & {
                    [K in `p.datepicker.${string}`]: N.Datepicker;
                }
                & {
                    [K in `p.popup.${string}`]: N.Popup;
                }
                & {
                    [K in `p.tab.${string}`]: N.Tab;
                }
                & {
                    [K in `p.select.${string}`]: N.Select;
                }
                & {
                    [K in `p.form.${string}`]: N.Form;
                }
                & {
                    [K in `p.list.${string}`]: N.List;
                }
                & {
                    [K in `p.grid.${string}`]: N.Grid;
                }
                & {
                    [K in `p.pagination.${string}`]: N.Pagination;
                }
                & {
                    [K in `p.tree.${string}`]: N.Tree;
                }
                & {
                    [K in `e.${string}`]: N<HTMLElement[]>;
                };
        }
    }
}


export = N;
export as namespace N;
