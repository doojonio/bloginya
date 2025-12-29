import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { throwError } from 'rxjs';
import { OkResponse } from '../shared/interfaces/responses.interface';
import { UserService } from '../shared/services/user.service';
import { API_CONFIG } from '../app.tokens';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_CONFIG);

  private userS = inject(UserService);
  user = toSignal(this.userS.getCurrentUser());

  getComments(postId: string, replyToId?: string) {
    let params = new HttpParams();

    params = params.set('post_id', postId);
    if (replyToId) {
      params = params.set('reply_to_id', replyToId);
    }

    return this.http.get<GetCommentsResponseItem[]>(
      this.api.backendUrl + '/api/comments',
      {
        params,
      }
    );
  }

  addComment(postId: string, content: string, replyId?: string, uploadId?: string) {
    const payload: any = {
      post_id: postId,
      reply_to_id: replyId,
      content: content,
    };

    if (uploadId) {
      payload.upload_id = uploadId;
    }

    return this.http.post<string>(this.api.backendUrl + '/api/comments', payload);
  }

  unlike(id: string) {
    return this.http.delete<OkResponse>(
      this.api.backendUrl + '/api/comments/like',
      {
        params: { id },
      }
    );
  }
  like(id: string) {
    if (!this.user()) {
      this.userS.goToLogin();
      return throwError(() => new Error('User not logged in'));
    }

    return this.http.post<OkResponse>(
      this.api.backendUrl + '/api/comments/like',
      null,
      {
        params: { id },
      }
    );
  }

  deleteComment(id: string) {
    return this.http.delete<OkResponse>(this.api.backendUrl + '/api/comments', {
      params: { id },
    });
  }

  blockUser(userId: string) {
    // TODO move to users service
    return this.http.post<OkResponse>(
      this.api.backendUrl + '/api/users/block',
      null,
      {
        params: { id: userId },
      }
    );
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
  audio_upload_id?: string | null;
}
