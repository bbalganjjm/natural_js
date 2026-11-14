// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from "vitest";
import { createRows } from "../src/data/index.js";

describe("Rows source values and application projection", () => {
  it("copies own enumerable JSON from null-prototype sources without evaluating hidden getters", () => {
    const hidden = vi.fn(() => new Date());
    const source: { zero: number; enabled: boolean; empty: null; nested: { code: number }[] } =
      Object.assign(Object.create(null), { zero: 0, enabled: false, empty: null, nested: [{ code: 1 }] });
    Object.defineProperty(source, "hidden", { get: hidden });
    const rows = createRows([source]);
    const value = rows.entries()[0].value;
    expect(value).toEqual({ zero: 0, enabled: false, empty: null, nested: [{ code: 1 }] });
    expect(Object.getPrototypeOf(value)).toBe(Object.prototype);
    expect(Object.isFrozen(value.nested[0])).toBe(true);
    expect(hidden).not.toHaveBeenCalled();
    rows.dispose();
  });

  it("separates repeated aliases and commits explicitly related writes once", () => {
    const shared = { label: "First" };
    const source = [{ left: shared, right: shared }, { left: shared, right: shared }];
    const rows = createRows(source);
    const [a, b] = rows.entries();
    expect(a.value.left).not.toBe(a.value.right);
    expect(a.value.left).not.toBe(b.value.left);
    shared.label = "External";
    expect(a.value.left.label).toBe("First");
    const events = vi.fn(); rows.subscribe(events);
    rows.setMany([a, b].map(row => ({ id: row.id, values: { left: shared } })));
    expect(rows.entries().map(row => [row.value.left.label, row.value.right.label])).toEqual([["External", "First"], ["External", "First"]]);
    expect(events).toHaveBeenCalledOnce();
    expect(rows.original(a.id)!.left.label).toBe("First");
    rows.dispose();
  });

  it("requires explicit inherited and hidden object fields while rejecting own symbols atomically", () => {
    const prototype = Object.assign(Object.create(null), { tenant: "Inherited" });
    const source: { name: string; tenant: string; secret: string } = Object.assign(Object.create(prototype), { name: "Ada" });
    Object.defineProperty(source, "secret", { value: "Hidden" });
    const rows = createRows([source]);
    expect(rows.entries()[0].value).toEqual({ name: "Ada" });
    const normalized = createRows([{ name: source.name, tenant: source.tenant, secret: source.secret }]);
    expect(normalized.entries()[0].value).toEqual({ name: "Ada", tenant: "Inherited", secret: "Hidden" });
    const before = rows.entries();
    const hiddenSymbol = Object.defineProperty({ name: "Grace" }, Symbol("metadata"), { value: true });
    expect(() => rows.replace([Object.assign(hiddenSymbol, { tenant: "Own", secret: "Own" })])).toThrow(/symbol keys/);
    expect(rows.entries()).toBe(before);
    normalized.dispose(); rows.dispose();
  });

  it("copies indexed nested array content and ignores named and symbol array metadata", () => {
    const indexed = [1, 2];
    Object.defineProperty(indexed, "caption", { value: new Date(), enumerable: true });
    Object.defineProperty(indexed, Symbol("metadata"), { value: () => 3 });
    const inherited: { code: number }[] = Object.setPrototypeOf(new Array(1), Object.assign(Object.create(Array.prototype), { 0: { code: 3 } }));
    const rows = createRows([{ indexed, inherited }]);
    const value = rows.entries()[0].value;
    expect(value).toEqual({ indexed: [1, 2], inherited: [{ code: 3 }] });
    expect(Reflect.ownKeys(value.indexed)).toEqual(["0", "1", "length"]);
    expect(Object.hasOwn(value.inherited, 0)).toBe(true);
    const before = rows.entries();
    expect(() => rows.set(before[0].id, "indexed", new Array(1))).toThrow(/JSON-compatible/);
    expect(rows.entries()).toBe(before);
    rows.dispose();
  });

  it("retains literal dotted and prototype-sensitive business keys without changing prototypes", () => {
    const source: Record<string, unknown> = Object.fromEntries([["id", "business"], ["status", "ready"], ["value", null], ["rowStatus", "domain"], ["profile.team", "literal"], ["__proto__", { marker: true }]]);
    const rows = createRows([source]);
    const row = rows.entries()[0];
    rows.set(row.id, "profile.team", "changed literal");
    const value = rows.get(row.id)!.value;
    expect(Object.getPrototypeOf(value)).toBe(Object.prototype);
    expect(Object.hasOwn(value, "__proto__")).toBe(true);
    expect(value["profile.team"]).toBe("changed literal");
    expect(value.id).toBe("business");
    const payload = Object.fromEntries(["id", "status", "value", "rowStatus", "profile.team", "__proto__"].map(key => [key, Reflect.get(value, key)]));
    expect(JSON.parse(JSON.stringify(payload))).toEqual({ id: "business", status: "ready", value: null, rowStatus: "domain", "profile.team": "changed literal", ["__proto__"]: { marker: true } });
    expect(Object.getPrototypeOf(payload)).toBe(Object.prototype);
    rows.dispose();
  });

  it("adds configured projection keys and omits only missing or undefined values", () => {
    const source = { id: "server-a", name: "Ada", active: false, count: 0, note: null, nested: [{ code: 1 }], missing: undefined };
    const requested = ["id", "name", "active", "count", "note", "nested", "missing", "absent"];
    const extras = ["tenant", "rowStatus"];
    const inherited = Object.assign(Object.create({ tenant: "Inherited" }), source, { rowStatus: "update" });
    const payload = Object.fromEntries([...requested, ...extras].flatMap(key => {
      const value: unknown = Reflect.get(inherited, key);
      return value === undefined ? [] : [[key, value]];
    }));
    expect(payload).toEqual({ id: "server-a", name: "Ada", active: false, count: 0, note: null, nested: [{ code: 1 }], tenant: "Inherited", rowStatus: "update" });
    expect(Object.hasOwn(payload, "missing")).toBe(false);
    expect(source.missing).toBeUndefined();
    expect(source.nested).toBe(payload.nested);
  });

  it("projects checkpoint delete payload separately from the last committed display value", () => {
    const rows = createRows([{ id: "server-a", name: "Received", note: null, nested: [{ code: 1 }] }]);
    const id = rows.entries()[0].id;
    rows.set(id, "name", "Edited"); rows.remove(id);
    const payload = rows.changes().map(({ status, value }) => ({ ...value, rowStatus: status }));
    expect(payload).toEqual([{ id: "server-a", name: "Received", note: null, nested: [{ code: 1 }], rowStatus: "delete" }]);
    expect(rows.get(id)!.value.name).toBe("Edited");
    expect(payload[0].id).toBe("server-a");
    rows.dispose();
  });

  it("normalizes rich application objects explicitly without changing source methods graphs or values", () => {
    class Employee {
      constructor(readonly id: string, public name: string, readonly updatedAt: Date, readonly payroll: bigint) {}
      get tenant() { return "Inherited"; }
      manager?: Employee;
      calculate() { return this.payroll + 1n; }
    }
    const source = new Employee("business", "Ada", new Date("2020-01-02T03:04:05.000Z"), 9007199254740993n);
    source.manager = source;
    const receive = (item: Employee) => ({ id: item.id, name: item.name, tenant: item.tenant,
      updatedAt: item.updatedAt.toISOString(), payroll: item.payroll.toString(), managerId: item.manager?.id ?? null });
    const rows = createRows([receive(source)]);
    const id = rows.entries()[0].id;
    source.name = "External";
    expect(rows.get(id)!.value.name).toBe("Ada");
    rows.set(id, "name", source.name);
    expect(rows.get(id)!.value).toEqual({ id: "business", name: "External", tenant: "Inherited", updatedAt: "2020-01-02T03:04:05.000Z", payroll: "9007199254740993", managerId: "business" });
    rows.revert(id);
    expect(rows.get(id)!.value.name).toBe("Ada");
    expect(source.name).toBe("External");
    expect(source.manager).toBe(source);
    expect(source.calculate()).toBe(9007199254740994n);
    rows.dispose();
  });
});
