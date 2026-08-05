// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisButtonComponent } from '@iris-ui/lib/button/button.component';
import { IrisMenuDirective } from '@iris-ui/lib/menu/menu.directive';
import { MenuItem } from '@iris-ui/lib/menu/menu.model';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const DEFAULT_ITEMS: MenuItem[] = [
  { id: 'edit', type: 'item', label: 'Edit', icon: 'Pencil' },
  { id: 'duplicate', type: 'item', label: 'Duplicate', icon: 'Copy' },
  { id: 'archive', type: 'item', label: 'Archive', icon: 'Archive' },
  { type: 'separator' },
  {
    id: 'move',
    type: 'item',
    label: 'Move to folder',
    icon: 'Folder',
    children: [
      { id: 'move-projects', type: 'item', label: 'Projects', icon: 'Folder' },
      { id: 'move-archive', type: 'item', label: 'Archive', icon: 'Archive' },
      { id: 'move-templates', type: 'item', label: 'Templates', icon: 'Layout' },
    ],
  },
  { type: 'separator' },
  { id: 'delete', type: 'item', label: 'Delete', icon: 'Trash', destructive: true },
];

const DEEP_ITEMS: MenuItem[] = [
  { id: 'edit', type: 'item', label: 'Edit', icon: 'Pencil' },
  {
    id: 'share',
    type: 'item',
    label: 'Share',
    icon: 'ShareNetwork',
    children: [
      { id: 'share-link', type: 'item', label: 'Copy link', icon: 'Link' },
      {
        id: 'share-export',
        type: 'item',
        label: 'Export as',
        icon: 'ArrowSquareOut',
        children: [
          { id: 'export-pdf', type: 'item', label: 'PDF', icon: 'FilePdf' },
          { id: 'export-csv', type: 'item', label: 'CSV', icon: 'Table' },
          { id: 'export-json', type: 'item', label: 'JSON', icon: 'Code' },
        ],
      },
    ],
  },
  { type: 'separator' },
  { id: 'delete', type: 'item', label: 'Delete', icon: 'Trash', destructive: true },
];

const meta: Meta<IrisMenuDirective> = {
  title: 'Navigation/Menu',
  component: IrisMenuDirective,
  tags: ['preview'],
  decorators: [moduleMetadata({ imports: [IrisMenuDirective, IrisButtonComponent] })],
  argTypes: {
    irisMenu: {
      description: 'Array of menu items and separators to display in the floating panel.',
      control: 'object',
      table: {
        type: { summary: 'MenuItem[]' },
        defaultValue: { summary: '[]' },
      },
    },
    irisMenuPosition: {
      description:
        'Preferred position of the menu panel relative to the trigger. Falls back to other positions when the viewport has insufficient space.',
      control: 'select',
      options: ['bottom-end', 'bottom-start', 'top-end', 'top-start'],
      table: {
        type: { summary: "'bottom-end' | 'bottom-start' | 'top-end' | 'top-start'" },
        defaultValue: { summary: "'bottom-start'" },
      },
    },
    irisMenuItemSelected: {
      description:
        'Emits the selected `MenuActionItem` when the user clicks or activates an item. The menu closes after emission.',
      table: {
        type: { summary: 'MenuActionItem' },
        defaultValue: { summary: '—' },
        category: 'Events',
      },
    },
  },
};

export default meta;
type Story = StoryObj<IrisMenuDirective>;

export const Overview: Story = {
  args: {
    irisMenu: DEFAULT_ITEMS,
    irisMenuPosition: 'bottom-start',
  },
  argTypes: {
    irisMenuItemSelected: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <iris-button [irisMenu]="irisMenu" [irisMenuPosition]="irisMenuPosition">
        Open Menu
      </iris-button>
    `,
  }),
};

export const WithDestructiveItem: Story = {
  args: {
    irisMenu: [
      { id: 'edit', type: 'item', label: 'Edit', icon: 'Pencil' },
      { id: 'duplicate', type: 'item', label: 'Duplicate', icon: 'Copy' },
      { type: 'separator' },
      { id: 'delete', type: 'item', label: 'Delete permanently', icon: 'Trash', destructive: true },
    ],
    irisMenuPosition: 'bottom-start',
  },
  argTypes: {
    irisMenuItemSelected: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <iris-button [irisMenu]="irisMenu" [irisMenuPosition]="irisMenuPosition">
        Actions
      </iris-button>
    `,
  }),
};

export const WithDisabledItem: Story = {
  args: {
    irisMenu: [
      { id: 'edit', type: 'item', label: 'Edit', icon: 'Pencil' },
      { id: 'delete', type: 'item', label: 'Delete', icon: 'Trash', disabled: true },
    ],
    irisMenuPosition: 'bottom-start',
  },
  argTypes: {
    irisMenuItemSelected: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <iris-button [irisMenu]="irisMenu" [irisMenuPosition]="irisMenuPosition">
        Actions
      </iris-button>
    `,
  }),
};

export const Positions: Story = {
  argTypes: {
    irisMenu: { table: { disable: true } },
    irisMenuPosition: { table: { disable: true } },
    irisMenuItemSelected: { table: { disable: true } },
  },
  render: () => ({
    props: { items: DEFAULT_ITEMS },
    template: `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;width:fit-content;margin:auto;">
        <div style="display:flex;justify-content:center;">
          <iris-button [irisMenu]="items" irisMenuPosition="top-start">Top start</iris-button>
        </div>
        <div style="display:flex;justify-content:center;">
          <iris-button [irisMenu]="items" irisMenuPosition="top-end">Top end</iris-button>
        </div>
        <div style="display:flex;justify-content:center;">
          <iris-button [irisMenu]="items" irisMenuPosition="bottom-start">Bottom start</iris-button>
        </div>
        <div style="display:flex;justify-content:center;">
          <iris-button [irisMenu]="items" irisMenuPosition="bottom-end">Bottom end</iris-button>
        </div>
      </div>
    `,
  }),
};

export const WithDeepNesting: Story = {
  argTypes: {
    irisMenu: { table: { disable: true } },
    irisMenuPosition: { table: { disable: true } },
    irisMenuItemSelected: { table: { disable: true } },
  },
  render: () => ({
    props: { items: DEEP_ITEMS },
    template: `
      <iris-button [irisMenu]="items" irisMenuPosition="bottom-start">Open Menu</iris-button>
    `,
  }),
};
