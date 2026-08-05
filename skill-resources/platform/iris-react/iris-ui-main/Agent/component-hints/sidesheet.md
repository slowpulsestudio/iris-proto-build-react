# Sidesheet — Functional Requirements and Hints

A contextual workspace panel that slides in from the right edge of the screen. It overlays the current page with a semi-transparent backdrop, allowing users to access contextual information or actions without navigating away.

## Opening

The sidesheet is opened exclusively via `IrisSidesheetService.open(component, config?)`. There is no template declaration or `<iris-sidesheet>` element in consumer templates. The service creates the CDK overlay, attaches the shell component, inserts the content component dynamically, and returns an `IrisSidesheetRef`.

```ts
const ref = this.sheetService.open(MyContentComponent, {
  title: 'Item Details',
  subtitle: 'Optional subtitle',
  data: { itemId: 42 },
});
ref.afterClosed().subscribe((result) => { ... });
```

## Closing

The content component injects `IrisSidesheetRef` and calls `close(data?)` to close with an optional typed result. The caller receives it via `afterClosed()`, which emits once then completes.

```ts
readonly sheetRef = inject(IrisSidesheetRef<boolean>);
// ...
this.sheetRef.close(true);
```

## Dismissal

- `dismissable` (default `true`) — master gate: when `false`, hides the × button and disables Escape and backdrop-click
- `closeOnEscape` (default `true`) — only applies when `dismissable` is `true`
- `closeOnBackdropClick` (default `true`) — only applies when `dismissable` is `true`

## Width

Configurable via `width` in `IrisSidesheetConfig`. Accepts any valid CSS length. Defaults to `'512px'`.

## Positioning and appearance

Rendered via CDK `GlobalPositionStrategy`, pinned 8px from the right, top, and bottom viewport edges. The panel has `border-radius: var(--oi-border-radius-l)`. Backdrop fades in on open and fades out concurrently with the panel's 200ms slide-out animation.

The `:host` of `IrisSidesheetComponent` sets `width: 100%; height: 100%` so the content fills the CDK overlay pane.

## Maximize

- `enableMaximizeToggle` (default `false`) — shows a toggle button in the header
- `maximized` (default `false`) — opens the sidesheet already expanded, independent of `enableMaximizeToggle`
- When expanded, the panel fills the viewport with 8px spacing on all four sides (same gap as normal state)
- `maximizedChange` output emits the new boolean state when the toggle is clicked; the service listens to this to resize the CDK overlay pane

## Footer

Footer actions are added via `IrisSidesheetFooterDirective` on an `<ng-template>` inside the content component. The directive injects `IRIS_SIDESHEET_CONTAINER` (provided by `IrisSidesheetComponent`) and calls `footerOutlet.createEmbeddedView(templateRef)` on init — this works for both service-based and template-based usage.

```ts
@Component({
  imports: [IrisSidesheetFooterDirective, IrisButtonComponent],
  template: `
    <p>Body content</p>
    <ng-template irisSidesheetFooter>
      <iris-button variant="secondary" (click)="sheetRef.close()">Cancel</iris-button>
      <iris-button (click)="sheetRef.close(true)">Save</iris-button>
    </ng-template>
  `,
})
```

Footer alignment is controlled via `footerAlign` in `IrisSidesheetConfig` (`'start'` | `'center'` | `'end'`, defaults to `'end'`). The footer is hidden via `:not(:has(*))` when empty.

## Data injection

Pass arbitrary data via `config.data`. Retrieve it in the content component with `injectSheetData<T>()` (typed helper for `IRIS_SIDESHEET_DATA` token).

Both the input data type and the result type are generic and opt-in. A content component that expects typed data implements `IrisSidesheetContent<D>` and assigns `injectSheetData<D>()` to the `sidesheetData` property. This causes `IrisSidesheetService.open()` to infer `D` from the component type and enforce the correct `data` shape at the call site — passing the wrong type is a compile error. A content component that does not implement `IrisSidesheetContent` accepts any value for `data`. The result type `R` of `IrisSidesheetRef<R>` is specified as an explicit type argument on `open<R>(...)` — it types the value emitted by `afterClosed()` and enforced on `close(data?)` inside the content component. Both generics are independent; either, both, or neither may be used.

## Title icon

Pass `titleIcon` (icon name string) to render an icon beside the title in the header.

## Stories

All stories are service-based (no template `<iris-sidesheet>`). Each story creates a host component with a button that calls `IrisSidesheetService.open()`. The `Default` story exposes `width` as a Storybook arg. No Controls panel / interactive demo — each story illustrates one specific configuration.

## Accessibility

- Panel renders as `<aside role="dialog" aria-modal="true">`, `aria-label` set from `title`
- Focus is trapped via CDK `FocusTrapFactory`; restored to the previously focused element on close
- Escape closes when `dismissable` and `closeOnEscape` are both `true`
- Maximize button exposes `aria-pressed` plus `maximizeAriaLabel` / `restoreAriaLabel` (localisable)
- Close button label defaults to `"Close"`, overridable via `closeAriaLabel`
