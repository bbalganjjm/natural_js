# Functions of N.gc Object

N.gc is a collection object of utility functions related to garbage collection of Natural-JS.

You can use like "N.gc.{function name}(arg[0...N])"

## N.gc.minimum

**Return**: boolean

Collections minimal resources for elements and events used in Natural-JS components and libraries.

> When a page is loaded in the N.context.attr("architecture").page.context area of Config(natural.config.js) using N.comm, N.gc[N.context.attr("core").gcMode]() is automatically executed.

## N.gc.full

**Return**: boolean

Collections all resources for elements and events used in Natural-JS components and libraries.

> When creating a site with SPA, if your browser's memory increases each time you open the page, it is a memory leak somewhere. If N.comm find the part that cannot be catched automatically and executes N.gc.full(), the phenomenon may be improved.

## N.gc.ds

**Return**: undefined

Removes garbage instances from observables of N.ds

> N.gc.ds() is automatically executed when the page is loaded outside of the N.context.attr("architecture").page.context area of Config(natural.config.js) with N.comm.
