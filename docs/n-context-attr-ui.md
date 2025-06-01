# N.context.attr("ui") - Configurations of Natural-UI

| Name | Default | Required | Description |
|------|---------|----------|-------------|
| alert.container | .docs__ > .docs_contents__.visible__ | O | Set the element to save the elements of N.alert and N.popup components using jQuery Selector syntax. Define the same value as the value of N.context.attr("architecture").page.context unless it is a special case. If you use the Documents(N.docs) component, you don't have to specify it, but otherwise **you must**. If it is not SPA(Single Page Application), please set it to "body". |
| alert.global.okBtnStyle | `{ color : "yellowgreen", "size" : "medium" }` | X | N.alert's OK button style. It is specified as an option of the Button(N.button) component. |
| alert.global.cancelBtnStyle | `{ "size" : "medium" }` | X | N.alert's Cancel button style. It is specified as an option of the Button(N.button) component. |
| alert.input.displayTimeout | 7000 | O | Display time of message dialog displayed when input element is specified in context option (ms). |
| alert.input.closeBtn | &times; | O | Design of the close button of the message dialog displayed when an input element is specified in the context option. You can also enter HTML tags. |
| alert.message | `{ "ko_KR" : { ... }, "en_US" : { ... } }` | O | Multilingual messages of N.alert. |
| datepicker.monthonlyOpts.yearsPanelPosition | top | O | Specifies the position of the year selection element when the monthonly option is true. Set to "left" or "top". |
| datepicker.monthonlyOpts.monthsPanelPosition | top | O | Specifies the position of the month selection element when the monthonly option is true. Set to "left" or "top". |
| datepicker.message | `{ "ko_KR" : { ... }, "en_US" : { ... } }` | O | Multilingual messages of N.datepicker. |
| list.message | `{ "ko_KR" : { ... }, "en_US" : { ... } }` | O | Multilingual messages of N.list. |
| grid.message (sort indicators) | `{ "asc" : "▼", "desc" : "▲" }` | O | Sort indicators when sort function is activated. You can also enter HTML tags. |
| grid.message (multilingual) | `{ "ko_KR" : { ... }, "en_US" : { ... } }` | O | Multilingual messages of N.grid. |
