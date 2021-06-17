import {AfterViewInit, Component, ElementRef, Inject, Optional, ViewChild} from '@angular/core';
import {LayersService} from '../layers/layers.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DynamicComponentService} from '../services/dynamic-component.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {GeoObject, ObjectsService} from '../services/objects.service';
import {MapService} from '../services/map.service';

@Component({
  selector: 'app-mapbox',
  templateUrl: './mapbox.component.html',
  styleUrls: ['./mapbox.component.scss'],
})
export class MapboxComponent implements AfterViewInit {
  @ViewChild('map', {static: false}) private mapViewEl: ElementRef;

  obj: GeoObject;
  constructor(private _layerSrv: LayersService,
              private _snackBar: MatSnackBar,
              private _componentSrv: DynamicComponentService,
              private _objSrv: ObjectsService,
              private _mapSrv: MapService,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: GeoObject) {
    this.obj = data;
  }

  ngAfterViewInit(): void {
    this._mapSrv.initMap(this.mapViewEl);
  }
}
