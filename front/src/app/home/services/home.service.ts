import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, of, shareReplay, switchMap } from 'rxjs';
import { PostDescribed, HomeResponse } from '../home.interface';

@Injectable()
export class HomeService {
  private readonly http = inject(HttpClient);

  private readonly updateHome$ = new BehaviorSubject<boolean>(true);
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

  getHomeCats() {
    return this.home$.pipe(map((res) => res.cats));
  }

  getPostByCategory(catId: string) {
    return this.http.get<PostDescribed[]>('/api/posts/by_category', {
      params: { id: catId },
    });
  }
}
