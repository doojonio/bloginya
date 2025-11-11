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
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { toHTML } from 'ngx-editor';
import { switchMap } from 'rxjs';
import { customSchema } from '../../prosemirror/schema';
import { PROSEMIRROR_SERVER_CONVERT } from '../../app.config';

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

  serverConvert = inject(PROSEMIRROR_SERVER_CONVERT);

  ngAfterViewInit() {
    const rtTags = this.element.nativeElement.querySelector('rt');
    rtTags ? this.hasRt.emit(true) : this.hasRt.emit(false);
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
