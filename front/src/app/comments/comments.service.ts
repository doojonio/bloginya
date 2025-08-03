import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { throwError } from 'rxjs';
import { OkResponse } from '../shared/interfaces/responses.interface';
import { UserService } from '../shared/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  constructor(private http: HttpClient) {}

  private userS = inject(UserService);
  user = toSignal(this.userS.getCurrentUser());

  getComments(postId: string, replyToId?: string) {
    let params = new HttpParams();

    params = params.set('post_id', postId);
    if (replyToId) {
      params = params.set('reply_to_id', replyToId);
    }

    return this.http.get<GetCommentsResponseItem[]>('/api/comments', {
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
    if (!this.user()) {
      this.userS.goToLogin();
      return throwError(() => new Error('User not logged in'));
    }

    return this.http.post<OkResponse>('/api/comments/like', null, {
      params: { id },
    });
  }

  deleteComment(id: string) {
    return this.http.delete<OkResponse>('/api/comments', {
      params: { id },
    });
  }

  blockUser(userId: string) {
    // TODO move to users service
    return this.http.post<OkResponse>('/api/users/block', null, {
      params: { id: userId },
    });
  }
}

export interface GetCommentsResponseItem {
  id: string;
  user_id: string;
  created_at: string;
  edited_at: string | null;
  content: string;
  username: string;
  picture: string | null;
  likes: number;
  liked?: boolean;
  replies: number;
}
