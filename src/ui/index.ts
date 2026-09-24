// SPDX-License-Identifier: Apache-2.0
import type { RowId, Snapshot } from "../data/index.js";

export type Rule = readonly [name: string, ...args: unknown[]];

export interface RuleContext {
  readonly field: string;
  readonly values: Snapshot<Record<string, unknown>>;
  readonly rowId: RowId | null;
  readonly element?: HTMLElement;
}

export type FormatRule = (
  value: string,
  args: readonly unknown[],
  context: RuleContext
) => string;

export type ValidateRule = (
  value: string,
  args: readonly unknown[],
  context: RuleContext
) => boolean | string;

export type ParseInput = (input: string, context: RuleContext) => unknown;

export interface RuleSet {
  format?: Record<string, FormatRule>;
  validate?: Record<string, ValidateRule>;
  messages?: Record<string, string>;
  locale?: string;
}

export interface ValidationIssue {
  rowId: RowId | null;
  field: string;
  rule: string;
  message: string;
  element?: HTMLElement;
}

export interface ValidationResult {
  valid: boolean;
  issues: readonly ValidationIssue[];
}

export interface PageRequest {
  readonly page: number;
  readonly size: number;
}

export interface PageInput extends PageRequest {
  readonly total: number;
}

export interface PageState extends PageInput {
  readonly pages: number;
}

export type SelectValue = string | number | boolean | null;

export interface SelectChoice<V extends SelectValue> {
  readonly label: string;
  readonly value: V;
  readonly disabled?: boolean;
}

export type SelectSelection<V extends SelectValue> = V | string | null;

export interface SelectHandle<V extends SelectValue> {
  setChoices(choices: readonly SelectChoice<V>[]): void;
  setValue(value: SelectSelection<V> | readonly SelectSelection<V>[]): void;
  value(): SelectSelection<V> | readonly SelectSelection<V>[];
  dispose(): void;
}

export interface PaginationHandle {
  set(state: PageInput): void;
  state(): PageState;
  dispose(): void;
}

export interface FormHandle<T extends object> {
  bind(id: RowId | null): void;
  read(): Record<string, unknown>;
  validate(id?: RowId): ValidationResult;
  dispose(): void;
}

export interface SortIndicator {
  readonly column: HTMLTableCellElement;
  readonly direction: "ascending" | "descending";
}

export interface ListHandle<T extends object> {
  select(id: RowId | null): void;
  selected(): RowId | null;
  setSort(compare: ((a: Snapshot<T>, b: Snapshot<T>) => number) | null): void;
  setFilter(predicate: ((row: Snapshot<T>) => boolean) | null): void;
  setPage(request: PageRequest | null): void;
  page(): PageState | null;
  validate(id?: RowId): ValidationResult;
  dispose(): void;
}

export interface GridHandle<T extends object> {
  select(id: RowId | null): void;
  selected(): RowId | null;
  setSort(compare: ((a: Snapshot<T>, b: Snapshot<T>) => number) | null,
    indicator?: SortIndicator): void;
  setFilter(predicate: ((row: Snapshot<T>) => boolean) | null): void;
  setPage(request: PageRequest | null): void;
  page(): PageState | null;
  validate(id?: RowId): ValidationResult;
  dispose(): void;
}

export { bindForm } from "./form.js";
export { bindGrid } from "./grid.js";
export { bindList } from "./list.js";
export { bindSelect } from "./select.js";
export { bindPagination } from "./pagination.js";
