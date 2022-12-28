import { Dictionary, Value, DictionariesService } from './../dictionaries.service';
import { CoordsHelper, PointLongLat } from './coords.helper';

export class XLSRowData {
  fields: any = {}
}


export class XLSHelper {
  static consts = {
    nameLabel: 'Наименование',
    cadastreNumberLabel: 'Кадастровый номер'
  }

  static parseXLSDataToRowData(headers: string[], rows: string[]): XLSRowData[] {
    let result: XLSRowData[] = []

    rows.forEach(row => {
      let record = new XLSRowData()

      let currentHeader = undefined
      for (let i = 0; i < row.length; i++) {
        if (row[i] !== undefined) {
          let cellValue = String(row[i])
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
    }
      result.push(record)
    });
    return result
  }

  static async objectsDataForXLSRows(rows: XLSRowData[], dbFields: any[], dictSrv: DictionariesService): Promise<any[]> {
    let result = []

    for (const row of rows) {
      const nameValue = row.fields[this.consts.nameLabel]?.[0]?.trim() || row.fields[this.consts.cadastreNumberLabel]?.[0]?.trim()
      const latValue = row.fields['СШ']
      const lonValue = row.fields['ВД']

      await XLSHelper.makeFieldsData(dbFields, row, dictSrv).then( fieldsValue => {
        result.push({coordinates: [], fields: fieldsValue, name: nameValue, description: ""})
      })
      // await Promise.resolve(XLSHelper.objectsForXLSRow(row, dbFields, dictSrv).then (objectsRow => {
      //   result = result.concat(...objectsRow)
      // }))
    }

    return result
  }

  static async objectsForXLSRows(rows: XLSRowData[], dbFields: any[], dictSrv: DictionariesService): Promise<any[]> {
    let result = []
    let multirowObject = undefined

    for (const row of rows) {
      const nameValue = row.fields[this.consts.nameLabel]?.[0]?.trim() || row.fields[this.consts.cadastreNumberLabel]?.[0]?.trim()
      const latValue = row.fields['СШ']
      const lonValue = row.fields['ВД']

      const hasLonLatColumns = (latValue != undefined && latValue.length >=3 && lonValue != undefined && lonValue.length >= 3 )
      const hasNameColumn = (nameValue && nameValue.length > 0)
      const isSimpleRowObject = hasNameColumn && !hasLonLatColumns

      if (isSimpleRowObject) {
        await Promise.resolve(XLSHelper.objectsForXLSRow(row, dbFields, dictSrv).then (objectsRow => {
          result = result.concat(...objectsRow)
        }))
      } else {
        if (hasNameColumn) {
          if (multirowObject != undefined) {
              result.push (multirowObject)
          }

          await XLSHelper.makeFieldsData(dbFields, row, dictSrv).then( fieldsValue => {
            const descriptionValue = row.fields['Представление']?.[0]?.trim() ?? ''
            multirowObject = {coordinates: [], fields: fieldsValue, name: nameValue, description: descriptionValue};
          })
        }

        if (hasLonLatColumns) {
          let lat = parseFloat(latValue[0]) + (latValue[1]/ 60) + (latValue[2]/ 3600)
          let lon = parseFloat(lonValue[0]) + (lonValue[1]/ 60) + (lonValue[2]/ 3600)
          multirowObject.coordinates.push([lon, lat])
        }
      }
    }

    if (multirowObject != undefined) {
      result.push (multirowObject)
    }

    return result
  }

  static async objectsForXLSRow(row: XLSRowData, dbFields: any[], dictSrv: DictionariesService): Promise<any[]> {

    const nameValue = row.fields['Наименование']?.[0]?.trim()
    const descriptionValue = row.fields['Представление']?.[0]?.trim() ?? ''
    const coordValue = row.fields['Координаты']?.[0]
    const coordDecValue = row.fields['Координаты (десятичные)']
    const pointsValue = row.fields['Точки']?.[0]

    if (!(nameValue && nameValue.length > 0)) {
      return []
    }

    return XLSHelper.makeFieldsData(dbFields, row, dictSrv).then( fieldsValue => {
      let result = []
      if (pointsValue && pointsValue.length > 0) {
        let points = CoordsHelper.parseCoordsFromString(coordValue)
        for (const point of points) {
          let obj = {coordinates: [[point.longitude, point.latitude]], fields: fieldsValue, name: nameValue + ' ' + point.text, description: ""};
          result.push(obj)
        }

      } else if (coordValue && coordValue.length > 0) {
        let obj = {coordinates: [], fields: fieldsValue, name: nameValue, description: ""};
        let coords = CoordsHelper.parseCoordsFromString(coordValue)
        if (coords && coords.length > 0) {
          coords.forEach(coordPair => {
            // Note: Mapbox GL uses longitude, latitude coordinate order (as opposed to latitude, longitude) to match GeoJSON.
            obj.coordinates.push([coordPair.longitude, coordPair.latitude])
          });
          result.push(obj)
        }
      } else if (coordDecValue && coordDecValue.length > 0) {
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
              await dictSrv.saveValue(dictValue).then(id => {
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

