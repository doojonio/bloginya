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

  getLangPosts(langId: string) {
    return this.home$.pipe(map((res) => res.top_cat_posts));
  }

  getLangs() {
    return this.home$.pipe(map((res) => res.cats));
  }

  get(postId: string) {
    return this.http.get('/api/posts', { params: { id: postId } });
  }
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
