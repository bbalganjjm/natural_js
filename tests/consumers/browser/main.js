import { mountPage } from "@bbalganjjm/natural_js/page";
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindForm, bindGrid, bindList, bindTree, bindDatePicker, bindNotify, bindDocuments } from "@bbalganjjm/natural_js/ui";

const state = { ready: false, screens: {}, handles: {}, outputs: [], allowClose: false, documentControllers: 0 };
window.packedConsumer = state;

function view() {
  const root = document.createElement("article");
  root.innerHTML = `
    <h2>Employee</h2>
    <form>
      <label>Name <input data-field="person.name" required></label>
      <output data-error-for="person.name"></output>
    </form>
    <table data-consumer-grid>
      <thead><tr>
        <th scope="col" data-column="person">Person
          <button type="button" data-sort-column="person">Sort Person</button>
          <label>Check page <input type="checkbox" data-check-all="visible"></label>
          <button type="button" data-resize-column="person" aria-label="Resize Person column">Resize</button>
        </th>
        <th scope="col" data-column="choice">Choice
          <label>Find choices <input type="search" data-filter-search="choice"></label>
          <button type="button" data-apply-filter="choice">Apply choices</button>
        </th>
      </tr></thead>
      <tbody><tr data-row-template>
        <th scope="row" data-column="person">
          <button type="button" data-select-row><span data-field="person.name"></span></button>
          <label>Check row <input type="checkbox" data-check-row></label>
          <button type="button" data-row-action="inspect">Inspect</button>
        </th>
        <td data-column="choice"><label>Choice
          <select data-field="choice" data-options="choices"
            data-option-label="label" data-option-value="value">
            <option value="">Choose</option>
          </select>
        </label></td>
      </tr></tbody>
    </table>
    <ul data-consumer-tree aria-label="People hierarchy">
      <li data-row-template><span data-tree-label data-field="person.name"></span>
        <ul data-tree-children></ul>
      </li>
    </ul>
    <section data-datepicker>
      <h3 data-date-title>Calendar</h3>
      <table data-date-grid>
        <thead><tr><th scope="col">Sunday</th><th scope="col">Monday</th><th scope="col">Tuesday</th>
          <th scope="col">Wednesday</th><th scope="col">Thursday</th><th scope="col">Friday</th><th scope="col">Saturday</th></tr></thead>
        <tbody><tr data-date-week-template>${"<td><button type=button data-date-day></button></td>".repeat(7)}</tr></tbody>
      </table>
    </section>
    <section data-notify aria-label="Notifications">
      <ol data-notify-list><li data-notify-template><span data-notify-message></span>
        <button type="button" data-notify-close>Dismiss</button></li></ol>
      <p data-notify-status role="status"></p><p data-notify-alert role="alert"></p>
    </section>
    <section data-documents>
      <div role="tablist" aria-label="Documents">
        <template data-document-tab-template><span>
          <button type="button" role="tab" data-document-tab><span data-document-title></span></button>
          <button type="button" data-document-close>Close document</button>
        </span></template>
      </div>
      <div data-document-items></div>
      <div data-document-panels><template data-document-panel-template>
        <section role="tabpanel"></section>
      </template></div>
      <p data-document-empty>No documents</p><p data-document-error role="alert" hidden></p>
    </section>
    <button type="button" data-action="save">Save</button>`;
  return root;
}

const definition = {
  view,
  controller({ root, input, signal, own, output }) {
    const choices = [{ label: "Eleven", value: 11 }, { label: "Twenty two", value: 22 }];
    const rows = createRows([
      { key: 1, parent: null, date: "2026-10-05", person: { name: input.name }, choices, choice: 11 },
      { key: 2, parent: 1, date: "2026-10-06", person: { name: "Off page" }, choices, choice: 22 }
    ]);
    const columnEvents = [];
    const gridEvents = [];
    const pasteEvents = [];
    const idsEvent = kind => ({ ids, previous, event }) =>
      gridEvents.push({ kind, ids, previous, type: event?.type ?? null });
    const grid = bindGrid(root.querySelector("table"), {
      rows, initialPage: { page: 1, size: 1 }, multiple: true, toggleSelection: true, selectOnRowClick: true,
      paste: true,
      onPaste: result => pasteEvents.push({
        valid: result.valid,
        issues: result.issues.map(({ rowId, field, rule }) => ({ rowId, field, rule }))
      }),
      canSelect: row => row.value.key > 0,
      canCheck: row => row.value.key > 0,
      beforeSelect: ({ id, event }) => {
        gridEvents.push({ kind: "before-active", id, type: event?.type ?? null });
        return true;
      },
      onSelect: ({ id, row, event }) => gridEvents.push({
        kind: "active", id, name: row?.value.person.name ?? null, type: event?.type ?? null
      }),
      beforeSelectionChange: change => { idsEvent("before-selection")(change); return true; },
      onSelectionChange: idsEvent("selection"),
      beforeCheckChange: change => { idsEvent("before-check")(change); return true; },
      onCheckChange: idsEvent("check"),
      sorts: { person: (a, b) => a.person.name.localeCompare(b.person.name) },
      filters: { person: { value: row => row.person.name }, choice: {
        value: row => row.choice,
        label: value => choices.find(choice => choice.value === value)?.label ?? String(value)
      } },
      onRowAction: ({ action, id, row, element, event }) => gridEvents.push({
        kind: "action", action, id, name: row.value.person.name,
        element: element.dataset.rowAction, current: rows.get(id) === row, type: event.type
      }),
      columns: [{ key: "person", width: 180 }, { key: "choice", width: 120 }],
      onColumnsChange: ({ columns, event }) => columnEvents.push({ columns, type: event?.type ?? null })
    });
    const form = bindForm(root.querySelector("form"), { rows });
    form.bind(rows.entries()[0].id);
    const tree = bindTree(root.querySelector("[data-consumer-tree]"), {
      rows, key: row => row.key, parent: row => row.parent
    });
    const picker = bindDatePicker(root.querySelector("[data-datepicker]"), {
      value: rows.entries()[0].value.date, min: "2026-10-01", max: "2026-10-31",
      onChange: value => rows.set(rows.entries()[0].id, "date", value)
    });
    const notifications = bindNotify(root.querySelector("[data-notify]"));
    const documents = bindDocuments(root.querySelector("[data-documents]"), {
      beforeClose: () => state.allowClose
    });
    const openDocument = key => documents.open(key, {
      title: key,
      page: host => mountPage(host, {
        view() {
          const section = document.createElement("section");
          section.innerHTML = '<form><label>Document name <input data-field="person.name" required></label><output data-error-for="person.name"></output></form>';
          return section;
        },
        controller({ root: pageRoot, own: ownPage }) {
          pageRoot.dataset.documentController = String(++state.documentControllers);
          const documentForm = bindForm(pageRoot.querySelector("form"), { rows });
          documentForm.bind(rows.entries()[0].id);
          ownPage(() => documentForm.dispose());
          return {};
        }
      })
    });
    const screen = { rows, grid, gridEvents, columnEvents, pasteEvents, form, tree, picker, notifications, documents, openDocument, disposed: false };
    state.screens[input.slot] = screen;
    own(async () => {
      await documents.dispose();
      notifications.dispose();
      picker.dispose();
      tree.dispose();
      form.dispose();
      grid.dispose();
      rows.dispose();
      screen.disposed = true;
    });
    root.querySelector('[data-action="save"]').addEventListener(
      "click", () => output(input.slot), { signal }
    );
    return {};
  }
};

try {
  const blockRoot = document.createElement("section");
  blockRoot.dataset.consumerBlocks = "";
  blockRoot.innerHTML = `<h2>Authored record blocks</h2><table><caption>Grouped assignments</caption>
    <thead><tr><th scope="col">Group</th><th scope="col">Name or choice</th><th scope="col">Notes</th></tr></thead>
    <tbody data-row-template><tr><th scope="rowgroup" rowspan="0" data-merge="group"><span data-field="group"></span></th>
      <td colspan="2"><label>Name <input data-field="profile.name" required></label></td></tr>
      <tr><td><label>Choice <select data-field="profile.choice" data-options="profile.options" data-option-label="label" data-option-value="value"></select></label></td>
        <td><label>Note <textarea data-field="profile.note"></textarea></label><button type="button" data-row-action="inspect">Inspect</button>
          <fieldset><legend>Mode</legend><label><input type="radio" name="packed-mode" data-field="settings.mode" value="office">Office</label>
            <label><input type="radio" name="packed-mode" data-field="settings.mode" value="remote">Remote</label></fieldset>
          <label><input type="checkbox" data-field="settings.tags" value="alpha">Alpha</label><label><input type="checkbox" data-field="settings.tags" value="beta">Beta</label>
          <label>Typed choices <select multiple data-field="settings.selected" data-options="settings.options" data-option-label="label" data-option-value="code"></select></label>
          <span data-field="summary"></span><label>Check assignment <input type="checkbox" data-check-row></label></td></tr></tbody></table>
    <form data-block-detail><label>Assignment name <input data-field="profile.name" required></label><output data-error-for="profile.name"></output><span data-field="summary"></span></form>`;
  document.querySelector("main").append(blockRoot);
  const blockTable = blockRoot.querySelector("table");
  const originalBlock = blockTable.outerHTML;
  const blockRows = createRows(Array.from({ length: 4 }, (_, index) => ({ group: "Same", summary: `Summary ${index + 1}`,
    settings: { mode: "office", tags: ["alpha"], selected: [11],
      options: [{ label: "Eleven", code: 11 }, { label: "False", code: false }, { label: "Empty", code: null }] }, profile: {
    name: `Assignment ${index + 1}`, choice: 11, note: `Note ${index + 1}`,
    options: [{ label: "Eleven", value: 11 }, { label: "Twenty two", value: 22 }]
  } })));
  const blockGrid = bindGrid(blockTable, { rows: blockRows, paste: true, checkMode: "single", validateOn: "manual", revealInvalid: true,
    render: { summary(value, context) { const strong = context.element.ownerDocument.createElement("strong"); strong.textContent = String(value ?? ""); return strong; } },
    onRowAction: ({ id }) => { state.blocks.lastAction = id; } });
  const blockDetail = blockRoot.querySelector("[data-block-detail]");
  const originalDetail = blockDetail.outerHTML;
  const blockForm = bindForm(blockDetail, { rows: blockRows, render: { summary(value, context) {
    const em = context.element.ownerDocument.createElement("em"); em.textContent = String(value ?? ""); return em;
  } } });
  blockForm.bind(blockRows.entries()[0].id);
  state.blocks = { root: blockRoot, table: blockTable, rows: blockRows, grid: blockGrid, original: originalBlock,
    form: blockForm, detail: blockDetail, originalDetail };
  const lifecycleRoot = document.createElement("section");
  lifecycleRoot.dataset.consumerLifecycle = "";
  lifecycleRoot.innerHTML = `<h2>Row lifecycle</h2><table><caption>Loaded and edited employees</caption>
    <thead><tr><th scope="col" data-column="name">Name</th><th scope="col" data-column="score">Score</th></tr></thead>
    <tbody><tr data-row-template><th scope="row" data-column="name"><label>Name <input data-field="name" value="Default employee" required></label>
      <button type="button" data-row-action="undo">Undo row changes</button></th>
      <td data-column="score"><label>Score <input type="number" data-field="score" value="25" min="0"></label></td></tr></tbody>
    <tfoot><tr data-empty hidden><td data-columns="name score" colspan="2">No matching employees</td></tr></tfoot></table>`;
  document.querySelector("main").append(lifecycleRoot);
  const lifecycleTable = lifecycleRoot.querySelector("table");
  const lifecycleRows = createRows([{ name: "Original", score: 10 }]);
  const lifecycle = { root: lifecycleRoot, table: lifecycleTable, rows: lifecycleRows, original: lifecycleTable.outerHTML,
    active: 0, clicks: 0, before: 0, bound: 0, binds: [], events: [] };
  state.lifecycle = lifecycle;
  lifecycle.grid = bindGrid(lifecycleTable, { rows: lifecycleRows, parse: { score: Number },
    beforeRowBind(context) {
      lifecycle.before++;
      for (const element of context.elements) element.dataset.lifecycleBefore = String(context.row.id);
      context.own(() => { for (const element of context.elements) delete element.dataset.lifecycleBefore; });
    },
    onRowBind(context) {
      lifecycle.bound++; lifecycle.active++;
      const click = () => lifecycle.clicks++;
      for (const element of context.elements) element.addEventListener("click", click);
      context.own(() => {
        for (const element of context.elements) element.removeEventListener("click", click);
        lifecycle.active--;
      });
    },
    onBind(result) { lifecycle.binds.push({ total: result.total, filtered: result.filtered, visible: result.visible, mounted: result.mounted, event: result.event?.type ?? null }); },
    onRowAction({ action, id }) { if (action === "undo") lifecycleRows.revert(id); }
  });
  lifecycle.stop = lifecycleRows.subscribe(event => lifecycle.events.push(event));
  const progressiveRoot = document.createElement("section");
  progressiveRoot.dataset.consumerProgressive = "";
  progressiveRoot.innerHTML = '<h2>Progressive loaded records</h2><table aria-busy="false"><caption>Loaded prefixes</caption><thead><tr><th scope="col">Name</th><th scope="col">Choice</th></tr></thead><tbody><tr data-row-template><th scope="row"><span data-field="name"></span></th><td><label>Choice <select data-field="choice" data-options="choices" data-option-label="label" data-option-value="value"></select></label></td></tr></tbody></table>';
  document.querySelector("main").append(progressiveRoot);
  const progressiveTable = progressiveRoot.querySelector("table");
  const progressiveRows = createRows(Array.from({ length: 17 }, (_, index) => ({ index,
    name: 'Loaded ' + (index + 1), choice: 1, choices: [{ label: 'One', value: 1 }, { label: 'Two', value: 2 }] })));
  const progressive = { root: progressiveRoot, table: progressiveTable, rows: progressiveRows,
    original: progressiveTable.outerHTML, binds: [], active: 0, grid: null };
  state.progressive = progressive;
  progressive.grid = bindGrid(progressiveTable, { rows: progressiveRows, progressive: { size: 5, delay: 0 },
    onRowBind(context) { progressive.active++; context.own(() => { progressive.active--; }); },
    onBind(result) { progressive.binds.push({ ...result, event: result.event?.type ?? null }); }
  });

  const geometry = document.createElement("section");
  geometry.dataset.consumerGeometry = "";
  geometry.innerHTML = `<h2>Grid geometry</h2><div style="height:240px;overflow:auto;box-sizing:border-box;border:1px solid">
    <table style="border-collapse:collapse;width:100%"><caption>Geometry employees</caption>
      <thead style="position:sticky;top:0;background:white"><tr><th scope="col">Name</th></tr></thead>
      <tbody><tr data-row-template style="height:48px"><td><span data-field="name"></span></td></tr></tbody>
      <tfoot style="position:sticky;bottom:0;background:white"><tr><td>End of employees</td></tr></tfoot></table>
    </div><button type="button" aria-label="Resize employee area">Resize height</button>`;
  document.querySelector("main").append(geometry);
  const geometryRoot = geometry.querySelector("div"), geometryTable = geometry.querySelector("table");
  const geometryHandle = geometry.querySelector("button"), geometryRows = createRows(Array.from({ length: 100 }, (_, index) => ({ name: `Geometry ${index + 1}` })));
  geometryRoot.style.cssText = geometryRoot.style.cssText;
  const originalGeometry = geometry.outerHTML;
  const geometryGrid = bindGrid(geometryTable, { rows: geometryRows,
    viewport: { root: geometryRoot, estimate: 48 }, heightResize: { root: geometryRoot, handle: geometryHandle, min: 160, max: 640 } });
  state.geometry = { container: geometry, root: geometryRoot, table: geometryTable, handle: geometryHandle,
    grid: geometryGrid, rows: geometryRows, original: originalGeometry };
  const pinnedRoot = document.createElement("section");
  pinnedRoot.dataset.consumerPinned = "";
  pinnedRoot.style.cssText = "position:relative;width:420px;height:200px;overflow:auto;border:2px solid;padding:4px";
  pinnedRoot.innerHTML = `<table style="table-layout:fixed;border-collapse:separate;border-spacing:2px">
    <caption>Installed pinned records</caption><colgroup span="2"></colgroup><colgroup span="1"></colgroup>
    <thead><tr><th scope="col" data-column="name">Name <button type="button" data-resize-column="name" aria-label="Resize pinned Name">Resize</button></th>
      <th scope="col" data-column="note">Note</th><th scope="col" data-column="amount">Amount</th></tr></thead>
    <tbody><tr data-row-template><th scope="row" data-column="name"><button type="button" data-select-row>Select</button><label>Name <input data-field="name"></label></th>
      <td data-column="note" data-field="note"></td><td data-column="amount" data-field="amount"></td></tr></tbody>
    <tfoot><tr><td colspan="3" data-columns="name note amount">Native spanning summary</td></tr></tfoot></table>`;
  document.querySelector("main").append(pinnedRoot);
  const pinnedTable = pinnedRoot.querySelector("table");
  const originalPinned = pinnedTable.outerHTML;
  const pinnedRows = createRows(Array.from({ length: 24 }, (_, index) => ({ name: "Pinned " + (index + 1), note: "Note " + (index + 1), amount: index })));
  const pinnedEvents = [];
  const pinnedGrid = bindGrid(pinnedTable, { rows: pinnedRows,
    columns: [{ key: "name", width: 150, pinned: true }, { key: "note", width: 170, pinned: true }, { key: "amount", width: 420 }],
    onColumnsChange: change => pinnedEvents.push(change) });
  state.pinned = { root: pinnedRoot, table: pinnedTable, rows: pinnedRows, grid: pinnedGrid, original: originalPinned, events: pinnedEvents };
  const scrollRoot = document.createElement("section");
  scrollRoot.dataset.consumerViewport = "";
  scrollRoot.setAttribute("aria-label", "Viewport assignments");
  scrollRoot.style.cssText = "height:400px;overflow:auto;";
  scrollRoot.innerHTML = `<table style="border-collapse:collapse;width:100%"><caption>Viewport employees</caption>
    <thead><tr><th scope="col">Name</th><th scope="col">Choice</th></tr></thead>
    <tbody><tr data-row-template style="height:48px"><th scope="row"><label>Name <input data-field="name" required></label></th>
      <td><label>Choice <select data-field="choice" data-options="choices" data-option-label="label" data-option-value="value"></select></label></td></tr></tbody></table>`;
  document.querySelector("main").append(scrollRoot);
  const viewportRows = createRows(Array.from({ length: 5000 }, (_, index) => ({
    name: `Employee ${index + 1}`, choice: 11,
    choices: [{ label: "Eleven", value: 11 }, { label: "Twenty two", value: 22 }]
  })));
  const viewportTable = scrollRoot.querySelector("table");
  const originalViewport = viewportTable.outerHTML;
  const viewportGrid = bindGrid(viewportTable, { rows: viewportRows,
    viewport: { root: scrollRoot, estimate: 48, overscan: 3 }, paste: true, multiple: true });
  state.viewport = { root: scrollRoot, table: viewportTable, rows: viewportRows, grid: viewportGrid, original: originalViewport };
  const ruleRoot = document.createElement("section");
  ruleRoot.innerHTML = `<h2>Shared rules</h2><form><label>Name <input data-field="profile.name"></label>
    <label>Salary <input data-field="salary" required></label><output data-error-for="salary"></output>
    <label>Raw choice <select data-field="assignment.chosen" data-options="assignment.choices"
      data-option-label="meta.label" data-option-value="code"><option value="">Choose</option></select></label><output data-error-for="assignment.chosen"></output>
    <label>Raw choices <select multiple data-field="assignment.selected" data-options="assignment.choices"
      data-option-label="meta.label" data-option-value="code"></select></label><output data-error-for="assignment.selected"></output></form>
    <table><caption>Rule-backed employees</caption><tbody><tr data-row-template><td data-field="profile.name"></td>
      <td><label>Salary <input type="number" data-field="salary" required></label><output data-error-for="salary"></output></td></tr></tbody></table>
    <ul><li data-row-template><span data-field="profile.name"></span><span data-field="salary"></span><output data-error-for="salary"></output></li></ul>`;
  document.querySelector("main").append(ruleRoot);
  const originalRules = ruleRoot.outerHTML;
  const ruleRows = createRows([{ profile: { name: "Ada" }, salary: 150, assignment: {
    choices: [{ meta: { label: "Number one" }, code: 1 }, { meta: { label: "Text one" }, code: "1" },
      { meta: { label: "Off" }, code: false }, { meta: { label: "Empty string" }, code: "" }],
    chosen: false, selected: [1, "1"]
  } }]);
  const rules = { format: { upper: value => value.toUpperCase() }, fields: {
    "profile.name": { format: [["upper"]] }, salary: { validate: [["minvalue", 100]] },
    "profile.unbound": { validate: [["required"]] }
  } };
  const parse = { salary: value => value.trim() && Number.isFinite(Number(value)) ? Number(value) : undefined };
  const ruleForm = bindForm(ruleRoot.querySelector("form"), { rows: ruleRows, rules, parse, autoValidate: false });
  ruleForm.bind(ruleRows.entries()[0].id);
  const ruleGrid = bindGrid(ruleRoot.querySelector("table"), { rows: ruleRows, rules, parse, autoValidate: false, paste: true });
  const ruleList = bindList(ruleRoot.querySelector("ul"), { rows: ruleRows, rules });
  state.sharedRules = { root: ruleRoot, rows: ruleRows, form: ruleForm, grid: ruleGrid, list: ruleList, original: originalRules };
  state.incoming = createRows();
  for (const [slot, name] of [["a", "Ada"], ["b", "Bea"]]) {
    const host = document.querySelector(`[data-host="${slot}"]`);
    const page = mountPage(host, definition, { slot, name });
    page.onOutput(value => state.outputs.push(value));
    state.handles[slot] = page;
    await page.ready;
  }
  state.ready = true;
} catch (cause) {
  state.error = cause?.stack ?? String(cause);
}
