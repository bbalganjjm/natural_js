import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NaturalHttpClient, createHttpClient, http } from './client';
import { HttpError, DEFAULT_CONFIG } from './types';

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('NaturalHttpClient', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
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

  describe('request method', () => {
    it('should make a successful GET request', async () => {
      const responseData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

      const client = new NaturalHttpClient();
      const response = await client.request({ url: '/api/test', method: 'GET' });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(response.data).toEqual(responseData);
      expect(response.status).toBe(200);
      expect(response.statusText).toBe('OK');
    });

    it('should make a successful POST request with JSON data', async () => {
      const requestData = { name: 'New Item' };
      const responseData = { id: 1, name: 'New Item' };
      mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

      const client = new NaturalHttpClient();
      const response = await client.request({
        url: '/api/items',
        method: 'POST',
        data: requestData,
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('POST');
      expect(options.body).toBe(JSON.stringify(requestData));
      expect(options.headers['Content-Type']).toContain('application/json');
      expect(response.data).toEqual(responseData);
    });

    it('should handle URL parameters', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ items: [] }));

      const client = new NaturalHttpClient();
      await client.request({
        url: '/api/items',
        method: 'GET',
        params: { page: 1, limit: 10, active: true },
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');
      expect(url).toContain('active=true');
    });

    it('should add cache-busting parameter when cache is false', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      const client = new NaturalHttpClient();
      await client.request({
        url: '/api/test',
        cache: false,
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toMatch(/_=\d+/);
    });

    it('should handle baseURL', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      const client = new NaturalHttpClient({ baseURL: 'https://api.example.com' });
      await client.request({ url: '/users' });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('https://api.example.com/users');
    });

    it('should throw HttpError on non-2xx status', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ error: 'Not Found' }, { status: 404, statusText: 'Not Found' })
      );

      const client = new NaturalHttpClient();

      try {
        await client.request({ url: '/api/notfound' });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).status).toBe(404);
        expect((error as HttpError).code).toBe('HTTP_404');
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      const client = new NaturalHttpClient();

      await expect(client.request({ url: '/api/test' })).rejects.toThrow(HttpError);

      try {
        await client.request({ url: '/api/test' });
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).code).toBe('NETWORK_ERROR');
      }
    });

    it('should handle abort errors', async () => {
      // Create a proper DOMException for AbortError
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      mockFetch.mockRejectedValueOnce(abortError);

      const client = new NaturalHttpClient();

      try {
        await client.request({ url: '/api/test' });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).code).toBe('ABORTED');
      }
    });

    it('should parse different response types', async () => {
      // Text response
      mockFetch.mockResolvedValueOnce(new Response('Hello World', { status: 200 }));

      const client = new NaturalHttpClient();
      const textResponse = await client.request({ url: '/api/text', dataType: 'text' });
      expect(textResponse.data).toBe('Hello World');
    });

    it('should handle empty JSON response', async () => {
      mockFetch.mockResolvedValueOnce(new Response('', { status: 200 }));

      const client = new NaturalHttpClient();
      const response = await client.request({ url: '/api/empty', dataType: 'json' });
      expect(response.data).toBeNull();
    });

    it('should handle FormData', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true }));

      const client = new NaturalHttpClient();
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.txt');

      await client.request({
        url: '/api/upload',
        method: 'POST',
        data: formData,
      });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.body).toBeInstanceOf(FormData);
      // Content-Type should not be set for FormData (browser sets it with boundary)
      expect(options.headers['Content-Type']).toBeUndefined();
    });

    it('should support URL-encoded form data', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ success: true }));

      const client = new NaturalHttpClient();
      await client.request({
        url: '/api/form',
        method: 'POST',
        data: { username: 'test', password: 'secret' },
        contentType: 'application/x-www-form-urlencoded',
      });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.body).toBe('username=test&password=secret');
    });
  });

  describe('HTTP method shortcuts', () => {
    it('should support get method', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ data: 'test' }));

      const client = new NaturalHttpClient();
      const response = await client.get('/api/test');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('GET');
      expect(response.data).toEqual({ data: 'test' });
    });

    it('should support post method', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ id: 1 }));

      const client = new NaturalHttpClient();
      const response = await client.post('/api/items', { name: 'Test' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('POST');
      expect(options.body).toBe(JSON.stringify({ name: 'Test' }));
    });

    it('should support put method', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ id: 1 }));

      const client = new NaturalHttpClient();
      await client.put('/api/items/1', { name: 'Updated' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('PUT');
    });

    it('should support delete method', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(null));

      const client = new NaturalHttpClient();
      await client.delete('/api/items/1');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('DELETE');
    });

    it('should support patch method', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ id: 1 }));

      const client = new NaturalHttpClient();
      await client.patch('/api/items/1', { name: 'Patched' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('PATCH');
    });

    it('should support head method', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(''));

      const client = new NaturalHttpClient();
      await client.head('/api/test');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('HEAD');
    });

    it('should support options method', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(''));

      const client = new NaturalHttpClient();
      await client.options('/api/test');

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('OPTIONS');
    });
  });

  describe('interceptors', () => {
    it('should apply request interceptors', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      const client = new NaturalHttpClient();
      client.interceptors.request.use((config) => {
        config.headers = { ...config.headers, 'X-Custom-Header': 'test' };
        return config;
      });

      await client.request({ url: '/api/test' });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers['X-Custom-Header']).toBe('test');
    });

    it('should apply response interceptors', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ value: 1 }));

      const client = new NaturalHttpClient();
      client.interceptors.response.use((response) => {
        response.data = { ...response.data as object, transformed: true };
        return response;
      });

      const response = await client.request({ url: '/api/test' });

      expect(response.data).toEqual({ value: 1, transformed: true });
    });

    it('should eject interceptors', async () => {
      // Use mockImplementation to return fresh Response each time
      mockFetch.mockImplementation(() => Promise.resolve(createMockResponse({})));

      const client = new NaturalHttpClient();
      const id = client.interceptors.request.use((config) => {
        config.headers = { ...config.headers, 'X-Test': 'value' };
        return config;
      });

      // First request should have header
      await client.request({ url: '/api/test' });
      expect(mockFetch.mock.calls[0][1].headers['X-Test']).toBe('value');

      // Eject and make another request
      client.interceptors.request.eject(id);
      await client.request({ url: '/api/test' });
      expect(mockFetch.mock.calls[1][1].headers['X-Test']).toBeUndefined();
    });

    it('should clear all interceptors', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      const client = new NaturalHttpClient();
      client.interceptors.request.use((config) => {
        config.headers = { ...config.headers, 'X-Test': 'value' };
        return config;
      });
      client.interceptors.request.clear();

      await client.request({ url: '/api/test' });
      expect(mockFetch.mock.calls[0][1].headers['X-Test']).toBeUndefined();
    });
  });

  describe('transforms', () => {
    it('should apply transformRequest', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      const client = new NaturalHttpClient();
      await client.request({
        url: '/api/test',
        method: 'POST',
        data: { value: 1 },
        transformRequest: (data) => ({ ...data as object, extra: true }),
      });

      const [, options] = mockFetch.mock.calls[0];
      expect(JSON.parse(options.body)).toEqual({ value: 1, extra: true });
    });

    it('should apply transformResponse', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ value: 1 }));

      const client = new NaturalHttpClient();
      const response = await client.request({
        url: '/api/test',
        transformResponse: (data) => ({ ...data as object, processed: true }),
      });

      expect(response.data).toEqual({ value: 1, processed: true });
    });
  });

  describe('createHttpClient', () => {
    it('should create a new client instance', () => {
      const client = createHttpClient({ baseURL: 'https://api.example.com' });
      expect(client).toBeInstanceOf(NaturalHttpClient);
      expect(client.defaults.baseURL).toBe('https://api.example.com');
    });
  });

  describe('default http instance', () => {
    it('should be a NaturalHttpClient instance', () => {
      expect(http).toBeInstanceOf(NaturalHttpClient);
    });
  });

  describe('client.create', () => {
    it('should create a new instance with merged defaults', async () => {
      const baseClient = new NaturalHttpClient({
        baseURL: 'https://api.example.com',
        headers: { 'X-Base': 'base' },
      });

      const newClient = baseClient.create({
        headers: { 'X-New': 'new' },
      });

      expect(newClient.defaults.baseURL).toBe('https://api.example.com');
      expect(newClient.defaults.headers).toEqual({
        'X-Base': 'base',
        'X-New': 'new',
      });
    });
  });

  describe('HttpError', () => {
    it('should create proper error object', () => {
      const error = new HttpError({
        message: 'Test error',
        code: 'TEST_ERROR',
        status: 500,
        config: { url: '/test' },
      });

      expect(error.name).toBe('HttpError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.status).toBe(500);
    });

    it('should identify network errors', () => {
      const error = new HttpError({
        message: 'Network error',
        code: 'NETWORK_ERROR',
        config: {},
      });

      expect(error.isNetworkError()).toBe(true);
      expect(error.isTimeout()).toBe(false);
      expect(error.isAborted()).toBe(false);
    });

    it('should identify timeout errors', () => {
      const error = new HttpError({
        message: 'Timeout',
        code: 'TIMEOUT',
        config: {},
      });

      expect(error.isTimeout()).toBe(true);
    });

    it('should identify abort errors', () => {
      const error = new HttpError({
        message: 'Aborted',
        code: 'ABORTED',
        config: {},
      });

      expect(error.isAborted()).toBe(true);
    });

    it('should serialize to JSON', () => {
      const error = new HttpError({
        message: 'Test',
        code: 'TEST',
        status: 400,
        config: { url: '/test' },
      });

      const json = error.toJSON();
      expect(json.message).toBe('Test');
      expect(json.code).toBe('TEST');
      expect(json.status).toBe(400);
    });
  });

  describe('DEFAULT_CONFIG', () => {
    it('should have expected default values', () => {
      expect(DEFAULT_CONFIG.method).toBe('GET');
      expect(DEFAULT_CONFIG.cache).toBe(false);
      expect(DEFAULT_CONFIG.async).toBe(true);
      expect(DEFAULT_CONFIG.dataType).toBe('json');
      expect(DEFAULT_CONFIG.contentType).toContain('application/json');
    });
  });
});

