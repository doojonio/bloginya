import { Component, inject, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { catchError, map, of, Subject, takeUntil } from 'rxjs';
import { PostsService } from '../../posts.service';

@Component({
  selector: 'app-new-category-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './new-category-dialog.component.html',
  styleUrl: './new-category-dialog.component.scss',
})
export class NewCategoryDialogComponent implements OnDestroy {
  readonly dialogRef = inject(MatDialogRef<NewCategoryDialogComponent>);
  // readonly data = inject<AddCategoryResponse>(MAT_DIALOG_DATA);

  postsService = inject(PostsService);

  form = new FormGroup({
    title: new FormControl(
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(120),
        Validators.pattern(/^[\w \-]+$/),
      ],
      this.validateUniqueTitle.bind(this)
    ),
    description: new FormControl(''),
  });

  private destroy$ = new Subject<void>();

  addCategory() {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.value;
    this.postsService
      .addCategory({
        title: value.title || '',
        description: value.description || null,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((resp) => {
        this.dialogRef.close(resp);
      });
  }

  validateUniqueTitle(control: AbstractControl) {
    const { value } = control;
    if (value == null || value.length < 3) {
      return of(null);
    }
    return this.postsService.getCategoryByTitle(value).pipe(
      catchError((_) => of(null)),
      map((cat) => (cat ? { taken: true } : null))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
