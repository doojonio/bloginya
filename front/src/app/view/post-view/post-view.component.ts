import {
  AsyncPipe,
  DatePipe,
  DecimalPipe,
  I18nPluralPipe,
} from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  OnDestroy,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import {
  BehaviorSubject,
  filter,
  pairwise,
  switchMap,
  take,
  tap,
  timer,
} from 'rxjs';
import { VisibilityDirective } from '../../directives/visibility.directive';
import { PostsService, ReadPostResponse } from '../../posts.service';
import { UserService } from '../../user.service';
import { PostListMedComponent } from '../post-list-med/post-list-med.component';
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
    VisibilityDirective,
    MatProgressSpinnerModule,
    PostListMedComponent,
  ],
  templateUrl: './post-view.component.html',
  styleUrl: './post-view.component.scss',
})
export class PostViewComponent implements OnDestroy {
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

  // TODO: fix this stupid bullshit
  newPostEffect = effect(() => {
    if (this.post()) {
      this.loadSimilliarPosts$.next(false);
    }
  });
  loadSimilliarPosts$ = new BehaviorSubject<boolean>(false);
  similliarPosts$ = this.loadSimilliarPosts$.pipe(
    pairwise(),
    filter(([prev, cur]) => !prev && cur),
    switchMap(() => this.postsService.getSimilliarPosts(this.post().id))
  );

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
            p.likes = (p.likes || 0) + 1;
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
          p.likes = (p.likes || 1) - 1;
        }

        return p;
      });
    });
  }

  onMoveFromIntersecting($event: boolean) {
    if (!$event) {
      return;
    }
    this.loadSimilliarPosts$.next(true);
  }

  ngOnDestroy(): void {
    this.loadSimilliarPosts$.next(false);
  }
}
