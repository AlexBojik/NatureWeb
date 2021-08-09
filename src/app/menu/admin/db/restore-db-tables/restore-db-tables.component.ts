import { Component, OnInit } from '@angular/core';
import {AdminService} from '../../../../services/admin.service';

@Component({
  selector: 'app-restore-db-tables',
  templateUrl: './restore-db-tables.component.html',
  styleUrls: ['./restore-db-tables.component.scss']
})
export class RestoreDbTablesComponent implements OnInit {
  tables = [];
  restoring = false;

  constructor(_admSrv: AdminService) {
    _admSrv.tables$.subscribe(ts => {
      this.tables = ts;
    });
    _admSrv.getTables();
  }

  ngOnInit(): void {
  }

  restore(): void {
    this.restoring = true;
    setTimeout(_ => {
      this.restoring = false;
      }, 1000);
  }
}
