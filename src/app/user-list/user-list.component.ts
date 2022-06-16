import {AfterViewInit, Component, Input, ViewChild} from '@angular/core';
import {User, UserGroups, UsersService} from '../services/users.service';
import {MatDialog} from '@angular/material/dialog';
import {UserComponent} from '../user/user.component';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements AfterViewInit {
  displayedColumns: string[] = ['name', 'phone', 'email', 'admin', 'layers', 'dicts', 'messages', 'info', 'block', 'delete'];
  dataSource = new MatTableDataSource([]);
  @Input() userGroup: UserGroups;
  current: User;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private _usrSrv: UsersService, private _dialog: MatDialog) {}

  toggleAdmin(user: User): void {
    this._usrSrv.updateUser(user);
  }

  toggleLayers(user: User): void {
    this._usrSrv.updateUser(user);
  }

  toggleDicts(user: User): void {
    this._usrSrv.updateUser(user);
  }

  toggleDMessages(user: User): void {
    this._usrSrv.updateUser(user);
  }

  edit(user: User): void {
    this._dialog.open(UserComponent, {
      data: user
    });
  }

  toggleInfo(user: User): void {
    this._usrSrv.updateUser(user);
  }

  ngAfterViewInit(): void {
    this._usrSrv.getUsersWithGroup(this.userGroup).subscribe(users => {
      this.dataSource = new MatTableDataSource(users);
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  toggleBlock(user: User): void {
    this._usrSrv.updateUser(user);
  }

  delete(user: User): void {
    this._usrSrv.deleteUser(user).then(_ => {
      this.ngAfterViewInit();
    });
  }
}
