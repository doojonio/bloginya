import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { PageNotFoundComponent } from '../../page-not-found/page-not-found.component';
import { ReadPostResponse } from '../../posts.service';
import {
  ItemShortnameResponse,
  ShortnamesService,
} from '../../shortnames.service';
import {
  Category,
  CategoryComponent,
  SortBy,
} from '../category/category.component';
import { PostViewComponent } from '../post-view/post-view.component';

@Component({
  selector: 'app-any-view',
  imports: [
    AsyncPipe,
    MatProgressSpinnerModule,
    PostViewComponent,
    PageNotFoundComponent,
    CategoryComponent,
  ],
  templateUrl: './any-view.component.html',
  styleUrl: './any-view.component.scss',
})
export class AnyViewComponent {
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
      return item.content as Category;
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
