/**
 * Type definitions for the Alert component.
 */

import { NaturalElement } from '@natural-js/shared';

/**
 * Alert options interface.
 */
export interface AlertOptions {
  /** The target element (context) */
  context: NaturalElement;
  /** Container element for the alert */
  container: NaturalElement | null;
  /** Message overlay element */
  msgContext: NaturalElement;
  /** Message content box element */
  msgContents: NaturalElement | null;
  /** Message content */
  msg: string | string[];
  /** Variables to replace in message */
  vars?: string[];
  /** Whether to render message as HTML */
  html: boolean;
  /** Top position */
  top?: number;
  /** Left position */
  left?: number;
  /** Width of message box */
  width: number | ((msgContext: NaturalElement, msgContents: NaturalElement) => number);
  /** Height of message box */
  height: number | ((msgContext: NaturalElement, msgContents: NaturalElement) => number);
  /** Whether the target is an input element */
  isInput: boolean;
  /** Whether the target is window or body */
  isWindow: boolean;
  /** Title of the alert */
  title?: string;
  /** Whether to show buttons */
  button: boolean;
  /** OK button options */
  okButtonOpts?: Record<string, unknown>;
  /** Cancel button options */
  cancelButtonOpts?: Record<string, unknown>;
  /** Close mode: 'remove' removes element, 'hide' hides element */
  closeMode: 'remove' | 'hide';
  /** Whether to show modal overlay */
  modal: boolean;
  /** OK button callback */
  onOk: AlertCallback | null;
  /** Cancel button callback */
  onCancel: AlertCallback | null;
  /** Before show callback */
  onBeforeShow: AlertCallback | null;
  /** After show callback */
  onShow: AlertCallback | null;
  /** Before hide callback */
  onBeforeHide: AlertCallback | null;
  /** After hide callback */
  onHide: AlertCallback | null;
  /** Before remove callback */
  onBeforeRemove: AlertCallback | null;
  /** After remove callback */
  onRemove: AlertCallback | null;
  /** Overlay background color */
  overlayColor: string | null;
  /** Whether clicking overlay closes alert */
  overlayClose: boolean;
  /** Whether ESC key closes alert */
  escClose: boolean;
  /** Whether this is a confirm dialog */
  confirm: boolean;
  /** Whether to always be on top */
  alwaysOnTop: boolean;
  /** CSS selector for calculating max z-index */
  alwaysOnTopCalcTarget: string;
  /** Whether to dynamically update position */
  dynPos: boolean;
  /** Whether to lock window scroll */
  windowScrollLock: boolean;
  /** Whether the dialog is draggable */
  draggable: boolean;
  /** Whether to correct overflow when dragging */
  draggableOverflowCorrection: boolean;
  /** Additional values for overflow correction */
  draggableOverflowCorrectionAddValues: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  /** Whether to save memory by clearing message after render */
  saveMemory: boolean;
  /** Input-specific options */
  input?: {
    displayTimeout: number;
    closeBtn: string;
  };
  /** Localized messages */
  message?: LocalizedAlertMessages;
  /** Internal: timer ID for dynamic positioning */
  time?: ReturnType<typeof setInterval>;
  /** Internal: timer ID for input display timeout */
  iTime?: ReturnType<typeof setTimeout>;
  /** Internal: resize handler reference */
  resizeHandler?: () => void;
  /** Internal: keyup handler reference */
  keyupHandler?: (e: KeyboardEvent) => void;
}

/**
 * Alert callback function type.
 */
export type AlertCallback = (
  msgContext: NaturalElement,
  msgContents: NaturalElement | null
) => number | void;

/**
 * Localized alert messages.
 */
export interface LocalizedAlertMessages {
  [locale: string]: AlertMessages;
}

/**
 * Alert messages.
 */
export interface AlertMessages {
  confirm?: string;
  cancel?: string;
  close?: string;
}

/**
 * Partial alert options for user configuration.
 */
export type AlertUserOptions = Partial<Omit<AlertOptions, 'context' | 'msgContext' | 'msgContents' | 'isInput' | 'isWindow'>>;

/**
 * Alert constructor parameter - can be message string, array, or options.
 */
export type AlertConstructorParam = string | string[] | AlertUserOptions;

