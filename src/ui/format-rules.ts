// SPDX-License-Identifier: Apache-2.0
import type { FormatRule, RuleContext } from "./index.js";
import { builtinValidators } from "./validate-rules.js";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const COMPOUND_SURNAMES = new Set(["남궁", "제갈", "선우", "독고", "황보", "강전", "동방", "망절", "사공", "서문", "소봉", "장곡"]);
const REGIONS = new Set(["경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"]);
const NUMERIC_PATTERN = /^(\$)?([+-])?(\()?([0#,]+)(?:\.([0#]+))?(\))?$/;
const EMAIL_CONTEXT: RuleContext = { field: "", values: {}, rowId: null };

function text(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

function integer(name: string, value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  const result = typeof value === "number" ? value :
    typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
  if (!Number.isInteger(result) || result < min || result > max) {
    throw new RangeError(`${name} requires an integer from ${min} to ${max}.`);
  }
  return result;
}

function string(name: string, value: unknown, nonempty = true): string {
  if (typeof value !== "string" || (nonempty && value.length === 0)) {
    throw new TypeError(`${name} requires ${nonempty ? "a nonempty" : "a"} string.`);
  }
  return value;
}

function count(name: string, args: readonly unknown[], min: number, max = min): void {
  if (args.length < min || args.length > max) {
    throw new TypeError(`${name} expects ${min === max ? min : `${min}–${max}`} argument(s).`);
  }
}

function maskCharacter(name: string, value: unknown): string {
  const character = string(name, value);
  if (Array.from(character).length !== 1) throw new TypeError(`${name} requires one character.`);
  return character;
}

function numericPattern(value: unknown): { currency: boolean; plus: boolean; parenthesis: boolean; group: boolean; minInteger: number; minFraction: number; maxFraction: number } {
  const pattern = string("numeric pattern", value);
  const match = NUMERIC_PATTERN.exec(pattern);
  if (!match || Boolean(match[3]) !== Boolean(match[6]) || !/[0#]/.test(match[4]) ||
      (match[4].includes(",") && !/^([0#]{1,3},)?[0#]+$/.test(match[4]))) {
    throw new TypeError(`Invalid numeric pattern: ${pattern}.`);
  }
  return {
    currency: Boolean(match[1]), plus: match[2] === "+", parenthesis: Boolean(match[3]),
    group: match[4].includes(","), minInteger: (match[4].match(/0/g) ?? []).length,
    minFraction: (match[5]?.match(/0/g) ?? []).length, maxFraction: match[5]?.length ?? 0
  };
}

export function assertFormatArgs(name: string, args: readonly unknown[]): void {
  switch (name.toLowerCase()) {
    case "commas": case "ssn": case "kbrn": case "kcn": case "upper": case "lower":
    case "capitalize": case "zipcode": case "phone": case "realnum": case "trimtoempty":
    case "trimtozero":
      count(name, args, 0);
      return;
    case "rrn":
      count(name, args, 0, 2);
      if (args.length) integer(`${name} mask count`, args[0], 0, 13);
      if (args.length > 1) maskCharacter(`${name} mask character`, args[1]);
      return;
    case "trimtoval":
      count(name, args, 1);
      if (args[0] === null || args[0] === undefined || typeof args[0] === "object") {
        throw new TypeError(`${name} requires a primitive fallback value.`);
      }
      return;
    case "date":
      if (args.length > 1) throw new TypeError("date picker arguments are reserved for M11; date formats display text only.");
      if (args.length === 1) {
        if (typeof args[0] === "number") {
          if (![4, 6, 8, 10, 12, 14].includes(integer("date format", args[0], 4, 14))) {
            throw new RangeError("date format must be 4, 6, 8, 10, 12, or 14.");
          }
        }
        else string("date format", args[0]);
      }
      return;
    case "time":
      count(name, args, 0, 1);
      if (args.length && ![2, 4, 6].includes(integer("time digits", args[0], 2, 6))) {
        throw new RangeError("time digits must be 2, 4, or 6.");
      }
      return;
    case "limit":
      count(name, args, 1, 2);
      integer("limit length", args[0]);
      if (args.length > 1) string("limit suffix", args[1], false);
      return;
    case "replace":
      count(name, args, 2);
      string("replace target", args[0]);
      string("replace replacement", args[1], false);
      return;
    case "lpad": case "rpad":
      count(name, args, 2);
      integer(`${name} length`, args[0]);
      string(`${name} fill`, args[1]);
      return;
    case "mask":
      count(name, args, 1, 2);
      if (!["phone", "email", "address", "name", "rrn"].includes(string("mask type", args[0]).toLowerCase())) {
        throw new TypeError(`Unknown mask type: ${String(args[0])}.`);
      }
      if (args.length > 1) maskCharacter("mask character", args[1]);
      return;
    case "generic":
      count(name, args, 1);
      string("generic pattern", args[0]);
      return;
    case "numeric":
      count(name, args, 1, 2);
      numericPattern(args[0]);
      if (args.length > 1 && !["round", "ceil", "floor"].includes(string("numeric rounding", args[1]))) {
        throw new TypeError("numeric rounding must be round, ceil, or floor.");
      }
      return;
    default:
      throw new TypeError(`Unknown formatter: ${name}.`);
  }
}

function digits(value: string): string {
  return value.replace(/[^\d*]/g, "");
}

function grouped(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatPhone(value: string): string {
  const number = digits(value);
  if (!/^\d{9,11}$/.test(number)) return number;
  const prefix = number.startsWith("02") ? 2 : 3;
  const middle = number.length - prefix - 4;
  if (middle < 3 || middle > 4) return number;
  return `${number.slice(0, prefix)}-${number.slice(prefix, -4)}-${number.slice(-4)}`;
}

function pad(value: string, length: number, fill: string, left: boolean): string {
  if (value.length >= length) return value;
  const missing = length - value.length;
  const padding = fill.repeat(Math.ceil(missing / fill.length)).slice(0, missing);
  return left ? padding + value : value + padding;
}

function formatMask(value: string, args: readonly unknown[]): string {
  const kind = String(args[0]).toLowerCase();
  const mark = args.length > 1 ? String(args[1]) : "*";
  if (kind === "phone") {
    const parts = formatPhone(value).split("-");
    return parts.length === 3 ? `${parts[0]}-${parts[1].replace(/\d/g, mark)}-${parts[2]}` : value;
  }
  if (kind === "email") {
    if (builtinValidators.email(value, [], EMAIL_CONTEXT) !== true) return value;
    const at = value.indexOf("@");
    return value.slice(0, Math.max(0, at - 3)) + mark.repeat(3) + value.slice(at);
  }
  if (kind === "rrn") {
    const number = digits(value);
    return number.length === 13 ? `${number.slice(0, 6)}-${mark.repeat(7)}` : value;
  }
  if (kind === "name") {
    const characters = Array.from(value);
    if (/^[a-z\d .?\-]+$/i.test(value)) {
      return characters.map((character, index) => index >= 3 && index < 10 && character !== " " ? mark : character).join("");
    }
    const start = COMPOUND_SURNAMES.has(characters.slice(0, 2).join("")) ? 2 : 1;
    if (characters.length > start) characters[start] = mark;
    return characters.join("");
  }
  return value.split(/(\s+)/).map(part => {
    if (!part || /^\s+$/.test(part)) return part;
    const last = Array.from(part).at(-1) ?? "";
    if (REGIONS.has(part) || /[도시군구]$/.test(part)) return part;
    if (/[읍면동리로길가]$/.test(part) && !/^\d/.test(part)) {
      return mark.repeat(Array.from(part).length - 1) + last;
    }
    return mark.repeat(Array.from(part).length);
  }).join("");
}

function formatGeneric(value: string, pattern: string): string {
  const source = Array.from(value.replace(/[^\p{L}\p{N}\s]/gu, ""));
  let index = 0;
  let output = "";
  const templates = Array.from(pattern);
  for (let position = 0; position < templates.length; position++) {
    const token = templates[position];
    if (token === "!" && position + 1 < templates.length) {
      output += templates[++position];
      continue;
    }
    if (token !== "#" && token !== "@" && token !== "~") {
      output += token;
      continue;
    }
    const accept = token === "#" ? /^\d$/u : token === "@" ? /^[\p{L}\s]$/u : /^[\p{L}\p{N}\s]$/u;
    while (index < source.length && !accept.test(source[index])) index++;
    if (index >= source.length) return value;
    output += source[index++];
  }
  return index === source.length ? output : value;
}

function formatNumeric(value: string, pattern: string, rounding: string): string {
  const match = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(value.replace(/,/g, ""));
  if (!match || (!match[2] && !match[3])) return value;
  const spec = numericPattern(pattern);
  const negative = match[1] === "-";
  const integerPart = match[2] || "0";
  const fraction = match[3] ?? "";
  const kept = fraction.padEnd(spec.maxFraction, "0").slice(0, spec.maxFraction);
  const dropped = fraction.slice(spec.maxFraction);
  const discarded = /[1-9]/.test(dropped);
  const carry = rounding === "ceil" ? !negative && discarded :
    rounding === "floor" ? negative && discarded : Number(dropped[0] ?? 0) >= 5;
  let scaled = BigInt(integerPart + kept);
  if (carry) scaled++;
  const scale = 10n ** BigInt(spec.maxFraction);
  const whole = (scaled / scale).toString().padStart(spec.minInteger, "0");
  let decimal = spec.maxFraction ? (scaled % scale).toString().padStart(spec.maxFraction, "0") : "";
  while (decimal.length > spec.minFraction && decimal.endsWith("0")) decimal = decimal.slice(0, -1);
  const isNegative = negative && scaled !== 0n;
  const sign = isNegative ? (spec.parenthesis ? "" : "-") : spec.plus ? "+" : "";
  const body = `${spec.group ? grouped(whole) : whole}${decimal ? `.${decimal}` : ""}`;
  return `${spec.currency ? "$" : ""}${sign}${isNegative && spec.parenthesis ? `(${body})` : body}`;
}

function parsedDate(value: string): Date | null {
  const raw = value.replace(/\D/g, "");
  if (!raw || /^0+$/.test(raw)) return null;
  if (![4, 6, 8, 10, 12, 14].includes(raw.length)) return null;
  const year = Number(raw.slice(0, 4));
  const month = raw.length >= 6 ? Number(raw.slice(4, 6)) : 1;
  const day = raw.length >= 8 ? Number(raw.slice(6, 8)) : 1;
  const hour = raw.length >= 10 ? Number(raw.slice(8, 10)) : 0;
  const minute = raw.length >= 12 ? Number(raw.slice(10, 12)) : 0;
  const second = raw.length >= 14 ? Number(raw.slice(12, 14)) : 0;
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(hour, minute, second, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day ||
      date.getHours() !== hour || date.getMinutes() !== minute || date.getSeconds() !== second) return null;
  return date;
}

function two(value: number): string { return String(value).padStart(2, "0"); }

function datePattern(date: Date, pattern: string): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const weekday = date.getDay();
  const hour = date.getHours();
  const offset = -date.getTimezoneOffset();
  const offsetSign = offset < 0 ? "-" : "+";
  const offsetHours = two(Math.floor(Math.abs(offset) / 60));
  const offsetMinutes = two(Math.abs(offset) % 60);
  const zone = `${offsetSign}${offsetHours}${offsetMinutes}`;
  const zoneColon = `${offsetSign}${offsetHours}:${offsetMinutes}`;
  const hour12 = hour % 12 || 12;
  const dayOfYear = Math.floor((Date.UTC(year, month, day) - Date.UTC(year, 0, 1)) / 86400000);
  const isoWeek = (): number => {
    const dayUtc = new Date(Date.UTC(year, month, day));
    dayUtc.setUTCDate(dayUtc.getUTCDate() + 4 - (dayUtc.getUTCDay() || 7));
    return Math.ceil((((dayUtc.getTime() - Date.UTC(dayUtc.getUTCFullYear(), 0, 1)) / 86400000) + 1) / 7);
  };
  const tokens: Record<string, string> = {
    Y: String(year).padStart(4, "0"), y: two(year % 100), m: two(month + 1), n: String(month + 1),
    F: MONTHS[month], M: MONTHS[month].slice(0, 3), d: two(day), j: String(day),
    l: DAYS[weekday], D: DAYS[weekday].slice(0, 3), N: String(weekday || 7), w: String(weekday),
    S: day % 100 >= 11 && day % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][day % 10] ?? "th",
    z: String(dayOfYear), W: two(isoWeek()), t: String(new Date(year, month + 1, 0).getDate()),
    L: Number(year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)).toString(),
    I: String(Number(date.getTimezoneOffset() < Math.max(new Date(year, 0, 1).getTimezoneOffset(), new Date(year, 6, 1).getTimezoneOffset()))),
    H: two(hour), G: String(hour), h: two(hour12), g: String(hour12), i: two(date.getMinutes()),
    s: two(date.getSeconds()), a: hour >= 12 ? "pm" : "am", A: hour >= 12 ? "PM" : "AM",
    O: zone, P: zoneColon, Z: String(offset * 60), U: String(Math.floor(date.getTime() / 1000)),
    B: String(Math.floor((((date.getUTCHours() + 1) * 3600 + date.getUTCMinutes() * 60 + date.getUTCSeconds()) % 86400) / 86.4)).padStart(3, "0")
  };
  tokens.c = `${tokens.Y}-${tokens.m}-${tokens.d}T${tokens.H}:${tokens.i}:${tokens.s}${tokens.P}`;
  tokens.r = `${tokens.D}, ${tokens.d} ${tokens.M} ${tokens.Y} ${tokens.H}:${tokens.i}:${tokens.s} ${tokens.O}`;
  let result = "";
  for (let index = 0; index < pattern.length; index++) {
    if (pattern[index] === "%" && index + 1 < pattern.length) result += pattern[++index];
    else result += tokens[pattern[index]] ?? pattern[index];
  }
  return result;
}

function formatDate(value: string, args: readonly unknown[]): string {
  const raw = value.replace(/\D/g, "");
  if (/^0+$/.test(raw)) return "";
  const date = parsedDate(value);
  if (!date) return value;
  const byLength: Record<number, string> = {
    4: "Y", 6: "Y-m", 8: "Y-m-d", 10: "Y-m-d H", 12: "Y-m-d H:i", 14: "Y-m-d H:i:s"
  };
  const selected = args[0];
  const pattern = selected === undefined ? byLength[raw.length] :
    typeof selected === "number" ? byLength[selected] : String(selected);
  return datePattern(date, pattern);
}

export const builtinFormats: Readonly<Record<string, FormatRule>> = {
  commas: value => {
    const plain = value.replace(/,/g, "");
    return plain.replace(/^([+-]?\d+)(?=\.|$)/, (_, leading: string) => grouped(leading));
  },
  rrn: (value, args) => {
    let number = digits(value);
    if (number.length !== 13) return number;
    const hide = args.length ? integer("rrn mask count", args[0], 0, 13) : 0;
    if (hide) number = number.slice(0, 13 - hide) + String(args[1] ?? "*").repeat(hide);
    return `${number.slice(0, 6)}-${number.slice(6)}`;
  },
  ssn: value => { const number = digits(value); return number.length === 9 ? `${number.slice(0, 3)}-${number.slice(3, 5)}-${number.slice(5)}` : number; },
  kbrn: value => { const number = digits(value); return number.length === 10 ? `${number.slice(0, 3)}-${number.slice(3, 5)}-${number.slice(5)}` : number; },
  kcn: value => { const number = digits(value); return number.length === 13 ? `${number.slice(0, 6)}-${number.slice(6)}` : number; },
  upper: value => value.toUpperCase(),
  lower: value => value.toLowerCase(),
  capitalize: value => value.slice(0, 1).toUpperCase() + value.slice(1),
  zipcode: value => { const number = digits(value); return number.length > 3 ? `${number.slice(0, 3)}-${number.slice(3, 6)}` : number; },
  phone: value => formatPhone(value),
  realnum: value => { const number = Number.parseFloat(value); return Number.isNaN(number) ? "" : String(number); },
  trimtoempty: value => text(value),
  trimtozero: value => text(value) || "0",
  trimtoval: (value, args) => text(value) || String(args[0]),
  date: (value, args) => formatDate(value, args),
  time: (value, args) => {
    const raw = value.replace(/\D/g, "");
    if (!raw) return "";
    const digits = args[0] === undefined ? 4 : Number(args[0]);
    const padded = raw.padEnd(digits, "0").slice(0, digits);
    return digits === 2 ? padded : digits === 4 ? `${padded.slice(0, 2)}:${padded.slice(2)}` :
      `${padded.slice(0, 2)}:${padded.slice(2, 4)}:${padded.slice(4)}`;
  },
  limit: (value, args) => {
    const max = Number(args[0]);
    const suffix = String(args[1] ?? "");
    if (suffix && value.endsWith(suffix)) return value;
    let weight = 0;
    for (let index = 0; index < value.length; index++) {
      weight += value.charCodeAt(index) > 128 ? 2 : 1;
      if (weight > max) return value.slice(0, index).trim() + suffix;
    }
    return value;
  },
  replace: (value, args) => value.split(String(args[0])).join(String(args[1])),
  lpad: (value, args) => pad(value, Number(args[0]), String(args[1]), true),
  rpad: (value, args) => pad(value, Number(args[0]), String(args[1]), false),
  mask: (value, args) => formatMask(value, args),
  generic: (value, args) => formatGeneric(value, String(args[0])),
  numeric: (value, args) => formatNumeric(value, String(args[0]), String(args[1] ?? "round"))
};
