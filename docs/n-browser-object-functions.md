# Functions of N.browser Object

N.browser is a collection object of utility functions related to browser.

You can use like "N.browser.{function name}(arg[0...N])"

## N.browser.cookie

**Return**: undefined

Creates the browser cookie.

### Parameters

#### name

**Type**: string

Inputs the cookie name.

#### value

**Type**: string

Inputs the cookie value.

#### expiredays

**Type**: number

Inputs the expiration date of the cookie.

#### domain

**Type**: string

Inputs the domain where the cookie will be created.

## N.browser.removeCookie

**Return**: undefined

Removes created cookie.

### Parameters

#### name

**Type**: string

Inputs the cookie name.

#### domain

**Type**: string

Inputs the domain of the cookie to be removed.

## N.browser.msieVersion

**Return**: number

Gets the version of the MSIE(Microsoft Internet Explorer) you are connected to. Returns 0 if not MSIE.

## N.browser.is

**Return**: boolean

Returns true if the connected browser or mobile OS matches the name argument value input.

### Parameters

#### name

**Type**: string

Inputs the browser name or mobile OS name.

- "opera" : Opera Browser.
- "firefox" : Mozilla Firefox Browser.
- "safari" : Apple Safari Browser.
- "chrome" : Google Chrome Browser.
- "ie" : Microsoft Internet Explorer Browser.
- "android" : Google Android OS
- "ios" : Apple iOS

## N.browser.contextPath

**Return**: string

Returns the context path from the browser URL.

## N.browser.scrollbarWidth

**Return**: number

Returns the width of the browser's scroll bar.
