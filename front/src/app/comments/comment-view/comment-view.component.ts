import {
  Component,
  inject,
  input,
  model,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { take, tap, timer } from 'rxjs';
import { CommentsComponent } from '../comments/comments.component';
import { CommentsService } from '../comments.service';
import { UserService } from '../../shared/services/user.service';

@Component({
  standalone: false,
  selector: 'app-comment-view',
  templateUrl: './comment-view.component.html',
  styleUrl: './comment-view.component.scss',
})
export class CommentViewComponent {
  private readonly commentsService = inject(CommentsService);
  private readonly userService = inject(UserService);

  comment = model.required<CommentDto>();
  replyToId = input<string>();
  user = toSignal(this.userService.getCurrentUser());
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

  onDelete = output<void>();
  blockUser(userId: string) {
    this.commentsService.blockUser(userId).subscribe((_) => {
      this.onDelete.emit();
    });
  }
  deleteComment(comId: string) {
    this.commentsService.deleteComment(comId).subscribe((_) => {
      this.onDelete.emit();
    });
  }
}

export interface CommentDto {
  id: string;
  user_id: string;
  created_at: string;
  edited_at: string | null;
  content: string;
  username: string;
  picture: string | null;
  likes: number;
  liked?: boolean;
  replies: number;
}
