Overview
===

Popup(N.popup) is a UI component that makes a layer popup form the internal element specified by the context option or the page specified by the url option.

 * When you create a page specified by the url option as a popup, caller(N.popup instance that called itself) and opener(The parent page's Controller object that called itself, You pass it as an option when creating a popup.) properties are added to the Controller object of the created popup. You can control the parent page using opener, or you can close itself or send data to the parent Controller using caller.

<p class="alert">If the Popup dialog box is not displayed and an error occurs, you must specify the element where N.alert-related elements will be stored as a jQuery selector string in the N.context.attr("ui").alert.container property of <a href="#html/naturaljs/refr/refr0102.html">Config(natural.config.js)</a>.</p>