import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable()
export class CoolAsiaService {
  private http = inject(HttpClient);

  constructor() {}

  getHiragana(text: string) {
    return this.http
      .get<GetHiraganaResponse>('/api/cool_asia/hiragana', { params: { text } })
      .pipe(map((res) => res.hiragana));
  }

  getPinyin(text: string) {
    return this.http
      .get<GetPinyinResponse>('/api/cool_asia/pinyin', { params: { text } })
      .pipe(map((res) => res.pinyin));
  }
}

export interface GetHiraganaResponse {
  hiragana: string;
}

export interface GetPinyinResponse {
  pinyin: string;
}
