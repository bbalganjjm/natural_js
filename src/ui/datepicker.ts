// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import { restoreAttributes, uniqueId } from "./dom-state.js";

export interface DatePickerHandle {
  value(): string | null;
  setValue(value: string | null): void;
  focus(): void;
  dispose(): void;
}

const DAY = 86_400_000;
const FIRST = Date.parse("0001-01-01T00:00:00Z") / DAY;
const LAST = Date.parse("9999-12-31T00:00:00Z") / DAY;
const boundRoots = new WeakSet<HTMLElement>();

function dateError(code: string, message: string): FrameworkError {
  return new FrameworkError({ api: "bindDatePicker", code, message });
}

function iso(day: number): string {
  return new Date(day * DAY).toISOString().slice(0, 10);
}

function parse(value: unknown): number {
  const day = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? Date.parse(`${value}T00:00:00Z`) / DAY : NaN;
  if (!Number.isInteger(day) || day < FIRST || day > LAST || iso(day) !== value) {
    throw dateError("DATE_VALUE", "Use a real ISO date from 0001-01-01 to 9999-12-31.");
  }
  return day;
}

function today(): number {
  const now = new Date();
  return parse(`${String(now.getFullYear()).padStart(4, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
}

function moveMonth(day: number, months: number): number {
  const date = new Date(day * DAY);
  const number = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const end = new Date(date);
  end.setUTCMonth(end.getUTCMonth() + 1, 0);
  date.setUTCDate(Math.min(number, end.getUTCDate()));
  return date.getTime() / DAY;
}

export function bindDatePicker(root: HTMLElement, options: {
  value?: string | null;
  min?: string;
  max?: string;
  locale?: string;
  weekStartsOn?: 0 | 1;
  onChange?: (value: string, event: Event) => void;
} = {}): DatePickerHandle {
  if (!(root instanceof HTMLElement) || !root.matches("[data-datepicker]") || !root.isConnected) {
    throw dateError("DATE_ROOT", "DatePicker needs a connected authored [data-datepicker] element.");
  }
  if (boundRoots.has(root)) throw dateError("DATE_OWNED", "This DatePicker root is already bound.");
  if (!options || (options.onChange !== undefined && typeof options.onChange !== "function") ||
      (options.weekStartsOn !== undefined && options.weekStartsOn !== 0 && options.weekStartsOn !== 1) ||
      (options.locale !== undefined && typeof options.locale !== "string")) {
    throw dateError("DATE_OPTIONS", "Use a locale, weekStartsOn 0 or 1, and an optional onChange function.");
  }
  const min = options.min === undefined ? FIRST : parse(options.min);
  const max = options.max === undefined ? LAST : parse(options.max);
  if (min > max) throw dateError("DATE_RANGE", "The minimum date must not follow the maximum date.");
  function checked(value: string | null): number | null {
    if (value === null) return null;
    const day = parse(value);
    if (day < min || day > max) throw dateError("DATE_RANGE", "The selected date must be inside min and max.");
    return day;
  }
  let selected = checked(options.value === undefined ? null : options.value);
  const weekStartsOn = options.weekStartsOn ?? 0;
  let monthText: Intl.DateTimeFormat;
  let dayText: Intl.DateTimeFormat;
  try {
    monthText = new Intl.DateTimeFormat(options.locale, { year: "numeric", month: "long", calendar: "gregory", timeZone: "UTC" });
    dayText = new Intl.DateTimeFormat(options.locale, { dateStyle: "full", calendar: "gregory", timeZone: "UTC" });
  } catch (cause) {
    throw new FrameworkError({ api: "bindDatePicker", code: "DATE_LOCALE", message: "Use a valid Intl locale.", cause });
  }
  function one(marker: string, required = true): HTMLElement | null {
    const elements = [...root.querySelectorAll<HTMLElement>(`[${marker}]`)]
      .filter(element => element.closest("[data-datepicker]") === root);
    if (elements.length > 1 || (required && elements.length !== 1)) {
      throw dateError("DATE_MARKUP", `Use ${required ? "one" : "at most one"} ${marker} element.`);
    }
    return elements[0] ?? null;
  }
  const title = one("data-date-title")!;
  const grid = one("data-date-grid");
  const template = one("data-date-week-template");
  if (!(grid instanceof HTMLTableElement) || !(template instanceof HTMLTableRowElement) ||
      grid.tBodies.length !== 1 || template.parentElement !== grid.tBodies[0] ||
      grid.tBodies[0].rows.length !== 1 || template.cells.length !== 7 || grid.contains(title) || title.contains(grid)) {
    throw dateError("DATE_MARKUP", "Use one table, one tbody with a seven-cell week row template, and a separate title.");
  }
  const headers = grid.tHead?.rows;
  if (!headers || headers.length !== 1 || headers[0].cells.length !== 7 ||
      [...headers[0].cells].some(cell => cell.localName !== "th" || cell.scope !== "col" ||
        cell.colSpan !== 1 || cell.rowSpan !== 1 || !cell.textContent?.trim())) {
    throw dateError("DATE_MARKUP", "The calendar needs seven named weekday th elements with scope=col.");
  }
  for (const cell of template.cells) {
    const buttons = cell.querySelectorAll("[data-date-day]");
    const button = buttons[0];
    if (cell.localName !== "td" || cell.colSpan !== 1 || cell.rowSpan !== 1 ||
        buttons.length !== 1 || cell.querySelectorAll("button").length !== 1 || !(button instanceof HTMLButtonElement) ||
        button.type !== "button" || button.querySelectorAll("[data-date-number]").length > 1) {
      throw dateError("DATE_MARKUP", "Each week cell needs one type=button data-date-day control.");
    }
  }
  const interactive = template.querySelectorAll<HTMLElement>(
    'a[href], area[href], button, input, select, textarea, summary, iframe, audio[controls], video[controls], [tabindex], [contenteditable]:not([contenteditable="false"])'
  );
  if ([...interactive].some(element => !element.matches("button[data-date-day]"))) {
    throw dateError("DATE_MARKUP", "A calendar week accepts only its seven day buttons as interactive controls.");
  }
  if (template.hasAttribute("id") || template.querySelector("[id]")) {
    throw dateError("DUPLICATE_ID", "A repeated calendar week cannot contain fixed DOM ids.");
  }
  const authoredWeek = template;
  const controls = new Map<string, HTMLButtonElement>();
  for (const name of ["prev", "next", "today"]) {
    const element = one(`data-date-${name}`, false);
    if (element === null) continue;
    if (!(element instanceof HTMLButtonElement) || element.type !== "button" ||
        grid.contains(element) || element === title || title.contains(element) || element.contains(title) ||
        [...controls.values()].includes(element)) {
      throw dateError("DATE_MARKUP", "Calendar actions need distinct type=button controls outside the table.");
    }
    controls.set(name, element);
  }
  const document = root.ownerDocument;
  const ids = new Set<string>();
  for (const element of [root, ...root.querySelectorAll<HTMLElement>("[id]")]) {
    if (!element.id) continue;
    if (ids.has(element.id)) throw dateError("DUPLICATE_ID", "DatePicker repeats an authored DOM id.");
    ids.add(element.id);
  }
  for (const element of document.querySelectorAll("[id]")) {
    if (!root.contains(element) && ids.has(element.id)) {
      throw dateError("DUPLICATE_ID", "A DatePicker DOM id already exists in the document.");
    }
  }

  const restore = [restoreAttributes(title, ["id", "aria-live", "aria-atomic"]),
    restoreAttributes(grid, ["role", "aria-labelledby"]),
    ...[...controls.values()].map(button => restoreAttributes(button, ["disabled"]))];
  const titleNodes = [...title.childNodes];
  const anchor = document.createComment("datepicker weeks");
  const weeks: HTMLTableRowElement[] = [];
  const cells: { cell: HTMLTableCellElement; button: HTMLButtonElement; number: Element }[] = [];
  const days = new Map<HTMLButtonElement, number>();
  let focused = selected ?? Math.max(min, Math.min(max, today()));
  let disposed = false;
  if (!title.id) title.id = uniqueId(document, "njs-date-title");
  title.setAttribute("aria-live", "polite");
  title.setAttribute("aria-atomic", "true");
  grid.setAttribute("role", "grid");
  grid.setAttribute("aria-labelledby", title.id);
  authoredWeek.replaceWith(anchor);
  boundRoots.add(root);

  function active(): void {
    if (disposed) throw dateError("DATE_DISPOSED", "This DatePicker has been disposed.");
  }
  function focus(): void {
    active();
    for (const [button, day] of days) if (day === focused) { button.focus(); return; }
  }
  function render(moveFocus = false): void {
    const date = new Date(focused * DAY);
    const first = focused - date.getUTCDate() + 1;
    const start = first - (new Date(first * DAY).getUTCDay() - weekStartsOn + 7) % 7;
    const currentMonth = date.getUTCMonth();
    const currentToday = today();
    days.clear();
    for (const [index, { cell, button, number }] of cells.entries()) {
      const day = start + index;
      button.tabIndex = day === focused ? 0 : -1;
      button.disabled = day < min || day > max;
      cell.removeAttribute("aria-selected");
      button.removeAttribute("aria-current");
      button.removeAttribute("data-date-outside");
      if (day < FIRST || day > LAST) {
        number.textContent = "";
        button.removeAttribute("data-date-value");
        button.removeAttribute("aria-label");
        button.hidden = true;
        continue;
      }
      const value = new Date(day * DAY);
      number.textContent = String(value.getUTCDate());
      button.hidden = false;
      button.setAttribute("data-date-value", iso(day));
      button.setAttribute("aria-label", dayText.format(value));
      if (day === selected) cell.setAttribute("aria-selected", "true");
      if (day === currentToday) button.setAttribute("aria-current", "date");
      if (value.getUTCMonth() !== currentMonth) button.setAttribute("data-date-outside", "");
      days.set(button, day);
    }
    title.textContent = monthText.format(date);
    for (const [name, button] of controls) {
      button.disabled = name === "today" ? currentToday < min || currentToday > max :
        name === "prev" ? first <= min : moveMonth(first, 1) > max;
    }
    if (moveFocus) focus();
  }
  function move(day: number, moveFocus = true): void {
    focused = Math.max(min, Math.min(max, day));
    render(moveFocus);
  }
  function choose(day: number, event: Event): void {
    if (day < min || day > max) return;
    const changed = selected !== day;
    selected = day;
    focused = day;
    render(true);
    if (changed) options.onChange?.(iso(day), event);
  }
  function onClick(event: MouseEvent): void {
    const button = event.target instanceof Element ? event.target.closest("button") : null;
    if (!(button instanceof HTMLButtonElement) || button.disabled) return;
    const day = days.get(button);
    if (day !== undefined) return choose(day, event);
    for (const [name, control] of controls) {
      if (button !== control) continue;
      if (name === "today") choose(today(), event);
      else move(moveMonth(focused, name === "prev" ? -1 : 1), false);
      return;
    }
  }
  function onKeydown(event: KeyboardEvent): void {
    if (!(event.target instanceof HTMLButtonElement)) return;
    const day = days.get(event.target);
    if (day === undefined || event.altKey || event.ctrlKey || event.metaKey) return;
    const weekday = (new Date(day * DAY).getUTCDay() - weekStartsOn + 7) % 7;
    const next = event.key === "ArrowLeft" ? day - 1 : event.key === "ArrowRight" ? day + 1 :
      event.key === "ArrowUp" ? day - 7 : event.key === "ArrowDown" ? day + 7 :
      event.key === "Home" ? day - weekday : event.key === "End" ? day + 6 - weekday :
      event.key === "PageUp" ? moveMonth(day, event.shiftKey ? -12 : -1) :
      event.key === "PageDown" ? moveMonth(day, event.shiftKey ? 12 : 1) : null;
    if (next === null) return;
    event.preventDefault();
    move(next);
  }
  function onFocusIn(event: FocusEvent): void {
    if (!(event.target instanceof HTMLButtonElement)) return;
    const day = days.get(event.target);
    if (day === undefined || event.target.disabled) return;
    focused = day;
    for (const [button, value] of days) button.tabIndex = value === focused ? 0 : -1;
  }
  function dispose(): void {
    if (disposed) return;
    disposed = true;
    root.removeEventListener("click", onClick);
    root.removeEventListener("keydown", onKeydown);
    root.removeEventListener("focusin", onFocusIn);
    for (const week of weeks) week.remove();
    weeks.length = 0;
    cells.length = 0;
    days.clear();
    anchor.replaceWith(authoredWeek);
    title.replaceChildren(...titleNodes);
    for (const restoreOriginal of restore.reverse()) restoreOriginal();
    boundRoots.delete(root);
  }
  try {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 6; index++) {
      const week = authoredWeek.cloneNode(true) as HTMLTableRowElement;
      week.removeAttribute("data-date-week-template");
      for (const cell of week.cells) {
        const button = cell.querySelector<HTMLButtonElement>("[data-date-day]")!;
        cells.push({ cell, button, number: button.querySelector("[data-date-number]") ?? button });
      }
      weeks.push(week);
      fragment.append(week);
    }
    anchor.after(fragment);
    render();
    root.addEventListener("click", onClick);
    root.addEventListener("keydown", onKeydown);
    root.addEventListener("focusin", onFocusIn);
  } catch (cause) {
    dispose();
    throw cause;
  }
  return {
    value() { active(); return selected === null ? null : iso(selected); },
    setValue(value) {
      active();
      const next = checked(value);
      const wasFocused = grid.contains(document.activeElement);
      selected = next;
      focused = next ?? Math.max(min, Math.min(max, today()));
      render(wasFocused);
    },
    focus,
    dispose
  };
}
