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
  posts_per_page = input(13);

  firstPage = computed(() => {
    const posts = this.posts();

    if (posts.length <= this.posts_per_page()) {
      return posts;
    } else {
      return posts.slice(0, this.posts_per_page());
    }
  });

  secondPage = computed(() => {
    const posts = this.posts();

    if (posts.length <= this.posts_per_page()) {
      return null;
    } else {
      return posts.slice(this.posts_per_page());
    }
  });

  onSecondPage = false;

  togglePage() {
    this.onSecondPage = !this.onSecondPage;
  }

  calculateDimension(idx: number, count: number) {
    if (count < 9) {
      return [1, 1];
    }

    if (idx == 0 || idx == 8) {
      return [2, 2];
    }
    if (idx == 5 || idx == 6) {
      return [1, 2];
    }
    return [1, 1];
  }
}
