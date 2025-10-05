import { Component, computed, input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { filter } from 'rxjs';

@Component({
  selector: 'app-title-input',
  standalone: false,
  template: `
    <textarea
      type="text"
      matInput
      [formControl]="formControl()"
      placeholder="Title..."
    ></textarea>
  `,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    textarea {
      all: unset;
      color: var(--mat-sys-primary);
      font: var(--mat-sys-display-medium);
      text-align: center;
      text-wrap: wrap;
      width: 80%;
      max-width: 80%;
      overflow: hidden;
      resize: none;
      font-weight: bold;
    }
  `,
})
export class TitleInputComponent {
  formGroup = input.required<FormGroup>();
  formControl = computed(() => this.formGroup().get('title')! as FormControl);

  ngOnInit() {
    this.formGroup()
      .get('title')!
      .valueChanges.pipe(filter(Boolean))
      .subscribe((title) => {
        const lines = title.split('\n');
        if (lines.length > 2) {
          this.formGroup()
            .get('title')
            ?.setValue(lines[0] + '\n' + lines.slice(1).join(''));
        }
      });
  }
}
