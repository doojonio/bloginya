import {
  Component,
  OnDestroy,
  output,
  signal,
} from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-audio-recording-block',
  templateUrl: './audio-recording-block.component.html',
  styleUrl: './audio-recording-block.component.scss',
})
export class AudioRecordingBlockComponent implements OnDestroy {
  // Outputs
  onStop = output<void>();
  onDelete = output<void>();

  // State
  isRecording = signal(false);
  recordedSeconds = signal(0);
  maxRecordingSeconds = 120; // 2 minutes
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  recordedAudio: Blob | null = null;
  recordingTimer: any = null;
  audioContext: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  animationFrameId: number | null = null;
  isStopping = signal(false);

  // Playback state
  audioPlayer: HTMLAudioElement | null = null;
  isPlaying = signal(false);
  currentPlaybackTime = signal(0);
  playbackTimeInterval: any = null;

  async startRecording() {
    // Prevent starting if already recording or if there's already a recording
    if (this.isRecording() || this.recordedAudio) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up audio context for visualization
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      // Set up MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        // Only update if not already set (to prevent overwriting)
        if (!this.recordedAudio && this.audioChunks.length > 0) {
          this.recordedAudio = new Blob(this.audioChunks, { type: 'audio/webm' });
        }
        this.isStopping.set(false);
        stream.getTracks().forEach(track => track.stop());
        if (this.audioContext) {
          this.audioContext.close();
          this.audioContext = null;
        }
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.recordedSeconds.set(0);

      // Start timer
      this.recordingTimer = setInterval(() => {
        const seconds = this.recordedSeconds() + 1;
        this.recordedSeconds.set(seconds);

        // Auto-stop at 1 minute 59 seconds (119 seconds)
        if (seconds >= this.maxRecordingSeconds - 1) {
          this.stopRecording();
        }
      }, 1000);

      // Start visualization
      this.visualizeAudio();
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording()) {
      this.isStopping.set(true);
      this.mediaRecorder.stop();
      this.isRecording.set(false);

      if (this.recordingTimer) {
        clearInterval(this.recordingTimer);
        this.recordingTimer = null;
      }

      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      // Set recordedAudio immediately from chunks to prevent UI flicker
      if (this.audioChunks.length > 0) {
        this.recordedAudio = new Blob(this.audioChunks, { type: 'audio/webm' });
      }

      this.onStop.emit();
    }
  }

  deleteRecording() {
    this.stopPlayback();
    this.recordedAudio = null;
    this.audioChunks = [];
    this.recordedSeconds.set(0);
    this.onDelete.emit();
  }

  togglePlayback() {
    if (!this.recordedAudio) {
      return;
    }

    if (this.isPlaying()) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }

  startPlayback() {
    if (!this.recordedAudio) {
      return;
    }

    // Create audio URL from blob
    const audioUrl = URL.createObjectURL(this.recordedAudio);
    this.audioPlayer = new Audio(audioUrl);

    this.audioPlayer.ontimeupdate = () => {
      if (this.audioPlayer) {
        this.currentPlaybackTime.set(this.audioPlayer.currentTime);
      }
    };

    this.audioPlayer.onended = () => {
      this.isPlaying.set(false);
      this.currentPlaybackTime.set(0);
      if (this.playbackTimeInterval) {
        clearInterval(this.playbackTimeInterval);
        this.playbackTimeInterval = null;
      }
      if (this.audioPlayer) {
        URL.revokeObjectURL(audioUrl);
        this.audioPlayer = null;
      }
    };

    this.audioPlayer.onerror = () => {
      console.error('Error playing audio');
      this.isPlaying.set(false);
      if (this.audioPlayer) {
        URL.revokeObjectURL(audioUrl);
        this.audioPlayer = null;
      }
    };

    this.audioPlayer.play().then(() => {
      this.isPlaying.set(true);
      this.currentPlaybackTime.set(0);
    }).catch((error) => {
      console.error('Error playing audio:', error);
      this.isPlaying.set(false);
      this.currentPlaybackTime.set(0);
      if (this.audioPlayer) {
        URL.revokeObjectURL(audioUrl);
        this.audioPlayer = null;
      }
    });
  }

  stopPlayback() {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
      const audioUrl = this.audioPlayer.src;
      this.audioPlayer = null;
      URL.revokeObjectURL(audioUrl);
      this.isPlaying.set(false);
      this.currentPlaybackTime.set(0);
    }
    if (this.playbackTimeInterval) {
      clearInterval(this.playbackTimeInterval);
      this.playbackTimeInterval = null;
    }
  }

  visualizeAudio() {
    if (!this.analyser || !this.isRecording()) {
      return;
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // Update visualization (this will be handled by the template)
    this.animationFrameId = requestAnimationFrame(() => this.visualizeAudio());
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getRecordedAudio(): Blob | null {
    return this.recordedAudio;
  }

  isRecordingActive(): boolean {
    return this.isRecording();
  }

  ngOnDestroy() {
    if (this.isRecording()) {
      this.stopRecording();
    }
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
    }
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.stopPlayback();
    if (this.playbackTimeInterval) {
      clearInterval(this.playbackTimeInterval);
    }
  }
}

