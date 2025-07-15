import { Component, inject } from '@angular/core';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  standalone: false,
})
export class UsersComponent {
  private readonly usersService = inject(UsersService);
  users$ = this.usersService.getUsers();

  displayedColumns: string[] = [
    'id',
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
