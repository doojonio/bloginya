import { Component, input } from '@angular/core';
import { Editor } from 'ngx-editor';

@Component({
  selector: 'app-menu-font',
  standalone: false,
  template: `
    <button matIconButton (click)="increaseText()">
      <mat-icon>text_increase</mat-icon>
    </button>
    <button matIconButton (click)="decreaseText()">
      <mat-icon>text_decrease</mat-icon>
    </button>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class MenuFontComponent {
  editor = input.required<Editor>();

  increaseText() {
    throw new Error('Method not implemented.');
  }

  decreaseText() {
    throw new Error('Method not implemented.');
  }
}
