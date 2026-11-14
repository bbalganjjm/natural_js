# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: page-advice.spec.ts >> two real pages discover nested methods and class lifecycle methods through native predicates with independent receivers
- Location: tests\browser\page-advice.spec.ts:8:1

# Error details

```
Error: page.evaluate: FrameworkError: Page operation failed
    at pageError (http://127.0.0.1:4173/@fs/D:/workspace/natural_js/src/page/index.ts:9:9)
    at normalize (http://127.0.0.1:4173/@fs/D:/workspace/natural_js/src/page/index.ts:20:9)
    at start (http://127.0.0.1:4173/@fs/D:/workspace/natural_js/src/page/index.ts:267:10)
```

# Page snapshot

```yaml
- main [ref=e2]:
  - heading "Natural-JS 2.0 import smoke" [level=1] [ref=e3]
  - paragraph [ref=e4]:
    - link "Grid contract demo" [ref=e5] [cursor=pointer]:
      - /url: /m10/demo.html
    - text: ·
    - link "Choice-group CVC demo" [ref=e6] [cursor=pointer]:
      - /url: /m5/choices.html
    - text: ·
    - link "Tree and DatePicker CVC demo" [ref=e7] [cursor=pointer]:
      - /url: /m11/side.html
    - text: ·
    - link "Application shell demo" [ref=e8] [cursor=pointer]:
      - /url: /m12/side.html
  - generic [ref=e9]:
    - heading "First authored view" [level=2] [ref=e10]
    - button "Check import" [ref=e11]
    - status [ref=e12]: ESM ready
  - generic [ref=e13]:
    - heading "Second authored view" [level=2] [ref=e14]
    - button "Check import" [ref=e15]
    - status [ref=e16]: ESM ready
```