Restrictions
===
###Restrict jQuery feature usage
1. Using the jQuery.ajax function disables the Communication Filter feature. You must use Communicator(N.comm) to communicate with the server.
2. If you change the value using the jQuery.val method on an input element that has bound data using a UI component, only the value on the screen changes, and the internal data does not change. You must use the component's val method.

###Precautions on selecting elements with jQuery
When you select an element with jQuery, you must find in view or set view as context.

```
N(".pageId").cont({
    init: function(view, request) {
        $("selector", view);
        view.find("selector");
    }
});
```