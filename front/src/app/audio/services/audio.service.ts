import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private apiUrl = '/api/audio';

  constructor(private http: HttpClient) { }

  upload(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('audio', file);

    const req = new HttpRequest('POST', `${this.apiUrl}/upload`, formData, {
      reportProgress: true,
      responseType: 'text'
    });

    return this.http.request(req);
  }

  uploadAudioBlob(audioBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    return this.http.post(`${this.apiUrl}/upload`, formData, { responseType: 'text' });
  }

  getAudioUrl(filename: string): string {
    return `${this.apiUrl}/stream/${filename}`;
  }
}