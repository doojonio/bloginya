import { Component, computed, inject, input } from '@angular/core';
import { CommentsService } from '../../../../comments.service';

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
  comments$ = computed(() => this.commentsService.getComments(this.postId(), this.replyToId()));

  newComments = [];
  onNewCommit(id: string) {}
}
