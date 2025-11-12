import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.config';

@Injectable()
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_CONFIG);

  search(query: string) {
    return this.http.get<QueryResult[]>(this.api.backendUrl + '/api/search', { params: { query } });
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
