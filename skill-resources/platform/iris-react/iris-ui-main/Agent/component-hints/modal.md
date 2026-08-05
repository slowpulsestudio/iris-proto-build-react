# Modal — Functional Requirements and Hints

## Purpose

A modal is a focused dialog layer that interrupts the current flow to capture user attention. It blocks interaction with the underlying content until the user completes or explicitly dismisses the action. Use sparingly — only for interactions that truly require the user's full attention before continuing.

## Opening and closing

The modal exposes `open()` and `close(data?)` methods on its component instance. The consumer obtains a reference to the component via a template reference variable and calls these methods directly — for example from a button's click handler. The consumer does not manage an open/closed boolean flag. When the modal closes for any reason (method call, Escape, backdrop, dismiss button), it emits a `closed` event carrying an optional payload. The consumer may pass any value to `close(data?)` — for example `modal.close({ confirmed: true })` — and receive it in the `(closed)` handler. Passing no argument emits `undefined`. Handling this event is not required to keep the modal closed.

Open and close state is owned entirely by the component and driven through its public methods.

## Dismissal

By default the modal can be dismissed in three ways: pressing Escape, clicking the backdrop area outside the modal panel, or clicking the dedicated dismiss (×) button in the header. All three paths close the modal and emit the `closed` event.

When configured as non-dismissable, the Escape key, backdrop click, and dismiss button are all disabled. The consumer must provide an explicit action button inside the modal that calls `close()` to let the user exit.

When the modal is dismissable, the Escape key and backdrop-click paths can be controlled independently. Disable backdrop-click to force users to use Escape or the dismiss button — for example when the modal sits over a canvas where accidental clicks outside are likely. Disable Escape to require a pointer action. These controls have no effect when the modal is non-dismissable.

## Sizes

Three sizes are available: small, medium, and large. The size affects only the width of the modal panel. The default size is medium.

- **Small** — brief confirmations or simple one-step decisions where a single sentence of context is sufficient.
- **Medium** — the default; short forms, review steps, or actions that benefit from a clear title and a sentence or two of context.
- **Large** — multi-field forms, detailed settings panels, or content that benefits from a wider reading area.

## Title icon

An optional icon can appear to the left of the title to reinforce the intent of the modal — for example a warning icon for alerts or a settings icon for configuration panels. The icon is omitted when not provided.

## Structure

The modal consists of a header, a body, and a footer.

- The header always contains a title. It may optionally include a subtitle beneath the title and an icon to the left of the title. A dismiss button appears in the header when the modal is dismissable.
- The body contains consumer-supplied content.
- The footer contains consumer-supplied action buttons.
- A divider is always shown between the header and body, and always between the body and footer.

## Footer alignment

The footer supports three alignment options for its action buttons: aligned to the leading edge, centred, or aligned to the trailing edge. The default is trailing. Choose the alignment that fits the surrounding context — most flows use trailing to keep the primary action at the far right, consistent with standard form conventions.

## Closing animation

When the modal closes, it plays a brief exit animation before it fully hides, giving users a clear visual cue that the interaction has ended.

A semi-transparent overlay covers the page behind the modal by default. This overlay can be suppressed — for example when embedding the modal in a constrained preview context.

## Layer

Implement the modal using the native browser `<dialog>` element and its `showModal()` method. This places the dialog in the browser's top layer — a dedicated rendering layer above all other page content, unaffected by z-index stacking contexts, overflow clipping, or CSS transform rules on ancestor elements. The browser's built-in `::backdrop` pseudo-element provides the overlay behind the dialog. Do not attempt to replicate top-layer behaviour with z-index or a manually inserted overlay element.

## Footer

Footer actions are added via `IrisModalFooterDirective` on an `<ng-template>` inside the content component or modal template. The directive injects `IRIS_MODAL_CONTAINER` (provided by `IrisModalComponent`) and calls `footerOutlet.createEmbeddedView(templateRef)` on init — this works for both service-based and template-based usage.

Service-based content component:

```ts
@Component({
  imports: [IrisModalFooterDirective, IrisButtonComponent],
  template: `
    <p>Body content</p>
    <ng-template irisModalFooter>
      <iris-button variant="secondary" (click)="modalRef.close()">Cancel</iris-button>
      <iris-button (click)="modalRef.close(true)">Confirm</iris-button>
    </ng-template>
  `,
})
```

Template-based usage (`<ng-container irisModalFooter>` also works via `ng-content` for template consumers):

```html
<iris-modal #modal title="...">
  <p>Body</p>
  <ng-template irisModalFooter>
    <iris-button variant="secondary" (click)="modal.close()">Cancel</iris-button>
    <iris-button (click)="modal.close(true)">Confirm</iris-button>
  </ng-template>
</iris-modal>
```

Footer alignment is controlled via `footerAlign` input (`'start'` | `'center'` | `'end'`, defaults to `'end'`). In `IrisModalService`, pass `footerAlign` in the config. The footer is hidden via `:not(:has(*))` when empty.

## Programmatic API

The modal can also be opened without a template declaration using `IrisModalService`. The consumer provides a component type that is created dynamically and rendered inside the modal body. Configuration (title, size, etc.) is passed as part of the config object.

Both the input data type and the result type are generic and opt-in. A content component that expects typed data implements `IrisModalContent<D>` and assigns `injectModalData<D>()` to the `modalData` property. This causes `IrisModalService.open()` to infer `D` from the component type and enforce the correct `data` shape at the call site — passing the wrong type is a compile error. A content component that does not implement `IrisModalContent` accepts any value for `data`. The result type `R` of `IrisModalRef<R>` is specified as an explicit type argument on `open<R>(...)` — it types the value emitted by `afterClosed()` and enforced on `close(data?)` inside the content component. Both generics are independent; either, both, or neither may be used.

The service returns an `IrisModalRef` which exposes a `close(data?)` method and an `afterClosed()` observable that emits once with the value passed to `close`, then completes. This pattern is appropriate for modals opened from services, route guards, or application logic that has no template context.

## Stories and documentation

The modal does not include an interactive demo or a Controls panel. Stories show named examples triggered by a button click — each story opens its own modal instance. No story binds component inputs to Controls args; inputs are set directly in the story template. Each story illustrates one specific use case.

## Accessibility

The modal panel is a dialog. It carries a label derived from its title so assistive technologies can announce what it is. Focus is trapped inside the modal while it is open. When the modal closes, focus returns to the element that triggered it.
