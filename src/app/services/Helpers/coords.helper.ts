// import * as proj4 from 'proj4';
import * as proj4x from 'proj4';
import { Tools } from './tools.helper';


export class PointLongLat {
  public latitude: number = 0.0
  public longitude: number = 0.0
  public text = ''
}

const msk26zones =[
  //z1
  "+proj=tmerc +lat_0=0 +lon_0=40.98333333333 +k=1 +x_0=1300000 +y_0=-4511057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs",
  //z2
  "+proj=tmerc +lat_0=0 +lon_0=43.98333333333 +k=1 +x_0=2300000 +y_0=-4511057.63 +ellps=krass +towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22 +units=m +no_defs",
]

// Note: Mapbox GL uses longitude, latitude coordinate order (as opposed to latitude, longitude) to match GeoJSON.

export class CoordsHelper {

  static tryParsePairAnyFormat(value) {

    let result = this.tryParseGMSPair(value)
    if (result) {
      return result
    }

    result = this.tryParseDegradPair(value)
    if (result) {
      return result
    }

    return result;
  }


  static tryParseDegradPair(value: any): { lon: number; lat: number } {
    const regMasks = [
      /(?<lat>[0-9]{2}\.[0-9]{1,15})(.*)СШ(.*)(?<lon>[0-9]{2}\.[0-9]{1,15})/g,
      /(?<lon>[0-9]{2}\.[0-9]{1,15})(.*)ВД(.*)(?<lat>[0-9]{2}\.[0-9]{1,15})/g,
      /(?<lat>[0-9]{2}\.[0-9]{1,15})(.*),(.*)(?<lon>[0-9]{2}\.[0-9]{1,15})/g,
    ]
    const textString = value.trim()

    for (const mask of regMasks) {
      const match = mask.exec(textString);
      if (match) {
        let lon = parseFloat(match.groups?.lon)
        let lat = parseFloat(match.groups?.lat)
        return {lon, lat}
      }
    }
    return null

  }

  /// 44°49΄59.0" СШ 42°52΄0.0" ВД,
  /// 44°49΄59.0" ВД 42°52΄0.0" СШ,
  /// 44°49΄59.0", 42°52΄0.0",
  static tryParseGMSPair(value: string): { lon: number; lat: number } {
    const regMasks = [
      /(?<lat>..°.{1,2}[΄'].{1,10}")(.*)СШ(.*)(?<lon>..°.{1,2}[΄'].{1,10}")/g,
      /(?<lat>..°.{1,2}[΄'].{1,10}")(.*)(?<lon>..°.{1,2}[΄'].{1,10}")(.*)ВД(.*)/g,
      /(?<lon>..°.{1,2}[΄'].{1,10}")(.*)ВД(.*)(?<lat>..°.{1,2}[΄'].{1,10}")/g,
      /(?<lon>..°.{1,2}[΄'].{1,10}")(.*)(?<lat>..°.{1,2}[΄'].{1,10}")(.*)СШ(.*)/g,
      /(?<lat>..°.{1,2}[΄'].{1,10}")(.*),(.*)(?<lon>..°.{1,2}[΄'].{1,10}")/g,
    ]
    const textString = value.trim()

    for (const mask of regMasks) {
      const match = mask.exec(textString);
      if (match) {
        let lon = CoordsHelper.gmsToDeg(match.groups?.lon)
        let lat = CoordsHelper.gmsToDeg(match.groups?.lat)
        return {lon, lat}
      }
    }
    return null
  }

  static gmsToDeg(textGMS: any): number {
    const [g, ms] = textGMS.split('°');
    const [m, s] = ms.split('΄');
    return parseInt(g, 0) + parseInt(m, 0) / 60 + parseFloat(s.replace('"', '')) / 3600;
  }

  static parseCoordsFromString(text: string): PointLongLat[] {
    let result = [];
    result = this.parseMSKFromString(text)
    if (result?.length > 0) {
      return result
    }
    result = this.parseGMSFromString(text)
    if (result?.length > 0) {
      return result
    }

    return []
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
        let lon = CoordsHelper.gmsToDeg(match.groups?.lon)
        let lat = CoordsHelper.gmsToDeg(match.groups?.lat)
        let text = (match.groups?.text ?? '').trim()
        result.push({text, lon, lat})
      }
    } while (match);
    return result
  }


  // МСК-26 зона 1 т. 1 429532.317м.2314965.55м.
  static parseMSKFromString(textString: string): PointLongLat[] {
    ///
    let proj4 = (proj4x as any).default;
    const regMaskZone = /МСК-26 зона (?<zone>[1-2]{1,2})/g
    const matchMSK = regMaskZone.exec(textString);
    if (matchMSK) {
      const zone = parseInt(matchMSK.groups?.zone ?? "1")
      const coordsText = textString.substring(matchMSK.index)
      const regMask = / *[тТ]\. (?<point>[0-9]{1,2}) *(?<x>[0-9]{1,7}\.[0-9]{1,5})м\. *(?<y>[0-9]{1,7}\.[0-9]{1,5})м\./g
      let allMatches = Tools.matchAllRegExp(regMask, coordsText)
      let coords = allMatches.map( m => m.groups)

      let result: PointLongLat[] = []
      for (const coord of coords) {
        let wgscoord = proj4(msk26zones[zone-1],'WGS84',[parseFloat(coord.y), parseFloat(coord.x)]);
        result.push({text: 'т ' + coord.point, longitude: wgscoord[0], latitude: wgscoord[1]})
      }
      return result
    }
    return []
  }

  static parseGMSFromString(textString: string): PointLongLat[] {
    let result = [];
    const re = /..°.{1,2}΄.{1,10}"/g;
    let latSH = 0;
    let lonVD = 0;
    let match;

    do {
      match = re.exec(textString);
      if (match) {
        const [g, ms] = match[0].split('°');
        const [m, s] = ms.split('΄');
        if (latSH === 0) {
          latSH = parseInt(g, 0) + parseInt(m, 0) / 60 + parseFloat(s.replace('"', '')) / 3600;
        } else {
          lonVD = parseInt(g, 0) + parseInt(m, 0) / 60 + parseFloat(s.replace('"', '')) / 3600;
          // if (x > y) {
          //   let point = new Coord()
          //   point.x = y
          //   point.y = x
          //   result.push(point);
          // } else {
            let point = new PointLongLat()
            point.latitude = latSH
            point.longitude = lonVD
            result.push(point);
          // }

          latSH = 0;
          lonVD = 0;
        }
      }
    } while (match);
    return result
  }
}
