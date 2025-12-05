/**
 * Button component for Natural-JS.
 */

import { NaturalElement, isBrowser } from '@natural-js/shared';
import { isString, isFunction } from '@natural-js/core';
import { ButtonOptions, ButtonUserOptions } from './types';

export * from './types';

const DEFAULT_OPTIONS: Partial<ButtonOptions> = {
  color: '',
  disabled: false,
  selector: 'button, input[type="button"], input[type="submit"], a.button',
  animationDuration: 200,
};

/**
 * Button component that enhances native button elements.
 */
export class Button {
  public options: ButtonOptions;
  private buttons: NaturalElement;

  constructor(context: NaturalElement | Element | string, opts?: ButtonUserOptions) {
    if (!isBrowser()) {
      this.options = {} as ButtonOptions;
      this.buttons = new NaturalElement([]);
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
    } as ButtonOptions;

    // Find button elements
    this.buttons = this.options.selector
      ? contextEl.find(this.options.selector)
      : contextEl;

    // If context itself is a button, use it
    if (this.buttons.length === 0 && contextEl.is('button, input[type="button"], input[type="submit"], a')) {
      this.buttons = contextEl;
    }

    this.init();
  }

  /**
   * Initialize button functionality.
   */
  private init(): void {
    const opts = this.options;
    const self = this;

    // Add button class
    this.buttons.addClass('button__');

    // Add color class if specified
    if (opts.color) {
      this.buttons.addClass(opts.color);
    }

    // Apply initial disabled state
    if (opts.disabled) {
      this.disable();
    }

    // Bind click event
    this.buttons.on('click.button', function (this: Element, e: Event) {
      const button = new NaturalElement(this);

      // Check if disabled
      if (button.hasClass('disabled__') || button.attr('disabled') === 'disabled') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Call onBeforeClick
      if (opts.onBeforeClick) {
        const result = opts.onBeforeClick(e, button);
        if (result === false) {
          e.preventDefault();
          return;
        }
      }

      // Add click animation effect
      button.addClass('button_active__');
      setTimeout(() => {
        button.removeClass('button_active__');
      }, opts.animationDuration ?? 200);

      // Call onClick
      if (opts.onClick) {
        opts.onClick(e, button);
      }
    });

    // Store reference
    this.buttons.data('button', this);
  }

  /**
   * Returns the context element.
   */
  context(selector?: string): NaturalElement {
    return selector ? this.options.context.find(selector) : this.options.context;
  }

  /**
   * Returns the button elements.
   */
  getButtons(): NaturalElement {
    return this.buttons;
  }

  /**
   * Disable the button(s).
   */
  disable(): this {
    this.buttons.addClass('disabled__');
    this.buttons.attr('disabled', 'disabled');
    this.buttons.each((_, el) => {
      if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) {
        el.disabled = true;
      }
    });
    return this;
  }

  /**
   * Enable the button(s).
   */
  enable(): this {
    this.buttons.removeClass('disabled__');
    this.buttons.removeAttr('disabled');
    this.buttons.each((_, el) => {
      if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) {
        el.disabled = false;
      }
    });
    return this;
  }

  /**
   * Check if the button(s) are disabled.
   */
  isDisabled(): boolean {
    return this.buttons.hasClass('disabled__') || this.buttons.attr('disabled') === 'disabled';
  }

  /**
   * Toggle the disabled state.
   */
  toggleDisabled(): this {
    if (this.isDisabled()) {
      this.enable();
    } else {
      this.disable();
    }
    return this;
  }

  /**
   * Set button text.
   */
  text(value: string): this {
    this.buttons.text(value);
    return this;
  }

  /**
   * Trigger a click event on the button.
   */
  click(): this {
    this.buttons.trigger('click');
    return this;
  }

  /**
   * Destroy the button instance.
   */
  destroy(): void {
    this.buttons.off('click.button');
    this.buttons.removeClass('button__ button_active__ disabled__');
    if (this.options.color) {
      this.buttons.removeClass(this.options.color);
    }
    this.buttons.removeData('button');
  }
}

/**
 * Factory function to create a Button instance.
 */
export function createButton(
  context: NaturalElement | Element | string,
  opts?: ButtonUserOptions
): Button {
  return new Button(context, opts);
}

