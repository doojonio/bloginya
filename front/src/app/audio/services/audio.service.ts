import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.tokens';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private readonly api = inject(API_CONFIG);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = this.api.coolAudioUrl;

  upload(file: File) {
    const formData = new FormData();
    formData.append('audio', file);

    return this.http.post<AudioUploadResponse>(
      `${this.apiUrl}/upload`,
      formData
    );
  }

  uploadAudioBlob(audioBlob: Blob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    return this.http.post<AudioUploadResponse>(
      `${this.apiUrl}/upload`,
      formData
    );
  }

  getAudioUrl(filename: string): string {
    return `${this.apiUrl}/stream/${filename}`;
  }
}

export interface AudioUploadResponse {
  filename: string;
  file_id: string;
}
