import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { finalize, map, switchMap, of } from 'rxjs';
import { UserService } from '../../shared/services/user.service';
import { CommentDto } from '../comment-view/comment-view.component';
import { CommentsService } from '../comments.service';
import { AudioRecordingBlockComponent } from '../../audio/components/audio-recording-block/audio-recording-block.component';
import { AudioService } from '../../audio/services/audio.service';

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
  audioService = inject(AudioService);

  // mode = input<'comment' | 'reply'>('comment');
  mode = computed(() => (this.replyToId() ? 'reply' : 'comment'));

  // Audio recording component reference
  audioRecorder = viewChild(AudioRecordingBlockComponent);

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

    // Clean up recording if active
    const recorder = this.audioRecorder();
    if (recorder) {
      recorder.deleteRecording();
    }

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
    const recorder = this.audioRecorder();
    const recordedAudio = recorder?.getRecordedAudio();

    // Upload audio first if present
    const uploadAudio$ = recordedAudio
      ? this.audioService.uploadAudioBlob(recordedAudio).pipe(
          map((response) => response.file_id as string)
        )
      : of(undefined as string | undefined);

    uploadAudio$
      .pipe(
        switchMap((uploadId: string | undefined) =>
          this.commentsService.addComment(
            this.postId(),
            content,
            this.replyToId(),
            uploadId
          )
        ),
        finalize(() => {
          this.isLocked = false;
        })
      )
      .subscribe({
        next: (id: string) => {
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
        },
        error: (error: any) => {
          console.error('Error creating comment:', error);
          // Error handling could be improved with user notification
        },
      });
  }

  // Audio recording methods
  async startRecording() {
    console.log('startRecording called');

    // Check if user is logged in
    if (!this.user()) {
      console.log('User not logged in, redirecting to login');
      this.userService.goToLogin();
      return;
    }

    const recorder = this.audioRecorder();
    console.log('Recorder component:', recorder);

    if (!recorder) {
      console.error('Audio recorder component not found');
      return;
    }

    try {
      console.log('Calling recorder.startRecording()');
      await recorder.startRecording();
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }

  hasRecordedAudio(): boolean {
    const recorder = this.audioRecorder();
    if (!recorder) {
      return false;
    }
    return recorder.getRecordedAudio() !== null;
  }

  isRecording(): boolean {
    const recorder = this.audioRecorder();
    if (!recorder) {
      return false;
    }
    return recorder.isRecordingActive();
  }

  onRecordingStop() {
    // Handle recording stopped event if needed
  }

  onRecordingDelete() {
    // Handle recording deleted event if needed
  }
}
