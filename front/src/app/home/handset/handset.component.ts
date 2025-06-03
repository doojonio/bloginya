import { Component, input, model } from '@angular/core';
import { Observable } from 'rxjs';
import { LangPost, NewPost, PopularPost } from '../../posts.service';
import { LangPostsComponent } from './lang-posts/lang-posts.component';
import { NewPostsComponent } from './new-posts/new-posts.component';
import { PopularPostsComponent } from './popular-posts/popular-posts.component';

@Component({
  selector: 'app-handset',
  imports: [NewPostsComponent, LangPostsComponent, PopularPostsComponent],
  templateUrl: './handset.component.html',
  styleUrl: './handset.component.scss',
})
export class HandsetComponent {
  newPosts$ = input.required<Observable<NewPost[]>>();
  langs$ = input.required<Observable<string[]>>();
  langPosts$ = input.required<Observable<LangPost[]>>();
  selectedLang = model<string>();
  popularPosts$ = input.required<Observable<PopularPost[]>>();
}
