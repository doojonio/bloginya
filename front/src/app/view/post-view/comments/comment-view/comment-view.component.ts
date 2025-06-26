import { Component, inject, input, model, signal } from '@angular/core';
import { take, tap, timer } from 'rxjs';
import {
  CommentsService,
  GetCommentResponseItem,
} from '../../../../comments.service';

@Component({
  standalone: false,
  selector: 'app-comment-view',
  templateUrl: './comment-view.component.html',
  styleUrl: './comment-view.component.scss',
})
export class CommentViewComponent {
  comment = model.required<GetCommentResponseItem>();

  replyToId = input<string>();

  commentsService = inject(CommentsService);

  likeAnimClass = signal('');
  postId = input.required<string>();

  like() {
    this.commentsService
      .like(this.comment().id)
      .pipe(
        tap((_) => {
          this.likeAnimClass.set('animate');
          timer(550)
            .pipe(take(1))
            .subscribe((_) => this.likeAnimClass.set(''));
        })
      )
      .subscribe((r) => {
        this.comment.update((p) => {
          if (!p.liked) {
            p.liked = true;
            p.likes = (p.likes || 0) + 1;
          }

          return p;
        });
      });
  }
  unlike() {
    this.commentsService.unlike(this.comment().id).subscribe((r) => {
      this.comment.update((p) => {
        if (p.liked) {
          p.liked = false;
          p.likes = (p.likes || 1) - 1;
        }

        return p;
      });
    });
  }

  isReplying = false;
  startReply() {
    this.isReplying = true;
  }
  stopReply() {
    this.isReplying = false;
  }
  onAddReply($event: string) {
    this.isReplying = false;
  }

  isShowingReplies = false;
  toggleReplies() {
    this.isShowingReplies = !this.isShowingReplies;
  }
}
