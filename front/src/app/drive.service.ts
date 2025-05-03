import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface PutFileResponse {
  path: string;
}

@Injectable({
  providedIn: 'root',
})
export class DriveService {
  constructor(private http: HttpClient) {}

  putFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<PutFileResponse>('/api/drive', formData);
  }
}
