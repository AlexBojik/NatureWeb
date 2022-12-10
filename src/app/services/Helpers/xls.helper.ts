import { Dictionary, Value, DictionariesService } from './../dictionaries.service';
import { CoordsHelper, PointLongLat } from './coords.helper';

export class XLSRowData {
  fields: any = {}
}


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


  static objectsPointsParse(textString: any): any[] {
    let result = [];
    const regMask = /(?<text>.*) *(?<lat>..°.{1,2}΄.{1,10}")(.*)(?<lon>..°.{1,2}΄.{1,10}")/g
    let latSH = 0;
    let lonVD = 0;
    let match;

    do {
      match = regMask.exec(textString);
      if (match) {
        let lon = XLSHelper.gmsToDeg(match.groups?.lon)
        let lat = XLSHelper.gmsToDeg(match.groups?.lat)
        let text = (match.groups?.text ?? '').trim()
        result.push({text, lon, lat})
        console.log(match.groups)
      }
    } while (match);
    return result
  }

  static gmsToDeg(textGMS: any): number {
    const [g, ms] = textGMS.split('°');
    const [m, s] = ms.split('΄');
    return parseInt(g, 0) + parseInt(m, 0) / 60 + parseFloat(s.replace('"', '')) / 3600;
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
        let points = XLSHelper.objectsPointsParse(pointsValue)
        for (const point of points) {
          let obj = {coordinates: [[point.lon, point.lat]], fields: fieldsValue, name: nameValue + ' ' + point.text};
          result.push(obj)
        }

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

