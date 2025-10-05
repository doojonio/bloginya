import { DragDropModule } from '@angular/cdk/drag-drop';
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
import { AudioModule } from '../audio/audio.module';
import { EditCategoryModule } from '../category/edit-category.module';
import { PostListGridTitlesComponent } from '../shared/components/post-list-grid-titles/post-list-grid-titles.component';
import { PostListMedComponent } from '../shared/components/post-list-med/post-list-med.component';
import { TagsInputComponent } from '../shared/components/tags-input/tags-input.component';
import { UploadIdPipe } from '../shared/pipes/upload-id.pipe';
import { MenuComponent } from './components/menu/menu.component';
import { MetaEditorComponent } from './components/meta-editor/meta-editor.component';
import { PhotoManagerComponent } from './components/photo-manager/photo-manager.component';
import { PostEditorRootComponent } from './components/post-editor-root/post-editor-root.component';
import { PostEditorComponent } from './components/post-editor/post-editor.component';
import { TitleInputComponent } from './components/title-input/title-input.component';
import { WallpaperChooserComponent } from './components/wallpaper-chooser/wallpaper-chooser.component';
import { EditRoutingModule } from './edit-routing.module';
import { AsianHelpersService } from './services/asian-helpers.service';
import { CoolAsiaService } from './services/cool-asia.service';
import { DriveService } from './services/drive.service';
import { EditorService } from './services/editor.service';

@NgModule({
  declarations: [
    PostEditorComponent,
    MenuComponent,
    PhotoManagerComponent,
    WallpaperChooserComponent,
    TitleInputComponent,
    MetaEditorComponent,
    PostEditorRootComponent,
  ],
  providers: [
    EditorService,
    DriveService,
    AsianHelpersService,
    CoolAsiaService,
  ],
  imports: [
    UploadIdPipe,
    DragDropModule,
    AudioModule,
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
    TagsInputComponent,
  ],
})
export class EditModule {}
