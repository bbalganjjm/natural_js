// SPDX-License-Identifier: Apache-2.0
export class FrameworkError extends Error {
  readonly code: string;
  readonly api: string;
  readonly detail?: Readonly<Record<string, unknown>>;

  constructor(options: {
    code: string;
    api: string;
    message: string;
    cause?: unknown;
    detail?: Readonly<Record<string, unknown>>;
  }) {
    const { code, api, message, cause, detail } = options;
    if (typeof code !== "string" || !code.trim() ||
        typeof api !== "string" || !api.trim() ||
        typeof message !== "string" || !message.trim()) {
      throw new TypeError("FrameworkError requires code, api, and message");
    }
    super(message, { cause });
    this.name = "FrameworkError";
    this.code = code;
    this.api = api;
    this.detail = detail;
  }
}
