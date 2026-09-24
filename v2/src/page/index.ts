// SPDX-License-Identifier: Apache-2.0
export interface PageContext<Input = unknown, Output = unknown> {
  readonly root: HTMLElement;
  readonly input: Readonly<Input>;
  readonly signal: AbortSignal;
  own(dispose: () => void | Promise<void>): void;
  output(value: Output): void;
}

export interface PageController {
  init?(): void | Promise<void>;
  activate?(): void | Promise<void>;
  deactivate?(): void | Promise<void>;
  dispose?(): void | Promise<void>;
}

export interface PageDefinition<Input = unknown, Output = unknown> {
  view: URL | HTMLElement | (() => HTMLElement);
  controller(context: PageContext<Input, Output>): PageController;
}

export interface PageHandle<Output = unknown> {
  readonly ready: Promise<void>;
  readonly root: HTMLElement | null;
  onOutput(listener: (value: Output) => void): () => void;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  reload(): Promise<void>;
  dispose(): Promise<void>;
}
