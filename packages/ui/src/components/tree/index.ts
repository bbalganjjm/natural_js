/**
 * Tree component for Natural-JS.
 * Provides hierarchical data display with expand/collapse functionality.
 */

import { NaturalElement, isBrowser, getDocument } from '@natural-js/shared';
import { isString } from '@natural-js/core';
import { TreeOptions, TreeUserOptions, TreeNodeData } from './types';

export * from './types';

const DEFAULT_OPTIONS: Partial<TreeOptions> = {
  data: [],
  key: 'id',
  val: 'name',
  parent: 'parentId',
  rootParent: null,
  folderSelectable: true,
  expandAll: false,
  selectedClass: 'tree_selected__',
  expandedClass: 'tree_expanded__',
  folderClass: 'tree_folder__',
  leafClass: 'tree_leaf__',
  folderIcon: '📁',
  folderOpenIcon: '📂',
  leafIcon: '📄',
};

/**
 * Tree component for hierarchical data display.
 */
export class Tree {
  public options: TreeOptions;

  constructor(context: NaturalElement | Element | string, opts?: TreeUserOptions) {
    if (!isBrowser()) {
      this.options = {} as TreeOptions;
      return;
    }

    let contextEl: NaturalElement;
    if (context instanceof NaturalElement) {
      contextEl = context;
    } else if (isString(context)) {
      contextEl = new NaturalElement(context);
    } else {
      contextEl = new NaturalElement(context);
    }

    this.options = {
      ...DEFAULT_OPTIONS,
      ...opts,
      context: contextEl,
      hierarchyData: [],
      nodeElements: new Map(),
      selectedNode: null,
    } as TreeOptions;

    // Add class
    contextEl.addClass('tree__');

    // Initial bind if data provided
    if (opts?.data && opts.data.length > 0) {
      this.bind(opts.data);
    }

    // Store reference
    contextEl.data('tree', this);
  }

  /**
   * Returns the context element.
   */
  context(selector?: string): NaturalElement {
    return selector ? this.options.context.find(selector) : this.options.context;
  }

  /**
   * Build hierarchy from flat data.
   */
  private buildHierarchy(data: TreeNodeData[]): TreeNodeData[] {
    const opts = this.options;
    const map = new Map<unknown, TreeNodeData>();
    const roots: TreeNodeData[] = [];

    // First pass: create map
    for (const item of data) {
      const node: TreeNodeData = {
        ...item,
        __children__: [],
        __expanded__: opts.expandAll ?? false,
        __selected__: false,
        __level__: 0,
        __parent__: null,
      };
      map.set(item[opts.key], node);
    }

    // Second pass: build hierarchy
    for (const item of data) {
      const node = map.get(item[opts.key]);
      if (!node) continue;

      const parentKey = item[opts.parent];
      
      if (parentKey === opts.rootParent || parentKey === undefined || parentKey === null) {
        roots.push(node);
      } else {
        const parent = map.get(parentKey);
        if (parent) {
          node.__parent__ = parent;
          node.__level__ = (parent.__level__ ?? 0) + 1;
          parent.__children__?.push(node);
        } else {
          roots.push(node);
        }
      }
    }

    return roots;
  }

  /**
   * Bind data to the tree.
   */
  bind(data?: TreeNodeData[]): this {
    const opts = this.options;
    const doc = getDocument();
    if (!doc) return this;

    if (data !== undefined) {
      opts.data = data;
    }

    // Build hierarchy
    opts.hierarchyData = this.buildHierarchy(opts.data);
    opts.nodeElements = new Map();

    // Clear and render
    opts.context.empty();
    this.renderNodes(opts.hierarchyData, opts.context);

    return this;
  }

  /**
   * Render tree nodes recursively.
   */
  private renderNodes(nodes: TreeNodeData[], container: NaturalElement): void {
    const opts = this.options;
    const doc = getDocument();
    if (!doc) return;

    const ul = doc.createElement('ul');
    ul.className = 'tree_list__';

    for (const node of nodes) {
      const li = this.renderNode(node);
      ul.appendChild(li);
    }

    container.append(ul);
  }

  /**
   * Render a single tree node.
   */
  private renderNode(node: TreeNodeData): HTMLLIElement {
    const opts = this.options;
    const doc = getDocument()!;
    
    const li = doc.createElement('li');
    li.className = 'tree_node__';
    li.dataset['key'] = String(node[opts.key]);

    const isFolder = node.__children__ && node.__children__.length > 0;
    const level = node.__level__ ?? 0;

    // Node content
    const content = doc.createElement('div');
    content.className = 'tree_node_content__';
    content.style.paddingLeft = `${level * 20}px`;

    // Toggle icon (for folders)
    if (isFolder) {
      li.classList.add(opts.folderClass || 'tree_folder__');
      
      const toggle = doc.createElement('span');
      toggle.className = 'tree_toggle__';
      toggle.textContent = node.__expanded__ ? '▼' : '▶';
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle(node[opts.key]);
      });
      content.appendChild(toggle);
    } else {
      li.classList.add(opts.leafClass || 'tree_leaf__');
      
      const spacer = doc.createElement('span');
      spacer.className = 'tree_spacer__';
      spacer.textContent = ' ';
      content.appendChild(spacer);
    }

    // Icon
    const icon = doc.createElement('span');
    icon.className = 'tree_icon__';
    if (isFolder) {
      icon.textContent = node.__expanded__ ? (opts.folderOpenIcon || '📂') : (opts.folderIcon || '📁');
    } else {
      icon.textContent = opts.leafIcon || '📄';
    }
    content.appendChild(icon);

    // Label
    const label = doc.createElement('span');
    label.className = 'tree_label__';
    label.textContent = String(node[opts.val] ?? '');
    content.appendChild(label);

    // Click handler for selection
    content.addEventListener('click', () => {
      if (isFolder && !opts.folderSelectable) {
        this.toggle(node[opts.key]);
      } else {
        this.select(node[opts.key]);
      }
    });

    li.appendChild(content);

    // Store element reference
    opts.nodeElements?.set(node[opts.key], new NaturalElement(li));

    // Render children if expanded
    if (isFolder && node.__children__ && node.__children__.length > 0) {
      const childContainer = doc.createElement('div');
      childContainer.className = 'tree_children__';
      if (!node.__expanded__) {
        childContainer.style.display = 'none';
      }
      
      this.renderNodes(node.__children__, new NaturalElement(childContainer));
      li.appendChild(childContainer);
    }

    // Apply expanded class
    if (isFolder && node.__expanded__) {
      li.classList.add(opts.expandedClass || 'tree_expanded__');
    }

    return li;
  }

  /**
   * Find node by key.
   */
  private findNode(key: unknown, nodes?: TreeNodeData[]): TreeNodeData | null {
    const opts = this.options;
    const searchNodes = nodes ?? opts.hierarchyData ?? [];

    for (const node of searchNodes) {
      if (node[opts.key] === key) {
        return node;
      }
      if (node.__children__ && node.__children__.length > 0) {
        const found = this.findNode(key, node.__children__);
        if (found) return found;
      }
    }

    return null;
  }

  /**
   * Select a node by key.
   */
  select(key: unknown): this {
    const opts = this.options;
    const node = this.findNode(key);
    const nodeEl = opts.nodeElements?.get(key);

    if (!node || !nodeEl) return this;

    // Call onBeforeSelect
    if (opts.onBeforeSelect) {
      const result = opts.onBeforeSelect(node, nodeEl);
      if (result === false) return this;
    }

    // Deselect previous
    if (opts.selectedNode) {
      const prevKey = opts.selectedNode[opts.key];
      const prevEl = opts.nodeElements?.get(prevKey);
      if (prevEl) {
        prevEl.removeClass(opts.selectedClass || 'tree_selected__');
      }
      opts.selectedNode.__selected__ = false;
    }

    // Select new
    node.__selected__ = true;
    opts.selectedNode = node;
    nodeEl.addClass(opts.selectedClass || 'tree_selected__');

    // Call onSelect
    if (opts.onSelect) {
      opts.onSelect(node, nodeEl);
    }

    return this;
  }

  /**
   * Toggle node expand/collapse.
   */
  toggle(key: unknown): this {
    const node = this.findNode(key);
    if (!node) return this;

    if (node.__expanded__) {
      this.collapse(key);
    } else {
      this.expand(key);
    }

    return this;
  }

  /**
   * Expand a node.
   */
  expand(key: unknown): this {
    const opts = this.options;
    const node = this.findNode(key);
    const nodeEl = opts.nodeElements?.get(key);

    if (!node || !nodeEl || !node.__children__ || node.__children__.length === 0) {
      return this;
    }

    node.__expanded__ = true;
    nodeEl.addClass(opts.expandedClass || 'tree_expanded__');
    
    // Update toggle icon
    const toggle = nodeEl.find('.tree_toggle__');
    toggle.text('▼');
    
    // Update folder icon
    const icon = nodeEl.find('.tree_icon__');
    icon.text(opts.folderOpenIcon || '📂');

    // Show children
    const children = nodeEl.find('.tree_children__').first();
    children.css('display', '');

    if (opts.onExpand) {
      opts.onExpand(node, nodeEl);
    }

    return this;
  }

  /**
   * Collapse a node.
   */
  collapse(key: unknown): this {
    const opts = this.options;
    const node = this.findNode(key);
    const nodeEl = opts.nodeElements?.get(key);

    if (!node || !nodeEl) return this;

    node.__expanded__ = false;
    nodeEl.removeClass(opts.expandedClass || 'tree_expanded__');
    
    // Update toggle icon
    const toggle = nodeEl.find('.tree_toggle__');
    toggle.text('▶');
    
    // Update folder icon
    const icon = nodeEl.find('.tree_icon__');
    icon.text(opts.folderIcon || '📁');

    // Hide children
    const children = nodeEl.find('.tree_children__').first();
    children.css('display', 'none');

    if (opts.onCollapse) {
      opts.onCollapse(node, nodeEl);
    }

    return this;
  }

  /**
   * Expand all nodes.
   */
  expandAll(): this {
    const opts = this.options;
    
    const expandRecursive = (nodes: TreeNodeData[]) => {
      for (const node of nodes) {
        if (node.__children__ && node.__children__.length > 0) {
          this.expand(node[opts.key]);
          expandRecursive(node.__children__);
        }
      }
    };

    expandRecursive(opts.hierarchyData ?? []);
    return this;
  }

  /**
   * Collapse all nodes.
   */
  collapseAll(): this {
    const opts = this.options;
    
    const collapseRecursive = (nodes: TreeNodeData[]) => {
      for (const node of nodes) {
        if (node.__children__ && node.__children__.length > 0) {
          this.collapse(node[opts.key]);
          collapseRecursive(node.__children__);
        }
      }
    };

    collapseRecursive(opts.hierarchyData ?? []);
    return this;
  }

  /**
   * Get the data.
   */
  data(): TreeNodeData[] {
    return this.options.data;
  }

  /**
   * Get hierarchy data.
   */
  hierarchyData(): TreeNodeData[] {
    return this.options.hierarchyData ?? [];
  }

  /**
   * Get selected node.
   */
  selected(): TreeNodeData | null {
    return this.options.selectedNode ?? null;
  }

  /**
   * Destroy the tree instance.
   */
  destroy(): void {
    const opts = this.options;
    opts.context.empty();
    opts.context.removeClass('tree__');
    opts.context.removeData('tree');
    opts.nodeElements?.clear();
    opts.selectedNode = null;
  }
}

/**
 * Factory function to create a Tree instance.
 */
export function createTree(
  context: NaturalElement | Element | string,
  opts?: TreeUserOptions
): Tree {
  return new Tree(context, opts);
}

