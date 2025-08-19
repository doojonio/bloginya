import { Component, inject, input, model } from '@angular/core';
import { BehaviorSubject, switchMap } from 'rxjs';
import { EditorService } from '../../services/editor.service';

@Component({
  selector: 'app-thumbnail-chooser',
  standalone: false,
  template: `
    <div class="images" *ngIf="postImages$ | async as images">
      <img
        *ngFor="let image of images"
        width="160"
        height="160"
        [ngSrc]="image"
        [ngClass]="{ selected: image === selectedImage() }"
        (click)="selectImage(image)"
      />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    // flex container
    .images {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: flex-start;
    }

    img {
      border: 2px solid rgba(0,0,0,0);
      border-radius: 1rem;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      object-fit: cover;

      &:hover {
        transform: translateY(-2px);
        // box-shadow: var(--shadow-2);
      }

      &.selected {
        border: 2px solid var(--mat-sys-primary);
        // box-shadow: var(--);
      }
    }


  `,
})
export class ThumbnailChooserComponent {
  private readonly editS = inject(EditorService);

  postId = input.required<string>();

  private updateImages$ = new BehaviorSubject(1);
  postImages$ = this.updateImages$.pipe(
    switchMap((_) => this.editS.getPostImages(this.postId()))
  );

  updateImages() {
    this.updateImages$.next(1);
  }

  selectedImage = model<string | null>(null);

  selectImage(image: string) {
    this.selectedImage.set(image);
  }
}
