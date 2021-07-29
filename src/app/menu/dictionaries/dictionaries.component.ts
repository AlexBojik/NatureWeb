import {Component, OnInit} from '@angular/core';
import {DictionariesService, Dictionary, Value} from '../../services/dictionaries.service';
import {MatDialog} from '@angular/material/dialog';
import {DictionaryComponent} from './dictionary/dictionary.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ValueComponent} from '../../value/value.component';

@Component({
  selector: 'app-dictionaries',
  templateUrl: './dictionaries.component.html',
  styleUrls: ['./dictionaries.component.scss']
})
export class DictionariesComponent implements OnInit {

  dictionaries: Dictionary[] = [];
  selected = null;
  values = [];

  constructor(private _dictSrv: DictionariesService,
              private _snackBar: MatSnackBar,
              public dialog: MatDialog) {
    _dictSrv.updateDictionaries();
    _dictSrv.dictionaries$.subscribe(dicts => this.dictionaries = dicts);
  }

  ngOnInit(): void {
  }

  onClick(dict): void {
    this.selected = dict;
    this._dictSrv.getValues(dict.id).then(values => {
      this.values = values;
    });
  }

  add(): void {
    this.dialog.open(DictionaryComponent, {minWidth: '40vw', data: new Dictionary()});
  }

  addValue(): void {
    const value = new Value();
    value.dictId = this.selected.id;
    this.dialog.open(ValueComponent, {minWidth: '40vw', data: value}).afterClosed().subscribe(_ => {
      this.onClick(this.selected);
    });
  }

  edit(dict: Dictionary): void {
    this.dialog.open(DictionaryComponent, {minWidth: '40vw', data: dict});
  }

  editValue(value: Value): void {
    this.dialog.open(ValueComponent, {minWidth: '40vw', data: value}).afterClosed().subscribe(_ => {
      this.onClick(this.selected);
    });
  }
}
