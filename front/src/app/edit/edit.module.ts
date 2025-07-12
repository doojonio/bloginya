import { AsyncPipe, CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule } from '@angular/router';
import { NgxEditorModule } from 'ngx-editor';
import { PostEditorComponent } from './components/post-editor/post-editor.component';
import { routes } from './edit.routes';
import { EditorService } from './services/editor.service';
import { DriveService } from './services/drive.service';

@NgModule({
  declarations: [PostEditorComponent],
  providers: [EditorService, DriveService],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatProgressSpinnerModule,
    NgxEditorModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule,
    AsyncPipe,
    MatFormFieldModule,
    MatChipsModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressBarModule,
  ],
})
export class EditModule {}
