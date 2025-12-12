# TypeScript Type Definitions Refactoring Changelog

## [Unreleased] - 2025-12-12

### ✨ Major Improvements

#### Type Safety Enhancement
- **Reduced `any` usage**: 127 → 88 instances (31% reduction, 39 instances eliminated)
- **Improved type safety** at external API boundaries using `unknown` type
- **Eliminated complex type patterns**: Removed `Omit<NJS<HTMLElement[]>, keyof NJS<HTMLElement[]>>` anti-pattern

### 🔧 Breaking Changes

#### 1. `NC.element.toOpts` Return Type
**Before:**
```typescript
toOpts(ele: NJS<HTMLElement[]>): NC.JSONValue | undefined;
```

**After:**
```typescript
toOpts(ele: NJS<HTMLElement[]>): unknown;
```

**Reason**: jQuery's `.data()` returns `any`, so we use `unknown` for type safety.

**Migration:**
```typescript
// Before (unsafe)
const opts = N.element.toOpts(element);
opts.someProperty; // No type checking

// After (safe with type guard)
const opts = N.element.toOpts(element);
if (typeof opts === 'object' && opts !== null) {
    const typedOpts = opts as { width?: number };
    console.log(typedOpts.width);
}
```

#### 2. `NA.Objects.Controller.BaseObject` Index Signature
**Before:**
```typescript
interface BaseObject {
    [key: string]: any;
    init?: InitFunction;
    // ...
}
```

**After:**
```typescript
interface BaseObject {
    init?: InitFunction;
    // ... other explicit properties
    [key: string]: unknown; // Moved to end, changed to unknown
}
```

**Reason**: Enforce type safety for custom properties.

**Migration:**
```typescript
// Custom method calls need type assertion
const cont = N(".view").cont({ /* ... */ });
(cont.customMethod as () => void)();
```

#### 3. Type Check Functions Accept `unknown`
**Changed functions:**
- `NC.type(obj: any)` → `NC.type(obj: unknown)`
- `NC.isString(obj: any)` → `NC.isString(obj: unknown)`
- `NC.isNumeric(obj: any)` → `NC.isNumeric(obj: unknown)`
- `NC.isPlainObject(obj: any)` → `NC.isPlainObject(obj: unknown)`
- `NC.isEmptyObject(obj: any)` → `NC.isEmptyObject(obj: unknown)`
- `NC.isArray(obj: any)` → `NC.isArray(obj: unknown)`
- `NC.isArraylike(obj: any)` → `NC.isArraylike(obj: unknown)`
- `NC.isWrappedSet(obj: any)` → `NC.isWrappedSet(obj: unknown)`
- `NC.isElement(obj: any)` → `NC.isElement(obj: unknown)`

**Impact**: Minimal - these functions are designed to accept any value.

#### 4. Logging Functions Accept `unknown[]`
**Changed functions:**
- `NC.debug(...obj: any)` → `NC.debug(...obj: unknown[])`
- `NC.log(...obj: any)` → `NC.log(...obj: unknown[])`
- `NC.info(...obj: any)` → `NC.info(...obj: unknown[])`
- `NC.warn(...obj: any)` → `NC.warn(...obj: unknown[])`

**Impact**: None - usage remains the same.

#### 5. Communicator & Context `attr`/`get` Return `unknown`
**Changed signatures:**
- `NA.Communicator.request.attr(name: string): any` → `unknown`
- `NA.Communicator.request.get(key: string): any` → `unknown`
- `NA.Context.attr(name: string): any` → `unknown`

**Migration:**
```typescript
// Before
const data = request.attr("key");
data.someProperty; // Unsafe

// After
const data = request.attr("key");
if (typeof data === 'object' && data !== null) {
    const typed = data as { someProperty: string };
    typed.someProperty; // Safe
}
```

#### 6. Popup/Tab Event Data Parameters
**Changed signatures:**
- `NU.Popup.open(onOpenData?: any)` → `open(onOpenData?: unknown)`
- `NU.Popup.close(onCloseData?: any)` → `close(onCloseData?: unknown)`
- `NU.Tab.open(idx: number, onOpenData?: any)` → `open(idx: number, onOpenData?: unknown)`

**Impact**: Minimal - these parameters are typically used in callback contexts.

### 🎯 Non-Breaking Improvements

#### 1. Centralized Common Type Aliases
Added to `natural.core.misc.d.ts`:
```typescript
type AnyCallback = (...args: unknown[]) => unknown;
type VoidCallback = (...args: unknown[]) => void;
type ElementLike = NJS<HTMLElement[]> | HTMLElement | HTMLElement[];
type ElementSelector = string | ElementLike;
type ComponentOptions<T> = Partial<T> & { [key: string]: unknown };
```

#### 2. Simplified Component Signatures
**Before:**
```typescript
select(opts?: NU.Options.Select | Omit<NJS<HTMLElement[]>, keyof NJS<HTMLElement[]>>): NU.Select;
```

**After:**
```typescript
select(opts?: NU.Options.Select | NJS<HTMLElement[]>): NU.Select;
```

**Affected components**: Select, Form, List, Grid, Pagination, Tree (both instance and static methods)

### 📊 Statistics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total `any` count | 127 | 88 | -39 (-31%) |
| Type safety at API boundaries | Low | High | ✅ Improved |
| Complex type patterns | Present | Removed | ✅ Simplified |
| Test coverage | Basic | Comprehensive | ✅ Enhanced |

### 🧪 Testing

All changes have been validated with:
- ✅ `npx tsc -p tsconfig.json` (passes without errors)
- ✅ `npx tsc -p tsconfig.json --strict` (passes without errors)
- ✅ Comprehensive test cases in `@types/natural_js-tests.ts`

### 📚 Documentation

- Created `API-INVENTORY.md`: Complete public API inventory
- Created `ANY-USAGE-MAP.md`: Detailed `any` usage analysis and migration roadmap

### 🔮 Future Work

Remaining `any` instances (88) are primarily in:
1. **Internal UI utilities** (41): `iteration.render`, `draggable.events`, etc.
2. **Option object internals** (12): Complex structures requiring gradual improvement
3. **Test code** (4): Low priority
4. **jQuery compatibility** (3): Must remain as `any` for compatibility
5. **Other low-priority areas** (28)

These can be addressed in future iterations without breaking existing code.

---

**Contributors**: AI Assistant
**Review Date**: 2025-12-12
**TypeScript Version**: Compatible with 4.x and 5.x
