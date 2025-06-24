import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, map, Observable, share, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private http = inject(HttpClient);
  home$: Observable<HomeResponse>;

  private snackBar = inject(MatSnackBar);
  // request to home: GET /api/posts/home
  //

  constructor() {
    this.home$ = this.http.get<HomeResponse>('/api/posts/home').pipe(share());
  }

  updateHome() {
    this.home$ = this.http.get<HomeResponse>('/api/posts/home').pipe(share());
  }

  getPopularPosts() {
    return this.home$.pipe(map((res) => res.popular_posts));
  }

  getNewPosts() {
    return this.home$.pipe(map((res) => res.new_posts));
  }

  getHomeCatPosts(catId: string) {
    return this.home$.pipe(
      map((res) => {
        if (res.top_cat.id == catId) {
          return res.top_cat.posts || [];
        }

        return [];
      })
    );
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

  getCategoryByTitle(title: string) {
    return this.http.get<Category>('/api/categories/by_title', {
      params: { title },
    });
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
    if (err == PostServiceErrors.UNDEF) {
      this.snackBar.open('Unknown error', 'Close', config);
    } else if (err == PostServiceErrors.NORIGHT) {
      this.snackBar.open('Forbidden', 'Close', config);
    } else if (err == PostServiceErrors.NOCAT) {
      this.snackBar.open('Missing category', 'Close', config);
    }

    return err;
  }

  private mapError(error: HttpErrorResponse) {
    const message = error.error?.message;
    if (message == 'NOCAT') {
      return PostServiceErrors.NOCAT;
    } else if (message == 'NORIGHT') {
      return PostServiceErrors.NORIGHT;
    }
    return PostServiceErrors.UNDEF;
  }

  readPost(id: string) {
    return this.http.get<ReadPostResponse>('/api/posts', { params: { id } });
  }

  getCategories() {
    return this.http.get<Category[]>('/api/categories/list');
  }

  addCategory(cat: AddCategoryPayload, notifyError = true) {
    return this.http
      .post<AddCategoryResponse>('/api/categories', cat)
      .pipe(
        catchError((err: HttpErrorResponse) =>
          throwError(() =>
            notifyError ? this.notifyError(err) : this.mapError(err)
          )
        )
      );
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

export enum PostServiceErrors {
  UNDEF,
  NOCAT,
  NORIGHT,
}

export interface OkResponse {
  message: 'OK';
}

export interface AddCategoryPayload {
  title: string;
  description: string | null;
  parent_id?: string | null;
  priority?: number | null;
}

export interface AddCategoryResponse {
  id: string;
  title: string;
}

export interface ReadPostResponse {
  id: string;
  title: string;
  document: any;
  enable_likes: boolean;
  enable_comments: boolean;
  date: string;
  pics: number;
  ttr: number;
  category_id: string | null;
  category_title: string | null;
  picture_wp: string | null;
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
  picture_pre: string;
  title: string;
  descr: string;
  tags: string[];
}
export interface PopularPost {
  id: string;
  picture_pre: string;
}
export interface NewPost {
  picture_pre: string;
  category_name: string;
  created_at: Date;
  title: string;
  tags: string[];
}

export interface PostMed {
  title: string;
  id: string;
  shortname: string | null;
  picture_pre: string | null;
  description: string | null;
  tags: string[];
}