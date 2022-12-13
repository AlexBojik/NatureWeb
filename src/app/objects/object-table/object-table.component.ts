import { ProgressDialogComponent } from './../../progress-dialog/progress-dialog.component';
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
import { Console } from 'console';

@Component({
  selector: 'app-object-table',
  templateUrl: './object-table.component.html',
  styleUrls: ['./object-table.component.scss']
})
export class ObjectTableComponent implements OnInit {

  @ViewChild('empTbSort') empTbSort = new MatSort();

  isLoading = true;
  displayedColumns: string[] = ['selection', 'id', 'name', 'description', 'controls'];
  objects: GeoObject[] = [];
  dataSource: MatTableDataSource<GeoObject>;
  current: GeoObject;
  layerLoaded: Layer;

  _checkedAll: boolean
  public set checkedAll(v: boolean) {
    this._checkedAll = v;
    for (const obj of this.objects) {
      obj.checked = this._checkedAll
    }
  }

  public get checkedAll() : boolean {
    return this._checkedAll
  }



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

  delete(obj: GeoObject): void {
    // TODO: вопрос об удалении
    this.dialog.open(ProgressDialogComponent);
    let deleteList = this.objects.filter( o => o.checked)
    if (deleteList.length === 0) {
      obj.checked = true
      deleteList = [obj]
    }

    const deletePromises = deleteList.map (deleteObj => {
      return this._objSrv.deleteObject(deleteObj.id)
        .then(() => {
          return {id: deleteObj.id, success: true}
        }).catch(() => {
          return {id: deleteObj.id, success: false}
      });
    });

    Promise.all(deletePromises).then( (results) => {
      const isHasError = results.find( r => !r.success) || false
      if (isHasError) {
        this._snackBar.open('Не удалось удалить минимум один элемент!', 'OK', {duration: 500});
      }
      const successDeletedIds = results.filter( r => r.success).map ( r => r.id)
      for (const objectId of successDeletedIds) {
        const deletedObjIndex = this.objects.findIndex( o => o.id == objectId)
        if (deletedObjIndex !== undefined) {
          this.objects.splice(deletedObjIndex, 1);
        }
      }
      this.dataSource = new MatTableDataSource<GeoObject>(this.objects);
      this._checkedAll = false
      this.dialog.closeAll()
    })

    // this._objSrv.deleteObject(obj.id)
    //   .then(() => {
    //     const index = this.objects.indexOf(obj);
    //     this.objects.splice(index, 1);
    //     this.dataSource = new MatTableDataSource<GeoObject>(this.objects);
    //   }).catch(() => {
    //     this._snackBar.open('Не удалось удалить элемент!', 'OK', {duration: 500});
    // });

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
