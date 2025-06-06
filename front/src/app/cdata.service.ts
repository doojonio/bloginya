import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CommonData {
  collections: TopCollection[];
  user: User | null;
}

export interface User {
  picture: string;
}
export interface TopCollection {
  id: string;
  title: string;
  short: string | null;
}

const defaultCommonData: CommonData = {
  collections: [],
  user: null,
};

@Injectable({
  providedIn: 'root',
})
export class CdataService {
  private commonDataSubject = new BehaviorSubject<CommonData | undefined>(
    undefined,
  );

  constructor(private http: HttpClient) {
    this.fetchCommonData();
  }

  getCommonData() {
    return this.commonDataSubject.asObservable();
  }

  private fetchCommonData() {
    // this.http
    //   .get<CommonData>('/api/cdata')
    //   .subscribe((commonData) => this.commonDataSubject.next(commonData));
  }
}
