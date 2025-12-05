import { describe, it, expect, beforeEach } from 'vitest';
import { Request, createRequest } from './index';
import type { RequestOptions } from './types';

describe('Request', () => {
  describe('constructor', () => {
    it('should create request with URL', () => {
      const request = new Request({}, { url: '/api/users' });
      expect(request.options.url).toBe('/api/users');
    });

    it('should create request with full options', () => {
      const opts: Partial<RequestOptions> = {
        url: '/api/users',
        method: 'POST',
        contentType: 'application/json',
        data: { name: 'John' },
      };
      const request = new Request({}, opts);
      expect(request.options.url).toBe('/api/users');
      expect(request.options.method).toBe('POST');
    });

    it('should apply default options', () => {
      const request = new Request({}, { url: '/test' });
      expect(request.options.cache).toBe(false);
      expect(request.options.method).toBe('POST');
      expect(request.options.dataType).toBe('json');
    });

    it('should serialize object data to JSON string', () => {
      const data = { name: 'John', age: 30 };
      const request = new Request({}, { url: '/test', data });
      expect(request.options.data).toBe(JSON.stringify(data));
    });
  });

  describe('attr', () => {
    let request: Request;

    beforeEach(() => {
      request = new Request({}, { url: '/test' });
    });

    it('should set and get attribute', () => {
      request.attr('key', 'value');
      expect(request.attr('key')).toBe('value');
    });

    it('should return all attributes when no name provided', () => {
      request.attr('key1', 'value1');
      request.attr('key2', 'value2');
      const attrs = request.attr();
      expect(attrs).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should return undefined for non-existent attribute', () => {
      expect(request.attr('nonexistent')).toBeUndefined();
    });

    it('should return communicator when setting attribute', () => {
      const comm = { id: 1 };
      const req = new Request(comm, { url: '/test' });
      const result = req.attr('key', 'value');
      expect(result).toBe(comm);
    });
  });

  describe('removeAttr', () => {
    it('should remove attribute', () => {
      const request = new Request({}, { url: '/test' });
      request.attr('key', 'value');
      request.removeAttr('key');
      expect(request.attr('key')).toBeUndefined();
    });

    it('should return this for chaining', () => {
      const request = new Request({}, { url: '/test' });
      const result = request.removeAttr('key');
      expect(result).toBe(request);
    });
  });

  describe('param', () => {
    it('should parse query parameters from URL', () => {
      const request = new Request({}, { url: '/api/users?page=1&limit=10' });
      expect(request.param('page')).toBe('1');
      expect(request.param('limit')).toBe('10');
    });

    it('should return all parameters when no name provided', () => {
      const request = new Request({}, { url: '/api/users?page=1&limit=10' });
      expect(request.param()).toEqual({ page: '1', limit: '10' });
    });

    it('should return empty object for URL without query string', () => {
      const request = new Request({}, { url: '/api/users' });
      expect(request.param()).toEqual({});
    });

    it('should return undefined for non-existent parameter', () => {
      const request = new Request({}, { url: '/api/users?page=1' });
      expect(request.param('nonexistent')).toBeUndefined();
    });

    it('should handle parameters without values', () => {
      const request = new Request({}, { url: '/api/users?active' });
      expect(request.param('active')).toBe(true);
    });

    it('should decode URL-encoded values', () => {
      const request = new Request({}, { url: '/api/search?q=hello%20world' });
      expect(request.param('q')).toBe('hello world');
    });
  });

  describe('get', () => {
    it('should get option by key', () => {
      const request = new Request({}, { url: '/test', method: 'POST' });
      expect(request.get('url')).toBe('/test');
      expect(request.get('method')).toBe('POST');
    });

    it('should return all options when no key provided', () => {
      const request = new Request({}, { url: '/test' });
      const options = request.get();
      expect(options.url).toBe('/test');
      expect(options).toHaveProperty('method');
    });
  });

  describe('set', () => {
    it('should set option value', () => {
      const request = new Request({}, { url: '/test' });
      request.set('method', 'PUT');
      expect(request.get('method')).toBe('PUT');
    });

    it('should return this for chaining', () => {
      const request = new Request({}, { url: '/test' });
      const result = request.set('method', 'PUT');
      expect(result).toBe(request);
    });
  });

  describe('getCommunicator / setCommunicator', () => {
    it('should get and set communicator', () => {
      const comm1 = { id: 1 };
      const comm2 = { id: 2 };
      const request = new Request(comm1, { url: '/test' });
      
      expect(request.getCommunicator()).toBe(comm1);
      
      request.setCommunicator(comm2);
      expect(request.getCommunicator()).toBe(comm2);
    });
  });

  describe('clone', () => {
    it('should create a copy of request', () => {
      const request = new Request({}, { url: '/test', method: 'POST' });
      const clone = request.clone();
      
      expect(clone).not.toBe(request);
      expect(clone.options.url).toBe('/test');
      expect(clone.options.method).toBe('POST');
    });

    it('should apply overrides', () => {
      const request = new Request({}, { url: '/test', method: 'POST' });
      const clone = request.clone({ method: 'PUT' });
      
      expect(clone.options.method).toBe('PUT');
      expect(request.options.method).toBe('POST');
    });
  });

  describe('getFullUrl', () => {
    it('should return URL with params', () => {
      const request = new Request({}, {
        url: '/api/users',
        params: { page: '1', limit: '10' },
      });
      
      const fullUrl = request.getFullUrl();
      expect(fullUrl).toContain('/api/users');
      expect(fullUrl).toContain('page=1');
      expect(fullUrl).toContain('limit=10');
    });

    it('should return plain URL when no params', () => {
      const request = new Request({}, { url: '/api/users' });
      expect(request.getFullUrl()).toBe('/api/users');
    });
  });

  describe('createRequest', () => {
    it('should create a new Request instance', () => {
      const request = createRequest({}, { url: '/test' });
      expect(request).toBeInstanceOf(Request);
      expect(request.options.url).toBe('/test');
    });
  });
});

