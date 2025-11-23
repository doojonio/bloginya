import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-post-med',
  standalone: true,
  imports: [RouterModule, NgTemplateOutlet, NgOptimizedImage],
  templateUrl: './post-med.component.html',
  styleUrl: './post-med.component.scss',
})
export class PostMedComponent {
  searchService = inject(SearchService);

  imageFirst = input(false);
  post = input.required<PostMed>();

  linkForPost(post: PostMed) {
    return post.name ? '/' + post.name : '/p/' + post.id;
  }

  tagClicked(tag: string) {
    this.searchService.askSearch('#' + tag);
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
