import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { map, Observable, shareReplay } from 'rxjs';
import { PostsService } from '../posts.service';
import { HandsetComponent } from './handset/handset.component';

@Component({
  selector: 'app-home',
  imports: [
    AsyncPipe,
    MatChipsModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    HandsetComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  postsService = inject(PostsService);

  newPosts$ = this.postsService.getNewPosts();
  langs$ = this.postsService.getLangs();
  selectedLang = signal('ENGLISH');
  langPosts$ = computed(() =>
    this.postsService.getLangPosts(this.selectedLang())
  );
  popularPosts$ = this.postsService.getPopularPosts();

  ngOnInit() {}
}
