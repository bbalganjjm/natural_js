/**
 * AOP (Aspect-Oriented Programming) implementation for Natural-JS.
 * Provides before, after, around, and error advices for controller methods.
 */

import { isPlainObject } from '@natural-js/core';
import type {
  Advisor,
  PointcutMatcher,
  PointcutDefinition,
  JoinPoint,
  ControllerInstance,
} from './types';
import { getContext } from '../context';

/**
 * Built-in pointcut matchers.
 */
export const builtinPointcuts: Record<string, PointcutMatcher> = {
  regexp: {
    fn: (param: string | RegExp, _contFrag: unknown, fnPath: string): boolean => {
      const regexp = param instanceof RegExp ? param : new RegExp(param);
      return regexp.test(fnPath);
    },
  },
};

/**
 * Parse pointcut string into PointcutDefinition.
 * Format: "selector:pattern" or just "pattern"
 */
function parsePointcut(pointcut: string | PointcutDefinition): PointcutDefinition {
  if (typeof pointcut === 'object') {
    return pointcut;
  }

  // Parse string format: "selector:pattern" or just "pattern"
  const lastColonIndex = pointcut.lastIndexOf(':');
  if (lastColonIndex > 0) {
    return {
      type: 'regexp',
      selector: pointcut.substring(0, lastColonIndex),
      param: pointcut.substring(lastColonIndex + 1),
    };
  }

  return {
    type: 'regexp',
    param: pointcut,
  };
}

/**
 * Create before advice wrapper.
 */
function createBeforeAdvice(
  real: (...args: unknown[]) => unknown,
  contFrag: unknown,
  fnPath: string,
  advisor: Advisor
): (...args: unknown[]) => unknown {
  return function (this: unknown, ...args: unknown[]): unknown {
    advisor.fn.call(advisor, contFrag, fnPath, args);
    return real.apply(this, args);
  };
}

/**
 * Create after advice wrapper.
 */
function createAfterAdvice(
  real: (...args: unknown[]) => unknown,
  contFrag: unknown,
  fnPath: string,
  advisor: Advisor
): (...args: unknown[]) => unknown {
  return function (this: unknown, ...args: unknown[]): unknown {
    const result = real.apply(this, args);
    advisor.fn.call(advisor, contFrag, fnPath, args, result);
    return result;
  };
}

/**
 * Create around advice wrapper.
 */
function createAroundAdvice(
  real: (...args: unknown[]) => unknown,
  contFrag: unknown,
  fnPath: string,
  advisor: Advisor
): (...args: unknown[]) => unknown {
  return function (this: unknown, ...args: unknown[]): unknown {
    const joinPoint: JoinPoint = {
      contFrag,
      args,
      real,
      proceed: function () {
        return this.real.apply(this.contFrag, this.args);
      },
    };
    return advisor.fn.call(advisor, contFrag, fnPath, args, joinPoint);
  };
}

/**
 * Create error advice wrapper.
 */
function createErrorAdvice(
  real: (...args: unknown[]) => unknown,
  contFrag: unknown,
  fnPath: string,
  advisor: Advisor
): (...args: unknown[]) => unknown {
  return function (this: unknown, ...args: unknown[]): unknown {
    try {
      return real.apply(this, args);
    } catch (e) {
      return advisor.fn.call(advisor, contFrag, fnPath, args, e);
    }
  };
}

/**
 * Wrap a function with the appropriate advice.
 */
function wrapFunction(
  real: (...args: unknown[]) => unknown,
  contFrag: unknown,
  fnPath: string,
  advisor: Advisor
): (...args: unknown[]) => unknown {
  switch (advisor.adviceType) {
    case 'before':
      return createBeforeAdvice(real, contFrag, fnPath, advisor);
    case 'after':
      return createAfterAdvice(real, contFrag, fnPath, advisor);
    case 'around':
      return createAroundAdvice(real, contFrag, fnPath, advisor);
    case 'error':
      return createErrorAdvice(real, contFrag, fnPath, advisor);
    default:
      return real;
  }
}

/**
 * Get pointcut matcher by type.
 */
function getPointcutMatcher(type: string): PointcutMatcher | undefined {
  const context = getContext();
  const archConfig = context.getArchitecture();
  const customPointcuts = archConfig?.cont?.pointcuts;

  return customPointcuts?.[type] || builtinPointcuts[type];
}

/**
 * Check if controller view matches selector.
 */
function matchesSelector(controller: ControllerInstance, selector: string): boolean {
  const view = controller.view;
  if (!view) return true; // No selector restriction

  // Check if view element matches selector
  if ('matches' in view && typeof view.matches === 'function') {
    return view.matches(selector);
  }

  // For NaturalElement, check if any element matches
  if ('is' in view && typeof view.is === 'function') {
    return (view as { is: (selector: string) => boolean }).is(selector);
  }

  return true;
}

/**
 * Apply AOP advisors to a controller.
 */
export function wrapWithAOP(controller: ControllerInstance): void {
  const context = getContext();
  const archConfig = context.getArchitecture();
  const advisors = archConfig?.cont?.advisors;

  if (!advisors || advisors.length === 0) {
    return;
  }

  for (const advisor of advisors) {
    const pointcutDef = parsePointcut(advisor.pointcut);

    // Get pointcut matcher
    const pointcut = getPointcutMatcher(pointcutDef.type);
    if (!pointcut) {
      console.warn(`[AOP] Unknown pointcut type: ${pointcutDef.type}`);
      continue;
    }

    // Check selector match
    if (pointcutDef.selector && !matchesSelector(controller, pointcutDef.selector)) {
      continue;
    }

    // Recursively wrap functions
    wrapControllerFunctions(controller, '', pointcutDef, pointcut, advisor);
  }
}

/**
 * Recursively wrap controller functions that match pointcut.
 */
function wrapControllerFunctions(
  contFrag: Record<string, unknown>,
  pathPrefix: string,
  pointcutDef: PointcutDefinition,
  pointcut: PointcutMatcher,
  advisor: Advisor
): void {
  for (const key of Object.keys(contFrag)) {
    // Skip internal properties
    if (key === 'view' || key === 'request') {
      continue;
    }

    const value = contFrag[key];
    const fnPath = pathPrefix + key;

    if (typeof value === 'function') {
      // Check if pointcut matches this function
      if (pointcut.fn(pointcutDef.param, contFrag, fnPath)) {
        contFrag[key] = wrapFunction(
          value as (...args: unknown[]) => unknown,
          contFrag,
          fnPath,
          advisor
        );
      }
    } else if (isPlainObject(value)) {
      // Recursively process nested objects
      wrapControllerFunctions(
        value as Record<string, unknown>,
        fnPath + '.',
        pointcutDef,
        pointcut,
        advisor
      );
    }
  }
}

/**
 * Register an advisor programmatically.
 */
export function registerAdvisor(advisor: Advisor): void {
  const context = getContext();
  let archConfig = context.getArchitecture();

  if (!archConfig) {
    archConfig = { cont: { advisors: [] } };
    context.attr('architecture', archConfig);
  }

  if (!archConfig.cont) {
    archConfig.cont = { advisors: [] };
  }

  if (!archConfig.cont.advisors) {
    archConfig.cont.advisors = [];
  }

  archConfig.cont.advisors.push(advisor);
}

/**
 * Register a custom pointcut matcher.
 */
export function registerPointcut(name: string, matcher: PointcutMatcher): void {
  const context = getContext();
  let archConfig = context.getArchitecture();

  if (!archConfig) {
    archConfig = { cont: { pointcuts: {} } };
    context.attr('architecture', archConfig);
  }

  if (!archConfig.cont) {
    archConfig.cont = { pointcuts: {} };
  }

  if (!archConfig.cont.pointcuts) {
    archConfig.cont.pointcuts = {};
  }

  archConfig.cont.pointcuts[name] = matcher;
}

/**
 * Clear all registered advisors.
 */
export function clearAdvisors(): void {
  const context = getContext();
  const archConfig = context.getArchitecture();
  if (archConfig?.cont?.advisors) {
    archConfig.cont.advisors = [];
  }
}

