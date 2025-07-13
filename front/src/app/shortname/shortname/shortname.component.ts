import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { SortBy } from '../../category/category.interface';
import { CategoryLoaded } from '../../category/category.interface';
import { ReadPostResponse } from '../../post/post.interface';
import {
  ItemShortnameResponse,
  ShortnamesService,
} from '../../shared/services/shortnames.service';

@Component({
  standalone: false,
  template: `
    @if (item$ |async; as item) { @if(item.content == null) {
    <app-page-not-found></app-page-not-found>
    } @else if (item.type == "post") {
    <app-post-view [post]="toPost(item)"></app-post-view>
    } @else if (item.type == "category") {
    <app-category
      [cat]="toCategory(item)"
      [page]="page() || 0"
      [sort]="sort()"
    ></app-category>
    } } @else {
    <mat-spinner></mat-spinner>
    }
  `,
  styles: `
    mat-spinner {
        margin: auto
    }
  `,
})
export class ShortnameComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  shortnamesService = inject(ShortnamesService);

  // input for category only
  page = input<number>();
  sort = input<SortBy>(SortBy.NEWEST);

  shortname$ = this.route.paramMap.pipe(
    map((params) => {
      const name = params.get('shortname');
      if (name && name.match(/\w{3,}/)) {
        return name;
      } else {
        this.router.navigate(['/not-found']);
        throw 'invalid name';
      }
    })
  );

  item$ = this.shortname$.pipe(
    switchMap((name) =>
      this.shortnamesService.getItemByShortname(name).pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status == 404) {
            return of({ type: 'not found', content: null });
          } else {
            throw 'Unknown Error';
          }
        })
      )
    )
  );

  toCategory(item: ItemShortnameResponse) {
    if (item.type == 'category') {
      return item.content as CategoryLoaded;
    }
    throw 'Failed to load item';
  }
  toPost(item: ItemShortnameResponse) {
    if (item.type == 'post') {
      return item.content as ReadPostResponse;
    }
    throw 'Failed to load item';
  }
}
