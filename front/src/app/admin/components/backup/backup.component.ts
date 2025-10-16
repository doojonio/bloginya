import { Component } from '@angular/core';

@Component({
  selector: 'app-backup',
  standalone: false,
  template: `
    <h1>Backups</h1>
    <a href="/api/backups">
      <button matButton="filled">Backup</button>
    </a>
  `,
  styles: `
    :host {
      display: block;
    }

    .progress-bar {
      margin: 1rem 0;
    }
  `,
})
export class BackupComponent {}
