import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, input, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { Node } from 'prosemirror-model';
import { Transform } from 'prosemirror-transform';
import { concat, of, switchMap } from 'rxjs';
import { customSchema } from '../../../prosemirror/schema';

export interface DialogData {
  wallpaper: string | null;
  preview: string | null;
  postPictures: string[];
}

@Component({
  selector: 'app-photo-manager',
  standalone: false,
  template: `
    <h2>Photo Manager</h2>

    @let preview = (previewValue$ | async); @if (preview) {

    <h3>Preview</h3>
    <img [ngSrc]="preview | uploadId" width="200" height="200" />
    } @if (images.length) {
    <h3>Post Images</h3>
    <div class="actions">
      <button
        matButton="outlined"
        (click)="selectPreview()"
        [disabled]="selectedImages.size != 1"
      >
        <mat-icon>photo</mat-icon>Preview
      </button>
      <button
        matButton="outlined"
        (click)="deleteSelected()"
        [disabled]="selectedImages.size == 0"
      >
        <mat-icon>delete</mat-icon>Delete
      </button>
    </div>
    <div
      class="images"
      cdkDropList
      cdkDropListOrientation="mixed"
      (cdkDropListDropped)="onDropped($event)"
    >
      @for (img of images; track img) {
      <img
        [class.selected]="selectedImages.has(img)"
        [ngSrc]="img | uploadId"
        width="100"
        height="100"
        (click)="toggleSelectImage(img)"
        cdkDrag
        cdkDragBoundary=".images"
      />

      }
    </div>

    }
  `,
  styles: `
    @use '@angular/material' as mat;

    .actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    :host {
      display: block;
      padding: 1rem;
    }

    .images {
      display: flex;
      flex-flow: row wrap;
      gap: 0.5rem;
    }

    img {
      border: 2px solid rgba(0,0,0,0);
      border-radius: 1rem;
      object-fit: cover;

      &.selected {
        border: 2px solid var(--mat-sys-primary);
      }
    }

    .cdk-drag-preview {
      border: none;
      box-sizing: border-box;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .images.cdk-drop-list-dragging img:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `,
})
export class PhotoManagerComponent implements OnInit {
  previewControl = input.required<FormControl>();
  wallpaperControl = input.required<FormControl>();
  documentControl = input.required<FormControl>();

  previewValue$ = toObservable(this.previewControl).pipe(
    switchMap((control) => concat(of(control.value), control.valueChanges))
  );
  wallpaperValue$ = toObservable(this.wallpaperControl).pipe(
    switchMap((control) => concat(of(control.value), control.valueChanges))
  );

  images!: string[];

  selectedImages = new Set<string>();

  ngOnInit() {
    const doc = this.documentControl().value;
    try {
      const node = customSchema.nodeFromJSON(doc);
      this.updateImages(node);
    } catch {
      this.images = [];
    }
  }

  toggleSelectImage(img: string) {
    if (this.selectedImages.has(img)) {
      this.selectedImages.delete(img);
    } else {
      this.selectedImages.add(img);
    }
  }

  selectPreview() {
    this.previewControl().setValue(this.selectedImages.values().next().value);
    this.selectedImages.clear();
  }

  deleteSelected() {
    let doc = this.documentControl().value;
    let node;
    try {
      node = customSchema.nodeFromJSON(doc);
    } catch {
      return;
    }

    let tr = new Transform(node);
    node.descendants((node, pos) => {
      if (node.type.name == 'image') {
        const src = node.attrs['src'].split('?')[0];
        if (this.selectedImages.has(src)) {
          tr.delete(tr.mapping.map(pos), tr.mapping.map(pos + node.nodeSize));
        }
      }
      return true;
    });

    const updatedNode = tr.doc;
    this.documentControl().setValue(updatedNode.toJSON());
    this.updateImages(updatedNode);
    this.selectedImages.clear();
  }

  updateImages(node: Node) {
    this.images = [];
    node.descendants((node, pos, _, index) => {
      if (node.type.name === 'image') {
        const src = node.attrs['src'];
        if (src) {
          this.images.push(src.split('?')[0]);
        }
      }
    });
  }

  onDropped(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.images, event.previousIndex, event.currentIndex);
    this.syncImagesWithDoc();
  }

  syncImagesWithDoc() {
    const doc = this.documentControl().value;
    let node;
    try {
      node = customSchema.nodeFromJSON(doc);
    } catch {
      return;
    }

    let tr = new Transform(node);
    let index = 0;
    node.descendants((node, pos) => {
      if (node.type.name == 'image') {
        if (index < this.images.length) {
          tr.setNodeAttribute(pos, 'src', this.images[index] + '?d=medium');
        }
        index++;
      }
      return true;
    });

    const updatedNode = tr.doc;
    this.documentControl().setValue(updatedNode.toJSON());
  }

  applyChanges() {
    this.syncImagesWithDoc();
  }
}
