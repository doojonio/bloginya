import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserRoles } from '../../shared/interfaces/user-roles.interface';

@Injectable()
export class UsersService {
  private readonly http = inject(HttpClient);

  getUsers() {
    return this.http.get<GetUsersItem[]>('/api/users/list');
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
