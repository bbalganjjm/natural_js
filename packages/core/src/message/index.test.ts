import { describe, it, expect, beforeEach } from 'vitest';
import {
  replaceMsgVars,
  get,
  has,
  getLocales,
  createMessageGetter,
  setDefaultLocale,
  getDefaultLocale,
  message,
  I18nResource,
} from './index';

describe('Message Utilities', () => {
  const testResource: I18nResource = {
    en_US: {
      greeting: 'Hello, {0}!',
      farewell: 'Goodbye!',
      sum: '{0} + {1} = {2}',
    },
    ko_KR: {
      greeting: '안녕하세요, {0}님!',
      farewell: '안녕히 가세요!',
      sum: '{0} + {1} = {2}',
    },
  };

  beforeEach(() => {
    setDefaultLocale('en_US');
  });

  describe('replaceMsgVars', () => {
    it('should replace single variable', () => {
      expect(replaceMsgVars('Hello, {0}!', ['World'])).toBe('Hello, World!');
    });

    it('should replace multiple variables', () => {
      expect(replaceMsgVars('{0} + {1} = {2}', ['1', '2', '3'])).toBe('1 + 2 = 3');
    });

    it('should return original message when no vars provided', () => {
      expect(replaceMsgVars('Hello!')).toBe('Hello!');
      expect(replaceMsgVars('Hello!', [])).toBe('Hello!');
    });

    it('should handle undefined variables', () => {
      expect(replaceMsgVars('Hello, {0}!', [undefined as unknown as string])).toBe('Hello, !');
    });

    it('should handle multiple occurrences of same placeholder', () => {
      expect(replaceMsgVars('{0} {0} {0}', ['go'])).toBe('go go go');
    });
  });

  describe('get', () => {
    it('should get message from default locale', () => {
      expect(get(testResource, 'farewell')).toBe('Goodbye!');
    });

    it('should get message with variables', () => {
      expect(get(testResource, 'greeting', ['John'])).toBe('Hello, John!');
    });

    it('should get message from specific locale', () => {
      expect(get(testResource, 'greeting', ['철수'], 'ko_KR')).toBe('안녕하세요, 철수님!');
    });

    it('should return key when message not found', () => {
      expect(get(testResource, 'unknown')).toBe('unknown');
    });

    it('should return key when locale not found', () => {
      expect(get(testResource, 'greeting', [], 'fr_FR')).toBe('greeting');
    });
  });

  describe('has', () => {
    it('should return true when message exists', () => {
      expect(has(testResource, 'greeting')).toBe(true);
    });

    it('should return false when message does not exist', () => {
      expect(has(testResource, 'unknown')).toBe(false);
    });

    it('should return false when locale does not exist', () => {
      expect(has(testResource, 'greeting', 'fr_FR')).toBe(false);
    });

    it('should check specific locale', () => {
      expect(has(testResource, 'greeting', 'ko_KR')).toBe(true);
    });
  });

  describe('getLocales', () => {
    it('should return all available locales', () => {
      const locales = getLocales(testResource);
      expect(locales).toContain('en_US');
      expect(locales).toContain('ko_KR');
      expect(locales.length).toBe(2);
    });

    it('should return empty array for empty resource', () => {
      expect(getLocales({})).toEqual([]);
    });
  });

  describe('setDefaultLocale / getDefaultLocale', () => {
    it('should get default locale', () => {
      expect(getDefaultLocale()).toBe('en_US');
    });

    it('should set default locale', () => {
      setDefaultLocale('ko_KR');
      expect(getDefaultLocale()).toBe('ko_KR');
    });

    it('should affect get function', () => {
      setDefaultLocale('ko_KR');
      expect(get(testResource, 'farewell')).toBe('안녕히 가세요!');
    });
  });

  describe('createMessageGetter', () => {
    it('should create a bound getter function', () => {
      const t = createMessageGetter(testResource);
      expect(t('farewell')).toBe('Goodbye!');
    });

    it('should support variables', () => {
      const t = createMessageGetter(testResource);
      expect(t('greeting', ['World'])).toBe('Hello, World!');
    });

    it('should support locale override', () => {
      const t = createMessageGetter(testResource);
      expect(t('farewell', [], 'ko_KR')).toBe('안녕히 가세요!');
    });
  });

  describe('message namespace object', () => {
    it('should export all functions as properties', () => {
      expect(message.replaceMsgVars).toBe(replaceMsgVars);
      expect(message.get).toBe(get);
      expect(message.has).toBe(has);
      expect(message.getLocales).toBe(getLocales);
      expect(message.createMessageGetter).toBe(createMessageGetter);
      expect(message.setDefaultLocale).toBe(setDefaultLocale);
      expect(message.getDefaultLocale).toBe(getDefaultLocale);
    });
  });
});

