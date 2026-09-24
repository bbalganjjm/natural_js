# Concepts

* [CVC pattern](cvc-pattern.md) - Communicator-View-Controller, the Natural-JS client architecture in which each block page is a View plus one Controller object, loaded and initialized by N.comm.
* [Communication filter](communication-filter.md) - Named filter objects in N.context.attr("architecture").comm.filters whose six hooks run at each stage of every N.comm call.
* [Controller AOP](aop.md) - Pointcuts and advisors in N.context.attr("architecture").cont that wrap Controller functions with before, after, around or error advice at page init.
* [N.comm](communicator.md) - Ajax communicator that sends data requests or loads block pages into elements, runs communication filters and initializes the loaded page's controller.
* [N.comm.request](request.md) - Per-call request object of N.comm that holds the Ajax options and the page parameters passed to a loaded block page, with attr, get, param and reload.
* [N.cont](controller.md) - Registers a block page's Controller object on its View element; the loader later injects request, caller and opener and calls its init function.
* [N.context](context.md) - Application-wide key-value store that holds the natural.config.js settings and any shared data for the lifetime of the loaded document.
