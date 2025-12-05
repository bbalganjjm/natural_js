/**
 * @natural-js/natural
 *
 * Natural-JS - Full-featured UI framework for enterprise web applications.
 * TypeScript-based, SSR-ready, jQuery-free.
 */

// Re-export packages with explicit handling of name conflicts

// Shared package - base types and utilities
export * from '@natural-js/shared';

// Core package - utilities and configuration
export * from '@natural-js/core';

// Architecture package - communicator, controller, context
// Excluding conflicting types that will be re-exported from template
export {
  // HTTP client
  NaturalHttpClient,
  createHttpClient,
  // Filters
  FilterChain,
  getFilterChain,
  initFilterConfig,
  createFilterChain,
  // Request
  Request,
  // Communicator
  Communicator,
  // Controller
  Controller,
  cont,
  triggerInit,
  getController,
  // Context
  Context,
  // AOP
  wrapWithAOP,
  registerPointcut,
  registerAdvisor,
} from '@natural-js/architecture';

// Re-export architecture types with prefixes to avoid conflicts
export type {
  RequestConfig,
  NaturalHttpResponse,
  HttpError,
  HttpErrorInfo,
  RequestInterceptor,
  ResponseInterceptor,
  FilterHandler,
  FiltersConfig,
  FilterContext,
  RequestOptions,
  RequestAttributes,
  CommunicatorOptions,
  ControllerInstance as ArchControllerInstance,
  ControllerDefinition,
  JoinPoint as ArchJoinPoint,
  AdviceType,
  PointcutDefinition,
  PointcutMatcher,
  Advisor,
} from '@natural-js/architecture';

// Data package
export * from '@natural-js/data';

// UI package
export {
  Alert,
  Button,
  Popup,
  Tab,
  Form,
  Datepicker,
  Select,
  List,
  Grid,
  Pagination,
  Tree,
  utils as uiUtils,
} from '@natural-js/ui';

// Re-export UI types
export type {
  AlertOptions,
  AlertUserOptions,
  ButtonOptions,
  PopupOptions,
  PopupUserOptions,
  TabOptions,
  TabUserOptions,
  FormOptions,
  FormUserOptions,
  FormDataRow,
  DatepickerOptions,
  DatepickerUserOptions,
  SelectOptions as UISelectOptions,
  SelectUserOptions,
  ListOptions,
  ListUserOptions,
  ListDataRow,
  GridOptions,
  GridUserOptions,
  GridDataRow,
  GridSortOptions,
  PaginationOptions,
  PaginationUserOptions,
  TreeOptions,
  TreeUserOptions,
  DraggableOptions,
  ScrollPagingOptions,
  IterationRenderOptions,
} from '@natural-js/ui';

// UI Shell package
export * from '@natural-js/ui-shell';

// Template package
export {
  processCodes,
  processTemplate,
  processComponents,
  processEvents,
  registerComponent,
  TemplateAop,
  TEMPLATE_VERSION,
} from '@natural-js/template';

// Re-export template types with explicit naming
export type {
  TemplateJoinPoint,
  JoinPoint,
  TemplateControllerInstance,
  ControllerInstance,
  TemplateSelectOptions,
  SelectOptions,
  ComponentOptions as TemplateComponentOptions,
  EventOptions as TemplateEventOptions,
  TemplateAopOptions,
  CodesAopOptions,
  UsageOptions,
  Deferred,
} from '@natural-js/template';

// Code package
export * from '@natural-js/code';

// Version
export const VERSION = '2.0.0-alpha.0';

// Legacy API wrapper - provides N() function for backwards compatibility
export { N } from './legacy/index.js';
export type { NVersionInfo } from './legacy/types.js';
