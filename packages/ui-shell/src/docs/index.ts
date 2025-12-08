/**
 * Docs component for Natural-JS.
 * Provides MDI-style document/tab management.
 */

import { NaturalElement, isBrowser, getDocument } from '@natural-js/shared';
import { isString } from '@natural-js/core';
import { DocsOptions, DocsUserOptions, DocState, DocAddOptions } from './types';

export * from './types';

const DEFAULT_OPTIONS: Partial<DocsOptions> = {
  maxTabs: 15,
  maxStateful: 5,
  tabScroll: true,
  showClose: true,
  showTabList: true,
};

/**
 * Docs component for MDI-style tab management.
 */
export class Docs {
  public options: DocsOptions;

  constructor(context: NaturalElement | Element | string, opts?: DocsUserOptions) {
    if (!isBrowser()) {
      this.options = {} as DocsOptions;
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

    // Find or create tab and content containers
    let tabContext = contextEl.find('.docs_tab_list__');
    let contentContext = contextEl.find('.docs_content_area__');

    const doc = getDocument();
    if (doc) {
      if (tabContext.length === 0) {
        const tabDiv = doc.createElement('div');
        tabDiv.className = 'docs_tab_list__';
        contextEl.prepend(tabDiv);
        tabContext = new NaturalElement(tabDiv);
      }

      if (contentContext.length === 0) {
        const contentDiv = doc.createElement('div');
        contentDiv.className = 'docs_content_area__';
        contextEl.append(contentDiv);
        contentContext = new NaturalElement(contentDiv);
      }
    }

    this.options = {
      ...DEFAULT_OPTIONS,
      ...opts,
      context: contextEl,
      tabContext: tabContext.length > 0 ? tabContext : null,
      contentContext: contentContext.length > 0 ? contentContext : null,
      docs: [],
      activeId: null,
    } as DocsOptions;

    // Add class
    contextEl.addClass('docs__');

    // Setup tab scrolling
    if (opts?.tabScroll !== false && tabContext.length > 0) {
      this.setupTabScroll();
    }

    // Store reference
    contextEl.data('docs', this);
  }

  /**
   * Setup tab scrolling functionality.
   */
  private setupTabScroll(): void {
    const opts = this.options;
    if (!opts.tabContext) return;

    opts.tabContext.css('overflow-x', 'auto');
    opts.tabContext.css('white-space', 'nowrap');
    opts.tabContext.css('scrollbar-width', 'none');
    opts.tabContext.addClass('docs_tabs_scrollable__');
  }

  /**
   * Returns the context element.
   */
  context(selector?: string): NaturalElement {
    return selector ? this.options.context.find(selector) : this.options.context;
  }

  /**
   * Add a new document/tab.
   */
  add(docId: string, docName: string, docOpts?: DocAddOptions): this {
    const opts = this.options;
    const doc = getDocument();
    if (!doc || !opts.tabContext || !opts.contentContext) return this;

    // Check if already exists
    const existing = this.doc(docId);
    if (existing) {
      this.active(docId);
      return this;
    }

    // Check max tabs
    if ((opts.docs?.length ?? 0) >= opts.maxTabs) {
      // Remove oldest non-stateful tab
      const nonStateful = opts.docs?.find((d) => !d.stateful && d.id !== opts.activeId);
      if (nonStateful) {
        this.remove(nonStateful.id);
      } else {
        console.warn('Maximum number of tabs reached');
        return this;
      }
    }

    // Check max stateful
    const statefulCount = opts.docs?.filter((d) => d.stateful).length ?? 0;
    const isStateful = docOpts?.stateful ?? false;
    
    if (isStateful && statefulCount >= opts.maxStateful) {
      // Remove oldest stateful tab
      const oldStateful = opts.docs?.find((d) => d.stateful && d.id !== opts.activeId);
      if (oldStateful) {
        this.removeState(oldStateful.id);
      }
    }

    // Create doc state
    const docState: DocState = {
      id: docId,
      name: docName,
      url: docOpts?.url,
      active: false,
      stateful: isStateful,
      data: docOpts?.data,
    };

    // Create tab element
    const tabEl = doc.createElement('div');
    tabEl.className = 'docs_tab__';
    tabEl.dataset['id'] = docId;

    const tabLabel = doc.createElement('span');
    tabLabel.className = 'docs_tab_title__';
    tabLabel.textContent = docName;
    tabEl.appendChild(tabLabel);

    if (opts.showClose) {
      const closeBtn = doc.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'docs_tab_close__';
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        this.remove(docId);
      });
      tabEl.appendChild(closeBtn);
    }

    tabEl.addEventListener('click', () => {
      this.active(docId);
    });

    docState.tabElement = new NaturalElement(tabEl);
    opts.tabContext.append(tabEl);

    // Create content element
    const contentEl = doc.createElement('div');
    contentEl.className = 'docs_content__';
    contentEl.dataset['id'] = docId;
    contentEl.style.display = 'none';

    docState.contentElement = new NaturalElement(contentEl);
    opts.contentContext.append(contentEl);

    // Add to docs array
    opts.docs?.push(docState);

    // Load content if URL provided
    if (docOpts?.url) {
      this.loadContent(docState, docOpts.url, docOpts.onLoad);
    }

    // Activate unless explicitly disabled
    // Default behavior: activate when adding
    if (docOpts?.active !== false) {
      this.active(docId);
    }

    return this;
  }

  /**
   * Load content for a document.
   */
  private loadContent(docState: DocState, url: string, onLoad?: (doc: DocState) => void): void {
    const opts = this.options;

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load content');
        return response.text();
      })
      .then((html) => {
        docState.contentElement?.html(html);
        
        if (onLoad) {
          onLoad(docState);
        }
        if (opts.onLoad) {
          opts.onLoad(docState);
        }
      })
      .catch((error) => {
        console.error('Error loading document content:', error);
        docState.contentElement?.html(`<div class="docs_error__">Failed to load content</div>`);
      });
  }

  /**
   * Activate a document/tab.
   */
  active(docId: string): this {
    const opts = this.options;
    const docState = this.doc(docId);

    if (!docState) return this;

    // Call onBeforeActive
    if (opts.onBeforeActive) {
      const result = opts.onBeforeActive(docState);
      if (result === false) return this;
    }

    // Deactivate current
    if (opts.activeId && opts.activeId !== docId) {
      const current = this.doc(opts.activeId);
      if (current) {
        current.active = false;
        current.tabElement?.removeClass('docs_tab_active__');
        current.contentElement?.removeClass('docs_content_active__');
        current.contentElement?.css('display', 'none');
      }
    }

    // Activate new
    docState.active = true;
    opts.activeId = docId;
    docState.tabElement?.addClass('docs_tab_active__');
    docState.contentElement?.addClass('docs_content_active__');
    docState.contentElement?.css('display', '');

    // Scroll tab into view
    if (opts.tabScroll && docState.tabElement) {
      const tabEl = docState.tabElement.get(0);
      if (tabEl && typeof tabEl.scrollIntoView === 'function') {
        tabEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }

    // Call onActive
    if (opts.onActive) {
      opts.onActive(docState);
    }

    return this;
  }

  /**
   * Remove stateful flag from a document.
   */
  removeState(docId: string): this {
    const docState = this.doc(docId);
    if (docState) {
      docState.stateful = false;
    }
    return this;
  }

  /**
   * Remove a document/tab.
   */
  remove(docId: string): this {
    const opts = this.options;
    const index = opts.docs?.findIndex((d) => d.id === docId) ?? -1;

    if (index < 0) return this;

    const docState = opts.docs?.[index];
    if (!docState) return this;

    // Call onRemove
    if (opts.onRemove) {
      opts.onRemove(docState);
    }

    // Remove elements
    docState.tabElement?.remove();
    docState.contentElement?.remove();

    // Remove from array
    opts.docs?.splice(index, 1);

    // Activate another tab if this was active
    if (opts.activeId === docId) {
      opts.activeId = null;
      const nextDoc = opts.docs?.[Math.min(index, (opts.docs?.length ?? 1) - 1)];
      if (nextDoc) {
        this.active(nextDoc.id);
      }
    }

    return this;
  }

  /**
   * Get document state by ID.
   */
  doc(docId: string): DocState | undefined {
    return this.options.docs?.find((d) => d.id === docId);
  }

  /**
   * Get controller for a document.
   */
  cont(docId: string): unknown {
    return this.doc(docId)?.controller;
  }

  /**
   * Set controller for a document.
   */
  setCont(docId: string, controller: unknown): this {
    const docState = this.doc(docId);
    if (docState) {
      docState.controller = controller;
    }
    return this;
  }

  /**
   * Reload a document's content.
   */
  reload(docId: string): this {
    const docState = this.doc(docId);
    if (docState && docState.url) {
      this.loadContent(docState, docState.url);
    }
    return this;
  }

  /**
   * Get all documents.
   */
  list(): DocState[] {
    return [...(this.options.docs ?? [])];
  }

  /**
   * Get active document.
   */
  activeDoc(): DocState | undefined {
    const opts = this.options;
    return opts.activeId ? this.doc(opts.activeId) : undefined;
  }

  /**
   * Get document count.
   */
  count(): number {
    return this.options.docs?.length ?? 0;
  }

  /**
   * Close all documents.
   */
  clear(): this {
    const ids = this.options.docs?.map((d) => d.id) ?? [];
    for (const id of ids) {
      this.remove(id);
    }
    return this;
  }

  /**
   * Destroy the docs instance.
   */
  destroy(): void {
    this.clear();
    this.options.context.removeClass('docs__');
    this.options.context.removeData('docs');
  }
}

/**
 * Factory function to create a Docs instance.
 */
export function createDocs(
  context: NaturalElement | Element | string,
  opts?: DocsUserOptions
): Docs {
  return new Docs(context, opts);
}

