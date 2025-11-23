import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { API_CONFIG } from '../../app.config';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_CONFIG);
  private readonly searchAsks$ = new Subject<string>();

  search(query: string) {
    return this.http.get<QueryResult[]>(this.api.backendUrl + '/api/search', {
      params: { query },
    });
  }

  askSearch(query: string) {
    this.searchAsks$.next(query);
  }
  getSearchAsks() {
    return this.searchAsks$.asObservable();
  }
}

export interface QueryResult {
  id: string;
  name: string | null;

  type: 'post' | 'category';

  picture_pre: string | null;
  title: string;
  description: string;
}
