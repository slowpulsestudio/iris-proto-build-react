// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisPaginationComponent } from './pagination.component';
import type { PaginationChangeEvent } from './pagination.model';

describe('IrisPaginationComponent', () => {
  let component: IrisPaginationComponent;
  let fixture: ComponentFixture<IrisPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisPaginationComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render default type with page numbers', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
    const pageButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--page');
    expect(pageButtons.length).toBe(5);
  });

  it('should mark the current page as active', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 3);
    fixture.detectChanges();
    const activeButton = fixture.nativeElement.querySelector('.iris-pagination__item--active');
    expect(activeButton).toBeTruthy();
    expect(activeButton.textContent.trim()).toBe('3');
  });

  it('should set aria-current on the active page', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 2);
    fixture.detectChanges();
    const activeButton = fixture.nativeElement.querySelector('[aria-current="page"]');
    expect(activeButton).toBeTruthy();
    expect(activeButton.textContent.trim()).toBe('2');
  });

  it('should disable previous button on first page', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
    const navButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--nav');
    expect(navButtons[0].disabled).toBe(true);
  });

  it('should disable next button on last page', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 5);
    fixture.detectChanges();
    const navButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--nav');
    expect(navButtons[1].disabled).toBe(true);
  });

  it('should emit pageChange when clicking a page', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();

    const emitted: PaginationChangeEvent[] = [];
    component.pageChange.subscribe((event: PaginationChangeEvent) => emitted.push(event));

    const pageButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--page');
    pageButtons[2].click();
    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({ page: 3, previousPage: 1, totalPages: 5 });
  });

  it('should emit pageChange when clicking previous', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 3);
    fixture.detectChanges();

    const emitted: PaginationChangeEvent[] = [];
    component.pageChange.subscribe((event: PaginationChangeEvent) => emitted.push(event));

    const navButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--nav');
    navButtons[0].click();
    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({ page: 2, previousPage: 3, totalPages: 5 });
  });

  it('should emit pageChange when clicking next', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 3);
    fixture.detectChanges();

    const emitted: PaginationChangeEvent[] = [];
    component.pageChange.subscribe((event: PaginationChangeEvent) => emitted.push(event));

    const navButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--nav');
    navButtons[1].click();
    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual({ page: 4, previousPage: 3, totalPages: 5 });
  });

  it('should show separators for many pages', () => {
    fixture.componentRef.setInput('totalPages', 154);
    fixture.componentRef.setInput('currentPage', 2);
    fixture.detectChanges();
    const separators = fixture.nativeElement.querySelectorAll('.iris-pagination__item--separator');
    expect(separators.length).toBeGreaterThan(0);
  });

  it('should render simplified type with Previous and Next labels', () => {
    fixture.componentRef.setInput('type', 'simplified');
    fixture.componentRef.setInput('totalPages', 10);
    fixture.componentRef.setInput('currentPage', 5);
    fixture.detectChanges();
    const labelButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--label');
    expect(labelButtons.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Previous');
    expect(fixture.nativeElement.textContent).toContain('Next');
  });

  it('should disable Previous in simplified mode on first page', () => {
    fixture.componentRef.setInput('type', 'simplified');
    fixture.componentRef.setInput('totalPages', 10);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
    const labelButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--label');
    expect(labelButtons[0].disabled).toBe(true);
  });

  it('should disable Next in simplified mode on last page', () => {
    fixture.componentRef.setInput('type', 'simplified');
    fixture.componentRef.setInput('totalPages', 10);
    fixture.componentRef.setInput('currentPage', 10);
    fixture.detectChanges();
    const labelButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--label');
    expect(labelButtons[1].disabled).toBe(true);
  });

  it('should not emit pageChange when clicking the current page', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 3);
    fixture.detectChanges();

    const emitted: PaginationChangeEvent[] = [];
    component.pageChange.subscribe((event: PaginationChangeEvent) => emitted.push(event));

    const activeButton = fixture.nativeElement.querySelector('.iris-pagination__item--active');
    activeButton.click();
    expect(emitted).toEqual([]);
  });

  it('should not update currentPage internally after navigation (controlled component)', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();

    const navButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--nav');
    navButtons[1].click();
    fixture.detectChanges();

    expect(component.currentPage()).toBe(1);
  });

  it('should update maxVisiblePages', () => {
    fixture.componentRef.setInput('totalPages', 20);
    fixture.componentRef.setInput('currentPage', 10);
    fixture.componentRef.setInput('maxVisiblePages', 3);
    fixture.detectChanges();
    const pageButtons = fixture.nativeElement.querySelectorAll('.iris-pagination__item--page');
    expect(pageButtons.length).toBeLessThan(20);
  });

  it('should recalculate startPage correctly when currentPage is near the end', () => {
    fixture.componentRef.setInput('totalPages', 10);
    fixture.componentRef.setInput('currentPage', 9);
    fixture.detectChanges();
    const activeButton = fixture.nativeElement.querySelector('.iris-pagination__item--active');
    expect(activeButton).toBeTruthy();
    expect(activeButton.textContent.trim()).toBe('9');
    // With halfVisible=2, current(9) >= total(10)-2=8 → startPage recalculated via line 43
    const pages = component.visiblePages();
    expect(pages).toContain(6);
  });

  it('should use default aria-label "Pagination" on nav', () => {
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Pagination');
  });

  it('should use custom ariaLabel on nav', () => {
    fixture.componentRef.setInput('ariaLabel', 'Site navigation');
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Site navigation');
  });
});
