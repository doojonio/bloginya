import { Component, signal } from '@angular/core';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-record-voice',
  templateUrl: './record-voice.component.html',
  styleUrls: ['./record-voice.component.scss'],
  standalone: false,
})
export class RecordVoiceComponent {
  mediaRecorder: MediaRecorder | undefined;
  audioChunks: Blob[] = [];
  audioUrl = signal<string | undefined>(undefined);
  isRecording = signal(false);
  audioBlob: Blob | undefined;

  constructor(private audioService: AudioService) {}

  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();
      this.isRecording.set(true);

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };
    });
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.onstop = () => {
        this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioUrl.set(URL.createObjectURL(this.audioBlob));
        this.audioChunks = [];
      };
      this.mediaRecorder.stop();
      this.isRecording.set(false);
    }
  }

  playRecording() {
    const audio = new Audio(this.audioUrl());
    audio.play();
  }

  uploadRecording() {
    if (this.audioBlob) {
      this.audioService.uploadAudioBlob(this.audioBlob).subscribe(
        (response) => console.log('Upload successful', response),
        (error) => console.error('Upload failed', error)
      );
    }
  }
}
