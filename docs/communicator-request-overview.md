# Overview

Communicator.request is a request information object that is created each time N.comm is initialized.

The options of the N.comm() function are stored in the Communicator.request.options object and passed as headers or parameters of the server request.

When a page file is requested, it is passed as the second argument of the Controller object's init function or as a member variable of the Controller object (this.request). You can check request information or receive page parameter with request object passed.

## Purpose

The Communicator.request object serves as a bridge between the client-side application and the server, providing a structured way to:

1. Store and manage request options
2. Pass parameters to the server
3. Handle server responses
4. Provide request information to page controllers

## Architecture

Within the CVC (Communicator-View-Controller) architecture of Natural-JS, the Communicator.request plays a crucial role in managing the data flow between client and server, ensuring that all necessary information is properly packaged and transmitted.

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│   Controller    │ ◄─────► │      View       │ ◄─────► │  Communicator   │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                                                 │
                                                                 │
                                                                 ▼
                                                        ┌─────────────────┐
                                                        │                 │
                                                        │ Communicator.   │
                                                        │    request      │
                                                        │                 │
                                                        └─────────────────┘
                                                                 │
                                                                 │
                                                                 ▼
                                                        ┌─────────────────┐
                                                        │                 │
                                                        │     Server      │
                                                        │                 │
                                                        └─────────────────┘
```
