import { Component, effect, inject, input, model } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { combineLatest, filter, switchMap } from 'rxjs';
import { CategoryService } from '../../category.service';
import { PostMed } from '../../posts.service';
import { SeoService } from '../../seo.service';
import { PostListGridTitlesComponent } from '../post-list-grid-titles/post-list-grid-titles.component';
import { PostListMedComponent } from '../post-list-med/post-list-med.component';

@Component({
  selector: 'app-category',
  imports: [
    PostListMedComponent,
    PostListGridTitlesComponent,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class CategoryComponent {
  page = input<number>();
  catId = input<string>();

  sort = input(SortBy.OLDEST);

  private readonly router = inject(Router);
  private readonly catService = inject(CategoryService);
  private readonly seoService = inject(SeoService);

  public get SortBy() {
    return SortBy;
  }

  catIdSub = combineLatest([
    toObservable(this.catId),
    toObservable(this.page),
    toObservable(this.sort),
  ])
    .pipe(
      filter(([id, page, sort]) =>
        this.cat() ? this.cat()?.page != page || this.cat()?.sort != sort : true
      ),
      switchMap(([id, page, sort]) =>
        this.catService.loadCategory(id || this.cat()!.id, page, sort)
      )
    )
    .subscribe((cat) => {
      this.cat.set(cat);
    });

  cat = model<Category>();

  seoCatEffect = effect(() => {
    const cat = this.cat();
    if (cat) {
      this.seoService.applyForCategory(cat);
    }
  });

  onPageChange(event: PageEvent) {
    this.router.navigate([], {
      queryParams: { page: event.pageIndex || undefined },
    });
  }

  changeSort(sort: SortBy) {
    this.router.navigate([], {
      queryParams: { sort },
      queryParamsHandling: 'merge',
    });
  }
}

export interface Category {
  id: string;
  title: string;
  name: string | null;
  sort: SortBy;
  posts_num: number;
  page: number;
  grid_posts: CategoryPost[];
  list_posts: PostMed[];
}

export interface CategoryPost {
  picture_pre: string;
  title: string;
  id: string;
  name: string;
}

export enum SortBy {
  OLDEST = 'published_at',
  NEWEST = '!published_at',
  POPULAR = '!popularity',
}
