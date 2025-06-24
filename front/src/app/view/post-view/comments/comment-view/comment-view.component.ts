import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GetCommentResponseItem } from '../../../../comments.service';

@Component({
  selector: 'app-comment-view',
  imports: [DatePipe, MatIconModule, MatButtonModule],
  templateUrl: './comment-view.component.html',
  styleUrl: './comment-view.component.scss',
})
export class CommentViewComponent {
  comment = input.required<GetCommentResponseItem>();

  like() {
    throw new Error('Method not implemented.');
  }
  unlike() {
    throw new Error('Method not implemented.');
  }
}
