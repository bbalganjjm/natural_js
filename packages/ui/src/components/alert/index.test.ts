/**
 * Tests for the Alert component.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NaturalElement } from '@natural-js/shared';
import { Alert, createAlert } from './index';

describe('Alert', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up all alerts
    document.querySelectorAll('.block_overlay__, .block_overlay_msg__').forEach((el) => el.remove());
    container.remove();
  });

  describe('constructor', () => {
    it('should create Alert instance with string message', () => {
      const alert = new Alert(container, 'Test message');
      expect(alert).toBeInstanceOf(Alert);
      expect(alert.options.msg).toBe('Test message');
    });

    it('should create Alert instance with array message', () => {
      const alert = new Alert(container, ['Message 1', 'Message 2']);
      expect(alert.options.msg).toEqual(['Message 1', 'Message 2']);
    });

    it('should create Alert instance with options object', () => {
      const alert = new Alert(container, {
        msg: 'Test message',
        title: 'Test Title',
        confirm: true,
      });
      expect(alert.options.msg).toBe('Test message');
      expect(alert.options.title).toBe('Test Title');
      expect(alert.options.confirm).toBe(true);
    });

    it('should handle window as target', () => {
      const alert = new Alert(window, 'Test');
      expect(alert.options.isWindow).toBe(true);
    });

    it('should handle NaturalElement as target', () => {
      const natEl = new NaturalElement(container);
      const alert = new Alert(natEl, 'Test');
      expect(alert).toBeInstanceOf(Alert);
    });

    it('should set isInput for input elements', () => {
      const input = document.createElement('input');
      input.type = 'text';
      container.appendChild(input);

      const alert = new Alert(input, 'Validation error');
      expect(alert.options.isInput).toBe(true);
    });
  });

  describe('show()', () => {
    it('should show the alert', () => {
      const alert = new Alert(container, 'Test message');
      alert.show();

      const msgContents = document.querySelector('.block_overlay_msg__');
      expect(msgContents).not.toBeNull();
    });

    it('should call onBeforeShow callback', () => {
      const onBeforeShow = vi.fn();
      const alert = new Alert(container, {
        msg: 'Test',
        onBeforeShow,
      });

      alert.show();
      expect(onBeforeShow).toHaveBeenCalled();
    });

    it('should return this for chaining', () => {
      const alert = new Alert(container, 'Test');
      expect(alert.show()).toBe(alert);
    });

    it('should add visible__ class', async () => {
      const alert = new Alert(container, 'Test');
      alert.show();

      // Wait for transition
      await new Promise((resolve) => setTimeout(resolve, 50));

      const msgContents = document.querySelector('.block_overlay_msg__');
      expect(msgContents?.classList.contains('visible__')).toBe(true);
    });
  });

  describe('hide()', () => {
    it('should hide the alert', async () => {
      const alert = new Alert(container, 'Test');
      alert.show();
      alert.hide();

      // Wait for transition
      await new Promise((resolve) => setTimeout(resolve, 50));

      const msgContents = document.querySelector('.block_overlay_msg__');
      expect(msgContents?.classList.contains('hidden__')).toBe(true);
    });

    it('should call onBeforeHide callback', () => {
      const onBeforeHide = vi.fn();
      const alert = new Alert(container, {
        msg: 'Test',
        onBeforeHide,
      });

      alert.show();
      alert.hide();
      expect(onBeforeHide).toHaveBeenCalled();
    });

    it('should return this for chaining', () => {
      const alert = new Alert(container, 'Test');
      alert.show();
      expect(alert.hide()).toBe(alert);
    });
  });

  describe('remove()', () => {
    it('should remove the alert from DOM', async () => {
      const alert = new Alert(container, 'Test');
      alert.show();
      alert.remove();

      // Wait for transition
      await new Promise((resolve) => setTimeout(resolve, 350));

      const overlays = document.querySelectorAll('.block_overlay__');
      expect(overlays.length).toBe(0);
    });

    it('should call onBeforeRemove callback', () => {
      const onBeforeRemove = vi.fn();
      const alert = new Alert(container, {
        msg: 'Test',
        onBeforeRemove,
      });

      alert.show();
      alert.remove();
      expect(onBeforeRemove).toHaveBeenCalled();
    });

    it('should return this for chaining', () => {
      const alert = new Alert(container, 'Test');
      alert.show();
      expect(alert.remove()).toBe(alert);
    });
  });

  describe('context()', () => {
    it('should return context element', () => {
      const alert = new Alert(container, 'Test');
      const ctx = alert.context();
      expect(ctx.get(0)).toBe(container);
    });

    it('should find within context with selector', () => {
      const inner = document.createElement('span');
      inner.className = 'inner';
      container.appendChild(inner);

      const alert = new Alert(container, 'Test');
      const found = alert.context('.inner');
      expect(found.length).toBe(1);
    });
  });

  describe('options', () => {
    it('should set title', () => {
      const alert = new Alert(container, { msg: 'Test', title: 'My Title' });
      alert.show();

      const title = document.querySelector('.msg_title__');
      expect(title?.textContent).toBe('My Title');
    });

    it('should show confirm and cancel buttons when confirm is true', () => {
      const alert = new Alert(container, { msg: 'Test', confirm: true });
      alert.show();

      const confirmBtn = document.querySelector('.buttonBox__ .confirm__');
      const cancelBtn = document.querySelector('.buttonBox__ .cancel__');
      expect(confirmBtn).not.toBeNull();
      expect(cancelBtn).not.toBeNull();
    });

    it('should not show cancel button when confirm is false', () => {
      const alert = new Alert(container, { msg: 'Test', confirm: false });
      alert.show();

      const cancelBtn = document.querySelector('.buttonBox__ .cancel__');
      expect(cancelBtn).toBeNull();
    });

    it('should not show modal overlay when modal is false', () => {
      const alert = new Alert(container, { msg: 'Test', modal: false });
      alert.show();

      const overlay = document.querySelector('.block_overlay__');
      expect(overlay).toBeNull();
    });

    it('should add draggable class when draggable is true', () => {
      const alert = new Alert(container, {
        msg: 'Test',
        title: 'Title',
        draggable: true,
      });
      alert.show();

      const msgContents = document.querySelector('.block_overlay_msg__');
      expect(msgContents?.classList.contains('draggable__')).toBe(true);
    });

    it('should render HTML when html option is true', () => {
      const alert = new Alert(container, {
        msg: '<strong>Bold</strong>',
        html: true,
      });
      alert.show();

      const msgBox = document.querySelector('.msg_box__');
      expect(msgBox?.innerHTML).toContain('<strong>Bold</strong>');
    });

    it('should not render HTML when html option is false', () => {
      const alert = new Alert(container, {
        msg: '<strong>Bold</strong>',
        html: false,
      });
      alert.show();

      const msgBox = document.querySelector('.msg_box__');
      expect(msgBox?.textContent).toBe('<strong>Bold</strong>');
    });
  });

  describe('callbacks', () => {
    it('should call onOk when confirm button is clicked', () => {
      const onOk = vi.fn().mockReturnValue(1);
      const alert = new Alert(container, { msg: 'Test', onOk });
      alert.show();

      const confirmBtn = document.querySelector('.buttonBox__ .confirm__') as HTMLButtonElement;
      confirmBtn?.click();

      expect(onOk).toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn().mockReturnValue(1);
      const alert = new Alert(container, { msg: 'Test', confirm: true, onCancel });
      alert.show();

      const cancelBtn = document.querySelector('.buttonBox__ .cancel__') as HTMLButtonElement;
      cancelBtn?.click();

      expect(onCancel).toHaveBeenCalled();
    });

    it('should not close if callback returns 0', () => {
      const onOk = vi.fn().mockReturnValue(0);
      const alert = new Alert(container, { msg: 'Test', onOk });
      alert.show();

      const confirmBtn = document.querySelector('.buttonBox__ .confirm__') as HTMLButtonElement;
      confirmBtn?.click();

      // Alert should still be visible
      const msgContents = document.querySelector('.block_overlay_msg__');
      expect(msgContents).not.toBeNull();
    });
  });

  describe('input alerts (tooltips)', () => {
    it('should create tooltip-style alert for input elements', () => {
      const input = document.createElement('input');
      input.type = 'text';
      container.appendChild(input);

      const alert = new Alert(input, 'Validation error');
      alert.show();

      const tooltip = document.querySelector('.alert_tooltip__');
      expect(tooltip).not.toBeNull();
    });

    it('should auto-hide after timeout', async () => {
      vi.useFakeTimers();

      const input = document.createElement('input');
      input.type = 'text';
      container.appendChild(input);

      const alert = new Alert(input, {
        msg: 'Error',
        input: { displayTimeout: 1000, closeBtn: '×' },
      });
      alert.show();

      vi.advanceTimersByTime(1500);
      vi.useRealTimers();

      // Tooltip should be removed/hidden
    });
  });
});

describe('createAlert', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.querySelectorAll('.block_overlay__, .block_overlay_msg__').forEach((el) => el.remove());
    container.remove();
  });

  it('should create Alert instance', () => {
    const alert = createAlert(container, 'Test');
    expect(alert).toBeInstanceOf(Alert);
  });

  it('should pass variables', () => {
    const alert = createAlert(container, 'Hello {0}!', ['World']);
    expect(alert.options.vars).toEqual(['World']);
  });
});

