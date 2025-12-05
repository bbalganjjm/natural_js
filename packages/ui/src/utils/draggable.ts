/**
 * Draggable utility for making elements draggable.
 */

import { NaturalElement, isBrowser, getDocument, getWindow } from '@natural-js/shared';
import { isString, isNaturalElement } from '@natural-js/core';
import { DraggableOptions, DraggableState, Position } from './types';

/**
 * Default options for draggable.
 */
const DEFAULT_OPTIONS: DraggableOptions = {
  overflowCorrection: true,
  overflowCorrectionAddValues: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  dragOpacity: 0.4,
  axis: 'both',
};

/**
 * Get position from event (mouse or touch).
 */
function getEventPosition(event: MouseEvent | TouchEvent): Position {
  if ('touches' in event && event.touches.length > 0) {
    const touch = event.touches[0];
    return { left: touch?.pageX ?? 0, top: touch?.pageY ?? 0 };
  }
  return { left: (event as MouseEvent).pageX, top: (event as MouseEvent).pageY };
}

/**
 * Ensure we have a NaturalElement.
 */
function toNaturalElement(el: Element | NaturalElement): NaturalElement {
  return isNaturalElement(el) ? el : new NaturalElement(el);
}

/**
 * Make an element draggable.
 */
export function makeDraggable(
  element: Element | NaturalElement,
  options?: DraggableOptions
): () => void {
  if (!isBrowser()) {
    return () => {};
  }

  const doc = getDocument();
  const win = getWindow();
  if (!doc || !win) {
    return () => {};
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const el = toNaturalElement(element);
  
  const state: DraggableState = {
    pressed: false,
    moved: false,
    startX: 0,
    startY: 0,
    initialMargin: '',
  };

  // Determine handle element
  let handleEl: NaturalElement;
  if (opts.handle) {
    if (isString(opts.handle)) {
      handleEl = el.find(opts.handle);
    } else if (isNaturalElement(opts.handle)) {
      handleEl = opts.handle;
    } else {
      handleEl = new NaturalElement(opts.handle as Element);
    }
    if (handleEl.length === 0) {
      handleEl = el;
    }
  } else {
    handleEl = el;
  }

  // Add draggable class
  el.addClass('draggable__');

  const onMouseDown = (e: Event) => {
    const evt = e as MouseEvent | TouchEvent;
    
    if ('touches' in evt) {
      e.preventDefault();
      e.stopPropagation();
    }

    if ('button' in evt && evt.button !== 0) {
      return;
    }

    const target = e.target as Element;
    if (opts.handle && isString(opts.handle) && !target.closest(opts.handle)) {
      return;
    }

    state.pressed = true;
    state.moved = false;
    state.initialMargin = el.css('margin') || '';

    const pos = getEventPosition(evt);
    const offset = el.offset();
    state.startX = pos.left - (offset?.left ?? 0);
    state.startY = pos.top - (offset?.top ?? 0);

    el.data('isDragging', true);

    if (opts.onDragStart) {
      opts.onDragStart(evt, el);
    }

    doc.addEventListener('selectstart', preventSelect);
    doc.addEventListener('dragstart', preventSelect);
    doc.addEventListener('mousemove', onMouseMove);
    doc.addEventListener('touchmove', onMouseMove, { passive: false });
    doc.addEventListener('mouseup', onMouseUp);
    doc.addEventListener('touchend', onMouseUp);
  };

  const preventSelect = (e: Event) => {
    e.preventDefault();
    return false;
  };

  const onMouseMove = (e: Event) => {
    if (!state.pressed) return;

    const evt = e as MouseEvent | TouchEvent;
    if ('touches' in evt) {
      e.preventDefault();
    }

    const pos = getEventPosition(evt);
    let newTop = pos.top - state.startY;
    let newLeft = pos.left - state.startX;

    if (opts.axis === 'x') {
      newTop = el.offset()?.top ?? 0;
    } else if (opts.axis === 'y') {
      newLeft = el.offset()?.left ?? 0;
    }

    el.offset({ top: newTop, left: newLeft });

    if (!state.moved) {
      el.css('opacity', String(opts.dragOpacity ?? 0.4));
      state.moved = true;
    }

    if (opts.onDrag) {
      opts.onDrag(evt, el);
    }
  };

  const onMouseUp = (e: Event) => {
    if (!state.pressed) return;

    state.pressed = false;
    const evt = e as MouseEvent | TouchEvent;

    if (opts.overflowCorrection && state.moved) {
      correctOverflow(el, opts);
    }

    el.css('opacity', '1');
    el.removeData('isDragging');

    if (opts.onDragEnd) {
      opts.onDragEnd(evt, el);
    }

    doc.removeEventListener('selectstart', preventSelect);
    doc.removeEventListener('dragstart', preventSelect);
    doc.removeEventListener('mousemove', onMouseMove);
    doc.removeEventListener('touchmove', onMouseMove);
    doc.removeEventListener('mouseup', onMouseUp);
    doc.removeEventListener('touchend', onMouseUp);
  };

  const handleElement = handleEl.get(0);
  if (handleElement) {
    handleElement.addEventListener('mousedown', onMouseDown);
    handleElement.addEventListener('touchstart', onMouseDown, { passive: false });
  }

  return () => {
    if (handleElement) {
      handleElement.removeEventListener('mousedown', onMouseDown);
      handleElement.removeEventListener('touchstart', onMouseDown);
    }
    el.removeClass('draggable__');
  };
}

function correctOverflow(el: NaturalElement, opts: DraggableOptions): void {
  const win = getWindow();
  if (!win) return;

  const offset = el.offset();
  if (!offset) return;

  const addValues = opts.overflowCorrectionAddValues || { top: 0, bottom: 0, left: 0, right: 0 };
  const viewportHeight = win.innerHeight;
  const viewportWidth = win.innerWidth;
  const scrollTop = win.scrollY || 0;
  const elHeight = el.outerHeight() ?? 0;
  const elWidth = el.outerWidth() ?? 0;

  const newOffset: Partial<Position> = {};

  if (offset.top - scrollTop < 0) {
    newOffset.top = scrollTop + (addValues.top ?? 0);
  }
  if (offset.top + elHeight > scrollTop + viewportHeight) {
    newOffset.top = scrollTop + viewportHeight - elHeight + (addValues.bottom ?? 0);
  }
  if (newOffset.top !== undefined && newOffset.top < 0) {
    newOffset.top = addValues.top ?? 0;
  }
  if (offset.left < 0) {
    newOffset.left = addValues.left ?? 0;
  }
  if (offset.left + elWidth > viewportWidth) {
    newOffset.left = viewportWidth - elWidth + (addValues.right ?? 0);
  }

  if (newOffset.top !== undefined || newOffset.left !== undefined) {
    el.css('transition', 'top 0.2s, left 0.2s');
    el.offset({ top: newOffset.top ?? offset.top, left: newOffset.left ?? offset.left });
    setTimeout(() => el.css('transition', ''), 200);
  }
}

export function isDragging(element: Element | NaturalElement): boolean {
  const el = toNaturalElement(element);
  return el.data('isDragging') === true;
}

export const draggable = {
  make: makeDraggable,
  isDragging,
};
