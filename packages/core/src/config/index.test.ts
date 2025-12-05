import { describe, it, expect, beforeEach } from 'vitest';
import {
  defineConfig,
  getConfig,
  updateConfig,
  resetConfig,
  getModuleConfig,
  getMessage,
  isValidLocale,
  fromLegacyConfig,
  createPreset,
  DEFAULT_CORE_CONFIG,
  DEFAULT_ARCHITECTURE_CONFIG,
  DEFAULT_DATA_CONFIG,
  DEFAULT_UI_CONFIG,
  DEFAULT_TEMPLATE_CONFIG,
  DEFAULT_CODE_CONFIG,
} from './index';
import type { NaturalConfig } from './types';

describe('Configuration System', () => {
  beforeEach(() => {
    // Reset configuration before each test
    resetConfig();
  });

  describe('defineConfig', () => {
    it('should return configuration with defaults', () => {
      const config = defineConfig();

      expect(config.core).toBeDefined();
      expect(config.architecture).toBeDefined();
      expect(config.data).toBeDefined();
      expect(config.ui).toBeDefined();
    });

    it('should merge user config with defaults', () => {
      const config = defineConfig({
        core: {
          locale: 'en_US',
        },
      });

      expect(config.core?.locale).toBe('en_US');
      // Other defaults should be preserved
      expect(config.core?.gcMode).toBe(DEFAULT_CORE_CONFIG.gcMode);
    });

    it('should deep merge nested configurations', () => {
      const config = defineConfig({
        architecture: {
          comm: {
            request: {
              options: {
                type: 'PUT',
              },
            },
          },
        },
      });

      expect(config.architecture?.comm?.request?.options?.type).toBe('PUT');
      // Other request options should be preserved
      expect(config.architecture?.comm?.request?.options?.contentType).toBe(
        DEFAULT_ARCHITECTURE_CONFIG.comm?.request?.options?.contentType
      );
    });

    it('should preserve user-defined filters', () => {
      const filterFn = () => undefined;
      const config = defineConfig({
        architecture: {
          comm: {
            filters: {
              myFilter: {
                order: 1,
                beforeSend: filterFn,
              },
            },
          },
        },
      });

      expect(config.architecture?.comm?.filters?.myFilter).toBeDefined();
      expect(config.architecture?.comm?.filters?.myFilter?.order).toBe(1);
    });

    it('should preserve user-defined validator rules', () => {
      const customRule = () => true;
      const config = defineConfig({
        data: {
          validator: {
            userRules: {
              customRule,
            },
          },
        },
      });

      expect(config.data?.validator?.userRules?.customRule).toBe(customRule);
    });
  });

  describe('getConfig', () => {
    it('should return current configuration', () => {
      defineConfig({ core: { locale: 'en_US' } });
      const config = getConfig();

      expect(config.core?.locale).toBe('en_US');
    });

    it('should return defaults if defineConfig not called', () => {
      resetConfig();
      const config = getConfig();

      expect(config.core?.locale).toBe(DEFAULT_CORE_CONFIG.locale);
    });
  });

  describe('updateConfig', () => {
    it('should update configuration at runtime', () => {
      defineConfig({ core: { locale: 'ko_KR' } });
      updateConfig({ core: { locale: 'en_US' } });

      const config = getConfig();
      expect(config.core?.locale).toBe('en_US');
    });

    it('should merge with existing configuration', () => {
      defineConfig({
        core: { locale: 'ko_KR', gcMode: 'full' },
      });
      updateConfig({
        core: { locale: 'en_US' },
      });

      const config = getConfig();
      expect(config.core?.locale).toBe('en_US');
      expect(config.core?.gcMode).toBe('full');
    });

    it('should add new filters', () => {
      defineConfig({
        architecture: {
          comm: {
            filters: {
              filter1: { order: 1 },
            },
          },
        },
      });

      updateConfig({
        architecture: {
          comm: {
            filters: {
              filter2: { order: 2 },
            },
          },
        },
      });

      const config = getConfig();
      expect(config.architecture?.comm?.filters?.filter1).toBeDefined();
      expect(config.architecture?.comm?.filters?.filter2).toBeDefined();
    });
  });

  describe('resetConfig', () => {
    it('should reset to default configuration', () => {
      defineConfig({ core: { locale: 'en_US' } });
      resetConfig();

      const config = getConfig();
      expect(config.core?.locale).toBe(DEFAULT_CORE_CONFIG.locale);
    });
  });

  describe('getModuleConfig', () => {
    it('should return specific module configuration', () => {
      defineConfig({ core: { locale: 'en_US' } });

      const coreConfig = getModuleConfig('core');
      expect(coreConfig?.locale).toBe('en_US');
    });

    it('should return UI configuration', () => {
      defineConfig({
        ui: {
          alert: {
            alwaysOnTop: false,
          },
        },
      });

      const uiConfig = getModuleConfig('ui');
      expect(uiConfig?.alert?.alwaysOnTop).toBe(false);
    });
  });

  describe('getMessage', () => {
    it('should get message for locale', () => {
      const messages = {
        ko_KR: { confirm: '확인', cancel: '취소' },
        en_US: { confirm: 'OK', cancel: 'Cancel' },
      };

      expect(getMessage(messages, 'confirm', 'ko_KR')).toBe('확인');
      expect(getMessage(messages, 'confirm', 'en_US')).toBe('OK');
    });

    it('should fallback to en_US', () => {
      const messages = {
        en_US: { confirm: 'OK' },
      };

      expect(getMessage(messages, 'confirm', 'ja_JP')).toBe('OK');
    });

    it('should return undefined for missing messages', () => {
      expect(getMessage(undefined, 'confirm', 'ko_KR')).toBeUndefined();
      expect(getMessage({}, 'confirm', 'ko_KR')).toBeUndefined();
    });
  });

  describe('isValidLocale', () => {
    it('should return true for valid locales', () => {
      expect(isValidLocale('ko_KR')).toBe(true);
      expect(isValidLocale('en_US')).toBe(true);
      expect(isValidLocale('ja_JP')).toBe(true);
    });

    it('should return false for invalid locales', () => {
      expect(isValidLocale('')).toBe(false);
      expect(isValidLocale(null)).toBe(false);
      expect(isValidLocale(undefined)).toBe(false);
      expect(isValidLocale(123)).toBe(false);
    });
  });

  describe('Date format configuration', () => {
    it('should have working date format functions', () => {
      const config = defineConfig();
      const dateConfig = config.data?.formatter?.date;

      expect(dateConfig?.dateSepa).toBe('-');
      expect(dateConfig?.timeSepa).toBe(':');
      expect(dateConfig?.Ym?.()).toBe('Y-m');
      expect(dateConfig?.Ymd?.()).toBe('Y-m-d');
      expect(dateConfig?.YmdHi?.()).toBe('Y-m-d H:i');
      expect(dateConfig?.YmdHis?.()).toBe('Y-m-d H:i:s');
    });

    it('should respect custom date separator', () => {
      const config = defineConfig({
        data: {
          formatter: {
            date: {
              dateSepa: '/',
              timeSepa: ':',
              Ymd: function () {
                return 'Y' + this.dateSepa + 'm' + this.dateSepa + 'd';
              },
            },
          },
        },
      });

      expect(config.data?.formatter?.date?.Ymd?.()).toBe('Y/m/d');
    });
  });

  describe('UI configuration', () => {
    it('should have default alert configuration', () => {
      const config = defineConfig();

      expect(config.ui?.alert?.alwaysOnTop).toBe(true);
      expect(config.ui?.alert?.draggable).toBe(true);
      expect(config.ui?.alert?.okButtonOpts?.color).toBe('primary');
    });

    it('should have default grid configuration', () => {
      const config = defineConfig();

      expect(config.ui?.grid?.sortableItem?.asc).toBe('▲');
      expect(config.ui?.grid?.sortableItem?.desc).toBe('▼');
    });
  });

  describe('Type safety', () => {
    it('should enforce correct types', () => {
      // This test verifies TypeScript compilation
      const config: NaturalConfig = defineConfig({
        core: {
          locale: 'ko_KR',
          gcMode: 'full', // Should be 'minimum' | 'full'
        },
        architecture: {
          cont: {
            advisors: [
              {
                pointcut: 'test',
                adviceType: 'before',
                fn: () => undefined,
              },
            ],
          },
        },
      });

      expect(config).toBeDefined();
    });
  });

  describe('fromLegacyConfig', () => {
    it('should convert legacy config to new format', () => {
      const legacyConfig = {
        core: { locale: 'en_US' },
        architecture: { page: { context: 'body' } },
      };

      const result = fromLegacyConfig(legacyConfig);

      expect(result.core).toEqual({ locale: 'en_US' });
      expect(result.architecture).toEqual({ page: { context: 'body' } });
    });

    it('should handle ui.shell key', () => {
      const legacyConfig = {
        'ui.shell': { notify: { alwaysOnTop: false } },
      };

      const result = fromLegacyConfig(legacyConfig);

      expect(result['ui.shell']).toEqual({ notify: { alwaysOnTop: false } });
    });

    it('should ignore unknown keys', () => {
      const legacyConfig = {
        core: { locale: 'ko_KR' },
        unknownKey: { data: 'value' },
      };

      const result = fromLegacyConfig(legacyConfig);

      expect(result.core).toBeDefined();
      expect((result as Record<string, unknown>).unknownKey).toBeUndefined();
    });
  });

  describe('createPreset', () => {
    it('should create minimal preset', () => {
      const preset = createPreset('minimal');

      expect(preset.core?.gcMode).toBe('minimum');
      expect(preset.ui?.alert?.saveMemory).toBe(true);
    });

    it('should create SPA preset', () => {
      const preset = createPreset('spa');

      expect(preset.architecture?.page?.context).toBe('.docs__ > .docs_contents__.visible__');
      expect(preset.architecture?.comm?.request?.options?.browserHistory).toBe(true);
    });

    it('should create MPA preset', () => {
      const preset = createPreset('mpa');

      expect(preset.architecture?.page?.context).toBe('body');
      expect(preset.architecture?.comm?.request?.options?.browserHistory).toBe(false);
    });

    it('should apply preset with defineConfig', () => {
      const config = defineConfig({
        ...createPreset('spa'),
        core: { locale: 'en_US' },
      });

      expect(config.core?.locale).toBe('en_US');
      expect(config.architecture?.page?.context).toBe('.docs__ > .docs_contents__.visible__');
    });
  });

  describe('Default configurations', () => {
    it('should have complete validator messages in ko_KR', () => {
      const messages = DEFAULT_DATA_CONFIG.validator?.message?.ko_KR;

      expect(messages?.global).toBeDefined();
      expect(messages?.required).toBeDefined();
      expect(messages?.alphabet).toBeDefined();
      expect(messages?.integer).toBeDefined();
      expect(messages?.korean).toBeDefined();
      expect(messages?.email).toBeDefined();
      expect(messages?.date).toBeDefined();
      expect(messages?.maxlength).toBeDefined();
      expect(messages?.minlength).toBeDefined();
    });

    it('should have complete validator messages in en_US', () => {
      const messages = DEFAULT_DATA_CONFIG.validator?.message?.en_US;

      expect(messages?.global).toBeDefined();
      expect(messages?.required).toBeDefined();
      expect(messages?.alphabet).toBeDefined();
    });

    it('should have template messages', () => {
      const ko_KR = DEFAULT_TEMPLATE_CONFIG.message?.ko_KR;
      const en_US = DEFAULT_TEMPLATE_CONFIG.message?.en_US;

      expect(ko_KR?.['MSG-0001']).toBeDefined();
      expect(en_US?.['MSG-0001']).toBeDefined();
    });

    it('should have code inspection messages', () => {
      const ko_KR = DEFAULT_CODE_CONFIG.inspection?.message?.ko_KR;
      const en_US = DEFAULT_CODE_CONFIG.inspection?.message?.en_US;

      expect(ko_KR?.NoContextSpecifiedInSelector).toBeDefined();
      expect(ko_KR?.UseTheComponentsValMethod).toBeDefined();
      expect(en_US?.NoContextSpecifiedInSelector).toBeDefined();
      expect(en_US?.UseTheComponentsValMethod).toBeDefined();
    });

    it('should have template AOP configuration', () => {
      expect(DEFAULT_TEMPLATE_CONFIG.aop?.codes).toBeDefined();
      expect(DEFAULT_TEMPLATE_CONFIG.aop?.template).toBeDefined();
    });
  });
});

