// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IrisKeyboardKeyComponent } from './keyboard-key.component';

describe('IrisKeyboardKeyComponent', () => {
  let component: IrisKeyboardKeyComponent;
  let fixture: ComponentFixture<IrisKeyboardKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrisKeyboardKeyComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisKeyboardKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display key text', () => {
    fixture.componentRef.setInput('key', 'Ctrl');
    fixture.detectChanges();
    const kbd = fixture.nativeElement.querySelector('kbd');
    expect(kbd.textContent.trim()).toBe('Ctrl');
  });

  it('should upper-case a single-character key', () => {
    fixture.componentRef.setInput('key', 'a');
    fixture.detectChanges();
    const kbd = fixture.nativeElement.querySelector('kbd');
    expect(kbd.textContent.trim()).toBe('A');
  });

  it('should not alter multi-character keys', () => {
    fixture.componentRef.setInput('key', 'Enter');
    fixture.detectChanges();
    const kbd = fixture.nativeElement.querySelector('kbd');
    expect(kbd.textContent.trim()).toBe('Enter');
  });

  it('should sentence-case a multi-character key', () => {
    fixture.componentRef.setInput('key', 'CTRL');
    fixture.detectChanges();
    const kbd = fixture.nativeElement.querySelector('kbd');
    expect(kbd.textContent.trim()).toBe('Ctrl');
  });

  it('should render multiple kbd elements for an array key', () => {
    fixture.componentRef.setInput('key', ['Ctrl', 'Alt', 'T']);
    fixture.detectChanges();
    const outer = fixture.nativeElement.querySelector('kbd.iris-keyboard-key--combination');
    expect(outer).toBeTruthy();
    const kbds = outer.querySelectorAll('kbd');
    expect(kbds.length).toBe(3);
    expect(kbds[0].textContent.trim()).toBe('Ctrl');
    expect(kbds[1].textContent.trim()).toBe('Alt');
    expect(kbds[2].textContent.trim()).toBe('T');
  });

  it('should render separators between keys in a combination', () => {
    fixture.componentRef.setInput('key', ['Ctrl', 'Alt', 'T']);
    fixture.detectChanges();
    const outer = fixture.nativeElement.querySelector('kbd.iris-keyboard-key--combination');
    const separators = outer.querySelectorAll('.iris-keyboard-key__separator');
    expect(separators.length).toBe(2);
    separators.forEach((sep: HTMLElement) => expect(sep.textContent?.trim()).toBe('+'));
  });

  it('should apply casing to each key in a combination', () => {
    fixture.componentRef.setInput('key', ['CTRL', 'alt', 's']);
    fixture.detectChanges();
    const outer = fixture.nativeElement.querySelector('kbd.iris-keyboard-key--combination');
    const kbds = outer.querySelectorAll('kbd');
    expect(kbds[0].textContent.trim()).toBe('Ctrl');
    expect(kbds[1].textContent.trim()).toBe('Alt');
    expect(kbds[2].textContent.trim()).toBe('S');
  });
});
