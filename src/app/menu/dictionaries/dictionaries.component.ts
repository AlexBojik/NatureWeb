import {Component, OnInit} from '@angular/core';
import {DictionariesService, Dictionary, Value} from '../../services/dictionaries.service';
import {MatDialog} from '@angular/material/dialog';
import {DictionaryComponent} from './dictionary/dictionary.component';
import {MatSnackBar} from '@angular/material/snack-bar';

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
      console.log(values);
      this.values = values;
    });
  }

  add(): void {
    this.dialog.open(DictionaryComponent, {minWidth: '40vw'}).afterClosed().subscribe((dict) => {
      if (dict) {
        this._dictSrv.postDictionary(dict)
          .then(() => {
            this._dictSrv.updateDictionaries();
          })
          .catch(() => {
            this._snackBar.open('Не удалось записать справочник!', 'OK', {duration: 500});
          });
      }
    });
  }

  addValue(): void {
    this.dialog.open(DictionaryComponent).afterClosed().subscribe((name) => {
      if (name) {
        const value = new Value();
        value.name = name;
        value.dictId = this.selected.id;
        this._dictSrv.postValue(value)
          .then((res) => {
            console.log(res);
            this.onClick(this.selected);
          })
          .catch((err) => {
            console.log(err);
            this._snackBar.open('Не удалось записать справочник!', 'OK', {duration: 500});
          });
      }
    });
  }
}
