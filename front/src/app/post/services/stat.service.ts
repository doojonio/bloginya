import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable()
export class StatService {
  private readonly http = inject(HttpClient);

  recordRead(id: string, type: 'short' | 'medium' | 'long') {
    return this.http.post('/api/stat', undefined, {
      params: { post_id: id, view_type: type },
    });
  }

  getViews(id: string) {
    return this.http.get<GetViewsResponse>('/api/stat', {
      params: { post_id: id },
    });
  }
}

export interface GetViewsResponse {
  short_views: number;
  medium_views: number;
  long_views: number;
}
