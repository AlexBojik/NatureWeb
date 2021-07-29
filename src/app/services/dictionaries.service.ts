import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {HasId, Utils} from '../utils';

export class Dictionary extends HasId {
  id: number;
  name: string;
}

export class Value {
  id: number;
  name: string;
  dictId: number;
}

@Injectable({
  providedIn: 'root'
})
export class DictionariesService {
  private _dictionaries = new BehaviorSubject<Dictionary[]>([]);
  private _values = new BehaviorSubject<Value[]>([]);
  public readonly dictionaries$: Observable<Dictionary[]> = this._dictionaries.asObservable();
  public readonly values$: Observable<Value[]> = this._values.asObservable();

  url = environment.baseUrl;
  constructor(private _http: HttpClient) { }

  updateDictionaries(): void {
    const url = this.url + 'dictionaries';
    this._http.get(url).subscribe((dictionaries) => {
      this._dictionaries.next( dictionaries as Dictionary[]);
    });
  }

  saveDictionary(dict: Dictionary): void {
    const url = this.url + 'dictionaries';
    Utils.saveElement(this._http, url, dict)
      .subscribe( q => {
        this.updateDictionaries();
      });
  }

  getValues(id: number): Promise<Value[]> {
    const url = this.url + 'dictionaries/' + id;
    return this._http.get(url).toPromise().then(res => {
      return res as Value[];
    });
  }

  saveValue(value: Value): Promise<number> {
    const url = this.url + 'values';
    return Utils.saveElement(this._http, url, value).toPromise().then(id  => {
      this.getValues(value.dictId);
      return id;
    });
  }

  deleteDictionary(dict: Dictionary): void {
    const url = this.url + 'dictionaries/' + dict.id;
    this._http.delete(url).subscribe(_ => {
      this.updateDictionaries();
    });
  }

  deleteValue(value: Value): void {
    const url = this.url + 'values/' + value.id;
    this._http.delete(url).subscribe(_ => {
      this.updateDictionaries();
    });
  }

  getAllValues(): void {
    const url = this.url + 'values';
    this._http.get(url).toPromise().then(res => {
      this._values.next(res as Value[]);
    });
  }
}
