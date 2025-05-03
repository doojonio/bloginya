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
  ],
})
export class NavigationComponent implements OnInit {
  private collections = inject(CollectionsService);

  appName = 'WORK IN PROGRESS';

  private breakpointObserver = inject(BreakpointObserver);
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay(),
    );

  colList$?: Observable<ListCollectionsResponseItem[]>;

  ngOnInit(): void {
    this.colList$ = this.collections.listCollections(undefined).pipe(
      map((r) => r.collections),
      shareReplay(1),
    );
  }
}
