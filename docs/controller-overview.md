# Overview

Controller(N.cont) is a class that implements the Controller layer of the CVC Architecture Pattern.

![](../images/intr/pic4.png)
*[ Natural-ARCHITECTURE ]*

N.cont executes the init function of the Controller object and returns the Controller object.

The Controller object is an object that controls the elements of the View and the data retrieved from the Communicator.

N.cont should be declared right below the View area of the page as follows:

```javascript
<article class="view">
    <p>View area</p>
</article>

<script type="text/javascript">
    N(".view").cont({ //  Controller object
        init : function(view, request) {
        }
    });
</script>
```

When you load a page with the above structure using the N.popup, N.tab components or the N.comm library, the init function of the Controller object is called when the page loading is completed.

> For a Natural-ARCHITECTURE based page to work properly, it must be loaded with the N.comm library or the N.popup, N.tab components.

> When selecting page elements, you must either find from the view or specify the view as the context argument (second argument) of the jQuery function. Otherwise, unintended elements from other block pages may be selected, which can lead to unpredictable errors. For more information, refer to the [Restrictions and Tips](restrictions.md) section.

> When you execute N(".view").cont(), a pageid data attribute value such as data-pageid="view" is created in the `.view` element specified by the selector.
This pageid is generated with the characters ". (dot), # (sharp), [ (left bracket), ] (right bracket), ' (single quote), : (colon), ( (left parenthesis), ) (right parenthesis), > (right angle bracket), space, - (hyphen)" removed, so it's best to define the page identifier without these characters.
For example, N("page.view-01").cont() will have the dot and hyphen removed, creating the pageid as "pageview01".

You can get the Controller object to control a specific page in block pages, tab contents, etc. as follows:

```javascript
var page01Cont = N("#page01").instance("cont");
page01Cont.gridInst.bind([]);
```
