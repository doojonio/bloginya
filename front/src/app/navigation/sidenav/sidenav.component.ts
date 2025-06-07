import { Component, inject, OnInit } from '@angular/core';
import { MatListModule, MatNavList } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-sidenav',
  imports: [MatNavList, RouterModule, MatListModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent implements OnInit {
  private userService = inject(UserService);

  ngOnInit(): void {}
}
