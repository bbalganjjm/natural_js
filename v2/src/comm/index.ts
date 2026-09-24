// SPDX-License-Identifier: Apache-2.0
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
