import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AppService } from '../../services/app.service';
import { PictureService } from '../../services/picture.service';

@Component({
  selector: 'app-post-list-grid-titles',
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterModule,
    AsyncPipe,
    NgOptimizedImage,
  ],
  templateUrl: './post-list-grid-titles.component.html',
  styleUrl: './post-list-grid-titles.component.scss',
})
export class PostListGridTitlesComponent {
  onDelete = output<string>();

  getLink(item: Post) {
    if (this.forEdit()) {
      return 'e/' + item.id;
    }

    return item.name ? item.name : 'p/' + item.id;
  }

  withDeletion = input(false);

  isLCP = input(true);
  posts = input.required<Post[]>();
  forEdit = input(false);

  appService = inject(AppService);
  isHandset$ = this.appService.isHandset();

  private readonly picS = inject(PictureService);
  getImageUrl(post: Post) {
    return this.picS.variant(post.picture_pre, 'pre140');
  }
}
export interface Post {
  picture_pre: string | null;
  title: string;
  id: string;
  name: string | null;
}
