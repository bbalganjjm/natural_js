Overview
===

Grid (N.grid) is a UI component that creates a list of data in a multi-column form by specifying a table element as a context option.

<p class="alert">N.grid works with components in the Natural-DATA package to simplify the process of data formatting and input validation. See the [Declaration Options] tab for details.</p>
<p class="alert">If the property name(column name) of the bound data object matches the value of the id attribute of the element, the data is bound. To use data formatting and validation, data must be bound to elements.</p>
<p class="alert">The width of the TABLE element to be created as a grid must be specified, whether it is fixed-length(px, etc.) or variable-length(%).</p>
<p class="alert">There are two types of grids, header fixed type and list type.</p>
<p class="alert">When changing the value of input element or changing data with "val" method, rowStatus property is created, in the rowStatus property, input is "insert", modification is "update", and deletion is "delete".</p>