// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";
import { createCommunicator } from "../src/comm/index.ts";
import type { Communicator, RequestOptions } from "../src/comm/index.ts";
import { FrameworkError } from "../src/internal/framework-error.ts";

afterEach(() => vi.unstubAllGlobals());
type Employee = { name: string };

describe("ordinary application request recipes", () => {
  it("orders preinit transform prepare after decode result transform and completion", async () => {
    const order: string[] = [];
    let begun = 0, ended = 0;
    vi.stubGlobal("fetch", vi.fn(async (request: Request) => {
      order.push("fetch");
      expect(request.url).toBe("https://example.test/api/employees");
      expect(request.headers.get("X-Example")).toBe("employee");
      expect(await request.json()).toEqual({ query: "Ada" });
      return new Response('{"result":[{"name":" Ada "}]}');
    }));
    const comm = createCommunicator({
      prepare(request) {
        order.push("prepare"); const headers = new Headers(request.headers);
        headers.set("X-Example", "employee"); return new Request(request, { headers });
      },
      async after(response) {
        order.push("after"); const body = await response.json() as { result: Employee[] };
        return new Response(JSON.stringify(body.result));
      }
    });
    async function search(query: string): Promise<Employee[]> {
      begun++; order.push("begin");
      try {
        order.push("beforeInit");
        const options: RequestOptions<Employee[]> = {
          url: new URL("employees", "https://example.test/api/"), method: "POST", json: { query: query.trim() },
          decode: async response => { order.push("decode"); return await response.json() as Employee[]; }
        };
        const decoded = await comm.request(options);
        order.push("success");
        return decoded.map(row => ({ ...row, name: row.name.trim() }));
      } finally { ended++; order.push("complete"); }
    }
    expect(await search(" Ada ")).toEqual([{ name: "Ada" }]);
    expect(order).toEqual(["begin", "beforeInit", "prepare", "fetch", "after", "decode", "success", "complete"]);
    expect({ begun, ended }).toEqual({ begun: 1, ended: 1 });
  });

  it("completes preinit stop and explicit HTTP recovery", async () => {
    const stop = new Error("No empty query"), fetch = vi.fn(async () => new Response("unavailable", { status: 503 }));
    vi.stubGlobal("fetch", fetch);
    const comm = createCommunicator();
    let begun = 0, ended = 0, recovered = 0;
    async function search(query: string): Promise<Employee[]> {
      begun++;
      try {
        if (!query.trim()) throw stop;
        return await comm.request<Employee[]>({
          url: "https://example.test/employees", method: "POST", json: { query: query.trim() }
        });
      } catch (cause) {
        if (cause instanceof FrameworkError && cause.code === "REQUEST_HTTP" && cause.detail?.status === 503) {
          recovered++; return [{ name: "Application fallback" }];
        }
        throw cause;
      } finally { ended++; }
    }
    await expect(search(" ")).rejects.toBe(stop);
    expect(fetch).not.toHaveBeenCalled();
    expect(await search("Ada")).toEqual([{ name: "Application fallback" }]);
    expect({ begun, ended, recovered }).toEqual({ begun: 2, ended: 2, recovered: 1 });
  });

  it("counts identical-URL concurrent requests independently within and across scopes", async () => {
    const sent = new Map<string, (response: Response) => void>();
    vi.stubGlobal("fetch", vi.fn(async (request: Request) => {
      const { query } = await request.json() as { query: string };
      return new Promise<Response>(resolve => sent.set(query, resolve));
    }));
    const comm = createCommunicator();
    function scope(communicator: Communicator) {
      const state = { pending: 0, completed: 0 };
      async function request<Result>(options: RequestOptions<Result>): Promise<Result> {
        state.pending++;
        try { return await communicator.request<Result>(options); }
        finally { state.pending--; state.completed++; }
      }
      return { state, request };
    }
    const first = scope(comm), second = scope(comm), caller = new AbortController();
    const a = first.request({ url: "https://example.test/same", method: "POST", json: { query: "A" }, signal: caller.signal });
    const b = first.request({ url: "https://example.test/same", method: "POST", json: { query: "B" } });
    const c = second.request({ url: "https://example.test/same", method: "POST", json: { query: "C" } });
    await vi.waitFor(() => expect(sent.size).toBe(3));
    expect([first.state.pending, second.state.pending]).toEqual([2, 1]);
    caller.abort(); await expect(a).rejects.toMatchObject({ name: "AbortError" });
    expect([first.state.pending, second.state.pending]).toEqual([1, 1]);
    sent.get("B")!(new Response("[]")); await b;
    expect([first.state.pending, second.state.pending]).toEqual([0, 1]);
    sent.get("C")!(new Response("[]")); await c;
    sent.get("A")!(new Response("[]"));
    await Promise.resolve(); await Promise.resolve();
    expect([first.state, second.state]).toEqual([{ pending: 0, completed: 2 }, { pending: 0, completed: 1 }]);
  });

  it("preserves an unrecovered failure while a supplied completion failure rejects successful or recovered results", async () => {
    const comm = createCommunicator(), completion = new Error("Application completion failed");
    let ended = 0;
    async function load(recover: boolean, complete: () => void): Promise<Employee[]> {
      let failed = false;
      try { return await comm.request<Employee[]>({ url: "https://example.test/employees" }); }
      catch (cause) {
        failed = true;
        if (recover && cause instanceof FrameworkError && cause.code === "REQUEST_HTTP") {
          failed = false; return [{ name: "Recovered" }];
        }
        throw cause;
      } finally {
        ended++;
        try { complete(); } catch (cause) { if (!failed) throw cause; }
      }
    }
    const complete = () => { throw completion; };
    vi.stubGlobal("fetch", vi.fn(async () => new Response("[]")));
    await expect(load(false, complete)).rejects.toBe(completion);
    vi.stubGlobal("fetch", vi.fn(async () => new Response("unavailable", { status: 503 })));
    await expect(load(false, complete)).rejects.toMatchObject({ code: "REQUEST_HTTP", detail: { status: 503 } });
    await expect(load(true, complete)).rejects.toBe(completion);
    expect(ended).toBe(3);
  });

  it("uses native timeout cancellation and completes a hung decoder once", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("[]")));
    const comm = createCommunicator();
    let ended = 0, decoding = 0;
    async function load(): Promise<Employee[]> {
      try {
        return await comm.request<Employee[]>({
          url: "https://example.test/employees", signal: AbortSignal.timeout(20),
          decode: () => { decoding++; return new Promise<Employee[]>(() => undefined); }
        });
      } finally { ended++; }
    }
    await expect(load()).rejects.toMatchObject({ name: "AbortError" });
    expect(ended).toBe(1);
    expect(decoding).toBe(1);
  });
});
