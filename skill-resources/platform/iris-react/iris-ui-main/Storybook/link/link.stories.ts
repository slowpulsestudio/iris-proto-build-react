// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisLinkComponent } from '@iris-ui/lib/link/link.component';
import type { Meta, StoryObj } from '@storybook/angular';

const rnd = () => `https://example.com/${Math.random().toString(36).slice(2)}`;
const hrefs = {
  overviewSm: rnd(),
  overviewLg: rnd(),
  default: rnd(),
  large: rnd(),
  disabled: rnd(),
};

const meta: Meta<IrisLinkComponent> = {
  title: 'Navigation/Link',
  component: IrisLinkComponent,
  tags: ['preview'],
  argTypes: {
    href: {
      description: 'URL the link navigates to.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
    },
    size: {
      description: 'Controls the font size of the link text.',
      control: 'select',
      options: ['default', 'lg'],
      table: { type: { summary: "'default' | 'lg'" }, defaultValue: { summary: 'default' } },
    },
    disabled: {
      description: 'Prevents navigation and applies muted styling when `true`.',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    text: {
      description: 'Visible link label.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
    },
    target: {
      description: "HTML `target` attribute; use `'_blank'` to open in a new tab.",
      control: 'select',
      options: ['', '_blank', '_self', '_parent', '_top'],
      table: { type: { summary: "'_blank' | '_self' | '_parent' | '_top'" }, defaultValue: { summary: '_self' } },
    },
  },
};

export default meta;
type Story = StoryObj<IrisLinkComponent>;

export const Overview: Story = {
  args: { text: 'Link', disabled: false },
  argTypes: {
    text: { control: 'text' },
    disabled: { control: 'boolean' },
    size: { table: { disable: true } },
    href: { table: { disable: true } },
    target: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;gap:16px;align-items:center;">
        <iris-link [text]="text" target="_blank" href="${hrefs.overviewSm}" size="default" [disabled]="disabled"></iris-link>
        <iris-link [text]="text" target="_blank" href="${hrefs.overviewLg}" size="lg"      [disabled]="disabled"></iris-link>
      </div>
    `,
  }),
};

export const Default: Story = {
  args: { text: 'Link', target: '_blank', href: hrefs.default, size: 'default' },
};

export const Large: Story = {
  args: { text: 'Link', target: '_blank', href: hrefs.large, size: 'lg' },
};

export const Disabled: Story = {
  args: { text: 'Link', target: '_blank', href: hrefs.disabled, disabled: true },
};

export const Visited: Story = {
  args: { text: 'Link', target: '_blank', href: 'https://github.com', size: 'default' },
};
