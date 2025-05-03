import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { map, Observable, shareReplay, Subject } from 'rxjs';
import { BlogsService, ListBlogsResponse } from '../blogs.service';

@Component({
  selector: 'app-drafts',
  imports: [AsyncPipe, MatCardModule, MatButtonModule],
  templateUrl: './drafts.component.html',
  styleUrl: './drafts.component.scss',
})
export class DraftsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  private blogs = inject(BlogsService);
  blogs$: Observable<ListBlogsResponse[]> | undefined;

  private breakpointObserver = inject(BreakpointObserver);
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  ngOnInit(): void {
    this.blogs$ = this.blogs.listBlogs(50, 0, true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
