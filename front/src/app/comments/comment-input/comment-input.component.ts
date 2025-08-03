import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { finalize, map } from 'rxjs';
import { UserService } from '../../shared/services/user.service';
import { CommentDto } from '../comment-view/comment-view.component';
import { CommentsService } from '../comments.service';

@Component({
  standalone: false,
  selector: 'app-comment-input',
  templateUrl: './comment-input.component.html',
  styleUrl: './comment-input.component.scss',
})
export class CommentInputComponent implements OnInit {
  userService = inject(UserService);
  onAddComment = output<CommentDto>();

  postId = input.required<string>();
  replyToId = input<string>();

  user = toSignal(this.userService.getCurrentUser());
  avatar$ = this.userService.getCurrentUser().pipe(map((u) => u?.picture));
  avatar = computed(() => this.user()?.picture || this.defaultPicture);
  defaultPicture = '/assets/images/default_user.webp';

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
    const initial = this.initialInput();
    if (initial) {
      this.content.setValue(initial);
    }
  }

  content = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(500),
  ]);

  isTyping = false;
  startTyping() {
    this.isTyping = true;

    if (!this.user()) {
      this.userService.goToLogin();
    }
  }

  onCancel = output();

  cancel() {
    this.content.setValue(null);
    this.content.markAsUntouched();
    this.isTyping = false;
    this.onCancel.emit();
  }

  isLocked = false;
  comment() {
    const user = this.user();
    if (this.content.invalid || !user) {
      return;
    }

    this.isLocked = true;
    const content = this.content.value || '';
    this.commentsService
      .addComment(this.postId(), content, this.replyToId())
      .pipe(
        finalize(() => {
          this.isLocked = false;
        })
      )
      .subscribe((id) => {
        this.onAddComment.emit({
          id: id,
          user_id: user.id,
          edited_at: null,
          created_at: new Date().toISOString(),
          content: content,
          username: user.username,
          picture: user.picture,
          likes: 0,
          replies: 0,
        });
        this.cancel();
      });
  }
}
