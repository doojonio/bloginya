import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ReadPostResponse } from './posts.service';
import { Category } from './category/category/category.component';

@Injectable({
  providedIn: 'root',
})
export class ShortnamesService {
  private http = inject(HttpClient);
  constructor() {}

  getShortname(name: string) {
    return this.http.get<ShortnameResponse>('/api/shortnames', {
      params: { name },
    });
  }

  getItemByShortname(name: string) {
    return this.http.get<ItemShortnameResponse>('/api/shortnames/item', {
      params: { name },
    });
  }
}

export interface ItemShortnameResponse {
  type: string;
  content: ReadPostResponse | Category;
}

export interface ShortnameResponse {
  name: string;
  post_id: string | null;
  category_id: string | null;
}
