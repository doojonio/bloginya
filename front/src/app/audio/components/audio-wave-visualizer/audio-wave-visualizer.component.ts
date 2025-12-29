import {
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  signal,
} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-audio-wave-visualizer',
  templateUrl: './audio-wave-visualizer.component.html',
  styleUrl: './audio-wave-visualizer.component.scss',
})
export class AudioWaveVisualizerComponent implements OnDestroy {
  audioBlob = input<Blob | null>(null);
  barCount = input<number>(20);
  isPlaying = input<boolean>(false);
  currentTime = input<number>(0);

  audioContext: AudioContext | null = null;
  audioBuffer: AudioBuffer | null = null;
  volumeData = signal<number[]>([]);
  currentBarIndex = signal<number>(-1);

  bars = computed(() => {
    return Array.from({ length: this.barCount() }, (_, i) => i);
  });

  constructor() {
    effect(() => {
      const blob = this.audioBlob();
      if (blob) {
        this.analyzeAudio(blob);
      } else {
        this.volumeData.set([]);
        this.currentBarIndex.set(-1);
      }
    });

    effect(() => {
      const playing = this.isPlaying();
      const time = this.currentTime();
      const data = this.volumeData();

      if (playing && data.length > 0 && this.audioBuffer) {
        const duration = this.audioBuffer.duration;
        const progress = time / duration;
        const barIndex = Math.floor(progress * data.length);
        this.currentBarIndex.set(Math.min(barIndex, data.length - 1));
      } else if (!playing) {
        this.currentBarIndex.set(-1);
      }
    });
  }

  async analyzeAudio(blob: Blob) {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      this.audioContext = new AudioContext();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      const samples = this.audioBuffer.getChannelData(0);
      const sampleRate = this.audioBuffer.sampleRate;
      const duration = this.audioBuffer.duration;
      const samplesPerBar = Math.floor(samples.length / this.barCount());

      const volumes: number[] = [];

      for (let i = 0; i < this.barCount(); i++) {
        const start = i * samplesPerBar;
        const end = Math.min(start + samplesPerBar, samples.length);

        let sum = 0;
        let max = 0;
        for (let j = start; j < end; j++) {
          const abs = Math.abs(samples[j]);
          sum += abs;
          max = Math.max(max, abs);
        }

        // Use RMS (root mean square) for better volume representation
        const rms = Math.sqrt(sum / (end - start));
        // Normalize to 0-1 range
        volumes.push(Math.min(rms * 2, 1));
      }

      this.volumeData.set(volumes);
    } catch (error) {
      console.error('Error analyzing audio:', error);
      // Fallback: create empty bars
      this.volumeData.set(new Array(this.barCount()).fill(0));
    }
  }

  getBarHeight(index: number): number {
    const data = this.volumeData();
    if (data.length === 0) {
      return 0.1; // Minimum height
    }
    const volume = data[index] || 0;
    // Return height as percentage (10% to 100%)
    return Math.max(0.1, volume);
  }

  ngOnDestroy() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

