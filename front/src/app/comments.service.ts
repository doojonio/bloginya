import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  constructor(private http: HttpClient) {}

  getComments(postId: string) {
    return this.http.get<GetCommentResponseItem[]>('/api/comments', {
      params: { post_id: postId },
    });
  }

  addComment(postId: string, content: string, replyId?: string) {
    return this.http.post<string>('/api/comments', {
      post_id: postId,
      reply_to_id: replyId,
      content: content,
    });
  }
}

export interface GetCommentResponseItem {
  id: string;
  created_at: string;
  edited_at: string | null;
  content: string;
  username: string;
  picture: string | null;
  likes: number;
  replies: number;
}
