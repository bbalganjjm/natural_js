# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: row-state.spec.ts >> received tombstones stay protected in native editors membership Forms and paste after checkpoint reversion
- Location: tests\browser\row-state.spec.ts:163:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

@@ -1,9 +1,9 @@
  Object {
    "checked": Array [],
    "disabled": true,
-   "failures": 7,
+   "failures": 6,
    "list": 1,
    "protected": true,
    "selected": null,
    "snapshot": true,
    "status": "delete",
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
    - heading "Received employee state" [level=1] [ref=e18]
    - generic [ref=e19]:
      - generic [ref=e20]: Employee D
      - generic [ref=e21]:
        - text: Name
        - textbox "Name" [disabled] [ref=e22]: Employee D
      - status
    - generic [ref=e23]:
      - generic [ref=e24]: Employee
      - generic [ref=e25]:
        - text: Name
        - textbox "Name" [ref=e26]
      - status
    - region "Received employees" [ref=e27]:
      - table [ref=e28]:
        - caption [ref=e29]: Received employees
        - rowgroup [ref=e30]:
          - row [ref=e31]:
            - columnheader "Employee" [ref=e32]
            - columnheader "Name" [ref=e33]
            - columnheader "Count" [ref=e34]
        - rowgroup [ref=e35]:
          - row [ref=e36]:
            - rowheader [ref=e37]:
              - button "D" [disabled] [ref=e38]
              - generic [ref=e39]:
                - text: Check
                - checkbox "Check" [disabled] [ref=e40]
            - cell [ref=e41]:
              - generic [ref=e42]:
                - text: Name
                - textbox "Name" [disabled] [ref=e43]: Employee D
            - cell [ref=e44]:
              - generic [ref=e45]:
                - text: Count
                - spinbutton "Count" [disabled] [ref=e46]: "1"
              - button "Restore received value" [ref=e47]
          - row [ref=e48]:
            - rowheader [ref=e49]:
              - button "L" [ref=e50]
              - generic [ref=e51]:
                - text: Check
                - checkbox "Check" [ref=e52]
            - cell [ref=e53]:
              - generic [ref=e54]:
                - text: Name
                - textbox "Name" [ref=e55]: Employee L
            - cell [ref=e56]:
              - generic [ref=e57]:
                - text: Count
                - spinbutton "Count" [ref=e58]: "1"
              - button "Restore received value" [ref=e59]
    - list [ref=e60]:
      - listitem [ref=e61]:
        - button "L" [ref=e62]
        - text: Employee L
    - tree "Received employee tree" [ref=e63]:
      - treeitem "Employee L" [level=1] [ref=e64]
```

# Test source

```ts
  81  |     };
  82  |     window.rowStates = h; h.rebindGrid(); h.list = bindList(listRoot, { rows });
  83  |     h.tree = bindTree(treeRoot, { rows, key: (row: Item) => row.employeeNo, parent: (row: Item) => row.parent });
  84  |     h.form = bindForm(formRoot, { rows }); h.secondForm = bindForm(secondRoot, { rows });
  85  |     rows.subscribe((event: RowsEvent) => h.observations.push({ type: event.type, changed: event.changed,
  86  |       ids: "ids" in event ? event.ids : "id" in event && event.id !== undefined ? [event.id] : [],
  87  |       live: rows.entries().map(row => row.value.employeeNo), all: rows.entries({ includeDeleted: true }).map(row => row.value.employeeNo) }));
  88  |   }, modules);
  89  | });
  90  | 
  91  | test("state replacement resets shared identities and displays received flags without business metadata", async ({ page }) => {
  92  |   const result = await page.evaluate(() => {
  93  |     const h = window.rowStates, previous = h.rows.entries();
  94  |     h.form.bind(previous[0].id); h.secondForm.bind(previous[0].id); h.grid.select(previous[0].id);
  95  |     h.grid.setChecked([previous[1].id]); h.list.select(previous[0].id); h.tree.select(previous[0].id);
  96  |     h.rows.replaceState([h.state("D", "delete"), h.state("C", "clean"), h.state("U", "update"), h.state("I", "insert")]);
  97  |     const all = h.rows.entries({ includeDeleted: true });
  98  |     return { ids: all.map(row => row.id), statuses: all.map(row => row.status), removed: previous.every(row => !h.rows.get(row.id)),
  99  |       grid: [...h.table.querySelectorAll('tbody [data-field="employeeNo"]')].map(element => element.textContent),
  100 |       list: [...h.listRoot.querySelectorAll('[data-field="employeeNo"]')].map(element => element.textContent),
  101 |       tree: [...h.treeRoot.querySelectorAll('[data-tree-label]')].map(element => element.textContent),
  102 |       formValues: [h.formRoot, h.secondRoot].map(root => root.querySelector("input")!.value),
  103 |       selected: [h.grid.selected(), h.list.selected(), h.tree.selected()], checked: h.grid.checkedIds(),
  104 |       metadata: all.every(row => Object.keys(row.value).join(",") === "employeeNo,parent,profile" && Object.isFrozen(row.value.profile)),
  105 |       events: h.observations };
  106 |   });
  107 |   expect(result).toEqual({ ids: [3, 4, 5, 6], statuses: ["delete", "clean", "update", "insert"], removed: true,
  108 |     grid: ["D", "C", "U", "I"], list: ["C", "U", "I"], tree: ["Employee C", "Employee U", "Employee I"],
  109 |     formValues: ["", ""], selected: [null, null, null], checked: [], metadata: true,
  110 |     events: [{ type: "replace", changed: true, ids: [], live: ["C", "U", "I"], all: ["D", "C", "U", "I"] }] });
  111 | });
  112 | 
  113 | test("state append preserves shared drafts focus snapshots membership and one frozen append event", async ({ page }) => {
  114 |   const result = await page.evaluate(() => {
  115 |     const h = window.rowStates, first = h.rows.entries()[0]; h.form.bind(first.id); h.secondForm.bind(first.id);
  116 |     h.grid.select(first.id); h.grid.setChecked([first.id]); h.list.select(first.id); h.tree.select(first.id);
  117 |     const detail = h.formRoot.querySelector("input")!, editor = h.field(first.id, "profile.name"), row = h.block(first.id);
  118 |     h.edit(detail, ""); h.edit(editor, "x"); editor.focus(); editor.setSelectionRange(1, 1);
  119 |     const messages = [h.formRoot.querySelector("output")!.textContent, row!.querySelector("output")!.textContent];
  120 |     const listNode = h.listRoot.children[0], treeNode = h.treeRoot.children[0];
  121 |     const ids = h.rows.appendState([h.state("U", "update"), h.state("I", "insert"), h.state("D", "delete")]);
  122 |     const event = h.observations.at(-1)!;
  123 |     return { ids, frozen: Object.isFrozen(ids) && Object.isFrozen(event.ids), event,
  124 |       identity: h.rows.get(first.id) === first && h.block(first.id) === row && h.listRoot.children[0] === listNode && h.treeRoot.children[0] === treeNode,
  125 |       drafts: [detail.value, editor.value], messages, after: [h.formRoot.querySelector("output")!.textContent, row!.querySelector("output")!.textContent],
  126 |       focused: document.activeElement === editor, caret: editor.selectionStart,
  127 |       selected: [h.grid.selected(), h.list.selected(), h.tree.selected()], checked: h.grid.checkedIds(),
  128 |       pending: h.rows.changes().map(change => change.status), live: h.rows.entries().length };
  129 |   });
  130 |   expect(result).toEqual({ ids: [3, 4, 5], frozen: true, event: { type: "append", changed: true, ids: [3, 4, 5],
  131 |     live: ["A", "B", "U", "I"], all: ["A", "B", "U", "I", "D"] }, identity: true,
  132 |     drafts: ["", "x"], messages: [expect.any(String), expect.any(String)], after: [expect.any(String), expect.any(String)],
  133 |     focused: true, caret: 1, selected: [1, 1, 1], checked: [1], pending: ["update", "insert", "delete"], live: 4 });
  134 |   expect(result.messages.every(Boolean)).toBe(true); expect(result.after).toEqual(result.messages);
  135 | });
  136 | 
  137 | test("received pending checkpoints revert values and flags while ordinary inserts remain cancellable", async ({ page }) => {
  138 |   const result = await page.evaluate(() => {
  139 |     const h = window.rowStates;
  140 |     h.rows.replaceState([h.state("U", "update"), h.state("I", "insert"), h.state("D", "delete")]);
  141 |     const [updated, inserted, deleted] = h.rows.entries({ includeDeleted: true });
  142 |     h.form.bind(updated.id); h.secondForm.bind(inserted.id);
  143 |     h.edit(h.formRoot.querySelector("input")!, "Local update"); h.edit(h.secondRoot.querySelector("input")!, "Local insert");
  144 |     h.rows.set(updated.id, "profile", updated.value.profile);
  145 |     const pendingAtBaseline = h.rows.get(updated.id)!.status === "update";
  146 |     h.rows.revert(inserted.id); h.rows.revert(deleted.id);
  147 |     const local = h.rows.add(h.item("L")); h.rows.revert(local);
  148 |     const copies = h.api.createRows<Item>(); copies.appendState([h.state("Source", "insert")]);
  149 |     const copy = copies.copy(copies.entries()[0].id); copies.revert(copy);
  150 |     const copyRemoved = copies.get(copy) === undefined; copies.dispose();
  151 |     return { pendingAtBaseline, ordinaryRemoved: h.rows.get(local) === undefined, copyRemoved,
  152 |       states: h.rows.entries({ includeDeleted: true }).map(row => [row.value.employeeNo, row.value.profile.name, row.status]),
  153 |       originalInsert: h.rows.original(inserted.id) === undefined,
  154 |       originalUpdate: h.rows.original(updated.id) === updated.value,
  155 |       formValues: [h.formRoot, h.secondRoot].map(root => root.querySelector("input")!.value),
  156 |       changes: h.rows.changes().map(change => change.status) };
  157 |   });
  158 |   expect(result).toEqual({ pendingAtBaseline: true, ordinaryRemoved: true, copyRemoved: true,
  159 |     states: [["U", "Employee U", "update"], ["I", "Employee I", "insert"], ["D", "Employee D", "delete"]],
  160 |     originalInsert: true, originalUpdate: true, formValues: ["Employee U", "Employee I"], changes: ["update", "insert", "delete"] });
  161 | });
  162 | 
  163 | test("received tombstones stay protected in native editors membership Forms and paste after checkpoint reversion", async ({ page }) => {
  164 |   const result = await page.evaluate(() => {
  165 |     const h = window.rowStates; h.rows.replaceState([h.state("D", "delete"), h.state("L", "clean")]);
  166 |     const deleted = h.rows.entries({ includeDeleted: true })[0], editor = h.field(deleted.id, "profile.name");
  167 |     const failures: string[] = [];
  168 |     for (const operation of [() => h.rows.set(deleted.id, "profile", { name: "Forbidden", count: 8 }),
  169 |       () => h.rows.move(deleted.id), () => h.rows.copy(deleted.id), () => h.form.bind(deleted.id),
  170 |       () => h.grid.select(deleted.id), () => h.grid.setChecked([deleted.id]),
  171 |       () => h.grid.paste("Forbidden", { id: deleted.id, field: "profile.name" })]) {
  172 |       try { operation(); } catch (cause) { failures.push((cause as { code: string }).code); }
  173 |     }
  174 |     h.edit(editor, "Synthetic edit"); h.rows.revert(deleted.id);
  175 |     const row = h.block(deleted.id)!;
  176 |     return { failures: failures.length, protected: failures.every(Boolean), snapshot: h.rows.get(deleted.id) === deleted,
  177 |       status: row.getAttribute("data-row-status"), disabled: [...row.querySelectorAll("input")].every(input => input.disabled),
  178 |       value: h.rows.get(deleted.id)!.value.profile.name, selected: h.grid.selected(), checked: h.grid.checkedIds(),
  179 |       list: h.listRoot.querySelectorAll("li").length, tree: h.treeRoot.querySelectorAll('[role="treeitem"]').length };
  180 |   });
> 181 |   expect(result).toEqual({ failures: 7, protected: true, snapshot: true, status: "delete", disabled: true,
      |                  ^ Error: expect(received).toEqual(expected) // deep equality
  182 |     value: "Employee D", selected: null, checked: [], list: 1, tree: 1 });
  183 | });
  184 | 
  185 | test("first-position add and move use retained deleted anchors and preserve their order when ordinary deletions revert", async ({ page }) => {
  186 |   const result = await page.evaluate(() => {
  187 |     const h = window.rowStates, [first, second] = h.rows.entries(); h.rows.remove(first.id); h.rows.remove(second.id);
  188 |     const head = h.rows.add(h.item("Head"), h.rows.entries({ includeDeleted: true })[0].id);
  189 |     const [pending] = h.rows.appendState([h.state("Pending", "update")]); h.rows.move(pending, first.id);
  190 |     const retained = h.rows.entries({ includeDeleted: true }).map(row => row.value.employeeNo);
  191 |     const beforeNoop = h.rows.entries({ includeDeleted: true }), events = h.observations.length;
  192 |     h.rows.move(pending, first.id); h.rows.move(head, head);
  193 |     const silent = h.rows.entries({ includeDeleted: true }) === beforeNoop && h.observations.length === events;
  194 |     h.rows.revert(first.id); h.rows.revert(second.id);
  195 |     return { retained, silent, live: h.rows.entries().map(row => row.value.employeeNo),
  196 |       statuses: h.rows.entries().map(row => row.status),
  197 |       grid: [...h.table.querySelectorAll('tbody [data-field="employeeNo"]')].map(node => node.textContent),
  198 |       list: [...h.listRoot.querySelectorAll('[data-field="employeeNo"]')].map(node => node.textContent) };
  199 |   });
  200 |   expect(result).toEqual({ retained: ["Head", "Pending", "A", "B"], silent: true, live: ["Head", "Pending", "A", "B"],
  201 |     statuses: ["insert", "update", "clean", "clean"], grid: ["Head", "Pending", "A", "B"], list: ["Head", "Pending", "A", "B"] });
  202 | });
  203 | 
  204 | test("invalid later state records preserve all shared DOM caches events and the next committed identity", async ({ page }) => {
  205 |   const result = await page.evaluate(() => {
  206 |     const h = window.rowStates, entries = h.rows.entries(), all = h.rows.entries({ includeDeleted: true }), changes = h.rows.changes();
  207 |     h.form.bind(entries[0].id); const editor = h.field(entries[0].id, "profile.name"); editor.focus();
  208 |     const before = [h.table.innerHTML, h.listRoot.innerHTML, h.treeRoot.innerHTML, h.formRoot.innerHTML];
  209 |     const failures: string[] = [];
  210 |     for (const operation of [
  211 |       () => h.rows.appendState([h.state("Good", "update"), { value: h.item("Bad"), status: "unknown" } as unknown as RowState<Item>]),
  212 |       () => h.rows.replaceState([h.state("Good", "insert"), { ...h.state("Bad", "clean"), id: 88 } as RowState<Item>]),
  213 |       () => h.rows.appendState([h.state("Good", "clean"), { value: { ...h.item("Bad"), profile: new Date() }, status: "clean" } as unknown as RowState<Item>])
  214 |     ]) { try { operation(); } catch (cause) { failures.push((cause as { code: string }).code); } }
  215 |     const preserved = h.rows.entries() === entries && h.rows.entries({ includeDeleted: true }) === all && h.rows.changes() === changes &&
  216 |       before.every((value, index) => value === [h.table.innerHTML, h.listRoot.innerHTML, h.treeRoot.innerHTML, h.formRoot.innerHTML][index]);
  217 |     const quiet = h.observations.length === 0, focused = document.activeElement === editor;
  218 |     const [id] = h.rows.appendState([h.state("After", "clean")]);
  219 |     return { failures: failures.length, coded: failures.every(Boolean), preserved, quiet, focused, id,
  220 |       event: h.observations.at(-1)!.type, frozen: Object.isFrozen(h.rows.get(id)!.value.profile) };
  221 |   });
  222 |   expect(result).toEqual({ failures: 3, coded: true, preserved: true, quiet: true, focused: true, id: 3, event: "append", frozen: true });
  223 | });
  224 | 
  225 | test("unchanged received checkpoint reversion keeps caches but clears local Form and Grid drafts", async ({ page }) => {
  226 |   const result = await page.evaluate(() => {
  227 |     const h = window.rowStates; h.rows.replaceState([h.state("U", "update")]); const row = h.rows.entries()[0];
  228 |     h.form.bind(row.id); const input = h.formRoot.querySelector("input")!, editor = h.field(row.id, "profile.name");
  229 |     h.edit(input, ""); h.edit(editor, "x");
  230 |     const entries = h.rows.entries(), all = h.rows.entries({ includeDeleted: true }), changes = h.rows.changes(); h.observations.length = 0;
  231 |     h.rows.revert(row.id);
  232 |     return { same: h.rows.get(row.id) === row && h.rows.entries() === entries && h.rows.entries({ includeDeleted: true }) === all && h.rows.changes() === changes,
  233 |       values: [input.value, editor.value], invalid: [input, editor].some(element => element.getAttribute("aria-invalid") === "true"),
  234 |       event: h.observations, status: h.rows.get(row.id)!.status };
  235 |   });
  236 |   expect(result).toEqual({ same: true, values: ["Employee U", "Employee U"], invalid: false,
  237 |     event: [{ type: "revert", changed: false, ids: [3], live: ["U"], all: ["U"] }], status: "update" });
  238 | });
  239 | 
  240 | test("state loading and append retain bounded viewport ownership and become quiet after all views dispose", async ({ page }) => {
  241 |   const result = await page.evaluate(async () => {
  242 |     const h = window.rowStates; h.rebindGrid({ viewport: { root: h.scroll, estimate: 48, overscan: 2 } });
  243 |     h.rows.replaceState(Array.from({ length: 250 }, (_, index) => h.state(`E${index}`, index % 7 === 0 ? "delete" : "update")));
  244 |     const last = h.rows.entries({ includeDeleted: true }).at(-1)!; h.grid.reveal(last.id); await h.settle();
  245 |     const editor = h.field(last.id, "profile.name"); editor.focus(); h.edit(editor, "x"); editor.setSelectionRange(1, 1);
  246 |     const row = h.block(last.id), before = h.rows.get(last.id); const ids = h.rows.appendState([h.state("Added U", "update"), h.state("Added D", "delete")]);
  247 |     await h.settle();
  248 |     const bounded = h.table.querySelectorAll('tbody tr[data-row-status]').length <= 80;
  249 |     const retained = h.block(last.id) === row && h.rows.get(last.id) === before && document.activeElement === editor && editor.value === "x" && editor.selectionStart === 1;
  250 |     h.dispose(); const markup = [h.table.outerHTML, h.listRoot.outerHTML, h.treeRoot.outerHTML];
  251 |     let mutations = 0; const observer = new MutationObserver(records => mutations += records.length); observer.observe(h.host, { subtree: true, childList: true, attributes: true });
  252 |     h.rows.appendState([h.state("After disposal", "clean")]); h.scroll.dispatchEvent(new Event("scroll")); await h.settle(); observer.disconnect();
  253 |     return { bounded, retained, ids: ids.length, all: h.rows.entries({ includeDeleted: true }).length, mutations,
  254 |       restored: markup[0] === h.originalTable && markup[1] === h.originalList && markup[2] === h.originalTree };
  255 |   });
  256 |   expect(result).toEqual({ bounded: true, retained: true, ids: 2, all: 253, mutations: 0, restored: true });
  257 | });
  258 | 
  259 | test("independent received stores keep document-unique error IDs and unaffected native Form ownership", async ({ page }) => {
  260 |   const result = await page.evaluate(() => {
  261 |     const h = window.rowStates; h.rows.replaceState([h.state("Pending", "insert")]); const id = h.rows.entries()[0].id;
  262 |     h.form.bind(id); h.secondForm.bind(id);
  263 |     const otherRows = h.api.createRows<Item>(); otherRows.appendState([h.state("Other", "update")]);
  264 |     const otherRoot = document.createElement("form"); otherRoot.innerHTML = h.formRoot.innerHTML;
  265 |     for (const element of otherRoot.querySelectorAll('[id], [aria-describedby], [aria-live]')) {
  266 |       element.removeAttribute("id"); element.removeAttribute("aria-describedby"); element.removeAttribute("aria-live");
  267 |     }
  268 |     document.body.append(otherRoot); const other = h.api.bindForm(otherRoot, { rows: otherRows }); other.bind(otherRows.entries()[0].id);
  269 |     h.edit(h.formRoot.querySelector("input")!, ""); h.edit(h.secondRoot.querySelector("input")!, "");
  270 |     const regions = [h.formRoot, h.secondRoot, otherRoot].map(root => root.querySelector("output")!);
  271 |     const unique = new Set(regions.map(region => region.id)).size === 3 && regions.every(region => document.querySelectorAll(`[id="${region.id}"]`).length === 1);
  272 |     const described = [h.formRoot, h.secondRoot, otherRoot].every((root, index) => root.querySelector("input")!.getAttribute("aria-describedby") === regions[index].id);
  273 |     h.rows.revert(id); h.form.dispose(); h.secondForm.dispose();
  274 |     const otherBefore = otherRows.get(otherRows.entries()[0].id); h.rows.appendState([h.state("Same page", "clean")]);
  275 |     const isolated = otherRows.get(otherBefore!.id) === otherBefore && otherRoot.querySelector("input")!.value === "Employee Other";
  276 |     other.dispose(); otherRows.dispose();
  277 |     return { unique, described, isolated, restored: regions.every(region => !region.hasAttribute("aria-live") && !region.hasAttribute("id")) };
  278 |   });
  279 |   expect(result).toEqual({ unique: true, described: true, isolated: true, restored: true });
  280 | });
  281 | 
```