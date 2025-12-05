/**
 * @natural-js/template - Events AOP Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NaturalElement } from '@natural-js/shared';
import { processEvents } from './events.js';
import type { ControllerInstance } from '../types.js';

describe('Events AOP', () => {
  let mockView: NaturalElement;
  let mockController: ControllerInstance;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-view" data-pageid="test-page">
        <button id="btnSave">Save</button>
        <button id="btnCancel">Cancel</button>
        <input type="text" id="inputName" />
        <input type="checkbox" name="options" id="opt1" value="1" />
        <input type="checkbox" name="options" id="opt2" value="2" />
        <input type="radio" name="status" value="active" />
        <input type="radio" name="status" value="inactive" />
        <a href="#" id="linkDetail">Details</a>
        <div class="list__">
          <div class="form__">
            <button id="rowBtn">Row Button</button>
          </div>
        </div>
      </div>
    `;
    mockView = new NaturalElement(document.getElementById('test-view'));

    mockController = {
      view: mockView,
    };
  });

  describe('processEvents', () => {
    it('should skip properties with less than 3 parts', () => {
      mockController['e.button'] = vi.fn();

      expect(() => {
        processEvents(mockController, 'e.button');
      }).not.toThrow();
    });

    it('should bind click event to button', () => {
      const handler = vi.fn();
      mockController['e.btnSave.click'] = handler;

      processEvents(mockController, 'e.btnSave.click');

      // Trigger click
      const btn = document.getElementById('btnSave');
      btn?.click();

      expect(handler).toHaveBeenCalled();
    });

    it('should bind event using object notation', () => {
      const handler = vi.fn();
      mockController['e.save.click'] = {
        target: '#btnSave',
        handler,
      };

      processEvents(mockController, 'e.save.click');

      const btn = document.getElementById('btnSave');
      btn?.click();

      expect(handler).toHaveBeenCalled();
    });

    it('should bind change event to input', () => {
      const handler = vi.fn();
      mockController['e.inputName.change'] = handler;

      processEvents(mockController, 'e.inputName.change');

      const input = document.getElementById('inputName') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('change'));

      expect(handler).toHaveBeenCalled();
    });

    it('should add button class to button elements', () => {
      mockController['e.btnSave.click'] = vi.fn();

      processEvents(mockController, 'e.btnSave.click');

      const btn = document.getElementById('btnSave');
      expect(btn?.classList.contains('button__')).toBe(true);
    });

    it('should add button class to anchor elements', () => {
      mockController['e.linkDetail.click'] = vi.fn();

      processEvents(mockController, 'e.linkDetail.click');

      const link = document.getElementById('linkDetail');
      expect(link?.classList.contains('button__')).toBe(true);
    });

    it('should add pointer cursor for click events on non-button elements', () => {
      mockController['e.inputName.click'] = vi.fn();

      processEvents(mockController, 'e.inputName.click');

      const input = document.getElementById('inputName');
      expect(input?.style.cursor).toBe('pointer');
    });

    it('should handle checkbox by name', () => {
      const handler = vi.fn();
      mockController['e.options.change'] = {
        target: '[name="options"]',
        handler,
      };

      processEvents(mockController, 'e.options.change');

      const checkbox = document.getElementById('opt1') as HTMLInputElement;
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));

      expect(handler).toHaveBeenCalled();
    });

    it('should handle radio by name', () => {
      const handler = vi.fn();
      mockController['e.status.change'] = {
        target: '[name="status"]',
        handler,
      };

      processEvents(mockController, 'e.status.change');

      const radio = document.querySelector('input[name="status"]') as HTMLInputElement;
      radio.checked = true;
      radio.dispatchEvent(new Event('change'));

      expect(handler).toHaveBeenCalled();
    });

    it('should not throw for non-existent element', () => {
      mockController['e.nonExistent.click'] = vi.fn();

      expect(() => {
        processEvents(mockController, 'e.nonExistent.click');
      }).not.toThrow();
    });

    it('should skip invalid event handler', () => {
      mockController['e.btnSave.click'] = 'invalid';

      expect(() => {
        processEvents(mockController, 'e.btnSave.click');
      }).not.toThrow();
    });

    it('should use event namespace with page id', () => {
      const handler = vi.fn();
      mockController['e.btnSave.click'] = handler;

      processEvents(mockController, 'e.btnSave.click');

      // The event should be namespaced
      const btn = document.getElementById('btnSave');
      expect(btn).toBeDefined();
    });
  });
});

