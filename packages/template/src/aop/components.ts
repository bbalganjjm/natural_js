/**
 * @natural-js/template - Components AOP
 *
 * Automatically initializes UI components based on controller properties.
 */

import { NaturalElement, isBrowser } from '@natural-js/shared';
import { getConfig, type as getType } from '@natural-js/core';
import type {
  ControllerInstance,
  ComponentOptions,
  UsageOptions,
  Deferred,
} from '../types.js';

/** Component factory type */
type ComponentFactory = (opts: ComponentOptions) => unknown;

/** Component registry for dynamic initialization */
const componentRegistry: Record<string, ComponentFactory> = {};

/**
 * Register a component factory
 */
export function registerComponent(name: string, factory: ComponentFactory): void {
  componentRegistry[name] = factory;
}

/**
 * Get component factory by name
 */
function getComponentFactory(name: string): ComponentFactory | undefined {
  return componentRegistry[name];
}

/**
 * Apply search-box usage pattern
 */
function applySearchBoxUsage(
  cont: ControllerInstance,
  opts: ComponentOptions,
  contextEl: NaturalElement,
  component: unknown
): void {
  if (!isBrowser()) return;

  const usageOptions: UsageOptions = {
    'search-box': {
      defaultButton: '.btn-search',
      events: [],
    },
  };

  if (typeof opts.usage === 'object') {
    Object.assign(usageOptions, opts.usage);
  }

  const searchBoxOpts = usageOptions['search-box'];
  if (!searchBoxOpts) return;

  // Add search-box class
  contextEl.addClass('search_box__');

  // Add initial row if not specified
  if (opts.action === undefined || opts.action !== 'add') {
    if (component && typeof (component as { add?: () => void }).add === 'function') {
      (component as { add: () => void }).add();
    }
  }

  // Bind custom events
  const targets: string[] = [];
  const events = searchBoxOpts.events ?? [];

  for (const eventDef of events) {
    targets.push(eventDef.target);
    const targetEl = contextEl.find(eventDef.target);
    const pageId = cont.view.data('pageid') as string;
    targetEl.on(`${eventDef.event}.${pageId}`, eventDef.handler);
  }

  // Bind enter key to default button
  const pageId = cont.view.data('pageid') as string;
  const excludeSelector = targets.join(',');

  contextEl.on(`keyup.${pageId}`, (e: Event) => {
    const keyEvent = e as KeyboardEvent;
    const target = e.target as HTMLElement;

    // Check if target is an input but not in excluded list
    if (
      target.tagName?.toLowerCase() === 'input' &&
      !target.matches(excludeSelector)
    ) {
      if (keyEvent.keyCode === 13 || keyEvent.key === 'Enter') {
        const defaultBtn = cont.view.find(searchBoxOpts.defaultButton ?? '.btn-search');
        if (defaultBtn.length > 0) {
          (defaultBtn.get(0) as HTMLElement)?.click();
        }
      }
    }
  });
}

/**
 * Process component initialization
 */
export function processComponents(
  cont: ControllerInstance,
  prop: string,
  compActionDefer: Deferred[]
): void {
  const props = prop.split('.'); // props[1]: Component name, props[2]: Component id

  if (props.length <= 2) {
    console.error(`Invalid component property format: ${prop}`);
    return;
  }

  const componentName = props[1] ?? '';
  const componentId = props[2] ?? '';
  
  if (!componentName || !componentId) {
    console.error(`Invalid component property format: ${prop}`);
    return;
  }

  const compProp = `p.${componentName}.${componentId}`;

  // Skip already processed select components
  if (componentName === 'select' && Array.isArray(cont[compProp])) {
    return;
  }

  // Get options
  const opts = cont[compProp] as ComponentOptions | undefined;
  if (!opts) return;

  // Get context element
  let contextEl: NaturalElement;
  if (opts.context !== undefined) {
    if (opts.context instanceof NaturalElement) {
      contextEl = opts.context;
    } else if (typeof opts.context === 'string') {
      contextEl = cont.view.find(opts.context);
    } else {
      contextEl = new NaturalElement(opts.context);
    }
  } else {
    contextEl = cont.view.find(`#${componentId}`);
  }

  // Check if context exists
  if (contextEl.length === 0 && opts.context === undefined && opts.url === undefined) {
    console.error(`Component context not found: ${compProp}`);
    return;
  }

  // Update context in options
  opts.context = contextEl;

  // Set opener for popup/tab
  if (
    (componentName === 'popup' || componentName === 'tab') &&
    (opts.url || componentName === 'tab')
  ) {
    if (opts.opener === undefined) {
      opts.opener = cont;
    }
  }

  // Initialize component
  const factory = getComponentFactory(componentName);
  if (factory) {
    const component = factory(opts);
    cont[compProp] = component;

    // Apply usage patterns
    if (opts.usage) {
      const usageKey = typeof opts.usage === 'string' ? opts.usage : Object.keys(opts.usage)[0];
      if (usageKey === 'search-box') {
        applySearchBoxUsage(cont, opts, contextEl, component);
      }
    }

    // Defer action execution
    if (opts.action) {
      const actionOpts = opts.action;
      compActionDefer.push({
        resolve: () => {
          if (!component) return;

          if (typeof actionOpts === 'string') {
            const methodName = actionOpts;
            const comp = component as Record<string, unknown>;
            if (typeof comp[methodName] === 'function') {
              (comp[methodName] as () => void)();
            }
          } else if (Array.isArray(actionOpts) && actionOpts.length > 0) {
            const [methodName, ...args] = actionOpts;
            const comp = component as Record<string, unknown>;
            if (typeof methodName === 'string' && typeof comp[methodName] === 'function') {
              (comp[methodName] as (...args: unknown[]) => void)(...args);
            }
          }
        },
      });
    }
  } else {
    // For unregistered components, just store the options
    // The component may be initialized elsewhere
    const compType = getType(cont[compProp]);
    if (compType !== 'array' && !opts.code) {
      // Keep as options for later initialization
    }
  }
}

export default { processComponents, registerComponent };

