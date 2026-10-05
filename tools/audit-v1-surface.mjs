import { parseAst } from "vite";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const names = ["natural.js.js", "natural.core.js", "natural.architecture.js", "natural.data.js",
  "natural.ui.js", "natural.ui.shell.js", "natural.template.js", "natural.code.js"];
const key = node => node?.name ?? String(node?.value ?? "<computed>");

function visit(node, action) {
  if (!node || typeof node !== "object") return;
  if (typeof node.type === "string") action(node);
  for (const [name, value] of Object.entries(node)) {
    if (name === "parent" || name === "loc") continue;
    if (Array.isArray(value)) for (const item of value) visit(item, action);
    else if (value && typeof value === "object") visit(value, action);
  }
}

function chain(node) {
  if (node?.type === "Identifier") return node.name;
  if (node?.type !== "MemberExpression" || node.computed) return null;
  const owner = chain(node.object);
  return owner ? owner + "." + key(node.property) : null;
}

function objectKeys(node, prefix = "") {
  if (node?.type !== "ObjectExpression") return [];
  const result = [];
  for (const property of node.properties) {
    if (property.type === "SpreadElement") { result.push(prefix + "<spread>"); continue; }
    const name = prefix + key(property.key);
    result.push(name, ...objectKeys(property.value, name + "."));
  }
  return result;
}

const files = names.map(name => {
  const path = "v1/src/" + name;
  const source = readFileSync(new URL(path, root), "utf8");
  const ast = parseAst(source);
  const classes = [];
  function inspectClass(node, symbol) {
    const members = [];
    const literalOptions = new Set();
    for (const member of node.body.body) {
      const name = key(member.key);
      const owner = member.static ? symbol : symbol + ".prototype";
      members.push({ symbol: owner + "." + name, name,
        kind: member.type === "MethodDefinition" ? member.kind : member.value?.type ?? "field",
        static: !!member.static });
      if (member.value?.type === "ClassExpression") inspectClass(member.value, symbol + "." + name);
      if (member.kind === "constructor") visit(member.value.body, child => {
        if (child.type !== "AssignmentExpression" || child.left?.type !== "MemberExpression" ||
            child.left.object?.type !== "ThisExpression" || key(child.left.property) !== "options") return;
        for (const name of objectKeys(child.right)) literalOptions.add(name);
      });
    }
    classes.push({ symbol, members, literal_constructor_option_keys: [...literalOptions] });
  }
  for (const item of ast.body) {
    const declaration = item.type === "ExportNamedDeclaration" ? item.declaration : item;
    if (declaration?.type === "ClassDeclaration") inspectClass(declaration, declaration.id.name);
  }
  const references = new Set();
  visit(ast, node => {
    const name = chain(node);
    if (name && /^(NC|ND|NA|NU|NUS|NT|N)\./.test(name)) references.add(name);
  });
  return { path, sha256: createHash("sha256").update(Buffer.from(source)).digest("hex"),
    classes, static_reference_expressions: [...references].sort() };
});

const output = {
  date: "2026-10-05", baseline_commit: "b96e47a0d7e020d1878f7cecdf1b1a9f462d99a6",
  status: "structural evidence; behavior classification remains in feature-parity.md",
  extraction: "Installed Vite parseAst, audit use only; no framework dependency added.",
  limitations: ["Names and literal constructor option keys are a surface checklist, not completed behavior parity.",
    "Constructor option keys include nested dotted paths from literal this.options assignments, not all public or merged options.",
    "Configuration, computed property lookup, HTML declarations, dynamic formatter/validator dispatch and callbacks need manual/transitive review.",
    "Static reference absence does not prove code unused. No v1 implementation body is copied here."],
  totals: { files: files.length, classes: files.reduce((n, f) => n + f.classes.length, 0),
    members: files.reduce((n, f) => n + f.classes.reduce((n, c) => n + c.members.length, 0), 0),
    literal_constructor_option_keys: files.reduce((n, f) => n + f.classes.reduce((n, c) => n + c.literal_constructor_option_keys.length, 0), 0) }, files
};
const target = new URL("docs/implementation/evidence/v1-surface-inventory.json", root);
const serialized = JSON.stringify(output, null, 2) + "\n";
const mode = process.argv[2];
if (process.argv.length !== 3 || !["--check", "--write"].includes(mode)) {
  console.error("Usage: node tools/audit-v1-surface.mjs --check|--write");
  process.exitCode = 2;
} else if (mode === "--write") {
  writeFileSync(target, serialized);
  console.log(JSON.stringify(output.totals));
} else if (readFileSync(target, "utf8").replace(/\r\n/g, "\n") !== serialized) {
  console.error("Surface checklist differs: " + fileURLToPath(target));
  process.exitCode = 1;
} else {
  console.log("Surface checklist matches " + JSON.stringify(output.totals));
}
