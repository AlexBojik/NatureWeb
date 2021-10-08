import { Component, OnInit } from '@angular/core';
import {File, FilesService} from '../../../services/files.service';
import {environment} from '../../../../environments/environment';
import * as ClipboardJS from 'clipboard';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {
  files: File[];
  uploading = false;
  filesCatalog = environment.baseUrl + 'file/';
  current: File;

  constructor(private _fileService: FilesService) {
    _fileService.files$.subscribe(files => {
      this.files = files;
    });
    _fileService.getFiles();

    const _ = new ClipboardJS('.copy', {
      text: () => {
        return this.copiedText(this.current.name);
      }
    });
  }

  ngOnInit(): void {
  }

  copiedText(name: string): string {
    return '<a href="' + this.filesCatalog + name + '">' + name + '</a>';
  }

  load(files: FileList): void {
    this.uploading = true;

    this._fileService.uploadFiles(files).then(_ => {
      this.uploading = false;
    });
  }

  delete(f: File): void {
    this._fileService.deleteFile(f);
  }

}
