import { AsyncPipe } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { finalize, map } from 'rxjs';
import { CommentsService } from '../../../../comments.service';
import { UserService } from '../../../../user.service';

@Component({
  selector: 'app-comment-input',
  imports: [
    AsyncPipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './comment-input.component.html',
  styleUrl: './comment-input.component.scss',
})
export class CommentInputComponent {
  userService = inject(UserService);
  onAddComment = output<string>();

  postId = input.required<string>();
  replyToId = input<string>();

  avatar = this.userService.getCurrentUser().pipe(map((u) => u?.picture));

  commentsService = inject(CommentsService);

  mode = input<'comment' | 'reply'>('comment');

  getAvatarProps() {
    return this.mode() == 'comment'
      ? { width: '2.5rem', height: '2.5rem' }
      : {
          width: '1rem',
          height: '1rem',
        };
  }

  content = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(500),
  ]);

  isTyping = false;
  startTyping() {
    this.isTyping = true;
  }

  cancel() {
    this.content.setValue(null);
    this.content.markAsUntouched();
    this.isTyping = false;
  }

  isLocked = false;
  comment() {
    if (this.content.invalid) {
      return;
    }

    this.isLocked = true;
    this.commentsService
      .addComment(this.postId(), this.content.value || '')
      .pipe(
        finalize(() => {
          this.isLocked = false;
        })
      )
      .subscribe((id) => {
        this.onAddComment.emit(id);
        this.cancel();
      });
  }
}
