import { AsyncPipe, NgOptimizedImage, UpperCasePipe } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { map, of, shareReplay, switchMap } from 'rxjs';
import { PostListMedComponent } from '../../../shared/components/post-list-med/post-list-med.component';
import { AppService } from '../../../shared/services/app.service';
import { Category, PostDescribed } from '../../home.interface';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-post-list-category-chips',
  standalone: true,
  imports: [MatChipsModule, PostListMedComponent, UpperCasePipe, AsyncPipe],
  template: `
    <div class="cats noscrollbar">
      <mat-chip-listbox (change)="onChange($event)">
        @for (cat of cats() ; track cat.id) {
        <mat-chip-option
          [selected]="cat.id == selectedCat()?.id"
          [value]="cat"
          >{{ cat.title | uppercase }}</mat-chip-option
        >
        }
      </mat-chip-listbox>
    </div>
    <app-post-list-med
      [imageFirst]="true"
      [posts]="posts$ | async"
      [divider]="false"
    ></app-post-list-med>
  `,
  styles: `
    @use "@angular/material" as mat;

    .cats {
      overflow-x: auto;

      mat-chip-listbox {
        padding: 0;
        width: max-content;
        margin-bottom: 1rem;
      }

      @include mat.chips-overrides(
        (
          container-shape-radius: 20px,
          container-height: 48px,
          outline-color: var(--mat-sys-outline-variant),
          elevated-selected-container-color: var(--mat-sys-secondary-container),
          // label-text-color: var(--mat-sys-on-),
        )
      );
    }
  `,
})
export class PostListCategoryChipsComponent {
  homeS = inject(HomeService);
  cats = input<Category[]>();
  selectedCat = signal<Category | undefined>(undefined);

  posts$ = toObservable(this.selectedCat).pipe(
    switchMap((cat) => {
      if (!cat) {
        return of([]);
      }
      return this.homeS.getHomeCatPosts(cat.id);
    }),
    map((posts) => posts.slice(0, 5)),
    shareReplay(1)
  );

  catsEffect = effect(() => {
    const cats = this.cats();
    if (cats?.length) {
      this.selectedCat.set(cats[0]);
    }
  });

  onChange(newLang: MatChipListboxChange) {
    if (!newLang.value) {
      return;
    }
    this.selectedCat.set(newLang.value);
  }
}

@Component({
  selector: 'app-post-list-category-tabs',
  standalone: true,
  imports: [
    MatTabsModule,
    PostListMedComponent,
    UpperCasePipe,
    RouterModule,
    NgOptimizedImage,
    AsyncPipe,
  ],
  template: `
    <mat-tab-group (selectedTabChange)="onChangeTab($event)">
      @for (cat of cats() ; track cat.id) {
      <mat-tab label="{{ cat.title | uppercase }}">
        <ng-template matTabContent>
          @let posts = homeS.getHomeCatPosts(cat.id) | async; @if (!posts) {
          <p i18n>Loading...</p>
          } @else if (posts.length === 0) {
          <p i18n>No posts in this category.</p>
          } @else { @let first3 = posts.slice(0, 3); @let second3 =
          posts.slice(3, 6); @let third3 = posts.slice(6, 9);

          <div class="desktop-cols">
            <div class="desktop-col">
              <app-post-list-med
                [imageFirst]="true"
                [posts]="first3"
                [divider]="false"
              ></app-post-list-med>
            </div>
            <div class="desktop-col">
              <app-post-list-med
                [imageFirst]="true"
                [posts]="second3"
                [divider]="false"
              ></app-post-list-med>
            </div>
          </div>
          <div class="desktop-row">
            @for (post of third3; track post.id) {
            <a class="row-post" [routerLink]="linkForPost(post)">
              @if (post.picture_pre) {
              <img
                class="row-post-img"
                [ngSrc]="post.picture_pre"
                height="265"
                width="265"
              />
              }
              <div class="row-post-info">
                <p class="row-post-title">{{ post.title }}</p>
                <p class="row-post-descr">{{ post.description }}</p>
              </div>
            </a>
            }
          </div>
          }
        </ng-template>
      </mat-tab>
      }
    </mat-tab-group>
  `,
  styles: `
    @use "mixins" as mixs;

    .desktop-cols {
      display: flex;
      flex-flow: row nowrap;
      margin-top: 1rem;
    }

    .desktop-col {
      width: 50%;
    }

    .desktop-row {
      display: flex;
      flex-flow: row nowrap;
      gap: 2rem;
      margin-top: 2rem;

      justify-content: space-around;
    }

    .row-post {
      all: unset;
      display: block;
      cursor: pointer;
    }

    .row-post-img {
      border-radius: 1rem;
      object-fit: cover;
    }

    .row-post-title {
      @include mixs.line-clamp(1);
      color: var(--mat-sys-primary);
      font: var(--mat-sys-title-large);
      cursor: pointer;
      margin-top: 0.5rem;
      margin-bottom: 0;
    }

    .row-post-descr {
      margin: 0;
      @include mixs.line-clamp(3);
      font: var(--mat-sys-body-medium);
    }
  `,
})
export class PostListCategoryTabsComponent {
  homeS = inject(HomeService);
  cats = input<Category[]>();

  linkForPost(post: PostDescribed) {
    return post.name ? '/' + post.name : '/p/' + post.id;
  }
  onChangeTab($event: MatTabChangeEvent) {
    // let cats = this.cats() || [];
    // this.selectedCat.set(cats[$event.index]);
  }
}

@Component({
  selector: 'app-post-list-category',
  imports: [PostListCategoryChipsComponent, PostListCategoryTabsComponent],
  // templateUrl: './post-list-category.component.html',
  // styleUrl: './post-list-category.component.scss',
  template: `
    @if (title(); as title) {
    <p class="title">{{ title }}</p>
    } @if(isHandset()) {
    <app-post-list-category-chips
      [cats]="categories()"
    ></app-post-list-category-chips>
    } @else {
    <app-post-list-category-tabs
      [cats]="categories()"
    ></app-post-list-category-tabs>
    }
  `,
  styles: `
    .title {
      color: var(--mat-sys-primary);
      font: var(--mat-sys-title-medium);
      box-shadow: var(--mat-sys-level0);
      margin-bottom: 20px;
    }
  `,
})
export class PostListCategoryComponent {
  homeS = inject(HomeService);
  categories = toSignal(this.homeS.getHomeCats());

  private readonly appService = inject(AppService);
  isHandset = toSignal(this.appService.isHandset());

  title = input<string>();

  // first5 = computed(() => this.posts().slice(0, 5));
  // first3 = computed(() => this.posts().slice(0, 3));
  // second3 = computed(() => this.posts().slice(3, 6));
  // third3 = computed(() => this.posts().slice(6, 9));
}
