/**
 * Types for the Popup component.
 */

import { NaturalElement } from '@natural-js/shared';

/**
 * Options for the Popup component.
 */
export interface PopupOptions {
  /** Context element for the popup */
  context: NaturalElement;
  /** Container element where popup will be appended */
  container?: NaturalElement | string;
  /** Overlay element */
  msgContext: NaturalElement;
  /** Popup content element */
  msgContents: NaturalElement | null;
  /** URL to load content from */
  url?: string;
  /** HTML content to display */
  content?: string;
  /** Whether the content is HTML */
  html?: boolean;
  /** Title of the popup */
  title?: string;
  /** Fixed top position */
  top?: number;
  /** Fixed left position */
  left?: number;
  /** Width of the popup */
  width?: number | string;
  /** Height of the popup */
  height?: number | string;
  /** Whether to show modal overlay */
  modal?: boolean;
  /** Close mode: 'hide' or 'remove' */
  closeMode?: 'hide' | 'remove';
  /** Whether clicking overlay closes popup */
  overlayClose?: boolean;
  /** Background color of overlay */
  overlayColor?: string | null;
  /** Whether pressing ESC closes popup */
  escClose?: boolean;
  /** Whether popup is draggable */
  draggable?: boolean;
  /** Whether to correct overflow when dragging */
  draggableOverflowCorrection?: boolean;
  /** Additional values for draggable overflow correction */
  draggableOverflowCorrectionAddValues?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  /** Whether to show close button */
  closeButton?: boolean;
  /** Whether to preload content */
  preload?: boolean;
  /** Whether popup is always on top */
  alwaysOnTop?: boolean;
  /** Selector for elements to calculate max z-index */
  alwaysOnTopCalcTarget?: string;
  /** Whether to dynamically position popup */
  dynPos?: boolean;
  /** Whether to lock window scroll when modal is active */
  windowScrollLock?: boolean;
  /** Callback before popup opens */
  onBeforeOpen?: (onOpenData: unknown, popup: Popup) => boolean | void;
  /** Callback after popup opens */
  onOpen?: (onOpenData: unknown, popup: Popup) => void;
  /** Callback before popup closes */
  onBeforeClose?: (onCloseData: unknown, popup: Popup) => boolean | void;
  /** Callback after popup closes */
  onClose?: (onCloseData: unknown, popup: Popup) => void;
  /** Callback after content is loaded */
  onLoad?: (popup: Popup) => void;
  /** Callback before popup is removed */
  onBeforeRemove?: (popup: Popup) => void;
  /** Callback after popup is removed */
  onRemove?: (popup: Popup) => void;
  /** Localized messages */
  message?: {
    [locale: string]: {
      close?: string;
    };
  };
  /** Whether popup context is window */
  isWindow?: boolean;
  /** Internal: resize handler */
  resizeHandler?: (e: Event) => void;
  /** Internal: keyup handler */
  keyupHandler?: (e: KeyboardEvent) => void;
  /** Internal: interval timer */
  time?: ReturnType<typeof setInterval>;
}

/**
 * User-provided options for Popup.
 */
export type PopupUserOptions = Partial<
  Omit<PopupOptions, 'context' | 'msgContext' | 'msgContents'>
>;

/**
 * Forward reference for Popup class.
 */
export interface Popup {
  options: PopupOptions;
  context(selector?: string): NaturalElement;
  open(onOpenData?: unknown): Popup;
  close(onCloseData?: unknown): Popup;
  remove(): Popup;
}

