// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisTreeComponent, TreeNode } from '@iris-ui/lib/tree/tree.component';
import type { Meta, StoryObj } from '@storybook/angular';

const SAMPLE_NODES: TreeNode[] = [
  {
    id: 'ad',
    label: 'Active Directory',
    icon: 'Network',
    expanded: true,
    children: [
      { id: 'ad-oto', label: 'OTO.local' },
      { id: 'ad-builtin', label: 'Builtin', icon: 'Folder' },
      { id: 'ad-dg', label: 'DG-Tests', icon: 'Folder' },
      { id: 'ad-dc', label: 'Domain Controllers', icon: 'Folder' },
      { id: 'ad-fsp', label: 'Foreign Security Principals', icon: 'Shield' },
      { id: 'ad-keys', label: 'Keys', icon: 'Key' },
      {
        id: 'ad-msa',
        label: 'Managed Service Accounts',
        icon: 'FolderUser',
        expanded: true,
        children: [
          {
            id: 'ad-pd',
            label: 'Program Data',
            icon: 'Folder',
            expanded: true,
            children: [
              {
                id: 'ad-sys',
                label: 'System',
                icon: 'Folder',
                expanded: true,
                children: [
                  {
                    id: 'ad-testou',
                    label: 'Test OU',
                    icon: 'Folder',
                    expanded: false,
                    children: [
                      {
                        id: 'ad-testou2',
                        label: 'Test OU2',
                        icon: 'Folder',
                        children: [{ id: 'ad-test1', label: 'Test1' }],
                      },
                    ],
                  },
                  { id: 'ad-test2', label: 'Test2', icon: 'User' },
                  { id: 'ad-test3', label: 'Test3', icon: 'User' },
                ],
              },
            ],
          },
        ],
      },
      { id: 'ad-mu', label: 'Managed Units', icon: 'Folder' },
      {
        id: 'ad-azure',
        label: 'Azure',
        icon: 'FolderUser',
        children: [
          { id: 'azure-users', label: 'Users', icon: 'Users' },
          { id: 'azure-groups', label: 'Security Groups', icon: 'UsersThree' },
        ],
      },
    ],
  },
  {
    id: 'ad-ad-lds',
    label: 'AD LDS',
    icon: 'Database',
    expanded: true,
    children: [
      { id: 'ad-ad-lds-users', label: 'Users', icon: 'Users' },
      { id: 'ad-ad-lds-groups', label: 'Groups', icon: 'UsersThree' },
    ],
  },
];

const meta: Meta<IrisTreeComponent> = {
  title: 'Navigation/Tree',
  component: IrisTreeComponent,
  tags: ['preview'],
  argTypes: {
    nodes: {
      description:
        'Array of `TreeNode` objects defining the hierarchical structure. Each node may contain nested `children` to form branches.',
      control: 'object',
      table: {
        type: { summary: 'TreeNode[]' },
        defaultValue: { summary: '[]' },
      },
    },
    activeNodeId: {
      description:
        'ID of the currently active (selected) node. The matching row is highlighted with an active background.',
      control: 'text',
      table: {
        type: { summary: 'string | null' },
        defaultValue: { summary: 'null' },
      },
    },
    showTrailingIcons: {
      description: 'Shows trailing action icons (overflow menu and expand caret) on hovered and active rows.',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    activeNodeIdChange: {
      description:
        'Emits the new active node ID whenever the user selects a node. Use with `(activeNodeIdChange)` to track selection in the parent.',
      table: {
        type: { summary: 'string | null' },
        defaultValue: { summary: '—' },
        category: 'Events',
      },
    },
    nodeSelectionChange: {
      description: 'Emits the `TreeNode` when the user clicks or keyboard-activates a node.',
      table: {
        type: { summary: 'TreeNode' },
        defaultValue: { summary: '—' },
        category: 'Events',
      },
    },
    nodeToggleChange: {
      description: 'Emits the `TreeNode` when a node is expanded or collapsed via its caret button.',
      table: {
        type: { summary: 'TreeNode' },
        defaultValue: { summary: '—' },
        category: 'Events',
      },
    },
    ariaLabel: {
      description:
        'Accessible label for the `role="tree"` landmark. Recommended when multiple trees exist on the page.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' }, category: 'Accessibility' },
    },
    collapseAriaLabel: {
      description:
        'Accessible label for caret buttons in the expanded state, announced by screen readers. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Collapse' }, category: 'Accessibility' },
    },
    expandAriaLabel: {
      description:
        'Accessible label for caret buttons in the collapsed state, announced by screen readers. Localise for non-English UIs.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: 'Expand' }, category: 'Accessibility' },
    },
  },
};

export default meta;
type Story = StoryObj<IrisTreeComponent>;

export const Overview: Story = {
  argTypes: {
    nodeSelectionChange: { table: { disable: true } },
    nodeToggleChange: { table: { disable: true } },
  },
  args: {
    nodes: SAMPLE_NODES,
    activeNodeId: 'ad-pd',
    showTrailingIcons: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width:350px;">
        <iris-tree
          [nodes]="nodes"
          [activeNodeId]="activeNodeId"
          [showTrailingIcons]="showTrailingIcons"
        ></iris-tree>
      </div>
    `,
  }),
};

export const ActiveNode: Story = {
  argTypes: {
    nodeSelectionChange: { table: { disable: true } },
    nodeToggleChange: { table: { disable: true } },
  },
  args: {
    nodes: SAMPLE_NODES,
    activeNodeId: 'ad-pd',
    showTrailingIcons: true,
  },
};

export const WithoutTrailingIcons: Story = {
  argTypes: {
    nodeSelectionChange: { table: { disable: true } },
    nodeToggleChange: { table: { disable: true } },
  },
  args: {
    nodes: SAMPLE_NODES,
    activeNodeId: null,
    showTrailingIcons: false,
  },
};
