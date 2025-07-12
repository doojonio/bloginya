import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DraftsResponse } from '../drafts.interface';

@Injectable()
export class DraftsService {
  private readonly http = inject(HttpClient);

  getDrafts() {
    return this.http.get<DraftsResponse>('/api/posts/drafts');
  }
}
