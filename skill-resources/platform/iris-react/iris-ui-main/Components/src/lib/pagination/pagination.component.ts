// Copyright © 2026 One Identity LLC. ALL RIGHTS RESERVED.
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IrisIconComponent } from '../icon/icon.component';
import { PaginationChangeEvent, PaginationType } from './pagination.model';

@Component({
  selector: 'iris-pagination',
  standalone: true,
  imports: [CommonModule, IrisIconComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IrisPaginationComponent {
  type = input<PaginationType>('default');
  ariaLabel = input('Pagination');
  totalPages = input(1);
  currentPage = input(1);
  maxVisiblePages = input(5);

  pageChange = output<PaginationChangeEvent>();

  visiblePages = computed<(number | 'separator')[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = this.maxVisiblePages();

    if (total <= maxVisible + 2) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const pages: (number | 'separator')[] = [];
    const halfVisible = Math.floor(maxVisible / 2);

    let startPage = Math.max(2, current - halfVisible);
    let endPage = Math.min(total - 1, current + halfVisible);

    if (current <= halfVisible + 1) {
      endPage = Math.min(maxVisible, total - 1);
    }

    if (current >= total - halfVisible) {
      startPage = Math.max(2, total - maxVisible + 1);
    }

    pages.push(1);

    if (startPage > 2) {
      pages.push('separator');
    }

    for (let page = startPage; page <= endPage; page++) {
      pages.push(page);
    }

    if (endPage < total - 1) {
      pages.push('separator');
    }

    pages.push(total);

    return pages;
  });

  hasPreviousPage = computed(() => this.currentPage() > 1);
  hasNextPage = computed(() => this.currentPage() < this.totalPages());

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit({ page, previousPage: this.currentPage(), totalPages: this.totalPages() });
    }
  }

  goToPreviousPage(): void {
    if (this.hasPreviousPage()) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  goToNextPage(): void {
    if (this.hasNextPage()) {
      this.goToPage(this.currentPage() + 1);
    }
  }
}

export type { PaginationType, PaginationChangeEvent } from './pagination.model';
