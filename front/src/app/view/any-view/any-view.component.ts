import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, of, switchMap, throwError } from 'rxjs';
import { PageNotFoundComponent } from '../../page-not-found/page-not-found.component';
import { ShortnamesService } from '../../shortnames.service';
import { PostViewComponent } from '../post-view/post-view.component';

@Component({
  selector: 'app-any-view',
  imports: [
    AsyncPipe,
    MatProgressSpinnerModule,
    PostViewComponent,
    PageNotFoundComponent,
  ],
  templateUrl: './any-view.component.html',
  styleUrl: './any-view.component.scss',
})
export class AnyViewComponent {
  route = inject(ActivatedRoute);
  shortnamesService = inject(ShortnamesService);

  shortname$ = this.route.paramMap.pipe(
    map((params) => {
      const name = params.get('shortname');
      if (name && name.match(/\w{3,}/)) {
        return name;
      } else {
        throwError(() => 'invalid name');
        return '';
      }
    })
  );
  item$ = this.shortname$.pipe(
    switchMap((name) => this.shortnamesService.getItemByShortname(name)),
    catchError((err: HttpErrorResponse) => {
      if (err.status == 404) {
        return of({ type: 'not found', content: null });
      } else {
        return throwError(() => err);
      }
    })
  );
}
