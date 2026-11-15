// SPDX-License-Identifier: Apache-2.0
import type { RowId, RowsEvent } from "../data/index.js";
import type { FormatRule, ValidateRule } from "./index.js";
import { sameRuleCalls } from "./rules.js";
import type { RuleCall, RuleDeclarations, RuleRunner } from "./rules.js";

type Checkpoint = (cause?: unknown) => void;
type Text = readonly (string | null)[];
export interface RowRuleSource { readonly format: Text; readonly validate: Text; }
export interface RowRuleTarget {
  readonly index: number;
  readonly name?: string;
  format?: readonly RuleCall<FormatRule>[];
  validate: readonly RuleCall<ValidateRule>[];
}
export interface RowRuleRecord { readonly id: RowId; ruleSources: readonly RowRuleSource[]; }
interface Calls { readonly format: readonly RuleCall<FormatRule>[]; readonly validate: readonly RuleCall<ValidateRule>[]; }
interface Accepted { readonly source: RowRuleSource; readonly calls: Calls; }
interface Override {
  readonly format?: { readonly source: Text; readonly calls: readonly RuleCall<FormatRule>[] };
  readonly validate?: { readonly source: Text; readonly calls: readonly RuleCall<ValidateRule>[] };
}
const emptyFormats: readonly RuleCall<FormatRule>[] = [];
const kinds = ["format", "validate"] as const;
const attribute = { format: "data-format", validate: "data-validate" } as const;
const sameText = (left: Text, right: Text) => left.length === right.length && left.every((text, index) => text === right[index]);

/** Accepted declarations only; Grid/List retain native, data, render and lifetime ownership. */
export function createRowRules<R extends RowRuleRecord>(runner: RuleRunner,
  fields: readonly { readonly target: RowRuleTarget; readonly elements: readonly HTMLElement[] }[],
  elements: (record: R, field: number) => readonly HTMLElement[],
  check: (field: number, calls: Calls, source: RowRuleSource, declarations: RuleDeclarations) => void,
  busy: () => never) {
  function read(nodes: readonly HTMLElement[], previous?: RowRuleSource, checkpoint?: Checkpoint): RowRuleSource {
    let format = previous?.format, validate = previous?.validate;
    for (const kind of kinds) {
      const accepted = previous?.[kind];
      let changed = accepted?.length === nodes.length ? undefined : Array.from({ length: nodes.length }, (_, index) => accepted?.[index] ?? null);
      for (let index = 0; index < nodes.length; index++) {
        checkpoint?.(); let value: string | null;
        try { value = nodes[index].getAttribute(attribute[kind]); } catch (cause) { checkpoint?.(cause); throw cause; }
        checkpoint?.();
        if ((changed ? changed[index] : accepted![index]) !== value) {
          changed ??= [...accepted!]; changed[index] = value;
        }
      }
      if (kind === "format") format = changed ?? accepted!; else validate = changed ?? accepted!;
    }
    return previous && format === previous.format && validate === previous.validate ? previous : { format: format!, validate: validate! };
  }
  function compile(view: RuleDeclarations, field: number, source: RowRuleSource, checkpoint: Checkpoint,
    previous?: Accepted, inherited?: Accepted): Calls {
    const name = fields[field].target.name ?? "";
    function unchanged(kind: (typeof kinds)[number]): boolean {
      return previous !== undefined && sameText(source[kind], previous.source[kind]) &&
        !runner.configured(name, attribute[kind]) && !view.configured(name, attribute[kind]);
    }
    const calls = {
      format: unchanged("format") ? previous!.calls.format : inherited && sameText(source.format, inherited.source.format) ? inherited.calls.format :
        view.formats(source.format.find(value => value !== null) ?? null, name, checkpoint),
      validate: unchanged("validate") ? previous!.calls.validate : inherited && sameText(source.validate, inherited.source.validate) ? inherited.calls.validate :
        name ? view.validators(source.validate.find(value => value !== null) ?? null, name, checkpoint) : []
    };
    check(field, calls, source, view); checkpoint(); return calls;
  }
  let templateSources = fields.map(field => read(field.elements));
  const positions = new Map(fields.map((field, position) => [field.target.index, position] as const));
  let overrides: Map<RowId, Map<number, Override>> | undefined;
  let revision = 0;
  const formats = (id: RowId, target: RowRuleTarget) => overrides?.get(id)?.get(target.index)?.format?.calls ?? target.format ?? emptyFormats;
  const validators = (id: RowId, target: RowRuleTarget) => overrides?.get(id)?.get(target.index)?.validate?.calls ?? target.validate;

  function accepted(position: number, own?: Override): Accepted {
    const target = fields[position].target, source = templateSources[position];
    return { source: { format: own?.format?.source ?? source.format, validate: own?.validate?.source ?? source.validate },
      calls: { format: own?.format?.calls ?? target.format ?? emptyFormats, validate: own?.validate?.calls ?? target.validate } };
  }

  function decide(id: RowId, position: number, observed: RowRuleSource, previous: RowRuleSource,
    templates: readonly RowRuleSource[], current: Map<RowId, Map<number, Override>> | undefined,
    view: RuleDeclarations, checkpoint: Checkpoint, templateCalls?: readonly Calls[]): Override | undefined {
    const target = fields[position].target, prior = current?.get(id)?.get(target.index);
    const formatSource = sameText(observed.format, previous.format) ? prior?.format?.source :
      sameText(observed.format, templates[position].format) ? undefined : observed.format;
    const validateSource = sameText(observed.validate, previous.validate) ? prior?.validate?.source :
      sameText(observed.validate, templates[position].validate) ? undefined : observed.validate;
    if (!formatSource && !validateSource) return undefined;
    const source = { format: formatSource ?? templates[position].format, validate: validateSource ?? templates[position].validate };
    const calls = compile(view, position, source, checkpoint, accepted(position, prior),
      { source: templates[position], calls: templateCalls?.[position] ?? accepted(position).calls });
    return { ...(formatSource ? { format: { source: formatSource, calls: calls.format } } : {}),
      ...(validateSource ? { validate: { source: validateSource, calls: calls.validate } } : {}) };
  }
  function write(record: R, position: number, kind: (typeof kinds)[number], member: number,
    value: string | null, checkpoint: Checkpoint): void {
    const node = elements(record, position)[member]; checkpoint();
    const previous = record.ruleSources;
    function remember(text: string | null): void {
      const source = record.ruleSources[position], next = [...source[kind]]; next[member] = text;
      const all = [...record.ruleSources]; all[position] = { ...source, [kind]: next }; record.ruleSources = all;
    }
    remember(value);
    try { if (value === null) node.removeAttribute(attribute[kind]); else node.setAttribute(attribute[kind], value); }
    catch (cause) {
      checkpoint(cause); record.ruleSources = previous;
      const actual = node.getAttribute(attribute[kind]); checkpoint(cause); remember(actual); throw cause;
    }
    checkpoint();
  }
  function assign(record: R, sources: readonly RowRuleSource[], checkpoint: Checkpoint): void {
    for (const [position, source] of sources.entries()) for (const kind of kinds) for (const [member, value] of source[kind].entries()) {
      if (record.ruleSources[position][kind][member] !== value) write(record, position, kind, member, value, checkpoint);
    }
    checkpoint(); record.ruleSources = sources;
  }
  function sources(id: RowId, current = overrides, templates: readonly RowRuleSource[] = templateSources): readonly RowRuleSource[] {
    const row = current?.get(id); if (!row) return templates;
    return templates.map((source, position) => {
      const own = row.get(fields[position].target.index);
      return own ? { format: own.format?.source ?? source.format, validate: own.validate?.source ?? source.validate } : source;
    });
  }
  function set(next: Map<RowId, Map<number, Override>>, id: RowId, index: number, value: Override | undefined): void {
    if (value) { let row = next.get(id); if (!row) { row = new Map(); next.set(id, row); } row.set(index, value); }
    else { const row = next.get(id); row?.delete(index); if (row?.size === 0) next.delete(id); }
  }
  return {
    formats, validators, sources,
    attach(record: R, checkpoint: Checkpoint): void {
      const accepted = record.ruleSources;
      record.ruleSources = templateSources;
      let observed = record.ruleSources;
      for (const [position] of fields.entries()) {
        const source = read(elements(record, position), observed[position], checkpoint);
        if (source !== observed[position]) { if (observed === record.ruleSources) observed = [...observed]; (observed as RowRuleSource[])[position] = source; }
      }
      checkpoint(); record.ruleSources = observed; assign(record, accepted, checkpoint);
    },
    before(record: R, checkpoint: Checkpoint): void {
      const entry = revision, current = () => { checkpoint(); if (entry !== revision) busy(); };
      let next: Map<number, Override> | undefined;
      let observed = record.ruleSources;
      for (const [position, field] of fields.entries()) {
        const source = read(elements(record, position), record.ruleSources[position], current);
        if (source === record.ruleSources[position]) continue;
        const own = decide(record.id, position, source, record.ruleSources[position], templateSources, overrides, runner, current);
        const format = own?.format?.calls ?? field.target.format ?? emptyFormats, validate = own?.validate?.calls ?? field.target.validate;
        if (runner.running && (!sameRuleCalls(format, formats(record.id, field.target)) || !sameRuleCalls(validate, validators(record.id, field.target)))) busy();
        next ??= new Map(overrides?.get(record.id));
        if (own) next.set(field.target.index, own); else next.delete(field.target.index);
        if (observed === record.ruleSources) observed = [...observed]; (observed as RowRuleSource[])[position] = source;
      }
      if (!next) return;
      current();
      if (next.size) { overrides ??= new Map(); overrides.set(record.id, next); }
      else { overrides?.delete(record.id); if (overrides?.size === 0) overrides = undefined; }
      record.ruleSources = observed; revision++;
    },
    refresh(records: Iterable<R>, checkpoint: Checkpoint): void {
      let entry = revision;
      const retained = [...records], current = (cause?: unknown) => { checkpoint(cause); if (entry !== revision) busy(); };
      current(); const candidate = runner.candidate(current);
      const templates = fields.map((field, position) => read(field.elements, templateSources[position], current));
      const calls = templates.map((source, position) => compile(candidate, position, source, current, accepted(position)));
      const next = new Map<RowId, Map<number, Override>>();
      if (overrides) for (const [id, row] of overrides) for (const [index, own] of row) {
        const position = positions.get(index)!, source = { format: own.format?.source ?? templates[position].format,
          validate: own.validate?.source ?? templates[position].validate };
        const compiled = compile(candidate, position, source, current, accepted(position, own), { source: templates[position], calls: calls[position] });
        set(next, id, index, { ...(own.format ? { format: { source: own.format.source, calls: compiled.format } } : {}),
          ...(own.validate ? { validate: { source: own.validate.source, calls: compiled.validate } } : {}) });
      }
      const plans = retained.map(record => {
        let observedSources = record.ruleSources;
        for (const [position, field] of fields.entries()) {
          const observed = read(elements(record, position), record.ruleSources[position], current);
          if (observed !== observedSources[position]) {
            if (observedSources === record.ruleSources) observedSources = [...observedSources];
            (observedSources as RowRuleSource[])[position] = observed;
          }
          set(next, record.id, field.target.index, decide(record.id, position, observed, record.ruleSources[position], templates, overrides, candidate, current, calls));
        }
        return { record, observed: observedSources, sources: sources(record.id, next, templates) };
      });
      if (runner.running) {
        if (fields.some((field, position) => !sameRuleCalls(calls[position].format, field.target.format ?? emptyFormats) ||
            !sameRuleCalls(calls[position].validate, field.target.validate))) busy();
        for (const [id, row] of next) for (const [index, own] of row) {
          const position = positions.get(index)!, target = fields[position].target;
          if (!sameRuleCalls(own.format?.calls ?? calls[position].format, formats(id, target)) ||
              !sameRuleCalls(own.validate?.calls ?? calls[position].validate, validators(id, target))) busy();
        }
        if (overrides) for (const [id, row] of overrides) for (const [index] of row) if (!next.get(id)?.has(index)) {
          const position = positions.get(index)!, target = fields[position].target;
          if (!sameRuleCalls(calls[position].format, formats(id, target)) || !sameRuleCalls(calls[position].validate, validators(id, target))) busy();
        }
      }
      current(); runner.adopt(candidate);
      for (const [position, field] of fields.entries()) { field.target.format = calls[position].format; field.target.validate = calls[position].validate; }
      templateSources = templates; overrides = next.size ? next : undefined; entry = ++revision;
      for (const plan of plans) {
        current(); plan.record.ruleSources = plan.observed; assign(plan.record, plan.sources, current);
      }
    },
    prune(event: RowsEvent, available: (id: RowId) => boolean): void {
      if (event.type !== "replace" && event.type !== "remove" && event.type !== "revert") return;
      if (overrides) for (const id of overrides.keys()) if (!available(id)) overrides.delete(id);
    },
    dispose(): void { overrides?.clear(); overrides = undefined; revision++; }
  };
}
