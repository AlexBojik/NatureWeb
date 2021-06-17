import {Component, Input} from '@angular/core';
import {BaseLayer, BaseLayerService} from '../base-layer.service';

@Component({
  selector: 'app-base-layer-list',
  templateUrl: './base-layer-list.component.html',
  styleUrls: ['./base-layer-list.component.scss']
})
export class BaseLayerListComponent {
  @Input() radioButtons: boolean;
  list: BaseLayer[];
  selected: BaseLayer;

  constructor(private _bslSrv: BaseLayerService) {
    _bslSrv.baseLayers$.subscribe( layers => {
      if (layers.length > 0) {
        this.list = layers;
      }
    });
    _bslSrv.current$.subscribe(current => {
      this.selected = current;
    });
  }

  select(element: BaseLayer): void {
    this._bslSrv.current = element;
  }

  addBaseLayer(): void {
    this._bslSrv.add();
  }
}
