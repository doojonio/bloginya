import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

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
    return post.shortname ? '/' + post.shortname : '/p/' + post.id;
  }
}

export interface PostMed {
  title: string;
  id: string;
  shortname: string | null;
  picture_pre: string | null;
  description: string | null;
  tags: string[];
}
