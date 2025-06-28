import { Component, inject, input, model } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { CategoryService } from '../../category.service';
import { PostMed } from '../../posts.service';
import { PostListGridTitlesComponent } from '../post-list-grid-titles/post-list-grid-titles.component';
import { PostListGridComponent } from '../post-list-grid/post-list-grid.componen';
import { PostListMedComponent } from '../post-list-med/post-list-med.component';

@Component({
  selector: 'app-category',
  imports: [
    PostListMedComponent,
    PostListGridTitlesComponent,
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class CategoryComponent {
  catId = input<string>();

  private readonly catService = inject(CategoryService);
  catIdSub = toObservable(this.catId)
    .pipe(
      filter(Boolean),
      switchMap((id) => this.catService.loadCategory(id))
    )
    .subscribe((cat) => {
      this.cat.set(cat);
    });

  cat = model<Category>();
}

export interface Category {
  id: string;
  title: string;
  pages: number;
  grid_posts: CategoryPost[];
  list_posts: PostMed[];
}

export interface CategoryPost {
  picture_pre: string;
  title: string;
  id: string;
  name: string;
}
