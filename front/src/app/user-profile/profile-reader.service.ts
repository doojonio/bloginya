import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  UserRoles,
  UserStatuses,
} from '../shared/interfaces/user-roles.interface';

@Injectable()
export class ProfileReaderService {
  private readonly http = inject(HttpClient);

  getUser(userId: string) {
    return this.http.get<GetUserResponse>(`/api/users/profile`, {
      params: { id: userId },
    });
  }
}

export interface GetUserResponse {
  id: string;
  username: string;
  picture: string;
  created_at: string;
  status: UserStatuses;
  role: UserRoles;
  posts: {
    id: string;
    name: string | null;
    title: string;
    description: string;
    tags: string[];
    picture_pre: string;
    created_at: string;
  }[];
  comments: {
    id: string;
    post_id: string;
    post_name: string | null;
    post_title: string;
    content: string;
    created_at: string;
  }[];
}
