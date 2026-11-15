# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: form-prepare.spec.ts >> dispatching canceled synthetic and paused local resets never fabricate future entered data or resume ownership
- Location: tests\browser\form-prepare.spec.ts:188:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 4
+ Received  + 4

@@ -19,24 +19,24 @@
      "mode": "cancel",
      "value": "2,500",
    },
    Object {
      "after": Object {
-       "amount": 2500,
+       "amount": 1200,
      },
      "inside": Object {
        "amount": 2500,
      },
      "mode": "synthetic",
-     "value": "2,500",
+     "value": "1200",
    },
    Object {
      "after": Object {
-       "amount": 1700,
+       "amount": 1200,
      },
      "inside": Object {
        "amount": 1700,
      },
      "mode": "paused",
-     "value": "1700",
+     "value": "1200",
    },
  ]
```

# Page snapshot

```yaml
- main [ref=e2]:
  - heading "Natural-JS 2.0 import smoke" [level=1] [ref=e3]
  - paragraph [ref=e4]:
    - link "Grid contract demo" [ref=e5] [cursor=pointer]:
      - /url: /m10/demo.html
    - text: ·
    - link "Choice-group CVC demo" [ref=e6] [cursor=pointer]:
      - /url: /m5/choices.html
    - text: ·
    - link "Tree and DatePicker CVC demo" [ref=e7] [cursor=pointer]:
      - /url: /m11/side.html
    - text: ·
    - link "Application shell demo" [ref=e8] [cursor=pointer]:
      - /url: /m12/side.html
  - generic [ref=e9]:
    - heading "First authored view" [level=2] [ref=e10]
    - button "Check import" [ref=e11]
    - status [ref=e12]: ESM ready
  - generic [ref=e13]:
    - heading "Second authored view" [level=2] [ref=e14]
    - button "Check import" [ref=e15]
    - status [ref=e16]: ESM ready
```

# Test source

```ts
  100 | test("an accepted equal-projection input is entered data even when an older successful projection has identical text", async ({ page }) => {
  101 |   const result = await page.evaluate(() => {
  102 |     const h = window.prepareForm, root = h.root('<input data-field="amount"><output data-error-for="amount"></output>'), rows = h.api.createRows([{ amount: 10 }]), id = rows.entries()[0].id;
  103 |     let allow = false, parsed = 0; const form = h.api.bindForm(root, { rows, parse: { amount: text => { parsed++; return parseInt(text, 10) + 1; } },
  104 |       rules: { fields: { amount: { format: [["suffix"]], validate: [["allowed"]] } }, format: { suffix: value => value + "!" }, validate: { allowed: () => allow } } });
  105 |     form.bind(id); const input = h.field(root, "amount"); input.dispatchEvent(new Event("input", { bubbles: true })); allow = true; parsed = 0;
  106 |     const before = rows.get(id), markup = root.outerHTML, equal = form.prepare(); input.value = "12"; const direct = form.prepare();
  107 |     const result = { equal: equal.values, direct: direct.values, parsed, unchanged: before === rows.get(id) && markup === root.outerHTML, committed: rows.get(id)!.value.amount };
  108 |     form.dispose(); rows.dispose(); root.remove(); return result;
  109 |   });
  110 |   expect(result).toEqual({ equal: { amount: 11 }, direct: { amount: 13 }, parsed: 2, unchanged: true, committed: 10 });
  111 | });
  112 | 
  113 | test("preparation uses the raw version actually shown while focused source updates defer and after blur publication", async ({ page }) => {
  114 |   const result = await page.evaluate(() => {
  115 |     const h = window.prepareForm, root = h.root('<input data-field="amount">'), rows = h.api.createRows([{ amount: 1200 }]), id = rows.entries()[0].id;
  116 |     let parsed = 0; const form = h.api.bindForm(root, { rows, parse: { amount: text => { parsed++; return Number(text) * 2; } }, rules: { fields: { amount: { format: [["commas"]] } } } });
  117 |     form.bind(id); const input = h.field(root, "amount"); input.focus(); rows.set(id, "amount", 2400);
  118 |     const deferred = { value: input.value, prepared: form.prepare().values, source: rows.get(id)!.value.amount };
  119 |     input.blur(); const published = { value: input.value, prepared: form.prepare().values }; const result = { deferred, published, parsed };
  120 |     form.dispose(); rows.dispose(); root.remove(); return result;
  121 |   });
  122 |   expect(result).toEqual({ deferred: { value: "1200", prepared: { amount: 1200 }, source: 2400 }, published: { value: "2,400", prepared: { amount: 2400 } }, parsed: 0 });
  123 | });
  124 | 
  125 | test("native-only preparation includes root hidden readonly disabled groups and filenames and excludes action display and image fields", async ({ page }) => {
  126 |   const result = await page.evaluate(() => {
  127 |     const h = window.prepareForm, root = h.root('<input data-field="profile.name" value="Ada"><input type="hidden" data-field="hidden" value="secret"><input readonly data-field="readonly" value="read"><input disabled data-field="disabled" value="disabled">' +
  128 |       '<input type="checkbox" data-field="active" checked><input type="checkbox" data-field="tags" value="a" checked><input type="checkbox" data-field="tags" value="b">' +
  129 |       '<input type="radio" name="prepare-radio" data-field="radio" value="r" checked><select multiple data-field="multiple"><option value="a" selected>A</option><option value="b" selected>B</option></select>' +
  130 |       '<fieldset data-field="empty"><legend>Empty choices</legend><template data-choice-template><label><input type="checkbox"><span data-choice-label></span></label></template></fieldset>' +
  131 |       '<input type="file" data-field="file"><input type="button" data-field="action" value="Action"><input type="submit" data-field="submit"><input type="reset" data-field="reset"><input type="image" data-field="imageAction">' +
  132 |       '<button type="button" data-field="button">Button</button><span data-field="display">Shown</span><img data-field="image" alt="Image">');
  133 |     const file = h.field<HTMLInputElement>(root, "file"), transfer = new DataTransfer(); transfer.items.add(new File(["content"], "note.txt")); file.files = transfer.files;
  134 |     const group = h.api.bindChoiceGroup(root.querySelector("fieldset")!, { choices: [] }), form = h.api.bindForm(root), prepared = form.prepare();
  135 |     const input = document.createElement("input"); input.dataset.field = "root"; input.value = "Root"; document.body.append(input); const single = h.api.bindForm(input), singleValue = single.prepare().values;
  136 |     single.dispose(); input.remove(); form.dispose(); group.dispose(); root.remove(); return { prepared, singleValue };
  137 |   });
  138 |   expect(result).toEqual({ prepared: { valid: true, issues: [], values: { profile: { name: "Ada" }, hidden: "secret", readonly: "read", disabled: "disabled", active: true, tags: ["a"], radio: "r", multiple: ["a", "b"], empty: [], file: "note.txt" } }, singleValue: { root: "Root" } });
  139 | });
  140 | 
  141 | test("preparation keeps typed option occurrences signed zero and stored disabled codes separate from new disabled or unmapped selection", async ({ page }) => {
  142 |   const result = await page.evaluate(() => {
  143 |     const h = window.prepareForm, choices = [{ label: "Number", value: 1 }, { label: "String", value: "1" }, { label: "False", value: false }, { label: "Null", value: null }, { label: "Negative", value: -0 }, { label: "Zero", value: 0 }, { label: "Number again", value: 1 }];
  144 |     const rows = h.api.createRows([{ choice: 1, multiple: [1, "1", false, null, -0, 0, 1], choices }, { choice: "blocked", multiple: [], choices }]);
  145 |     const ids = rows.entries().map(row => row.id), root = h.root('<select data-field="choice" data-options="choices" data-option-label="label" data-option-value="value"><option value="blocked" disabled>Blocked</option></select>' +
  146 |       '<select multiple data-field="multiple" data-options="choices" data-option-label="label" data-option-value="value"></select>');
  147 |     const form = h.api.bindForm(root, { rows }); form.bind(ids[0]); const initial = form.prepare().values!, selected = initial.multiple as unknown[];
  148 |     const select = h.field<HTMLSelectElement>(root, "choice"), string = [...select.options].find(option => option.textContent === "String")!; string.selected = true;
  149 |     const entered = form.prepare().values; string.disabled = true; const disabled = form.prepare();
  150 |     form.bind(ids[1]); const storedDisabled = form.prepare().values; const extra = new Option("Foreign", "foreign"); select.append(extra); extra.selected = true;
  151 |     const unmapped = form.prepare(), result = { initial: initial.choice, multiple: selected, signs: selected.map(value => Object.is(value, -0)), entered, storedDisabled,
  152 |       disabled: { valid: disabled.valid, values: disabled.values, rules: disabled.issues.map(issue => issue.rule) }, unmapped: { valid: unmapped.valid, values: unmapped.values, rules: unmapped.issues.map(issue => issue.rule) }, changes: rows.changes().length };
  153 |     form.dispose(); rows.dispose(); root.remove(); return result;
  154 |   });
  155 |   expect(result).toEqual({ initial: 1, multiple: [1, "1", false, null, -0, 0, 1], signs: [false, false, false, false, true, false, false],
  156 |     entered: { choice: "1", multiple: [1, "1", false, null, -0, 0, 1] }, storedDisabled: { choice: "blocked", multiple: [] },
  157 |     disabled: { valid: false, values: null, rules: ["select-option"] }, unmapped: { valid: false, values: null, rules: ["select-option"] }, changes: 0 });
  158 | });
  159 | 
  160 | test("generated catalog publication and rollback keep preparation on the same field and original raw owner", async ({ page }) => {
  161 |   const result = await page.evaluate(() => {
  162 |     const h = window.prepareForm, root = h.root('<fieldset data-field="choice"><legend>Choices</legend><template data-choice-template><label><input type="checkbox"><span data-choice-label></span></label></template></fieldset>');
  163 |     const fieldset = root.querySelector("fieldset")!, choices = ["a", "b"].map(value => ({ label: value, value })), group = h.api.bindChoiceGroup(fieldset, { choices });
  164 |     const rows = h.api.createRows([{ choice: ["a"] }]), id = rows.entries()[0].id, form = h.api.bindForm(root, { rows }); form.bind(id);
  165 |     const snapshot = rows.get(id), first = form.prepare().values; group.setChoices([]); const empty = form.prepare(); group.setChoices(choices);
  166 |     const restored = form.prepare().values, old = [...fieldset.querySelectorAll("input")], insert = fieldset.insertBefore, failure = new Error("Insertion failure");
  167 |     fieldset.insertBefore = () => { throw failure; }; let sameFailure = false; try { group.setChoices([{ label: "C", value: "c" }]); } catch (cause) { sameFailure = cause === failure; } fieldset.insertBefore = insert;
  168 |     const after = form.prepare().values, sameNodes = old.every((input, index) => fieldset.querySelectorAll("input")[index] === input), unchanged = snapshot === rows.get(id);
  169 |     form.dispose(); group.dispose(); rows.dispose(); root.remove(); return { first, empty: { valid: empty.valid, values: empty.values }, restored, after, sameFailure, sameNodes, unchanged };
  170 |   });
  171 |   expect(result).toEqual({ first: { choice: ["a"] }, empty: { valid: false, values: null }, restored: { choice: ["a"] }, after: { choice: ["a"] }, sameFailure: true, sameNodes: true, unchanged: true });
  172 | });
  173 | 
  174 | test("pure preparation observes completed native reset without flushing formatting errors or pending cleanup", async ({ page }) => {
  175 |   const result = await page.evaluate(async () => {
  176 |     const h = window.prepareForm, root = h.root('<input data-field="amount" value="1200"><output data-error-for="amount"></output>'); let formats = 0;
  177 |     const form = h.api.bindForm(root, { parse: { amount: Number }, rules: { fields: { amount: { format: [["commas"]], validate: [["integer"]] } },
  178 |       format: { commas: value => { formats++; return Number(value).toLocaleString("en-US"); } } } });
  179 |     const input = h.field(root, "amount"); input.value = "bad"; input.dispatchEvent(new Event("input", { bubbles: true })); input.defaultValue = "3400";
  180 |     root.reset(); const markup = root.outerHTML, beforeFormats = formats, prepared = form.prepare();
  181 |     const immediate = { values: prepared.values, value: input.value, invalid: input.getAttribute("aria-invalid"), sameMarkup: markup === root.outerHTML, formats: formats - beforeFormats };
  182 |     await new Promise<void>(resolve => setTimeout(resolve, 0)); const settled = { value: input.value, invalid: input.getAttribute("aria-invalid"), read: form.read() };
  183 |     form.dispose(); root.remove(); return { immediate, settled };
  184 |   });
  185 |   expect(result).toEqual({ immediate: { values: { amount: 3400 }, value: "3400", invalid: "true", sameMarkup: true, formats: 0 }, settled: { value: "3,400", invalid: null, read: { amount: "3400" } } });
  186 | });
  187 | 
  188 | test("dispatching canceled synthetic and paused local resets never fabricate future entered data or resume ownership", async ({ page }) => {
  189 |   const result = await page.evaluate(() => {
  190 |     const h = window.prepareForm;
  191 |     return ["dispatch", "cancel", "synthetic", "paused"].map(mode => {
  192 |       const root = h.root('<input data-field="amount" value="1200">'), form = h.api.bindForm(root, { parse: { amount: Number }, rules: { fields: { amount: { format: [["commas"]] } } } });
  193 |       const input = h.field(root, "amount"); input.value = "2500"; input.dispatchEvent(new Event("input", { bubbles: true })); let inside: unknown;
  194 |       if (mode === "paused") { form.unbind(); input.value = "1700"; }
  195 |       root.addEventListener("reset", event => { inside = form.prepare().values; if (mode === "cancel") event.preventDefault(); });
  196 |       if (mode === "synthetic" || mode === "paused") root.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true })); else root.reset();
  197 |       const after = form.prepare().values, value = input.value; form.dispose(); root.remove(); return { mode, inside, after, value };
  198 |     });
  199 |   });
> 200 |   expect(result).toEqual([{ mode: "dispatch", inside: { amount: 2500 }, after: { amount: 1200 }, value: "1200" },
      |                  ^ Error: expect(received).toEqual(expected) // deep equality
  201 |     { mode: "cancel", inside: { amount: 2500 }, after: { amount: 2500 }, value: "2,500" },
  202 |     { mode: "synthetic", inside: { amount: 2500 }, after: { amount: 2500 }, value: "2,500" },
  203 |     { mode: "paused", inside: { amount: 1700 }, after: { amount: 1700 }, value: "1700" }]);
  204 | });
  205 | 
  206 | for (const mode of ["throw", "undefined", "async", "clone"] as const) {
  207 |   test("preparation rejects " + mode + " parser results without state writes and releases its guard", async ({ page }) => {
  208 |     const result = await page.evaluate(async mode => {
  209 |       const h = window.prepareForm, root = h.root('<input data-field="amount" value="5">'); let bad = true, unhandled = 0;
  210 |       const listener = (event: PromiseRejectionEvent) => { unhandled++; event.preventDefault(); }; window.addEventListener("unhandledrejection", listener);
  211 |       const form = h.api.bindForm(root, { parse: { amount: text => {
  212 |         if (!bad) return Number(text); if (mode === "throw") throw new Error("Parser failure"); if (mode === "undefined") return undefined;
  213 |         if (mode === "async") return Promise.reject(new Error("Asynchronous parser")); return () => text;
  214 |       } } }); const markup = root.outerHTML; let invalid: unknown, failure: unknown;
  215 |       try { const prepared = form.prepare(); invalid = { valid: prepared.valid, values: prepared.values, rules: prepared.issues.map(issue => issue.rule) }; } catch (cause) {
  216 |         const error = cause as Failure; failure = { code: error.code, phase: error.detail?.phase }; }
  217 |       bad = false; const retry = form.prepare().values, unchanged = markup === root.outerHTML; await new Promise<void>(resolve => setTimeout(resolve, 0));
  218 |       window.removeEventListener("unhandledrejection", listener); form.dispose(); root.remove(); return { invalid: invalid ?? null, failure: failure ?? null, retry, unchanged, unhandled };
  219 |     }, mode);
  220 |     expect(result).toEqual({ invalid: mode === "throw" || mode === "undefined" ? { valid: false, values: null, rules: ["parse"] } : null,
  221 |       failure: mode === "async" || mode === "clone" ? { code: "FORM_PREPARE", phase: mode === "async" ? "parse" : "clone" } : null,
  222 |       retry: { amount: 5 }, unchanged: true, unhandled: 0 });
  223 |   });
  224 | }
  225 | 
  226 | for (const mode of ["recursive", "caught-recursive", "dispose", "bind", "refresh", "source", "native", "rescan"] as const) {
  227 |   test("preparation guards " + mode + " user work and never returns a stale candidate", async ({ page }) => {
  228 |     const result = await page.evaluate(mode => {
  229 |       const h = window.prepareForm, root = h.root('<input data-field="amount"><input data-field="peer">'), rows = h.api.createRows([{ amount: 10, peer: "A" }, { amount: 20, peer: "B" }]), ids = rows.entries().map(row => row.id);
  230 |       let armed = false, caught: unknown; let form: ReturnType<typeof h.api.bindForm>;
  231 |       form = h.api.bindForm(root, { rows, parse: { amount: text => {
  232 |         if (armed) { armed = false;
  233 |           if (mode === "recursive") form.prepare();
  234 |           if (mode === "caught-recursive") caught = h.failure(() => form.prepare());
  235 |           if (mode === "dispose") form.dispose();
  236 |           if (mode === "bind") form.bind(ids[1]);
  237 |           if (mode === "refresh") form.refresh();
  238 |           if (mode === "source") rows.set(ids[1], "peer", "Committed side effect");
  239 |           if (mode === "native") h.field(root, "peer").value = "Native side effect";
  240 |           if (mode === "rescan") form.rescan();
  241 |         } return Number(text);
  242 |       } } }); form.bind(ids[0]); h.field(root, "amount").value = "5"; armed = true;
  243 |       let valid: unknown; const failure = h.failure(() => { valid = form.prepare().values; });
  244 |       const sideEffect = mode === "source" ? rows.get(ids[1])!.value.peer : mode === "native" ? h.field(root, "peer").value : null;
  245 |       let retry: unknown = null; if (mode !== "dispose") { form.bind(ids[0]); h.field(root, "amount").value = "6"; retry = form.prepare().values; }
  246 |       form.dispose(); rows.dispose(); root.remove(); return { valid: valid ?? null, failure, caught: caught ?? null, sideEffect, retry };
  247 |     }, mode);
  248 |     const failure = mode === "caught-recursive" ? null : { code: mode === "dispose" ? "FORM_DISPOSED" : mode === "rescan" ? "FORM_RESCAN" : "FORM_PREPARE",
  249 |       phase: mode === "dispose" || mode === "rescan" ? null : mode === "recursive" ? "reentry" : "stale" };
  250 |     expect(result).toEqual({ valid: mode === "caught-recursive" ? { amount: 5, peer: "A" } : null, failure,
  251 |       caught: mode === "caught-recursive" ? { code: "FORM_PREPARE", phase: "reentry" } : null,
  252 |       sideEffect: mode === "source" ? "Committed side effect" : mode === "native" ? "Native side effect" : null,
  253 |       retry: mode === "dispose" ? null : { amount: 6, peer: "A" } });
  254 |   });
  255 | }
  256 | 
  257 | test("native getter supersession is checked and conflicting native paths fail before getters or parsers", async ({ page }) => {
  258 |   const result = await page.evaluate(() => {
  259 |     const h = window.prepareForm, root = h.root('<input data-field="amount">'), rows = h.api.createRows([{ amount: 10, other: "A" }]), id = rows.entries()[0].id,
  260 |       form = h.api.bindForm(root, { rows }), input = h.field(root, "amount"), descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!;
  261 |     form.bind(id); let armed = true; Object.defineProperty(input, "value", { configurable: true, get() {
  262 |       if (armed) { armed = false; rows.set(id, "other", "Committed getter"); } return descriptor.get!.call(this);
  263 |     }, set(value) { descriptor.set!.call(this, value); } }); const stale = h.failure(() => form.prepare()); delete (input as unknown as { value?: string }).value;
  264 |     const retry = form.prepare().values; form.dispose(); rows.dispose(); root.remove();
  265 |     const conflictRoot = h.root('<input data-field="profile" value="value"><input data-field="profile.name" value="name">'); let reads = 0, parses = 0;
  266 |     const conflict = h.api.bindForm(conflictRoot, { parse: { profile: text => { parses++; return text; } } });
  267 |     for (const element of conflictRoot.querySelectorAll("input")) Object.defineProperty(element, "value", { configurable: true, get() { reads++; return "value"; } });
  268 |     const fields = h.failure(() => conflict.prepare()); for (const element of conflictRoot.querySelectorAll("input")) delete (element as unknown as { value?: string }).value;
  269 |     conflict.dispose(); conflictRoot.remove(); return { stale, retry, fields, reads, parses };
  270 |   });
  271 |   expect(result).toEqual({ stale: { code: "FORM_PREPARE", phase: "stale" }, retry: { amount: 10 }, fields: { code: "FORM_PREPARE", phase: "fields" }, reads: 0, parses: 0 });
  272 | });
  273 | 
  274 | test("readonly and disabled ignored events keep raw tokens while preparation returns detached native candidates outside the Rows JSON domain", async ({ page }) => {
  275 |   const result = await page.evaluate(() => {
  276 |     const h = window.prepareForm, root = h.root('<input disabled data-field="disabled"><input readonly data-field="readonly"><input data-field="nested">'), rows = h.api.createRows([{ disabled: 1200, readonly: 2400, nested: { items: [{ value: 1 }] } }]), id = rows.entries()[0].id;
  277 |     let parsed = 0; const form = h.api.bindForm(root, { rows, parse: { disabled: value => { parsed++; return Number(value) * 2; }, readonly: value => { parsed++; return Number(value) * 2; } },
  278 |       rules: { fields: { disabled: { format: [["commas"]] }, readonly: { format: [["commas"]] } } } }); form.bind(id);
  279 |     for (const name of ["disabled", "readonly"]) h.field(root, name).dispatchEvent(new Event("input", { bubbles: true }));
  280 |     const initial = form.prepare().values!, rawTypes = [initial.disabled, initial.readonly], ignoredCalls = parsed;
  281 |     (initial.nested as { items: { value: number }[] }).items[0].value = 99; h.field(root, "readonly").value = "5";
  282 |     const direct = form.prepare().values!, detached = (direct.nested as { items: { value: number }[] }).items[0].value === 1;
  283 |     const sourceUnchanged = rows.get(id)!.value.readonly === 2400 && rows.changes().length === 0;
  284 |     form.dispose(); rows.dispose(); root.remove();
  285 |     const local = h.root('<input data-field="date" value="2020-01-02T00:00:00.000Z">'), dateForm = h.api.bindForm(local, { parse: { date: value => new Date(value) } });
  286 |     const first = dateForm.prepare().values!, date = first.date as Date, rejected = h.failure(() => h.api.createRows([{ date }])); date.setUTCFullYear(2001);
  287 |     const second = dateForm.prepare().values!, cloned = (second.date as Date).toISOString(); dateForm.dispose(); local.remove();
  288 |     return { rawTypes, ignoredCalls, direct: [direct.disabled, direct.readonly], parsed, detached, sourceUnchanged, rejected: rejected?.code, cloned };
  289 |   });
  290 |   expect(result).toEqual({ rawTypes: [1200, 2400], ignoredCalls: 0, direct: [1200, 10], parsed: 1, detached: true, sourceUnchanged: true, rejected: "ROW_VALUE", cloned: "2020-01-02T00:00:00.000Z" });
  291 | });
  292 | 
  293 | test("compatible rescan retains shown raw while new retired and unbound fields keep their own preparation boundary", async ({ page }) => {
  294 |   const result = await page.evaluate(() => {
  295 |     const h = window.prepareForm, root = h.root('<input data-field="amount" value="7">'), rows = h.api.createRows([{ amount: 1200, extra: 9 }]), id = rows.entries()[0].id;
  296 |     let amountCalls = 0, extraCalls = 0; const form = h.api.bindForm(root, { rows, parse: { amount: text => { amountCalls++; return Number(text) * 2; }, extra: text => { extraCalls++; return Number(text); } }, rules: { fields: { amount: { format: [["commas"]] } } } });
  297 |     form.bind(id); form.rescan(); const compatible = form.prepare().values;
  298 |     const extra = document.createElement("input"); extra.dataset.field = "extra"; extra.value = "5"; root.append(extra); form.rescan(); const adopted = form.prepare().values;
  299 |     form.refresh(["extra"]); const refreshed = form.prepare().values; extra.remove(); form.rescan(); const retired = form.prepare().values;
  300 |     const beforeUnbind = { amountCalls, extraCalls }; form.unbind(); const unbound = form.prepare().values; h.field(root, "amount").dispatchEvent(new Event("input", { bubbles: true })); const stillPaused = form.prepare().values;
```