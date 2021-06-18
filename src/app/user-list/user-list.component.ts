import {Component, Input} from '@angular/core';
import {User, UsersService} from '../services/users.service';
import {MatDialog} from '@angular/material/dialog';
import {UserComponent} from '../user/user.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {
  displayedColumns: string[] = ['name', 'phone', 'email', 'admin', 'layers', 'dicts', 'messages', 'info', 'delete'];
  @Input() dataSource;
  private _us: UsersService;
  private _dialog: MatDialog;
  current: User;

  constructor(private us: UsersService, private dialog: MatDialog) {
    this._dialog = dialog;
    this._us = us;
  }

  toggleAdmin(user: User): void {
    this._us.updateUser(user);
  }

  toggleLayers(user: User): void {
    this._us.updateUser(user);
  }

  toggleDicts(user: User): void {
    this._us.updateUser(user);
  }

  toggleDMessages(user: User): void {
    this._us.updateUser(user);
  }

  edit(user: User): void {
    this._dialog.open(UserComponent, {
      data: user
    });
  }

  toggleInfo(user: User): void {
    this._us.updateUser(user);
  }
}
