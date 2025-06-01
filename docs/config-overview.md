# Overview

Config(natural.config.js) is a space for storing Natural-JS operational environment settings, AOP settings, Communication Filter settings, global option values for UI components, etc.

It is defined in the natural.config.js file and the settings are stored separately in N.context as attribute values for each package.
* N.context.attr("core"): Default settings for Natural-CORE package libraries.
* N.context.attr("architecture"): Default settings for Natural-ARCHITECTURE package libraries.
* N.context.attr("data"): Default settings for Natural-DATA package libraries.
* N.context.attr("ui"): Default settings for Natural-UI package libraries.
* N.context.attr("ui.shell"): Default settings for Natural-UI.Shell package libraries.

There are two required attributes that must be set when applying Natural-JS:
1. N.context.attr("architecture").page.context: Specifies the container area (element) where the web application's content is displayed as a jQuery selector string.
   
   If you use the [Documents](N.docs) component, it is automatically entered.
   
   If your web application is created with an SPA (Single Page Application) structure, please specify the element that loads the menu page, otherwise enter "body" or the element that wraps the entire content.

2. N.context.attr("ui").alert.container: Specifies the area (element) where the elements of N.alert and N.popup components will be stored as a jQuery selector string.
   
   If you use the [Documents](N.docs) component, it is automatically entered.
   
   If your web application is created with an SPA (Single Page Application) structure, please specify the element that loads the menu page, otherwise enter "body" or the element that wraps the entire content.

The order in which component options are applied is as follows:

1. Option values specified when initializing the component.
2. Option values specified in Config(natural.config.js).
3. Default option values of the component.
   
   If you set a global event option, the global event is executed first, followed by the event specified during component initialization.
