import { AsyncPipe, CommonModule, NgOptimizedImage } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxEditorModule } from 'ngx-editor';
import { EditCategoryModule } from '../category/edit-category.module';
import { PostListGridTitlesComponent } from '../shared/components/post-list-grid-titles/post-list-grid-titles.component';
import { PostListMedComponent } from '../shared/components/post-list-med/post-list-med.component';
import { MenuComponent } from './components/menu/menu.component';
import { PostEditorComponent } from './components/post-editor/post-editor.component';
import { ThumbnailChooserComponent } from './components/thumbnail-chooser/thumbnail-chooser.component';
import { EditRoutingModule } from './edit-routing.module';
import { AsianHelpersService } from './services/asian-helpers.service';
import { CoolAsiaService } from './services/cool-asia.service';
import { DriveService } from './services/drive.service';
import { EditorService } from './services/editor.service';

@NgModule({
  declarations: [PostEditorComponent, MenuComponent, ThumbnailChooserComponent],
  providers: [
    EditorService,
    DriveService,
    AsianHelpersService,
    CoolAsiaService,
  ],
  imports: [
    NgOptimizedImage,
    CommonModule,
    EditRoutingModule,
    EditCategoryModule,
    MatButtonToggleModule,
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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatChipsModule,
    CommonModule,
    PostListMedComponent,
    PostListGridTitlesComponent,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    AsyncPipe,
  ],
})
export class EditModule {}
