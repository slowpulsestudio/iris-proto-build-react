// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

export const irisTheme = themeQuartz.withParams({
  fontFamily: 'var(--oi-font-family-default)',
  fontSize: 'var(--oi-font-size-s)',
  foregroundColor: 'var(--oi-content-color-primary)',
  backgroundColor: 'var(--oi-background-color-primary)',
  headerTextColor: 'var(--oi-content-color-primary)',
  headerBackgroundColor: 'var(--oi-background-color-primary)',
  headerHeight: '36px',
  borderColor: 'var(--oi-border-color-muted)',
  rowHoverColor: 'var(--oi-button-background-secondary-hover)',
  rowHeight: '44px',
  spacing: 'var(--oi-spacing-s)',
  rowBorder: true,
  columnBorder: true,
});

export type { ColDef, GridOptions } from 'ag-grid-community';
