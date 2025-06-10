import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of, tap } from 'rxjs';
import { AppService } from '../app.service';
import { Category, PostsService } from '../posts.service';
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
  appService = inject(AppService);
  isHandset$: Observable<boolean> = this.appService.isHandset();

  postsService = inject(PostsService);

  newPosts$ = this.postsService.getNewPosts();
  langs$ = this.postsService.getHomeCats().pipe(
    tap((langs) => {
      this.selectedLang.set(langs[0]);
    })
  );
  selectedLang = signal<Category | undefined>(undefined);
  langPosts$ = computed(() => {
    const lang = this.selectedLang();
    if (!lang) {
      return of([]);
    }
    return this.postsService.getHomeCatPosts(lang.id);
  });
  popularPosts$ = this.postsService.getPopularPosts();

  ngOnInit() {}
}
