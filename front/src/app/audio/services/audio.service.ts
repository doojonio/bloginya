import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AudioService {
  private apiUrl = '/api/audio';

  constructor(private http: HttpClient) {}

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
