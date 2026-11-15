// SPDX-License-Identifier: Apache-2.0
type Attachment = (element: HTMLElement, phase: "connected" | "disconnected") => void;
let observer: Attachment | undefined;
class SourceHookTarget extends HTMLElement {
  connectedCallback() { observer?.(this, "connected"); }
  disconnectedCallback() { observer?.(this, "disconnected"); }
}
customElements.define("source-hook-target", SourceHookTarget);
export function observeSourceAttachments(next?: Attachment): void { observer = next; }
