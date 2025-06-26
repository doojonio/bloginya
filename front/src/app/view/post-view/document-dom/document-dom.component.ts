import { Component, inject, input, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { toHTML } from 'ngx-editor';

@Component({
  selector: 'app-document-dom',
  imports: [],
  templateUrl: './document-dom.component.html',
  styleUrl: './document-dom.component.scss',
  // to apply styles to generated html
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class DocumentDomComponent {
  sanitizer = inject(DomSanitizer);
  document = input.required<any>();

  getContent(): SafeHtml | undefined {
    const document = this.document();
    if (!document) {
      return;
    }
    return this.sanitizer.bypassSecurityTrustHtml(toHTML(document));
  }
}
