// SPDX-License-Identifier: Apache-2.0
import { createServer } from "node:http";
import type { Server } from "node:http";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type { createCommunicator } from "../../src/comm/index.js";
import type { sendEmployee } from "../../examples/vite/m4/employee-xhr.js";

type Echo = { method: string; query: string; headers: Record<string, string>; body: string; base64: string };
declare global {
  interface Window { employeeProtocols: { create: typeof createCommunicator; send: typeof sendEmployee }; }
}
const source = (file: string) => "http://127.0.0.1:4173/@fs/" + fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/");
const modules = { comm: source("../../src/comm/index.ts"), xhr: source("../../examples/vite/m4/employee-xhr.ts") };
let server: Server, endpoint: string;
const seen: string[] = [];
const held = new Set<() => void>();
let released = false;

test.beforeAll(async () => {
  server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://fixture");
    seen.push(request.method + ":" + url.pathname);
    if (url.pathname !== "/denied" && url.pathname !== "/blocked") {
      response.setHeader("Access-Control-Allow-Origin", request.headers.origin ?? "http://127.0.0.1:4173");
      response.setHeader("Access-Control-Allow-Credentials", "true");
      response.setHeader("Access-Control-Allow-Headers", request.headers["access-control-request-headers"] ?? "*");
      response.setHeader("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS");
      response.setHeader("Access-Control-Expose-Headers", "ETag, X-Fixture");
    }
    response.setHeader("Cache-Control", "no-store");
    if (request.method === "OPTIONS") { response.statusCode = url.pathname === "/blocked" ? 403 : 204; response.end(); return; }
    if (url.pathname === "/") { response.setHeader("Content-Type", "text/html"); response.end('<!doctype html><html lang="en"><title>Employee protocol fixture</title><body></body></html>'); return; }
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(Buffer.from(chunk));
      const body = Buffer.concat(chunks);
      if (url.pathname === "/auth" && request.headers.authorization !== "Basic " + Buffer.from("fixture:secret").toString("base64")) {
        response.statusCode = 401; response.setHeader("WWW-Authenticate", 'Basic realm="employee-fixture"'); response.end(); return;
      }
      if (url.pathname === "/etag") {
        response.setHeader("ETag", '"employee-v1"');
        if (request.headers["if-none-match"] === '"employee-v1"') { response.statusCode = 304; response.end(); return; }
      }
      if (url.pathname === "/xml" || url.pathname === "/xml-bad") {
        response.setHeader("Content-Type", "text/plain"); response.end(url.pathname === "/xml" ? "<people><name>김</name></people>" : "<people>"); return;
      }
      if (url.pathname === "/html") {
        response.setHeader("Content-Type", "text/html");
        response.end('<section>Kim</section><script>globalThis.employeeProtocolExecuted = true</script>'); return;
      }
      if (url.pathname === "/latin") { response.setHeader("Content-Type", "text/plain;charset=windows-1252"); response.end(Buffer.from([99, 97, 102, 233])); return; }
      if (url.pathname === "/empty" || url.pathname === "/empty205" || request.method === "HEAD") { response.statusCode = url.pathname === "/empty" ? 204 : url.pathname === "/empty205" ? 205 : 200; response.setHeader("X-Fixture", "head"); response.end(); return; }
      if (url.pathname.startsWith("/status/")) response.statusCode = Number(url.pathname.slice(8));
      if (url.pathname === "/download") {
        response.setHeader("Content-Type", "application/octet-stream");
        if (url.searchParams.has("known")) response.setHeader("Content-Length", 262144);
        for (let index = 0; index < 4 && !response.destroyed; index++) {
          response.write(Buffer.alloc(65536, 65)); await new Promise(resolve => setTimeout(resolve, 5));
        }
        response.end(); return;
      }
      if (url.pathname === "/network-error") { request.socket.destroy(); return; }
      if (url.pathname === "/release") { released = true; for (const release of held) release(); }
      if (url.pathname === "/held" && !released || url.pathname === "/timeout-held") {
        if (response.destroyed) return;
        await new Promise<void>(resolve => {
          const release = () => { held.delete(release); resolve(); };
          held.add(release); response.once("close", release);
        });
        if (response.destroyed) return;
      }
      if (url.pathname === "/slow") await new Promise(resolve => setTimeout(resolve, 100));
      response.setHeader("Content-Type", "application/json"); response.setHeader("X-Fixture", "employee");
      response.end(JSON.stringify({ method: request.method, query: url.search, headers: request.headers,
        body: body.toString("utf8"), base64: body.toString("base64") }));
    } catch (cause) {
      if (!response.destroyed) { response.statusCode = 500; response.end(String(cause)); }
    }
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address(); if (!address || typeof address === "string") throw new Error("Missing protocol address");
  endpoint = "http://127.0.0.1:" + address.port;
});
test.afterAll(async () => {
  for (const release of held) release();
  await new Promise<void>((resolve, reject) => server.close(cause => cause ? reject(cause) : resolve()));
});
test.beforeEach(async ({ page }) => {
  await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  await page.goto("/");
  await page.evaluate(async modules => {
    const [{ createCommunicator }, { sendEmployee }] = await Promise.all([import(modules.comm), import(modules.xhr)]);
    window.employeeProtocols = { create: createCommunicator, send: sendEmployee };
  }, modules);
});

test("native request recipes preserve query JSON repeated keys headers and explicit bodies", async ({ page, browserName }) => {
  const result = await page.evaluate(async base => {
    const h = window.employeeProtocols, query = { value: "A&B #+%=한글", ids: [1, 2] };
    const url = new URL("/echo", base); url.searchParams.set("q", JSON.stringify(query));
    url.searchParams.append("x", "1"); url.searchParams.append("x", "2"); url.searchParams.set("empty", "");
    const comm = h.create({ prepare: request => { request.headers.set("X-Employee", "employee"); request.headers.set("Accept", "application/json"); return request; } });
    const get = await comm.request<Echo>({ url });
    const params = new URLSearchParams(); params.append("tag", "one"); params.append("tag", "two"); params.set("name", "A&B");
    const form = await comm.request<Echo>({ url: new URL("/echo", base), method: "POST", body: params });
    let preparedType: string | null = "unset";
    const raw = await h.create({ prepare: request => { request.headers.delete("Content-Type"); return request; },
      send: request => { preparedType = request.headers.get("Content-Type"); return fetch(request); } })
      .request<Echo>({ url: new URL("/echo", base), method: "POST", body: "literal & text" });
    const control = new Request(new URL("/echo", base), { method: "POST", body: "literal & text" });
    control.headers.delete("Content-Type");
    const native = await (await fetch(control)).json() as Echo;
    const received = new URL("http://fixture/" + get.query).searchParams;
    return { query: JSON.parse(received.get("q")!), repeated: received.getAll("x"), empty: received.get("empty"),
      header: get.headers["x-employee"], accept: get.headers.accept, form: { body: form.body, type: form.headers["content-type"] },
      raw: { body: raw.body, base64: raw.base64, type: raw.headers["content-type"] ?? null, preparedType },
      native: { body: native.body, base64: native.base64, type: native.headers["content-type"] ?? null } };
  }, endpoint);
  expect(result.raw).toEqual({ ...result.native, preparedType: null });
  const type = browserName === "webkit" && process.platform === "win32" ? "application/x-www-form-urlencoded" : null;
  if (type) test.info().annotations.push({ type: "platform-conformance-limit", description: "Windows WebKit adds Content-Type after native Request header deletion; native control and framework agree, wire omission is not certified." });
  expect(result).toEqual({ query: { value: "A&B #+%=한글", ids: [1, 2] }, repeated: ["1", "2"], empty: "",
    header: "employee", accept: "application/json", form: { body: "tag=one&tag=two&name=A%26B", type: "application/x-www-form-urlencoded;charset=UTF-8" },
    raw: { body: "literal & text", base64: "bGl0ZXJhbCAmIHRleHQ=", type, preparedType: null },
    native: { body: "literal & text", base64: "bGl0ZXJhbCAmIHRleHQ=", type } });
});

test("default fetch and opt-in XHR preserve generated multipart headers and file bytes", async ({ page }) => {
  const result = await page.evaluate(async base => {
    const h = window.employeeProtocols, results = [];
    for (const native of [false, true]) {
      const body = new FormData(); body.append("name", "한글"); body.append("file", new File([new Uint8Array([0, 255, 128, 65])], "report.bin"));
      const echo = await h.create({ send: native ? request => h.send(request) : undefined })
        .request<Echo>({ url: base + "/echo", method: "POST", body });
      const binary = atob(echo.base64), text = new TextDecoder().decode(Uint8Array.from(binary, char => char.charCodeAt(0)));
      const boundary = echo.headers["content-type"].split("boundary=")[1];
      results.push({ type: echo.headers["content-type"].startsWith("multipart/form-data;"),
        boundary: binary.startsWith("--" + boundary) && binary.includes("--" + boundary + "--"),
        name: text.includes("한글"), file: binary.includes('filename="report.bin"') && binary.includes(String.fromCharCode(0, 255, 128, 65)) });
    }
    return results;
  }, endpoint);
  expect(result).toEqual([0, 1].map(() => ({ type: true, boundary: true, name: true, file: true })));
});

test("second-origin credentials preserve Request policy and report native wire behavior", async ({ page, context, browserName }) => {
  await context.addCookies([{ name: "employee-protocol", value: "yes", url: endpoint }]);
  const result = await page.evaluate(async base => {
    const h = window.employeeProtocols, cookies = [], native = [], prepared: string[] = [];
    for (const credentials of ["omit", "same-origin", "include"] as const) {
      const echo = await h.create({ prepare: request => new Request(request, { credentials }),
        send: request => { prepared.push(request.credentials); return fetch(request); } }).request<Echo>({ url: base + "/echo" });
      cookies.push(echo.headers.cookie?.includes("employee-protocol=yes") ?? false);
      const control = await (await fetch(new Request(base + "/echo", { credentials }))).json() as Echo;
      native.push(control.headers.cookie?.includes("employee-protocol=yes") ?? false);
    }
    const echo = await h.create({ prepare: request => new Request(request, { credentials: "include" }), send: request => h.send(request) })
      .request<Echo>({ url: base + "/echo" });
    return { cookies, native, prepared, xhrIncluded: echo.headers.cookie?.includes("employee-protocol=yes") ?? false };
  }, endpoint);
  expect(result.cookies).toEqual(result.native);
  const cookies = browserName === "webkit" && process.platform === "win32" ? [true, true, true] : [false, false, true];
  if (cookies[0]) test.info().annotations.push({ type: "platform-conformance-limit", description: "Windows WebKit sends cookies for native omit/same-origin controls; delegation agrees, cookie withholding is not certified." });
  expect(result).toEqual({ cookies, native: cookies, prepared: ["omit", "same-origin", "include"], xhrIncluded: true });
});

test("explicit endpoint cache handles 304 before HTTP validation and exposes selected status headers", async ({ page }) => {
  const result = await page.evaluate(async base => {
    const h = window.employeeProtocols, statuses: number[] = [];
    let cached = "", etag = "";
    const comm = h.create({
      prepare(request) { if (etag) request.headers.set("If-None-Match", etag); return request; },
      async after(response) {
        statuses.push(response.status);
        if (response.status === 304) return new Response(cached, { headers: { "Content-Type": "application/json" } });
        etag = response.headers.get("ETag") ?? ""; cached = await response.clone().text(); return response;
      }
    });
    const first = await comm.request<Echo>({ url: base + "/etag" }), second = await comm.request<Echo>({ url: base + "/etag" });
    let failure: unknown;
    try { await h.create().request({ url: base + "/status/409" }); }
    catch (cause) { const error = cause as { code: string; detail: unknown }; failure = { code: error.code, detail: error.detail }; }
    const recovered = await h.create({ after: response => response.status === 503 ? new Response('{"fallback":true}') : response })
      .request({ url: base + "/status/503" });
    return { statuses, etag, same: JSON.stringify(first) === JSON.stringify(second), failure, recovered };
  }, endpoint);
  expect(result).toEqual({ statuses: [200, 304], etag: '"employee-v1"', same: true,
    failure: { code: "REQUEST_HTTP", detail: { status: 409, statusText: "Conflict" } }, recovered: { fallback: true } });
});

test("explicit text XML charset and empty decoders keep errors and native values distinct", async ({ page }) => {
  const result = await page.evaluate(async base => {
    const h = window.employeeProtocols, comm = h.create();
    const latin = await comm.request({ url: base + "/latin", decode: async response => new TextDecoder("windows-1252").decode(await response.arrayBuffer()) });
    const xml = async (response: Response) => {
      const document = new DOMParser().parseFromString(await response.text(), "application/xml");
      if (document.getElementsByTagName("parsererror").length) throw new Error("Invalid employee XML");
      return document.querySelector("name")?.textContent;
    };
    const name = await comm.request({ url: base + "/xml", decode: xml });
    const html = await comm.request({ url: base + "/html", decode: response => response.text() });
    const executed = Reflect.has(globalThis, "employeeProtocolExecuted");
    let malformed = "", empty = "";
    try { await comm.request({ url: base + "/xml-bad", decode: xml }); }
    catch (cause) { malformed = (cause as { code: string }).code; }
    try { await comm.request({ url: base + "/empty" }); }
    catch (cause) { empty = (cause as { code: string }).code; }
    const none = await comm.request({ url: base + "/empty", decode: () => null });
    const head = await comm.request({ url: base + "/echo", method: "HEAD", decode: response => ({ status: response.status, marker: response.headers.get("X-Fixture") }) });
    return { latin, name, html, executed, malformed, empty, none, head };
  }, endpoint);
  expect(result).toEqual({ latin: "café", name: "김", html: '<section>Kim</section><script>globalThis.employeeProtocolExecuted = true</script>',
    executed: false, malformed: "REQUEST_DECODE", empty: "REQUEST_EMPTY", none: null, head: { status: 200, marker: "head" } });
});

test("native XHR open credentials satisfy a local browser-managed Basic challenge", async ({ page }) => {
  await page.goto(endpoint + "/");
  const result = await page.evaluate(async ({ modules, base }) => {
    const [{ createCommunicator }, { sendEmployee }] = await Promise.all([import(modules.comm), import(modules.xhr)]);
    let nativeURL = "", nativeStatus = 0;
    const comm = createCommunicator({
      send: (request: Request) => sendEmployee(request, { username: "fixture", password: "secret",
        response(url: string, status: number) { nativeURL = url; nativeStatus = status; } })
    });
    const echo = await comm.request({ url: base + "/auth", decode: async (response: Response) => ({ value: await response.json() as Echo, syntheticURL: response.url }) });
    const resource = new URL(nativeURL);
    resource.username = resource.password = "";
    return { authorization: echo.value.headers.authorization, nativeURL: resource.href, nativeStatus, syntheticURL: echo.syntheticURL };
  }, { modules, base: endpoint });
  expect(result).toEqual({ authorization: "Basic Zml4dHVyZTpzZWNyZXQ=", nativeURL: endpoint + "/auth", nativeStatus: 200, syntheticURL: "" });
});

test("native upload and download observers report bytes while fetch supports unknown-length reads", async ({ page }) => {
  const result = await page.evaluate(async base => {
    const h = window.employeeProtocols, upload: number[] = [], download: number[] = [];
    const comm = h.create({ send: request => h.send(request, { progress(phase, loaded) { (phase === "upload" ? upload : download).push(loaded); } }) });
    const sent = await comm.request<Echo>({ url: base + "/echo", method: "POST", body: new Blob([new Uint8Array(262144)]) });
    download.length = 0;
    const received = await comm.request({ url: base + "/download?known=1", decode: async response => (await response.arrayBuffer()).byteLength });
    const totals: (number | null)[] = [], loaded: number[] = [];
    const streamed = await h.create().request({ url: base + "/download", decode: async response => {
      const reader = response.body!.getReader(); let count = 0;
      try { for (;;) { const item = await reader.read(); if (item.done) break;
        count += item.value.byteLength; loaded.push(count); totals.push(response.headers.has("Content-Length") ? Number(response.headers.get("Content-Length")) : null);
      } } finally { reader.releaseLock(); }
      return count;
    } });
    const increasing = (values: number[]) => values.length > 0 && values.every((value, index) => index === 0 || value >= values[index - 1]);
    return { sent: atob(sent.base64).length, received, streamed,
      upload: increasing(upload) && upload.at(-1) === 262144,
      download: increasing(download) && download.at(-1) === 262144,
      streamedProgress: increasing(loaded) && totals.every(total => total === null) };
  }, endpoint);
  expect(result).toEqual({ sent: 262144, received: 262144, streamed: 262144, upload: true, download: true, streamedProgress: true });
});

test("aborted native transfer stops observers while another same-URL request completes", async ({ page }) => {
  const result = await page.evaluate(async base => {
    const h = window.employeeProtocols, controller = new AbortController();
    let reports = 0, firstAfter = 0, completed = 0, siblingDone = false;
    let firstStarted!: () => void, siblingStarted!: () => void;
    const firstUpload = new Promise<void>(resolve => { firstStarted = resolve; });
    const siblingUpload = new Promise<void>(resolve => { siblingStarted = resolve; });
    const first = h.create({ send: request => h.send(request, { progress(phase, loaded) {
      reports++; if (phase === "upload" && loaded > 0) firstStarted();
    } }), after(response) { firstAfter++; return response; } });
    const firstResult = first.request({ url: base + "/held", method: "POST", body: new Blob([new Uint8Array(262144)]), signal: controller.signal })
      .then(() => "delivered", (cause: Error) => cause.name).finally(() => { completed++; });
    const sibling = h.create({ send: request => h.send(request, { progress(phase, loaded) {
      if (phase === "upload" && loaded > 0) siblingStarted();
    } }) }).request<Echo>({ url: base + "/held", method: "POST", body: "sibling" }).finally(() => { siblingDone = true; });
    await Promise.all([firstUpload, siblingUpload]);
    const concurrent = !siblingDone;
    controller.abort(); const aborted = await firstResult, stoppedAt = reports;
    await fetch(base + "/release");
    const received = await sibling;
    return { concurrent, aborted, completed, reports: reports > 0, quiet: reports === stoppedAt, firstAfter, sibling: received.body };
  }, endpoint);
  expect(result).toEqual({ concurrent: true, aborted: "AbortError", completed: 1, reports: true, quiet: true, firstAfter: 0, sibling: "sibling" });
});

test("native observer failure releases work and unsupported fetch policies stay explicit", async ({ page }) => {
  const result = await page.evaluate(async base => {
    const h = window.employeeProtocols, errors: { code: string; cause: string }[] = [];
    for (const request of [new Request(base + "/echo", { credentials: "omit" }), new Request(base + "/echo", { cache: "no-store" })]) {
      try { await h.create({ prepare: () => request, send: active => h.send(active) }).request({ url: request.url }); }
      catch (cause) { const error = cause as { code: string; cause: Error }; errors.push({ code: error.code, cause: error.cause.name }); }
    }
    let after = 0, failure: unknown;
    try { await h.create({ send: request => h.send(request, { response() { throw new Error("Application observer failed"); } }),
      after(response) { after++; return response; } }).request({ url: base + "/echo" }); }
    catch (cause) { const error = cause as { code: string; cause: Error }; failure = { code: error.code, message: error.cause.message }; }
    return { errors, after, failure };
  }, endpoint);
  expect(result).toEqual({ errors: [0, 1].map(() => ({ code: "REQUEST_NETWORK", cause: "TypeError" })),
    after: 0, failure: { code: "REQUEST_NETWORK", message: "Application observer failed" } });
});

test("request-local URL predicate suppresses stale delivery without disposing the page", async ({ page }) => {
  const result = await page.evaluate(async base => {
    const h = window.employeeProtocols, started = location.href.replaceAll("!", "");
    let delivered = 0, completed = 0, aborted = "";
    async function load(): Promise<void> {
      try {
        await h.create().request({ url: base + "/slow" });
        if (location.href.replaceAll("!", "") !== started) throw new DOMException("Employee route changed", "AbortError");
        delivered++;
      } finally { completed++; }
    }
    const pending = load(); history.pushState(null, "", "#employee-next");
    try { await pending; } catch (cause) { aborted = (cause as Error).name; }
    finally { history.replaceState(null, "", started); }
    return { aborted, delivered, completed, restored: location.href.replaceAll("!", "") === started };
  }, endpoint);
  expect(result).toEqual({ aborted: "AbortError", delivered: 0, completed: 1, restored: true });
});

test("CORS denial blocks response delivery while denied preflight prevents the protected send", async ({ page }) => {
  const start = seen.length;
  const errors = await page.evaluate(async base => {
    const h = window.employeeProtocols, errors: string[] = [];
    for (const protectedSend of [false, true]) {
      const comm = h.create({ prepare: request => { if (protectedSend) request.headers.set("X-Protected", "employee"); return request; } });
      try { await comm.request({ url: base + (protectedSend ? "/blocked" : "/denied"),
        method: protectedSend ? "POST" : "GET", json: protectedSend ? { employee: 1 } : undefined }); }
      catch (cause) { errors.push((cause as { code: string }).code); }
    }
    return errors;
  }, endpoint);
  expect(errors).toEqual(["REQUEST_NETWORK", "REQUEST_NETWORK"]);
  const observed = seen.slice(start);
  expect(observed).toContain("GET:/denied");
  expect(observed).toContain("OPTIONS:/blocked");
  expect(observed).not.toContain("POST:/blocked");
});

test("body buffering cancellation prevents native transport from starting", async ({ page }) => {
  const start = seen.length;
  const result = await page.evaluate(async base => {
    const controller = new AbortController();
    const request = new Request(base + "/body-cancel", { method: "POST", body: new Uint8Array([1, 2, 3]), signal: controller.signal });
    const pending = window.employeeProtocols.send(request);
    controller.abort();
    try { await pending; return "delivered"; } catch (cause) { return (cause as Error).name; }
  }, endpoint);
  expect(result).toBe("AbortError");
  expect(seen.slice(start)).not.toContain("POST:/body-cancel");
});

test("native sender preserves null-body responses for 204 205 HEAD and 304", async ({ page }) => {
  const result = await page.evaluate(async base => {
    const h = window.employeeProtocols, statuses: number[] = [], nullBodies: boolean[] = [];
    const comm = h.create({
      prepare(request) { if (new URL(request.url).pathname === "/etag") request.headers.set("If-None-Match", '"employee-v1"'); return request; },
      send: request => h.send(request),
      after(response) { statuses.push(response.status); nullBodies.push(response.body === null);
        return response.status === 304 ? new Response(null, { status: 204 }) : response; }
    });
    const values: number[] = [];
    for (const [path, method] of [["/empty", "GET"], ["/empty205", "GET"], ["/echo", "HEAD"], ["/etag", "GET"]]) {
      values.push(await comm.request({ url: base + path, method, decode: response => response.status }));
    }
    return { statuses, nullBodies, values };
  }, endpoint);
  expect(result).toEqual({ statuses: [204, 205, 200, 304], nullBodies: [true, true, true, true], values: [204, 205, 200, 204] });
});

test("a native connection failure releases observers before a later transfer", async ({ page }) => {
  const start = seen.length;
  const result = await page.evaluate(async base => {
    const h = window.employeeProtocols; let reports = 0, after = 0, completed = 0, failure: unknown;
    try { await h.create({ send: request => h.send(request, { progress() { reports++; } }),
      after(response) { after++; return response; } }).request({ url: base + "/network-error", method: "POST", body: "employee" }); }
    catch (cause) { const error = cause as { code: string; cause: Error }; failure = { code: error.code, name: error.cause.name }; }
    finally { completed++; }
    const stoppedAt = reports;
    const later = await h.create({ send: request => h.send(request) }).request<Echo>({ url: base + "/echo" });
    return { failure, after, completed, quiet: reports === stoppedAt, later: later.method };
  }, endpoint);
  expect(seen.slice(start)).toContain("POST:/network-error");
  expect(result).toEqual({ failure: { code: "REQUEST_NETWORK", name: "TypeError" }, after: 0, completed: 1, quiet: true, later: "GET" });
});

test("native timeout begins after upload starts and releases quiet observers", async ({ page }) => {
  const start = seen.length;
  const result = await page.evaluate(async base => {
    const h = window.employeeProtocols, controller = new AbortController();
    let started = false, timeoutFired = false, reports = 0, after = 0, completed = 0, failure = "";
    const comm = h.create({ send: request => h.send(request, { progress(phase, loaded) {
      reports++;
      if (phase === "upload" && loaded > 0 && !started) {
        started = true;
        const deadline = AbortSignal.timeout(20);
        deadline.addEventListener("abort", () => { timeoutFired = deadline.reason.name === "TimeoutError"; controller.abort(deadline.reason); }, { once: true });
      }
    } }), after(response) { after++; return response; } });
    try { await comm.request({ url: base + "/timeout-held", method: "POST", body: new Blob([new Uint8Array(262144)]), signal: controller.signal }); }
    catch (cause) { failure = (cause as Error).name; }
    finally { completed++; }
    const stoppedAt = reports;
    const later = await h.create({ send: request => h.send(request) }).request<Echo>({ url: base + "/echo" });
    return { started, timeoutFired, failure, after, completed, quiet: reports === stoppedAt, later: later.method };
  }, endpoint);
  expect(seen.slice(start)).toContain("POST:/timeout-held");
  expect(result).toEqual({ started: true, timeoutFired: true, failure: "AbortError", after: 0, completed: 1, quiet: true, later: "GET" });
});

test("a throwing native progress callback aborts work and suppresses late observers", async ({ page }) => {
  const result = await page.evaluate(async base => {
    const h = window.employeeProtocols; let reports = 0, after = 0, responseCalls = 0, failure: unknown;
    try { await h.create({ send: request => h.send(request, {
      progress(phase, loaded) { reports++; if (phase === "upload" && loaded > 0) throw new Error("Progress observer failed"); },
      response() { responseCalls++; }
    }), after(response) { after++; return response; } }).request({ url: base + "/slow", method: "POST", body: new Blob([new Uint8Array(262144)]) }); }
    catch (cause) { const error = cause as { code: string; cause: Error }; failure = { code: error.code, message: error.cause.message }; }
    const stoppedAt = reports;
    await h.create({ send: request => h.send(request) }).request({ url: base + "/slow" });
    return { failure, reported: reports > 0, quiet: reports === stoppedAt, after, responseCalls };
  }, endpoint);
  expect(result).toEqual({ failure: { code: "REQUEST_NETWORK", message: "Progress observer failed" }, reported: true, quiet: true, after: 0, responseCalls: 0 });
});
