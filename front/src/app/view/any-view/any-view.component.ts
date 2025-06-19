import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, throwError } from 'rxjs';
import { ShortnamesService } from '../../shortnames.service';
import { PostViewComponent } from '../post-view/post-view.component';

@Component({
  selector: 'app-any-view',
  imports: [AsyncPipe, MatProgressSpinnerModule, PostViewComponent],
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
    switchMap((name) => this.shortnamesService.getItemByShortname(name))
  );
}
