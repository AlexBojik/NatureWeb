import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {User, UserGroups, UsersService} from '../services/users.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  current: User;
  userGroups: UserGroups[];
  constructor(@Inject(MAT_DIALOG_DATA) public data: User, private usrSrv: UsersService) {
    this.usrSrv.getUserGroups().subscribe(userGroups => {
      this.userGroups = userGroups as UserGroups[];
    });
    this.current = data;
  }

  ngOnInit(): void {
  }

  save(): void {
    this.usrSrv.updateUser(this.current);
  }

  changeGroup(ug: UserGroups): void {
    this.current.admin = ug.admin;
    this.current.layers = ug.layers;
    this.current.messages = ug.messages;
    this.current.dicts = ug.dicts;
    this.current.info = ug.info;
  }
}
