import { Component, output } from '@angular/core';
import { AudioService } from '../../services/audio.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-audio-uploader',
  templateUrl: './audio-uploader.component.html',
  styleUrls: ['./audio-uploader.component.scss'],
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressBarModule, MatCardModule],
})
export class AudioUploaderComponent {

  selectedFile: File | null = null;
  uploadProgress: number | null = null;
  uploadMessage: string | null = null;
  fileUploaded = output<string>();

  constructor(private audioService: AudioService) { }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadMessage = null;
      this.uploadProgress = null;
    }
  }

  onUpload(): void {
    if (this.selectedFile) {
      this.uploadProgress = 0;
      this.audioService.upload(this.selectedFile).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          } else if (event instanceof HttpResponse) {
            this.uploadMessage = 'File uploaded successfully!';
            // Assuming the backend returns the filename in the response body
            // For now, I'll use the selected file's name.
            this.fileUploaded.emit(this.selectedFile!.name);
          }
        },
        error: (error) => {
          this.uploadMessage = 'Upload failed!';
          console.error(error);
          this.uploadProgress = null;
        }
      });
    }
  }
}
