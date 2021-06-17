import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UploadService} from '../services/upload.service';
import {MatDialog} from '@angular/material/dialog';
import {ImportComponent} from '../import/import.component';
import {ImportKPTComponent} from '../import-kpt/import-kpt.component';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  @ViewChild('fileInput', {static: false}) fileInput: ElementRef;
  @ViewChild('folderInput', {static: false}) folderInput: ElementRef;

  constructor(private uploadSrv: UploadService,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
  }

  openFileUploadDialog(folder?): void {
    let elem = this.fileInput.nativeElement;
    if (folder) {
      elem = this.folderInput.nativeElement;
    }
    elem.onchange = () => {
      this.uploadFiles(elem.files);
      elem.value = '';
    };
    elem.click();
  }

  uploadFiles(list): void {
    this.dialog.open(ImportComponent);
    for (const file of list) {
      const ext = file.name.toLowerCase().split('.').slice(-1)[0];
      switch (ext) {
        case 'xls':
          this.uploadSrv.file = {name: file.webkitRelativePath ? file.webkitRelativePath : file.name, loading: true};
          this.uploadSrv.uploadXLS(file);
          break;
        case 'xlsx':
          this.uploadSrv.file = {name: file.webkitRelativePath ? file.webkitRelativePath : file.name, loading: true};
          this.uploadSrv.uploadXLS(file);
          break;
        case 'mif':
          this.uploadSrv.file = {name: file.webkitRelativePath ? file.webkitRelativePath : file.name, loading: true};
          this.uploadSrv.uploadMIF(file);
          break;
        case 'kml':
          this.uploadSrv.file = {name: file.webkitRelativePath ? file.webkitRelativePath : file.name, loading: true};
          this.uploadSrv.uploadKML(file);
          break;
      }
    }
  }

  updateWfs(): void {
    this.uploadSrv.uploadWfs();
  }

  importKPT(): void {
    this.dialog.open(ImportKPTComponent);
  }
}
