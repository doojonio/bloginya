import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  standalone: false,
  template: ` <p>menu works!</p> `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class MenuComponent {

}
