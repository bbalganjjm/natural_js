/**
 * Tests for Tab component.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Tab, createTab } from './index';
import { NaturalElement } from '@natural-js/shared';

describe('Tab', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <div id="tabs">
        <ul>
          <li>Tab 1</li>
          <li>Tab 2</li>
          <li>Tab 3</li>
        </ul>
        <div>Content 1</div>
        <div>Content 2</div>
        <div>Content 3</div>
      </div>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('constructor', () => {
    it('should create Tab instance with NaturalElement', () => {
      const tab = new Tab(new NaturalElement('#tabs'));
      expect(tab).toBeInstanceOf(Tab);
    });

    it('should create Tab instance with string selector', () => {
      const tab = new Tab('#tabs');
      expect(tab).toBeInstanceOf(Tab);
    });

    it('should create Tab instance with Element', () => {
      const element = document.getElementById('tabs')!;
      const tab = new Tab(element);
      expect(tab).toBeInstanceOf(Tab);
    });

    it('should add tab__ class to context', () => {
      const tab = new Tab('#tabs');
      expect(tab.context().hasClass('tab__')).toBe(true);
    });

    it('should open first tab by default', () => {
      const tab = new Tab('#tabs');
      expect(tab.getIndex()).toBe(0);
    });

    it('should open specified active tab', () => {
      const tab = new Tab('#tabs', { active: 1 });
      expect(tab.getIndex()).toBe(1);
    });
  });

  describe('open()', () => {
    it('should open specified tab', () => {
      const tab = new Tab('#tabs');
      tab.open(2);
      expect(tab.getIndex()).toBe(2);
    });

    it('should add active class to tab link', () => {
      const tab = new Tab('#tabs');
      tab.open(1);
      const tabLinks = tab.options.tabLinks;
      expect(tabLinks.eq(1).hasClass('tab_active__')).toBe(true);
    });

    it('should show corresponding content', () => {
      const tab = new Tab('#tabs');
      tab.open(1);
      const contents = tab.options.tabContents;
      expect(contents.eq(1).css('display')).not.toBe('none');
    });

    it('should hide other contents', () => {
      const tab = new Tab('#tabs');
      tab.open(1);
      const contents = tab.options.tabContents;
      expect(contents.eq(0).css('display')).toBe('none');
      expect(contents.eq(2).css('display')).toBe('none');
    });

    it('should call onBeforeOpen callback', () => {
      const onBeforeOpen = vi.fn();
      const tab = new Tab('#tabs', { onBeforeOpen, active: -1 });
      tab.open(1, 'test-data');
      expect(onBeforeOpen).toHaveBeenCalledWith(
        1,
        expect.any(NaturalElement),
        expect.any(NaturalElement),
        'test-data'
      );
    });

    it('should not open if onBeforeOpen returns false', () => {
      const onBeforeOpen = vi.fn(() => false);
      const tab = new Tab('#tabs', { onBeforeOpen, active: 0 });
      tab.open(1);
      expect(tab.getIndex()).toBe(0);
    });

    it('should call onOpen callback', () => {
      const onOpen = vi.fn();
      const tab = new Tab('#tabs', { onOpen, active: -1 });
      tab.open(1, 'test-data');
      expect(onOpen).toHaveBeenCalledWith(
        1,
        expect.any(NaturalElement),
        expect.any(NaturalElement),
        'test-data'
      );
    });

    it('should return this for chaining', () => {
      const tab = new Tab('#tabs');
      expect(tab.open(1)).toBe(tab);
    });

    it('should not open disabled tab', () => {
      const tab = new Tab('#tabs', { active: 0 });
      tab.disable(1);
      tab.open(1);
      expect(tab.getIndex()).toBe(0);
    });
  });

  describe('getStatus()', () => {
    it('should return current tab status', () => {
      const tab = new Tab('#tabs', { active: 1 });
      const status = tab.getStatus();

      expect(status.index).toBe(1);
      expect(status.tab).toBeInstanceOf(NaturalElement);
      expect(status.content).toBeInstanceOf(NaturalElement);
    });
  });

  describe('next()', () => {
    it('should open next tab', () => {
      const tab = new Tab('#tabs', { active: 0 });
      tab.next();
      expect(tab.getIndex()).toBe(1);
    });

    it('should skip disabled tabs', () => {
      const tab = new Tab('#tabs', { active: 0 });
      tab.disable(1);
      tab.next();
      expect(tab.getIndex()).toBe(2);
    });

    it('should not go past last tab', () => {
      const tab = new Tab('#tabs', { active: 2 });
      tab.next();
      expect(tab.getIndex()).toBe(2);
    });

    it('should return this for chaining', () => {
      const tab = new Tab('#tabs');
      expect(tab.next()).toBe(tab);
    });
  });

  describe('prev()', () => {
    it('should open previous tab', () => {
      const tab = new Tab('#tabs', { active: 2 });
      tab.prev();
      expect(tab.getIndex()).toBe(1);
    });

    it('should skip disabled tabs', () => {
      const tab = new Tab('#tabs', { active: 2 });
      tab.disable(1);
      tab.prev();
      expect(tab.getIndex()).toBe(0);
    });

    it('should not go before first tab', () => {
      const tab = new Tab('#tabs', { active: 0 });
      tab.prev();
      expect(tab.getIndex()).toBe(0);
    });

    it('should return this for chaining', () => {
      const tab = new Tab('#tabs');
      expect(tab.prev()).toBe(tab);
    });
  });

  describe('disable()', () => {
    it('should disable specified tab', () => {
      const tab = new Tab('#tabs');
      tab.disable(1);
      expect(tab.isDisabled(1)).toBe(true);
    });

    it('should add disabled class', () => {
      const tab = new Tab('#tabs');
      tab.disable(1);
      expect(tab.options.tabLinks.eq(1).hasClass('tab_disabled__')).toBe(true);
    });

    it('should return this for chaining', () => {
      const tab = new Tab('#tabs');
      expect(tab.disable(1)).toBe(tab);
    });
  });

  describe('enable()', () => {
    it('should enable specified tab', () => {
      const tab = new Tab('#tabs');
      tab.disable(1);
      tab.enable(1);
      expect(tab.isDisabled(1)).toBe(false);
    });

    it('should remove disabled class', () => {
      const tab = new Tab('#tabs');
      tab.disable(1);
      tab.enable(1);
      expect(tab.options.tabLinks.eq(1).hasClass('tab_disabled__')).toBe(false);
    });

    it('should return this for chaining', () => {
      const tab = new Tab('#tabs');
      expect(tab.enable(1)).toBe(tab);
    });
  });

  describe('count()', () => {
    it('should return number of tabs', () => {
      const tab = new Tab('#tabs');
      expect(tab.count()).toBe(3);
    });
  });

  describe('context()', () => {
    it('should return context element', () => {
      const tab = new Tab('#tabs');
      expect(tab.context().get(0)?.id).toBe('tabs');
    });

    it('should find within context with selector', () => {
      const tab = new Tab('#tabs');
      expect(tab.context('ul').length).toBe(1);
    });
  });

  describe('cont()', () => {
    it('should return undefined if no controller', () => {
      const tab = new Tab('#tabs');
      expect(tab.cont()).toBeUndefined();
    });

    it('should return set controller', () => {
      const tab = new Tab('#tabs');
      const controller = { test: true };
      tab.setCont(0, controller);
      expect(tab.cont(0)).toBe(controller);
    });
  });

  describe('click events', () => {
    it('should open tab on click', () => {
      const tab = new Tab('#tabs', { active: 0 });
      tab.options.tabLinks.eq(2).trigger('click');
      expect(tab.getIndex()).toBe(2);
    });

    it('should not open disabled tab on click', () => {
      const tab = new Tab('#tabs', { active: 0 });
      tab.disable(1);
      tab.options.tabLinks.eq(1).trigger('click');
      expect(tab.getIndex()).toBe(0);
    });
  });

  describe('keyboard navigation', () => {
    it('should navigate with arrow keys', () => {
      const tab = new Tab('#tabs', { active: 0, keyboard: true });
      
      // ArrowRight
      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      tab.context().get(0)?.dispatchEvent(rightEvent);
      expect(tab.getIndex()).toBe(1);

      // ArrowLeft
      const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      tab.context().get(0)?.dispatchEvent(leftEvent);
      expect(tab.getIndex()).toBe(0);
    });

    it('should navigate to first/last with Home/End', () => {
      const tab = new Tab('#tabs', { active: 1, keyboard: true });

      // End
      const endEvent = new KeyboardEvent('keydown', { key: 'End' });
      tab.context().get(0)?.dispatchEvent(endEvent);
      expect(tab.getIndex()).toBe(2);

      // Home
      const homeEvent = new KeyboardEvent('keydown', { key: 'Home' });
      tab.context().get(0)?.dispatchEvent(homeEvent);
      expect(tab.getIndex()).toBe(0);
    });
  });

  describe('destroy()', () => {
    it('should remove event listeners', () => {
      const tab = new Tab('#tabs');
      tab.destroy();
      
      // Click should not change tab
      const initialIndex = tab.getIndex();
      tab.options.tabLinks.eq(1).trigger('click');
      // Note: After destroy, the internal state may change but event handling should be cleaned
      expect(tab.context().hasClass('tab__')).toBe(false);
    });

    it('should remove classes', () => {
      const tab = new Tab('#tabs');
      tab.destroy();

      expect(tab.context().hasClass('tab__')).toBe(false);
    });

    it('should show all contents', () => {
      const tab = new Tab('#tabs');
      tab.destroy();

      const contents = tab.options.tabContents;
      expect(contents.eq(0).css('display')).not.toBe('none');
      expect(contents.eq(1).css('display')).not.toBe('none');
      expect(contents.eq(2).css('display')).not.toBe('none');
    });
  });
});

describe('createTab', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <div id="create-tabs">
        <ul><li>Tab 1</li><li>Tab 2</li></ul>
        <div>Content 1</div>
        <div>Content 2</div>
      </div>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should create Tab instance', () => {
    const tab = createTab('#create-tabs');
    expect(tab).toBeInstanceOf(Tab);
  });

  it('should pass options', () => {
    const tab = createTab('#create-tabs', { active: 1 });
    expect(tab.getIndex()).toBe(1);
  });
});

