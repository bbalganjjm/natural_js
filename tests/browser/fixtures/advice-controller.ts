import type { PageContext } from "../../../src/page/index.js";

export class AdviceConstructorValue {
  constructor(readonly value: number) {}
}

export class AdviceController {
  #count = 0;
  readonly ConstructorValue = AdviceConstructorValue;
  readonly actions: { value: string; search(value: unknown): string; finish(): void };

  constructor(readonly context: PageContext<{ name: string }>, events: string[]) {
    this.actions = {
      value: context.input.name,
      search(value) { return this.value + ":" + value; },
      finish: () => { events.push(context.input.name + ":owned"); }
    };
    context.own(() => this.actions.finish());
  }

  init() { this.#count++; }
  activate() {}
  deactivate() {}
  dispose() { this.#count++; }
  count() { return this.#count; }
}
