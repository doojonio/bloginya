import { Component, inject, input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Editor } from 'ngx-editor';
import { MapsDialogComponent } from '../maps-dialog/maps-dialog.component';

@Component({
  selector: 'app-menu-maps',
  standalone: false,
  template: `
    <button
      mat-icon-button
      (click)="openMapsDialog()"
      title="Insert Map"
      i18n-title
    >
      <mat-icon>map</mat-icon>
    </button>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
    }
  `,
})
export class MenuMapsComponent {
  editor = input.required<Editor>();
  private readonly dialog = inject(MatDialog);

  openMapsDialog(): void {
    const dialogRef = this.dialog.open(MapsDialogComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((url: string | undefined) => {
      if (url) {
        this.insertMapIframe(url);
      }
    });
  }

  private insertMapIframe(url: string): void {
    const editor = this.editor();
    const { view } = editor;
    const { state } = view;

    const node = editor.schema.nodes['maps_iframe'].create({ src: url });
    const tr = state.tr.replaceSelectionWith(node);
    view.dispatch(tr);
  }
}
