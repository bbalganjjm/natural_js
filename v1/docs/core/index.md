# Concepts

* [N (static functions)](n-static.md) - Static helpers on the N object - N.version, N.locale, console logging, N.error, N.type and the is* predicates, N.toSelector and N.serialExecute.
* [N.array](array.md) - Array helper - N.array.deduplicate returns a new array without duplicate values, or without objects that repeat a given key.
* [N.browser](browser.md) - Browser helpers - read, write and remove cookies, detect the browser or mobile OS, read the IE version, get the URL context path and measure the scrollbar width.
* [N.date](date.md) - Date helpers - parse digit strings into Date objects, format them with PHP-style format characters (Date.prototype.formatDate), compute day differences, convert timestamps and build a month calendar.
* [N.element](element.md) - HTML element helpers - read data-opts and data-format/data-validate rules, turn input elements into a data object, flash a changed element and find the highest z-index.
* [N.event](event.md) - Event helpers - a number-key filter for keydown handlers, a handler that cancels an event completely, a wheel scroll lock, and CSS animation or transition end-event detection.
* [N.gc](gc.md) - Unbinds the global window and document event handlers that Natural-JS components leave behind; N.comm runs it automatically when it replaces the main page content.
* [N.json](json.md) - JSON data helpers - mapFromKeys projects objects onto chosen keys, mergeJsonArray appends rows with new key values to an array, and format pretty-prints JSON.
* [N.mask](mask.md) - User-format mask engine behind the generic and numeric rules of N.formatter - setGeneric applies @ # ~ character masks and setNumeric applies #,##0.00 style number masks. (draft)
* [N.message](message.md) - Locale-aware message lookup - N.message.get picks the message for the current N.locale() from a resource object and fills {0}, {1} placeholders.
* [N.string](string.md) - String helpers - contains, startsWith, endsWith, insertAt, lpad and rpad, byteLength, removeWhitespace, isEmpty and the null-safe trimTo* family.
* [N()](n-function.md) - N(selector[, context]) returns a jQuery collection built by the NJS subclass; Natural-JS adds the :regexp selector and core plugin methods such as instance, tpBind, vals and events.
