import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const checker = path.join(path.dirname(fileURLToPath(import.meta.url)), "knowledge-docs.mjs");

function write(root, name, content) {
    const target = path.join(root, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, "utf8");
}

function run(root, command, ...args) {
    return spawnSync(process.execPath, [path.join(root, "tools/knowledge-docs/knowledge-docs.mjs"), command, ...args], {
        cwd: root,
        encoding: "utf8"
    });
}

test("wiki and work records preserve export checks, fingerprints, evidence and history", (t) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "natural-docs-"));
    t.after(() => {
        assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep));
        fs.rmSync(root, { recursive: true, force: true });
    });
    write(root, "tools/knowledge-docs/knowledge-docs.mjs", fs.readFileSync(checker, "utf8"));
    write(root, "wiki/index.md", "---\nokf_version: \"0.2\"\n---\n\n# Topics\n\n* [API](v2/index.md) - Fixture.\n");
    write(root, "wiki/v2/index.md", "# Concepts\n\n* [Fixture](fixture.md) - TypeScript entry fixture.\n");
    write(root, "wiki/log.md", "## 2026-11-15\n\n* **Creation** Split knowledge from work records.\n");
    write(root, "docs/index.md", "---\nokf_version: \"0.2\"\n---\n\n# Topics\n\n* [Implementation](implementation/index.md) - Fixture.\n");
    write(root, "docs/implementation/index.md", "# Concepts\n\n* [Plan](plan.md) - Work record fixture.\n");
    write(root, "docs/log.md", "## 2026-11-16\n\n* **Update** Work records.\n\n## 2020-01-02\n\n* **Creation** Original knowledge.\n");
    write(root, "docs/implementation/plan.md", [
        "---",
        "type: Plan",
        "title: Plan",
        "description: Work record fixture.",
        "symbols: [Extra]",
        "sources:",
        "  - id: api",
        "    resource: ../../wiki/v2/fixture.md",
        "---",
        "",
        "Implement the [Fixture](../../wiki/v2/fixture.md) contract.",
        ""
    ].join("\n"));
    write(root, "wiki/v2/fixture.md", [
        "---",
        "type: API Reference",
        "title: Fixture",
        "description: TypeScript entry fixture.",
        "symbols: [FrameworkError, PageContext]",
        "sources:",
        "  - id: root",
        "    resource: ../../src/index.ts",
        "    symbol: FrameworkError",
        "  - id: page",
        "    resource: ../../src/page/index.ts",
        "    symbol: PageContext",
        "generated: { by: process:fixture, at: 2020-01-02T00:00:00Z }",
        "---",
        "",
        "The fixture describes both public exports. See the [Plan](../../docs/implementation/plan.md).",
        ""
    ].join("\n"));
    write(root, "package.json", JSON.stringify({
        exports: {
            ".": { types: "./build/index.d.ts", import: "./build/index.js" },
            "./page": { types: "./build/page/index.d.ts", import: "./build/page/index.js" }
        }
    }));
    write(root, "src/index.ts", "export class FrameworkError extends Error {}\n");
    write(root, "src/page/index.ts", "export interface PageContext { name: string; }\n");
    write(root, "build/index.d.ts", "export declare class FrameworkError extends Error {\n}\n");
    write(root, "build/page/index.d.ts", "export interface PageContext { name: string; }\n");

    // Archived 1.x files are outside the active 2.0 docs and export checks.
    write(root, "v1/src/legacy.js", "class Legacy {\n    static helper = class {}\n}\n");
    write(root, "v1/docs/index.md", "# Archived guides\n\n[Old link](missing.md)\n");

    const stamp = run(root, "stamp", "wiki", "docs");
    assert.equal(stamp.status, 0, stamp.stdout + stamp.stderr);
    const clean = run(root, "check");
    assert.equal(clean.status, 0, clean.stdout + clean.stderr);
    assert.match(clean.stdout, /0 errors, 0 warnings/);

    const conceptName = "wiki/v2/fixture.md";
    const concept = fs.readFileSync(path.join(root, conceptName), "utf8");
    write(root, conceptName, concept.replace("2020-01-02T00:00:00Z", "2026-11-16T00:00:00Z"));
    const missingWikiLog = run(root, "check", "wiki");
    assert.match(missingWikiLog.stdout, /log-gap/);
    write(root, conceptName, concept);

    const planName = "docs/implementation/plan.md";
    const plan = fs.readFileSync(path.join(root, planName), "utf8");
    for (const type of ["API Reference", "UI Component", "Architecture Pattern"]) {
        write(root, planName, plan.replace("type: Plan", `type: ${type}`));
        const misplacedKnowledge = run(root, "check", "docs");
        assert.equal(misplacedKnowledge.status, 1);
        assert.match(misplacedKnowledge.stdout, /error knowledge-location/);
    }
    write(root, planName, plan);
    write(root, conceptName, concept.replace("type: API Reference", "type: Plan"));
    const misplacedPlan = run(root, "check", "wiki");
    assert.equal(misplacedPlan.status, 1);
    assert.match(misplacedPlan.stdout, /error work-location/);
    write(root, conceptName, concept);

    write(root, planName, plan + "\n[Missing wiki concept](../../wiki/v2/missing.md)\n");
    const brokenCrossLink = run(root, "check", "docs");
    assert.equal(brokenCrossLink.status, 1);
    assert.match(brokenCrossLink.stdout, /link-broken/);
    assert.doesNotMatch(brokenCrossLink.stdout, /wiki\/v2\/fixture.md:\d+: warn/);
    write(root, planName, plan);
    write(root, conceptName, concept + "\n[Missing work record](../../docs/implementation/missing.md)\n");
    const brokenWorkLink = run(root, "check", "wiki");
    assert.equal(brokenWorkLink.status, 1);
    assert.match(brokenWorkLink.stdout, /link-broken/);
    write(root, conceptName, concept);

    const rawName = "docs/implementation/evidence/run-1/failure/error-context.md";
    const raw = "# Browser failure\n\nOriginal recorded Markdown.\n";
    write(root, rawName, raw);
    const withEvidence = run(root, "check");
    assert.equal(withEvidence.status, 0, withEvidence.stdout + withEvidence.stderr);
    const stampedBundle = run(root, "stamp", "docs");
    assert.equal(stampedBundle.status, 0, stampedBundle.stdout + stampedBundle.stderr);
    const stampedEvidence = run(root, "stamp", "docs/implementation/evidence/run-1");
    assert.equal(stampedEvidence.status, 0, stampedEvidence.stdout + stampedEvidence.stderr);
    assert.match(stampedEvidence.stdout, /stamped 0 file/);
    if (process.platform === "win32") {
        const mixedCase = run(root, "stamp", "DOCS/implementation/EVIDENCE/run-1");
        assert.equal(mixedCase.status, 0, mixedCase.stdout + mixedCase.stderr);
        assert.match(mixedCase.stdout, /stamped 0 file/);
    }
    assert.equal(fs.readFileSync(path.join(root, rawName), "utf8"), raw);
    const explicitRaw = run(root, "stamp", rawName);
    assert.equal(explicitRaw.status, 1);
    assert.match(explicitRaw.stdout, /no frontmatter/);

    const wikiEvidence = "wiki/implementation/evidence/broken.md";
    write(root, wikiEvidence, "# This is not the raw work-evidence directory\n");
    const badWikiEvidence = run(root, "check");
    assert.equal(badWikiEvidence.status, 1);
    assert.match(badWikiEvidence.stdout, /wiki\/implementation\/evidence\/broken\.md.*frontmatter/);
    fs.unlinkSync(path.join(root, wikiEvidence));

    const malformed = "docs/implementation/evidence-extra/broken.md";
    write(root, malformed, "# Missing concept metadata\n");
    const badConcept = run(root, "check");
    assert.equal(badConcept.status, 1);
    assert.match(badConcept.stdout, /evidence-extra\/broken\.md.*frontmatter/);
    const badStamp = run(root, "stamp", "docs");
    assert.equal(badStamp.status, 1);
    assert.match(badStamp.stdout, /evidence-extra\/broken\.md.*no frontmatter/);
    assert.equal(fs.readFileSync(path.join(root, rawName), "utf8"), raw);
    fs.unlinkSync(path.join(root, malformed));

    fs.rmSync(path.join(root, "build"), { recursive: true, force: true });
    const beforeBuild = run(root, "check");
    assert.equal(beforeBuild.status, 0, beforeBuild.stdout + beforeBuild.stderr);

    write(root, "build/index.d.ts", "export declare class FrameworkError extends Error {\n}\n");
    write(root, "build/page/index.d.ts", "export interface WrongName { name: string; }\n");
    const mismatch = run(root, "check");
    assert.equal(mismatch.status, 1);
    assert.match(mismatch.stdout, /declaration-mismatch/);

    const git = spawnSync("git", ["init"], { cwd: root, encoding: "utf8" });
    assert.equal(git.status, 0, git.stderr);
    write(root, "build/page/index.d.ts", "export interface PageContext { name: string; }\n");
    write(root, "src/page/index.ts", "export interface PageContext { name: number; }\nexport type Extra = string;\n");
    const drift = run(root, "check", "--changed");
    assert.equal(drift.status, 1);
    assert.match(drift.stdout, /error drift/);
    assert.match(drift.stdout, /error uncovered-symbol/);
});
