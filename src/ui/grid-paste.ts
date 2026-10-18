// SPDX-License-Identifier: Apache-2.0
import { FrameworkError } from "../internal/framework-error.js";

export function readClipboard(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  let closed = false;
  let started = false;
  function invalid(): never {
    throw new FrameworkError({ api: "Grid.paste", code: "GRID_PASTE_TEXT",
      message: "Clipboard quotes must enclose a complete field.",
      detail: { row: rows.length + 1, column: row.length + 1 } });
  }
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') { value += '"'; index++; }
        else { quoted = false; closed = true; }
      } else if (char === "\r") {
        value += "\n";
        if (text[index + 1] === "\n") index++;
      } else value += char;
    } else if (char === "\t" || char === "\n" || char === "\r") {
      row.push(value);
      value = "";
      started = false;
      closed = false;
      if (char !== "\t") {
        rows.push(row);
        row = [];
        if (char === "\r" && text[index + 1] === "\n") index++;
      }
    } else if (char === '"' && !started && !closed) {
      quoted = true;
      started = true;
    } else {
      if (closed || char === '"') invalid();
      started = true;
      value += char;
    }
  }
  if (quoted) invalid();
  if (row.length || started || closed || !rows.length) {
    row.push(value);
    rows.push(row);
  }
  return rows;
}
