---
type: Configuration
title: Theming
description: How Natural-UI styles are themed - design tokens in tokens.css, Material Design 3 color roles in light.css and dark.css, and the class conventions of natural.ui.css.
tags: [ui, theming, css, design-tokens]
status: draft
sources:
  - id: uicss
    resource: ../../css/natural.ui.css
    title: natural.ui.css (component styles and @import of the token files)
    git_blob: 7e2005229a00223490701634d4d52b5983233e4c
  - id: tokens
    resource: ../../css/tokens.css
    title: tokens.css (typography, elevation, radius and motion tokens)
    git_blob: 13494ec350941f7d1dd0b158b9cb33eee22994c0
  - id: light
    resource: ../../css/light.css
    title: light.css (light color scheme and icons)
    git_blob: f4994b8b81fcb50604c0533df120979cb03f808c
  - id: dark
    resource: ../../css/dark.css
    title: dark.css (dark color scheme and icons)
    git_blob: 229fd1a1afdbaf88f2c350961dd961144a8da4a2
  - id: button
    resource: ../../src/natural.ui.js
    title: NU.button (btn_* class mapping)
    symbol: NU.button
    git_blob: 50229404558dabe92cdea2d02cd1c45a2481cf49
    symbol_sha1: c3c35975533f
generated: { by: claude-code/unknown, at: 2026-09-24T05:36:00Z }
---

Natural-UI components get all their visual styling from `css/natural.ui.css`, which reads CSS custom properties: `--njs-*` design tokens from `tokens.css` and `--md-sys-color-*` Material Design 3 color roles from `light.css` or `dark.css`. Theme a site by overriding those properties (or the component classes) in a stylesheet loaded after `natural.ui.css`; no JavaScript option is involved.

# Location and load order

`css/natural.ui.css` starts with three imports:[^uicss]

```css
@import url(tokens.css);
@import url(light.css) screen and (prefers-color-scheme: light);
@import url(dark.css) screen and (prefers-color-scheme: dark);
```

- Link only `natural.ui.css` and keep `tokens.css`, `light.css` and `dark.css` in the same folder; the imports are relative to `natural.ui.css`.
- The color scheme follows the operating system setting (`prefers-color-scheme`), and only for `screen` media.
- Imported sheets come before the rules of `natural.ui.css` in the cascade, and every token is declared on `:root`. A stylesheet linked after `natural.ui.css` therefore overrides tokens with a plain `:root { ... }` rule.

```html
<link rel="stylesheet" href="js/natural_js/css/natural.ui.css">
<link rel="stylesheet" href="css/site-theme.css">   <!-- your overrides, loaded last -->
```

# Schema

## `tokens.css` - design tokens (`--njs-*`)

Declared on `:root`, identical for light and dark.[^tokens]

| Group | Properties | Values |
|---|---|---|
| Font family | `--njs-font-family-base`, `--njs-font-family-code` | `'NanumSquare'`, Malgun Gothic and Apple SD Gothic Neo (with their Korean names), `'Microsoft NeoGothic'`, `sans-serif`; `Consolas, monospace, "NanumSquare"` |
| Font weight | `--njs-font-weight-light` / `-semilight` / `-regular` / `-semibold` / `-bold` | 100 / 300 / 400 / 600 / 700 |
| Type scale | `--njs-font-size-<step>`, `--njs-font-weight-<step>`, `--njs-line-height-<step>` for steps `su`, `xxl`, `xl-plus`, `xl`, `l`, `m-plus`, `m`, `s-plus`, `s`, `xs`, `mi` | sizes 42, 28, 24, 21, 17, 15, 14, 13, 12, 11, 10 px; see Known issues for `su` and `m-plus` |
| Elevation | `--njs-elevation-0` / `-4` / `-8` / `-16` / `-64` and aliases `-none`, `-s`, `-m`, `-l`, `-vl` | `box-shadow` values |
| Border radius | `--njs-border-radius-none` / `-s` / `-m` / `-l` / `-xl` / `-cir` | 0, 2, 4, 6, 8, 10000 px |
| Motion | `--njs-motion-duration-ultra-fast` / `-faster` / `-fast` / `-normal` / `-gentle` / `-slow` / `-slower` / `-ultra-slow` | 50, 100, 150, 200, 250, 300, 400, 500 ms |

`natural.ui.css` mainly uses `--njs-border-radius-m`, `--njs-motion-duration-slow` / `-fast` / `-normal`, `--njs-elevation-s` / `-m` / `-vl` and the `s`, `s-plus`, `m` type steps. It never uses the `--njs-font-family-*` tokens (its only `font-family` declaration is `font-family: inherit` on `btn_common__` buttons), so the font tokens take effect only where your own CSS uses them.[^uicss]

## `light.css` / `dark.css` - color scheme

Each file declares on `:root`:[^light][^dark]

- `color-scheme: light` or `color-scheme: dark`.
- The Material Design 3 color roles `--md-sys-color-<role>`: `primary`, `on-primary`, `primary-container`, `on-primary-container`, `secondary`, `on-secondary`, `secondary-container`, `on-secondary-container`, `tertiary`, `on-tertiary`, `tertiary-container`, `on-tertiary-container`, `error`, `on-error`, `error-container`, `on-error-container`, `background`, `on-background`, `surface`, `on-surface`, `surface-variant`, `on-surface-variant`, `outline`, `outline-variant`, `shadow`, `scrim`, `inverse-surface`, `inverse-on-surface`, `inverse-primary`, `surface-tint`, the `*-fixed`, `*-fixed-dim`, `on-*-fixed`, `on-*-fixed-variant` roles, and `surface-dim`, `surface-bright`, `surface-container-lowest` / `-low` / (plain) / `-high` / `-highest`.
- Icons as SVG data URIs: `--njs-icon-close`, `-close-on-primary`, `-page-list`, `-small-arrow`, `-arrow-right`, `-arrow-right-last`, `-search`, `-visibility`, `-open`, `-filter-empty`, `-filter-half`, `-filter-full`, `-update`, `-delete`, `-error`. Their `fill` colors are written into the SVG, matching the file's palette.

The shipped palette is a green seed (light `primary` `rgb(63 104 54)`, dark `primary` `rgb(165 211 150)`). The roles used most by `natural.ui.css` are `on-surface`, `outline-variant`, `surface-container-lowest`, `surface-container-low`, `primary-container` and `primary`.

## `natural.ui.css` - class conventions

| Convention | Examples | Meaning |
|---|---|---|
| Every class set by the framework ends with `__` | `grid__`, `tab_active__`, `btn_primary__` | Framework classes never collide with site classes; do not use the suffix for your own classes. |
| Root class per component | `button__`, `datepicker__`, `tab__`, `select__`, `form__`, `list__`, `grid__`, `pagination__`, `tree__`, `notify__`, `docs__` on the context; `alert__`, `popup__` on the dialog element | Scope overrides with the root class, for example `.grid__ ...`. |
| `<component>_<part>__` | `msg_title_box__`, `datepicker_days_panel__`, `select_input_container__` | Generated inner elements. |
| State classes | `visible__` / `hidden__`, `*_active__`, `*_selected__`, `*_disabled__`, `row_data_changed__`, `row_data_deleted__`, `data_changed__` | Toggled by the components; `visible__` / `hidden__` carry the show and hide transitions, and handlers such as `onShow` wait for their `transitionend`. |
| Button classes | `btn_common__`, `btn_<size>__`, `btn_<color>__`, `btn_<type>__`, `btn_disabled__` | Mapped from the [N.button](button.md) options `size`, `color` and `type`.[^button] |
| Switch | `switch__`, `switch_slider__`, `--njs-switch-*` | CSS-only toggle, documented in [N.select](select.md). |

Button colors map one to one onto color roles: `btn_primary__` uses `--md-sys-color-primary` / `on-primary`, `btn_secondary_container__` uses `secondary-container` / `on-secondary-container`, and so on. Together with a color class, `btn_outlined__` keeps the colored border but makes the background transparent with an `on-surface` text color; `btn_elevated__` gives a transparent background, `on-surface` text and the `--njs-elevation-s` shadow. There is no rule for `btn_filled__`: the color class alone produces the filled look. Without a color class, `btn_filled__` and `btn_outlined__` have no effect and `button` / `input` elements keep the browser's default background and border. `btn_common__` sets shape only (inline-block, border radius, no margin, inherited font); padding, font size and line height come from the `btn_<size>__` classes.[^uicss]

# Precedence

1. `tokens.css`, then `light.css` or `dark.css` (by media query), then the rules of `natural.ui.css`.
2. Your stylesheets, in link order. Custom properties follow the normal cascade, so a later `:root` rule wins.
3. Variables declared on an element beat inherited `:root` values: the `--njs-switch-*` defaults are declared on `.switch__`, so set them on the switch element, not on `:root`.
4. Inline styles written by components lose against `!important` rules in `natural.ui.css` (for example the `N.alert` `overlayColor` option against `.alert_overlay__.block_overlay__`).

# Examples

Brand colors for both schemes (keep the `on-*` roles readable against the new colors):

```css
/* site-theme.css, linked after natural.ui.css */
:root {
    --md-sys-color-primary: rgb(0 90 170);
    --md-sys-color-on-primary: rgb(255 255 255);
    --md-sys-color-primary-container: rgb(212 227 255);
    --md-sys-color-on-primary-container: rgb(0 28 58);
    --njs-border-radius-m: 2px;
}
@media (prefers-color-scheme: dark) {
    :root {
        --md-sys-color-primary: rgb(165 200 255);
        --md-sys-color-on-primary: rgb(0 49 95);
    }
}
```

Force one scheme regardless of the OS setting: link that file again after `natural.ui.css`.

```html
<link rel="stylesheet" href="js/natural_js/css/natural.ui.css">
<link rel="stylesheet" href="js/natural_js/css/dark.css">
```

Switch schemes at runtime with a user toggle:

```html
<link id="themeCss" rel="stylesheet" href="js/natural_js/css/light.css">
```

```js
N("#btnTheme").on("click", function () {
    const link = N("#themeCss");
    link.attr("href", link.attr("href").indexOf("dark.css") > -1
        ? "js/natural_js/css/light.css"
        : "js/natural_js/css/dark.css");
});
```

Apply the font tokens to the page:

```css
body {
    font-family: var(--njs-font-family-base);
    font-size: var(--njs-font-size-m);
    line-height: var(--njs-line-height-m);
    color: var(--md-sys-color-on-surface);
    background-color: var(--md-sys-color-surface);
}
```

# Pitfalls

- The `--njs-icon-*` data URIs contain hard-coded `fill` colors. A new palette does not recolor them; override the icon properties too, or icons keep the green palette's grays and greens.
- `light.css` and `dark.css` both declare `:root`. Linking both unconditionally makes the last one win in every mode; link one, or wrap your own copy in a media query.
- Font tokens are not applied by `natural.ui.css`; without your own `font-family` rule the page uses the browser default font.
- Prefer overriding tokens and `btn_*` rules in your own stylesheet over editing the library's `css/` files, so replacing the library files on upgrade does not discard the theme.

# Known issues

* **Typo in the su font-weight token** - Actual: `tokens.css` declares `--njs-font-weigh-sut` instead of `--njs-font-weight-su`, so `var(--njs-font-weight-su)` is undefined. Likely intent: `--njs-font-weight-su: var(--njs-font-weight-light, 100)`. Workaround: declare `--njs-font-weight-su` yourself; `natural.ui.css` does not use the `su` step.[^tokens]
* **Unitless su line height** - Actual: `--njs-line-height-su: 54` has no unit, unlike every other line-height token (px); used as `line-height` it means 54 times the font size. Likely intent: `54px`. Workaround: override `--njs-line-height-su: 54px`.[^tokens]
* **Invalid m-plus line height** - Actual: `--njs-line-height-m-plus: px` has no number, so any `line-height: var(--njs-line-height-m-plus)` is invalid at computed-value time and falls back to the inherited value. Likely intent: a pixel value between `--njs-line-height-l` (23px) and `--njs-line-height-m` (20px). Workaround: override it, for example `--njs-line-height-m-plus: 21px`; `natural.ui.css` does not use it.[^tokens]
* **No colors in print** - Actual: `light.css` and `dark.css` are imported only for `screen` media, so when printing every `--md-sys-color-*` and `--njs-icon-*` property is undefined and color declarations that use them drop out. Likely intent: a color scheme for all media. Workaround: link `light.css` a second time with `media="print"`, or `@import` it for `print` at the top of your own stylesheet (path relative to that stylesheet).[^uicss]

# Related

- [N.button](button.md) - `size`, `color` and `type` map to the `btn_*` classes.
- [N.select](select.md) - the Switch component and its `--njs-switch-*` properties.
- [Component model](component-model.md) - root classes and `visible__` / `hidden__` transitions.
- [N.alert](alert.md) - overlay and dialog classes, and the `overlayColor` issue.
- [Installation](../setup/installation.md) - which CSS files to deploy and link.
