// Only recorded metadata and mocked Git calls: no project, browser, compiler or actual git add executes.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import * as meta from './stage-metadata.mjs';

const runnerPath = 'node_modules/.cache/stage-run-working-parent.mjs', gitPath = 'node_modules/.cache/stage-git-working-parent.mjs';
const runner = fs.readFileSync(runnerPath, 'utf8'), gitSource = fs.readFileSync(gitPath, 'utf8');
const proofText = runner.slice(runner.indexOf('function verifyWorkingParent('), runner.indexOf('const [prefix, stage, phase,'));
const gitText = gitSource.slice(gitSource.indexOf('function protectedEvidencePaths('), gitSource.indexOf('const [prefix,phase]'));
function proofs(overrides = {}) {
  const deps = { fs, path, assert, ...meta, ...overrides }, names = Object.keys(deps);
  return new Function(...names, proofText + '\nreturn {verifyWorkingParent,checkParentGit};')(...names.map(name => deps[name]));
}
const permission = new Function('assert', 'dir', 'prefix', gitText + '\nreturn {protectedEvidencePaths,stagePathAllowed,addBatches};')(assert, meta.dir, 'm32final');
const cases = [];
function check(name, action, reject = false) { const progress=JSON.stringify({checking:name})+'\n';console.log(progress.trim());fs.appendFileSync('node_modules/.cache/stage-working-parent-selfcheck-progress.jsonl',progress);if (reject) assert.throws(action, undefined, name); else action(); cases.push({ name, passed: true, expected: reject ? 'reject' : 'accept' }); }
const parent = meta.dir + '/m32-runtime-receipt.json', expected = '74d9c886f6591039e827e135243a16d21917ba933e0b8c15973498d1a9112cb2';
const baseline = '3a9a2c8c8ac978dd39df66c5e9a864ee062ce56c';
let working;
check('actual immutable R0 and all linked metadata/artifact refs', () => { working = proofs().verifyWorkingParent(parent, expected, 'M3.2', baseline, 'm32final'); });
check('wrong bound hash', () => proofs().verifyWorkingParent(parent, '0'.repeat(64), 'M3.2', baseline, 'm32final'), true);
check('wrong current stage', () => proofs().verifyWorkingParent(parent, expected, 'M3.3', baseline, 'm32final'), true);
check('wrong current baseline', () => proofs().verifyWorkingParent(parent, expected, 'M3.2', '0'.repeat(40), 'm32final'), true);
check('parent and current prefixes must differ', () => proofs().verifyWorkingParent(parent, expected, 'M3.2', baseline, 'm32'), true);
function changedParent(update) {
  const value = meta.json(parent); update(value); const bytes = Buffer.from(JSON.stringify(value));
  const read = file => file === parent ? bytes : meta.read(file);
  const verifyRef = ref => { assert.equal(meta.sha(read(ref.path)), ref.sha256); if (ref.bytes !== undefined) assert.equal(read(ref.path).length, ref.bytes); };
  return { hash: meta.sha(bytes), fns: proofs({ read, json: file => JSON.parse(read(file)), reference: file => ({ path: file, sha256: meta.sha(read(file)), bytes: read(file).length }), verifyRef }) };
}
check('wrong parent schema even with its new matching hash', () => { const changed = changedParent(value => { value.schema = 'other'; }); changed.fns.verifyWorkingParent(parent, changed.hash, 'M3.2', baseline, 'm32final'); }, true);
check('wrong parent stage even with its new matching hash', () => { const changed = changedParent(value => { value.stage = 'M3.3'; }); changed.fns.verifyWorkingParent(parent, changed.hash, 'M3.2', baseline, 'm32final'); }, true);
check('wrong parent baseline even with its new matching hash', () => { const changed = changedParent(value => { value.baseline_commit = '0'.repeat(40); }); changed.fns.verifyWorkingParent(parent, changed.hash, 'M3.2', baseline, 'm32final'); }, true);
check('changed original retained file', () => {
  const target = meta.json(parent).retained_files[0].path, read = file => file === target ? Buffer.from('changed') : meta.read(file);
  const verifyRef = ref => assert.equal(meta.sha(read(ref.path)), ref.sha256);
  proofs({ read, verifyRef }).verifyWorkingParent(parent, expected, 'M3.2', baseline, 'm32final');
}, true);
const immutable = meta.json(meta.json(parent).setup.path).protected_files.filter(ref => ref.path.startsWith(meta.dir + '/') && !ref.path.startsWith(meta.dir + '/m32-')).sort((a,b) => a.bytes-b.bytes)[0];
check('explicit mode skips only exact snapshotted parent evidence', () => {
  const calls = [], git = (...args) => { calls.push(args); return meta.read(args[1].slice(baseline.length + 1)); };
  proofs({ git }).checkParentGit([parent, immutable.path], working, baseline);
  assert.equal(calls.length, 1); assert.equal(calls[0][1], baseline + ':' + immutable.path);
});
check('default committed-parent Git guard remains strict', () => proofs({ git: () => { throw new Error('not committed'); } }).checkParentGit([parent], null, baseline), true);
check('a nonprefix path cannot use the working exception', () => {
  const injected = { ...working, snapshot: [...working.snapshot, immutable] };
  proofs({ git: () => Buffer.from('different Git bytes') }).checkParentGit([immutable.path], injected, baseline);
}, true);
check('an unlisted sibling under the old prefix remains Git-bound', () => proofs({ git: () => { throw new Error('not committed'); } }).checkParentGit([meta.dir + '/m32-unlisted.json'], working, baseline), true);
check('snapshot refs are rechecked before skipping Git', () => proofs({ verifyRef: () => { throw new Error('changed snapshot'); } }).checkParentGit([parent], working, baseline), true);
const listed = meta.dir + '/m32-parent/error-context.md', owned = new Set(Array.from({ length: 13 }, (_, index) => `src/owned-${index}.ts`));
const ancestors = permission.protectedEvidencePaths({ protected_files: [{ path: listed }, { path: 'tools/fixture.mjs' }] });
check('exact ancestor and all thirteen reviewed source paths stage', () => { assert(permission.stagePathAllowed(listed, owned, ancestors)); for (const file of owned) assert(permission.stagePathAllowed(file, owned, ancestors)); });
check('same ancestor prefix does not grant sibling permission', () => assert(permission.stagePathAllowed(meta.dir + '/m32-parent/other.md', owned, ancestors)), true);
check('protected non-evidence source does not gain permission', () => assert(permission.stagePathAllowed('tools/fixture.mjs', owned, ancestors)), true);
check('unsafe ancestor path is rejected', () => permission.protectedEvidencePaths({ protected_files: [{ path: meta.dir + '/m32-parent/../outside.json' }] }), true);
check('chunking preserves all paths and Windows argument limits', () => {
  const files = Array.from({ length: 480 }, (_, index) => meta.dir + '/m32-parent-' + index + '/' + 'x'.repeat(190) + '.json');
  const batches = permission.addBatches(files); assert.deepEqual(batches.flat(), files); assert(batches.length > 7);
  for (const batch of batches) { assert(batch.length <= 64); assert(128 + batch.reduce((sum, file) => sum + file.length * 2 + 3, 0) <= 16000); }
});
check('a single oversized path fails before any Git staging', () => permission.addBatches(['x'.repeat(8000)]), true);

function gitHarness(phase, { extra, corruptIndex, corruptAttribute, corruptSource, failProtection } = {}) {
  const prefix = 'm32final', current = meta.dir + '/m32final-runtime.json', sourcePath = 'src/owned.ts', ancestor = listed;
  const attribute=meta.dir+'/.gitattributes';
  const data = new Map([[sourcePath, Buffer.from('source\n')], [attribute, Buffer.from('** -text\n')], [current, Buffer.from('current')], [ancestor, Buffer.from('ancestor')], ['artifact', Buffer.from('tar')]]);
  const addJson = (file, value) => data.set(file, Buffer.from(JSON.stringify(value)));
  const ref = file => ({ path: file, sha256: meta.sha(data.get(file)), bytes: data.get(file).length });
  addJson('inputs', { [sourcePath]: meta.sha(data.get(sourcePath)) });
  addJson('setup', { protected_files: [ref(ancestor)] });
  addJson('source', { independent_source_review: { source_sha256: { [sourcePath]: meta.sha(data.get(sourcePath)), [attribute]:meta.sha(data.get(attribute)) } } });
  addJson('raw', { setup: ref('setup'), inputs: ref('inputs'), checks: { artifact: { tarball: { path: 'artifact' } } } });
  const wrapperPath = meta.dir + '/m32final-verification.json';
  addJson(wrapperPath, { status: 'selected_outcomes_verified_remaining_owners_open', baseline_commit: baseline, runtime: ref('raw'), source_review: ref('source'), documents: { semantic_files: [], mechanical: { checks: {} } } });
  if(corruptSource)data.set(attribute,Buffer.from('changed attribute'));
  const calls = [], added = [], verify = reference => { assert.equal(meta.sha(data.get(reference.path)), reference.sha256); };
  const context = { assert, dir: meta.dir, json: file => JSON.parse(data.get(file)), read: file => data.get(file), sha: meta.sha, normalized: meta.normalized,
    verifyRef: verify, verifyProtection: setup => { calls.push('protection'); if (failProtection) throw new Error('protected parent changed'); for (const ref of setup.protected_files) verify(ref); },
    unchangedEvidence: () => {}, reference: ref, tree: () => [], process: { argv: ['node', gitPath, prefix, phase] }, console: { log() {} },
    fs: { readdirSync: () => ['m32final-runtime.json', 'm32final-verification.json'], statSync: () => ({ isDirectory: () => false }) },
    git: (...args) => {
      calls.push(args);
      if (args[0] === 'branch') return Buffer.from('2.0.0-alpha.0\n');
      if (args[0] === 'add') { added.push(...args.slice(2)); return Buffer.alloc(0); }
      if (args[0] === 'show') {
        const file = args[1].replace(/^(HEAD)?:/, '');
        if (corruptIndex && file === ancestor) return Buffer.from('tampered Git ancestor');
        if (corruptAttribute && file === attribute) return Buffer.from('tampered non-runtime metadata');
        assert(data.has(file), 'Missing index path ' + file); return data.get(file);
      }
      if (args[0] === 'diff' && args[1] === 'HEAD') return Buffer.from([sourcePath, attribute, current, ancestor, ...(extra ? [extra] : [])].join('\0'));
      return Buffer.alloc(0);
    }
  };
  const code = gitSource.replace(/^import[^\n]*\n/gm, '');
  let error; try { vm.runInNewContext(code, context,{timeout:5000}); } catch (cause) { error = cause; }
  return { error, calls, added, ancestor, attribute };
}
check('actual stage script permits exact uncommitted ancestor', () => { const result = gitHarness('stage'); assert.ifError(result.error); assert(result.added.includes(result.ancestor)); assert(result.calls.indexOf('protection') < result.calls.findIndex(call => Array.isArray(call) && call[0] === 'add')); });
check('stage script rejects an unlisted sibling', () => { const result = gitHarness('stage', { extra: meta.dir + '/m32-parent/other.md' }); assert(result.error); assert.equal(result.added.length, 0); });
check('failed protection prevents any index mutation', () => { const result = gitHarness('stage', { failProtection: true }); assert(result.error); assert.equal(result.added.length, 0); });
check('changed reviewed non-runtime source prevents staging', () => { const result=gitHarness('stage',{corruptSource:true});assert(result.error);assert.equal(result.added.length,0); });
for (const phase of ['index', 'commit']) {
  check(phase + ' checks current and exact ancestor Git bytes', () => { const result = gitHarness(phase); assert.ifError(result.error); for(const file of [result.ancestor,result.attribute])assert(result.calls.some(call => Array.isArray(call) && call[0] === 'show' && call[1] === (phase === 'index' ? ':' : 'HEAD:') + file)); });
  check(phase + ' rejects altered ancestor Git bytes', () => { const result = gitHarness(phase, { corruptIndex: true }); assert(result.error); });
  check(phase + ' rejects changed non-runtime metadata', () => { const result=gitHarness(phase,{corruptAttribute:true});assert(result.error); });
}
const target = meta.unique('node_modules/.cache/stage-working-parent-selfcheck', '.json');
meta.writeJson(target, { kind: 'metadata_only_actual_R0_and_mocked_Git_selfcheck', runner: meta.reference(runnerPath), git_helper: meta.reference(gitPath),
  parent: working.receipt, original_R0_retained_files: working.r0_retained_files, exact_current_parent_snapshot_files: working.snapshot.length,
  additional_bookkeeping_paths: working.additional_snapshot_paths.length, cases, limits: 'No actual Git index mutation, project, compiler, browser or benchmark command. The old R0 is verified as recorded bytes, not recertified under changed source.' });
console.log(JSON.stringify({ report: meta.reference(target), checks: cases.length, passed: true, snapshot: working.snapshot.length, original_retained: working.r0_retained_files }));
