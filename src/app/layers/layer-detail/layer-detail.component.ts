import {Component, OnInit} from '@angular/core';
import {Layer, LayersService} from '../layers.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DictionariesService, Dictionary} from '../../services/dictionaries.service';
import {Field} from '../../services/fields.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Color} from '@angular-material-components/color-picker';

@Component({
  selector: 'app-layer-detail',
  templateUrl: './layer-detail.component.html',
  styleUrls: ['./layer-detail.component.scss']
})
export class LayerDetailComponent implements OnInit {
  isSelected = false;
  isFillLayer = false;
  selected: Layer;
  layerForm: FormGroup;
  dictionaries: Dictionary[];
  fields: Field[];

  _hexToRgb(hex): [number, number, number] {
    try {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ];
    } catch (e) {
      return [0, 0, 0];
    }
  }

  constructor(private layersSrv: LayersService,
              private dictSrv: DictionariesService,
              private fb: FormBuilder,
              private _snackBar: MatSnackBar) {
    layersSrv.selected$.subscribe(layer => {
      // TODO: fields and color
      this.isSelected = false;
      if (layer) {
        this.selected = layer;
        // this.fields = this.selected.fields;
        this.isFillLayer = this.selected.type === 'fill';
        this.isSelected = true;
        const [r, g, b] = this._hexToRgb(this.selected.color);
        this.selected.col = new Color(r, g, b);
        this.layerForm = this.fb.group(this.selected);
      }
    });
    dictSrv.dictionaries$.subscribe(dictionaries => {
      this.dictionaries = [{id: 0, name: 'Строка'}, {id: -1, name: 'Флаг'}, {id: -2, name: 'Число'}];
      this.dictionaries.push(...dictionaries);
    });
  }

  ngOnInit(): void {
  }

  addField(): void {
    this.fields.push({options: [], id: null, name: '', type: null});
  }

  save(): void {
    const current = this.layerForm.value;
    this.selected.name = current.name;
    if (this.isFillLayer) {
      this.selected.color = '#' + current.col.hex;
    }
    this.layersSrv.postLayer(this.selected)
      .then(() => {
        this._snackBar.open('Успешно сохранено!', 'OK', {duration: 500});
      })
      .catch(() => {
        this._snackBar.open('Ошибка сохраненения!', 'OK', {duration: 500});
      });
  }

  deleteField(field: Field): void {
    const index = this.fields.indexOf(field, 0);
    if (index > -1) {
      this.fields.splice(index, 1);
    }
  }
}
