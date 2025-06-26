import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { finalize, map } from 'rxjs';
import { CommentsService } from '../../../../comments.service';
import { UserService } from '../../../../user.service';

@Component({
  standalone: false,
  selector: 'app-comment-input',
  templateUrl: './comment-input.component.html',
  styleUrl: './comment-input.component.scss',
})
export class CommentInputComponent implements OnInit {
  userService = inject(UserService);
  onAddComment = output<string>();

  postId = input.required<string>();
  replyToId = input<string>();

  avatar$ = this.userService.getCurrentUser().pipe(map((u) => u?.picture));

  commentsService = inject(CommentsService);

  // mode = input<'comment' | 'reply'>('comment');
  mode = computed(() => (this.replyToId() ? 'reply' : 'comment'));

  getAvatarProps() {
    return this.mode() == 'comment'
      ? { width: '2.5rem', height: '2.5rem' }
      : {
          width: '1.5rem',
          height: '1.5rem',
        };
  }

  initialInput = input<string>('');

  ngOnInit(): void {
    this.content.setValue(this.initialInput());
  }

  content = new FormControl(this.initialInput(), [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(500),
  ]);

  isTyping = false;
  startTyping() {
    this.isTyping = true;
  }

  onCancel = output();

  cancel() {
    this.content.setValue(null);
    this.content.markAsUntouched();
    this.isTyping = false;
    this.onCancel.emit();
  }

  isLocked = false;
  comment($event: Event) {
    $event.preventDefault();
    if (this.content.invalid) {
      return;
    }

    this.isLocked = true;
    this.commentsService
      .addComment(this.postId(), this.content.value || '', this.replyToId())
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
