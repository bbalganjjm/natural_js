Restrictions
===
###⊙ Restrict jQuery feature usage
1. Using the jQuery.ajax function disables the Communication Filter feature. You must use Communicator(N.comm) to communicate with the server.
2. If you change the value using the jQuery.val method on an input element that has bound data using a UI component, only the value on the screen changes, and the internal data does not change. You must use the component's val method.

###⊙ Precautions on selecting elements with jQuery
When selecting an element of the page, you must find in view or specify view as the context argument(second argument) of the jQuery function. Otherwise, unintentional elements of other block pages may be selected, resulting in unpredictable errors.

```
N(".pageId").cont({
    init: function(view, request) {
        $("selector", view);
        view.find("selector");
    }
});
```