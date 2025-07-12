import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { PostPictured } from '../../../home/home.interface';
import { AppService } from '../../services/app.service';
import { picStyle } from '../../services/picture.service';

@Component({
  selector: 'app-post-list-grid',
  imports: [MatGridListModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './post-list-grid.componen.html',
  styleUrl: './post-list-grid.componen.scss',
})
export class PostListGridComponent {
  title = input<string>();
  posts = input.required<PostPictured[]>();
  posts_per_page = computed(() => (this.isHandset() ? 13 : 12));

  private readonly appService = inject(AppService);
  isHandset = toSignal(this.appService.isHandset());

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
      return posts.slice(this.posts_per_page(), this.posts_per_page() * 2);
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
    if (this.isHandset()) {
      if (idx == 0 || idx == 8) {
        return [2, 2];
      }
      if (idx == 5 || idx == 6) {
        return [1, 2];
      }
    } else {
      // как же я ебал все это настраивать
      if (idx == 0 || idx == 3 || idx == 4) return [1, 3];
      if (idx == 1 || idx == 6) return [1, 4];
      if (idx == 2 || idx == 5 || idx == 7 || idx == 9) return [1, 2];
    }
    return [1, 1];
  }

  getPostPreStyle(post: PostPictured) {
    return picStyle(post.picture_pre, 'pre450');
  }
}
