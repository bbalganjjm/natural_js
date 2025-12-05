/**
 * Tests for Tree component.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Tree, createTree, TreeNodeData } from './index';
import { NaturalElement } from '@natural-js/shared';

describe('Tree', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = '<div id="test-tree"></div>';
    document.body.appendChild(container);
  });

  afterEach(() => {
    const trees = document.querySelectorAll('.tree__');
    trees.forEach((el) => {
      const treeData = new NaturalElement(el).data('tree');
      if (treeData && typeof treeData.destroy === 'function') {
        treeData.destroy();
      }
    });
    document.body.removeChild(container);
  });

  const createSampleData = (): TreeNodeData[] => [
    { id: 1, name: 'Root 1', parentId: null },
    { id: 2, name: 'Child 1-1', parentId: 1 },
    { id: 3, name: 'Child 1-2', parentId: 1 },
    { id: 4, name: 'Grandchild 1-1-1', parentId: 2 },
    { id: 5, name: 'Root 2', parentId: null },
    { id: 6, name: 'Child 2-1', parentId: 5 },
  ];

  describe('constructor', () => {
    it('should create Tree instance with string selector', () => {
      const tree = new Tree('#test-tree');
      expect(tree).toBeInstanceOf(Tree);
      tree.destroy();
    });

    it('should create Tree instance with NaturalElement', () => {
      const tree = new Tree(new NaturalElement('#test-tree'));
      expect(tree).toBeInstanceOf(Tree);
      tree.destroy();
    });

    it('should add tree__ class', () => {
      const tree = new Tree('#test-tree');
      expect(tree.context().hasClass('tree__')).toBe(true);
      tree.destroy();
    });

    it('should bind initial data if provided', () => {
      const tree = new Tree('#test-tree', { data: createSampleData() });
      expect(tree.data().length).toBe(6);
      tree.destroy();
    });
  });

  describe('bind()', () => {
    it('should bind data to tree', () => {
      const tree = new Tree('#test-tree');
      tree.bind(createSampleData());
      
      expect(tree.data().length).toBe(6);
      tree.destroy();
    });

    it('should build hierarchy correctly', () => {
      const tree = new Tree('#test-tree');
      tree.bind(createSampleData());
      
      const hierarchy = tree.hierarchyData();
      expect(hierarchy.length).toBe(2); // 2 root nodes
      expect(hierarchy[0]?.__children__?.length).toBe(2); // Root 1 has 2 children
      tree.destroy();
    });

    it('should render tree nodes', () => {
      const tree = new Tree('#test-tree');
      tree.bind(createSampleData());
      
      const nodes = tree.context().find('.tree_node__');
      expect(nodes.length).toBeGreaterThan(0);
      tree.destroy();
    });

    it('should return this for chaining', () => {
      const tree = new Tree('#test-tree');
      expect(tree.bind(createSampleData())).toBe(tree);
      tree.destroy();
    });
  });

  describe('select()', () => {
    it('should select a node', () => {
      const tree = new Tree('#test-tree', { data: createSampleData() });
      tree.select(2);
      
      const selected = tree.selected();
      expect(selected?.id).toBe(2);
      tree.destroy();
    });

    it('should add selected class to node', () => {
      const tree = new Tree('#test-tree', { data: createSampleData() });
      tree.select(1);
      
      const selectedNodes = tree.context().find('.tree_selected__');
      expect(selectedNodes.length).toBe(1);
      tree.destroy();
    });

    it('should deselect previous node', () => {
      const tree = new Tree('#test-tree', { data: createSampleData() });
      tree.select(1);
      tree.select(2);
      
      const selectedNodes = tree.context().find('.tree_selected__');
      expect(selectedNodes.length).toBe(1);
      tree.destroy();
    });

    it('should call onBeforeSelect callback', () => {
      const onBeforeSelect = vi.fn();
      const tree = new Tree('#test-tree', { data: createSampleData(), onBeforeSelect });
      tree.select(1);
      
      expect(onBeforeSelect).toHaveBeenCalled();
      tree.destroy();
    });

    it('should not select if onBeforeSelect returns false', () => {
      const onBeforeSelect = vi.fn(() => false);
      const tree = new Tree('#test-tree', { data: createSampleData(), onBeforeSelect });
      tree.select(1);
      
      expect(tree.selected()).toBeNull();
      tree.destroy();
    });

    it('should call onSelect callback', () => {
      const onSelect = vi.fn();
      const tree = new Tree('#test-tree', { data: createSampleData(), onSelect });
      tree.select(1);
      
      expect(onSelect).toHaveBeenCalled();
      tree.destroy();
    });

    it('should return this for chaining', () => {
      const tree = new Tree('#test-tree', { data: createSampleData() });
      expect(tree.select(1)).toBe(tree);
      tree.destroy();
    });
  });

  describe('expand() / collapse()', () => {
    it('should expand a folder node', () => {
      const tree = new Tree('#test-tree', { data: createSampleData() });
      tree.expand(1);
      
      const expandedNodes = tree.context().find('.tree_expanded__');
      expect(expandedNodes.length).toBeGreaterThan(0);
      tree.destroy();
    });

    it('should collapse a folder node', () => {
      const tree = new Tree('#test-tree', { data: createSampleData(), expandAll: true });
      tree.collapse(1);
      
      // Find the specific node for Root 1
      const node1 = tree.context().find('[data-key="1"]');
      expect(node1.hasClass('tree_expanded__')).toBe(false);
      tree.destroy();
    });

    it('should call onExpand callback', () => {
      const onExpand = vi.fn();
      const tree = new Tree('#test-tree', { data: createSampleData(), onExpand });
      tree.expand(1);
      
      expect(onExpand).toHaveBeenCalled();
      tree.destroy();
    });

    it('should call onCollapse callback', () => {
      const onCollapse = vi.fn();
      const tree = new Tree('#test-tree', { data: createSampleData(), expandAll: true, onCollapse });
      tree.collapse(1);
      
      expect(onCollapse).toHaveBeenCalled();
      tree.destroy();
    });

    it('should return this for chaining', () => {
      const tree = new Tree('#test-tree', { data: createSampleData() });
      expect(tree.expand(1)).toBe(tree);
      expect(tree.collapse(1)).toBe(tree);
      tree.destroy();
    });
  });

  describe('toggle()', () => {
    it('should toggle expand state', () => {
      const tree = new Tree('#test-tree', { data: createSampleData() });
      
      tree.toggle(1); // Expand
      let node1 = tree.context().find('[data-key="1"]');
      expect(node1.hasClass('tree_expanded__')).toBe(true);
      
      tree.toggle(1); // Collapse
      node1 = tree.context().find('[data-key="1"]');
      expect(node1.hasClass('tree_expanded__')).toBe(false);
      tree.destroy();
    });

    it('should return this for chaining', () => {
      const tree = new Tree('#test-tree', { data: createSampleData() });
      expect(tree.toggle(1)).toBe(tree);
      tree.destroy();
    });
  });

  describe('expandAll() / collapseAll()', () => {
    it('should expand all folder nodes', () => {
      const tree = new Tree('#test-tree', { data: createSampleData() });
      tree.expandAll();
      
      // All folders should be expanded
      const folderNodes = tree.context().find('.tree_folder__');
      const expandedNodes = tree.context().find('.tree_expanded__');
      expect(expandedNodes.length).toBe(folderNodes.length);
      tree.destroy();
    });

    it('should collapse all folder nodes', () => {
      const tree = new Tree('#test-tree', { data: createSampleData(), expandAll: true });
      tree.collapseAll();
      
      const expandedNodes = tree.context().find('.tree_expanded__');
      expect(expandedNodes.length).toBe(0);
      tree.destroy();
    });

    it('should return this for chaining', () => {
      const tree = new Tree('#test-tree', { data: createSampleData() });
      expect(tree.expandAll()).toBe(tree);
      expect(tree.collapseAll()).toBe(tree);
      tree.destroy();
    });
  });

  describe('data()', () => {
    it('should return original data', () => {
      const sampleData = createSampleData();
      const tree = new Tree('#test-tree', { data: sampleData });
      
      expect(tree.data()).toBe(sampleData);
      tree.destroy();
    });
  });

  describe('hierarchyData()', () => {
    it('should return hierarchical data', () => {
      const tree = new Tree('#test-tree', { data: createSampleData() });
      const hierarchy = tree.hierarchyData();
      
      expect(hierarchy.length).toBe(2); // 2 root nodes
      expect(hierarchy[0]?.name).toBe('Root 1');
      expect(hierarchy[1]?.name).toBe('Root 2');
      tree.destroy();
    });
  });

  describe('selected()', () => {
    it('should return null when nothing selected', () => {
      const tree = new Tree('#test-tree', { data: createSampleData() });
      expect(tree.selected()).toBeNull();
      tree.destroy();
    });

    it('should return selected node', () => {
      const tree = new Tree('#test-tree', { data: createSampleData() });
      tree.select(3);
      
      expect(tree.selected()?.id).toBe(3);
      tree.destroy();
    });
  });

  describe('context()', () => {
    it('should return context element', () => {
      const tree = new Tree('#test-tree');
      expect(tree.context().get(0)?.id).toBe('test-tree');
      tree.destroy();
    });

    it('should find within context with selector', () => {
      const tree = new Tree('#test-tree', { data: createSampleData() });
      expect(tree.context('.tree_list__').length).toBeGreaterThan(0);
      tree.destroy();
    });
  });

  describe('destroy()', () => {
    it('should remove tree__ class', () => {
      const tree = new Tree('#test-tree');
      tree.destroy();
      
      const el = new NaturalElement('#test-tree');
      expect(el.hasClass('tree__')).toBe(false);
    });

    it('should clear content', () => {
      const tree = new Tree('#test-tree', { data: createSampleData() });
      tree.destroy();
      
      const el = document.getElementById('test-tree');
      expect(el?.innerHTML).toBe('');
    });
  });
});

describe('createTree', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = '<div id="create-tree"></div>';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should create Tree instance', () => {
    const tree = createTree('#create-tree');
    expect(tree).toBeInstanceOf(Tree);
    tree.destroy();
  });

  it('should pass options', () => {
    const data: TreeNodeData[] = [{ id: 1, name: 'Root', parentId: null }];
    const tree = createTree('#create-tree', { data });
    expect(tree.data().length).toBe(1);
    tree.destroy();
  });
});

