import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { API_CONFIG } from '../../app.config';

@Injectable()
export class NewDraftService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_CONFIG);

  createDraft() {
    return this.http
      .post<{ id: string }>(this.api.backendUrl + '/api/posts/new', null)
      .pipe(map((r) => r.id));
  }
}
