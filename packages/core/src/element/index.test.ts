import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getData,
  setData,
  removeData,
  toOpts,
  toRules,
  toData,
  dataChanged,
  maxZindex,
  closest,
  matches,
  getOffset,
  getPosition,
  element,
} from './index';

describe('Element Utilities', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('getData / setData / removeData', () => {
    it('should set and get data on an element', () => {
      const div = document.createElement('div');
      setData(div, 'testKey', 'testValue');
      expect(getData(div, 'testKey')).toBe('testValue');
    });

    it('should return undefined for non-existent key', () => {
      const div = document.createElement('div');
      expect(getData(div, 'nonExistent')).toBeUndefined();
    });

    it('should return all data when no key provided', () => {
      const div = document.createElement('div');
      setData(div, 'key1', 'value1');
      setData(div, 'key2', 'value2');
      expect(getData(div)).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should remove specific data key', () => {
      const div = document.createElement('div');
      setData(div, 'key1', 'value1');
      setData(div, 'key2', 'value2');
      removeData(div, 'key1');
      expect(getData(div, 'key1')).toBeUndefined();
      expect(getData(div, 'key2')).toBe('value2');
    });

    it('should remove all data when no key provided', () => {
      const div = document.createElement('div');
      setData(div, 'key1', 'value1');
      setData(div, 'key2', 'value2');
      removeData(div);
      expect(getData(div)).toEqual({});
    });
  });

  describe('toOpts', () => {
    it('should return opts data from element', () => {
      const div = document.createElement('div');
      const opts = { option1: 'value1' };
      setData(div, 'opts', opts);
      expect(toOpts(div)).toEqual(opts);
    });

    it('should return undefined when no opts set', () => {
      const div = document.createElement('div');
      expect(toOpts(div)).toBeUndefined();
    });
  });

  describe('toRules', () => {
    it('should extract rules from input elements', () => {
      container.innerHTML = `
        <input type="text" id="username" data-validate="required">
        <input type="email" id="email" data-validate="email">
      `;
      const inputs = container.querySelectorAll('input');
      // Set data using setData for testing
      inputs.forEach((input) => {
        setData(input, 'validate', input.dataset.validate);
      });
      const rules = toRules(inputs, 'validate');
      expect(rules['username']).toBe('required');
      expect(rules['email']).toBe('email');
    });

    it('should use name for radio/checkbox', () => {
      container.innerHTML = `
        <input type="radio" name="gender" value="m" data-validate="required">
        <input type="radio" name="gender" value="f">
      `;
      const inputs = container.querySelectorAll('input');
      setData(inputs[0]!, 'validate', 'required');
      const rules = toRules(inputs, 'validate');
      expect(rules['gender']).toBe('required');
    });
  });

  describe('toData', () => {
    it('should extract data from text inputs', () => {
      container.innerHTML = `
        <input type="text" id="name" value="John">
        <input type="email" id="email" value="john@example.com">
      `;
      const inputs = container.querySelectorAll('input');
      const data = toData(inputs);
      expect(data['name']).toBe('John');
      expect(data['email']).toBe('john@example.com');
    });

    it('should extract data from select elements', () => {
      container.innerHTML = `
        <select id="country">
          <option value="us" selected>US</option>
          <option value="kr">Korea</option>
        </select>
      `;
      const selects = container.querySelectorAll('select');
      const data = toData(selects);
      expect(data['country']).toBe('us');
    });

    it('should extract data from textarea', () => {
      container.innerHTML = `
        <textarea id="message">Hello World</textarea>
      `;
      const textareas = container.querySelectorAll('textarea');
      const data = toData(textareas);
      expect(data['message']).toBe('Hello World');
    });

    it('should extract checked values from radio buttons', () => {
      container.innerHTML = `
        <input type="radio" name="gender" value="m">
        <input type="radio" name="gender" value="f" checked>
      `;
      const inputs = container.querySelectorAll('input');
      const data = toData(inputs);
      expect(data['gender']).toBe('f');
    });

    it('should extract checked values from checkboxes', () => {
      container.innerHTML = `
        <input type="checkbox" name="hobbies" value="reading" checked>
        <input type="checkbox" name="hobbies" value="gaming">
        <input type="checkbox" name="hobbies" value="music" checked>
      `;
      const inputs = container.querySelectorAll('input');
      const data = toData(inputs);
      expect(data['hobbies']).toEqual(['reading', 'music']);
    });
  });

  describe('dataChanged', () => {
    it('should add class to element', () => {
      const div = document.createElement('div');
      container.appendChild(div);
      dataChanged(div);
      expect(div.classList.contains('data_changed__')).toBe(true);
    });

    it('should use custom class name', () => {
      const div = document.createElement('div');
      container.appendChild(div);
      dataChanged(div, 'custom_class');
      expect(div.classList.contains('custom_class')).toBe(true);
    });
  });

  describe('maxZindex', () => {
    it('should return 0 for elements without z-index', () => {
      container.innerHTML = '<div id="test1"></div><div id="test2"></div>';
      const elements = container.querySelectorAll('div');
      expect(maxZindex(elements)).toBe(0);
    });

    it('should return max z-index from elements', () => {
      container.innerHTML = `
        <div style="z-index: 10; position: relative;">A</div>
        <div style="z-index: 50; position: relative;">B</div>
        <div style="z-index: 30; position: relative;">C</div>
      `;
      const elements = container.querySelectorAll('div');
      expect(maxZindex(elements)).toBe(50);
    });
  });

  describe('closest', () => {
    it('should find closest ancestor', () => {
      container.innerHTML = `
        <div class="parent">
          <div class="child">
            <span id="target">Target</span>
          </div>
        </div>
      `;
      const target = container.querySelector('#target')!;
      const parent = closest(target, '.parent');
      expect(parent).not.toBeNull();
      expect(parent!.classList.contains('parent')).toBe(true);
    });

    it('should return null when no match', () => {
      const div = document.createElement('div');
      expect(closest(div, '.nonexistent')).toBeNull();
    });
  });

  describe('matches', () => {
    it('should return true when element matches selector', () => {
      const div = document.createElement('div');
      div.className = 'test-class';
      expect(matches(div, '.test-class')).toBe(true);
      expect(matches(div, 'div')).toBe(true);
    });

    it('should return false when element does not match', () => {
      const div = document.createElement('div');
      expect(matches(div, '.nonexistent')).toBe(false);
    });
  });

  describe('getOffset', () => {
    it('should return offset values', () => {
      const div = document.createElement('div');
      container.appendChild(div);
      const offset = getOffset(div);
      expect(offset).toHaveProperty('top');
      expect(offset).toHaveProperty('left');
      expect(typeof offset.top).toBe('number');
      expect(typeof offset.left).toBe('number');
    });
  });

  describe('getPosition', () => {
    it('should return position values', () => {
      const div = document.createElement('div');
      container.appendChild(div);
      const position = getPosition(div);
      expect(position).toHaveProperty('top');
      expect(position).toHaveProperty('left');
      expect(typeof position.top).toBe('number');
      expect(typeof position.left).toBe('number');
    });
  });

  describe('element namespace object', () => {
    it('should export all functions', () => {
      expect(element.getData).toBe(getData);
      expect(element.setData).toBe(setData);
      expect(element.removeData).toBe(removeData);
      expect(element.toOpts).toBe(toOpts);
      expect(element.toRules).toBe(toRules);
      expect(element.toData).toBe(toData);
      expect(element.dataChanged).toBe(dataChanged);
      expect(element.maxZindex).toBe(maxZindex);
      expect(element.closest).toBe(closest);
      expect(element.matches).toBe(matches);
      expect(element.getOffset).toBe(getOffset);
      expect(element.getPosition).toBe(getPosition);
    });
  });
});

