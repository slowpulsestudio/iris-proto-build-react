// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { IrisButtonComponent } from '@iris-ui/lib/button/button.component';
import { IrisPopoverDirective } from '@iris-ui/lib/popover/popover.directive';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { IrisPopoverDemoContentComponent } from './popover-demo-content.component';

const meta: Meta<IrisPopoverDirective> = {
  title: 'Overlay/Popover',
  component: IrisPopoverDirective,
  tags: ['preview'],
  decorators: [
    moduleMetadata({ imports: [IrisPopoverDirective, IrisButtonComponent, IrisPopoverDemoContentComponent] }),
  ],
  argTypes: {
    irisPopover: {
      description: 'Template reference containing the content rendered inside the popover panel.',
      control: false,
      table: { type: { summary: 'TemplateRef<unknown>' }, defaultValue: { summary: '—' } },
    },
    irisPopoverPadding: {
      description: 'Inner padding size of the popover panel.',
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      table: { type: { summary: "'xs' | 'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'lg'" } },
    },
    irisPopoverPosition: {
      description:
        'Preferred position of the popover panel relative to the trigger. Falls back to other positions when the viewport has insufficient space.',
      control: 'select',
      options: ['bottom-start', 'bottom-center', 'bottom-end', 'top-start', 'top-center', 'top-end'],
      table: {
        type: { summary: "'bottom-start' | 'bottom-center' | 'bottom-end' | 'top-start' | 'top-center' | 'top-end'" },
        defaultValue: { summary: "'bottom-center'" },
      },
    },
    irisPopoverOpened: {
      description: 'Emits when the popover panel opens.',
      table: { type: { summary: 'void' }, defaultValue: { summary: '—' }, category: 'Events' },
    },
    irisPopoverClosed: {
      description: 'Emits when the popover panel closes.',
      table: { type: { summary: 'void' }, defaultValue: { summary: '—' }, category: 'Events' },
    },
    irisPopoverAriaLabel: {
      description:
        'Accessible label for the popover dialog (`role="dialog"`), announced by screen readers. Required for WCAG 4.1.2 compliance.',
      control: 'text',
      table: { type: { summary: 'string' }, defaultValue: { summary: '' }, category: 'Accessibility' },
    },
  },
};

export default meta;
type Story = StoryObj<IrisPopoverDirective>;

export const Overview: Story = {
  argTypes: {
    irisPopover: { table: { disable: true } },
    irisPopoverPadding: { table: { disable: true } },
    irisPopoverPosition: { table: { disable: true } },
    irisPopoverOpened: { table: { disable: true } },
    irisPopoverClosed: { table: { disable: true } },
  },
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4rem;padding:4rem;width:fit-content;margin:auto">
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:0.5rem">
          <strong style="font-size:12px">xs</strong>
          <ng-template #xs><story-popover-demo-content /></ng-template>
          <iris-button [irisPopover]="xs" irisPopoverPadding="xs" #pxs="irisPopover" (click)="pxs.toggle()">Open popover</iris-button>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:0.5rem">
          <strong style="font-size:12px">sm</strong>
          <ng-template #sm><story-popover-demo-content /></ng-template>
          <iris-button [irisPopover]="sm" irisPopoverPadding="sm" #psm="irisPopover" (click)="psm.toggle()">Open popover</iris-button>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:0.5rem">
          <strong style="font-size:12px">md</strong>
          <ng-template #md><story-popover-demo-content /></ng-template>
          <iris-button [irisPopover]="md" irisPopoverPadding="md" #pmd="irisPopover" (click)="pmd.toggle()">Open popover</iris-button>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:0.5rem">
          <strong style="font-size:12px">lg</strong>
          <ng-template #lg><story-popover-demo-content /></ng-template>
          <iris-button [irisPopover]="lg" irisPopoverPadding="lg" #plg="irisPopover" (click)="plg.toggle()">Open popover</iris-button>
        </div>
      </div>
    `,
  }),
};

export const Default: Story = {
  args: {
    irisPopoverPadding: 'lg',
    irisPopoverPosition: 'bottom-center',
  },
  argTypes: {
    irisPopover: { table: { disable: true } },
    irisPopoverOpened: { table: { disable: true } },
    irisPopoverClosed: { table: { disable: true } },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display:flex;justify-content:center;padding:8rem">
        <ng-template #content><story-popover-demo-content /></ng-template>
        <iris-button [irisPopover]="content" [irisPopoverPadding]="irisPopoverPadding" [irisPopoverPosition]="irisPopoverPosition" #popover="irisPopover" (click)="popover.toggle()">
          Open popover
        </iris-button>
      </div>
    `,
  }),
};

export const Positions: Story = {
  argTypes: {
    irisPopover: { table: { disable: true } },
    irisPopoverPadding: { table: { disable: true } },
    irisPopoverPosition: { table: { disable: true } },
    irisPopoverOpened: { table: { disable: true } },
    irisPopoverClosed: { table: { disable: true } },
  },
  render: () => ({
    template: `
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8rem;padding:8rem;width:fit-content;margin:auto">
        <div style="display:flex;justify-content:flex-start">
          <ng-template #tl><story-popover-demo-content /></ng-template>
          <iris-button [irisPopover]="tl" irisPopoverPosition="top-start" #ptl="irisPopover" (click)="ptl.toggle()">Top start</iris-button>
        </div>
        <div style="display:flex;justify-content:center">
          <ng-template #tc><story-popover-demo-content /></ng-template>
          <iris-button [irisPopover]="tc" irisPopoverPosition="top-center" #ptc="irisPopover" (click)="ptc.toggle()">Top center</iris-button>
        </div>
        <div style="display:flex;justify-content:flex-end">
          <ng-template #tr><story-popover-demo-content /></ng-template>
          <iris-button [irisPopover]="tr" irisPopoverPosition="top-end" #ptr="irisPopover" (click)="ptr.toggle()">Top end</iris-button>
        </div>
        <div style="display:flex;justify-content:flex-start">
          <ng-template #bl><story-popover-demo-content /></ng-template>
          <iris-button [irisPopover]="bl" irisPopoverPosition="bottom-start" #pbl="irisPopover" (click)="pbl.toggle()">Bottom start</iris-button>
        </div>
        <div style="display:flex;justify-content:center">
          <ng-template #bc><story-popover-demo-content /></ng-template>
          <iris-button [irisPopover]="bc" irisPopoverPosition="bottom-center" #pbc="irisPopover" (click)="pbc.toggle()">Bottom center</iris-button>
        </div>
        <div style="display:flex;justify-content:flex-end">
          <ng-template #br><story-popover-demo-content /></ng-template>
          <iris-button [irisPopover]="br" irisPopoverPosition="bottom-end" #pbr="irisPopover" (click)="pbr.toggle()">Bottom end</iris-button>
        </div>
      </div>
    `,
  }),
};
