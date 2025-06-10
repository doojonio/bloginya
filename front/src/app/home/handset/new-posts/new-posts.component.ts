import { AsyncPipe, UpperCasePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  viewChildren,
} from '@angular/core';
import { Observable } from 'rxjs';
import { NewPost } from '../../../posts.service';

@Component({
  selector: 'app-new-posts',
  imports: [AsyncPipe, UpperCasePipe],
  templateUrl: './new-posts.component.html',
  styleUrl: './new-posts.component.scss',
})
export class NewPostsComponent implements AfterViewInit {
  maxTitleHeight = 0;
  newPosts$ = input.required<Observable<NewPost[]>>();
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
