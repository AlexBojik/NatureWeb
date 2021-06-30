import {Injectable} from '@angular/core';
import * as proj4x from 'proj4';
import {GeoObject, ObjectsService} from './objects.service';
import {LayersService} from '../layers/layers.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {ExcelService} from './excel.service';
import {Field, FieldsService} from './fields.service';
import {DictionariesService, Value} from './dictionaries.service';
import {HttpClient} from '@angular/common/http';
import * as GeoJSON from 'GeoJSON';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private _ready = new BehaviorSubject<boolean>(true);
  private _file = new BehaviorSubject<any>(null);

  public readonly file$: Observable<any> = this._file.asObservable();
  public readonly ready$: Observable<boolean> = this._ready.asObservable();

  private _parseString = require('xml2js').parseString;
  map = {
    AreaTotalSize: 'Общая площадь, га',
    NatureStatusName: 'Статус ООПТ',
    Id: 'Идентификатор',
    CategoryName: 'Категория',
    TypeName: 'Тип сооружения',
    MunicipalityName: 'Район',
    Locality: 'Местоположение',
    ClassName: 'Класс',
    PurposeName: 'Назначение',
    SafetyLevelName: 'Уровень безопасности',
    LegalStatusName: 'Правовой статус',
    InventoryDate: 'Дата инвентаризации',
    InventoryConclusionName: 'Выводы',
    InventoryDecisionName: 'Решение',
  };

  set file(file) {
    this._file.next(file);
  }

  filesToLoad = 0;
  filesLoaded = 0;

  // "МСК-26 от СК-95 зона 1", 8, 1001, 7, 41.75, 0, 1, 1300000, -4512890.197
  // "МСК-26 от СК-95 зона 1", 8, 1001, 7, 41.7486343, 0, 1, 1300000, -4512881.097
  // "МСК-26 от СК-95 зона 1", 8, 1001, 7, 41.748575, 0, 1, 1300000, -4512883.357
  // 00.004626810607
  firstZone = 'PROJCS["Zone1",' +
    'GEOGCS["Pulkovo 1942",' +
    'DATUM["Pulkovo_1942",' +
    'SPHEROID["Krassovsky - 1940/1948",6378245,298.2999999999985,' +
    'AUTHORITY["EPSG","7024"]],' +
    'AUTHORITY["EPSG","6284"]],' +
    'PRIMEM["Greenwich",0],' +
    'UNIT["degree",0.0174532925199433],' +
    'AUTHORITY["EPSG","4284"]],' +
    'PROJECTION["Transverse_Mercator"],' +
    'PARAMETER["latitude_of_origin",0],' +
    'PARAMETER["central_meridian",41.748575],' +
    'PARAMETER["scale_factor",1],' +
    'PARAMETER["false_easting",1300000],' +
    'PARAMETER["false_northing",-4512883.357],' +
    'UNIT["METER",1]]';
  test = '+proj=tmerc +ellps=krass +towgs84=24,-123,-94,0.02,-0.25,-0.13,1.1 +units=m +lon_0=41.749949 +lat_0=0 +k_0=1 +x_0=1300000 +y_0=-4512896.297';
  // test = '+proj=tmerc +ellps=krass +towgs84=24,-123,-94,0.02,-0.25,-0.13,1.1 +units=m +lon_0=41.75 +lat_0=0 +k_0=1 +x_0=1300000 +y_0=-4512890.197';
  // test = '+proj=tmerc +ellps=krass +towgs84=23.92,-141.27,-80.9,0,0.35,0.82,-0.12 +units=m +lon_0=41.75 +lat_0=0 +k_0=1 +x_0=1300000 +y_0=-4512890.197';
  // test = '+proj=tmerc +ellps=krass +towgs84=23.57,-140.95,-79.8,0,-0.35,-0.79,-0.22 +units=m +lon_0=40.98333333333 +lat_0=0 +k_0=1 +x_0=1300000 +y_0=-4511057.63';
  secondZone = '+proj=tmerc +ellps=krass +towgs84=24,-123,-94,0.02,-0.25,-0.13,1.1 +units=m +lon_0=44.749949 +lat_0=0 +k_0=1 +x_0=2300000 +y_0=-4512896.297';
  test1 = 'PROJCS["Zone2",' +
    'GEOGCS["Pulkovo 1942",' +
    'DATUM["Pulkovo_1942",' +
    'SPHEROID["Krassovsky - 1940/1948",6378245,298.2999999999985,' +
    'AUTHORITY["EPSG","7024"]],' +
    'AUTHORITY["EPSG","6284"]],' +
    'PRIMEM["Greenwich",0],' +
    'UNIT["degree",0.0174532925199433],' +
    'AUTHORITY["EPSG","4284"]],' +
    'PROJECTION["Transverse_Mercator"],' +
    'PARAMETER["latitude_of_origin",0],' +
    'PARAMETER["central_meridian",44.748575],' +
    'PARAMETER["scale_factor",1],' +
    'PARAMETER["false_easting",2300000],' +
    'PARAMETER["false_northing",-4512883.357],' +
    'UNIT["METER",1]]';
  defaultZone = 'WGS84';
  proj4 = (proj4x as any).default;

  constructor(private _objectsSrv: ObjectsService,
              private _layersSrv: LayersService,
              private _excelSrv: ExcelService,
              private _fldSrv: FieldsService,
              private _dictSrv: DictionariesService,
              private _http: HttpClient) {
  }

  findField(name): Field {
    // TODO fields
    return null;
    // return this._layersSrv.selected.fields.find(f => f.name === name);
  }

  uploadXLS(file): void {
    const name = file.webkitRelativePath ? file.webkitRelativePath : file.name;

    const reader: FileReader = new FileReader();
    reader.onload = async (e: any) => {
     this.readXLS(e.target.result, name).then(objects => {
      const promises = [];

      objects.forEach(obj => {
        let type = 'Point';
        let coordinates = obj.coordinates[0];

        if (obj.coordinates.length === 2) {
          const o1 = new GeoObject(this._layersSrv.selected.id, obj.name, type, coordinates, '', obj.fields);
          promises.push(this._objectsSrv.postObject(o1));
          coordinates = obj.coordinates[1];
        } else if (obj.coordinates.length !== 1) {
          type = 'Polygon';
          const [x1, y1] = obj.coordinates[0];
          const [x2, y2] = obj.coordinates.slice(-1)[0];
          if (x1 !== x2 || y1 !== y2) {
            obj.coordinates.push([x1, y1]);
          }
          coordinates = [obj.coordinates];
        }

        const o = new GeoObject(this._layersSrv.selected.id, obj.name, type, coordinates, '', obj.fields);
        promises.push(this._objectsSrv.postObject(o));
      });
      this._resolvePromises(promises, name);
     });
    };
    reader.readAsBinaryString(file);
  }

  async readXLS(binStr, name): Promise<any[]> {
    const data = this._excelSrv.importFromFile(binStr) as any[];

    const headers = data.slice(0, 1)[0];
    const len = headers.length;

    const objects = [];

    let currentHead = headers[0];
    let currentField = this.findField(currentHead);
    let currentValue = [];
    let currentObj = {coordinates: [], fields: [], name};

    for (const str of data.slice(1, data.length)) {
      let lon = 0.0;
      let lat = 0.0;
      let k = 1.0;
      if (str[0] !== undefined) {
        if (currentObj.coordinates.length > 0) {
          if (currentValue.length > 0) {
            currentObj.fields.push({fieldId: currentField.id, value: currentValue.join(' ')});
            currentValue = [];
          }
          objects.push(currentObj);
        }
        currentObj = {coordinates: [], fields: [], name};
      }
      for (let i = 0; i < len; i++) {
        if (headers[i] !== undefined) {
          if (currentValue.length > 0) {
            currentObj.fields.push({fieldId: currentField.id, value: currentValue.join(' ')});
            currentValue = [];
          }
          currentHead = headers[i];
          currentField = this.findField(currentHead);
        }
        if (currentHead === 'СШ') {
          lat += (str[i] / k);
          if (k === 3600.0) {
            k = 1.0;
          } else {
            k *= 60.0;
          }
        } else if (currentHead === 'ВД') {
          lon += str[i] / k;
          if (k === 3600.0) {
            k = 1.0;
          } else {
            k *= 60.0;
          }
        }
        if (!str[i]) {
          continue;
        }

        if (currentHead === 'Наименование') {
          currentObj.name = str[i];
        } else if (currentHead === 'Координаты') {
          const re = /..°.{1,2}΄.{1,7}"/g;
          let x = 0;
          let y = 0;
          let match;
          do {
            match = re.exec(str[i]);
            if (match) {
              const [g, ms] = match[0].split('°');
              const [m, s] = ms.split('΄');
              if (x === 0) {
                x = parseInt(g, 0) + parseInt(m, 0) / 60 + parseFloat(s.replace('"', '')) / 3600;
              } else {
                y = parseInt(g, 0) + parseInt(m, 0) / 60 + parseFloat(s.replace('"', '')) / 3600;
                if (x > y) {
                  currentObj.coordinates.push([y, x]);
                } else {
                  currentObj.coordinates.push([x, y]);
                }

                x = 0;
                y = 0;
              }
            }
          } while (match);
        } else if (currentHead === 'Координаты (десятичные)') {
          lat = parseFloat(str[i]);
          lon = parseFloat(str[++i]);
        } else {
          if (!!currentField) {
            if (!str[i]) {
              continue;
            }
            if (currentField.type > 0) {
              let opt = currentField.options.find(o => o.name === str[i]);
              if (!opt) {
                const value = new Value();
                value.name = str[i];
                value.dictId = currentField.type;
                await this._dictSrv.postValue(value)
                  .then((res) => {
                    opt = {id: res, name: str[i]};
                    currentField.options.push(opt);
                  });
              }
              currentObj.fields.push({fieldId: currentField.id, valueNum: opt.id});
            } else {
              currentValue.push(str[i]);
            }
          }
        }
      }
      if (currentValue.length > 0) {
        currentObj.fields.push({fieldId: currentField.id, value: currentValue.join(' ')});
        currentValue = [];
      }
      currentObj.coordinates.push([lon, lat]);
    }
    objects.push(currentObj);

    return Promise.resolve(objects);
  }

  uploadMIF(file): void {
    const layerId = this._layersSrv.selected.id;
    const name = file.name;
    const fileReader = new FileReader();
    fileReader.onload = async (e: any) => {
      const text = e.target.result;
      const promises = [];

      let currentRegion = [];
      const lines = text.split(/[\r\n]+/);
      const regionLine = lines.find(l => l.search('Region') === 0);
      const regions = parseInt(regionLine.replace('Region', '').trim(), 0);
      let index = lines.indexOf(regionLine);
      for (let i = 0; i < regions; i++) {
        currentRegion = [];
        const points = parseInt(lines[index + 1].trim(), 0);

        for (let j = 0; j < points; j++) {
          const line = lines[index + j + 2];
          let zone = this.test;
          if (line[0] === '2') {
            zone = this.secondZone;
          }
          const [x, y] = line.split(' ');
          currentRegion.push(this.proj4(zone, this.defaultZone, [parseFloat(x), parseFloat(y)]));
        }
        const g = new GeoObject(layerId, file.name, 'Polygon', [currentRegion]);
        promises.push(this._objectsSrv.postObject(g));

        index += points + 1;
      }
      // TODO: добавить отображение ошибок
      this._resolvePromises(promises, name);
    };
    fileReader.readAsText(file);
  }

  uploadKML(file): void {
    const name = file.webkitRelativePath ? file.webkitRelativePath : file.name;
    const fileReader = new FileReader();
    fileReader.onload = async (e: any) => {
      const text = e.target.result;
      const parseString = require('xml2js').parseString;
      parseString(text, (err, result) => {
        const doc = result.kml.Document;
        const promises = [];
        this.recursiveKmlParse(doc, promises);
        this._resolvePromises(promises, name);
      });

    };
    fileReader.readAsText(file);
  }

  recursiveKmlParse(doc, promises): void {
    const layerId = this._layersSrv.selected.id;
    for (const part of doc) {
      if (part.isArray) {
        this.recursiveKmlParse(part, promises);
      } else {
        if (part.hasOwnProperty('Folder')) {
          this.recursiveKmlParse(part.Folder, promises);
        } else {
          if (part.hasOwnProperty('Placemark')) {
            for (const place of part.Placemark) {
              if (place.hasOwnProperty('Polygon')) {
                const coordinates = [];
                place.Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates[0].trim().split(' ').forEach( c => {
                  const mas = c.split(',');
                  coordinates.push([parseFloat(mas[0]), parseFloat(mas[1])]);
                });
                const g = new GeoObject(layerId, place.name[0], 'Polygon', [coordinates], place.description[0]);
                promises.push(this._objectsSrv.postObject(g));
              }
              if (place.hasOwnProperty('Point')) {
                const c = place.Point[0].coordinates[0].trim().split(',');
                const g = new GeoObject(layerId, place.name[0], 'Point', [parseFloat(c[0]), parseFloat(c[1])], place.description[0]);
                promises.push(this._objectsSrv.postObject(g));
              }
            }
          }
        }
      }
    }
  }

  private _resolvePromises(promises: any[], name: any): void {
    Promise.all(promises).then(res => {
      let success = true;
      let error = null;
      for (const r of res) {
        if (!r.success) {
          success = false;
          error = r.error;
          break;
        }
      }
      this.file = {name, success, error, loading: false};
      this.filesLoaded += 1;
      this._ready.next(this.filesLoaded === this.filesToLoad);
    });
  }

  uploadWfs(): void {
    const url = this._layersSrv.selected.url;
    this._http.get(url).toPromise().then(async wfs => {
      const promises = [];
      for (const f of (wfs as GeoJSON.FeatureCollection).features) {
        const fields = [];

        for (const key of Object.keys(f.properties)) {
          if (this.map[key]) {
            const currentField = this.findField(this.map[key]);
            if (currentField && f.properties[key]) {
              if (currentField.type > 0) {
                let opt = currentField.options.find(op => op.name === f.properties[key]);
                if (!opt) {
                  const value = new Value();
                  value.name = f.properties[key];
                  value.dictId = currentField.type;
                  await this._dictSrv.postValue(value)
                    .then((res) => {
                      opt = {id: res, name: f.properties[key]};
                      currentField.options.push(opt);
                    });
                }
                fields.push({fieldId: currentField.id, valueNum: opt.id});
              } else {
                fields.push({fieldId: currentField.id, value: f.properties[key].toString()});
              }
            }
          }
        }

        const o = new GeoObject(this._layersSrv.selected.id, f.properties.Name, f.geometry.type, [], '', fields);
        o.geoJson = f.geometry;
        promises.push(this._objectsSrv.postObject(o));
      }
      this._resolvePromises(promises, '');
    });
  }

  setFieldValue(fields, name, value): void {
    const field = this.findField(name);
    const current = fields.find(f => f.fieldId === field.id);
    if (current) {
      current.value = value.toString();
    } else {
      fields.push({fieldId: field.id, value: value.toString()});
    }
  }

  readKPT(xml, objects): void {
    const cadastreField = this.findField('Кадастровый номер');

    const map: Map<string, {
      fields: [];
      name: string;
    }> = new Map();
    objects.forEach(obj => {
      const cadastreValue = obj.fields.find(f => f.fieldId === cadastreField.id);
      map.set(cadastreValue.value, obj);
    });

    const fileReader = new FileReader();
    fileReader.onload = (e: any) => {
      const promises = [];
      const text = e.target.result;
      this._parseString(text, (err, result) => {
        if (result.KPT) {
          this.readKPT10(map, result, promises);
        } else if (result.extract_cadastral_plan_territory) {
          this.readKPT11(map, result, promises);
        }
      });
      this._resolvePromises(promises, name);
    };
    fileReader.readAsText(xml);
  }

  uploadKPT(xls, xmls): void {
    const reader: FileReader = new FileReader();
    reader.onload = async (e: any) => {
      this.filesToLoad = xmls.length;
      this.filesLoaded = 0;
      this.readXLS(e.target.result, name).then(objects => {
        Object.values(xmls).forEach(xml => {
          this.readKPT(xml, objects);
        });
      });
    };
    reader.readAsBinaryString(xls);
  }

  private readKPT10(map, result, promises): void {
    const layerId = this._layersSrv.selected.id;

    result.KPT.CadastralBlocks[0].CadastralBlock[0].Parcels[0].Parcel.forEach(p => {
      const currentObj = map.get(p.$.CadastralNumber);

      if (currentObj) {
        this.setFieldValue(currentObj.fields, 'Общая площадь, кв.м.', p.Area[0].Area[0]);

        p.Contours[0].Contour.forEach(counter => {

          let zone = this.secondZone;
          if (counter.EntitySpatial[0].$.EntSys === 'ID1') {
            zone = this.test;
          }
          currentObj.name = p.$.CadastralNumber + '/' + counter.$.NumberRecord;
          const coordinates = [];
          let area = 0;
          let xPrev = 0;
          let yPrev = 0;
          counter.EntitySpatial[0]['ns3:SpatialElement'][0]['ns3:SpelementUnit'].forEach(point => {
            const y = parseFloat(point['ns3:Ordinate'][0].$.Y);
            const x = parseFloat(point['ns3:Ordinate'][0].$.X);
            if (xPrev !== 0) {
              area += xPrev * y - x * yPrev;
            }
            xPrev = x;
            yPrev = y;
            coordinates.push(this.proj4(zone, this.defaultZone, [y, x]));
          });
          this.setFieldValue(currentObj.fields, 'Площадь контура, кв.м.', Math.round(area / 2 * 100) / 100);
          const g = new GeoObject(layerId,  currentObj.name, 'Polygon', [coordinates], '', currentObj.fields);
          promises.push(this._objectsSrv.postObject(g));
        });
      }
    });
  }

  private readKPT11(map, result, promises): void {
    const layerId = this._layersSrv.selected.id;

    result.extract_cadastral_plan_territory.cadastral_blocks[0].cadastral_block[0].record_data[0].base_data[0].land_records[0].land_record
      .forEach(p => {
        const cadNumber = p.object[0].common_data[0].cad_number[0];
        const currentObj = map.get(cadNumber);
        if (currentObj) {
          this.setFieldValue(currentObj.fields, 'Общая площадь, кв.м.', p.params[0].area[0].value[0]);
          p.contours_location[0].contours[0].contour.forEach(counter => {
            currentObj.name = cadNumber + '/' + counter.number_pp;

            let zone = this.secondZone;
            if (counter.entity_spatial[0].sk_id[0] === 'МСК-26 от СК-95, зона 1') {
              zone = this.test;
            }

            const coordinates = [];
            let area = 0;
            let xPrev = 0;
            let yPrev = 0;
            counter.entity_spatial[0].spatials_elements[0].spatial_element[0].ordinates[0].ordinate.forEach(point => {
              const y = parseFloat(point.y[0]);
              const x = parseFloat(point.x[0]);
              if (xPrev !== 0) {
                area += xPrev * y - x * yPrev;
              }
              xPrev = x;
              yPrev = y;
              coordinates.push(this.proj4(zone, this.defaultZone, [y, x]));
            });
            this.setFieldValue(currentObj.fields, 'Площадь контура, кв.м.', Math.round(area / 2 * 100) / 100);

            const g = new GeoObject(layerId,  currentObj.name, 'Polygon', [coordinates], '', currentObj.fields);
            promises.push(this._objectsSrv.postObject(g));
          });
        }
    });
  }
}
