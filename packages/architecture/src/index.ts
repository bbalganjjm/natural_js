/**
 * @natural-js/architecture
 *
 * Natural-JS Architecture package.
 * Provides HTTP client, Communication Filter, Controller, and Context.
 */

// HTTP client
export * from './http';
export { http, NaturalHttpClient, createHttpClient } from './http';

// Communication filters
export * from './filters';
export { FilterChain, getFilterChain, initFilterConfig, createFilterChain } from './filters';

// Request
export * from './request';
export { Request, createRequest } from './request';

// Communicator
export * from './communicator';
export { Communicator, comm } from './communicator';

// Context
export * from './context';
export { Context, getContext, initContext, createContext } from './context';

// Controller
export * from './controller';
export {
  Controller,
  cont,
  triggerInit,
  getController,
  wrapWithAOP,
  registerAdvisor,
  registerPointcut,
  clearAdvisors,
} from './controller';

// Version
export const ARCHITECTURE_VERSION = '2.0.0-alpha.0';

