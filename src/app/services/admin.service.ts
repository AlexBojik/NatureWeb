import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

export class Dump {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private _url = environment.baseUrl;

  private _dumps = new BehaviorSubject<Dump[]>([]);
  public readonly dumps$: Observable<Dump[]> = this._dumps.asObservable();

  private _tables = new BehaviorSubject<string[]>([]);
  public readonly tables$: Observable<string[]> = this._tables.asObservable();

  constructor(private _http: HttpClient) { }

  getDumps(): void {
    const url = this._url + 'dumps';

    this._http.get(url).toPromise().then(dumps => {
      this._dumps.next(dumps as Dump[]);
    });
  }

  getTables(): void {
    const url = this._url + 'tables';

    this._http.get(url).toPromise().then(tables => {
      const t = [];
      for (const table of tables as {name: string}[]) {
        t.push(table.name);
      }
      this._tables.next(t);
    });
  }

  restoreDump(name: string): Promise<any> {
    const url = this._url + 'restore/' + name;
    return this._http.get(url).toPromise();
  }

  createDump(): void {
    const url = this._url + 'dumps';

    this._http.post(url, {}).subscribe(_ => {
      this.getDumps();
    });
  }
}
