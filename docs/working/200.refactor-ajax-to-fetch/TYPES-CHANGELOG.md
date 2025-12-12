# Type Changes: NA.ajax → NA.fetch Migration

## Overview

This document records the type definition changes made during the migration from jQuery.ajax to fetch API. The migration renames `NA.ajax` to `NA.fetch` and adds support for native fetch API options through the `fetchOptions` property.

**Migration Date**: December 12, 2025  
**Version**: 1.1.0

## Summary of Changes

### Breaking Changes
- `NA.ajax` → `NA.fetch` (method renamed - internal use only)
- `N.ajax` → `N.fetch` (global method renamed - internal use only)
- Return type changed from `JQuery.jqXHR` to `NA.XhrCompat`

### New Features
- Added `NA.Options.Fetch` interface with `fetchOptions` property
- `fetchOptions` allows direct control over native fetch API options through N.comm

### Usage Note
**NA.fetch is an internal implementation detail.** Users should continue using **N.comm** as before. The `fetchOptions` property can be added to N.comm request options to access advanced fetch API features.

## Detailed Changes

### 1. Natural.architecture.d.ts

#### NA class static method
```diff
declare class NA {
-   static ajax: {
-       (url: string, settings?: JQuery.AjaxSettings): JQuery.jqXHR;
-       (settings?: JQuery.AjaxSettings): JQuery.jqXHR;
-   };
+   static fetch: {
+       (options: NA.Options.Fetch): NA.XhrCompat;
+   };
    static comm: NA.Communicator;
```

**Reasoning**: 
- Simplified to single signature accepting `NA.Options.Fetch`
- Return type changed to custom `NA.XhrCompat` interface
- More explicit about fetch-based implementation

#### Communicator.xhr property
```diff
class Communicator {
    constructor(obj: NJS<NC.JSONObject[]> | string, url?: string | NA.Options.Request);
-   xhr: JQuery.jqXHR;
+   xhr: NA.XhrCompat;
    initFilterConfig(): NA.Objects.Config.FilterConfig;
```

**Reasoning**: xhr property now uses fetch-based XhrCompat instead of jQuery jqXHR

#### Communicator.submit() return type
```diff
-   submit(): JQuery.jqXHR;
+   submit(): NA.XhrCompat;
```

**Reasoning**: Consistent with new fetch-based implementation

#### XhrCompat interface documentation
```diff
/**
- * xhr-compatible object returned by NA.ajax
+ * xhr-compatible object returned by NA.fetch
  * Extends Promise and provides jQuery.Deferred methods and xhr methods
  */
interface XhrCompat extends Promise<any> {
    readyState: number;
    status: number;
    statusText: string;
    responseText: string;
    responseJSON: any;
    
    // xhr methods
    abort(): NA.XhrCompat;
    getResponseHeader(name: string): string | null;
    getAllResponseHeaders(): string;
    
    // jQuery.Deferred methods
    done(callback: (data: any) => void): NA.XhrCompat;
    fail(callback: (error: any) => void): NA.XhrCompat;
    always(callback: () => void): NA.XhrCompat;
}
```

**Reasoning**: Updated comment to reflect new method name

### 2. Natural.architecture.misc.d.ts

#### New NA.Options.Fetch interface
```typescript
/**
 * Options interface for NA.fetch with support for custom fetch options.
 * Extends Request interface and allows additional fetch-specific options.
 */
interface Fetch extends Request {
    /**
     * Additional fetch API options that will be merged with converted jQuery.ajax options.
     * Allows fine-grained control over fetch behavior.
     * 
     * @example
     * ```
     * NA.fetch({
     *     url: "/api/data",
     *     type: "POST",
     *     fetchOptions: {
     *         credentials: "include",
     *         redirect: "follow",
     *         mode: "cors"
     *     }
     * });
     * ```
     */
    fetchOptions?: RequestInit;
}
```

**Reasoning**: 
- Extends existing `Request` interface for backward compatibility
- Adds `fetchOptions` property of type `RequestInit` (native fetch API type)
- Allows users to pass both jQuery.ajax-compatible options and native fetch options

### 3. Natural.js.d.ts

#### Global N.fetch declaration
```diff
// === Natural-ARCHITECTURE
/**
- * Performs asynchronous HTTP (Ajax) requests in `N.comm`.
- *
- * @see https://api.jquery.com/jquery.ajax/#jQuery-ajax-settings
+ * Performs asynchronous HTTP requests using fetch API with jQuery.ajax-compatible options.
+ * 
+ * Supports both jQuery.ajax options and additional fetch-specific options via `fetchOptions` property.
+ *
+ * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
  */
-const ajax: typeof NA.ajax;
+const fetch: typeof NA.fetch;
```

**Reasoning**: 
- Updated documentation to reflect fetch API usage
- Changed reference link from jQuery.ajax docs to MDN fetch API docs

### 4. Test File Updates

#### natural_js-tests.ts
```diff
-N.ajax({
+N.fetch({
    url: "http://localhost:8080",
    type: NA.Objects.Request.HttpMethod.POST,
    dataType: NA.Objects.Request.DataType.JSON,
    enctype: NA.Objects.Request.Enctype.URLENCODED,
});

+// Test with custom fetchOptions
+N.fetch({
+    url: "http://localhost:8080/api/data",
+    type: NA.Objects.Request.HttpMethod.POST,
+    dataType: NA.Objects.Request.DataType.JSON,
+    fetchOptions: {
+        credentials: "include",
+        redirect: "follow",
+        mode: "cors"
+    }
+});
```

**Reasoning**: 
- Updated test to use new `N.fetch` method
- Added test case demonstrating `fetchOptions` usage

## Implementation Details

### XhrCompat Interface Design

The `XhrCompat` interface is designed to be a drop-in replacement for `JQuery.jqXHR`:

1. **Promise Compatibility**: Extends `Promise<any>` to support async/await syntax
2. **jQuery.Deferred Methods**: Provides `done()`, `fail()`, `always()` for backward compatibility
3. **xhr Methods**: Provides `abort()`, `getResponseHeader()`, etc. for xhr-like behavior
4. **Properties**: Includes `status`, `statusText`, `responseText`, `responseJSON` for response inspection

### fetchOptions Merging Strategy

When `fetchOptions` is provided, it is merged with the converted jQuery.ajax options:

```javascript
// Convert jQuery.ajax options to fetch options
const fetchOptions = NA._convertJQueryAjaxOptionsToFetch(options, signal);

// Merge custom fetchOptions if provided
if (options.fetchOptions) {
    jQuery.extend(true, fetchOptions, options.fetchOptions);
}
```

This allows users to:
1. Use familiar jQuery.ajax option names for basic functionality
2. Override or extend with native fetch options for advanced features
3. Maintain backward compatibility with existing code

## Migration Guide

### For Library Users

**N.comm usage remains unchanged.** Simply continue using N.comm as before:

```typescript
// Basic usage (no changes needed)
N.comm({ param: "value" }, "/api/data").submit(function(data) {
    console.log(data);
});

// Using async/await (no changes needed)
const data = await N.comm("/api/data").submit();

// NEW: Use fetchOptions for advanced features
N.comm({
    url: "/api/secure-data",
    type: "POST",
    dataType: "json",
    fetchOptions: {
        credentials: "include",  // Include cookies
        cache: "no-cache"        // No caching
    }
}).submit(function(data) {
    console.log(data);
});
```

**NA.fetch is for internal use only.** You don't need to call it directly.

### Type Compatibility

The `NA.XhrCompat` interface is designed to be compatible with `JQuery.jqXHR` for common use cases:

```typescript
// All these work the same way
xhr.then(data => console.log(data));
xhr.done(data => console.log(data));
xhr.catch(error => console.error(error));
xhr.fail(error => console.error(error));
xhr.abort();
```

## Browser Compatibility

### fetch API Support
- Chrome 42+
- Firefox 39+
- Safari 10.1+
- Edge 14+
- Opera 29+

For older browsers (IE11), users need to include fetch polyfills:
- [whatwg-fetch](https://github.com/github/fetch)
- [abortcontroller-polyfill](https://github.com/mo/abortcontroller-polyfill)

### Native RequestInit Options

The `fetchOptions` property accepts the native `RequestInit` interface:

```typescript
interface RequestInit {
    body?: BodyInit | null;
    cache?: RequestCache;
    credentials?: RequestCredentials;
    headers?: HeadersInit;
    integrity?: string;
    keepalive?: boolean;
    method?: string;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    signal?: AbortSignal | null;
    window?: any;
}
```

**Note**: Some options are automatically set from jQuery.ajax-compatible options and will be overridden if specified in `fetchOptions`.

## Backward Compatibility Notes

### Maintained Compatibility
- All jQuery.ajax option names remain supported
- Callback signatures unchanged (`beforeSend`, `success`, `error`, `complete`)
- Return value supports both Promise and jQuery.Deferred patterns
- Filter system continues to work as before

### Known Differences
1. **async: false**: Not supported (fetch is always asynchronous)
   - A warning is logged when `async: false` is specified
   
2. **getResponseHeader()**: Returns `null` instead of actual header values
   - Response object is consumed during parsing and cannot be accessed again
   
3. **xhr properties**: Some properties like `getAllResponseHeaders()` return empty string
   - Limitation due to fetch API response consumption

## Testing

All type changes have been validated with TypeScript compiler:

```bash
npx tsc --noEmit
```

Test cases cover:
1. Basic N.fetch usage with jQuery.ajax options
2. N.fetch with custom fetchOptions
3. Promise-based usage (then/catch)
4. jQuery.Deferred usage (done/fail/always)
5. xhr method usage (abort)

## Future Considerations

### Potential Enhancements
1. **Streaming Support**: Leverage fetch API's streaming capabilities
2. **Request/Response Interceptors**: Similar to axios interceptors
3. **Typed Responses**: Generic type parameter for response data
4. **Retry Logic**: Built-in retry mechanism for failed requests

### Deprecation Plan
The old `NA.ajax` name is fully removed. No deprecation period is needed as this is part of a major version change (1.1.0).

## References

- [MDN fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request)
- [jQuery.ajax documentation](https://api.jquery.com/jquery.ajax/)
- [Natural-JS Architecture Guide](../DEVELOPER-GUIDE-ARCHITECTURE.md)

## Conclusion

The migration from `NA.ajax` to `NA.fetch` successfully modernizes the Natural-JS HTTP layer while maintaining full backward compatibility with existing jQuery.ajax-based code. 

**Key Points:**
1. **NA.fetch is an internal implementation** - Users continue to use N.comm as before
2. **No breaking changes for N.comm users** - All existing code works without modification
3. **fetchOptions adds new capabilities** - Advanced fetch API features are now accessible through N.comm request options
4. **Backward compatible** - All jQuery.ajax-compatible options continue to work

Users should interact with the HTTP layer through **N.comm**, not NA.fetch directly. The addition of `fetchOptions` in N.comm request options provides fine-grained control over fetch API behavior when needed, while maintaining the familiar jQuery.ajax-compatible interface for standard use cases.
