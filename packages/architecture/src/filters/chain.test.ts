import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  FilterChain,
  getFilterChain,
  initFilterConfig,
  createFilterChain,
} from './chain';
import type { FilterContext, FiltersConfig } from './types';

describe('FilterChain', () => {
  let filterChain: FilterChain;

  beforeEach(() => {
    filterChain = new FilterChain();
  });

  describe('constructor and init', () => {
    it('should create empty filter chain', () => {
      const chain = new FilterChain();
      expect(chain.hasFilters()).toBe(false);
    });

    it('should create filter chain with configuration', () => {
      const filters: FiltersConfig = {
        testFilter: {
          beforeInit: () => undefined,
          success: () => undefined,
        },
      };
      const chain = new FilterChain(filters);
      expect(chain.hasFilters()).toBe(true);
      expect(chain.getFilterCount().beforeInit).toBe(1);
      expect(chain.getFilterCount().success).toBe(1);
    });

    it('should reinitialize with new configuration', () => {
      filterChain.init({
        filter1: { beforeInit: () => undefined },
      });
      expect(filterChain.getFilterCount().beforeInit).toBe(1);

      filterChain.init({
        filter2: { success: () => undefined },
      });
      expect(filterChain.getFilterCount().beforeInit).toBe(0);
      expect(filterChain.getFilterCount().success).toBe(1);
    });
  });

  describe('filter ordering', () => {
    it('should execute filters in order (lower first)', async () => {
      const executionOrder: number[] = [];

      const filters: FiltersConfig = {
        filter1: {
          order: 30,
          beforeInit: () => {
            executionOrder.push(30);
          },
        },
        filter2: {
          order: 10,
          beforeInit: () => {
            executionOrder.push(10);
          },
        },
        filter3: {
          order: 20,
          beforeInit: () => {
            executionOrder.push(20);
          },
        },
      };

      const chain = new FilterChain(filters);
      const context: FilterContext = {
        communicator: {},
        request: { url: '/test' },
      };

      await chain.runBeforeInit(context);

      expect(executionOrder).toEqual([10, 20, 30]);
    });

    it('should use default order for filters without order', async () => {
      const executionOrder: string[] = [];

      const filters: FiltersConfig = {
        orderedFilter: {
          order: 1,
          beforeInit: () => {
            executionOrder.push('ordered');
          },
        },
        unorderedFilter: {
          beforeInit: () => {
            executionOrder.push('unordered');
          },
        },
      };

      const chain = new FilterChain(filters);
      const context: FilterContext = {
        communicator: {},
        request: { url: '/test' },
      };

      await chain.runBeforeInit(context);

      expect(executionOrder[0]).toBe('ordered');
    });
  });

  describe('runBeforeInit', () => {
    it('should pass and modify communicator', async () => {
      const filters: FiltersConfig = {
        modifyFilter: {
          beforeInit: (ctx) => {
            return { ...ctx.communicator as object, modified: true };
          },
        },
      };

      const chain = new FilterChain(filters);
      const context: FilterContext = {
        communicator: { original: true },
        request: { url: '/test' },
      };

      const result = await chain.runBeforeInit(context);

      expect(result.stopped).toBe(false);
      expect((result.context.communicator as Record<string, boolean>).modified).toBe(true);
    });

    it('should stop chain when Error is returned', async () => {
      const filters: FiltersConfig = {
        errorFilter: {
          beforeInit: () => new Error('Stop chain'),
        },
        neverCalled: {
          order: 1000,
          beforeInit: vi.fn(),
        },
      };

      const chain = new FilterChain(filters);
      const context: FilterContext = {
        communicator: {},
        request: { url: '/test' },
      };

      const result = await chain.runBeforeInit(context);

      expect(result.stopped).toBe(true);
      expect(result.error?.message).toBe('Stop chain');
    });

    it('should catch thrown errors', async () => {
      const filters: FiltersConfig = {
        throwingFilter: {
          beforeInit: () => {
            throw new Error('Thrown error');
          },
        },
      };

      const chain = new FilterChain(filters);
      const context: FilterContext = {
        communicator: {},
        request: { url: '/test' },
      };

      const result = await chain.runBeforeInit(context);

      expect(result.stopped).toBe(true);
      expect(result.error?.message).toBe('Thrown error');
    });
  });

  describe('runAfterInit', () => {
    it('should run afterInit filters', async () => {
      const handler = vi.fn();
      const filters: FiltersConfig = {
        testFilter: { afterInit: handler },
      };

      const chain = new FilterChain(filters);
      const context: FilterContext = {
        communicator: {},
        request: { url: '/test' },
      };

      await chain.runAfterInit(context);

      expect(handler).toHaveBeenCalledWith(context);
    });

    it('should stop on error return', async () => {
      const filters: FiltersConfig = {
        errorFilter: {
          afterInit: () => new Error('Stop'),
        },
      };

      const chain = new FilterChain(filters);
      const result = await chain.runAfterInit({
        communicator: {},
        request: { url: '/test' },
      });

      expect(result.stopped).toBe(true);
    });
  });

  describe('runBeforeSend', () => {
    it('should run beforeSend filters', async () => {
      const handler = vi.fn();
      const filters: FiltersConfig = {
        testFilter: { beforeSend: handler },
      };

      const chain = new FilterChain(filters);
      const context: FilterContext = {
        communicator: {},
        request: { url: '/test' },
      };

      await chain.runBeforeSend(context);

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('runSuccess', () => {
    it('should transform response data', async () => {
      const filters: FiltersConfig = {
        transformFilter: {
          success: (ctx) => {
            const data = ctx.response?.data as { value: number };
            return { value: data.value * 2 };
          },
        },
      };

      const chain = new FilterChain(filters);
      const context: FilterContext = {
        communicator: {},
        request: { url: '/test' },
        response: {
          data: { value: 5 },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
          response: new Response(),
        },
      };

      const result = await chain.runSuccess(context);

      expect(result.stopped).toBe(false);
      expect((result.data as { value: number }).value).toBe(10);
    });

    it('should chain multiple transformations', async () => {
      const filters: FiltersConfig = {
        filter1: {
          order: 1,
          success: (ctx) => {
            const data = ctx.response?.data as number;
            return data + 10;
          },
        },
        filter2: {
          order: 2,
          success: (ctx) => {
            const data = ctx.response?.data as number;
            return data * 2;
          },
        },
      };

      const chain = new FilterChain(filters);
      const context: FilterContext = {
        communicator: {},
        request: { url: '/test' },
        response: {
          data: 5,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
          response: new Response(),
        },
      };

      const result = await chain.runSuccess(context);

      // (5 + 10) * 2 = 30
      expect(result.data).toBe(30);
    });
  });

  describe('runError', () => {
    it('should run error filters', async () => {
      const handler = vi.fn();
      const filters: FiltersConfig = {
        testFilter: { error: handler },
      };

      const chain = new FilterChain(filters);
      const context: FilterContext = {
        communicator: {},
        request: { url: '/test' },
        error: new Error('Test error'),
      };

      await chain.runError(context);

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('runComplete', () => {
    it('should run complete filters', async () => {
      const handler = vi.fn();
      const filters: FiltersConfig = {
        testFilter: { complete: handler },
      };

      const chain = new FilterChain(filters);
      const context: FilterContext = {
        communicator: {},
        request: { url: '/test' },
      };

      await chain.runComplete(context);

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('addFilter / removeFilter', () => {
    it('should add filter at runtime', () => {
      filterChain.addFilter('newFilter', {
        beforeInit: () => undefined,
      });

      expect(filterChain.getFilterCount().beforeInit).toBe(1);
    });

    it('should remove filter by name', () => {
      filterChain.addFilter('filter1', { beforeInit: () => undefined });
      filterChain.addFilter('filter2', { beforeInit: () => undefined });

      filterChain.removeFilter('filter1');

      expect(filterChain.getFilterCount().beforeInit).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all filters', () => {
      filterChain.addFilter('filter1', { beforeInit: () => undefined });
      filterChain.addFilter('filter2', { success: () => undefined });

      filterChain.clear();

      expect(filterChain.hasFilters()).toBe(false);
    });
  });

  describe('createContext', () => {
    it('should create proper context object', () => {
      const communicator = { id: 1 };
      const request = { url: '/test' };
      const response = {
        data: { result: 'ok' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        response: new Response(),
      };

      const context = filterChain.createContext(communicator, request, response);

      expect(context.communicator).toBe(communicator);
      expect(context.request).toBe(request);
      expect(context.response).toBe(response);
      expect(context.status).toBe(200);
      expect(context.statusText).toBe('OK');
    });
  });

  describe('async filters', () => {
    it('should handle async filter handlers', async () => {
      const filters: FiltersConfig = {
        asyncFilter: {
          success: async (ctx) => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            const data = ctx.response?.data as number;
            return data + 100;
          },
        },
      };

      const chain = new FilterChain(filters);
      const context: FilterContext = {
        communicator: {},
        request: { url: '/test' },
        response: {
          data: 5,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {},
          response: new Response(),
        },
      };

      const result = await chain.runSuccess(context);

      expect(result.data).toBe(105);
    });
  });
});

describe('Global filter chain functions', () => {
  describe('getFilterChain', () => {
    it('should return same instance', () => {
      const chain1 = getFilterChain();
      const chain2 = getFilterChain();
      expect(chain1).toBe(chain2);
    });
  });

  describe('initFilterConfig', () => {
    it('should initialize global filter chain', () => {
      const chain = initFilterConfig({
        testFilter: { beforeInit: () => undefined },
      });

      expect(chain.getFilterCount().beforeInit).toBe(1);
    });
  });

  describe('createFilterChain', () => {
    it('should create new instance', () => {
      const chain1 = createFilterChain();
      const chain2 = createFilterChain();
      expect(chain1).not.toBe(chain2);
    });
  });
});

