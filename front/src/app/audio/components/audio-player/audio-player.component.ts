import { Component, input, computed } from '@angular/core';
import { AudioService } from '../../services/audio.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule],
})
export class AudioPlayerComponent {
  filename = input<string | null>(null);
  audioUrl = computed(() => {
    const currentFilename = this.filename();
    return currentFilename ? this.audioService.getAudioUrl(currentFilename) : null;
  });

  constructor(private audioService: AudioService) {}
}
