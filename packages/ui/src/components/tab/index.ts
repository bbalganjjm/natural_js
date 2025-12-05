/**
 * Tab component for Natural-JS.
 */

import { NaturalElement, isBrowser, getDocument } from '@natural-js/shared';
import { isString, isFunction, isArray } from '@natural-js/core';
import { TabOptions, TabUserOptions, TabStatusInfo } from './types';

export * from './types';

const DEFAULT_OPTIONS: Partial<TabOptions> = {
  active: 0,
  preload: true,
  keyboard: true,
  effect: 'none',
  effectDuration: 200,
  tabScroll: false,
  activeClass: 'tab_active__',
  disabledClass: 'tab_disabled__',
  tabLinkSelector: 'ul > li, nav > a, .tab-links > a, .tab-links > li',
  tabContentSelector: ':scope > div, :scope > section, .tab-content > div, .tab-content > section',
};

/**
 * Tab component for creating tabbed interfaces.
 */
export class Tab {
  public options: TabOptions;
  private currentIndex: number = -1;

  constructor(context: NaturalElement | Element | string, opts?: TabUserOptions) {
    if (!isBrowser()) {
      this.options = {} as TabOptions;
      return;
    }

    let contextEl: NaturalElement;
    if (context instanceof NaturalElement) {
      contextEl = context;
    } else if (isString(context)) {
      contextEl = new NaturalElement(context);
    } else {
      contextEl = new NaturalElement(context);
    }

    this.options = {
      ...DEFAULT_OPTIONS,
      ...opts,
      context: contextEl,
      tabLinks: new NaturalElement([]),
      tabContents: new NaturalElement([]),
      controllers: new Map(),
    } as TabOptions;

    this.init();
  }

  /**
   * Initialize the tab component.
   */
  private init(): void {
    const opts = this.options;

    // Find tab links and contents
    opts.tabLinks = opts.context.find(opts.tabLinkSelector!);
    opts.tabContents = opts.context.find(opts.tabContentSelector!);

    // Add base classes
    opts.context.addClass('tab__');
    opts.tabLinks.addClass('tab_link__');
    opts.tabContents.addClass('tab_content__');

    // Hide all contents initially
    opts.tabContents.hide();

    // Bind click events to tab links
    this.bindEvents();

    // Open default tab
    if (opts.active !== undefined && opts.active >= 0) {
      this.open(opts.active, undefined, true);
    }

    // Store reference
    opts.context.data('tab', this);
  }

  /**
   * Bind tab events.
   */
  private bindEvents(): void {
    const opts = this.options;
    const self = this;

    // Click event on tab links
    opts.tabLinks.each((index, el) => {
      const link = new NaturalElement(el);
      link.on('click.tab', (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        if (!link.hasClass(opts.disabledClass!)) {
          self.open(index);
        }
      });
    });

    // Keyboard navigation
    if (opts.keyboard) {
      opts.context.on('keydown.tab', (e: Event) => {
        const keyEvent = e as KeyboardEvent;
        const key = keyEvent.key;

        if (key === 'ArrowLeft' || key === 'ArrowUp') {
          e.preventDefault();
          self.prev();
        } else if (key === 'ArrowRight' || key === 'ArrowDown') {
          e.preventDefault();
          self.next();
        } else if (key === 'Home') {
          e.preventDefault();
          self.open(0);
        } else if (key === 'End') {
          e.preventDefault();
          self.open(opts.tabLinks.length - 1);
        }
      });
    }
  }

  /**
   * Returns the context element.
   */
  context(selector?: string): NaturalElement {
    return selector ? this.options.context.find(selector) : this.options.context;
  }

  /**
   * Open a specific tab.
   */
  open(index: number, onOpenData?: unknown, isFirst?: boolean): this | TabStatusInfo {
    const opts = this.options;

    // Return status info if no arguments
    if (index === undefined) {
      return this.getStatus();
    }

    // Validate index
    if (index < 0 || index >= opts.tabLinks.length) {
      console.warn(`[Tab] Invalid tab index: ${index}`);
      return this;
    }

    const tab = opts.tabLinks.eq(index);
    const content = opts.tabContents.eq(index);

    // Check if disabled
    if (tab.hasClass(opts.disabledClass!)) {
      return this;
    }

    // Call onBeforeOpen
    if (opts.onBeforeOpen && !isFirst) {
      const result = opts.onBeforeOpen(index, tab, content, onOpenData);
      if (result === false) return this;
    }

    // Deactivate all tabs
    opts.tabLinks.removeClass(opts.activeClass!);
    opts.tabContents.removeClass(opts.activeClass!);

    // Apply effect
    if (opts.effect === 'fade') {
      opts.tabContents.css('opacity', '0');
      opts.tabContents.hide();
      content.show();
      content.css('transition', `opacity ${opts.effectDuration}ms`);
      content.css('opacity', '1');
    } else if (opts.effect === 'slide') {
      opts.tabContents.hide();
      content.css('display', 'block');
      content.addClass('slide_in__');
      setTimeout(() => content.removeClass('slide_in__'), opts.effectDuration);
    } else {
      opts.tabContents.hide();
      content.show();
    }

    // Activate selected tab
    tab.addClass(opts.activeClass!);
    content.addClass(opts.activeClass!);
    this.currentIndex = index;

    // Load content from URL if specified
    if (opts.url && opts.url[index] && !content.data('loaded')) {
      this.loadContent(index, opts.url[index]);
    }

    // Set ARIA attributes
    tab.attr('aria-selected', 'true');
    opts.tabLinks.each((i, el) => {
      if (i !== index) {
        new NaturalElement(el).attr('aria-selected', 'false');
      }
    });

    // Call onOpen
    if (opts.onOpen && !isFirst) {
      opts.onOpen(index, tab, content, onOpenData);
    }

    return this;
  }

  /**
   * Load content from URL.
   */
  private loadContent(index: number, url: string): void {
    const opts = this.options;
    const content = opts.tabContents.eq(index);
    const tab = opts.tabLinks.eq(index);

    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        content.html(html);
        content.data('loaded', true);
        
        if (opts.onLoad) {
          opts.onLoad(index, tab, content);
        }
      })
      .catch((error) => {
        console.error(`[Tab] Failed to load content from ${url}:`, error);
        content.html(`<p>Failed to load content</p>`);
      });
  }

  /**
   * Get current tab status.
   */
  getStatus(): TabStatusInfo {
    const opts = this.options;
    return {
      index: this.currentIndex,
      tab: opts.tabLinks.eq(this.currentIndex),
      content: opts.tabContents.eq(this.currentIndex),
      cont: opts.controllers?.get(this.currentIndex),
    };
  }

  /**
   * Get current active tab index.
   */
  getIndex(): number {
    return this.currentIndex;
  }

  /**
   * Open next tab.
   */
  next(): this {
    const opts = this.options;
    let nextIndex = this.currentIndex + 1;

    // Skip disabled tabs
    while (nextIndex < opts.tabLinks.length && opts.tabLinks.eq(nextIndex).hasClass(opts.disabledClass!)) {
      nextIndex++;
    }

    if (nextIndex < opts.tabLinks.length) {
      this.open(nextIndex);
    }

    return this;
  }

  /**
   * Open previous tab.
   */
  prev(): this {
    const opts = this.options;
    let prevIndex = this.currentIndex - 1;

    // Skip disabled tabs
    while (prevIndex >= 0 && opts.tabLinks.eq(prevIndex).hasClass(opts.disabledClass!)) {
      prevIndex--;
    }

    if (prevIndex >= 0) {
      this.open(prevIndex);
    }

    return this;
  }

  /**
   * Disable a tab.
   */
  disable(index: number): this {
    const opts = this.options;
    if (index >= 0 && index < opts.tabLinks.length) {
      opts.tabLinks.eq(index).addClass(opts.disabledClass!);
      opts.tabLinks.eq(index).attr('aria-disabled', 'true');
    }
    return this;
  }

  /**
   * Enable a tab.
   */
  enable(index: number): this {
    const opts = this.options;
    if (index >= 0 && index < opts.tabLinks.length) {
      opts.tabLinks.eq(index).removeClass(opts.disabledClass!);
      opts.tabLinks.eq(index).removeAttr('aria-disabled');
    }
    return this;
  }

  /**
   * Check if a tab is disabled.
   */
  isDisabled(index: number): boolean {
    const opts = this.options;
    if (index >= 0 && index < opts.tabLinks.length) {
      return opts.tabLinks.eq(index).hasClass(opts.disabledClass!);
    }
    return false;
  }

  /**
   * Get the controller for a specific tab.
   */
  cont(index?: number): unknown {
    const idx = index ?? this.currentIndex;
    return this.options.controllers?.get(idx);
  }

  /**
   * Set the controller for a specific tab.
   */
  setCont(index: number, controller: unknown): this {
    this.options.controllers?.set(index, controller);
    return this;
  }

  /**
   * Get the number of tabs.
   */
  count(): number {
    return this.options.tabLinks.length;
  }

  /**
   * Destroy the tab component.
   */
  destroy(): void {
    const opts = this.options;

    // Remove event listeners
    opts.tabLinks.off('click.tab');
    opts.context.off('keydown.tab');

    // Remove classes
    opts.context.removeClass('tab__');
    opts.tabLinks.removeClass('tab_link__ ' + opts.activeClass + ' ' + opts.disabledClass);
    opts.tabContents.removeClass('tab_content__ ' + opts.activeClass);

    // Show all contents
    opts.tabContents.show();

    // Clear data
    opts.context.removeData('tab');
    opts.controllers?.clear();
  }
}

/**
 * Factory function to create a Tab instance.
 */
export function createTab(
  context: NaturalElement | Element | string,
  opts?: TabUserOptions
): Tab {
  return new Tab(context, opts);
}

