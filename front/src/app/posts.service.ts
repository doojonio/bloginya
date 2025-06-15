import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, share } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private http = inject(HttpClient);
  home$: Observable<HomeResponse>;
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

  get(postId: string) {
    return this.http.get<GetPostResponse>('/api/posts', {
      params: { id: postId },
    });
  }

  getForEdit(postId: string) {
    return this.http.get<GetForEditResponse>('/api/posts/for_edit', {
      params: { id: postId },
    });
  }

  updateDraft(postId: string, fields: UpdateDraftPayload) {
    return this.http.put('/api/posts/draft', fields, {
      params: { id: postId },
    });
  }

  applyChanges(id: string, meta: ApplyChangesPayload) {
    return this.http
      .put<{ message: string }>('/api/posts', meta, { params: { id } })
      .pipe(map((_) => 'OK'));
  }

  createDraft() {
    return this.http
      .post<{ id: string }>('/api/posts', null)
      .pipe(map((r) => r.id));
  }

  getCategories() {
    return this.http.get<Category[]>('/api/categories/list');
  }

  addCategory(title: string) {
    return this.http.post<Category>('/api/categories', { title });
  }
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
  description: string;
  enable_likes: boolean;
  enable_comments: boolean;
  tags: string[];
}

export interface GetPostResponse {
  id: string;
  user_id: string;
  category_id?: string;
  document: any;
  status: PostStatuses;
  title: string;
  description?: string;
  picture?: string;
  priority?: number;
  created_at: Date;
  modified_at?: Date;
  published_at?: Date;
  deleted_at?: Date;
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
  picture: string;
  title: string;
  descr: string;
  tags: string[];
}
export interface PopularPost {
  id: string;
  picture: string;
}
export interface NewPost {
  picture: string;
  category_name: string;
  created_at: Date;
  title: string;
  tags: string[];
}
