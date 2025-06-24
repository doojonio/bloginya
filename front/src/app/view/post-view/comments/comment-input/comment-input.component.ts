import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { map } from 'rxjs';
import { UserService } from '../../../../user.service';

@Component({
  selector: 'app-comment-input',
  imports: [AsyncPipe, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './comment-input.component.html',
  styleUrl: './comment-input.component.scss',
})
export class CommentInputComponent {
  userService = inject(UserService);

  postId = input.required<string>();
  replyToId = input<string>();

  avatar = this.userService.getCurrentUser().pipe(map((u) => u?.picture));

  mode = input<'comment' | 'reply'>('comment');

  getAvatarProps() {
    return this.mode() == 'comment'
      ? { width: '2.5rem', height: '2.5rem' }
      : {
          width: '1rem',
          height: '1rem',
        };
  }
}
