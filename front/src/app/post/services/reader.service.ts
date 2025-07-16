import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PostMed } from '../../shared/components/post-med/post-med.component';
import { ReadPostResponse } from '../post.interface';

@Injectable({
  providedIn: 'root',
})
export class ReaderService {
  getLikedUsers(postId: string) {
    return this.http.get<GetLikedUsersItem[]>('/api/posts/liked_users', {
      params: { id: postId },
    });
  }

  private readonly http = inject(HttpClient);
  getSimilliarPosts(id: string) {
    return this.http.get<PostMed[]>('/api/posts/similliar', {
      params: { id },
    });
  }

  readPost(id: string) {
    return this.http.get<ReadPostResponse>('/api/posts', { params: { id } });
  }
}

export interface GetLikedUsersItem {
  id: string;
  name: string;
  picture: string;
}
