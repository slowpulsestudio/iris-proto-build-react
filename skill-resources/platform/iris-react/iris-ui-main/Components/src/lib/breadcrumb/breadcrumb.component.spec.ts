// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisBreadcrumbComponent } from './breadcrumb.component';

describe('IrisBreadcrumbComponent', () => {
  let component: IrisBreadcrumbComponent;
  let fixture: ComponentFixture<IrisBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisBreadcrumbComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render breadcrumb items', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Current' },
    ]);
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.iris-breadcrumb__item');
    expect(items.length).toBe(3);
  });

  it('should mark current page with aria-current', () => {
    fixture.componentRef.setInput('items', [{ label: 'Home', href: '/' }, { label: 'Current' }]);
    fixture.detectChanges();
    const current = fixture.nativeElement.querySelector('[aria-current="page"]');
    expect(current.textContent).toBe('Current');
  });

  it('should render separators between items', () => {
    fixture.componentRef.setInput('items', [{ label: 'Home', href: '/' }, { label: 'Page' }]);
    fixture.detectChanges();
    const separators = fixture.nativeElement.querySelectorAll('.iris-breadcrumb__separator');
    expect(separators.length).toBe(1);
  });

  it('should render non-last item without href as plain text', () => {
    fixture.componentRef.setInput('items', [{ label: 'Home' }, { label: 'Current' }]);
    fixture.detectChanges();
    const textSpan = fixture.nativeElement.querySelector('.iris-breadcrumb__text');
    expect(textSpan).toBeTruthy();
    expect(textSpan.textContent).toBe('Home');
    expect(fixture.nativeElement.querySelector('.iris-breadcrumb__text a')).toBeNull();
  });

  it('should render last item as link when currentPageClickable is true and href is set', () => {
    fixture.componentRef.setInput('items', [
      { label: 'Home', href: '/' },
      { label: 'Current', href: '/current' },
    ]);
    fixture.componentRef.setInput('currentPageClickable', true);
    fixture.detectChanges();
    const lastLink = fixture.nativeElement.querySelector('.iris-breadcrumb__link[aria-current="page"]');
    expect(lastLink).toBeTruthy();
    expect(lastLink.getAttribute('href')).toBe('/current');
  });

  it('should use default aria-label "Breadcrumb" on nav', () => {
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
  });

  it('should use custom ariaLabel on nav', () => {
    fixture.componentRef.setInput('ariaLabel', 'Site navigation');
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav');
    expect(nav.getAttribute('aria-label')).toBe('Site navigation');
  });

  describe('overflow', () => {
    const manyItems = [
      { label: 'Home', href: '/' },
      { label: 'Level 1', href: '/level-1' },
      { label: 'Level 2', href: '/level-2' },
      { label: 'Level 3', href: '/level-3' },
      { label: 'Current' },
    ];

    it('should show overflow button when maxVisibleItems is set and items exceed it', () => {
      fixture.componentRef.setInput('items', manyItems);
      fixture.componentRef.setInput('maxVisibleItems', 3);
      fixture.detectChanges();
      const overflowButton = fixture.nativeElement.querySelector('.iris-breadcrumb__overflow');
      expect(overflowButton).toBeTruthy();
    });

    it('should not show overflow button when items do not exceed maxVisibleItems', () => {
      fixture.componentRef.setInput('items', [{ label: 'Home', href: '/' }, { label: 'Current' }]);
      fixture.componentRef.setInput('maxVisibleItems', 3);
      fixture.detectChanges();
      const overflowButton = fixture.nativeElement.querySelector('.iris-breadcrumb__overflow');
      expect(overflowButton).toBeNull();
    });

    it('should not show overflow button when maxVisibleItems is 0', () => {
      fixture.componentRef.setInput('items', manyItems);
      fixture.componentRef.setInput('maxVisibleItems', 0);
      fixture.detectChanges();
      const overflowButton = fixture.nativeElement.querySelector('.iris-breadcrumb__overflow');
      expect(overflowButton).toBeNull();
    });

    it('should show first item and last (max - 1) items when overflowing', () => {
      fixture.componentRef.setInput('items', manyItems);
      fixture.componentRef.setInput('maxVisibleItems', 3);
      fixture.detectChanges();
      const links = fixture.nativeElement.querySelectorAll('.iris-breadcrumb__link');
      const currentSpan = fixture.nativeElement.querySelector('.iris-breadcrumb__current');
      expect(links[0].textContent).toBe('Home');
      expect(links[1].textContent).toBe('Level 3');
      expect(currentSpan.textContent).toBe('Current');
    });

    it('should have aria-label on the overflow button', () => {
      fixture.componentRef.setInput('items', manyItems);
      fixture.componentRef.setInput('maxVisibleItems', 3);
      fixture.detectChanges();
      const overflowButton = fixture.nativeElement.querySelector('.iris-breadcrumb__overflow');
      expect(overflowButton.getAttribute('aria-label')).toBe('Show more breadcrumb items');
    });
  });
});
