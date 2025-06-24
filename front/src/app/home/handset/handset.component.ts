import { AsyncPipe } from '@angular/common';
import { Component, inject, input, model, OnDestroy } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AppService } from '../../app.service';
import { VisibilityDirective } from '../../directives/visibility.directive';
import { Category, CatPost, NewPost, PopularPost } from '../../posts.service';
import { PostListCategoryComponent } from '../../view/post-list-category/post-list-category.component';
import { PostListGridComponent } from '../../view/post-list-grid/post-list-grid.componen';
import { PostListOnelineComponent } from '../../view/post-list-oneline/post-list-oneline.component';

@Component({
  selector: 'app-handset',
  imports: [
    AsyncPipe,
    PostListOnelineComponent,
    PostListCategoryComponent,
    PostListGridComponent,
    RouterModule,
    VisibilityDirective,
    MatDividerModule,
  ],
  templateUrl: './handset.component.html',
  styleUrl: './handset.component.scss',
})
export class HandsetComponent implements OnDestroy {
  newPosts$ = input.required<Observable<NewPost[]>>();
  langs$ = input.required<Observable<Category[]>>();
  langPosts$ = input.required<Observable<CatPost[]>>();
  selectedLang = model<Category>();
  popularPosts$ = input.required<Observable<PopularPost[]>>();

  private appService = inject(AppService);

  onSloganIntersecting($event: boolean) {
    this.appService.setIsShowingToolbarTitle(!$event);
  }
  ngOnDestroy(): void {
    this.appService.setIsShowingToolbarTitle(true);
  }
}
