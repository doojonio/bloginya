import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { OkResponse } from '../../shared/interfaces/responses.interface';

@Injectable()
export class LikerService {
  private readonly http = inject(HttpClient);

  unlike(id: string) {
    return this.http.delete<OkResponse>('/api/posts/like', { params: { id } });
  }
  like(id: string) {
    return this.http.post<OkResponse>('/api/posts/like', null, {
      params: { id },
    });
  }
}
