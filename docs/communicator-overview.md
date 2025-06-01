# Communicator Overview

Communicator (N.comm) is a class that implements the Communicator layer of the CVC (Communicator-View-Controller) Architecture Pattern in Natural-JS. It serves as the interface between the client-side application and server-side services.

## CVC Architecture Pattern

The CVC Architecture Pattern separates client-side applications into three distinct layers:

1. **Communicator**: Handles all communication with the server
2. **View**: Manages the presentation layer and user interface
3. **Controller**: Coordinates between the Communicator and View

![CVC Architecture Pattern](images/intr/pic5.png)

Implementing the CVC pattern allows client-side browser implementations to be independent of server technology and architecture, while completely separating design and development concerns to reduce complexity.

## Purpose of Communicator

N.comm is a library that supports Ajax communication with the server, enabling the application to:

- Request content or data from the server
- Send parameters and data to the server
- Handle server responses
- Insert HTML content into specified elements
- Process errors in a standardized way

## Key Features

### 1. Flexible Parameter Handling

Communicator can handle various types of parameters for server communication:

- JSON objects
- Form data
- Arrays
- String parameters
- HTML elements

### 2. Integration with UI Components

N.comm seamlessly integrates with other Natural-JS components:

- Can automatically extract data from N.form, N.grid, N.list components
- Can insert server-returned HTML into specified elements
- Supports callbacks for handling server responses

### 3. Communication Filters

N.comm provides a Communication Filter mechanism that allows execution of common logic at different stages of the communication process:

- **beforeInit**: Executed before N.comm is initialized
- **afterInit**: Executed after N.comm is initialized
- **beforeSend**: Executed before sending a request to the server
- **success**: Executed when a successful response is received from the server
- **error**: Executed when an error occurs during communication
- **complete**: Executed after communication is complete (regardless of success or failure)

### 4. Page Loading Support

N.comm provides functionality for loading HTML pages into specified elements:

- Supports loading entire pages or page fragments
- Can pass parameters to loaded pages
- Integrates with the Controller system for proper page initialization

### 5. Extensibility

Communicator can be extended with additional functionality:

- Custom request types
- Response preprocessing
- Error handling strategies
- Custom parameter serialization

## Integration with Controller Objects

Communicator instances can be declared as member variables of Controller objects using a specific naming convention:

```javascript
"c.{serviceName}": function() {
    return N(params).comm({url});
}
```

This approach provides several benefits:

- Makes data flow visible at a glance
- Enables applying AOP (Aspect-Oriented Programming) to the declared Communicators
- Standardizes the way server communication is handled throughout the application

## Basic Usage Pattern

Communicator follows a builder pattern for configuring and executing requests:

```javascript
// Basic data request
N.comm("data.json").submit(function(data) {
    console.log(data);
});

// Request with parameters
N({"param": "value"}).comm("data.json").submit(function(data) {
    console.log(data);
});

// Loading HTML into an element
N("#targetElement").comm("page.html").submit();

// With page parameters
N("#targetElement").comm("page.html").request.attr("pageParam", "value").submit();
```

## Important Notes

- When N.comm is called or instantiated with the `new` operator, a Communicator.request object instance is created and bound to the `request` property of the object.
- For GET requests with object or array parameters, the parameters are URL-encoded and assigned to the "q" parameter key.
- When used as `N.comm(params, url).submit()`, parameters are sent as an array type even if the dataIsArray option is not set to true.
- When used within Controller objects, Communicator instances are typically accessed via function execution, such as `cont["c.serviceName"]().submit()`.

By effectively using the Communicator component, applications can implement a clean separation between server communication and user interface concerns, following the principles of the CVC Architecture Pattern.
