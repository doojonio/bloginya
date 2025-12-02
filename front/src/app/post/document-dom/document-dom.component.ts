import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// TODO: load html wihtout imporing ngx-editor for viewing post
import { Platform } from '@angular/cdk/platform';
import { toHTML } from 'ngx-editor';
import { PROSEMIRROR_SERVER_CONVERT } from '../../app.tokens';
import { customSchema } from '../../prosemirror/schema';
import { Gallery, ImageItem } from 'ng-gallery';
import { Lightbox } from 'ng-gallery/lightbox';

@Component({
  selector: 'app-document-dom',
  templateUrl: './document-dom.component.html',
  standalone: false,
  styleUrl: './document-dom.component.scss',
})
export class DocumentDomComponent {
  private readonly platform = inject(Platform);
  private readonly gallery = inject(Gallery);
  private readonly lightbox = inject(Lightbox);

  sanitizer = inject(DomSanitizer);
  document = input.required<any>();

  showRt = input(true);
  hasRt = output<boolean>();

  element = inject(ElementRef);

  serverConvert = inject(PROSEMIRROR_SERVER_CONVERT);

  ngAfterViewInit() {
    const nativeElement: HTMLElement = this.element.nativeElement;

    const rtTags = nativeElement.querySelector('rt');
    rtTags ? this.hasRt.emit(true) : this.hasRt.emit(false);

    // Set up image gallery/lightbox for all images inside the rendered document
    // We use event delegation so this only needs to be attached once.
    const container = nativeElement.querySelector(
      '.app-document-dom-container'
    ) as HTMLElement | null;

    if (!container || !this.platform.isBrowser) {
      return;
    }

    container.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const img = target.closest('img');
      if (!img) {
        return;
      }

      const images = Array.from(
        container.querySelectorAll('img')
      ) as HTMLImageElement[];

      if (!images.length) {
        return;
      }

      const items = images
        .map((image) => {
          const src = image.getAttribute('src');
          if (!src) {
            return null;
          }
          const alt = image.getAttribute('alt') ?? '';
          return new ImageItem({ src, thumb: src, alt });
        })
        .filter((item): item is ImageItem => item !== null);

      if (!items.length) {
        return;
      }

      const clickedIndex = images.findIndex((image) => image === img);

      const galleryRef = this.gallery.ref('post-images');
      galleryRef.load(items);

      this.lightbox.open(
        clickedIndex >= 0 ? clickedIndex : 0,
        'post-images'
      );
    });
  }

  htmlContent = computed(() => {
    if (!this.platform.isBrowser) {
      return this.serverConvert(this.document());
    }

    const document = this.document();
    if (!document) {
      return;
    }

    return this.sanitizer.bypassSecurityTrustHtml(
      toHTML(document, customSchema)
    );
  });
}
