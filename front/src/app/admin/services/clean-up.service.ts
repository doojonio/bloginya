import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class CleanUpService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_CONFIG);

  estimate() {
    return this.http.get<CleanUpResponse>(this.api.backendUrl + '/api/clean-up/estimate');
  }

  cleanup() {
    return this.http.delete<CleanUpResponse>('/api/clean-up');
  }
}

export interface CleanUpResponse {
  sessions: number;
  files_count: number;
  copies_count: number;
  files_size: number;
}
