import { Component, input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { PostMed, PostMedComponent } from '../post-med/post-med.component';

@Component({
  selector: 'app-post-list-med',
  imports: [PostMedComponent, MatDividerModule],
  templateUrl: './post-list-med.component.html',
  styleUrl: './post-list-med.component.scss',
})
export class PostListMedComponent {
  posts = input.required<PostMed[]>();
  divider = input<boolean>(false);
  imageFirst = input(false);
}
