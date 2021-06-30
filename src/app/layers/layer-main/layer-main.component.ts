import {Component, OnInit} from '@angular/core';
import {Layer, LayersService} from '../layers.service';

@Component({
  selector: 'app-layers',
  templateUrl: './layer-main.component.html',
  styleUrls: ['./layer-main.component.scss']
})
export class LayerMainComponent implements OnInit {
  selected: Layer;

  constructor(private _layerSrv: LayersService) {
    this._layerSrv.selected$.subscribe(layer => {
      this.selected = layer;
    });

    this._layerSrv.layers$.subscribe(tree => {

    });
  }

  ngOnInit(): void {
  }

  add(): void {
    const layer = new Layer();

    layer.group = this.selected.id;
    layer.name = 'Новый слой';
    layer.isGroup = false;
    layer.type = 'stroke';
    layer.commonName = 'Новый слой';
    layer.commonDescription = '';
    layer.url = '';
    layer.warning = false;
    layer.cluster = false;
    layer.limitation = false;
    layer.order = 0;
    layer.symbol = '';
    layer.lineWidth = 2;

    this.selected.layers.push(layer);
    this._layerSrv.updateTree();
    this._layerSrv.selected = layer;
  }
}
