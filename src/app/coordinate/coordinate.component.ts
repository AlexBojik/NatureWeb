import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ObjectsService} from '../services/objects.service';

@Component({
  selector: 'app-coordinate',
  templateUrl: './coordinate.component.html',
  styleUrls: ['./coordinate.component.scss']
})
export class CoordinateComponent implements OnInit {
  coordinates: Array<{lat: number, lon: number, id: number}> = [];
  // coordinates  = '';
  coordinatesFg = '';
  id: number;
  type: string;
  types = [{id: 'Point', name: 'Точка'}, {id: 'Polygon', name: 'Полигон'}, {id: 'MultiPolygon', name: 'Сложный полигон'}];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private _objSrv: ObjectsService) {
    this.type = data.geoJson.type;
    this.id = 0;
    if (data.geoJson.type === 'Point') {
      const c = data.geoJson.coordinates;
      this.coordinates.push({lon: c[0], lat: c[1], id: this.id++});
      // this.coordinates += '' + c[1] + ' ' + c[0];
      this.coordinatesFg += '' + this.grad(c[1]) + 'С.Ш. \t' + this.grad(c[0]) + ' В.Д.';
    } else if (data.geoJson.type === 'Polygon') {
      data.geoJson.coordinates[0].forEach(c => {
        this.coordinates.push({lon: c[0], lat: c[1], id: this.id++});
        // this.coordinates += '' + c[0] + '  ' + c[1] + '\n';
        this.coordinatesFg += '' + this.grad(c[1]) + ' С.Ш. \t' + this.grad(c[0]) + ' В.Д.\n';
      });
    } else if (data.geoJson.type === 'MultiPolygon') {
      data.geoJson.coordinates[0][0].forEach(c => {
        this.coordinates.push({lon: c[0], lat: c[1], id: this.id++});
        // this.coordinates += '' + c[0] + ' ' + c[1] + '\n';
        this.coordinatesFg += '' + this.grad(c[1]) + ' С.Ш. \t' + this.grad(c[0]) + ' В.Д.\n';
      });
    }
  }

  grad(dec): string {
    const g = Math.trunc(dec);
    const m = Math.trunc((dec - g) * 60);
    const s = Math.round((dec - g - m / 60) * 36000) / 10;
    return g + '° ' + ('00' + m).slice(-2) + '\' ' + s + '"';
  }

  ngOnInit(): void {
  }

  delete(c): void {
    const index = this.coordinates.findIndex(val => val.id === c.id);
    this.coordinates.splice(index, 1);
  }

  save(): void {
    let coordinates = [];
    const coords = [];
    this.coordinates.forEach(c => {
      coords.push([c.lon, c.lat]);
    });
    if (this.type === 'Point') {
      coordinates = coords;
    } else if (this.type === 'Polygon') {
      coordinates.push(coords);
    } else {
      coordinates.push([coords]);
    }

    this._objSrv.updateCoordinates(this.type, coordinates, this.data.id, this.data.layer.id);
  }

  add(): void {
    this.coordinates.push({id: this.id, lon: 0, lat: 0});
  }
}
