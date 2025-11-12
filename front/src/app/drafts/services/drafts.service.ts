import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GetDraftsResponse } from '../drafts.interface';
import { API_CONFIG } from '../../app.config';

@Injectable()
export class DraftsService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_CONFIG);

  getDrafts() {
    return this.http.get<GetDraftsResponse>(this.api.backendUrl + '/api/posts/drafts');
  }
}
