# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: communicator-protocol.spec.ts >> native XHR open credentials satisfy a local browser-managed Basic challenge
- Location: tests\browser\communicator-protocol.spec.ts:194:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

  Object {
    "authorization": "Basic Zml4dHVyZTpzZWNyZXQ=",
    "nativeStatus": 200,
-   "nativeURL": "http://127.0.0.1:62812/auth",
+   "nativeURL": "http://fixture:secret@127.0.0.1:62812/auth",
    "syntheticURL": "",
  }
```

# Test source

```ts
  106 |     return { query: JSON.parse(received.get("q")!), repeated: received.getAll("x"), empty: received.get("empty"),
  107 |       header: get.headers["x-employee"], accept: get.headers.accept, form: { body: form.body, type: form.headers["content-type"] },
  108 |       raw: { body: raw.body, hasType: Object.hasOwn(raw.headers, "content-type") } };
  109 |   }, endpoint);
  110 |   expect(result).toEqual({ query: { value: "A&B #+%=한글", ids: [1, 2] }, repeated: ["1", "2"], empty: "",
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
  204 |     return { authorization: echo.value.headers.authorization, nativeURL, nativeStatus, syntheticURL: echo.syntheticURL };
  205 |   }, { modules, base: endpoint });
> 206 |   expect(result).toEqual({ authorization: "Basic Zml4dHVyZTpzZWNyZXQ=", nativeURL: endpoint + "/auth", nativeStatus: 200, syntheticURL: "" });
      |                  ^ Error: expect(received).toEqual(expected) // deep equality
  207 | });
  208 | 
  209 | test("native upload and download observers report bytes while fetch supports unknown-length reads", async ({ page }) => {
  210 |   const result = await page.evaluate(async base => {
  211 |     const h = window.employeeProtocols, upload: number[] = [], download: number[] = [];
  212 |     const comm = h.create({ send: request => h.send(request, { progress(phase, loaded) { (phase === "upload" ? upload : download).push(loaded); } }) });
  213 |     const sent = await comm.request<Echo>({ url: base + "/echo", method: "POST", body: new Blob([new Uint8Array(262144)]) });
  214 |     download.length = 0;
  215 |     const received = await comm.request({ url: base + "/download?known=1", decode: async response => (await response.arrayBuffer()).byteLength });
  216 |     const totals: (number | null)[] = [], loaded: number[] = [];
  217 |     const streamed = await h.create().request({ url: base + "/download", decode: async response => {
  218 |       const reader = response.body!.getReader(); let count = 0;
  219 |       try { for (;;) { const item = await reader.read(); if (item.done) break;
  220 |         count += item.value.byteLength; loaded.push(count); totals.push(response.headers.has("Content-Length") ? Number(response.headers.get("Content-Length")) : null);
  221 |       } } finally { reader.releaseLock(); }
  222 |       return count;
  223 |     } });
  224 |     const increasing = (values: number[]) => values.length > 0 && values.every((value, index) => index === 0 || value >= values[index - 1]);
  225 |     return { sent: atob(sent.base64).length, received, streamed,
  226 |       upload: increasing(upload) && upload.at(-1) === 262144,
  227 |       download: increasing(download) && download.at(-1) === 262144,
  228 |       streamedProgress: increasing(loaded) && totals.every(total => total === null) };
  229 |   }, endpoint);
  230 |   expect(result).toEqual({ sent: 262144, received: 262144, streamed: 262144, upload: true, download: true, streamedProgress: true });
  231 | });
  232 | 
  233 | test("aborted native transfer stops observers while another same-URL request completes", async ({ page }) => {
  234 |   const result = await page.evaluate(async base => {
  235 |     const h = window.employeeProtocols, controller = new AbortController();
  236 |     let reports = 0, firstAfter = 0, completed = 0, siblingDone = false;
  237 |     let firstStarted!: () => void, siblingStarted!: () => void;
  238 |     const firstUpload = new Promise<void>(resolve => { firstStarted = resolve; });
  239 |     const siblingUpload = new Promise<void>(resolve => { siblingStarted = resolve; });
  240 |     const first = h.create({ send: request => h.send(request, { progress(phase, loaded) {
  241 |       reports++; if (phase === "upload" && loaded > 0) firstStarted();
  242 |     } }), after(response) { firstAfter++; return response; } });
  243 |     const firstResult = first.request({ url: base + "/held", method: "POST", body: new Blob([new Uint8Array(262144)]), signal: controller.signal })
  244 |       .then(() => "delivered", (cause: Error) => cause.name).finally(() => { completed++; });
  245 |     const sibling = h.create({ send: request => h.send(request, { progress(phase, loaded) {
  246 |       if (phase === "upload" && loaded > 0) siblingStarted();
  247 |     } }) }).request<Echo>({ url: base + "/held", method: "POST", body: "sibling" }).finally(() => { siblingDone = true; });
  248 |     await Promise.all([firstUpload, siblingUpload]);
  249 |     const concurrent = !siblingDone;
  250 |     controller.abort(); const aborted = await firstResult, stoppedAt = reports;
  251 |     await fetch(base + "/release");
  252 |     const received = await sibling;
  253 |     return { concurrent, aborted, completed, reports: reports > 0, quiet: reports === stoppedAt, firstAfter, sibling: received.body };
  254 |   }, endpoint);
  255 |   expect(result).toEqual({ concurrent: true, aborted: "AbortError", completed: 1, reports: true, quiet: true, firstAfter: 0, sibling: "sibling" });
  256 | });
  257 | 
  258 | test("native observer failure releases work and unsupported fetch policies stay explicit", async ({ page }) => {
  259 |   const result = await page.evaluate(async base => {
  260 |     const h = window.employeeProtocols, errors: { code: string; cause: string }[] = [];
  261 |     for (const request of [new Request(base + "/echo", { credentials: "omit" }), new Request(base + "/echo", { cache: "no-store" })]) {
  262 |       try { await h.create({ prepare: () => request, send: active => h.send(active) }).request({ url: request.url }); }
  263 |       catch (cause) { const error = cause as { code: string; cause: Error }; errors.push({ code: error.code, cause: error.cause.name }); }
  264 |     }
  265 |     let after = 0, failure: unknown;
  266 |     try { await h.create({ send: request => h.send(request, { response() { throw new Error("Application observer failed"); } }),
  267 |       after(response) { after++; return response; } }).request({ url: base + "/echo" }); }
  268 |     catch (cause) { const error = cause as { code: string; cause: Error }; failure = { code: error.code, message: error.cause.message }; }
  269 |     return { errors, after, failure };
  270 |   }, endpoint);
  271 |   expect(result).toEqual({ errors: [0, 1].map(() => ({ code: "REQUEST_NETWORK", cause: "TypeError" })),
  272 |     after: 0, failure: { code: "REQUEST_NETWORK", message: "Application observer failed" } });
  273 | });
  274 | 
  275 | test("request-local URL predicate suppresses stale delivery without disposing the page", async ({ page }) => {
  276 |   const result = await page.evaluate(async base => {
  277 |     const h = window.employeeProtocols, started = location.href.replaceAll("!", "");
  278 |     let delivered = 0, completed = 0, aborted = "";
  279 |     async function load(): Promise<void> {
  280 |       try {
  281 |         await h.create().request({ url: base + "/slow" });
  282 |         if (location.href.replaceAll("!", "") !== started) throw new DOMException("Employee route changed", "AbortError");
  283 |         delivered++;
  284 |       } finally { completed++; }
  285 |     }
  286 |     const pending = load(); history.pushState(null, "", "#employee-next");
  287 |     try { await pending; } catch (cause) { aborted = (cause as Error).name; }
  288 |     finally { history.replaceState(null, "", started); }
  289 |     return { aborted, delivered, completed, restored: location.href.replaceAll("!", "") === started };
  290 |   }, endpoint);
  291 |   expect(result).toEqual({ aborted: "AbortError", delivered: 0, completed: 1, restored: true });
  292 | });
  293 | 
  294 | test("CORS denial blocks response delivery while denied preflight prevents the protected send", async ({ page }) => {
  295 |   const start = seen.length;
  296 |   const errors = await page.evaluate(async base => {
  297 |     const h = window.employeeProtocols, errors: string[] = [];
  298 |     for (const protectedSend of [false, true]) {
  299 |       const comm = h.create({ prepare: request => { if (protectedSend) request.headers.set("X-Protected", "employee"); return request; } });
  300 |       try { await comm.request({ url: base + (protectedSend ? "/blocked" : "/denied"),
  301 |         method: protectedSend ? "POST" : "GET", json: protectedSend ? { employee: 1 } : undefined }); }
  302 |       catch (cause) { errors.push((cause as { code: string }).code); }
  303 |     }
  304 |     return errors;
  305 |   }, endpoint);
  306 |   expect(errors).toEqual(["REQUEST_NETWORK", "REQUEST_NETWORK"]);
```