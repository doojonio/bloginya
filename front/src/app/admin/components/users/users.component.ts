import { Component, inject } from '@angular/core';
import { AppService } from '../../../shared/services/app.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  standalone: false,
})
export class UsersComponent {
  private readonly appService = inject(AppService);
  private readonly usersService = inject(UsersService);
  users$ = this.usersService.getUsers();

  isHandset$ = this.appService.isHandset();

  displayedColumns: string[] = [
    'username',
    'email',
    'role',
    'status',
    'comments_count',
    'posts_count',
    'likes_count',
    'created_at',
  ];
}
