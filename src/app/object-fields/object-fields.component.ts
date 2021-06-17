import {Component, Input, OnInit} from '@angular/core';
import {GeoObject} from '../services/objects.service';
import {FieldValue} from '../services/fields.service';
import {LayersService} from '../layers/layers.service';

@Component({
  selector: 'app-object-fields',
  templateUrl: './object-fields.component.html',
  styleUrls: ['./object-fields.component.scss']
})
export class ObjectFieldsComponent implements OnInit {
  @Input() object: GeoObject;
  fields: FieldValue[] = [];

  constructor(private _layersSrv: LayersService) {
  }

  ngOnInit(): void {
    // TODO: fields
    // this._layersSrv.selected.fields.forEach(field => {
    // let value = null;
    // if (this.object.fields) {
    //   const objField = this.object.fields.find(f => f.id === field.id);
    //   if (objField) {
    //     value = objField.value;
    //   }
    // }
    // this.fields.push({field, value});
    // });
  }
}
