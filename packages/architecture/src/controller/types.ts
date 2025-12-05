/**
 * Controller type definitions for Natural-JS framework.
 */

import type { Request } from '../request';
import type { NaturalElement } from '@natural-js/core';

/**
 * Controller instance with standard methods.
 */
export interface ControllerInstance {
  /** The view element bound to this controller */
  view: NaturalElement | Element;

  /** Request object from Communicator */
  request?: Request;

  /** Init method called when controller is created */
  init?: (view: NaturalElement | Element, request?: Request) => void;

  /** Additional methods/properties */
  [key: string]: unknown;
}

/**
 * Controller definition object passed to N.cont().
 */
export type ControllerDefinition = Omit<ControllerInstance, 'view' | 'request'>;

/**
 * Advice type for AOP.
 */
export type AdviceType = 'before' | 'after' | 'around' | 'error';

/**
 * Join point for around advice.
 */
export interface JoinPoint {
  /** Controller fragment containing the method */
  contFrag: unknown;

  /** Arguments passed to the method */
  args: unknown[];

  /** Original method */
  real: (...args: unknown[]) => unknown;

  /** Proceed with original method execution */
  proceed: () => unknown;
}

/**
 * Advisor configuration for AOP.
 */
export interface Advisor {
  /** Pointcut definition */
  pointcut: string | PointcutDefinition;

  /** Type of advice */
  adviceType: AdviceType;

  /**
   * Advice function to execute.
   *
   * @param contFrag - Controller fragment containing the method
   * @param fnPath - Full path to the function (e.g., "foo.bar")
   * @param args - Arguments passed to the method
   * @param resultOrJoinPoint - For 'after': result, for 'around': JoinPoint, for 'error': Error
   * @returns Modified result or void
   */
  fn: (
    contFrag: unknown,
    fnPath: string,
    args: unknown[],
    resultOrJoinPoint?: unknown | JoinPoint | Error
  ) => unknown;
}

/**
 * Pointcut definition object.
 */
export interface PointcutDefinition {
  /** Pointcut type (e.g., 'regexp') */
  type: string;

  /** Pointcut parameter (e.g., regex pattern string) */
  param: string | RegExp;

  /** View selector to filter which controllers receive the advice */
  selector?: string;
}

/**
 * Pointcut matcher function.
 */
export interface PointcutMatcher {
  /**
   * Check if pointcut matches.
   *
   * @param param - Pointcut parameter
   * @param contFrag - Controller fragment
   * @param fnPath - Function path
   * @returns Whether pointcut matches
   */
  fn: (param: string | RegExp, contFrag: unknown, fnPath: string) => boolean;
}

/**
 * AOP configuration.
 */
export interface AOPConfig {
  /** Registered advisors */
  advisors: Advisor[];

  /** Custom pointcut matchers */
  pointcuts?: Record<string, PointcutMatcher>;
}

