import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// TODO: load html wihtout imporing ngx-editor for viewing post
import { toHTML } from 'ngx-editor';
import { customSchema } from '../../prosemirror/schema';
import { C } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-document-dom',
  templateUrl: './document-dom.component.html',
  standalone: false,
  styleUrl: './document-dom.component.scss',
})
export class DocumentDomComponent {
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
    const document = this.document();
    if (!document) {
      return;
    }

    return this.sanitizer.bypassSecurityTrustHtml(
      toHTML(document, customSchema)
    );
  });
}
