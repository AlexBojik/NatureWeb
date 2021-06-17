import {Component, OnInit} from '@angular/core';
import {BaseLayer, BaseLayerService} from '../../base-layers/base-layer.service';
import {DEFAULT} from '../../../consts';

@Component({
  selector: 'app-side-layers',
  templateUrl: './layer-side.component.html',
  styleUrls: ['./layer-side.component.scss']
})
export class LayerSideComponent {
  selectedBasemap = DEFAULT;
  baseMaps: BaseLayer[];

  constructor(private _bslSrv: BaseLayerService) {
    this.baseMaps = this._bslSrv.defaultBaseLayers;
    _bslSrv.baseLayers$.subscribe(layers => {
      if (layers.length > 0) {
        this.baseMaps = layers;
      }
    });
  }

  changeBaseMap(select?: string): void {
    if (select) {
      this.selectedBasemap = select;
    }
    this._bslSrv.current = this.selectedBasemap;
  }
}
