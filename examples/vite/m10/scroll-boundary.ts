// SPDX-License-Identifier: Apache-2.0
export function containWheel(root: HTMLElement, signal: AbortSignal): void {
  root.addEventListener("wheel", event => {
    if (event.ctrlKey || event.defaultPrevented) return;
    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    const delta = horizontal ? event.deltaX : event.deltaY;
    if (!delta) return;
    const canMove = (element: HTMLElement) => {
      const position = horizontal ? element.scrollLeft : element.scrollTop;
      const maximum = horizontal ? element.scrollWidth - element.clientWidth : element.scrollHeight - element.clientHeight;
      return delta < 0 ? position > 0 : position < maximum - 1;
    };
    if (canMove(root)) return;
    for (let element = event.target instanceof Element ? event.target : null;
      element && element !== root; element = element.parentElement) {
      if (!(element instanceof HTMLElement)) continue;
      const style = root.ownerDocument.defaultView!.getComputedStyle(element);
      if (["auto", "scroll"].includes(horizontal ? style.overflowX : style.overflowY) && canMove(element)) return;
    }
    event.preventDefault();
  }, { passive: false, signal });
}
