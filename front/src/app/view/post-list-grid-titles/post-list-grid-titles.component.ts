import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AppService } from '../../app.service';

@Component({
  selector: 'app-post-list-grid-titles',
  imports: [
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    AsyncPipe,
  ],
  templateUrl: './post-list-grid-titles.component.html',
  styleUrl: './post-list-grid-titles.component.scss',
})
export class PostListGridTitlesComponent {
  posts = input.required<Post[]>();

  appService = inject(AppService);
  isHandset$ = this.appService.isHandset();
}
export interface Post {
  picture_pre: string;
  title: string;
  id: string;
  name: string;
}
