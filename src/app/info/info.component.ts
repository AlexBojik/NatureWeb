import {Component, OnInit} from '@angular/core';
import {ObjectsService} from '../services/objects.service';
import {CoordinateService} from '../services/coordinate.service';
import {Layer, LayersService} from '../layers/layers.service';
import {UsersService} from '../services/users.service';
import {MatDialog} from '@angular/material/dialog';
import {CoordinateComponent} from '../coordinate/coordinate.component';
import {MapService} from '../services/map.service';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {

  x: number;
  y: number;

  formatXY = true;
  objects = [];
  commonObjects: Map<number, Layer>;

  hasEditRole = false;

  constructor(private _objSrv: ObjectsService,
              private _coordSrv: CoordinateService,
              private _layersSrv: LayersService,
              private _usrSrv: UsersService,
              private _mapSrv: MapService,
              public dialog: MatDialog) {

    _usrSrv.user$.subscribe(usr => {
      this.hasEditRole = _usrSrv.hasAdminRole();
      console.log(this.hasEditRole);
    });

    this._objSrv.filtered$.subscribe(features => {
      this.objects = [];
      this.commonObjects = new Map<number, Layer>();
      features.forEach(f => {
        const layer = this._layersSrv.getLayerById('layer' + f.layerId);
        if (layer) {
          const name = f.name ? f.name : layer.commonName;
          const info = {name, description: f.description, id: f.id, geoJson: f.geoJson, layer};
          this.objects.push(info);
          if (layer.commonDescription) {
            this.commonObjects[layer.id] = layer;
          }
        }
      });
    });


    this._coordSrv.current$.subscribe(c => {
      [this.x, this.y] = c;
      this.formatXY = this._coordSrv.formatXY;
    });
  }

  ngOnInit(): void {
  }

  grad(dec): string {
    const g = Math.trunc(dec);
    const m = Math.trunc((dec - g) * 60);
    const s = Math.round((dec - g - m / 60) * 36000) / 10;
    return g + '° ' + ('00' + m).slice(-2) + '\' ' + s + '"';
  }

  transform(): void {
    this._coordSrv.formatXY = !this.formatXY;
    this.formatXY = this._coordSrv.formatXY;
  }

  delete(id: any): void {
    this._objSrv.deleteObject(id);
  }

  openCoordinates(obj): void {
    this.dialog.open(CoordinateComponent, {
      maxHeight: '90vh',
      data: obj
    });
  }

  position(obj): void {
    this._layersSrv.added = obj.layer;
    if (obj.geoJson.type === 'Point') {
      this._mapSrv.map.flyTo({center: obj.geoJson.coordinates, zoom: 16});
    } else if (obj.geoJson.type === 'Polygon') {
      const bounds = new mapboxgl.LngLatBounds();
      obj.geoJson.coordinates[0].forEach(c => {
        bounds.extend([c[0], c[1]]);
      });

      this._mapSrv.map.fitBounds(bounds, {padding: 100});
    } else if (obj.geoJson.type === 'MultiPolygon') {
      const bounds = new mapboxgl.LngLatBounds();
      obj.geoJson.coordinates[0][0].forEach(c => {
        bounds.extend([c[0], c[1]]);
      });

      this._mapSrv.map.fitBounds(bounds, {padding: 100});
    }
  }

  values(map): Layer[] {
    return Object.values(map);
  }

  edit(obj): void {
    this._objSrv.editing = obj.id;
    this._objSrv.layerToUpdate = obj.layer.id;
    this._mapSrv.drawEdit();
  }
}
