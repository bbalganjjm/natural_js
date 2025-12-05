/**
 * Select component for Natural-JS.
 * Provides data binding for select, checkbox, and radio elements.
 */

import { NaturalElement, isBrowser, getDocument } from '@natural-js/shared';
import { isString, isArray, isFunction, isPlainObject } from '@natural-js/core';
import { SelectOptions, SelectUserOptions, SelectDataItem } from './types';

export * from './types';

const DEFAULT_OPTIONS: Partial<SelectOptions> = {
  data: [],
  key: 'code',
  val: 'name',
  append: false,
  addEmpty: true,
  emptyText: '',
  emptyValue: '',
  selectClass: 'select__',
};

/**
 * Select component for binding data to select/checkbox/radio elements.
 */
export class Select {
  public options: SelectOptions;

  constructor(
    context: NaturalElement | Element | string,
    opts?: SelectUserOptions
  ) {
    if (!isBrowser()) {
      this.options = {} as SelectOptions;
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

    // Determine element type
    const firstEl = contextEl.get(0);
    let type: 'select' | 'checkbox' | 'radio' = 'select';
    let name = '';

    if (firstEl) {
      const tagName = firstEl.tagName.toLowerCase();
      if (tagName === 'select') {
        type = 'select';
      } else if (tagName === 'input') {
        const inputType = (firstEl as HTMLInputElement).type.toLowerCase();
        if (inputType === 'checkbox') {
          type = 'checkbox';
          name = (firstEl as HTMLInputElement).name;
        } else if (inputType === 'radio') {
          type = 'radio';
          name = (firstEl as HTMLInputElement).name;
        }
      } else {
        // Assume it's a container for checkbox/radio
        const checkbox = contextEl.find('input[type="checkbox"]');
        const radio = contextEl.find('input[type="radio"]');
        if (checkbox.length > 0) {
          type = 'checkbox';
          name = (checkbox.get(0) as HTMLInputElement)?.name || '';
        } else if (radio.length > 0) {
          type = 'radio';
          name = (radio.get(0) as HTMLInputElement)?.name || '';
        }
      }
    }

    this.options = {
      ...DEFAULT_OPTIONS,
      ...opts,
      context: contextEl,
      type,
      name,
    } as SelectOptions;

    // Add class
    if (type === 'select') {
      contextEl.addClass(this.options.selectClass || 'select__');
    }

    // Initial bind if data provided
    if (opts?.data && opts.data.length > 0) {
      this.bind(opts.data);
    }

    // Store reference
    contextEl.data('select', this);
  }

  /**
   * Returns the context element.
   */
  context(selector?: string): NaturalElement {
    return selector ? this.options.context.find(selector) : this.options.context;
  }

  /**
   * Bind data to the select/checkbox/radio elements.
   */
  bind(data?: SelectDataItem[]): this {
    const opts = this.options;
    const doc = getDocument();
    if (!doc) return this;

    if (data !== undefined) {
      opts.data = data;
    }

    if (opts.type === 'select') {
      this.bindSelect();
    } else if (opts.type === 'checkbox' || opts.type === 'radio') {
      this.bindCheckboxRadio();
    }

    // Bind change event
    this.bindChangeEvent();

    // Call onBind
    if (opts.onBind) {
      opts.onBind(opts.context, opts.data);
    }

    return this;
  }

  /**
   * Bind data to select element.
   */
  private bindSelect(): void {
    const opts = this.options;
    const doc = getDocument();
    if (!doc) return;

    const selectEl = opts.context.get(0) as HTMLSelectElement;
    if (!selectEl) return;

    // Clear existing options if not append mode
    if (!opts.append) {
      selectEl.innerHTML = '';
    }

    // Add empty option
    if (opts.addEmpty) {
      const emptyOption = doc.createElement('option');
      emptyOption.value = opts.emptyValue || '';
      emptyOption.textContent = opts.emptyText || '';
      selectEl.appendChild(emptyOption);
    }

    // Add options from data
    for (const item of opts.data) {
      const option = doc.createElement('option');
      option.value = String(item[opts.key] ?? '');
      option.textContent = String(item[opts.val] ?? '');
      
      // Store data reference
      (option as HTMLOptionElement & { __data__?: SelectDataItem }).__data__ = item;
      
      selectEl.appendChild(option);
    }

    // Set selected value
    if (opts.selected !== undefined) {
      selectEl.value = String(opts.selected);
    }
  }

  /**
   * Bind data to checkbox/radio elements.
   */
  private bindCheckboxRadio(): void {
    const opts = this.options;
    const doc = getDocument();
    if (!doc) return;

    const container = opts.context.get(0);
    if (!container) return;

    // Clear existing if not append mode
    if (!opts.append) {
      // Remove only generated elements
      opts.context.find('.select_item__').remove();
    }

    // Add checkbox/radio from data
    for (let i = 0; i < opts.data.length; i++) {
      const item = opts.data[i];
      if (!item) continue;

      const wrapper = doc.createElement('label');
      wrapper.className = 'select_item__';

      const input = doc.createElement('input');
      input.type = opts.type || 'checkbox';
      input.name = opts.name || '';
      input.value = String(item[opts.key] ?? '');
      
      // Store data reference
      (input as HTMLInputElement & { __data__?: SelectDataItem }).__data__ = item;

      const span = doc.createElement('span');
      span.textContent = String(item[opts.val] ?? '');

      wrapper.appendChild(input);
      wrapper.appendChild(span);
      container.appendChild(wrapper);

      // Set selected
      if (opts.selected !== undefined) {
        if (isArray(opts.selected)) {
          input.checked = (opts.selected as unknown[]).includes(item[opts.key]);
        } else {
          input.checked = item[opts.key] === opts.selected;
        }
      }
    }
  }

  /**
   * Bind change event.
   */
  private bindChangeEvent(): void {
    const opts = this.options;
    const self = this;

    if (opts.type === 'select') {
      const selectEl = opts.context.get(0) as HTMLSelectElement;
      if (selectEl) {
        opts.context.off('change.select').on('change.select', () => {
          const selectedOption = selectEl.options[selectEl.selectedIndex] as (HTMLOptionElement & { __data__?: SelectDataItem }) | undefined;
          
          if (opts.onChange) {
            opts.onChange(selectEl.value, selectEl.selectedIndex, selectedOption?.__data__);
          }
        });
      }
    } else {
      opts.context.find('input').off('change.select').on('change.select', function (this: Element) {
        const inputEl = this as HTMLInputElement & { __data__?: SelectDataItem };
        const index = self.findIndex(inputEl.value);
        
        if (opts.onChange) {
          opts.onChange(inputEl.value, index, inputEl.__data__);
        }
      });
    }
  }

  /**
   * Get or set the selected value.
   */
  val(): unknown;
  val(value: unknown): this;
  val(value?: unknown): unknown | this {
    const opts = this.options;

    if (value === undefined) {
      // Getter
      if (opts.type === 'select') {
        const selectEl = opts.context.get(0) as HTMLSelectElement;
        return selectEl?.value;
      } else if (opts.type === 'checkbox') {
        const checked: unknown[] = [];
        opts.context.find('input:checked').each((_, el) => {
          checked.push((el as HTMLInputElement).value);
        });
        return checked;
      } else {
        const checkedEl = opts.context.find('input:checked').get(0) as HTMLInputElement | undefined;
        return checkedEl?.value;
      }
    }

    // Setter
    if (opts.type === 'select') {
      const selectEl = opts.context.get(0) as HTMLSelectElement;
      if (selectEl) {
        selectEl.value = String(value);
      }
    } else if (opts.type === 'checkbox') {
      const values = isArray(value) ? value : [value];
      opts.context.find('input').each((_, el) => {
        const inputEl = el as HTMLInputElement;
        inputEl.checked = values.includes(inputEl.value);
      });
    } else {
      opts.context.find('input').each((_, el) => {
        const inputEl = el as HTMLInputElement;
        inputEl.checked = inputEl.value === String(value);
      });
    }

    return this;
  }

  /**
   * Get or set selected index.
   */
  index(): number;
  index(idx: number): this;
  index(idx?: number): number | this {
    const opts = this.options;

    if (idx === undefined) {
      // Getter
      if (opts.type === 'select') {
        const selectEl = opts.context.get(0) as HTMLSelectElement;
        return selectEl?.selectedIndex ?? -1;
      } else {
        const checkedIndex = { value: -1 };
        opts.context.find('input').each((i, el) => {
          if ((el as HTMLInputElement).checked && checkedIndex.value === -1) {
            checkedIndex.value = i;
          }
        });
        return checkedIndex.value;
      }
    }

    // Setter
    if (opts.type === 'select') {
      const selectEl = opts.context.get(0) as HTMLSelectElement;
      if (selectEl && idx >= 0 && idx < selectEl.options.length) {
        selectEl.selectedIndex = idx;
      }
    } else {
      const inputs = opts.context.find('input');
      if (idx >= 0 && idx < inputs.length) {
        (inputs.get(idx) as HTMLInputElement).checked = true;
      }
    }

    return this;
  }

  /**
   * Find index by value.
   */
  private findIndex(value: unknown): number {
    const opts = this.options;
    return opts.data.findIndex((item) => item[opts.key] === value);
  }

  /**
   * Remove an option by value.
   */
  remove(value: unknown): this {
    const opts = this.options;
    const index = this.findIndex(value);

    if (index >= 0) {
      opts.data.splice(index, 1);

      if (opts.type === 'select') {
        const selectEl = opts.context.get(0) as HTMLSelectElement;
        if (selectEl) {
          // Find and remove the option
          for (let i = 0; i < selectEl.options.length; i++) {
            if (selectEl.options[i]?.value === String(value)) {
              selectEl.remove(i);
              break;
            }
          }
        }
      } else {
        // Remove checkbox/radio wrapper
        opts.context.find('input').each((_, el) => {
          if ((el as HTMLInputElement).value === String(value)) {
            new NaturalElement(el).closest('.select_item__').remove();
          }
        });
      }
    }

    return this;
  }

  /**
   * Reset to initial state.
   */
  reset(): this {
    const opts = this.options;

    if (opts.type === 'select') {
      const selectEl = opts.context.get(0) as HTMLSelectElement;
      if (selectEl) {
        selectEl.selectedIndex = 0;
      }
    } else {
      opts.context.find('input').each((_, el) => {
        (el as HTMLInputElement).checked = false;
      });
    }

    return this;
  }

  /**
   * Get the data array.
   */
  data(): SelectDataItem[];
  data(index: number): SelectDataItem | undefined;
  data(index?: number): SelectDataItem[] | SelectDataItem | undefined {
    if (index === undefined) {
      return this.options.data;
    }
    return this.options.data[index];
  }

  /**
   * Get selected data item(s).
   */
  selectedData(): SelectDataItem | SelectDataItem[] | undefined {
    const opts = this.options;

    if (opts.type === 'select') {
      const selectEl = opts.context.get(0) as HTMLSelectElement;
      const selectedOption = selectEl?.options[selectEl.selectedIndex] as (HTMLOptionElement & { __data__?: SelectDataItem }) | undefined;
      return selectedOption?.__data__;
    } else if (opts.type === 'checkbox') {
      const selected: SelectDataItem[] = [];
      opts.context.find('input:checked').each((_, el) => {
        const inputEl = el as HTMLInputElement & { __data__?: SelectDataItem };
        if (inputEl.__data__) {
          selected.push(inputEl.__data__);
        }
      });
      return selected;
    } else {
      const checkedEl = opts.context.find('input:checked').get(0) as (HTMLInputElement & { __data__?: SelectDataItem }) | undefined;
      return checkedEl?.__data__;
    }
  }

  /**
   * Destroy the select instance.
   */
  destroy(): void {
    const opts = this.options;

    // Remove event listeners
    if (opts.type === 'select') {
      opts.context.off('change.select');
    } else {
      opts.context.find('input').off('change.select');
    }

    // Remove classes
    opts.context.removeClass(opts.selectClass || 'select__');

    // Remove data reference
    opts.context.removeData('select');
  }
}

/**
 * Factory function to create a Select instance.
 */
export function createSelect(
  context: NaturalElement | Element | string,
  opts?: SelectUserOptions
): Select {
  return new Select(context, opts);
}

