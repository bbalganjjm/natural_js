## Natural-UI v0.38.198
 * N.form,N.grid,N.list : Fixed a bug where calling the validate function after selecting an empty value and then selecting the non-empty value did not change the underlying data from the select element with the "required" validation rule applied.
 * N.grid, N.list : Improved performance of the "val" method.
 * N.grid : Changed the filter panel to not recognize HTML to block XSS attacks.
 * N.form.prototype.bindEvents.dataSync : Fixed a bug that didn't show the validation message when you first called the validate method.
   * The same applies to N.grid and N.list using N.form.
 * N.tab : Added a margin to the scroll button.
 * N.tab : Fixed a bug where tab scroll buttons were displayed when tabs did not exceed the screen when the "tabScroll" option was enabled.
 * N.tab : Fixed a bug that sometimes caused tabs to break in appearance when the "tabScroll" option was enabled.
 * N.tab : Changed the feature to use the native scrolling when the tab scroll option is enabled in a browser with a zero scroll size(mobile, etc.).

## Natural-ARCHITECTURE v0.13.11
 *

## Natural-DATA v0.10.70
 * N.formatter.date : Fixed a bug that the date format was not removed when clicking the screen after the datepicker was displayed.
 * N.formatter.phone : Changed a function so that phone numbers masked with an asterisk(*) can also be formatted.

## Natural-CORE v0.17.22
 *

## Natural-UI.Shell v0.9.45
 *

## Natural-CODE v0.1.4
 *

## Natural-TEMPLATE v0.0.7
 *

## natural.ui.css
 * Fixed a bug that caused the table to crash intermittently when the N.grid's "fixedcol" option was applied.
 * Changed styles related to N.grid's "filter" functionality.
 * Changed styles related to N.grid's "more" functionality.
 * Changed N.alert, N.tab, N.list, N.grid, N.notify, N.docs related styles.
 
## natural.config.js
 *

## For more information on added and changed features, refer to the API manual(http://bbalganjjm.github.io/natural_js/)