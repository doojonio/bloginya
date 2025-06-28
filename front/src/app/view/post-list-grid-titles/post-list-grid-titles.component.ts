import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-post-list-grid-titles',
  imports: [MatGridListModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './post-list-grid-titles.component.html',
  styleUrl: './post-list-grid-titles.component.scss',
})
export class PostListGridTitlesComponent {
  posts = input.required<Post[]>();
}
export interface Post {
  picture_pre: string;
  title: string;
  id: string;
  name: string;
}
