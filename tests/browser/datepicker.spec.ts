import { fileURLToPath } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const source = (path: string) =>
  `/@fs/${fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")}`;
const modules = {
  picker: source("../../src/ui/datepicker.ts"),
  form: source("../../src/ui/form.ts"),
  data: source("../../src/data/index.ts")
};
const markup = `<section data-datepicker>
  <h2 data-date-title><span>Authored title</span></h2>
  <button type="button" data-date-prev>Previous month</button>
  <button type="button" data-date-next>Next month</button>
  <button type="button" data-date-today>Today</button>
  <table data-date-grid><thead><tr>${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    .map(day => `<th scope="col" abbr="${day}">${day.slice(0, 3)}</th>`).join("")}</tr></thead>
    <tbody><tr data-date-week-template>${Array.from({ length: 7 }, () =>
      '<td><button type="button" data-date-day><span data-date-number>Day</span></button></td>').join("")}</tr></tbody>
  </table><p>Use arrows, Home, End, Page Up and Page Down to move. Enter selects a date.</p>
</section>`;

test("DatePicker compiles authored weeks once and restores markup, IDs, and ownership", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ picker, markup }) => {
    const { bindDatePicker } = await import(picker);
    document.body.innerHTML = markup + markup;
    const roots = [...document.querySelectorAll<HTMLElement>("[data-datepicker]")];
    const before = roots.map(root => root.innerHTML);
    const templates = roots.map(root => root.querySelector("[data-date-week-template]"));
    const titleChild = roots[0].querySelector("[data-date-title]")!.firstChild;
    const first = bindDatePicker(roots[0], { value: "2024-02-29", locale: "en-US" });
    const second = bindDatePicker(roots[1], { value: "2024-03-01", locale: "en-US" });
    const titleIds = roots.map(root => root.querySelector("[data-date-title]")!.id);
    const labels = roots.map(root => root.querySelector("[data-date-grid]")!.getAttribute("aria-labelledby"));
    const originalButtons = [...roots[0].querySelectorAll("[data-date-day]")];
    roots[0].querySelector<HTMLButtonElement>("[data-date-next]")!.click();
    const sameNodes = originalButtons.every((button, index) => roots[0].querySelectorAll("[data-date-day]")[index] === button);
    const independent = second.value() === "2024-03-01" && roots[1].querySelector("[data-date-title]")!.textContent === "March 2024";
    let owned = "";
    try { bindDatePicker(roots[0]); } catch (cause) { owned = (cause as { code: string }).code; }
    first.dispose();
    first.dispose();
    second.dispose();
    const restored = roots.every((root, index) => root.innerHTML === before[index] && root.querySelector("[data-date-week-template]") === templates[index]);
    const restoredTitleChild = roots[0].querySelector("[data-date-title]")!.firstChild === titleChild;
    let disposed = "";
    try { first.focus(); } catch (cause) { disposed = (cause as { code: string }).code; }
    const again = bindDatePicker(roots[0], { value: null });
    const empty = again.value();
    again.dispose();
    return { titleIds, labels, sameNodes, independent, owned, restored, restoredTitleChild, disposed, empty };
  }, { picker: modules.picker, markup });
  expect(result.titleIds[0]).not.toBe(result.titleIds[1]);
  expect(result.labels).toEqual(result.titleIds);
  expect(result).toMatchObject({ sameNodes: true, independent: true, owned: "DATE_OWNED", restored: true,
    restoredTitleChild: true, disposed: "DATE_DISPOSED", empty: null });
});

test("calendar keyboard preserves leap-day intent, week order, selection, and roving focus", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async ({ picker, markup }) => {
    const { bindDatePicker } = await import(picker);
    document.body.innerHTML = markup;
    const events: string[] = [];
    const handle = bindDatePicker(document.querySelector<HTMLElement>("[data-datepicker]")!, {
      value: "2024-02-29", locale: "en-US", onChange: (value: string) => events.push(value)
    });
    Object.assign(window, { datePicker: handle, dateEvents: events });
    handle.focus();
  }, { picker: modules.picker, markup });
  const focused = () => page.locator('[data-date-day][tabindex="0"]');
  await expect(focused()).toBeFocused();
  await expect(focused()).toHaveAttribute("data-date-value", "2024-02-29");
  await page.keyboard.press("Shift+PageDown");
  await expect(focused()).toHaveAttribute("data-date-value", "2025-02-28");
  await page.keyboard.press("PageDown");
  await expect(focused()).toHaveAttribute("data-date-value", "2025-03-28");
  await page.keyboard.press("Home");
  await expect(focused()).toHaveAttribute("data-date-value", "2025-03-23");
  await page.keyboard.press("End");
  await expect(focused()).toHaveAttribute("data-date-value", "2025-03-29");
  await page.keyboard.press("ArrowDown");
  await expect(focused()).toHaveAttribute("data-date-value", "2025-04-05");
  expect(await page.evaluate(() => Reflect.get(window, "dateEvents"))).toEqual([]);
  await page.keyboard.press("Enter");
  await expect(page.locator('td[aria-selected="true"] [data-date-day]')).toHaveAttribute("data-date-value", "2025-04-05");
  await page.keyboard.press("Space");
  expect(await page.evaluate(() => Reflect.get(window, "dateEvents"))).toEqual(["2025-04-05"]);
  expect(await page.locator('[data-date-day][tabindex="0"]').count()).toBe(1);
  await page.evaluate(() => Reflect.get(window, "datePicker").dispose());
});

test("limits constrain keyboard and pointer selection without emitting programmatic changes", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ picker, markup }) => {
    const { bindDatePicker } = await import(picker);
    document.body.innerHTML = markup;
    const root = document.querySelector<HTMLElement>("[data-datepicker]")!;
    const events: string[] = [];
    const handle = bindDatePicker(root, { value: "2024-02-29", min: "2024-02-28", max: "2024-03-01",
      onChange: (value: string) => events.push(value) });
    handle.focus();
    const key = (value: string) => document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true }));
    key("ArrowUp");
    const minFocus = document.activeElement!.getAttribute("data-date-value");
    key("PageDown");
    const maxFocus = document.activeElement!.getAttribute("data-date-value");
    root.querySelector<HTMLButtonElement>('[data-date-value="2024-03-02"]')!.click();
    const unchanged = handle.value();
    root.querySelector<HTMLButtonElement>('[data-date-value="2024-03-01"]')!.click();
    const selected = handle.value();
    handle.setValue("2024-02-28");
    const before = root.innerHTML;
    let invalid = "";
    try { handle.setValue("2024-02-30"); } catch (cause) { invalid = (cause as { code: string }).code; }
    let range = "";
    try { handle.setValue("2024-03-02"); } catch (cause) { range = (cause as { code: string }).code; }
    const atomic = before === root.innerHTML && handle.value() === "2024-02-28";
    handle.setValue(null);
    const empty = handle.value();
    handle.dispose();
    const single = bindDatePicker(root, { value: "2024-02-29", min: "2024-02-29", max: "2024-02-29" });
    const disabled = [...root.querySelectorAll<HTMLButtonElement>("[data-date-prev], [data-date-next], [data-date-today]")].every(button => button.disabled);
    const enabled = root.querySelectorAll("[data-date-day]:not(:disabled)").length;
    single.dispose();
    return { minFocus, maxFocus, unchanged, selected, events, invalid, range, atomic, empty, disabled, enabled };
  }, { picker: modules.picker, markup });
  expect(result).toEqual({ minFocus: "2024-02-28", maxFocus: "2024-03-01", unchanged: "2024-02-29", selected: "2024-03-01",
    events: ["2024-03-01"], invalid: "DATE_VALUE", range: "DATE_RANGE", atomic: true, empty: null, disabled: true, enabled: 1 });
});

test("Monday weeks and extreme years use UTC calendar days across daylight-saving dates", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ picker, markup }) => {
    const { bindDatePicker } = await import(picker);
    document.body.innerHTML = markup;
    const root = document.querySelector<HTMLElement>("[data-datepicker]")!;
    const weekdayRow = root.querySelector("thead tr")!;
    weekdayRow.append(weekdayRow.firstElementChild!);
    const handle = bindDatePicker(root, { value: "2024-03-10", weekStartsOn: 1, locale: "en-US" });
    handle.focus();
    const key = (value: string) => document.activeElement!.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true }));
    key("Home");
    const monday = document.activeElement!.getAttribute("data-date-value");
    key("End");
    key("ArrowRight");
    const nextDay = document.activeElement!.getAttribute("data-date-value");
    handle.setValue("0001-01-01");
    handle.focus();
    key("PageUp");
    const first = document.activeElement!.getAttribute("data-date-value");
    const firstDisabled = root.querySelector<HTMLButtonElement>("[data-date-prev]")!.disabled;
    handle.setValue("9999-12-31");
    handle.focus();
    key("PageDown");
    key("ArrowRight");
    const last = document.activeElement!.getAttribute("data-date-value");
    const lastDisabled = root.querySelector<HTMLButtonElement>("[data-date-next]")!.disabled;
    const validCells = [...root.querySelectorAll<HTMLElement>("[data-date-value]")].every(button => /^\d{4}-\d{2}-\d{2}$/.test(button.dataset.dateValue!));
    handle.dispose();
    return { monday, nextDay, first, firstDisabled, last, lastDisabled, validCells };
  }, { picker: modules.picker, markup });
  expect(result).toEqual({ monday: "2024-03-04", nextDay: "2024-03-11", first: "0001-01-01", firstDisabled: true,
    last: "9999-12-31", lastDisabled: true, validCells: true });
});

test("locale labels retain the Gregorian ISO calendar", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ picker, markup }) => {
    const { bindDatePicker } = await import(picker);
    document.body.innerHTML = markup;
    const root = document.querySelector<HTMLElement>("[data-datepicker]")!;
    return ["fa-IR", "ar-SA"].map(locale => {
      const handle = bindDatePicker(root, { value: "2024-02-29", locale });
      const day = new Date("2024-02-29T00:00:00Z");
      const title = root.querySelector("[data-date-title]")!.textContent;
      const label = root.querySelector('[data-date-value="2024-02-29"]')!.getAttribute("aria-label");
      const result = {
        title: title === new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", calendar: "gregory", timeZone: "UTC" }).format(day),
        label: label === new Intl.DateTimeFormat(locale, { dateStyle: "full", calendar: "gregory", timeZone: "UTC" }).format(day),
        value: handle.value()
      };
      handle.dispose();
      return result;
    });
  }, { picker: modules.picker, markup });
  expect(result).toEqual([{ title: true, label: true, value: "2024-02-29" }, { title: true, label: true, value: "2024-02-29" }]);
});

test("invalid dates, locale, markup, and repeated IDs fail before changing authored nodes", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ picker, markup }) => {
    const { bindDatePicker } = await import(picker);
    const failures: { code: string; unchanged: boolean }[] = [];
    for (const scenario of [
      { options: { value: "2023-02-29" } },
      { options: { min: "2025-01-01", max: "2024-01-01" } },
      { options: { locale: "bad_locale" } },
      { html: markup.replace("data-date-day", 'id="fixed-day" data-date-day') },
      { html: markup.replace('scope="col"', 'scope="row"') },
      { html: markup.replace("data-date-title", "data-date-title data-date-prev") },
      { html: markup.replace("data-date-next", "data-date-next data-date-prev") },
      { html: markup.replace("<td>", "<td><input>") },
      { html: markup.replace("<td>", '<td><span tabindex="0">Extra stop</span>') },
      { html: markup.replace("<td>", '<td><audio controls></audio>') },
      { html: markup.replace("<td>", '<td><video controls></video>') }
    ]) {
      document.body.innerHTML = scenario.html ?? markup;
      const root = document.querySelector<HTMLElement>("[data-datepicker]")!;
      const before = root.innerHTML;
      try { bindDatePicker(root, scenario.options); } catch (cause) {
        failures.push({ code: (cause as { code: string }).code, unchanged: before === root.innerHTML });
      }
    }
    document.body.innerHTML = '<span id="calendar-title">External</span>' + markup.replace("data-date-title", 'id="calendar-title" data-date-title');
    const root = document.querySelector<HTMLElement>("[data-datepicker]")!;
    const before = root.innerHTML;
    try { bindDatePicker(root); } catch (cause) {
      failures.push({ code: (cause as { code: string }).code, unchanged: before === root.innerHTML });
    }
    return failures;
  }, { picker: modules.picker, markup });
  expect(result).toEqual(["DATE_VALUE", "DATE_RANGE", "DATE_LOCALE", "DUPLICATE_ID", "DATE_MARKUP", "DATE_MARKUP", "DATE_MARKUP", "DATE_MARKUP", "DATE_MARKUP", "DATE_MARKUP", "DATE_MARKUP", "DUPLICATE_ID"]
    .map(code => ({ code, unchanged: true })));
});

test("application date selection updates nested Form rows through native input events", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async ({ picker, form, data, markup }) => {
    const { bindDatePicker } = await import(picker);
    const { bindForm } = await import(form);
    const { createRows } = await import(data);
    document.body.innerHTML = `<form><label>Meeting date <input data-field="meeting.date" type="date" required></label><output data-error-for="meeting.date"></output></form>${markup}`;
    const rows = createRows([{ meeting: { date: "2024-02-28" } }]);
    const id = rows.entries()[0].id;
    const input = document.querySelector<HTMLInputElement>("input")!;
    const bound = bindForm(document.querySelector<HTMLFormElement>("form")!, { rows });
    bound.bind(id);
    const handle = bindDatePicker(document.querySelector<HTMLElement>("[data-datepicker]")!, {
      value: input.value, onChange(value: string) {
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    document.querySelector<HTMLButtonElement>('[data-date-value="2024-02-29"]')!.click();
    const result = { raw: rows.get(id).value.meeting.date, input: input.value,
      picker: handle.value(), valid: bound.validate().valid, status: rows.changes()[0].status };
    handle.dispose();
    bound.dispose();
    rows.dispose();
    return result;
  }, { ...modules, markup });
  expect(result).toEqual({ raw: "2024-02-29", input: "2024-02-29", picker: "2024-02-29", valid: true, status: "update" });
});

test("authored calendar exposes an accessible grid before and after keyboard navigation", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async ({ picker, markup }) => {
    const { bindDatePicker } = await import(picker);
    document.body.innerHTML = `<main><h1>Calendar</h1>${markup}</main>`;
    const handle = bindDatePicker(document.querySelector<HTMLElement>("[data-datepicker]")!, { value: "2024-02-29", locale: "en-US" });
    Object.assign(window, { datePicker: handle });
    handle.focus();
  }, { picker: modules.picker, markup });
  await expect(page.getByRole("grid", { name: "February 2024" })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.keyboard.press("PageDown");
  await expect(page.getByRole("grid", { name: "March 2024" })).toBeVisible();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.evaluate(() => Reflect.get(window, "datePicker").dispose());
});
