## Natural-UI v0.37.158
 * Appended code to prevent memory leaks related to DOM elements.
 * N.alert: Fixed a bug that caused the message dialog to be hidden when the show method was called again with an input message displayed.
 * N.alert, N.popup : Added saveMemory option.
 * N.popup : Fixed a bug where jQuery.extend related errors occured when the opener option was specified.
 * N.popup : Fixed a bug where if onOpen was caught by AOP, setting the closeMode option to "remove" and opening the popup would cause an error.
 * N.popup : The logic flow was redefined and applied when setting the preload(true) and closeMode(remove) options together.
 * N.popup : Added code to allow more memory resources to be reused when the closeMode option is "remove".
 * N.form, N.list, N.grid : Added a tpBind option that allows you to execute the events associated with a component before other events to prevent potential errors in the order of component initialization and event binding.
 * N.form, N.list, N.grid : Reduced memory usage for checkbox and radio input elements in data binding.
 * N.form : Splitted the event binding part of the bind function into functions of the Form.prototype.bindEvents object.
 * N.grid : Fixed a bug where filtering list disappears when you click "Select All" in dataFilter.
 * N.grid : Fixed a bug where the column resize function does not work properly when the height option is 0.
 * N.grid : Fixed a bug where filter item name was broken when searching filter item in filter dialog.
 * N.grid, N.list : Changed the feature to execute the "rowHandler" and "rowHandlerBeforeBind" event handlers when calling the revert method.
 * N.form : Fixed the "data_changed__" class being added even if the "focusout" event occurs without changing the value of the input element when the column value is null.
   * Empty spaces("") and null are treated as the same value when check whether the value has changed
   * Applies to all components that use N.form.
 * N.form : Added the feature to display a Warnning message without an error if the "id" attribute value is blank.
 * N.form : Fixed a bug where the validate option was set to false and the select element was not validated when the validate method was called.
   * N.grid and N.list components using N.form are also applied.
 * N.ui.draggable.events : Fixed a bug where screen elements could not be selected when the function finished.
 
## Natural-ARCHITECTURE v0.13.10
 * N.comm.request : Fixed a bug where the parameter was not sent to the server if you specified the parameter directly in the "data" option.
 * N.comm.request : Complemented the feature that can be send all types parameters(such as FormData) to server, in addition to object and string.

## Natural-DATA v0.10.56
 * N.formatter.date : Fixed a bug where date format would not be applied unless you opened the date picker dialog and clicked on the date element.
 * N.formatter : Changed the "rrn", "ssn", "kbrn", "zipcode" and "phone" methods to detect and handle only numbers and asterisks(*).
 * N.validator : Changed the "rrn", "frn", "frn_rrn", "kbrn", "kcn" and "time" methods to detect and handle only numbers and asterisks(*).
 
## Natural-CORE v0.17.18
 * N.tpBind : Changed the $.bind method to the $.on method and made all the functionality of the $ .on method available.

## Natural-UI.Shell v0.9.39
 * N.notify : Fixed a bug where the position option does not apply in some status.
 * N.docs : Improved accuracy of the onEntireLoad event.
 * N.docs : Relocate "EntireLoad" related source code.
 * N.docs : Added "createLoadIndicator, updateLoadIndicator, removeLoadIndicator, errorLoadIndicator" functions to the Documents class so that the loading indicator can be used externally.
 * N.docs : Added "urlSync" option.

## Natural-CODE v0.1.1
 * 탄생

## natural.ui.css
 * ".entire_load_indicator" in N.docs related styles changed.
 * N.tab related styles changed.

## For more information on added and changed features, refer to the API manual(http://bbalganjjm.github.io/natural_js/)








