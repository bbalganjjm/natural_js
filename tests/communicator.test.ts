// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";
import { createCommunicator } from "../src/comm/index.ts";
import { FrameworkError } from "../src/internal/framework-error.ts";

afterEach(() => vi.unstubAllGlobals());

describe("createCommunicator", () => {
  it("resolves a base URL and runs request and response hooks", async () => {
    const order: string[] = [];
    const fetchMock = vi.fn(async (request: Request) => {
      order.push("fetch");
      expect(request.url).toBe("https://example.test/api/employees");
      expect(request.method).toBe("POST");
      expect(request.headers.get("Content-Type")).toBe("application/json");
      expect(request.headers.get("X-App")).toBe("test");
      expect(await request.json()).toEqual([{ id: 1 }]);
      return new Response('{"count":1}', { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const comm = createCommunicator({
      baseURL: new URL("https://example.test/api/"),
      prepare: request => {
        order.push("prepare");
        const headers = new Headers(request.headers);
        headers.set("X-App", "test");
        return new Request(request, { headers });
      },
      after: response => {
        order.push("after");
        return response;
      }
    });
    const result = await comm.request<{ count: number }>({
      url: "employees", method: "POST", json: [{ id: 1 }]
    });

    expect(result).toEqual({ count: 1 });
    expect(order).toEqual(["prepare", "fetch", "after"]);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("uses GET and default JSON decoding, with explicit raw-body decoding", async () => {
    const fetchMock = vi.fn()
      .mockImplementationOnce(async (request: Request) => {
        expect(request.method).toBe("GET");
        return new Response('{"ok":true}');
      })
      .mockImplementationOnce(async (request: Request) => {
        expect(request.method).toBe("POST");
        expect(await request.text()).toBe("raw");
        expect(request.headers.get("Content-Type")).toBe("text/plain;charset=UTF-8");
        return new Response("saved");
      });
    vi.stubGlobal("fetch", fetchMock);
    const comm = createCommunicator();

    expect(await comm.request<{ ok: boolean }>({ url: "https://example.test/a" }))
      .toEqual({ ok: true });
    expect(await comm.request<string>({
      url: "https://example.test/b",
      method: "POST",
      body: "raw",
      decode: response => response.text()
    })).toBe("saved");
  });

  it("rejects conflicting payloads before calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(createCommunicator().request({
      url: "https://example.test/", method: "POST", json: {}, body: "raw"
    })).rejects.toMatchObject({
      code: "REQUEST_OPTIONS", api: "Communicator.request"
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    [new Response("failed", { status: 503 }), "REQUEST_HTTP"],
    [new Response("invalid", { status: 200 }), "REQUEST_PARSE"],
    [new Response(null, { status: 204 }), "REQUEST_EMPTY"],
    [new Response("", { status: 200 }), "REQUEST_EMPTY"]
  ])("reports response failures as %s", async (response, code) => {
    vi.stubGlobal("fetch", vi.fn(async () => response));
    await expect(createCommunicator().request({
      url: "https://example.test/"
    })).rejects.toMatchObject({ code, api: "Communicator.request" });
  });

  it("lets a decoder handle 204 and preserves custom decoder failures", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);
    const comm = createCommunicator();

    expect(await comm.request<void>({
      url: "https://example.test/", decode: () => undefined
    })).toBeUndefined();
    const cause = new Error("invalid envelope");
    try {
      await comm.request({
        url: "https://example.test/", decode: () => { throw cause; }
      });
      throw new Error("expected request to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(FrameworkError);
      expect(error).toMatchObject({ code: "REQUEST_DECODE", cause });
    }
  });

  it("preserves hook and network causes", async () => {
    const cause = new Error("hook");
    const fetchMock = vi.fn(async () => { throw cause; });
    vi.stubGlobal("fetch", fetchMock);
    await expect(createCommunicator({
      prepare: () => { throw cause; }
    }).request({ url: "https://example.test/" }))
      .rejects.toMatchObject({ code: "REQUEST_PREPARE", cause });
    expect(fetchMock).not.toHaveBeenCalled();

    await expect(createCommunicator().request({ url: "https://example.test/" }))
      .rejects.toMatchObject({ code: "REQUEST_NETWORK", cause });
  });

  it.each([503, 204])("prioritizes cancellation over HTTP or empty responses (%s)", async status => {
    const controller = new AbortController();
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(status === 204 ? null : "failure", { status })));
    const comm = createCommunicator({
      after: response => {
        controller.abort();
        return response;
      }
    });

    await expect(comm.request({
      url: "https://example.test/", signal: controller.signal
    })).rejects.toMatchObject({ name: "AbortError" });
  });
  it("rejects an already aborted request without running hooks or fetch", async () => {
    const controller = new AbortController();
    controller.abort(new Error("custom reason"));
    const prepare = vi.fn(request => request);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(createCommunicator({ prepare }).request({
      url: "https://example.test/", signal: controller.signal
    })).rejects.toMatchObject({ name: "AbortError" });
    expect(prepare).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("aborts promptly during a pending preparation hook", async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const comm = createCommunicator({
      prepare: () => new Promise<Request>(() => undefined)
    });
    const request = comm.request({
      url: "https://example.test/", signal: controller.signal
    });
    await Promise.resolve();
    controller.abort();

    await expect(request).rejects.toMatchObject({ name: "AbortError" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps caller cancellation after a hook replaces the Request", async () => {
    const controller = new AbortController();
    let sent: Request | undefined;
    vi.stubGlobal("fetch", vi.fn((request: Request) => {
      sent = request;
      return new Promise<Response>(() => undefined);
    }));
    const comm = createCommunicator({
      prepare: request => new Request(request, { signal: new AbortController().signal })
    });
    const pending = comm.request({
      url: "https://example.test/", signal: controller.signal
    });
    await vi.waitFor(() => expect(sent).toBeDefined());
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(sent?.signal.aborted).toBe(true);
  });
});

describe("captured communicator hook contracts", () => {
  it("captures hook getters once and calls prepare after and decode without a receiver", async () => {
    const receivers: unknown[] = [], order: string[] = [];
    let prepareReads = 0, afterReads = 0, decodeReads = 0;
    const options = {
      get prepare() {
        prepareReads++;
        return function(this: unknown, request: Request) { receivers.push(this); order.push("prepare"); return request; };
      },
      get after() {
        afterReads++;
        return function(this: unknown, response: Response) { receivers.push(this); order.push("after"); return response; };
      }
    };
    const comm = createCommunicator(options);
    Object.defineProperty(options, "prepare", { value: () => { throw new Error("Late replacement"); } });
    Object.defineProperty(options, "after", { value: null });
    vi.stubGlobal("fetch", vi.fn(async () => { order.push("fetch"); return new Response('{"count":1}'); }));
    for (let index = 0; index < 2; index++) {
      const result = await comm.request<number>({
        url: "https://example.test/employees",
        get decode() {
          decodeReads++;
          return async function(this: unknown, response: Response) {
            receivers.push(this); order.push("decode");
            return (await response.json() as { count: number }).count;
          };
        }
      });
      expect(result).toBe(1);
    }
    expect({ prepareReads, afterReads, decodeReads }).toEqual({ prepareReads: 1, afterReads: 1, decodeReads: 2 });
    expect(receivers).toEqual(Array(6).fill(undefined));
    expect(order).toEqual(["prepare", "fetch", "after", "decode", "prepare", "fetch", "after", "decode"]);
  });

  it("keeps absent hooks absent and shared captures independent with explicit live application policy", async () => {
    const added = vi.fn((request: Request) => request);
    const absent: { prepare?: (request: Request) => Request } = {};
    const first = createCommunicator(absent);
    absent.prepare = added;
    let reads = 0, calls = 0, token = "first";
    const shared = Object.freeze({
      get prepare() { reads++; return (request: Request) => { calls++; request.headers.set("X-Policy", token); return request; }; }
    });
    const second = createCommunicator(shared), third = createCommunicator(shared);
    const sent: (string | null)[] = [];
    vi.stubGlobal("fetch", vi.fn(async (request: Request) => { sent.push(request.headers.get("X-Policy")); return new Response("{}"); }));
    await Promise.all([first.request({ url: "https://example.test/same" }),
      second.request({ url: "https://example.test/same" }), third.request({ url: "https://example.test/same" })]);
    expect(added).not.toHaveBeenCalled();
    expect(sent.filter(value => value === "first")).toHaveLength(2);
    token = "second";
    await second.request({ url: "https://example.test/same" });
    expect(sent.at(-1)).toBe("second");
    expect({ reads, calls }).toEqual({ reads: 2, calls: 3 });
  });

  it("rejects nonfunction supplied hooks and decoders before transport work", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    for (const name of ["prepare", "after"]) for (const value of [null, false, 0, "bad", {}]) {
      expect(() => createCommunicator({ [name]: value } as never)).toThrowError(
        expect.objectContaining({ code: "REQUEST_OPTIONS", api: "createCommunicator" }));
    }
    const prepare = vi.fn((request: Request) => request);
    for (const decode of [null, false, 0, "bad", {}]) {
      await expect(createCommunicator({ prepare }).request({
        url: "https://example.test/employees", decode
      } as never)).rejects.toMatchObject({ code: "REQUEST_OPTIONS", api: "Communicator.request" });
    }
    const cancelled = new AbortController();
    cancelled.abort();
    await expect(createCommunicator({ prepare }).request({
      url: "https://example.test/employees", signal: cancelled.signal, decode: 0
    } as never)).rejects.toMatchObject({ name: "AbortError" });
    expect(prepare).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(["prepare", "after"] as const)("keeps %s return validation in its existing phase", async phase => {
    const fetch = vi.fn(async () => new Response("{}")), decode = vi.fn(() => 1);
    vi.stubGlobal("fetch", fetch);
    const comm = createCommunicator(phase === "prepare"
      ? { prepare: (() => ({})) as never } : { after: (() => ({})) as never });
    await expect(comm.request({ url: "https://example.test/employees", decode }))
      .rejects.toMatchObject({ code: phase === "prepare" ? "REQUEST_PREPARE" : "REQUEST_AFTER", cause: expect.any(TypeError) });
    expect(fetch).toHaveBeenCalledTimes(phase === "prepare" ? 0 : 1);
    expect(decode).not.toHaveBeenCalled();
  });

  it.each(["after", "decode"] as const)("aborts a pending %s and ignores its later result", async phase => {
    const controller = new AbortController();
    let enter!: () => void, release!: () => void;
    const entered = new Promise<void>(resolve => { enter = resolve; });
    const after = (response: Response) => phase === "after"
      ? new Promise<Response>(resolve => { enter(); release = () => resolve(response); }) : response;
    const decode = vi.fn(() => phase === "decode"
      ? new Promise<unknown>(resolve => { enter(); release = () => resolve({ late: true }); }) : { decoded: true });
    const fetch = vi.fn(async () => new Response("{}"));
    vi.stubGlobal("fetch", fetch);
    const pending = createCommunicator({ after }).request<unknown>({
      url: "https://example.test/employees", signal: controller.signal, decode
    });
    await entered;
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    release();
    await Promise.resolve(); await Promise.resolve();
    expect(fetch).toHaveBeenCalledOnce();
    expect(decode).toHaveBeenCalledTimes(phase === "decode" ? 1 : 0);
  });
});

describe("custom request sender", () => {
  it("captures a supplied sender once invokes it plainly and keeps response phases", async () => {
    const order: string[] = [], receivers: unknown[] = [];
    let reads = 0;
    const options = {
      prepare(request: Request) { order.push("prepare"); return new Request(request, { credentials: "include", cache: "no-store", mode: "cors" }); },
      get send() { reads++; return async function(this: unknown, request: Request) {
        receivers.push(this); order.push("send");
        expect(request.url).toBe("https://example.test/employees");
        expect([request.credentials, request.cache, request.mode]).toEqual(["include", "no-store", "cors"]);
        return new Response('{"value":2}');
      }; },
      after(response: Response) { order.push("after"); return response; }
    };
    const comm = createCommunicator(options);
    Object.defineProperty(options, "send", { value: null });
    vi.stubGlobal("fetch", vi.fn());
    for (let i = 0; i < 2; i++) expect(await comm.request({
      url: "https://example.test/employees",
      decode: async response => { order.push("decode"); return (await response.json() as { value: number }).value; }
    })).toBe(2);
    expect(reads).toBe(1); expect(receivers).toEqual([undefined, undefined]);
    expect(order).toEqual(["prepare", "send", "after", "decode", "prepare", "send", "after", "decode"]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("looks up default fetch at execution and ignores a later sender addition", async () => {
    const options: { send?: (request: Request) => Promise<Response> } = {};
    const comm = createCommunicator(options), late = vi.fn(async () => new Response("{}"));
    options.send = late;
    const first = vi.fn(async () => new Response("1")), second = vi.fn(async () => new Response("2"));
    vi.stubGlobal("fetch", first); expect(await comm.request({ url: "https://example.test/same" })).toBe(1);
    vi.stubGlobal("fetch", second); expect(await comm.request({ url: "https://example.test/same" })).toBe(2);
    expect(first).toHaveBeenCalledOnce(); expect(second).toHaveBeenCalledOnce(); expect(late).not.toHaveBeenCalled();
  });

  it("validates supplied senders and their response before later phases", async () => {
    for (const send of [null, false, 0, {}, "bad"]) expect(() => createCommunicator({ send } as never))
      .toThrowError(expect.objectContaining({ code: "REQUEST_OPTIONS", api: "createCommunicator" }));
    const after = vi.fn((response: Response) => response), decode = vi.fn(() => 1);
    await expect(createCommunicator({ send: (async () => ({})) as never, after }).request({
      url: "https://example.test/employees", decode
    })).rejects.toMatchObject({ code: "REQUEST_NETWORK", cause: expect.any(TypeError) });
    expect(after).not.toHaveBeenCalled(); expect(decode).not.toHaveBeenCalled();
    const cause = new Error("custom connection failed");
    await expect(createCommunicator({ send: async () => { throw cause; } }).request({ url: "https://example.test/employees" }))
      .rejects.toMatchObject({ code: "REQUEST_NETWORK", cause });
  });

  it("passes replacement Request cancellation and ignores a late custom response", async () => {
    const controller = new AbortController();
    let enter!: () => void, release!: (response: Response) => void, active!: AbortSignal;
    const entered = new Promise<void>(resolve => { enter = resolve; });
    const after = vi.fn((response: Response) => response), decode = vi.fn(() => 1);
    const comm = createCommunicator({
      prepare: () => new Request("https://example.test/replaced"), after,
      send(request) { active = request.signal; enter(); return new Promise(resolve => { release = resolve; }); }
    });
    const pending = comm.request({ url: "https://example.test/employees", signal: controller.signal, decode });
    await entered; controller.abort(); await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(active.aborted).toBe(true); release(new Response("{}")); await Promise.resolve(); await Promise.resolve();
    expect(after).not.toHaveBeenCalled(); expect(decode).not.toHaveBeenCalled();
    const send = vi.fn(async () => new Response("{}"));
    await expect(createCommunicator({ send }).request({ url: "https://example.test/employees", signal: controller.signal }))
      .rejects.toMatchObject({ name: "AbortError" });
    expect(send).not.toHaveBeenCalled();
  });

  it("uses frozen shared sender options independently", async () => {
    const requests: Request[] = [];
    const options = Object.freeze({ send: async (request: Request) => { requests.push(request); return new Response("{}"); } });
    const first = createCommunicator(options), second = createCommunicator(options);
    await Promise.all([first.request({ url: "https://example.test/same" }), second.request({ url: "https://example.test/same" })]);
    expect(requests).toHaveLength(2); expect(requests[0]).not.toBe(requests[1]);
  });

});
