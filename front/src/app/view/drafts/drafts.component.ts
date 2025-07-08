import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map, shareReplay, tap } from 'rxjs';
import { PostsService } from '../../posts.service';
import { PostListGridTitlesComponent } from '../post-list-grid-titles/post-list-grid-titles.component';

@Component({
  selector: 'app-drafts',
  imports: [AsyncPipe, PostListGridTitlesComponent],
  templateUrl: './drafts.component.html',
  styleUrl: './drafts.component.scss',
})
export class DraftsComponent {
  postsService = inject(PostsService);
  draftsResponse$ = this.postsService.getDrafts().pipe(
    shareReplay(1),
    tap((drafts) => {
      this.maxLength = Math.max(
        drafts.continue_edit.length,
        drafts.drafts.length
      );
    })
  );

  continueEdit$ = this.draftsResponse$.pipe(
    map((drafts) => drafts.continue_edit)
  );
  drafts$ = this.draftsResponse$.pipe(map((drafts) => drafts.drafts));

  maxLength = 0;
}
