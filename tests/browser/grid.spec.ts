import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const source = (path: string) =>
  `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;

const modules = {
  grid: source("../../src/ui/grid.ts"),
  data: source("../../src/data/index.ts")
};

test("nested row options keep raw values, row identity, and native table markup", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const host = document.createElement("section");
    host.innerHTML = `<table><thead><tr><th scope="col">Row</th><th scope="col">Choice</th></tr></thead>
      <tbody><tr data-row-template><th scope="row"><button type="button" data-select-row><span data-field="b"></span></button></th>
      <td><label>Choice <select data-field="chosen" data-options="a" data-option-label="aa" data-option-value="bb">
      <option value="">Choose</option></select></label></td></tr></tbody></table>`;
    document.body.append(host);
    const table = host.querySelector("table")!;
    const rows = createRows([
      { a: [{ aa: 11, bb: 22 }, {}], b: 2, chosen: 22 },
      { a: [{ aa: 33, bb: 44 }], b: 1, chosen: 44 }
    ]);
    const [first, second] = rows.entries();
    const selections: (number | null)[] = [];
    const handle = bindGrid(table, { rows, onSelect: ({ id }: { id: number | null }) => selections.push(id) });
    const initial = [...table.tBodies[0].rows].map(row => ({
      name: row.querySelector("button")?.textContent,
      choices: [...row.querySelector("select")!.options].map(option => option.textContent),
      selected: row.querySelector("select")!.selectedIndex
    }));
    const firstButton = table.querySelector("button")!;
    firstButton.click();
    const pressed = firstButton.getAttribute("aria-pressed");
    firstButton.focus();
    handle.setSort((a: { b: number }, b: { b: number }) => a.b - b.b);
    const sorted = [...table.tBodies[0].rows].map(row => row.querySelector("button")?.textContent);
    const focusAfterSort = document.activeElement === firstButton;
    handle.setFilter((row: { b: number }) => row.b === 1);
    const filtered = [...table.tBodies[0].rows].map(row => row.querySelector("button")?.textContent);
    const stillSelected = handle.selected() === first.id;
    handle.setFilter(null);
    const sameButton = [...table.querySelectorAll("button")].includes(firstButton);
    const firstSelect = firstButton.closest("tr")!.querySelector("select")!;
    firstSelect.focus();
    rows.set(first.id, "b", 3);
    const focusKept = document.activeElement === firstSelect;
    firstSelect.selectedIndex = 0;
    firstSelect.dispatchEvent(new Event("change", { bubbles: true }));
    const emptyValue = rows.get(first.id)!.value.chosen;
    firstSelect.selectedIndex = 1;
    firstSelect.dispatchEvent(new Event("change", { bubbles: true }));
    const rawValue = rows.get(first.id)!.value.chosen;
    rows.set(first.id, "a", [{ aa: 55, bb: 66 }]);
    const invalid = handle.validate(first.id);
    const missingSelection = firstSelect.selectedIndex;
    rows.revert(first.id);
    const restored = handle.validate(first.id);
    const noIds = [...table.querySelectorAll("[id]")].length === 0;
    handle.dispose();
    const templateRestored = !!table.querySelector("tr[data-row-template]") && table.tBodies[0].rows.length === 1;
    rows.set(second.id, "b", 5);
    const noLateRender = table.tBodies[0].rows.length === 1;
    rows.dispose();
    host.remove();
    return {
      initial, pressed, sorted, focusAfterSort, filtered, stillSelected, sameButton, focusKept,
      emptyValue, rawValue, invalid: invalid.issues.map((issue: { rule: string }) => issue.rule),
      missingSelection, restored: restored.valid, noIds, templateRestored, noLateRender, selections
    };
  }, modules);
  expect(result).toEqual({
    initial: [
      { name: "2", choices: ["Choose", "11"], selected: 1 },
      { name: "1", choices: ["Choose", "33"], selected: 1 }
    ],
    pressed: "true",
    sorted: ["1", "2"],
    focusAfterSort: true,
    filtered: ["1"],
    stillSelected: true,
    sameButton: true,
    focusKept: true,
    emptyValue: null,
    rawValue: 22,
    invalid: ["select-option"],
    missingSelection: -1,
    restored: true,
    noIds: true,
    templateRestored: true,
    noLateRender: true,
    selections: [1]
  });
});

test("a repeated fixed id is rejected before cloning", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = `<tbody><tr data-row-template><td><input id="repeat"></td></tr></tbody>`;
    document.body.append(table);
    const rows = createRows([{ value: 1 }]);
    let code = "";
    try { bindGrid(table, { rows }); } catch (cause) { code = (cause as { code: string }).code; }
    const untouched = table.tBodies[0].rows.length === 1 &&
      table.querySelector("tr[data-row-template] #repeat") !== null;
    rows.dispose();
    table.remove();
    return { code, untouched };
  }, modules);
  expect(result).toEqual({ code: "DUPLICATE_ID", untouched: true });
});

test("nested field paths preserve a number apart from the same DOM string", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = `<tbody><tr data-row-template><td data-field="profile.name"></td><td>
      <label>Choice <select data-field="profile.chosen" data-options="profile.a"
        data-option-label="label" data-option-value="value"><option value="">Choose</option>
      </select></label></td></tr></tbody>`;
    document.body.append(table);
    const rows = createRows([{ profile: {
      name: "Ada", a: [{ label: "Numeric", value: 1 }, { label: "Text", value: "1" }], chosen: "1"
    } }]);
    const id = rows.entries()[0].id;
    const handle = bindGrid(table, { rows });
    const cell = table.querySelector("td")!;
    const select = table.querySelector("select")!;
    const initial = { text: cell.textContent, selected: select.selectedIndex };
    select.selectedIndex = 1;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    const numeric = rows.get(id)!.value.profile.chosen;
    const changed = rows.get(id)!.status;
    rows.revert(id);
    const reverted = { value: rows.get(id)!.value.profile.chosen, selected: select.selectedIndex };
    rows.set(id, "profile", { name: "Ada", a: [], chosen: "1" });
    handle.setFilter(() => false);
    const hiddenIssue = handle.validate().issues.map((issue: { field: string; rule: string }) =>
      ({ field: issue.field, rule: issue.rule }));
    handle.dispose();
    rows.dispose();
    table.remove();
    return { initial, numeric, changed, reverted, hiddenIssue };
  }, modules);
  expect(result).toEqual({
    initial: { text: "Ada", selected: 2 },
    numeric: 1,
    changed: "update",
    reverted: { value: "1", selected: 2 },
    hiddenIssue: [{ field: "profile.chosen", rule: "select-option" }]
  });
});

test("rule arguments fail before binding and custom Grid rules run", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = '<tbody><tr data-row-template><td data-field="name" data-format=\'[["limit"]]\'></td></tr></tbody>';
    document.body.append(table);
    const rows = createRows([{ name: "Ada" }]);
    let ruleCode = "";
    try { bindGrid(table, { rows }); }
    catch (cause) { ruleCode = (cause as { code: string }).code; }
    const untouched = table.querySelector("tr[data-row-template]") !== null;
    const cell = table.querySelector("[data-field]")!;
    cell.removeAttribute("data-format");
    cell.setAttribute("data-validate", '[["companyName"]]');
    const handle = bindGrid(table, { rows, rules: {
      validate: { companyName: (value: string) => value === "Ada" }
    } });
    const valid = handle.validate().valid;
    let rowCode = "";
    try { handle.validate(999); } catch (cause) { rowCode = (cause as { code: string }).code; }
    handle.dispose();
    rows.dispose();
    table.remove();
    return { ruleCode, rowCode, untouched, valid };
  }, modules);
  expect(result).toEqual({ ruleCode: "RULE_ARGUMENT", rowCode: "GRID_ROW", untouched: true, valid: true });
});

test("formatted text, validators, and cloned error regions stay accessible across filtering", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = `<tbody><tr data-row-template>
      <td><span data-field="amount" data-format='[["commas"]]' data-validate='[["integer"]]'></span>
        <output data-error-for="amount"></output></td>
      <td><label>Team <select data-field="team" data-options="teams" data-option-label="label"
        data-option-value="id" data-validate='[["required"]]' required>
        <option value="">Choose</option></select></label><output data-error-for="team"></output></td>
      </tr></tbody>`;
    document.body.append(table);
    const rows = createRows([
      { amount: 12345, team: 1, teams: [{ label: "One", id: 1 }] },
      { amount: "bad", team: null, teams: [{ label: "Two", id: 2 }] }
    ]);
    const secondId = rows.entries()[1].id;
    const handle = bindGrid(table, { rows, rules: { messages: { integer: "Numbers only" } } });
    const firstText = table.tBodies[0].rows[0].querySelector("[data-field=amount]")!.textContent;
    const initial = handle.validate();
    const second = table.tBodies[0].rows[1];
    const amount = second.querySelector<HTMLElement>("[data-field=amount]")!;
    const amountError = second.querySelector<HTMLElement>("[data-error-for=amount]")!;
    const select = second.querySelector<HTMLSelectElement>("select")!;
    const selectError = second.querySelector<HTMLElement>("[data-error-for=team]")!;
    const errorIds = [...table.querySelectorAll("[data-error-for]")].map(element => element.id);
    const accessible = {
      amountInvalid: amount.getAttribute("aria-invalid"),
      selectInvalid: select.getAttribute("aria-invalid"),
      amountLink: amount.getAttribute("aria-describedby")?.split(/\s+/).includes(amountError.id),
      selectLink: select.getAttribute("aria-describedby")?.split(/\s+/).includes(selectError.id),
      amountMessage: amountError.textContent,
      selectLive: selectError.getAttribute("aria-live"),
      uniqueIds: new Set(errorIds).size === errorIds.length
    };
    handle.setFilter(row => row.amount === 12345);
    const hidden = handle.validate(secondId);
    handle.dispose();
    const templateRestored = table.querySelector("tr[data-row-template]") !== null &&
      table.querySelector("[id]") === null;
    rows.dispose();
    table.remove();
    return {
      firstText, initialRules: initial.issues.map((issue: { rule: string }) => issue.rule),
      accessible, hiddenRules: hidden.issues.map((issue: { rule: string }) => issue.rule),
      hiddenElements: hidden.issues.every((issue: { element?: Element }) => !issue.element),
      templateRestored
    };
  }, modules);
  expect(result).toEqual({
    firstText: "12,345",
    initialRules: ["integer", "html", "required"],
    accessible: {
      amountInvalid: "true", selectInvalid: "true", amountLink: true, selectLink: true,
      amountMessage: "Numbers only", selectLive: "polite", uniqueIds: true
    },
    hiddenRules: ["integer", "html", "required"], hiddenElements: true, templateRestored: true
  });
});

test("failed Select edits stay with RowId and clear on revert, remove, and replace", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = `<tbody><tr data-row-template><td data-field="b"></td><td>
      <label>Choice <select data-field="chosen" data-options="a" data-option-label="label"
        data-option-value="value" data-validate='[["notTwo"]]'><option value="">Choose</option>
      </select></label><output data-error-for="chosen"></output></td></tr></tbody>`;
    document.body.append(table);
    const original = { b: 1, chosen: 1, a: [
      { label: "One", value: 1 }, { label: "Two", value: 2 }
    ] };
    const rows = createRows([original]);
    const id = rows.entries()[0].id;
    const handle = bindGrid(table, { rows, rules: {
      validate: { notTwo: (value: string) => value !== "2" || "Two is blocked" }
    } });
    const chooseTwo = () => {
      const select = table.querySelector("select")!;
      select.selectedIndex = 2;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    };
    chooseTwo();
    const blocked = {
      stored: rows.get(id)!.value.chosen,
      selected: table.querySelector("select")!.selectedIndex,
      issue: handle.validate(id).issues[0]?.rule,
      error: table.querySelector("[data-error-for=chosen]")?.textContent
    };
    const firstControl = table.querySelector("select")!;
    const extraId = rows.add({ ...original, b: 4 });
    handle.setSort((a: { b: number }, b: { b: number }) => b.b - a.b);
    const sortedDraft = {
      sameControl: [...table.querySelectorAll("select")].includes(firstControl),
      selected: firstControl.selectedIndex,
      issue: handle.validate(id).issues[0]?.rule
    };
    handle.setSort(null);
    rows.remove(extraId);
    rows.set(id, "b", 3);
    const unrelated = {
      stored: rows.get(id)!.value.chosen,
      selected: table.querySelector("select")!.selectedIndex,
      issue: handle.validate(id).issues[0]?.rule
    };
    handle.setFilter(() => false);
    const hidden = handle.validate(id);
    handle.setFilter(null);
    const shownAgain = table.querySelector("select")!.selectedIndex;
    rows.revert(id);
    const reverted = {
      stored: rows.get(id)!.value.chosen,
      selected: table.querySelector("select")!.selectedIndex,
      valid: handle.validate(id).valid
    };
    chooseTwo();
    rows.remove(id);
    rows.revert(id);
    const removed = {
      selected: table.querySelector("select")!.selectedIndex,
      valid: handle.validate(id).valid
    };
    chooseTwo();
    rows.replace([original]);
    const replaced = {
      selected: table.querySelector("select")!.selectedIndex,
      valid: handle.validate().valid,
      idChanged: rows.entries()[0].id !== id
    };
    handle.dispose();
    rows.dispose();
    table.remove();
    return {
      blocked, sortedDraft, unrelated, hiddenRule: hidden.issues[0]?.rule,
      hiddenElement: hidden.issues[0]?.element === undefined,
      shownAgain, reverted, removed, replaced
    };
  }, modules);
  expect(result).toEqual({
    blocked: { stored: 1, selected: 2, issue: "notTwo", error: "Two is blocked" },
    sortedDraft: { sameControl: true, selected: 2, issue: "notTwo" },
    unrelated: { stored: 1, selected: 2, issue: "notTwo" },
    hiddenRule: "notTwo", hiddenElement: true, shownAgain: 2,
    reverted: { stored: 1, selected: 1, valid: true },
    removed: { selected: 1, valid: true },
    replaced: { selected: 1, valid: true, idChanged: true }
  });
});

test("external row updates do not run user validators after the value commits", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = '<tbody><tr data-row-template><td data-field="value" data-validate=\'[["check"]]\'></td></tr></tbody>';
    document.body.append(table);
    const rows = createRows([{ value: 1 }]);
    const id = rows.entries()[0].id;
    let calls = 0;
    const handle = bindGrid(table, { rows, rules: { validate: {
      check(value: string) {
        calls++;
        if (value === "2") throw new Error("expected explicit validation only");
        return true;
      }
    } } });
    rows.set(id, "value", 2);
    const afterSet = { calls, value: rows.get(id)!.value.value, shown: table.querySelector("td")?.textContent };
    let validationCode = "";
    try { handle.validate(id); } catch (cause) { validationCode = (cause as { code: string }).code; }
    handle.dispose();
    rows.dispose();
    table.remove();
    return { afterSet, validationCode, calls };
  }, modules);
  expect(result).toEqual({
    afterSet: { calls: 0, value: 2, shown: "2" },
    validationCode: "RULE_FAILED", calls: 1
  });
});

test("cross-field Select drafts validate together and commit on change or explicit validation", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = `<tbody><tr data-row-template>
      <td><label>Left <select data-field="left" data-options="choices"
        data-option-label="label" data-option-value="value" data-validate='[["equalTo","right"]]'>
        </select></label><output data-error-for="left"></output></td>
      <td><label>Right <select data-field="right" data-options="choices"
        data-option-label="label" data-option-value="value" data-validate='[["equalTo","left"]]'>
        </select></label><output data-error-for="right"></output></td>
      </tr></tbody>`;
    document.body.append(table);
    const rows = createRows([{ left: "1", right: "1", choices: [
      { label: "One", value: "1" }, { label: "Two", value: "2" }
    ] }]);
    const id = rows.entries()[0].id;
    const handle = bindGrid(table, { rows });
    const [left, right] = [...table.querySelectorAll("select")];
    const chooseTwo = (control: HTMLSelectElement) => {
      control.selectedIndex = 1;
      control.dispatchEvent(new Event("change", { bubbles: true }));
    };
    chooseTwo(left);
    const blocked = {
      stored: rows.get(id)!.value.left,
      selected: left.selectedIndex,
      issue: handle.validate(id).issues.find((issue: { field: string }) => issue.field === "left")?.rule
    };
    chooseTwo(right);
    const paired = {
      left: rows.get(id)!.value.left, right: rows.get(id)!.value.right,
      valid: handle.validate(id).valid
    };
    rows.revert(id);
    chooseTwo(left);
    rows.set(id, "right", "2");
    const external = {
      before: rows.get(id)!.value.left,
      result: handle.validate(id).valid,
      after: rows.get(id)!.value.left
    };
    rows.revert(id);
    chooseTwo(left);
    rows.set(id, "right", "2");
    const unsubscribe = rows.subscribe(() => { throw new Error("after commit"); });
    let failure = "";
    try { handle.validate(id); } catch (cause) { failure = (cause as Error).message; }
    const committedAfterFailure = rows.get(id)!.value.left;
    unsubscribe();
    const validAfterFailure = handle.validate(id).valid;
    handle.dispose();
    rows.dispose();
    table.remove();
    return { blocked, paired, external, failure, committedAfterFailure, validAfterFailure };
  }, modules);
  expect(result).toEqual({
    blocked: { stored: "1", selected: 1, issue: "equalTo" },
    paired: { left: "2", right: "2", valid: true },
    external: { before: "1", result: true, after: "2" },
    failure: "after commit", committedAfterFailure: "2", validAfterFailure: true
  });
});

test("programmatic lengths, checkbox state, stale errors, and unsupported inputs are explicit", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = `<tbody><tr data-row-template>
      <td><label>Code <input data-field="code" minlength="4"></label>
        <output data-error-for="code"></output></td>
      <td><label>Active <input type="checkbox" data-field="active" disabled></label></td>
      </tr></tbody>`;
    document.body.append(table);
    const rows = createRows([{ code: "ab", active: true }]);
    const id = rows.entries()[0].id;
    const handle = bindGrid(table, { rows });
    const code = table.querySelector<HTMLInputElement>('input[data-field="code"]')!;
    const check = table.querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    const error = table.querySelector<HTMLElement>('[data-error-for="code"]')!;
    const checked = check.checked;
    const issue = handle.validate(id).issues[0];
    const before = { invalid: code.getAttribute("aria-invalid"), error: error.textContent };
    rows.set(id, "code", "abcd");
    const cleared = { invalid: code.getAttribute("aria-invalid"), error: error.textContent };
    const valid = handle.validate(id).valid;
    handle.dispose();
    rows.dispose();
    table.remove();

    const fileTable = document.createElement("table");
    fileTable.innerHTML = '<tbody><tr data-row-template><td><input type="file" data-field="file"></td></tr></tbody>';
    document.body.append(fileTable);
    const fileRows = createRows([{ file: "" }]);
    let fileCode = "";
    try { bindGrid(fileTable, { rows: fileRows }); }
    catch (cause) { fileCode = (cause as { code: string }).code; }
    const fileUntouched = fileTable.querySelector("tr[data-row-template]") !== null;
    fileRows.dispose();
    fileTable.remove();

    const formatCodes: string[] = [];
    for (const type of ["checkbox", "number", "date", "hidden"]) {
      const formatTable = document.createElement("table");
      formatTable.innerHTML = '<tbody><tr data-row-template><td><input type="' + type +
        '" data-field="active" data-format=\'[["upper"]]\'></td></tr></tbody>';
      document.body.append(formatTable);
      const formatRows = createRows([{ active: true }]);
      let formatCode = "ok";
      try { bindGrid(formatTable, { rows: formatRows }).dispose(); }
      catch (cause) { formatCode = (cause as { code: string }).code; }
      formatCodes.push(`${type}:${formatCode}`);
      formatRows.dispose();
      formatTable.remove();
    }
    const radioTable = document.createElement("table");
    radioTable.innerHTML = '<tbody><tr data-row-template><td><input type="radio" data-field="active"></td></tr></tbody>';
    document.body.append(radioTable);
    const radioRows = createRows([{ active: true }]);
    let radioCode = "";
    try { bindGrid(radioTable, { rows: radioRows }); }
    catch (cause) { radioCode = (cause as { code: string }).code; }
    radioRows.dispose();
    radioTable.remove();
    return { checked, rule: issue?.rule, before, cleared, valid, fileCode, fileUntouched, formatCodes, radioCode };
  }, modules);
  expect(result).toEqual({
    checked: true, rule: "html",
    before: { invalid: "true", error: "Use at least 4 characters." },
    cleared: { invalid: null, error: "" }, valid: true,
    fileCode: "GRID_FILE_ROWS", fileUntouched: true,
    formatCodes: ["checkbox:GRID_FORMAT", "number:GRID_FORMAT", "date:GRID_FORMAT", "hidden:GRID_FORMAT"], radioCode: "GRID_CONTROL"
  });
});

test("a thrown Select validator keeps its draft until explicit validation succeeds", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ grid, data }) => {
    const { bindGrid } = await import(grid);
    const { createRows } = await import(data);
    const table = document.createElement("table");
    table.innerHTML = `<tbody><tr data-row-template><td><label>Choice
      <select data-field="chosen" data-options="choices" data-option-label="label"
        data-option-value="value" data-validate='[["unstable"]]'></select>
      </label></td></tr></tbody>`;
    document.body.append(table);
    const rows = createRows([{ chosen: 1, choices: [
      { label: "One", value: 1 }, { label: "Two", value: 2 }
    ] }]);
    const id = rows.entries()[0].id;
    let calls = 0;
    const handle = bindGrid(table, { rows, rules: { validate: {
      unstable() {
        calls++;
        if (calls === 1) return false;
        if (calls === 2) throw new Error("transient");
        return true;
      }
    } } });
    const select = table.querySelector("select")!;
    select.selectedIndex = 1;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    let errorCode = "";
    try { handle.validate(id); } catch (cause) { errorCode = (cause as { code: string }).code; }
    const afterFailure = {
      stored: rows.get(id)!.value.chosen, selected: select.selectedIndex, errorCode
    };
    const valid = handle.validate(id).valid;
    const afterValidation = { stored: rows.get(id)!.value.chosen, calls };
    handle.dispose();
    rows.dispose();
    table.remove();
    return { afterFailure, valid, afterValidation };
  }, modules);
  expect(result).toEqual({
    afterFailure: { stored: 1, selected: 1, errorCode: "RULE_FAILED" },
    valid: true, afterValidation: { stored: 2, calls: 4 }
  });
});