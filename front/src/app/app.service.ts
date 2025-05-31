import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private breakpointObserver = inject(BreakpointObserver);
  private isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay(1)
    );

  isHandset() {
    return this.isHandset$;
  }

  getAppName() {
    return of('POLYINE');
  }

  getSocials(): Observable<Social[]> {
    return of([
      { href: 'https://facebook.com', icon: 'facebook' },
      { href: 'https://instagram.com', icon: 'instagram' },
      { href: 'https://x.com', icon: 'twitter' },
      { href: 'https://tiktok.com', icon: 'tiktok' },
    ]);
  }

  constructor() {}
}
export interface Social {
  href: string;
  icon: string;
}
