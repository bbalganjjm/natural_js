/**
 * Button component for Natural-JS.
 */

import { NaturalElement, isBrowser } from '@natural-js/shared';
import { isString, isFunction, element } from '@natural-js/core';
import { ButtonOptions, ButtonUserOptions } from './types';

export * from './types';

const DEFAULT_OPTIONS: Partial<ButtonOptions> = {
  size: 'none',
  type: 'none',
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
    const baseOpts = this.options;

    // Initialize each button individually to honor data-opts
    this.buttons.each((_, el) => {
      const btn = new NaturalElement(el);
      const dataOpts = element.toOpts(el) as Partial<ButtonOptions> | undefined;
      const opts = { ...baseOpts, ...dataOpts };

      // Add button class
      btn.addClass('btn_common__ button__');

      // Size classes
      const sizeClass: Record<string, string> = {
        none: '',
        smaller: 'btn_smaller__',
        small: 'btn_small__',
        medium: 'btn_medium__',
        large: 'btn_large__',
        big: 'btn_big__',
      };
      const sizeKey = opts.size as keyof typeof sizeClass | undefined;
      if (sizeKey && sizeClass[sizeKey]) {
        btn.addClass(sizeClass[sizeKey]);
      }

      // Type classes
      if (opts.type === 'outlined') {
        btn.addClass('btn_outlined__');
      } else if (opts.type === 'elevated') {
        btn.addClass('btn_elevated__');
      }

      // Color class if specified
      if (opts.color) {
        btn.addClass(`btn_${opts.color}__`);
        btn.addClass(opts.color);
      }

      const disabledFlag =
        opts.disabled === true ||
        opts.disable === true ||
        opts.disabled === 'true' ||
        opts.disable === 'true';

      // Apply initial disabled state
      if (disabledFlag) {
        btn.addClass('btn_disabled__ disabled__');
        btn.attr('disabled', 'disabled');
        if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) {
          el.disabled = true;
        }
      }

      // Bind click event
      btn.off('click.button').on('click.button', (e: Event) => {
        // Check if disabled
        if (btn.hasClass('btn_disabled__') || btn.attr('disabled') === 'disabled') {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        if (opts.onBeforeClick) {
          const result = opts.onBeforeClick(e, btn);
          if (result === false) {
            e.preventDefault();
            return;
          }
        }

        // active class for click feedback
        btn.addClass('button_active__');
        setTimeout(() => btn.removeClass('button_active__'), opts.animationDuration ?? 200);

        if (opts.onClick) {
          opts.onClick(e, btn);
        }
      });
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
    this.buttons.addClass('btn_disabled__ disabled__');
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
    this.buttons.removeClass('btn_disabled__ disabled__');
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
    const elements = this.buttons.get();
    for (const el of elements) {
      const htmlEl = el as HTMLButtonElement | HTMLInputElement | undefined;
      if (htmlEl && (htmlEl.disabled || htmlEl.hasAttribute('disabled'))) {
        return true;
      }
    }
    return this.buttons.hasClass('btn_disabled__') || this.buttons.hasClass('disabled__');
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
    this.buttons.removeClass(
      'btn_common__ button__ btn_disabled__ disabled__ btn_outlined__ btn_elevated__ btn_smaller__ btn_small__ btn_medium__ btn_large__ btn_big__ button_active__'
    );
    this.buttons.removeAttr('disabled');
    if (this.options.color) {
      this.buttons.removeClass(this.options.color);
      this.buttons.removeClass(`btn_${this.options.color}__`);
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

