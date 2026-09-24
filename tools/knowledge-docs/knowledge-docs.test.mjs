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

test("2.0 TypeScript exports, fingerprints, and emitted declarations", (t) => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "natural-docs-"));
    t.after(() => {
        assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep));
        fs.rmSync(root, { recursive: true, force: true });
    });
    write(root, "tools/knowledge-docs/knowledge-docs.mjs", fs.readFileSync(checker, "utf8"));
    write(root, "docs/index.md", "---\nokf_version: \"0.2\"\n---\n\n# Topics\n\n* [Implementation](implementation/index.md) - Fixture.\n");
    write(root, "docs/implementation/index.md", "# Concepts\n\n* [Fixture](fixture.md) - TypeScript entry fixture.\n");
    write(root, "docs/log.md", "");
    write(root, "docs/implementation/fixture.md", [
        "---",
        "type: API Reference",
        "title: Fixture",
        "description: TypeScript entry fixture.",
        "symbols: [FrameworkError, PageContext]",
        "sources:",
        "  - id: root",
        "    resource: ../../v2/src/index.ts",
        "    symbol: FrameworkError",
        "  - id: page",
        "    resource: ../../v2/src/page/index.ts",
        "    symbol: PageContext",
        "---",
        "",
        "The fixture describes both public exports.",
        ""
    ].join("\n"));
    write(root, "v2/package.json", JSON.stringify({
        exports: {
            ".": { types: "./build/index.d.ts", import: "./build/index.js" },
            "./page": { types: "./build/page/index.d.ts", import: "./build/page/index.js" }
        }
    }));
    write(root, "v2/src/index.ts", "export class FrameworkError extends Error {}\n");
    write(root, "v2/src/page/index.ts", "export interface PageContext { name: string; }\n");
    write(root, "v2/build/index.d.ts", "export declare class FrameworkError extends Error {\n}\n");
    write(root, "v2/build/page/index.d.ts", "export interface PageContext { name: string; }\n");

    const stamp = run(root, "stamp", "docs/implementation/fixture.md");
    assert.equal(stamp.status, 0, stamp.stdout + stamp.stderr);
    const clean = run(root, "check");
    assert.equal(clean.status, 0, clean.stdout + clean.stderr);
    assert.match(clean.stdout, /0 errors, 0 warnings/);

    fs.rmSync(path.join(root, "v2/build"), { recursive: true, force: true });
    const beforeBuild = run(root, "check");
    assert.equal(beforeBuild.status, 0, beforeBuild.stdout + beforeBuild.stderr);

    write(root, "v2/build/index.d.ts", "export declare class FrameworkError extends Error {\n}\n");
    write(root, "v2/build/page/index.d.ts", "export interface WrongName { name: string; }\n");
    const mismatch = run(root, "check");
    assert.equal(mismatch.status, 1);
    assert.match(mismatch.stdout, /declaration-mismatch/);

    const git = spawnSync("git", ["init"], { cwd: root, encoding: "utf8" });
    assert.equal(git.status, 0, git.stderr);
    write(root, "v2/build/page/index.d.ts", "export interface PageContext { name: string; }\n");
    write(root, "v2/src/page/index.ts", "export interface PageContext { name: number; }\nexport type Extra = string;\n");
    const drift = run(root, "check", "--changed");
    assert.equal(drift.status, 1);
    assert.match(drift.stdout, /error drift/);
    assert.match(drift.stdout, /error uncovered-symbol/);
});
