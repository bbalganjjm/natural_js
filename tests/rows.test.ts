import { describe, expect, it, vi } from "vitest";
import { createRows } from "../src/data/index.js";
import type { RowsEvent } from "../src/data/index.js";

describe("createRows", () => {
  it("keeps row identity stable and exposes detached, immutable nested snapshots", () => {
    const input = [{ name: "Ada", options: [{ label: "First", value: 1 }] }];
    const rows = createRows(input);
    const first = rows.entries()[0];
    const id = first.id;

    expect(rows.entries()).toBe(rows.entries());
    expect(rows.get(id)).toBe(first);
    input[0].options[0].label = "external edit";
    expect(first.value.options[0].label).toBe("First");
    expect(Object.isFrozen(first.value.options[0])).toBe(true);
    expect(() => { (first.value.options[0] as { label: string }).label = "edit"; }).toThrow(TypeError);

    rows.set(id, "options", [{ label: "Second", value: 2 }]);
    expect(rows.get(id)?.status).toBe("update");
    expect(first.value.options[0].label).toBe("First");
    rows.set(id, "options", [{ label: "First", value: 1 }]);
    expect(rows.get(id)?.status).toBe("clean");
    expect(rows.changes()).toEqual([]);

    rows.replace(input);
    expect(rows.get(id)).toBeUndefined();
    expect(rows.entries()[0].id).toBeGreaterThan(id);
    rows.dispose();
  });

  it("tracks add, update, delete, and revert without adding metadata to business values", () => {
    const rows = createRows([{ name: "A", count: 1 }, { name: "B", count: 2 }]);
    const [first, second] = rows.entries();
    const listener = vi.fn();
    const unsubscribe = rows.subscribe(listener);

    rows.set(first.id, "count", 3);
    rows.set(first.id, "count", 3);
    const added = rows.add({ name: "C", count: 4 });
    rows.remove(second.id);
    rows.remove(added);

    expect(listener).toHaveBeenCalledTimes(4);
    expect(rows.entries().map((row) => row.id)).toEqual([first.id]);
    expect(rows.get(second.id)?.status).toBe("delete");
    expect(rows.changes()).toEqual([
      { id: first.id, status: "update", value: { name: "A", count: 3 } },
      { id: second.id, status: "delete", value: { name: "B", count: 2 } }
    ]);
    expect(Object.keys(rows.get(first.id)!.value)).toEqual(["name", "count"]);

    rows.revert(second.id);
    rows.revert();
    expect(rows.entries().map((row) => row.id)).toEqual([first.id, second.id]);
    expect(rows.changes()).toEqual([]);
    unsubscribe();
    rows.add({ name: "D", count: 5 });
    expect(listener).toHaveBeenCalledTimes(6);
    rows.dispose();
  });

  it("rejects non-JSON values without changing existing rows and releases listeners", () => {
    const rows = createRows([{ value: 1 }]);
    const id = rows.entries()[0].id;
    const cyclic: { self?: object } = {};
    cyclic.self = cyclic;

    expect(() => rows.replace([cyclic])).toThrow(/JSON-compatible/);
    expect(rows.get(id)?.value).toEqual({ value: 1 });
    expect(() => rows.add({ value: new Date() })).toThrow(/JSON-compatible/);

    const listener = vi.fn();
    rows.subscribe(listener);
    rows.dispose();
    rows.dispose();
    expect(() => rows.add({ value: 2 })).toThrow(/disposed/);
    expect(listener).not.toHaveBeenCalled();
  });
  it("stops notifying subscribers when one disposes the store", () => {
    const rows = createRows([{ value: 1 }]);
    const id = rows.entries()[0].id;
    const later = vi.fn();
    rows.subscribe(() => rows.dispose());
    rows.subscribe(later);
    rows.set(id, "value", 2);
    expect(later).not.toHaveBeenCalled();
  });
  it("reports operation IDs and clean revert without invalidating snapshots", () => {
    const rows = createRows([{ value: 1 }]);
    const id = rows.entries()[0].id;
    const entries = rows.entries();
    const changes = rows.changes();
    const events: RowsEvent[] = [];
    rows.subscribe(event => events.push(event));

    rows.revert(id);
    rows.revert();
    expect(rows.entries()).toBe(entries);
    expect(rows.changes()).toBe(changes);

    rows.set(id, "value", 2);
    rows.set(id, "value", 2);
    const added = rows.add({ value: 3 });
    rows.remove(added);
    rows.remove(id);
    rows.remove(id);
    rows.revert(id);
    rows.set(id, "value", 4);
    rows.revert();
    rows.replace([{ value: 5 }]);

    expect(events).toEqual([
      { type: "revert", id, changed: false },
      { type: "revert", changed: false },
      { type: "set", id, changed: true },
      { type: "add", id: added, changed: true },
      { type: "remove", id: added, changed: true },
      { type: "remove", id, changed: true },
      { type: "revert", id, changed: true },
      { type: "set", id, changed: true },
      { type: "revert", changed: true },
      { type: "replace", changed: true }
    ]);
    expect(events.every(Object.isFrozen)).toBe(true);
    rows.dispose();
  });

  it("delivers to remaining subscribers before propagating the first error", () => {
    const rows = createRows([{ value: 1 }]);
    const id = rows.entries()[0].id;
    const first = new Error("first subscriber failed");
    const later = vi.fn();
    rows.subscribe(() => { throw first; });
    rows.subscribe(() => { throw new Error("second subscriber failed"); });
    rows.subscribe(later);

    expect(() => rows.set(id, "value", 2)).toThrow(first);
    expect(later).toHaveBeenCalledExactlyOnceWith({ type: "set", id, changed: true });
    expect(rows.get(id)?.value.value).toBe(2);
    rows.dispose();
  });
});
