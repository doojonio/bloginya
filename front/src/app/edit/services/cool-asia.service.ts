import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { API_CONFIG } from '../../app.config';

@Injectable()
export class CoolAsiaService {
  private http = inject(HttpClient);
  private readonly api = inject(API_CONFIG);

  constructor() {}

  getHiraganas(texts: string[]) {
    return this.http
      .post<GetHiraganaResponse>(this.api.coolAsiaUrl + '/hiragana', { texts })
      .pipe(map((res) => res.hiraganas));
  }

  getPinyins(texts: string[]) {
    return this.http
      .post<GetPinyinResponse>(this.api.coolAsiaUrl + '/pinyin', { texts })
      .pipe(map((res) => res.pinyins));
  }
}

export interface GetHiraganaResponse {
  hiraganas: string[];
}

export interface GetPinyinResponse {
  pinyins: string[];
}
