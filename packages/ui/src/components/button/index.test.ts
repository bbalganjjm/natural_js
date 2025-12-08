/**
 * Tests for Button component.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Button, createButton } from './index';
import { NaturalElement } from '@natural-js/shared';

describe('Button', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <button id="btn1" class="primary">Click Me</button>
      <button id="btn2">Submit</button>
      <input type="button" id="btn3" value="Input Button">
      <a href="#" class="button" id="btn4">Link Button</a>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('constructor', () => {
    it('should create Button instance with NaturalElement', () => {
      const btn = new Button(new NaturalElement('#btn1'));
      expect(btn).toBeInstanceOf(Button);
      expect(btn.getButtons().length).toBe(1);
    });

    it('should create Button instance with string selector', () => {
      const btn = new Button('#btn1');
      expect(btn).toBeInstanceOf(Button);
      expect(btn.getButtons().length).toBe(1);
    });

    it('should create Button instance with Element', () => {
      const element = document.getElementById('btn1')!;
      const btn = new Button(element);
      expect(btn).toBeInstanceOf(Button);
      expect(btn.getButtons().length).toBe(1);
    });

    it('should find multiple buttons in container', () => {
      const btn = new Button(new NaturalElement(container));
      expect(btn.getButtons().length).toBe(4);
    });

    it('should add button__ class to buttons', () => {
      const btn = new Button('#btn1');
      expect(btn.getButtons().hasClass('button__')).toBe(true);
    });

    it('should add custom color class', () => {
      const btn = new Button('#btn1', { color: 'btn-success' });
      expect(btn.getButtons().hasClass('btn-success')).toBe(true);
    });

    it('should apply initial disabled state', () => {
      const btn = new Button('#btn1', { disabled: true });
      expect(btn.isDisabled()).toBe(true);
    });

    it('should parse data-opts for size/type/color/disable', () => {
      const btnEl = document.getElementById('btn2') as HTMLElement;
      btnEl.setAttribute('data-opts', '{"size":"large","type":"outlined","color":"primary","disable":true}');

      const btn = new Button('#btn2');
      const el = btn.getButtons();

      expect(el.hasClass('btn_large__')).toBe(true);
      expect(el.hasClass('btn_outlined__')).toBe(true);
      expect(el.hasClass('btn_primary__')).toBe(true);
      expect(btn.isDisabled()).toBe(true);
    });
  });

  describe('disable()', () => {
    it('should disable the button', () => {
      const btn = new Button('#btn1');
      btn.disable();

      expect(btn.isDisabled()).toBe(true);
      expect(btn.getButtons().hasClass('disabled__')).toBe(true);
      // disabled is a boolean attribute, getAttribute may return '' or 'disabled'
      expect(btn.getButtons().attr('disabled')).not.toBeNull();
    });

    it('should return this for chaining', () => {
      const btn = new Button('#btn1');
      expect(btn.disable()).toBe(btn);
    });
  });

  describe('enable()', () => {
    it('should enable a disabled button', () => {
      const btn = new Button('#btn1', { disabled: true });
      btn.enable();

      expect(btn.isDisabled()).toBe(false);
      expect(btn.getButtons().hasClass('disabled__')).toBe(false);
    });

    it('should return this for chaining', () => {
      const btn = new Button('#btn1');
      expect(btn.enable()).toBe(btn);
    });
  });

  describe('toggleDisabled()', () => {
    it('should toggle from enabled to disabled', () => {
      const btn = new Button('#btn1');
      expect(btn.isDisabled()).toBe(false);

      btn.toggleDisabled();
      expect(btn.isDisabled()).toBe(true);
    });

    it('should toggle from disabled to enabled', () => {
      const btn = new Button('#btn1', { disabled: true });
      expect(btn.isDisabled()).toBe(true);

      btn.toggleDisabled();
      expect(btn.isDisabled()).toBe(false);
    });
  });

  describe('text()', () => {
    it('should set button text', () => {
      const btn = new Button('#btn1');
      btn.text('New Text');

      expect(btn.getButtons().text()).toBe('New Text');
    });

    it('should return this for chaining', () => {
      const btn = new Button('#btn1');
      expect(btn.text('Test')).toBe(btn);
    });
  });

  describe('context()', () => {
    it('should return the context element', () => {
      const btn = new Button(new NaturalElement(container));
      expect(btn.context().get(0)).toBe(container);
    });

    it('should find within context with selector', () => {
      const btn = new Button(new NaturalElement(container));
      const found = btn.context('#btn1');
      expect(found.length).toBe(1);
    });
  });

  describe('click events', () => {
    it('should call onClick handler when clicked', () => {
      const onClick = vi.fn();
      const btn = new Button('#btn1', { onClick });

      btn.getButtons().trigger('click');
      expect(onClick).toHaveBeenCalled();
    });

    it('should call onBeforeClick handler before onClick', () => {
      const order: string[] = [];
      const onBeforeClick = vi.fn(() => {
        order.push('before');
      });
      const onClick = vi.fn(() => {
        order.push('click');
      });

      const btn = new Button('#btn1', { onBeforeClick, onClick });
      btn.getButtons().trigger('click');

      expect(order).toEqual(['before', 'click']);
    });

    it('should not call onClick if onBeforeClick returns false', () => {
      const onClick = vi.fn();
      const onBeforeClick = vi.fn(() => false);

      const btn = new Button('#btn1', { onBeforeClick, onClick });
      btn.getButtons().trigger('click');

      expect(onBeforeClick).toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should not trigger click on disabled button', () => {
      const onClick = vi.fn();
      const btn = new Button('#btn1', { onClick, disabled: true });

      btn.getButtons().trigger('click');
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should add button_active__ class on click', async () => {
      const btn = new Button('#btn1', { animationDuration: 50 });
      btn.getButtons().trigger('click');

      expect(btn.getButtons().hasClass('button_active__')).toBe(true);

      // Wait for animation to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(btn.getButtons().hasClass('button_active__')).toBe(false);
    });
  });

  describe('click()', () => {
    it('should trigger click event programmatically', () => {
      const onClick = vi.fn();
      const btn = new Button('#btn1', { onClick });

      btn.click();
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('destroy()', () => {
    it('should remove event listeners', () => {
      const onClick = vi.fn();
      const btn = new Button('#btn1', { onClick });

      btn.destroy();
      btn.getButtons().trigger('click');

      expect(onClick).not.toHaveBeenCalled();
    });

    it('should remove classes', () => {
      const btn = new Button('#btn1', { color: 'primary' });
      btn.destroy();

      expect(btn.getButtons().hasClass('button__')).toBe(false);
      expect(btn.getButtons().hasClass('primary')).toBe(false);
    });
  });
});

describe('createButton', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = '<button id="test-btn">Test</button>';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should create Button instance', () => {
    const btn = createButton('#test-btn');
    expect(btn).toBeInstanceOf(Button);
  });

  it('should pass options', () => {
    const btn = createButton('#test-btn', { disabled: true });
    expect(btn.isDisabled()).toBe(true);
  });
});

