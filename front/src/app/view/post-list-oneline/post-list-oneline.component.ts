import { UpperCasePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  viewChildren,
} from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-post-list-oneline',
  imports: [UpperCasePipe, RouterModule],
  templateUrl: './post-list-oneline.component.html',
  styleUrl: './post-list-oneline.component.scss',
})
export class PostListOnelineComponent implements AfterViewInit {
  maxTitleHeight = 0;
  title = input<string>();
  posts = input.required<PostOneLinePost[]>();
  titles = viewChildren<ElementRef>('postTitle'); // Signal<ReadonlyArray<ElementRef>>

  ngAfterViewInit() {
    // this.maxTitleHeight = Math.max(this.maxTitleHeight, element.scrollHeight);
    this.maxTitleHeight = Math.max(
      ...this.titles().map((e) => {
        return e.nativeElement.scrollHeight;
      })
    );
  }

  getPostPreStyle(post: PostOneLinePost) {
    return post.picture_pre
      ? {
          background: `url(${post.picture_pre}) center / cover no-repeat`,
        }
      : {
          background: 'rgb(117, 85, 112)',
        };
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
