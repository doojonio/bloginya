import { Component, input } from '@angular/core';
import { GetCommentResponseItem } from '../../../../comments.service';

@Component({
  selector: 'app-comment-view',
  imports: [],
  templateUrl: './comment-view.component.html',
  styleUrl: './comment-view.component.scss',
})
export class CommentViewComponent {
  comment = input.required<GetCommentResponseItem>();
}
