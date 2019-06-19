## Natural-UI v0.37.158
 * Appended code to prevent memory leaks related to DOM elements.
 * N.alert: Fixed a bug that caused the message dialog to be hidden when the show method was called again with an input message displayed.
 * N.alert, N.popup : Added "saveMemory" option.
 * N.alert, N.popup : Added "escClose" option.
 * N.popup : Fixed a bug where jQuery.extend related errors occured when the opener option was specified.
 * N.popup : Fixed a bug where if onOpen was caught by AOP, setting the closeMode option to "remove" and opening the popup would cause an error.
 * N.popup : The logic flow was redefined and applied when setting the preload(true) and closeMode(remove) options together.
 * N.popup : Added code to allow more memory resources to be reused when the closeMode option is "remove".
 * N.tab : Fixed a bug where tabs were not selected when clicking the tab with the mouse and opening the previous tab with the "open" method.
 * N.tab : The function has been changed so that idx information is returned correctly when the open function is called with no arguments, and the remaining information is returned as a string message value.
   * If the "open" method was last executed after the "open (idx)" method was executed, the last tab information was being returned because the content had not yet been loaded.
 * N.tab : If you have not yet loaded the tab content and you have called the "cont" method, prompted a warning message on the console.
 * N.popup : Added "onLoad" event option.
 * N.form, N.list, N.grid : Added a tpBind option that allows you to execute the events associated with a component before other events to prevent potential errors in the order of component initialization and event binding.
 * N.form, N.list, N.grid : Reduced memory usage for checkbox and radio input elements in data binding.
 * N.form : Splitted the event binding part of the bind function into functions of the Form.prototype.bindEvents object.
 * N.form : Fixed the "data_changed__" class being added even if the "focusout" event occurs without changing the value of the input element when the column value is null.
   * Empty spaces("") and null are treated as the same value when check whether the value has changed
   * Applies to all components that use N.form.
 * N.form : Added the feature to display a Warnning message without an error if the "id" attribute value is blank.
 * N.form : Fixed a bug where the validate option was set to false and the select element was not validated when the validate method was called.
   * N.grid and N.list components using N.form are also applied.
 * N.grid : Fixed a bug where filtering list disappears when you click "Select All" in dataFilter.
 * N.grid : Fixed a bug where the column resize function does not work properly when the height option is 0.
 * N.grid : Fixed a bug where filter item name was broken when searching filter item in filter dialog.
 * N.grid : Fixed a bug in the setTheadCellInfo function that the column id information was not entered in the first TH depending on the TH element placement of THEAD.
 * N.grid : Fixed a bug where the first column of TBODY would not be merged according to the TH element placement of THEAD when row-merging by declaring data-rowspan = "true".
 * N.grid : Fixed a bug where the filter function is not activated in the first column depending on the TH element placement of THEAD in the filter function.
 * N.grid : Fixed bug where the table has a crash when the cell has a "hidden" attribute and binds empty data.
 * N.grid : The left position of the last ".resize_bar__" element has been moved so that it does not exceed the table width.
 * N.grid : Improved the accuracy of the "resizable" feature and eliminated the potential memory leak.  
 * N.grid, N.list : Changed the feature to execute the "rowHandler" and "rowHandlerBeforeBind" event handlers when calling the revert method.
 * N.grid, N.list : Fixed a bug where scrolling paging does not work on the latest Android chrome engine based apps. 
 * N.ui.draggable.events : Fixed a bug where screen elements could not be selected when the function finished.
 
## Natural-ARCHITECTURE v0.13.10
 * N.comm : Changed the "submit" method to return Controller(IN.const) object to argument of callback function when html page is requested.  
 * N.comm.request : Fixed a bug where the parameter was not sent to the server if you specified the parameter directly in the "data" option.
 * N.comm.request : Complemented the feature that can be send all types parameters(such as FormData) to server, in addition to object and string.
 
## Natural-DATA v0.10.56
 * N.formatter.date : Fixed a bug where date format would not be applied unless you opened the date picker dialog and clicked on the date element.
 * N.formatter : Changed the "rrn", "ssn", "kbrn", "zipcode" and "phone" methods to detect and handle only numbers and asterisks(*).
 * N.validator : Changed the "rrn", "frn", "frn_rrn", "kbrn", "kcn" and "time" methods to detect and handle only numbers and asterisks(*).
 
## Natural-CORE v0.17.18
 * N.tpBind : Changed the $.bind method to the $.on method and made all the functionality of the $ .on method available.
 * N.debug, N.log, N.info, N.warn : Changed the functionality to accurately show where the message originated.

## Natural-UI.Shell v0.9.39
 * N.notify : Fixed a bug where the position option does not apply in some status.
 * N.docs : Improved accuracy of the onEntireLoad event.
 * N.docs : Relocate "EntireLoad" related source code.
 * N.docs : Added "createLoadIndicator, updateLoadIndicator, removeLoadIndicator, errorLoadIndicator" functions to the Documents class so that the loading indicator can be used externally.
 * N.docs : Added "urlSync" option.

## Natural-CODE v0.1.1
 * A new package was born. I will announce the related content later.

## Natural-TEMPLATE v0.0.6
 * A new package was born. I will announce the related content later.

## natural.ui.css
 * ".entire_load_indicator" in N.docs related styles changed.
 * N.tab related styles changed.

## natural.config.js
 * Message levels setting value(N.context.attr("core").consoleLogLevel) of N.debug, N.log, N.info, and N.warn methods have been removed.

## For more information on added and changed features, refer to the API manual(http://bbalganjjm.github.io/natural_js/)