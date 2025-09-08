import { Component, computed, input } from '@angular/core';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
  standalone: false,
})
export class AudioPlayerComponent {
  filename = input<string | null>(null);
  audioUrl = computed(() => {
    const currentFilename = this.filename();
    return currentFilename
      ? this.audioService.getAudioUrl(currentFilename)
      : null;
  });

  constructor(private audioService: AudioService) {}
}
