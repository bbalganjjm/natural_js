Overview
===

Communicator.request is a request information object that is created each time N.comm is initialized.

The options of the N.comm() function are stored in the Communicator.request.options object and passed as headers or parameters of the server request.

When a page file is requested, it is passed as the second argument of the Controller object's init function or as a member variable of the Controller object (this.request). You can check request information or receive page parameter with request object passed.
