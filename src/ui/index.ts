// SPDX-License-Identifier: Apache-2.0
import type { RowId, Snapshot } from "../data/index.js";
import type { PageHandle } from "../page/index.js";

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

export interface FormHandle<T extends object> {
  bind(id: RowId | null): void;
  read(): Record<string, unknown>;
  validate(id?: RowId): ValidationResult;
  dispose(): void;
}

export interface GridHandle<T extends object> {
  select(id: RowId | null): void;
  selected(): RowId | null;
  setSort(compare: ((a: Snapshot<T>, b: Snapshot<T>) => number) | null): void;
  setFilter(predicate: ((row: Snapshot<T>) => boolean) | null): void;
  validate(id?: RowId): ValidationResult;
  dispose(): void;
}

export interface PopupHandle<Output> extends PageHandle<Output> {
  readonly result: Promise<Output | undefined>;
  close(): Promise<void>;
}

export { bindForm } from "./form.js";
export { bindGrid } from "./grid.js";
