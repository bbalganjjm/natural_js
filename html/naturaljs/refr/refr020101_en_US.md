Overview
===

Controller(N.cont) is a class that implements Controller layer of CVC Architecture Pattern.

![](images/intr/pic4.png)
<center>[ Natural-ARCHITECTURE ]</center>

N.cont executes the init function of the Controller object and returns a Controller object.
<p class="alert">The Controller object is the object that controls the elements of the View and the data retrieved by Communicator.</p>

N.cont should be declared just below the View area of the page as follows:

```
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

If you load a page with the above structure into an N.popup, N.tab component or N.comm library, the init function of the Controller object is called when the page has finished loading.
> Pages based on Natural-ARCHITECTURE must be loaded into N.comm, N.popup or N.tab to work properly.

> When selecting an element of the page, you must find in view or specify view as the context argument(second argument) of the jQuery function. Otherwise, unintentional elements of other block pages may be selected, resulting in unpredictable errors. Please refer to the <a href="?page=html/naturaljs/refr/refr0601.html">Restrictions and Tips</a> menu for details.

> When N(".view").cont() is executed, the pageid data attribute value, such as data-pageid="view", is created in the `.view` element specified by the selector.
This pageid is ". (dot), # (sharp), [ (left square bracket), ] (right square bracket), ' (single quote), : (colon), ( (left parenthesis), ) (right parenthesis), > (Greater symbol), space (space), - (hyphen)" characters are removed to create pageid, so it is recommended to define the page identification value so that it does not include the preceding characters.
For example, N("page.view-01").cont() creates a pageid of "pageview01" with the dot and hyphen removed.

To control a specific page in the block page or tab content, you can get a Controller object as follows:

```
var page01Cont = N("#page01").instance("cont");
page01Cont.gridInst.bind([]);
```