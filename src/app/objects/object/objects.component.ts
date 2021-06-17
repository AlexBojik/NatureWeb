import {Component, OnInit, ViewChild} from '@angular/core';
import {GeoObject} from '../../services/objects.service';
import {Layer, LayersService} from '../../layers/layers.service';

@Component({
  selector: 'app-objects',
  templateUrl: './objects.component.html',
  styleUrls: ['./objects.component.scss']
})
export class ObjectsComponent implements OnInit {
  @ViewChild('coordinateComponent') private coordinateComponent;

  obj: GeoObject;
  layers: Layer[];
  types = [{id: 'Point', name: 'Точка'}, {id: 'Polygon', name: 'Полигон'}];

  get hasFields(): boolean {
    return true;
    // return this._layersSrv.selected.fields.length > 0;
  }

  // TODO: Сделать реактивные формы
  constructor(private _layersSrv: LayersService) {
  }

  ngOnInit(): void {
    this.obj = new GeoObject(this._layersSrv.selected.id, '', '', [], '');
  }

  updateCoordinates(): void {
    let coordinates = [];
    for (const line of this.coordinateComponent.coordinates.split(/[\r\n]+/)) {
      const [x, y] = line.split(',');
      coordinates.push([parseFloat(x), parseFloat(y)]);
    }
    if (this.obj.type === 'Polygon') {
      const [x1, y1] = coordinates[0];
      const [x2, y2] = coordinates.slice(-1)[0];
      if (x1 !== x2 || y1 !== y2) {
        coordinates.push([x1, y1]);
      }
      coordinates = [coordinates];
    } else {
      coordinates = [coordinates[0][0], coordinates[0][1]];
    }
    this.obj.geoJson = this.obj.geoJsonFrom(coordinates);
  }
}
