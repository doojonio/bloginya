import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { PostListGridComponent } from '../shared/components/post-list-grid/post-list-grid.componen';
import { PostListOnelineComponent } from '../shared/components/post-list-oneline/post-list-oneline.component';
import { VisibilityDirective } from '../shared/directives/visibility.directive';
import { AppService } from '../shared/services/app.service';
import { SeoService } from '../shared/services/seo.service';
import { PostListCategoryComponent } from './components/post-list-category/post-list-category.component';
import { HomeService } from './services/home.service';

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
  providers: [HomeService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnDestroy, OnInit {
  appService = inject(AppService);
  isHandset = toSignal(this.appService.isHandset());
  homeS = inject(HomeService);
  seoS = inject(SeoService);

  ngOnInit(): void {
    this.seoS.applyDefault();
    this.homeS.updateHome();
  }

  newPosts$ = this.homeS.getNewPosts();
  popularPosts$ = this.homeS.getPopularPosts();

  onSloganIntersecting($event: boolean) {
    this.appService.setIsShowingToolbarTitle(!$event);
  }
  ngOnDestroy(): void {
    this.appService.setIsShowingToolbarTitle(true);
  }
}
