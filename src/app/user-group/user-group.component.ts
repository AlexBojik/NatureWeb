import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {User, UserGroups, UsersService} from '../services/users.service';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-user-group',
  templateUrl: './user-group.component.html',
  styleUrls: ['./user-group.component.scss']
})
export class UserGroupComponent implements OnInit {
  current: UserGroups;
  private _userSrv: UsersService;
  users: Set<User> = new Set<User>();
  userList: User[];
  filteredOptions: Observable<User[]>;
  userControl = new FormControl();

  constructor(@Inject(MAT_DIALOG_DATA) public data: UserGroups, usrSrv: UsersService) {
    this.current = data;
    this._userSrv = usrSrv;
    const all = new UserGroups();
    all.id = 0;
    usrSrv.getUsersWithGroup(all).subscribe(users => {
      this.userList = users;
      users.forEach(user => {
        if (user.group === this.current.id) {
          this.users.add(user);
        }
      });
      this.userControl.setValue('');
    });
  }

  ngOnInit(): void {
    this.filteredOptions = this.userControl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.name),
        map(name => name ? this._filter(name) : this.userList)
      );
  }

  save(): void {
    this._userSrv.postUserGroup(this.current).subscribe(id => {
      this.users.forEach(user => {
        user.group = id;
        user.admin = this.current.admin;
        user.layers = this.current.layers;
        user.dicts = this.current.dicts;
        user.messages = this.current.messages;
        user.info = this.current.info;
        this._userSrv.updateUser(user);
      });
    });
  }

  displayFn(user: User): string {
    return user && user.name ? user.name : '';
  }

  private _filter(name: string): User[] {
    const filterValue = name.toUpperCase();

    return this.userList.filter(user => user.name.toUpperCase().indexOf(filterValue) === 0);
  }

  optionClicked(event: MouseEvent, user: User): void {
    this.users.add(user);
    event.stopPropagation();
    this.userControl.setValue('');
  }
}
