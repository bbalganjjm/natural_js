# Natural-JS TypeScript Migration Development Guidelines

## 1. Project Overview

### Purpose
- **Primary Goal**: Migrate Natural-JS from jQuery-based JavaScript to pure TypeScript
- **Secondary Goal**: Add Server-Side Rendering (SSR) support
- **Outcome**: Zero jQuery dependency, ESM-only, SSR-compatible UI framework

### Technology Stack
| Category | Technology |
|----------|------------|
| Language | TypeScript 5.x (strict mode) |
| Module System | ESM (ES Modules) only |
| Build Tool | To be configured |
| Test Framework | Vitest |
| Package Manager | npm |

### Core Modules
| Module | Class | Description |
|--------|-------|-------------|
| Natural-CORE | `NC` | Utility functions (string, date, array, JSON) |
| Natural-ARCHITECTURE | `NA` | Communication, Controller, Context |
| Natural-DATA | `ND` | Data binding, Formatter, Validator |
| Natural-UI | `NU` | UI Components (Alert, Button, Grid, Form, etc.) |
| Natural-UI.Shell | `NUS` | Notify, Documents |

---

## 2. Project Architecture

### Directory Structure

```
src/
├── natural.*.js          # [LEGACY] jQuery-based code - DO NOT MODIFY
├── core/                 # Natural-CORE TypeScript modules
│   ├── index.ts         # Module entry point
│   ├── string.ts        # NC.string utilities
│   ├── date.ts          # NC.date utilities
│   ├── array.ts         # NC.array utilities
│   └── json.ts          # NC.json utilities
├── architecture/         # Natural-ARCHITECTURE modules
│   ├── index.ts
│   ├── communicator.ts  # NA.comm replacement
│   ├── controller.ts    # NA.cont
│   └── context.ts       # NA.context
├── data/                 # Natural-DATA modules
│   ├── index.ts
│   ├── datasync.ts      # ND.ds
│   ├── formatter.ts     # ND.formatter
│   └── validator.ts     # ND.validator
├── ui/                   # Natural-UI components
│   ├── index.ts
│   ├── alert/
│   ├── button/
│   ├── datepicker/
│   ├── form/
│   ├── grid/
│   ├── list/
│   ├── pagination/
│   ├── popup/
│   ├── select/
│   ├── tab/
│   └── tree/
├── dom/                  # DOM utilities (jQuery replacement)
│   ├── index.ts
│   ├── selector.ts      # $() replacement
│   ├── manipulation.ts  # DOM manipulation
│   ├── events.ts        # Event handling
│   ├── traversal.ts     # DOM traversal
│   └── data.ts          # Element data storage
├── http/                 # HTTP client ($.ajax replacement)
│   ├── index.ts
│   ├── client.ts        # fetch-based HTTP client
│   └── interceptors.ts  # Request/Response interceptors
├── ssr/                  # SSR support utilities
│   ├── index.ts
│   ├── environment.ts   # isServer(), isBrowser()
│   └── hydration.ts     # Hydration helpers
├── utils/                # Common utilities
│   ├── index.ts
│   ├── type-guards.ts   # Type guard functions
│   └── helpers.ts       # General helpers
├── types/                # TypeScript type definitions
│   ├── index.ts
│   ├── core.types.ts
│   ├── data.types.ts
│   └── ui.types.ts
└── styles/               # CSS styles
    ├── components/
    └── themes/
```

### Module Dependencies

```
utils/ ─────────────────────────────────────────┐
   │                                            │
   ▼                                            │
ssr/ ───────────────────────────────────────────┤
   │                                            │
   ▼                                            │
dom/ ───────────────────────────────────────────┤
   │                                            │
   ▼                                            │
http/ ──────────────────────────────────────────┤
   │                                            │
   ▼                                            │
core/ ──────────────────────────────────────────┤
   │                                            │
   ▼                                            │
architecture/ ──────────────────────────────────┤
   │                                            │
   ▼                                            │
data/ ──────────────────────────────────────────┤
   │                                            │
   ▼                                            │
ui/ ────────────────────────────────────────────┘
```

---

## 3. Code Standards

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| File name | kebab-case | `data-formatter.ts` |
| Class | PascalCase | `DataFormatter` |
| Interface | PascalCase | `FormatterOptions` |
| Type | PascalCase | `ValidatorResult` |
| Function | camelCase | `formatDate()` |
| Variable | camelCase | `dateValue` |
| Constant | SCREAMING_SNAKE_CASE | `DEFAULT_LOCALE` |
| Private member | underscore prefix | `_internalState` |

### TypeScript Rules

```typescript
// ✅ CORRECT: Strict typing
function formatValue<T extends string | number>(value: T, format: string): string {
  // implementation
}

// ❌ WRONG: Using any
function formatValue(value: any, format: any): any {
  // implementation
}
```

```typescript
// ✅ CORRECT: Unknown for uncertain types
function parseResponse(data: unknown): ParsedData {
  if (isValidResponse(data)) {
    return data as ParsedData;
  }
  throw new Error('Invalid response');
}

// ❌ WRONG: any type
function parseResponse(data: any): ParsedData {
  return data;
}
```

### Import/Export Rules

```typescript
// ✅ CORRECT: ESM imports
import { formatDate } from './date.js';
import type { DateFormat } from './types.js';

// ❌ WRONG: CommonJS
const { formatDate } = require('./date');
module.exports = { formatDate };
```

### File Extension Rules

- **Source files**: `.ts` extension
- **Import paths**: Include `.js` extension (TypeScript ESM requirement)
- **Type definition exports**: Use `export type` for type-only exports

---

## 4. Feature Implementation Standards

### jQuery Replacement Patterns

| jQuery Pattern | TypeScript Replacement |
|----------------|------------------------|
| `$(selector)` | `import { select } from './dom/selector.js'` |
| `$.ajax()` | `import { httpClient } from './http/client.js'` |
| `$.extend()` | `Object.assign()` or spread operator `{...obj}` |
| `$.each()` | `Array.prototype.forEach/map/filter` |
| `$.map()` | `Array.prototype.map()` |
| `$.inArray()` | `Array.prototype.indexOf()` or `includes()` |
| `$.isPlainObject()` | Custom type guard in `utils/type-guards.ts` |
| `$.isEmptyObject()` | `Object.keys(obj).length === 0` |
| `$.Deferred()` | Native `Promise` |
| `$.proxy()` | Arrow function or `Function.prototype.bind()` |
| `$.trim()` | `String.prototype.trim()` |
| `$.parseJSON()` | `JSON.parse()` |
| `jQuery._data()` | Custom data storage in `dom/data.ts` |

### DOM Selector Implementation

```typescript
// src/dom/selector.ts
export function select(selector: string, context?: Element | Document): Element[] {
  const root = context ?? document;
  return Array.from(root.querySelectorAll(selector));
}

export function selectOne(selector: string, context?: Element | Document): Element | null {
  const root = context ?? document;
  return root.querySelector(selector);
}
```

### HTTP Client Implementation

```typescript
// src/http/client.ts
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export async function request<T>(url: string, options?: RequestOptions): Promise<T> {
  const response = await fetch(url, {
    method: options?.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}
```

### SSR Compatibility Rules

```typescript
// src/ssr/environment.ts
export function isServer(): boolean {
  return typeof window === 'undefined';
}

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function safeWindow<T>(accessor: () => T, fallback: T): T {
  if (isBrowser()) {
    return accessor();
  }
  return fallback;
}
```

**Usage Pattern:**

```typescript
// ✅ CORRECT: Conditional browser API access
import { isBrowser, safeWindow } from '../ssr/environment.js';

function getScrollPosition(): number {
  return safeWindow(() => window.scrollY, 0);
}

function attachResizeListener(callback: () => void): void {
  if (isBrowser()) {
    window.addEventListener('resize', callback);
  }
}

// ❌ WRONG: Direct browser API access
function getScrollPosition(): number {
  return window.scrollY; // Will throw in SSR
}
```

---

## 5. Workflow Standards

### Migration Priority Order

Execute migration in this exact order to minimize dependency conflicts:

| Priority | Module | Rationale |
|----------|--------|-----------|
| 1 | `src/utils/` | No dependencies, foundation utilities |
| 2 | `src/ssr/` | Environment detection needed early |
| 3 | `src/dom/` | Core jQuery replacement |
| 4 | `src/http/` | $.ajax replacement |
| 5 | `src/types/` | Type definitions for all modules |
| 6 | `src/core/` | NC module (depends on utils, dom) |
| 7 | `src/architecture/` | NA module (depends on core, http) |
| 8 | `src/data/` | ND module (depends on core) |
| 9 | `src/ui/` | NU components (depends on all above) |

### Migration Checklist for Each Module

- [ ] Create directory structure
- [ ] Define TypeScript interfaces in `types/`
- [ ] Implement core functionality
- [ ] Add SSR guards where needed
- [ ] Write unit tests (minimum 80% coverage)
- [ ] Update `@types/*.d.ts` if public API changes
- [ ] Update related documentation

---

## 6. Key File Interaction Standards

### Synchronization Rules

When modifying these files, update the corresponding files:

| Modified File | Must Update |
|---------------|-------------|
| `src/types/*.ts` | `@types/*.d.ts` |
| `src/core/*.ts` | `@types/natural.core.d.ts`, `@types/natural.core.misc.d.ts` |
| `src/data/*.ts` | `@types/natural.data.d.ts`, `@types/natural.data.misc.d.ts` |
| `src/ui/*.ts` | `@types/natural.ui.d.ts`, `@types/natural.ui.misc.d.ts` |
| UI Component options | `docs/DEVELOPER-GUIDE-UI-*.md` |
| Config changes | `docs/DEVELOPER-GUIDE-CONFIG.md` |
| Build configuration | `tsconfig.json`, `package.json` |

### Type Definition Sync Example

```typescript
// When src/types/core.types.ts changes:
export interface StringUtils {
  trimToEmpty(str: string | null | undefined): string;
  isEmpty(str: string | null | undefined): boolean;
  // Added new method
  capitalize(str: string): string;
}

// Must update @types/natural.core.d.ts:
declare namespace NC {
  namespace string {
    function trimToEmpty(str: string | null | undefined): string;
    function isEmpty(str: string | null | undefined): boolean;
    // Add matching declaration
    function capitalize(str: string): string;
  }
}
```

---

## 7. AI Decision-Making Standards

### When Adding New Features

```
IF feature is jQuery-dependent:
  → Create pure TypeScript implementation in appropriate src/ subdirectory
  → Use dom/, http/ modules instead of jQuery
  
IF feature requires browser APIs:
  → Wrap with SSR guards from ssr/environment.ts
  → Provide fallback for server environment
  
IF feature changes public API:
  → Update @types/*.d.ts
  → Update docs/DEVELOPER-GUIDE-*.md
  → Consider backward compatibility
```

### When Fixing Bugs

```
IF bug is in src/natural.*.js (legacy):
  → DO NOT modify legacy files
  → Document the bug
  → Fix in TypeScript migration when that module is migrated
  
IF bug is in src/[module]/*.ts (migrated):
  → Fix in TypeScript code
  → Add regression test
  → Update @types if API affected
```

### When Refactoring

```
IF refactoring affects public API:
  → STOP - requires explicit user approval
  
IF refactoring is internal only:
  → Proceed with internal changes
  → Ensure all tests pass
  → No @types update needed
```

### Ambiguous Situation Handling

| Situation | Decision |
|-----------|----------|
| Unclear which module owns functionality | Check existing `src/natural.*.js` for current location |
| Multiple valid implementation approaches | Prefer simpler approach with fewer dependencies |
| Performance vs. readability trade-off | Prefer readability unless in critical path |
| SSR compatibility unclear | Default to SSR-safe implementation |

---

## 8. Prohibited Actions

### Code Prohibitions

| ❌ Prohibited | ✅ Required Alternative |
|---------------|------------------------|
| `jQuery()`, `$()` | `src/dom/selector.ts` functions |
| `$.ajax()`, `$.get()`, `$.post()` | `src/http/client.ts` functions |
| `$.fn.extend()` | Module-based extension |
| `jQuery._data()` | `src/dom/data.ts` storage |
| `any` type | `unknown`, generics, or specific types |
| `require()`, `module.exports` | `import`, `export` |
| Direct `window` access | `safeWindow()` from `src/ssr/` |
| Direct `document` access | `isBrowser()` guard from `src/ssr/` |
| `var` declarations | `const` or `let` |
| Non-null assertion `!` without validation | Proper null checks |

### File Prohibitions

| ❌ Prohibited | Reason |
|---------------|--------|
| Modifying `src/natural.*.js` | Legacy files - migration creates new TypeScript |
| Creating `.ts` files in `src/` root | Use appropriate subdirectory |
| Creating `.js` files | TypeScript only |
| Modifying `lib/jquery-*.js` | External dependency |
| Deleting `@types/*.d.ts` without replacement | Breaks existing TypeScript users |

### Architecture Prohibitions

| ❌ Prohibited | Reason |
|---------------|--------|
| Circular imports between modules | Causes runtime errors, violates dependency order |
| UI components depending on architecture | Wrong dependency direction |
| Utils depending on any other module | Utils must be dependency-free |
| SSR module depending on browser APIs | Defeats SSR purpose |

---

## 9. Testing Standards

### Test File Location

```
test/
├── core/           # NC module tests
│   ├── string.test.ts
│   ├── date.test.ts
│   └── ...
├── dom/            # DOM utility tests
├── http/           # HTTP client tests
├── ssr/            # SSR utility tests
├── data/           # ND module tests
├── ui/             # NU component tests
│   ├── alert.test.ts
│   ├── button.test.ts
│   └── ...
└── architecture/   # NA module tests
```

### Test Naming Convention

```typescript
// File: test/core/string.test.ts
describe('NC.string', () => {
  describe('trimToEmpty', () => {
    it('should return empty string for null input', () => {
      expect(NC.string.trimToEmpty(null)).toBe('');
    });
    
    it('should trim whitespace from string', () => {
      expect(NC.string.trimToEmpty('  hello  ')).toBe('hello');
    });
  });
});
```

### Minimum Coverage Requirements

| Module | Minimum Coverage |
|--------|------------------|
| `src/utils/` | 90% |
| `src/ssr/` | 90% |
| `src/dom/` | 85% |
| `src/http/` | 85% |
| `src/core/` | 80% |
| `src/data/` | 80% |
| `src/ui/` | 75% |

---

## 10. Documentation Standards

### Code Comments

```typescript
/**
 * Formats a date string according to the specified format pattern.
 * 
 * @param dateStr - The date string to format (YYYYMMDD, YYYYMM, etc.)
 * @param format - The output format pattern (e.g., 'Y-m-d', 'm/d/Y')
 * @returns The formatted date string
 * @throws {Error} If dateStr is not a valid date format
 * 
 * @example
 * formatDate('20231225', 'Y-m-d') // Returns '2023-12-25'
 * formatDate('202312', 'Y/m') // Returns '2023/12'
 */
export function formatDate(dateStr: string, format?: string): string {
  // implementation
}
```

### README Updates

When adding new modules or significant features, update the main `README.md` with:
- Brief description of the feature
- Basic usage example
- Link to detailed documentation

---

## Quick Reference

### Common Patterns Cheatsheet

```typescript
// DOM Selection
import { select, selectOne } from './dom/selector.js';
const elements = select('.my-class');
const element = selectOne('#my-id');

// HTTP Requests
import { request } from './http/client.js';
const data = await request<MyType>('/api/endpoint');

// SSR Safe Code
import { isBrowser, safeWindow } from './ssr/environment.js';
if (isBrowser()) {
  // Browser-only code
}
const width = safeWindow(() => window.innerWidth, 0);

// Type Guards
import { isPlainObject, isArrayLike } from './utils/type-guards.js';
if (isPlainObject(data)) {
  // Handle object
}
```

---

*This document is for AI Agent operational use. Last updated: 2024*

