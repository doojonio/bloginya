import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CommentInputComponent } from './comment-input/comment-input.component';
import { CommentViewComponent } from './comment-view/comment-view.component';
import { CommentsComponent } from './comments/comments.component';
import { AudioRecordingBlockComponent } from './audio-recording-block/audio-recording-block.component';
import { AudioWaveVisualizerComponent } from './audio-wave-visualizer/audio-wave-visualizer.component';
import { AudioPlaybackComponent } from './audio-playback/audio-playback.component';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    CommentsComponent,
    CommentViewComponent,
    CommentInputComponent,
    AudioRecordingBlockComponent,
    AudioWaveVisualizerComponent,
    AudioPlaybackComponent,
  ],
  providers: [CommentInputComponent, CommentViewComponent, CommentsComponent],
  exports: [CommentsComponent],
  imports: [
    CommonModule,
    AsyncPipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterModule,
  ],
})
export class CommentsModule {}
