import { Component, computed, inject, input } from '@angular/core';
import { tap } from 'rxjs';
import { CommentsService } from '../../../../comments.service';
import { CommentDto } from '../comment-view/comment-view.component';

@Component({
  standalone: false,
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss',
})
export class CommentsComponent {
  postId = input.required<string>();
  replyToId = input<string>();
  isReply = computed(() => !!this.replyToId());
  extraFirst = computed(() => (this.isReply() ? false : true));

  private readonly commentsService = inject(CommentsService);
  comments$ = computed(() =>
    this.commentsService
      .getComments(this.postId(), this.replyToId())
      .pipe(tap((_) => (this.extraComments.length = 0)))
  );

  extraComments: CommentDto[] = [];
  addNewComment(newComment: CommentDto) {
    if (this.extraFirst()) {
      this.extraComments.unshift(newComment);
    } else {
      this.extraComments.push(newComment);
    }
  }
}
