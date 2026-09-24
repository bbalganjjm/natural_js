#!/usr/bin/env node
/*
 * knowledge-docs: checker and stamper for the Natural-JS OKF v0.2 bundle in docs/.
 * Zero dependencies (Node >= 18). Rules: docs/governance/okf-conventions.md
 *
 *   node tools/knowledge-docs/knowledge-docs.mjs check [path...] [--changed]
 *   node tools/knowledge-docs/knowledge-docs.mjs stamp <path...> [--by <actor>] [--verified-by <actor>]
 *
 * Exit codes: 0 = no errors, 1 = errors found, 2 = usage or internal error.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BUNDLE = path.join(REPO, "docs");
const OKF_VERSION = "0.2";
const STATUSES = new Set(["draft", "stable", "deprecated"]);
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;
const ACTOR = /^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+|human:[^\s]+|process:[^\s]+)$/;
const URL_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
// 1.x nested classes are still checked beside explicit 2.0 TypeScript entry exports.
const LEGACY_SYMBOL_SOURCES = ["src"];

class UsageError extends Error {}

// ---------------------------------------------------------------- utilities

const rel = (abs) => path.relative(REPO, abs).split(path.sep).join("/");
const textCache = new Map();

function readText(abs) {
    if (!textCache.has(abs)) textCache.set(abs, fs.readFileSync(abs, "utf8"));
    return textCache.get(abs);
}

function splitLines(text) {
    const bom = text.charCodeAt(0) === 0xfeff;
    const body = bom ? text.slice(1) : text;
    const eol = body.includes("\r\n") ? "\r\n" : "\n";
    return { bom, eol, lines: body.split(/\r?\n/) };
}

function nowIso() {
    return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

// git blob id of the file with CRLF normalised to LF; equals `git hash-object` under autocrlf.
const blobCache = new Map();
function gitBlob(abs) {
    if (!blobCache.has(abs)) {
        const content = Buffer.from(fs.readFileSync(abs).toString("latin1").replace(/\r\n/g, "\n"), "latin1");
        const hash = crypto.createHash("sha1");
        hash.update(`blob ${content.length}\0`, "latin1");
        hash.update(content);
        blobCache.set(abs, hash.digest("hex"));
    }
    return blobCache.get(abs);
}

// Case-sensitive existence check (Windows file systems ignore case; GitHub and Linux do not).
const dirCache = new Map();
function existsExact(abs) {
    if (!fs.existsSync(abs)) return { exists: false };
    const parts = path.relative(REPO, abs).split(path.sep).filter(Boolean);
    let cur = REPO;
    for (const part of parts) {
        if (part === "..") return { exists: true, caseOk: true };
        if (!dirCache.has(cur)) dirCache.set(cur, fs.readdirSync(cur));
        if (!dirCache.get(cur).includes(part)) return { exists: true, caseOk: false };
        cur = path.join(cur, part);
    }
    return { exists: true, caseOk: true };
}

// ---------------------------------------------------------------- YAML subset

function unquote(v) {
    if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
        return v.slice(1, -1).replace(/\\(["\\nt])/g, (_, c) => ({ n: "\n", t: "\t" })[c] || c);
    }
    if (v.length >= 2 && v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
    return v;
}

function splitFlow(inner) {
    const out = [];
    let cur = "", quote = null;
    for (const ch of inner) {
        if (quote) {
            cur += ch;
            if (ch === quote) quote = null;
        } else if (ch === '"' || ch === "'") {
            quote = ch;
            cur += ch;
        } else if (ch === ",") {
            out.push(cur.trim());
            cur = "";
        } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
}

function parseScalarOrFlow(raw, lineNo) {
    let v = raw.trim();
    if (!/^["']/.test(v)) v = v.replace(/\s+#.*$/, "");
    if (/^[|>]/.test(v)) throw new SyntaxError(`line ${lineNo}: block scalars are not supported`);
    if (/^[&*!]/.test(v)) throw new SyntaxError(`line ${lineNo}: anchors, aliases and tags are not supported`);
    if (v.startsWith("[")) {
        if (!v.endsWith("]")) throw new SyntaxError(`line ${lineNo}: flow list must be on one line`);
        return splitFlow(v.slice(1, -1)).map(unquote);
    }
    if (v.startsWith("{")) {
        if (!v.endsWith("}")) throw new SyntaxError(`line ${lineNo}: flow map must be on one line`);
        const obj = {};
        for (const pair of splitFlow(v.slice(1, -1))) {
            const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(pair);
            if (!m) throw new SyntaxError(`line ${lineNo}: bad flow map entry '${pair}'`);
            obj[m[1]] = unquote(m[2].trim());
        }
        return obj;
    }
    return unquote(v);
}

/*
 * Parses the frontmatter subset used by this bundle. Returns null when the file has no
 * frontmatter. Line numbers are 0-based indexes into `lines`.
 */
function parseFrontmatter(lines) {
    if (lines[0] !== "---") return null;
    const end = lines.indexOf("---", 1);
    if (end < 0) throw new SyntaxError("line 1: frontmatter is not closed with '---'");
    const data = {}, keyRange = {}, sources = [];
    let key = null, item = null;
    for (let i = 1; i < end; i++) {
        const line = lines[i];
        if (!line.trim() || /^\s*#/.test(line)) continue;
        if (/^\s*\t/.test(line)) throw new SyntaxError(`line ${i + 1}: tabs are not allowed in frontmatter`);
        const top = /^([a-z_][a-z0-9_]*):(?:\s+(.*))?$/.exec(line);
        if (top) {
            if (top[1] in data) throw new SyntaxError(`line ${i + 1}: duplicate key '${top[1]}'`);
            key = top[1];
            item = null;
            keyRange[key] = { start: i, end: i };
            data[key] = top[2] !== undefined && top[2].trim() !== "" ? parseScalarOrFlow(top[2], i + 1) : undefined;
            continue;
        }
        if (!key) throw new SyntaxError(`line ${i + 1}: expected a top-level key`);
        keyRange[key].end = i;
        const dash = /^( {2})- (.*)$/.exec(line);
        if (dash) {
            if (data[key] === undefined) data[key] = [];
            if (!Array.isArray(data[key])) throw new SyntaxError(`line ${i + 1}: '${key}' mixes a value and a list`);
            const text = dash[2];
            const kv = /^([A-Za-z_][\w-]*):(?:\s+(.*))?$/.exec(text);
            if (kv && !text.startsWith("{")) {
                item = { value: { [kv[1]]: parseScalarOrFlow(kv[2] || "", i + 1) }, start: i, end: i, fieldLine: { [kv[1]]: i } };
                data[key].push(item.value);
                if (key === "sources") sources.push(item);
            } else {
                item = null;
                const value = parseScalarOrFlow(text, i + 1);
                data[key].push(value);
                if (key === "sources") sources.push({ value, start: i, end: i, fieldLine: {}, flow: true });
            }
            continue;
        }
        const field = /^( {4})([A-Za-z_][\w-]*):(?:\s+(.*))?$/.exec(line);
        if (field && item) {
            if (field[2] in item.value) throw new SyntaxError(`line ${i + 1}: duplicate key '${field[2]}'`);
            item.value[field[2]] = parseScalarOrFlow(field[3] || "", i + 1);
            item.fieldLine[field[2]] = i;
            item.end = i;
            continue;
        }
        const nested = /^( {2})([A-Za-z_][\w-]*):(?:\s+(.*))?$/.exec(line);
        if (nested && !Array.isArray(data[key])) {
            if (data[key] === undefined) data[key] = {};
            if (typeof data[key] !== "object") throw new SyntaxError(`line ${i + 1}: '${key}' mixes a value and a map`);
            data[key][nested[2]] = parseScalarOrFlow(nested[3] || "", i + 1);
            continue;
        }
        throw new SyntaxError(`line ${i + 1}: unsupported YAML structure (see okf-conventions.md)`);
    }
    return { data, keyRange, sources, end };
}

// ---------------------------------------------------------------- symbol slices

/*
 * Resolves a dotted symbol inside a source file and returns the 12-hex sha1 of its code slice.
 * Segments follow `static NAME = ...` members (NU.grid, NA.comm.request); a `prototype`
 * segment switches to an instance method (NU.prototype.button, NU.grid.prototype.add).
 */
function symbolSlice(abs, symbol) {
    if (abs.endsWith(".ts")) {
        const entry = typescriptExports(abs).find((item) => item.symbol === symbol);
        if (!entry) return null;
        const lines = readText(abs).split(/\r?\n/);
        const slice = lines.slice(entry.start, entry.end + 1).map((line) => line.replace(/\s+$/, "")).join("\n");
        return crypto.createHash("sha1").update(slice).digest("hex").slice(0, 12);
    }
    const lines = readText(abs).split(/\r?\n/);
    const segs = symbol.split(".");
    const top = new RegExp(`^(\\s*)(export\\s+)?class\\s+${segs[0]}\\b`);
    let start = lines.findIndex((l) => top.test(l));
    if (start < 0) return null;
    let end = blockEnd(lines, start);
    let method = false;
    for (const seg of segs.slice(1)) {
        if (seg === "prototype") {
            method = true;
            continue;
        }
        const re = method ? new RegExp(`^(\\s+)(?:async\\s+)?${seg}\\s*\\([^)]*\\)\\s*\\{`) : new RegExp(`^(\\s+)static\\s+${seg}\\s*=`);
        method = false;
        let best = -1, bestIndent = Infinity;
        for (let i = start + 1; i < end; i++) {
            const m = re.exec(lines[i]);
            if (m && m[1].length < bestIndent) {
                best = i;
                bestIndent = m[1].length;
            }
        }
        if (best < 0) return null;
        start = best;
        end = blockEnd(lines, start);
    }
    const slice = lines.slice(start, end + 1).map((l) => l.replace(/\s+$/, "")).join("\n");
    return crypto.createHash("sha1").update(slice).digest("hex").slice(0, 12);
}

function blockEnd(lines, start) {
    const line = lines[start];
    const opens = (line.match(/[{[(]/g) || []).length - (line.match(/[}\])]/g) || []).length;
    if (opens <= 0) return start;
    const indent = /^\s*/.exec(line)[0];
    const close = new RegExp(`^${indent}[}\\])]`);
    for (let i = start + 1; i < lines.length; i++) if (close.test(lines[i])) return i;
    return lines.length - 1;
}

/*
 * M2 entry files deliberately use explicit named exports. This small reader handles exported
 * declarations and named export lists; it does not try to parse arbitrary TypeScript syntax.
 * Source-of-truth fingerprints stay on TS, while emitted declarations are checked when built.
 */
function typescriptSourceLines(abs) {
    return readText(abs).replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\r\n]/g, " ")).split(/\r?\n/);
}

function typescriptExports(abs) {
    const lines = typescriptSourceLines(abs);
    const out = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const decl = /^\s*export\s+(?:(?:declare|default|abstract|async)\s+)*(?:class|function|interface|type|enum|const|let|var)\s+([A-Za-z_$][\w$]*)\b/.exec(line);
        if (decl) {
            let end = lines.length - 1;
            for (let j = i + 1; j < lines.length; j++) {
                if (/^(?:export|import|declare|class|function|interface|type|enum|const|let|var)\b/.test(lines[j])) {
                    end = j - 1;
                    break;
                }
            }
            out.push({ symbol: decl[1], line: i + 1, start: i, end });
            continue;
        }
        if (!/^\s*export\s+(?:type\s+)?\{/.test(line)) continue;
        let end = i;
        while (end < lines.length && !lines[end].includes("}")) end++;
        if (end === lines.length) continue;
        const clause = /\{([^}]*)\}/.exec(lines.slice(i, end + 1).join(" "));
        if (clause) {
            for (const part of clause[1].split(",")) {
                const name = /^(?:type\s+)?([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/.exec(part.trim());
                if (name) out.push({ symbol: name[2] || name[1], line: i + 1, start: i, end });
            }
        }
        i = end;
    }
    return out;
}

function publicSymbols() {
    const symbols = [], issues = [];
    for (const dir of LEGACY_SYMBOL_SOURCES) {
        const absDir = path.join(REPO, dir);
        if (!fs.existsSync(absDir)) continue;
        for (const f of fs.readdirSync(absDir).filter((n) => n.endsWith(".js")).sort()) {
            const abs = path.join(absDir, f);
            const lines = readText(abs).split(/\r?\n/);
            const topIdx = lines.findIndex((l) => /^(export\s+)?class\s+\w+/.test(l));
            if (topIdx < 0) continue;
            const cls = /class\s+(\w+)/.exec(lines[topIdx])[1];
            const end = blockEnd(lines, topIdx);
            let childIndent = null;
            for (let i = topIdx + 1; i < end; i++) {
                const m = /^(\s+)static\s+(\w+)\s*=\s*class\b/.exec(lines[i]);
                if (!m) continue;
                if (childIndent === null) childIndent = m[1];
                if (m[1] === childIndent) symbols.push({ symbol: cls + "." + m[2], file: abs, line: i + 1 });
            }
        }
    }

    const packageFile = path.join(REPO, "v2", "package.json");
    if (!fs.existsSync(packageFile)) return { symbols, issues };
    const pkg = JSON.parse(readText(packageFile));
    for (const [entry, conditions] of Object.entries(pkg.exports || {})) {
        if (entry !== "." && !/^\.\/[A-Za-z][\w-]*$/.test(entry)) continue;
        const part = entry === "." ? "" : entry.slice(2);
        const source = path.join(REPO, "v2", "src", part, "index.ts");
        if (!fs.existsSync(source)) {
            issues.push({ file: packageFile, line: 1, rule: "entry-source-missing", msg: entry + " has no TypeScript entry " + rel(source) });
            continue;
        }
        const exports = typescriptExports(source);
        for (const item of exports) symbols.push({ symbol: item.symbol, file: source, line: item.line, entry });
        const sourceLines = typescriptSourceLines(source);
        sourceLines.forEach((line, i) => {
            if (/^\s*export\s+default\b/.test(line)) {
                issues.push({ file: source, line: i + 1, rule: "export-default", msg: "use named public exports in " + rel(source) });
            }
            if (/^\s*export\s+(?:type\s+)?\*/.test(line)) {
                issues.push({ file: source, line: i + 1, rule: "export-star", msg: "list public exports explicitly in " + rel(source) });
            }
        });
        if (!conditions || typeof conditions !== "object" || typeof conditions.types !== "string" || !/\.d\.ts$/.test(conditions.types)) {
            issues.push({ file: packageFile, line: 1, rule: "declaration-export", msg: entry + " needs an explicit .d.ts types condition" });
            continue;
        }
        const runtime = conditions.import || conditions.default;
        if (typeof runtime !== "string" || !/\.js$/.test(runtime)) {
            issues.push({ file: packageFile, line: 1, rule: "runtime-export", msg: entry + " needs an explicit .js import/default condition" });
        }
        const declaration = path.resolve(path.dirname(packageFile), conditions.types);
        if (!fs.existsSync(declaration)) continue; // A clean checkout need not build before docs:check.
        const emitted = new Set(typescriptExports(declaration).map((item) => item.symbol));
        const authored = new Set(exports.map((item) => item.symbol));
        for (const name of authored) {
            if (!emitted.has(name)) {
                issues.push({ file: declaration, line: 1, rule: "declaration-mismatch", msg: entry + " declaration omits " + name });
            }
        }
        for (const name of emitted) {
            if (!authored.has(name)) {
                issues.push({ file: declaration, line: 1, rule: "declaration-mismatch", msg: entry + " declaration has stale export " + name });
            }
        }
    }
    return { symbols, issues };
}

// ---------------------------------------------------------------- bundle model

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith(".")) continue;
        const abs = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(abs, out);
        else if (entry.name.endsWith(".md")) out.push(abs);
    }
    return out;
}

function stripCode(lines) {
    // Returns body lines with fenced blocks and inline code blanked, keeping line numbers.
    let fence = null;
    return lines.map((l) => {
        const f = /^\s*(```|~~~)/.exec(l);
        if (fence) {
            if (f && f[1] === fence) fence = null;
            return "";
        }
        if (f) {
            fence = f[1];
            return "";
        }
        return l.replace(/`+[^`]*`+/g, "");
    });
}

function loadDoc(abs) {
    const { bom, eol, lines } = splitLines(readText(abs));
    const doc = { abs, rel: rel(abs), dir: path.dirname(abs), name: path.basename(abs), bom, eol, lines, fm: null, fmError: null };
    try {
        doc.fm = parseFrontmatter(lines);
    } catch (e) {
        doc.fmError = e.message;
    }
    doc.bodyStart = doc.fm ? doc.fm.end + 1 : 0;
    return doc;
}

function resolveTarget(fromDir, target) {
    const clean = decodeURI(target.split("#")[0].split("?")[0]);
    if (!clean) return null;
    return clean.startsWith("/") ? path.join(BUNDLE, clean) : path.resolve(fromDir, clean);
}

function linksOf(doc) {
    const out = [];
    const body = stripCode(doc.lines);
    const re = /!?\[(?:[^\]\\]|\\.)*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
    for (let i = doc.bodyStart; i < body.length; i++) {
        for (const m of body[i].matchAll(re)) out.push({ target: m[1], line: i + 1 });
    }
    return out;
}

function footnotesOf(doc) {
    const out = [];
    const body = stripCode(doc.lines);
    for (let i = doc.bodyStart; i < body.length; i++) {
        for (const m of body[i].matchAll(/\[\^([^\]\s]+)\](?!:)/g)) out.push({ id: m[1], line: i + 1 });
    }
    return out;
}

function localSource(doc, src) {
    if (typeof src.resource !== "string" || URL_SCHEME.test(src.resource)) return null;
    return resolveTarget(doc.dir, src.resource);
}

// ---------------------------------------------------------------- check

function gitChanged() {
    let out;
    try {
        out = execFileSync("git", ["status", "--porcelain=v1", "-z", "--untracked-files=all"], { cwd: REPO, encoding: "utf8" });
    } catch (e) {
        throw new UsageError(`git status failed: ${e.message}`);
    }
    const changed = new Set();
    const parts = out.split("\0");
    for (let i = 0; i < parts.length; i++) {
        const entry = parts[i];
        if (!entry) continue;
        changed.add(path.resolve(REPO, entry.slice(3)));
        if (entry[0] === "R" || entry[0] === "C") i++;
    }
    return changed;
}

function check(args) {
    const changedMode = args.includes("--changed");
    const scopes = args.filter((a) => !a.startsWith("--")).map((a) => path.resolve(process.cwd(), a));
    const changed = changedMode ? gitChanged() : new Set();
    const findings = [];
    const add = (level, doc, line, rule, msg) => findings.push({ level, file: doc.rel || doc, abs: doc.abs, line, rule, msg });

    const docs = walk(BUNDLE).map(loadDoc);
    const concepts = docs.filter((d) => d.name !== "index.md" && d.name !== "log.md");
    const byAbs = new Map(docs.map((d) => [d.abs, d]));
    const log = byAbs.get(path.join(BUNDLE, "log.md"));
    const logDates = new Set();
    const drift = new Map();
    const covered = new Set();
    const inbound = new Map();

    if (log) {
        if (log.fm || log.fmError) add("error", log, 1, "log-format", "log.md must not have frontmatter");
        let prev = null;
        let inSection = false;
        log.lines.forEach((l, i) => {
            const h = /^## (.*)$/.exec(l);
            if (h) {
                inSection = true;
                const date = h[1].trim();
                if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) add("error", log, i + 1, "log-format", `date heading '${date}' is not YYYY-MM-DD`);
                else {
                    if (prev && date >= prev) add("error", log, i + 1, "log-format", `dates must be strictly descending ('${date}' after '${prev}')`);
                    prev = date;
                    logDates.add(date);
                }
            } else if (inSection && /^[*-] /.test(l) && !/^[*-] \*\*[^*]+\*\*/.test(l)) {
                add("warn", log, i + 1, "log-entry-format", "entry should start with a bold verb such as **Update**");
            }
        });
    }

    for (const doc of concepts) {
        if (doc.fmError) {
            add("error", doc, 1, "frontmatter-parse", doc.fmError);
            continue;
        }
        if (!doc.fm) {
            add("error", doc, 1, "frontmatter-missing", "concept has no YAML frontmatter");
            continue;
        }
        const { data, keyRange, sources } = doc.fm;
        const at = (k) => (keyRange[k] ? keyRange[k].start + 1 : 1);
        if (typeof data.type !== "string" || !data.type.trim()) add("error", doc, at("type"), "type-missing", "'type' is required and must be a non-empty string");
        if (!data.title) add("warn", doc, 1, "title-missing", "'title' is recommended");
        if (!data.description) add("warn", doc, 1, "description-missing", "'description' is recommended");
        if (data.status !== undefined && !STATUSES.has(data.status)) add("error", doc, at("status"), "status", `status must be draft, stable or deprecated (got '${data.status}')`);
        if (data.symbols !== undefined) {
            if (!Array.isArray(data.symbols)) add("error", doc, at("symbols"), "symbols", "'symbols' must be a list");
            else data.symbols.forEach((s) => covered.add(String(s)));
        }

        const stamps = [];
        const checkTs = (value, k, what) => {
            if (value === undefined) return;
            if (typeof value !== "string" || !TIMESTAMP.test(value) || Number.isNaN(Date.parse(value))) {
                add("error", doc, at(k), "timestamp", `${what} must be an ISO 8601 datetime with offset (got '${value}')`);
            }
        };
        if (data.generated !== undefined) {
            if (typeof data.generated !== "object" || Array.isArray(data.generated)) add("error", doc, at("generated"), "generated", "'generated' must be a map { by, at }");
            else {
                if (!data.generated.by) add("error", doc, at("generated"), "generated", "'generated.by' is required");
                else if (!ACTOR.test(data.generated.by)) add("warn", doc, at("generated"), "actor", `'${data.generated.by}' does not follow <producer>/<version>, human:<id> or process:<id>`);
                checkTs(data.generated.at, "generated", "generated.at");
            }
        }
        const verified = data.verified === undefined ? [] : Array.isArray(data.verified) ? data.verified : [data.verified];
        for (const v of verified) {
            if (!v || typeof v !== "object" || !v.by) add("error", doc, at("verified"), "verified", "each 'verified' entry needs { by, at }");
            else {
                if (!ACTOR.test(v.by)) add("warn", doc, at("verified"), "actor", `'${v.by}' does not follow the actor convention`);
                checkTs(v.at, "verified", "verified.at");
                if (v.at) stamps.push(v.at);
            }
        }
        checkTs(data.stale_after, "stale_after", "stale_after");
        if (data.generated && data.generated.at && stamps.length) {
            const latest = stamps.map(Date.parse).reduce((a, b) => Math.max(a, b));
            if (latest < Date.parse(data.generated.at)) add("warn", doc, at("verified"), "verified-stale", "content changed after the last verification");
        }
        if (data.generated && data.generated.at && log && TIMESTAMP.test(data.generated.at)) {
            const day = data.generated.at.slice(0, 10);
            if (!logDates.has(day)) add("warn", doc, at("generated"), "log-gap", `log.md has no '## ${day}' section for this change`);
        }

        // Provenance and drift.
        const ids = new Set();
        if (data.sources !== undefined && !Array.isArray(data.sources)) add("error", doc, at("sources"), "sources", "'sources' must be a list");
        for (const s of sources) {
            const src = s.value;
            const line = s.start + 1;
            if (!src || typeof src !== "object" || !src.resource) {
                add("error", doc, line, "source-resource", "each sources entry requires 'resource'");
                continue;
            }
            if (src.id) {
                if (ids.has(src.id)) add("error", doc, line, "source-id-dup", `duplicate source id '${src.id}'`);
                ids.add(src.id);
            }
            if (src.symbol) covered.add(src.symbol);
            checkTs(src.last_modified, "sources", "sources[].last_modified");
            const abs = localSource(doc, src);
            if (!abs) continue;
            const ex = existsExact(abs);
            if (!ex.exists) {
                add("error", doc, line, "source-missing", `source '${src.resource}' does not exist`);
                continue;
            }
            if (!ex.caseOk) add("error", doc, line, "link-case", `source '${src.resource}' differs in letter case from the file on disk`);
            if (fs.statSync(abs).isDirectory()) continue;
            const escalate = changed.has(abs);
            const level = escalate ? "error" : "warn";
            let stale = false;
            if (src.symbol) {
                const sha = symbolSlice(abs, src.symbol);
                if (!sha) {
                    add("error", doc, line, "symbol-unresolved", `symbol '${src.symbol}' not found in ${rel(abs)}`);
                    continue;
                }
                if (!src.symbol_sha1) add(level, doc, line, "unstamped", `source '${src.resource}#${src.symbol}' has no symbol_sha1 (run stamp)`);
                else if (src.symbol_sha1 !== sha) stale = true;
            } else if (!src.git_blob) add(level, doc, line, "unstamped", `source '${src.resource}' has no git_blob (run stamp)`);
            else if (src.git_blob !== gitBlob(abs)) stale = true;
            if (stale) {
                const label = src.symbol ? `${rel(abs)}#${src.symbol}` : rel(abs);
                const hint = src.git_blob ? ` (hint: git log --find-object=${src.git_blob.slice(0, 12)} -- ${rel(abs)})` : "";
                add(level, doc, line, "drift", `${label} changed since it was stamped${hint}`);
                if (!drift.has(label)) drift.set(label, []);
                drift.get(label).push(doc.rel);
            }
        }
        for (const f of footnotesOf(doc)) {
            if (!ids.has(f.id)) add("error", doc, f.line, "footnote-unknown", `footnote [^${f.id}] has no matching sources[].id`);
        }
    }

    // Links (concepts and indexes).
    for (const doc of docs) {
        for (const l of linksOf(doc)) {
            if (URL_SCHEME.test(l.target) || l.target.startsWith("#")) continue;
            const abs = resolveTarget(doc.dir, l.target);
            if (!abs) continue;
            const ex = existsExact(abs);
            if (!ex.exists) add("error", doc, l.line, "link-broken", `link target '${l.target}' does not exist`);
            else if (!ex.caseOk) add("error", doc, l.line, "link-case", `link target '${l.target}' differs in letter case from the file on disk`);
            else if (doc.name !== "index.md" && doc.name !== "log.md") {
                const key = fs.statSync(abs).isDirectory() ? path.join(abs, "index.md") : abs;
                if (!inbound.has(key)) inbound.set(key, new Set());
                inbound.get(key).add(doc.abs);
            }
        }
    }

    // Index files.
    const dirs = new Set(docs.map((d) => d.dir));
    for (const dir of dirs) {
        const idx = byAbs.get(path.join(dir, "index.md"));
        const local = concepts.filter((d) => d.dir === dir);
        const childDirs = [...dirs].filter((d) => path.dirname(d) === dir);
        if (!idx) {
            if (local.length || childDirs.length) add("warn", rel(dir) + "/", 0, "index-missing", "directory has no index.md");
            continue;
        }
        const isRoot = dir === BUNDLE;
        if (idx.fmError) add("error", idx, 1, "index-frontmatter", idx.fmError);
        else if (idx.fm) {
            const keys = Object.keys(idx.fm.data);
            if (!isRoot) add("error", idx, 1, "index-frontmatter", "only the bundle-root index.md may carry frontmatter");
            else if (keys.some((k) => k !== "okf_version")) add("error", idx, 1, "index-frontmatter", "root index.md frontmatter may only contain okf_version");
            else if (idx.fm.data.okf_version !== OKF_VERSION) add("warn", idx, 1, "okf-version", `okf_version is '${idx.fm.data.okf_version}', expected '${OKF_VERSION}'`);
        } else if (isRoot) add("error", idx, 1, "okf-version", `bundle-root index.md must declare okf_version: "${OKF_VERSION}"`);

        const listed = new Set();
        idx.lines.forEach((l, i) => {
            if (i < idx.bodyStart || !/^[*-] /.test(l)) return;
            const m = /^[*-] \[([^\]]+)\]\(([^)\s]+)\)(?: - (.+))?$/.exec(l);
            if (!m) {
                add("warn", idx, i + 1, "index-entry-format", "entry should be '* [Title](url) - description'");
                return;
            }
            if (URL_SCHEME.test(m[2])) return;
            const abs = resolveTarget(dir, m[2]);
            if (!abs || !fs.existsSync(abs)) return;
            const target = fs.statSync(abs).isDirectory() ? path.join(abs, "index.md") : abs;
            listed.add(target);
            const concept = byAbs.get(target);
            if (concept && concept.fm && concept.name !== "index.md" && concept.name !== "log.md") {
                const want = concept.fm.data.description;
                const got = (m[3] || "").replace(/ \(draft\)$/, "").trim();
                if (want && got !== want) add("warn", idx, i + 1, "index-desc", `description differs from ${concept.rel} frontmatter`);
            }
        });
        for (const c of local) if (!listed.has(c.abs)) add("warn", idx, 0, "index-gap", `${c.name} is not listed`);
        for (const d of childDirs) if (!listed.has(path.join(d, "index.md"))) add("warn", idx, 0, "index-gap", `${path.basename(d)}/ is not listed`);
    }

    // Orphans: concepts only reachable through index files.
    for (const c of concepts) {
        if (!inbound.has(c.abs) && !c.rel.includes("/implementation/") && !c.rel.includes("/governance/")) {
            add("warn", c, 0, "orphan", "no other concept links here (only index.md)");
        }
    }

    // New public API without a concept.
    const publicApi = publicSymbols();
    for (const issue of publicApi.issues) {
        findings.push({ level: "error", file: rel(issue.file), abs: issue.file, line: issue.line, rule: issue.rule, msg: issue.msg });
    }
    for (const s of publicApi.symbols) {
        const usage = s.symbol.replace(/^N[A-Z]*\./, "N.");
        if (!covered.has(s.symbol) && !covered.has(usage)) {
            const level = s.entry && changedMode && changed.has(s.file) ? "error" : "warn";
            findings.push({ level, file: rel(s.file), abs: s.file, line: s.line, rule: "uncovered-symbol", msg: s.symbol + " is not referenced by any concept (sources[].symbol or symbols)" });
        }
    }

    const inScope = (f) => !scopes.length || scopes.some((s) => f.abs ? f.abs.startsWith(s) : path.resolve(REPO, f.file).startsWith(s));
    const shown = findings.filter(inScope).sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
    for (const f of shown) console.log(`${f.file}${f.line ? ":" + f.line : ""}: ${f.level} ${f.rule}: ${f.msg}`);
    for (const [label, list] of drift) console.log(`drift ${label}: ${list.join(", ")}`);
    const errors = shown.filter((f) => f.level === "error").length;
    const warns = shown.length - errors;
    const byRule = {};
    for (const f of shown) byRule[f.rule] = (byRule[f.rule] || 0) + 1;
    const rules = Object.entries(byRule).map(([r, n]) => `${r} ${n}`).join(", ");
    console.log(`knowledge-docs: ${concepts.length} concepts, ${docs.length - concepts.length} reserved files | ${errors} errors, ${warns} warnings${rules ? ` (${rules})` : ""}`);
    return errors ? 1 : 0;
}

// ---------------------------------------------------------------- stamp

function optionValue(args, name) {
    const i = args.indexOf(name);
    if (i < 0) return undefined;
    const v = args[i + 1];
    if (!v || v.startsWith("--")) throw new UsageError(`${name} needs a value`);
    args.splice(i, 2);
    return v;
}

function checkActor(actor, flag) {
    if (actor === undefined) return;
    if (actor.startsWith("human:")) throw new UsageError(`${flag} refuses human: actors; a person records their own review by hand`);
    if (!ACTOR.test(actor)) throw new UsageError(`${flag} '${actor}' must be <producer>/<version> or process:<id>`);
}

function stamp(argv) {
    const args = [...argv];
    const by = optionValue(args, "--by");
    const verifiedBy = optionValue(args, "--verified-by");
    checkActor(by, "--by");
    checkActor(verifiedBy, "--verified-by");
    const targets = args.filter((a) => !a.startsWith("--"));
    if (!targets.length) throw new UsageError("stamp needs at least one concept file or directory");
    const files = [];
    for (const t of targets) {
        const abs = path.resolve(process.cwd(), t);
        if (!fs.existsSync(abs)) throw new UsageError(`'${t}' does not exist`);
        if (fs.statSync(abs).isDirectory()) files.push(...walk(abs));
        else files.push(abs);
    }
    let changedCount = 0, failures = 0;
    for (const abs of files.filter((f) => !/[\\/](index|log)\.md$/.test(f))) {
        try {
            if (stampFile(abs, by, verifiedBy)) changedCount++;
        } catch (e) {
            failures++;
            console.log(`${rel(abs)}: error stamp: ${e.message}`);
        }
    }
    console.log(`knowledge-docs: stamped ${changedCount} file(s)${failures ? `, ${failures} failed` : ""}`);
    return failures ? 1 : 0;
}

function stampFile(abs, by, verifiedBy) {
    textCache.delete(abs);
    const doc = loadDoc(abs);
    if (doc.fmError) throw new Error(doc.fmError);
    if (!doc.fm) throw new Error("no frontmatter");
    const lines = [...doc.lines];
    const reparse = () => parseFrontmatter(lines);
    let fm = doc.fm;
    const expect = [];

    // Fingerprints: re-parse before every edit so line numbers are always current.
    for (let n = 0; n < doc.fm.sources.length; n++) {
        const src = doc.fm.sources[n].value;
        const local = localSource(doc, src);
        if (!local || !fs.existsSync(local) || fs.statSync(local).isDirectory()) continue;
        if (doc.fm.sources[n].flow) throw new Error(`source '${src.resource}' uses a flow map; write it as a block entry to stamp it`);
        const want = [["git_blob", gitBlob(local)]];
        if (src.symbol) {
            const sha = symbolSlice(local, src.symbol);
            if (!sha) throw new Error(`symbol '${src.symbol}' not found in ${rel(local)}`);
            want.push(["symbol_sha1", sha]);
        }
        for (const [k, v] of want) {
            expect.push([n, k, v]);
            const s = reparse().sources[n];
            if (s.fieldLine[k] !== undefined) lines[s.fieldLine[k]] = `    ${k}: ${v}`;
            else lines.splice(s.end + 1, 0, `    ${k}: ${v}`);
        }
    }

    const now = nowIso();
    if (by) {
        fm = reparse();
        const line = `generated: { by: ${by}, at: ${now} }`;
        if (fm.keyRange.generated) {
            const r = fm.keyRange.generated;
            lines.splice(r.start, r.end - r.start + 1, line);
        } else {
            const anchor = fm.keyRange.sources ? fm.keyRange.sources.end + 1 : fm.keyRange.verified ? fm.keyRange.verified.start : fm.end;
            lines.splice(anchor, 0, line);
        }
    }
    if (verifiedBy) {
        fm = reparse();
        const existing = fm.data.verified === undefined ? [] : Array.isArray(fm.data.verified) ? fm.data.verified : [fm.data.verified];
        const entries = existing.filter((v) => v && v.by !== verifiedBy).map((v) => ({ by: v.by, at: v.at }));
        entries.push({ by: verifiedBy, at: now });
        const block = ["verified:", ...entries.map((v) => `  - { by: ${v.by}, at: ${v.at} }`)];
        if (fm.keyRange.verified) {
            const r = fm.keyRange.verified;
            lines.splice(r.start, r.end - r.start + 1, ...block);
        } else lines.splice(fm.end, 0, ...block);
    }

    // Validate: re-parse and compare what must not change.
    const after = reparse();
    const before = doc.fm;
    for (const k of ["type", "title", "description", "status"]) {
        if (JSON.stringify(after.data[k]) !== JSON.stringify(before.data[k])) throw new Error(`stamp would change '${k}'; aborted`);
    }
    if (after.sources.length !== before.sources.length) throw new Error("stamp would change the number of sources; aborted");
    for (const [n, k, v] of expect) {
        const s = after.sources[n];
        if (!s || s.value.resource !== before.sources[n].value.resource || s.value[k] !== v) throw new Error(`stamp failed to write ${k} for source #${n + 1}; aborted`);
    }
    if (lines.slice(after.end).join("\n") !== doc.lines.slice(before.end).join("\n")) throw new Error("stamp would change the body; aborted");

    const out = (doc.bom ? "\ufeff" : "") + lines.join(doc.eol);
    const original = readText(abs);
    if (out === original) return false;
    fs.writeFileSync(abs, out, "utf8");
    textCache.delete(abs);
    return true;
}

// ---------------------------------------------------------------- main

const USAGE = `usage:
  knowledge-docs check [path...] [--changed]
  knowledge-docs stamp <path...> [--by <actor>] [--verified-by <actor>]`;

try {
    const [cmd, ...rest] = process.argv.slice(2);
    if (cmd === "check") process.exitCode = check(rest);
    else if (cmd === "stamp") process.exitCode = stamp(rest);
    else {
        console.log(USAGE);
        process.exitCode = cmd === "--help" || cmd === "-h" ? 0 : 2;
    }
} catch (e) {
    console.error(e instanceof UsageError ? `knowledge-docs: ${e.message}\n${USAGE}` : e.stack);
    process.exitCode = 2;
}
