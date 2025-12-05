import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  KeyCode,
  isNumberRelatedKeys,
  disable,
  preventDefault,
  stopPropagation,
  windowScrollLock,
  getMaxDuration,
  whichAnimationEvent,
  whichTransitionEvent,
  once,
  debounce,
  throttle,
  event,
} from './index';

describe('Event Utilities', () => {
  describe('KeyCode constants', () => {
    it('should have correct key codes', () => {
      expect(KeyCode.ENTER).toBe(13);
      expect(KeyCode.ESCAPE).toBe(27);
      expect(KeyCode.BACKSPACE).toBe(8);
      expect(KeyCode.TAB).toBe(9);
      expect(KeyCode.DELETE).toBe(46);
      expect(KeyCode.LEFT).toBe(37);
      expect(KeyCode.RIGHT).toBe(39);
      expect(KeyCode.UP).toBe(38);
      expect(KeyCode.DOWN).toBe(40);
    });
  });

  describe('isNumberRelatedKeys', () => {
    const createKeyboardEvent = (key: number, options: Partial<KeyboardEvent> = {}): KeyboardEvent => {
      return {
        keyCode: key,
        which: key,
        charCode: key,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        ...options,
      } as KeyboardEvent;
    };

    it('should allow number keys (0-9)', () => {
      // Keyboard numbers
      for (let i = 48; i <= 57; i++) {
        expect(isNumberRelatedKeys(createKeyboardEvent(i))).toBe(true);
      }
      // Numpad numbers
      for (let i = 96; i <= 105; i++) {
        expect(isNumberRelatedKeys(createKeyboardEvent(i))).toBe(true);
      }
    });

    it('should allow backspace and delete', () => {
      expect(isNumberRelatedKeys(createKeyboardEvent(KeyCode.BACKSPACE))).toBe(true);
      expect(isNumberRelatedKeys(createKeyboardEvent(KeyCode.DELETE))).toBe(true);
    });

    it('should allow arrow keys', () => {
      expect(isNumberRelatedKeys(createKeyboardEvent(KeyCode.LEFT))).toBe(true);
      expect(isNumberRelatedKeys(createKeyboardEvent(KeyCode.RIGHT))).toBe(true);
    });

    it('should allow tab and enter', () => {
      expect(isNumberRelatedKeys(createKeyboardEvent(KeyCode.TAB))).toBe(true);
      expect(isNumberRelatedKeys(createKeyboardEvent(KeyCode.ENTER))).toBe(true);
    });

    it('should allow Ctrl+A, Ctrl+C, Ctrl+V', () => {
      expect(isNumberRelatedKeys(createKeyboardEvent(65, { ctrlKey: true }))).toBe(true); // Ctrl+A
      expect(isNumberRelatedKeys(createKeyboardEvent(67, { ctrlKey: true }))).toBe(true); // Ctrl+C
      expect(isNumberRelatedKeys(createKeyboardEvent(86, { ctrlKey: true }))).toBe(true); // Ctrl+V
    });

    it('should block letter keys without Ctrl', () => {
      expect(isNumberRelatedKeys(createKeyboardEvent(65))).toBe(false); // A
      expect(isNumberRelatedKeys(createKeyboardEvent(90))).toBe(false); // Z
    });
  });

  describe('disable', () => {
    it('should call preventDefault and stopPropagation', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as Event;

      const result = disable(mockEvent);

      expect(result).toBe(false);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopImmediatePropagation).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should not throw on error', () => {
      const mockEvent = {
        preventDefault: () => {
          throw new Error('test');
        },
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as Event;

      expect(() => disable(mockEvent)).not.toThrow();
    });
  });

  describe('preventDefault', () => {
    it('should call preventDefault only', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as Event;

      const result = preventDefault(mockEvent);

      expect(result).toBe(false);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    });
  });

  describe('stopPropagation', () => {
    it('should call stopPropagation only', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        stopImmediatePropagation: vi.fn(),
      } as unknown as Event;

      const result = stopPropagation(mockEvent);

      expect(result).toBe(false);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(mockEvent.stopImmediatePropagation).toHaveBeenCalled();
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('windowScrollLock', () => {
    it('should return a cleanup function', () => {
      const element = document.createElement('div');
      const cleanup = windowScrollLock(element);
      expect(typeof cleanup).toBe('function');
      cleanup();
    });
  });

  describe('getMaxDuration', () => {
    it('should return 0 for elements without animation', () => {
      const element = document.createElement('div');
      expect(getMaxDuration(element, 'animation-duration')).toBe(0);
    });
  });

  describe('whichAnimationEvent', () => {
    it('should return a string', () => {
      const eventName = whichAnimationEvent();
      expect(typeof eventName).toBe('string');
    });

    it('should return "nothing" when animation duration is 0', () => {
      const element = document.createElement('div');
      const eventName = whichAnimationEvent(element);
      expect(eventName).toBe('nothing');
    });
  });

  describe('whichTransitionEvent', () => {
    it('should return a string', () => {
      const eventName = whichTransitionEvent();
      expect(typeof eventName).toBe('string');
    });

    it('should return "nothing" when transition duration is 0', () => {
      const element = document.createElement('div');
      const eventName = whichTransitionEvent(element);
      expect(eventName).toBe('nothing');
    });
  });

  describe('once', () => {
    it('should add a one-time event listener', () => {
      const element = document.createElement('button');
      const handler = vi.fn();

      once(element, 'click', handler);

      // Trigger click twice
      element.click();
      element.click();

      // Handler should only be called once
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should delay function call', () => {
      const handler = vi.fn();
      const debounced = debounce(handler, 100);

      debounced();
      expect(handler).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should only call once for rapid calls', () => {
      const handler = vi.fn();
      const debounced = debounce(handler, 100);

      debounced();
      debounced();
      debounced();

      vi.advanceTimersByTime(100);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments correctly', () => {
      const handler = vi.fn();
      const debounced = debounce(handler, 100);

      debounced('arg1', 'arg2');

      vi.advanceTimersByTime(100);
      expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should call immediately on first call', () => {
      const handler = vi.fn();
      const throttled = throttle(handler, 100);

      throttled();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should throttle subsequent calls', () => {
      const handler = vi.fn();
      const throttled = throttle(handler, 100);

      throttled();
      throttled();
      throttled();

      expect(handler).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);
      throttled();
      expect(handler).toHaveBeenCalledTimes(2);
    });

    it('should pass arguments correctly', () => {
      const handler = vi.fn();
      const throttled = throttle(handler, 100);

      throttled('arg1', 'arg2');
      expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('event namespace object', () => {
    it('should export all functions as properties', () => {
      expect(event.KeyCode).toBe(KeyCode);
      expect(event.isNumberRelatedKeys).toBe(isNumberRelatedKeys);
      expect(event.disable).toBe(disable);
      expect(event.preventDefault).toBe(preventDefault);
      expect(event.stopPropagation).toBe(stopPropagation);
      expect(event.windowScrollLock).toBe(windowScrollLock);
      expect(event.getMaxDuration).toBe(getMaxDuration);
      expect(event.whichAnimationEvent).toBe(whichAnimationEvent);
      expect(event.whichTransitionEvent).toBe(whichTransitionEvent);
      expect(event.once).toBe(once);
      expect(event.debounce).toBe(debounce);
      expect(event.throttle).toBe(throttle);
    });
  });
});

