// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";
import { createGridHooks } from "../src/ui/grid-hooks.js";
import type { GridRowBinding } from "../src/ui/grid-hooks.js";
import type { RowSnapshot } from "../src/data/index.js";
import { FrameworkError } from "../src/internal/framework-error.js";

const row = (id = 1): RowSnapshot<{ name: string }> => Object.freeze({ id,
  value: Object.freeze({ name: `Row ${id}` }), status: "clean" });
const check = () => {};
const elements = [{} as HTMLTableRowElement];

describe("Grid row hook ownership", () => {
  it("keeps disabled hooks empty and rejects invalid callback declarations before binding", () => {
    const hooks = createGridHooks({}, () => { throw new Error("Unexpected cleanup"); });
    expect(hooks.enabled).toBe(false);
    hooks.before(row(), elements, () => { throw new Error("Unexpected checkpoint"); });
    hooks.after(1, check); hooks.release(1); hooks.dispose();
    expect(hooks.running).toBe(false);
    for (const phase of ["beforeRowBind", "onRowBind"]) {
      expect(() => createGridHooks({ [phase]: null } as never, check)).toThrow(expect.objectContaining({
        api: "bindGrid", code: "GRID_BIND", detail: { phase }
      }));
    }
  });

  it("shares one context, freezes the row-element list, checkpoints and cleans each binding in reverse order", () => {
    const events: string[] = [];
    const contexts: GridRowBinding<{ name: string }>[] = [];
    const source = [...elements];
    const hooks = createGridHooks<{ name: string }>({
      beforeRowBind(context) {
        expect(hooks.running).toBe(true); contexts.push(context); events.push("before");
        context.own(() => { expect(hooks.running).toBe(true); events.push("first cleanup"); });
      },
      onRowBind(context) {
        expect(context).toBe(contexts.at(-1)); events.push("after");
        context.own(() => events.push("second cleanup"));
        return false;
      }
    }, check);
    hooks.before(row(), source, () => events.push("before checkpoint"));
    source.push({} as HTMLTableRowElement);
    expect(contexts[0].elements).toHaveLength(1);
    expect(Object.isFrozen(contexts[0].elements)).toBe(true);
    expect(() => Object.assign(contexts[0], { row: row(2) })).toThrow(TypeError);
    hooks.after(1, () => events.push("after checkpoint"));
    hooks.before(row(), source, check);
    hooks.release(1); hooks.release(1); hooks.dispose();
    expect(events).toEqual(["before", "before checkpoint", "after", "after checkpoint",
      "second cleanup", "first cleanup", "before", "first cleanup"]);
    expect(hooks.running).toBe(false);
  });

  it("wraps callback failures, releases registered resources and allows a fresh binding", () => {
    const original = new Error("Failed widget");
    const events: string[] = [];
    let fail = true;
    const hooks = createGridHooks({ beforeRowBind(context) {
      context.own(() => events.push("cleanup"));
      if (fail) throw original;
    } }, check);
    expect(() => hooks.before(row(), elements, check)).toThrow(expect.objectContaining({
      api: "bindGrid", code: "GRID_BIND", cause: original, detail: { phase: "beforeRowBind", id: 1 }
    }));
    fail = false; hooks.before(row(), elements, check); hooks.after(1, check); hooks.release(1);
    expect(events).toEqual(["cleanup", "cleanup"]);
    expect(hooks.running).toBe(false);
  });

  it("preserves checkpoint failures and closes resources registered before and after placement", () => {
    const stale = new FrameworkError({ api: "bindGrid", code: "GRID_BIND_STALE", message: "Changed during callback." });
    const cleaned: string[] = [];
    const hooks = createGridHooks({
      beforeRowBind(context) { context.own(() => cleaned.push("before")); },
      onRowBind(context) { context.own(() => cleaned.push("after")); }
    }, check);
    expect(() => hooks.before(row(), elements, () => { throw stale; })).toThrow(stale);
    hooks.before(row(), elements, check);
    expect(() => hooks.after(1, () => { throw stale; })).toThrow(stale);
    hooks.dispose();
    expect(cleaned).toEqual(["before", "after", "before"]);
    expect(hooks.running).toBe(false);
  });

  it("preserves Grid guard errors and checks cleanup effects before delivering the next row snapshot", () => {
    for (const code of ["GRID_BIND_REENTRANT", "GRID_BIND_STALE", "GRID_DISPOSED"]) {
      const guard = new FrameworkError({ api: "bindGrid", code, message: "Stopped by the Grid guard." });
      const hooks = createGridHooks({ beforeRowBind() { throw guard; } }, check);
      expect(() => hooks.before(row(), elements, check)).toThrow(guard);
    }
    const stale = new FrameworkError({ api: "bindGrid", code: "GRID_BIND_STALE", message: "Changed during cleanup." });
    let changed = false;
    let calls = 0;
    const hooks = createGridHooks({ beforeRowBind(context) {
      calls++; context.own(() => { changed = true; });
    } }, check);
    hooks.before(row(), elements, check);
    expect(() => hooks.before(row(), elements, () => { if (changed) throw stale; })).toThrow(stale);
    expect(calls).toBe(1);
    hooks.dispose();
  });

  it("rejects and consumes asynchronous before/after results and closes late resources", async () => {
    for (const phase of ["beforeRowBind", "onRowBind"] as const) {
      let cleaned = 0;
      const callback = async (context: GridRowBinding<unknown>) => {
        context.own(() => { cleaned++; });
        await Promise.resolve();
        context.own(() => { cleaned++; });
      };
      const hooks = createGridHooks({ [phase]: callback }, check);
      if (phase === "onRowBind") hooks.before(row(), elements, check);
      expect(() => phase === "beforeRowBind" ? hooks.before(row(), elements, check) : hooks.after(1, check))
        .toThrow(expect.objectContaining({ code: "GRID_BIND", detail: { phase, id: 1 } }));
      await Promise.resolve(); await Promise.resolve();
      hooks.dispose(); expect(cleaned).toBe(2); expect(hooks.running).toBe(false);
    }
  });

  it("cleans late own immediately without closing a newer binding with the same row ID", () => {
    const contexts: GridRowBinding<unknown>[] = [];
    const hooks = createGridHooks({ beforeRowBind(context) { contexts.push(context); } }, check);
    hooks.before(row(), elements, check); hooks.before(row(), elements, check);
    let cleaned = 0;
    expect(() => contexts[0].own(() => { cleaned++; expect(hooks.running).toBe(true); }))
      .toThrow(expect.objectContaining({ code: "GRID_BIND", detail: { phase: "own", id: 1 } }));
    contexts[1].own(() => { cleaned++; }); hooks.release(1);
    expect(cleaned).toBe(2);
    expect(() => contexts[1].own(null as never)).toThrow(expect.objectContaining({ code: "GRID_BIND", detail: { phase: "own", id: 1 } }));
  });

  it("reports cleanup failures while releasing the remaining rows and disposers exactly once", () => {
    const cleanupError = new Error("Widget cleanup");
    const events: number[] = [];
    const reported: unknown[] = [];
    const hooks = createGridHooks({ beforeRowBind(context) {
      const id = context.row.id;
      context.own(() => events.push(id));
      context.own(() => { if (id === 2) throw cleanupError; });
    } }, cause => { expect(hooks.running).toBe(true); reported.push(cause); });
    hooks.before(row(1), elements, check); hooks.before(row(2), elements, check);
    hooks.dispose(); hooks.dispose();
    expect(events).toEqual([2, 1]);
    expect(reported).toEqual([expect.objectContaining({ code: "GRID_BIND", cause: cleanupError, detail: { phase: "cleanup", id: 2 } })]);
    expect(hooks.running).toBe(false);
    expect(() => hooks.before(row(), elements, check)).toThrow(expect.objectContaining({ code: "GRID_BIND" }));
  });

  it("finishes cleanup when the reporter throws and reports unsupported asynchronous cleanup", async () => {
    const reporterError = new Error("Reporter failed");
    const events: number[] = [];
    const hooks = createGridHooks({ beforeRowBind(context) {
      const id = context.row.id;
      context.own(() => events.push(id));
      context.own(() => { throw new Error("Cleanup failed"); });
    } }, () => { throw reporterError; });
    hooks.before(row(1), elements, check); hooks.before(row(2), elements, check);
    expect(() => hooks.dispose()).toThrow(reporterError); hooks.dispose();
    expect(events).toEqual([2, 1]); expect(hooks.running).toBe(false);

    const reported: unknown[] = [];
    const asyncHooks = createGridHooks({ beforeRowBind(context) {
      context.own(async () => { throw new Error("Async cleanup"); });
    } }, cause => reported.push(cause));
    asyncHooks.before(row(), elements, check); asyncHooks.release(1);
    await Promise.resolve(); await Promise.resolve();
    expect(reported).toEqual([expect.objectContaining({ code: "GRID_BIND", detail: { phase: "cleanup", id: 1 } })]);
    expect(asyncHooks.running).toBe(false);
  });
});
