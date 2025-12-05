import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Communicator, comm } from './index';
import { initFilterConfig } from '../filters/chain';

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Communicator', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    // Reset filter chain
    initFilterConfig({});
  });

  /**
   * Helper to create a mock Response.
   */
  function createMockResponse(
    data: unknown,
    options: { status?: number; statusText?: string; headers?: Record<string, string> } = {}
  ): Response {
    const { status = 200, statusText = 'OK', headers = {} } = options;
    const body = typeof data === 'string' ? data : JSON.stringify(data);

    return new Response(body, {
      status,
      statusText,
      headers: new Headers({
        'Content-Type': 'application/json',
        ...headers,
      }),
    });
  }

  describe('constructor', () => {
    it('should create communicator with URL string', () => {
      const comm = new Communicator('/api/users');
      expect(comm.request.options.url).toBe('/api/users');
    });

    it('should create communicator with data and URL', () => {
      const data = { name: 'John' };
      const c = new Communicator(data, '/api/users');
      expect(c.request.options.url).toBe('/api/users');
      expect(c.getData()).toEqual(data);
    });

    it('should create communicator with options object', () => {
      const c = new Communicator({ url: '/api/users', method: 'PUT' });
      expect(c.request.options.url).toBe('/api/users');
      expect(c.request.options.method).toBe('PUT');
    });

    it('should create communicator with data and options', () => {
      const data = { name: 'John' };
      const c = new Communicator(data, { url: '/api/users', method: 'POST' });
      expect(c.request.options.url).toBe('/api/users');
      expect(c.request.options.method).toBe('POST');
    });
  });

  describe('submit', () => {
    it('should make HTTP request and return response', async () => {
      const responseData = { id: 1, name: 'John' };
      mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

      const c = new Communicator('/api/users');
      const response = await c.submit();

      expect(mockFetch).toHaveBeenCalled();
      expect(response).toHaveProperty('data');
      expect((response as { data: unknown }).data).toEqual(responseData);
    });

    it('should call callback with data', async () => {
      const responseData = { id: 1 };
      mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

      const callback = vi.fn();
      const c = new Communicator('/api/users');
      await c.submit(callback);

      expect(callback).toHaveBeenCalledWith(responseData, expect.anything());
    });

    it('should return this when callback is provided', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      const c = new Communicator('/api/users');
      const result = await c.submit(() => {});

      expect(result).toBe(c);
    });
  });

  describe('error', () => {
    it('should register error handler', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const errorHandler = vi.fn();
      const c = new Communicator('/api/users');
      c.error(errorHandler);

      try {
        await c.submit();
      } catch {
        // Expected to throw
      }

      expect(errorHandler).toHaveBeenCalled();
    });

    it('should chain error handlers', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Error'));

      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      const c = new Communicator('/api/users');
      c.error(handler1).error(handler2);

      try {
        await c.submit();
      } catch {
        // Expected to throw
      }

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('setTarget / getTarget', () => {
    it('should set and get target element', () => {
      const c = new Communicator('/api/page');
      const target = document.createElement('div');
      
      c.setTarget(target);
      expect(c.getTarget()).toBe(target);
    });
  });

  describe('setData / getData', () => {
    it('should set and get data', () => {
      const c = new Communicator('/api/users');
      const data = { name: 'John' };
      
      c.setData(data);
      expect(c.getData()).toEqual(data);
    });
  });

  describe('setUrl / getUrl', () => {
    it('should set and get URL', () => {
      const c = new Communicator('/api/old');
      c.setUrl('/api/new');
      expect(c.getUrl()).toBe('/api/new');
    });
  });

  describe('request object', () => {
    it('should expose request object', () => {
      const c = new Communicator('/api/users');
      expect(c.request).toBeDefined();
      expect(c.request.options.url).toBe('/api/users');
    });

    it('should allow setting request attributes', () => {
      const c = new Communicator('/api/users');
      c.request.attr('customKey', 'customValue');
      expect(c.request.attr('customKey')).toBe('customValue');
    });
  });

  describe('with filters', () => {
    it('should run success filters', async () => {
      const responseData = { value: 10 };
      mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

      const filterFn = vi.fn();
      initFilterConfig({
        testFilter: {
          success: filterFn,
        },
      });

      const c = new Communicator('/api/test');
      await c.submit();

      expect(filterFn).toHaveBeenCalled();
    });

    it('should run error filters on failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Error'));

      const filterFn = vi.fn();
      initFilterConfig({
        testFilter: {
          error: filterFn,
        },
      });

      const c = new Communicator('/api/test');
      try {
        await c.submit();
      } catch {
        // Expected
      }

      expect(filterFn).toHaveBeenCalled();
    });

    it('should run complete filters', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      const filterFn = vi.fn();
      initFilterConfig({
        testFilter: {
          complete: filterFn,
        },
      });

      const c = new Communicator('/api/test');
      await c.submit();

      expect(filterFn).toHaveBeenCalled();
    });
  });
});

describe('comm function', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should create Communicator instance', () => {
    const c = comm('/api/users');
    expect(c).toBeInstanceOf(Communicator);
    expect(c.request.options.url).toBe('/api/users');
  });

  it('should support typed response', async () => {
    interface User {
      id: number;
      name: string;
    }

    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1, name: 'John' }), { status: 200 })
    );

    const c = comm<User>('/api/users');
    const response = await c.submit();
    
    // TypeScript should infer the type
    expect(response).toBeDefined();
  });
});

