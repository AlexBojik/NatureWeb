import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { loadModules } from 'esri-loader';

export enum LAYER_TYPE {
  group = 'group',
  image = 'image',
  feature = 'feature',
}

export class LayerFlatNode {
  id: number;
  name: string;
  level: number;
  type: string;
  params: string;
  icon: string;
  visible: boolean;
  children: LayerFlatNode[];
}

@Injectable({providedIn: 'root'})
export class DataService {
  private _http: HttpClient;

  layers = new BehaviorSubject([]);
  dataChange = new BehaviorSubject<LayerFlatNode[]>([]);

  get data(): LayerFlatNode[] { return this.dataChange.value; }

  points = new BehaviorSubject([]);
  polygons = new BehaviorSubject([]);

  constructor(private http: HttpClient) {
    this._http = http;
  }

  updateLayers(): void {
    const url = '/water';
    try {
      this._http.get(url).subscribe(layers => {
        if (layers != null) {
          this.dataChange.next(layers as LayerFlatNode[]);
          // loadModules([
          //   'esri/tree-layer-main/MapImageLayer',
          //   'esri/tree-layer-main/GroupLayer',
          //   'esri/tree-layer-main/FeatureLayer'
          // ]).then(esri => {
          //   // this.layer-main.next(this._recursiveCreateLayers(layer-main, esri));
          // });
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  insertItem(parent: LayerFlatNode, name: string): void {
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push({name, children: []} as LayerFlatNode);
    } else {
      this.data.push({name, children: []} as LayerFlatNode);
    }
    this.dataChange.next(this.data);
  }

  updateItem(): void {
    this.dataChange.next(this.data);
  }

  saveLayers(node: LayerFlatNode): void {
    const url = '/water/';
    this._http.post(url, node, {headers: {Accept: 'application/json; charset=UTF-8'}}).subscribe(() => {
      this.updateLayers();
    });
  }

  loadLayers(mas: any[]): void {
    const url = '/water/load';
    this._http.post(url, mas, {headers: {Accept: 'application/json; charset=UTF-8'}}).subscribe(() => {
      this.updateLayers();
    });
  }

}
