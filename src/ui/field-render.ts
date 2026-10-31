// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import type { RuleContext } from "./index.js";
import { interactiveContent } from "./native-control.js";

type Renderer = (value: unknown, context: RuleContext) => Node | string | null;
const rendering = new WeakMap<HTMLElement, { current?: () => boolean }>();
const protectedContent = `${interactiveContent}, [data-field], [data-error-for], [data-select-row], [data-check-row], [data-row-action], [data-check-all], [data-filter-column], [data-filter-search], [data-clear-filter], [data-sort-column], [data-resize-column]`;

function renderError(api: string, field: string, message: string, cause?: unknown): FrameworkError {
  return new FrameworkError({ api, code: "UI_RENDER", message, detail: { field }, cause });
}

/** Compile only explicit field renderers; ordinary text binding has no extra work. */
export function fieldRenderers(api: string, targets: readonly { name: string; element: HTMLElement; formatted?: boolean }[],
  render?: Record<string, Renderer>): ReadonlyMap<string, Renderer> {
  const configured = new Map<string, Renderer>();
  if (render === undefined) return configured;
  if (!render || typeof render !== "object" || Array.isArray(render)) {
    throw renderError(api, "", "render needs a field-to-function object.");
  }
  for (const [name, renderer] of Object.entries(render)) {
    const matches = targets.filter(target => target.name === name);
    if (typeof renderer !== "function" || matches.length !== 1) {
      throw renderError(api, name, "A renderer needs exactly one bound display field and a function.");
    }
    const { element, formatted = element.hasAttribute("data-format") } = matches[0];
    if (formatted || element.isContentEditable || element.matches("input, select, textarea, img, [data-error-for]") || element.querySelector(protectedContent)) {
      throw renderError(api, name, "A render target cannot own formatting, native values or another field/control/error region.");
    }
    configured.set(name, renderer);
  }
  return configured;
}

/** Keep existing field content until the returned value passes ownership checks. */
export function renderField(api: string, element: HTMLElement, value: unknown, context: RuleContext,
  renderer: Renderer, displayOnly = false, current?: () => boolean): void {
  const field = context.field;
  const previous = rendering.get(element);
  if (previous && (!previous.current || previous.current())) {
    throw renderError(api, field, "A field renderer cannot recursively update its own target.");
  }
  const invocation = { current };
  rendering.set(element, invocation);
  try {
    let result: ReturnType<Renderer>;
    try { result = renderer(value, context); }
    catch (cause) { throw renderError(api, field, "The field renderer failed.", cause); }
    if (current && !current()) {
      void Promise.resolve(result).catch(() => {});
      return;
    }
    if (result !== null && typeof result !== "string") {
      const NodeType = element.ownerDocument.defaultView?.Node ?? Node;
      if (!(result instanceof NodeType) || result.ownerDocument !== element.ownerDocument ||
          result.parentNode !== null || result.isConnected || result === element || result.contains(element) ||
          result.nodeType !== NodeType.ELEMENT_NODE && result.nodeType !== NodeType.TEXT_NODE && result.nodeType !== NodeType.DOCUMENT_FRAGMENT_NODE) {
        void Promise.resolve(result).catch(() => {});
        throw renderError(api, field, "Return text, null or a fresh disconnected same-document element, text node or fragment.");
      }
      if (displayOnly && result.nodeType !== NodeType.TEXT_NODE) {
        const content = result as Element | DocumentFragment;
        if ("matches" in content && content.matches(protectedContent) || content.querySelector(protectedContent)) {
          throw renderError(api, field, "A merged display field cannot render interactive or bound content.");
        }
      }
    }
    if (current && !current()) return;
    try {
      if (result === null) element.replaceChildren();
      else element.replaceChildren(result);
    } catch (cause) { throw renderError(api, field, "The rendered content could not replace this field.", cause); }
  } finally { if (rendering.get(element) === invocation) rendering.delete(element); }
}
