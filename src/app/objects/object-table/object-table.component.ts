import {Component, OnInit} from '@angular/core';
import {LayersService} from '../../layers/layers.service';
import {MatTableDataSource} from '@angular/material/table';
import {GeoObject, ObjectsService} from '../../services/objects.service';
import {MatDialog} from '@angular/material/dialog';
import {ImportComponent} from '../../import/import.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ObjectsComponent} from '../object/objects.component';
import {MapboxComponent} from '../../mapbox/mapbox.component';

@Component({
  selector: 'app-object-table',
  templateUrl: './object-table.component.html',
  styleUrls: ['./object-table.component.scss']
})
export class ObjectTableComponent implements OnInit {
  loading = true;
  displayedColumns: string[] = ['id', 'name', 'description', 'delete'];
  objects: GeoObject[] = [];
  dataSource: MatTableDataSource<GeoObject>;
  current: GeoObject;

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  constructor(private _layersSrv: LayersService,
              private _objSrv: ObjectsService,
              private _snackBar: MatSnackBar,
              public dialog: MatDialog) {
    this._layersSrv.selected$.subscribe(l => {
      this.loading = true;
      this.loading = false;
      // TODO: подгрузка таблицы объектов
      // this._objSrv.getObjects(l.id)
      //   .then(objects => {
      //     this.loading = false;
      //     // l.objects = objects;
      //     this.objects = objects;
      //     this.dataSource = new MatTableDataSource<GeoObject>(this.objects);
      //   });
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
    this.dialog.open(MapboxComponent, {width: '600px', height: '600px', data: obj});
  }
}
