import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <app-categories></app-categories>
    <app-users></app-users>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class RootComponent {}
