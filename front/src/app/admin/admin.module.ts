import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatTableModule } from '@angular/material/table';
import { AdminRoutingModule } from './admin-routing.module';
import { UsersComponent } from './components/users/users.component';
import { UsersService } from './services/users.service';

@NgModule({
  declarations: [UsersComponent],
  providers: [UsersService],
  imports: [CommonModule, AdminRoutingModule, MatTableModule, DatePipe],
})
export class AdminModule {}
