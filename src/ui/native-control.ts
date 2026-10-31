// SPDX-License-Identifier: Apache-2.0
type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type Field = { element: HTMLElement; elements: readonly HTMLElement[]; kind: "single" | "radio" | "checkbox" | "multiple" };

export const interactiveContent = "button, input, textarea, select, a[href], area[href], details, dialog, audio[controls], video[controls], iframe, object, embed, img[usemap], [tabindex], [contenteditable]";

export function control(element: HTMLElement): element is Control {
  return element.localName === "input" || element.localName === "select" || element.localName === "textarea";
}

export function disabled(element: HTMLElement, root: HTMLElement): boolean {
  if (element.matches(":disabled")) return true;
  if (element.isConnected || !control(element)) return false;
  for (let parent = root.parentElement; parent; parent = parent.parentElement) {
    if (!(parent instanceof HTMLFieldSetElement) || !parent.disabled) continue;
    const legend = [...parent.children].find(child => child.tagName === "LEGEND");
    if (!legend?.contains(root)) return true;
  }
  return false;
}

export function formatCapable(element: HTMLElement): boolean {
  if (element.localName === "select") return false;
  return element.localName !== "input" || textLengthControl(element as HTMLInputElement);
}

export function textLengthControl(element: Control): element is HTMLInputElement | HTMLTextAreaElement {
  return element.localName === "textarea" || element.localName === "input" &&
    ["text", "search", "tel", "url", "email", "password"].includes((element as HTMLInputElement).type);
}

export function inputValue(element: HTMLElement): unknown {
  if (!control(element)) return element.localName === "img" ? element.getAttribute("src") ?? "" : element.textContent ?? "";
  if (element.localName === "input") {
    const input = element as HTMLInputElement;
    if (input.type === "checkbox") return input.checked;
    if (input.type === "file") return input.files?.[0]?.name ?? "";
  }
  return element.value;
}

export function fieldValue(field: Field): unknown {
  if (field.kind === "radio") {
    const selected = field.elements.find(element => (element as HTMLInputElement).checked);
    return selected ? (selected as HTMLInputElement).value : null;
  }
  if (field.kind === "checkbox" && field.elements.length > 1) {
    return field.elements.filter(element => (element as HTMLInputElement).checked)
      .map(element => (element as HTMLInputElement).value);
  }
  if (field.kind === "multiple") return [...(field.element as HTMLSelectElement).selectedOptions].map(option => option.value);
  return inputValue(field.element);
}

export function display(element: HTMLElement, value: unknown): void {
  if (element.localName === "img") {
    if (value == null || value === "") element.removeAttribute("src");
    else element.setAttribute("src", String(value));
  } else if (!control(element)) {
    element.textContent = value == null ? "" : String(value);
  } else if (element.localName === "input" && (element as HTMLInputElement).type === "checkbox") {
    (element as HTMLInputElement).checked = value === true;
  } else if (element.localName === "select" && (element as HTMLSelectElement).multiple) {
    const selected = new Set(Array.isArray(value) ? value.map(String) : []);
    for (const option of (element as HTMLSelectElement).options) option.selected = selected.has(option.value);
  } else {
    element.value = value == null ? "" : String(value);
  }
}

export function displayField(field: Field, value: unknown): void {
  if (field.kind === "radio") {
    const selected = value == null ? null : String(value);
    for (const element of field.elements) {
      const input = element as HTMLInputElement;
      input.checked = selected !== null && input.value === selected;
    }
  } else if (field.kind === "checkbox" && field.elements.length > 1) {
    const selected = new Set(Array.isArray(value) ? value.map(String) : []);
    for (const element of field.elements) {
      const input = element as HTMLInputElement;
      input.checked = selected.has(input.value);
    }
  } else display(field.element, value);
}

/** The binder supplies the entered value and a native probe with effective disabled state. */
export function nativeMessage(probe: Control, entered: unknown, validate = true): string | null {
  if (!probe.willValidate) return null;
  const text = String(entered ?? "");
  if (probe.localName === "input") {
    const input = probe as HTMLInputElement;
    const scalar = ["number", "range"].includes(input.type);
    const altered = scalar ? text.trim() === "" || !Number.isFinite(Number(text)) || Number(text) !== Number(input.value) :
      input.type === "color" ? text.toLowerCase() !== input.value.toLowerCase() :
        ["date", "datetime-local", "time", "month", "week"].includes(input.type) && text !== "" && input.value === "";
    if (altered && (input.type === "range" || input.type === "color" || text !== "")) return "Use a value allowed by this input.";
  }
  if (!validate) return null;
  if (textLengthControl(probe)) {
    if (probe.minLength >= 0 && text.length > 0 && text.length < probe.minLength) return `Use at least ${probe.minLength} characters.`;
    if (probe.maxLength >= 0 && text.length > probe.maxLength) return `Use at most ${probe.maxLength} characters.`;
  }
  return probe.validity.valid ? null : probe.validationMessage || "Invalid input.";
}
