import {Component, OnInit} from '@angular/core';
import {LayersService} from '../layers.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DictionariesService, Dictionary} from '../../services/dictionaries.service';
import {Field} from '../../services/fields.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Color} from '@angular-material-components/color-picker';
import {Layer, LAYER_UNADDED_ID} from '../models/layer';
import {ImageService} from '../../services/image.service';
import {LayerGroup} from '../models/layer-group';

@Component({
  selector: 'app-layer-detail',
  templateUrl: './layer-detail.component.html',
  styleUrls: ['./layer-detail.component.scss']
})
export class LayerDetailComponent implements OnInit {
  LAYER_UNADDED_ID = LAYER_UNADDED_ID;
  isSelected = false;
  isObjectsLayer = false;
  selected: Layer;
  layerForm: FormGroup;
  dictionaries: Dictionary[];
  fields: Field[];
  types = [
    {
      id: 'raster',
      name: 'Растровый',
    }, {
      id: 'fill',
      name: 'Заполненнные объекты',
    },
  ];
  groups: Layer[] = [];
  iconsForGroups = this._imageService.getImages();
  icons = [
    // {
    //   id: 'water',
    //   name: 'Синяя капля'
    // },
    {
      id: 'cont',
      name: 'Зеленый портфель'
    }, {
      id: 'dam',
      name: 'Плотина'
    }, {
      id: 'fish',
      name: 'Рыба'
    }, {
      id: 'greendozer',
      name: 'Зеленый бульдозер'
    }, {
      id: 'pit',
      name: 'Синий кран'
    }, {
      id: 'reddozer',
      name: 'Красный бульдозер'
    }, {
      id: 'rekr',
      name: 'Зонтик'
    }, {
      id: 'resh',
      name: 'Оранжевый портфель'
    }, {
      id: 'san',
      name: 'Зона санитарной охраны'
    }, {
      id: 'tech',
      name: 'Красный кран'
    }, {
      id: 'min',
      name: 'Министерство'
    }, {
      id: 'hands',
      name: 'Руки и дерево'
    }, {
      id: 'list',
      name: 'Лист и капля'
    }, {
      id: 'planet',
      name: 'Планета'
    }, {
      id: 'tree',
      name: 'Ель'
    }, {
      id: 'simpletree',
      name: 'Дерево'
    }, {
      id: 'duck',
      name: 'Утка'
    }];

  _hexToRgb(hex): Color {
    try {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return new Color(
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16));
    } catch (e) {
      return null;
    }
  }

  constructor(private layersSrv: LayersService,
              private dictSrv: DictionariesService,
              private fb: FormBuilder,
              private _imageService: ImageService,
              private _snackBar: MatSnackBar) {
    layersSrv.selected$.subscribe(layer => {
      // TODO: fields
      this.isSelected = false;
      if (layer) {
        this.selected = layer;
        this.fields = this.selected.fields;
        this.isObjectsLayer = this.selected.type !== 'raster';
        this.isSelected = true;
        this.selected.col = this._hexToRgb(this.selected.color);
        this.selected.col1 = this._hexToRgb(this.selected.lineColor);
        this.layerForm = this.fb.group(this.selected);
      }
    });
    layersSrv.layers$.subscribe(layers => {
      this.groups = layers.filter(l => l.isGroup);
    });
    dictSrv.dictionaries$.subscribe(dictionaries => {
      this.dictionaries = [{id: 0, name: 'Строка'}, {id: -1, name: 'Флаг'}, {id: -2, name: 'Число'}];
      this.dictionaries.push(...dictionaries);
    });
  }

  ngOnInit(): void {
  }

  addField(): void {
    this.fields.push({options: [], id: null, name: '', type: null, sort: 1});
  }
  deleteGroup(): void {
    const current = this.layerForm.value;

    if (!current.isGroup) {
      return;
    }
    const id = current.id;
    if (!id || id === LAYER_UNADDED_ID) {
      return;
    }
    this.layersSrv.deleteLayerGroup(id)
      .then(() => {
        this._snackBar.open('Успешно', 'OK', {duration: 500});
        this.layersSrv.updateLayers();
        this.layersSrv.selected = null;
      })
      .catch((r) => {
        console.log(r);
        this._snackBar.open('Ошибка сохраненения!', 'OK', {duration: 500});
      });

  }

  saveGroup(): void {
    const current = this.layerForm.value;

    if (!current.isGroup) {
      return;
    }

    const group: LayerGroup = {
      id: current.id,
      name: current.name,
      icon: current.icon,
    };

    this.layersSrv.postLayerGroup(group)
      .then(() => {
        this._snackBar.open('Успешно сохранено!', 'OK', {duration: 500});
        this.layersSrv.updateLayers();
        this.layersSrv.selected = null;
      })
      .catch((r) => {
        console.log(r);
        this._snackBar.open('Ошибка сохраненения!', 'OK', {duration: 500});
      });
  }

  save(): void {
    const current = this.layerForm.value;

    if (current.col === null) {
      current.color = '';
    } else {
      current.color = '#' + current.col.hex;
    }

    if (current.col1 === null) {
      current.lineColor = '';
    } else {
      current.lineColor = '#' + current.col1.hex;
    }

    this.layersSrv.postLayer(current)
      .then(() => {
        this._snackBar.open('Успешно сохранено!', 'OK', {duration: 500});
        this.layersSrv.updateLayers();
        this.layersSrv.selected = null;
      })
      .catch(() => {
        this._snackBar.open('Ошибка сохраненения!', 'OK', {duration: 500});
      });
  }

  clearCol(): void {
    this.layerForm.patchValue({col: null});
  }

  clearCol1(): void {
    this.layerForm.patchValue({col1: null});
  }

  delete(): void {
    this.layersSrv.delete(this.selected.id);
  }
}
