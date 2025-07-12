import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly http = inject(HttpClient);

  createDraft() {
    return this.http
      .post<{ id: string }>('/api/posts/new', null)
      .pipe(map((r) => r.id));
  }
}


