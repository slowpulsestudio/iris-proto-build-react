// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { icons } from '@oneidentity/iris-ui-icons';
import { IconSize } from './icon.model';

@Component({
  selector: 'iris-icon',
  standalone: true,
  imports: [],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisIconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  name = input.required<string>();
  size = input<IconSize>(24);
  label = input<string>('');
  decorative = input(false);

  readonly effectiveLabel = computed(() => this.label() || this.name());

  readonly strokeWidth = computed(() => (this.size() === 16 ? 1.5 : 1));

  readonly svgContent = computed(() => {
    const icon = icons.find((i) => i.name === this.name());
    return icon ? this.sanitizer.bypassSecurityTrustHtml(icon.svg) : null;
  });
}

export type { IconSize } from './icon.model';
