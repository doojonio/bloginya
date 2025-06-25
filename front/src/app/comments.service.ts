import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  constructor(private http: HttpClient) {}

  getComments(postId: string, comId?: string) {
    let params = new HttpParams();

    params = params.set('post_id', postId);
    if (comId) {
      params = params.set('comment_id', comId);
    }

    return this.http.get<GetCommentResponseItem[]>('/api/comments', {
      params,
    });
  }

  addComment(postId: string, content: string, replyId?: string) {
    return this.http.post<string>('/api/comments', {
      post_id: postId,
      reply_to_id: replyId,
      content: content,
    });
  }

  unlike(id: string) {
    return this.http.delete<OkResponse>('/api/comments/like', {
      params: { id },
    });
  }
  like(id: string) {
    return this.http.post<OkResponse>('/api/comments/like', null, {
      params: { id },
    });
  }
}

export interface OkResponse {
  message: 'OK';
}

export interface GetCommentResponseItem {
  id: string;
  created_at: string;
  edited_at: string | null;
  content: string;
  username: string;
  picture: string | null;
  likes: number;
  liked?: boolean;
  replies: number;
}
