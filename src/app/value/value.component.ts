import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DictionariesService, Value} from '../services/dictionaries.service';
import {Utils} from '../utils';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-value',
  templateUrl: './value.component.html',
  styleUrls: ['./value.component.scss']
})
export class ValueComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Value,
              private _dictSrv: DictionariesService) { }

  ngOnInit(): void {
  }

  save(): void {
    this._dictSrv.saveValue(this.data);
  }

  delete(): void {
    this._dictSrv.deleteValue(this.data);
  }
}
