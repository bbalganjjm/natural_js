import { mountPage } from "@bbalganjjm/natural_js/page";
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindForm, bindGrid, bindTree, bindDatePicker, bindNotify, bindDocuments } from "@bbalganjjm/natural_js/ui";

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
          <button type="button" data-resize-column="person" aria-label="Resize Person column">Resize</button>
        </th>
        <th scope="col" data-column="choice">Choice</th>
      </tr></thead>
      <tbody><tr data-row-template>
        <th scope="row" data-column="person"><span data-field="person.name"></span></th>
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
    const grid = bindGrid(root.querySelector("table"), {
      rows, initialPage: { page: 1, size: 1 },
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
    const screen = { rows, grid, columnEvents, form, tree, picker, notifications, documents, openDocument, disposed: false };
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
