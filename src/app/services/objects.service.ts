import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Feature, Geometry} from 'geojson';
import {FieldValueObject} from './fields.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {URL_FILTER, URL_UPDATE_COORDINATES} from '../../consts';
import {UsersService} from './users.service';
import {GeoJSONSource} from 'mapbox-gl';

export class GeoObject {
  id: number;
  layerId: number;
  name: string;
  type: string;
  fields: FieldValueObject[];
  geoJson: Geometry;
  description: string;

  constructor(layerId, name, type, coordinates, description = '', fields = []) {
    this.layerId = layerId;
    this.name = name;
    this.type = type;
    this.description = description;
    this.fields = fields;
    this.geoJson = this.geoJsonFrom(coordinates);
  }

  geoJsonFrom(coordinates): Geometry {
    return {
      type: this.type,
      coordinates
    } as Geometry;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ObjectsService {
  private _objects: Map<number, GeoObject> = new Map();
  private _filtered = new BehaviorSubject<GeoObject[]>([]);
  private _updateLayer = new BehaviorSubject<number>(0);
  public readonly filtered$: Observable<GeoObject[]> = this._filtered.asObservable();
  public readonly updateLayer$: Observable<number> = this._updateLayer.asObservable();

  url = environment.baseUrl;
  postUrl = this.url + 'object';
  editing: number;
  drawed: string;
  layerToUpdate: number;

  constructor(private _http: HttpClient,
              private _usrSrv: UsersService) {
  }

  // TODO: Обработка сетевых статусов и выдача ошибок

  getObjects(layerId): Promise<Feature<Geometry>[]> {
    const url = this.url + 'layers/' + layerId;
    return this._http.get(url)
      .toPromise()
      .then(objects => {
        return (objects as GeoJSON.FeatureCollection).features;
      });
  }

  deleteObject(id): Promise<any> {
    const url = this.url + 'objects/' + id;
    return this._http.delete(url).toPromise();
  }

  async postObject(object): Promise<{}> {
    const url = this.url + 'objects';
    return this._http.post(url, object)
      .toPromise()
      .then(() => {
        return {
          success: true
        };
      })
      .catch(err => {
        return {
          error: err.error
        };
      });
  }

  objectById(id: number): GeoObject {
    return this._objects[id];
  }

  post(name, layerId, uid): void {
    this._http.post(this.postUrl, {name, layer: layerId, uid})
      .toPromise()
      .then((id) => {
        console.log(id);
      });
  }

  filterObjects(type: number, str: string): void {
    if (str !== '') {
      const headers = new HttpHeaders({Token: this._usrSrv.token.value});
      this._http.post(URL_FILTER, {type, str}, {headers})
        .toPromise()
        .then(objects => {
          this._filtered.next(objects as GeoObject[]);
        });
    } else {
      this._filtered.next([]);
    }
  }

  saveDrawObject(): void {
    if (!this.editing || !this.drawed) {
      return;
    }

    this._http.put(URL_UPDATE_COORDINATES, {id: this.editing, wkt: this.drawed})
      .toPromise()
      .then(() => {
        this._updateLayer.next(this.layerToUpdate);
        this.layerToUpdate = 0;
      });
    this.editing = 0;
    this.drawed = '';
  }
}
