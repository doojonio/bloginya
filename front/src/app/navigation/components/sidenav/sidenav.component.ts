import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserRoles } from '../../../shared/interfaces/user-roles.interface';
import { UserService } from '../../../shared/services/user.service';
import { NewDraftService } from '../../services/new-draft.service';

@Component({
  selector: 'app-sidenav',
  standalone: false,
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent implements OnInit {
  private userS = inject(UserService);
  private draftS = inject(NewDraftService);
  private router = inject(Router);
  user$ = this.userS.getCurrentUser();

  UserRoles = UserRoles;

  ngOnInit(): void {}

  addDraft() {
    this.draftS
      .createDraft()
      .subscribe((id) => this.router.navigate(['e', id]));
  }
}
