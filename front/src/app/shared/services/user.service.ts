import { HttpClient } from '@angular/common/http';
import { afterNextRender, inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { AppService } from './app.service';
import { API_CONFIG } from '../../app.tokens';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private app = inject(AppService);
  private readonly api = inject(API_CONFIG);
  private settings$ = this.app.getSettings();

  constructor() {}

  getCurrentUser() {
    return this.settings$.pipe(map((settings) => settings.user));
  }

  goToLogin(callback_uri: string = window.location.href) {
    const uri = new URL(this.api.backendUrl + '/api/oauth/to_google', window.location.origin);
    uri.searchParams.set('callback_uri', callback_uri);
    window.location.href = uri.toString();
  }
}
