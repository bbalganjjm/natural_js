Overview
===

Controller (N.cont) is a class that implements Controller layer of ​​CVC Architecture Pattern.

N.cont executes the init function of the Controller object and returns a Controller object.
<p class="alert">The Controller object is the object that controls the elements of the View and the data retrieved by Communicator.</p>

N.cont should be declared just below the View area of ​​the page as follows:

```
<div id="view">
	<p>View area</p>
</div>

<script type="text/javascript">
	N("#view").cont({ //  Controller object
		init : function(view, request) {
			// This area runs first after the page loads.
		}
	});
</script>
```

If you load a page with the above structure into an N.popup, N.tab component or N.comm library, the init function of the Controller object is called when the page has finished loading.
<p class="alert">Pages based on Natural-ARCHITECTURE must be loaded into N.comm, N.popup or N.tab to work properly.</p>

To control a specific page in the block page or tab content, you can get a Controller object as follows:

```
var page01Cont = N("#page01").instance("cont");
page01Cont.gridInst.bind([]);
```