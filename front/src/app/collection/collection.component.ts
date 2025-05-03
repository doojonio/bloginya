import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { map, Observable, shareReplay } from 'rxjs';
import {
  CollectionsService,
  GetCollectionResponse,
} from '../collections.service';

@Component({
  selector: 'app-collection',
  imports: [
    AsyncPipe,
    MatProgressSpinnerModule,
    AsyncPipe,
    RouterModule,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.scss',
})
export class CollectionComponent {
  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay(),
    );

  private collections = inject(CollectionsService);
  collection$?: Observable<GetCollectionResponse>;

  @Input()
  set id(id: string) {
    this.collection$ = this.collections.getCollection(id).pipe(shareReplay(1));
  }
}
