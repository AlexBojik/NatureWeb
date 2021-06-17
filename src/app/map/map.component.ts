import { Component } from '@angular/core';
import {UsersService} from '../services/users.service';
import {MatDialog} from '@angular/material/dialog';
import {FilterComponent} from '../filter/filter.component';
import {MapService} from '../services/map.service';
import {ObjectsService} from '../services/objects.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {
  get isDraw(): boolean {
    return this._mapSrv.drawMode > 0;
  }

  get isDrawObject(): boolean {
    return this._mapSrv.drawMode === 2;
  }

  constructor(private _usrSrv: UsersService,
              private _objSrv: ObjectsService,
              public dialog: MatDialog,
              private _mapSrv: MapService) {
    this._usrSrv.user$.subscribe(user => {
      // this.user = (user === 'Пользователь');
    });
  }

  flyToLocate(): void {
    this._mapSrv.flyToLocate();
  }

  filter(): void {
    this.dialog.open(FilterComponent);
  }

  cancelDraw(): void {
    this._mapSrv.closeDraw();
  }

  saveDraw(): void {
    this._objSrv.saveDrawObject();
    this._mapSrv.closeDraw();
  }
}
