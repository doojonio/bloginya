import { Component, computed, inject, input, model } from '@angular/core';
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

  commentsService = inject(CommentsService);
  comments$ = computed(() =>
    this.commentsService.getComments(this.postId(), this.replyToId())
  );

  newComments = model<CommentDto[]>([]);
  onNewCommit(newComment: CommentDto) {
    this.newComments.update((com) => [newComment, ...com]);
  }
}
