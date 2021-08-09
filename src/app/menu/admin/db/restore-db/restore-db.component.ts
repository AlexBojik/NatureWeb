import { Component, OnInit } from '@angular/core';
import {AdminService, Dump} from '../../../../services/admin.service';

@Component({
  selector: 'app-restore-db',
  templateUrl: './restore-db.component.html',
  styleUrls: ['./restore-db.component.scss']
})
export class RestoreDbComponent implements OnInit {
  dumps: Dump[];
  current = '';
  restoring = false;

  constructor(private _admSrv: AdminService) {
    this._admSrv.dumps$.subscribe(dumps => {
      this.dumps = dumps;
    });
    this._admSrv.getDumps();
  }

  ngOnInit(): void {
  }

  restore(): void {
    this.restoring = true;
    this._admSrv.restoreDump(this.current).then(_ => {
      this.restoring = false;
    });
  }
}
