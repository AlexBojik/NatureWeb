import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {URL_USER, URL_USER_GROUPS, URL_USER_LIST, URL_USER_PUT} from '../../consts';

export class User {
  id: number
  name: string;
  phone: string;
  email: string;
  token: string;
  snils: string;
  regAddr: string;
  proAddr: string;
  doc: string;
  admin: boolean;
  layers: boolean;
  dicts: boolean;
  messages: boolean;
  info: boolean;
  group: number;
  block: boolean;
}

export class UserGroups {
  id: number;
  name: string;
  admin: boolean;
  layers: boolean;
  dicts: boolean;
  messages: boolean;
  info: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private _http: HttpClient) {
    const token = localStorage.getItem('token');
    if (token) {
      this.token.next(token);
      this.getUser(token);
    }
  }

  get hasEditRole(): boolean {
    return this.user.getValue() !== null;
  }

  hasAdminRole(): boolean {
    return this.user.getValue().admin;
  }

  user = new BehaviorSubject<User>(null);
  private _users = new BehaviorSubject<User[]>([]);
  public readonly user$: Observable<User> = this.user.asObservable();
  public readonly userList$: Observable<User[]> = this._users.asObservable();

  token = new BehaviorSubject('');

  static checkToken(): void {
    const url = window.location.href.split('?');
    if (url.length > 1) {
      const res = new URLSearchParams(url[1]);
      localStorage.setItem('token', res.get('t'));
      window.location.href = url[0];
    }
  }

  getUser(token: string): void {
    this._http.get(URL_USER + token).subscribe(user => {
      if (user != null) {
        this.user.next(user as User);
      }
    });
  }

  getUsers(): void {
    this._http.get(URL_USER_LIST).subscribe(users => {
      this._users.next(users as [User]);
    });
  }

  getUsersWithGroup(userGroup: UserGroups): Observable<User[]> {
    return this._http.get(URL_USER_LIST + '/' + userGroup.id) as Observable<User[]>;
  }

  updateUser(params): void {
    this._http.post(URL_USER_PUT, params).subscribe();
  }

  getUserGroups(): Observable<UserGroups[]> {
    return this._http.get(URL_USER_GROUPS) as Observable<UserGroups[]>;
  }

  postUserGroup(current: UserGroups): Observable<number> {
    return this._http.post(URL_USER_GROUPS, current) as Observable<number>;
  }

  deleteUser(user: User): Promise<any> {
    return this._http.delete(URL_USER + '/' + user.token).toPromise();
  }
}
