Overview
===

List(N.list) is a UI component that creates a list of data in the form of a single column by specifying the ul>li element as the context option.

 * N.grid works with components in the Natural-DATA package to simplify the process of data formatting and input validation. See the [Declaration Options] tab for details.
 * If the property name(column name) of the bound data object matches the value of the id attribute of the element, the data is bound. To use data formatting and validation, data must be bound to elements.
 * When changing the value of input element or changing data with "val" method, rowStatus property is created, in the rowStatus property, input is "insert", modification is "update", and deletion is "delete".