import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private app = inject(AppService);
  private settings$ = this.app.getSettings();

  constructor() {}

  getCurrentUser() {
    return this.settings$.pipe(map((settings) => settings.user));
  }
}
