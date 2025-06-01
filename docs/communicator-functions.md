# Methods

The following table lists the functions available for the Communicator object:

| Name | Arguments | Type | Return | Description |
|------|-----------|------|--------|-------------|
| submit | N/A | N/A | N.comm | Send a request to the server and register a callback function to be executed when a successful server response is received.<br><br>If you do not provide a callback argument to the submit function, a Promise compatible xhr object will be returned, allowing you to use async / await syntax.<br><br>```javascript
// JSON Data
const fn1 = async () => {
    const data = await N.comm("data.json").submit();
};

// Catch exception
const fn2 = () => await N.comm("data.json").submit().then((data) => {
    console.log(data);
}).catch((e) => {
    console.error(e);
});

// HTML page
const fn3 = async () => {
    const data = await N("#page-container").comm("page.html").submit();
    console.log(data); // HTML Text
};
``` |
| | callback | function (user-defined) | N/A | Define a callback function that handles the server's response when the request is successful.<br><br>If an HTML page is requested, the Controller object of the page loaded as the argument of the callback function is returned. For other requests, the data object and the Communicator.request object are returned.<br><br>```javascript
// JSON Data
N.comm("data.json").submit(function(data, request) {
    N.log(data, request);
});

// HTML page
N("#page-container").comm("page.html").submit(function(cont) {
    N.log(cont); // cont : Controller object
});
``` |
| error | N/A | N/A | N.comm | After the submit function is called, registers a callback function to be executed when an error response is received from the server or an error occurs in the callback function of the submit method.<br><br>**Note**: You can register multiple callback functions by calling the error method multiple times. |
| | callback | function (user-defined) | N/A | Defines a callback function that handles errors when an error occurs.<br><br>this of the callback function is the created N.comm instance and returns the following arguments:<br><br>- xhr(arguments[2]) : jQuery XMLHTTPRequest<br>- textStatus(arguments[3]) : "success"(When an error occurs in submit callback) or "error"(When an error occurs on the server)<br>- e(arguments[0]) : ErrorThrown<br>- request(arguments[1]) : Communicator.request<br>- callback(arguments[4]) : Callback function specified as argument of submit method when textStatus value is "success".<br><br>```javascript
N.comm("data.json").error(function(e, request, xhr, textStatus, callback) {
    // 2. First error handling for col01.length error
}).error(function(e, request, xhr, textStatus, callback) {
    // 3. Second error handling for col01.length error
}).submit(function(data, request) {
    var col01;
    col01.length; // 1. Error related to undefined
});
``` |
