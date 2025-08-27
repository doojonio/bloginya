import { Component } from '@angular/core';
import { AudioUploaderComponent } from '../audio-uploader/audio-uploader.component';
import { AudioPlayerComponent } from '../audio-player/audio-player.component';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { RecordVoiceComponent } from '../record-voice/record-voice.component';

@Component({
  selector: 'app-audio-container',
  templateUrl: './audio-container.component.html',
  styleUrls: ['./audio-container.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, AudioUploaderComponent, AudioPlayerComponent, RecordVoiceComponent],
})
export class AudioContainerComponent {
  uploadedFilename: string | null = null;

  onFileUploaded(filename: string): void {
    this.uploadedFilename = filename;
  }
}
