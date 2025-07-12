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
import { filter, switchMap, take, tap, timer } from 'rxjs';
import { AppService } from '../../shared/services/app.service';
import { variant } from '../../shared/services/drive.service';
import { PostsService, ReadPostResponse } from '../../shared/services/posts.service';
import { SeoService } from '../../shared/services/seo.service';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-post-view',
  standalone: false,
  templateUrl: './post-view.component.html',
  styleUrl: './post-view.component.scss',
})
export class PostViewComponent {
  private readonly postsService = inject(PostsService);
  private readonly usersService = inject(UserService);
  private readonly appService = inject(AppService);
  private readonly seoService = inject(SeoService);

  currentUser$ = this.usersService.getCurrentUser();

  postId = input<string>();
  postByIdSubs = toObservable(this.postId)
    .pipe(
      takeUntilDestroyed(),
      filter(Boolean),
      switchMap((id) => this.postsService.readPost(id))
    )
    .subscribe((postById) => {
      this.post.set(postById);
    });

  post = model.required<ReadPostResponse>();

  onNewPostSubs = toObservable(this.post).subscribe((_) => {
    this.appService.scrolToTop();
  });

  likeAnimClass = signal('');

  title_image_style = computed(() => {
    const url = variant(this.post().picture_wp, 'medium');
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
    switchMap(() => this.postsService.getSimilliarPosts(this.post().id))
  );

  showComments = false;
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
}
