import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSliderModule } from '@angular/material/slider';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';
import { AudioWaveVisualizerComponent } from './components/audio-wave-visualizer/audio-wave-visualizer.component';
import { AudioRecordingBlockComponent } from './components/audio-recording-block/audio-recording-block.component';
import { AudioWavePlaybackComponent } from './components/audio-wave-playback/audio-wave-playback.component';

@NgModule({
  declarations: [
    AudioPlayerComponent,
    AudioWaveVisualizerComponent,
    AudioRecordingBlockComponent,
    AudioWavePlaybackComponent,
  ],
  exports: [
    AudioPlayerComponent,
    AudioWaveVisualizerComponent,
    AudioRecordingBlockComponent,
    AudioWavePlaybackComponent,
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
