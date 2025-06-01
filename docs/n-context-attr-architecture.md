# N.context.attr("architecture") - Configurations of Natural-ARCHITECTURE

| Name | Default | Required | Description |
|------|---------|----------|-------------|
| page.context | .docs__ > .docs_contents__.visible__ | O | Specify the element to insert the main content in jQuery Selector syntax. If you use the Documents(N.docs) component, you don't have to specify it, but otherwise **you must**. If it is not SPA(Single Page Application), please set it to "body". |
| cont | - | X | Controller [AOP](aop-overview.md) related settings. |
| comm.filters | - | X | [Communication Filter](communication-filter-overview.md) related settings. |
| comm.request | - | X | Global options of [Communicator.request](communicator-request-overview.md). |
