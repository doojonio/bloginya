import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface PutFileResponse {
  id: string;
}

@Injectable()
export class DriveService {
  constructor(private http: HttpClient) {}

  putFile(postId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('post_id', postId);
    return this.http.post<PutFileResponse>('/api/drive', formData);
  }
}
