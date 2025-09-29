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
    <div cdkDropListGroup>
      <div class="images" cdkDropList cdkDropListOrientation="mixed" (cdkDropListDropped)="onDropped($event)">
        @for (img of images; track img) {
        <img
          [class.selected]="img === preview"
          [ngSrc]="img | uploadId"
          width="100"
          height="100"
          (contextmenu)="selectPreview($event, img)"
          cdkDrag
          cdkDragBoundary=".images"
        />

        }
      </div>
    </div>

    }
  `,
  styles: `

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

  ngOnInit() {
    const doc = this.documentControl().value;
    try {
      const node = customSchema.nodeFromJSON(doc);
      this.updateImages(node);
    } catch {
      this.images = [];
    }
  }

  selectPreview(event$: Event, picture: string) {
    event$.preventDefault();
    this.previewControl().setValue(picture);
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
  }

  applyChanges() {
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
}
