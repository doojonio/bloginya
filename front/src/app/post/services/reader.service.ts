import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { PostMed } from '../../shared/components/post-med/post-med.component';
import { ReadPostResponse } from '../post.interface';

@Injectable({
  providedIn: 'root',
})
export class ReaderService {
  private readonly router = inject(Router);

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
    return this.http
      .get<ReadPostResponse>('/api/posts', { params: { id } })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status == 404) {
            this.router.navigate(['/', 'not-found']);
          }

          throw err;
        })
      );
  }
}

export interface GetLikedUsersItem {
  id: string;
  username: string;
  picture: string;
}
