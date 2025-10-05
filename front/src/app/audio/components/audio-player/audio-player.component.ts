import { Component, computed, input, signal } from '@angular/core';
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

  isPlaying = signal(false);
  currentTime = signal(0);
  duration = signal(0);

  constructor(private audioService: AudioService) {}

  togglePlayPause(audioPlayer: HTMLAudioElement): void {
    if (this.isPlaying()) {
      audioPlayer.pause();
    } else {
      audioPlayer.play();
    }
    this.isPlaying.set(!this.isPlaying());
  }

  onTimeUpdate(audioPlayer: HTMLAudioElement): void {
    this.currentTime.set(audioPlayer.currentTime);
  }

  onLoadedMetadata(audioPlayer: HTMLAudioElement): void {
    this.duration.set(audioPlayer.duration);
  }

  onEnded(): void {
    this.isPlaying.set(false);
  }

  onSeek(event: Event, audioPlayer: HTMLAudioElement): void {
    const value = (event.target as HTMLInputElement).value;
    audioPlayer.currentTime = +value;
    this.currentTime.set(+value);
  }
}
