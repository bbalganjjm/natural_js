/**
 * Types for the Notify component.
 */

import { NaturalElement } from '@natural-js/shared';

/**
 * Position for notifications.
 */
export type NotifyPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right';

/**
 * Notification type for styling.
 */
export type NotifyType = 'info' | 'success' | 'warning' | 'error';

/**
 * Single notification item.
 */
export interface NotifyItem {
  /** Unique ID */
  id: string;
  /** Message content */
  message: string;
  /** Notification type */
  type: NotifyType;
  /** URL to navigate when clicked */
  url?: string;
  /** Whether the notification is closing */
  closing?: boolean;
  /** DOM element reference */
  element?: NaturalElement;
}

/**
 * Options for the Notify component.
 */
export interface NotifyOptions {
  /** Container element */
  context: NaturalElement;
  /** Position of notifications */
  position: NotifyPosition;
  /** Default notification type */
  type: NotifyType;
  /** Auto-close after milliseconds (0 = never) */
  closeAfter: number;
  /** Maximum number of visible notifications */
  maxCount: number;
  /** Whether to show close button */
  showClose: boolean;
  /** Whether to pause on hover */
  pauseOnHover: boolean;
  /** Callback when notification is clicked */
  onClick?: (item: NotifyItem, e: Event) => void;
  /** Callback when notification is closed */
  onClose?: (item: NotifyItem) => void;
}

/**
 * User-provided options for Notify.
 */
export type NotifyUserOptions = Partial<Omit<NotifyOptions, 'context'>>;

