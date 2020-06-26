Overview
===

Grid(N.grid) is a UI component that creates a list of data in a multi-column form by specifying a table element as a context option.

 * N.grid works with components in the Natural-DATA package to simplify the process of data formatting and input validation. See the [Declaration Options] tab for details.
 * If the property name(column name) of the bound data object matches the value of the id attribute of the element, the data is bound. To use data formatting and validation, data must be bound to elements.
 * There are two types of grids, header fixed type and list type.
 * When the value of input element is changed or data is changed by val method, rowStatus property is created. In the rowStatus value is input that "insert" is for input, "update" for modification, and "delete" for deletion.
 * It provides many functions for handling list data such as Excel data paste, data filter/sort and etc.
For more information on the functions provided, please refer to the Options tab and Methods tab.
<p class="alert">The width of the TABLE element to be created as a grid must be specified, whether it is fixed-length(px, etc.) or variable-length(%)</p>