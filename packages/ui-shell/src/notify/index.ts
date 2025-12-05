/**
 * Notify component for Natural-JS.
 * Provides toast-style notifications.
 */

import { NaturalElement, isBrowser, getDocument } from '@natural-js/shared';
import { isString } from '@natural-js/core';
import { NotifyOptions, NotifyUserOptions, NotifyItem, NotifyType, NotifyPosition } from './types';

export * from './types';

const DEFAULT_OPTIONS: Partial<NotifyOptions> = {
  position: 'top-right',
  type: 'info',
  closeAfter: 5000,
  maxCount: 5,
  showClose: true,
  pauseOnHover: true,
};

/** Global notification container */
let globalContainer: NaturalElement | null = null;

/** Active notifications */
const notifications: NotifyItem[] = [];

/** ID counter */
let idCounter = 0;

/**
 * Generate unique notification ID.
 */
function generateId(): string {
  return `notify_${++idCounter}_${Date.now()}`;
}

/**
 * Notify component for toast-style notifications.
 */
export class Notify {
  public options: NotifyOptions;
  private timers: Map<string, number> = new Map();

  constructor(context?: NaturalElement | Element | string, opts?: NotifyUserOptions) {
    if (!isBrowser()) {
      this.options = {} as NotifyOptions;
      return;
    }

    let contextEl: NaturalElement;
    
    if (context) {
      if (context instanceof NaturalElement) {
        contextEl = context;
      } else if (isString(context)) {
        contextEl = new NaturalElement(context);
      } else {
        contextEl = new NaturalElement(context);
      }
    } else {
      // Create or get global container
      contextEl = this.getOrCreateContainer(opts?.position ?? 'top-right');
    }

    this.options = {
      ...DEFAULT_OPTIONS,
      ...opts,
      context: contextEl,
    } as NotifyOptions;

    // Add classes
    contextEl.addClass('notify__');
    contextEl.addClass(`notify_${this.options.position.replace('-', '_')}__`);

    // Store reference
    contextEl.data('notify', this);
  }

  /**
   * Get or create notification container.
   */
  private getOrCreateContainer(position: NotifyPosition): NaturalElement {
    const doc = getDocument();
    if (!doc) return new NaturalElement(doc!.createElement('div'));

    // Check for existing container
    let container = doc.querySelector(`.notify_container_${position.replace('-', '_')}__`) as HTMLElement | null;
    
    if (!container) {
      container = doc.createElement('div');
      container.className = `notify_container__ notify_container_${position.replace('-', '_')}__`;
      
      // Position styles
      const styles: Partial<CSSStyleDeclaration> = {
        position: 'fixed',
        zIndex: '9999',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '20px',
        pointerEvents: 'none',
      };

      if (position.includes('top')) {
        styles.top = '0';
      } else {
        styles.bottom = '0';
      }

      if (position.includes('left')) {
        styles.left = '0';
        styles.alignItems = 'flex-start';
      } else if (position.includes('right')) {
        styles.right = '0';
        styles.alignItems = 'flex-end';
      } else {
        styles.left = '50%';
        styles.transform = 'translateX(-50%)';
        styles.alignItems = 'center';
      }

      Object.assign(container.style, styles);
      doc.body.appendChild(container);
    }

    return new NaturalElement(container);
  }

  /**
   * Returns the context element.
   */
  context(selector?: string): NaturalElement {
    return selector ? this.options.context.find(selector) : this.options.context;
  }

  /**
   * Add a notification.
   */
  add(message: string, type?: NotifyType, url?: string): NotifyItem {
    const opts = this.options;
    const doc = getDocument();
    if (!doc) return { id: '', message, type: type || opts.type };

    // Limit max notifications
    while (notifications.length >= opts.maxCount) {
      const oldest = notifications[0];
      if (oldest) {
        this.remove(oldest.id);
      }
    }

    const id = generateId();
    const item: NotifyItem = {
      id,
      message,
      type: type || opts.type,
      url,
    };

    // Create element
    const el = doc.createElement('div');
    el.className = `notify_item__ notify_${item.type}__`;
    el.dataset['id'] = id;
    el.style.pointerEvents = 'auto';

    // Icon
    const icon = doc.createElement('span');
    icon.className = 'notify_icon__';
    icon.textContent = this.getIcon(item.type);
    el.appendChild(icon);

    // Message
    const msg = doc.createElement('span');
    msg.className = 'notify_message__';
    msg.textContent = message;
    el.appendChild(msg);

    // Close button
    if (opts.showClose) {
      const close = doc.createElement('button');
      close.className = 'notify_close__';
      close.textContent = '×';
      close.type = 'button';
      close.addEventListener('click', (e) => {
        e.stopPropagation();
        this.remove(id);
      });
      el.appendChild(close);
    }

    // Click handler
    el.addEventListener('click', (e) => {
      if (url) {
        window.location.href = url;
      }
      if (opts.onClick) {
        opts.onClick(item, e);
      }
    });

    // Pause on hover
    if (opts.pauseOnHover && opts.closeAfter > 0) {
      el.addEventListener('mouseenter', (_e: Event) => {
        const timer = this.timers.get(id);
        if (timer) {
          window.clearTimeout(timer);
          this.timers.delete(id);
        }
      });

      el.addEventListener('mouseleave', (_e: Event) => {
        this.startCloseTimer(id);
      });
    }

    item.element = new NaturalElement(el);
    notifications.push(item);

    // Add to container
    opts.context.append(el);

    // Start close timer
    if (opts.closeAfter > 0) {
      this.startCloseTimer(id);
    }

    return item;
  }

  /**
   * Get icon for notification type.
   */
  private getIcon(type: NotifyType): string {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✕';
      case 'info':
      default: return 'ℹ';
    }
  }

  /**
   * Start close timer for notification.
   */
  private startCloseTimer(id: string): void {
    const opts = this.options;
    if (opts.closeAfter <= 0) return;

    const timer = window.setTimeout(() => {
      this.remove(id);
    }, opts.closeAfter);

    this.timers.set(id, timer);
  }

  /**
   * Remove a notification.
   */
  remove(id: string): this {
    const opts = this.options;
    const index = notifications.findIndex((n) => n.id === id);
    
    if (index < 0) return this;

    const item = notifications[index];
    if (!item) return this;

    // Clear timer
    const timer = this.timers.get(id);
    if (timer) {
      window.clearTimeout(timer);
      this.timers.delete(id);
    }

    // Remove element
    item.element?.remove();

    // Remove from array
    notifications.splice(index, 1);

    // Callback
    if (opts.onClose) {
      opts.onClose(item);
    }

    return this;
  }

  /**
   * Remove all notifications.
   */
  clear(): this {
    const ids = notifications.map((n) => n.id);
    for (const id of ids) {
      this.remove(id);
    }
    return this;
  }

  /**
   * Get all active notifications.
   */
  list(): NotifyItem[] {
    return [...notifications];
  }

  /**
   * Get notification count.
   */
  count(): number {
    return notifications.length;
  }

  /**
   * Destroy the notify instance.
   */
  destroy(): void {
    this.clear();
    this.options.context.removeClass('notify__');
    this.options.context.removeData('notify');
  }

  // ==================== Static Methods ====================

  /** Default instance */
  private static instance: Notify | null = null;

  /**
   * Get or create default instance.
   */
  private static getInstance(opts?: NotifyUserOptions): Notify {
    if (!Notify.instance) {
      Notify.instance = new Notify(undefined, opts);
    }
    return Notify.instance;
  }

  /**
   * Add notification using default instance.
   */
  static add(message: string, type?: NotifyType, url?: string): NotifyItem {
    return Notify.getInstance().add(message, type, url);
  }

  /**
   * Add info notification.
   */
  static info(message: string, url?: string): NotifyItem {
    return Notify.add(message, 'info', url);
  }

  /**
   * Add success notification.
   */
  static success(message: string, url?: string): NotifyItem {
    return Notify.add(message, 'success', url);
  }

  /**
   * Add warning notification.
   */
  static warning(message: string, url?: string): NotifyItem {
    return Notify.add(message, 'warning', url);
  }

  /**
   * Add error notification.
   */
  static error(message: string, url?: string): NotifyItem {
    return Notify.add(message, 'error', url);
  }

  /**
   * Remove notification by ID using default instance.
   */
  static remove(id: string): void {
    Notify.getInstance().remove(id);
  }

  /**
   * Clear all notifications using default instance.
   */
  static clear(): void {
    Notify.getInstance().clear();
  }
}

/**
 * Factory function to create a Notify instance.
 */
export function createNotify(
  context?: NaturalElement | Element | string,
  opts?: NotifyUserOptions
): Notify {
  return new Notify(context, opts);
}

