/**
 * Types for the Button component.
 */

import { NaturalElement } from '@natural-js/shared';

/**
 * Options for the Button component.
 */
export interface ButtonOptions {
  /** Context element containing buttons */
  context: NaturalElement;
  /** Custom CSS class for buttons */
  color?: string;
  /** Whether buttons are disabled by default */
  disabled?: boolean;
  /** Callback before button click */
  onBeforeClick?: (e: Event, button: NaturalElement) => boolean | void;
  /** Callback on button click */
  onClick?: (e: Event, button: NaturalElement) => void;
  /** Selector for button elements within context */
  selector?: string;
  /** Animation duration in ms */
  animationDuration?: number;
}

/**
 * User-provided options for Button (partial of ButtonOptions).
 */
export type ButtonUserOptions = Partial<Omit<ButtonOptions, 'context'>>;

