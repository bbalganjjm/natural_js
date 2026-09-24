// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";

export interface RequestOptions<Result> {
  url: string | URL;
  method?: string;
  json?: unknown;
  body?: BodyInit;
  signal?: AbortSignal;
  decode?: (response: Response) => Result | Promise<Result>;
}

export interface Communicator {
  request<Result>(options: RequestOptions<Result>): Promise<Result>;
}

export function createCommunicator(options: {
  baseURL?: URL;
  prepare?: (request: Request) => Request | Promise<Request>;
  after?: (response: Response) => Response | Promise<Response>;
} = {}): Communicator {
  return {
    async request<Result>(requestOptions: RequestOptions<Result>): Promise<Result> {
      const { url, method = "GET", json, body, signal, decode } = requestOptions;
      if (signal?.aborted) throw abortError();
      if (json !== undefined && body !== undefined) {
        throw new FrameworkError({
          code: "REQUEST_OPTIONS",
          api: "Communicator.request",
          message: "Use either json or body, not both."
        });
      }

      let requestBody = body;
      const headers = new Headers();
      if (json !== undefined) {
        requestBody = await perform("REQUEST_JSON", "The json value cannot be encoded.", signal, () => {
          const encoded = JSON.stringify(json);
          if (encoded === undefined) throw new TypeError("json is not serializable");
          return encoded;
        });
        headers.set("Content-Type", "application/json");
      }

      let request = await perform("REQUEST_INIT",
        "The request could not be created. Check its URL, method, and body.", signal,
        () => new Request(options.baseURL ? new URL(url, options.baseURL) : url,
          { method, body: requestBody, headers, signal }));

      if (options.prepare) {
        request = await perform("REQUEST_PREPARE", "The request preparation hook failed.", signal,
          async () => {
            const prepared = await options.prepare!(request);
            if (!(prepared instanceof Request)) throw new TypeError("prepare must return a Request");
            return prepared;
          });
      }

      // A preparation hook may replace the Request, but it must not drop cancellation.
      const activeSignal = signal
        ? AbortSignal.any([signal, request.signal])
        : request.signal;
      request = await perform("REQUEST_INIT", "The prepared request could not be used.", activeSignal,
        () => new Request(request, { signal: activeSignal }));

      let response = await perform("REQUEST_NETWORK", "The request could not be sent.", activeSignal,
        () => fetch(request));
      if (options.after) {
        response = await perform("REQUEST_AFTER", "The response hook failed.", activeSignal,
          async () => {
            const processed = await options.after!(response);
            if (!(processed instanceof Response)) throw new TypeError("after must return a Response");
            return processed;
          });
      }

      if (activeSignal.aborted) throw abortError();
      if (!response.ok) {
        throw new FrameworkError({
          code: "REQUEST_HTTP",
          api: "Communicator.request",
          message: "The server returned HTTP " + response.status + ".",
          detail: { status: response.status, statusText: response.statusText }
        });
      }

      if (decode) {
        return perform("REQUEST_DECODE", "The response decoder failed.", activeSignal,
          () => decode(response));
      }
      if (response.status === 204 || response.status === 205) throw emptyResponse();

      const content = await perform("REQUEST_PARSE", "The response body could not be read.", activeSignal,
        () => response.text());
      if (activeSignal.aborted) throw abortError();
      if (!content.trim()) throw emptyResponse();
      return perform("REQUEST_PARSE", "The response is not valid JSON.", activeSignal,
        () => JSON.parse(content) as Result);
    }
  };
}

function emptyResponse(): FrameworkError {
  return new FrameworkError({
    code: "REQUEST_EMPTY",
    api: "Communicator.request",
    message: "The response has no JSON body. Provide a decoder for an empty response."
  });
}

function abortError(): DOMException {
  return new DOMException("The operation was aborted.", "AbortError");
}

function isAbort(cause: unknown, signal?: AbortSignal): boolean {
  return Boolean(signal?.aborted || (cause instanceof Error && cause.name === "AbortError"));
}

async function perform<Value>(
  code: string,
  message: string,
  signal: AbortSignal | undefined,
  operation: () => Value | Promise<Value>
): Promise<Value> {
  try {
    if (signal?.aborted) throw abortError();
    if (!signal) return await operation();
    return await new Promise<Value>((resolve, reject) => {
      const onAbort = () => reject(abortError());
      signal.addEventListener("abort", onAbort, { once: true });
      try {
        Promise.resolve(operation()).then(resolve, reject).finally(() => {
          signal.removeEventListener("abort", onAbort);
        });
      } catch (cause) {
        signal.removeEventListener("abort", onAbort);
        reject(cause);
      }
    });
  } catch (cause) {
    if (isAbort(cause, signal)) throw abortError();
    throw new FrameworkError({ code, api: "Communicator.request", message, cause });
  }
}
