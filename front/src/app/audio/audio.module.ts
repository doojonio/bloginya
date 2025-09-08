import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';
import { AudioService } from './services/audio.service';

@NgModule({
  declarations: [AudioPlayerComponent],
  exports: [AudioPlayerComponent],
  providers: [AudioService],
  imports: [CommonModule],
})
export class AudioModule {}
