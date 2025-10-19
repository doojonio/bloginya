import { Component, input } from '@angular/core';
import { Editor } from 'ngx-editor';

@Component({
  selector: 'app-menu',
  standalone: false,
  template: `
    <div class="NgxEditor__Seperator"></div>
    <!-- <app-menu-font [editor]="editor()"></app-menu-font> -->
    <app-menu-asian-helpers [editor]="editor()"></app-menu-asian-helpers>
  `,
  styles: `
    :host {
      display: flex;
      flex-flow: row wrap;
      gap: 0.5rem
    }

  `,
})
export class MenuComponent {
  editor = input.required<Editor>();
}
