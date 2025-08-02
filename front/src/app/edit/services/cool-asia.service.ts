import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable()
export class CoolAsiaService {
  private http = inject(HttpClient);

  constructor() {}

  getHiraganas(texts: string[]) {
    return this.http
      .post<GetHiraganaResponse>('/api/cool_asia/hiragana', { texts })
      .pipe(map((res) => res.hiraganas));
  }

  getPinyins(texts: string[]) {
    return this.http
      .post<GetPinyinResponse>('/api/cool_asia/pinyin', { texts })
      .pipe(map((res) => res.pinyins));
  }
}

export interface GetHiraganaResponse {
  hiraganas: string[];
}

export interface GetPinyinResponse {
  pinyins: string[];
}
