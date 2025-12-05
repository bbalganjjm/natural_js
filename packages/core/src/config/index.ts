/**
 * Configuration system for Natural-JS framework.
 * Provides defineConfig helper and configuration management.
 */

import type {
  NaturalConfig,
  NaturalConfigOverride,
  CoreConfig,
  ArchitectureConfig,
  DataConfig,
  UIConfig,
  UIShellConfig,
  TemplateConfig,
  CodeConfig,
} from './types';

// Re-export types
export * from './types';

/**
 * Default core configuration.
 */
export const DEFAULT_CORE_CONFIG: CoreConfig = {
  locale: 'ko_KR',
  sgChkdVal: 'Y',
  sgUnChkdVal: 'N',
  spltSepa: '$@^',
  gcMode: 'full',
  charByteLength: 3,
};

/**
 * Default architecture configuration.
 */
export const DEFAULT_ARCHITECTURE_CONFIG: ArchitectureConfig = {
  page: {
    context: 'body',
  },
  cont: {
    advisors: [],
  },
  comm: {
    filters: {},
    request: {
      options: {
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        cache: false,
        urlSync: true,
        browserHistory: false,
        append: false,
      },
    },
  },
};

/**
 * Default data configuration.
 */
export const DEFAULT_DATA_CONFIG: DataConfig = {
  formatter: {
    userRules: {},
    date: {
      dateSepa: '-',
      timeSepa: ':',
      Ym: function () {
        return 'Y' + this.dateSepa + 'm';
      },
      Ymd: function () {
        return 'Y' + this.dateSepa + 'm' + this.dateSepa + 'd';
      },
      YmdH: function () {
        return this.Ymd!() + ' H';
      },
      YmdHi: function () {
        return this.Ymd!() + ' H' + this.timeSepa + 'i';
      },
      YmdHis: function () {
        return this.Ymd!() + ' H' + this.timeSepa + 'i' + this.timeSepa + 's';
      },
    },
  },
  validator: {
    userRules: {},
    message: {
      ko_KR: {
        global: '필드 검증에 통과하지 못했습니다.',
        required: '필수 입력 필드입니다.',
        alphabet: '영문자만 입력할 수 있습니다.',
        integer: '숫자(정수)만 입력할 수 있습니다.',
        korean: '한글만 입력할 수 있습니다.',
        alphabet_integer: '영문자와 숫자(정수)만 입력할 수 있습니다.',
        integer_korean: '숫자(정수)와 한글만 입력할 수 있습니다.',
        alphabet_korean: '영문자와 한글만 입력할 수 있습니다.',
        alphabet_integer_korean: '영문자, 숫자(정수), 한글만 입력할 수 있습니다.',
        dash_integer: '숫자(정수), 대시(-)만 입력할 수 있습니다.',
        commas_integer: '숫자(정수), 콤마(,)만 입력할 수 있습니다.',
        number: '숫자(+-,. 포함)만 입력할 수 있습니다.',
        email: 'e-mail 형식에 맞지 않습니다.',
        url: 'URL 형식에 맞지 않습니다.',
        zipcode: '우편번호 형식에 맞지 않습니다.',
        decimal: '(유한)소수만 입력할 수 있습니다.',
        decimal_: '(유한)소수 {0}번째 자리까지 입력할 수 있습니다.',
        phone: '전화번호 형식이 아닙니다.',
        rrn: '주민등록번호 형식에 맞지 않습니다.',
        ssn: '미국 사회보장번호 형식에 맞지 않습니다.',
        frn: '외국인등록번호 형식에 맞지 않습니다.',
        frn_ssn: '주민번호나 외국인등록번호 형식에 맞지 않습니다.',
        kbrn: '사업자등록번호 형식에 맞지 않습니다.',
        kcn: '법인번호 형식에 맞지 않습니다.',
        date: '날짜 형식에 맞지 않습니다.',
        time: '시간 형식에 맞지 않습니다.',
        accept: '"{0}" 값만 입력할 수 있습니다.',
        match: '"{0}" 이(가) 포함된 값만 입력할 수 있습니다.',
        acceptFileExt: '"{0}" 이(가) 포함된 확장자만 입력할 수 있습니다.',
        notAccept: '"{0}" 값은 입력할 수 없습니다.',
        notMatch: '"{0}" 이(가) 포함된 값은 입력할 수 없습니다.',
        notAcceptFileExt: '"{0}" 이(가) 포함된 확장자는 입력할 수 없습니다.',
        equalTo: '"{1}" 의 값과 같아야 합니다.',
        maxlength: '{0} 글자 이하만 입력 가능합니다.',
        minlength: '{0} 글자 이상만 입력 가능합니다.',
        rangelength: '{0} 글자에서 {1} 글자 까지만 입력 가능합니다.',
        maxbyte: '{0} 바이트 이하만 입력 가능합니다.',
        minbyte: '{0} 바이트 이상만 입력 가능합니다.',
        rangebyte: '{0} 바이트에서 {1} 바이트 까지만 입력 가능합니다.',
        maxvalue: '{0} 이하의 값만 입력 가능합니다.',
        minvalue: '{0} 이상의 값만 입력 가능합니다.',
        rangevalue: '{0}에서 {1} 사이의 값만 입력 가능합니다.',
        regexp: '{2}',
      },
      en_US: {
        global: "It Can't pass the field verification.",
        required: 'It is a field to input obligatorily.',
        alphabet: 'Can enter only alphabetical characters.',
        integer: 'Can enter only number(integer).',
        korean: 'Can enter only Korean alphabet.',
        alphabet_integer: 'Can enter only alphabetical characters and number(integer).',
        integer_korean: 'Can enter only number(integer) and Korean alphabet.',
        alphabet_korean: 'Can enter only alphabetical characters and Korean alphabet.',
        alphabet_integer_korean:
          'Can enter only alphabetical characters and number(integer) and Korean alphabet.',
        dash_integer: 'Can enter only number(integer) and dash(-).',
        commas_integer: 'Can enter only number(integer) and commas(,).',
        number: 'Can enter only number and (+-,.)',
        email: "Don't conform to the format of E-mail.",
        url: "Don't conform to the format of URL.",
        zipcode: "Don't conform to the format of zip code.",
        decimal: 'Can enter only (finite)decimal',
        decimal_: 'Can enter up to {0} places of (finite)decimal.',
        phone: 'There is no format of phone number.',
        rrn: "Don't fit the format of the resident registration number.",
        ssn: "Don't fit the format of the Social Security number.",
        frn: "Don't fit the format of foreign registration number.",
        frn_ssn: "Don't fit the format of the resident registration number or foreign registration number.",
        kbrn: "Don't fit the format of registration of enterpreneur.",
        kcn: "Don't fit the format of corporation number.",
        date: "Don't fit the format of date.",
        time: "Don't fit the format of time.",
        accept: 'Can enter only "{0}" value.',
        match: 'Can enter only value that contains "{0}".',
        acceptFileExt: 'Can enter only extension that includes "{0}".',
        notAccept: 'Can\'t enter "{0}" value.',
        notMatch: 'Can\'t enter only value that contains "{0}".',
        notAcceptFileExt: 'Can\'t enter only extension that includes "{0}".',
        equalTo: 'Must be the same as "{1}" value.',
        maxlength: 'Can enter only below {0} letters.',
        minlength: 'Can enter only more than {0} letters.',
        rangelength: 'It can be entered from {0} to {1} letters.',
        maxbyte: 'Can enter only below {0} bytes.',
        minbyte: 'Can enter only more than {0} bytes.',
        rangebyte: 'It can be entered from {0} to {1} bytes.',
        maxvalue: 'Can enter only below {0} value.',
        minvalue: 'Can enter only more than {0} value.',
        rangevalue: 'Can be entered value from {0} to {1}.',
        regexp: '{2}',
      },
    },
  },
};

/**
 * Default UI configuration.
 */
export const DEFAULT_UI_CONFIG: UIConfig = {
  alert: {
    container: 'body',
    okButtonOpts: { color: 'primary', size: 'medium' },
    cancelButtonOpts: { color: 'primary_container', size: 'medium' },
    input: { displayTimeout: 7000, closeBtn: '×' },
    alwaysOnTop: true,
    draggable: true,
    saveMemory: false,
    message: {
      ko_KR: { confirm: '확인', cancel: '취소' },
      en_US: { confirm: 'OK', cancel: 'Cancel' },
    },
  },
  datepicker: {
    monthonlyOpts: {
      yearsPanelPosition: 'left',
      monthsPanelPosition: 'left',
    },
    message: {
      ko_KR: {
        year: '년',
        month: '월',
        days: '일,월,화,수,목,금,토',
        prev: '이전',
        next: '다음',
      },
      en_US: {
        year: 'Year',
        month: 'Month',
        days: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat',
        prev: 'Previous',
        next: 'Next',
      },
    },
  },
  popup: {
    alwaysOnTop: true,
    draggable: true,
    saveMemory: false,
    button: false,
  },
  list: {
    message: {
      ko_KR: { empty: '조회를 하지 않았거나 조회된 데이터가 없습니다.' },
      en_US: { empty: 'No inquired data or no data available.' },
    },
  },
  grid: {
    sortableItem: { asc: '▲', desc: '▼' },
    message: {
      ko_KR: {
        empty: '조회를 하지 않았거나 조회된 데이터가 없습니다.',
        search: '검색',
        selectAll: '전체선택',
        dFilter: '데이터 필터',
        more: '더보기',
      },
      en_US: {
        empty: 'No inquired data or no data available.',
        search: 'Search',
        selectAll: 'Select all',
        dFilter: 'Data filter',
        more: 'MORE',
      },
    },
    misc: {
      resizableCorrectionWidth: 0,
      resizableLastCellCorrectionWidth: 8,
      resizeBarCorrectionLeft: 0,
      resizeBarCorrectionHeight: 0,
      fixedcolHeadMarginTop: 0,
      fixedcolHeadMarginLeft: 0,
      fixedcolHeadHeight: 0,
      fixedcolBodyMarginTop: -1,
      fixedcolBodyMarginLeft: 0,
      fixedcolBodyBindHeight: 1,
      fixedcolBodyAddHeight: 1,
      fixedcolRootContainer: '.view_context__',
    },
  },
};

/**
 * Default UI.Shell configuration.
 */
export const DEFAULT_UI_SHELL_CONFIG: UIShellConfig = {
  notify: {
    alwaysOnTop: true,
    message: {
      ko_KR: { close: '닫기' },
      en_US: { close: 'Close' },
    },
  },
  docs: {
    alwaysOnTop: true,
    message: {
      ko_KR: {
        closeAllTitle: '메뉴 전체 닫기',
        closeAll: '전체 닫기',
        close: '메뉴 닫기',
      },
      en_US: {
        closeAllTitle: 'Close all menus',
        closeAll: 'Close all',
        close: 'Close the menu',
      },
    },
  },
};

/**
 * Default template configuration.
 */
export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  aop: {
    codes: {
      codeUrl: null,
      codeKey: null,
    },
    template: {
      onBeforeInitComponents: null,
      onInitComponents: null,
      onBeforeInitEvents: null,
      onInitEvents: null,
    },
  },
  message: {
    ko_KR: {
      'MSG-0001': 'data 옵션을 정의해 주세요.',
      'MSG-0002': '서버 오류가 발생하여 공통 코드 목록을 조회하지 못했습니다.',
      'MSG-0003': '데이터 코드 목록을 조회하는 N.comm({0}) 이 없습니다.',
      'MSG-0004': '서버 오류가 발생하여 데이터 코드 목록을 조회하지 못했습니다.',
      'MSG-0005': '컴포넌트({0})가 잘못 지정되었습니다.',
      'MSG-0006': '이벤트({0})가 잘못 지정되었습니다.',
    },
    en_US: {
      'MSG-0001': 'Define the data option.',
      'MSG-0002': 'The common code list could not be queried because a server error occurred.',
      'MSG-0003': 'There is no N.comm({0}) to query the data code list.',
      'MSG-0004': 'The data code list could not be queried because a server error occurred.',
      'MSG-0005': 'Component({0}) was incorrectly specified.',
      'MSG-0006': 'Event({0}) was incorrectly specified.',
    },
  },
};

/**
 * Default code configuration.
 */
export const DEFAULT_CODE_CONFIG: CodeConfig = {
  inspection: {
    abortOnError: false,
    excludes: [],
    message: {
      ko_KR: {
        NoContextSpecifiedInSelector:
          'Controller object의 함수 안에서 요소를 선택할 때는 반드시 $() 나 N() 함수의 두 번째 인자(context)에 view 요소를 입력하거나 view 요소에서 find 해야 합니다. ' +
          'view(context) 요소를 입력하지 않으면 다른 View의 요소까지 선택되어 의도하지 않은 오류가 발생할 수 있습니다. ' +
          '\nex) N("selector", cont.view).hide();\n    cont.view.find("selector").hide();',
        UseTheComponentsValMethod:
          'jQuery의 val 메서드로 입력 요소의 value 속성 값을 변경하면 컴포넌트에 바인딩되어 있는 데이터는 업데이트되지 않습니다. ' +
          '컴포넌트의 내부 데이터와 연동된 입력 요소들은 적용된 데이터 관련 컴포넌트(N.form, N.grid 등)에서 제공하는 val 메서드를 사용해야 합니다. ' +
          '\nex) cont["p.form.id"].val("columnName", "value")\n    cont["p.grid.id"].val(index, "columnName", "value")',
      },
      en_US: {
        NoContextSpecifiedInSelector:
          'When selecting an element within a function of a Controller object, you must input the view element in the second argument of the $() or N() function or find it in the view element. ' +
          "If you don't type view(context) element, you can get unintended errors as the elements of other views are also selected. " +
          '\nex) N("selector", cont.view).hide();\n    cont.view.find("selector").hide();',
        UseTheComponentsValMethod:
          "If you change the value of an input element's value attribute using jQuery's val method, the data bound to the component will not be updated. " +
          'Input elements linked with the internal data of the component should use the val method provided by the applied data-related components(N.form, N.grid, etc.). ' +
          '\nex) cont["p.form.id"].val("columnName", "value")\n    cont["p.grid.id"].val(index, "columnName", "value")',
      },
    },
  },
};

/**
 * Deep merge two objects.
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (
      sourceValue !== null &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[keyof T];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[keyof T];
    }
  }

  return result;
}

/**
 * Create a complete configuration by merging with defaults.
 */
function createFullConfig(userConfig: NaturalConfigOverride): NaturalConfig {
  return {
    core: deepMerge(DEFAULT_CORE_CONFIG, (userConfig.core || {}) as Partial<CoreConfig>),
    architecture: deepMerge(
      DEFAULT_ARCHITECTURE_CONFIG,
      (userConfig.architecture || {}) as Partial<ArchitectureConfig>
    ),
    data: deepMerge(DEFAULT_DATA_CONFIG, (userConfig.data || {}) as Partial<DataConfig>),
    ui: deepMerge(DEFAULT_UI_CONFIG, (userConfig.ui || {}) as Partial<UIConfig>),
    'ui.shell': deepMerge(
      DEFAULT_UI_SHELL_CONFIG,
      (userConfig['ui.shell'] || {}) as Partial<UIShellConfig>
    ),
    template: deepMerge(
      DEFAULT_TEMPLATE_CONFIG,
      (userConfig.template || {}) as Partial<TemplateConfig>
    ),
    code: deepMerge(DEFAULT_CODE_CONFIG, (userConfig.code || {}) as Partial<CodeConfig>),
  };
}

/**
 * Global configuration instance.
 */
let globalConfig: NaturalConfig | null = null;

/**
 * Define Natural-JS configuration with type safety.
 * This is the main entry point for configuring Natural-JS.
 *
 * @param config - User configuration object
 * @returns Complete configuration merged with defaults
 *
 * @example
 * ```typescript
 * // natural.config.ts
 * import { defineConfig } from '@natural-js/core';
 *
 * export default defineConfig({
 *   core: {
 *     locale: 'ko_KR',
 *     gcMode: 'full',
 *   },
 *   architecture: {
 *     comm: {
 *       filters: {
 *         authFilter: {
 *           order: 1,
 *           beforeSend: (ctx) => {
 *             // Add auth headers
 *           },
 *         },
 *       },
 *     },
 *   },
 *   ui: {
 *     alert: {
 *       alwaysOnTop: true,
 *       draggable: true,
 *     },
 *   },
 * });
 * ```
 */
export function defineConfig(config: NaturalConfigOverride = {}): NaturalConfig {
  globalConfig = createFullConfig(config);
  return globalConfig;
}

/**
 * Get the current global configuration.
 * Returns defaults if defineConfig has not been called.
 */
export function getConfig(): NaturalConfig {
  if (!globalConfig) {
    globalConfig = createFullConfig({});
  }
  return globalConfig;
}

/**
 * Update the global configuration at runtime.
 * Merges the provided config with the existing configuration.
 *
 * @param config - Partial configuration to merge
 * @returns Updated configuration
 */
export function updateConfig(config: NaturalConfigOverride): NaturalConfig {
  const current = getConfig();
  globalConfig = deepMerge(current, config as Partial<NaturalConfig>);
  return globalConfig;
}

/**
 * Reset the global configuration to defaults.
 *
 * @returns Default configuration
 */
export function resetConfig(): NaturalConfig {
  globalConfig = createFullConfig({});
  return globalConfig;
}

/**
 * Get a specific module configuration.
 *
 * @param module - Module name
 * @returns Module configuration
 */
export function getModuleConfig<K extends keyof NaturalConfig>(
  module: K
): NaturalConfig[K] {
  return getConfig()[module];
}

/**
 * Type guard for checking if a value is a valid locale.
 */
export function isValidLocale(locale: unknown): locale is string {
  return typeof locale === 'string' && locale.length > 0;
}

/**
 * Get message for a specific locale with fallback.
 *
 * @param messages - Locale messages object
 * @param key - Message key
 * @param locale - Target locale
 * @param fallbackLocale - Fallback locale (default: 'en_US')
 * @returns Message string or undefined
 */
export function getMessage<T extends Record<string, unknown>>(
  messages: Record<string, T> | undefined,
  key: keyof T,
  locale: string,
  fallbackLocale = 'en_US'
): string | undefined {
  if (!messages) return undefined;

  const localeMessages = messages[locale] || messages[fallbackLocale];
  if (!localeMessages) return undefined;

  return localeMessages[key] as string | undefined;
}

/**
 * Convert legacy N.context.attr format to new defineConfig format.
 * This helps migrate existing natural.config.js files to TypeScript.
 *
 * @param legacyConfig - Legacy configuration in N.context.attr format
 * @returns Configuration in new format
 *
 * @example
 * ```typescript
 * // Migration from natural.config.js
 * const legacyConfig = {
 *   core: { locale: 'ko_KR' },
 *   architecture: { page: { context: 'body' } },
 *   // ...
 * };
 *
 * export default defineConfig(fromLegacyConfig(legacyConfig));
 * ```
 */
export function fromLegacyConfig(
  legacyConfig: Record<string, unknown>
): NaturalConfigOverride {
  const result: NaturalConfigOverride = {};

  // Map legacy keys to new structure
  const keyMap: Record<string, keyof NaturalConfig> = {
    core: 'core',
    architecture: 'architecture',
    data: 'data',
    ui: 'ui',
    'ui.shell': 'ui.shell',
    template: 'template',
    code: 'code',
  };

  for (const [legacyKey, newKey] of Object.entries(keyMap)) {
    if (legacyConfig[legacyKey] !== undefined) {
      (result as Record<string, unknown>)[newKey] = legacyConfig[legacyKey];
    }
  }

  return result;
}

/**
 * Create a configuration preset for specific use cases.
 *
 * @param preset - Preset name ('minimal' | 'spa' | 'mpa')
 * @returns Configuration preset
 *
 * @example
 * ```typescript
 * // Use SPA preset with customizations
 * export default defineConfig({
 *   ...createPreset('spa'),
 *   core: { locale: 'en_US' },
 * });
 * ```
 */
export function createPreset(preset: 'minimal' | 'spa' | 'mpa'): NaturalConfigOverride {
  switch (preset) {
    case 'minimal':
      return {
        core: {
          gcMode: 'minimum',
        },
        ui: {
          alert: { saveMemory: true },
          popup: { saveMemory: true },
        },
      };

    case 'spa':
      return {
        architecture: {
          page: {
            context: '.docs__ > .docs_contents__.visible__',
          },
          comm: {
            request: {
              options: {
                urlSync: true,
                browserHistory: true,
              },
            },
          },
        },
        ui: {
          alert: {
            container: '.docs__ > .docs_contents__.visible__',
          },
        },
      };

    case 'mpa':
      return {
        architecture: {
          page: {
            context: 'body',
          },
          comm: {
            request: {
              options: {
                urlSync: false,
                browserHistory: false,
              },
            },
          },
        },
        ui: {
          alert: {
            container: 'body',
          },
        },
      };

    default:
      return {};
  }
}

export default defineConfig;

