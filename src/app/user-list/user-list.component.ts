import { Component } from '@angular/core';
import {User, UsersService} from '../services/users.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {
  displayedColumns: string[] = ['name', 'phone', 'email', 'admin', 'layers', 'dicts', 'messages'];
  dataSource = [];
  private _us: UsersService;

  constructor(private us: UsersService) {
    this._us = us;
    us.userList$.subscribe(value => {
      this.dataSource = value;
    });
    us.getUsers();
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
}
