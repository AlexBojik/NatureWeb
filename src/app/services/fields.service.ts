import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

export class Field {
  id: number;
  name: string;
  type: number;
  options: Option[];
}

export class FieldValueObject {
  value: string;
  valueNum: number;
  fieldId: number;
  id: number;
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
  url = environment.baseUrl
  constructor(private _http: HttpClient) { }

  updateFields(id: number): Promise<Field[]> {
    const url = this.url + 'fields/' + id;
    return this._http.get(url)
      .toPromise()
      .then(fields => {
        return fields as Field[];
      });
  }
}
