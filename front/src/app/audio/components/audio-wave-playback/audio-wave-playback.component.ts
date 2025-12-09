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
import { AudioService } from '../../services/audio.service';
import { PlaybackService } from '../../services/playback.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: false,
  selector: 'app-audio-wave-playback',
  templateUrl: './audio-wave-playback.component.html',
  styleUrl: './audio-wave-playback.component.scss',
})
export class AudioWavePlaybackComponent implements OnDestroy {
  uploadId = input.required<string>();

  private audioService = inject(AudioService);
  private playbackService = inject(PlaybackService);

  private readonly onPauseSub = this.playbackService
    .onPause()
    .pipe(takeUntilDestroyed())
    .subscribe(() => this.pause());

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

    const wasPlaying = this.isPlaying();

    if (wasPlaying) {
      // Stop this player
      this.pause();
    } else {
      // Pause all other audio players, then start this one
      this.playbackService.pauseAll();
      player.play();
      this.isPlaying.set(true);
    }
  }

  pause() {
    const player = this.audioPlayer();
    if (player) {
      player.pause();
      this.isPlaying.set(false);
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

