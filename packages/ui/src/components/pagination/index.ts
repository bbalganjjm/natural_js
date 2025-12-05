/**
 * Pagination component for Natural-JS.
 * Provides page navigation functionality.
 */

import { NaturalElement, isBrowser, getDocument } from '@natural-js/shared';
import { isString } from '@natural-js/core';
import { PaginationOptions, PaginationUserOptions, PageNavInfo } from './types';

export * from './types';

const DEFAULT_OPTIONS: Partial<PaginationOptions> = {
  totalCount: 0,
  pageNo: 1,
  countPerPage: 10,
  countPerPageSet: 10,
  showFirstLast: true,
  showPrevNextSet: true,
  firstText: '«',
  lastText: '»',
  prevText: '‹',
  nextText: '›',
  prevSetText: '...',
  nextSetText: '...',
  activeClass: 'pagination_active__',
  disabledClass: 'pagination_disabled__',
};

/**
 * Pagination component for page navigation.
 */
export class Pagination {
  public options: PaginationOptions;

  constructor(context: NaturalElement | Element | string, opts?: PaginationUserOptions) {
    if (!isBrowser()) {
      this.options = {} as PaginationOptions;
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
    } as PaginationOptions;

    // Add class
    contextEl.addClass('pagination__');

    // Initial render
    this.render();

    // Store reference
    contextEl.data('pagination', this);
  }

  /**
   * Returns the context element.
   */
  context(selector?: string): NaturalElement {
    return selector ? this.options.context.find(selector) : this.options.context;
  }

  /**
   * Calculate page navigation info.
   */
  currPageNavInfo(): PageNavInfo {
    const opts = this.options;
    const totalPages = Math.max(1, Math.ceil(opts.totalCount / opts.countPerPage));
    const currentPage = Math.min(Math.max(1, opts.pageNo), totalPages);
    
    const currentSet = Math.ceil(currentPage / opts.countPerPageSet);
    const firstPage = (currentSet - 1) * opts.countPerPageSet + 1;
    const lastPage = Math.min(currentSet * opts.countPerPageSet, totalPages);

    return {
      pageNo: currentPage,
      totalPages,
      totalCount: opts.totalCount,
      countPerPage: opts.countPerPage,
      firstPage,
      lastPage,
      hasPrevSet: firstPage > 1,
      hasNextSet: lastPage < totalPages,
      hasPrev: currentPage > 1,
      hasNext: currentPage < totalPages,
    };
  }

  /**
   * Render pagination.
   */
  private render(): void {
    const opts = this.options;
    const doc = getDocument();
    if (!doc) return;

    const info = this.currPageNavInfo();
    const container = opts.context.get(0);
    if (!container) return;

    // Clear
    container.innerHTML = '';

    const nav = doc.createElement('nav');
    nav.className = 'pagination_nav__';

    // First button
    if (opts.showFirstLast) {
      nav.appendChild(this.createButton(opts.firstText || '«', 1, !info.hasPrev, 'first'));
    }

    // Prev set button
    if (opts.showPrevNextSet && info.hasPrevSet) {
      nav.appendChild(this.createButton(opts.prevSetText || '...', info.firstPage - 1, false, 'prev-set'));
    }

    // Prev button
    nav.appendChild(this.createButton(opts.prevText || '‹', info.pageNo - 1, !info.hasPrev, 'prev'));

    // Page numbers
    for (let i = info.firstPage; i <= info.lastPage; i++) {
      const btn = this.createButton(String(i), i, false, 'page');
      if (i === info.pageNo) {
        btn.classList.add(opts.activeClass || 'pagination_active__');
      }
      nav.appendChild(btn);
    }

    // Next button
    nav.appendChild(this.createButton(opts.nextText || '›', info.pageNo + 1, !info.hasNext, 'next'));

    // Next set button
    if (opts.showPrevNextSet && info.hasNextSet) {
      nav.appendChild(this.createButton(opts.nextSetText || '...', info.lastPage + 1, false, 'next-set'));
    }

    // Last button
    if (opts.showFirstLast) {
      nav.appendChild(this.createButton(opts.lastText || '»', info.totalPages, !info.hasNext, 'last'));
    }

    container.appendChild(nav);
  }

  /**
   * Create a pagination button.
   */
  private createButton(text: string, pageNo: number, disabled: boolean, type: string): HTMLButtonElement {
    const doc = getDocument()!;
    const opts = this.options;
    const btn = doc.createElement('button');
    
    btn.type = 'button';
    btn.textContent = text;
    btn.className = `pagination_btn__ pagination_${type}__`;
    btn.dataset['page'] = String(pageNo);

    if (disabled) {
      btn.disabled = true;
      btn.classList.add(opts.disabledClass || 'pagination_disabled__');
    } else {
      btn.addEventListener('click', () => {
        this.pageNo(pageNo);
      });
    }

    return btn;
  }

  /**
   * Bind with total count.
   */
  bind(totalCount: number, pageNo?: number): this {
    const opts = this.options;
    opts.totalCount = totalCount;
    if (pageNo !== undefined) {
      opts.pageNo = pageNo;
    }
    this.render();
    return this;
  }

  /**
   * Get or set total count.
   */
  totalCount(): number;
  totalCount(count: number): this;
  totalCount(count?: number): number | this {
    if (count === undefined) {
      return this.options.totalCount;
    }
    this.options.totalCount = count;
    this.render();
    return this;
  }

  /**
   * Get or set current page number.
   */
  pageNo(): number;
  pageNo(no: number): this;
  pageNo(no?: number): number | this {
    if (no === undefined) {
      return this.options.pageNo;
    }

    const info = this.currPageNavInfo();
    const newPage = Math.min(Math.max(1, no), info.totalPages);
    
    if (newPage !== this.options.pageNo) {
      this.options.pageNo = newPage;
      this.render();

      if (this.options.onChange) {
        this.options.onChange(newPage, this.currPageNavInfo());
      }
    }

    return this;
  }

  /**
   * Get or set items per page.
   */
  countPerPage(): number;
  countPerPage(count: number): this;
  countPerPage(count?: number): number | this {
    if (count === undefined) {
      return this.options.countPerPage;
    }
    this.options.countPerPage = count;
    this.options.pageNo = 1; // Reset to first page
    this.render();
    return this;
  }

  /**
   * Go to first page.
   */
  first(): this {
    return this.pageNo(1);
  }

  /**
   * Go to last page.
   */
  last(): this {
    const info = this.currPageNavInfo();
    return this.pageNo(info.totalPages);
  }

  /**
   * Go to previous page.
   */
  prev(): this {
    return this.pageNo(this.options.pageNo - 1);
  }

  /**
   * Go to next page.
   */
  next(): this {
    return this.pageNo(this.options.pageNo + 1);
  }

  /**
   * Destroy the pagination instance.
   */
  destroy(): void {
    const opts = this.options;
    opts.context.empty();
    opts.context.removeClass('pagination__');
    opts.context.removeData('pagination');
  }
}

/**
 * Factory function to create a Pagination instance.
 */
export function createPagination(
  context: NaturalElement | Element | string,
  opts?: PaginationUserOptions
): Pagination {
  return new Pagination(context, opts);
}

