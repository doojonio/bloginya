import { Component, inject, input, model } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { combineLatest, filter, switchMap } from 'rxjs';
import { CategoryService } from '../../category.service';
import { PostMed } from '../../posts.service';
import { PostListGridTitlesComponent } from '../post-list-grid-titles/post-list-grid-titles.component';
import { PostListMedComponent } from '../post-list-med/post-list-med.component';

@Component({
  selector: 'app-category',
  imports: [
    PostListMedComponent,
    PostListGridTitlesComponent,
    MatPaginatorModule,
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class CategoryComponent {
  page = input<number>();
  catId = input<string>();

  private readonly router = inject(Router);

  private readonly catService = inject(CategoryService);

  catIdSub = combineLatest([
    toObservable(this.catId).pipe(filter(Boolean)),
    toObservable(this.page),
  ])
    .pipe(switchMap(([id, page]) => this.catService.loadCategory(id, page)))
    .subscribe((cat) => {
      this.cat.set(cat);
    });

  cat = model<Category>();

  onPageChange(event: PageEvent) {
    console.log(event);
    this.router.navigate([], {
      queryParams: { page: event.pageIndex || undefined },
    });
  }
}

export interface Category {
  id: string;
  title: string;
  posts_num: number;
  grid_posts: CategoryPost[];
  list_posts: PostMed[];
}

export interface CategoryPost {
  picture_pre: string;
  title: string;
  id: string;
  name: string;
}
