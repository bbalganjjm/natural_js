// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import { focusVisible, restoreAttributes, uniqueId } from "./dom-state.js";

export interface GridHeightOptions {
  readonly root: HTMLElement;
  readonly handle: HTMLButtonElement;
  readonly min: number;
  readonly max: number;
}

const roots = new WeakSet<HTMLElement>();
const handles = new WeakSet<HTMLButtonElement>();
const properties = ["height", "min-height", "max-height"] as const;

function fail(message: string): never {
  throw new FrameworkError({ api: "bindGrid", code: "GRID_HEIGHT", message });
}

export function validateGridHeight(table: HTMLTableElement, options: GridHeightOptions, viewportRoot?: HTMLElement): void {
  const document = table.ownerDocument;
  const view = document.defaultView;
  const { root, handle, min, max } = options ?? {};
  if (!view || !(root instanceof view.HTMLElement) || root === table || root.ownerDocument !== document || !root.contains(table) ||
      !(handle instanceof view.HTMLButtonElement) || handle.ownerDocument !== document || handle.type !== "button" || table.contains(handle) ||
      viewportRoot && root !== viewportRoot || !Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || min > max) {
    fail("Height resize needs an ancestor root, an external type=button handle and positive finite min/max pixel bounds.");
  }
  if (!handle.getAttribute("aria-label")?.trim() && !handle.getAttribute("aria-labelledby")?.trim()) {
    fail("The height handle needs an authored aria-label or aria-labelledby.");
  }
  if (roots.has(root) || handles.has(handle)) fail("The height root or handle already has an owner.");
  if (root.id && [...document.querySelectorAll("[id]")].some(element => element !== root && element.id === root.id)) {
    fail("The height root DOM id must be unique.");
  }
}

export function bindGridHeight(table: HTMLTableElement, options: GridHeightOptions) {
  validateGridHeight(table, options);
  const { root, handle, min, max } = options;
  const document = root.ownerDocument;
  const view = document.defaultView!;
  const originalId = root.getAttribute("id");
  const restoreHandle = restoreAttributes(handle, ["role", "aria-controls", "aria-orientation", "aria-valuemin", "aria-valuemax",
    "aria-valuenow", "aria-valuetext", "aria-keyshortcuts", "style"]);
  function capture(): () => void {
    const values = properties.map(name => [name, root.style.getPropertyValue(name), root.style.getPropertyPriority(name)] as const);
    const hadStyle = root.hasAttribute("style");
    return () => {
      for (const [name, value, priority] of values) {
        if (value) root.style.setProperty(name, value, priority);
        else root.style.removeProperty(name);
      }
      if (!hadStyle && !root.getAttribute("style")) root.removeAttribute("style");
    };
  }
  const restoreRoot = capture();
  let disposed = false;
  let restoreInert: (() => void) | undefined;
  let drag: { pointer: number; start: number; height: number; pending: number; restore: () => void; frame?: number } | undefined;

  function available(): boolean {
    return !disposed && !handle.matches(":disabled") && !handle.closest("[hidden], [inert]") &&
      !root.closest("[hidden], [inert]") && handle.getClientRects().length > 0 && root.getBoundingClientRect().height > 0 &&
      view.getComputedStyle(handle).visibility === "visible" && view.getComputedStyle(root).visibility === "visible";
  }
  function announce(): void {
    if (disposed) return;
    const height = root.getBoundingClientRect().height;
    handle.setAttribute("aria-valuemin", String(height > 0 ? Math.min(min, height) : min));
    handle.setAttribute("aria-valuemax", String(height > 0 ? Math.max(max, height) : max));
    if (height > 0) {
      releaseInert();
      handle.setAttribute("aria-valuenow", String(height));
      handle.setAttribute("aria-valuetext", `${Math.round(height)}px`);
    } else {
      if (!handle.inert) {
        restoreInert ??= restoreAttributes(handle, ["inert"]);
        handle.inert = true;
      }
      handle.removeAttribute("aria-valuenow");
      handle.removeAttribute("aria-valuetext");
    }
  }
  function releaseInert(): void {
    if (restoreInert && handle.getAttribute("inert") === "") restoreInert();
    restoreInert = undefined;
  }
  function apply(height: number): void {
    const style = view.getComputedStyle(root);
    const inset = style.boxSizing === "border-box" ? 0 : [style.paddingTop, style.paddingBottom, style.borderTopWidth, style.borderBottomWidth]
      .reduce((sum, value) => sum + (Number.parseFloat(value) || 0), 0);
    root.style.setProperty("height", `${Math.max(0, Math.min(max, Math.max(min, height)) - inset)}px`, root.style.getPropertyPriority("height"));
    root.style.setProperty("min-height", `${Math.max(0, min - inset)}px`, root.style.getPropertyPriority("min-height"));
    root.style.setProperty("max-height", `${Math.max(0, max - inset)}px`, root.style.getPropertyPriority("max-height"));
    announce();
  }
  function release(): typeof drag {
    const current = drag;
    drag = undefined;
    if (current?.frame !== undefined) view.cancelAnimationFrame(current.frame);
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerup", onUp);
    document.removeEventListener("pointercancel", onCancel);
    document.removeEventListener("keydown", onEscape);
    handle.removeEventListener("lostpointercapture", onCancel);
    if (current) {
      try { if (handle.hasPointerCapture(current.pointer)) handle.releasePointerCapture(current.pointer); } catch { /* Capture may already be released. */ }
    }
    return current;
  }
  function cancel(): void {
    release()?.restore();
    announce();
  }
  function onCancel(event: PointerEvent): void {
    if (event.pointerId === drag?.pointer) cancel();
  }
  function onEscape(event: KeyboardEvent): void {
    if (event.key === "Escape" && drag) { event.preventDefault(); cancel(); }
  }
  function onMove(event: PointerEvent): void {
    const current = drag;
    if (!current || event.pointerId !== current.pointer) return;
    if (!available() || event.pointerType === "mouse" && !(event.buttons & 1)) { cancel(); return; }
    current.pending = current.height + event.clientY - current.start;
    if (current.frame === undefined) current.frame = view.requestAnimationFrame(() => {
      if (drag !== current) return;
      current.frame = undefined;
      if (available()) apply(current.pending);
      else cancel();
    });
    event.preventDefault();
  }
  function onUp(event: PointerEvent): void {
    if (!drag || event.pointerId !== drag.pointer) return;
    if (!available()) { cancel(); return; }
    const current = release()!;
    const height = current.height + event.clientY - current.start;
    if (height === current.height) { current.restore(); announce(); }
    else apply(height);
  }
  function onDown(event: PointerEvent): void {
    if (drag || event.defaultPrevented || event.button !== 0 || !event.isPrimary || !available()) return;
    cancel();
    const height = root.getBoundingClientRect().height;
    drag = { pointer: event.pointerId, start: event.clientY, height, pending: height, restore: capture() };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onCancel);
    document.addEventListener("keydown", onEscape);
    handle.addEventListener("lostpointercapture", onCancel);
    try { handle.setPointerCapture(event.pointerId); } catch { /* Document listeners also support synthetic pointer events. */ }
    focusVisible(handle);
    event.preventDefault();
  }
  function onKey(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || !available() ||
        !["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    cancel();
    const height = event.key === "Home" ? min : event.key === "End" ? max :
      root.getBoundingClientRect().height + (event.key === "ArrowUp" ? -1 : 1) * (event.shiftKey ? 1 : 10);
    apply(height);
  }
  const observer = new view.ResizeObserver(announce);
  if (!root.id) root.id = uniqueId(document, "njs-grid-height");
  handle.setAttribute("role", "separator");
  handle.setAttribute("aria-controls", root.id);
  handle.setAttribute("aria-orientation", "horizontal");
  handle.setAttribute("aria-valuemin", String(min));
  handle.setAttribute("aria-valuemax", String(max));
  handle.setAttribute("aria-keyshortcuts", "ArrowUp ArrowDown Shift+ArrowUp Shift+ArrowDown Home End");
  handle.style.touchAction = "none";
  handle.style.userSelect = "none";
  roots.add(root);
  handles.add(handle);
  handle.addEventListener("pointerdown", onDown);
  handle.addEventListener("keydown", onKey);
  observer.observe(root);
  announce();
  return {
    dispose(): void {
      if (disposed) return;
      release();
      disposed = true;
      observer.disconnect();
      handle.removeEventListener("pointerdown", onDown);
      handle.removeEventListener("keydown", onKey);
      restoreRoot();
      releaseInert();
      restoreHandle();
      if (originalId === null) root.removeAttribute("id");
      else root.setAttribute("id", originalId);
      roots.delete(root);
      handles.delete(handle);
    }
  };
}
