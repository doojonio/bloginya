import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PictureService } from '../../services/picture.service';

@Component({
  selector: 'app-post-med',
  imports: [RouterModule, NgTemplateOutlet, NgOptimizedImage],
  templateUrl: './post-med.component.html',
  styleUrl: './post-med.component.scss',
})
export class PostMedComponent {
  imageFirst = input(false);
  post = input.required<PostMed>();

  linkForPost(post: PostMed) {
    return post.name ? '/' + post.name : '/p/' + post.id;
  }

  private readonly picS = inject(PictureService);
}

export interface PostMed {
  title: string;
  id: string;
  name: string | null;
  picture_pre: string | null;
  description: string | null;
  tags: string[];
}
export interface PostMed {
  title: string;
  id: string;
  name: string | null;
  picture_pre: string | null;
  description: string | null;
  tags: string[];
}
