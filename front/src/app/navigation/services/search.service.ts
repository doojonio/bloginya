import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable()
export class SearchService {
  private readonly http = inject(HttpClient);

  search(query: string) {
    return this.http.get<QueryResult[]>('/api/search', { params: { query } });
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
