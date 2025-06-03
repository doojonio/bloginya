import { AsyncPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { PopularPost } from '../../../posts.service';

@Component({
  selector: 'app-popular-posts',
  imports: [AsyncPipe, MatGridListModule, MatIconModule, MatButtonModule],
  templateUrl: './popular-posts.component.html',
  styleUrl: './popular-posts.component.scss',
})
export class PopularPostsComponent {
  popularPosts$ = input.required<Observable<PopularPost[]>>();
}
