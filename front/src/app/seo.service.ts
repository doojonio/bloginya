import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { medium } from './drive.service';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly metaService = inject(Meta);
  private readonly titleService = inject(Title);

  private readonly SITE = 'https://hpotato.io/';
  private readonly SITE_NAME = 'POLYINE';
  private readonly DOMAIN = 'hpotato.io';
  private readonly DEFAULT_PRE = this.SITE + 'assets/images/wp_footer.webp';
  private readonly DESCRIPTION = 'I Learn Languages!';

  private apply(vals: Vals) {
    // HTML
    this.titleService.setTitle(vals.tabTitle);
    this.metaService.updateTag({
      name: 'description',
      content: vals.description,
    });

    // Facebook
    this.metaService.updateTag({
      property: 'og:title',
      content: vals.title,
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: vals.description,
    });
    this.metaService.updateTag({
      property: 'og:image',
      content: vals.image,
    });
    this.metaService.updateTag({ property: 'og:url', content: vals.url });
    this.metaService.updateTag({ property: 'og:type', content: vals.type });

    // Twitter
    this.metaService.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.metaService.updateTag({
      property: 'twitter:domain',
      content: vals.domain,
    });
    this.metaService.updateTag({
      property: 'twitter:url',
      content: vals.url,
    });
    this.metaService.updateTag({
      name: 'twitter:title',
      content: vals.title,
    });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: vals.description,
    });
    this.metaService.updateTag({
      name: 'twitter:image',
      content: vals.image,
    });
  }

  applyDefault() {
    this.apply({
      tabTitle: this.SITE_NAME,
      title: this.SITE_NAME,
      description: this.DESCRIPTION,
      type: 'website',
      url: this.SITE,
      image: this.DEFAULT_PRE,
      domain: this.DOMAIN,
    });
  }

  applyForCategory(cat: Category) {
    this.apply({
      tabTitle: this.SITE_NAME + ' | ' + cat.title,
      title: cat.title,
      description: `Browse posts in the ${cat.title} category.`,
      type: 'website',
      url: this.SITE + (cat.name ? cat.name : 'c/' + cat.id),
      image: this.DEFAULT_PRE,
      domain: this.DOMAIN,
    });
  }

  applyForPost(post: Post) {
    this.apply({
      tabTitle: this.SITE_NAME + ' | ' + post.title,
      title: post.title,
      description: post.description,
      type: 'article',
      url: this.SITE + (post.name ? post.name : 'p/' + post.id),
      image: this.SITE + (medium(post.picture_pre) || this.DEFAULT_PRE),
      domain: this.DOMAIN,
    });
  }
}

interface Vals {
  tabTitle: string;
  title: string;
  description: string;
  type: string;
  url: string;
  image: string;
  domain: string;
}
export interface Category {
  title: string;
  name: string | null;
  id: string;
}

export interface Post {
  title: string;
  description: string;
  picture_pre: string | null;
  name: string | null;
  id: string;
}
