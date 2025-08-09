import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MaybeShortnamePipe } from '../shared/pipes/maybe-shortname.pipe';
import { AdminRoutingModule } from './admin-routing.module';
import { CategoriesComponent } from './components/categories/categories.component';
import { RootComponent } from './components/root/root.component';
import { UsersComponent } from './components/users/users.component';
import { UsersService } from './services/users.service';

@NgModule({
  declarations: [UsersComponent, RootComponent, CategoriesComponent],
  providers: [UsersService],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MatTableModule,
    DatePipe,
    MatIconModule,
    MaybeShortnamePipe,
    MatCardModule,
  ],
})
export class AdminModule {}
