import { Component, inject } from '@angular/core';
import { CategoryService } from '../../../shared/services/category.service';

@Component({
  selector: 'app-categories',
  standalone: false,
  template: `
    <h1>Categories</h1>

    <div class="categories-container">
      @for (category of (categories$ | async); track category.id) {
      <div class="category-item" [routerLink]="['/c', category.id]">
        <span
          >{{ category.title }}

          @if (category.status === 'private') {
          <mat-icon inline>lock</mat-icon>
          }
        </span>
        <div class="tags-container">
          @for (tag of category.tags; track tag) {
          <span class="tag">{{ tag }}</span>
          }
        </div>
      </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .categories-container {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .category-item {
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid var(--mat-sys-outline-variant);
      cursor: pointer;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

      max-width: 10rem;
    }

    .category-item:hover {
      transform: translateY(-4px);
      box-shadow: var(--mat-sys-level2);
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .tag {
      background-color: var(--mat-sys-surface-container-high);
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.875rem;
    }
  `,
})
export class CategoriesComponent {
  categoryS = inject(CategoryService);

  categories$ = this.categoryS.getCategories();
}
