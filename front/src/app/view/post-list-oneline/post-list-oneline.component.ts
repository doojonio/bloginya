import { UpperCasePipe } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { picStyle } from '../../posts.service';

@Component({
  selector: 'app-post-list-oneline',
  imports: [UpperCasePipe, RouterModule],
  templateUrl: './post-list-oneline.component.html',
  styleUrl: './post-list-oneline.component.scss',
})
export class PostListOnelineComponent {
  title = input<string>();
  posts = input.required<PostOneLinePost[]>();
  titles = viewChildren<ElementRef>('postTitle'); // Signal<ReadonlyArray<ElementRef>>

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
    return { background: picStyle(post.picture_pre, 'medium') };
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
