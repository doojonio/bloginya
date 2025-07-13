import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PostsService } from '../../../shared/services/posts.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-sidenav',
  standalone: false,
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent implements OnInit {
  private userService = inject(UserService);
  private postsService = inject(PostsService);
  private router = inject(Router);
  user$ = this.userService.getCurrentUser();

  ngOnInit(): void {}

  addDraft() {
    this.postsService
      .createDraft()
      .subscribe((id) => this.router.navigate(['e', id]));
  }
}
