import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GetDraftsResponse } from '../drafts.interface';

@Injectable()
export class DraftsService {
  private readonly http = inject(HttpClient);

  getDrafts() {
    return this.http.get<GetDraftsResponse>('/api/posts/drafts');
  }
}
