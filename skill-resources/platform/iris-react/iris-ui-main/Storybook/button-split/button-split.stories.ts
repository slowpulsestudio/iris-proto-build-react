// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisButtonSplitComponent } from '@iris-ui/lib/button-split/button-split.component';
import type { MenuItem } from '@iris-ui/lib/menu/menu.model';
import type { Meta, StoryObj } from '@storybook/angular';

const SAVE_MENU_ITEMS: MenuItem[] = [
  { id: 'save-keep-open', type: 'item', label: 'Save and keep open', icon: 'FloppyDisk' },
  { id: 'save-draft', type: 'item', label: 'Save as draft', icon: 'Note' },
];

const meta: Meta<IrisButtonSplitComponent> = {
  title: 'Actions/ButtonSplit',
  component: IrisButtonSplitComponent,
  tags: ['preview'],
  argTypes: {
    variant: {
      description: 'Visual style of the split button.',
      control: 'select',
      options: ['primary', 'ghost'],
      table: {
        type: { summary: "'primary' | 'ghost'" },
        defaultValue: { summary: 'primary' },
      },
    },
    label: {
      description: 'Text displayed in the primary action button.',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Button' },
      },
    },
    disabled: {
      description: 'Prevents interaction with both buttons when `true`.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    menu: {
      description:
        'Menu items shown when the dropdown toggle is clicked. The toggle always opens a floating menu; pass items to populate it.',
      control: 'object',
      table: {
        type: { summary: 'MenuItem[]' },
        defaultValue: { summary: '[]' },
      },
    },
    menuPosition: {
      description: 'Preferred position of the floating menu relative to the toggle button.',
      control: 'select',
      options: ['bottom-end', 'bottom-start', 'top-end', 'top-start'],
      table: {
        type: { summary: "'bottom-end' | 'bottom-start' | 'top-end' | 'top-start'" },
        defaultValue: { summary: "'bottom-end'" },
      },
    },
    primaryClick: {
      description: 'Emits when the primary action button is clicked.',
      table: {
        type: { summary: 'MouseEvent' },
        defaultValue: { summary: '—' },
        category: 'Events',
      },
    },
    menuItemClick: {
      description: 'Emits the selected `MenuItem` when the user picks an option from the menu.',
      table: {
        type: { summary: 'MenuItem' },
        defaultValue: { summary: '—' },
        category: 'Events',
      },
    },
    moreOptionsAriaLabel: {
      description:
        'Accessible label for the dropdown trigger button, announced by screen readers. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'More options' }, category: 'Accessibility' },
    },
  },
};

export default meta;
type Story = StoryObj<IrisButtonSplitComponent>;

export const Overview: Story = {
  args: { disabled: false, label: 'Save' },
  argTypes: {
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    variant: { table: { disable: true } },
    menu: { table: { disable: true } },
    menuPosition: { table: { disable: true } },
    primaryClick: { table: { disable: true } },
    menuItemClick: { table: { disable: true } },
  },
  render: (args) => ({
    props: { ...args, saveMenuItems: SAVE_MENU_ITEMS },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;gap:8px;align-items:center;">
          <iris-button-split variant="primary" [disabled]="disabled" [label]="label" [menu]="saveMenuItems"></iris-button-split>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <iris-button-split variant="ghost" [disabled]="disabled" [label]="label" [menu]="saveMenuItems"></iris-button-split>
        </div>
      </div>
    `,
  }),
};

export const Primary: Story = {
  args: { variant: 'primary', label: 'Save' },
  argTypes: {
    menu: { table: { disable: true } },
    menuPosition: { table: { disable: true } },
    menuItemClick: { table: { disable: true } },
  },
  render: (args) => ({
    props: { ...args, saveMenuItems: SAVE_MENU_ITEMS },
    template: `<iris-button-split [variant]="variant" [label]="label" [disabled]="disabled" [menu]="saveMenuItems"></iris-button-split>`,
  }),
};

export const Ghost: Story = {
  args: { variant: 'ghost', label: 'Options' },
  argTypes: {
    menu: { table: { disable: true } },
    menuPosition: { table: { disable: true } },
    menuItemClick: { table: { disable: true } },
  },
  render: (args) => ({
    props: { ...args, saveMenuItems: SAVE_MENU_ITEMS },
    template: `<iris-button-split [variant]="variant" [label]="label" [disabled]="disabled" [menu]="saveMenuItems"></iris-button-split>`,
  }),
};

export const Disabled: Story = {
  args: { variant: 'primary', label: 'Save', disabled: true },
  argTypes: {
    menu: { table: { disable: true } },
    menuPosition: { table: { disable: true } },
    menuItemClick: { table: { disable: true } },
  },
  render: (args) => ({
    props: { ...args, saveMenuItems: SAVE_MENU_ITEMS },
    template: `<iris-button-split [variant]="variant" [label]="label" [disabled]="disabled" [menu]="saveMenuItems"></iris-button-split>`,
  }),
};

export const WithMenu: Story = {
  argTypes: {
    variant: { table: { disable: true } },
    label: { table: { disable: true } },
    disabled: { table: { disable: true } },
    menu: { table: { disable: true } },
    menuPosition: { table: { disable: true } },
    primaryClick: { table: { disable: true } },
    menuItemClick: { table: { disable: true } },
  },
  render: () => ({
    props: { saveMenuItems: SAVE_MENU_ITEMS },
    template: `<iris-button-split label="Save" [menu]="saveMenuItems"></iris-button-split>`,
  }),
};

export const EmptyMenu: Story = {
  name: 'No Options Available',
  argTypes: {
    variant: { table: { disable: true } },
    label: { table: { disable: true } },
    disabled: { table: { disable: true } },
    menu: { table: { disable: true } },
    menuPosition: { table: { disable: true } },
    primaryClick: { table: { disable: true } },
    menuItemClick: { table: { disable: true } },
  },
  render: () => ({
    props: { emptyMenu: [] },
    template: `<iris-button-split label="Save" [menu]="emptyMenu"></iris-button-split>`,
  }),
};
