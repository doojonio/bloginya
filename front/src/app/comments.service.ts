import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  constructor(private http: HttpClient) {}

  getComments(postId: string) {
    return this.http.get<Comment[]>('/api/comments', {
      params: { post_id: postId },
    });
  }
}

interface Comment {
  id: string;
  created_at: string;
  edited_at: string | null;
  content: string;
  username: string;
  picture: string | null;
  likes: number;
  replies: number;
}
