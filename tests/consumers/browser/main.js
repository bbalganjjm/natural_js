import { mountPage } from "@bbalganjjm/natural_js/page";
import { createRows } from "@bbalganjjm/natural_js/data";
import { bindForm, bindGrid, bindTree, bindDatePicker } from "@bbalganjjm/natural_js/ui";

const state = { ready: false, screens: {}, handles: {}, outputs: [] };
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
      <thead><tr><th scope="col">Person</th><th scope="col">Choice</th></tr></thead>
      <tbody><tr data-row-template>
        <th scope="row"><span data-field="person.name"></span></th>
        <td><label>Choice
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
    const grid = bindGrid(root.querySelector("table"), { rows, initialPage: { page: 1, size: 1 } });
    const form = bindForm(root.querySelector("form"), { rows });
    form.bind(rows.entries()[0].id);
    const tree = bindTree(root.querySelector("[data-consumer-tree]"), {
      rows, key: row => row.key, parent: row => row.parent
    });
    const picker = bindDatePicker(root.querySelector("[data-datepicker]"), {
      value: rows.entries()[0].value.date, min: "2026-10-01", max: "2026-10-31",
      onChange: value => rows.set(rows.entries()[0].id, "date", value)
    });
    const screen = { rows, grid, form, tree, picker, disposed: false };
    state.screens[input.slot] = screen;
    own(() => {
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
