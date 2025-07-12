import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  BehaviorSubject,
  catchError,
  map,
  of,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';
import { ServiceErrors } from '../interfaces/service-errors';
import { VARIANT, variant } from './drive.service';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly http = inject(HttpClient);

  getDrafts() {
    return this.http.get<DraftsResponse>('/api/posts/drafts');
  }

  private updateHome$ = new BehaviorSubject<boolean>(true);
  home$ = this.updateHome$.pipe(
    switchMap((_) =>
      this.http.get<HomeResponse>('/api/posts/home', {
        params: { category_tag: 'langs' },
      })
    ),
    shareReplay(1)
  );

  updateHome() {
    this.updateHome$.next(true);
  }

  private snackBar = inject(MatSnackBar);

  getPopularPosts() {
    return this.home$.pipe(map((res) => res.popular_posts));
  }

  getNewPosts() {
    return this.home$.pipe(map((res) => res.new_posts));
  }

  getHomeCatPosts(catId: string) {
    return this.home$.pipe(
      switchMap((res) => {
        if (res.top_cat.id == catId) {
          return of(res.top_cat.posts || []);
        }
        return this.getPostByCategory(catId);
      })
    );
  }

  getPostByCategory(catId: string) {
    return this.http.get<CatPost[]>('/api/posts/by_category', {
      params: { id: catId },
    });
  }

  getHomeCats() {
    return this.home$.pipe(map((res) => res.cats));
  }

  createDraft() {
    return this.http
      .post<{ id: string }>('/api/posts/new', null)
      .pipe(map((r) => r.id));
  }

  getForEdit(postId: string) {
    return this.http.get<GetForEditResponse>('/api/posts/for_edit', {
      params: { id: postId },
    });
  }

  updateDraft(postId: string, fields: UpdateDraftPayload, notifyError = true) {
    return this.http
      .put('/api/posts/draft', fields, {
        params: { id: postId },
      })
      .pipe(
        catchError((err: HttpErrorResponse) =>
          throwError(() =>
            notifyError ? this.notifyError(err) : this.mapError(err)
          )
        )
      );
  }

  applyChanges(id: string, meta: ApplyChangesPayload, notifyError = true) {
    return this.http
      .put<{ message: string }>('/api/posts', meta, { params: { id } })
      .pipe(
        catchError((err: HttpErrorResponse) =>
          throwError(() =>
            notifyError ? this.notifyError(err) : this.mapError(err)
          )
        ),
        map((_) => 'OK')
      );
  }

  getSimilliarPosts(id: string) {
    return this.http.get<PostMed[]>('/api/posts/similliar', {
      params: { id },
    });
  }

  private notifyError(httpErr: HttpErrorResponse) {
    const err = this.mapError(httpErr);
    // TODO: global config or service?
    const config = { duration: 5000 };
    if (err == ServiceErrors.UNDEF) {
      this.snackBar.open('Unknown error', 'Close', config);
    } else if (err == ServiceErrors.NORIGHT) {
      this.snackBar.open('Forbidden', 'Close', config);
    } else if (err == ServiceErrors.NOCAT) {
      this.snackBar.open('Missing category', 'Close', config);
    }

    return err;
  }

  private mapError(error: HttpErrorResponse) {
    const message = error.error?.message;
    if (message == 'NOCAT') {
      return ServiceErrors.NOCAT;
    } else if (message == 'NORIGHT') {
      return ServiceErrors.NORIGHT;
    }
    return ServiceErrors.UNDEF;
  }

  readPost(id: string) {
    return this.http.get<ReadPostResponse>('/api/posts', { params: { id } });
  }

  unlike(id: string) {
    return this.http.delete<OkResponse>('/api/posts/like', { params: { id } });
  }
  like(id: string) {
    return this.http.post<OkResponse>('/api/posts/like', null, {
      params: { id },
    });
  }
}

export function picStyle(driveId: string | null, varName: VARIANT) {
  if (driveId == null) {
    return 'rgb(117, 85, 112)';
  }

  return 'url(' + variant(driveId, varName) + ') center / cover no-repeat';
}

export interface OkResponse {
  message: 'OK';
}

export interface ReadPostResponse {
  id: string;
  name: string | null;
  title: string;
  document: any;
  description: string;
  enable_likes: boolean;
  enable_comments: boolean;
  date: string;
  pics: number;
  ttr: number;
  category_name: string | null;
  category_id: string | null;
  category_title: string | null;
  picture_wp: string | null;
  picture_pre: string | null;
  tags: string[];
  comments?: number;
  liked?: boolean;
  likes?: number;
  views?: number;
}

export interface UpdateDraftPayload {
  title?: string;
  document?: any;
  picture_wp?: string | null;
  picture_pre?: string | null;
}

export interface ApplyChangesPayload {
  tags: string[];
  status: PostStatuses;
  category_id: string | null;
  shortname: string | null;
  enable_likes: boolean;
  enable_comments: boolean;
}

export interface GetForEditResponse {
  user_id: string;
  category_id: string | null;
  title: string;
  document: any;
  picture_wp: string | null;
  picture_pre: string | null;
  status: PostStatuses;
  shortname: string | null;
  description: string;
  enable_likes: boolean;
  enable_comments: boolean;
  tags: string[];
}

export enum PostStatuses {
  Draft = 'draft',
  Pub = 'pub',
  Del = 'del',
}

export interface HomeResponse {
  new_posts: NewPost[];
  cats: Category[];
  top_cat: Category;
  top_cat_posts: CatPost[];
  popular_posts: PopularPost[];
}

export interface Category {
  id: string;
  title: string;
  name: string;
  // only in top cat
  posts?: CatPost[];
}
export interface CatPost {
  id: string;
  name: string | null;
  picture_pre: string;
  title: string;
  description: string;
  tags: string[];
}
export interface PopularPost {
  id: string;
  name: string | null;
  picture_pre: string;
}
export interface NewPost {
  id: string;
  name: string | null;
  picture_pre: string;
  category_title: string;
  category_name: string;
  category_id: string;
  created_at: Date;
  title: string;
  tags: string[];
}

export interface PostMed {
  title: string;
  id: string;
  name: string | null;
  picture_pre: string | null;
  description: string | null;
  tags: string[];
}

export interface DraftsResponse {
  drafts: Draft[];
  continue_edit: Draft[];
}

export interface Draft {
  id: string;
  name: null;
  picture_pre: string | null;
  title: string;
  created_date: string;
  draft_id: string | null;
}
