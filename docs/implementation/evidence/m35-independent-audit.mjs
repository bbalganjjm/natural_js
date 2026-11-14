import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dir, required, sha, read, json, normalized, git, reference, verifyRef, verifyProtection,
  unchangedEvidence, inventory, tree, output, tests, parentCollection, retainedProof, browserProof, archive, performance } from "./stage-metadata.mjs";

const self = "node_modules/.cache/m35-independent-audit.mjs", stem = "node_modules/.cache/m35-independent-audit";
let destination = stem + ".log";
for (let n = 2; fs.existsSync(destination); n++) destination = stem + "-" + n + ".log";
const baseline = "fd5c66a507b140b8648907759395204ac4fe69d6";
const report = { kind: "independent_recorded_byte_audit", stage: "M3.5", started: new Date().toISOString(), baseline,
  helper: reference(self), limits: ["Only existing recorded bytes are read. No compiler, browser, benchmark, model, or project checker is invoked.",
    "Shared reviewed metadata routines decode actual archive, performance, and browser proofs; exact source, commands, attempts, and inheritance are separately checked below.",
    "This audit grants no full-family closure, omission, release, native-conformance, Safari, manual assistive-technology, or token result. Historical failures keep their original scope."] };

try {
  const [receiptPath, expectedHash] = process.argv.slice(2);
  assert.equal(process.argv.length, 4); assert(/^[0-9a-f]{64}$/.test(expectedHash ?? ""));
  assert.equal(sha(read(receiptPath)), expectedHash, "Announced immutable M3.5 receipt");
  const receipt = json(receiptPath); assert.equal(receipt.schema, "natural-js-recorded-runtime/v1");
  assert.equal(receipt.stage, "M3.5"); assert.equal(receipt.prefix, "m35"); assert.equal(receipt.baseline_commit, baseline);
  report.receipt = { path: receiptPath, sha256: expectedHash, bytes: read(receiptPath).length };
  verifyRef(receipt.setup); const setup = json(receipt.setup.path);
  assert.equal(setup.stage, "M3.5"); assert.equal(setup.head, baseline); assert.equal(setup.baseline_commit, baseline); assert.equal(setup.working_parent, null);
  verifyProtection(setup); unchangedEvidence(baseline, "m35");
  report.shared_read_only_metadata = reference("node_modules/.cache/stage-metadata.mjs");
  assert.equal(report.shared_read_only_metadata.sha256, setup.helpers.find(ref => /stage-metadata-/.test(ref.path)).sha256);
  verifyRef(setup.parent_receipt); assert.equal(setup.parent_receipt.path, dir + "/m34-runtime-receipt.json");
  assert.equal(setup.parent_receipt.sha256, "81f5a4c517d539fa165b412c5b33ab0ba812cb7110bbb44e13de491316332a7e");
  const previous = json(setup.parent_receipt.path); assert.equal(previous.recorded_attempts, 23);
  assert.equal(previous.checks.unit.passed, 155); assert.equal(previous.checks.full_suites.chromium.passed, 906);
  for (const ref of [...previous.retained_files, ...previous.builder]) verifyRef(ref);
  const parentFiles = [];
  for (const name of fs.readdirSync(dir).filter(name => name.startsWith("m34-"))) {
    const file = dir + "/" + name; parentFiles.push(...(fs.statSync(file).isDirectory() ? tree(file) : [reference(file)]));
  }
  const protectedParent = setup.protected_files.filter(ref => ref.path.startsWith(dir + "/m34-"));
  assert.deepEqual(protectedParent.map(ref => ref.path).sort(), parentFiles.map(ref => ref.path).sort());
  for (const ref of protectedParent) { verifyRef(ref); assert.deepEqual(read(ref.path), git("show", baseline + ":" + ref.path), ref.path); }
  const attributes = reference(dir + "/.gitattributes"); assert.equal(attributes.sha256, "48747480eddba024928d03be9bf83dc579e5515768647507a767e8187a85c9ab");
  assert.deepEqual(read(attributes.path), Buffer.from("** -text\n")); assert.deepEqual(read(attributes.path), git("show", baseline + ":" + attributes.path));
  assert.deepEqual(git("check-attr", "-z", "text", "--", attributes.path, receiptPath).toString().split("\0"),
    [attributes.path, "text", "unset", receiptPath, "text", "unset", ""]);
  report.parent = { receipt: setup.parent_receipt, original_attempts: 23, exact_committed_parent_prefix_files: protectedParent.length,
    raw_git_attributes: attributes, scope: "Committed M3.4 and all protected ancestors retain their exact bytes, attempts, controls, and prior limitations; no historical runtime is rerun or recertified." };

  verifyRef(receipt.inputs); assert.equal(receipt.inputs.entries, 209);
  const files = inventory(), current = Object.fromEntries(files.map(file => [file, sha(normalized(read(file)))])), oldInputs = json(previous.inputs.path);
  assert.deepEqual(Object.keys(json(receipt.inputs.path)), files); assert.deepEqual(json(receipt.inputs.path), current);
  assert.deepEqual(files.filter(file => !Object.hasOwn(oldInputs, file)), ["tests/browser/configuration.spec.ts", "tests/configuration.test.ts"]);
  assert.deepEqual(Object.keys(oldInputs).filter(file => !Object.hasOwn(current, file)), []);
  const approved = {
    "src/ui/grid.ts": "ac2bfee89f0c897897531a4882f95d8bcf10736156eabd86fcfbe87d81b73737",
    "src/ui/list.ts": "3ccf85fd9badbed72c6c9a32e251439f00f450660396285faf3923493e1274cb",
    "src/ui/tree.ts": "18219e9f309ff188a8234e6dc0b1c21d21b088daf28994f91031b08ce3b508c9",
    "src/comm/index.ts": "00d14005d526d9cf31fd863e600894efe5e997f9de40d9a4f19e91320dfab4de",
    "src/ui/index.ts": "5868e2d841fd661cf8b3493efb880e85d418710db602585ebbbe02f3868f28a5",
    "src/ui/rules.ts": "6608c910782124ab1ceee0ff1014abed96199598d8989c2b8c2a3572aac70772",
    "src/ui/grid-selection.ts": "69d8df662685050ead09410acb896d2e6971c64470a428b660516a40a5de52ec",
    "tests/consumers/browser/main.js": "006e7f38f68c963c861f579e9f0a84b703ba1c7a553778099d5eb7e01a302484",
    "tests/consumers/ts/check.ts": "34660017e286e373e1e1d704634ebce6014a8136cd70ab187eb2a7e4b4f2490e",
    "tools/check-packed-browser.mjs": "696951ac664ccd377d4353212dcd1520bfa1c0693ef1cd0b83d0a6b4e532614c",
    "tests/configuration.test.ts": "28975220d42710dedf045f66348e9c5efffbff006d32ec38e94822b05cabb9d0",
    "tests/browser/configuration.spec.ts": "9136ce80876944c01c1115d3bc6455bad042a0ddfb4b74f9f6eaa661d377463c"
  };
  const changed = files.filter(file => current[file] !== oldInputs[file]); assert.deepEqual(changed.toSorted(), Object.keys(approved).sort());
  for (const [file, expected] of Object.entries(approved)) assert.equal(current[file], expected, file);
  const snapshot = reference(dir + "/m35-scoped-configuration.json"); assert.equal(snapshot.sha256, "62de95e583a271b4554361fea73139b71bdf2cf234120b3ecb4796d69c9317fc");
  const source = json(snapshot.path); assert.deepEqual(source.independent_source_review.source_sha256, approved);
  verifyRef(source.independent_source_review.report); assert.equal(source.independent_source_review.report.sha256, "79dba3b79f8725413cb43e9db85071d2ea305aefbe9b8950c3c6bce487e431f0");
  verifyRef(source.independent_source_review.preflight); assert.equal(source.independent_source_review.preflight.sha256, "8d1d11226272cb9ac8eed12f949c93010f4e39df63ebcdeec9b5ca111267e543");
  verifyRef(source.declarations); assert.equal(source.declarations.sha256, "9775168b228d3d629d91c49d2fd01aa9270ebde0c07e93ecff5f51b054900c13");
  assert.equal(source.runtime_receipt, null); assert.equal(source.independent_raw_review, "pending"); assert.equal(source.independent_documents, "pending");
  report.inputs = { ...receipt.inputs, changed_paths: changed, added_paths: ["tests/browser/configuration.spec.ts", "tests/configuration.test.ts"] };
  report.source_review = { snapshot, connected_review: source.independent_source_review.report, owned_paths: 12, source_sha256: approved,
    scope: "Immutable pre-canonical source/focus observations keep their pending-at-capture fields. The final wrapper owns later acceptance." };

  verifyRef(receipt.records); const records = read(receipt.records.path).toString().trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
  assert.equal(records.length, receipt.recorded_attempts); const latest = new Map();
  for (const record of records) if (required.includes(record.label)) latest.set(record.label, record);
  assert.deepEqual([...latest.keys()].sort(), [...required].sort()); assert.equal(receipt.canonical_gates, 16);
  assert.deepEqual(Object.fromEntries(required.map(label => [label, latest.get(label)])), receipt.canonical);
  const other = records.filter(record => latest.get(record.label) !== record); assert.deepEqual(other, receipt.retained_other_attempts);
  assert(other.every(record => record.label.startsWith("focused-") || required.includes(record.label)));
  const development = other.filter(record => record.label.startsWith("focused-")), superseded = other.filter(record => required.includes(record.label));
  assert.equal(superseded.length, 1); assert.equal(superseded[0].label, "browser-webkit"); assert.equal(superseded[0].exit_code, 1);
  const every = [], maps = new Map();
  function recorded(record) {
    every.push(record); assert(!record.driver_signal && !record.close_signal && !record.spawn_error && !record.validation_error);
    if (record.exit_code !== 0) { assert.equal(record.exit_code, 1); assert(["browser-webkit", "browser-webkit-run-1"].includes(record.label)); }
    else assert(!record.error);
    assert.equal(record.sources_unchanged, true); assert.equal(record.helpers_unchanged, true);
    for (const key of ["before", "after"]) { verifyRef(record[key]); assert.equal(record[key].entries, 209); assert.equal(record[key].sha256, receipt.inputs.sha256);
      const values = json(record[key].path); assert.deepEqual(values, current); maps.set(record[key].path, values); }
    if (record.stdout) { output(record.stdout); verifyRef(record.stderr); }
    for (const ref of [...record.helpers, ...(record.attachments ?? [])]) verifyRef(ref);
    for (const ref of record.helpers) assert.equal(sha(read(ref.source)), ref.sha256);
    for (const child of record.children ?? []) recorded(child);
  }
  for (const record of records) recorded(record);
  const leaf = records.flatMap(record => record.children ?? [record]).toSorted((a, b) => Date.parse(a.started) - Date.parse(b.started));
  let finish = -Infinity;
  for (const record of leaf) { assert(Date.parse(record.started) >= finish); finish = Date.parse(record.finished); assert(finish >= Date.parse(record.started)); }
  for (const ref of [...receipt.retained_files, ...receipt.builder]) verifyRef(ref);
  const starts = fs.readdirSync(dir).filter(name => name.startsWith("m35-") && name.endsWith("-start.json")), results = fs.readdirSync(dir).filter(name => name.startsWith("m35-") && name.endsWith("-result.json"));
  assert.equal(starts.length, results.length); assert.equal(starts.length, every.length); assert.deepEqual(receipt.incomplete_command_starts, []);
  for (const name of starts) {
    const start = json(dir + "/" + name), result = json(dir + "/" + name.replace(/-start\.json$/, "-result.json"));
    const found = every.filter(record => record.label === result.label && record.started === result.started); assert.equal(found.length, 1);
    const actual = { ...found[0] }; delete actual.build_outputs; delete actual.artifact; assert.deepEqual(actual, result);
    for (const key of ["label", "started", "before", "helpers"]) assert.deepEqual(start[key], result[key]);
    if (start.args) assert.deepEqual(start.args, result.args);
    for (const file of [name, name.replace(/-start\.json$/, "-result.json")]) assert(receipt.retained_files.some(ref => ref.path === dir + "/" + file));
  }
  const failed = records.filter(record => record.exit_code !== 0); assert.deepEqual(failed, superseded);
  report.attempts = { records: records.length, development: development.length, superseded_canonical: superseded.length, latest_canonical: latest.size, failures: failed.length,
    leaf_commands: leaf.length, captured_start_result_pairs: starts.length, maps: [...maps].map(([file]) => reference(file)) };
  const text = record => output(record.stdout).toString("utf8").replace(/\u001b\[[0-9;]*[A-Za-z]/g, ""), npm = path.join(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
  assert.deepEqual(latest.get("build").args, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.json"]);
  assert.deepEqual(latest.get("types").args, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.json", "--noEmit"]);
  assert.deepEqual(latest.get("unit").args, ["node_modules/vitest/vitest.mjs", "run"]);
  const examples = files.filter(file => file.startsWith("examples/vite/") && file.endsWith(".ts") && !["vite.config.ts", "mock-server.ts"].includes(path.basename(file)));
  assert.deepEqual(latest.get("example-types").args, ["node_modules/typescript/bin/tsc", "--ignoreConfig", "--strict", "--noEmit", "--target", "ES2022", "--module", "NodeNext", "--moduleResolution", "NodeNext", "--lib", "ES2022,DOM", ...examples]);
  assert.deepEqual(latest.get("build").build_outputs, tree("build"));
  for (const record of [latest.get("unit"), ...other.filter(record => record.label === "focused-unit")]) assert.match(text(record), /Tests\s+163 passed/);
  assert(!/\b\d+ (failed|skipped|todo)\b/.test(text(latest.get("unit")))); assert.deepEqual(receipt.checks.unit, { passed: 163 });
  report.browsers = []; let collection, semanticHash;
  for (const record of records.filter(record => record.children)) {
    const focused = record.label.startsWith("focused-"), engine = record.label.slice(8); assert(["chromium", "firefox", "webkit"].includes(engine));
    assert.equal(record.shards, 1); assert.equal(record.workers, focused ? 1 : 2);
    const primaryFocus = focused && JSON.stringify(record.focus_paths) === JSON.stringify(["tests/browser/configuration.spec.ts", "tests/browser/shared-rules.spec.ts", "tests/browser/form-presets.spec.ts"]);
    if (focused && !primaryFocus) assert.deepEqual(record.focus_paths, ["tests/browser/grid-progressive.spec.ts"]);
    if (!focused) assert.deepEqual(record.focus_paths, []);
    assert.deepEqual(record.children.map(child => child.label), [record.label + "-list", record.label + "-run-1"]);
    const [listRecord, runRecord] = record.children, list = JSON.parse(output(listRecord.stdout)), run = JSON.parse(output(runRecord.stdout));
    for (const [index, child] of record.children.entries()) { const flag = child.args.find(arg => arg.startsWith("--output=")); assert(flag?.startsWith("--output=docs/implementation/evidence/m35-"));
      assert.deepEqual(child.args, ["node_modules/@playwright/test/cli.js", "test", "-c", "tests/playwright.config.ts", ...record.focus_paths,
        "--project=" + engine, "--workers=" + record.workers, "--retries=0", "--reporter=json", flag, ...(index ? [] : ["--list"])]);
      assert.deepEqual(child.environment, { PLAYWRIGHT_BROWSERS_PATH: engine === "firefox" ? path.resolve("node_modules/.cache/playwright-m6") : null }); }
    assert.equal(list.config.workers, record.workers); assert.equal(run.config.workers, record.workers); assert.equal(list.config.shard, null); assert.equal(run.config.shard, null);
    assert(tests(list).every(item => item.test.results.length === 0));
    const listedTests = tests(list), actualTests = tests(run), expectedCases = focused ? primaryFocus ? 32 : listedTests.length : 911;
    assert(expectedCases > 0); assert.equal(listedTests.length, expectedCases); assert.deepEqual(run.errors, []);
    assert.deepEqual(actualTests.map(item => [item.id, item.semantic]).sort(), listedTests.map(item => [item.id, item.semantic]).sort());
    if (focused && !primaryFocus) assert(listedTests.every(item => JSON.parse(item.semantic)[0] === "grid-progressive.spec.ts"));
    const annotations = tests(run).flatMap(item => (item.test.annotations ?? []).filter(note => note.type === "platform-conformance-limit").map(note => ({ semantic: JSON.parse(item.semantic), description: note.description })));
    if (!focused && engine === "webkit") { assert.equal(annotations.length, 2); assert(annotations.some(note => note.description.includes("cookie withholding is not certified"))); assert(annotations.some(note => note.description.includes("wire omission is not certified"))); }
    else assert.deepEqual(annotations, []);
    if (record.exit_code) {
      assert.equal(engine, "webkit"); assert.equal(focused, false); assert.equal(record.complete, false); assert.equal(record.coverage, null);
      assert.equal(run.stats.expected, 910); assert.equal(run.stats.unexpected, 1); assert.equal(run.stats.skipped, 0); assert.equal(run.stats.flaky, 0);
      const failures = actualTests.filter(item => ["failed", "timedOut", "interrupted"].includes(item.test.results[0]?.status)); assert.equal(failures.length, 1);
      for (const item of actualTests) { assert.equal(item.test.results.length, 1); assert.equal(item.test.results[0].retry, 0); assert(["passed", "failed", "timedOut", "interrupted"].includes(item.test.results[0].status)); }
      assert.equal(JSON.parse(failures[0].semantic)[0], "grid-progressive.spec.ts");
      assert.equal(JSON.parse(failures[0].semantic).at(-1), "refresh supersedes pending work and starts a fresh first chunk");
      assert(failures[0].test.results[0].errors.some(error => /page\.goto.*Could not connect to (?:the )?server/s.test(error.message)));
      report.attempts.original_failed_browser = { label: record.label, input: record.before, list: listRecord.stdout, run: runRecord.stdout, passed: 910, failed: 1,
        actual_status: failures[0].test.results[0].status, errors: failures[0].test.results[0].errors, attachments: record.attachments, canonical_credit: 0,
        scope: "The existing test failed at page.goto before module imports. The connection failure cause is unproven; later unchanged diagnostic/full passes do not explain it." };
      continue;
    }
    assert.equal(record.complete, true); const proof = browserProof(list, [{ listed: list, report: run }], engine); assert.equal(proof.passed, expectedCases); assert.deepEqual(proof, record.coverage);
    if (!focused) { assert.deepEqual(proof, receipt.checks.full_suites[engine]); semanticHash ??= proof.semantic_identities_sha256; assert.equal(proof.semantic_identities_sha256, semanticHash); if (engine === "chromium") collection = tests(list); }
    report.browsers.push({ label: record.label, purpose: focused ? primaryFocus ? "primary_configuration" : "unchanged_grid_progressive_diagnostic" : "canonical_full", input: record.before, ...proof, list: listRecord.stdout, run: runRecord.stdout, platform_annotations: annotations });
  }
  for (const engine of ["chromium", "firefox", "webkit"]) {
    assert(report.browsers.some(record => record.label === "focused-" + engine && record.purpose === "primary_configuration" && record.passed === 32));
    assert(report.browsers.some(record => record.label === "focused-" + engine && record.purpose === "unchanged_grid_progressive_diagnostic"));
  }
  const diagnostics = report.browsers.filter(record => record.purpose === "unchanged_grid_progressive_diagnostic");
  assert(diagnostics.every(record => record.semantic_identities_sha256 === diagnostics[0].semantic_identities_sha256));
  report.original_failure_diagnostics = [];
  for (const ref of failed.flatMap(record => record.attachments ?? [])) {
    verifyRef(ref);
    if (ref.path.endsWith(".zip")) {
      const members = execFileSync("tar", ["-tf", ref.path], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }).trim().split(/\r?\n/);
      assert.equal(new Set(members).size, members.length); assert(members.every(file => !path.isAbsolute(file) && !file.split("/").includes("..")));
      assert(!members.some(file => /^(src|screenshots|screencast)\//.test(file) || file.includes("src@")));
      const events = members.filter(file => file.endsWith(".trace")).flatMap(file => execFileSync("tar", ["-xOf", ref.path, file], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }).split(/\r?\n/).filter(Boolean).map(JSON.parse));
      assert(events.length > 0); assert(!events.some(event => event.type === "screencast-frame"));
      report.original_failure_diagnostics.push({ ...ref, kind: "actual_failed_browser_trace", archive_members: members.length, trace_events: events.length, source_or_screencast_capture: false, canonical_credit: 0 });
    } else report.original_failure_diagnostics.push({ ...ref, kind: ref.path.endsWith("/error-context.md") ? "actual_failed_browser_context" : ref.path.endsWith("/.last-run.json") ? "retained_browser_run_metadata" : "retained_run_attachment", canonical_credit: 0 });
  }
  assert(report.original_failure_diagnostics.some(item => item.kind === "actual_failed_browser_trace"));
  const parentTests = parentCollection(previous), retention = retainedProof(parentTests, collection, 155, 163); assert.deepEqual(retention, receipt.parent_case_retention);
  assert.deepEqual(receipt.count_changes_from_parent, { unit: 8, browser: 5 });
  const parentKeys = new Set(parentTests.map(item => item.retained)), added = collection.filter(item => !parentKeys.has(item.retained));
  assert.equal(added.length, 5); assert(added.every(item => JSON.parse(item.semantic)[0] === "configuration.spec.ts"));
  const spec = read("tests/browser/configuration.spec.ts").toString(), titles = [...spec.matchAll(/^test\("([^"]+)"/gm)].map(match => match[1]);
  for (const match of spec.matchAll(/^  test\(`([^`]+)`/gm)) for (const kind of ["grid", "list", "tree"]) titles.push(match[1].replaceAll("${kind}", kind));
  assert.equal(titles.length, 5); assert.deepEqual(added.map(item => JSON.parse(item.semantic).at(-1)).sort(), titles.sort());
  const unitTitles = [...read("tests/configuration.test.ts").toString().matchAll(/^  it\("([^"]+)"/gm)].map(match => match[1]); assert.equal(unitTitles.length, 8);
  report.case_retention = { ...retention, added_unit_cases: 8, new_unit_cases: unitTitles, new_browser_cases: added.map(item => JSON.parse(item.semantic)), full_families_closed: 0 };

  const packed = latest.get("pack"); verifyRef(packed.artifact); const descriptor = json(packed.artifact.path), actualArchive = archive(descriptor);
  assert.deepEqual(actualArchive, receipt.checks.artifact); assert.equal(actualArchive.files, 203);
  assert.equal(actualArchive.tarball.sha256, "375b752ef05f77781bb671ce2001de5bc4bb5b1df4405f439d9114a34a03e7de");
  assert.equal(actualArchive.tarball.bytes, 361201); assert.equal(actualArchive.unpacked_bytes, 1828622);
  assert.deepEqual(packed.args, [npm, "pack", "--json", "--pack-destination", path.dirname(descriptor.tarball)]);
  const rawPack = JSON.parse(text(packed)); assert.equal(rawPack.length, 1); for (const [key, value] of Object.entries(rawPack[0])) assert.deepEqual(descriptor[key], value);
  const parentPayloads = previous.checks.artifact.actual_payloads, declarations = actualArchive.actual_payloads.filter(ref => ref.path.endsWith(".d.ts"));
  const parentDeclarations = parentPayloads.filter(ref => ref.path.endsWith(".d.ts")); assert.equal(declarations.length, 40);
  const changedDeclarations = declarations.filter(ref => ref.sha256 !== parentDeclarations.find(old => old.path === ref.path).sha256);
  assert.deepEqual(changedDeclarations.map(ref => ref.path), ["build/ui/grid-selection.d.ts", "build/ui/index.d.ts"]);
  const declarationProof = json(source.declarations.path); assert.equal(declarationProof.entries, 40); assert.equal(declarationProof.unchanged, 38);
  assert.deepEqual(declarationProof.changed, changedDeclarations.map(ref => ({ path: ref.path, before: parentDeclarations.find(old => old.path === ref.path).sha256, after: ref.sha256 })));
  assert.deepEqual(declarationProof.current_tarball, actualArchive.tarball); assert.deepEqual(declarationProof.parent_tarball, previous.checks.artifact.tarball);
  assert.deepEqual(actualArchive.actual_payloads.map(ref => ref.path), parentPayloads.map(ref => ref.path));
  const changedPayloads = actualArchive.actual_payloads.filter(ref => ref.sha256 !== parentPayloads.find(old => old.path === ref.path).sha256);
  const runtimeSources = Object.keys(approved).filter(file => file.startsWith("src/")), allowedPayloads = new Set(runtimeSources.flatMap(file => {
    const module = file.slice(4, -3); return [file, ...[".js", ".js.map", ".d.ts", ".d.ts.map"].map(extension => "build/" + module + extension)];
  }));
  assert(changedPayloads.every(ref => allowedPayloads.has(ref.path)), "No package payload outside the seven approved runtime modules may change");
  assert(runtimeSources.every(file => changedPayloads.some(ref => ref.path === file)), "Every approved source delta is present in the packed source");
  assert.notEqual(actualArchive.tarball.sha256, previous.checks.artifact.tarball.sha256);
  report.artifact = { ...actualArchive, declarations: 40, unchanged_declarations: 38, changed_declarations: changedDeclarations, changed_payloads: changedPayloads,
    scope: "Actual tar payload changes stay within the seven reviewed modules. Only UI RuleSet value unions and the private Grid selection signature change declaration bytes; all 203 filenames remain unchanged." };
  report.installed = [];
  for (const label of ["consumers", "packed-chromium", "packed-firefox", "packed-webkit", "packed-chrome", "packed-edge"]) {
    const record = latest.get(label), expected = label === "consumers" ? [npm, "run", "test:consumers", "--", "--tarball", descriptor.tarball, "--sha256", descriptor.sha256]
      : [npm, "run", "test:packed-browser", "--", "--tarball", descriptor.tarball, "--sha256", descriptor.sha256, "--browser", label.slice(7)];
    assert.deepEqual(record.args, expected); const value = text(record); assert(value.includes(descriptor.sha256));
    assert(label === "consumers" ? value.includes("JS installed consumer passed.") && value.includes("TS installed consumer passed.") : value.includes("Packed browser consumer passed (" + label.slice(7) + " "));
    report.installed.push({ label, stdout: record.stdout, stderr: record.stderr, actual_tarball_sha256: descriptor.sha256 });
  }
  assert(read("tools/check-packed-browser.mjs").toString().includes("undefinedCause: true"));
  for (const [label, file] of [["binding-performance", "benchmark-m4.mjs"], ["viewport-performance", "benchmark-grid-viewport.mjs"]]) assert.deepEqual(latest.get(label).args, ["tools/" + file, "--browser=chromium", "--runs=5", "--warmup=2"]);
  const perf = performance(JSON.parse(text(latest.get("binding-performance"))), JSON.parse(text(latest.get("viewport-performance"))));
  assert.deepEqual(perf, receipt.checks.performance); assert.deepEqual(perf.binding_budgets, previous.checks.performance.binding_budgets); assert.deepEqual(perf.viewport_budgets, previous.checks.performance.viewport_budgets); report.performance = perf;
  const decision = reference(dir + "/m32-approved-omissions.json"); assert.equal(decision.sha256, "359f3ce21a32c354f092d3b146d810bf2b3b4966bfea791142f888208f056817");
  assert.deepEqual(json(decision.path).decisions.map(item => [item.id, item.decision]), ["O01", "O02", "O03", "O04", "O05"].map(id => [id, "approved_narrow_omission"]));
  const oldPackage = JSON.parse(git("show", baseline + ":package.json")); assert.deepEqual(json("package.json").exports, oldPackage.exports); assert.equal(Object.keys(json("package.json").dependencies ?? {}).length, 0);
  assert.equal(git("diff", baseline, "--", "v1").length, 0); assert.equal(git("status", "--porcelain", "--untracked-files=all", "--", "v1").length, 0);
  const lock = "js/natural_js/@types/package-lock.json"; assert.equal(git("ls-files", "--", lock).length, 0); assert(git("check-ignore", lock).length > 0);
  assert.equal(git("branch", "--show-current").toString().trim(), "2.0.0-alpha.0");
  report.protection = { v1_unchanged: true, original_lock_ignored: true, public_entries_unchanged: true, runtime_dependencies: 0,
    branch: "2.0.0-alpha.0", head: git("rev-parse", "HEAD").toString().trim(), approved_omissions: decision, inherited_native_and_failure_limits_unchanged: true };
  report.status = "approved_independent_recorded_raw_evidence";
} catch (error) { report.status = "failed"; report.error = { message: error.message, stack: error.stack }; process.exitCode = 1; }
report.finished = new Date().toISOString(); fs.writeFileSync(destination, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
console.log(JSON.stringify({ status: report.status, output: destination, records: report.attempts?.records, inputs: report.inputs?.entries,
  suites: report.browsers?.map(record => [record.label, record.passed]), package_files: report.artifact?.files,
  medians: report.performance?.raw_medians, budgets: report.performance?.checked_budgets, error: report.error?.message }));
