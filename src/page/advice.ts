// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import type { PageContext, PageController } from "./index.js";

export interface PageAdvice<Input = unknown, Output = unknown> {
  readonly match: (path: string, owner: object, page: PageContext<Input, Output>) => boolean;
  readonly wrap: (proceed: (...args: unknown[]) => unknown, path: string, owner: object,
    page: PageContext<Input, Output>) => (...args: unknown[]) => unknown;
}

type Method = (...args: unknown[]) => unknown;
type Phase = "options" | "claim" | "discover" | "match" | "wrap" | "install" | "restore";
interface Inherited { owner: object; descriptor: PropertyDescriptor }
interface Slot {
  owner: object;
  key: string;
  real: Function;
  own?: PropertyDescriptor;
  expected?: PropertyDescriptor;
  inherited?: Inherited;
  paths: string[];
  wrappers?: Method[];
  index?: number;
  path?: string;
}
interface Branch { key: string; child: object }
interface Graph { entries: (Slot | Branch)[] }

const controllers = new WeakMap<object, object>();
const claims = new WeakMap<object, Map<string, object>>();
const lifecycle = ["init", "activate", "deactivate", "dispose"];

function failure(phase: Phase, message: string, path?: string, index?: number, cause?: unknown): FrameworkError {
  return new FrameworkError({ api: "mountPage", code: "PAGE_ADVICE", message, cause,
    detail: { phase, ...(path === undefined ? {} : { path }), ...(index === undefined ? {} : { index }) } });
}

function isClass(value: Function): boolean {
  return /^\s*class\b/.test(Function.prototype.toString.call(value));
}

function drain(value: unknown): void {
  if (value !== null && (typeof value === "object" || typeof value === "function") &&
      typeof (value as { then?: unknown }).then === "function") void Promise.resolve(value).catch(() => {});
}

export function capturePageAdvice<Input = unknown, Output = unknown>(source: unknown): readonly PageAdvice<Input, Output>[] {
  if (source === undefined) return [];
  try {
    if (!Array.isArray(source)) throw failure("options", "advice must be an array.");
    return Array.from(source, (entry: unknown, index) => {
      try {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new TypeError("Each advice needs match and wrap functions.");
        const match: unknown = Reflect.get(entry, "match"), wrap: unknown = Reflect.get(entry, "wrap");
        if (typeof match !== "function" || typeof wrap !== "function" || isClass(match) || isClass(wrap)) {
          throw new TypeError("Each advice needs callable match and wrap functions.");
        }
        return { match, wrap } as PageAdvice<Input, Output>;
      } catch (cause) { throw failure("options", "Invalid page advice declaration.", undefined, index, cause); }
    });
  } catch (cause) {
    if (cause instanceof FrameworkError && cause.api === "mountPage" && cause.code === "PAGE_ADVICE" && cause.detail?.phase === "options") throw cause;
    throw failure("options", "Page advice declarations could not be read.", undefined, undefined, cause);
  }
}

function inherited(owner: object, key: string): Inherited | undefined {
  for (let prototype = Object.getPrototypeOf(owner); prototype; prototype = Object.getPrototypeOf(prototype)) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
    if (descriptor) return { owner: prototype, descriptor };
  }
  return undefined;
}

function same(left: PropertyDescriptor | undefined, right: PropertyDescriptor | undefined): boolean {
  if (!left || !right) return left === right;
  return ["value", "get", "set", "writable", "enumerable", "configurable"].every(key =>
    Object.is(Reflect.get(left, key), Reflect.get(right, key)));
}

function plain(value: unknown): value is object {
  if (!value || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function discover(controller: object, signal: AbortSignal, context: object): Slot[] {
  const nodes = new WeakMap<object, Graph>(), pending = [{ owner: controller, prefix: "" }];
  while (pending.length) {
    signal.throwIfAborted();
    const { owner, prefix } = pending.pop()!;
    if (nodes.has(owner)) continue;
    const graph: Graph = { entries: [] }; nodes.set(owner, graph);
    let descriptors: PropertyDescriptorMap, keys: string[];
    try {
      descriptors = Object.getOwnPropertyDescriptors(owner);
      keys = Object.keys(descriptors).filter(key => descriptors[key].enumerable || owner === controller && lifecycle.includes(key));
      if (owner === controller) for (const key of lifecycle) if (!Object.hasOwn(descriptors, key)) keys.push(key);
    } catch (cause) {
      signal.throwIfAborted();
      throw failure("discover", "Page advice could not inspect a public owner.", prefix || undefined, undefined, cause);
    }
    signal.throwIfAborted();
    for (const key of keys) {
      const path = prefix ? prefix + "." + key : key;
      try {
        const own = descriptors[key], base = own ? undefined : inherited(owner, key), descriptor = own ?? base?.descriptor;
        if (!descriptor) continue;
        const value: unknown = "value" in descriptor ? descriptor.value : descriptor.get?.call(owner);
        signal.throwIfAborted();
        if (typeof value === "function") {
          if (!isClass(value)) graph.entries.push({ owner, key, real: value, own, expected: own, inherited: base, paths: [] });
        } else if (value !== context && plain(value)) {
          graph.entries.push({ key, child: value }); pending.push({ owner: value, prefix: path });
        }
      } catch (cause) {
        signal.throwIfAborted();
        throw failure("discover", "Page advice could not inspect a public member.", path, undefined, cause);
      }
      signal.throwIfAborted();
    }
  }
  const targets: Slot[] = [];
  type Route = { owner: object; prefix: string; ancestors: ReadonlySet<object> } | { slot: Slot; path: string };
  const routes: Route[] = [{ owner: controller, prefix: "", ancestors: new Set() }];
  while (routes.length) {
    const route = routes.pop()!;
    if ("slot" in route) {
      if (!route.slot.paths.length) targets.push(route.slot);
      route.slot.paths.push(route.path); continue;
    }
    if (route.ancestors.has(route.owner)) continue;
    const ancestors = new Set(route.ancestors); ancestors.add(route.owner);
    const entries = nodes.get(route.owner)!.entries;
    for (let index = entries.length - 1; index >= 0; index--) {
      const entry = entries[index], path = route.prefix ? route.prefix + "." + entry.key : entry.key;
      routes.push("child" in entry ? { owner: entry.child, prefix: path, ancestors } : { slot: entry, path });
    }
  }
  return targets;
}

export function claimPageAdvice<Input, Output>(controller: PageController, page: PageContext<Input, Output>,
  advice: readonly PageAdvice<Input, Output>[]) {
  if (!advice.length) return undefined;
  if (controllers.has(controller)) throw failure("claim", "The controller already belongs to an advised page.");
  const token = {}; controllers.set(controller, token);
  let targets: Slot[] = [], installed = false, released = false;

  function check(slot: Slot, path: string, index: number): void {
    page.signal.throwIfAborted();
    let unchanged: boolean, replaceable: boolean;
    try {
      const base = slot.inherited && inherited(slot.owner, slot.key);
      unchanged = same(Object.getOwnPropertyDescriptor(slot.owner, slot.key), slot.expected) &&
        (!slot.inherited || !!base && base.owner === slot.inherited.owner && same(base.descriptor, slot.inherited.descriptor));
      replaceable = !unchanged || (slot.expected ? !!slot.expected.configurable || "value" in slot.expected && !!slot.expected.writable : Object.isExtensible(slot.owner));
    } catch (cause) {
      page.signal.throwIfAborted();
      throw failure("install", "Page advice could not inspect the selected method.", path, index, cause);
    }
    page.signal.throwIfAborted();
    if (!unchanged) {
      throw failure("install", "A public method changed during advice installation.", path, index);
    }
    if (!replaceable) {
      throw failure("install", "The selected method cannot be replaced.", path, index);
    }
  }

  function unclaim(slot: Slot): void {
    const owned = claims.get(slot.owner);
    if (owned?.get(slot.key) === token) {
      owned.delete(slot.key); if (!owned.size) claims.delete(slot.owner);
    }
  }

  return {
    install(): void {
      if (installed || released) return;
      installed = true; page.signal.throwIfAborted(); targets = discover(controller, page.signal, page); page.signal.throwIfAborted();
      for (const slot of targets) if (claims.get(slot.owner)?.has(slot.key)) {
        throw failure("install", "A discovered method belongs to another advised page.", slot.paths[0]);
      }
      for (const [index, declaration] of advice.entries()) {
        const { match, wrap } = declaration, selected: { slot: Slot; path: string }[] = [];
        for (const slot of targets) for (const path of slot.paths) {
          page.signal.throwIfAborted();
          let result: unknown;
          try {
            result = match(path, slot.owner, page);
            if (typeof result !== "boolean") { drain(result); throw new TypeError("match must return a boolean synchronously."); }
          } catch (cause) { throw failure("match", "Page advice matching failed.", path, index, cause); }
          page.signal.throwIfAborted();
          if (result) { check(slot, path, index); selected.push({ slot, path }); break; }
        }
        for (const { slot, path } of selected) {
          check(slot, path, index);
          const real = slot.wrappers?.at(-1) ?? slot.real, owner = slot.owner;
          const work = owner === controller && (slot.key === "init" || slot.key === "activate");
          const proceed: Method = (...args) => { if (work) page.signal.throwIfAborted(); return Reflect.apply(real, owner, args); };
          let returned: unknown;
          try {
            returned = wrap(proceed, path, slot.owner, page);
            if (typeof returned !== "function" || isClass(returned)) { drain(returned); throw new TypeError("wrap must return a callable function synchronously."); }
          } catch (cause) { throw failure("wrap", "Page advice wrapping failed.", path, index, cause); }
          page.signal.throwIfAborted(); check(slot, path, index);
          const run = returned as Method;
          const wrapper: Method = (...args) => { if (work) page.signal.throwIfAborted(); return run(...args); };
          const descriptor: PropertyDescriptor = slot.expected && "value" in slot.expected
            ? { ...slot.expected, value: wrapper }
            : { value: wrapper, enumerable: (slot.own ?? slot.inherited?.descriptor)?.enumerable ?? false, writable: true, configurable: true };
          let owned = claims.get(slot.owner); if (!owned) { owned = new Map(); claims.set(slot.owner, owned); }
          owned.set(slot.key, token); (slot.wrappers ??= []).push(wrapper); slot.index = index; slot.path = path;
          try {
            if (!Reflect.defineProperty(slot.owner, slot.key, descriptor)) throw new TypeError("The method descriptor was not replaced.");
            slot.expected = Object.getOwnPropertyDescriptor(slot.owner, slot.key);
          } catch (cause) {
            page.signal.throwIfAborted();
            throw failure("install", "Page advice could not install a method.", path, index, cause);
          }
          page.signal.throwIfAborted();
        }
      }
    },
    release(): void {
      if (released) return;
      released = true; let blocked = false, failed = false, first: unknown;
      for (const slot of [...targets].reverse()) {
        const wrappers = slot.wrappers;
        if (!wrappers) continue;
        try {
          if (wrappers.includes(Object.getOwnPropertyDescriptor(slot.owner, slot.key)?.value)) {
            const restored = slot.own ? Reflect.defineProperty(slot.owner, slot.key, slot.own) : Reflect.deleteProperty(slot.owner, slot.key);
            if (!restored) throw new TypeError("The original method descriptor was not restored.");
          }
          unclaim(slot);
        } catch (cause) {
          let stillOwned = true;
          try { stillOwned = wrappers.includes(Object.getOwnPropertyDescriptor(slot.owner, slot.key)?.value); } catch { /* Keep an uninspectable claim blocked. */ }
          if (stillOwned) blocked = true;
          else unclaim(slot);
          if (!failed) { failed = true; first = failure("restore", "Page advice could not restore a method.", slot.path, slot.index, cause); }
        }
      }
      if (!blocked && controllers.get(controller) === token) controllers.delete(controller);
      if (failed) throw first;
    }
  };
}
