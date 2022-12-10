import { Dictionary, Value, DictionariesService } from './../dictionaries.service';
import { CoordsHelper } from './coords.helper';

export class XLSRowData {
  fields: any = {}
  // name: string
  // coords: string
  // coordsDec: string
  // lat: string
  // lon: string
  // points: string
  // constructor (row:any[], headerIndexes: XLSHeaderIndexes) {
  //   this.name = headerIndexes.nameIndex == -1 ? null : row[headerIndexes.nameIndex]
  //   this.coords = headerIndexes.coordIndex == -1 ? null : row[headerIndexes.coordIndex]
  //   this.coordsDec = headerIndexes.coordDecIndex == -1 ? null : row[headerIndexes.coordDecIndex]
  //   this.lat = headerIndexes.latIndex == -1 ? null : row[headerIndexes.latIndex]
  //   this.lon = headerIndexes.lonIndex == -1 ? null : row[headerIndexes.lonIndex]
  //   this.points = headerIndexes.pointsIndex == -1 ? null : row[headerIndexes.pointsIndex]
  // }
}

class XLSHeaderIndexes {

  nameIndex: number
  coordIndex: number
  coordDecIndex: number
  latIndex: number
  lonIndex: number
  pointsIndex: number

  constructor(headers: string[]) {
    this.nameIndex = headers.findIndex ( h => h === 'Наименование')
    this.coordIndex = headers.findIndex ( h => h === 'Координаты')
    this.coordDecIndex = headers.findIndex ( h => h === 'Координаты (десятичные)')
    this.latIndex = headers.findIndex ( h => h === 'СШ')
    this.lonIndex = headers.findIndex ( h => h === 'ВД')
    this.pointsIndex = headers.findIndex ( h => h === 'Точки')
  }
}

class XLSColumn {
  name: string;
  length: number;
}

const ExportXLSColumns: XLSColumn[] = [
  { name: 'Наименование', length: 1 },
  { name: 'Координаты', length: 1 },
  { name: 'Координаты (десятичные)', length: 2 },
  { name: 'СШ', length: 3 },
  { name: 'ВД', length: 3 },
  { name: 'Точки', length: 1 },
]

export class XLSHelper {

  static parseXLSDataToRowData(headers: string[], rows: string[]): XLSRowData[] {
    let result: XLSRowData[] = []

    rows.forEach(row => {
      let record = new XLSRowData()

      let currentHeader = undefined
      for (let i = 0; i < row.length; i++) {
        let cellValue = row[i]
        let header = headers[i]
        if (header !== undefined) {
          currentHeader = header
        }

        if (currentHeader !== undefined) {
          if (record.fields[currentHeader] === undefined) {
            record.fields[currentHeader] = [cellValue]
          } else {
            record.fields[currentHeader].push(cellValue)
          }
        }
    }
      result.push(record)
    });
    return result
  }



  static async objectsForXLSRow(row: XLSRowData, dbFields: any[], dictSrv: DictionariesService): Promise<any[]> {

    const nameValue = row.fields['Наименование']?.[0]?.trim()
    const coordValue = row.fields['Координаты']?.[0]
    const coordDecValue = row.fields['Координаты (десятичные)']
    const latValue = row.fields['СШ']
    const lonValue = row.fields['ВД']
    const pointsValue = row.fields['Точки']?.[0]

    if (!(nameValue && nameValue.length > 0)) {
      return []
    }

    return XLSHelper.makeFieldsData(dbFields, row, dictSrv).then( fieldsValue => {
      let result = []
      if (pointsValue && pointsValue.length > 0) {

      } else if (coordValue && coordValue.length > 0) {
        let obj = {coordinates: [], fields: fieldsValue, name: nameValue};
        let coords = CoordsHelper.parseGMSFromString(coordValue)
        coords.forEach(coordPair => {
          // Note: Mapbox GL uses longitude, latitude coordinate order (as opposed to latitude, longitude) to match GeoJSON.
          obj.coordinates.push([coordPair.longitude, coordPair.latitude])
        });
        result.push(obj)
      } else if (coordDecValue && coordDecValue.length > 0) {

      } else if (latValue != undefined && latValue.length >=3 &&
          lonValue != undefined && lonValue.length >= 3 ) {

          let lat = latValue[0] + (latValue[1]/ 60) + (latValue[2]/ 3600)
          let lon = lonValue[0] + (lonValue[1]/ 60) + (lonValue[2]/ 3600)

          let obj = {coordinates: [[lon, lat]], fields: fieldsValue, name: nameValue};
          result.push(obj)
      }
      return result
    })
  }

  static async makeFieldsData(dbFields: any[], row: XLSRowData, dictSrv: DictionariesService): Promise<any[]> {
    let result = []

    for (const key in row.fields) {
      if (Object.prototype.hasOwnProperty.call(row.fields, key)) {
        const field = dbFields.find(f => f.name === key);
        if (field != undefined && field.id != undefined) {
          const value = row.fields[key]?.join('')?.trim();
          if (field.type > 0) {
            let opt = field.options.find(o => o.name === value);
            if (!opt) {
              const dictValue = new Value();
              dictValue.name = value;
              dictValue.dictId = field.type;
              await dictSrv.saveValue(value).then(id => {
                opt = {id, name: value};
                field.options.push(opt);
              });
            }
            result.push({fieldId: field.id, valueNum: opt.id});
          } else {
            result.push({fieldId: field.id, value: value})
          }
        }
      }
    }

    return Promise.resolve(result)
  }

}



    // let currentHead = headers[0];
    // let currentField = allFields.find(f => f.name === currentHead);
    // let currentValue = [];
    // let currentObj = {coordinates: [], fields: [], name};

    // for (const str of rows) {
    //   let lon = 0.0;
    //   let lat = 0.0;
    //   let k = 1.0;
    //   if (str[0] !== undefined) {
    //     if (currentObj.coordinates.length > 0) {
    //       if (currentValue.length > 0) {
    //         currentObj.fields.push({fieldId: currentField.id, value: currentValue.join(' ')});
    //         currentValue = [];
    //       }
    //       objects.push(currentObj);
    //     }
    //     currentObj = {coordinates: [], fields: [], name};
    //   }
    //   for (let i = 0; i < len; i++) {
    //     if (headers[i] !== undefined) {
    //       if (currentValue.length > 0) {
    //         currentObj.fields.push({fieldId: currentField.id, value: currentValue.join(' ')});
    //         currentValue = [];
    //       }
    //       currentHead = headers[i];
    //       currentField = allFields.find(f => f.name === currentHead);
    //     }
    //     if (currentHead === 'СШ') {
    //       lat += (str[i] / k);
    //       if (k === 3600.0) {
    //         k = 1.0;
    //       } else {
    //         k *= 60.0;
    //       }
    //     } else if (currentHead === 'ВД') {
    //       lon += str[i] / k;
    //       if (k === 3600.0) {
    //         k = 1.0;
    //       } else {
    //         k *= 60.0;
    //       }
    //     }
    //     if (!str[i]) {
    //       continue;
    //     }

    //     if (currentHead === 'Наименование') {
    //       currentObj.name = str[i]?.trim();
    //     } else if (currentHead === 'Координаты') {
    //       let coords = CoordsHelper.parseGMSFromString(str[i])

    //       coords.forEach(coordPair => {
    //         // Note: Mapbox GL uses longitude, latitude coordinate order (as opposed to latitude, longitude) to match GeoJSON.
    //         currentObj.coordinates.push([coordPair.longitude, coordPair.latitude])
    //       });

    //     } else if (currentHead === 'Координаты (десятичные)') {
    //       lat = parseFloat(str[i]);
    //       lon = parseFloat(str[++i]);
    //     } else {
    //       if (!!currentField) {
    //         if (!str[i]) {
    //           continue;
    //         }
    //         if (currentField.type > 0) {
    //           let opt = currentField.options.find(o => o.name === str[i]);
    //           if (!opt) {
    //             const value = new Value();
    //             value.name = str[i];
    //             value.dictId = currentField.type;
    //             await this._dictSrv.saveValue(value).then(id => {
    //               opt = {id, name: str[i]};
    //               currentField.options.push(opt);
    //             });
    //           }
    //           currentObj.fields.push({fieldId: currentField.id, valueNum: opt.id});
    //         } else {
    //           currentValue.push(str[i]);
    //         }
    //       }
    //     }
    //   }
    //   if (currentValue.length > 0) {
    //     currentObj.fields.push({fieldId: currentField.id, value: currentValue.join(' ')});
    //     currentValue = [];
    //   }
    //   if (lon > 0 && lat > 0 || currentObj.coordinates.length === 0) {
    //     currentObj.coordinates.push([lon, lat]);
    //   }
    // }
    // objects.push(currentObj);



    // function parseXLSrow(row: any, headers: any): object[] {
    //   // for (const str of rows) {
    //   //   let lon = 0.0;
    //   //   let lat = 0.0;
    //   //   let k = 1.0;
    //   //   if (str[0] !== undefined) {
    //   //     if (currentObj.coordinates.length > 0) {
    //   //       if (currentValue.length > 0) {
    //   //         currentObj.fields.push({fieldId: currentField.id, value: currentValue.join(' ')});
    //   //         currentValue = [];
    //   //       }
    //   //       objects.push(currentObj);
    //   //     }
    //   //     currentObj = {coordinates: [], fields: [], name};
    //   //   }

    //   let nameIndex = headers.find
    //   for (let i = 0; i < headers.len; i++) {

    //   }
    //   let object = {}
    //     for (let i = 0; i < len; i++) {
    //       if (headers[i] !== undefined) {
    //         if (currentValue.length > 0) {
    //           currentObj.fields.push({fieldId: currentField.id, value: currentValue.join(' ')});
    //           currentValue = [];
    //         }
    //         currentHead = headers[i];
    //         currentField = allFields.find(f => f.name === currentHead);
    //       }
    //       if (currentHead === 'СШ') {
    //         lat += (str[i] / k);
    //         if (k === 3600.0) {
    //           k = 1.0;
    //         } else {
    //           k *= 60.0;
    //         }
    //       } else if (currentHead === 'ВД') {
    //         lon += str[i] / k;
    //         if (k === 3600.0) {
    //           k = 1.0;
    //         } else {
    //           k *= 60.0;
    //         }
    //       }
    //       if (!str[i]) {
    //         continue;
    //       }

    //       if (currentHead === 'Наименование') {
    //         currentObj.name = str[i]?.trim();
    //       } else if (currentHead === 'Координаты') {
    //         let coords = CoordsHelper.parseGMSFromString(str[i])

    //         coords.forEach(coordPair => {
    //           // Note: Mapbox GL uses longitude, latitude coordinate order (as opposed to latitude, longitude) to match GeoJSON.
    //           currentObj.coordinates.push([coordPair.longitude, coordPair.latitude])
    //         });

    //       } else if (currentHead === 'Координаты (десятичные)') {
    //         lat = parseFloat(str[i]);
    //         lon = parseFloat(str[++i]);
    //       } else {
    //         if (!!currentField) {
    //           if (!str[i]) {
    //             continue;
    //           }
    //           if (currentField.type > 0) {
    //             let opt = currentField.options.find(o => o.name === str[i]);
    //             if (!opt) {
    //               const value = new Value();
    //               value.name = str[i];
    //               value.dictId = currentField.type;
    //               await this._dictSrv.saveValue(value).then(id => {
    //                 opt = {id, name: str[i]};
    //                 currentField.options.push(opt);
    //               });
    //             }
    //             currentObj.fields.push({fieldId: currentField.id, valueNum: opt.id});
    //           } else {
    //             currentValue.push(str[i]);
    //           }
    //         }
    //       }
    //     }
    //     if (currentValue.length > 0) {
    //       currentObj.fields.push({fieldId: currentField.id, value: currentValue.join(' ')});
    //       currentValue = [];
    //     }
    //     if (lon > 0 && lat > 0 || currentObj.coordinates.length === 0) {
    //       currentObj.coordinates.push([lon, lat]);
    //     }
    //   }
    //   objects.push(currentObj);

    //   return []
    // }
