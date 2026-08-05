// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisAvatarComponent } from '@iris-ui/lib/avatar/avatar.component';
import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta<IrisAvatarComponent> = {
  title: 'Display/Avatar',
  component: IrisAvatarComponent,
  tags: ['preview'],
  argTypes: {
    size: {
      description: "Controls the avatar's diameter.",
      control: 'select',
      options: ['sm', 'md', 'default', 'lg'],
      table: { type: { summary: "'sm' | 'md' | 'default' | 'lg'" }, defaultValue: { summary: 'default' } },
    },
    type: {
      description: 'Determines the visual representation: photo, initials placeholder, or NHI icon.',
      control: 'select',
      options: ['face', 'placeholder', 'machine', 'service-account', 'workload', 'bot', 'ai-agent'],
      table: {
        type: { summary: "'face' | 'placeholder' | 'machine' | 'service-account' | 'workload' | 'bot' | 'ai-agent'" },
        defaultValue: { summary: 'placeholder' },
      },
    },
    category: {
      description: "Identity category. Use `'human'` for face/placeholder types, `'nhi'` for non-human identity types.",
      control: 'select',
      options: ['human', 'nhi'],
      table: { type: { summary: "'human' | 'nhi'" }, defaultValue: { summary: 'human' } },
    },
    initials: {
      description: "One or two letters displayed in placeholder avatars. Only used when `type` is `'placeholder'`.",
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' }, category: 'Placeholder' },
    },
    src: {
      description: "URL of the photo. Only used when `type` is `'face'`.",
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' }, category: 'Face' },
    },
    alt: {
      description: "Accessible description of the photo. Only used when `type` is `'face'`.",
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' }, category: 'Face' },
    },
  },
};

export default meta;
type Story = StoryObj<IrisAvatarComponent>;

export const Overview: Story = {
  args: { size: 'default' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'default', 'lg'] },
    type: { table: { disable: true } },
    category: { table: { disable: true } },
    initials: { table: { disable: true } },
    src: { table: { disable: true } },
    alt: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;gap:12px;align-items:center;">
          <iris-avatar type="placeholder" category="human" initials="SR" [size]="size"></iris-avatar>
          <iris-avatar type="placeholder" category="human" initials="RW" [size]="size"></iris-avatar>
          <iris-avatar type="placeholder" category="human" initials="A"  [size]="size"></iris-avatar>
        </div>
        <div style="display:flex;gap:12px;align-items:center;">
          <iris-avatar type="face" category="human" src="https://picsum.photos/id/64/200/200" alt="Profile photo" [size]="size"></iris-avatar>
          <iris-avatar type="face" category="human" src="https://picsum.photos/id/239/200/200" alt="Profile photo" [size]="size"></iris-avatar>
        </div>
        <div style="display:flex;gap:12px;align-items:center;">
          <iris-avatar type="machine" category="nhi" [size]="size"></iris-avatar>
          <iris-avatar type="service-account" category="nhi" [size]="size"></iris-avatar>
          <iris-avatar type="workload" category="nhi" [size]="size"></iris-avatar>
          <iris-avatar type="bot" category="nhi" [size]="size"></iris-avatar>
          <iris-avatar type="ai-agent" category="nhi" [size]="size"></iris-avatar>
        </div>
      </div>
    `,
  }),
};

export const Small: Story = {
  args: { type: 'placeholder', initials: 'SM', size: 'sm' },
};

export const Medium: Story = {
  args: { type: 'placeholder', initials: 'MD', size: 'md' },
};

export const Default: Story = {
  args: { type: 'placeholder', initials: 'DF', size: 'default' },
};

export const Large: Story = {
  args: { type: 'placeholder', initials: 'LG', size: 'lg' },
};

export const Face: Story = {
  args: { type: 'face', src: 'https://picsum.photos/id/64/200/200', size: 'default' },
};

export const Machine: Story = {
  args: { type: 'machine', category: 'nhi', size: 'default' },
};

export const ServiceAccount: Story = {
  args: { type: 'service-account', category: 'nhi', size: 'default' },
};

export const Workload: Story = {
  args: { type: 'workload', category: 'nhi', size: 'default' },
};

export const Bot: Story = {
  args: { type: 'bot', category: 'nhi', size: 'default' },
};

export const AiAgent: Story = {
  args: { type: 'ai-agent', category: 'nhi', size: 'default' },
};
