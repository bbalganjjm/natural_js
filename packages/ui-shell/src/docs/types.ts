/**
 * Types for the Docs component.
 */

import { NaturalElement } from '@natural-js/shared';

/**
 * Document (tab) state.
 */
export interface DocState {
  /** Document ID */
  id: string;
  /** Document name/title */
  name: string;
  /** URL for content loading */
  url?: string;
  /** Whether the doc is active */
  active: boolean;
  /** Whether the doc is stateful (keeps state when switching) */
  stateful: boolean;
  /** Tab element reference */
  tabElement?: NaturalElement;
  /** Content element reference */
  contentElement?: NaturalElement;
  /** Controller instance for this doc */
  controller?: unknown;
  /** Custom data */
  data?: Record<string, unknown>;
}

/**
 * Options for adding a document.
 */
export interface DocAddOptions {
  /** URL for content loading */
  url?: string;
  /** Whether to keep state when switching */
  stateful?: boolean;
  /** Whether to activate immediately */
  active?: boolean;
  /** Custom data */
  data?: Record<string, unknown>;
  /** Callback when content is loaded */
  onLoad?: (doc: DocState) => void;
}

/**
 * Options for the Docs component.
 */
export interface DocsOptions {
  /** Container element */
  context: NaturalElement;
  /** Tab container element */
  tabContext: NaturalElement | null;
  /** Content container element */
  contentContext: NaturalElement | null;
  /** Maximum number of tabs */
  maxTabs: number;
  /** Maximum number of stateful tabs */
  maxStateful: number;
  /** Whether to enable tab scrolling */
  tabScroll: boolean;
  /** Whether to show close button on tabs */
  showClose: boolean;
  /** Whether to show tab list dropdown */
  showTabList: boolean;
  /** Callback before activating */
  onBeforeActive?: (doc: DocState) => boolean | void;
  /** Callback when activated */
  onActive?: (doc: DocState) => void;
  /** Callback when removed */
  onRemove?: (doc: DocState) => void;
  /** Callback when content is loaded */
  onLoad?: (doc: DocState) => void;
  /** Internal: document states */
  docs?: DocState[];
  /** Internal: currently active doc ID */
  activeId?: string | null;
}

/**
 * User-provided options for Docs.
 */
export type DocsUserOptions = Partial<Omit<DocsOptions, 'context' | 'tabContext' | 'contentContext' | 'docs' | 'activeId'>>;

