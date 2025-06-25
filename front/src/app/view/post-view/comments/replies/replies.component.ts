import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { CommentsService } from '../../../../comments.service';
import { ReplyViewComponent } from './reply-view/reply-view.component';

@Component({
  selector: 'app-replies',
  imports: [AsyncPipe, ReplyViewComponent],
  templateUrl: './replies.component.html',
  styleUrl: './replies.component.scss',
})
export class RepliesComponent {
  postId = input.required<string>();
  comId = input.required<string>();

  commentsService = inject(CommentsService);
  replies$ = computed(() =>
    this.commentsService.getComments(this.postId(), this.comId())
  );
}
