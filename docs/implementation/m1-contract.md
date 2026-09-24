---
type: Plan
title: Natural-JS 2.0 M1 public contract
description: Proposed 2.0 page, data, Form rule, communication, and container contracts with representative usage for review.
tags: [meta, plan, migration]
status: draft
sources:
  - id: architecture
    resource: https://github.com/bbalganjjm/natural_js/blob/b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6/src/natural.architecture.js
    title: Immutable 1.x CVC and communication implementation
  - id: data
    resource: https://github.com/bbalganjjm/natural_js/blob/b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6/src/natural.data.js
    title: Immutable 1.x formatter, validator, and data implementation
  - id: ui
    resource: https://github.com/bbalganjjm/natural_js/blob/b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6/src/natural.ui.js
    title: Immutable 1.x Form, List, Grid, popup, and tab implementation
  - id: html-id
    resource: https://html.spec.whatwg.org/multipage/dom.html#the-id-attribute
    title: HTML standard ID uniqueness
  - id: wai-table
    resource: https://www.w3.org/WAI/tutorials/tables/
    title: WAI table accessibility tutorial
  - id: apg-grid
    resource: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
    title: WAI-ARIA grid interaction pattern
generated: { by: codex/gpt-6-sol, at: 2026-09-24T08:54:32Z }
---

This is the user-approved 2.0 design contract, not yet an implemented API. It keeps the CVC roles and Form-used rule behavior while giving each mounted HTML root its own controller and resource lifetime.

# Goal

Make a search, list, detail, save, and popup flow readable in ordinary TypeScript or JavaScript. Keep the public surface small, preserve authored HTML and built-in Form rules, and make lifetime and data ownership explicit.

# Checkpoint

- M0 established the immutable 1.x baseline and representative search-grid-detail screen.
- A later user correction retains formatter/validator engines, all Form-reachable built-in rules, and their transitive dependencies. Removal requires proof of no framework use, including declarative and indirect use.
- These examples are design contracts. M2 and later milestones must implement and test them before marking API concepts as implemented.

# Steps

## Package and public surface

The 2.0 package lives at the repository root and keeps the name `@bbalganjjm/natural_js`; the 1.x source, package, license, and usage docs are preserved under `v1/`. Explicit ESM exports cover `./page`, `./data`, `./ui`, and `./comm`; the package root re-exports only public symbols. Internal modules never import the package root. M2 shipped `FrameworkError`; M3 adds the page, data, and communication runtimes. UI remains type-only until M4.

| Entry | Public symbols fixed by M1 | Required framework behavior |
|---|---|---|
| `.` | `FrameworkError` | Shared error shape, implemented below the role modules |
| `./page` | `mountPage`, `PageContext`, `PageController`, `PageHandle`, `PageDefinition` | One CVC runtime, independent instances, lifecycle and cleanup |
| `./data` | `createRows`, `Rows`, `RowId`, `RowSnapshot`, `RowChange` | Shared rows, stable identity, changes, subscriptions |
| `./ui` | `bindForm`, `bindGrid`, `openPopup`; `FormHandle`, `GridHandle`, `PopupHandle`, `Rule`, `RuleSet`, `ValidationResult` | Behavior on authored HTML, built-in rules, common handle/disposal convention |
| `./comm` | `createCommunicator`, `Communicator` | JSON requests, cancellation, common request/response hooks |

`bindForm` and `bindGrid` are needed for M4; `openPopup` names the M7 result flow. M6/M7 decide the remaining component names and options only when their implementation need is established. All component handles own a root and expose `dispose()`. No formatter/validator utility package is created: Form, List, and Grid share a rule engine within `./ui`. Internal role modules import one private error implementation, never the root entry.

## First page on existing HTML, in JavaScript

`mountPage(host, definition, input?)` returns a handle immediately. The existing root is caller-owned, remains in place on disposal, and cannot be mounted by two live handles.

```html
<main data-page="hello">
  <button type="button" data-action="hello">Say hello</button>
  <output data-field="message"></output>
</main>
```

```js
import { mountPage } from "@bbalganjjm/natural_js/page";

const root = document.querySelector('[data-page="hello"]');
const page = mountPage(root, {
  view: root,
  controller({ root, signal }) {
    const button = root.querySelector('[data-action="hello"]');
    const output = root.querySelector('[data-field="message"]');

    return {
      init() {
        button.addEventListener("click", () => {
          output.textContent = "Hello";
        }, { signal });
      }
    };
  }
});

await page.ready;
```

The example uses native text insertion and `addEventListener` with the page signal. The framework adds no selector, text, or event utility for these operations.

## Fetched HTML and controller module

`view` accepts a `URL`, an existing `HTMLElement`, or a factory returning a new `HTMLElement`. Each URL/factory mount has its own root; an existing element is exclusively borrowed for one live mount. A relative string URL is not accepted: use `new URL("./view.html", import.meta.url)` for module-relative HTML or `new URL(path, document.baseURI)` for document-relative HTML.

```ts
import { mountPage } from "@bbalganjjm/natural_js/page";
import { createEmployees } from "./employees.controller.js";

const page = mountPage(
  document.querySelector<HTMLElement>('[data-host="main"]')!,
  {
    view: new URL("./employees.html", import.meta.url),
    controller: createEmployees
  },
  { department: "D01" }
);

await page.ready;
```

Fetched HTML must have exactly one top-level element. The runtime inserts it into an empty host and never executes scripts from HTML. The controller module is imported explicitly. The same definition can mount in main content, a popup, or a tab.

## Page lifecycle and error contract

```ts
interface PageContext<Input = unknown, Output = unknown> {
  readonly root: HTMLElement;
  readonly input: Readonly<Input>;
  readonly signal: AbortSignal;
  own(dispose: () => void | Promise<void>): void;
  output(value: Output): void;
}
interface PageController {
  init?(): void | Promise<void>;
  activate?(): void | Promise<void>;
  deactivate?(): void | Promise<void>;
  dispose?(): void | Promise<void>;
}
interface PageDefinition<Input = unknown, Output = unknown> {
  view: URL | HTMLElement | (() => HTMLElement);
  controller(context: PageContext<Input, Output>): PageController;
}
interface PageHandle<Output = unknown> {
  readonly ready: Promise<void>;
  readonly root: HTMLElement | null;
  onOutput(listener: (value: Output) => void): () => void;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  reload(): Promise<void>;
  dispose(): Promise<void>;
}
declare function mountPage<Input, Output>(
  host: HTMLElement, definition: PageDefinition<Input, Output>, input?: Input
): PageHandle<Output>;
```

Order is load/create root, create controller, await `init`, await `activate`, then resolve `ready`. A second `activate` does not repeat `init`. `deactivate` does not dispose. `reload` aborts and fully disposes the old instance before creating a new controller with the same input. A different input requires a new mount. URL/factory views create a new root; a borrowed HTMLElement is reinitialized in place. `dispose` is idempotent. `dispose` and `reload` abort the current signal immediately, then await cleanup; activate/deactivate and later work are serialized. A URL/factory root is removed on disposal; a borrowed HTMLElement is not. A late response cannot update a disposed root because the signal is aborted and lifecycle continuation checks the instance generation.

```ts
declare class FrameworkError extends Error {
  readonly code: string;
  readonly api: string;
  readonly detail?: Record<string, unknown>;
  readonly cause?: unknown;
}
```

A handle exists while HTML loading or `init` is pending, so `dispose` can abort either. Disposal rejects pending `ready` and `reload` with a standard `AbortError`. Non-cancellation failures reject the awaiting operation with `FrameworkError` containing short `code`, `api`, `cause`, and optional `detail`; partial roots and owned resources are released in reverse registration order. A missing host/root fails with `ROOT_MISSING`, a duplicate borrowed ID with `DUPLICATE_ID`, and a missing field or rule names its field/rule in `detail`. Rejected event-handler promises are application code's responsibility; examples catch them explicitly. A page input value is separate from any request payload. `output(value)` notifies `handle.onOutput` listeners only while the page is active; it may be called more than once and never navigates on its own. Disposal releases listeners. The popup wrapper turns the first output into its `result` and closes its own page.

## Shared rows and authored binding

```ts
type RowId = number; // Issued within one Rows instance; never a business or DOM key.
type Snapshot<T> = T extends readonly (infer Item)[]
  ? readonly Snapshot<Item>[]
  : T extends object ? { readonly [Key in keyof T]: Snapshot<T[Key]> } : T;
type RowStatus = "clean" | "insert" | "update" | "delete";
interface RowSnapshot<T> {
  readonly id: RowId;
  readonly value: Snapshot<T>;
  readonly status: RowStatus;
}
interface RowChange<T> {
  readonly id: RowId;
  readonly status: "insert" | "update" | "delete";
  readonly value: Snapshot<T>; // Original value for delete; current value otherwise.
}
interface Rows<T extends object> {
  replace(values: readonly T[]): void;
  entries(): readonly RowSnapshot<T>[]; // Excludes deleted rows.
  get(id: RowId): RowSnapshot<T> | undefined; // Includes a pending delete.
  add(value: T): RowId;
  set<K extends keyof T>(id: RowId, field: K, value: T[K]): void;
  remove(id: RowId): void;
  revert(id?: RowId): void;
  changes(): readonly RowChange<T>[];
  subscribe(listener: () => void): () => void;
  dispose(): void;
}
declare function createRows<T extends object>(initial?: readonly T[]): Rows<T>;
```

`createRows(initial?)` owns JSON-compatible row objects, including nested objects and arrays. It detaches input values and exposes deeply read-only, runtime-immutable `Snapshot<T>` values; reads reuse snapshots rather than cloning the whole data set. All writes go through its methods. `set(id, field, value)` replaces one top-level field, including an entire nested array; Form may update a nested object path by replacing only that row's affected path. Functions, DOM nodes, cyclic structures, and in-place mutation of snapshots are outside this data contract. An update returns to `clean` when every field equals its original JSON value: primitives use value equality and changed nested objects/arrays use structural equality within that field, never a whole-data-set scan. Removing a new row drops it; removing an existing row retains a reversible delete. `replace` discards previous changes and issues new row IDs. `changes` carries internal IDs for UI validation; application code omits them from transport payloads. The store does not inject status or ID into business objects.

`data-field` is the binding key and is independent of DOM `id`. It accepts a top-level property or a dot-separated object path such as `profile.name`; numeric array indexes and expression syntax are excluded. Paths are parsed once per template, never evaluated as JavaScript, and unsafe prototype keys are rejected. To edit `profile.name`, Form copies the affected `profile` object path and calls `rows.set(id, "profile", nextProfile)`; the public typed setter remains top-level. Text uses `textContent` by default; HTML insertion requires an explicit opt-in at the owning component. Form and repeated rows read the author's markup and classes, cloning only repeat templates. Missing fields clear their previous display. A Grid's sort/filter changes display order only: selected `RowId`, edits, and change status remain attached to the same row. A filtered-out selected row remains selected and bound in detail; delete or `replace` clears the selection. Store subscriptions and components are disposed by their owner.

## Nested JSON and row child Select

This is a proposed new 2.0 binding capability, gated by the M4 prototype. In 1.x a Select receives its option array separately; Form treats a row property with the same DOM `id` as the selected scalar, so a nested array does not automatically become row-local options. M4 prototypes the new path; M5 implements nested row ownership and path binding; M6 completes Select/Grid/List integration. If the prototype cannot preserve correctness and binding speed, the M4 review gate may choose explicit per-row Select binding for 2.0 and schedule automatic nested binding for a later 2.x release.

```html
<tr data-row-template>
  <td data-field="b"></td>
  <td><label>Choice
    <select data-options="a" data-option-label="aa" data-option-value="bb">
      <option value="">Choose</option>
    </select>
  </label></td>
</tr>
```

For `{ a: [{ aa: 11, bb: 22 }, {}], b: 2 }`, the first option uses label `11` and raw value `22`; the item missing `bb` is skipped. `data-options` is a row-relative array path, not a selected field. If the row also has `chosen`, adding `data-field="chosen"` to the Select stores the selected raw number `22`, not the DOM string `"22"`: each rendered option retains a row-local link to its source value. Duplicate option values map to the same raw scalar; the first matching option is shown when binding. Items missing either label or value are skipped, so generated options always have a name. An authored empty option maps to `null` when the selected field is nullable. If options change and no longer contain the selected raw value, the row value remains unchanged, the Select shows no matching choice, and validation returns an issue with `rule: "select-option"` until the application or user selects a valid value. Replacing `a` through `Rows.set(id, "a", nextOptions)` tracks and reverts the nested array as one field. Array-index paths and arbitrary recursive binding are outside the first-release contract.

## Accessible identity and fast binding

A field marker or RowId may repeat; a DOM `id` may not.[^html-id] The framework never uses `id` for row lookup. Reusable page and row markup defaults to classes/data markers and wrapping `label` elements, so two MDI copies need no repeated fixed IDs. IDs generated by the framework for errors or controls are document-unique with matching `for`/ARIA references. Authored IDs remain unchanged. A fixed ID in a repeated template is rejected before the first clone. A URL/factory view is checked before insertion; an already attached borrowed root is checked before activation, excluding its own nodes from the comparison. A borrowed root with pre-existing duplicate IDs cannot be repaired by mount and must be corrected by the caller. Each failure raises `DUPLICATE_ID` with the root and ID. M4 tests whether an optional legacy ID-scoping transform can rewrite local `for`, ARIA ID references, and fragments without breaking authored CSS or controller selectors; only a passing prototype may add it. Otherwise the migration guide replaces fixed IDs in reusable HTML. This keeps simultaneous MDI instances standards-conformant without a document-wide ID lookup per field.

A component parses field/path/rule descriptors once per authored template, gathers each clone's local element references once, and updates only affected visible fields or child components. Duplicate-ID checks use the template's ID set and one document comparison per mount, not a document scan per cell. Initial rows are inserted in batches; handlers use the component root or page signal rather than one document-wide query or a listener per cell. M4 measures 100 and 1000 rows with 10 fields, across initial bind, rebind, single-field edit, sort/filter, and disposal. Each scenario runs repeatedly on the same browser/machine and records median time and memory where available. Shared 1.x/2.0 scenarios are compared directly; row-local nested Select, absent in 1.x, receives its own 2.0 cost measurement. M4 sets numeric regression budgets from these measurements; M6 must meet them before the basic Grid is complete. The basic Grid keeps native `table` semantics and `th scope="col"`. Sort and row selection use real buttons or controls; headers expose `aria-sort` and selection controls expose their selected state. `role="grid"` is introduced only if its complete arrow-key and focus-management pattern is implemented.[^wai-table][^apg-grid] Chromium, Firefox, and WebKit checks require zero duplicate IDs, valid label/ARIA references, keyboard selection and focus, and no stale updates after disposal.

## Formatter, validator, and Form contract

```ts
type Rule = readonly [name: string, ...args: unknown[]];
interface RuleContext {
  readonly field: string;
  readonly values: Snapshot<Record<string, unknown>>;
  readonly rowId: RowId | null;
  readonly element?: HTMLElement;
}
type FormatRule = (value: string, args: readonly unknown[], context: RuleContext) => string;
type ValidateRule = (value: string, args: readonly unknown[], context: RuleContext) => boolean | string;
type ParseInput = (input: string, context: RuleContext) => unknown;
interface RuleSet {
  format?: Record<string, FormatRule>;
  validate?: Record<string, ValidateRule>;
  messages?: Record<string, string>;
  locale?: string;
}
interface ValidationIssue {
  rowId: RowId | null;
  field: string;
  rule: string;
  message: string;
  element?: HTMLElement; // Absent when validating a hidden/unbound row.
}
interface ValidationResult {
  valid: boolean;
  issues: readonly ValidationIssue[];
}
interface FormHandle<T extends object> {
  bind(id: RowId | null): void;
  read(): Record<string, unknown>;
  validate(id?: RowId): ValidationResult;
  dispose(): void;
}
declare function bindForm<T extends object = Record<string, unknown>>(
  root: HTMLElement,
  options?: { rows?: Rows<T>; rules?: RuleSet; parse?: Record<string, ParseInput> }
): FormHandle<T>;
```

HTML retains the 1.x JSON list syntax and built-in rule names: `data-format='[["commas"]]'` and `data-validate='[["required"],["email"]]'`. `bindForm(root, { rows?, rules?, parse? })` returns a handle with `bind(id | null)`, `read()`, `validate(id?)`, and `dispose()`. `read()` returns a detached record of only bound fields in nested JSON shape; it is not a full `T` row snapshot. Without `rows` it owns local values for a search form. With `rows`, a bound field writes through `Rows.set` only after input parsing (if configured) and validation succeed. Focus restores the stored raw value; this is not an inverse formatter operation. An input draft is parsed if a field parser exists, then validators inspect that raw candidate, never formatted display text. A failed parse or rule leaves the unformatted draft visible and creates an issue. Only a valid candidate enters `Rows.set`; blur then reapplies one-way display formatting. `validate(id)` uses retained raw draft input when present and stored raw data otherwise, including for an unrendered row. `parse` is an optional field-name map of `ParseInput` functions, used only when an application needs input conversion. A failed edit stays in a row-keyed draft and does not corrupt the row. `bind(id)` preserves the previous row's draft and restores a target row's draft on return; `replace`, `revert`, and disposal discard affected drafts. For a local Form without `rows`, `validate()` checks its current inputs. For a row-bound Form, `validate()` checks every retained invalid draft and the currently bound row, or returns valid if neither exists. `validate(id)` checks that row's draft if present, otherwise its stored raw data, even when filtered out; it does not rebind or change another draft. Every issue from `validate(id)` carries that non-null row ID. HTML Constraint Validation API results and custom/built-in rule results appear in one `ValidationResult`. The component exposes field errors in the authored HTML and keeps their text/ARIA association; M5 fixes exact event timing and markup choices.

The existing built-in formatter and validator catalogs, dynamic rule dispatch, rule messages, and transitive mask/date/byte-count operations are in scope. No built-in rule may be removed merely because a static search finds no call. The 1.x names below are retained as M1's catalog boundary; M5 tests arguments and corrected behavior rather than copying documented bugs. The `date` formatter remains in M5, while its optional custom calendar attachment waits for M11.

| Catalog | Retained 1.x rule names |
|---|---|
| Formatter | `commas`, `rrn`, `ssn`, `kbrn`, `kcn`, `upper`, `lower`, `capitalize`, `zipcode`, `phone`, `realnum`, `trimtoempty`, `trimtozero`, `trimtoval`, `date`, `time`, `limit`, `replace`, `lpad`, `rpad`, `mask`, `generic`, `numeric` |
| Validator | `required`, `alphabet`, `integer`, `korean`, `number`, `decimal`, `phone`, `email`, `url`, `zipcode`, `rrn`, `ssn`, `frn`, `frn_rrn`, `kbrn`, `kcn`, `date`, `time`, `accept`, `notAccept`, `match`, `notMatch`, `acceptFileExt`, `notAcceptFileExt`, `equalTo`, `maxlength`, `minlength`, `rangelength`, `maxbyte`, `minbyte`, `rangebyte`, `maxvalue`, `minvalue`, `rangevalue`, `regexp` |
| Combined validator names | `alphabet+integer`, `integer+korean`, `alphabet+korean`, `alphabet+integer+korean`, `integer+dash`, `integer+commas` |

Name lookup stays case-insensitive, including combined-name normalization. The 1.x camel-case `equalTo` lookup bug is corrected rather than treated as a reason to remove that rule. In 2.0 its argument is a `data-field` path resolved within the same Form or row, not a document-wide CSS selector; the migration guide records this argument change. See [formatter](../../v1/docs/data/formatter.md) and [validator](../../v1/docs/data/validator.md) for 1.x arguments and known bugs. `RuleSet` adds user rules and message overrides per component or shared page object without a mutable global registry. Its `locale` selects the built-in message language; M5 specifies exact fallback and available locales. A user rule with a built-in name intentionally overrides that rule for that component. Unknown names or malformed arguments raise a `FrameworkError` naming the field and rule. Business-specific new rules live in the application.

`bindGrid(root, { rows, rules?, onSelect? })` and the later List component use the same field/rule runner as Form. Grid selection carries a `RowSnapshot<T>` and the originating event (or `null` for programmatic changes), never an array index. `grid.validate()` checks all retained invalid drafts, including filtered-out rows; `grid.validate(id)` checks that row's draft or stored fields and child Selects even when filtered out. Comparators and predicates are application functions, not a public data-utility catalog.

```ts
interface GridHandle<T extends object> {
  select(id: RowId | null): void;
  selected(): RowId | null;
  setSort(compare: ((a: Snapshot<T>, b: Snapshot<T>) => number) | null): void;
  setFilter(predicate: ((row: Snapshot<T>) => boolean) | null): void;
  validate(id?: RowId): ValidationResult;
  dispose(): void;
}
declare function bindGrid<T extends object>(root: HTMLTableElement, options: {
  rows: Rows<T>;
  rules?: RuleSet;
  onSelect?: (selection: {
    id: RowId | null;
    row: RowSnapshot<T> | null;
    event: Event | null;
  }) => void;
}): GridHandle<T>;
```

## Search, detail edit, and save in authored HTML

The same controller runs with a horizontal or vertical stylesheet. `data-role` only locates elements in this example; `data-field` and the rule attributes carry framework meaning.

```html
<section data-page="employees">
  <form data-role="search">
    <input data-field="query" aria-label="Search employees">
    <button type="submit">Search</button>
  </form>
  <table data-role="grid">
    <thead><tr><th scope="col">Employee</th><th scope="col">Email</th><th scope="col">Choice</th></tr></thead>
    <tbody><tr data-row-template>
      <th scope="row"><button type="button" data-select-row>Open <span data-field="name"></span></button></th>
      <td data-field="email"></td>
      <td><label>Choice
        <select data-field="chosen" data-options="a" data-option-label="aa" data-option-value="bb">
          <option value="">Choose</option>
        </select>
      </label></td>
    </tr></tbody>
  </table>
  <form data-role="detail">
    <input data-field="name" data-validate='[["required"]]' aria-label="Name">
    <input data-field="email" data-validate='[["required"],["email"],["companyEmail"]]' aria-label="Email">
    <input data-field="salary" data-format='[["commas"]]' data-validate='[["integer"]]' aria-label="Salary">
  </form>
  <button type="button" data-action="save">Save changes</button>
  <output data-role="error" aria-live="polite"></output>
</section>
```

```ts
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindForm, bindGrid } from "@bbalganjjm/natural_js/ui";
import { createCommunicator } from "@bbalganjjm/natural_js/comm";
import type { PageContext } from "@bbalganjjm/natural_js/page";

type Employee = {
  id: string; name: string; email: string; salary: string;
  a: { aa?: number; bb?: number }[]; chosen: number | null;
};
const comm = createCommunicator({ baseURL: new URL("/api/", document.baseURI) });
const rules = {
  validate: {
    companyEmail: (value: string) =>
      value.endsWith("@example.com") || "Use a company email"
  }
};

export function createEmployees({ root, signal, own }: PageContext<{ department: string }>) {
  const rows = createRows<Employee>();
  const searchRoot = root.querySelector<HTMLFormElement>('[data-role="search"]')!;
  const search = bindForm(searchRoot);
  const detail = bindForm(root.querySelector<HTMLFormElement>('[data-role="detail"]')!, { rows, rules });
  const error = root.querySelector<HTMLOutputElement>('[data-role="error"]')!;
  const grid = bindGrid(root.querySelector<HTMLTableElement>('[data-role="grid"]')!, {
    rows, rules, onSelect: ({ id }) => detail.bind(id)
  });
  own(() => { grid.dispose(); detail.dispose(); search.dispose(); rows.dispose(); });

  let searchController: AbortController | undefined;
  async function load() {
    searchController?.abort();
    const current = new AbortController();
    searchController = current;
    try {
      const data = await comm.request<Employee[]>({
        url: "employees/search", method: "POST", json: search.read(),
        signal: AbortSignal.any([signal, current.signal])
      });
      if (signal.aborted || current.signal.aborted) return;
      rows.replace(data);
      detail.bind(null);
    } catch (cause) {
      if (current.signal.aborted && !signal.aborted) return; // Replaced by a newer search.
      throw cause; // Page disposal still cancels init/ready.
    }
  }

  async function save() {
    const current = detail.validate();
    const gridDrafts = grid.validate();
    if (!current.valid || !gridDrafts.valid) return;
    const changes = rows.changes();
    if (!changes.length) return;
    const issues = changes
      .filter(change => change.status !== "delete")
      .flatMap(change => [
        ...detail.validate(change.id).issues,
        ...grid.validate(change.id).issues
      ]);
    if (issues.length) {
      const first = issues[0];
      if (first.rowId !== null) detail.bind(first.rowId);
      error.textContent = first.message;
      return;
    }
    await comm.request<void>({
      url: "employees/save", method: "POST",
      json: changes.map(({ status, value }) => ({ status, value })),
      signal, decode: () => undefined
    });
    if (signal.aborted) return;
    await load();
  }

  function showError(cause: unknown) {
    if (signal.aborted || (cause instanceof Error && cause.name === "AbortError")) return;
    error.textContent = String(cause);
  }
  searchRoot.addEventListener("submit", event => {
    event.preventDefault();
    void load().catch(showError);
  }, { signal });
  root.querySelector('[data-action="save"]')!.addEventListener("click", () => {
    void save().catch(showError);
  }, { signal });

  return { init: load };
}
```

Each new search aborts the previous one without failing page initialization; page disposal still propagates `AbortError` and prevents a late request from touching disposed rows or DOM. Save checks retained drafts in both the detail Form and Grid, then every changed row, including a nested Select even when filtered out. The sample uses an application rule alongside built-in `required`, `email`, `integer`, and `commas`. The request transmits raw values and omits internal `RowId`. M4 adds keyboard and failure fixtures; M5 completes rule behavior; M6 completes the full Grid contract.

## Request and 1.x server conversion

```ts
interface RequestOptions<T> {
  url: string | URL;
  method?: string;
  json?: unknown;
  body?: BodyInit;
  signal?: AbortSignal;
  decode?: (response: Response) => T | Promise<T>;
}
interface Communicator {
  request<T>(options: RequestOptions<T>): Promise<T>;
}
declare function createCommunicator(options?: {
  baseURL?: URL;
  prepare?: (request: Request) => Request | Promise<Request>;
  after?: (response: Response) => Response | Promise<Response>;
}): Communicator;
```

```ts
const comm = createCommunicator({
  baseURL: new URL("/api/", document.baseURI),
  prepare: request => request,
  after: response => response
});
const rows = await comm.request<Employee[]>({
  url: "employees/search",
  method: "POST",
  json: { query: "Kim" },
  signal
});
```

`Communicator.request<T>({ url, method?, json?, body?, signal?, decode? }): Promise<T>` defaults to GET and JSON response decoding. `json` accepts objects or arrays, encodes them as JSON, and cannot be combined with `body`. `decode(response)` handles text, no-content, or application envelopes. A 204 response without an explicit decoder raises `REQUEST_EMPTY`; a void request passes `decode: () => undefined`, as in the save example. `prepare(Request)` and `after(Response)` are optional typed common hooks. A non-2xx response is `REQUEST_HTTP`, invalid JSON is `REQUEST_PARSE`, and cancellation is `AbortError`. Hooks and decoding do not swallow failures; causes remain available.

The old implicit POST JSON becomes explicit `method: "POST", json: payload`. The old `dataIsArray` flag disappears because `json` accepts arrays. If a server requires a JSON-encoded `q` parameter, the application builds it explicitly with `URL.searchParams.set("q", JSON.stringify(value))`. Domain envelopes and transformations stay in application `decode` callbacks.

## Popup round trip and the same page runtime

M7 implements `openPopup(host, pageDefinition, input?)` on top of `mountPage`; Tab uses that same runtime, with its public component signature decided in M7. They do not introduce separate HTML loading or controller initialization paths.

```ts
interface PopupHandle<Output> extends PageHandle<Output> {
  readonly result: Promise<Output | undefined>;
  close(): Promise<void>;
}
declare function openPopup<Input, Output>(
  host: HTMLElement, definition: PageDefinition<Input, Output>, input?: Input
): PopupHandle<Output>;
```

`result` resolves on the first output or an ordinary `close()` without a choice. A direct `dispose()` or parent removal before a choice rejects it with `AbortError`; loading or initialization failure rejects it with the original `FrameworkError`. Once settled, later disposal does not change the result. Await `result` directly for a round trip; `ready` is available when the caller must interact before selection. The popup's result promise belongs to that opening, not a later reopened instance.

```html
<div data-host="popup"></div>
```

```ts
import { openPopup } from "@bbalganjjm/natural_js/ui";
import type { PageDefinition } from "@bbalganjjm/natural_js/page";
import { createEmployeePicker } from "./employee-picker.controller.js";

type PickedEmployee = { id: string; name: string; email: string };
const popupHost = document.querySelector<HTMLElement>('[data-host="popup"]')!;
const employeePickerPage: PageDefinition<{ department: string }, PickedEmployee> = {
  view: new URL("./employee-picker.html", import.meta.url),
  controller: createEmployeePicker
};
const popup = openPopup(popupHost, employeePickerPage, { department: "D01" });
const selected = await popup.result; // PickedEmployee | undefined on close without a choice.
```

Inside the picker controller, `context.output(employee)` resolves the popup result and closes that popup; in main content it notifies `page.onOutput` listeners without changing the mounted page. Popup and tab own focus movement/restoration, keyboard handling, and their page handles. Reopen makes a new controller instance. Dialog attaches behavior to existing dialog HTML; it does not require a framework visual design.

# Next action

The user approved this M1 contract and [the M2 tooling plan](m2-plan.md). M2 built the package foundation; M3 implements the page, row, and communication functions and update this contract if a core invariant changes. Later milestone plans may refine component options but must revise this contract before changing its public invariants.

# Decisions

| Proposed choice | Alternative left out of draft | Reason |
|---|---|---|
| Explicit URL/element/factory plus per-mount controller | Inline script discovery, global selector-derived page identity | Independent roots and predictable loading |
| Native DOM events with `AbortSignal`; one `own` hook for handles | Public event and global GC utility catalogs | Small lifetime contract |
| Form-used formatter/validator engines and built-in rule names | Callback-only Form or application reimplementation of shipped rules | Actual 1.x Form/List/Grid dependency |
| Typed per-component custom rule maps | Global mutable rule registry or general extension engine | Explicit ownership and local reasoning |
| Internal row ID and separate change records | Array index or duplicated DOM `id` as identity | Stable edits after sort/filter |
| Row-local nested option data and safe object paths | Recursive expression binding or treating an array as selected scalar | Clear child-component ownership and tracked changes |
| ID-free reusable markup with duplicate detection | Repeating fixed DOM IDs in MDI or Grid rows | Standards-conformant labels and references |
| Template descriptors and row-local references | Per-cell document queries and timer-driven row creation | Measured binding speed |
| Explicit JSON request and one Promise return | Implicit POST, `dataIsArray`, multiple callback/thenable shapes | Clear server conversion |
| One page runtime for main/popup/tab | Container-specific CVC loaders | Same lifecycle and cleanup |
| Direct, local controller functions and plain objects | Generic dependency-injection or declaration parser engine | Fast agent lookup and small edits |
| Optimized rewrite of retained features | Direct copy of 1.x implementation | Faster binding, simpler lifetime, and lower agent edit cost |

No legacy function is removed in M1. M2-M9 removal audits must prove a candidate is unreachable through framework code, declarative attributes, configuration, and shared Form use. User approval is required if a later milestone changes the accepted capability boundary.

# Verification log

| Date | Check | Result |
|---|---|---|
| 2026-09-24 | Independent read-only source audits | CVC, Form rule dispatch, List/Grid Form use, and M0 classification conflict were inspected by separate agents. |
| 2026-09-24 | Contract review | User approved M1 and M2 work; no CVC, data, communication, or UI runtime has been implemented. |

# Open questions

- M1 retains the formatter/validator names listed above, including combined validator names. M5 audits each rule's arguments and corrected behavior against 1.x; none is removed by assumption.
- M4 benchmarks nested Select binding, duplicate-ID prevention, a possible legacy ID-scoping transform, and accessible native-table interaction.
- If automatic nested binding misses its correctness or performance gate, the user may select explicit per-row Select binding for 2.0 and move automatic binding to a later 2.x milestone.
- Date formatting remains in M5 while its optional custom calendar attachment waits until M11.
- M6/M7 fix component-specific options and DOM/accessibility details inside the common signatures.
- Browser tests must verify the proposed blur/validation behavior and popup focus lifecycle before implementation concepts can become verified.

[^html-id]: HTML standard ID uniqueness
[^wai-table]: WAI table accessibility tutorial
[^apg-grid]: WAI-ARIA grid interaction pattern
