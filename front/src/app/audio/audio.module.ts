import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSliderModule } from '@angular/material/slider';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';
import { AudioWaveVisualizerComponent } from './components/audio-wave-visualizer/audio-wave-visualizer.component';
import { AudioRecordingBlockComponent } from './components/audio-recording-block/audio-recording-block.component';
import { AudioPlaybackComponent } from './components/audio-playback/audio-playback.component';

@NgModule({
  declarations: [
    AudioPlayerComponent,
    AudioWaveVisualizerComponent,
    AudioRecordingBlockComponent,
    AudioPlaybackComponent,
  ],
  exports: [
    AudioPlayerComponent,
    AudioWaveVisualizerComponent,
    AudioRecordingBlockComponent,
    AudioPlaybackComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSliderModule,
  ],
})
export class AudioModule {}
