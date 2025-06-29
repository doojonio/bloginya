import {
  Component,
  inject,
  input,
  model,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { take, tap, timer } from 'rxjs';
import { CommentsService } from '../../../../comments.service';
import { CommentsComponent } from '../comments/comments.component';

@Component({
  standalone: false,
  selector: 'app-comment-view',
  templateUrl: './comment-view.component.html',
  styleUrl: './comment-view.component.scss',
})
export class CommentViewComponent {
  comment = model.required<CommentDto>();

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

  @ViewChild('replies') replies?: CommentsComponent;

  replyGotReply = output<CommentDto>();
  onAddReply(newReply: CommentDto) {
    this.isReplying = false;
    this.comment.update((com) => {
      com.replies += 1;
      return com;
    });

    if (this.replies) {
      this.replies.addNewComment(newReply);
    } else {
      this.replyGotReply.emit(newReply);
    }

    this.isShowingReplies = true;
  }

  isShowingReplies = false;
  toggleReplies() {
    this.isShowingReplies = !this.isShowingReplies;
  }
}

export interface CommentDto {
  id: string;
  created_at: string;
  edited_at: string | null;
  content: string;
  username: string;
  picture: string | null;
  likes: number;
  liked?: boolean;
  replies: number;
}
