import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { AudioService } from '../../audio/services/audio.service';

@Component({
  standalone: false,
  selector: 'app-audio-playback',
  templateUrl: './audio-playback.component.html',
  styleUrl: './audio-playback.component.scss',
})
export class AudioPlaybackComponent implements OnDestroy {
  uploadId = input.required<string>();

  private audioService = inject(AudioService);

  audioUrl = computed(() => {
    const id = this.uploadId();
    return id ? this.audioService.getAudioUrl(id) : null;
  });

  audioPlayerRef = viewChild<ElementRef<HTMLAudioElement>>('audioPlayer');
  audioPlayer = computed(() => this.audioPlayerRef()?.nativeElement);
  isPlaying = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  audioBlob = signal<Blob | null>(null);

  constructor() {
    effect(() => {
      const url = this.audioUrl();
      if (url) {
        this.loadAudio(url);
      }
    });
  }

  async loadAudio(url: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      this.audioBlob.set(blob);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  }

  togglePlayPause() {
    const player = this.audioPlayer();
    if (!player) return;

    if (this.isPlaying()) {
      player.pause();
      this.isPlaying.set(false);
    } else {
      player.play();
      this.isPlaying.set(true);
    }
  }

  onTimeUpdate() {
    const player = this.audioPlayer();
    if (player) {
      this.currentTime.set(player.currentTime);
    }
  }

  onLoadedMetadata() {
    const player = this.audioPlayer();
    if (player) {
      this.duration.set(player.duration);
    }
  }

  onEnded() {
    this.isPlaying.set(false);
    this.currentTime.set(0);
  }

  onError() {
    console.error('Error playing audio');
    this.isPlaying.set(false);
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  ngOnDestroy() {
    const player = this.audioPlayer();
    if (player) {
      player.pause();
      player.src = '';
    }
  }
}

