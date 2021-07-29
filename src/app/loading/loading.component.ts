import { Component, OnInit } from '@angular/core';
import {UploadService} from '../services/upload.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  loading = true;
  status = '';

  constructor(private uploadSrv: UploadService) {
    this.uploadSrv.uploadWfs().then(_ => {
      this.loading = false;
      status = 'Даные успешно обновлены';
    });
    this.uploadSrv.status$.subscribe(status => {
      this.status = status;
    });
  }

  ngOnInit(): void {
  }

}
