import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserRoles } from "../../shared/interfaces/entities.interface";
import { API_CONFIG } from '../../app.tokens';

@Injectable()
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_CONFIG);

  getUsers() {
    return this.http.get<GetUsersItem[]>(this.api.backendUrl + '/api/users/list');
  }
}

export interface GetUsersItem {
  id: number;
  username: string;
  email: string;
  role: UserRoles;
  status: string;
  picture: string | null;
  comments_count: number;
  posts_count: number;
  likes_count: number;
  created_at: string;
}
