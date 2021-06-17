import { Component, OnInit } from '@angular/core';
import {UploadService} from '../services/upload.service';

@Component({
  selector: 'app-import-kpt',
  templateUrl: './import-kpt.component.html',
  styleUrls: ['./import-kpt.component.scss']
})
export class ImportKPTComponent implements OnInit {
  loading = false;

  constructor(private _loadSrv: UploadService) {
    this._loadSrv.ready$.subscribe(ready => {
      this.loading = !ready;
    });
  }

  ngOnInit(): void { }

  load(list1, list2): void {
    this.loading = true;
    // TODO: Проверка выбранности
    this._loadSrv.uploadKPT(list1[0], list2);
  }
}
