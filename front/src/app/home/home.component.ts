import { AsyncPipe } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Observable, of, tap } from 'rxjs';
import { AppService } from '../app.service';
import { VisibilityDirective } from '../directives/visibility.directive';
import { Category, PostsService } from '../posts.service';
import { SeoService } from '../seo.service';
import { PostListCategoryComponent } from '../view/post-list-category/post-list-category.component';
import { PostListGridComponent } from '../view/post-list-grid/post-list-grid.componen';
import { PostListOnelineComponent } from '../view/post-list-oneline/post-list-oneline.component';

@Component({
  selector: 'app-home',
  imports: [
    AsyncPipe,
    MatChipsModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    AsyncPipe,
    PostListOnelineComponent,
    PostListCategoryComponent,
    PostListGridComponent,
    RouterModule,
    VisibilityDirective,
    MatDividerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnDestroy, OnInit {
  appService = inject(AppService);
  isHandset$: Observable<boolean> = this.appService.isHandset();
  postsService = inject(PostsService);
  seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.applyDefault();
  }

  newPosts$ = this.postsService.getNewPosts();
  langs$ = this.postsService.getHomeCats().pipe(
    tap((langs) => {
      this.selectedLang.set(langs[0]);
    })
  );
  selectedLang = signal<Category | undefined>(undefined);
  langPosts$ = computed(() => {
    const lang = this.selectedLang();
    if (!lang) {
      return of([]);
    }
    return this.postsService.getHomeCatPosts(lang.id);
  });
  popularPosts$ = this.postsService.getPopularPosts();

  onSloganIntersecting($event: boolean) {
    this.appService.setIsShowingToolbarTitle(!$event);
  }
  ngOnDestroy(): void {
    this.appService.setIsShowingToolbarTitle(true);
  }
}
