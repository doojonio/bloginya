import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map, shareReplay } from 'rxjs';
import { medium } from '../../drive.service';
import { Draft, PostsService } from '../../posts.service';
import { PostListGridTitlesComponent } from '../post-list-grid-titles/post-list-grid-titles.component';

@Component({
  selector: 'app-drafts',
  imports: [AsyncPipe, PostListGridTitlesComponent],
  templateUrl: './drafts.component.html',
  styleUrl: './drafts.component.scss',
})
export class DraftsComponent {
  postsService = inject(PostsService);
  draftsResponse$ = this.postsService.getDrafts().pipe(shareReplay(1));

  continueEdit$ = this.draftsResponse$.pipe(
    map((drafts) => this.mapDriveUrl(drafts.continue_edit))
  );
  drafts$ = this.draftsResponse$.pipe(
    map((drafts) => this.mapDriveUrl(drafts.drafts))
  );

  mapDriveUrl(posts: Draft[]) {
    for (const post of posts) {
      if (post.picture_pre) {
        post.picture_pre = medium(post.picture_pre);
      }
    }

    return posts;
  }
}
