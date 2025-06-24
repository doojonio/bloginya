import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { PopularPost } from '../../posts.service';

@Component({
  selector: 'app-post-list-grid',
  imports: [MatGridListModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './post-list-grid.componen.html',
  styleUrl: './post-list-grid.componen.scss',
})
export class PostListGridComponent {
  title = input<string>();
  posts = input.required<PopularPost[]>();
  POSTS_PER_PAGE = 18;

  firstPage = computed(() => {
    const posts = this.posts();

    if (posts.length <= this.POSTS_PER_PAGE) {
      return posts;
    } else {
      return posts.slice(0, this.POSTS_PER_PAGE);
    }
  });

  secondPage = computed(() => {
    const posts = this.posts();

    if (posts.length <= this.POSTS_PER_PAGE) {
      return null;
    } else {
      return posts.slice(this.POSTS_PER_PAGE);
    }
  });

  onSecondPage = false;

  togglePage() {
    this.onSecondPage = !this.onSecondPage;
  }
}
