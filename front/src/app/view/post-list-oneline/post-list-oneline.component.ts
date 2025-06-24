import { UpperCasePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  viewChildren,
} from '@angular/core';

@Component({
  selector: 'app-post-list-oneline',
  imports: [UpperCasePipe],
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
}

export interface PostOneLinePost {
  picture_pre: string;
  category_name: string;
  created_at: Date;
  title: string;
  tags: string[];
}
