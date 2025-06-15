import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Toolbar } from 'ngx-editor';
import { BehaviorSubject, map, Observable, of, share, shareReplay } from 'rxjs';
import { Category, PostStatuses } from './posts.service';

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

  private isShowingToolbarTitle$ = new BehaviorSubject(
    window.location.pathname != '/'
  );

  private http = inject(HttpClient);
  private settings$ = this.http
    .get<SettingsResponse>('/api/settings')
    .pipe(share());

  isHandset() {
    return this.isHandset$;
  }

  getAppName() {
    return of('POLYINE');
  }

  isShowingToolbarTitle() {
    return this.isShowingToolbarTitle$.asObservable();
  }

  setIsShowingToolbarTitle(val: boolean) {
    this.isShowingToolbarTitle$.next(val);
  }

  getSocials(): Observable<Social[]> {
    return of([
      { href: 'https://facebook.com', icon: 'facebook' },
      { href: 'https://instagram.com', icon: 'instagram' },
      { href: 'https://x.com', icon: 'twitter' },
      { href: 'https://tiktok.com', icon: 'tiktok' },
    ]);
  }

  getSettings() {
    return this.settings$;
  }

  getEditorToolbar() {
    return of<Toolbar>([
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'ordered_list', 'bullet_list'],
      [{ heading: ['h1', 'h2', 'h3'] }],
      ['text_color', 'background_color'],
      ['link'],
      ['align_left', 'align_center', 'align_right', 'align_justify'],
    ]);
  }

  getPostStatuses() {
    const statuses = [];
    for (const [k, v] of Object.entries(PostStatuses)) {
      statuses.push(v);
    }
    return of(statuses);
  }

  getEditorColorPallete() {
    return of([
      'var(--mat-sys-primary)',
      'var(--mat-sys-on-primary)',
      'var(--mat-sys-on-surface)',
      'var(--mat-sys-error)',
      'var(--mat-sys-on-error)',
      'var(--mat-sys-primary-container)',
      'var(--mat-sys-on-primary-container)',
      'var(--mat-sys-secondary)',
      'var(--mat-sys-on-secondary)',
      'var(--mat-sys-secondary-container)',
      'var(--mat-sys-on-secondary-container)',
      'var(--mat-sys-tertiary)',
      'var(--mat-sys-on-tertiary)',
      'var(--mat-sys-tertiary-container)',
      'var(--mat-sys-on-tertiary-container)',
      'var(--mat-sys-error-container)',
      'var(--mat-sys-on-error-container)',
      // FIXED colors
      'var(--mat-sys-primary-fixed)',
      'var(--mat-sys-on-primary-fixed)',
      'var(--mat-sys-primary-fixed-dim)',
      'var(--mat-sys-on-primary-fixed)',
      'var(--mat-sys-secondary-fixed)',
      'var(--mat-sys-on-secondary-fixed)',
      'var(--mat-sys-secondary-fixed-dim)',
      'var(--mat-sys-on-secondary-fixed)',
      'var(--mat-sys-tertiary-fixed)',
      'var(--mat-sys-on-tertiary-fixed)',
      'var(--mat-sys-tertiary-fixed-dim)',
      'var(--mat-sys-on-tertiary-fixed)',
    ]);
  }

  constructor() {}
}
export interface Social {
  href: string;
  icon: string;
}

export interface SettingsResponse {
  user: SettingsUser;
  categories: Category;
  socials: Social;
}

export interface SettingsUser {}
