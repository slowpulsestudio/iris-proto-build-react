// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisTreeComponent } from './tree.component';
import { TreeNode } from './tree.model';

describe('IrisTreeComponent', () => {
  let component: IrisTreeComponent;
  let fixture: ComponentFixture<IrisTreeComponent>;

  const mockNodes: TreeNode[] = [
    {
      id: '1',
      label: 'Root',
      icon: 'folder',
      expanded: true,
      children: [
        { id: '1-1', label: 'Child 1', icon: 'file' },
        { id: '1-2', label: 'Child 2', icon: 'file' },
      ],
    },
    { id: '2', label: 'Leaf', icon: 'file' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisTreeComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render tree nodes', () => {
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.detectChanges();
    const elements = fixture.nativeElement.querySelectorAll('.iris-tree__element');
    expect(elements.length).toBe(4);
  });

  it('should apply active class to active node', () => {
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.componentRef.setInput('activeNodeId', '1-1');
    fixture.detectChanges();
    const activeEls = fixture.nativeElement.querySelectorAll('.iris-tree__element--active');
    expect(activeEls.length).toBe(1);
  });

  it('should emit nodeSelectionChange on click', () => {
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.detectChanges();
    let selectedNode: TreeNode | undefined;
    component.nodeSelectionChange.subscribe((node: TreeNode) => (selectedNode = node));
    const firstElement = fixture.nativeElement.querySelector('.iris-tree__element');
    firstElement.click();
    expect(selectedNode).toEqual(mockNodes[0]);
  });

  it('should emit nodeToggleChange on caret click', () => {
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.detectChanges();
    let toggledNode: TreeNode | undefined;
    component.nodeToggleChange.subscribe((node: TreeNode) => (toggledNode = node));
    const caret = fixture.nativeElement.querySelector('.iris-tree__caret');
    caret.click();
    expect(toggledNode).toEqual(mockNodes[0]);
  });

  it('should hide children when not expanded', () => {
    const collapsedNodes: TreeNode[] = [
      { id: '1', label: 'Root', expanded: false, children: [{ id: '1-1', label: 'Child' }] },
    ];
    fixture.componentRef.setInput('nodes', collapsedNodes);
    fixture.detectChanges();
    const children = fixture.nativeElement.querySelectorAll('.iris-tree__children');
    expect(children.length).toBe(0);
  });

  it('should hide trailing icons when showTrailingIcons is false', () => {
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.componentRef.setInput('showTrailingIcons', false);
    fixture.detectChanges();
    const trailing = fixture.nativeElement.querySelectorAll('.iris-tree__trailing');
    expect(trailing.length).toBe(0);
  });

  it('should emit nodeSelectionChange on Enter key', () => {
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.detectChanges();
    let selectedNode: TreeNode | undefined;
    component.nodeSelectionChange.subscribe((node: TreeNode) => (selectedNode = node));
    const elements = fixture.nativeElement.querySelectorAll('.iris-tree__element');
    elements[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(selectedNode).toEqual(mockNodes[0]);
  });

  it('should emit nodeSelectionChange on Space key', () => {
    const freshNodes: TreeNode[] = [
      {
        id: '1',
        label: 'Root',
        icon: 'folder',
        expanded: true,
        children: [
          { id: '1-1', label: 'Child 1', icon: 'file' },
          { id: '1-2', label: 'Child 2', icon: 'file' },
        ],
      },
      { id: '2', label: 'Leaf', icon: 'file' },
    ];
    fixture.componentRef.setInput('nodes', freshNodes);
    fixture.detectChanges();
    let selectedNode: TreeNode | undefined;
    component.nodeSelectionChange.subscribe((node: TreeNode) => (selectedNode = node));
    const elements = fixture.nativeElement.querySelectorAll('.iris-tree__element');
    elements[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: false }));
    expect(selectedNode).toEqual(freshNodes[0].children![0]);
  });

  it('should expand collapsed node on ArrowRight key', () => {
    const collapsedNodes: TreeNode[] = [
      { id: '1', label: 'Root', expanded: false, children: [{ id: '1-1', label: 'Child' }] },
    ];
    fixture.componentRef.setInput('nodes', collapsedNodes);
    fixture.detectChanges();
    let toggledNode: TreeNode | undefined;
    component.nodeToggleChange.subscribe((node: TreeNode) => (toggledNode = node));
    const elements = fixture.nativeElement.querySelectorAll('.iris-tree__element');
    elements[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(toggledNode?.expanded).toBe(true);
  });

  it('should collapse expanded node on ArrowLeft key', () => {
    const expandedNodes: TreeNode[] = [
      {
        id: '1',
        label: 'Root',
        icon: 'folder',
        expanded: true,
        children: [{ id: '1-1', label: 'Child 1', icon: 'file' }],
      },
    ];
    fixture.componentRef.setInput('nodes', expandedNodes);
    fixture.detectChanges();
    let toggledNode: TreeNode | undefined;
    component.nodeToggleChange.subscribe((node: TreeNode) => (toggledNode = node));
    const elements = fixture.nativeElement.querySelectorAll('.iris-tree__element');
    elements[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(toggledNode?.expanded).toBe(false);
  });

  it('should move focus to next element on ArrowDown key', () => {
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.detectChanges();
    const elements = fixture.nativeElement.querySelectorAll('.iris-tree__element') as NodeListOf<HTMLElement>;
    const focusSpy = vi.spyOn(elements[1], 'focus');
    elements[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(focusSpy).toHaveBeenCalled();
  });

  it('should move focus to previous element on ArrowUp key', () => {
    fixture.componentRef.setInput('nodes', mockNodes);
    fixture.detectChanges();
    const elements = fixture.nativeElement.querySelectorAll('.iris-tree__element') as NodeListOf<HTMLElement>;
    const focusSpy = vi.spyOn(elements[0], 'focus');
    elements[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(focusSpy).toHaveBeenCalled();
  });

  it('should return Placeholder icon for node without icon and no children', () => {
    expect(component.resolveNodeIcon({ id: 'l', label: 'Leaf' })).toBe('Placeholder');
  });

  it('should return FolderOpen for expanded node without icon but with children', () => {
    expect(
      component.resolveNodeIcon({ id: 'n', label: 'Node', expanded: true, children: [{ id: 'c', label: 'Child' }] }),
    ).toBe('FolderOpen');
  });

  it('should return FolderOpen for node with icon Folder when expanded', () => {
    expect(component.resolveNodeIcon({ id: 'n', label: 'Node', icon: 'Folder', expanded: true })).toBe('FolderOpen');
  });

  it('should return concatenated guide array from buildNestedIndentGuides when level > 0', () => {
    expect(component.buildNestedIndentGuides([true, false], true, 2)).toEqual([true, false, true]);
  });

  it('should not set aria-label on tree by default', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="tree"]').getAttribute('aria-label')).toBeNull();
  });

  it('should set aria-label on tree when ariaLabel is provided', () => {
    fixture.componentRef.setInput('ariaLabel', 'File explorer');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="tree"]').getAttribute('aria-label')).toBe('File explorer');
  });

  it('should use default collapseAriaLabel and expandAriaLabel on caret buttons', () => {
    fixture.componentRef.setInput('nodes', [
      { id: '1', label: 'Parent', children: [{ id: '2', label: 'Child' }], expanded: false },
    ]);
    fixture.detectChanges();
    const caret = fixture.nativeElement.querySelector('.iris-tree__caret');
    expect(caret.getAttribute('aria-label')).toBe('Expand');
  });

  it('should use custom collapseAriaLabel when node is expanded', () => {
    fixture.componentRef.setInput('collapseAriaLabel', 'Zuklappen');
    fixture.componentRef.setInput('nodes', [
      { id: '1', label: 'Parent', children: [{ id: '2', label: 'Child' }], expanded: true },
    ]);
    fixture.detectChanges();
    const caret = fixture.nativeElement.querySelector('.iris-tree__caret');
    expect(caret.getAttribute('aria-label')).toBe('Zuklappen');
  });
});
