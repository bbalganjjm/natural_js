// SPDX-License-Identifier: Apache-2.0
import { mountPage } from "@bbalganjjm/natural_js/page";
import type { PageHandle } from "@bbalganjjm/natural_js/page";
import { createEmployees } from "./employees.js";

const hosts = document.querySelector<HTMLElement>("[data-hosts]");
const template = document.querySelector<HTMLTemplateElement>("template[data-screen]");
const openButton = document.querySelector<HTMLButtonElement>('[data-action="open"]');
if (!hosts || !template || !openButton) throw new Error("The example shell is incomplete.");
const serverView = new URL(location.href).searchParams.get("view") === "server";

function open(): void {
  const host = document.createElement("div");
  host.className = "screen-host";
  hosts!.append(host);
  let page: PageHandle | undefined;
  page = mountPage(host, {
    view: serverView
      ? new URL("/m4/side-fragment.html", document.baseURI)
      : () => template!.content.firstElementChild!.cloneNode(true) as HTMLElement,
    controller: createEmployees
  }, {
    close() {
      void page?.dispose().finally(() => {
        host.remove();
        openButton!.focus({ preventScroll: true });
      });
    }
  });
  void page.ready.catch(cause => {
    if (cause instanceof Error && cause.name === "AbortError") return;
    const message = document.createElement("p");
    message.textContent = cause instanceof Error ? cause.message : String(cause);
    host.append(message);
  });
}

openButton.addEventListener("click", open);
open();