import { DatePipe } from '@angular/common';
import { Component, inject, model, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { take, tap, timer } from 'rxjs';
import {
  CommentsService,
  GetCommentResponseItem,
} from '../../../../comments.service';

@Component({
  selector: 'app-comment-view',
  imports: [DatePipe, MatIconModule, MatButtonModule],
  templateUrl: './comment-view.component.html',
  styleUrl: './comment-view.component.scss',
})
export class CommentViewComponent {
  comment = model.required<GetCommentResponseItem>();

  commentsService = inject(CommentsService);

  likeAnimClass = signal('');

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
}
