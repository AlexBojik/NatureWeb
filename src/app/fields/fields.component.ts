import { Component, OnInit } from '@angular/core';
import {Field, FieldsService} from '../services/fields.service';
import {DictionariesService, Dictionary} from '../services/dictionaries.service';

@Component({
  selector: 'app-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.scss']
})
export class FieldsComponent implements OnInit {
  fields: Field[];
  trueFalseOptions = [{val: true, name: 'Ограничивать'}, {val: false, name: 'Не ограничивать'}];
  dictionaries: Dictionary[];

  constructor(private _dictSrv: DictionariesService,
              private _fldSrv: FieldsService) {
    this._dictSrv.updateDictionaries();
    this._dictSrv.dictionaries$.subscribe(dictionaries => {
      this.dictionaries = [{id: 0, name: 'Строка'}, {id: -1, name: 'Флаг'}, {id: -2, name: 'Число'}];
      this.dictionaries.push(...dictionaries);
    });
    this._updateFields();
  }

  ngOnInit(): void {
  }

  private _updateFields(): void {
    this._fldSrv.getAllFields().then(fields => {
      fields.sort((a, b) => a.name > b.name ? 0 : -1);
      this.fields = fields;
    });
  }

  deleteField(field: Field): void {
    this._fldSrv.delete(field).subscribe(_ => {
      this._updateFields();
    });
  }

  addField(): void {
    this.fields.push(new Field());
    this.fields.sort((a, b) => a.name > b.name ? 0 : -1);
  }

  save(field: Field): void {
    this._fldSrv.save(field).subscribe(_ => {
      this._updateFields();
    });
  }
}
