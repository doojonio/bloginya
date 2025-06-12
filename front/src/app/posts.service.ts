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

  createDraft() {
    return this.http
      .post<{ id: string }>('/api/posts', null)
      .pipe(map((r) => r.id));
  }
}

export interface GetPostResponse {
  id: string;
  user_id: string;
  category_id?: string;
  document: any;
  draft?: any;
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
