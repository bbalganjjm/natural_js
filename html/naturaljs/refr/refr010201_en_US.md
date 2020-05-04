Overview
===

Config(N.config) is a place to save Natural-JS operation environment setting, AOP setting, Communication Filter setting, UI global option value, etc.

Defined in the natural.config.js file and the configuration values ​​are stored separately in N.context as property values ​​for each package.
 * N.context.attr("core") : Default values ​​for the libraries in the Natural-CORE package.
 * N.context.attr("architecture") : Default values ​​for the libraries in the Natural-ARCHITECTURE package.
 * N.context.attr("data") : Default values ​​for the libraries in the Natural-DATA package.
 * N.context.attr("ui") : Default values ​​for the libraries in the Natural-UI package.
 * N.context.attr("ui.shell") : Default values ​​for the libraries in the Natural-UI.Shell package.

There are two essential attribute values ​​to set when applying Natural-JS.
 1. N.context.attr("architecture").page.context : Specify as a jQuery selector string the container area (element) where the contents of the web application are displayed.
	<div class="alert" style="display: block;">If you use the Documents(N.docs) component, it is filled in automatically.</div>
	<div class="alert" style="display: block;">If the web application is built with a single page application (SPA) structure, specify the element that contains the menu page, otherwise enter "body" or an element that wraps the entire content.</div>
 2. N.context.attr("ui").alert.container : Specify as a jQuery selector strings the area (element) in which the elements of N.alert and N.popup components will be stored.
	<div class="alert" style="display: block;">If you use the Documents(N.docs) component, it is filled in automatically.</div>
	<div class="alert" style="display: block;">If the web application is built with a single page application (SPA) structure, specify the element that contains the menu page, otherwise enter "body" or an element that wraps the entire content.</div>

The order in which the component options are applied is as follows.

1. Option value specified when initializing the component.
2. Option value specified in Config(N.config).
3. Default option value of the component.
	<div class="alert" style="display: block;">If you set the global event option, the global event is executed first, and then the event specified when the component is initialized.</div>