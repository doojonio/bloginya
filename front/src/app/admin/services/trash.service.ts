import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.config';

@Injectable()
export class TrashService {
  private readonly api = inject(API_CONFIG);
  private readonly http = inject(HttpClient);

  getTrash() {
    return this.http.get<TrashResponse>(this.api.backendUrl + '/api/trash');
  }
}

export interface TrashResponse {
  deleted_comments: CommentItem[];
  deleted_posts: PostItem[];
}

export interface CommentItem {
  id: string;
  user_id: string;
  username: string;
  user_picture: string | null;
  post_title: string;
  post_id: string;
  post_name: string | null;
  content: string;
  created_at: string;
}

export interface PostItem {
  id: string;
  name: string | null;
  title: string;
  picture_pre: string | null;
  created_at: string;
  description: string;
  tags: string[];
}
