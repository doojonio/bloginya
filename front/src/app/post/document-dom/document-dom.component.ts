import { Component, inject, input, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// TODO: load html wihtout imporing ngx-editor for viewing post
import { toHTML } from 'ngx-editor';

@Component({
  selector: 'app-document-dom',
  templateUrl: './document-dom.component.html',
  standalone: false,
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
