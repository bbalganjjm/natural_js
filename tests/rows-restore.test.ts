// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from "vitest";
import { createRows } from "../src/data/index.js";
import type { RowStatus } from "../src/data/index.js";

type Item = { id: string; name: string; note?: string; nested: { count: number } };
const item = (name: string): Item => ({ id: "business-a", name, nested: { count: 1 } });

describe("Rows complete application checkpoint restoration", () => {
  it("restores complete content and a local deletion in one event without changing identity original or order", () => {
    const rows = createRows([item("Received"), { ...item("Sibling"), id: "business-b" }]);
    const [first, sibling] = rows.entries(), checkpoint = first.value, original = rows.original(first.id);
    rows.set(first.id, "name", "Edited"); rows.set(first.id, "note", "Added later"); rows.remove(first.id);
    const observed: unknown[] = []; rows.subscribe(event => observed.push({ event, value: rows.get(first.id), order: rows.entries({ includeDeleted: true }).map(row => row.id) }));
    rows.restore(first.id, checkpoint);
    expect(observed).toEqual([{ event: { type: "set", id: first.id, changed: true }, value: { id: first.id, status: "clean", value: checkpoint }, order: [first.id, sibling.id] }]);
    expect(rows.original(first.id)).toBe(original); expect(rows.get(sibling.id)).toBe(sibling);
    expect(Object.hasOwn(rows.get(first.id)!.value, "note")).toBe(false); expect(rows.changes()).toEqual([]); rows.dispose();
  });

  const cases: readonly [string, RowStatus | null, boolean, string, RowStatus][] = [
    ["ordinary clean", null, false, "Received", "clean"],
    ["ordinary changed selection", null, false, "Selection", "update"],
    ["received clean", "clean", false, "Received", "clean"],
    ["received pending update", "update", false, "Received", "update"],
    ["received pending insert", "insert", false, "Selection", "insert"],
    ["received pending delete", "delete", false, "Selection", "delete"],
    ["local deletion after clean", null, true, "Selection", "update"],
    ["local deletion after pending update", "update", true, "Selection", "update"]
  ];
  it.each(cases)("derives %s status from the unchanged received owner", (_label, received, remove, name, status) => {
    const rows = createRows<Item>();
    if (received === null) rows.replace([item("Received")]); else rows.replaceState([{ value: item("Received"), status: received }]);
    const id = rows.entries({ includeDeleted: true })[0].id, original = rows.original(id);
    if (received !== "delete") rows.set(id, "name", "Before restore");
    if (remove) rows.remove(id);
    const supplied = item(name); rows.restore(id, supplied); supplied.nested.count = 99;
    expect(rows.get(id)).toEqual({ id, status, value: item(name) });
    expect(rows.original(id)).toBe(original); expect(Object.isFrozen(rows.get(id)!.value.nested)).toBe(true);
    if (status === "delete") expect(rows.changes()[0].value).toBe(original);
    rows.revert(id);
    expect(rows.get(id)).toEqual({ id, status: received ?? "clean", value: item("Received") });
    rows.dispose();
  });

  it("keeps an ordinary inserted checkpoint inserted without inventing an original", () => {
    const rows = createRows<Item>(), id = rows.add(item("New")), checkpoint = rows.get(id)!.value;
    rows.set(id, "note", "Later"); rows.restore(id, checkpoint);
    expect(rows.get(id)).toEqual({ id, status: "insert", value: item("New") }); expect(rows.original(id)).toBeUndefined();
    rows.revert(id); expect(rows.get(id)).toBeUndefined(); rows.dispose();
  });

  it("compares own key presence for prototype-sensitive content and copies business IDs from the checkpoint", () => {
    const rows = createRows<Record<string, unknown>>([{ id: "business-a", name: "Received" }]), id = rows.entries()[0].id, original = rows.original(id);
    const withOwn = Object.fromEntries([["id", "business-b"], ["name", "Received"], ["__proto__", {}]]);
    rows.restore(id, withOwn);
    expect(rows.get(id)!.status).toBe("update"); expect(rows.get(id)!.value.id).toBe("business-b");
    expect(Object.hasOwn(rows.get(id)!.value, "__proto__")).toBe(true); expect(Object.getPrototypeOf(rows.get(id)!.value)).toBe(Object.prototype);
    rows.restore(id, original!);
    expect(rows.get(id)).toEqual({ id, status: "clean", value: original }); expect(Object.hasOwn(rows.get(id)!.value, "__proto__")).toBe(false);
    // Presence alone is different even when inherited Object.prototype and own {} compare structurally equal.
    rows.restore(id, Object.fromEntries([["id", "business-a"], ["name", "Received"], ["__proto__", {}]]));
    expect(rows.get(id)!.status).toBe("update"); expect(Object.hasOwn(rows.get(id)!.value, "__proto__")).toBe(true); rows.dispose();
  });

  it("does not resurrect missing ordinary or received inserts and does not evaluate their values", () => {
    for (const received of [false, true]) {
      const rows = createRows<Item>();
      const id = received ? rows.appendState([{ value: item("New"), status: "insert" }])[0] : rows.add(item("New"));
      rows.remove(id); const read = vi.fn(() => "Unexpected");
      expect(() => rows.restore(id, { ...item("No row"), get name() { return read(); } })).toThrow(expect.objectContaining({ api: "Rows.restore", code: "ROW_MISSING" }));
      expect(read).not.toHaveBeenCalled(); expect(rows.entries()).toEqual([]); rows.dispose();
    }
  });

  it("keeps exact no-op snapshot caches and notifications including a pending update checkpoint", () => {
    const rows = createRows<Item>(); rows.replaceState([{ value: item("Received"), status: "update" }]);
    const before = rows.entries(), all = rows.entries({ includeDeleted: true }), changes = rows.changes(), original = rows.original(before[0].id), observed = vi.fn();
    rows.subscribe(observed); rows.restore(before[0].id, before[0].value);
    expect(rows.entries()).toBe(before); expect(rows.entries({ includeDeleted: true })).toBe(all); expect(rows.changes()).toBe(changes);
    expect(rows.original(before[0].id)).toBe(original); expect(observed).not.toHaveBeenCalled(); rows.dispose();
  });

  it("rejects invalid complete input before changing caches source status or listeners", () => {
    const rows = createRows([item("Received")]), before = rows.entries(), changes = rows.changes(), observed = vi.fn(); rows.subscribe(observed);
    expect(() => rows.restore(before[0].id, { ...item("Outer"), nested: { count: new Date() } } as never)).toThrow(expect.objectContaining({ api: "Rows.restore", code: "ROW_VALUE" }));
    expect(rows.entries()).toBe(before); expect(rows.changes()).toBe(changes); expect(observed).not.toHaveBeenCalled(); rows.dispose();
  });

  it("rejects stale getter work while preserving an inner ordered commit", () => {
    const rows = createRows([item("First"), item("Last")]), [first, last] = rows.entries(), observed: string[] = []; rows.subscribe(event => observed.push(event.type));
    expect(() => rows.restore(first.id, { ...item("Outer"), get name() { rows.move(last.id, first.id); return "Outer"; } })).toThrow(expect.objectContaining({ api: "Rows.restore", code: "ROW_VALUE" }));
    expect(rows.entries()).toEqual([last, first]); expect(observed).toEqual(["move"]); rows.dispose();
  });

  it("honors getter disposal and rejects later calls through the existing lifetime error", () => {
    const rows = createRows([item("Received")]), id = rows.entries()[0].id;
    expect(() => rows.restore(id, { ...item("Outer"), get name() { rows.dispose(); return "Outer"; } })).toThrow(expect.objectContaining({ api: "Rows.restore", code: "ROWS_DISPOSED" }));
    expect(() => rows.restore(id, item("Later"))).toThrow(expect.objectContaining({ api: "Rows.restore", code: "ROWS_DISPOSED" }));
  });

  it("publishes the full commit to remaining subscribers before preserving a primitive failure", () => {
    const rows = createRows([item("Received")]), id = rows.entries()[0].id;
    rows.remove(id); const stop = rows.subscribe(() => { throw null; }), observed: unknown[] = [];
    rows.subscribe(event => observed.push({ event, row: rows.get(id) })); let caught = false;
    try { rows.restore(id, item("Selection")); } catch (cause) { caught = true; expect(cause).toBeNull(); }
    expect(caught).toBe(true); expect(observed).toEqual([{ event: { type: "set", id, changed: true }, row: { id, status: "update", value: item("Selection") } }]);
    expect(rows.original(id)).toEqual(item("Received")); stop(); rows.dispose();
  });
});
