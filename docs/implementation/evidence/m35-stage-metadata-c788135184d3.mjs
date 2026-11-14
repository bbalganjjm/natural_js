import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { gzipSync, gunzipSync } from 'node:zlib';

export const dir = 'docs/implementation/evidence';
export const required = ['build', 'types', 'example-types', 'unit', 'pack', 'consumers',
  'packed-chromium', 'packed-firefox', 'packed-webkit', 'packed-chrome', 'packed-edge',
  'binding-performance', 'viewport-performance', 'browser-chromium', 'browser-firefox', 'browser-webkit'];
export const fixtures = ['tools/benchmark-m4.mjs', 'tools/benchmark-grid-viewport.mjs',
  'examples/vite/benchmark.ts', 'examples/vite/benchmark.html'];
export const bindingBudgets = { flat: { initial: 30, rebind: 35, edit: 5, sort: 10, filter: 8 },
  'nested-auto': { initial: 90, rebind: 100, sort: 25, filter: 18 } };
export const viewportBudgets = { flat: { initial: 120, reveal: 100, scroll: 100, columns: 150, paste: 2000, move: 100, append: 100 },
  nested: { initial: 180, reveal: 100, scroll: 100, columns: 150, paste: 2000, move: 100, append: 100 },
  blocks: { initial: 35, reveal: 100, scroll: 120, columns: 100, paste: 85, move: 100, append: 100 } };
export const sha = value => createHash('sha256').update(value).digest('hex');
export const read = file => fs.readFileSync(file);
export const json = file => JSON.parse(read(file));
export const normalized = value => Buffer.from(value.toString('utf8').replaceAll('\r\n', '\n'));
export const git = (...args) => execFileSync('git', ['-c', 'core.safecrlf=false', '-c', 'core.longpaths=true', ...args], { maxBuffer: 32 * 1024 * 1024 });
export function writeNew(file, value) { fs.writeFileSync(file, value, { flag: 'wx' }); }
export function writeJson(file, value) { writeNew(file, JSON.stringify(value, null, 2) + '\n'); }
export function reference(file) { return { path: file.replaceAll('\\', '/'), sha256: sha(read(file)), bytes: fs.statSync(file).size }; }
export function verifyRef(ref) { assert.equal(sha(read(ref.path)), ref.sha256, ref.path); if (ref.bytes !== undefined) assert.equal(fs.statSync(ref.path).size, ref.bytes, ref.path); }
export function verifyProtection(setup) {
  const visited = new Set(); let current = setup;
  while (current) {
    for (const ref of [...current.protected_files, ...current.helpers, current.original_lock]) verifyRef(ref);
    assert.equal(current.original_lock.sha256, 'ed9165da5fa2bb5cb7c4e858370e5703941e92a2559751ccf19ee41311313afe');
    if (!current.parent_receipt) break;
    verifyRef(current.parent_receipt); assert(!visited.has(current.parent_receipt.path), 'Parent receipt cycle'); visited.add(current.parent_receipt.path);
    const parent = json(current.parent_receipt.path);
    if (parent.setup) { verifyRef(parent.setup); current = json(parent.setup.path); }
    else { for (const ref of parent.semantic_acceptance?.inheritance ?? []) verifyRef(ref); current = null; }
  }
}
export function unchangedEvidence(baseline, prefix) {
  const paths = git('diff', '--name-only', '--no-renames', '--diff-filter=MD', '-z', baseline, '--', dir).toString().split('\0').filter(Boolean);
  assert.deepEqual(paths.filter(file => !file.startsWith(dir + '/' + prefix + '-') && file !== dir + '/m5-completion-run.json'), [], 'Historical evidence changed');
}
export function unique(stem, suffix) { let file = stem + suffix, number = 1; while (fs.existsSync(file)) file = stem + '-' + (++number) + suffix; return file; }
export function inventory() {
  const files = ['README.md', 'LICENSE', 'package.json', 'package-lock.json', 'tsconfig.json', 'vitest.config.ts'];
  function scan(folder) { for (const item of fs.readdirSync(folder, { withFileTypes: true })) {
    if (item.name === 'node_modules') continue;
    const file = folder + '/' + item.name; if (item.isDirectory()) scan(file); else files.push(file);
  } }
  for (const folder of ['src', 'examples/vite', 'tests', 'tools']) scan(folder);
  return files.sort();
}
export function tree(folder) {
  const files = [];
  function scan(current) { for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const file = current + '/' + entry.name; if (entry.isDirectory()) scan(file); else files.push(reference(file));
  } }
  scan(folder); return files.sort((a, b) => a.path.localeCompare(b.path));
}
export function inputs(prefix) {
  const values = Object.fromEntries(inventory().map(file => [file, sha(normalized(read(file)))]));
  const content = JSON.stringify(values, null, 2) + '\n', hash = sha(content);
  const file = `${dir}/${prefix}-inputs-${hash.slice(0, 12)}.json`;
  if (!fs.existsSync(file)) writeNew(file, content); else assert.equal(sha(read(file)), hash);
  return { ...reference(file), entries: Object.keys(values).length };
}
export function compressed(file, bytes) {
  writeNew(file, gzipSync(bytes));
  const ref = { ...reference(file), encoding: 'gzip', uncompressed_sha256: sha(bytes), uncompressed_bytes: bytes.length };
  assert.deepEqual(gunzipSync(read(file)), bytes); return ref;
}
export function output(ref) {
  verifyRef(ref); const bytes = ref.encoding === 'gzip' ? gunzipSync(read(ref.path)) : read(ref.path);
  if (ref.encoding === 'gzip') { assert.equal(sha(bytes), ref.uncompressed_sha256); assert.equal(bytes.length, ref.uncompressed_bytes); }
  return bytes;
}
export function tests(report) {
  const found = [];
  function visit(suite, parents) {
    for (const spec of suite.specs ?? []) for (const test of spec.tests ?? []) found.push({
      id: test.projectName + ':' + spec.id, semantic: JSON.stringify([spec.file, spec.line, spec.column, parents.slice(1), spec.title]),
      retained: JSON.stringify([spec.file, parents.slice(1), spec.title]), test });
    for (const child of suite.suites ?? []) visit(child, [...parents, child.title]);
  }
  for (const suite of report.suites ?? []) visit(suite, [suite.title]);
  assert.equal(new Set(found.map(item => item.id)).size, found.length); return found;
}
export function parentCollection(receipt) {
  if (receipt.canonical) return tests(JSON.parse(output(receipt.canonical['browser-chromium'].children[0].stdout)));
  const child = receipt.chromium_shards?.records.find(record => record.label === 'list'); assert(child, 'Parent needs its actual full Chromium collection');
  const ref = { path: dir + '/' + child.report, sha256: child.report_sha256 }; verifyRef(ref); return tests(json(ref.path));
}
export function retainedProof(parent, current, parentUnits, units) {
  assert(units >= parentUnits, 'Unit count regressed'); assert(current.length >= parent.length, 'Browser count regressed');
  const keys = current.map(item => item.retained); assert.equal(new Set(keys).size, keys.length, 'Ambiguous retained case identity');
  const available = new Set(keys); assert(parent.every(item => available.has(item.retained)), 'A parent browser case was removed or renamed');
  return { parent_unit_count: parentUnits, unit_count: units, parent_browser_count: parent.length, browser_count: current.length,
    retained_parent_cases: parent.length, retained_identities_sha256: sha(JSON.stringify(parent.map(item => item.retained).sort())) };
}
export function browserProof(list, runs, engine) {
  assert.deepEqual(list.errors, []); const whole = tests(list); assert(whole.length > 0);
  assert(whole.every(item => item.test.projectName === engine));
  const expected = whole.map(item => item.id).sort(), seen = new Set();
  const metadata = new Map(whole.map(item => [item.id, item.semantic]));
  for (const { listed, report } of runs) {
    assert.deepEqual(listed.errors, []); assert.deepEqual(report.errors, []);
    const ids = tests(listed).map(item => item.id).sort(), actual = tests(report);
    assert(ids.length > 0); assert(ids.every(id => expected.includes(id) && !seen.has(id)));
    assert(tests(listed).every(item => metadata.get(item.id) === item.semantic), 'Shard collection metadata differs from the whole list');
    assert.deepEqual(actual.map(item => item.id).sort(), ids);
    assert.deepEqual(actual.map(item => [item.id, item.semantic]).sort(), tests(listed).map(item => [item.id, item.semantic]).sort(), 'Listed/executed metadata differs');
    assert.equal(report.stats.expected, ids.length);
    for (const key of ['unexpected', 'skipped', 'flaky']) assert.equal(report.stats[key], 0);
    for (const { test } of actual) {
      assert.equal(test.projectName, engine); assert.equal(test.expectedStatus, 'passed'); assert.equal(test.results.length, 1);
      assert.equal(test.results[0].status, 'passed'); assert.equal(test.results[0].retry, 0);
    }
    for (const id of ids) seen.add(id);
  }
  assert.deepEqual([...seen].sort(), expected);
  return { passed: expected.length, identities_sha256: sha(JSON.stringify(expected)),
    semantic_identities_sha256: sha(JSON.stringify(whole.map(item => item.semantic).sort())), exact_collection_union: true, retries: 0, skips: 0 };
}
export function archive(descriptor) {
  const tarball = descriptor.tarball; assert.equal(sha(read(tarball)), descriptor.sha256); assert.equal(read(tarball).length, descriptor.size);
  const tar = gunzipSync(read(tarball)), members = new Map(); let position = 0, headers = 0, pax = {};
  const text = (bytes, start, length) => bytes.subarray(start, start + length).toString('utf8').split('\0')[0];
  while (position + 512 <= tar.length) {
    const header = tar.subarray(position, position + 512); if (header.every(byte => byte === 0)) break;
    let checksum = 0; for (let i = 0; i < 512; i++) checksum += i >= 148 && i < 156 ? 32 : header[i];
    assert.equal(checksum, parseInt(text(header, 148, 8).trim(), 8)); headers++;
    const size = parseInt(text(header, 124, 12).trim() || '0', 8), type = text(header, 156, 1);
    assert(Number.isSafeInteger(size) && size >= 0); const data = tar.subarray(position + 512, position + 512 + size); assert.equal(data.length, size);
    if (type === 'x' || type === 'g') {
      for (const line of data.toString('utf8').trimEnd().split('\n')) { const match = /^\d+ ([^=]+)=(.*)$/.exec(line); assert(match); pax[match[1]] = match[2]; }
    } else {
      const prefix = text(header, 345, 155), name = pax.path ?? ((prefix ? prefix + '/' : '') + text(header, 0, 100)); pax = {};
      assert(type === '0' || type === ''); assert(name.startsWith('package/')); const file = name.slice(8);
      assert(!path.isAbsolute(file) && !file.includes('\\') && !file.split('/').some(part => !part || part === '.' || part === '..'));
      assert(!members.has(file)); assert(/^(build\/|src\/|README\.md$|LICENSE$|package\.json$)/.test(file)); members.set(file, data);
    }
    position += 512 + Math.ceil(size / 512) * 512;
  }
  assert(position + 1024 <= tar.length && tar.subarray(position).every(byte => byte === 0), 'Tar end blocks');
  assert.deepEqual([...members.keys()].sort(), descriptor.files.map(file => file.path).sort());
  let bytes = 0; const payloads = [];
  for (const file of descriptor.files) {
    const data = members.get(file.path); assert.equal(data.length, file.size); assert.deepEqual(data, read(file.path), file.path); bytes += data.length;
    payloads.push({ path: file.path, sha256: sha(data), bytes: data.length });
  }
  assert.equal(bytes, descriptor.unpackedSize);
  return { tarball: reference(tarball), files: members.size, unpacked_bytes: bytes, headers, actual_payloads: payloads };
}
export function performance(binding, viewport) {
  let medians = 0, durations = 0, stageSamples = 0, cycleWindows = 0, blockRecords = 0, nativeMerges = 0;
  const median = values => [...values].sort((a, b) => a - b)[2];
  assert.equal(binding.schema, 'natural-js-m4-benchmark/v1'); assert.equal(viewport.schema, 'natural-js-grid-viewport-benchmark/v1');
  for (const report of [binding, viewport]) assert.equal(report.environment.browser, 'chromium');
  const bindingStages = ['initial', 'rebind', 'edit', 'sort', 'filter', 'dispose'], viewportStages = ['initial', 'reveal', 'scroll', 'columns', 'paste', 'move', 'append', 'dispose'];
  assert.deepEqual(binding.scenarios.map(scenario => scenario.kind + ':' + scenario.count).sort(),
    ['flat:100', 'flat:1000', 'nested-auto:100', 'nested-auto:1000', 'nested-explicit:100', 'nested-explicit:1000'].sort());
  for (const report of [binding, viewport]) {
    assert.equal(report.status, 'ok'); assert.equal(report.method.runs, 5); assert.equal(report.method.warmup, 2);
    for (const scenario of report.scenarios) {
     assert.deepEqual(Object.keys(scenario.metrics).sort(), (report === binding ? bindingStages : viewportStages).toSorted());
     for (const metric of Object.values(scenario.metrics)) {
      assert.equal(metric.samples.length, 5); const values = metric.samples.map(sample => sample.durationMs).sort((a, b) => a - b);
      assert(values.every(value => Number.isFinite(value) && value >= 0)); assert.equal(metric.medianMs, values[2]); medians++; durations += values.length;
     }
    }
  }
  assert.equal(binding.method.columns, 10); assert.deepEqual(binding.method.counts, [100, 1000]);
  assert.deepEqual(binding.method.kinds, ['flat', 'nested-auto', 'nested-explicit']); assert.equal(binding.scenarios.length, 6);
  for (const scenario of binding.scenarios) for (const [stage, metric] of Object.entries(scenario.metrics)) {
    for (const [name, raw] of [['medianElementCount', 'elementCount'], ['medianRowCount', 'rowCount']]) assert.equal(metric[name], median(metric.samples.map(sample => sample[raw])));
    assert(metric.samples.every(sample => sample.rowCount === (stage === 'filter' ? scenario.count / 2 : stage === 'dispose' ? 1 : scenario.count)));
  }
  for (const [kind, budgets] of Object.entries(bindingBudgets)) for (const [key, limit] of Object.entries(budgets)) {
    assert(binding.scenarios.find(scenario => scenario.kind === kind && scenario.count === 1000).metrics[key].medianMs <= limit, `${kind}/${key}`);
  }
  assert.deepEqual(viewport.budgets, viewportBudgets); assert.deepEqual(viewport.failures, []);
  assert.equal(viewport.method.count, 5000); assert.equal(viewport.method.rootHeight, 400);
  assert.deepEqual(viewport.scenarios.map(scenario => scenario.kind), ['flat', 'nested', 'blocks']);
  function geometry(sample) {
    const records = sample.recordGeometry ?? [], physical = new Set(); assert(records.length * 2 <= 64);
    if (sample.mountedRowCount !== undefined) { assert.equal(records.length * 2, sample.mountedRowCount); assert.equal(records.length, sample.mountedLogicalRowCount); }
    for (const row of records) {
      assert.equal(row.rowHeights.length, 2); assert(row.rowHeights.every(height => height > 0)); assert(row.height > 0);
      assert(Math.abs(row.bottom - row.top - row.height) < 1e-6); assert(Math.abs(row.rowHeights.reduce((sum, height) => sum + height, 0) - row.height) < 1e-6);
      physical.add(row.index * 2 + 2); physical.add(row.index * 2 + 3); blockRecords++;
    }
    for (const index of sample.intersectingRowIndexes) assert(physical.has(index));
    for (const merge of sample.nativeMerges ?? []) {
      assert(merge.rowSpan > 2 && merge.height > 0); for (let index = 0; index < merge.rowSpan; index++) assert(physical.has(merge.rowIndex + index)); nativeMerges++;
    }
  }
  for (const scenario of viewport.scenarios) {
    assert.equal(scenario.count, 5000); assert.equal(scenario.samples.length, 5);
    for (const [stage, metric] of Object.entries(scenario.metrics)) {
      assert.deepEqual(metric.samples, scenario.samples.map(sample => sample[stage]));
      for (const [name, raw] of [['medianMountedRowCount', 'mountedRowCount'], ['medianElementCount', 'elementCount'], ['medianNodeCount', 'nodeCount']]) assert.equal(metric[name], median(metric.samples.map(sample => sample[raw])));
    }
    for (const [key, limit] of Object.entries(viewportBudgets[scenario.kind])) assert(scenario.metrics[key].medianMs <= limit, `${scenario.kind}/${key}`);
    for (const sample of scenario.samples) {
      for (const stage of Object.keys(scenario.metrics)) {
        const value = sample[stage]; stageSamples++;
        assert(scenario.kind === 'blocks' ? value.mountedRowCount <= 64 : value.mountedRowCount < 80);
        assert.equal(value.logicalRowCount, ['append', 'dispose'].includes(stage) ? 5250 : 5000);
        if (stage === 'dispose') { assert.equal(value.mountedRowCount, 0); assert.equal(value.spacerCount, 0); assert.deepEqual(value.intersectingRowIndexes, []); }
        else { assert(value.mountedRowCount > 0 && value.intersectingRowIndexes.length > 0); assert(value.measuredHeightRange[0] > 0 && value.measuredHeightRange[0] < value.measuredHeightRange[1]); assert(value.spacerCount <= 2); }
        if (scenario.kind === 'blocks') geometry(value);
      }
      assert(Math.min(...sample.scroll.intersectingRowIndexes) > Math.min(...sample.reveal.intersectingRowIndexes));
      assert.equal(sample.cycling.count, 20); assert.equal(sample.cycling.windows.length, 20);
      for (const window of sample.cycling.windows) { cycleWindows++; assert(window.intersectingRowIndexes.length > 0); assert(Number.isFinite(window.scrollTop) && window.scrollTop >= 0); if (scenario.kind === 'blocks') geometry(window); }
      assert.equal(sample.append.logicalRowCount, 5250); assert.equal(sample.append.appendedCount, 250); assert.equal(sample.append.appendEvents, 1);
      assert.equal(sample.append.firstId, 5001); assert.equal(sample.append.lastId, 5250);
      for (const key of ['snapshotsPreserved', 'cleanRows', 'changesPreserved', 'focusedDraftPreserved']) assert.equal(sample.append[key], true);
      assert(Math.abs(sample.append.anchor.afterTop - sample.append.anchor.beforeTop) <= 1); assert(Math.abs(sample.append.anchor.afterScrollTop - sample.append.anchor.beforeScrollTop) <= 1); assert.equal(sample.dispose.logicalRowCount, 5250);
      assert.equal(sample.cleanup.exactAuthoredMarkup, true); assert.equal(sample.cleanup.quietAfterLateEvents, true); assert.equal(sample.cleanup.observedLateMutations, 0);
      assert(Math.max(sample.cycling.maximumMounted, sample.append.maximumMounted) < (scenario.kind === 'blocks' ? 65 : 80));
      const counters = sample.domCounters; assert(counters.beforeFixture && counters.afterDispose);
      assert(counters.afterCycles.nodes <= counters.beforeCycles.nodes + sample.cycling.maximumElements * 2);
      assert(counters.afterCycles.jsEventListeners <= counters.beforeCycles.jsEventListeners + 20);
      assert(counters.afterAppend.nodes <= counters.afterCycles.nodes + sample.append.maximumElements * 2);
      assert(counters.afterAppend.jsEventListeners <= counters.afterCycles.jsEventListeners + 20);
      for (const [key, allowance] of Object.entries({ nodes: 8, jsEventListeners: 0, documents: 0 })) assert(counters.afterDispose[key] <= counters.beforeFixture[key] + allowance);
    }
  }
  assert.equal(medians, 60); assert.equal(durations, 300);
  assert.equal(stageSamples, 120); assert.equal(cycleWindows, 300); assert(blockRecords > 0 && nativeMerges > 0);
  return { raw_medians: medians, raw_durations: durations, binding_budgets: bindingBudgets, viewport_budgets: viewportBudgets, checked_budgets: 30,
    stage_samples: stageSamples, cycle_windows: cycleWindows, block_records: blockRecords, native_merges: nativeMerges };
}
