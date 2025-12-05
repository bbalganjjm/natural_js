/**
 * @natural-js/template - Template AOP
 *
 * Main template AOP processor that initializes components and events.
 */

import { getConfig } from '@natural-js/core';
import type {
  JoinPoint,
  ControllerInstance,
  TemplateAopOptions,
  Deferred,
} from '../types.js';
import { processComponents } from './components.js';
import { processEvents } from './events.js';

/**
 * Process template AOP - initializes components and events
 */
export function processTemplate(
  cont: ControllerInstance,
  joinPoint: JoinPoint
): void {
  const config = getConfig();
  const templateAop = config.template?.aop as { template?: TemplateAopOptions } | undefined;
  const options: TemplateAopOptions = {
    onBeforeInitComponents: undefined,
    onInitComponents: undefined,
    onBeforeInitEvents: undefined,
    onInitEvents: undefined,
    ...templateAop?.template,
  };

  // Before components initialization callback
  if (options.onBeforeInitComponents) {
    options.onBeforeInitComponents.call(null, cont, joinPoint);
  }

  // Collect deferred actions for components
  const compActionDefer: Deferred[] = [];

  // Initialize components (properties starting with "p.")
  for (const prop in cont) {
    if (typeof prop === 'string' && prop.startsWith('p.')) {
      processComponents(cont, prop, compActionDefer);
    }
  }

  // Before events initialization callback
  if (options.onBeforeInitEvents) {
    options.onBeforeInitEvents.call(null, cont, joinPoint);
  }

  // Initialize events (properties starting with "e.")
  for (const prop in cont) {
    if (typeof prop === 'string' && prop.startsWith('e.')) {
      processEvents(cont, prop);
    }
  }

  // After events initialization callback
  if (options.onInitEvents) {
    options.onInitEvents.call(null, cont, joinPoint);
  }

  // Execute deferred component actions
  if (compActionDefer.length > 0) {
    for (const deferred of compActionDefer) {
      deferred.resolve();
      if (options.onInitComponents) {
        options.onInitComponents.call(null, cont, joinPoint);
      }
    }
  }

  // Proceed with the original init method
  joinPoint.proceed();

  // Resolve onOpen deferred (for popup/tab delayed init)
  setTimeout(() => {
    if (cont.onOpenDefer) {
      cont.onOpenDefer.resolve();
    }
  }, 0);
}

export default { processTemplate };

