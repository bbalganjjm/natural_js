// Usage: node stage-run.mjs PREFIX STAGE PHASE --baseline=COMMIT [--parent=RECEIPT] [--focus=PATH ...] [--workers=2] [--shards=12]
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dir, sha, read, json, git, normalized, writeNew, writeJson, reference, verifyRef, verifyProtection, unchangedEvidence, unique, inventory, tree, inputs, compressed, output, browserProof, fixtures } from './stage-metadata.mjs';

const [prefix, stage, phase, ...flags] = process.argv.slice(2), options = new Map(), focuses = [];
assert(/^[a-z][a-z0-9-]+$/.test(prefix ?? ''), 'A safe evidence prefix is required'); assert(/^M\d+(?:\.\d+)+$/.test(stage ?? ''), 'A concrete stage is required');
for (const flag of flags) {
  const match = /^--(baseline|parent|focus|workers|shards)=(.+)$/.exec(flag); assert(match, 'Unknown option ' + flag);
  if (match[1] === 'focus') focuses.push(match[2]); else { assert(!options.has(match[1]), 'Repeated option'); options.set(match[1], match[2]); }
}
const baseline = options.get('baseline'); assert(/^[0-9a-f]{40}$/.test(baseline ?? ''), 'An exact baseline commit is required');
const workers = Number(options.get('workers') ?? 2), shards = Number(options.get('shards') ?? 1);
assert([1, 2].includes(workers)); assert([1, 12].includes(shards));
for (const file of focuses) assert(file.startsWith('tests/browser/') && fs.statSync(file).isFile() && !file.includes('..'), 'Focus needs an existing browser test path');
const phases = ['dev-types', 'dev-unit', 'focus', 'source', 'pack', 'packed', 'performance', 'browser', 'browser-chromium', 'browser-firefox', 'browser-webkit', 'all'];
assert(phases.includes(phase), 'Unknown phase'); if (phase === 'focus') assert(focuses.length > 0, 'Focus cannot silently run the whole suite');
fs.mkdirSync(dir, { recursive: true });
const lock = 'node_modules/.cache/stage-gates.lock'; writeJson(lock, { pid: process.pid, prefix, stage, phase, started: new Date().toISOString() });
let interrupted = null;
const children = new Set(), stopping = new Map();
function stop(child) {
  if (!children.has(child) || stopping.has(child)) return;
  const closed = new Promise(resolve => {
    if (process.platform === 'win32') {
      const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
      killer.on('error', resolve); killer.on('close', resolve);
    } else { child.kill('SIGTERM'); resolve(); }
  });
  stopping.set(child, closed);
}
function interrupt(signal) { interrupted ??= signal; for (const child of children) stop(child); }
const sigint = () => interrupt('SIGINT'), sigterm = () => interrupt('SIGTERM');
process.on('SIGINT', sigint); process.on('SIGTERM', sigterm);
try {
  const executingHelpers = ['stage-run.mjs', 'stage-metadata.mjs', 'stage-evidence.mjs'].map(name => {
    const file = path.join(path.dirname(fileURLToPath(import.meta.url)), name), target = `${dir}/${prefix}-${name.slice(0, -4)}-${sha(read(file)).slice(0, 12)}.mjs`;
    if (!fs.existsSync(target)) writeNew(target, read(file)); else assert.deepEqual(read(target), read(file)); return { ...reference(target), source: file };
  });
  const setupFile = `${dir}/${prefix}-setup.json`;
  if (!fs.existsSync(setupFile)) {
    assert(options.has('parent'), 'First setup requires the committed previous runtime receipt');
    const protectedFiles = [...fixtures, ...inventory().filter(file => file.endsWith('.tar'))], parents = [];
    for (const file of protectedFiles) {
      const committed = git('show', `${baseline}:${file}`);
      assert.deepEqual(file.endsWith('.tar') ? read(file) : normalized(read(file)), file.endsWith('.tar') ? committed : normalized(committed), file);
    }
    if (options.has('parent')) {
      const parent = options.get('parent'); parents.push(parent);
      const previous = json(parent), parentPrefix = previous.prefix ?? path.basename(parent).replace(/-(?:verification|runtime-receipt(?:-\d+)?)\.json$/, '');
      for (const file of fs.readdirSync(dir).filter(file => file.startsWith(parentPrefix + '-'))) {
        const target = dir + '/' + file;
        if (fs.statSync(target).isDirectory()) parents.push(...tree(target).map(ref => ref.path)); else parents.push(target);
      }
      for (const ref of previous.semantic_acceptance?.inheritance ?? []) parents.push(ref.path);
    }
    for (const file of new Set(parents)) assert.deepEqual(read(file), git('show', `${baseline}:${file}`), file);
    writeJson(setupFile, { prefix, stage, baseline_commit: baseline, created: new Date().toISOString(), head: git('rev-parse', 'HEAD').toString().trim(),
      initial_worktree: git('status', '--short').toString(), source_normalization: 'UTF-8; CRLF normalized to LF; tar fixtures additionally protected as raw bytes',
      protected_files: [...new Set([...protectedFiles, ...parents])].map(reference),
      original_lock: reference('js/natural_js/@types/package-lock.json'), v1_tree: git('rev-parse', baseline + ':v1').toString().trim(),
      parent_receipt: options.has('parent') ? reference(options.get('parent')) : null, helpers: executingHelpers });
  }
  const setup = json(setupFile); assert.equal(setup.baseline_commit, baseline); assert.equal(setup.stage, stage);
  assert.equal(git('branch', '--show-current').toString().trim(), '2.0.0-alpha.0');
  verifyProtection(setup);
  unchangedEvidence(baseline, prefix);
  assert.equal(setup.original_lock.sha256, 'ed9165da5fa2bb5cb7c4e858370e5703941e92a2559751ccf19ee41311313afe'); verifyRef(setup.original_lock);
  assert.equal(git('diff', baseline, '--', 'v1').length, 0); assert.equal(git('ls-files', '--others', '--exclude-standard', '--', 'v1').length, 0);
  const npm = path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'), cli = 'node_modules/@playwright/test/cli.js';
  const recordsFile = `${dir}/${prefix}-gates.jsonl`;
  const records = () => fs.existsSync(recordsFile) ? read(recordsFile).toString().trim().split('\n').filter(Boolean).map(JSON.parse) : [];
  const append = record => fs.appendFileSync(recordsFile, JSON.stringify(record) + '\n');
  const newStem = label => unique(`${dir}/${prefix}-${label}`, '-start.json').slice(0, -'-start.json'.length);
  async function command(label, args, env = {}, format = 'text', stem = newStem(label)) {
    assert(!interrupted, 'Driver interrupted before ' + label);
    const before = inputs(prefix), started = new Date().toISOString(), environment = { ...process.env, ...env };
    for (const [key, value] of Object.entries(environment)) if (value === null) delete environment[key];
    const stdoutPath = stem + '-stdout.partial', stderrPath = stem + '-stderr.log';
    writeJson(stem + '-start.json', { label, args, started, before, environment: env, helpers: executingHelpers, stdout_partial: stdoutPath, stderr: stderrPath });
    const out = fs.openSync(stdoutPath, 'wx'), err = fs.openSync(stderrPath, 'wx'); let spawnError, code = null, signal = null;
    try {
      const child = spawn(process.execPath, args, { env: environment, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
      if (child.pid !== undefined) children.add(child);
      child.stdout.on('data', bytes => fs.writeSync(out, bytes)); child.stderr.on('data', bytes => fs.writeSync(err, bytes));
      code = await new Promise(resolve => { child.on('error', error => { spawnError = String(error); }); child.on('close', (value, reason) => { children.delete(child); signal = reason; resolve(value); }); });
    } finally { fs.closeSync(out); fs.closeSync(err); }
    const stdout = read(stdoutPath), ref = format === 'json' ? compressed(stem + '.json.gz', stdout) : reference(stdoutPath);
    if (format === 'json') fs.unlinkSync(stdoutPath);
    const after = inputs(prefix), record = { label, args, started, finished: new Date().toISOString(), exit_code: code, close_signal: signal, driver_signal: interrupted, spawn_error: spawnError ?? null, helpers: executingHelpers,
      before, after, sources_unchanged: before.sha256 === after.sha256, stdout: ref, stderr: reference(stderrPath), environment: env,
      helpers_unchanged: executingHelpers.every(ref => sha(read(ref.source)) === ref.sha256), runtime: { node: process.version, platform: process.platform, arch: process.arch } };
    writeJson(stem + '-result.json', record); console.log(JSON.stringify({ label, exit_code: code, unchanged: record.sources_unchanged, stdout: ref.path }));
    return record;
  }
  function passed(record) { assert.equal(record.exit_code, 0, record.label); assert(!record.driver_signal, 'Driver interrupted'); assert(!record.validation_error, record.validation_error); assert(record.sources_unchanged, 'Inputs changed during ' + record.label); assert(record.helpers_unchanged, 'Verification helper changed during ' + record.label); }
  async function gate(label, args, env, format = 'text') {
    const record = await command(label, args, env, format);
    if (label === 'build' && record.exit_code === 0) record.build_outputs = tree('build');
    append(record); passed(record); return record;
  }
  const browserEnv = engine => ({ PLAYWRIGHT_BROWSERS_PATH: engine === 'firefox' ? path.resolve('node_modules/.cache/playwright-m6') : null });
  async function browser(engine, focused = false) {
    const label = (focused ? 'focused-' : 'browser-') + engine, stem = newStem(label + '-suite');
    const before = inputs(prefix), children = [], started = new Date().toISOString(), outputDir = stem + '-failures';
    writeJson(stem + '-start.json', { label, before, started, helpers: executingHelpers, output_directory: outputDir });
    const base = [cli, 'test', '-c', 'tests/playwright.config.ts', ...(focused ? focuses : []), '--project=' + engine,
      '--workers=' + (focused ? 1 : workers), '--retries=0', '--reporter=json', '--output=' + outputDir];
    let proof = null, error = null;
    const run = async (kind, extra) => {
      const record = await command(label + '-' + kind, [...base, ...extra], browserEnv(engine), 'json', stem + '-' + kind); children.push(record);
      passed(record); return JSON.parse(output(record.stdout));
    };
    try {
      const listed = await run('list', ['--list']), parts = [], count = focused ? 1 : shards;
      for (let part = 1; part <= count; part++) {
        const flag = count === 1 ? [] : ['--shard=' + part + '/' + count];
        const expected = count === 1 ? listed : await run('list-' + part, ['--list', ...flag]);
        const report = await run('run-' + part, flag); parts.push({ listed: expected, report });
      }
      proof = browserProof(listed, parts, engine);
    } catch (cause) { error = String(cause); }
    const attachments = [];
    function scan(folder) { if (fs.existsSync(folder)) for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const file = folder + '/' + entry.name; if (entry.isDirectory()) scan(file); else attachments.push(reference(file));
    } }
    scan(outputDir);
    const after = inputs(prefix), record = { label, started, finished: new Date().toISOString(), exit_code: error ? 1 : 0, error,
      before, after, sources_unchanged: before.sha256 === after.sha256, workers: focused ? 1 : workers, shards: focused ? 1 : shards,
      helpers: executingHelpers, driver_signal: interrupted, helpers_unchanged: executingHelpers.every(ref => sha(read(ref.source)) === ref.sha256),
      focus_paths: focused ? focuses : [], children, attachments, coverage: proof, complete: error === null };
    writeJson(stem + '-result.json', record); append(record); console.log(JSON.stringify({ label, complete: record.complete, coverage: proof })); passed(record);
  }
  async function types(focused) {
    const label = focused ? 'focused-' : '';
    await gate(label + 'build', ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json']);
    await gate(label + 'types', ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json', '--noEmit']);
    const files = inventory().filter(file => file.startsWith('examples/vite/') && file.endsWith('.ts') && !['vite.config.ts', 'mock-server.ts'].includes(path.basename(file)));
    await gate(label + 'example-types', ['node_modules/typescript/bin/tsc', '--ignoreConfig', '--strict', '--noEmit', '--target', 'ES2022', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--lib', 'ES2022,DOM', ...files]);
  }
  async function pack() {
    const destination = path.resolve(unique(`node_modules/.cache/${prefix}-artifact`, '-pack')); fs.mkdirSync(destination);
    const record = await command('pack', [npm, 'pack', '--json', '--pack-destination', destination], {}, 'json');
    try { if (record.exit_code === 0) {
      const results = JSON.parse(output(record.stdout)); assert.equal(results.length, 1); const result = results[0], tarball = path.join(destination, result.filename);
      const descriptor = path.join(destination, 'artifact.json'); writeJson(descriptor, { ...result, tarball, sha256: sha(read(tarball)) }); record.artifact = reference(descriptor);
    } } catch (cause) { record.validation_error = String(cause); }
    append(record); passed(record);
  }
  async function packed() {
    const packedRecord = records().filter(record => record.label === 'pack').at(-1); assert(packedRecord?.artifact, 'Run pack first'); verifyRef(packedRecord.artifact);
    const artifact = json(packedRecord.artifact.path); assert.equal(sha(read(artifact.tarball)), artifact.sha256);
    await gate('consumers', [npm, 'run', 'test:consumers', '--', '--tarball', artifact.tarball, '--sha256', artifact.sha256]);
    for (const engine of ['chromium', 'firefox', 'webkit', 'chrome', 'edge']) await gate('packed-' + engine,
      [npm, 'run', 'test:packed-browser', '--', '--tarball', artifact.tarball, '--sha256', artifact.sha256, '--browser', engine], browserEnv(engine));
  }
  if (phase === 'dev-types') await types(true);
  if (phase === 'dev-unit') await gate('focused-unit', ['node_modules/vitest/vitest.mjs', 'run']);
  if (phase === 'focus') for (const engine of ['chromium', 'firefox', 'webkit']) await browser(engine, true);
  if (['source', 'all'].includes(phase)) { await types(false); await gate('unit', ['node_modules/vitest/vitest.mjs', 'run']); }
  if (['pack', 'all'].includes(phase)) await pack();
  if (['packed', 'all'].includes(phase)) await packed();
  if (['performance', 'all'].includes(phase)) {
    await gate('binding-performance', ['tools/benchmark-m4.mjs', '--browser=chromium', '--runs=5', '--warmup=2'], browserEnv('chromium'), 'json');
    await gate('viewport-performance', ['tools/benchmark-grid-viewport.mjs', '--browser=chromium', '--runs=5', '--warmup=2'], browserEnv('chromium'), 'json');
  }
  if (['browser', 'all'].includes(phase)) for (const engine of ['chromium', 'firefox', 'webkit']) await browser(engine);
  if (phase.startsWith('browser-')) await browser(phase.slice(8));
} catch (cause) {
  console.error(cause?.stack ?? String(cause)); process.exitCode = interrupted === 'SIGINT' ? 130 : interrupted === 'SIGTERM' ? 143 : 1;
} finally {
  for (const child of children) stop(child);
  await Promise.all(stopping.values());
  if (children.size) await Promise.all([...children].map(child => new Promise(resolve => child.once('close', resolve))));
  if (interrupted) process.exitCode = interrupted === 'SIGINT' ? 130 : 143;
  process.off('SIGINT', sigint); process.off('SIGTERM', sigterm);
  if (fs.existsSync(lock) && json(lock).pid === process.pid) fs.unlinkSync(lock);
}
