import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {DEFAULT, DEFAULT_BASE_DESCRIPTION} from '../../consts';

export class BaseLayer {
  id?: number;
  name: string;
  url: string;
  description: string;
  minZoom?: number;
  maxZoom?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BaseLayerService {
  private _current = new BehaviorSubject<BaseLayer>(this.defaultBaseLayers[0]);
  private _baseLayers = new BehaviorSubject<BaseLayer[]>(this.defaultBaseLayers);

  public readonly current$: Observable<BaseLayer> = this._current.asObservable();
  public readonly baseLayers$: Observable<BaseLayer[]> = this._baseLayers.asObservable();

  private _url = environment.baseUrl + 'base_layers';

  set current(value) {
    this._current.next(value);
  }

  get defaultBaseLayers(): BaseLayer[] {
    return [{id: 1, name: DEFAULT, url: environment.baseUrl, description: DEFAULT_BASE_DESCRIPTION, minZoom: 0, maxZoom: 19}];
  }

  constructor(private _http: HttpClient) {
    this.updateBaseLayers();
  }

  updateBaseLayers(): void {
   try {
      this._http.get(this._url).subscribe(layers => {
        if (layers != null) {
          this._baseLayers.next(layers as BaseLayer[]);
        }
      });
    } catch (err) {
      // TODO: обработка ошибок
    }
  }

  save(current: BaseLayer): void {
    if (current.id) {
      this._http.put(this._url,  current).toPromise().then();
    } else {
      this._http.post(this._url, current).toPromise().then(id => {
        current.id = parseInt(id as string, 0);
      });
    }
  }

  add(): void {
    const temp = this._baseLayers.getValue();
    const bl = new BaseLayer();
    bl.name = 'layer';
    bl.description = 'Новый слой';
    bl.url = '';
    temp.push(bl);
    this._baseLayers.next(temp);
  }

  delete(current: BaseLayer): void {
    this._http.delete(this._url + '/' + current.id.toString()).toPromise().then(() => {
      // TODO сделать удаление вместо обновления
      this.updateBaseLayers();
    });
  }
}
