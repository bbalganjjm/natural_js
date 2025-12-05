import { describe, it, expect, beforeEach } from 'vitest';
import {
  Context,
  getContext,
  initContext,
  createContext,
} from './index';
import type { CoreConfig, ArchitectureConfig } from './index';

describe('Context', () => {
  describe('constructor', () => {
    it('should create empty context', () => {
      const ctx = new Context();
      expect(ctx.attr()).toEqual({});
    });

    it('should create context with initial config', () => {
      const ctx = new Context({
        core: { spltSepa: '|' },
      });
      expect(ctx.attr('core')).toEqual({ spltSepa: '|' });
    });
  });

  describe('attr', () => {
    let ctx: Context;

    beforeEach(() => {
      ctx = new Context();
    });

    it('should set and get attribute', () => {
      ctx.attr('myKey', 'myValue');
      expect(ctx.attr('myKey')).toBe('myValue');
    });

    it('should return all attributes when no name provided', () => {
      ctx.attr('key1', 'value1');
      ctx.attr('key2', 'value2');
      expect(ctx.attr()).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should return undefined for non-existent attribute', () => {
      expect(ctx.attr('nonexistent')).toBeUndefined();
    });

    it('should return this when setting attribute', () => {
      const result = ctx.attr('key', 'value');
      expect(result).toBe(ctx);
    });

    it('should support typed access', () => {
      const coreConfig: CoreConfig = { spltSepa: '\u241e', locale: 'ko' };
      ctx.attr('core', coreConfig);

      const retrieved = ctx.attr<CoreConfig>('core');
      expect(retrieved?.spltSepa).toBe('\u241e');
      expect(retrieved?.locale).toBe('ko');
    });
  });

  describe('removeAttr', () => {
    it('should remove attribute', () => {
      const ctx = new Context();
      ctx.attr('key', 'value');
      ctx.removeAttr('key');
      expect(ctx.attr('key')).toBeUndefined();
    });

    it('should return this for chaining', () => {
      const ctx = new Context();
      const result = ctx.removeAttr('key');
      expect(result).toBe(ctx);
    });
  });

  describe('hasAttr', () => {
    it('should return true for existing attribute', () => {
      const ctx = new Context();
      ctx.attr('key', 'value');
      expect(ctx.hasAttr('key')).toBe(true);
    });

    it('should return false for non-existent attribute', () => {
      const ctx = new Context();
      expect(ctx.hasAttr('key')).toBe(false);
    });
  });

  describe('convenience getters', () => {
    it('should get core config', () => {
      const ctx = new Context({ core: { spltSepa: '|' } });
      expect(ctx.getCore()).toEqual({ spltSepa: '|' });
    });

    it('should get architecture config', () => {
      const archConfig: ArchitectureConfig = {
        comm: { filters: {} },
        cont: { advisors: [] },
      };
      const ctx = new Context({ architecture: archConfig });
      expect(ctx.getArchitecture()).toEqual(archConfig);
    });

    it('should get data config', () => {
      const ctx = new Context({ data: { formatter: {} } });
      expect(ctx.getData()).toEqual({ formatter: {} });
    });

    it('should get UI config', () => {
      const ctx = new Context({ ui: { alert: {} } });
      expect(ctx.getUI()).toEqual({ alert: {} });
    });
  });

  describe('merge', () => {
    it('should merge configuration', () => {
      const ctx = new Context({ core: { spltSepa: '|' } });
      ctx.merge({ core: { locale: 'ko' } });

      expect(ctx.getCore()).toEqual({ spltSepa: '|', locale: 'ko' });
    });

    it('should overwrite non-object values', () => {
      const ctx = new Context();
      ctx.attr('key', 'oldValue');
      ctx.merge({ key: 'newValue' } as Record<string, unknown>);
      expect(ctx.attr('key')).toBe('newValue');
    });
  });

  describe('clear', () => {
    it('should clear all attributes', () => {
      const ctx = new Context({
        core: { spltSepa: '|' },
        data: { formatter: {} },
      });
      ctx.clear();
      expect(ctx.attr()).toEqual({});
    });
  });
});

describe('Global context functions', () => {
  describe('getContext', () => {
    it('should return same instance', () => {
      const ctx1 = getContext();
      const ctx2 = getContext();
      expect(ctx1).toBe(ctx2);
    });
  });

  describe('initContext', () => {
    it('should initialize global context', () => {
      const ctx = initContext({ core: { spltSepa: '|' } });
      expect(ctx.getCore()).toEqual({ spltSepa: '|' });
    });
  });

  describe('createContext', () => {
    it('should create new instance', () => {
      const ctx1 = createContext();
      const ctx2 = createContext();
      expect(ctx1).not.toBe(ctx2);
    });
  });
});

