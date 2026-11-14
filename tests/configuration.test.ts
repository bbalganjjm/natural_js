// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";
import { createCommunicator } from "../src/comm/index.js";
import { createRuleRunner } from "../src/ui/rules.js";
import { builtinMessages } from "../src/ui/validate-rules.js";
import type { RuleContext, RuleSet } from "../src/ui/index.js";

const context: RuleContext = { field: "name", values: { name: "" }, rowId: 1 };
const marked = (declarations = '[["required"]]') => ({ getAttribute: () => declarations }) as unknown as Element;
const issue = (runner: ReturnType<typeof createRuleRunner>, value: unknown = "") =>
  runner.validate(runner.validators(marked(), "name"), value, context);

describe("creation snapshots and explicit live message policy", () => {
  it("captures a base URL getter and cloned URL while new communicators and explicit forwarding use their selected scope", async () => {
    let reads = 0; const original = new URL("https://one.test/api/");
    const send = async (request: Request) => new Response(JSON.stringify({ url: request.url }));
    const options = { get baseURL() { reads++; return original; }, send };
    const old = createCommunicator(options), two = createCommunicator({ baseURL: new URL("https://two.test/api/"), send });
    original.pathname = "/mutated/";
    Object.defineProperty(options, "baseURL", { value: new URL("https://replacement.test/new/") });
    const scope = { comm: old }, forward = () => scope.comm.request<{ url: string }>({ url: "row" });
    expect(await forward()).toEqual({ url: "https://one.test/api/row" });
    scope.comm = createCommunicator(options);
    expect(await forward()).toEqual({ url: "https://replacement.test/new/row" });
    expect(await old.request({ url: "row" })).toEqual({ url: "https://one.test/api/row" });
    expect(await two.request({ url: "row" })).toEqual({ url: "https://two.test/api/row" });
    expect(reads).toBe(1);
  });

  it("keeps an absent base absent and reports invalid captured URLs at creation", async () => {
    const options: { baseURL?: URL; send(request: Request): Promise<Response> } = {
      send: async request => new Response(JSON.stringify(request.url))
    };
    const comm = createCommunicator(options); options.baseURL = new URL("https://later.test/");
    await expect(comm.request({ url: "relative" })).rejects.toMatchObject({ code: "REQUEST_INIT" });
    await expect(comm.request({ url: "https://direct.test/" })).resolves.toBe("https://direct.test/");
    for (const baseURL of [null, { href: "invalid" }]) {
      expect(() => createCommunicator({ baseURL } as { baseURL: URL })).toThrowError(expect.objectContaining({ code: "REQUEST_OPTIONS", api: "createCommunicator" }));
    }
  });

  it("keeps literal locale/message snapshots after property replacement, deletion and in-place map mutation", () => {
    let localeReads = 0, messageReads = 0; const messages = { required: "Original" };
    const rules = { get locale() { localeReads++; return "en_US"; }, get messages() { messageReads++; return messages; } };
    const runner = createRuleRunner("bindForm", rules);
    messages.required = "Mutated";
    Object.defineProperty(rules, "messages", { value: { required: "Replaced" } });
    Object.defineProperty(rules, "locale", { value: "ko_KR" });
    expect(issue(runner)[0].message).toBe("Original"); expect([localeReads, messageReads]).toEqual([1, 1]);
    const literal = { locale: "en_US" }, other = createRuleRunner("bindForm", literal); literal.locale = "ko_KR";
    expect(issue(other)[0].message).toBe(builtinMessages.en_US.required);
  });

  it("captures plain synchronous providers once and reads live values on each generated issue", () => {
    const state = { locale: "en_US", messages: {} as Record<string, string> }, order: string[] = [], receivers: unknown[] = [];
    let reads = 0;
    const rules: RuleSet = { get locale() { reads++; return function(this: unknown) { receivers.push(this); order.push("locale"); return state.locale; }; },
      get messages() { reads++; return function(this: unknown) { receivers.push(this); order.push("messages"); return state.messages; }; } };
    const runner = createRuleRunner("bindForm", rules);
    Object.defineProperty(rules, "locale", { value: () => { throw new Error("Late locale replacement"); } });
    Object.defineProperty(rules, "messages", { value: () => { throw new Error("Late messages replacement"); } });
    expect(issue(runner)[0].message).toBe(builtinMessages.en_US.required);
    state.locale = "KO-custom"; expect(issue(runner)[0].message).toBe(builtinMessages.ko_KR.required);
    state.messages.required = "<b>{0}</b>"; expect(issue(runner)[0].message).toBe("<b></b>");
    expect(reads).toBe(2); expect(receivers.every(value => value === undefined)).toBe(true);
    expect(order).toEqual(["locale", "messages", "locale", "messages", "locale", "messages"]);
  });

  it("does no provider/map work on valid input and resolves one whole map per generated failed message", () => {
    let providers = 0, scans = 0, values = 0;
    const entries = Object.fromEntries(Array.from({ length: 100 }, (_, index) => ["unused" + index, "Unused"]));
    Object.assign(entries, { required: "Required", custom: "Custom" });
    const messages = new Proxy(entries, { ownKeys(target) { scans++; return Reflect.ownKeys(target); },
      get(target, key, receiver) { if (typeof key === "string" && key !== "then") values++; return Reflect.get(target, key, receiver); } });
    const runner = createRuleRunner("bindForm", { locale: () => { providers++; return "en_US"; }, messages: () => { providers++; return messages; }, validate: { custom: value => value === "valid" } });
    const calls = runner.validators(marked('[["required"],["custom"]]'), "name");
    for (let index = 0; index < 1000; index++) expect(runner.validate(calls, "valid", context)).toEqual([]);
    expect([providers, scans, values]).toEqual([0, 0, 0]);
    expect(runner.validate(calls, "", context).map(found => found.message)).toEqual(["Required", "Custom"]);
    expect([providers, scans, values]).toEqual([4, 2, 204]);
    const staticRunner = createRuleRunner("bindForm", { messages }), staticCalls = staticRunner.validators(marked(), "name"); scans = 0; values = 0;
    for (let index = 0; index < 1000; index++) expect(staticRunner.validate(staticCalls, "valid", context)).toEqual([]);
    expect([scans, values]).toEqual([0, 0]);
  });

  it("bypasses providers for a validator's nonempty message and preserves existing fallback and false/zero placeholders", () => {
    const bypass = () => { throw new Error("Must not read message policy"); };
    const runner = createRuleRunner("bindForm", { locale: bypass, messages: bypass, validate: { custom: () => "Direct" } });
    expect(runner.validate(runner.validators(marked('[["custom"]]'), "name"), "bad", context)[0].message).toBe("Direct");
    const other = createRuleRunner("bindForm", { messages: { global: "Still not a global fallback", custom: "{0}/{1}" }, validate: { custom: () => false, absent: () => false } });
    const calls = other.validators(marked('[["custom",0,false],["absent"]]'), "name");
    expect(other.validate(calls, "bad", context).map(found => found.message)).toEqual(["0/false", "name failed absent."]);
  });

  it("reports invalid locale providers with RULE_FAILED and drains rejected asynchronous returns", async () => {
    const providers = [() => undefined, () => null, () => [], () => Promise.resolve("en_US"), () => Promise.reject(new Error("Async locale")),
      () => ({ then(_resolve: (value: unknown) => void, reject: (cause: unknown) => void) { reject(new Error("Thenable locale")); } }), () => { throw undefined; }];
    for (const locale of providers) {
      const runner = createRuleRunner("bindForm", { locale } as unknown as RuleSet);
      expect(() => issue(runner)).toThrowError(expect.objectContaining({ code: "RULE_FAILED", api: "bindForm", detail: { field: "name", rule: "required" } }));
    }
    await Promise.resolve();
  });

  it("reports invalid message providers with RULE_FAILED without silently using defaults", async () => {
    const providers = [() => undefined, () => null, () => [], () => "bad", () => ({ required: "" }), () => ({ Required: "one", required: "two" }),
      () => Promise.resolve({ required: "Async" }), () => Promise.reject(new Error("Async messages")),
      () => ({ then(_resolve: (value: unknown) => void, reject: (cause: unknown) => void) { reject(new Error("Thenable messages")); } }), () => { throw null; }];
    for (const messages of providers) {
      const runner = createRuleRunner("bindForm", { messages } as unknown as RuleSet);
      expect(() => issue(runner)).toThrowError(expect.objectContaining({ code: "RULE_FAILED", api: "bindForm", detail: { field: "name", rule: "required" } }));
    }
    await Promise.resolve();
    for (const messages of [null, [], 1, { required: "" }]) {
      expect(() => createRuleRunner("bindForm", { messages } as RuleSet)).toThrowError(expect.objectContaining({ code: "RULE_DECLARATION" }));
    }
  });
});
