import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { CommentsService } from '../../../comments.service';
import { CommentInputComponent } from './comment-input/comment-input.component';
import { CommentViewComponent } from './comment-view/comment-view.component';

@Component({
  selector: 'app-comments',
  imports: [CommentInputComponent, AsyncPipe, CommentViewComponent],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss',
})
export class CommentsComponent {
  commentsService = inject(CommentsService);
  postId = input.required<string>();
  comments$ = computed(() => this.commentsService.getComments(this.postId()));

  newComments = [];
  onNewCommit(id: string) {}
}
