# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: communicator-protocol.spec.ts >> native request recipes preserve query JSON repeated keys headers and explicit bodies
- Location: tests\browser\communicator-protocol.spec.ts:94:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

@@ -13,11 +13,11 @@
      ],
      "value": "A&B #+%=한글",
    },
    "raw": Object {
      "body": "literal & text",
-     "hasType": false,
+     "hasType": true,
    },
    "repeated": Array [
      "1",
      "2",
    ],
```

# Test source

```ts
  10  | declare global {
  11  |   interface Window { employeeProtocols: { create: typeof createCommunicator; send: typeof sendEmployee }; }
  12  | }
  13  | const source = (file: string) => "http://127.0.0.1:4173/@fs/" + fileURLToPath(new URL(file, import.meta.url)).replaceAll("\\", "/");
  14  | const modules = { comm: source("../../src/comm/index.ts"), xhr: source("../../examples/vite/m4/employee-xhr.ts") };
  15  | let server: Server, endpoint: string;
  16  | const seen: string[] = [];
  17  | const held = new Set<() => void>();
  18  | let released = false;
  19  | 
  20  | test.beforeAll(async () => {
  21  |   server = createServer(async (request, response) => {
  22  |     const url = new URL(request.url ?? "/", "http://fixture");
  23  |     seen.push(request.method + ":" + url.pathname);
  24  |     if (url.pathname !== "/denied" && url.pathname !== "/blocked") {
  25  |       response.setHeader("Access-Control-Allow-Origin", request.headers.origin ?? "http://127.0.0.1:4173");
  26  |       response.setHeader("Access-Control-Allow-Credentials", "true");
  27  |       response.setHeader("Access-Control-Allow-Headers", request.headers["access-control-request-headers"] ?? "*");
  28  |       response.setHeader("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS");
  29  |       response.setHeader("Access-Control-Expose-Headers", "ETag, X-Fixture");
  30  |     }
  31  |     response.setHeader("Cache-Control", "no-store");
  32  |     if (request.method === "OPTIONS") { response.statusCode = url.pathname === "/blocked" ? 403 : 204; response.end(); return; }
  33  |     if (url.pathname === "/") { response.setHeader("Content-Type", "text/html"); response.end('<!doctype html><html lang="en"><title>Employee protocol fixture</title><body></body></html>'); return; }
  34  |     try {
  35  |       const chunks: Buffer[] = [];
  36  |       for await (const chunk of request) chunks.push(Buffer.from(chunk));
  37  |       const body = Buffer.concat(chunks);
  38  |       if (url.pathname === "/auth" && request.headers.authorization !== "Basic " + Buffer.from("fixture:secret").toString("base64")) {
  39  |         response.statusCode = 401; response.setHeader("WWW-Authenticate", 'Basic realm="employee-fixture"'); response.end(); return;
  40  |       }
  41  |       if (url.pathname === "/etag") {
  42  |         response.setHeader("ETag", '"employee-v1"');
  43  |         if (request.headers["if-none-match"] === '"employee-v1"') { response.statusCode = 304; response.end(); return; }
  44  |       }
  45  |       if (url.pathname === "/xml" || url.pathname === "/xml-bad") {
  46  |         response.setHeader("Content-Type", "text/plain"); response.end(url.pathname === "/xml" ? "<people><name>김</name></people>" : "<people>"); return;
  47  |       }
  48  |       if (url.pathname === "/latin") { response.setHeader("Content-Type", "text/plain;charset=windows-1252"); response.end(Buffer.from([99, 97, 102, 233])); return; }
  49  |       if (url.pathname === "/empty" || url.pathname === "/empty205" || request.method === "HEAD") { response.statusCode = url.pathname === "/empty" ? 204 : url.pathname === "/empty205" ? 205 : 200; response.setHeader("X-Fixture", "head"); response.end(); return; }
  50  |       if (url.pathname.startsWith("/status/")) response.statusCode = Number(url.pathname.slice(8));
  51  |       if (url.pathname === "/download") {
  52  |         response.setHeader("Content-Type", "application/octet-stream");
  53  |         if (url.searchParams.has("known")) response.setHeader("Content-Length", 262144);
  54  |         for (let index = 0; index < 4 && !response.destroyed; index++) {
  55  |           response.write(Buffer.alloc(65536, 65)); await new Promise(resolve => setTimeout(resolve, 5));
  56  |         }
  57  |         response.end(); return;
  58  |       }
  59  |       if (url.pathname === "/network-error") { request.socket.destroy(); return; }
  60  |       if (url.pathname === "/release") { released = true; for (const release of held) release(); }
  61  |       if (url.pathname === "/held" && !released || url.pathname === "/timeout-held") {
  62  |         if (response.destroyed) return;
  63  |         await new Promise<void>(resolve => {
  64  |           const release = () => { held.delete(release); resolve(); };
  65  |           held.add(release); response.once("close", release);
  66  |         });
  67  |         if (response.destroyed) return;
  68  |       }
  69  |       if (url.pathname === "/slow") await new Promise(resolve => setTimeout(resolve, 100));
  70  |       response.setHeader("Content-Type", "application/json"); response.setHeader("X-Fixture", "employee");
  71  |       response.end(JSON.stringify({ method: request.method, query: url.search, headers: request.headers,
  72  |         body: body.toString("utf8"), base64: body.toString("base64") }));
  73  |     } catch (cause) {
  74  |       if (!response.destroyed) { response.statusCode = 500; response.end(String(cause)); }
  75  |     }
  76  |   });
  77  |   await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  78  |   const address = server.address(); if (!address || typeof address === "string") throw new Error("Missing protocol address");
  79  |   endpoint = "http://127.0.0.1:" + address.port;
  80  | });
  81  | test.afterAll(async () => {
  82  |   for (const release of held) release();
  83  |   await new Promise<void>((resolve, reject) => server.close(cause => cause ? reject(cause) : resolve()));
  84  | });
  85  | test.beforeEach(async ({ page }) => {
  86  |   await page.routeWebSocket(/127\.0\.0\.1:4173/, socket => socket.close());
  87  |   await page.goto("/");
  88  |   await page.evaluate(async modules => {
  89  |     const [{ createCommunicator }, { sendEmployee }] = await Promise.all([import(modules.comm), import(modules.xhr)]);
  90  |     window.employeeProtocols = { create: createCommunicator, send: sendEmployee };
  91  |   }, modules);
  92  | });
  93  | 
  94  | test("native request recipes preserve query JSON repeated keys headers and explicit bodies", async ({ page }) => {
  95  |   const result = await page.evaluate(async base => {
  96  |     const h = window.employeeProtocols, query = { value: "A&B #+%=한글", ids: [1, 2] };
  97  |     const url = new URL("/echo", base); url.searchParams.set("q", JSON.stringify(query));
  98  |     url.searchParams.append("x", "1"); url.searchParams.append("x", "2"); url.searchParams.set("empty", "");
  99  |     const comm = h.create({ prepare: request => { request.headers.set("X-Employee", "employee"); request.headers.set("Accept", "application/json"); return request; } });
  100 |     const get = await comm.request<Echo>({ url });
  101 |     const params = new URLSearchParams(); params.append("tag", "one"); params.append("tag", "two"); params.set("name", "A&B");
  102 |     const form = await comm.request<Echo>({ url: new URL("/echo", base), method: "POST", body: params });
  103 |     const raw = await h.create({ prepare: request => { request.headers.delete("Content-Type"); return request; } })
  104 |       .request<Echo>({ url: new URL("/echo", base), method: "POST", body: "literal & text" });
  105 |     const received = new URL("http://fixture/" + get.query).searchParams;
  106 |     return { query: JSON.parse(received.get("q")!), repeated: received.getAll("x"), empty: received.get("empty"),
  107 |       header: get.headers["x-employee"], accept: get.headers.accept, form: { body: form.body, type: form.headers["content-type"] },
  108 |       raw: { body: raw.body, hasType: Object.hasOwn(raw.headers, "content-type") } };
  109 |   }, endpoint);
> 110 |   expect(result).toEqual({ query: { value: "A&B #+%=한글", ids: [1, 2] }, repeated: ["1", "2"], empty: "",
      |                  ^ Error: expect(received).toEqual(expected) // deep equality
  111 |     header: "employee", accept: "application/json", form: { body: "tag=one&tag=two&name=A%26B", type: "application/x-www-form-urlencoded;charset=UTF-8" },
  112 |     raw: { body: "literal & text", hasType: false } });
  113 | });
  114 | 
  115 | test("default fetch and opt-in XHR preserve generated multipart headers and file bytes", async ({ page }) => {
  116 |   const result = await page.evaluate(async base => {
  117 |     const h = window.employeeProtocols, results = [];
  118 |     for (const native of [false, true]) {
  119 |       const body = new FormData(); body.append("name", "한글"); body.append("file", new File([new Uint8Array([0, 255, 128, 65])], "report.bin"));
  120 |       const echo = await h.create({ send: native ? request => h.send(request) : undefined })
  121 |         .request<Echo>({ url: base + "/echo", method: "POST", body });
  122 |       const binary = atob(echo.base64), text = new TextDecoder().decode(Uint8Array.from(binary, char => char.charCodeAt(0)));
  123 |       const boundary = echo.headers["content-type"].split("boundary=")[1];
  124 |       results.push({ type: echo.headers["content-type"].startsWith("multipart/form-data;"),
  125 |         boundary: binary.startsWith("--" + boundary) && binary.includes("--" + boundary + "--"),
  126 |         name: text.includes("한글"), file: binary.includes('filename="report.bin"') && binary.includes(String.fromCharCode(0, 255, 128, 65)) });
  127 |     }
  128 |     return results;
  129 |   }, endpoint);
  130 |   expect(result).toEqual([0, 1].map(() => ({ type: true, boundary: true, name: true, file: true })));
  131 | });
  132 | 
  133 | test("second-origin credentials use native browser CORS and explicit include or omit", async ({ page, context }) => {
  134 |   await context.addCookies([{ name: "employee-protocol", value: "yes", url: endpoint }]);
  135 |   const result = await page.evaluate(async base => {
  136 |     const h = window.employeeProtocols, cookies = [];
  137 |     for (const credentials of ["omit", "same-origin", "include"] as const) {
  138 |       const echo = await h.create({ prepare: request => new Request(request, { credentials }) }).request<Echo>({ url: base + "/echo" });
  139 |       cookies.push(echo.headers.cookie?.includes("employee-protocol=yes") ?? false);
  140 |     }
  141 |     const echo = await h.create({ prepare: request => new Request(request, { credentials: "include" }), send: request => h.send(request) })
  142 |       .request<Echo>({ url: base + "/echo" });
  143 |     return { cookies, xhrIncluded: echo.headers.cookie?.includes("employee-protocol=yes") ?? false };
  144 |   }, endpoint);
  145 |   expect(result).toEqual({ cookies: [false, false, true], xhrIncluded: true });
  146 | });
  147 | 
  148 | test("explicit endpoint cache handles 304 before HTTP validation and exposes selected status headers", async ({ page }) => {
  149 |   const result = await page.evaluate(async base => {
  150 |     const h = window.employeeProtocols, statuses: number[] = [];
  151 |     let cached = "", etag = "";
  152 |     const comm = h.create({
  153 |       prepare(request) { if (etag) request.headers.set("If-None-Match", etag); return request; },
  154 |       async after(response) {
  155 |         statuses.push(response.status);
  156 |         if (response.status === 304) return new Response(cached, { headers: { "Content-Type": "application/json" } });
  157 |         etag = response.headers.get("ETag") ?? ""; cached = await response.clone().text(); return response;
  158 |       }
  159 |     });
  160 |     const first = await comm.request<Echo>({ url: base + "/etag" }), second = await comm.request<Echo>({ url: base + "/etag" });
  161 |     let failure: unknown;
  162 |     try { await h.create().request({ url: base + "/status/409" }); }
  163 |     catch (cause) { const error = cause as { code: string; detail: unknown }; failure = { code: error.code, detail: error.detail }; }
  164 |     const recovered = await h.create({ after: response => response.status === 503 ? new Response('{"fallback":true}') : response })
  165 |       .request({ url: base + "/status/503" });
  166 |     return { statuses, etag, same: JSON.stringify(first) === JSON.stringify(second), failure, recovered };
  167 |   }, endpoint);
  168 |   expect(result).toEqual({ statuses: [200, 304], etag: '"employee-v1"', same: true,
  169 |     failure: { code: "REQUEST_HTTP", detail: { status: 409, statusText: "Conflict" } }, recovered: { fallback: true } });
  170 | });
  171 | 
  172 | test("explicit text XML charset and empty decoders keep errors and native values distinct", async ({ page }) => {
  173 |   const result = await page.evaluate(async base => {
  174 |     const h = window.employeeProtocols, comm = h.create();
  175 |     const latin = await comm.request({ url: base + "/latin", decode: async response => new TextDecoder("windows-1252").decode(await response.arrayBuffer()) });
  176 |     const xml = async (response: Response) => {
  177 |       const document = new DOMParser().parseFromString(await response.text(), "application/xml");
  178 |       if (document.getElementsByTagName("parsererror").length) throw new Error("Invalid employee XML");
  179 |       return document.querySelector("name")?.textContent;
  180 |     };
  181 |     const name = await comm.request({ url: base + "/xml", decode: xml });
  182 |     let malformed = "", empty = "";
  183 |     try { await comm.request({ url: base + "/xml-bad", decode: xml }); }
  184 |     catch (cause) { malformed = (cause as { code: string }).code; }
  185 |     try { await comm.request({ url: base + "/empty" }); }
  186 |     catch (cause) { empty = (cause as { code: string }).code; }
  187 |     const none = await comm.request({ url: base + "/empty", decode: () => null });
  188 |     const head = await comm.request({ url: base + "/echo", method: "HEAD", decode: response => ({ status: response.status, marker: response.headers.get("X-Fixture") }) });
  189 |     return { latin, name, malformed, empty, none, head };
  190 |   }, endpoint);
  191 |   expect(result).toEqual({ latin: "café", name: "김", malformed: "REQUEST_DECODE", empty: "REQUEST_EMPTY", none: null, head: { status: 200, marker: "head" } });
  192 | });
  193 | 
  194 | test("native XHR open credentials satisfy a local browser-managed Basic challenge", async ({ page }) => {
  195 |   await page.goto(endpoint + "/");
  196 |   const result = await page.evaluate(async ({ modules, base }) => {
  197 |     const [{ createCommunicator }, { sendEmployee }] = await Promise.all([import(modules.comm), import(modules.xhr)]);
  198 |     let nativeURL = "", nativeStatus = 0;
  199 |     const comm = createCommunicator({
  200 |       send: (request: Request) => sendEmployee(request, { username: "fixture", password: "secret",
  201 |         response(url: string, status: number) { nativeURL = url; nativeStatus = status; } })
  202 |     });
  203 |     const echo = await comm.request({ url: base + "/auth", decode: async (response: Response) => ({ value: await response.json() as Echo, syntheticURL: response.url }) });
  204 |     const resource = new URL(nativeURL);
  205 |     resource.username = resource.password = "";
  206 |     return { authorization: echo.value.headers.authorization, nativeURL: resource.href, nativeStatus, syntheticURL: echo.syntheticURL };
  207 |   }, { modules, base: endpoint });
  208 |   expect(result).toEqual({ authorization: "Basic Zml4dHVyZTpzZWNyZXQ=", nativeURL: endpoint + "/auth", nativeStatus: 200, syntheticURL: "" });
  209 | });
  210 | 
```