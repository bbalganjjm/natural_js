# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: grid-change-state.spec.ts >> null and stale Form binding clear field flags without changing retained Grid deletion state
- Location: tests\browser\grid-change-state.spec.ts:237:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

  Object {
-   "form": "false",
+   "form": "true",
    "grid": Array [
      "true",
    ],
  }
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
  - generic [ref=e17]:
    - heading "Committed field state" [level=2] [ref=e18]
    - group "Shared employee editor" [ref=e20]:
      - generic [ref=e22]:
        - text: Name
        - textbox "Name" [ref=e23]
      - generic [ref=e24]:
        - text: Note
        - textbox "Note" [ref=e25]
      - generic [ref=e26]:
        - text: Mode
        - radio "Mode Office" [ref=e27]
        - text: Office
      - generic [ref=e28]:
        - radio "Remote" [ref=e29]
        - text: Remote
      - generic [ref=e30]:
        - text: Channels
        - checkbox "Channels Email" [ref=e31]
        - text: Email
      - generic [ref=e32]:
        - checkbox "SMS" [ref=e33]
        - text: SMS
      - generic [ref=e34]:
        - text: Tags
        - listbox "Tags" [ref=e35]:
          - option "Alpha" [ref=e36]
          - option "Beta" [ref=e37]
          - option "Gamma" [ref=e38]
      - generic [ref=e39]:
        - text: Choice
        - combobox "Choice" [ref=e40]:
          - option "Eleven"
          - option "Twenty two"
      - generic [ref=e41]:
        - checkbox "Active" [ref=e42]
        - text: Active
      - img "Form employee portrait" [ref=e43]
      - generic:
        - strong
    - region "Committed employee rows" [ref=e44]:
      - table [ref=e45]:
        - caption [ref=e46]: Committed employee fields
        - rowgroup [ref=e51]:
          - row [ref=e52]:
            - columnheader "Identity" [ref=e53]
            - columnheader "Profile" [ref=e54]
            - columnheader "Settings" [ref=e55]
        - rowgroup [ref=e56]:
          - row [ref=e57]:
            - rowheader [ref=e58]:
              - text: "9"
              - button "Select record" [ref=e59]
              - generic [ref=e60]:
                - checkbox "Check record" [ref=e61]
                - text: Check record
              - button "Undo changes" [ref=e62]
            - cell [ref=e63]:
              - generic [ref=e64]:
                - text: Name
                - textbox "Name" [ref=e65]: Person 9
            - cell [ref=e66]:
              - generic [ref=e67]:
                - text: Mode
                - radio "Mode Office" [checked] [ref=e68]
                - text: Office
              - generic [ref=e69]:
                - radio "Remote" [ref=e70]
                - text: Remote
              - generic [ref=e71]:
                - text: Channels
                - checkbox "Channels Email" [checked] [ref=e72]
                - text: Email
              - generic [ref=e73]:
                - checkbox "SMS" [ref=e74]
                - text: SMS
              - generic [ref=e75]:
                - text: Tags
                - listbox "Tags" [ref=e76]:
                  - option "Alpha" [selected] [ref=e77]
                  - option "Beta" [selected] [ref=e78]
                  - option "Gamma" [ref=e79]
              - generic [ref=e80]:
                - text: Choice
                - combobox "Choice" [ref=e81]:
                  - option "Eleven" [selected]
                  - option "Twenty two"
              - generic [ref=e82]:
                - checkbox "Active" [checked] [ref=e83]
                - text: Active
          - row [ref=e84]:
            - cell [ref=e85]:
              - generic [ref=e86]:
                - text: Note
                - textbox "Note" [ref=e87]: Note 9
              - text: Same display
            - cell [ref=e88]:
              - img "Employee portrait" [ref=e89]
              - strong [ref=e91]: Summary 9
```

# Test source

```ts
  144 |     return { changed, restored: h.markers(1, "tags"), sibling: h.markers(1, "profile.name"), status: h.rows.get(1)?.status }; });
  145 |   expect(result).toEqual({ changed: { marker: ["true"], visible: ["a", "b"] }, restored: ["false"], sibling: ["false"], status: "clean" });
  146 | });
  147 | 
  148 | test("all radio and checkbox group members share their committed field state", async ({ page }) => {
  149 |   const result = await page.evaluate(() => { const h = window.changeState;
  150 |     h.rows.setMany([{ id: 1, values: { mode: "remote", channels: ["sms"], active: false } }]);
  151 |     const changed = { radio: h.markers(1, "mode"), checks: h.markers(1, "channels"), active: h.markers(1, "active"),
  152 |       formRadio: h.formFields("mode").map(element => element.getAttribute("data-field-changed")) };
  153 |     h.rows.revert(1); return { changed, radio: h.markers(1, "mode"), checks: h.markers(1, "channels") }; });
  154 |   expect(result).toEqual({ changed: { radio: ["true", "true"], checks: ["true", "true"], active: ["true"], formRadio: ["true", "true"] },
  155 |     radio: ["false", "false"], checks: ["false", "false"] });
  156 | });
  157 | 
  158 | test("Select markers compare selected raw values instead of option labels or option-list changes", async ({ page }) => {
  159 |   const result = await page.evaluate(() => { const h = window.changeState;
  160 |     h.rows.set(1, "choices", [{ label: "Renamed eleven", value: 11 }, { label: "Twenty two", value: 22 }, { label: "Thirty three", value: 33 }]);
  161 |     const choicesOnly = { marker: h.markers(1, "chosen"), value: h.rows.get(1)?.value.chosen, count: h.fields<HTMLSelectElement>(1, "chosen")[0].options.length };
  162 |     h.rows.set(1, "chosen", 22); const changed = [h.markers(1, "chosen"), h.formFields("chosen")[0].getAttribute("data-field-changed")];
  163 |     h.rows.set(1, "chosen", 11); return { choicesOnly, changed, restored: h.markers(1, "chosen"), status: h.rows.get(1)?.status }; });
  164 |   expect(result).toEqual({ choicesOnly: { marker: ["false"], value: 11, count: 3 }, changed: [["true"], "true"], restored: ["false"], status: "update" });
  165 | });
  166 | 
  167 | test("unchanged formatted text does not hide raw changes on displays, rendered fields and images", async ({ page }) => {
  168 |   const result = await page.evaluate(() => { const h = window.changeState;
  169 |     h.rows.setMany([{ id: 1, values: { constant: 2, summary: "New summary", avatar: "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=" } }]);
  170 |     const changed = { constant: h.markers(1, "constant"), text: h.fields(1, "constant")[0].textContent,
  171 |       summary: h.markers(1, "summary"), rich: h.fields(1, "summary")[0].querySelector("strong")?.textContent,
  172 |       image: h.markers(1, "avatar"), formImage: h.formFields("avatar")[0].getAttribute("data-field-changed") };
  173 |     h.rows.revert(1); return { changed, restored: [h.markers(1, "constant"), h.markers(1, "summary"), h.markers(1, "avatar")] }; });
  174 |   expect(result).toEqual({ changed: { constant: ["true"], text: "Same display", summary: ["true"], rich: "New summary", image: ["true"], formImage: "true" },
  175 |     restored: [["false"], ["false"], ["false"]] });
  176 | });
  177 | 
  178 | test("Form commits update markers without replacing the focused input or its caret", async ({ page }) => {
  179 |   const result = await page.evaluate(() => { const h = window.changeState, input = h.formFields<HTMLInputElement>("profile.name")[0];
  180 |     input.focus(); input.value = "Focused Form"; input.setSelectionRange(2, 5); input.dispatchEvent(new Event("input", { bubbles: true }));
  181 |     return { current: h.rows.get(1)?.value.profile.name, marker: input.getAttribute("data-field-changed"), grid: h.markers(1, "profile.name"),
  182 |       same: h.formFields("profile.name")[0] === input, focused: document.activeElement === input, caret: [input.selectionStart, input.selectionEnd] }; });
  183 |   expect(result).toEqual({ current: "Focused Form", marker: "true", grid: ["true"], same: true, focused: true, caret: [2, 5] });
  184 | });
  185 | 
  186 | test("Grid commits update markers without replacing the focused input or its caret", async ({ page }) => {
  187 |   const result = await page.evaluate(() => { const h = window.changeState, input = h.fields<HTMLInputElement>(1, "profile.name")[0];
  188 |     input.focus(); input.value = "Focused Grid"; input.setSelectionRange(1, 4); input.dispatchEvent(new Event("change", { bubbles: true }));
  189 |     return { current: h.rows.get(1)?.value.profile.name, marker: input.getAttribute("data-field-changed"), form: h.formFields("profile.name")[0].getAttribute("data-field-changed"),
  190 |       same: h.fields(1, "profile.name")[0] === input, focused: document.activeElement === input, caret: [input.selectionStart, input.selectionEnd] }; });
  191 |   expect(result).toEqual({ current: "Focused Grid", marker: "true", form: "true", same: true, focused: true, caret: [1, 4] });
  192 | });
  193 | 
  194 | test("invalid drafts neither create committed changes nor erase an existing committed field change", async ({ page }) => {
  195 |   const result = await page.evaluate(() => { const h = window.changeState, input = h.fields<HTMLInputElement>(1, "profile.name")[0];
  196 |     input.value = ""; input.dispatchEvent(new Event("input", { bubbles: true }));
  197 |     const clean = { marker: h.markers(1, "profile.name"), stored: h.rows.get(1)?.value.profile.name, valid: h.grid.validate(1).valid };
  198 |     h.rows.set(1, "profile", { name: "Committed", note: "Note 1" });
  199 |     const formInput = h.formFields<HTMLInputElement>("profile.name")[0]; formInput.value = ""; formInput.dispatchEvent(new Event("input", { bubbles: true }));
  200 |     const dirty = { form: formInput.getAttribute("data-field-changed"), grid: h.markers(1, "profile.name"), stored: h.rows.get(1)?.value.profile.name,
  201 |       valid: h.form.validate(1).valid, error: h.formRoot.querySelector("output")!.getAttribute("data-field-changed") };
  202 |     h.rows.revert(1); return { clean, dirty, reverted: [h.markers(1, "profile.name"), h.formFields("profile.name")[0].getAttribute("data-field-changed")] }; });
  203 |   expect(result).toEqual({ clean: { marker: ["false"], stored: "Person 1", valid: false },
  204 |     dirty: { form: "true", grid: ["true"], stored: "Committed", valid: false, error: "form-error-authored" }, reverted: [["false"], "false"] });
  205 | });
  206 | 
  207 | test("inserted and copied records have no original baseline while clean append gains one", async ({ page }) => {
  208 |   const result = await page.evaluate(() => { const h = window.changeState;
  209 |     const inserted = h.rows.add(h.item(90)), copied = h.rows.copy(1), [loaded] = h.rows.append([h.item(91)]);
  210 |     h.rows.set(inserted, "summary", "Edited insert"); h.rows.set(copied, "profile", { name: "Copied edit", note: "Note 1" });
  211 |     const markers = [inserted, copied, loaded].map(id => h.block(id).flatMap(row => [...row.querySelectorAll("[data-field]")].map(element => element.getAttribute("data-field-changed"))));
  212 |     h.form.bind(inserted); const form = h.formFields("summary")[0].getAttribute("data-field-changed");
  213 |     return { markers, form, insertOriginal: h.rows.original(inserted), copyOriginal: h.rows.original(copied), loadedOriginal: h.rows.original(loaded)?.summary,
  214 |       statuses: [inserted, copied, loaded].map(id => h.rows.get(id)?.status) }; });
  215 |   for (const markers of result.markers) expect(new Set(markers)).toEqual(new Set(["false"]));
  216 |   expect(result.form).toBe("false"); expect(result.insertOriginal).toBeUndefined(); expect(result.copyOriginal).toBeUndefined();
  217 |   expect(result.loadedOriginal).toBe("Summary 91"); expect(result.statuses).toEqual(["insert", "insert", "clean"]);
  218 | });
  219 | 
  220 | test("retained deletion keeps edited fields and dirty markers but transmits loaded originals and Undo restores them", async ({ page }) => {
  221 |   const result = await page.evaluate(() => { const h = window.changeState; h.reset(3, { statusFilter: ["clean", "insert", "update", "delete"] });
  222 |     h.grid.select(1); h.grid.setSelected([1]); h.grid.setChecked([1]);
  223 |     h.rows.setMany([{ id: 1, values: { profile: { name: "Edited before delete", note: "Note 1" }, chosen: 22, channels: ["sms"] } }]);
  224 |     h.rows.remove(1);
  225 |     const input = h.fields<HTMLInputElement>(1, "profile.name")[0];
  226 |     const deleted = { value: input.value, marker: h.markers(1, "profile.name"), sibling: h.markers(1, "profile.note"), selected: h.markers(1, "chosen"),
  227 |       group: h.markers(1, "channels"), disabled: input.disabled, original: h.rows.original(1)?.profile.name,
  228 |       payload: h.rows.changes().find(row => row.id === 1)?.value.profile.name, selectedIds: h.grid.selectedIds(), checks: h.grid.checkedIds(), active: h.grid.selected() };
  229 |     h.block(1)[0].querySelector<HTMLButtonElement>('[data-row-action="undo"]')!.click();
  230 |     return { deleted, restored: { value: h.fields<HTMLInputElement>(1, "profile.name")[0].value, marker: h.markers(1, "profile.name"),
  231 |       disabled: h.fields<HTMLInputElement>(1, "profile.name")[0].disabled, status: h.rows.get(1)?.status, changes: h.rows.changes() } }; });
  232 |   expect(result).toEqual({ deleted: { value: "Edited before delete", marker: ["true"], sibling: ["false"], selected: ["true"], group: ["true", "true"],
  233 |     disabled: true, original: "Person 1", payload: "Person 1", selectedIds: [], checks: [], active: null },
  234 |     restored: { value: "Person 1", marker: ["false"], disabled: false, status: "clean", changes: [] } });
  235 | });
  236 | 
  237 | test("null and stale Form binding clear field flags without changing retained Grid deletion state", async ({ page }) => {
  238 |   const result = await page.evaluate(() => { const h = window.changeState; h.reset(3, { statusFilter: ["clean", "update", "delete"] });
  239 |     h.rows.set(1, "profile", { name: "Edited", note: "Note 1" }); h.form.bind(null);
  240 |     const nullBinding = [...h.formRoot.querySelectorAll("[data-field]")].map(element => element.getAttribute("data-field-changed"));
  241 |     h.form.bind(1); h.rows.remove(1);
  242 |     const deleted = { form: h.formFields("profile.name")[0].getAttribute("data-field-changed"), grid: h.markers(1, "profile.name") };
  243 |     h.rows.replace([h.item(9)]); return { nullBinding, deleted, stale: h.formFields("profile.name")[0].getAttribute("data-field-changed"), grid: h.grid.rowIds("visible").length }; });
> 244 |   expect(new Set(result.nullBinding)).toEqual(new Set(["false"])); expect(result.deleted).toEqual({ form: "false", grid: ["true"] });
      |                                                                                           ^ Error: expect(received).toEqual(expected) // deep equality
  245 |   expect(result.stale).toBe("false"); expect(result.grid).toBe(1);
  246 | });
  247 | 
  248 | test("owned Form attributes and exact Grid template restore while local Forms never take marker ownership", async ({ page }) => {
  249 |   const result = await page.evaluate(async ({ form }) => { const { bindForm } = await import(form); const h = window.changeState;
  250 |     const local = document.createElement("form"); local.innerHTML = '<label>Local <input data-field="name" data-field-changed="application" value="Local"></label>';
  251 |     h.host.append(local); const localForm = bindForm(local), input = local.querySelector<HTMLInputElement>("input")!;
  252 |     input.value = "Changed local"; input.dispatchEvent(new Event("input", { bubbles: true })); localForm.validate();
  253 |     const untouched = input.getAttribute("data-field-changed"); localForm.dispose();
  254 |     h.rows.set(1, "summary", "Stored edit"); h.form.dispose(); h.grid.dispose();
  255 |     const restored = [...h.formRoot.querySelectorAll("[data-field]")].map(element => element.getAttribute("data-field-changed"));
  256 |     const before = h.table.outerHTML; input.dispatchEvent(new Event("input", { bubbles: true })); h.rows.set(1, "summary", "Late edit");
  257 |     return { untouched, local: input.getAttribute("data-field-changed"), restored, expected: h.formMarkers, table: before === h.tableSource, quiet: h.table.outerHTML === before }; }, modules);
  258 |   expect(result).toEqual({ untouched: "application", local: "application", restored: result.expected, expected: result.expected, table: true, quiet: true });
  259 | });
  260 | 
  261 | test("sort filter page and column changes preserve leaf identity rather than display indexes", async ({ page }) => {
  262 |   const result = await page.evaluate(() => { const h = window.changeState;
  263 |     h.rows.set(3, "profile", { name: "Changed third", note: "Note 3" });
  264 |     h.grid.setSort((a, b) => b.key - a.key); h.grid.setPage({ page: 1, size: 1 });
  265 |     const sorted = { ids: h.grid.rowIds("visible"), changed: h.markers(3, "profile.name"), sibling: h.markers(3, "profile.note") };
  266 |     h.grid.setColumns(h.grid.columns().map(column => ({ ...column, hidden: column.key === "profile" })));
  267 |     h.grid.setColumns(h.grid.columns().map(column => ({ ...column, hidden: false }))); h.grid.setFilter(row => row.key !== 3);
  268 |     const hidden = h.block(3).length; h.grid.setFilter(null); h.grid.refresh();
  269 |     return { sorted, hidden, restored: h.markers(3, "profile.name"), node: h.fields<HTMLInputElement>(3, "profile.name")[0].value }; });
  270 |   expect(result).toEqual({ sorted: { ids: [3], changed: ["true"], sibling: ["false"] }, hidden: 0, restored: ["true"], node: "Changed third" });
  271 | });
  272 | 
  273 | test("offscreen edits and deletion remount with their data-owned baseline and bounded physical rows", async ({ page }) => {
  274 |   const result = await page.evaluate(async () => { const h = window.changeState;
  275 |     h.reset(500, { viewport: { root: h.scroll, estimate: 240, overscan: 1 }, statusFilter: ["clean", "update", "delete"] });
  276 |     h.rows.set(450, "profile", { name: "Far edited", note: "Note 450" }); h.grid.reveal(450, { block: "center" }); await h.settle();
  277 |     const edited = { marker: h.markers(450, "profile.name"), sibling: h.markers(450, "profile.note"), value: h.fields<HTMLInputElement>(450, "profile.name")[0].value };
  278 |     h.grid.reveal(1); await h.settle(); const unmounted = h.block(450).length === 0;
  279 |     h.rows.remove(450); h.grid.reveal(450); await h.settle();
  280 |     const deleted = { marker: h.markers(450, "profile.name"), value: h.fields<HTMLInputElement>(450, "profile.name")[0].value,
  281 |       disabled: h.fields<HTMLInputElement>(450, "profile.name")[0].disabled, original: h.rows.changes().find(row => row.id === 450)?.value.profile.name,
  282 |       mounted: h.table.querySelectorAll("[data-change-row]").length };
  283 |     h.rows.revert(450); return { edited, unmounted, deleted, restored: h.markers(450, "profile.name") }; });
  284 |   expect(result.edited).toEqual({ marker: ["true"], sibling: ["false"], value: "Far edited" }); expect(result.unmounted).toBe(true);
  285 |   expect(result.deleted.marker).toEqual(["true"]); expect(result.deleted.value).toBe("Far edited"); expect(result.deleted.disabled).toBe(true);
  286 |   expect(result.deleted.original).toBe("Person 450"); expect(result.deleted.mounted).toBeLessThan(30); expect(result.restored).toEqual(["false"]);
  287 | });
  288 | 
  289 | test("shared and independent MDI bindings retain their own baselines and unique accessible IDs", async ({ page }) => {
  290 |   await page.evaluate(async ({ data, form }) => { const [{ createRows }, { bindForm }] = await Promise.all([import(data), import(form)]); const h = window.changeState;
  291 |     const second = document.createElement("form"); second.innerHTML = '<fieldset><legend>Second employee editor</legend><label>Name <input data-field="profile.name" required></label><output data-error-for="profile.name"></output></fieldset>';
  292 |     const independent = second.cloneNode(true) as HTMLFormElement;
  293 |     h.host.append(second); const handle = bindForm(second, { rows: h.rows }); handle.bind(1);
  294 |     h.rows.set(1, "profile", { name: "Shared edit", note: "Note 1" });
  295 |     if (second.querySelector("input")!.getAttribute("data-field-changed") !== "true") throw new Error("The second Form lost its shared baseline.");
  296 |     handle.bind(2);
  297 |     if (second.querySelector("input")!.getAttribute("data-field-changed") !== "false") throw new Error("A row change leaked another row's baseline.");
  298 |     h.host.append(independent);
  299 |     const independentRows = createRows([{ ...h.item(1), profile: { name: "Independent original", note: "Note 1" } }]);
  300 |     const independentForm = bindForm(independent, { rows: independentRows }); independentForm.bind(1);
  301 |     independentRows.set(1, "profile", { name: "Shared edit", note: "Note 1" });
  302 |     if (independent.querySelector("input")!.getAttribute("data-field-changed") !== "true" || independentRows.original(1)?.profile.name !== "Independent original") {
  303 |       throw new Error("Independent MDI rows lost their own loaded original.");
  304 |     }
  305 |     independentRows.revert(1);
  306 |     if (independent.querySelector("input")!.getAttribute("data-field-changed") !== "false" || h.markers(1, "profile.name")[0] !== "true") {
  307 |       throw new Error("Reverting an independent MDI row affected a different store.");
  308 |     }
  309 |     const ids = [...h.host.querySelectorAll("[id]")].map(element => element.id);
  310 |     if (new Set(ids).size !== ids.length) throw new Error("MDI binding repeated an accessibility ID.");
  311 |     independentForm.dispose(); independentRows.dispose(); independent.remove(); handle.dispose(); second.remove();
  312 |   }, modules);
  313 |   const result = await new AxeBuilder({ page }).include("[data-change-state]").analyze();
  314 |   expect(result.violations).toEqual([]);
  315 | });
  316 | 
  317 | test("signed zero raw identity is visible as changed even when its formatted display is identical", async ({ page }) => {
  318 |   const result = await page.evaluate(() => { const h = window.changeState;
  319 |     h.rows.replace([{ ...h.item(1), constant: 0 }]); const id = h.rows.entries()[0].id; h.form.bind(id);
  320 |     h.rows.set(id, "constant", -0);
  321 |     const changed = { marker: h.markers(id, "constant"), text: h.fields(id, "constant")[0].textContent,
  322 |       form: h.formFields("constant")[0].getAttribute("data-field-changed"), raw: Object.is(h.rows.get(id)?.value.constant, -0), original: Object.is(h.rows.original(id)?.constant, 0) };
  323 |     h.rows.revert(id); return { changed, restored: h.markers(id, "constant") }; });
  324 |   expect(result).toEqual({ changed: { marker: ["true"], text: "Same display", form: "true", raw: true, original: true }, restored: ["false"] });
  325 | });
  326 | 
```