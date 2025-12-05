/**
 * Configuration type definitions for Natural-JS framework.
 * Provides TypeScript type safety for natural.config.ts.
 */

/**
 * Supported locales for configuration.
 */
export type ConfigLocale = 'ko_KR' | 'en_US' | string;

/**
 * Multilingual messages type for configuration.
 */
export type ConfigLocaleMessages<T = Record<string, string>> = Partial<Record<ConfigLocale, T>>;

/**
 * Core module configuration.
 */
export interface CoreConfig {
  /** Default locale */
  locale?: ConfigLocale;

  /** Default value when one checkbox is checked in N().vals method */
  sgChkdVal?: string;

  /** Default value when one checkbox is unchecked in N().vals method */
  sgUnChkdVal?: string;

  /** String separator used in Natural-JS */
  spltSepa?: string;

  /** Garbage collection mode: 'minimum' | 'full' */
  gcMode?: 'minimum' | 'full';

  /** Default byte length of characters except single-byte characters */
  charByteLength?: number;

  /** Additional core settings */
  [key: string]: unknown;
}

/**
 * Page context configuration.
 */
export interface PageConfig {
  /** Main content container selector */
  context?: string;
}

/**
 * Controller AOP advisor configuration.
 */
export interface AdvisorConfig {
  /** Pointcut pattern or definition */
  pointcut: string | { type: string; param: string | RegExp; selector?: string };

  /** Advice type */
  adviceType: 'before' | 'after' | 'around' | 'error';

  /** Advice function */
  fn: (controller: unknown, fnPath: string, args: unknown[], result?: unknown) => unknown;
}

/**
 * Controller configuration.
 */
export interface ContConfig {
  /** AOP advisors */
  advisors?: AdvisorConfig[];

  /** Custom pointcuts */
  pointcuts?: Record<string, { fn: (param: string | RegExp, controller: unknown, fnPath: string) => boolean }>;
}

/**
 * Communication filter configuration.
 */
export interface FilterConfig {
  /** Filter execution order */
  order?: number;

  /** BeforeInit handler */
  beforeInit?: (context: unknown) => unknown | Error | void;

  /** AfterInit handler */
  afterInit?: (context: unknown) => Error | void;

  /** BeforeSend handler */
  beforeSend?: (context: unknown) => Error | void;

  /** Success handler */
  success?: (context: unknown) => unknown | Error | void;

  /** Error handler */
  error?: (context: unknown) => Error | void;

  /** Complete handler */
  complete?: (context: unknown) => Error | void;
}

/**
 * Request options configuration.
 */
export interface RequestOptionsConfig {
  /** HTTP method */
  type?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  /** Content type */
  contentType?: string;

  /** Enable caching */
  cache?: boolean;

  /** Enable URL synchronization */
  urlSync?: boolean;

  /** Enable browser history */
  browserHistory?: boolean;

  /** Append mode for HTML responses */
  append?: boolean;
}

/**
 * Communication configuration.
 */
export interface CommConfig {
  /** Communication filters */
  filters?: Record<string, FilterConfig>;

  /** Request options */
  request?: {
    options?: RequestOptionsConfig;
  };
}

/**
 * Architecture module configuration.
 */
export interface ArchitectureConfig {
  /** Page configuration */
  page?: PageConfig;

  /** Controller configuration */
  cont?: ContConfig;

  /** Communication configuration */
  comm?: CommConfig;

  /** Additional architecture settings */
  [key: string]: unknown;
}

/**
 * Date format configuration for formatter.
 */
export interface FormatterDateConfig {
  /** Year, month, day separator */
  dateSepa?: string;

  /** Hour, minute, second separator */
  timeSepa?: string;

  /** Year, month format */
  Ym?: () => string;

  /** Year, month, day format */
  Ymd?: () => string;

  /** Year, month, day, hour format */
  YmdH?: () => string;

  /** Year, month, day, hour, minute format */
  YmdHi?: () => string;

  /** Year, month, day, hour, minute, second format */
  YmdHis?: () => string;
}

/**
 * Formatter configuration.
 */
export interface FormatterConfig {
  /** User-defined format rules */
  userRules?: Record<string, (str: string, args?: unknown) => string>;

  /** Date format configuration */
  date?: FormatterDateConfig;
}

/**
 * Validator messages type.
 */
export interface ValidatorMessages {
  global?: string;
  required?: string;
  alphabet?: string;
  integer?: string;
  korean?: string;
  alphabet_integer?: string;
  integer_korean?: string;
  alphabet_korean?: string;
  alphabet_integer_korean?: string;
  dash_integer?: string;
  commas_integer?: string;
  number?: string;
  email?: string;
  url?: string;
  zipcode?: string;
  decimal?: string;
  decimal_?: string;
  phone?: string;
  rrn?: string;
  ssn?: string;
  frn?: string;
  frn_ssn?: string;
  kbrn?: string;
  kcn?: string;
  date?: string;
  time?: string;
  accept?: string;
  match?: string;
  acceptFileExt?: string;
  notAccept?: string;
  notMatch?: string;
  notAcceptFileExt?: string;
  equalTo?: string;
  maxlength?: string;
  minlength?: string;
  rangelength?: string;
  maxbyte?: string;
  minbyte?: string;
  rangebyte?: string;
  maxvalue?: string;
  minvalue?: string;
  rangevalue?: string;
  regexp?: string;
  [key: string]: string | undefined;
}

/**
 * Validator configuration.
 */
export interface ValidatorConfig {
  /** User-defined validation rules */
  userRules?: Record<string, (str: string, args?: unknown) => boolean>;

  /** Validation error messages */
  message?: ConfigLocaleMessages<ValidatorMessages>;
}

/**
 * Data module configuration.
 */
export interface DataConfig {
  /** Formatter configuration */
  formatter?: FormatterConfig;

  /** Validator configuration */
  validator?: ValidatorConfig;

  /** Additional data settings */
  [key: string]: unknown;
}

/**
 * Button options configuration.
 */
export interface ButtonOptsConfig {
  /** Button color */
  color?: string;

  /** Button size */
  size?: string;
}

/**
 * Draggable overflow correction values.
 */
export interface DraggableOverflowCorrectionConfig {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

/**
 * Alert component configuration.
 */
export interface AlertConfig {
  /** Container selector */
  container?: string;

  /** OK button options */
  okButtonOpts?: ButtonOptsConfig;

  /** Cancel button options */
  cancelButtonOpts?: ButtonOptsConfig;

  /** Input-specific configuration */
  input?: {
    displayTimeout?: number;
    closeBtn?: string;
  };

  /** Always on top */
  alwaysOnTop?: boolean;

  /** Draggable overflow correction values */
  draggableOverflowCorrectionAddValues?: DraggableOverflowCorrectionConfig;

  /** Enable dragging */
  draggable?: boolean;

  /** Save memory by removing unused elements */
  saveMemory?: boolean;

  /** Multilingual messages */
  message?: ConfigLocaleMessages<{ confirm?: string; cancel?: string }>;
}

/**
 * Datepicker component configuration.
 */
export interface DatepickerConfig {
  /** Month-only options */
  monthonlyOpts?: {
    yearsPanelPosition?: 'left' | 'top';
    monthsPanelPosition?: 'left' | 'top';
  };

  /** Multilingual messages */
  message?: ConfigLocaleMessages<{
    year?: string;
    month?: string;
    days?: string;
    yearNaN?: string;
    monthNaN?: string;
    dayNaN?: string;
    minDate?: string;
    maxDate?: string;
    minMaxDate?: string;
    prev?: string;
    next?: string;
  }>;
}

/**
 * Popup component configuration.
 */
export interface PopupConfig {
  /** Always on top */
  alwaysOnTop?: boolean;

  /** Enable dragging */
  draggable?: boolean;

  /** Save memory */
  saveMemory?: boolean;

  /** Show buttons */
  button?: boolean;
}

/**
 * Tab component configuration.
 */
export interface TabConfig {
  tabScrollCorrection?: {
    tabContainerWidthCorrectionPx?: number;
    tabContainerWidthReCalcDelayTime?: number;
  };
}

/**
 * List component configuration.
 */
export interface ListConfig {
  /** Multilingual messages */
  message?: ConfigLocaleMessages<{ empty?: string }>;
}

/**
 * Grid misc configuration.
 */
export interface GridMiscConfig {
  resizableCorrectionWidth?: number;
  resizableLastCellCorrectionWidth?: number;
  resizeBarCorrectionLeft?: number;
  resizeBarCorrectionHeight?: number;
  fixedcolHeadMarginTop?: number;
  fixedcolHeadMarginLeft?: number;
  fixedcolHeadHeight?: number;
  fixedcolBodyMarginTop?: number;
  fixedcolBodyMarginLeft?: number;
  fixedcolBodyBindHeight?: number;
  fixedcolBodyAddHeight?: number;
  fixedcolRootContainer?: string;
}

/**
 * Grid component configuration.
 */
export interface GridConfig {
  /** Sort indicators */
  sortableItem?: { asc?: string; desc?: string };

  /** Multilingual messages */
  message?: ConfigLocaleMessages<{
    empty?: string;
    search?: string;
    selectAll?: string;
    dFilter?: string;
    more?: string;
    column?: string;
    showHide?: string;
    prev?: string;
    next?: string;
  }>;

  /** Miscellaneous settings */
  misc?: GridMiscConfig;
}

/**
 * UI module configuration.
 */
export interface UIConfig {
  /** Alert component config */
  alert?: AlertConfig;

  /** Datepicker component config */
  datepicker?: DatepickerConfig;

  /** Popup component config */
  popup?: PopupConfig;

  /** Tab component config */
  tab?: TabConfig;

  /** List component config */
  list?: ListConfig;

  /** Grid component config */
  grid?: GridConfig;

  /** Additional UI settings */
  [key: string]: unknown;
}

/**
 * Notify component configuration.
 */
export interface NotifyConfig {
  /** Always on top */
  alwaysOnTop?: boolean;

  /** Multilingual messages */
  message?: ConfigLocaleMessages<{ close?: string }>;
}

/**
 * Docs component configuration.
 */
export interface DocsConfig {
  /** Always on top */
  alwaysOnTop?: boolean;

  /** Multilingual messages */
  message?: ConfigLocaleMessages<{
    closeAllTitle?: string;
    closeAll?: string;
    closeAllQ?: string;
    closeAllDQ?: string;
    docListTitle?: string;
    docList?: string;
    selDocument?: string;
    close?: string;
    closeConf?: string;
    maxTabs?: string;
    maxStateful?: string;
  }>;
}

/**
 * UI.Shell module configuration.
 */
export interface UIShellConfig {
  /** Notify component config */
  notify?: NotifyConfig;

  /** Docs component config */
  docs?: DocsConfig;

  /** Additional UI.Shell settings */
  [key: string]: unknown;
}

/**
 * Template AOP codes configuration.
 */
export interface TemplateCodesConfig {
  /** Common code request URL */
  codeUrl?: string | null;

  /** Property name of common code classification code */
  codeKey?: string | null;
}

/**
 * Template AOP template configuration.
 */
export interface TemplateAopTemplateConfig {
  /** Callback before component initialization */
  onBeforeInitComponents?: ((cont: unknown, joinPoint: unknown) => void) | null;

  /** Callback after component initialization */
  onInitComponents?: ((cont: unknown, joinPoint: unknown) => void) | null;

  /** Callback before event initialization */
  onBeforeInitEvents?: ((cont: unknown, joinPoint: unknown) => void) | null;

  /** Callback after event initialization */
  onInitEvents?: ((cont: unknown, joinPoint: unknown) => void) | null;
}

/**
 * Template module configuration.
 */
export interface TemplateConfig {
  /** AOP configuration */
  aop?: {
    codes?: TemplateCodesConfig;
    template?: TemplateAopTemplateConfig;
  };

  /** Multilingual messages */
  message?: ConfigLocaleMessages<Record<string, string>>;

  /** Additional template settings */
  [key: string]: unknown;
}

/**
 * Code inspection configuration.
 */
export interface CodeInspectionConfig {
  /** Abort on error */
  abortOnError?: boolean;

  /** Exclude patterns */
  excludes?: string[];

  /** Multilingual messages */
  message?: ConfigLocaleMessages<{
    NoContextSpecifiedInSelector?: string;
    UseTheComponentsValMethod?: string;
  }>;
}

/**
 * Code module configuration.
 */
export interface CodeConfig {
  /** Inspection configuration */
  inspection?: CodeInspectionConfig;

  /** Additional code settings */
  [key: string]: unknown;
}

/**
 * Full Natural-JS configuration.
 */
export interface NaturalConfig {
  /** Core module configuration */
  core?: CoreConfig;

  /** Architecture module configuration */
  architecture?: ArchitectureConfig;

  /** Data module configuration */
  data?: DataConfig;

  /** UI module configuration */
  ui?: UIConfig;

  /** UI.Shell module configuration */
  'ui.shell'?: UIShellConfig;

  /** Template module configuration */
  template?: TemplateConfig;

  /** Code module configuration */
  code?: CodeConfig;

  /** Additional module configurations */
  [key: string]: unknown;
}

/**
 * Deep partial type for configuration overrides.
 */
export type ConfigDeepPartial<T> = T extends object
  ? { [P in keyof T]?: ConfigDeepPartial<T[P]> }
  : T;

/**
 * Configuration override type.
 */
export type NaturalConfigOverride = ConfigDeepPartial<NaturalConfig>;

