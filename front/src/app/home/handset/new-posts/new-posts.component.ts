import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Observable } from 'rxjs';
import { NewPost } from '../../../posts.service';

@Component({
  selector: 'app-new-posts',
  imports: [AsyncPipe, UpperCasePipe],
  templateUrl: './new-posts.component.html',
  styleUrl: './new-posts.component.scss',
})
export class NewPostsComponent {
  newPosts$ = input.required<Observable<NewPost[]>>();
}
