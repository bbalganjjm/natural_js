# M3.6 automatic CVC advice contract candidate

Status: bounded cache contract for root/Legacy review before implementation. It supersedes the insufficient one-search-action closure claim, not the preserved R2/R3 app candidates or evidence. No source/docs/project/compiler/browser checks have changed or run.

## Public contract: one field and one type

```ts
export interface PageAdvice<Input = unknown, Output = unknown> {
  readonly match: (path: string, owner: object, page: PageContext<Input, Output>) => boolean;
  readonly wrap: (
    proceed: (...args: unknown[]) => unknown,
    path: string,
    owner: object,
    page: PageContext<Input, Output>
  ) => (...args: unknown[]) => unknown;
}

interface PageDefinition<Input = unknown, Output = unknown> {
  // Existing view/loadHtml/controller contracts stay unchanged.
  advice?: readonly PageAdvice<Input, Output>[];
}
```

Export PageAdvice only from the existing page entry. No new entry, dependency, named advice-call type, registry, string DSL, four-kind interpreter or asynchronous controller factory.

Read the supplied advice array, each declaration and its match/wrap functions once when mountPage is created. Copy the array and callback references; later mutations, deletion/addition or replacement do not change that handle, including reload. Shared frozen declarations/functions are reusable across pages. Undefined/empty advice has no discovery or interception cost and leaves method identities unchanged.

## Automatic target discovery

Install after controller creation and before init, once per actual controller instance. With nonempty advice only, claim the returned controller identity BEFORE storing it as this instance's controller. If another live advised page owns that same controller, fail with PAGE_ADVICE/claim while current.controller is still null: failed-page cleanup releases only its newly owned resources/root and MUST NOT invoke the live owner's deactivate/dispose. After a successful claim, store the controller and install, so later installation failure uses ordinary partial cleanup. Undefined/empty advice follows the existing path without a weak-map claim or discovery.

- Discover own enumerable string properties of the controller and recursively nested plain objects (Object.prototype or null prototype). Do not traverse arrays, DOM, Map, service class prototypes or global objects. Also include the root controller's init/activate/deactivate/dispose lifecycle methods from its prototype when not shadowed by an own property; class receivers remain intact.
- Preserve ES class constructor-valued properties unchanged, including identity and normal new construction. Recognize actual class source with the native Function.prototype.toString; never execute a constructability probe or add Proxy/construct dispatch. Ordinary function methods stay eligible. This does not claim to identify every ES5/native factory or constructor function; an explicit match can exclude those application values.
- Read an enumerable accessor once during discovery and snapshot that value for this installation. Getter throws fail with PAGE_ADVICE/discover. Unmatched descriptors remain untouched. A matched configurable accessor becomes a data-method descriptor without invoking its setter; a matched nonconfigurable accessor is rejected. A later accessor value/new method is not automatically reinstalled after init.
- Discover before applying wrappers. Cyclic edges stop; finite noncyclic alias paths remain matchable. Group by physical owner/key. For each advice declaration, test alias paths in stable discovery order until one matches; install once using the first matched path. A shared alias does not stack the same declaration twice on one physical slot. Different keys holding the same function remain distinct targets.
- Preserve own descriptor flags when replacing data methods. A selected nonconfigurable/nonwritable property, or a prototype lifecycle method on a nonextensible root that cannot be shadowed, fails explicitly with PAGE_ADVICE/install. Preflight replaceability, then recheck captured own/prototype descriptors immediately before each install. If match/wrap changed a descriptor, reject with PAGE_ADVICE/install and preserve that newer callback side effect. Already installed replacements and this page's claims remain through ordinary controller and all owned cleanup; partial installation does not restore early.
- Mutable selected method slots belong to one live page instance. Shared advice declarations are allowed; sharing the same selected physical method slot between live page instances cannot provide independent page policies. Use a private weak ownership guard and reject the conflicting installation with PAGE_ADVICE/install; per-page forwarding methods preserve access to a genuinely shared service without cloning it. This is an internal resource claim, not a public lookup/registration API. Before matching, any already-claimed discovered slot rejects a nonempty-advice page even when its own match would be false; otherwise that page would silently use another page's installed policy. A conflict never touches the previous owner. This page's earlier replacements/claims remain until its ordinary cleanup completes. This guard covers active advised owners; the existing independent-controller/owned-resource contract still applies to every page.

## Invocation and ordered wrappers

match and wrap factories call plainly with captured references. match must synchronously return a boolean; wrap must synchronously return a function. Reject and consume invalid returned promises/thenables. Native RegExp/root.matches and typed custom predicates live in match; no string parsing or selector convention is added.

For each selected method, proceed captures the current callable and original owner using Reflect.apply. Later declarations wrap earlier declarations, preserving ordered nesting. The installed non-async forwarding function calls the produced wrapper plainly; it must not coerce a synchronous result/throw into a Promise. Class/private-field methods retain their original owner through proceed. Borrowing the advised wrapper cannot change that owner. Unmatched functions retain their exact original identity and ordinary calling semantics.

The lexical proceed may run zero, one or multiple times, immediately or later, with replacement arguments. The wrapper's return replaces the result, so ordinary wrapper functions express before/after/around/error without another dispatcher:

```ts
const advice: readonly PageAdvice[] = [
  {
    match: path => /^actions\./.test(path),
    wrap: proceed => (...args) => {
      audit(args);                    // before: its return is ignored
      const result = proceed(...args);
      record(result);                 // synchronous after
      return result;                  // preserves false/null/0/undefined
    }
  },
  {
    match: (path, _owner, page) => path === "init" && page.root.matches('[data-page="employees"]'),
    wrap: (proceed, _path, _owner, page) => async (...args) => {
      await prepare(page.signal);
      page.signal.throwIfAborted();
      try {
        const result = await proceed(...args);
        await afterPrepared(result);
        return result;
      } catch (cause) {
        if (page.signal.aborted) throw cause;
        return recover(cause);
      }
    }
  }
];
```

These policy functions are application code; async wrappers explicitly await their dependencies/after/error operations. Page already awaits its wrapped init/activate result. A wrapper can veto by omitting proceed or run it repeatedly. No once-only guard or fixed before/after/error regrouping is added.

## Cancellation and mandatory cleanup

Guard invocation/proceed only for the owned root init and activate methods. A retained late startup proceed must fail before starting original or inner-advice work. Do not guess work/cleanup from other method names and do not use a global or async cleanup-depth bypass.

Arbitrary action methods retain their original cancellation contract. Actual Employee public actions guard PageContext.signal, and asynchronous application advice checks that signal after awaited work and before further work/proceed. Page untilAbort still settles readiness promptly when arbitrary user work ignores cancellation; the framework cannot cancel that user's promise or undo its side effects.

Root deactivate/dispose and nested cleanup methods remain callable after abort, including through PageContext.own lambdas. Keep interception installed through controller cleanup and all owned resource callbacks; only then restore this page's method replacements by identity and release its successfully restored/no-longer-owned slot claims followed by its root-controller claim. If restoration fails while the slot still contains this page's wrapper, report PAGE_ADVICE/restore, continue all other restoration, and KEEP that private weak slot claim and root nonreuse protection. Do not let a later page adopt a stale wrapper/context. Method slots must remain replaceable through cleanup; after an unrestored failure the application must supply a fresh controller/target. No public reset engine is added. A later external method replacement is not overwritten. Continue all cleanup and preserve M3.4's first failure, including null/undefined, if restoration also fails. No additional cleanup scheduler or public mode flag.

## Errors

Use FrameworkError with api mountPage and code PAGE_ADVICE only for invalid declarations, claim/discovery/match/wrap/install/restore failures. Include a short message, phase, declaration index where applicable, method path where known and original cause. A bad match or wrap result is an installation error; do not silently skip it. Drain invalid asynchronous factory/matcher returns without awaiting them.

Do not wrap arbitrary method-call user throws/rejections inside the interceptor: outer wrapper error handling must receive the actual cause, including primitive null/undefined. Existing Page startup and cleanup normalization still apply at their existing owners. Wrapper factories may register owned resources; partial installation failure cleans them through the common page owner.

## Actual Employee timing

Keep the M3.4 controller factory synchronous. It returns a stable public actions object before init, so automatic advice can discover actions.search. That method forwards to the initialized private binding/search implementation and explicitly rejects before ready; no duplicate queue.

Async init awaits the real page-size catalog, checks signal, then constructs existing bindings. Every inner initial load/native search/save-refresh calls the public actions.search property, so installed advice consistently applies. Private lexical implementation functions remain outside automatic discovery, exactly as in v1. Root close is available during preparation; sibling pages remain independent. Legacy owns these app changes and existing asset-based setup loading.

## Required candidate proofs before source GO

- Own/nested/newly declared pre-init methods are selected automatically; no per-method assignment; native path/view/custom predicates; unmatched identities; aliases/cycles; class lifecycle receiver; nonreplaceable/accessor error policy; no-advice fast path.
- Ordered sync/falsy before/after, async/error nesting, zero/one/multiple/delayed proceeds, root startup cancel, explicit action-signal cancel and cleanup advice/proceed after abort; invalid returns/throw and complete partial cleanup/restoration.
- Two independent pages/shared frozen advice, reload without accumulated wrappers, actual stable Employee actions, preparation-before-binding/close-while-pending, both existing HTML layouts/UX and installed JS/TS/five-browser usage.
- Final source/type/unit/browser/archive/performance/docs facts remain unexecuted; source applies only after root accepts this full contract and independent preflight.

## R2 review checkpoint

The original9f07 contract remains byte-exact. This revision only fixes root-controller claim/adoption order and spells out failed-owner isolation/release order; no implementation has run. Add a two-page same-controller rejection witness that proves page B never invokes page A's cleanup and page A remains usable until its own disposal. Also cover different controllers sharing one selected nested slot, partial failed-install rollback and normal restoration after all owned cleanup.

## R3 class-value precision

The original9f07 and ownership R2 contracts remain preserved. R3 adds only the accepted ES class-value skip policy and an actual-class identity/new witness for known A14 corruption; it does not broaden the public API or constructor guarantees.

## R4 independent ownership review

R4 applies the four accepted Legacy findings: partial-install restoration also follows all owned cleanup; callbacks cannot overwrite changed descriptors; an unrestored own wrapper keeps weak blocked ownership/root nonreuse; and every already-claimed discovered slot rejects a nonempty-advice second page even with a false match. Undefined/empty advice still performs no claim or discovery. All earlier contracts remain preserved; this revision is the implementation basis after final co-review.
