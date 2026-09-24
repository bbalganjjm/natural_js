// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";
import { mountPage } from "../page/index.js";
import type { PageDefinition, PageHandle } from "../page/index.js";

export interface PopupHandle<Output> {
  readonly ready: Promise<void>;
  readonly result: Promise<Output | undefined>;
  close(): Promise<void>;
  dispose(): Promise<void>;
}

type End<Output> =
  | { kind: "output"; value: Output }
  | { kind: "close" }
  | { kind: "abort" }
  | { kind: "error"; cause: unknown };

const active = new WeakSet<HTMLDialogElement>();

function popupError(code: string, message: string, cause?: unknown): FrameworkError {
  return new FrameworkError({ code, api: "openPopup", message, cause });
}

function aborted(): DOMException {
  return new DOMException("Popup operation aborted", "AbortError");
}

export function openPopup<Input = unknown, Output = unknown>(
  dialog: HTMLDialogElement,
  definition: PageDefinition<Input, Output>,
  input?: Input
): PopupHandle<Output> {
  if (!(dialog instanceof HTMLDialogElement) || !dialog.isConnected) {
    throw popupError("POPUP_HOST", "Popup requires a connected dialog");
  }
  if (dialog.open || active.has(dialog)) {
    throw popupError("POPUP_ACTIVE", "Popup dialog is already in use");
  }
  const hosts = [...dialog.children].filter(child => child.hasAttribute("data-page-host"));
  if (hosts.length !== 1 || !(hosts[0] instanceof HTMLElement)) {
    throw popupError("POPUP_HOST", "Dialog needs one direct page host");
  }
  const host = hosts[0];
  if (definition.view instanceof HTMLElement) {
    if (!host.contains(definition.view)) {
      throw popupError("POPUP_HOST", "Borrowed page root must be inside the page host");
    }
  } else if (host.childElementCount || host.textContent?.trim()) {
    throw popupError("POPUP_HOST", "Generated page host must be empty");
  }

  const opener = dialog.ownerDocument.activeElement;
  const openerDialog = opener?.closest("dialog[open]");
  const nextFocus = opener?.nextElementSibling;
  const previousFocus = opener?.previousElementSibling;
  function keepFocusVisible(): void {
    const focused = dialog.ownerDocument.activeElement;
    if (focused instanceof HTMLElement && dialog.contains(focused)) {
      focused.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }
  active.add(dialog);
  try {
    dialog.showModal();
    if (!dialog.open) throw popupError("POPUP_OPEN", "Dialog opening was prevented");
    keepFocusVisible();
  } catch (cause) {
    active.delete(dialog);
    if (cause instanceof FrameworkError) throw cause;
    throw popupError("POPUP_OPEN", "Dialog could not open", cause);
  }

  let page: PageHandle<Output> | undefined;
  let end: End<Output> | null = null;
  let closeSeen = false;
  let nativeClosing = false;
  let noCloseEvent = false;
  let cleanup: Promise<void> | undefined;
  let cleanupError: unknown;
  let cleanupDone = false;
  let settled = false;
  let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
  let resolveResult!: (value: Output | undefined) => void;
  let rejectResult!: (cause: unknown) => void;
  const result = new Promise<Output | undefined>((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });

  function attached(): boolean {
    return dialog.isConnected && host.isConnected && dialog.contains(host);
  }

  function restoreFocus(): void {
    if (!(opener instanceof HTMLElement) || !opener.isConnected) {
      for (const fallback of [nextFocus, previousFocus, openerDialog]) {
        if (!(fallback instanceof HTMLElement) || !fallback.isConnected) continue;
        if (fallback instanceof HTMLDialogElement && !fallback.open) continue;
        fallback.focus({ preventScroll: true });
        if (dialog.ownerDocument.activeElement === fallback) return;
      }
      return;
    }
    const focusedDialog = dialog.ownerDocument.activeElement?.closest("dialog[open]");
    if (focusedDialog && !focusedDialog.contains(opener)) return;
    opener.focus({ preventScroll: true });
  }

  function settle(): void {
    if (settled || !end || !cleanupDone) return;
    if ((end.kind === "output" || end.kind === "close") && !closeSeen && !noCloseEvent) return;
    settled = true;
    if (fallbackTimer) clearTimeout(fallbackTimer);
    dialog.removeEventListener("beforetoggle", onBeforeToggle);
    dialog.removeEventListener("close", onClose);
    dialog.removeEventListener("keydown", onKeydown);
    observer.disconnect();
    active.delete(dialog);
    restoreFocus();
    if (cleanupError !== undefined) {
      rejectResult(cleanupError);
    } else if (end.kind === "output") {
      resolveResult(end.value);
    } else if (end.kind === "close") {
      resolveResult(undefined);
    } else if (end.kind === "abort") {
      rejectResult(aborted());
    } else {
      rejectResult(end.cause);
    }
  }

  function startCleanup(): void {
    if (cleanup || !page) return;
    cleanup = page.dispose();
    void cleanup.then(
      () => { cleanupDone = true; settle(); },
      cause => { cleanupError = cause; cleanupDone = true; settle(); }
    );
  }

  function reserve(cause: End<Output>): void {
    end ??= cause;
    startCleanup();
  }

  function scheduleCloseFallback(): void {
    if (fallbackTimer || closeSeen) return;
    fallbackTimer = setTimeout(() => {
      fallbackTimer = undefined;
      if (!dialog.open) {
        closeSeen = true;
        settle();
      }
    }, 0);
  }

  function onBeforeToggle(event: Event): void {
    if ((event as ToggleEvent).newState !== "closed") return;
    nativeClosing = true;
    reserve({ kind: "close" });
  }

  function onClose(): void {
    if (dialog.open) return;
    closeSeen = true;
    reserve({ kind: "close" });
    settle();
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== "Tab" || !dialog.open ||
        !(event.target instanceof Element) || event.target.closest("dialog[open]") !== dialog) return;
    const tabbables = [...dialog.querySelectorAll<HTMLElement>(
      "a[href], area[href], button, input, select, textarea, summary, iframe, [tabindex], [contenteditable]"
    )].filter(element => element.tabIndex >= 0 && !element.matches(":disabled") &&
      !element.closest("[hidden], [inert]") && element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility === "visible");
    const first = tabbables[0];
    const last = tabbables.at(-1);
    if (!first || !last) {
      event.preventDefault();
      dialog.focus();
      return;
    }
    const focused = dialog.ownerDocument.activeElement;
    if (event.shiftKey ? focused === first : focused === last) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  }

  const observer = new MutationObserver(() => {
    if (!attached()) {
      if (!end) reserve({ kind: "abort" });
      noCloseEvent = true;
      if (dialog.open) dialog.close();
      settle();
      return;
    }
    if (!dialog.open) {
      reserve({ kind: "close" });
      if (!nativeClosing) scheduleCloseFallback();
    }
  });
  dialog.addEventListener("beforetoggle", onBeforeToggle);
  dialog.addEventListener("close", onClose);
  dialog.addEventListener("keydown", onKeydown);
  observer.observe(dialog.ownerDocument.documentElement, {
    attributes: true, attributeFilter: ["open"], childList: true, subtree: true
  });

  try {
    page = mountPage(host, definition, input);
  } catch (cause) {
    dialog.removeEventListener("beforetoggle", onBeforeToggle);
    dialog.removeEventListener("close", onClose);
    dialog.removeEventListener("keydown", onKeydown);
    observer.disconnect();
    if (fallbackTimer) clearTimeout(fallbackTimer);
    active.delete(dialog);
    if (dialog.open) dialog.close();
    restoreFocus();
    throw popupError("POPUP_PAGE", "Popup page could not start", cause);
  }
  const ready = page.ready;
  page.onOutput(value => {
    if (end) return;
    if (!attached()) {
      reserve({ kind: "abort" });
      noCloseEvent = true;
      settle();
      return;
    }
    if (!dialog.open) {
      reserve({ kind: "close" });
      if (!nativeClosing) scheduleCloseFallback();
      return;
    }
    reserve({ kind: "output", value });
    dialog.close();
  });
  if (end) startCleanup();
  void ready.then(() => {
    if (dialog.open && attached() && !end) keepFocusVisible();
  }, cause => {
    if (end) return;
    reserve({ kind: "error", cause });
    if (dialog.open) dialog.close();
    noCloseEvent = true;
    settle();
  });

  return {
    ready,
    result,
    close() {
      if (settled) return Promise.resolve();
      if (!end) reserve({ kind: "close" });
      if (dialog.open) dialog.close();
      else if (!nativeClosing) scheduleCloseFallback();
      return result.then(() => {});
    },
    dispose() {
      if (settled) return Promise.resolve();
      if (!end) {
        reserve({ kind: "abort" });
        noCloseEvent = true;
      }
      if (dialog.open) dialog.close();
      settle();
      if (end?.kind === "output" || end?.kind === "close") return result.then(() => {});
      return cleanup ?? Promise.resolve();
    }
  };
}
