import { Component, OnInit } from '@angular/core';
import {User, UserGroups, UsersService} from '../services/users.service';
import {MatDialog} from '@angular/material/dialog';
import {UserGroupComponent} from '../user-group/user-group.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  private _dialog: MatDialog;
  private _usrSrv: UsersService;
  userGroups: UserGroups[] = [];
  users: User[];
  current: UserGroups;

  constructor(usrSrv: UsersService, dialog: MatDialog) {
    this._dialog = dialog;
    this._usrSrv = usrSrv;

    this._updateUserGroups();
  }

  ngOnInit(): void {

  }

  private _updateUserGroups(): void {
    this.userGroups = [];
    const all = new UserGroups();
    all.name = 'Все пользователи';
    this.userGroups.push(all);
    this._usrSrv.getUserGroups().subscribe( groups => {
      this.userGroups.push(...groups as UserGroups[]);
    });
  }

  add(): void {
    this._openEditDialog(new UserGroups());
  }

  onClick(userGroup: UserGroups): void {
    this._usrSrv.getUsersWithGroup(userGroup).subscribe(users => {
      this.users = users as User[];
    });
    this.current = userGroup;
  }

  private _openEditDialog(element: UserGroups): void {
    this._dialog.open(UserGroupComponent, {
      data: element
    }).afterClosed().subscribe(ug => {
      this._updateUserGroups();
    });
  }

  edit(userGroup: UserGroups): void {
    this._openEditDialog(userGroup);
  }
}
