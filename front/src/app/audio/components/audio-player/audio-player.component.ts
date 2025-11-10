import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  ViewChild,
} from '@angular/core';
import { AudioService } from '../../services/audio.service';
import { PlaybackService } from '../../services/playback.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  private audioService = inject(AudioService);
  private playbackService = inject(PlaybackService);

  private readonly onPauseSub = this.playbackService
    .onPause()
    .pipe(takeUntilDestroyed())
    .subscribe(() => this.pause());

  playerElRef = viewChild<ElementRef>('audioPlayer');
  player = computed(() => this.playerElRef()?.nativeElement);

  togglePlayPause(): void {
    const wasPlaying = this.isPlaying();

    this.playbackService.pauseAll()

    if (!wasPlaying) {
      this.player()?.play();
      this.isPlaying.set(true);
    }
  }

  pause() {
    this.player()?.pause();
    this.isPlaying.set(false);
  }

  onTimeUpdate(): void {
    this.currentTime.set(this.player()?.currentTime || 0);
  }

  onLoadedMetadata(): void {
    this.duration.set(this.player()?.duration || 0);
  }

  onEnded(): void {
    this.isPlaying.set(false);
  }

  onSeek(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const player = this.player();
    if (player) {
      player.currentTime = +value;
    }
    this.currentTime.set(+value);
  }
}
