import { readFileSync, appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname, basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const base = new URL(".", import.meta.url);
const cli = process.argv.slice(2);
const explicit = cli[0] === "--work" ? cli.splice(0, 2)[1] : undefined;
const work = resolve(explicit ?? fileURLToPath(new URL("./work/", base)));
const log = explicit ? join(dirname(work), `${basename(work)}-meter.jsonl`) : fileURLToPath(new URL("./meter.jsonl", base));
const [kind, ...args] = cli;
let output = "";
let files = [];
let status = 0;
if (kind === "read-lines") {
  const [name, first, count] = args;
  if (!name || !first || !count) throw new Error("read-lines needs file, first line, count");
  const lines = readFileSync(resolve(work, name), "utf8").split(/\r?\n/);
  const start = Number(first) - 1;
  output = `=== ${name}:${first}-${start + Number(count)} ===\n${lines.slice(start, start + Number(count)).join("\n")}\n`;
  files.push(name);
} else if (kind === "read") {
  for (const name of args) {
    if (name.includes(".env") || name.includes("secret")) throw new Error("Refusing environment or secret file");
    const value = readFileSync(resolve(work, name), "utf8");
    output += `=== ${name} ===\n${value}${value.endsWith("\n") ? "" : "\n"}`;
    files.push(name);
  }
} else if (kind === "search" || kind === "files" || kind === "review") {
  const command = kind === "review" ? "git" : "rg";
  const argv = kind === "review" ? ["diff", "--", ...args] :
    kind === "files" ? ["--files", ...args] : ["-n", "--with-filename", "--color", "never", ...args];
  const run = spawnSync(command, argv, { cwd: work, encoding: "utf8" });
  output = `${run.stdout ?? ""}${run.stderr ?? ""}`;
  status = run.status ?? 1;
  if (kind === "search") {
    files = output.split(/\r?\n/).map(line => line.match(/^(.+?):\d+:/)?.[1]).filter(Boolean);
  } else if (kind === "review") {
    files = output.split(/\r?\n/).map(line => line.match(/^diff --git a\/(.+?) b\//)?.[1]).filter(Boolean);
  }
  if (kind === "search" && status === 1) status = 0;
} else throw new Error("Expected read, search, files, or review");
const bytes = Buffer.byteLength(output, "utf8");
if (bytes > 24 * 1024) throw new Error("Output exceeds 24 KiB; narrow or split the read/search/review");
appendFileSync(log, JSON.stringify({ at: new Date().toISOString(), kind, args, bytes, files: [...new Set(files)], status }) + "\n");
process.stdout.write(output);
process.stderr.write(`\n[M8 meter: ${kind}, ${bytes} UTF-8 output bytes, ${new Set(files).size} content files]\n`);
process.exitCode = status;
