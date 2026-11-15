// Usage: node stage-evidence.mjs PREFIX; writes a new runtime receipt, never semantic acceptance.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { dir, required, sha, read, json, git, writeNew, writeJson, reference, verifyRef, verifyProtection, unchangedEvidence, unique, inventory, tree, inputs, output, tests, parentCollection, retainedProof, browserProof, archive, performance } from './stage-metadata.mjs';

const prefix = process.argv[2]; assert(/^[a-z][a-z0-9-]+$/.test(prefix ?? '')); assert.equal(process.argv.length, 3);
const setupRef = reference(`${dir}/${prefix}-setup.json`), setup = json(setupRef.path);
verifyProtection(setup);
unchangedEvidence(setup.baseline_commit, prefix);
assert.equal(setup.original_lock.sha256, 'ed9165da5fa2bb5cb7c4e858370e5703941e92a2559751ccf19ee41311313afe');
assert.equal(git('diff', setup.baseline_commit, '--', 'v1').length, 0); assert.equal(git('ls-files', '--others', '--exclude-standard', '--', 'v1').length, 0);
assert.equal(git('ls-files', '--', setup.original_lock.path).length, 0); assert(git('check-ignore', setup.original_lock.path).length > 0);
const recordRef = reference(`${dir}/${prefix}-gates.jsonl`), records = read(recordRef.path).toString().trim().split('\n').filter(Boolean).map(JSON.parse);
const latest = new Map(); for (const record of records) if (required.includes(record.label)) latest.set(record.label, record);
assert.deepEqual([...latest.keys()].sort(), [...required].sort()); const frozen = inputs(prefix);
function verify(record, canonical = false) {
  verifyRef(record.before); verifyRef(record.after);
  if (record.stdout) { output(record.stdout); verifyRef(record.stderr); }
  for (const ref of record.helpers ?? []) verifyRef(ref);
  for (const child of record.children ?? []) verify(child, canonical);
  for (const ref of record.attachments ?? []) verifyRef(ref);
  if (canonical) { assert.equal(record.exit_code, 0, record.label); assert(!record.driver_signal); assert(!record.validation_error); assert(record.sources_unchanged); assert(record.helpers_unchanged); assert.equal(record.before.sha256, frozen.sha256); assert.equal(record.after.sha256, frozen.sha256); }
}
for (const record of records) verify(record);
for (const record of latest.values()) verify(record, true);
const commands = records.flatMap(record => record.children ?? [record]).toSorted((a, b) => Date.parse(a.started) - Date.parse(b.started));
let previousFinish = -Infinity;
for (const command of commands) {
  const start = Date.parse(command.started), finish = Date.parse(command.finished); assert(Number.isFinite(start) && Number.isFinite(finish));
  assert(start >= previousFinish && finish >= start, 'Recorded commands overlap or have invalid timing'); previousFinish = finish;
}
const npm = path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
assert.deepEqual(latest.get('build').args, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json']);
assert.deepEqual(latest.get('types').args, ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json', '--noEmit']);
assert.deepEqual(latest.get('unit').args, ['node_modules/vitest/vitest.mjs', 'run']);
const examples = inventory().filter(file => file.startsWith('examples/vite/') && file.endsWith('.ts') && !['vite.config.ts', 'mock-server.ts'].includes(path.basename(file)));
assert.deepEqual(latest.get('example-types').args, ['node_modules/typescript/bin/tsc', '--ignoreConfig', '--strict', '--noEmit', '--target', 'ES2022', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--lib', 'ES2022,DOM', ...examples]);
assert.deepEqual(latest.get('build').build_outputs, tree('build'), 'Compiled files changed since build');
for (const [label, file] of [['binding-performance', 'benchmark-m4.mjs'], ['viewport-performance', 'benchmark-grid-viewport.mjs']]) {
  assert.deepEqual(latest.get(label).args, ['tools/' + file, '--browser=chromium', '--runs=5', '--warmup=2']);
}
const text = label => output(latest.get(label).stdout).toString('utf8').replace(/\u001b\[[0-9;]*[A-Za-z]/g, '');
const suites = {}; let semanticIds;
for (const engine of ['chromium', 'firefox', 'webkit']) {
  const record = latest.get('browser-' + engine); assert(record.complete); assert.deepEqual(record.focus_paths, []); assert([1, 2].includes(record.workers)); assert([1, 12].includes(record.shards));
  const expectedLabels = ['list', ...Array.from({ length: record.shards }, (_, index) => record.shards === 1 ? ['run-1'] : ['list-' + (index + 1), 'run-' + (index + 1)]).flat()];
  assert.deepEqual(record.children.map(child => child.label), expectedLabels.map(label => record.label + '-' + label));
  const report = index => JSON.parse(output(record.children[index].stdout)), list = report(0), runs = [];
  for (let shard = 1; shard <= record.shards; shard++) runs.push(record.shards === 1 ? { listed: list, report: report(1) } : { listed: report(shard * 2 - 1), report: report(shard * 2) });
  for (const [index, child] of record.children.entries()) {
    const kind = expectedLabels[index], outputFlag = child.args.find(arg => arg.startsWith('--output=')); assert(outputFlag);
    const extra = kind === 'list' ? ['--list'] : kind.startsWith('list-') ? ['--list', '--shard=' + kind.slice(5) + '/' + record.shards]
      : record.shards === 1 ? [] : ['--shard=' + kind.slice(4) + '/' + record.shards];
    assert.deepEqual(child.args, ['node_modules/@playwright/test/cli.js', 'test', '-c', 'tests/playwright.config.ts', '--project=' + engine,
      '--workers=' + record.workers, '--retries=0', '--reporter=json', outputFlag, ...extra]);
    assert.deepEqual(child.environment, { PLAYWRIGHT_BROWSERS_PATH: engine === 'firefox' ? path.resolve('node_modules/.cache/playwright-m6') : null });
  }
  const proof = browserProof(list, runs, engine); assert.deepEqual(record.coverage, proof); suites[engine] = proof;
  semanticIds ??= proof.semantic_identities_sha256; assert.equal(proof.semantic_identities_sha256, semanticIds, 'Engine collection identities differ');
}
const unit = /\bTests\s+(\d+) passed\b/.exec(text('unit')); assert(unit, 'Missing unit count'); assert(!/\b\d+ (?:failed|skipped|todo)\b/.test(text('unit')));
const packed = latest.get('pack'); verifyRef(packed.artifact); const descriptor = json(packed.artifact.path), artifact = archive(descriptor);
assert.deepEqual(packed.args, [npm, 'pack', '--json', '--pack-destination', path.dirname(descriptor.tarball)]);
const rawPack = JSON.parse(text('pack')); assert.equal(rawPack.length, 1);
for (const [key, value] of Object.entries(rawPack[0])) assert.deepEqual(descriptor[key], value, 'Pack descriptor ' + key);
assert(text('consumers').includes('JS installed consumer passed.')); assert(text('consumers').includes('TS installed consumer passed.')); assert(text('consumers').includes(descriptor.sha256));
for (const label of ['consumers', 'packed-chromium', 'packed-firefox', 'packed-webkit', 'packed-chrome', 'packed-edge']) {
  const args = latest.get(label).args; assert(args.includes(descriptor.tarball)); assert(args.includes(descriptor.sha256));
  assert.deepEqual(args, label === 'consumers'
    ? [npm, 'run', 'test:consumers', '--', '--tarball', descriptor.tarball, '--sha256', descriptor.sha256]
    : [npm, 'run', 'test:packed-browser', '--', '--tarball', descriptor.tarball, '--sha256', descriptor.sha256, '--browser', label.slice(7)]);
  if (label.startsWith('packed-')) assert(text(label).includes(`Packed browser consumer passed (${label.slice(7)} `) && text(label).includes(descriptor.sha256));
}
const budgets = performance(JSON.parse(text('binding-performance')), JSON.parse(text('viewport-performance')));
const pkg = json('package.json'); assert.equal(Object.keys(pkg.dependencies ?? {}).length, 0); assert.equal(Object.keys(pkg.exports).length, 5);
const incomplete = fs.readdirSync(dir).filter(file => file.startsWith(prefix + '-') && file.endsWith('-start.json')).filter(file => !fs.existsSync(dir + '/' + file.replace(/-start\.json$/, '-result.json'))).map(file => reference(dir + '/' + file));
const builder = ['stage-evidence.mjs', 'stage-metadata.mjs'].map(name => {
  const file = path.join(path.dirname(fileURLToPath(import.meta.url)), name), target = `${dir}/${prefix}-${name.slice(0, -4)}-${sha(read(file)).slice(0, 12)}.mjs`;
  if (!fs.existsSync(target)) writeNew(target, read(file)); else assert.deepEqual(read(target), read(file)); return reference(target);
});
const retainedFiles = [];
function scan(file) { if (fs.statSync(file).isDirectory()) for (const name of fs.readdirSync(file)) scan(file + '/' + name); else retainedFiles.push(reference(file)); }
for (const file of fs.readdirSync(dir).filter(file => file.startsWith(prefix + '-'))) scan(dir + '/' + file);
const previous = setup.parent_receipt ? json(setup.parent_receipt.path) : null;
assert(previous, 'A parent runtime receipt is required');
const parentTests = parentCollection(previous), currentTests = tests(JSON.parse(output(latest.get('browser-chromium').children[0].stdout)));
assert.equal(parentTests.length, previous.checks.full_suites.chromium.passed);
const retained = retainedProof(parentTests, currentTests, previous.checks.unit.passed, Number(unit[1]));
const receipt = { schema: 'natural-js-recorded-runtime/v1', prefix, stage: setup.stage, created: new Date().toISOString(), baseline_commit: setup.baseline_commit, builder,
  setup: setupRef, inputs: frozen, records: recordRef, recorded_attempts: records.length, canonical_gates: required.length,
  checks: { unit: { passed: Number(unit[1]) }, full_suites: suites, artifact, performance: budgets, installed_js_ts: true, installed_browsers: ['chromium', 'firefox', 'webkit', 'chrome', 'edge'] },
  canonical: Object.fromEntries(required.map(label => [label, latest.get(label)])),
  retained_other_attempts: records.filter(record => latest.get(record.label) !== record), incomplete_command_starts: incomplete, retained_files: retainedFiles,
  parent_case_retention: retained, count_changes_from_parent: { unit: Number(unit[1]) - previous.checks.unit.passed,
    browser: suites.chromium.passed - previous.checks.full_suites.chromium.passed },
  review: { source: 'pending independent review', evidence: 'pending independent review', documents: 'pending independent review' },
  limits: ['Recorded-byte verification only; this helper does not execute or independently review framework behavior.',
    'Every failed or incomplete attempt grants zero canonical credit; later passing evidence does not identify an earlier failure cause.',
    'No full-family closure, omitted-feature approval, manual assistive-technology, Safari or AI/token result is inferred.',
    'Package is checked from actual gzip/tar headers and payload bytes against its descriptor and current workspace; no previous-artifact equality is assumed.'] };
const target = unique(`${dir}/${prefix}-runtime-receipt`, '.json'); writeJson(target, receipt);
console.log(JSON.stringify({ receipt: reference(target), inputs: frozen.entries, records: records.length, units: Number(unit[1]), suites, package_files: artifact.files, budgets }));
