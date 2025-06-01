# Overview

Communication Filter is a function that executes common logic in all request and response or error generation stages that communicate with server with N.comm.

The declaration of a filter can be defined in the properties of the N.context.attr("architecture").comm.filters object in [Config(natural.config.js)](config-overview.md) and the steps for the filter are as follows:

* **beforeInit**: Executes before N.comm is initialized.
* **afterInit**: Executes after N.comm is initialized.
* **beforeSend**: Executes before sending a request to the server.
* **success**: Executes when a success response is sent from the server.
* **error**: Executes when an error response is sent from the server.
* **complete**: Executes when the server's response is complete.

> **Note**: If you use jQuery.ajax instead of N.comm, you can't use Communication Filter.

## Purpose of Communication Filters

Communication Filters provide a powerful way to implement cross-cutting concerns across all your server communications. Some common use cases include:

1. **Authentication**: Adding authentication tokens to all requests
2. **Logging**: Logging all server communications for debugging or analytics
3. **Error Handling**: Providing a consistent way to handle errors
4. **Data Transformation**: Formatting data before sending to the server or after receiving from the server
5. **Loading Indicators**: Showing and hiding loading indicators automatically
6. **Session Management**: Handling session expiration

## Filter Execution Flow

The following diagram illustrates the execution flow of Communication Filters:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      Application Code                           │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                     N.comm Initialization                       │
│                                                                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Communication Filters                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐       ┌─────────────────┐                  │
│  │   beforeInit    │───────│    afterInit    │                  │
│  └─────────────────┘       └─────────────────┘                  │
│            │                        │                           │
│            │                        │                           │
│            ▼                        ▼                           │
│  ┌─────────────────┐       ┌─────────────────┐                  │
│  │   beforeSend    │───────│     Server      │                  │
│  └─────────────────┘       └─────────────────┘                  │
│                                    │                            │
│                                    │                            │
│                                    ▼                            │
│                    ┌───────────────────────────┐                │
│                    │                           │                │
│                    ▼                           ▼                │
│           ┌─────────────────┐       ┌─────────────────┐         │
│           │     success     │       │      error      │         │
│           └─────────────────┘       └─────────────────┘         │
│                    │                        │                   │
│                    │                        │                   │
│                    ▼                        ▼                   │
│                          ┌─────────────────┐                    │
│                          │    complete     │                    │
│                          └─────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
