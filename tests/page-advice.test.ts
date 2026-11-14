// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from "vitest";
import { capturePageAdvice, claimPageAdvice } from "../src/page/advice.js";
import type { PageAdvice, PageContext, PageController } from "../src/page/index.js";

function context(abort = new AbortController()) {
  // Pure interception does not read a DOM root; real roots are covered in the browser fixture.
  const owned: Array<() => void | Promise<void>> = [];
  const page: PageContext = { root: undefined!, input: {}, signal: abort.signal,
    own: dispose => { owned.push(dispose); }, output() {} };
  return { page, abort, owned };
}

function install(controller: PageController, declarations: readonly PageAdvice[], page = context().page) {
  const claim = claimPageAdvice(controller, page, capturePageAdvice(declarations))!;
  claim.install(); return claim;
}

describe("automatic page advice", () => {
  it("captures declaration getters once and leaves empty advice completely undiscovered", () => {
    let reads = 0, gets = 0;
    const original = () => 3, controller = { init() {}, get dangerous() { gets++; throw new Error("Must not discover"); }, original };
    const match = vi.fn(() => true), wrap = vi.fn((proceed: (...args: unknown[]) => unknown) => proceed);
    const entry = { get match() { reads++; return match; }, get wrap() { reads++; return wrap; } };
    const declarations = [entry], captured = capturePageAdvice(declarations);
    declarations.splice(0); Object.defineProperty(entry, "match", { value: () => false });
    expect(captured).toEqual([{ match, wrap }]); expect(reads).toBe(2);
    expect(claimPageAdvice(controller, context().page, capturePageAdvice(undefined))).toBeUndefined();
    expect(claimPageAdvice(controller, context().page, capturePageAdvice([]))).toBeUndefined();
    expect(controller.original).toBe(original); expect(gets).toBe(0);
  });

  it.each([null, false, {}, [undefined], [{ match: false, wrap() {} }], [{ match() {}, wrap: class NotCallable {} }]])(
    "rejects malformed declarations with bounded options metadata (%s)", source => {
      expect(() => capturePageAdvice(source)).toThrow(expect.objectContaining({ code: "PAGE_ADVICE", api: "mountPage", detail: expect.objectContaining({ phase: "options" }) }));
    });

  it("automatically captures nested methods, calls policy functions plainly and preserves the real method owner", () => {
    const receivers: unknown[] = [], seen: string[] = [], actions = { value: 4, run(add: unknown) { return this.value + Number(add); } };
    const original = actions.run, controller = { init() {}, actions };
    const claim = install(controller, [{
      match(this: void, path, owner) { receivers.push(this); seen.push(path); return path === "actions.run" && owner === actions; },
      wrap(this: void, proceed) { receivers.push(this); return function(this: void, ...args) { receivers.push(this); return proceed(...args); }; }
    }]);
    try { expect(({ borrowed: actions.run }).borrowed(3)).toBe(7); expect(seen).toContain("actions.run"); expect(receivers.every(value => value === undefined)).toBe(true); }
    finally { claim.release(); }
    expect(actions.run).toBe(original);
  });

  it.each([false, null, 0, undefined])("preserves immediate falsy results without converting them to promises (%s)", value => {
    const order: string[] = [], controller = { init() {}, run() { order.push("core"); return value; } };
    const claim = install(controller, [{ match: path => path === "run", wrap: proceed => (...args) => {
      order.push("before"); const result = proceed(...args); order.push("after"); return result;
    } }]);
    try { expect(controller.run()).toBe(value); expect(order).toEqual(["before", "core", "after"]); }
    finally { claim.release(); }
  });

  it("nests later declarations outside earlier ones with replacement arguments and explicit before/after behavior", () => {
    const order: string[] = [], controller = { init() {}, run(value: unknown) { order.push("core:" + value); return false; } };
    const declarations = ["inner", "outer"].map(name => ({ match: (path: string) => path === "run", wrap: (proceed: (...args: unknown[]) => unknown) => (...args: unknown[]) => {
      order.push(name + "-before");
      const result = proceed(...(name === "outer" ? ["changed"] : args)); order.push(name + "-after"); return result;
    } }));
    const claim = install(controller, declarations);
    try { expect(controller.run("original")).toBe(false); expect(order).toEqual(["outer-before", "inner-before", "core:changed", "inner-after", "outer-after"]); }
    finally { claim.release(); }
  });

  it.each([0, 1, 2])("permits %i deliberate proceeds and an explicit replacement result", count => {
    const values: unknown[] = [], controller = { init() {}, run(value: unknown) { values.push(value); return true; } };
    const claim = install(controller, [{ match: path => path === "run", wrap: proceed => () => {
      for (let index = 0; index < count; index++) proceed(index); return false;
    } }]);
    try { expect(controller.run("ignored")).toBe(false); expect(values).toEqual(Array.from({ length: count }, (_, index) => index)); }
    finally { claim.release(); }
  });

  it.each([null, undefined, 0, false])("keeps the actual synchronous thrown cause available to an outer recovery (%s)", cause => {
    const controller = { init() {}, run() { throw cause; } }, seen: unknown[] = [];
    const claim = install(controller, [{ match: path => path === "run", wrap: proceed => () => {
      try { return proceed(); } catch (error) { seen.push(error); return error; }
    } }]);
    try { expect(controller.run()).toBe(cause); expect(seen).toEqual([cause]); }
    finally { claim.release(); }
  });

  it("awaits only application-defined async composition, including recovery and after failures", async () => {
    const order: string[] = [], failure = new Error("after"), controller = { init() {}, async run() { order.push("core"); return 0; } };
    const claim = install(controller, [
      { match: path => path === "run", wrap: proceed => async () => { order.push("before"); const result = await proceed(); expect(result).toBe(0); order.push("after"); throw failure; } },
      { match: path => path === "run", wrap: proceed => async () => { try { return await proceed(); } catch (cause) { expect(cause).toBe(failure); order.push("recover"); return false; } } }
    ]);
    try { expect(await controller.run()).toBe(false); expect(order).toEqual(["before", "core", "after", "recover"]); }
    finally { claim.release(); }
  });

  it.each(["before", "core-sync", "core-async", "around", "after"])("passes the actual %s failure to explicit outer recovery", async phase => {
    const cause = new Error(phase), controller = { init() {}, run(): unknown {
      if (phase === "core-sync") throw cause;
      return phase === "core-async" ? Promise.reject(cause) : true;
    } };
    const recover = vi.fn((received: unknown) => { expect(received).toBe(cause); return false; });
    const claim = install(controller, [
      { match: path => path === "run", wrap: proceed => async () => {
        if (phase === "before" || phase === "around") throw cause;
        const result = await proceed(); if (phase === "after") throw cause; return result;
      } },
      { match: path => path === "run", wrap: proceed => async () => { try { return await proceed(); } catch (error) { return recover(error); } } }
    ]);
    try { expect(await controller.run()).toBe(false); expect(recover).toHaveBeenCalledOnce(); }
    finally { claim.release(); }
  });

  it("leaves an unmatched function identity and its ordinary borrowed receiver unchanged", () => {
    const controller = { init() {}, value: 1, run() { return this.value; } }, original = controller.run;
    const claim = install(controller, [{ match: () => false, wrap: proceed => proceed }]);
    try { expect(controller.run).toBe(original); expect(({ value: 9, run: controller.run }).run()).toBe(9); }
    finally { claim.release(); }
  });

  it("retains lexical proceeds and keeps the original owner when a wrapper is borrowed", () => {
    const page = context(), values: unknown[] = [], controller = { init() {}, value: 5, run(value: unknown) { values.push([this.value, value]); return this.value; } };
    let retained!: (...args: unknown[]) => unknown;
    const claim = install(controller, [{ match: path => path === "run", wrap: proceed => { retained = proceed; return () => false; } }], page.page);
    expect(controller.run("now")).toBe(false); page.abort.abort(); claim.release();
    expect(retained("later")).toBe(5); expect(values).toEqual([[5, "later"]]);
  });

  it("blocks retained root startup proceeds after abort but keeps root and nested cleanup callable", () => {
    const page = context(), calls: string[] = [], retained = new Map<string, (...args: unknown[]) => unknown>();
    const controller = { init() { calls.push("init"); }, activate() { calls.push("activate"); }, deactivate() { calls.push("deactivate"); }, dispose() { calls.push("dispose"); }, nested: { finish() { calls.push("finish"); } } };
    const claim = install(controller, [{ match: () => true, wrap: (proceed, path) => { retained.set(path, proceed); return proceed; } }], page.page);
    page.abort.abort();
    try {
      expect(() => retained.get("init")!()).toThrow(expect.objectContaining({ name: "AbortError" }));
      expect(() => retained.get("activate")!()).toThrow(expect.objectContaining({ name: "AbortError" }));
      expect(() => controller.init()).toThrow(expect.objectContaining({ name: "AbortError" }));
      controller.deactivate(); controller.dispose(); controller.nested.finish();
      expect(calls).toEqual(["deactivate", "dispose", "finish"]);
    } finally { claim.release(); }
  });

  it("selects finite alias paths once per physical slot and stops cycles without hiding another key", () => {
    const paths: string[] = [], calls: string[] = [], shared = { run() { calls.push("core"); } }, controller = { init() {}, first: shared, second: shared };
    Object.assign(shared, { parent: controller });
    const claim = install(controller, [
      { match: path => path === "second.run", wrap: (proceed, path) => { paths.push(path); return proceed; } },
      { match: path => path.endsWith(".run"), wrap: (proceed, path) => { paths.push(path); return proceed; } }
    ]);
    try { controller.first.run(); expect(paths).toEqual(["second.run", "first.run"]); expect(calls).toEqual(["core"]); }
    finally { claim.release(); }
  });

  it("keeps two distinct properties sharing one function distinct and skips arrays, services and class values", () => {
    class Service { run() { return "service"; } }
    class Value { constructor(readonly value: number) {} }
    const shared = () => 1, service = new Service(), paths: string[] = [], controller = { init() {}, a: shared, b: shared, list: [{ run: shared }], map: new Map([["run", shared]]), service, Value };
    const claim = install(controller, [{ match: path => { paths.push(path); return path === "a" || path === "b"; }, wrap: proceed => proceed }]);
    try { expect(controller.a).not.toBe(controller.b); expect(paths).not.toContain("list.0.run"); expect(paths).not.toContain("service.run"); expect(paths).not.toContain("Value"); expect(controller.Value).toBe(Value); expect(new controller.Value(7).value).toBe(7); expect(service.run()).toBe("service"); }
    finally { claim.release(); }
    expect(controller.a).toBe(shared); expect(controller.b).toBe(shared);
  });

  it("preserves class private-field lifecycle receivers and restores inherited methods by deleting shadows", () => {
    class Controller { #count = 0; init() { return ++this.#count; } dispose() { return ++this.#count; } }
    const controller = new Controller(), original = controller.init;
    const claim = install(controller, [{ match: () => true, wrap: proceed => proceed }]);
    expect(Object.hasOwn(controller, "init")).toBe(true); expect(({ run: controller.init }).run()).toBe(1);
    controller.dispose(); claim.release(); expect(Object.hasOwn(controller, "init")).toBe(false); expect(controller.init).toBe(original); expect(controller.init()).toBe(3);
  });

  it("reads aliased enumerable accessors once, never invokes setters and restores their exact descriptors", () => {
    let reads = 0; const setter = vi.fn(), original = () => 9, owner = {};
    Object.defineProperty(owner, "run", { get() { reads++; return original; }, set: setter, configurable: true, enumerable: true });
    const before = Object.getOwnPropertyDescriptor(owner, "run"), controller = { init() {}, a: owner, b: owner };
    const claim = install(controller, [{ match: path => path === "b.run", wrap: proceed => proceed }]);
    expect(reads).toBe(1); expect(Reflect.get(owner, "run")()).toBe(9); expect(setter).not.toHaveBeenCalled(); claim.release();
    expect(Object.getOwnPropertyDescriptor(owner, "run")).toEqual(before); expect(reads).toBe(1);
  });

  it("does not rewrite unmatched descriptors and reports getter discovery failure with its cause", () => {
    let reads = 0; const original = () => 2, controller = { init() {}, get run() { reads++; return original; } }, before = Object.getOwnPropertyDescriptor(controller, "run");
    const claim = install(controller, [{ match: () => false, wrap: proceed => proceed }]); claim.release();
    expect(reads).toBe(1); expect(Object.getOwnPropertyDescriptor(controller, "run")).toEqual(before);
    const cause = new Error("getter"), broken = { init() {}, get run(): never { throw cause; } }, pending = claimPageAdvice(broken, context().page, capturePageAdvice([{ match: () => true, wrap: proceed => proceed }]))!;
    expect(() => pending.install()).toThrow(expect.objectContaining({ code: "PAGE_ADVICE", cause, detail: expect.objectContaining({ phase: "discover", path: "run" }) })); pending.release();
  });

  it("rejects selected frozen/accessor slots and nonextensible prototype shadows without touching unmatched slots", () => {
    for (const accessor of [false, true]) {
      const controller = { init() {} }; Object.defineProperty(controller, "run", accessor ? { get: () => () => 1, enumerable: true } : { value: () => 1, enumerable: true });
      const claim = claimPageAdvice(controller, context().page, capturePageAdvice([{ match: path => path === "run", wrap: proceed => proceed }]))!;
      expect(() => claim.install()).toThrow(expect.objectContaining({ code: "PAGE_ADVICE", detail: expect.objectContaining({ phase: "install" }) })); claim.release();
    }
    class Controller { init() {} }
    const controller = Object.preventExtensions(new Controller()), claim = claimPageAdvice(controller, context().page, capturePageAdvice([{ match: path => path === "init", wrap: proceed => proceed }]))!;
    expect(() => claim.install()).toThrow(expect.objectContaining({ code: "PAGE_ADVICE", detail: expect.objectContaining({ phase: "install" }) })); claim.release();
  });

  it("retains nonconfigurable writable data flags and preserves later external replacements", () => {
    const controller = { init() {}, run: () => 1 }; Object.defineProperty(controller, "run", { configurable: false, enumerable: true, writable: true });
    const before = Object.getOwnPropertyDescriptor(controller, "run"), claim = install(controller, [{ match: path => path === "run", wrap: proceed => proceed }]);
    expect(Object.getOwnPropertyDescriptor(controller, "run")).toEqual({ ...before, value: controller.run });
    const replacement = () => 8; controller.run = replacement; claim.release(); expect(controller.run).toBe(replacement);
    const next = claimPageAdvice(controller, context().page, capturePageAdvice([{ match: () => false, wrap: proceed => proceed }]))!; next.install(); next.release();
  });

  it("rejects callback descriptor mutation while keeping earlier wrappers installed until explicit cleanup", () => {
    const original = () => 1, replacement = () => 3, controller = { init() {}, a: original, b: original };
    const claim = claimPageAdvice(controller, context().page, capturePageAdvice([{ match: path => path === "a" || path === "b", wrap: (proceed, path) => {
      if (path === "b") controller.b = replacement; return () => Number(proceed()) + 1;
    } }]))!;
    expect(() => claim.install()).toThrow(expect.objectContaining({ code: "PAGE_ADVICE", detail: expect.objectContaining({ phase: "install", path: "b" }) }));
    expect(controller.a()).toBe(2); expect(controller.b).toBe(replacement); claim.release(); expect(controller.a).toBe(original); expect(controller.b).toBe(replacement);
  });

  it("rejects root reuse and shared-slot use even with a false second matcher, without touching the live owner", () => {
    const shared = { run: () => 1 }, first = { init() {}, shared }, second = { init() {}, shared }, page = context().page;
    const a = install(first, [{ match: path => path === "shared.run", wrap: proceed => () => Number(proceed()) + 1 }], page);
    expect(() => claimPageAdvice(first, context().page, capturePageAdvice([{ match: () => false, wrap: proceed => proceed }]))).toThrow(expect.objectContaining({ detail: expect.objectContaining({ phase: "claim" }) }));
    const match = vi.fn(() => false), b = claimPageAdvice(second, context().page, capturePageAdvice([{ match, wrap: proceed => proceed }]))!;
    expect(() => b.install()).toThrow(expect.objectContaining({ detail: expect.objectContaining({ phase: "install", path: "shared.run" }) })); expect(match).not.toHaveBeenCalled(); b.release();
    expect(shared.run()).toBe(2); a.release(); expect(shared.run()).toBe(1);
    const c = install(second, [{ match: () => false, wrap: proceed => proceed }]); c.release();
  });

  it("continues restoration after one frozen wrapper fails and blocks reuse of its controller and physical slot", () => {
    const real = () => 1, shared = { run: real }, controller = { init() {}, first: real, shared };
    const claim = install(controller, [{ match: path => path === "first" || path === "shared.run", wrap: proceed => () => Number(proceed()) + 1 }]);
    Object.defineProperty(shared, "run", { value: shared.run, configurable: false, writable: false });
    expect(() => claim.release()).toThrow(expect.objectContaining({ code: "PAGE_ADVICE", detail: expect.objectContaining({ phase: "restore", path: "shared.run" }) }));
    expect(controller.first).toBe(real); expect(shared.run()).toBe(2);
    expect(() => claimPageAdvice(controller, context().page, capturePageAdvice([{ match: () => false, wrap: proceed => proceed }]))).toThrow(expect.objectContaining({ detail: expect.objectContaining({ phase: "claim" }) }));
    const other = { init() {}, shared }, next = claimPageAdvice(other, context().page, capturePageAdvice([{ match: () => false, wrap: proceed => proceed }]))!;
    expect(() => next.install()).toThrow(expect.objectContaining({ detail: expect.objectContaining({ phase: "install" }) })); next.release();
  });

  it.each(["match", "wrap"] as const)("retains primitive callback failure causes in %s metadata", phase => {
    const controller = { init() {} }, page = context().page, cause = null;
    const declaration: PageAdvice = phase === "match"
      ? { match: () => { throw cause; }, wrap: proceed => proceed }
      : { match: () => true, wrap: () => { throw cause; } };
    const claim = claimPageAdvice(controller, page, capturePageAdvice([declaration]))!;
    expect(() => claim.install()).toThrow(expect.objectContaining({ code: "PAGE_ADVICE", cause, detail: expect.objectContaining({ phase, index: 0 }) })); claim.release();
  });

  it.each(["match", "wrap"] as const)("rejects and drains asynchronous %s results rather than waiting", async phase => {
    const controller = { init() {} }, errors: unknown[] = [], onError = (error: unknown) => { errors.push(error); };
    process.on("unhandledRejection", onError);
    try {
      const invalid = () => Promise.reject(new Error("invalid async " + phase));
      const declaration = phase === "match" ? { match: invalid, wrap: (proceed: (...args: unknown[]) => unknown) => proceed } : { match: () => true, wrap: invalid };
      const claim = claimPageAdvice(controller, context().page, capturePageAdvice([declaration]))!;
      expect(() => claim.install()).toThrow(expect.objectContaining({ code: "PAGE_ADVICE", detail: expect.objectContaining({ phase, index: 0 }) })); claim.release();
      await new Promise(resolve => setTimeout(resolve, 0)); expect(errors).toEqual([]);
    } finally { process.off("unhandledRejection", onError); }
  });

  it("rejects nonboolean matching and noncallable or class-valued wrapper results", () => {
    for (const declaration of [
      { match: () => 1, wrap: (proceed: (...args: unknown[]) => unknown) => proceed },
      { match: () => true, wrap: () => false },
      { match: () => true, wrap: () => class ConstructorValue {} }
    ]) {
      const claim = claimPageAdvice({ init() {} }, context().page, capturePageAdvice([declaration]))!;
      expect(() => claim.install()).toThrow(expect.objectContaining({ code: "PAGE_ADVICE", detail: expect.objectContaining({ phase: declaration.match() === 1 ? "match" : "wrap" }) })); claim.release();
    }
  });

  it("normalizes a declaration-array iteration trap as options failure with its actual cause", () => {
    const cause = new Error("array iterator"), declarations = new Proxy([], {
      get(target, key, receiver) { if (key === Symbol.iterator) throw cause; return Reflect.get(target, key, receiver); }
    });
    expect(() => capturePageAdvice(declarations)).toThrow(expect.objectContaining({ code: "PAGE_ADVICE", cause, detail: expect.objectContaining({ phase: "options" }) }));
  });

  it("stops discovery immediately after an aborting getter and releases its root claim normally", () => {
    const page = context(), match = vi.fn(() => true), wrap = vi.fn((proceed: (...args: unknown[]) => unknown) => proceed); let stop = true, later = 0;
    const controller = { init() {}, get first() { if (stop) page.abort.abort(); return () => 1; }, get later() { later++; return () => 2; } };
    const claim = claimPageAdvice(controller, page.page, capturePageAdvice([{ match, wrap }]))!;
    expect(() => claim.install()).toThrow(expect.objectContaining({ name: "AbortError" }));
    expect(later).toBe(0); expect(match).not.toHaveBeenCalled(); expect(wrap).not.toHaveBeenCalled(); claim.release();
    stop = false; const next = install(controller, [{ match: () => false, wrap: proceed => proceed }]); next.release(); expect(later).toBe(1);
  });

  it.each(["ownKeys", "getOwnPropertyDescriptor"] as const)("normalizes the discovery %s trap with its original cause", trap => {
    const cause = new Error(trap), target = { init() {} }, controller = new Proxy(target, {
      ownKeys(value) { if (trap === "ownKeys") throw cause; return Reflect.ownKeys(value); },
      getOwnPropertyDescriptor(value, key) { if (trap === "getOwnPropertyDescriptor") throw cause; return Reflect.getOwnPropertyDescriptor(value, key); }
    });
    const match = vi.fn(() => true), claim = claimPageAdvice(controller, context().page, capturePageAdvice([{ match, wrap: proceed => proceed }]))!;
    expect(() => claim.install()).toThrow(expect.objectContaining({ code: "PAGE_ADVICE", cause, detail: expect.objectContaining({ phase: "discover" }) }));
    expect(match).not.toHaveBeenCalled(); claim.release();
  });

  it.each(["getOwnPropertyDescriptor", "getPrototypeOf", "isExtensible"] as const)("normalizes the installation %s trap without changing the method", trap => {
    const cause = new Error(trap); let armed = false;
    class Controller { init() {} }
    const target = new Controller(), original = target.init, controller = new Proxy(target, {
      getOwnPropertyDescriptor(value, key) { if (armed && trap === "getOwnPropertyDescriptor") throw cause; return Reflect.getOwnPropertyDescriptor(value, key); },
      getPrototypeOf(value) { if (armed && trap === "getPrototypeOf") throw cause; return Reflect.getPrototypeOf(value); },
      isExtensible(value) { if (armed && trap === "isExtensible") throw cause; return Reflect.isExtensible(value); }
    });
    const wrap = vi.fn((proceed: (...args: unknown[]) => unknown) => proceed), claim = claimPageAdvice(controller, context().page,
      capturePageAdvice([{ match: path => { if (path === "init") armed = true; return path === "init"; }, wrap }]))!;
    expect(() => claim.install()).toThrow(expect.objectContaining({ code: "PAGE_ADVICE", cause, detail: expect.objectContaining({ phase: "install", path: "init", index: 0 }) }));
    armed = false; expect(target.init).toBe(original); expect(wrap).not.toHaveBeenCalled(); claim.release();
  });

  it("skips the exact framework PageContext while an ordinary alias to application input remains discoverable", () => {
    const input = { run: () => 3 }, base = context(), output = vi.fn(), page: PageContext = { ...base.page, input, output };
    const originalOwn = page.own, controller = { init() {}, context: page, appInput: input }, paths: string[] = [];
    const claim = install(controller, [{ match: path => { paths.push(path); return true; }, wrap: (proceed, _path, _owner, current) => {
      expect(current.own).toBe(originalOwn); expect(current.output).toBe(output); current.own(() => {}); current.output("policy"); return proceed;
    } }], page);
    try { expect(paths).toEqual(["init", "appInput.run"]); expect(controller.appInput.run()).toBe(3); expect(page.own).toBe(originalOwn); expect(page.output).toBe(output); expect(base.owned).toHaveLength(2); expect(output).toHaveBeenCalledTimes(2); }
    finally { claim.release(); }
  });

  it.each(["reject", "write-then-throw"] as const)("restores attempted wrapper history after a second-layer native definition %s", mode => {
    const original = () => 1, target = { init() {}, run: original }, cause = new Error("second definition"); let writes = 0;
    const controller = new Proxy(target, { defineProperty(owner, key, descriptor) {
      if (key === "run" && ++writes === 2) {
        if (mode === "reject") return false;
        Reflect.defineProperty(owner, key, descriptor); throw cause;
      }
      return Reflect.defineProperty(owner, key, descriptor);
    } });
    const claim = claimPageAdvice(controller, context().page, capturePageAdvice([1, 10].map(add => ({ match: path => path === "run", wrap: proceed => () => Number(proceed()) + add }))))!;
    expect(() => claim.install()).toThrow(expect.objectContaining({ code: "PAGE_ADVICE", detail: expect.objectContaining({ phase: "install", path: "run", index: 1 }) }));
    expect(target.run()).toBe(mode === "reject" ? 2 : 12); claim.release(); expect(target.run).toBe(original);
    const next = install(controller, [{ match: () => false, wrap: proceed => proceed }]); next.release(); expect(target.run()).toBe(1);
  });
});
