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
