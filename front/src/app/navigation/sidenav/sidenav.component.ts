import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatListModule, MatNavList } from '@angular/material/list';
import { Router, RouterModule } from '@angular/router';
import { PostsService } from '../../posts.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-sidenav',
  imports: [MatNavList, RouterModule, MatListModule, AsyncPipe],
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
      .subscribe((id) => this.router.navigate(['edit', id]));
  }
}
