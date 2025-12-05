/**
 * Type definitions for UI utilities.
 */

import { NaturalElement } from '@natural-js/shared';

/**
 * Options for draggable elements.
 */
export interface DraggableOptions {
  /** The handle element for dragging (if not provided, entire element is draggable) */
  handle?: string | Element | NaturalElement;
  /** Whether to correct overflow when dragging outside viewport */
  overflowCorrection?: boolean;
  /** Additional values for overflow correction */
  overflowCorrectionAddValues?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  /** Callback when drag starts */
  onDragStart?: (event: MouseEvent | TouchEvent, element: NaturalElement) => void;
  /** Callback during drag */
  onDrag?: (event: MouseEvent | TouchEvent, element: NaturalElement) => void;
  /** Callback when drag ends */
  onDragEnd?: (event: MouseEvent | TouchEvent, element: NaturalElement) => void;
  /** Opacity during drag (0-1) */
  dragOpacity?: number;
  /** Axis constraint: 'x', 'y', or 'both' */
  axis?: 'x' | 'y' | 'both';
  /** Containment selector or element */
  containment?: string | Element | NaturalElement | 'window' | 'document' | 'parent';
}

/**
 * State for draggable functionality.
 */
export interface DraggableState {
  pressed: boolean;
  moved: boolean;
  startX: number;
  startY: number;
  initialMargin: string;
}

/**
 * Options for scroll paging.
 */
export interface ScrollPagingOptions {
  /** Scroll container element */
  container: Element | NaturalElement;
  /** Size of each page (number of items) */
  size: number;
  /** Current index */
  idx: number;
  /** Current limit */
  limit: number;
  /** Callback when reaching end of scroll */
  onScrollEnd?: () => void;
  /** Threshold distance from bottom to trigger load */
  threshold?: number;
}

/**
 * Options for iteration rendering.
 */
export interface IterationRenderOptions {
  /** Data to render */
  data: Record<string, unknown>[];
  /** Context element */
  context: NaturalElement;
  /** Template element to clone */
  template: NaturalElement;
  /** Row handler before bind */
  onBeforeBind?: (index: number, element: NaturalElement, data: Record<string, unknown>) => void;
  /** Row handler after bind */
  onBind?: (index: number, element: NaturalElement, data: Record<string, unknown>) => void;
  /** Delay between row creation (ms) */
  createDelay?: number;
  /** Enable HTML rendering */
  html?: boolean;
  /** Enable validation */
  validate?: boolean;
  /** Enable revert */
  revert?: boolean;
  /** Enable caching */
  cache?: boolean;
}

/**
 * Iteration state.
 */
export interface IterationState {
  isBinding: boolean;
  bindQueue: (() => void)[];
}

/**
 * Position information.
 */
export interface Position {
  top: number;
  left: number;
}

/**
 * Dimensions.
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Viewport information.
 */
export interface ViewportInfo {
  width: number;
  height: number;
  scrollTop: number;
  scrollLeft: number;
}

