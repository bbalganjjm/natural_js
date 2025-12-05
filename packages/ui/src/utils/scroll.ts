/**
 * Scroll paging utility for lazy loading content.
 */

import { NaturalElement, isBrowser, getWindow } from '@natural-js/shared';
import { isNaturalElement } from '@natural-js/core';
import { ScrollPagingOptions } from './types';

const DEFAULT_OPTIONS: Partial<ScrollPagingOptions> = {
  size: 50,
  idx: 0,
  limit: 50,
  threshold: 100,
};

interface ScrollPagingState {
  idx: number;
  limit: number;
  isLoading: boolean;
}

function toElement(container: Element | NaturalElement): Element | null {
  if (isNaturalElement(container)) {
    return container.get(0) ?? null;
  }
  return container;
}

export function createScrollPaging(options: ScrollPagingOptions): {
  getState: () => ScrollPagingState;
  reset: () => void;
  setLoading: (loading: boolean) => void;
  updateIndex: (idx: number) => void;
  destroy: () => void;
} {
  if (!isBrowser()) {
    return {
      getState: () => ({ idx: 0, limit: 0, isLoading: false }),
      reset: () => {},
      setLoading: () => {},
      updateIndex: () => {},
      destroy: () => {},
    };
  }

  const opts = { ...DEFAULT_OPTIONS, ...options } as ScrollPagingOptions;
  const element = toElement(opts.container);

  const state: ScrollPagingState = {
    idx: opts.idx,
    limit: opts.limit,
    isLoading: false,
  };

  const onScroll = () => {
    if (state.isLoading || !element) return;

    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    const threshold = opts.threshold ?? 100;

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      if (opts.onScrollEnd) {
        state.isLoading = true;
        opts.onScrollEnd();
      }
    }
  };

  if (element) {
    element.addEventListener('scroll', onScroll, { passive: true });
  }

  return {
    getState: () => ({ ...state }),
    reset: () => {
      state.idx = opts.idx;
      state.limit = opts.limit;
      state.isLoading = false;
    },
    setLoading: (loading: boolean) => {
      state.isLoading = loading;
    },
    updateIndex: (idx: number) => {
      state.idx = idx;
    },
    destroy: () => {
      if (element) {
        element.removeEventListener('scroll', onScroll);
      }
    },
  };
}

export function scrollTo(
  container: Element | NaturalElement | 'window',
  position: number,
  smooth: boolean = true
): void {
  if (!isBrowser()) return;

  const win = getWindow();
  if (!win) return;

  if (container === 'window') {
    win.scrollTo({ top: position, behavior: smooth ? 'smooth' : 'auto' });
  } else {
    const el = toElement(container);
    el?.scrollTo({ top: position, behavior: smooth ? 'smooth' : 'auto' });
  }
}

export function scrollIntoView(
  element: Element | NaturalElement,
  options?: ScrollIntoViewOptions
): void {
  if (!isBrowser()) return;

  const el = toElement(element);
  el?.scrollIntoView(options ?? { behavior: 'smooth', block: 'nearest' });
}

export function getScrollPosition(
  container: Element | NaturalElement | 'window'
): { top: number; left: number } {
  if (!isBrowser()) return { top: 0, left: 0 };

  const win = getWindow();
  if (!win) return { top: 0, left: 0 };

  if (container === 'window') {
    return { top: win.scrollY || 0, left: win.scrollX || 0 };
  }

  const el = toElement(container);
  if (el) {
    return { top: el.scrollTop, left: el.scrollLeft };
  }
  return { top: 0, left: 0 };
}

export function isScrolledToBottom(
  container: Element | NaturalElement,
  threshold: number = 0
): boolean {
  if (!isBrowser()) return false;

  const el = toElement(container);
  if (!el) return false;

  return el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
}

export const scroll = {
  createPaging: createScrollPaging,
  scrollTo,
  scrollIntoView,
  getPosition: getScrollPosition,
  isAtBottom: isScrolledToBottom,
};
