// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { irisTheme } from '@iris-ui/lib/table/table.model';
import type { Meta, StoryObj } from '@storybook/angular';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridOptions } from 'ag-grid-community';
import { EmailCellRenderer } from './email-cell-renderer';
import { IconHeaderRenderer } from './icon-header-renderer';
import { LocationCellRenderer } from './location-cell-renderer';
import { NameCellRenderer } from './name-cell-renderer';
import { StatusCellRenderer } from './status-cell-renderer';
import { TagsCellRenderer } from './tags-cell-renderer';
import { userRows } from './user-row';

const columnDefs: ColDef[] = [
  {
    width: 40,
    maxWidth: 40,
    minWidth: 40,
    resizable: false,
    sortable: false,
    checkboxSelection: true,
    headerCheckboxSelection: true,
    headerName: '',
  },
  {
    field: 'name',
    headerName: 'User',
    headerComponent: IconHeaderRenderer,
    headerComponentParams: { iconName: 'IdentificationCard' },
    cellRenderer: NameCellRenderer,
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'status',
    headerName: 'Status',
    headerComponent: IconHeaderRenderer,
    headerComponentParams: { iconName: 'UserCircleCheck' },
    cellRenderer: StatusCellRenderer,
    width: 120,
  },
  {
    field: 'about',
    headerName: 'About',
    headerComponent: IconHeaderRenderer,
    headerComponentParams: { iconName: 'ArticleNyTimes' },
    flex: 2,
    minWidth: 150,
  },
  {
    field: 'email',
    headerName: 'Email',
    headerComponent: IconHeaderRenderer,
    headerComponentParams: { iconName: 'Envelope' },
    cellRenderer: EmailCellRenderer,
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'tags',
    headerName: 'Tags',
    headerComponent: IconHeaderRenderer,
    headerComponentParams: { iconName: 'Tag' },
    cellRenderer: TagsCellRenderer,
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'location',
    headerName: 'Location',
    headerComponent: IconHeaderRenderer,
    headerComponentParams: { iconName: 'BuildingOffice' },
    cellRenderer: LocationCellRenderer,
    flex: 1,
    minWidth: 120,
  },
];

const selectionGridOptions: GridOptions = { rowSelection: 'multiple' };

const gridRender = (colDefs: ColDef[], rowData: unknown[], defaultColDef?: ColDef, gridOptions?: GridOptions) => ({
  props: { columnDefs: colDefs, rowData, defaultColDef, gridOptions, irisTheme },
  moduleMetadata: { imports: [AgGridAngular] },
  template: `
    <ag-grid-angular
      style="height: 400px; display: block;"
      [theme]="irisTheme"
      [columnDefs]="columnDefs"
      [rowData]="rowData"
      [defaultColDef]="defaultColDef"
      [gridOptions]="gridOptions ?? {}">
    </ag-grid-angular>
  `,
});

const meta: Meta = {
  title: 'Display/Table',
  tags: ['preview'],
};

export default meta;
type Story = StoryObj;

export const Overview: Story = {
  render: () => gridRender(columnDefs, userRows, undefined, selectionGridOptions),
};
