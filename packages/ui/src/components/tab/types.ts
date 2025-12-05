/**
 * Types for the Tab component.
 */

import { NaturalElement } from '@natural-js/shared';

/**
 * Tab status information.
 */
export interface TabStatusInfo {
  /** Index of the active tab */
  index: number;
  /** Active tab navigation element */
  tab: NaturalElement;
  /** Active tab content element */
  content: NaturalElement;
  /** Controller object of the active tab (if any) */
  cont?: unknown;
}

/**
 * Options for the Tab component.
 */
export interface TabOptions {
  /** Context element containing the tabs */
  context: NaturalElement;
  /** Tab link elements wrapper */
  tabLinks: NaturalElement;
  /** Tab content panels wrapper */
  tabContents: NaturalElement;
  /** Default active tab index */
  active?: number;
  /** Whether to preload all tab contents */
  preload?: boolean;
  /** Whether to enable keyboard navigation */
  keyboard?: boolean;
  /** Animation effect for tab transitions */
  effect?: 'fade' | 'slide' | 'none';
  /** Animation duration in ms */
  effectDuration?: number;
  /** Whether to enable scroll if tabs overflow */
  tabScroll?: boolean;
  /** URLs to load for each tab (index-matched) */
  url?: string[];
  /** Callback before tab opens */
  onBeforeOpen?: (index: number, tab: NaturalElement, content: NaturalElement, onOpenData: unknown) => boolean | void;
  /** Callback after tab opens */
  onOpen?: (index: number, tab: NaturalElement, content: NaturalElement, onOpenData: unknown) => void;
  /** Callback after content is loaded */
  onLoad?: (index: number, tab: NaturalElement, content: NaturalElement) => void;
  /** CSS class for active tab */
  activeClass?: string;
  /** CSS class for disabled tab */
  disabledClass?: string;
  /** Selector for tab link elements */
  tabLinkSelector?: string;
  /** Selector for tab content elements */
  tabContentSelector?: string;
  /** Internal: controllers for each tab */
  controllers?: Map<number, unknown>;
}

/**
 * User-provided options for Tab.
 */
export type TabUserOptions = Partial<
  Omit<TabOptions, 'context' | 'tabLinks' | 'tabContents' | 'controllers'>
>;

