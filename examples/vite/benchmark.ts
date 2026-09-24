import { createRows } from "@bbalganjjm/natural_js/data";
import type { RowSnapshot, Rows } from "@bbalganjjm/natural_js/data";
import { bindGrid } from "@bbalganjjm/natural_js/ui";
import type { GridHandle } from "@bbalganjjm/natural_js/ui";

type Kind = "flat" | "nested-auto" | "nested-explicit";
type Stage = "initial" | "rebind" | "edit" | "sort" | "filter" | "dispose";

interface BenchmarkRow {
  ordinal: number;
  f0: string;
  f1: string;
  f2: string;
  f3: string;
  f4: string;
  f5: string;
  f6: string;
  f7: string;
  f8: string;
  f9: string;
  a?: { aa?: number; bb?: number }[];
  chosen?: number | null;
}

interface StageSample {
  durationMs: number;
  elementCount: number;
  rowCount: number;
  usedJSHeapBytes: number | null;
}

type RunSample = Record<Stage, StageSample>;

declare global {
  interface Window {
    runM4Benchmark(options: {
      count: number;
      kind: Kind;
      runs: number;
      warmup: number;
    }): Promise<RunSample[]>;
  }
}

const host = document.querySelector<HTMLElement>("[data-benchmark-host]");
if (!host) throw new Error("Benchmark host is missing.");

function makeData(count: number, version: number, nested: boolean): BenchmarkRow[] {
  return Array.from({ length: count }, (_, index) => {
    const ordinal = index + 1;
    const label = `row-${String(ordinal).padStart(4, "0")}-v${version}`;
    const row: BenchmarkRow = {
      ordinal,
      f0: label,
      f1: label,
      f2: label,
      f3: label,
      f4: label,
      f5: label,
      f6: label,
      f7: label,
      f8: label,
      f9: label
    };
    if (nested) {
      row.a = [{ aa: 11, bb: 22 }, { aa: ordinal, bb: ordinal + 1000 }, {}];
      row.chosen = 22;
    }
    return row;
  });
}

function tableFor(kind: Kind): HTMLTableElement {
  const template = document.querySelector<HTMLTemplateElement>(
    `template[data-benchmark-template="${kind}"]`
  );
  const table = template?.content.firstElementChild?.cloneNode(true);
  if (!(table instanceof HTMLTableElement)) {
    throw new Error(`Missing ${kind} table fixture.`);
  }
  return table;
}

function renderedRows(table: HTMLTableElement): HTMLTableRowElement[] {
  return [...table.querySelectorAll<HTMLTableRowElement>("tbody tr")];
}

function firstField(table: HTMLTableElement): string | null {
  return renderedRows(table)[0]?.querySelector('[data-field="f0"]')?.textContent ?? null;
}

async function until(condition: () => boolean, stage: Stage): Promise<void> {
  for (let frame = 0; frame < 300; frame++) {
    if (condition()) return;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
  throw new Error(`${stage} did not finish rendering within 300 frames.`);
}

function visibleRows(rows: Rows<BenchmarkRow>, sorted: boolean, filtered: boolean): RowSnapshot<BenchmarkRow>[] {
  let result = [...rows.entries()];
  if (sorted) result.sort((a, b) => b.value.ordinal - a.value.ordinal);
  if (filtered) result = result.filter((row) => row.value.ordinal % 2 === 0);
  return result;
}

// This is an application-level rendering comparison, not a typed Select replacement.
function bindExplicitOptions(
  table: HTMLTableElement,
  visible: readonly RowSnapshot<BenchmarkRow>[],
  cache: WeakMap<HTMLSelectElement, { source: unknown; chosen: unknown }>
): void {
  const rendered = renderedRows(table);
  if (rendered.length !== visible.length) throw new Error("Explicit Select row count differs from the data.");
  for (let index = 0; index < rendered.length; index++) {
    const select = rendered[index].querySelector<HTMLSelectElement>("select");
    if (!select) throw new Error("Explicit Select is missing.");
    const source = visible[index].value.a;
    const chosen = visible[index].value.chosen;
    const previous = cache.get(select);
    if (previous && previous.source === source && Object.is(previous.chosen, chosen)) continue;
    if (previous && previous.source === source) {
      select.value = chosen == null ? "" : String(chosen);
      cache.set(select, { source, chosen });
      continue;
    }
    const fragment = document.createDocumentFragment();
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "Choose";
    fragment.append(empty);
    for (const item of source ?? []) {
      if (item.aa == null || item.bb == null) continue;
      const option = document.createElement("option");
      option.value = String(item.bb);
      option.textContent = String(item.aa);
      fragment.append(option);
    }
    select.replaceChildren(fragment);
    select.value = chosen == null ? "" : String(chosen);
    cache.set(select, { source, chosen });
  }
}

function assertNested(table: HTMLTableElement): void {
  const first = renderedRows(table)[0]?.querySelector<HTMLSelectElement>("select");
  if (!first || first.options.length !== 3 || first.value !== "22" || first.options[1].textContent !== "11") {
    throw new Error("Nested Select fixture did not render the expected option and selection.");
  }
}

function inspect(table: HTMLTableElement, durationMs: number): StageSample {
  const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
  return {
    durationMs,
    elementCount: table.querySelectorAll("*").length,
    rowCount: renderedRows(table).length,
    usedJSHeapBytes: memory?.usedJSHeapSize ?? null
  };
}

async function timeStage(
  table: HTMLTableElement,
  action: () => void | Promise<void>
): Promise<StageSample> {
  const started = performance.now();
  await action();
  return inspect(table, performance.now() - started);
}

async function oneRun(count: number, kind: Kind): Promise<RunSample> {
  const nested = kind !== "flat";
  const rows = createRows<BenchmarkRow>(makeData(count, 0, nested));
  const replacement = makeData(count, 1, nested);
  const table = tableFor(kind);
  host!.replaceChildren(table);
  let grid: GridHandle<BenchmarkRow> | undefined;
  let disposed = false;
  const explicitCache = new WeakMap<HTMLSelectElement, { source: unknown; chosen: unknown }>();

  async function ready(stage: Stage, expectedRows: number, expectedFirst: string): Promise<void> {
    await until(() => renderedRows(table).length === expectedRows && firstField(table) === expectedFirst, stage);
  }

  function explicit(sorted = false, filtered = false): void {
    if (kind === "nested-explicit") {
      bindExplicitOptions(table, visibleRows(rows, sorted, filtered), explicitCache);
    }
    if (nested) assertNested(table);
  }

  try {
    const result = {} as RunSample;
    result.initial = await timeStage(table, async () => {
      grid = bindGrid(table, { rows });
      await ready("initial", count, replacement[0].f0.replace("-v1", "-v0"));
      explicit();
    });
    result.rebind = await timeStage(table, async () => {
      rows.replace(replacement);
      await ready("rebind", count, replacement[0].f0);
      explicit();
    });
    result.edit = await timeStage(table, async () => {
      rows.set(rows.entries()[0].id, "f0", "edited-field");
      await ready("edit", count, "edited-field");
      explicit();
    });
    result.sort = await timeStage(table, async () => {
      grid!.setSort((a, b) => b.ordinal - a.ordinal);
      await ready("sort", count, replacement[count - 1].f0);
      explicit(true);
    });
    result.filter = await timeStage(table, async () => {
      grid!.setFilter((row) => row.ordinal % 2 === 0);
      await ready("filter", count / 2, replacement[count - 1].f0);
      explicit(true, true);
    });
    result.dispose = await timeStage(table, () => {
      grid!.dispose();
      disposed = true;
    });
    return result;
  } finally {
    if (!disposed) grid?.dispose();
    rows.dispose();
    host!.replaceChildren();
  }
}

window.runM4Benchmark = async ({ count, kind, runs, warmup }) => {
  if (![100, 1000].includes(count) || !["flat", "nested-auto", "nested-explicit"].includes(kind)) {
    throw new Error("Expected 100 or 1000 rows and a known fixture kind.");
  }
  const samples: RunSample[] = [];
  for (let index = 0; index < warmup + runs; index++) {
    const sample = await oneRun(count, kind);
    if (index >= warmup) samples.push(sample);
  }
  return samples;
};
