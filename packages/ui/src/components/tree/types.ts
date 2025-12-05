/**
 * Types for the Tree component.
 */

import { NaturalElement } from '@natural-js/shared';

/**
 * Tree node data.
 */
export interface TreeNodeData {
  [key: string]: unknown;
  __expanded__?: boolean;
  __selected__?: boolean;
  __level__?: number;
  __parent__?: TreeNodeData | null;
  __children__?: TreeNodeData[];
}

/**
 * Options for the Tree component.
 */
export interface TreeOptions {
  /** Context element for the tree */
  context: NaturalElement;
  /** Data array */
  data: TreeNodeData[];
  /** Key field for node identification */
  key: string;
  /** Value field for display text */
  val: string;
  /** Parent key field for hierarchy */
  parent: string;
  /** Root parent value (null or specific value) */
  rootParent?: unknown;
  /** Whether folder nodes are selectable */
  folderSelectable?: boolean;
  /** Whether to expand all on load */
  expandAll?: boolean;
  /** CSS class for selected node */
  selectedClass?: string;
  /** CSS class for expanded folder */
  expandedClass?: string;
  /** CSS class for folder node */
  folderClass?: string;
  /** CSS class for leaf node */
  leafClass?: string;
  /** Icon for collapsed folder */
  folderIcon?: string;
  /** Icon for expanded folder */
  folderOpenIcon?: string;
  /** Icon for leaf node */
  leafIcon?: string;
  /** Callback before selecting */
  onBeforeSelect?: (node: TreeNodeData, nodeElement: NaturalElement) => boolean | void;
  /** Callback after selecting */
  onSelect?: (node: TreeNodeData, nodeElement: NaturalElement) => void;
  /** Callback when expanding */
  onExpand?: (node: TreeNodeData, nodeElement: NaturalElement) => void;
  /** Callback when collapsing */
  onCollapse?: (node: TreeNodeData, nodeElement: NaturalElement) => void;
  /** Internal: hierarchical data */
  hierarchyData?: TreeNodeData[];
  /** Internal: node elements map */
  nodeElements?: Map<unknown, NaturalElement>;
  /** Internal: currently selected node */
  selectedNode?: TreeNodeData | null;
}

/**
 * User-provided options for Tree.
 */
export type TreeUserOptions = Partial<
  Omit<TreeOptions, 'context' | 'hierarchyData' | 'nodeElements' | 'selectedNode'>
>;

