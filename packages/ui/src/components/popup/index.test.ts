/**
 * Tests for Popup component.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Popup, createPopup } from './index';
import { NaturalElement } from '@natural-js/shared';

describe('Popup', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'popup-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up any remaining popups
    document.querySelectorAll('.popup__').forEach((el) => el.remove());
    document.querySelectorAll('.popup_overlay__').forEach((el) => el.remove());
    document.body.removeChild(container);
  });

  describe('constructor', () => {
    it('should create Popup instance with window as context', () => {
      const popup = new Popup(window);
      expect(popup).toBeInstanceOf(Popup);
      expect(popup.options.isWindow).toBe(true);
    });

    it('should create Popup instance with NaturalElement', () => {
      const popup = new Popup(new NaturalElement(container));
      expect(popup).toBeInstanceOf(Popup);
    });

    it('should create Popup instance with Element', () => {
      const popup = new Popup(container);
      expect(popup).toBeInstanceOf(Popup);
    });

    it('should preload popup structure when preload is true', () => {
      const popup = new Popup(window, { preload: true });
      expect(popup.options.msgContents).not.toBeNull();
    });

    it('should not preload popup structure when preload is false', () => {
      const popup = new Popup(window, { preload: false });
      expect(popup.options.msgContents).toBeNull();
    });
  });

  describe('setContent()', () => {
    it('should set HTML content', () => {
      const popup = new Popup(window, { content: '', html: true });
      popup.setContent('<strong>Test Content</strong>');

      const contentEl = popup.content();
      expect(contentEl.html()).toBe('<strong>Test Content</strong>');
    });

    it('should set text content when html is false', () => {
      const popup = new Popup(window, { content: '', html: false });
      popup.setContent('<strong>Test</strong>');

      const contentEl = popup.content();
      expect(contentEl.text()).toBe('<strong>Test</strong>');
    });

    it('should return this for chaining', () => {
      const popup = new Popup(window);
      expect(popup.setContent('test')).toBe(popup);
    });
  });

  describe('open()', () => {
    it('should open the popup', () => {
      const popup = new Popup(window, { content: 'Test' });
      popup.open();

      expect(popup.isOpened()).toBe(true);
      expect(popup.options.msgContents?.hasClass('hidden__')).toBe(false);
    });

    it('should call onBeforeOpen callback', () => {
      const onBeforeOpen = vi.fn();
      const popup = new Popup(window, { content: 'Test', onBeforeOpen });
      popup.open('test-data');

      expect(onBeforeOpen).toHaveBeenCalledWith('test-data', popup);
    });

    it('should not open if onBeforeOpen returns false', () => {
      const onBeforeOpen = vi.fn(() => false);
      const popup = new Popup(window, { content: 'Test', onBeforeOpen });
      popup.open();

      expect(popup.isOpened()).toBe(false);
    });

    it('should call onOpen callback', async () => {
      const onOpen = vi.fn();
      const popup = new Popup(window, { content: 'Test', onOpen });
      popup.open('test-data');

      // Wait for setTimeout
      await new Promise((resolve) => setTimeout(resolve, 350));
      expect(onOpen).toHaveBeenCalledWith('test-data', popup);
    });

    it('should return this for chaining', () => {
      const popup = new Popup(window, { content: 'Test' });
      expect(popup.open()).toBe(popup);
    });

    it('should show overlay when modal is true', () => {
      const popup = new Popup(window, { content: 'Test', modal: true });
      popup.open();

      // The overlay should be visible
      expect(popup.options.msgContext.length).toBeGreaterThan(0);
      expect(popup.isOpened()).toBe(true);
    });

    it('should add keyup listener when escClose is true', () => {
      const popup = new Popup(window, { content: 'Test', escClose: true });
      popup.open();

      expect(popup.options.keyupHandler).toBeDefined();
    });
  });

  describe('close()', () => {
    it('should close the popup', () => {
      const popup = new Popup(window, { content: 'Test', closeMode: 'hide' });
      popup.open();
      popup.close();

      expect(popup.isOpened()).toBe(false);
    });

    it('should call onBeforeClose callback', () => {
      const onBeforeClose = vi.fn();
      const popup = new Popup(window, { content: 'Test', closeMode: 'hide', onBeforeClose });
      popup.open();
      popup.close('close-data');

      expect(onBeforeClose).toHaveBeenCalledWith('close-data', popup);
    });

    it('should not close if onBeforeClose returns false', () => {
      const onBeforeClose = vi.fn(() => false);
      const popup = new Popup(window, { content: 'Test', onBeforeClose });
      popup.open();
      popup.close();

      expect(popup.isOpened()).toBe(true);
    });

    it('should return this for chaining', () => {
      const popup = new Popup(window, { content: 'Test' });
      popup.open();
      expect(popup.close()).toBe(popup);
    });
  });

  describe('remove()', () => {
    it('should remove popup from DOM', async () => {
      const popup = new Popup(window, { content: 'Test' });
      popup.open();
      popup.remove();

      // Wait for hide transition
      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(document.querySelector('.popup__')).toBeNull();
    });

    it('should call onBeforeRemove callback', () => {
      const onBeforeRemove = vi.fn();
      const popup = new Popup(window, { content: 'Test', onBeforeRemove });
      popup.open();
      popup.remove();

      expect(onBeforeRemove).toHaveBeenCalledWith(popup);
    });

    it('should return this for chaining', () => {
      const popup = new Popup(window, { content: 'Test' });
      popup.open();
      expect(popup.remove()).toBe(popup);
    });
  });

  describe('context()', () => {
    it('should return context element', () => {
      const popup = new Popup(new NaturalElement(container));
      expect(popup.context().get(0)).toBe(container);
    });

    it('should find within context with selector', () => {
      container.innerHTML = '<span class="test">Test</span>';
      const popup = new Popup(new NaturalElement(container));
      expect(popup.context('.test').length).toBe(1);
    });
  });

  describe('content()', () => {
    it('should return content element', () => {
      const popup = new Popup(window, { content: '<p>Test</p>' });
      const contentEl = popup.content();
      expect(contentEl.length).toBe(1);
      expect(contentEl.hasClass('popup_content__')).toBe(true);
    });

    it('should find within content with selector', () => {
      const popup = new Popup(window, { content: '<p class="test">Test</p>' });
      expect(popup.content('.test').length).toBe(1);
    });
  });

  describe('options', () => {
    it('should set title', () => {
      const popup = new Popup(window, { title: 'Test Title' });
      const titleEl = popup.options.msgContents?.find('.popup_title__');
      expect(titleEl?.text()).toBe('Test Title');
    });

    it('should show close button', () => {
      const popup = new Popup(window, { closeButton: true });
      const closeBtn = popup.options.msgContents?.find('.popup_title_close_btn__');
      expect(closeBtn?.length).toBe(1);
    });

    it('should not show close button when closeButton is false', () => {
      const popup = new Popup(window, { closeButton: false, title: undefined });
      const closeBtn = popup.options.msgContents?.find('.popup_title_close_btn__');
      expect(closeBtn?.length).toBe(0);
    });

    it('should set custom width', () => {
      const popup = new Popup(window, { width: 400 });
      expect(popup.options.msgContents?.css('width')).toBe('400px');
    });

    it('should set custom height', () => {
      const popup = new Popup(window, { height: 300 });
      const contentEl = popup.options.msgContents?.find('.popup_content__');
      expect(contentEl?.css('height')).toBe('300px');
    });

    it('should add draggable class when draggable is true', () => {
      const popup = new Popup(window, { title: 'Draggable', draggable: true });
      expect(popup.options.msgContents?.hasClass('draggable__')).toBe(true);
    });
  });

  describe('close button click', () => {
    it('should close popup when close button is clicked', () => {
      const popup = new Popup(window, { title: 'Test', closeButton: true, closeMode: 'hide' });
      popup.open();

      popup.options.msgContents?.find('.popup_title_close_btn__').trigger('click');
      expect(popup.isOpened()).toBe(false);
    });
  });

  describe('overlay click', () => {
    it('should close popup when overlay is clicked and overlayClose is true', () => {
      const popup = new Popup(window, { modal: true, overlayClose: true, closeMode: 'hide' });
      popup.open();

      popup.options.msgContext.trigger('click');
      expect(popup.isOpened()).toBe(false);
    });
  });

  describe('ESC key', () => {
    it('should close popup when ESC is pressed and escClose is true', () => {
      const popup = new Popup(window, { escClose: true, closeMode: 'hide' });
      popup.open();

      const event = new KeyboardEvent('keyup', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(popup.isOpened()).toBe(false);
    });
  });
});

describe('createPopup', () => {
  afterEach(() => {
    document.querySelectorAll('.popup__').forEach((el) => el.remove());
    document.querySelectorAll('.popup_overlay__').forEach((el) => el.remove());
  });

  it('should create Popup instance', () => {
    const popup = createPopup(window);
    expect(popup).toBeInstanceOf(Popup);
  });

  it('should pass options', () => {
    const popup = createPopup(window, { title: 'Test' });
    const titleEl = popup.options.msgContents?.find('.popup_title__');
    expect(titleEl?.text()).toBe('Test');
  });
});

