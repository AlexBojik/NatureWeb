import {Component, OnInit} from '@angular/core';
import {LayersService} from '../layers.service';
import {Layer, LAYER_UNADDED_ID} from '../models/layer';

@Component({
  selector: 'app-layers',
  templateUrl: './layer-main.component.html',
  styleUrls: ['./layer-main.component.scss']
})
export class LayerMainComponent implements OnInit {
  selected: Layer;
  isAddGroupEnabled = true;

  constructor(private _layerSrv: LayersService) {
    this._layerSrv.selected$.subscribe(layer => {
      this.selected = layer;
    });

    this._layerSrv.layers$.subscribe(tree => {

    });
  }

  ngOnInit(): void {
  }

  addGroup(): void {
    const group = new Layer();
    group.name = 'Новая группа';
    group.isGroup = true;
    group.id = LAYER_UNADDED_ID;
    group.layers = [];
    group.icon = '';
    // this._layerSrv.
    this._layerSrv.addGroup(group);
    this._layerSrv.updateTree();
    this._layerSrv.selected = group;
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
