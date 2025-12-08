/**
 * Tests for Form component.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Form, createForm, FormDataRow } from './index';
import { NaturalElement } from '@natural-js/shared';

describe('Form', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <form id="test-form">
        <input type="text" id="name" name="name">
        <input type="email" id="email" name="email">
        <input type="number" id="age" name="age">
        <input type="checkbox" id="active" name="active">
        <select id="status" name="status">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <textarea id="notes" name="notes"></textarea>
        <span data-bind="displayName"></span>
      </form>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('constructor', () => {
    it('should create Form instance with data and context', () => {
      const data = [{ name: 'John', email: 'john@test.com' }];
      const form = new Form(data, '#test-form');
      expect(form).toBeInstanceOf(Form);
    });

    it('should create Form instance with NaturalElement context', () => {
      const data = [{ name: 'John' }];
      const form = new Form(data, new NaturalElement('#test-form'));
      expect(form).toBeInstanceOf(Form);
    });

    it('should add form__ class to context', () => {
      const form = new Form([], '#test-form');
      expect(form.context().hasClass('form__')).toBe(true);
    });
  });

  describe('data()', () => {
    it('should return bound data', () => {
      const data = [{ name: 'John', email: 'john@test.com' }];
      const form = new Form(data, '#test-form');
      expect(form.data()).toBe(data);
    });

    it('should return current row data when selFlag is true', () => {
      const data = [{ name: 'John' }, { name: 'Jane' }];
      const form = new Form(data, '#test-form');
      form.bind(1);
      const result = form.data(true);
      expect(result).toEqual([{ name: 'Jane' }]);
    });

    it('should return only specified columns', () => {
      const data = [{ name: 'John', email: 'john@test.com', age: 30 }];
      const form = new Form(data, '#test-form');
      form.bind(0);
      const result = form.data(true, 'name', 'email');
      expect(result).toEqual([{ name: 'John', email: 'john@test.com' }]);
    });
  });

  describe('row()', () => {
    it('should return current row index', () => {
      const data = [{ name: 'John' }, { name: 'Jane' }];
      const form = new Form(data, '#test-form');
      form.bind(1);
      expect(form.row()).toBe(1);
    });

    it('should return previous row index with "before"', () => {
      const data = [{ name: 'John' }, { name: 'Jane' }];
      const form = new Form(data, '#test-form');
      form.bind(0);
      form.bind(1);
      expect(form.row('before')).toBe(0);
    });
  });

  describe('context()', () => {
    it('should return context element', () => {
      const form = new Form([], '#test-form');
      expect(form.context().get(0)?.id).toBe('test-form');
    });

    it('should find within context with selector', () => {
      const form = new Form([], '#test-form');
      expect(form.context('input[name="name"]').length).toBe(1);
    });
  });

  describe('bind()', () => {
    it('should bind data to text input', () => {
      const data = [{ name: 'John Doe' }];
      const form = new Form(data, '#test-form');
      form.bind(0);

      const input = document.getElementById('name') as HTMLInputElement;
      expect(input.value).toBe('John Doe');
    });

    it('should bind data to select', () => {
      const data = [{ status: 'approved' }];
      const form = new Form(data, '#test-form');
      form.bind(0);

      const select = document.getElementById('status') as HTMLSelectElement;
      expect(select.value).toBe('approved');
    });

    it('should bind data to checkbox', () => {
      const data = [{ active: true }];
      const form = new Form(data, '#test-form');
      form.bind(0);

      const checkbox = document.getElementById('active') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should bind data to textarea', () => {
      const data = [{ notes: 'Some notes here' }];
      const form = new Form(data, '#test-form');
      form.bind(0);

      const textarea = document.getElementById('notes') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Some notes here');
    });

    it('should bind data to element with data-bind', () => {
      const data = [{ displayName: 'John Doe' }];
      const form = new Form(data, '#test-form');
      form.bind(0);

      const span = document.querySelector('[data-bind="displayName"]') as HTMLSpanElement;
      expect(span.textContent).toBe('John Doe');
    });

    it('should call onBeforeBind callback', () => {
      const onBeforeBind = vi.fn();
      const data = [{ name: 'John' }];
      const form = new Form(data, { context: new NaturalElement('#test-form'), onBeforeBind });
      form.bind(0);
      expect(onBeforeBind).toHaveBeenCalledWith(0, data[0]);
    });

    it('should not bind if onBeforeBind returns false', () => {
      const onBeforeBind = vi.fn(() => false);
      const data = [{ name: 'John' }];
      const form = new Form(data, { context: new NaturalElement('#test-form'), onBeforeBind });
      form.bind(0);
      
      const input = document.getElementById('name') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should call onBind callback', () => {
      const onBind = vi.fn();
      const data = [{ name: 'John' }];
      const form = new Form(data, { context: new NaturalElement('#test-form'), onBind });
      form.bind(0);
      expect(onBind).toHaveBeenCalledWith(0, data[0]);
    });

    it('should return this for chaining', () => {
      const form = new Form([{ name: 'John' }], '#test-form');
      expect(form.bind(0)).toBe(form);
    });

    it('should bind only specified columns', () => {
      const data = [{ name: 'John', email: 'john@test.com' }];
      const form = new Form(data, '#test-form');
      form.bind(0, undefined, 'name');

      const nameInput = document.getElementById('name') as HTMLInputElement;
      const emailInput = document.getElementById('email') as HTMLInputElement;
      expect(nameInput.value).toBe('John');
      expect(emailInput.value).toBe(''); // Should not be bound
    });

    it('should apply declarative data-format rules', () => {
      const data = [{ name: 'john doe' }];
      const input = document.getElementById('name') as HTMLInputElement;
      input.setAttribute('data-format', '[["upper"]]');

      const form = new Form(data, '#test-form');
      form.bind(0);

      expect(input.value).toBe('JOHN DOE');
    });
  });

  describe('two-way binding', () => {
    it('should update data when input changes', () => {
      const data = [{ name: 'John' }];
      const form = new Form(data, '#test-form');
      form.bind(0);

      const input = document.getElementById('name') as HTMLInputElement;
      input.value = 'Jane';
      input.dispatchEvent(new Event('change'));

      expect(data[0].name).toBe('Jane');
    });

    it('should update data when checkbox changes', () => {
      const data = [{ active: false }];
      const form = new Form(data, '#test-form');
      form.bind(0);

      const checkbox = document.getElementById('active') as HTMLInputElement;
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));

      expect(data[0].active).toBe(true);
    });

    it('should mark row as update on change', () => {
      const data: FormDataRow[] = [{ name: 'John' }];
      const form = new Form(data, '#test-form');
      form.bind(0);

      const input = document.getElementById('name') as HTMLInputElement;
      input.value = 'Jane';
      input.dispatchEvent(new Event('change'));

      expect(data[0].rowStatus).toBe('update');
    });

    it('should call onChange callback', () => {
      const onChange = vi.fn();
      const data = [{ name: 'John' }];
      const form = new Form(data, { context: new NaturalElement('#test-form'), onChange });
      form.bind(0);

      const input = document.getElementById('name') as HTMLInputElement;
      input.value = 'Jane';
      input.dispatchEvent(new Event('change'));

      expect(onChange).toHaveBeenCalledWith('name', 'Jane', 0, 'John');
    });
  });

  describe('add()', () => {
    it('should add a new row', () => {
      const data: FormDataRow[] = [{ name: 'John' }];
      const form = new Form(data, '#test-form');
      form.add({ name: 'Jane' });

      expect(data.length).toBe(2);
      expect(data[1].name).toBe('Jane');
    });

    it('should mark new row as insert', () => {
      const data: FormDataRow[] = [];
      const form = new Form(data, '#test-form');
      form.add({ name: 'John' });

      expect(data[0].rowStatus).toBe('insert');
    });

    it('should insert at specified position', () => {
      const data: FormDataRow[] = [{ name: 'John' }, { name: 'Jane' }];
      const form = new Form(data, '#test-form');
      form.add({ name: 'Bob' }, 1);

      expect(data[1].name).toBe('Bob');
      expect(data[2].name).toBe('Jane');
    });

    it('should call onAdd callback', () => {
      const onAdd = vi.fn();
      const data: FormDataRow[] = [];
      const form = new Form(data, { context: new NaturalElement('#test-form'), onAdd });
      form.add({ name: 'John' });

      expect(onAdd).toHaveBeenCalledWith(0, expect.objectContaining({ name: 'John' }));
    });

    it('should return this for chaining', () => {
      const form = new Form([], '#test-form');
      expect(form.add({ name: 'John' })).toBe(form);
    });
  });

  describe('remove()', () => {
    it('should mark row as delete', () => {
      const data: FormDataRow[] = [{ name: 'John' }];
      const form = new Form(data, '#test-form');
      form.bind(0);
      form.remove();

      expect(data[0].rowStatus).toBe('delete');
    });

    it('should completely remove inserted row', () => {
      const data: FormDataRow[] = [];
      const form = new Form(data, '#test-form');
      form.add({ name: 'John' });
      form.remove();

      expect(data.length).toBe(0);
    });

    it('should call onRemove callback', () => {
      const onRemove = vi.fn();
      const data: FormDataRow[] = [{ name: 'John' }];
      const form = new Form(data, { context: new NaturalElement('#test-form'), onRemove });
      form.bind(0);
      form.remove();

      expect(onRemove).toHaveBeenCalledWith(0, data[0]);
    });

    it('should return this for chaining', () => {
      const data = [{ name: 'John' }];
      const form = new Form(data, '#test-form');
      form.bind(0);
      expect(form.remove()).toBe(form);
    });
  });

  describe('revert()', () => {
    it('should revert to original data', () => {
      const data: FormDataRow[] = [{ name: 'John' }];
      const form = new Form(data, { context: new NaturalElement('#test-form'), revert: true });
      form.bind(0);

      data[0].name = 'Jane';
      form.revert();

      expect(data[0].name).toBe('John');
    });

    it('should reset update status', () => {
      const data: FormDataRow[] = [{ name: 'John' }];
      const form = new Form(data, { context: new NaturalElement('#test-form'), revert: true });
      form.bind(0);

      const input = document.getElementById('name') as HTMLInputElement;
      input.value = 'Jane';
      input.dispatchEvent(new Event('change'));
      expect(data[0].rowStatus).toBe('update');

      form.revert();
      expect(data[0].rowStatus).toBeUndefined();
    });

    it('should return this for chaining', () => {
      const data = [{ name: 'John' }];
      const form = new Form(data, '#test-form');
      form.bind(0);
      expect(form.revert()).toBe(form);
    });
  });

  describe('validate()', () => {
    beforeEach(() => {
      // Add required attribute to name input
      const nameInput = document.getElementById('name') as HTMLInputElement;
      nameInput.required = true;
    });

    it('should return true for valid data', () => {
      const data = [{ name: 'John' }];
      const form = new Form(data, '#test-form');
      form.bind(0);

      expect(form.validate()).toBe(true);
    });

    it('should return false for invalid data', () => {
      const data = [{ name: '' }];
      const form = new Form(data, '#test-form');
      form.bind(0);

      expect(form.validate()).toBe(false);
    });

    it('should add form_invalid__ class to invalid elements', () => {
      const data = [{ name: '' }];
      const form = new Form(data, '#test-form');
      form.bind(0);
      form.validate();

      const input = document.getElementById('name') as HTMLInputElement;
      expect(new NaturalElement(input).hasClass('form_invalid__')).toBe(true);
    });
  });

  describe('val()', () => {
    it('should get value', () => {
      const data = [{ name: 'John' }];
      const form = new Form(data, '#test-form');
      form.bind(0);

      expect(form.val('name')).toBe('John');
    });

    it('should set value', () => {
      const data = [{ name: 'John' }];
      const form = new Form(data, '#test-form');
      form.bind(0);
      form.val('name', 'Jane');

      expect(data[0].name).toBe('Jane');
      const input = document.getElementById('name') as HTMLInputElement;
      expect(input.value).toBe('Jane');
    });

    it('should return this when setting', () => {
      const data = [{ name: 'John' }];
      const form = new Form(data, '#test-form');
      form.bind(0);
      expect(form.val('name', 'Jane')).toBe(form);
    });
  });

  describe('destroy()', () => {
    it('should remove form__ class', () => {
      const form = new Form([], '#test-form');
      form.destroy();

      expect(form.context().hasClass('form__')).toBe(false);
    });

    it('should remove event listeners', () => {
      const onChange = vi.fn();
      const data = [{ name: 'John' }];
      const form = new Form(data, { context: new NaturalElement('#test-form'), onChange });
      form.bind(0);
      form.destroy();

      const input = document.getElementById('name') as HTMLInputElement;
      input.value = 'Jane';
      input.dispatchEvent(new Event('change'));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('validate()', () => {
    it('should validate using declarative data-validate rules', () => {
      const nameInput = document.getElementById('name') as HTMLInputElement;
      nameInput.setAttribute('data-validate', '[["required"]]');
      const data = [{ name: '' }];
      const form = new Form(data, '#test-form');
      form.bind(0);

      expect(form.validate()).toBe(false);
    });
  });
});

describe('createForm', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <form id="create-form">
        <input type="text" id="field1" name="field1">
      </form>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should create Form instance', () => {
    const form = createForm([{ field1: 'test' }], '#create-form');
    expect(form).toBeInstanceOf(Form);
  });

  it('should pass options', () => {
    const onBind = vi.fn();
    const form = createForm([{ field1: 'test' }], { context: new NaturalElement('#create-form'), onBind });
    form.bind(0);
    expect(onBind).toHaveBeenCalled();
  });
});

