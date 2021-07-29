import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {Utils} from '../utils';

export class Field {
  id: number;
  name: string;
  type: number;
  limitation?: boolean;
  options: Option[];
}

export class FieldValueObject {
  value?: string;
  valueNum?: number;
  fieldId?: number;
  id?: number;
}

export class FieldValue {
  value: number | string;
  field: Field;
}

export class Option {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class FieldsService {
  url = environment.baseUrl;
  constructor(private _http: HttpClient) { }

  updateFields(id: number): Promise<Field[]> {
    const url = this.url + 'fields/' + id;
    return this._http.get(url)
      .toPromise()
      .then(fields => {
        return fields as Field[];
      });
  }

  getAllFields(): Promise<Field[]> {
    const url = this.url + 'fields';
    return this._http.get(url).toPromise().then(fields => {
      return Promise.resolve(fields as Field[]);
    });
  }

  delete(field: Field): Observable<any> {
    const url = this.url + 'fields/' + field.id;
    return this._http.delete(url);
  }

  save(field: Field): Observable<any> {
    const url = this.url + 'fields';
    return Utils.saveElement(this._http, url, field);
  }
}
