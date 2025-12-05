/**
 * Tests for the draggable utility.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NaturalElement } from '@natural-js/shared';
import { makeDraggable, isDragging } from './draggable';

describe('draggable', () => {
  let container: HTMLDivElement;
  let element: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.cssText = 'position: relative; width: 500px; height: 500px;';
    document.body.appendChild(container);

    element = document.createElement('div');
    element.style.cssText = 'position: absolute; width: 100px; height: 100px; top: 50px; left: 50px;';
    container.appendChild(element);
  });

  afterEach(() => {
    container.remove();
  });

  describe('makeDraggable', () => {
    it('should add draggable class to element', () => {
      const cleanup = makeDraggable(element);
      expect(element.classList.contains('draggable__')).toBe(true);
      cleanup();
    });

    it('should return cleanup function', () => {
      const cleanup = makeDraggable(element);
      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('should remove draggable class on cleanup', () => {
      const cleanup = makeDraggable(element);
      cleanup();
      expect(element.classList.contains('draggable__')).toBe(false);
    });

    it('should work with NaturalElement', () => {
      const natEl = new NaturalElement(element);
      const cleanup = makeDraggable(natEl);
      expect(element.classList.contains('draggable__')).toBe(true);
      cleanup();
    });

    it('should accept handle option', () => {
      const handle = document.createElement('div');
      handle.className = 'handle';
      element.appendChild(handle);

      const cleanup = makeDraggable(element, { handle: '.handle' });
      expect(element.classList.contains('draggable__')).toBe(true);
      cleanup();
    });
  });

  describe('isDragging', () => {
    it('should return false initially', () => {
      expect(isDragging(element)).toBe(false);
    });

    it('should work with NaturalElement', () => {
      const natEl = new NaturalElement(element);
      expect(isDragging(natEl)).toBe(false);
    });
  });

  describe('drag simulation', () => {
    it('should handle mousedown event', () => {
      const cleanup = makeDraggable(element);

      const mousedown = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        button: 0,
        clientX: 100,
        clientY: 100,
      });

      element.dispatchEvent(mousedown);
      cleanup();
    });

    it('should call onDragStart callback', () => {
      const onDragStart = vi.fn();
      const cleanup = makeDraggable(element, { onDragStart });

      const mousedown = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        button: 0,
        clientX: 100,
        clientY: 100,
      });

      element.dispatchEvent(mousedown);
      expect(onDragStart).toHaveBeenCalled();

      // Trigger mouseup to clean up
      document.dispatchEvent(new MouseEvent('mouseup'));
      cleanup();
    });

    it('should ignore right mouse button', () => {
      const onDragStart = vi.fn();
      const cleanup = makeDraggable(element, { onDragStart });

      const mousedown = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        button: 2, // Right button
        clientX: 100,
        clientY: 100,
      });

      element.dispatchEvent(mousedown);
      expect(onDragStart).not.toHaveBeenCalled();
      cleanup();
    });
  });
});

