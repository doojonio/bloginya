import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  catchError,
  combineLatest,
  filter,
  map,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
  timer,
} from 'rxjs';
import { UserRoles } from '../../shared/interfaces/entities.interface';
import { AppService } from '../../shared/services/app.service';
import { PictureService } from '../../shared/services/picture.service';
import { SeoService } from '../../shared/services/seo.service';
import { UserService } from '../../shared/services/user.service';
import { ReadPostResponse } from '../post.interface';
import { LikerService } from '../services/liker.service';
import { ReaderService } from '../services/reader.service';
import { StatService } from '../services/stat.service';

@Component({
  selector: 'app-post-view',
  standalone: false,
  templateUrl: './post-view.component.html',
  styleUrl: './post-view.component.scss',
})
export class PostViewComponent {
  private readonly readerS = inject(ReaderService);
  private readonly likerS = inject(LikerService);
  private readonly usersService = inject(UserService);
  private readonly appService = inject(AppService);
  private readonly seoService = inject(SeoService);
  private readonly statS = inject(StatService);

  UserRoles = UserRoles;

  currentUser$ = this.usersService.getCurrentUser();

  postId = input<string>();
  postByIdSubs = toObservable(this.postId)
    .pipe(
      takeUntilDestroyed(),
      filter(Boolean),
      switchMap((id) => this.readerS.readPost(id))
    )
    .subscribe((postById) => {
      this.post.set(postById);
    });

  post = model.required<ReadPostResponse>();

  sendStatByIdSubs = combineLatest([this.currentUser$, toObservable(this.post)])
    .pipe(
      takeUntilDestroyed(),
      filter(([u]) => u?.role != UserRoles.OWNER),
      map((arr) => arr[1]),
      filter(Boolean),
      switchMap((post) => {
        return this.statS
          .recordRead(post.id, 'short')
          .pipe(catchError(() => of()));
      })
    )
    .subscribe();

  viewCount$ = combineLatest([this.currentUser$, toObservable(this.post)]).pipe(
    filter(([user, _]) => user?.role == UserRoles.OWNER),
    switchMap(([_, post]) =>
      this.statS.getViews(post.id).pipe(catchError(() => of(null)))
    ),
    map((views) => (views ? views.short_views : 0))
  );

  showAsianHelpers = false;
  hasRt = signal(false);

  onNewPostSubs = toObservable(this.post).subscribe((_) => {
    this.appService.scrolToTop();
  });

  likeAnimClass = signal('');

  private readonly picS = inject(PictureService);
  title_image_style = computed(() => {
    const url = this.picS.variant(this.post().picture_wp, 'medium');
    return url
      ? {
          background: [
            'linear-gradient(to right, rgba(0,0,0, 0.4))',
            `url(${url}) no-repeat center / cover`,
          ].join(', '),
        }
      : {
          'background-color': '#896483',
        };
  });

  titleEffect = effect(() => {
    const post = this.post();

    if (post) {
      this.seoService.applyForPost(post);
    }
  });

  similliarPosts$ = toObservable(this.post).pipe(
    switchMap(() => this.readerS.getSimilliarPosts(this.post().id))
  );

  showComments = false;
  showLikedUsers: any;
  likedUsers$ = computed(() =>
    this.readerS.getLikedUsers(this.post().id).pipe(shareReplay(1))
  );

  toggleShowComments() {
    this.showComments = !this.showComments;
  }

  getCategoryLink(post: ReadPostResponse) {
    return (
      '/' + (post.category_name ? post.category_name : 'c/' + post.category_id)
    );
  }

  tagClicked(tag: string) {
    throw new Error('Method not implemented.');
  }
  like() {
    this.likerS
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
    this.likerS.unlike(this.post().id).subscribe((r) => {
      this.post.update((p) => {
        if (p.liked) {
          p.liked = false;
          p.likes = (p.likes || 1) - 1;
        }

        return p;
      });
    });
  }
}
