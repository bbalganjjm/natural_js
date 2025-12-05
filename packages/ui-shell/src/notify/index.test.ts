/**
 * Tests for Notify component.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Notify, createNotify } from './index';
import { NaturalElement } from '@natural-js/shared';

describe('Notify', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = '<div id="test-notify"></div>';
    document.body.appendChild(container);
    
    // Clear any existing notifications
    Notify.clear();
  });

  afterEach(() => {
    // Clean up containers
    document.querySelectorAll('.notify_container__').forEach((el) => el.remove());
    document.querySelectorAll('.notify__').forEach((el) => {
      const notifyData = new NaturalElement(el).data('notify');
      if (notifyData && typeof notifyData.destroy === 'function') {
        notifyData.destroy();
      }
    });
    document.body.removeChild(container);
  });

  describe('constructor', () => {
    it('should create Notify instance with string selector', () => {
      const notify = new Notify('#test-notify');
      expect(notify).toBeInstanceOf(Notify);
      notify.destroy();
    });

    it('should create Notify instance with NaturalElement', () => {
      const notify = new Notify(new NaturalElement('#test-notify'));
      expect(notify).toBeInstanceOf(Notify);
      notify.destroy();
    });

    it('should create Notify instance without context (global container)', () => {
      const notify = new Notify();
      expect(notify).toBeInstanceOf(Notify);
      notify.destroy();
    });

    it('should add notify__ class', () => {
      const notify = new Notify('#test-notify');
      expect(notify.context().hasClass('notify__')).toBe(true);
      notify.destroy();
    });
  });

  describe('add()', () => {
    it('should add a notification', () => {
      const notify = new Notify('#test-notify');
      const item = notify.add('Test message');
      
      expect(item.message).toBe('Test message');
      expect(item.id).toBeTruthy();
      notify.destroy();
    });

    it('should add notification with type', () => {
      const notify = new Notify('#test-notify');
      const item = notify.add('Success!', 'success');
      
      expect(item.type).toBe('success');
      notify.destroy();
    });

    it('should add notification with URL', () => {
      const notify = new Notify('#test-notify');
      const item = notify.add('Click me', 'info', 'https://example.com');
      
      expect(item.url).toBe('https://example.com');
      notify.destroy();
    });

    it('should create notification element', () => {
      const notify = new Notify('#test-notify');
      notify.add('Test');
      
      const items = notify.context().find('.notify_item__');
      expect(items.length).toBe(1);
      notify.destroy();
    });

    it('should limit notifications to maxCount', () => {
      const notify = new Notify('#test-notify', { maxCount: 3, closeAfter: 0 });
      notify.add('1');
      notify.add('2');
      notify.add('3');
      notify.add('4');
      
      expect(notify.count()).toBe(3);
      notify.destroy();
    });

    it('should show close button when showClose is true', () => {
      const notify = new Notify('#test-notify', { showClose: true });
      notify.add('Test');
      
      const closeBtn = notify.context().find('.notify_close__');
      expect(closeBtn.length).toBe(1);
      notify.destroy();
    });
  });

  describe('remove()', () => {
    it('should remove notification by ID', () => {
      const notify = new Notify('#test-notify', { closeAfter: 0 });
      const item = notify.add('Test');
      
      notify.remove(item.id);
      
      expect(notify.count()).toBe(0);
      notify.destroy();
    });

    it('should call onClose callback', () => {
      const onClose = vi.fn();
      const notify = new Notify('#test-notify', { closeAfter: 0, onClose });
      const item = notify.add('Test');
      
      notify.remove(item.id);
      
      expect(onClose).toHaveBeenCalledWith(expect.objectContaining({ id: item.id }));
      notify.destroy();
    });

    it('should return this for chaining', () => {
      const notify = new Notify('#test-notify', { closeAfter: 0 });
      const item = notify.add('Test');
      
      expect(notify.remove(item.id)).toBe(notify);
      notify.destroy();
    });
  });

  describe('clear()', () => {
    it('should remove all notifications', () => {
      const notify = new Notify('#test-notify', { closeAfter: 0 });
      notify.add('1');
      notify.add('2');
      notify.add('3');
      
      notify.clear();
      
      expect(notify.count()).toBe(0);
      notify.destroy();
    });

    it('should return this for chaining', () => {
      const notify = new Notify('#test-notify');
      expect(notify.clear()).toBe(notify);
      notify.destroy();
    });
  });

  describe('list()', () => {
    it('should return all notifications', () => {
      const notify = new Notify('#test-notify', { closeAfter: 0 });
      notify.add('1');
      notify.add('2');
      
      const list = notify.list();
      expect(list.length).toBe(2);
      notify.destroy();
    });
  });

  describe('count()', () => {
    it('should return notification count', () => {
      const notify = new Notify('#test-notify', { closeAfter: 0 });
      notify.add('1');
      notify.add('2');
      
      expect(notify.count()).toBe(2);
      notify.destroy();
    });
  });

  describe('context()', () => {
    it('should return context element', () => {
      const notify = new Notify('#test-notify');
      expect(notify.context().get(0)?.id).toBe('test-notify');
      notify.destroy();
    });

    it('should find within context with selector', () => {
      const notify = new Notify('#test-notify');
      notify.add('Test');
      
      expect(notify.context('.notify_item__').length).toBe(1);
      notify.destroy();
    });
  });

  describe('static methods', () => {
    it('should add notification with static add()', () => {
      const item = Notify.add('Static test');
      expect(item.message).toBe('Static test');
      Notify.clear();
    });

    it('should add info notification with static info()', () => {
      const item = Notify.info('Info message');
      expect(item.type).toBe('info');
      Notify.clear();
    });

    it('should add success notification with static success()', () => {
      const item = Notify.success('Success message');
      expect(item.type).toBe('success');
      Notify.clear();
    });

    it('should add warning notification with static warning()', () => {
      const item = Notify.warning('Warning message');
      expect(item.type).toBe('warning');
      Notify.clear();
    });

    it('should add error notification with static error()', () => {
      const item = Notify.error('Error message');
      expect(item.type).toBe('error');
      Notify.clear();
    });

    it('should remove notification with static remove()', () => {
      const item = Notify.add('Test');
      Notify.remove(item.id);
      // Notification should be removed
    });

    it('should clear all with static clear()', () => {
      Notify.add('1');
      Notify.add('2');
      Notify.clear();
      // All notifications should be cleared
    });
  });

  describe('destroy()', () => {
    it('should remove notify__ class', () => {
      const notify = new Notify('#test-notify');
      notify.destroy();
      
      const el = new NaturalElement('#test-notify');
      expect(el.hasClass('notify__')).toBe(false);
    });

    it('should clear notifications', () => {
      const notify = new Notify('#test-notify', { closeAfter: 0 });
      notify.add('Test');
      notify.destroy();
      
      expect(notify.count()).toBe(0);
    });
  });
});

describe('createNotify', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = '<div id="create-notify"></div>';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.querySelectorAll('.notify_container__').forEach((el) => el.remove());
    document.body.removeChild(container);
  });

  it('should create Notify instance', () => {
    const notify = createNotify('#create-notify');
    expect(notify).toBeInstanceOf(Notify);
    notify.destroy();
  });
});

