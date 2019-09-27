Overview
===

Form(N.form) is a UI component that binds or creates single row data to an element(block elements such as div and table) specified by the context option.

<p class="alert">N.form works with components in the Natural-DATA package to simplify the process of data formatting and input validation. See the [Declaration Options] tab for details.</p>
<p class="alert">If the property name(column name) of the bound data object matches the value of the id attribute of the element, the data is bound. To use data formatting and validation, data must be bound to elements.</p>
<p class="alert">If an element inside the context element of N.form is reassigned to the context of N.form or data-related components (N.grid, N.list, etc.), an error may occur or data synchronization problem issues. N.form's context elements must be specified as non-overlapping or column data must be separated and bound. Please refer to the source code of the Example > <a href="#ZXhhcDA5MDAlMjQlRUIlQTklODAlRUQlOEIlQjAlMjAlRUQlOEYlQkMlMjAlRUIlQjAlOTQlRUMlOUQlQjglRUIlOTMlOUMkaHRtbCUyRm5hdHVyYWxqcyUyRmV4YXAlMkZleGFwMDkwMC5odG1s">Multi-Form Bind</a> menu for details on how to separate context elements or data.</p>
<div class="alert">If you add() to an already created form element, then bind() or bind(), then add() or bind() then bind() can cause problems with the data synchronization logic of the form's input elements. In this case, be sure to excute the unbind() method in the middle.
<pre style="margin-bottom: 0;"><code>var formInst = N([]).form().add();
formInst.unbind().bind(0, [{ "col01" : "abcd" }])</code></pre>
</div>
<p class="alert">When changing the value of input element or changing data with "val" method, rowStatus property is created, in the rowStatus property, input is "insert", modification is "update", and deletion is "delete".</p>