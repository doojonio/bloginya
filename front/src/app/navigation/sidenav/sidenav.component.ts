import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatNavList } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { TopCollection, User } from '../../cdata.service';
import { CollectionsService } from '../../collections.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-sidenav',
  imports: [MatNavList, AsyncPipe, RouterModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent implements OnInit {
  private collService = inject(CollectionsService);
  private userService = inject(UserService);

  colList$?: Observable<TopCollection[]>;
  user$?: Observable<User | null | undefined>;

  ngOnInit(): void {
    this.colList$ = this.collService.topCollections$;
    this.user$ = this.userService.getCurrentUser();
  }
}
