<!-- filepath: d:\workspace\natural_js\docs\DEVELOPER-GUIDE-CONFIG.md -->
# Natural-JS Config Reference Guide

This document provides an overview and reference for configuring Natural-JS.

## Table of Contents

- [Natural-JS Config Reference Guide](#natural-js-config-reference-guide)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [Required Attributes for Natural-JS](#required-attributes-for-natural-js)
    - [Component Option Precedence](#component-option-precedence)
  - [N.context.attr("core") - Natural-CORE Settings](#ncontextattrcore---natural-core-settings)
  - [N.context.attr("architecture") - Natural-ARCHITECTURE Settings](#ncontextattrarchitecture---natural-architecture-settings)
  - [N.context.attr("data") - Natural-DATA Settings](#ncontextattrdata---natural-data-settings)
  - [N.context.attr("ui") - Natural-UI Settings](#ncontextattrui---natural-ui-settings)
  - [N.context.attr("ui.shell") - Natural-UI.Shell Settings](#ncontextattruishell---natural-uishell-settings)
  - [N.context.attr("template") - Natural-TEMPLATE Settings](#ncontextattrtemplate---natural-template-settings)
  - [N.context.attr("code") - Natural-CODE Settings](#ncontextattrcode---natural-code-settings)

## Overview

Config (`natural.config.js`) is the configuration file for Natural-JS, storing environment settings, AOP settings, Communication Filter settings, and global options for UI components.

The configuration is defined in the `natural.config.js` file, and each setting is stored in `N.context` under its respective package attribute:

- `N.context.attr("core")`: Default settings for Natural-CORE package libraries
- `N.context.attr("architecture")`: Default settings for Natural-ARCHITECTURE package libraries
- `N.context.attr("data")`: Default settings for Natural-DATA package libraries
- `N.context.attr("ui")`: Default settings for Natural-UI package libraries
- `N.context.attr("ui.shell")`: Default settings for Natural-UI.Shell package libraries

### Required Attributes for Natural-JS

1. **N.context.attr("architecture").page.context**: Specifies the container element (as a jQuery selector string) where the web application's content is displayed.
   - Automatically set when using the Documents (N.docs) component.
   - For SPA (Single Page Application) structures, specify the element where menu pages are loaded. Otherwise, use "body" or the element wrapping the entire content.

2. **N.context.attr("ui").alert.container**: Specifies the container element (as a jQuery selector string) for N.alert and N.popup components.
   - Automatically set when using the Documents (N.docs) component.
   - For SPA structures, specify the element where menu pages are loaded. Otherwise, use "body" or the element wrapping the entire content.

### Component Option Precedence

1. Options specified during component initialization
2. Options specified in Config (`natural.config.js`)
3. Component default options

If a global event option is set, the global event executes first, followed by the event specified during component initialization.

## N.context.attr("core") - Natural-CORE Settings

- **locale**: Default locale (e.g., `ko_KR`). Used for multilingual messages. Must be a full locale string. Can be changed with the `N.locale` function.
- **sgChkdVal**: Default value when a single checkbox is checked in `N().vals` (e.g., "Y", "1", "on").
- **sgUnChkdVal**: Default value when a single checkbox is unchecked in `N().vals` (e.g., "N", "0", "off").
- **spltSepa**: String separator used in Natural-JS (default: `$@^`).
- **gcMode**: Garbage collection mode for `N.gc` (default: `full`).
- **charByteLength**: Default byte length for non-ASCII characters (default: `3`). Used in string length checks (e.g., `N.string.byteLength`, `maxbyte`, `minbyte`, `rangebyte`).

## N.context.attr("architecture") - Natural-ARCHITECTURE Settings

- **page.context**: jQuery selector for the main content container (default: `.docs__ > .docs_contents__.visible__`). Must be set if not using Documents (N.docs). For non-SPA, set to "body".
- **cont**: Controller-related settings.
- **aop**: AOP-related settings.
- **comm.filters**: Communication Filter-related settings.
- **comm.request**: Global options for Communicator.request.

## N.context.attr("data") - Natural-DATA Settings

- **formatter.userRules**: Custom format rules. Define functions where the function name is the rule name. Each function receives the target string and options, and returns the formatted string.
- **formatter.date**: Global date format for the application. Use `Y` for year, `m` for month, `d` for day, `H` for hour, `i` for minute, `s` for second.
- **formatter.date.dateSepa**: Separator for year, month, day.
- **formatter.date.timeSepa**: Separator for hour, minute, second (default: `:`).
- **formatter.date.Ym**: Function returning the year-month format string.
- **formatter.date.Ymd**: Function returning the year-month-day format string.
- **formatter.date.YmdH**: Function returning the year-month-day-hour format string.
- **formatter.date.YmdHi**: Function returning the year-month-day-hour-minute format string.
- **formatter.date.YmdHis**: Function returning the year-month-day-hour-minute-second format string.
- **validator.userRules**: Custom validation rules. Each function receives the target string and options, and returns `true` (valid) or `false` (invalid). Error messages are defined in `validator.message` by locale.
- **validator.message**: Multilingual validation error messages. Add new languages by copying the language set and defining messages under the locale string.

## N.context.attr("ui") - Natural-UI Settings

- **alert.container**: jQuery selector for the container of N.alert and N.popup components (default: `.docs__ > .docs_contents__.visible__`). Should match `architecture.page.context` unless special cases. Must be set if not using Documents (N.docs). For non-SPA, set to "body".
- **alert.global.okBtnStyle**: Style options for the OK button in N.alert (e.g., `{ color: "yellowgreen", size: "medium" }`).
- **alert.global.cancelBtnStyle**: Style options for the Cancel button in N.alert (e.g., `{ size: "medium" }`).
- **alert.input.displayTimeout**: Display time (ms) for message dialogs shown on input elements (default: `7000`).
- **alert.input.closeBtn**: Close button design for message dialogs on input elements (default: `&times;`). HTML tags allowed.
- **alert.message**: Multilingual messages for N.alert.
- **datepicker.monthonlyOpts.yearsPanelPosition**: Position of the year selection element when `monthonly` is true ("left" or "top").
- **datepicker.monthonlyOpts.monthsPanelPosition**: Position of the month selection element when `monthonly` is true ("left" or "top").
- **datepicker.message**: Multilingual messages for N.datepicker.
- **list.message**: Multilingual messages for N.list.
- **grid.message**: Sort direction indicators for N.grid (e.g., `asc: "▼", desc: "▲"`).
- **grid.message**: Multilingual messages for N.grid.

## N.context.attr("ui.shell") - Natural-UI.Shell Settings

- **notify.message**: Multilingual messages for N.notify.
- **docs.message**: Multilingual messages for N.docs.

## N.context.attr("template") - Natural-TEMPLATE Settings

- **codes**: Common code lookup information. `codeUrl`: URL for code lookup, `codeKey`: property name for group code.
- **message**: Multilingual messages for Natural-TEMPLATE.

## N.context.attr("code") - Natural-CODE Settings

- **abortOnError**: Whether to throw an error and stop logic when an ERROR type code is detected (default: `false`).
- **excludes**: List of strings to exclude from code checking. If the detected code contains any of these strings, it is excluded.
- **message**: Multilingual messages for code checking.
