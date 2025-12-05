/**
 * Legacy API wrapper tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { N } from './index.js';
import { NaturalElement } from '@natural-js/shared';

describe('Legacy API (N function)', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-container">
        <div id="test-element" class="test-class"></div>
        <input type="text" id="test-input" />
        <select id="test-select"></select>
        <div id="form-container"></div>
        <div id="list-container"></div>
        <div id="grid-container"></div>
      </div>
    `;
  });

  describe('N() factory function', () => {
    it('should return NaturalElement instance', () => {
      const el = N('#test-element');
      expect(el).toBeInstanceOf(NaturalElement);
    });

    it('should accept string selector', () => {
      const el = N('#test-element');
      expect(el.length).toBe(1);
    });

    it('should accept Element', () => {
      const rawEl = document.getElementById('test-element');
      const el = N(rawEl);
      expect(el.length).toBe(1);
    });

    it('should accept context parameter', () => {
      const container = document.getElementById('test-container');
      const el = N('.test-class', container!);
      expect(el.length).toBe(1);
    });

    it('should handle null/undefined', () => {
      const el = N(null);
      expect(el.length).toBe(0);
    });

    it('should pass through NaturalElement', () => {
      const original = new NaturalElement('#test-element');
      const el = N(original);
      expect(el).toBe(original);
    });
  });

  describe('N.version', () => {
    it('should have version information', () => {
      expect(N.version).toBeDefined();
      expect(N.version['Natural-JS']).toBeDefined();
      expect(N.version['Natural-CORE']).toBeDefined();
      expect(N.version['Natural-ARCHITECTURE']).toBeDefined();
      expect(N.version['Natural-DATA']).toBeDefined();
      expect(N.version['Natural-UI']).toBeDefined();
    });
  });

  describe('Core utilities', () => {
    it('should have N.string utilities', () => {
      expect(N.string).toBeDefined();
      expect(typeof N.string.trimToEmpty).toBe('function');
      expect(N.string.trimToEmpty('  test  ')).toBe('test');
    });

    it('should have N.date utilities', () => {
      expect(N.date).toBeDefined();
      expect(typeof N.date.format).toBe('function');
    });

    it('should have N.array utilities', () => {
      expect(N.array).toBeDefined();
      expect(typeof N.array.deduplicate).toBe('function');
    });

    it('should have N.json utilities', () => {
      expect(N.json).toBeDefined();
      expect(typeof N.json.deepClone).toBe('function');
    });

    it('should have N.browser utilities', () => {
      expect(N.browser).toBeDefined();
      expect(typeof N.browser.is).toBe('function');
    });

    it('should have N.event utilities', () => {
      expect(N.event).toBeDefined();
      expect(typeof N.event.debounce).toBe('function');
    });

    it('should have N.message utilities', () => {
      expect(N.message).toBeDefined();
      expect(typeof N.message.get).toBe('function');
    });

    it('should have N.type utilities', () => {
      expect(N.type).toBeDefined();
      expect(typeof N.type.isString).toBe('function');
    });

    it('should have N.gc utilities', () => {
      expect(N.gc).toBeDefined();
      expect(typeof N.gc.full).toBe('function');
    });
  });

  describe('N.comm()', () => {
    it('should create Communicator instance', () => {
      const comm = N.comm({ id: 1 }, '/api/test');
      expect(comm).toBeDefined();
      expect(typeof comm.submit).toBe('function');
    });

    it('should work without arguments', () => {
      const comm = N.comm();
      expect(comm).toBeDefined();
    });
  });

  describe('N.cont()', () => {
    it('should be the cont function', () => {
      expect(N.cont).toBeDefined();
      expect(typeof N.cont).toBe('function');
    });
  });

  describe('N.context', () => {
    it('should have attr method', () => {
      expect(N.context).toBeDefined();
      expect(typeof N.context.attr).toBe('function');
    });

    it('should get config values', () => {
      const core = N.context.attr('core');
      expect(core).toBeDefined();
    });
  });

  describe('N.locale()', () => {
    it('should get current locale', () => {
      const locale = N.locale();
      expect(typeof locale).toBe('string');
    });

    it('should set locale', () => {
      N.locale('en_US');
      expect(N.locale()).toBe('en_US');
      // Reset
      N.locale('ko_KR');
    });
  });

  describe('N.formatter()', () => {
    it('should format data array', () => {
      const data = [{ value: '1234567' }];
      const result = N.formatter(data);
      expect(result).toBeDefined();
      expect(typeof result.format).toBe('function');
    });
  });

  describe('N.validator()', () => {
    it('should validate data array', () => {
      const data = [{ name: 'test' }];
      const result = N.validator(data);
      expect(result).toBeDefined();
      expect(typeof result.validate).toBe('function');
    });
  });

  describe('N.ds()', () => {
    it('should create DataSync instance', () => {
      const ds = N.ds('test-page');
      expect(ds).toBeDefined();
    });
  });

  describe('UI Components', () => {
    it('N.alert() should create Alert instance', () => {
      const alert = N.alert(document.body, { msg: 'Test' });
      expect(alert).toBeDefined();
      alert.remove();
    });

    it('N.button() should create Button instance', () => {
      const btn = N.button('#test-element');
      expect(btn).toBeDefined();
    });

    it('N.popup() should create Popup instance', () => {
      const popup = N.popup('#test-element');
      expect(popup).toBeDefined();
    });

    it('N.tab() should create Tab instance', () => {
      const tab = N.tab('#test-element');
      expect(tab).toBeDefined();
    });

    it('N.datepicker() should create Datepicker instance', () => {
      const dp = N.datepicker('#test-input');
      expect(dp).toBeDefined();
    });

    it('N.select() should create Select instance with data-first pattern', () => {
      const data = [{ value: '1', text: 'Option 1' }];
      const select = N.select(data).select({ context: '#test-select' });
      expect(select).toBeDefined();
    });

    it('N.form() should create Form instance with data-first pattern', () => {
      const data = [{ name: 'Test' }];
      const form = N.form(data).form({ context: '#form-container' });
      expect(form).toBeDefined();
    });

    it('N.list() should create List instance with data-first pattern', () => {
      const data = [{ id: 1, name: 'Item 1' }];
      const list = N.list(data).list({ context: '#list-container' });
      expect(list).toBeDefined();
    });

    it('N.grid() should create Grid instance with data-first pattern', () => {
      const data = [{ id: 1, name: 'Item 1' }];
      const grid = N.grid(data).grid({ context: '#grid-container' });
      expect(grid).toBeDefined();
    });

    it('N.pagination() should create Pagination instance', () => {
      const pagination = N.pagination('#test-element');
      expect(pagination).toBeDefined();
    });

    it('N.tree() should create Tree instance with data-first pattern', () => {
      const data = [{ id: 1, name: 'Root', parentId: null }];
      const tree = N.tree(data).tree({ context: '#test-element' });
      expect(tree).toBeDefined();
    });
  });

  describe('UI.Shell Components', () => {
    it('N.notify() should create Notify instance', () => {
      const notify = N.notify('top-right');
      expect(notify).toBeDefined();
    });

    it('N.notify.add should be available', () => {
      expect(typeof N.notify.add).toBe('function');
    });

    it('N.docs() should create Docs instance', () => {
      const docs = N.docs('#test-element');
      expect(docs).toBeDefined();
    });
  });

  describe('Template', () => {
    it('N.template should be available', () => {
      expect(N.template).toBeDefined();
    });
  });

  describe('Code', () => {
    it('N.code should be available', () => {
      expect(N.code).toBeDefined();
    });
  });

  describe('Utility functions', () => {
    it('N.error() should create Error', () => {
      const error = N.error('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
    });

    it('N.error() should accept cause', () => {
      const cause = new Error('Cause');
      const error = N.error('Test error', cause);
      expect(error.cause).toBe(cause);
    });

    it('N.warn() should log warning', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      N.warn('Test warning');
      expect(warnSpy).toHaveBeenCalledWith('[Natural-JS]', 'Test warning');
      warnSpy.mockRestore();
    });

    it('N.log() should log message', () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      N.log('Test log');
      expect(logSpy).toHaveBeenCalledWith('[Natural-JS]', 'Test log');
      logSpy.mockRestore();
    });

    it('N.config() should return configuration', () => {
      const config = N.config();
      expect(config).toBeDefined();
      expect(config.core).toBeDefined();
    });

    it('N.toSelector() should be available', () => {
      expect(typeof N.toSelector).toBe('function');
    });
  });
});

