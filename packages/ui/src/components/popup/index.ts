/**
 * Popup component for Natural-JS.
 */

import { NaturalElement, isBrowser, getDocument, getWindow } from '@natural-js/shared';
import { isString, isFunction, event as eventUtils } from '@natural-js/core';
import { getMaxZIndex, showWithTransition, hideWithTransition } from '../../utils';
import { makeDraggable } from '../../utils/draggable';
import { PopupOptions, PopupUserOptions } from './types';

export * from './types';

const DEFAULT_OPTIONS: Partial<PopupOptions> = {
  html: true,
  modal: true,
  closeMode: 'remove',
  overlayClose: true,
  overlayColor: null,
  escClose: true,
  draggable: false,
  draggableOverflowCorrection: true,
  draggableOverflowCorrectionAddValues: { top: 0, bottom: 0, left: 0, right: 0 },
  closeButton: true,
  preload: true,
  alwaysOnTop: false,
  alwaysOnTopCalcTarget: 'div, span, ul, p, nav, article, section, header, footer, aside',
  dynPos: true,
  windowScrollLock: true,
};

/**
 * Popup component for displaying modal dialogs with custom content.
 */
export class Popup {
  public options: PopupOptions;
  private dragCleanup: (() => void) | null = null;
  private scrollLockCleanup: (() => void) | null = null;
  private isOpen: boolean = false;

  constructor(context: NaturalElement | Element | Window, opts?: PopupUserOptions) {
    if (!isBrowser()) {
      this.options = {} as PopupOptions;
      return;
    }

    const doc = getDocument();
    const win = getWindow();
    if (!doc || !win) {
      this.options = {} as PopupOptions;
      return;
    }

    let contextEl: NaturalElement;
    let isWindowContext = false;

    if (context === win || (context as Window).document !== undefined) {
      contextEl = new NaturalElement(doc.body);
      isWindowContext = true;
    } else if (context instanceof NaturalElement) {
      contextEl = context;
      isWindowContext = contextEl.is('body');
    } else {
      contextEl = new NaturalElement(context as Element);
      isWindowContext = contextEl.is('body');
    }

    this.options = {
      ...DEFAULT_OPTIONS,
      context: contextEl,
      container: undefined,
      msgContext: new NaturalElement([]),
      msgContents: null,
      isWindow: isWindowContext,
      title: isWindowContext ? undefined : contextEl.attr('title') || undefined,
      ...opts,
    } as PopupOptions;

    // Set container
    if (!this.options.container) {
      this.options.container = new NaturalElement(doc.body);
    } else if (isString(this.options.container)) {
      this.options.container = new NaturalElement(doc.querySelector(this.options.container) || doc.body);
    }

    // Pre-create popup structure if preload is true
    if (this.options.preload) {
      this.createPopupStructure();
    }
  }

  /**
   * Create the popup DOM structure.
   */
  private createPopupStructure(): void {
    const opts = this.options;
    const doc = getDocument();
    if (!doc) return;

    let maxZIndex = opts.alwaysOnTop ? getMaxZIndex(opts.alwaysOnTopCalcTarget) : 0;

    // Create overlay
    const overlay = doc.createElement('div');
    overlay.className = 'block_overlay__ popup_overlay__';
    overlay.style.display = 'none';
    overlay.style.position = opts.isWindow ? 'fixed' : 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.cursor = 'not-allowed';
    if (!opts.isWindow && opts.context) {
      overlay.style.borderRadius = opts.context.css('border-radius') || '0px';
    }
    if (opts.alwaysOnTop) overlay.style.zIndex = String(maxZIndex + 1);
    if (opts.overlayColor) overlay.style.backgroundColor = opts.overlayColor;

    const container = opts.container as NaturalElement;
    container.append(overlay);
    opts.msgContext = new NaturalElement(overlay);

    // Create popup content wrapper
    const popupContent = doc.createElement('div');
    popupContent.className = 'block_overlay_msg__ popup__ hidden__';
    popupContent.style.display = 'none';
    popupContent.style.position = opts.isWindow ? 'fixed' : 'absolute';
    if (opts.alwaysOnTop) popupContent.style.zIndex = String(maxZIndex + 2);

    const closeText = opts.message?.['ko_KR']?.close ?? '닫기';

    // Build popup HTML
    let html = '';
    if (opts.title !== undefined || opts.closeButton) {
      html += '<div class="popup_title_box__">';
      if (opts.title !== undefined) {
        html += `<span class="popup_title__">${opts.title}</span>`;
      }
      if (opts.closeButton) {
        html += `<a href="#" class="popup_title_close_btn__"><span class="popup_title_close__" title="${closeText}"></span></a>`;
      }
      html += '</div>';
    }
    html += '<div class="popup_content__"></div>';

    popupContent.innerHTML = html;
    container.append(popupContent);
    opts.msgContents = new NaturalElement(popupContent);

    // Set dimensions
    if (opts.width) {
      opts.msgContents.css('width', typeof opts.width === 'number' ? `${opts.width}px` : opts.width);
    }
    if (opts.height) {
      const contentEl = opts.msgContents.find('.popup_content__');
      contentEl.css('height', typeof opts.height === 'number' ? `${opts.height}px` : opts.height);
      contentEl.css('overflow-y', 'auto');
    }

    // Load content
    if (opts.content) {
      this.setContent(opts.content);
    } else if (opts.url) {
      this.loadUrl(opts.url);
    }

    this.bindEvents();
  }

  /**
   * Bind popup events.
   */
  private bindEvents(): void {
    const opts = this.options;
    const self = this;

    // Close button click
    opts.msgContents?.find('.popup_title_close_btn__').on('click', (e: Event) => {
      e.preventDefault();
      self.close();
    });

    // Overlay click
    if (opts.modal && opts.overlayClose) {
      opts.msgContext.on('click', () => {
        self.close();
      });
    }

    // Draggable
    if (opts.draggable && opts.msgContents) {
      opts.msgContents.addClass('draggable__');
      const titleBox = opts.msgContents.find('.popup_title_box__');
      if (titleBox.length > 0) {
        this.dragCleanup = makeDraggable(opts.msgContents, {
          handle: '.popup_title_box__',
          overflowCorrection: opts.draggableOverflowCorrection,
          overflowCorrectionAddValues: opts.draggableOverflowCorrectionAddValues,
        });
      }
    }

    // Store reference
    opts.msgContents?.data('popup', this);
  }

  /**
   * Set popup content.
   */
  setContent(content: string): this {
    const contentEl = this.options.msgContents?.find('.popup_content__');
    if (contentEl) {
      if (this.options.html) {
        contentEl.html(content);
      } else {
        contentEl.text(content);
      }
    }
    return this;
  }

  /**
   * Load content from URL.
   */
  loadUrl(url: string): this {
    const opts = this.options;
    const contentEl = opts.msgContents?.find('.popup_content__');
    
    if (!contentEl) return this;

    // Use fetch to load content
    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        contentEl.html(html);
        if (opts.onLoad) {
          opts.onLoad(this);
        }
      })
      .catch((error) => {
        console.error('[Popup] Failed to load content:', error);
        contentEl.html(`<p>Failed to load content from ${url}</p>`);
      });

    return this;
  }

  /**
   * Returns the context element.
   */
  context(selector?: string): NaturalElement {
    return selector ? this.options.context.find(selector) : this.options.context;
  }

  /**
   * Returns the popup content element.
   */
  content(selector?: string): NaturalElement {
    const contentEl = this.options.msgContents?.find('.popup_content__') ?? new NaturalElement([]);
    return selector ? contentEl.find(selector) : contentEl;
  }

  /**
   * Open the popup.
   */
  open(onOpenData?: unknown): this {
    const opts = this.options;
    const win = getWindow();
    const doc = getDocument();

    if (!isBrowser() || !win || !doc) return this;

    // Create structure if not preloaded
    if (!opts.msgContents) {
      this.createPopupStructure();
    }

    // Call onBeforeOpen
    if (opts.onBeforeOpen) {
      const result = opts.onBeforeOpen(onOpenData, this);
      if (result === false) return this;
    }

    // Show overlay
    if (opts.modal) {
      opts.msgContext.show();
      
      // Enable scroll lock
      if (opts.windowScrollLock) {
        const msgContextEl = opts.msgContext.get(0) as HTMLElement | undefined;
        if (msgContextEl) {
          this.scrollLockCleanup = eventUtils.windowScrollLock(msgContextEl);
        }
      }
    }

    // Position and show popup
    this.resetPosition();

    if (opts.msgContents) {
      showWithTransition(opts.msgContents);
    }

    this.isOpen = true;

    // Dynamic positioning
    if (opts.dynPos && !opts.isWindow) {
      opts.time = setInterval(() => {
        if (opts.context.is(':visible')) {
          this.resetPosition();
        }
      }, 500);
    } else {
      opts.resizeHandler = () => this.resetPosition();
      win.addEventListener('resize', opts.resizeHandler);
    }

    // ESC key handling
    if (opts.escClose) {
      opts.keyupHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.keyCode === 27) {
          this.close();
        }
      };
      doc.addEventListener('keyup', opts.keyupHandler);
    }

    // Call onOpen
    if (opts.onOpen) {
      setTimeout(() => opts.onOpen?.(onOpenData, this), 300);
    }

    return this;
  }

  /**
   * Reset popup position.
   */
  private resetPosition(): void {
    const opts = this.options;
    const win = getWindow();
    if (!win || !opts.msgContents) return;

    if (!opts.context.is(':visible')) {
      opts.msgContext.hide();
      opts.msgContents.hide();
      return;
    }

    const viewportHeight = win.innerHeight;
    const viewportWidth = win.innerWidth;
    const contentHeight = opts.msgContents.outerHeight() ?? 0;
    const contentWidth = opts.msgContents.outerWidth() ?? 0;

    if (opts.msgContents.data('isMoved') !== true) {
      // Center the popup
      if (opts.top !== undefined) {
        opts.msgContents.css('position', 'absolute');
        opts.msgContents.css('top', `${opts.top}px`);
      } else {
        if (opts.isWindow) {
          opts.msgContents.css('top', '50%');
          opts.msgContents.css('margin-top', `-${contentHeight / 2}px`);
        } else {
          const contextHeight = opts.context.outerHeight() ?? 0;
          const contextTop = opts.context.position()?.top ?? 0;
          opts.msgContents.css('top', `${contextTop + (contextHeight - contentHeight) / 2}px`);
        }
      }

      if (opts.left !== undefined) {
        opts.msgContents.css('left', `${opts.left}px`);
      } else {
        if (opts.isWindow) {
          opts.msgContents.css('left', '50%');
          opts.msgContents.css('margin-left', `-${contentWidth / 2}px`);
        } else {
          const contextWidth = opts.context.outerWidth() ?? 0;
          const contextLeft = opts.context.position()?.left ?? 0;
          opts.msgContents.css('left', `${contextLeft + (contextWidth - contentWidth) / 2}px`);
        }
      }

      // Handle overflow
      if (contentHeight > viewportHeight) {
        opts.msgContents.css('margin-top', '0');
        opts.msgContents.css('top', `${win.scrollY || 0}px`);
        opts.msgContents.css('position', 'absolute');
      }
      if (contentWidth > viewportWidth) {
        opts.msgContents.css('margin-left', '0');
        opts.msgContents.css('left', '0');
        opts.msgContents.css('position', 'absolute');
      }

      if (opts.isWindow && viewportHeight > contentHeight && viewportWidth > contentWidth) {
        opts.msgContents.css('position', 'fixed');
      }
    }

    opts.msgContents.show();
  }

  /**
   * Close the popup.
   */
  close(onCloseData?: unknown): this {
    const opts = this.options;
    const win = getWindow();
    const doc = getDocument();

    if (!isBrowser() || !win || !doc) return this;

    // Call onBeforeClose
    if (opts.onBeforeClose) {
      const result = opts.onBeforeClose(onCloseData, this);
      if (result === false) return this;
    }

    // Clear timers
    if (opts.time) clearInterval(opts.time);
    if (opts.resizeHandler) win.removeEventListener('resize', opts.resizeHandler);
    if (opts.keyupHandler) doc.removeEventListener('keyup', opts.keyupHandler);

    // Release scroll lock
    if (this.scrollLockCleanup) {
      this.scrollLockCleanup();
      this.scrollLockCleanup = null;
    }

    // Hide or remove based on closeMode
    if (opts.closeMode === 'remove') {
      this.remove();
    } else {
      opts.msgContext.hide();
      if (opts.msgContents) {
        hideWithTransition(opts.msgContents).then(() => {
          opts.onClose?.(onCloseData, this);
        });
      }
    }

    this.isOpen = false;
    return this;
  }

  /**
   * Remove the popup from DOM.
   */
  remove(): this {
    const opts = this.options;
    const win = getWindow();
    const doc = getDocument();

    if (!isBrowser() || !win || !doc) return this;

    // Call onBeforeRemove
    if (opts.onBeforeRemove) {
      opts.onBeforeRemove(this);
    }

    // Clear timers
    if (opts.time) clearInterval(opts.time);
    if (opts.resizeHandler) win.removeEventListener('resize', opts.resizeHandler);
    if (opts.keyupHandler) doc.removeEventListener('keyup', opts.keyupHandler);

    // Cleanup draggable
    if (this.dragCleanup) {
      this.dragCleanup();
      this.dragCleanup = null;
    }

    // Release scroll lock
    if (this.scrollLockCleanup) {
      this.scrollLockCleanup();
      this.scrollLockCleanup = null;
    }

    // Remove elements
    if (opts.msgContents) {
      hideWithTransition(opts.msgContents, true).then(() => {
        opts.msgContext.remove();
        opts.onRemove?.(this);
      });
    } else {
      opts.msgContext.remove();
      opts.onRemove?.(this);
    }

    this.isOpen = false;
    return this;
  }

  /**
   * Check if popup is currently open.
   */
  isOpened(): boolean {
    return this.isOpen;
  }
}

/**
 * Factory function to create a Popup instance.
 */
export function createPopup(
  context: NaturalElement | Element | Window,
  opts?: PopupUserOptions
): Popup {
  return new Popup(context, opts);
}

