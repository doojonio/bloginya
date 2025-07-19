import { Component, computed, inject, input, signal } from '@angular/core';
import { tap } from 'rxjs';
import { CommentDto } from '../comment-view/comment-view.component';
import { CommentsService } from '../comments.service';

@Component({
  standalone: false,
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss',
})
export class CommentsComponent {
  private readonly updateSignal = signal('');
  private readonly commentsService = inject(CommentsService);

  postId = input.required<string>();
  replyToId = input<string>();
  isReply = computed(() => !!this.replyToId());
  extraFirst = computed(() => (this.isReply() ? false : true));
  comments$ = computed(() => {
    this.updateSignal();

    return this.commentsService
      .getComments(this.postId(), this.replyToId())
      .pipe(tap((_) => (this.extraComments.length = 0)));
  });
  extraComments: CommentDto[] = [];

  addNewComment(newComment: CommentDto) {
    if (this.extraFirst()) {
      this.extraComments.unshift(newComment);
    } else {
      this.extraComments.push(newComment);
    }
  }
  updateComments() {
    this.updateSignal.update((o) => o + ' ');
  }
}
