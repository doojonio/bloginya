import { Component, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-maps-dialog',
  standalone: false,
  templateUrl: './maps-dialog.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
})
export class MapsDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<MapsDialogComponent>);

  urlControl = new FormControl('', [
    Validators.required,
    this.mapsUrlValidator.bind(this),
  ]);

  private extractUrlFromInput(input: string): string {
    const trimmed = input.trim();

    if (trimmed.startsWith('<iframe') && trimmed.includes('src=')) {
      const srcMatch = trimmed.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        return srcMatch[1];
      }
    }

    return trimmed;
  }

  private mapsUrlValidator(control: FormControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const url = this.extractUrlFromInput(value);

    const supportedProviders = [
      'google.com/maps',
      'maps.google.com',
      'naver.com/maps',
      'map.naver.com',
      'yandex.com/maps',
      'yandex.ru/maps',
    ];

    const isValid = supportedProviders.some((provider) =>
      url.includes(provider)
    );

    return isValid ? null : { invalidMapsUrl: true };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onInsert(): void {
    if (this.urlControl.valid && this.urlControl.value) {
      const extractedUrl = this.extractUrlFromInput(this.urlControl.value);
      this.dialogRef.close(extractedUrl);
    }
  }
}
