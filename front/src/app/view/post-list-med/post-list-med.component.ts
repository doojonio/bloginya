import { Component, input } from '@angular/core';
import { PostMed, PostMedComponent } from '../post-med/post-med.component';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-post-list-med',
  imports: [PostMedComponent, MatDividerModule],
  templateUrl: './post-list-med.component.html',
  styleUrl: './post-list-med.component.scss',
})
export class PostListMedComponent {
  posts = input.required<PostMed[]>();
}
