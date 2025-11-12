import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ReadPostResponse } from '../../post/post.interface';
import { LoadCategoryResponse } from './category.service';
import { API_CONFIG } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class ShortnamesService {
  private http = inject(HttpClient);
  private readonly api = inject(API_CONFIG);
  constructor() {}

  getShortname(name: string) {
    return this.http.get<ShortnameResponse>(this.api.backendUrl + '/api/shortnames', {
      params: { name },
    });
  }

  getItemByShortname(name: string) {
    return this.http.get<ItemShortnameResponse>(this.api.backendUrl + '/api/shortnames/item', {
      params: { name },
    });
  }
}

export interface ItemShortnameResponse {
  type: string;
  content: ReadPostResponse | LoadCategoryResponse;
}

export interface ShortnameResponse {
  name: string;
  post_id: string | null;
  category_id: string | null;
}
