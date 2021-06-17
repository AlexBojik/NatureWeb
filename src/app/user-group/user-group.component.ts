import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {UserGroups, UsersService} from '../services/users.service';

@Component({
  selector: 'app-user-group',
  templateUrl: './user-group.component.html',
  styleUrls: ['./user-group.component.scss']
})
export class UserGroupComponent implements OnInit {
  current: UserGroups;
  private _userSrv: UsersService;

  constructor(@Inject(MAT_DIALOG_DATA) public data: UserGroups, usrSrv: UsersService) {
    this.current = data;
    this._userSrv = usrSrv;
  }

  ngOnInit(): void {
  }

  save(): void {
    this._userSrv.postUserGroup(this.current);
  }
}
