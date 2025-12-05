/**
 * Tests for Docs component.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Docs, createDocs } from './index';
import { NaturalElement } from '@natural-js/shared';

describe('Docs', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = '<div id="test-docs"></div>';
    document.body.appendChild(container);
  });

  afterEach(() => {
    const docs = document.querySelectorAll('.docs__');
    docs.forEach((el) => {
      const docsData = new NaturalElement(el).data('docs');
      if (docsData && typeof docsData.destroy === 'function') {
        docsData.destroy();
      }
    });
    document.body.removeChild(container);
  });

  describe('constructor', () => {
    it('should create Docs instance with string selector', () => {
      const docs = new Docs('#test-docs');
      expect(docs).toBeInstanceOf(Docs);
      docs.destroy();
    });

    it('should create Docs instance with NaturalElement', () => {
      const docs = new Docs(new NaturalElement('#test-docs'));
      expect(docs).toBeInstanceOf(Docs);
      docs.destroy();
    });

    it('should add docs__ class', () => {
      const docs = new Docs('#test-docs');
      expect(docs.context().hasClass('docs__')).toBe(true);
      docs.destroy();
    });

    it('should create tab container', () => {
      const docs = new Docs('#test-docs');
      const tabs = docs.context().find('.docs_tabs__');
      expect(tabs.length).toBe(1);
      docs.destroy();
    });

    it('should create content container', () => {
      const docs = new Docs('#test-docs');
      const content = docs.context().find('.docs_content__');
      expect(content.length).toBe(1);
      docs.destroy();
    });
  });

  describe('add()', () => {
    it('should add a document', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      
      expect(docs.count()).toBe(1);
      docs.destroy();
    });

    it('should create tab element', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      
      const tabs = docs.context().find('.docs_tab__');
      expect(tabs.length).toBe(1);
      docs.destroy();
    });

    it('should create content panel', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      
      const panels = docs.context().find('.docs_panel__');
      expect(panels.length).toBe(1);
      docs.destroy();
    });

    it('should activate first document automatically', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      
      expect(docs.activeDoc()?.id).toBe('doc1');
      docs.destroy();
    });

    it('should not duplicate existing document', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      docs.add('doc1', 'Document 1 Again');
      
      expect(docs.count()).toBe(1);
      docs.destroy();
    });

    it('should respect maxTabs', () => {
      const docs = new Docs('#test-docs', { maxTabs: 3 });
      docs.add('doc1', 'Doc 1');
      docs.add('doc2', 'Doc 2');
      docs.add('doc3', 'Doc 3');
      docs.add('doc4', 'Doc 4');
      
      expect(docs.count()).toBe(3);
      docs.destroy();
    });

    it('should show close button when showClose is true', () => {
      const docs = new Docs('#test-docs', { showClose: true });
      docs.add('doc1', 'Document 1');
      
      const closeBtn = docs.context().find('.docs_tab_close__');
      expect(closeBtn.length).toBe(1);
      docs.destroy();
    });

    it('should return this for chaining', () => {
      const docs = new Docs('#test-docs');
      expect(docs.add('doc1', 'Document 1')).toBe(docs);
      docs.destroy();
    });
  });

  describe('active()', () => {
    it('should activate a document', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      docs.add('doc2', 'Document 2');
      docs.active('doc1');
      
      expect(docs.activeDoc()?.id).toBe('doc1');
      docs.destroy();
    });

    it('should add active class to tab', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      docs.add('doc2', 'Document 2');
      docs.active('doc1');
      
      const activeTab = docs.context().find('.docs_tab_active__');
      expect(activeTab.length).toBe(1);
      expect(activeTab.data('id')).toBe('doc1');
      docs.destroy();
    });

    it('should show content panel', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      docs.add('doc2', 'Document 2');
      docs.active('doc2');
      
      const panel = docs.context().find('.docs_panel__[data-id="doc2"]');
      expect(panel.css('display')).not.toBe('none');
      docs.destroy();
    });

    it('should call onBeforeActive callback', () => {
      const onBeforeActive = vi.fn();
      const docs = new Docs('#test-docs', { onBeforeActive });
      docs.add('doc1', 'Document 1');
      docs.add('doc2', 'Document 2');
      docs.active('doc1');
      
      expect(onBeforeActive).toHaveBeenCalled();
      docs.destroy();
    });

    it('should not activate if onBeforeActive returns false', () => {
      // Only block activation of doc1
      const onBeforeActive = vi.fn((doc) => doc.id !== 'doc1');
      const docs = new Docs('#test-docs', { onBeforeActive });
      docs.add('doc2', 'Document 2'); // This will be activated first
      docs.add('doc1', 'Document 1'); // This will try to activate but callback returns false
      
      expect(docs.activeDoc()?.id).toBe('doc2');
      docs.destroy();
    });

    it('should call onActive callback', () => {
      const onActive = vi.fn();
      const docs = new Docs('#test-docs', { onActive });
      docs.add('doc1', 'Document 1');
      docs.add('doc2', 'Document 2');
      docs.active('doc1');
      
      expect(onActive).toHaveBeenCalled();
      docs.destroy();
    });

    it('should return this for chaining', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      expect(docs.active('doc1')).toBe(docs);
      docs.destroy();
    });
  });

  describe('remove()', () => {
    it('should remove a document', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      docs.remove('doc1');
      
      expect(docs.count()).toBe(0);
      docs.destroy();
    });

    it('should remove tab element', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      docs.remove('doc1');
      
      const tabs = docs.context().find('.docs_tab__');
      expect(tabs.length).toBe(0);
      docs.destroy();
    });

    it('should remove content panel', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      docs.remove('doc1');
      
      const panels = docs.context().find('.docs_panel__');
      expect(panels.length).toBe(0);
      docs.destroy();
    });

    it('should activate next document when active is removed', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      docs.add('doc2', 'Document 2');
      docs.active('doc1');
      docs.remove('doc1');
      
      expect(docs.activeDoc()?.id).toBe('doc2');
      docs.destroy();
    });

    it('should call onRemove callback', () => {
      const onRemove = vi.fn();
      const docs = new Docs('#test-docs', { onRemove });
      docs.add('doc1', 'Document 1');
      docs.remove('doc1');
      
      expect(onRemove).toHaveBeenCalled();
      docs.destroy();
    });

    it('should return this for chaining', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      expect(docs.remove('doc1')).toBe(docs);
      docs.destroy();
    });
  });

  describe('removeState()', () => {
    it('should remove stateful flag from document', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1', { stateful: true });
      docs.removeState('doc1');
      
      expect(docs.doc('doc1')?.stateful).toBe(false);
      docs.destroy();
    });

    it('should return this for chaining', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1', { stateful: true });
      expect(docs.removeState('doc1')).toBe(docs);
      docs.destroy();
    });
  });

  describe('doc()', () => {
    it('should return document state by ID', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      
      const docState = docs.doc('doc1');
      expect(docState?.id).toBe('doc1');
      expect(docState?.name).toBe('Document 1');
      docs.destroy();
    });

    it('should return undefined for non-existent ID', () => {
      const docs = new Docs('#test-docs');
      expect(docs.doc('nonexistent')).toBeUndefined();
      docs.destroy();
    });
  });

  describe('cont() / setCont()', () => {
    it('should set and get controller', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      
      const controller = { init: () => {} };
      docs.setCont('doc1', controller);
      
      expect(docs.cont('doc1')).toBe(controller);
      docs.destroy();
    });

    it('should return undefined for document without controller', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      
      expect(docs.cont('doc1')).toBeUndefined();
      docs.destroy();
    });
  });

  describe('list()', () => {
    it('should return all documents', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      docs.add('doc2', 'Document 2');
      
      const list = docs.list();
      expect(list.length).toBe(2);
      docs.destroy();
    });
  });

  describe('activeDoc()', () => {
    it('should return active document', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      docs.add('doc2', 'Document 2');
      docs.active('doc2');
      
      expect(docs.activeDoc()?.id).toBe('doc2');
      docs.destroy();
    });

    it('should return undefined when no active document', () => {
      const docs = new Docs('#test-docs');
      expect(docs.activeDoc()).toBeUndefined();
      docs.destroy();
    });
  });

  describe('count()', () => {
    it('should return document count', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      docs.add('doc2', 'Document 2');
      
      expect(docs.count()).toBe(2);
      docs.destroy();
    });
  });

  describe('clear()', () => {
    it('should remove all documents', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      docs.add('doc2', 'Document 2');
      docs.clear();
      
      expect(docs.count()).toBe(0);
      docs.destroy();
    });

    it('should return this for chaining', () => {
      const docs = new Docs('#test-docs');
      expect(docs.clear()).toBe(docs);
      docs.destroy();
    });
  });

  describe('context()', () => {
    it('should return context element', () => {
      const docs = new Docs('#test-docs');
      expect(docs.context().get(0)?.id).toBe('test-docs');
      docs.destroy();
    });

    it('should find within context with selector', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      
      expect(docs.context('.docs_tab__').length).toBe(1);
      docs.destroy();
    });
  });

  describe('destroy()', () => {
    it('should remove docs__ class', () => {
      const docs = new Docs('#test-docs');
      docs.destroy();
      
      const el = new NaturalElement('#test-docs');
      expect(el.hasClass('docs__')).toBe(false);
    });

    it('should clear all documents', () => {
      const docs = new Docs('#test-docs');
      docs.add('doc1', 'Document 1');
      docs.destroy();
      
      expect(docs.count()).toBe(0);
    });
  });
});

describe('createDocs', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = '<div id="create-docs"></div>';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should create Docs instance', () => {
    const docs = createDocs('#create-docs');
    expect(docs).toBeInstanceOf(Docs);
    docs.destroy();
  });
});

