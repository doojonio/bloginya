import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { map } from 'rxjs';
import { NotifierService } from '../shared/services/notifier.service';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-profile-settings',
  providers: [SettingsService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormField,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h1>Settings</h1>
    <form [formGroup]="form">
      <mat-form-field>
        <mat-label>Username</mat-label>
        <input
          matInput
          formControlName="username"
          i18n-placeholder
          placeholder="Username"
        />
        <mat-error *ngIf="form.get('username')?.hasError('required')" i18n>
          Username is required.
        </mat-error>
        <mat-error *ngIf="form.get('username')?.hasError('minlength')" i18n>
          Username must be at least 3 characters long.
        </mat-error>
        <mat-error *ngIf="form.get('username')?.hasError('maxlength')" i18n>
          Username cannot be more than 20 characters long.
        </mat-error>
        <mat-error *ngIf="form.get('username')?.hasError('taken')" i18n>
          This username is already taken.
        </mat-error>
      </mat-form-field>
      <button mat-raised-button color="primary" (click)="save()" i18n>
        Save
      </button>
    </form>
  `,
  styles: `
    :host {
      display: block;
    }
    form {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
  `,
})
export class ProfileSettingsComponent {
  private readonly settingsS = inject(SettingsService);
  private readonly notifierS = inject(NotifierService);

  initial = this.settingsS
    .getSettings()
    .subscribe((s) => this.form.patchValue(s));

  form = new FormGroup({
    // not null
    username: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
      ],
      asyncValidators: [this.checkUnique.bind(this)],
    }),
  });

  checkUnique(control: AbstractControl) {
    return this.settingsS
      .isUsernameTaken(control.value)
      .pipe(map((isTaken) => (isTaken ? { taken: true } : null)));
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    this.settingsS
      .saveSettings({ username: this.form.value.username! })
      .subscribe(() => {
        this.notifierS.notify('Settings saved');
      });
  }
}
