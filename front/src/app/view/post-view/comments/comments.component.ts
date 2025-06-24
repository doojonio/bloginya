import { Component, computed, inject, input } from '@angular/core';
import { CommentsService } from '../../../comments.service';
import { CommentInputComponent } from './comment-input/comment-input.component';

@Component({
  selector: 'app-comments',
  imports: [CommentInputComponent],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss',
})
export class CommentsComponent {
  commentsService = inject(CommentsService);
  postId = input.required<string>();
  comments = computed(() => this.commentsService.getComments(this.postId()));
}
