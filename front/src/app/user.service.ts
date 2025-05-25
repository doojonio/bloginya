import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CdataService, User } from './cdata.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null | undefined>(
    undefined,
  );

  constructor(private cdataService: CdataService) {
    cdataService
      .getCommonData()
      .pipe(map((cdata) => cdata?.user))
      .subscribe((user) => this.currentUserSubject.next(user || null));
  }

  getCurrentUser() {
    return this.currentUserSubject.asObservable();
  }
}
