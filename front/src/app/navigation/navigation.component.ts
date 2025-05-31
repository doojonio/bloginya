import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import {
  CollectionsService,
  ListCollectionsResponse,
  ListCollectionsResponseItem,
} from '../collections.service';
import { TopCollection, User } from '../cdata.service';
import { UserService } from '../user.service';
import { Router, RouterModule } from '@angular/router';

export interface Social {
  href: string;
  icon: string;
}

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    RouterModule,
  ],
})
export class NavigationComponent implements OnInit {
  private collService = inject(CollectionsService);
  private userService = inject(UserService);

  socials: Social[] = [
    {"href": "https://facebook.com", "icon": "facebook"},
    {"href": "https://instagram.com", "icon": "instagram"},
    {"href": "https://x.com", "icon": "twitter"},
    {"href": "https://tiktok.com", "icon": "tiktok"},
  ]

  appName = 'POLYINE';

  private breakpointObserver = inject(BreakpointObserver);
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay(),
    );

  colList$?: Observable<TopCollection[]>;
  user$?: Observable<User | null | undefined>;

  ngOnInit(): void {
    this.colList$ = this.collService.topCollections$;
    this.user$ = this.userService.getCurrentUser();
  }
}
