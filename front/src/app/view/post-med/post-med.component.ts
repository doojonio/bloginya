import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { picStyle } from '../../posts.service';

@Component({
  selector: 'app-post-med',
  imports: [RouterModule, NgTemplateOutlet],
  templateUrl: './post-med.component.html',
  styleUrl: './post-med.component.scss',
})
export class PostMedComponent {
  imageFirst = input(false);
  post = input.required<PostMed>();

  linkForPost(post: PostMed) {
    return post.name ? '/' + post.name : '/p/' + post.id;
  }

  getPostPreStyle(post: PostMed) {
    return picStyle(post.picture_pre, 'pre140');
  }
}

export interface PostMed {
  title: string;
  id: string;
  name: string | null;
  picture_pre: string | null;
  description: string | null;
  tags: string[];
}
