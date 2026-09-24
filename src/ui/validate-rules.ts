// SPDX-License-Identifier: Apache-2.0
import type { ValidateRule } from "./index.js";
import { parsePath, readPath } from "./field-path.js";

const KOREAN = /^[\p{Script=Hangul}\s]+$/u;
const INTEGER_KOREAN = /^[\p{Script=Hangul}0-9\s]+$/u;
const ALPHABET_KOREAN = /^[\p{Script=Hangul}A-Za-z\s]+$/u;
const ALPHABET_INTEGER_KOREAN = /^[\p{Script=Hangul}A-Za-z0-9\s]+$/u;
const noArgs = new Set([
  "required", "alphabet", "integer", "korean", "alphabet_integer", "integer_korean",
  "alphabet_korean", "alphabet_integer_korean", "dash_integer", "commas_integer",
  "number", "email", "url", "zipcode", "rrn", "ssn", "frn", "frn_rrn",
  "kbrn", "kcn", "date", "time"
]);
const patterns = new Set([
  "accept", "notaccept", "match", "notmatch", "acceptfileext", "notacceptfileext"
]);

function numeric(value: unknown, name: string, integer = false): number {
  if (typeof value !== "number" && (typeof value !== "string" || !value.trim())) {
    throw new TypeError(`${name} needs a numeric argument.`);
  }
  const result = Number(value);
  if (!Number.isFinite(result) || (integer && (!Number.isInteger(result) || result < 0))) {
    throw new RangeError(`${name} needs ${integer ? "a nonnegative integer" : "a finite number"}.`);
  }
  return result;
}

function count(name: string, args: readonly unknown[], minimum: number, maximum = minimum): void {
  if (args.length < minimum || args.length > maximum) {
    throw new TypeError(`${name} needs ${minimum === maximum ? minimum : `${minimum}-${maximum}`} argument(s).`);
  }
}

function regular(pattern: string, flags = ""): RegExp {
  try { return new RegExp(pattern, flags); }
  catch { throw new TypeError("The validator pattern or flags are invalid."); }
}

/** Checks a declaration once, before its rule is used for individual rows. */
export function assertValidateArgs(name: string, args: readonly unknown[]): void {
  if (noArgs.has(name)) return count(name, args, 0);
  if (name === "decimal") {
    count(name, args, 0, 1);
    if (args.length) numeric(args[0], name, true);
    return;
  }
  if (name === "phone") {
    count(name, args, 0, 1);
    if (args.length && ![true, false, "true", "false"].includes(args[0] as string)) {
      throw new TypeError("phone expects a boolean partial-number option.");
    }
    return;
  }
  if (patterns.has(name)) {
    count(name, args, 1);
    if (typeof args[0] !== "string" || !args[0]) throw new TypeError(`${name} needs a pattern.`);
    regular(name.includes("fileext") ? `\\.(?:${args[0]})$` :
      name === "accept" || name === "notaccept" ? `^(?:${args[0]})$` : args[0]);
    return;
  }
  if (name === "equalto") {
    count(name, args, 1);
    if (typeof args[0] !== "string") throw new TypeError("equalto needs a data-field path.");
    try { parsePath(args[0]); }
    catch { throw new TypeError("equalto needs a safe data-field path."); }
    return;
  }
  if (["maxlength", "minlength", "rangelength"].includes(name)) {
    const size = name === "rangelength" ? 2 : 1;
    count(name, args, size);
    const low = numeric(args[0], name, true);
    if (size === 2 && low > numeric(args[1], name, true)) throw new RangeError(`${name} minimum exceeds maximum.`);
    return;
  }
  if (["maxbyte", "minbyte", "rangebyte"].includes(name)) {
    const size = name === "rangebyte" ? 2 : 1;
    count(name, args, size, size + 1);
    const low = numeric(args[0], name, true);
    if (size === 2 && low > numeric(args[1], name, true)) throw new RangeError(`${name} minimum exceeds maximum.`);
    if (args.length > size && numeric(args[size], name, true) < 1) {
      throw new RangeError(`${name} character width must be positive.`);
    }
    return;
  }
  if (["maxvalue", "minvalue", "rangevalue"].includes(name)) {
    const size = name === "rangevalue" ? 2 : 1;
    count(name, args, size);
    const low = numeric(args[0], name);
    if (size === 2 && low > numeric(args[1], name)) throw new RangeError(`${name} minimum exceeds maximum.`);
    return;
  }
  if (name === "regexp") {
    count(name, args, 2, 3);
    if (typeof args[0] !== "string" || typeof args[1] !== "string" ||
      (args.length === 3 && typeof args[2] !== "string")) {
      throw new TypeError("regexp needs a pattern, flags, and optional message string.");
    }
    regular(args[0], args[1]);
    return;
  }
  throw new TypeError(`Unknown validator ${name}.`);
}

function digits(value: string, length: number): string | null {
  const normalized = value.replace(/[-\s]/g, "");
  return normalized.length === length && /^\d+$/u.test(normalized) ? normalized : null;
}

function checksum(value: string, weights: readonly number[], expected: number): boolean {
  let sum = 0;
  for (let index = 0; index < weights.length; index++) sum += Number(value[index]) * weights[index];
  return expected === (11 - sum % 11) % 10;
}

function rrn(value: string): boolean {
  const number = digits(value, 13);
  return number !== null && checksum(number, [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5], Number(number[12]));
}

function frn(value: string): boolean {
  const number = digits(value, 13);
  if (!number || ![5, 6, 8].includes(Number(number[6])) || Number(number.slice(7, 9)) % 2 !== 0) return false;
  let sum = 0;
  for (let index = 0; index < 12; index++) sum += Number(number[index]) * (index % 8 + 2);
  return ((11 - sum % 11) % 10 + 2) % 10 === Number(number[12]);
}

function kbrn(value: string): boolean {
  const number = digits(value, 10);
  if (!number) return false;
  const weights = [1, 3, 7, 1, 3, 7, 1, 3];
  let sum = 0;
  for (let index = 0; index < weights.length; index++) sum += Number(number[index]) * weights[index];
  const ninth = Number(number[8]) * 5;
  return (10 - (sum + Math.floor(ninth / 10) + ninth % 10) % 10) % 10 === Number(number[9]);
}

function kcn(value: string): boolean {
  const number = digits(value, 13);
  if (!number) return false;
  let sum = 0;
  for (let index = 0; index < 12; index++) sum += Number(number[index]) * (index % 2 + 1);
  return (10 - sum % 10) % 10 === Number(number[12]);
}

function date(value: string): boolean {
  const match = /^(\d{4})([-/.]?)(\d{2})\2(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[3]);
  const day = Number(match[4]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const days = [31, year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1];
}

function byteLength(value: string, wide = 3): number {
  let size = 0;
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    size += code < 0x80 ? 1 : code < 0x800 ? 2 : wide;
  }
  return size;
}

const text = (value: string): string => value.trim();
const option = (args: readonly unknown[], index = 0): number => Number(args[index]);
const byteWidth = (args: readonly unknown[], index: number): number =>
  args[index] === undefined ? 3 : Number(args[index]);
const asNumber = (value: string): number => value.trim() ? Number(value.trim()) : NaN;

export const builtinValidators: Readonly<Record<string, ValidateRule>> = Object.freeze({
  required: value => text(value).length > 0,
  alphabet: value => /^[a-z\s]+$/iu.test(text(value)),
  integer: value => /^[+-]?\d+$/u.test(text(value)),
  korean: value => KOREAN.test(text(value)),
  alphabet_integer: value => /^[a-z\d\s]+$/iu.test(text(value)),
  integer_korean: value => INTEGER_KOREAN.test(text(value)),
  alphabet_korean: value => ALPHABET_KOREAN.test(text(value)),
  alphabet_integer_korean: value => ALPHABET_INTEGER_KOREAN.test(text(value)),
  dash_integer: value => /^(?:\d|-)+$/u.test(text(value)),
  commas_integer: value => /^(?:\d|,)+$/u.test(text(value)),
  number: value => /^[+-]?(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d*)?|\.\d+)$/u.test(text(value)),
  decimal: (value, args) => {
    const input = text(value);
    if (/^[+-]?\d+$/u.test(input)) return true;
    const places = args.length ? option(args) : 10;
    const fraction = /^[+-]?\d*\.(\d+)$/u.exec(input);
    return places > 0 && fraction !== null && fraction[1].length <= places;
  },
  phone: (value, args) => (args[0] === true || args[0] === "true" ?
    /^\d{2,3}-\d{3,4}-\d{1,4}$/u : /^\d{2,3}-\d{3,4}-\d{4}$/u).test(text(value)),
  email: value => /^[^\s@.][^\s@]*@[^\s@.]+(?:\.[^\s@.]+)+$/u.test(text(value)) && !text(value).includes(".."),
  url: value => {
    try {
      const url = new URL(text(value));
      return ["http:", "https:", "ftp:"].includes(url.protocol) && Boolean(url.hostname);
    } catch { return false; }
  },
  zipcode: value => /^\d{3}-\d{3}$/u.test(text(value)),
  rrn: value => rrn(text(value)),
  ssn: value => /^\d{3}-\d{2}-\d{4}$/u.test(text(value)),
  frn: value => frn(text(value)),
  frn_rrn: value => {
    const number = digits(text(value), 13);
    if (!number) return false;
    const category = Number(number[6]);
    return category >= 5 && category <= 8 ? frn(text(value)) : rrn(text(value));
  },
  kbrn: value => kbrn(text(value)),
  kcn: value => kcn(text(value)),
  date: value => date(text(value)),
  time: value => /^([01]\d|2[0-3])(?::?([0-5]\d))?(?::?([0-5]\d))?$/u.test(text(value)),
  accept: (value, args) => regular(`^(?:${args[0]})$`).test(text(value)),
  notaccept: (value, args) => !regular(`^(?:${args[0]})$`).test(text(value)),
  match: (value, args) => regular(String(args[0])).test(text(value)),
  notmatch: (value, args) => !regular(String(args[0])).test(text(value)),
  acceptfileext: (value, args) => regular(`\\.(?:${args[0]})$`, "i").test(text(value)),
  notacceptfileext: (value, args) => !regular(`\\.(?:${args[0]})$`, "i").test(text(value)),
  equalto: (value, args, context) => text(value) === String(readPath(context.values, parsePath(String(args[0]))) ?? "").trim(),
  maxlength: (value, args) => text(value).length <= option(args),
  minlength: (value, args) => text(value).length >= option(args),
  rangelength: (value, args) => text(value).length >= option(args) && text(value).length <= option(args, 1),
  maxbyte: (value, args) => byteLength(text(value), byteWidth(args, 1)) <= option(args),
  minbyte: (value, args) => byteLength(text(value), byteWidth(args, 1)) >= option(args),
  rangebyte: (value, args) => {
    const size = byteLength(text(value), byteWidth(args, 2));
    return size >= option(args) && size <= option(args, 1);
  },
  maxvalue: (value, args) => asNumber(value) <= option(args),
  minvalue: (value, args) => asNumber(value) >= option(args),
  rangevalue: (value, args) => asNumber(value) >= option(args) && asNumber(value) <= option(args, 1),
  regexp: (value, args) => regular(String(args[0]), String(args[1])).test(text(value)) ||
    (typeof args[2] === "string" && args[2] ? args[2] : false)
});

export const builtinMessages: Readonly<Record<"en_US" | "ko_KR", Readonly<Record<string, string>>>> = Object.freeze({
  en_US: Object.freeze({
    global: "Invalid value.", required: "This field is required.",
    alphabet: "Use Latin letters only.", integer: "Enter an integer.", korean: "Use Korean characters only.",
    alphabet_integer: "Use Latin letters and digits only.", integer_korean: "Use Korean characters and digits only.",
    alphabet_korean: "Use Latin and Korean characters only.",
    alphabet_integer_korean: "Use Latin and Korean characters and digits only.",
    dash_integer: "Use digits and dashes only.", commas_integer: "Use digits and commas only.",
    number: "Enter a number.", decimal: "Enter a decimal.",
    phone: "Enter a phone number.", email: "Enter an email address.", url: "Enter a URL.",
    zipcode: "Enter a postal code.", rrn: "Enter a valid resident number.", ssn: "Enter a Social Security number.",
    frn: "Enter a valid foreign resident number.", frn_rrn: "Enter a valid resident number.",
    kbrn: "Enter a valid business number.", kcn: "Enter a valid corporation number.",
    date: "Enter a valid date.", time: "Enter a valid time.",
    accept: "Use a value matching {0}.", notaccept: "Do not use a value matching {0}.",
    match: "Include a match for {0}.", notmatch: "Do not include a match for {0}.",
    acceptfileext: "Use a file extension matching {0}.",
    notacceptfileext: "Do not use a file extension matching {0}.",
    equalto: "Match {0}.", maxlength: "Use at most {0} characters.",
    minlength: "Use at least {0} characters.", rangelength: "Use {0} to {1} characters.",
    maxbyte: "Use at most {0} bytes.", minbyte: "Use at least {0} bytes.", rangebyte: "Use {0} to {1} bytes.",
    maxvalue: "Enter a value at most {0}.", minvalue: "Enter a value at least {0}.",
    rangevalue: "Enter a value between {0} and {1}.", regexp: "Value does not match the pattern."
  }),
  ko_KR: Object.freeze({
    global: "올바른 값을 입력해줘.", required: "필수 입력 항목이야.",
    alphabet: "영문자만 입력해줘.", integer: "정수를 입력해줘.", korean: "한글만 입력해줘.",
    alphabet_integer: "영문자와 숫자만 입력해줘.", integer_korean: "한글과 숫자만 입력해줘.",
    alphabet_korean: "영문자와 한글만 입력해줘.",
    alphabet_integer_korean: "영문자, 한글, 숫자만 입력해줘.",
    dash_integer: "숫자와 대시만 입력해줘.", commas_integer: "숫자와 쉼표만 입력해줘.",
    number: "숫자를 입력해줘.", decimal: "소수를 입력해줘.",
    phone: "전화번호 형식으로 입력해줘.", email: "이메일 형식으로 입력해줘.", url: "URL 형식으로 입력해줘.",
    zipcode: "우편번호 형식으로 입력해줘.", rrn: "올바른 주민번호를 입력해줘.",
    ssn: "미국 사회보장번호 형식으로 입력해줘.", frn: "올바른 외국인등록번호를 입력해줘.",
    frn_rrn: "올바른 주민번호나 외국인등록번호를 입력해줘.",
    kbrn: "올바른 사업자번호를 입력해줘.", kcn: "올바른 법인번호를 입력해줘.",
    date: "올바른 날짜를 입력해줘.", time: "올바른 시간을 입력해줘.",
    accept: "{0}에 맞는 값을 입력해줘.", notaccept: "{0}에 맞는 값은 사용할 수 없어.",
    match: "{0}에 맞는 값을 포함해줘.", notmatch: "{0}에 맞는 값은 포함할 수 없어.",
    acceptfileext: "{0} 확장자를 사용해줘.", notacceptfileext: "{0} 확장자는 사용할 수 없어.",
    equalto: "{0} 값과 같게 입력해줘.", maxlength: "{0}자 이하로 입력해줘.",
    minlength: "{0}자 이상 입력해줘.", rangelength: "{0}자에서 {1}자까지 입력해줘.",
    maxbyte: "{0}바이트 이하로 입력해줘.", minbyte: "{0}바이트 이상 입력해줘.",
    rangebyte: "{0}바이트에서 {1}바이트까지 입력해줘.",
    maxvalue: "{0} 이하의 값을 입력해줘.", minvalue: "{0} 이상의 값을 입력해줘.",
    rangevalue: "{0}에서 {1} 사이의 값을 입력해줘.", regexp: "정해진 형식에 맞게 입력해줘."
  })
});
