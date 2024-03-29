import { XLSHelper } from './Helpers/xls.helper';
import { CoordsHelper } from './Helpers/coords.helper';
import {Injectable} from '@angular/core';
import * as proj4x from 'proj4';
import {GeoObject, ObjectsService} from './objects.service';
import {LayersService} from '../layers/layers.service';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {ExcelService} from './excel.service';
import {Field, FieldsService} from './fields.service';
import {DictionariesService, Value} from './dictionaries.service';
import {HttpClient} from '@angular/common/http';
import * as GeoJSON from 'GeoJSON';
import {Feature} from 'GeoJSON';
import {Geometry} from 'GeoJSON';
import {GeoJsonProperties} from 'GeoJSON';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private _status = new BehaviorSubject<string>('');

  private _ready = new BehaviorSubject<boolean>(true);
  private _file = new BehaviorSubject<any>(null);

  public readonly file$: Observable<any> = this._file.asObservable();
  public readonly status$: Observable<string> = this._status.asObservable();
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

  uploadXLS(file): void {
    const name = file.webkitRelativePath ? file.webkitRelativePath : file.name;

    const reader: FileReader = new FileReader();
    reader.onload = async (e: any) => {
     this.readXLS(e.target.result, name).then(objects => {
       const promises = [];
       objects.forEach(obj => {
         let type = 'Point';

         if (obj.coordinates.length !== 0) {
           let coordinates = obj.coordinates[0];

           if (obj.coordinates.length === 2) {
             const o1 = new GeoObject(this._layersSrv.selected.id, obj.name, type, coordinates, obj.description , obj.fields);
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

           const o = new GeoObject(this._layersSrv.selected.id, obj.name, type, coordinates, obj.description, obj.fields);
           promises.push(this._objectsSrv.postObject(o));
         } else {
           console.log('coordinates empty');
           console.log(obj);
         }
       });
       this._resolvePromises(promises, name);
     });
    };
    reader.readAsBinaryString(file);
  }

  async readXLSwoCoords(binStr, name): Promise<any[]> {
    let result = [];

    let allFields = [];
    await this._fldSrv.getAllFields().then(flds => {
      allFields = flds;
    });

    const data = this._excelSrv.importFromFile(binStr) as any[];
    const headers = data.slice(0, 1)[0] as [];
    const rows = data.slice(1, data.length)
    const rowData = XLSHelper.parseXLSDataToRowData(headers, rows)

    await Promise.resolve(XLSHelper.objectsDataForXLSRows(rowData, allFields, this._dictSrv).then (objectsRows => {
      result = objectsRows
    }))

    return Promise.resolve(result);
  }

  async readXLS(binStr, name): Promise<any[]> {
    let result = [];

    let allFields = [];
    await this._fldSrv.getAllFields().then(flds => {
      allFields = flds;
    });

    const data = this._excelSrv.importFromFile(binStr) as any[];
    const headers = data.slice(0, 1)[0] as [];
    const rows = data.slice(1, data.length)
    const rowData = XLSHelper.parseXLSDataToRowData(headers, rows)

    await Promise.resolve(XLSHelper.objectsForXLSRows(rowData, allFields, this._dictSrv).then (objectsRows => {
      result = objectsRows
    }))

    return Promise.resolve(result);
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

  uploadWfs(): Promise<void> {
    return this._fldSrv.getAllFields().then(fields => {
      return this._getFromUrlWFS().then(async features => {
        let i = 1;
        for (const f of features) {
          await this._loadFeature(f, fields);
          this._status.next('Загрузка объектов ' + i.toString() + '/' + features.length.toString());
          i += 1;
        }
      });
    });
  }

  private _getFromUrlWFS(): Promise<Feature<Geometry>[]> {
    return this._http.get(this._layersSrv.selected.url).toPromise().then(wfs => {
      return Promise.resolve((wfs as GeoJSON.FeatureCollection).features);
    });
  }

  private async _loadFeature(f: Feature<Geometry>, fields: Field[]): Promise<{}> {
    if (!f.geometry) {
      return
    }
    const geoObject = new GeoObject(this._layersSrv.selected.id, f.properties.Name, f.geometry.type, [], '', []);
    geoObject.geoJson = f.geometry;
    await this._fillFields(f, fields, geoObject);
    return this._objectsSrv.postObject(geoObject);
  }

  private async _fillFields(f: Feature<Geometry>, fields: Field[], geoObject: GeoObject): Promise<void> {
    for (const key of Object.keys(f.properties)) {
      const currentField = fields.find(ff => ff.name === this.map[key]);
      if (currentField && f.properties[key]) {
        if (currentField.type > 0) {
          let opt = currentField.options.find(op => op.name === f.properties[key]);
          if (!opt) {
            const value = new Value();
            value.name = f.properties[key];
            value.dictId = currentField.type;

            await this._dictSrv.saveValue(value).then(id => {
              opt = {id, name: f.properties[key]};
              currentField.options.push(opt);
            });
          }
          geoObject.fields.push({fieldId: currentField.id, valueNum: opt.id});
        } else {
          geoObject.fields.push({fieldId: currentField.id, value: f.properties[key].toString()});
        }
      }
    }
  }

  setFieldValue(fields, name, value, allFields: Field[]): void {
    const field = allFields.find(f => f.name === name);
    const current = fields.find(f => f.fieldId === field.id);
    if (current) {
      current.value = value.toString();
    } else {
      fields.push({fieldId: field.id, value: value.toString()});
    }
  }

  uploadKPT(xls, xmls): void {
    const reader: FileReader = new FileReader();
    reader.onload = async (e: any) => {
      this.filesToLoad = xmls.length;
      this.filesLoaded = 0;
      this.readXLSwoCoords(e.target.result, name).then(objects => {
        return this._fldSrv.getAllFields().then(fields => {
          Object.values(xmls).forEach(xml => {
            this.readKPT(xml, objects, fields);
          });
        });
      });
    };
    reader.readAsBinaryString(xls);
  }

  readKPT(xml, objects, fields): void {
    // this._fldSrv.getAllFields().then(fields => {
      const cadastreField = fields.find(f => f.name === 'Кадастровый номер');

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
            this.readKPT10(map, result, promises, fields);
          } else if (result.extract_cadastral_plan_territory) {
            this.readKPT11(map, result, promises, fields);
          } else if (result.extract_about_property_land) {
            this.readEAPL(map, result, promises, fields);
          }
        });
        this._resolvePromises(promises, name);
      };
      fileReader.readAsText(xml);
    // });
  }



  private readKPT10(map, result, promises, allFields): void {
    const layerId = this._layersSrv.selected.id;

    result.KPT.CadastralBlocks[0].CadastralBlock[0].Parcels[0].Parcel.forEach(p => {
      const currentObj = map.get(p.$.CadastralNumber);

      if (currentObj) {
        this.setFieldValue(currentObj.fields, 'Общая площадь, кв.м.', p.Area[0].Area[0], allFields);

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
          this.setFieldValue(currentObj.fields, 'Площадь контура, кв.м.', Math.round(area / 2 * 100) / 100, allFields);
          const g = new GeoObject(layerId,  currentObj.name, 'Polygon', [coordinates], '', currentObj.fields);
          promises.push(this._objectsSrv.postObject(g));
        });
      }
    });
  }

  private readKPT11(map, result, promises, allFields): void {
    const layerId = this._layersSrv.selected.id;

    result.extract_cadastral_plan_territory.cadastral_blocks[0].cadastral_block[0].record_data[0].base_data[0].land_records[0].land_record
      .forEach(p => {
        const cadNumber = p.object[0].common_data[0].cad_number[0];
        const currentObj = map.get(cadNumber);
        if (currentObj) {
          this.setFieldValue(currentObj.fields, 'Общая площадь, кв.м.', p.params[0].area[0].value[0], allFields);
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
            this.setFieldValue(currentObj.fields, 'Площадь контура, кв.м.', Math.round(area / 2 * 100) / 100, allFields);

            const g = new GeoObject(layerId,  currentObj.name, 'Polygon', [coordinates], '', currentObj.fields);
            promises.push(this._objectsSrv.postObject(g));
          });
        }
    });
  }

  private readEAPL(map, result, promises, allFields): void {
    const layerId = this._layersSrv.selected.id;

    result.extract_about_property_land.land_record
      .forEach(p => {
        const cadNumber = p.object[0].common_data[0].cad_number[0];
        const currentObj = map.get(cadNumber);
        if (currentObj) {
          this.setFieldValue(currentObj.fields, 'Общая площадь, кв.м.', p.params[0].area[0].value[0], allFields);
          p.contours_location[0].contours[0].contour.forEach(counter => {
            if (counter.number_pp) {
              currentObj.name = cadNumber + '/' + counter.number_pp;
            } else {
              currentObj.name = cadNumber;
            }

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
            this.setFieldValue(currentObj.fields, 'Площадь контура, кв.м.', Math.round(area / 2 * 100) / 100, allFields);

            const g = new GeoObject(layerId,  currentObj.name, 'Polygon', [coordinates], '', currentObj.fields);
            promises.push(this._objectsSrv.postObject(g));
          });
        }
      });
  }
}

