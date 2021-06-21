import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {GeoObject, ObjectsService} from '../services/objects.service';
import {Field, FieldsService} from '../services/fields.service';
import {Color} from '@angular-material-components/color-picker';
import {URL_LAYER_LIST} from '../../consts';
import {UsersService} from '../services/users.service';

export class Layer {
  group?: number;
  id: number;
  name: string;
  type?: string;
  url?: string;
  color?: string;
  commonName?: string;
  commonDescription?: string;
  symbol?: string;
  icon?: string;
  layers?: Layer[];
  isGroup: boolean;
  cluster: boolean;
  lineWidth: number;
  lineColor: string;
  col: Color;
}


export class LayerOld {
  id: number;
  name: string;
  level: number;
  type: string;
  params: string;
  icon: string;
  visible: boolean;
  children: Layer[];
  objects: GeoObject[];
  color: string;
  commonName: string;
  commonDescription: string;
  fields: Field[];
  col: Color;
  symbol: string;
}

@Injectable({
  providedIn: 'root'
})
export class LayersService {
  private _layersMap: Map<string, Layer> = new Map();
  private _layers = new BehaviorSubject<Layer[]>([]);

  private _selected = new BehaviorSubject<Layer>(null);
  private _removed = new BehaviorSubject<Layer[]>([]);
  private _added = new BehaviorSubject<Layer>(null);


  public readonly layers$: Observable<Layer[]> = this._layers.asObservable();

  set selected(value) {
    this._selected.next(value);
    // TODO: Чето с полями
    // this._fieldSrv.updateFields(value.id).then(fields => {
      // value.fields = fields;
      // this._selected.next(value);
    // });
  }

  get selected(): Layer {
    return this._selected.getValue();
  }

  set removed(list) {
    this._removed.next(list);
  }

  set added(layer: Layer) {
    if (!layer.isGroup) {
      this._added.next(layer);
    }
      // this._objSrv.getObjects(layer.id)
      //   .then(objects => {
      //       layer.objects = objects;
      //       this._added.next(layer);
      //     }
      //   );
    // }
  }

  public readonly selected$: Observable<Layer> = this._selected.asObservable();
  public readonly removed$: Observable<Layer[]> = this._removed.asObservable();
  public readonly added$: Observable<Layer> = this._added.asObservable();

  constructor(private _http: HttpClient,
              private _objSrv: ObjectsService,
              private _fieldSrv: FieldsService,
              private _usrSrv: UsersService) {
  }

  updateLayers(): void {
    const headers = new HttpHeaders({Token: this._usrSrv.token.value});

    this._http
      .get<Layer[]>(URL_LAYER_LIST, {headers})
      .subscribe(gl => {
        if (gl != null) {
          const layers = gl;
          layers.forEach(l => {
            l.layers.forEach(cl => {
              this._layersMap['layer' + cl.id] = cl;
            });
          });
          this._layers.next(layers);
        }
      });
  }

  getLayerById(id): Layer {
    return this._layersMap[id];
  }

  postLayer(layer): Promise<any> {
    return this._http.post(URL_LAYER_LIST, layer).toPromise();
  }
}
