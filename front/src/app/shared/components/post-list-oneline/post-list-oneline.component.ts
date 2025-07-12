import { AsyncPipe, UpperCasePipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  ViewChild,
  viewChildren,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AppService } from '../../../app.service';
import { picStyle } from '../../../posts.service';

@Component({
  selector: 'app-post-list-oneline',
  imports: [
    UpperCasePipe,
    RouterModule,
    AsyncPipe,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './post-list-oneline.component.html',
  styleUrl: './post-list-oneline.component.scss',
})
export class PostListOnelineComponent {
  title = input<string>();
  posts = input.required<PostOneLinePost[]>();
  postsLength = computed(() => this.posts().length);
  titles = viewChildren<ElementRef>('postTitle'); // Signal<ReadonlyArray<ElementRef>>

  private readonly appService = inject(AppService);
  isHandset$ = this.appService.isHandset();

  minHeight = signal('0px');

  titlesEffect = effect(() => {
    const titles = this.titles();
    if (titles.length && this.minHeight() == '0px') {
      this.minHeight.set(
        Math.max(
          ...titles.map((e) => {
            return e.nativeElement.scrollHeight;
          })
        ) + 'px'
      );
    }
  });

  getPostPreStyle(post: PostOneLinePost) {
    return { background: picStyle(post.picture_pre, 'pre280') };
  }

  /* DEKSTOP
  */
  @ViewChild('postsContainer') postsContainer!: ElementRef<HTMLDivElement>;

  scrollPrev(): void {
    if (this.postsContainer) {
      const container = this.postsContainer.nativeElement;
      // Scroll left by the container's visible width for a "page" effect
      container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' });
    }
  }

  scrollNext(): void {
    if (this.postsContainer) {
      const container = this.postsContainer.nativeElement;
      // Scroll right by the container's visible width
      container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
    }
  }
}

export interface PostOneLinePost {
  id: string;
  name: string | null;
  picture_pre: string;
  category_title: string;
  category_name: string;
  category_id: string;
  created_at: Date;
  title: string;
  tags: string[];
}
