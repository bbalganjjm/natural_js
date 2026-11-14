// SPDX-License-Identifier: Apache-2.0
// Application example only: finite bodies, default cache, follow redirects and
// same-origin/include credentials. The framework keeps using fetch by default.
export async function sendEmployee(request: Request, policy: {
  username?: string;
  password?: string;
  progress?: (phase: "upload" | "download", loaded: number, total: number | null) => void;
  response?: (url: string, status: number) => void;
} = {}): Promise<Response> {
  const { username, password, progress, response: observeResponse } = policy;
  if (request.credentials === "omit" || request.cache !== "default" || request.redirect !== "follow" ||
      !["cors", "same-origin"].includes(request.mode) || request.integrity || request.referrerPolicy ||
      request.referrer !== "about:client") {
    throw new TypeError("The employee XHR example supports default cache, redirects and referrer with same-origin/include credentials.");
  }
  if (request.mode === "same-origin" && new URL(request.url).origin !== location.origin) {
    throw new TypeError("The employee request must remain on the current origin.");
  }
  request.signal.throwIfAborted();
  // Preserve the browser-generated multipart boundary and all prepared bytes.
  const body = request.body === null ? null : await request.arrayBuffer();
  request.signal.throwIfAborted();
  return new Promise<Response>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let done = false;
    function cleanup(): void {
      request.signal.removeEventListener("abort", abort);
      xhr.upload.removeEventListener("progress", upload);
      xhr.removeEventListener("progress", download);
      xhr.onload = xhr.onerror = xhr.onabort = null;
    }
    function finish(value: Response | null, cause?: unknown): void {
      if (done) return;
      done = true; cleanup();
      if (value) resolve(value);
      else { xhr.abort(); reject(cause); }
    }
    function abort(): void { finish(null, new DOMException("The employee transfer was aborted.", "AbortError")); }
    function report(phase: "upload" | "download", event: ProgressEvent): void {
      if (done || request.signal.aborted) return;
      try { progress?.(phase, event.loaded, event.lengthComputable ? event.total : null); }
      catch (cause) { finish(null, cause); }
    }
    function upload(event: ProgressEvent): void { report("upload", event); }
    function download(event: ProgressEvent): void { report("download", event); }
    request.signal.addEventListener("abort", abort, { once: true });
    if (progress) {
      xhr.upload.addEventListener("progress", upload);
      xhr.addEventListener("progress", download);
    }
    xhr.onload = () => {
      try {
        request.signal.throwIfAborted();
        if (xhr.status === 0) throw new TypeError("The employee connection returned no HTTP response.");
        const headers = new Headers();
        for (const line of xhr.getAllResponseHeaders().trim().split(/\r?\n/)) {
          const colon = line.indexOf(":");
          if (colon > 0) headers.append(line.slice(0, colon), line.slice(colon + 1).trim());
        }
        const body = request.method === "HEAD" || [204, 205, 304].includes(xhr.status) ? null : xhr.response;
        const result = new Response(body, { status: xhr.status, statusText: xhr.statusText, headers });
        // Synthetic Response.url is empty; retain the actual URL in app context.
        observeResponse?.(xhr.responseURL, xhr.status);
        if (request.signal.aborted) return abort();
        finish(result);
      } catch (cause) { finish(null, cause); }
    };
    xhr.onerror = () => finish(null, new TypeError("The employee transfer failed."));
    xhr.onabort = abort;
    try {
      xhr.open(request.method, request.url, true, username, password);
      xhr.responseType = "arraybuffer";
      xhr.withCredentials = request.credentials === "include";
      request.headers.forEach((value, name) => xhr.setRequestHeader(name, value));
      if (request.signal.aborted) return abort();
      xhr.send(body);
    } catch (cause) { finish(null, cause); }
  });
}
