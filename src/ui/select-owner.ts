// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";

const owners = new WeakMap<HTMLSelectElement, string>();

export function claimSelect(element: HTMLSelectElement, owner: string): () => void {
  const existing = owners.get(element);
  if (existing !== undefined) {
    throw new FrameworkError({
      api: owner,
      code: "SELECT_OWNED",
      message: "This Select is already bound.",
      detail: { owner: existing }
    });
  }
  owners.set(element, owner);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    owners.delete(element);
  };
}
