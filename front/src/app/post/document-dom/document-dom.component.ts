import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// TODO: load html wihtout imporing ngx-editor for viewing post
import { toHTML } from 'ngx-editor';
import { customSchema } from '../../prosemirror/schema';
import { isPlatformBrowser } from '@angular/common';
import { Platform } from '@angular/cdk/platform';

@Component({
  selector: 'app-document-dom',
  templateUrl: './document-dom.component.html',
  standalone: false,
  styleUrl: './document-dom.component.scss',
})
export class DocumentDomComponent {
  private readonly platform = inject(Platform);

  sanitizer = inject(DomSanitizer);
  document = input.required<any>();

  showRt = input(true);
  hasRt = output<boolean>();

  element = inject(ElementRef);

  ngAfterViewInit() {
    const rtTags = this.element.nativeElement.querySelector('rt');
    rtTags ? this.hasRt.emit(true) : this.hasRt.emit(false);
  }

  htmlContent = computed(() => {
    if (!this.platform.isBrowser) {
      return JSON.stringify(this.document());
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
