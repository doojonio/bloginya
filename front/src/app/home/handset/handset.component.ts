import { Component, inject, input, model, OnDestroy } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AppService } from '../../app.service';
import { VisibilityDirective } from '../../directives/visibility.directive';
import { Category, CatPost, NewPost, PopularPost } from '../../posts.service';
import { LangPostsComponent } from './lang-posts/lang-posts.component';
import { NewPostsComponent } from './new-posts/new-posts.component';
import { PopularPostsComponent } from './popular-posts/popular-posts.component';

@Component({
  selector: 'app-handset',
  imports: [
    NewPostsComponent,
    LangPostsComponent,
    PopularPostsComponent,
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
