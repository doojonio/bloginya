import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.config';

export interface PutFileResponse {
  id: string;
}

@Injectable()
export class DriveService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_CONFIG);

  putFile(postId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('post_id', postId);
    return this.http.post<PutFileResponse>(this.api.backendUrl + '/api/drive', formData);
  }
}
