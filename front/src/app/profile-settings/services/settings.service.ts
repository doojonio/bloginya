import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { OkResponse } from '../../shared/interfaces/responses.interface';
import { UserService } from '../../shared/services/user.service';

@Injectable()
export class SettingsService {
  private readonly usersS = inject(UserService);
  private readonly http = inject(HttpClient);

  currentUser$ = this.usersS.getCurrentUser();

  isUsernameTaken(username: string) {
    // its not taken if its taken by current user

    return combineLatest([
      this.currentUser$,
      this.http.get<string | null>('/api/users/is_username_taken', {
        params: { username },
      }),
    ]).pipe(map(([u, takenBy]) => (takenBy ? takenBy !== u?.id : false)));
  }

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
