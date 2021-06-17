import {Component, OnDestroy} from '@angular/core';
import {UploadService} from '../services/upload.service';

@Component({
  selector: 'app-import-kml',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnDestroy {
  files: any[];

  constructor(public uploadSrv: UploadService) {
    this.files = [];
    uploadSrv.file$.subscribe(file => {
      if (!!file) {
        const findFile = this.files.find(f => f.name === file.name);
        if (findFile !== undefined) {
          Object.assign(findFile, file);
        } else {
          this.files.push(file);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.uploadSrv.file = null;
  }

  // uploaded = false;
  //
  // id = 0;
  // table = [];
  // dataTable: MatTableDataSource<Geometry>;
  // displayedColumns = ['name', 'description', 'coordinates'];
  // flatNodeMap = new Map<LayerItemFlatNode, LayerNode>();
  // nestedNodeMap = new Map<LayerNode, LayerItemFlatNode>();
  // treeControl: FlatTreeControl<LayerItemFlatNode>;
  // treeFlattener: MatTreeFlattener<LayerNode, LayerItemFlatNode>;
  // dataSource: MatTreeFlatDataSource<LayerNode, LayerItemFlatNode>;





}
