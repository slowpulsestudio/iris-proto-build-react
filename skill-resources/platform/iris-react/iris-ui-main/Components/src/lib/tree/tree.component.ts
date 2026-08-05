// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, linkedSignal, output } from '@angular/core';
import { IrisIconComponent } from '../icon/icon.component';
import { TreeNode } from './tree.model';

@Component({
  selector: 'iris-tree',
  standalone: true,
  imports: [NgTemplateOutlet, IrisIconComponent],
  templateUrl: './tree.component.html',
  styleUrl: './tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisTreeComponent {
  private readonly elementRef = inject(ElementRef);

  nodes = input<TreeNode[]>([]);
  activeNodeId = input<string | null>(null);
  showTrailingIcons = input(true);
  ariaLabel = input('');
  collapseAriaLabel = input('Collapse');
  expandAriaLabel = input('Expand');
  activeNodeIdChange = output<string | null>();
  nodeSelectionChange = output<TreeNode>();
  nodeToggleChange = output<TreeNode>();

  protected readonly activeNodeIdState = linkedSignal(() => this.activeNodeId());

  onNodeClick(node: TreeNode): void {
    this.activeNodeIdState.set(node.id);
    this.activeNodeIdChange.emit(node.id);
    if (node.children?.length) {
      node.expanded = true;
      this.nodeToggleChange.emit(node);
    }
    this.nodeSelectionChange.emit(node);
  }

  onToggle(event: Event, node: TreeNode): void {
    event.stopPropagation();
    node.expanded = !node.expanded;
    this.nodeToggleChange.emit(node);
  }

  onNodeKeydown(event: KeyboardEvent, node: TreeNode): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.activeNodeIdState.set(node.id);
      this.activeNodeIdChange.emit(node.id);
      this.nodeSelectionChange.emit(node);
    }
    if (event.key === 'ArrowRight' && node.children?.length && !node.expanded) {
      event.preventDefault();
      node.expanded = true;
      this.nodeToggleChange.emit(node);
    }
    if (event.key === 'ArrowLeft' && node.children?.length && node.expanded) {
      event.preventDefault();
      node.expanded = false;
      this.nodeToggleChange.emit(node);
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveFocus(event.target as HTMLElement, event.key === 'ArrowDown' ? 1 : -1);
    }
  }

  indentGuides(level: number, ancestorIndentGuideArray: boolean[], isLast: boolean): { isLast: boolean }[] {
    return Array.from({ length: level }, (_, k) => ({
      isLast: k === level - 1 ? isLast : (ancestorIndentGuideArray[k] ?? false),
    }));
  }

  buildNestedIndentGuides(ancestorIndentGuideArray: boolean[], isLast: boolean, level: number): boolean[] {
    if (level === 0) {
      return [];
    }
    return [...ancestorIndentGuideArray, isLast];
  }

  resolveNodeIcon(node: TreeNode): string {
    const hasChildren = Boolean(node.children?.length);
    if (!node.icon) {
      if (hasChildren) {
        return node.expanded ? 'FolderOpen' : 'Folder';
      }
      return 'Placeholder';
    }
    if (node.icon === 'Folder' && node.expanded) {
      return 'FolderOpen';
    }
    return node.icon;
  }

  private moveFocus(current: HTMLElement, direction: 1 | -1): void {
    const rows = Array.from(this.elementRef.nativeElement.querySelectorAll('.iris-tree__element')) as HTMLElement[];
    const index = rows.indexOf(current);
    rows[index + direction]?.focus();
  }
}

export type { TreeNode, TreeNodeState } from './tree.model';
