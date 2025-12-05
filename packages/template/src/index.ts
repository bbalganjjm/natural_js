/**
 * @natural-js/template
 *
 * Natural-JS Template package.
 * Provides AOP processing for components.
 */

// AOP exports
export {
  processCodes,
  processTemplate,
  processComponents,
  processEvents,
  registerComponent,
} from './aop/index.js';

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
} from './types.js';

// Version
export const TEMPLATE_VERSION = '2.0.0-alpha.0';

/**
 * Template AOP class providing static methods
 * for compatibility with original NT.aop interface
 */
export class TemplateAop {
  static codes = async (
    cont: import('./types.js').ControllerInstance,
    joinPoint: import('./types.js').JoinPoint
  ): Promise<void> => {
    const { processCodes } = await import('./aop/codes.js');
    return processCodes(cont, joinPoint);
  };

  static template = (
    cont: import('./types.js').ControllerInstance,
    joinPoint: import('./types.js').JoinPoint
  ): void => {
    import('./aop/template.js').then(({ processTemplate }) => {
      processTemplate(cont, joinPoint);
    });
  };

  static components = (
    cont: import('./types.js').ControllerInstance,
    prop: string,
    compActionDefer: import('./types.js').Deferred[]
  ): void => {
    import('./aop/components.js').then(({ processComponents }) => {
      processComponents(cont, prop, compActionDefer);
    });
  };

  static events = (
    cont: import('./types.js').ControllerInstance,
    prop: string
  ): void => {
    import('./aop/events.js').then(({ processEvents }) => {
      processEvents(cont, prop);
    });
  };
}

// Default export for backwards compatibility
export default TemplateAop;
