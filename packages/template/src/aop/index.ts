/**
 * @natural-js/template - AOP Module
 *
 * Exports all AOP processing functions.
 */

export { processCodes } from './codes.js';
export { processTemplate } from './template.js';
export { processComponents, registerComponent } from './components.js';
export { processEvents } from './events.js';

// Types
export type {
  TemplateJoinPoint,
  JoinPoint,
  TemplateControllerInstance,
  ControllerInstance,
  TemplateSelectOptions,
  SelectOptions,
  ComponentOptions,
  EventOptions,
  TemplateAopOptions,
  CodesAopOptions,
  UsageOptions,
  Deferred,
} from '../types.js';

