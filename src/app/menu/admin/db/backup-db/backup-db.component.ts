import { Component, OnInit } from '@angular/core';
import {AdminService, Dump} from '../../../../services/admin.service';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-backup-db',
  templateUrl: './backup-db.component.html',
  styleUrls: ['./backup-db.component.scss']
})
export class BackupDbComponent implements OnInit {
  dumps: Dump[];
  dumpsCatalog = environment.baseUrl + 'dump/';
  creating = false;

  constructor(private _admSrv: AdminService) {
    this._admSrv.dumps$.subscribe(dumps => {
      this.dumps = dumps;
      this.creating = false;
    });
    this._admSrv.getDumps();
  }

  ngOnInit(): void {
  }

  createDump(): void {
    this._admSrv.createDump();
    this.creating = true;
  }
}
