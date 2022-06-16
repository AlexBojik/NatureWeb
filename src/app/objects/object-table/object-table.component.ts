import {Component, OnInit, ViewChild} from '@angular/core';
import {Layer, LayersService} from '../../layers/layers.service';
import {MatTableDataSource} from '@angular/material/table';
import {GeoObject, ObjectsService} from '../../services/objects.service';
import {MatDialog} from '@angular/material/dialog';
import {ImportComponent} from '../../import/import.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ObjectsComponent} from '../object/objects.component';
import {MapboxComponent} from '../../mapbox/mapbox.component';
import * as mapboxgl from 'mapbox-gl';
import {MapService} from '../../services/map.service';
import {NavigateService} from '../../services/navigate.service';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-object-table',
  templateUrl: './object-table.component.html',
  styleUrls: ['./object-table.component.scss']
})
export class ObjectTableComponent implements OnInit {

  @ViewChild('empTbSort') empTbSort = new MatSort();

  isLoading = true;
  displayedColumns: string[] = ['id', 'name', 'description', 'delete'];
  objects: GeoObject[] = [];
  dataSource: MatTableDataSource<GeoObject>;
  current: GeoObject;
  layerLoaded: Layer;

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  constructor(private _layersSrv: LayersService,
              private _objSrv: ObjectsService,
              private _snackBar: MatSnackBar,
              private _mapSrv: MapService,
              private _navSrv: NavigateService,
              public dialog: MatDialog) {
    this._layersSrv.selected$.subscribe(layer => {
      this.update(layer)
    });
  }
  update(layer: Layer) {

    if (this.layerLoaded?.id === layer.id) { return }
    this.layerLoaded = layer
    this.isLoading = true;

    this._objSrv.getObjects(layer.id)
      .then(objects => {

        if (!layer){ return  }
        if (layer.id !== this.layerLoaded.id) { return }
        this.dataSource = null;

        this.objects = [];
        for (const f of objects) {
          const geoObject = new GeoObject(this._layersSrv.selected.id, f.properties.name, f.geometry.type, [], '', []);
          geoObject.geoJson = f.geometry;
          geoObject.id = f.id as number;
          this.objects.push(geoObject);
        }

        this.dataSource = new MatTableDataSource<GeoObject>(this.objects);
        this.dataSource.sort = this.empTbSort;
        this.isLoading = false;
      });

  }

  ngOnInit(): void {
  }

  add(): void {
    this.dialog.open(ObjectsComponent).afterClosed().subscribe((obj) => {
      if (obj) {
        this._objSrv.postObject(obj)
          .then(() => {
            this.dataSource = new MatTableDataSource<GeoObject>(this.objects);
          })
          .catch(() => {
            this._snackBar.open('Не удалось записать элемент!', 'OK', {duration: 500});
          });
      }
    });
  }

  delete(obj): void {
    // TODO: вопрос об удалении
    this._objSrv.deleteObject(obj.id)
      .then(() => {
        const index = this.objects.indexOf(obj);
        this.objects.splice(index, 1);
        this.dataSource = new MatTableDataSource<GeoObject>(this.objects);
      }).catch(() => {
        this._snackBar.open('Не удалось удалить элемент!', 'OK', {duration: 500});
    });

  }

  edit(obj: GeoObject): void {

  }

  pick(obj: GeoObject): void {
    this._layersSrv.added = this._layersSrv.selected;

    if (obj.geoJson.type === 'Point') {
      this._mapSrv.map.flyTo({center: [obj.geoJson.coordinates[0], obj.geoJson.coordinates[1]], zoom: 16});
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
    this._navSrv.showMap();
  }
}
