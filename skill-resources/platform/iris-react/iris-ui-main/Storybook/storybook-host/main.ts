// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
/* eslint-disable @angular-eslint/component-selector */
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({ selector: 'app-root', standalone: true, template: '' })
class AppComponent {}

void bootstrapApplication(AppComponent).catch((error: unknown) => {
  console.error('Failed to bootstrap Storybook host application.', error);
});
