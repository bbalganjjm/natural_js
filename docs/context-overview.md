# Overview

Context (N.context) is a space that ensures data persistence within the life-cycle (until the page is loaded and redirected to another URL) of a Natural-JS-based application.

Natural-JS [configuration values](config-overview.md), global configuration values, common messages of framework, etc. are stored in N.context objects.

## Purpose of Context

The N.context object serves as a central repository for application-wide settings and data that need to be accessible throughout the application's lifecycle. It provides a structured way to:

1. Store configuration settings for different components of Natural-JS
2. Maintain global state information
3. Share data between different parts of the application
4. Configure framework behavior

## Context Structure

The N.context object is hierarchically structured to organize different types of settings and data. The main sections include:

- **core**: Core framework settings
- **architecture**: Settings for the architectural components (Controller, Communicator, etc.)
- **data**: Data-related configurations
- **ui**: User interface components configuration
- **template**: Template handling settings
- **code**: Application-specific code and metadata

Each of these sections can be accessed and modified using the `attr()` method, which works as both a getter and setter.

## Context Persistence

The data stored in N.context persists for the entire lifecycle of the application page. This means that:

- It remains available until the page is unloaded or redirected
- It survives across AJAX requests and partial page updates
- It can be used to maintain state between different components and modules

This persistence makes N.context ideal for storing application-wide settings, user preferences, and other data that needs to be shared across the application.

## Visual Representation

The following diagram illustrates the role of N.context in a Natural-JS application:

```
┌─────────────────────────────────────────────────────────────────┐
│                       Natural-JS Application                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                       N.context                          │   │
│  ├─────────────────┬─────────────────┬─────────────────┐   │   │
│  │                 │                 │                 │   │   │
│  │      core       │  architecture   │      data       │   │   │
│  │                 │                 │                 │   │   │
│  ├─────────────────┼─────────────────┼─────────────────┤   │   │
│  │                 │                 │                 │   │   │
│  │       ui        │    template     │      code       │   │   │
│  │                 │                 │                 │   │   │
│  └─────────────────┴─────────────────┴─────────────────┘   │   │
│                                                             │   │
│  ┌─────────────────┐   ┌─────────────────┐   ┌───────────┐ │   │
│  │                 │   │                 │   │           │ │   │
│  │   Controller    │   │  Communicator   │   │    UI     │ │   │
│  │                 │   │                 │   │           │ │   │
│  └────────┬────────┘   └────────┬────────┘   └─────┬─────┘ │   │
│           │                     │                   │       │   │
│           └─────────────────────┼───────────────────┘       │   │
│                                 │                           │   │
│                        Access and modify                    │   │
│                                 │                           │   │
│                                 ▼                           │   │
│                                                             │   │
└─────────────────────────────────────────────────────────────────┘
```
