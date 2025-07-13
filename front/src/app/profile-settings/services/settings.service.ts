import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { OkResponse } from '../../shared/interfaces/responses.interface';

@Injectable()
export class SettingsService {
  private http = inject(HttpClient);

  saveSettings(value: SaveSettingsPayload) {
    return this.http.put<OkResponse>('/api/users/settings', value);
  }

  getSettings() {
    return this.http.get<GetSettingsResponse>('/api/users/settings');
  }
}

export interface SaveSettingsPayload {
  username: string;
}

export interface GetSettingsResponse {
  username: string;
}
