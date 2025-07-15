import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { HomeResponse, PostDescribed } from '../home.interface';

@Injectable()
export class HomeService {
  private readonly http = inject(HttpClient);
  private readonly updateHome$ = new BehaviorSubject<boolean>(true);
  private readonly catsCache = signal({});

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
    this.catsCache.set({});
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
    const cached = (this.catsCache() as any)[catId];
    if (cached) {
      return of(cached);
    }
    return this.http
      .get<PostDescribed[]>('/api/posts/by_category', {
        params: { id: catId },
      })
      .pipe(
        tap((posts) => {
          this.catsCache.update((cache) => ({ ...cache, [catId]: posts }));
        })
      );
  }
}
