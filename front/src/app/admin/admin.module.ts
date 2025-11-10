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
import {NgxFilesizeModule} from 'ngx-filesize';

@NgModule({
  declarations: [
    UsersComponent,
    RootComponent,
    CategoriesComponent,
    BackupComponent,
    CleanUpComponent,
  ],
  providers: [UsersService],
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
  ],
})
export class AdminModule {}
