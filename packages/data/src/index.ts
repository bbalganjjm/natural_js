/**
 * @natural-js/data
 *
 * Natural-JS Data package.
 * Provides Formatter, Validator, and DataSync utilities.
 */

// Formatter module
export {
  // Main class and factory
  Formatter,
  createFormatter,
  formatValue,
  // Individual rules
  builtInRules as formatRules,
  commas,
  rrn,
  ssn,
  kbrn,
  kcn,
  upper,
  lower,
  capitalize,
  zipcode,
  phone,
  realnum,
  trimtoempty,
  trimtozero,
  trimtoval,
  dateFormat,
  time,
  limit,
  replace,
  lpad as lpadFormat,
  rpad as rpadFormat,
  mask as maskFormat,
  generic,
  numeric,
  getFormatRule,
  // Types
  type FormatRule,
  type FormatRules,
  type FormattedValue,
  type FormattedRow,
  type DataRow as FormatterDataRow,
  type FormatRuleArgs,
  type FormatRuleFunction,
  type UserFormatRules,
  type FormatterOptions,
  type DateFormatConfig as FormatDateConfig,
  type MaskType,
  type DatepickerIntegrationOptions,
} from './formatter';

// Validator module
export {
  // Main class and factory
  Validator,
  createValidator,
  validateValue,
  // Individual rules
  builtInRules as validationRules,
  required,
  alphabet,
  integer,
  korean,
  alphabet_integer,
  integer_korean,
  alphabet_korean,
  alphabet_integer_korean,
  dash_integer,
  commas_integer,
  number as numberValidator,
  email,
  url,
  zipcode as zipcodeValidator,
  decimal,
  phone as phoneValidator,
  rrn as rrnValidator,
  ssn as ssnValidator,
  frn,
  frn_rrn,
  kbrn as kbrnValidator,
  kcn as kcnValidator,
  date as dateValidator,
  time as timeValidator,
  accept,
  match,
  acceptfileext,
  notaccept,
  notmatch,
  notacceptfileext,
  equalTo,
  maxlength,
  minlength,
  rangelength,
  maxbyte,
  minbyte,
  rangebyte,
  maxvalue,
  minvalue,
  rangevalue,
  regexp,
  getValidationRule,
  setValidationLocale,
  getValidationLocale,
  setValidationMessages,
  // Types
  type ValidationRule,
  type ValidationRules,
  type ValidationRuleResult,
  type FieldValidationResult,
  type RowValidationResult,
  type DataRow as ValidatorDataRow,
  type ValidationRuleArgs,
  type ValidationRuleFunction,
  type UserValidationRules,
  type ValidatorOptions,
  type ValidationMessages,
  type LocalizedValidationMessages,
  type CombinedRuleType,
} from './validator';

// DataSync module
export {
  // Main class and factory
  DataSync,
  createDataSync,
  getDataSyncRegistrySize,
  clearDataSyncRegistry,
  // Types
  type SyncableDataRow,
  type SyncableComponent,
  type SyncableComponentOptions,
  type DataSyncOptions,
  type DataChangeNotification,
  type DataChangeListener,
  type ObservableEntry,
} from './datasync';

// Data utilities module
export {
  // Functions
  filter,
  sort,
  groupBy as dataGroupBy, // Renamed to avoid conflict with @natural-js/core
  find,
  findIndex,
  some,
  every,
  sum,
  avg,
  min,
  max,
  count,
  distinct,
  pluck,
  first,
  last,
  skip,
  take,
  paginate,
  data,
  // Types
  type DataRow as DataUtilRow, // Renamed to avoid conflict with @natural-js/shared
  type FilterConditionFn,
  type FilterConditionString,
  type FilterCondition,
  type SortDirection as DataSortDirection, // Renamed to avoid potential conflicts
  type SortKey,
  type FilterOptions,
  type SortOptions,
  type GroupResult,
  type AggregateFn,
  type AggregateConfig,
} from './data';

// Version
export const DATA_VERSION = '2.0.0-alpha.0';
