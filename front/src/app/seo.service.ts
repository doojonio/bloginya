import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly metaService = inject(Meta);
  private readonly titleService = inject(Title);

  private readonly DEFAULT_PRE = '/assets/images/wp_footer.webp';
  private readonly SITE_NAME = 'Polyine';
  private readonly DESCRIPTION = 'I Learn Languages!';

  applyDefault() {
    this.titleService.setTitle(this.SITE_NAME);

    this.metaService.updateTag({
      name: 'description',
      content: this.DESCRIPTION,
    });
    // Open Graph Tags
    this.metaService.updateTag({
      property: 'og:title',
      content: this.SITE_NAME,
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: this.DESCRIPTION,
    });
    this.metaService.updateTag({
      property: 'og:image',
      content: this.DEFAULT_PRE,
    });
    // TODO
    // this.metaService.updateTag({ property: 'og:url', content: 'TODO' });
    this.metaService.updateTag({ property: 'og:type', content: 'website' }); // or 'article', 'product', etc.
    this.metaService.updateTag({
      property: 'og:site_name',
      content: this.SITE_NAME,
    });

    // Twitter Card Tags
    // this.metaService.updateTag({
    //   name: 'twitter:card',
    //   content: this.DEFAULT_PRE,
    // }); // or 'summary', 'app', 'player'
    this.metaService.updateTag({
      name: 'twitter:title',
      content: this.SITE_NAME,
    });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: this.DESCRIPTION,
    });
    this.metaService.updateTag({
      name: 'twitter:image',
      content: this.DEFAULT_PRE,
    });
    // this.metaService.updateTag({ name: 'twitter:url', content: pageUrl });
    // TODO
    // this.metaService.updateTag({
    //   name: 'twitter:creator',
    //   content: '@polyine',
    // }); // Optional
  }

  applyForCategory(cat: Category) {
    this.titleService.setTitle(this.SITE_NAME + ' | ' + cat.title);

    this.metaService.updateTag({
      name: 'description',
      content: this.DESCRIPTION,
    });
    // Open Graph Tags
    this.metaService.updateTag({
      property: 'og:title',
      content: cat.title,
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: this.DESCRIPTION,
    });
    this.metaService.updateTag({
      property: 'og:image',
      content: this.DEFAULT_PRE,
    });
    // TODO
    // this.metaService.updateTag({ property: 'og:url', content: 'TODO' });
    this.metaService.updateTag({ property: 'og:type', content: 'article' }); // or 'article', 'product', etc.
    this.metaService.updateTag({
      property: 'og:site_name',
      content: this.SITE_NAME,
    });

    // Twitter Card Tags
    // this.metaService.updateTag({
    //   name: 'twitter:card',
    //   content: this.DEFAULT_PRE,
    // }); // or 'summary', 'app', 'player'
    this.metaService.updateTag({
      name: 'twitter:title',
      content: cat.title,
    });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: this.DESCRIPTION,
    });
    this.metaService.updateTag({
      name: 'twitter:image',
      content: this.DEFAULT_PRE,
    });
  }

  applyForPost(post: Post) {
    this.titleService.setTitle(this.SITE_NAME + ' | ' + post.title);

    this.metaService.updateTag({
      name: 'description',
      content: post.description,
    });
    // Open Graph Tags
    this.metaService.updateTag({ property: 'og:title', content: post.title });
    this.metaService.updateTag({
      property: 'og:description',
      content: post.description,
    });
    this.metaService.updateTag({
      property: 'og:image',
      content: post.picture_pre || this.DEFAULT_PRE,
    });
    // TODO
    // this.metaService.updateTag({ property: 'og:url', content: 'TODO' });
    this.metaService.updateTag({ property: 'og:type', content: 'article' }); // or 'article', 'product', etc.
    this.metaService.updateTag({
      property: 'og:site_name',
      content: 'Polyine',
    });

    // Twitter Card Tags
    // this.metaService.updateTag({
    //   name: 'twitter:card',
    //   content: this.DEFAULT_PRE,
    // }); // or 'summary', 'app', 'player'
    this.metaService.updateTag({
      name: 'twitter:title',
      content: post.title,
    });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: post.description,
    });
    this.metaService.updateTag({
      name: 'twitter:image',
      content: post.picture_pre || this.DEFAULT_PRE,
    });
    // this.metaService.updateTag({ name: 'twitter:url', content: pageUrl });
    // TODO
    // this.metaService.updateTag({
    //   name: 'twitter:creator',
    //   content: '@polyine',
    // }); // Optional
  }
}

export interface Category {
  title: string;
}

export interface Post {
  title: string;
  description: string;
  picture_pre: string | null;
}
