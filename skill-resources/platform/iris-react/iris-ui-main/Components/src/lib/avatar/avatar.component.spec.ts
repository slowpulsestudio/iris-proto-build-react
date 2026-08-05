// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisAvatarComponent } from './avatar.component';

describe('IrisAvatarComponent', () => {
  let component: IrisAvatarComponent;
  let fixture: ComponentFixture<IrisAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisAvatarComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const avatarElement = fixture.nativeElement.querySelector('.iris-avatar');
    expect(avatarElement.classList.contains('iris-avatar--lg')).toBe(true);
  });

  it('should display initials for placeholder type', () => {
    fixture.componentRef.setInput('type', 'placeholder');
    fixture.componentRef.setInput('initials', 'AB');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('.iris-avatar__initials');
    expect(span.textContent).toBe('AB');
  });

  it('should render image for face type', () => {
    fixture.componentRef.setInput('type', 'face');
    fixture.componentRef.setInput('src', 'https://picsum.photos/id/64/200/200');
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('.iris-avatar__image');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://picsum.photos/id/64/200/200');
  });

  it('should not render image for face type when src is not provided', () => {
    fixture.componentRef.setInput('type', 'face');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-avatar__image')).toBeNull();
  });

  it('should apply sm size class', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-avatar').classList.contains('iris-avatar--sm')).toBe(true);
  });

  it('should apply md size class', () => {
    fixture.componentRef.setInput('size', 'md');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.iris-avatar').classList.contains('iris-avatar--md')).toBe(true);
  });

  it('should apply nhi class for NHI category', () => {
    fixture.componentRef.setInput('type', 'machine');
    fixture.componentRef.setInput('category', 'nhi');
    fixture.detectChanges();
    const avatarElement = fixture.nativeElement.querySelector('.iris-avatar');
    expect(avatarElement.classList.contains('iris-avatar--nhi')).toBe(true);
  });

  it('should render icon for machine type', () => {
    fixture.componentRef.setInput('type', 'machine');
    fixture.componentRef.setInput('category', 'nhi');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('iris-icon');
    expect(icon).toBeTruthy();
  });

  it('should render icon for bot type', () => {
    fixture.componentRef.setInput('type', 'bot');
    fixture.componentRef.setInput('category', 'nhi');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('iris-icon');
    expect(icon).toBeTruthy();
  });

  it('should render icon for ai-agent type', () => {
    fixture.componentRef.setInput('type', 'ai-agent');
    fixture.componentRef.setInput('category', 'nhi');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('iris-icon');
    expect(icon).toBeTruthy();
  });

  it('should render icon for service-account type', () => {
    fixture.componentRef.setInput('type', 'service-account');
    fixture.componentRef.setInput('category', 'nhi');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('iris-icon');
    expect(icon).toBeTruthy();
  });

  it('should render icon for workload type', () => {
    fixture.componentRef.setInput('type', 'workload');
    fixture.componentRef.setInput('category', 'nhi');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('iris-icon');
    expect(icon).toBeTruthy();
  });

  it('should not render icon for human category', () => {
    fixture.componentRef.setInput('type', 'placeholder');
    fixture.componentRef.setInput('category', 'human');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('iris-icon');
    expect(icon).toBeNull();
  });
});
