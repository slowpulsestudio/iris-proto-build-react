// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisBadgeComponent } from '@iris-ui/lib/badge/badge.component';
import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<IrisBadgeComponent> = {
  title: 'Display/Badge',
  component: IrisBadgeComponent,
  tags: ['preview'],
  argTypes: {
    type: {
      description: 'Visual intent color of the badge.',
      control: 'select',
      options: ['default', 'info', 'success', 'error', 'warning'],
      table: {
        type: { summary: "'default' | 'info' | 'success' | 'error' | 'warning'" },
        defaultValue: { summary: 'default' },
      },
    },
    strong: {
      description: 'Increases color saturation for higher visual emphasis.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    text: {
      description: 'Label text rendered inside the badge.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
    },
    iconName: {
      description: 'Optional leading icon name displayed before the text.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
    },
  },
};

export default meta;
type Story = StoryObj<IrisBadgeComponent>;

export const Overview: Story = {
  args: { strong: false },
  argTypes: {
    strong: { control: 'boolean' },
    type: { table: { disable: true } },
    text: { table: { disable: true } },
    iconName: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;margin: 1rem">
        <iris-badge type="default" text="Default" [strong]="strong" [iconName]="iconName"></iris-badge>
        <iris-badge type="info"    text="Info"    [strong]="strong" [iconName]="iconName"></iris-badge>
        <iris-badge type="success" text="Success" [strong]="strong" [iconName]="iconName"></iris-badge>
        <iris-badge type="warning" text="Warning" [strong]="strong" [iconName]="iconName"></iris-badge>
        <iris-badge type="error"   text="Error"   [strong]="strong" [iconName]="iconName"></iris-badge>
      </div> 
       <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;margin: 1rem">
        <iris-badge type="default" text="Default" [strong]="strong" iconName="DiamondsFour"></iris-badge>
        <iris-badge type="info"    text="Info"    [strong]="strong" iconName="DiamondsFour"></iris-badge>
        <iris-badge type="success" text="Success" [strong]="strong" iconName="DiamondsFour"></iris-badge>
        <iris-badge type="warning" text="Warning" [strong]="strong" iconName="DiamondsFour"></iris-badge>
        <iris-badge type="error"   text="Error"   [strong]="strong" iconName="DiamondsFour"></iris-badge>
      </div>
    `,
  }),
};

export const Default: Story = {
  args: { text: 'Badge', type: 'default', strong: false },
};

export const Info: Story = {
  args: { text: 'Badge', type: 'info', strong: false },
};

export const Success: Story = {
  args: { text: 'Badge', type: 'success', strong: false },
};

export const Warning: Story = {
  args: { text: 'Badge', type: 'warning', strong: false },
};

export const Error: Story = {
  args: { text: 'Badge', type: 'error', strong: false },
};

export const Strong: Story = {
  args: { text: 'Badge', type: 'success', strong: true },
};

export const WithIconAndText: Story = {
  args: { text: 'Active', type: 'success', strong: false, iconName: 'DiamondsFour' },
};

export const WithIconOnly: Story = {
  args: { text: '', type: 'info', strong: false, iconName: 'DiamondsFour' },
};
