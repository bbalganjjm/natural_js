import { expect, test } from "@playwright/test";
import { fileURLToPath } from "node:url";
import type { RowId, Rows } from "@bbalganjjm/natural_js/data";
import type { GridHandle } from "@bbalganjjm/natural_js/ui";

interface Person {
  name: string;
  note: string;
  shift: number;
  detail: {
    team: string;
    choices: { meta: { label: string }; code: number }[];
  };
}

interface AgentScreen {
  rows: Rows<Person>;
  grid: GridHandle<Person>;
  ids: RowId[];
  rebind(): void;
}

declare global {
  interface Window {
    __m10AgentScreen?: AgentScreen;
  }
}

const screen = `
  <main>
    <h1>Shift review</h1>
    <output id="selection-status" aria-live="polite">None selected</output>
    <table>
      <caption>Team shifts</caption>
      <thead><tr>
        <th scope="col">Person</th><th scope="col">Team</th>
        <th scope="col">Shift</th><th scope="col">Note</th>
      </tr></thead>
      <tbody><tr data-row-template>
        <th scope="row"><button type="button" data-select-row>Select <span data-field="name"></span></button></th>
        <td data-field="detail.team"></td>
        <td><label>Shift
          <select data-field="shift" data-options="detail.choices"
            data-option-label="meta.label" data-option-value="code" required>
            <option value="">Choose</option>
          </select>
        </label></td>
        <td><label>Note <input data-field="note" required data-validate='[["required"]]'></label>
          <output data-error-for="note"></output></td>
      </tr></tbody>
    </table>
  </main>
`;

const source = (path: string) => `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;

test("a docs-first authored Grid keeps row identity and drafts across local views", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/");
  await page.setContent(screen);

  await page.evaluate(async ({ dataEntry, uiEntry }) => {
    const { createRows } = await import(dataEntry) as typeof import("@bbalganjjm/natural_js/data");
    const { bindGrid } = await import(uiEntry) as typeof import("@bbalganjjm/natural_js/ui");
    const rows = createRows<Person>([
      { name: "Aster", note: "Ready", shift: 11, detail: { team: "Blue", choices: [{ meta: { label: "Early" }, code: 11 }] } },
      { name: "Beryl", note: "Ready", shift: 21, detail: { team: "Gold", choices: [{ meta: { label: "Late" }, code: 21 }] } },
      { name: "Cedar", note: "Ready", shift: 31, detail: { team: "Blue", choices: [{ meta: { label: "Day" }, code: 31 }, { meta: { label: "Night" }, code: 32 }] } },
      { name: "Dove", note: "Ready", shift: 41, detail: { team: "Green", choices: [{ meta: { label: "Swing" }, code: 41 }] } }
    ]);
    const ids = rows.entries().map(row => row.id);
    const table = document.querySelector("table")!;
    const status = document.querySelector("#selection-status")!;
    const bind = () => bindGrid(table, {
      rows,
      initialPage: { page: 2, size: 2 },
      onSelect({ id }) { status.textContent = id === null ? "None selected" : `Selected ${id}`; }
    });
    const app: AgentScreen = { rows, grid: bind(), ids, rebind() { this.grid = bind(); } };
    window.__m10AgentScreen = app;
  }, { dataEntry: source("../../src/data/index.ts"), uiEntry: source("../../src/ui/index.ts") });

  const names = () => page.locator("tbody tr:not([data-row-template]) [data-field='name']").allTextContents();
  expect(await names()).toEqual(["Cedar", "Dove"]);
  expect(await page.evaluate(() => window.__m10AgentScreen!.grid.page())).toEqual({ page: 2, size: 2, total: 4, pages: 2 });
  expect(await page.evaluate(() => document.querySelectorAll("tbody tr").length)).toBe(2);

  const cedar = page.locator("tbody tr").filter({ hasText: "Cedar" });
  const dove = page.locator("tbody tr").filter({ hasText: "Dove" });
  await expect(cedar.locator("select option")).toHaveText(["Choose", "Day", "Night"]);
  await expect(dove.locator("select option")).toHaveText(["Choose", "Swing"]);
  await cedar.locator("select").selectOption("32");
  expect(await page.evaluate(() => window.__m10AgentScreen!.rows.get(window.__m10AgentScreen!.ids[2])!.value.shift)).toBe(32);

  const selectCedar = cedar.getByRole("button", { name: "Select Cedar" });
  await selectCedar.focus();
  await selectCedar.press("Enter");
  expect(await page.evaluate(() => window.__m10AgentScreen!.grid.selected())).toBe(await page.evaluate(() => window.__m10AgentScreen!.ids[2]));
  await expect(selectCedar).toHaveAttribute("aria-pressed", "true");

  await page.evaluate(() => {
    const app = window.__m10AgentScreen!;
    app.grid.select(app.ids[0]); // Aster is off-page but keeps its Rows identity.
    app.grid.setSort((a, b) => b.name.localeCompare(a.name));
  });
  expect(await names()).toEqual(["Beryl", "Aster"]);
  expect(await page.evaluate(() => window.__m10AgentScreen!.grid.selected())).toBe(await page.evaluate(() => window.__m10AgentScreen!.ids[0]));
  await expect(page.getByRole("button", { name: "Select Aster" })).toHaveAttribute("aria-pressed", "true");

  const asterNote = page.locator("tbody tr").filter({ hasText: "Aster" }).locator("input[data-field='note']");
  await asterNote.fill("");
  await asterNote.dispatchEvent("change");
  const invalid = await page.evaluate(() => {
    const app = window.__m10AgentScreen!;
    return { note: app.rows.get(app.ids[0])!.value.note, result: app.grid.validate(app.ids[0]) };
  });
  expect(invalid.note).toBe("Ready");
  expect(invalid.result.valid).toBe(false);
  expect(invalid.result.issues.some(issue => issue.field === "note")).toBe(true);
  await expect(asterNote).toHaveAttribute("aria-invalid", "true");

  await page.evaluate(() => window.__m10AgentScreen!.grid.setPage({ page: 1, size: 2 }));
  expect(await names()).toEqual(["Dove", "Cedar"]);
  await page.evaluate(() => window.__m10AgentScreen!.grid.setPage({ page: 2, size: 2 }));
  expect(await names()).toEqual(["Beryl", "Aster"]);
  await expect(asterNote).toHaveValue("");
  expect(await page.evaluate(() => window.__m10AgentScreen!.grid.selected())).toBe(await page.evaluate(() => window.__m10AgentScreen!.ids[0]));
  expect(await page.evaluate(() => {
    const ids = [...document.querySelectorAll("[id]")].map(element => element.id);
    return ids.length === new Set(ids).size;
  })).toBe(true);

  await page.evaluate(() => {
    const app = window.__m10AgentScreen!;
    app.grid.dispose();
    if (document.querySelectorAll("tbody tr[data-row-template]").length !== 1) throw new Error("template not restored");
    app.rebind();
  });
  expect(await names()).toEqual(["Cedar", "Dove"]);
  expect(await page.evaluate(() => window.__m10AgentScreen!.grid.page())).toEqual({ page: 2, size: 2, total: 4, pages: 2 });
  expect(await page.evaluate(() => window.__m10AgentScreen!.grid.selected())).toBeNull();
  await page.evaluate(() => window.__m10AgentScreen!.grid.setPage({ page: 1, size: 2 }));
  await expect(page.locator("tbody tr").filter({ hasText: "Aster" }).locator("input[data-field='note']")).toHaveValue("Ready");
  await page.evaluate(() => {
    const app = window.__m10AgentScreen!;
    app.grid.dispose();
    app.rows.dispose();
  });
});
