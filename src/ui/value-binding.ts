// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import { sameJson } from "../internal/same-json.js";
import { arrayField, control, display, nativeMessage } from "./native-control.js";
import { checkGroupValue } from "./choice-group-owner.js";
import type { ChoiceGroupBinding } from "./choice-group-owner.js";
import { rowOptionAvailable } from "./row-options.js";
import type { RowId } from "../data/index.js";
import type { SourceBindContext, ValueBindContext } from "./index.js";

export type ValueCallback = "beforeBindValue" | "onBindValue";
export interface ValueProjection {
  id: RowId;
  raw: unknown;
  value: unknown;
  phase: ValueBindContext["phase"];
  state: "pending" | "applied" | "failed";
  callback?: ValueCallback;
}
interface Field {
  element: HTMLElement;
  elements: readonly HTMLElement[];
  kind: "single" | "radio" | "checkbox" | "multiple";
  group?: ChoiceGroupBinding;
}

/** Binders retain their field graph, projection slots and lifetime checkpoints. */
export function createValueBinding<T extends object>(api: "bindForm" | "bindGrid" | "bindList", options: {
  beforeBindValue?: (value: unknown, context: ValueBindContext) => unknown;
  onBindValue?: (value: unknown, context: ValueBindContext) => unknown;
  beforeSourceBind?: (value: unknown, context: SourceBindContext<T>) => unknown;
  onSourceBind?: (value: unknown, context: SourceBindContext<T>) => unknown;
}) {
  const { beforeBindValue, onBindValue, beforeSourceBind, onSourceBind } = options;
  const prefix = api.slice(4).toUpperCase();
  if (beforeBindValue !== undefined && typeof beforeBindValue !== "function" ||
      onBindValue !== undefined && typeof onBindValue !== "function") {
    throw new FrameworkError({ api, code: `${prefix}_VALUE_OPTIONS`, message: "Value callbacks must be synchronous functions." });
  }
  if (beforeSourceBind !== undefined && typeof beforeSourceBind !== "function" ||
      onSourceBind !== undefined && typeof onSourceBind !== "function") {
    throw new FrameworkError({ api, code: `${prefix}_SOURCE_OPTIONS`, message: "Source callbacks must be synchronous functions." });
  }
  let depth = 0;
  let sourceDepth = 0;
  let activeSources: Map<RowId, Set<string>> | undefined;
  function sourceError(context: SourceBindContext<T>, callback: "beforeSourceBind" | "onSourceBind",
    message: string, cause?: unknown): FrameworkError {
    if (cause instanceof FrameworkError && cause.api === api) return cause;
    return new FrameworkError({ api, code: `${prefix}_SOURCE`, message, cause,
      detail: { key: context.key, rowId: context.row.id, phase: context.phase, callback } });
  }
  function invokeSource(callback: "beforeSourceBind" | "onSourceBind", value: unknown,
    context: SourceBindContext<T>, current: () => boolean): boolean {
    const run = callback === "beforeSourceBind" ? beforeSourceBind : onSourceBind;
    let failed = false, failure: unknown;
    try {
      const result = run?.(value, context);
      if (result !== null && (typeof result === "object" || typeof result === "function") &&
          typeof (result as { then?: unknown }).then === "function") {
        void Promise.resolve(result).catch(() => {});
        throw new TypeError("Source callbacks must finish synchronously.");
      }
    } catch (cause) { failed = true; failure = cause; }
    const live = current();
    if (failed && failure instanceof FrameworkError && failure.api === api) throw failure;
    if (!live) return false;
    if (failed) throw sourceError(context, callback, "The source callback failed.", failure);
    return true;
  }
  function error(context: ValueBindContext, callback: ValueCallback, message: string, cause?: unknown): FrameworkError {
    return new FrameworkError({ api, code: `${prefix}_VALUE`, message, cause,
      detail: { field: context.field, rowId: context.rowId, phase: context.phase, callback } });
  }
  function replacement(field: Field, value: unknown, context: ValueBindContext, callback: ValueCallback,
    available?: () => readonly unknown[], copy = true): unknown {
    const scalar = (item: unknown) => item === null || typeof item === "string" || typeof item === "boolean" ||
      typeof item === "number" && Number.isFinite(item);
    const array = arrayField(field);
    let selected: unknown[] | undefined;
    if (array && Array.isArray(value)) {
      try { selected = copy ? Array.from(value) : value; }
      catch (cause) { throw error(context, callback, "The value replacement could not be read.", cause); }
    }
    if (array ? !selected || !selected.every(scalar) : !scalar(value) ||
        field.kind === "checkbox" && typeof value !== "boolean") {
      throw error(context, callback, api === "bindList"
        ? "Return a native scalar value or a scalar array for a multiple-value control; project structured data to text."
        : "Return a native scalar value or a scalar array for a multiple-value control; use render for structured display.");
    }
    const projected = selected ?? value;
    if (field.group) {
      const message = checkGroupValue(field.group, projected);
      if (message) throw error(context, callback, message);
    }
    if (available && !rowOptionAvailable(available(), projected, array)) {
      throw error(context, callback, "A projected choice needs available raw option occurrences.");
    }
    if (!array && field.kind === "single" && control(field.element)) {
      const probe = field.element.cloneNode(true) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      probe.disabled = false;
      if (probe instanceof HTMLInputElement || probe instanceof HTMLTextAreaElement) probe.readOnly = false;
      display(probe, projected);
      const message = nativeMessage(probe, projected, false);
      if (message) throw error(context, callback, message);
    }
    return selected && copy ? Object.freeze(selected) : projected;
  }
  function invoke(callback: ValueCallback, value: unknown, context: ValueBindContext, current: () => boolean): unknown {
    const run = callback === "beforeBindValue" ? beforeBindValue : onBindValue;
    if (!run) return undefined;
    try {
      const result = run(value, context);
      if (result !== null && (typeof result === "object" || typeof result === "function") &&
          typeof (result as { then?: unknown }).then === "function") {
        void Promise.resolve(result).catch(() => {});
        if (current()) throw error(context, callback, "Value callbacks must finish synchronously.");
        return undefined;
      }
      return result;
    } catch (cause) { throw error(context, callback, "The value callback failed.", cause); }
  }
  return {
    enabled: beforeBindValue !== undefined || onBindValue !== undefined,
    get running() { return depth > 0; },
    sourceEnabled: beforeSourceBind !== undefined || onSourceBind !== undefined,
    get sourceRunning() { return sourceDepth > 0; },
    source(context: SourceBindContext<T>, write: () => void, current: () => boolean): void {
      if (!current()) return;
      const { id } = context.row;
      activeSources ??= new Map();
      let keys = activeSources.get(id);
      if (keys?.has(context.key)) throw sourceError(context,
        beforeSourceBind ? "beforeSourceBind" : "onSourceBind", "A source callback cannot recursively bind the same key and row.");
      if (!keys) { keys = new Set(); activeSources.set(id, keys); }
      keys.add(context.key);
      sourceDepth++;
      try {
        const value = (context.row.value as Readonly<Record<string, unknown>>)[context.key];
        if (!invokeSource("beforeSourceBind", value, context, current)) return;
        write();
        if (!current()) return;
        invokeSource("onSourceBind", value, context, current);
      } finally {
        sourceDepth--;
        keys.delete(context.key);
        if (!keys.size) activeSources.delete(id);
      }
    },
    error,
    apply(slot: { projection?: ValueProjection }, field: Field, raw: unknown, context: ValueBindContext,
      write: (value: unknown) => void, current: () => boolean, available?: () => readonly unknown[]): void {
      const projection = slot.projection!;
      if (projection.state === "failed") return;
      depth++;
      try {
        if (projection.state === "applied") {
          try {
            const value = projection.callback ? replacement(field, projection.value, context, projection.callback, available, false) : raw;
            if (current()) write(value);
          } catch (cause) {
            if (cause instanceof FrameworkError && cause.code === `${prefix}_VALUE` && slot.projection === projection) projection.state = "failed";
            throw cause;
          }
          return;
        }
        try {
          let value = raw, callback: ValueCallback | undefined;
          const before = invoke("beforeBindValue", value, context, current);
          if (!current()) return;
          if (before !== undefined) { value = replacement(field, before, context, "beforeBindValue", available); callback = "beforeBindValue"; }
          if (!current()) return;
          write(value);
          if (!current()) return;
          const after = invoke("onBindValue", value, context, current);
          if (!current()) return;
          if (after !== undefined) {
            const final = replacement(field, after, context, "onBindValue", available);
            if (!current()) return;
            if (!sameJson(value, final)) write(final);
            value = final;
            callback = "onBindValue";
          }
          if (current()) slot.projection = { id: context.rowId, raw, value, phase: projection.phase, state: "applied", callback };
        } catch (cause) {
          if (slot.projection === projection) projection.state = "failed";
          throw cause;
        }
      } finally { depth--; }
    }
  };
}
