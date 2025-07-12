import { Component } from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  imports: [],
  template: `
    <div class="container">
      <h1 class="mat-h1">Page Not Found</h1>
    </div>
  `,
  styles: `
    .container {
      margin: 20px;
      display: flex;
      justify-content: center;
    }
  `,
})
export class PageNotFoundComponent {}
