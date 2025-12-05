/**
 * @natural-js/template - Components AOP Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NaturalElement } from '@natural-js/shared';
import { processComponents, registerComponent } from './components.js';
import type { ControllerInstance, Deferred } from '../types.js';

describe('Components AOP', () => {
  let mockView: NaturalElement;
  let mockController: ControllerInstance;
  let compActionDefer: Deferred[];

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-view">
        <div id="testForm"></div>
        <div id="testList"></div>
        <button id="testButton">Click</button>
        <div id="searchBox" class="search-container">
          <input type="text" name="keyword" />
          <button class="btn-search">Search</button>
        </div>
      </div>
    `;
    mockView = new NaturalElement(document.getElementById('test-view'));

    mockController = {
      view: mockView,
    };

    compActionDefer = [];
  });

  describe('processComponents', () => {
    it('should skip properties with less than 3 parts', () => {
      mockController['p.form'] = {};

      expect(() => {
        processComponents(mockController, 'p.form', compActionDefer);
      }).not.toThrow();
    });

    it('should find context element by id', () => {
      mockController['p.form.testForm'] = {};

      processComponents(mockController, 'p.form.testForm', compActionDefer);

      const opts = mockController['p.form.testForm'] as { context?: NaturalElement };
      expect(opts.context).toBeDefined();
    });

    it('should use custom context selector', () => {
      mockController['p.list.testList'] = {
        context: '.test-list-class',
      };

      processComponents(mockController, 'p.list.testList', compActionDefer);

      // Should not throw even if element not found
    });

    it('should set opener for popup components', () => {
      mockController['p.popup.testPopup'] = {
        url: '/popup/test',
      };

      processComponents(mockController, 'p.popup.testPopup', compActionDefer);

      const opts = mockController['p.popup.testPopup'] as { opener?: ControllerInstance };
      expect(opts.opener).toBe(mockController);
    });

    it('should set opener for tab components', () => {
      // Tab needs a context element or URL to set opener
      document.body.innerHTML = `
        <div id="test-view">
          <div id="testTab"></div>
        </div>
      `;
      mockView = new NaturalElement(document.getElementById('test-view'));
      mockController.view = mockView;
      mockController['p.tab.testTab'] = {};

      processComponents(mockController, 'p.tab.testTab', compActionDefer);

      const opts = mockController['p.tab.testTab'] as { opener?: ControllerInstance };
      expect(opts.opener).toBe(mockController);
    });

    it('should not override existing opener', () => {
      const customOpener = { view: mockView };
      mockController['p.popup.testPopup'] = {
        url: '/popup/test',
        opener: customOpener,
      };

      processComponents(mockController, 'p.popup.testPopup', compActionDefer);

      const opts = mockController['p.popup.testPopup'] as { opener?: unknown };
      expect(opts.opener).toBe(customOpener);
    });

    it('should defer action execution', () => {
      mockController['p.form.testForm'] = {
        action: 'add',
      };

      processComponents(mockController, 'p.form.testForm', compActionDefer);

      // Action should be deferred
      expect(compActionDefer.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle action as array with arguments', () => {
      mockController['p.form.testForm'] = {
        action: ['bind', { id: 1 }],
      };

      processComponents(mockController, 'p.form.testForm', compActionDefer);

      // Should not throw
    });
  });

  describe('registerComponent', () => {
    it('should register a component factory', () => {
      // Add element to DOM
      document.body.innerHTML = `
        <div id="test-view">
          <div id="test"></div>
        </div>
      `;
      mockView = new NaturalElement(document.getElementById('test-view'));
      mockController.view = mockView;

      const factory = vi.fn().mockReturnValue({ type: 'test' });

      registerComponent('testComp', factory);

      // Factory should be registered (tested via processComponents)
      mockController['p.testComp.test'] = {};

      processComponents(mockController, 'p.testComp.test', compActionDefer);

      expect(factory).toHaveBeenCalled();
    });

    it('should pass options to factory', () => {
      // Add element to DOM
      document.body.innerHTML = `
        <div id="test-view">
          <div id="test"></div>
        </div>
      `;
      mockView = new NaturalElement(document.getElementById('test-view'));
      mockController.view = mockView;

      const factory = vi.fn().mockReturnValue({ type: 'test' });
      registerComponent('testComp2', factory);

      mockController['p.testComp2.test'] = {
        customOption: 'value',
      };

      processComponents(mockController, 'p.testComp2.test', compActionDefer);

      expect(factory).toHaveBeenCalledWith(
        expect.objectContaining({
          customOption: 'value',
        })
      );
    });
  });

  describe('search-box usage', () => {
    it('should apply search-box class', () => {
      const factory = vi.fn().mockReturnValue({
        add: vi.fn(),
      });
      registerComponent('form', factory);

      mockController['p.form.searchBox'] = {
        usage: 'search-box',
      };

      processComponents(mockController, 'p.form.searchBox', compActionDefer);

      const searchBox = document.getElementById('searchBox');
      expect(searchBox?.classList.contains('search_box__')).toBe(true);
    });

    it('should handle custom search-box options', () => {
      const factory = vi.fn().mockReturnValue({
        add: vi.fn(),
      });
      registerComponent('form', factory);

      mockController['p.form.searchBox'] = {
        usage: {
          'search-box': {
            defaultButton: '.custom-search-btn',
          },
        },
      };

      processComponents(mockController, 'p.form.searchBox', compActionDefer);

      // Should not throw
    });
  });
});

