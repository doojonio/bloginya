import { Component, computed, inject, input, model } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { concat, finalize, map, of, switchMap } from 'rxjs';
import { PictureService } from '../../../shared/services/picture.service';
import { DriveService } from '../../services/drive.service';

@Component({
  selector: 'app-wallpaper-chooser',
  standalone: false,
  template: `
    <div
      class="title"
      [class]="titleClass$ | async"
      [style]="titleStyle$ | async"
    >
      <button matIconButton (click)="wpInput.click()">
        <mat-icon>image</mat-icon>
      </button>
      <input
        type="file"
        accept="image/*"
        #wpInput
        (change)="onWpSelected($event)"
        style="display: none"
      />
    </div>
  `,
  styles: `
    @use "@angular/material" as mat;
    :host {
      display: block;
    }

    .title {
      position: relative;
      height: 20rem;
      border-radius: 1rem;

      button {
        position: absolute;
        bottom: 0;
        left: 0;

        @include mat.icon-overrides(
          (
            color: var(--mat-sys-outline),
          )
        );
      }
    }


    .title-bordered {
      border: 1px dashed var(--mat-sys-outline-variant);
    }
    .title-imaged {
      background-repeat: no-repeat;
      background-position: center;
    }


  `,
})
export class WallpaperChooserComponent {
  private readonly driveS = inject(DriveService);
  private readonly picS = inject(PictureService);

  postId = input.required<string>();
  formGroup = input.required<FormGroup>();
  isWallpaperLoading = model(false);

  pictureWpControl = computed(() => this.formGroup().get('picture_wp')!);
  pictureWp$ = toObservable(this.pictureWpControl).pipe(
    switchMap((control) => concat(of(control.value), control.valueChanges))
  );
  titleClass$ = this.pictureWp$.pipe(
    map((url) => (url ? 'title-imaged' : 'title-bordered'))
  );
  titleStyle$ = this.pictureWp$.pipe(
    map((url) =>
      url
        ? {
            background: [
              'linear-gradient(to right, rgba(0,0,0, 0.4))',
              `url(${url}) no-repeat center / cover`,
            ].join(', '),
          }
        : {}
    )
  );

  onWpSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files) {
      return;
    }

    const files: FileList = target.files;
    if (!files.length) {
      return;
    }

    this.isWallpaperLoading.set(true);
    this.driveS
      .putFile(this.postId(), files[0])
      .pipe(finalize(() => this.isWallpaperLoading.set(false)))
      .subscribe((resp) => {
        this.formGroup()
          .get('picture_wp')!
          .setValue(this.picS.variant(resp.id, 'medium'));
      });
  }
}
