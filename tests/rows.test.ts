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

  it("validates every batch target and JSON patch before changing any row", () => {
    const rows = createRows([{ value: 1 }, { value: 2 }]);
    const [first, second] = rows.entries();
    const entries = rows.entries();
    const changes = rows.changes();
    const listener = vi.fn();
    rows.subscribe(listener);
    const cyclic: { self?: object } = {};
    cyclic.self = cyclic;
    const invalid = [undefined, NaN, Infinity, new Date(), () => {}, 1n, cyclic,
      { [Symbol("hidden")]: 1 }, new Array(1)];

    for (const value of invalid) {
      expect(() => rows.setMany([
        { id: first.id, values: { value: 10 } },
        { id: second.id, values: { value } as never }
      ])).toThrow(/JSON-compatible|symbol keys/);
    }
    expect(() => rows.setMany([
      { id: first.id, values: { value: 10 } }, { id: 999, values: { value: 20 } }
    ])).toThrow(/row ID/);
    for (const values of [null, [], new Date(), 4]) {
      expect(() => rows.setMany([
        { id: first.id, values: { value: 10 } }, { id: second.id, values: values as never }
      ])).toThrow(/JSON-compatible object/);
    }
    expect(() => rows.setMany(null as never)).toThrow(/array/);
    expect(() => rows.setMany([null] as never)).toThrow(/ID and a values object/);
    expect(rows.entries()).toBe(entries);
    expect(rows.changes()).toBe(changes);
    expect(rows.get(first.id)).toBe(first);
    expect(rows.get(second.id)).toBe(second);
    expect(listener).not.toHaveBeenCalled();
    rows.dispose();
  });

  it("merges duplicate batch IDs in input order and preserves net no-op snapshots", () => {
    const rows = createRows([{ name: "A", value: 1 }, { name: "B", value: 2 }]);
    const [first, second] = rows.entries();
    rows.set(first.id, "value", 3);
    const entries = rows.entries();
    const changes = rows.changes();
    const listener = vi.fn();
    rows.subscribe(listener);

    rows.setMany([]);
    rows.setMany([{ id: first.id, values: {} },
      { id: first.id, values: { value: 1 } }, { id: first.id, values: { value: 3 } },
      { id: second.id, values: { name: "B" } }]);
    expect(rows.entries()).toBe(entries);
    expect(rows.changes()).toBe(changes);
    expect(listener).not.toHaveBeenCalled();

    rows.setMany([{ id: second.id, values: { name: "Temporary" } },
      { id: first.id, values: { name: "Updated" } },
      { id: second.id, values: { name: "B", value: 20 } },
      { id: first.id, values: { value: 30 } }]);
    expect(listener).toHaveBeenCalledExactlyOnceWith({
      type: "setMany", ids: [second.id, first.id], changed: true
    });
    expect(rows.entries().map(row => row.value)).toEqual([
      { name: "Updated", value: 30 }, { name: "B", value: 20 }
    ]);
    rows.dispose();
  });

  it("publishes one frozen batch event after all values are committed and detached", () => {
    const rows = createRows([{ value: { nested: [1] } }, { value: { nested: [2] } },
      { value: { nested: [3] } }]);
    const [first, second, unchanged] = rows.entries();
    const input = { nested: [10] };
    const events: RowsEvent[] = [];
    rows.subscribe(event => {
      events.push(event);
      expect(rows.entries().map(row => row.value.value.nested)).toEqual([[10], [20], [3]]);
      expect(Object.isFrozen(event)).toBe(true);
      if (event.type === "setMany") expect(Object.isFrozen(event.ids)).toBe(true);
    });
    rows.setMany([{ id: unchanged.id, values: { value: { nested: [3] } } },
      { id: second.id, values: { value: { nested: [20] } } },
      { id: first.id, values: { value: input } }]);

    input.nested[0] = 99;
    expect(events).toEqual([{ type: "setMany", ids: [second.id, first.id], changed: true }]);
    expect(rows.get(first.id)?.value.value.nested).toEqual([10]);
    expect(Object.isFrozen(rows.get(first.id)?.value.value.nested)).toBe(true);
    expect(rows.get(unchanged.id)).toBe(unchanged);
    expect(first.value.value.nested).toEqual([1]);
    rows.dispose();
  });

  it("tracks batch updates, restores clean originals, and rejects deleted rows atomically", () => {
    const rows = createRows([{ name: "A", value: 1 }, { name: "B", value: 2 }]);
    const [first, second] = rows.entries();
    const added = rows.add({ name: "C", value: 3 });
    rows.setMany([{ id: first.id, values: { name: "Changed", value: 10 } },
      { id: added, values: { value: 30 } }]);
    rows.setMany([{ id: first.id, values: { value: 1 } }]);
    expect(rows.get(first.id)?.status).toBe("update");
    rows.setMany([{ id: first.id, values: { name: "A" } }]);
    expect(rows.get(first.id)?.status).toBe("clean");
    expect(rows.changes()).toEqual([
      { id: added, status: "insert", value: { name: "C", value: 30 } }
    ]);
    rows.remove(second.id);
    const entries = rows.entries();
    expect(() => rows.setMany([{ id: first.id, values: { value: 100 } },
      { id: second.id, values: {} }])).toThrow(/deleted row/);
    expect(rows.entries()).toBe(entries);
    expect(rows.get(first.id)?.value.value).toBe(1);
    rows.revert();
    expect(rows.entries().map(row => row.value)).toEqual([
      { name: "A", value: 1 }, { name: "B", value: 2 }
    ]);
    expect(rows.get(added)).toBeUndefined();
    rows.dispose();
  });

  it("preserves signed-zero raw identity through set, batches and dirty restoration", () => {
    const rows = createRows([{ value: 0, nested: { value: 0 } }]);
    const id = rows.entries()[0].id;
    rows.set(id, "value", -0);
    expect(Object.is(rows.get(id)!.value.value, -0)).toBe(true);
    expect(rows.get(id)!.status).toBe("update");
    rows.setMany([{ id, values: { value: 0, nested: { value: -0 } } }]);
    expect(Object.is(rows.get(id)!.value.value, 0)).toBe(true);
    expect(Object.is(rows.get(id)!.value.nested.value, -0)).toBe(true);
    expect(rows.get(id)!.status).toBe("update");
    rows.setMany([{ id, values: { nested: { value: 0 } } }]);
    expect(rows.get(id)!.status).toBe("clean");
    rows.dispose();
  });

  it("rejects stale outer writes when JSON getters mutate or dispose the store", () => {
    for (const operation of ["set", "setMany", "add", "replace"] as const) {
      const rows = createRows([{ nested: { value: 1 } }, { nested: { value: 2 } }]);
      const [first, second] = rows.entries();
      const value = { get value() { rows.remove(first.id); return 3; } };
      const write = () => {
        if (operation === "set") rows.set(first.id, "nested", value);
        else if (operation === "setMany") rows.setMany([
          { id: first.id, values: { nested: value } }, { id: second.id, values: { nested: { value: 4 } } }
        ]);
        else if (operation === "add") rows.add({ nested: value });
        else rows.replace([{ nested: value }]);
      };
      expect(write).toThrow(expect.objectContaining({ code: "ROW_VALUE", api: `Rows.${operation}` }));
      expect(rows.get(first.id)!.status).toBe("delete");
      expect(rows.entries()).toEqual([second]);
      rows.dispose();
    }
    const rows = createRows([{ value: 1 }]);
    expect(() => rows.setMany([{ id: 1, values: { get value() { rows.dispose(); return 2; } } },
      { id: 1, values: { value: 3 } }]))
      .toThrow(expect.objectContaining({ code: "ROWS_DISPOSED" }));
  });

  it("keeps a committed batch when subscribers throw and stops on disposal", () => {
    const rows = createRows([{ value: 1 }, { value: 2 }]);
    const [first, second] = rows.entries();
    const cause = new Error("batch subscriber failed");
    const later = vi.fn();
    const failing = rows.subscribe(() => { throw cause; });
    rows.subscribe(later);
    expect(() => rows.setMany([{ id: first.id, values: { value: 10 } },
      { id: second.id, values: { value: 20 } }])).toThrow(cause);
    expect(later).toHaveBeenCalledExactlyOnceWith({
      type: "setMany", ids: [first.id, second.id], changed: true
    });
    expect(rows.entries().map(row => row.value.value)).toEqual([10, 20]);
    failing();
    rows.subscribe(() => rows.dispose());
    const afterDisposal = vi.fn();
    rows.subscribe(afterDisposal);
    rows.setMany([{ id: first.id, values: { value: 100 } }]);
    expect(afterDisposal).not.toHaveBeenCalled();
    expect(() => rows.setMany([])).toThrow(/disposed/);
  });
});
