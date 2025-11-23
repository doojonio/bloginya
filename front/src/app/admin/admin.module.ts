import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MaybeShortnamePipe } from '../shared/pipes/maybe-shortname.pipe';
import { AdminRoutingModule } from './admin-routing.module';
import { BackupComponent } from './components/backup/backup.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { RootComponent } from './components/root/root.component';
import { UsersComponent } from './components/users/users.component';
import { UsersService } from './services/users.service';
import { CleanUpComponent } from './components/clean-up/clean-up.component';
import { NgxFilesizeModule } from 'ngx-filesize';
import { TrashComponent } from './components/trash/trash.component';
import { TrashService } from './services/trash.service';
import { CleanUpService } from './services/clean-up.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { PostListMedComponent } from '../shared/components/post-list-med/post-list-med.component';

@NgModule({
  declarations: [
    UsersComponent,
    RootComponent,
    CategoriesComponent,
    BackupComponent,
    CleanUpComponent,
    TrashComponent,
  ],
  providers: [UsersService, TrashService, CleanUpService],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MatTableModule,
    DatePipe,
    MatIconModule,
    MaybeShortnamePipe,
    MatCardModule,
    MatButtonModule,
    MatProgressBar,
    NgxFilesizeModule,
    MatProgressSpinner,
    PostListMedComponent,
  ],
})
export class AdminModule {}
