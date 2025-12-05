import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  Controller,
  cont,
  triggerInit,
  getController,
  registerAdvisor,
  clearAdvisors,
} from './index';
import { initContext, getContext } from '../context';

describe('Controller', () => {
  beforeEach(() => {
    // Reset context and advisors
    initContext();
    clearAdvisors();

    // Clear DOM
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('should create controller with element', () => {
      const element = document.createElement('div');
      element.id = 'testView';
      document.body.appendChild(element);

      const ctrl = new Controller(element, {
        init: vi.fn(),
      });

      expect(ctrl.view).toBeDefined();
      expect(ctrl.view.get()[0]).toBe(element);
    });

    it('should create controller with selector', () => {
      const element = document.createElement('div');
      element.id = 'testView';
      document.body.appendChild(element);

      const ctrl = new Controller('#testView', {
        init: vi.fn(),
      });

      expect(ctrl.view.get()[0]).toBe(element);
    });

    it('should set data-pageid attribute', () => {
      const element = document.createElement('div');
      element.id = 'myPage';
      document.body.appendChild(element);

      new Controller(element, {});

      expect(element.getAttribute('data-pageid')).toBe('myPage');
    });

    it('should add view_context__ class', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      new Controller(element, {});

      expect(element.classList.contains('view_context__')).toBe(true);
    });

    it('should copy definition properties to controller', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const ctrl = new Controller(element, {
        myMethod: () => 'hello',
        myProperty: 42,
      });

      expect(typeof ctrl.myMethod).toBe('function');
      expect(ctrl.myProperty).toBe(42);
    });
  });

  describe('triggerInit', () => {
    it('should call init method with view and request', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      const initFn = vi.fn();

      const ctrl = new Controller(element, {
        init: initFn,
      });

      ctrl.triggerInit();

      expect(initFn).toHaveBeenCalledWith(ctrl.view, undefined);
    });

    it('should set request property', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const ctrl = new Controller(element, {});
      const mockRequest = { options: { url: '/test' } } as never;

      ctrl.triggerInit(mockRequest);

      expect(ctrl.request).toBe(mockRequest);
    });
  });

  describe('find', () => {
    it('should find elements within view scope', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <span class="item">Item 1</span>
        <span class="item">Item 2</span>
      `;
      document.body.appendChild(container);

      const ctrl = new Controller(container, {});
      const items = ctrl.find('.item');

      expect(items.length).toBe(2);
    });
  });

  describe('get', () => {
    it('should get element by index', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const ctrl = new Controller(element, {});

      expect(ctrl.get(0)).toBe(element);
    });

    it('should get all elements when no index', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const ctrl = new Controller(element, {});

      expect(ctrl.get()).toEqual([element]);
    });
  });

  describe('getPageId', () => {
    it('should return page ID', () => {
      const element = document.createElement('div');
      element.id = 'myPage';
      document.body.appendChild(element);

      const ctrl = new Controller(element, {});

      expect(ctrl.getPageId()).toBe('myPage');
    });
  });

  describe('attr', () => {
    it('should get attribute from view', () => {
      const element = document.createElement('div');
      element.setAttribute('data-test', 'value');
      document.body.appendChild(element);

      const ctrl = new Controller(element, {});

      expect(ctrl.attr('data-test')).toBe('value');
    });

    it('should set attribute on view', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);

      const ctrl = new Controller(element, {});
      ctrl.attr('data-test', 'value');

      expect(element.getAttribute('data-test')).toBe('value');
    });
  });
});

describe('cont function', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    clearAdvisors();
  });

  it('should create Controller instance', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const ctrl = cont(element, { init: vi.fn() });

    expect(ctrl).toBeInstanceOf(Controller);
  });
});

describe('triggerInit function', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    clearAdvisors();
  });

  it('should trigger init on controller', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    const initFn = vi.fn();

    const ctrl = new Controller(element, { init: initFn });
    triggerInit(ctrl);

    expect(initFn).toHaveBeenCalled();
  });
});

describe('getController function', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should get controller from element', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const ctrl = new Controller(element, {});

    expect(getController(element)).toBe(ctrl);
  });

  it('should return undefined for element without controller', () => {
    const element = document.createElement('div');
    expect(getController(element)).toBeUndefined();
  });
});

describe('AOP', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    initContext({
      architecture: {
        cont: {
          advisors: [],
        },
      },
    });
  });

  describe('before advice', () => {
    it('should execute before original method', () => {
      const executionOrder: string[] = [];

      registerAdvisor({
        pointcut: '.*',
        adviceType: 'before',
        fn: () => {
          executionOrder.push('before');
        },
      });

      const element = document.createElement('div');
      document.body.appendChild(element);

      const ctrl = new Controller(element, {
        myMethod: () => {
          executionOrder.push('method');
        },
      });

      ctrl.triggerInit();
      (ctrl.myMethod as () => void)();

      expect(executionOrder).toEqual(['before', 'method']);
    });
  });

  describe('after advice', () => {
    it('should execute after original method', () => {
      const executionOrder: string[] = [];

      registerAdvisor({
        pointcut: '.*',
        adviceType: 'after',
        fn: () => {
          executionOrder.push('after');
        },
      });

      const element = document.createElement('div');
      document.body.appendChild(element);

      const ctrl = new Controller(element, {
        myMethod: () => {
          executionOrder.push('method');
        },
      });

      ctrl.triggerInit();
      (ctrl.myMethod as () => void)();

      expect(executionOrder).toEqual(['method', 'after']);
    });

    it('should receive result', () => {
      let capturedResult: unknown;

      registerAdvisor({
        pointcut: '.*',
        adviceType: 'after',
        fn: (_contFrag, _fnPath, _args, result) => {
          capturedResult = result;
        },
      });

      const element = document.createElement('div');
      document.body.appendChild(element);

      const ctrl = new Controller(element, {
        myMethod: () => 42,
      });

      ctrl.triggerInit();
      (ctrl.myMethod as () => number)();

      expect(capturedResult).toBe(42);
    });
  });

  describe('around advice', () => {
    it('should wrap original method', () => {
      registerAdvisor({
        pointcut: '.*',
        adviceType: 'around',
        fn: (_contFrag, _fnPath, _args, joinPoint) => {
          const jp = joinPoint as { proceed: () => number };
          return jp.proceed() * 2;
        },
      });

      const element = document.createElement('div');
      document.body.appendChild(element);

      const ctrl = new Controller(element, {
        getValue: () => 21,
      });

      ctrl.triggerInit();
      const result = (ctrl.getValue as () => number)();

      expect(result).toBe(42);
    });
  });

  describe('error advice', () => {
    it('should catch errors', () => {
      let capturedError: Error | undefined;

      registerAdvisor({
        pointcut: '.*',
        adviceType: 'error',
        fn: (_contFrag, _fnPath, _args, error) => {
          capturedError = error as Error;
          return 'recovered';
        },
      });

      const element = document.createElement('div');
      document.body.appendChild(element);

      const ctrl = new Controller(element, {
        throwError: () => {
          throw new Error('Test error');
        },
      });

      ctrl.triggerInit();
      const result = (ctrl.throwError as () => string)();

      expect(capturedError?.message).toBe('Test error');
      expect(result).toBe('recovered');
    });
  });

  describe('pointcut matching', () => {
    it('should match specific method pattern', () => {
      const beforeCalls: string[] = [];

      registerAdvisor({
        pointcut: '^get.*',
        adviceType: 'before',
        fn: (_contFrag, fnPath) => {
          beforeCalls.push(fnPath);
        },
      });

      const element = document.createElement('div');
      document.body.appendChild(element);

      const ctrl = new Controller(element, {
        getValue: () => 1,
        setValue: () => 2,
        getName: () => 'name',
      });

      ctrl.triggerInit();
      (ctrl.getValue as () => number)();
      (ctrl.setValue as () => number)();
      (ctrl.getName as () => string)();

      expect(beforeCalls).toEqual(['getValue', 'getName']);
    });

    it('should match nested methods', () => {
      const matchedPaths: string[] = [];

      registerAdvisor({
        pointcut: 'nested\\..*',
        adviceType: 'before',
        fn: (_contFrag, fnPath) => {
          matchedPaths.push(fnPath);
        },
      });

      const element = document.createElement('div');
      document.body.appendChild(element);

      const ctrl = new Controller(element, {
        rootMethod: () => 1,
        nested: {
          innerMethod: () => 2,
        },
      });

      ctrl.triggerInit();
      (ctrl.rootMethod as () => number)();
      ((ctrl.nested as { innerMethod: () => number }).innerMethod)();

      expect(matchedPaths).toEqual(['nested.innerMethod']);
    });
  });
});

