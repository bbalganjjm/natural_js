import { cpSync, mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const packageDir = fileURLToPath(new URL("..", import.meta.url));
const fixturesDir = path.join(packageDir, "tests", "consumers");
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error("Run this check through npm run test:consumers.");
}

function npm(args, cwd, capture = false) {
  return execFileSync(process.execPath, [npmCli, ...args], {
    cwd,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
    maxBuffer: 10 * 1024 * 1024
  });
}

const tempParent = realpathSync(tmpdir());
const tempRoot = realpathSync(mkdtempSync(path.join(tempParent, "natural-js-consumers-")));

function assertOwnedTempRoot() {
  const relative = path.relative(tempParent, tempRoot);
  if (
    !relative.startsWith("natural-js-consumers-") ||
    relative.includes(path.sep) ||
    relative === "." ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`Refusing to remove an unexpected temporary path: ${tempRoot}`);
  }
}

try {
  npm(["run", "build"], packageDir);
  const packed = JSON.parse(npm(["pack", "--json", "--pack-destination", tempRoot], packageDir, true));
  const filename = packed[0]?.filename;
  if (typeof filename !== "string" || filename !== path.basename(filename) || !filename.endsWith(".tgz")) {
    throw new Error("npm pack did not return one package tarball filename.");
  }
  const tarball = path.join(tempRoot, filename);

  for (const kind of ["js", "ts"]) {
    const consumerDir = path.join(tempRoot, kind);
    cpSync(path.join(fixturesDir, kind), consumerDir, { recursive: true });
    npm([
      "install", "--offline", "--no-save", "--package-lock=false",
      "--ignore-scripts", "--no-audit", "--no-fund", tarball
    ], consumerDir);

    if (kind === "js") {
      execFileSync(process.execPath, [path.join(consumerDir, "check.mjs")], {
        cwd: consumerDir,
        stdio: "inherit"
      });
    } else {
      execFileSync(process.execPath, [
        path.join(packageDir, "node_modules", "typescript", "bin", "tsc"),
        "--project", path.join(consumerDir, "tsconfig.json")
      ], { cwd: consumerDir, stdio: "inherit" });
    }
    process.stdout.write(`${kind.toUpperCase()} installed consumer passed.\n`);
  }
} finally {
  assertOwnedTempRoot();
  rmSync(tempRoot, { recursive: true });
}
