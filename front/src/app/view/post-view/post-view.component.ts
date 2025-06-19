import {
  AsyncPipe,
  DatePipe,
  DecimalPipe,
  I18nPluralPipe,
} from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { filter, switchMap, take, tap, timer } from 'rxjs';
import { PostsService, ReadPostResponse } from '../../posts.service';
import { UserService } from '../../user.service';
import { DocumentDomComponent } from './document-dom/document-dom.component';

@Component({
  selector: 'app-post-view',
  imports: [
    DecimalPipe,
    I18nPluralPipe,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    DocumentDomComponent,
    MatDividerModule,
    AsyncPipe,
    RouterModule,
  ],
  templateUrl: './post-view.component.html',
  styleUrl: './post-view.component.scss',
})
export class PostViewComponent {
  postsService = inject(PostsService);
  usersService = inject(UserService);

  currentUser$ = this.usersService.getCurrentUser();

  postId = input<string>();
  postByIdSubs = toObservable(this.postId)
    .pipe(
      takeUntilDestroyed(),
      filter(Boolean),
      switchMap((id) => this.postsService.readPost(id))
    )
    .subscribe((postById) => {
      this.post.update((post) => {
        if (post) return post;

        return postById;
      });
    });

  post = model.required<ReadPostResponse>();
  likeAnimClass = signal('');

  title_image_style = computed(() => {
    const url = this.post().picture_wp;
    return url
      ? {
          background: [
            'linear-gradient(to right, rgba(0,0,0, 0.4))',
            `url(${url}) no-repeat center / cover`,
          ].join(', '),
        }
      : {};
  });

  tagClicked(tag: string) {
    throw new Error('Method not implemented.');
  }
  like() {
    this.postsService
      .like(this.post().id)
      .pipe(
        tap((_) => {
          this.likeAnimClass.set('animate');
          timer(550)
            .pipe(take(1))
            .subscribe((_) => this.likeAnimClass.set(''));
        })
      )
      .subscribe((r) => {
        this.post.update((p) => {
          if (!p.liked) {
            p.liked = true;
            p.likes += 1;
          }

          return p;
        });
      });
  }
  unlike() {
    this.postsService.unlike(this.post().id).subscribe((r) => {
      this.post.update((p) => {
        if (p.liked) {
          p.liked = false;
          p.likes -= 1;
        }

        return p;
      });
    });
  }
}
