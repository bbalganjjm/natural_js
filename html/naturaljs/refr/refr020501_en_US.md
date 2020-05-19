Overview
===

Communication Filter is a function that executes common logic in all request and response or error generation stages that communicate with server with N.comm.

The declaration of a filter can be defined in the properties of the N.context.attr("architecture").comm.filters object in [Config(natural.config.js)](#cmVmcjAxMDIlMjRDb25maWckaHRtbCUyRm5hdHVyYWxqcyUyRnJlZnIlMkZyZWZyMDEwMi5odG1s) and the steps for the filter are as follows:
* **beforeInit** : Executes before N.comm is initialized.
* **afterInit** : Executes after N.comm is initialized.
* **beforeSend** : Executes before sending a request to the server.
* **success** : Executes when a success response is sent from the server.
* **error** : Executes when an error response is sent from the server.
* **complete** : Executes when the server's response is complete.

<p class="alert">If you use jQuery.ajax instead of N.comm, you can't use Communication Filter.</p>