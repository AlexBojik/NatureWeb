import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {URL_FIELDS} from '../../consts';

export class Dictionary {
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

  postDictionary(name: string): Promise<any> {
    const url = this.url + 'dictionaries';
    return this._http.post(url, {id: 0, name}).toPromise();
  }

  getValues(id: number): Promise<Value[]> {
    const url = this.url + 'dictionaries/' + id;
    return this._http.get(url).toPromise().then(res => {
      return res as Value[];
    });
  }

  postValue(value: Value): Promise<any> {
    const url = this.url + 'value/';
    return this._http.post(url, value).toPromise();
  }

  getAllValues(): void {
    this._http.get(URL_FIELDS).toPromise().then(res => {
      this._values.next(res as Value[]);
    });
  }
}
