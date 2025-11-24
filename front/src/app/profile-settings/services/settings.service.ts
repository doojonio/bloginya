import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { OkResponse } from '../../shared/interfaces/responses.interface';
import { UserService } from '../../shared/services/user.service';
import { API_CONFIG } from '../../app.tokens';

@Injectable()
export class SettingsService {
  private readonly usersS = inject(UserService);
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_CONFIG);

  currentUser$ = this.usersS.getCurrentUser();

  isUsernameTaken(username: string) {
    // its not taken if its taken by current user

    return combineLatest([
      this.currentUser$,
      this.http.get<string | null>(this.api.backendUrl + '/api/users/is_username_taken', {
        params: { username },
      }),
    ]).pipe(map(([u, takenBy]) => (takenBy ? takenBy !== u?.id : false)));
  }

  saveSettings(value: SaveSettingsPayload) {
    return this.http.put<OkResponse>(this.api.backendUrl + '/api/users/settings', value);
  }

  getSettings() {
    return this.http.get<GetSettingsResponse>(this.api.backendUrl + '/api/users/settings');
  }
}

export interface SaveSettingsPayload {
  username: string;
}

export interface GetSettingsResponse {
  username: string;
}
