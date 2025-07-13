import { AsyncPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AppService } from '../../services/app.service';
import { PictureService } from '../../services/picture.service';

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
  getLink(item: Post) {
    if (this.forEdit()) {
      return 'e/' + item.id;
    }

    return item.name ? item.name : 'p/' + item.id;
  }
  posts = input.required<Post[]>();
  forEdit = input(false);

  appService = inject(AppService);
  isHandset$ = this.appService.isHandset();

  private readonly picS = inject(PictureService);
  getPostPreStyle(post: Post) {
    return this.picS.picStyle(post.picture_pre, 'pre280');
  }
}
export interface Post {
  picture_pre: string | null;
  title: string;
  id: string;
  name: string | null;
}
