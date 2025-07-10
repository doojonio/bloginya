import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface PutFileResponse {
  id: string;
}

@Injectable({
  providedIn: 'root',
})
export class DriveService {
  constructor(private http: HttpClient) {}

  putFile(postId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('post_id', postId);
    return this.http.post<PutFileResponse>('/api/drive', formData);
  }
}

export function pic(driveId: string) {
  const parts = driveId.split('/');
  if (parts.length < 5) {
    throw 'drive id';
  }
  return parts.slice(0, 5).join('/');
}

export function variant(driveId: string | null, variant: VARIANT) {
  if (driveId == null || driveId == '') {
    return null;
  }
  return driveId + '?d=' + variant;
}

export type VARIANT =
  | 'thumbnail'
  | 'pre140'
  | 'pre280'
  | 'pre450'
  | 'medium'
  | 'large'
  | 'original';
