import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSliderModule } from '@angular/material/slider';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';
import { RecordVoiceComponent } from './components/record-voice/record-voice.component';
import { AudioService } from './services/audio.service';

@NgModule({
  declarations: [AudioPlayerComponent, RecordVoiceComponent],
  exports: [AudioPlayerComponent, RecordVoiceComponent],
  providers: [AudioService],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSliderModule,
  ],
})
export class AudioModule {}
