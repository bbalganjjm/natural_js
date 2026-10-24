// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import type { RowId, RowSnapshot } from "../data/index.js";

export interface GridRowBinding<T> {
  readonly row: RowSnapshot<T>;
  readonly elements: readonly HTMLTableRowElement[];
  own(dispose: () => void): void;
}

function failure(phase: string, message: string, id?: RowId, cause?: unknown): FrameworkError {
  if (cause instanceof FrameworkError && cause.api === "bindGrid") return cause;
  return new FrameworkError({ api: "bindGrid", code: "GRID_BIND",
    message,
    detail: { phase, ...(id === undefined ? {} : { id }) }, cause });
}

function synchronous(result: unknown): void {
  if (result !== null && (typeof result === "object" || typeof result === "function") &&
      typeof (result as { then?: unknown }).then === "function") {
    void Promise.resolve(result).catch(() => {});
    throw new TypeError("Row binding callbacks and cleanup must finish synchronously.");
  }
}

/** Own only the resources registered by the current binding of each mounted row. */
export function createGridHooks<T>(options: {
  beforeRowBind?: (context: GridRowBinding<T>) => void;
  onRowBind?: (context: GridRowBinding<T>) => void;
}, onCleanupError: (cause: unknown) => void) {
  for (const phase of ["beforeRowBind", "onRowBind"] as const) {
    if (options[phase] !== undefined && typeof options[phase] !== "function") throw failure(phase, `${phase} must be a function.`);
  }
  const enabled = options.beforeRowBind !== undefined || options.onRowBind !== undefined;
  type Binding = { context: GridRowBinding<T>; owned: (() => void)[]; closed: boolean };
  const bindings = new Map<RowId, Binding>();
  let depth = 0;
  let disposed = false;

  function close(binding: Binding): void {
    if (binding.closed) return;
    binding.closed = true;
    const id = binding.context.row.id;
    if (bindings.get(id) === binding) bindings.delete(id);
    let failed = false;
    let first: unknown;
    depth++;
    try {
      for (const dispose of binding.owned.reverse()) {
        try { synchronous(dispose()); }
        catch (cause) {
          try { onCleanupError(failure("cleanup", "Row binding cleanup failed.", id, cause)); }
          catch (reported) { if (!failed) { failed = true; first = reported; } }
        }
      }
      binding.owned.length = 0;
    } finally { depth--; }
    if (failed) throw first;
  }

  function invoke(binding: Binding, phase: "beforeRowBind" | "onRowBind", check: () => void): void {
    depth++;
    try {
      try { synchronous(options[phase]?.(binding.context)); }
      catch (cause) { throw failure(phase, `${phase} failed.`, binding.context.row.id, cause); }
      check();
    } catch (cause) {
      try { close(binding); } catch { /* The callback/checkpoint failure remains primary. */ }
      throw cause;
    } finally { depth--; }
  }

  function release(id: RowId): void {
    const binding = bindings.get(id);
    if (binding) close(binding);
  }

  return {
    enabled,
    get running(): boolean { return depth > 0; },
    before(row: RowSnapshot<T>, elements: readonly HTMLTableRowElement[], check: () => void): void {
      if (!enabled) return;
      if (disposed) throw failure("beforeRowBind", "This row binding owner has been disposed.", row.id);
      if (bindings.has(row.id)) { release(row.id); check(); }
      const binding: Binding = {
        owned: [], closed: false,
        context: Object.freeze({
          row, elements: Object.freeze([...elements]),
          own(dispose: () => void) {
            if (typeof dispose !== "function") throw failure("own", "own requires a synchronous cleanup function.", row.id);
            if (!binding.closed) { binding.owned.push(dispose); return; }
            depth++;
            try {
              try { synchronous(dispose()); }
              catch (cause) { onCleanupError(failure("cleanup", "Row binding cleanup failed.", row.id, cause)); }
            } finally { depth--; }
            throw failure("own", "This row binding has been released; its new resource was disposed.", row.id);
          }
        })
      };
      bindings.set(row.id, binding);
      invoke(binding, "beforeRowBind", check);
    },
    after(id: RowId, check: () => void): void {
      if (!enabled) return;
      const binding = bindings.get(id);
      if (!binding || disposed) throw failure("onRowBind", "This row binding is not active.", id);
      invoke(binding, "onRowBind", check);
    },
    release,
    dispose(): void {
      if (disposed) return;
      disposed = true;
      let failed = false;
      let first: unknown;
      for (const id of [...bindings.keys()].reverse()) {
        try { release(id); }
        catch (cause) { if (!failed) { failed = true; first = cause; } }
      }
      if (failed) throw first;
    }
  };
}
