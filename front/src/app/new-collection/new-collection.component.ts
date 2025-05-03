import {
  Component,
  EventEmitter,
  inject,
  Input,
  input,
  Output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil } from 'rxjs';
import {
  CollectionsService,
  ListCollectionsResponseItem,
} from '../collections.service';

@Component({
  selector: 'app-new-collection',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './new-collection.component.html',
  styleUrl: './new-collection.component.scss',
})
export class NewCollectionComponent {
  @Output()
  onSave = new EventEmitter<ListCollectionsResponseItem>();
  @Output()
  onCancel = new EventEmitter<void>();

  @Input()
  parentId?: string;

  private collections = inject(CollectionsService);
  private destroy$ = new Subject<void>();

  title = new FormControl('');

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.destroy$.next();
    this.destroy$.complete();
  }

  save() {
    if (this.title.invalid) {
      return;
    }

    this.collections
      .createCollection({ title: this.title.value, parent_id: this.parentId })
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        this.onSave.emit({
          id,
          title: this.title.value || '',
        });
      });
  }

  cancel() {
    this.onCancel.emit();
  }
}
