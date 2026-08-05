# Table — Functional Requirements and Hints

## What Iris provides

There is **no Iris Table component.** The table is powered entirely by AG Grid Community edition. Iris provides only a theme — colours, typography, spacing, and borders that match the design system — applied through the AG Grid Theming API. No sorting, filtering, pagination, or cell-rendering logic is owned by Iris; all such capabilities come from AG Grid directly. **Don't create** component file.

## What consumers use

Consumers embed the AG Grid component directly. They receive a single Iris theme object from the component library and apply it to the grid. All AG Grid Community features — sorting, filtering, column resizing, pinning, pagination, cell renderers — are available to consumers through the AG Grid API without any Iris-specific wrapper.

## Grid height

The grid must have an explicit height to render. The consumer is responsible for supplying that height. Iris does not impose or default any height.

## Stories and documentation

Stories must use AG Grid's native column-definition and row-data API. A single Overview story is sufficient. The MDX documentation must link to the AG Grid Community documentation as the primary feature reference. No API table is needed in the MDX. MDX Interactive Demo section does not need `Controls` as we do not control this component.

## Cell renderers in stories

Each AG Grid cell renderer used in a story must live in its own file inside the story folder (e.g. `name-cell-renderer.ts`). Cell renderers must not be defined inline inside the stories file. Shared row-data types and sample data belong in a dedicated file alongside the renderers (e.g. `user-row.ts`). The stories file only imports renderers, defines column definitions, and exports stories.
